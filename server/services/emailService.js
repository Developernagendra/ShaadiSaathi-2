// ─── Configuration ───────────────────────────────────────────────────

// Parse EMAIL_FROM safely — extract plain email from "Name <email>" format if present
const parseEmailFrom = (raw) => {
  if (!raw) return 'support@shaadisaathi.com';
  const match = raw.match(/<([^>]+)>/);
  if (match) return match[1].trim();
  // If it contains a space but no angle brackets, it might be "Name email" — take the email part
  if (raw.includes(' ') && raw.includes('@')) {
    const parts = raw.split(/\s+/);
    const emailPart = parts.find(p => p.includes('@'));
    if (emailPart) return emailPart.trim();
  }
  return raw.trim();
};

const EMAIL_FROM = parseEmailFrom(process.env.EMAIL_FROM);
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'ShaadiSaathi';

// ─── Centralized Client URL Resolution ──────────────────────────────
// CRITICAL: Default fallback is PRODUCTION domain, not localhost.
// Localhost fallback caused all email links to break when CLIENT_URL was
// missing from Render's environment configuration.
const getClientUrl = () => {
  const raw = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://shaadi-saathi.vercel.app';
  return raw.replace(/\/+$/, ''); // Strip trailing slashes
};

const CLIENT_URL = getClientUrl();

const COLORS = {
  primary: '#C2185B',
  secondary: '#D4AF37',
  background: '#FAFAFA',
  text: '#333333',
  lightText: '#666666',
};
// ─── Nodemailer Import ─────────────────────────────────────────────────
// REMOVED: SMTP is fully deprecated.
// ─── Brevo API Key Format Validation ─────────────────────────────────
// v3 API keys start with "xkeysib-", SMTP relay keys start with "xsmtpsib-"
// The HTTP API (/v3/smtp/email) ONLY accepts v3 API keys.
const validateBrevoKeyFormat = (key) => {
  if (!key) return { valid: false, reason: 'BREVO_API_KEY is not set' };
  if (key.startsWith('xsmtpsib-')) {
    return {
      valid: false,
      reason: 'BREVO_API_KEY is an SMTP relay key (starts with "xsmtpsib-"). The HTTP API requires a v3 API key (starts with "xkeysib-").',
    };
  }
  if (!key.startsWith('xkeysib-')) {
    return {
      valid: false,
      reason: `BREVO_API_KEY has unexpected format (starts with "${key.substring(0, 10)}..."). Expected a v3 API key starting with "xkeysib-".`,
    };
  }
  return { valid: true };
};

// ─── Verify Email Connection ──────────────────────────────────────────
const verifyBrevo = async () => {
  const key = process.env.BREVO_API_KEY;
  const { valid, reason } = validateBrevoKeyFormat(key);
  if (!valid) {
    console.error(`[EMAIL] ❌ Brevo API configuration error: ${reason}`);
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'accept': 'application/json',
        'api-key': key,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMessage = errData?.message || `HTTP ${response.status}`;

      // ── IP Whitelist Rejection Detection ──────────────────────────────
      // Brevo returns a specific message about "unrecognised IP address" when the
      // caller's IP is not whitelisted in Brevo's security settings.
      if (errMessage.toLowerCase().includes('unrecognised ip') || errMessage.toLowerCase().includes('unrecognized ip')) {
        // Extract the IP address: Brevo phrases it as "...unrecognised IP address <ip>..."
        const ipMatch = errMessage.match(/ip address\s+([\da-f:\.]+)/i);
        const detectedIp = ipMatch ? ipMatch[1] : 'your server IP (check startup logs)';
        console.error(`[EMAIL] ❌ Brevo API key rejected: ${errMessage}`);
        console.error('[EMAIL] 🔴 ACTION REQUIRED: Your IP is not whitelisted in Brevo.');
        console.error(`[EMAIL]    → Detected IP : ${detectedIp}`);
        console.error(`[EMAIL]    → Fix Step 1  : Open https://app.brevo.com/security/authorised_ips`);
        console.error(`[EMAIL]    → Fix Step 2  : Click "Add an IP address"`);
        console.error(`[EMAIL]    → Fix Step 3  : Enter: ${detectedIp}`);
        console.error('[EMAIL]    → Fix Step 4  : Save and restart your server');
        console.warn('[EMAIL] ⚠️  Brevo verification failed — emails may not be delivered. Check BREVO_API_KEY in .env');
        return false;
      }

      console.error(`[EMAIL] ❌ Brevo API key rejected: ${errMessage}`);
      return false;
    }

    const data = await response.json();
    console.log(`[EMAIL] ✅ Brevo API connected — Account: ${data.email || 'OK'}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL] ⚠️  Brevo connectivity check failed: ${err.message}`);
    return true; // Don't block startup on transient network failures
  }
};

// ─── Retry Helper ────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Send Email ──────────────────────────────────────────────────────
const sendEmail = async ({ to, email, subject, html, text, fromName, from }) => {
  const key = process.env.BREVO_API_KEY;
  const { valid, reason } = validateBrevoKeyFormat(key);
  if (!valid) {
    const msg = `EMAIL_CONFIG_ERROR: ${reason}`;
    console.error(`[EMAIL] ❌ ${msg}`);
    throw new Error(msg);
  }

  const senderEmail = parseEmailFrom(from || EMAIL_FROM);
  const recipientEmail = to || email;

  // Guard: validate recipient is a non-empty string
  if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
    const msg = `Invalid or missing email recipient: "${recipientEmail}"`;
    console.error(`[EMAIL] ❌ RECIPIENT_ERROR: ${msg}`);
    throw new Error(msg);
  }

  // Guard: validate subject exists
  if (!subject) {
    console.warn('[EMAIL] ⚠️  Email subject is empty — this may cause delivery issues.');
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [3000, 6000, 12000]; // 3s, 6s, 12s exponential backoff
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[EMAIL] 📨 Sending email via Brevo API (attempt ${attempt}/${MAX_RETRIES}):`);
      console.log(`[EMAIL]    → Recipient: ${recipientEmail}`);
      console.log(`[EMAIL]    → Subject  : ${subject}`);
      console.log(`[EMAIL]    → Sender   : ${fromName || EMAIL_FROM_NAME} <${senderEmail}>`);

      const mailOptions = {
        sender: { email: senderEmail, name: fromName || EMAIL_FROM_NAME },
        to: [{ email: recipientEmail }],
        subject: subject,
        htmlContent: html,
        textContent: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': key,
          'content-type': 'application/json',
        },
        body: JSON.stringify(mailOptions),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData ? errorData.message : `HTTP Error ${response.status}`;

        if (errorMsg.toLowerCase().includes('key not found') || response.status === 401) {
          const keyPrefix = key.substring(0, 10);
          throw new Error(`${errorMsg} — Key starts with "${keyPrefix}...". Ensure BREVO_API_KEY is a v3 API key (xkeysib-*).`);
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();
      const messageId = data.messageId;

      console.log(`[EMAIL] ✅ EMAIL DELIVERED via Brevo API`);
      console.log(`[EMAIL]    → MessageId: ${messageId}`);

      return { success: true, messageId: messageId, provider: 'brevo' };
    } catch (err) {
      lastError = err;
      console.error(`[EMAIL] ❌ Attempt ${attempt}/${MAX_RETRIES} failed:`);
      console.error(`[EMAIL]    → Error     : ${err.message}`);
      if (err.code) console.error(`[EMAIL]    → Code      : ${err.code}`);

      const errStr = err.message.toLowerCase() + ' ' + (err.code || '').toLowerCase();

      // Do not retry authentication failures
      if (errStr.includes('key not found') || errStr.includes('unauthorized')) {
        console.error('[EMAIL] 🛑 Authentication error — aborting retries');
        break;
      }

      const isNetworkError = ['enetunreach', 'etimedout', 'econnrefused', 'econnreset', 'ehostunreach'].some(code => errStr.includes(code));

      if (isNetworkError) {
        console.error(`[EMAIL] ⚠️  Transient network failure detected: ${err.code || 'Network Issue'}`);
      }

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt - 1] || 3000;
        console.log(`[EMAIL] ⏳ Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }

  console.error(`[EMAIL] 💀 All ${MAX_RETRIES} attempts failed for email to ${recipientEmail}`);
  throw lastError;
};


// ─── Base HTML Template ──────────────────────────────────────────────
const getBaseTemplate = (title, content, preheader = '') => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7fa; -webkit-font-smoothing: antialiased; word-wrap: break-word;">
        ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>` : ''}
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background-color: ${COLORS.primary}; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">ShaadiSaathi 💍</h1>
            <p style="color: #ffffff; margin: 5px 0 0 0; opacity: 0.9; font-style: italic;">Your Wedding, Perfected</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background-color: ${COLORS.background}; padding: 20px; text-align: center; border-top: 1px solid #EAEAEA;">
            <p style="color: ${COLORS.lightText}; font-size: 14px; margin: 0;">Need help? Contact our <a href="${CLIENT_URL}/contact" style="color: ${COLORS.primary}; text-decoration: none;">Support Team</a></p>
            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} ShaadiSaathi. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// ─── Email Templates ─────────────────────────────────────────────────
const emailTemplates = {
  // ── Verification Email ──────────────────────────────────────────────
  verification: (name, url, lang = 'en') => {
    const isHi = lang === 'hi';
    const isBho = lang === 'bho';
    const isMai = lang === 'mai';

    let subject = 'Verify your email - ShaadiSaathi';
    let title = 'Verify Your Email Address';
    let greeting = `Hi ${name},`;
    let msg1 = 'Welcome to ShaadiSaathi! Please verify your email address to get started.';
    let btnText = 'Verify Email Address';
    let msg2 = "If the button doesn't work, copy and paste this link into your browser:";
    let msg3 = 'This link will expire in 24 hours.';
    let preheader = 'Please verify your email to complete your ShaadiSaathi registration';

    if (isHi) {
      subject = 'अपना ईमेल वेरीफाई करें - ShaadiSaathi';
      title = 'अपना ईमेल पता वेरीफाई करें';
      greeting = `नमस्ते ${name},`;
      msg1 = 'ShaadiSaathi में आपका स्वागत है! शुरू करने के लिए कृपया अपना ईमेल पता वेरीफाई करें।';
      btnText = 'ईमेल वेरीफाई करें';
      msg2 = 'यदि बटन काम नहीं करता है, तो इस लिंक को कॉपी करें और अपने ब्राउज़र में पेस्ट करें:';
      msg3 = 'यह लिंक 24 घंटे में समाप्त हो जाएगा।';
      preheader = 'अपने ShaadiSaathi पंजीकरण को पूरा करने के लिए कृपया अपना ईमेल वेरीफाई करें';
    } else if (isBho) {
      subject = 'आपन ईमेल वेरीफाई करीं - ShaadiSaathi';
      title = 'आपन ईमेल पता वेरीफाई करीं';
      greeting = `रउवा के गोर लागत बानी ${name},`;
      msg1 = 'ShaadiSaathi में राउर स्वागत बा! शुरू करे खातिर निहोरा बा कि आपन ईमेल पता वेरीफाई करीं।';
      btnText = 'ईमेल वेरीफाई करीं';
      msg2 = 'जदी बटन काम नईखे करत, त ए लिंक के कॉपी करीं आउर आपन ब्राउज़र में पेस्ट करीं:';
      msg3 = 'ए लिंक के समय 24 घंटा में खतम हो जाई।';
      preheader = 'आपन ShaadiSaathi पंजीकरण के पूरा करे खातिर कृपया आपन ईमेल वेरीफाई करीं';
    } else if (isMai) {
      subject = 'अपन ईमेल वेरीफाई करू - ShaadiSaathi';
      title = 'अपन ईमेल पता वेरीफाई करू';
      greeting = `प्रणाम ${name},`;
      msg1 = 'ShaadiSaathi मे अहाँक स्वागत अछि! शुरू करबाक लेल कृपा कय अपन ईमेल पता वेरीफाई करू।';
      btnText = 'ईमेल वेरीफाई करू';
      msg2 = 'जँ ई बटन काज नहि करैत अछि, तँ ई लिंक केँ कॉपी कय अपन ब्राउज़र मे पेस्ट करू:';
      msg3 = 'ई लिंक 24 घंटा मे समाप्त भ जायत।';
      preheader = 'अपन ShaadiSaathi पंजीकरण पूरा करबाक लेल कृपा कय अपन ईमेल वेरीफाई करू';
    }

    const html = getBaseTemplate(
      title,
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">${greeting}</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">${msg1}</p>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${url}" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">${btnText}</a>
       </div>
       <p style="color: ${COLORS.lightText}; font-size: 14px;">${msg2}</p>
       <p style="color: ${COLORS.primary}; font-size: 13px; word-break: break-all;">${url}</p>
       <p style="color: ${COLORS.lightText}; font-size: 14px; margin-bottom: 0;">${msg3}</p>`,
      preheader
    );
    return { subject, html };
  },

  // ── Welcome Email (for newly registered users) ─────────────────────
  welcomeUser: (name) => {
    const html = getBaseTemplate(
      'Welcome to ShaadiSaathi!',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Welcome, ${name}! 🎉</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Thank you for joining ShaadiSaathi — India's premier wedding marketplace. We're thrilled to be part of your wedding journey!</p>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Here's what you can do next:</p>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0;">✨ <strong>Browse Vendors</strong> — Find photographers, caterers, decorators & more</p>
         <p style="margin: 8px 0;">📅 <strong>Book Services</strong> — Secure your wedding vendors with instant booking</p>
         <p style="margin: 8px 0;">💬 <strong>Chat with Vendors</strong> — Discuss requirements directly</p>
         <p style="margin: 8px 0;">🔧 <strong>Wedding Tools</strong> — Budget planner, timeline, guest manager & more</p>
       </div>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${CLIENT_URL}/services" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Explore Vendors</a>
       </div>`,
      'Welcome to ShaadiSaathi! Start planning your dream wedding today.'
    );
    return { subject: 'Welcome to ShaadiSaathi! 🎉', html };
  },

  // ── Vendor Welcome Email ───────────────────────────────────────────
  vendorWelcome: (name, businessName) => {
    const html = getBaseTemplate(
      'Welcome to ShaadiSaathi Partner Program!',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Welcome, ${name}! 🤝</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Thank you for registering <strong>${businessName || 'your business'}</strong> on ShaadiSaathi's vendor marketplace!</p>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Your vendor profile is being reviewed by our team. Here's what to expect:</p>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0;">1️⃣ <strong>Profile Review</strong> — Our team will review your profile (usually within 24 hours)</p>
         <p style="margin: 8px 0;">2️⃣ <strong>Approval Email</strong> — You'll receive an email once approved</p>
         <p style="margin: 8px 0;">3️⃣ <strong>Go Live</strong> — Start receiving bookings from couples across India</p>
       </div>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">In the meantime, you can complete your profile to speed up the approval process.</p>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${CLIENT_URL}/vendor/dashboard" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Complete Your Profile</a>
       </div>`,
      'Welcome to ShaadiSaathi Partner Program! Complete your profile to get started.'
    );
    return { subject: 'Welcome to ShaadiSaathi Partner Program! 🤝', html };
  },

  // ── Admin: New Vendor Registration Alert ───────────────────────────
  adminVendorRegistration: (adminName, vendorDetails) => {
    const html = getBaseTemplate(
      'New Vendor Registration',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${adminName},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">A new vendor has registered on the platform and requires approval.</p>
       
       <h3 style="color: ${COLORS.text}; margin-top: 30px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #333333; padding-bottom: 5px; display: inline-block;">Vendor Details</h3>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0;"><strong>Name:</strong> ${vendorDetails.name || 'N/A'}</p>
         <p style="margin: 8px 0;"><strong>Email:</strong> ${vendorDetails.email || 'N/A'}</p>
         <p style="margin: 8px 0;"><strong>Phone:</strong> ${vendorDetails.phone || 'N/A'}</p>
         <p style="margin: 8px 0;"><strong>Business:</strong> ${vendorDetails.businessName || 'Pending Setup'}</p>
         <p style="margin: 8px 0;"><strong>Type:</strong> ${vendorDetails.vendorType || 'service'}</p>
         <p style="margin: 8px 0;"><strong>Registered At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
       </div>

       <div style="text-align: center; margin: 40px 0 20px;">
         <a href="${CLIENT_URL}/admin/vendors" style="display: inline-block; background-color: ${COLORS.text}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px;">Review in Admin Panel</a>
       </div>`
    );
    return { subject: 'New Vendor Registration — Action Required - ShaadiSaathi', html };
  },

  // ── Reset Password ─────────────────────────────────────────────────
  resetPassword: (name, url) => {
    const html = getBaseTemplate(
      'Reset Your Password',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">You requested a password reset. Click the button below to choose a new password.</p>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${url}" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Reset Password</a>
       </div>
       <p style="color: ${COLORS.lightText}; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
       <p style="color: ${COLORS.primary}; font-size: 13px; word-break: break-all;">${url}</p>
       <p style="color: ${COLORS.lightText}; font-size: 14px; margin-bottom: 0;">This link will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>`
    );
    return { subject: 'Password Reset Request - ShaadiSaathi', html };
  },

  // ── Password Changed Confirmation ──────────────────────────────────
  passwordChanged: (name) => {
    const html = getBaseTemplate(
      'Password Changed Successfully',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Your password has been changed successfully.</p>
       <div style="background-color: #FFF3E0; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
         <p style="color: #E65100; margin: 0; font-size: 14px;">⚠️ If you did not make this change, please reset your password immediately or contact our support team.</p>
       </div>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${CLIENT_URL}/forgot-password" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Reset Password</a>
       </div>`
    );
    return { subject: 'Password Changed - ShaadiSaathi', html };
  },

  // ── Vendor Approval ────────────────────────────────────────────────
  vendorApproval: (name, status) => {
    const isApproved = status === 'approved';
    const html = getBaseTemplate(
      'Vendor Application Update',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Your vendor application has been <strong>${status}</strong>.</p>
       ${isApproved ?
        `<p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">You can now login and start managing your services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${CLIENT_URL}/vendor/dashboard" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
          </div>` :
        `<p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Please contact support for more details regarding this decision.</p>`
      }`
    );
    return { subject: `Vendor Application ${status === 'approved' ? 'Approved' : 'Update'}`, html };
  },

  // ── Service Approved ───────────────────────────────────────────────
  serviceApproved: (name, title, url) => {
    const html = getBaseTemplate(
      'Service Approved',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Great news! Your service <strong>${title}</strong> has been approved and is now live on the platform.</p>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${url}" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">View Service</a>
       </div>`
    );
    return { subject: 'Your Service is Live! - ShaadiSaathi', html };
  },

  // ── Booking Confirmation ───────────────────────────────────────────
  bookingConfirmation: (name, details) => {
    const html = getBaseTemplate(
      'Booking Confirmation',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Your booking has been successfully confirmed!</p>
       
       <h3 style="color: ${COLORS.text}; margin-top: 30px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid ${COLORS.primary}; padding-bottom: 5px; display: inline-block;">Booking Summary</h3>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0; word-break: break-all;"><strong>Booking ID:</strong> ${details.bookingId || 'N/A'}</p>
         <p style="margin: 8px 0;"><strong>Service:</strong> ${details.serviceName || 'Wedding Service'}</p>
         <p style="margin: 8px 0;"><strong>Vendor:</strong> ${details.vendorName || 'ShaadiSaathi Vendor'}</p>
         <p style="margin: 8px 0;"><strong>Date:</strong> ${details.eventDate || 'To Be Confirmed'}</p>
         <p style="margin: 8px 0;"><strong>Time:</strong> ${details.eventTime || 'TBD'}</p>
         <p style="margin: 8px 0;"><strong>Location:</strong> ${details.eventLocation || 'TBD'}</p>
         <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #CCCCCC;">
           <p style="margin: 0; font-size: 18px; color: ${COLORS.primary};"><strong>Total Amount:</strong> ₹${details.bookingAmount || 0}</p>
         </div>
       </div>

       <div style="text-align: center; margin: 40px 0 20px;">
         <a href="${CLIENT_URL}/user/bookings" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(194, 24, 91, 0.2);">View Booking</a>
       </div>`
    );
    return { subject: 'Booking Confirmation - ShaadiSaathi', html };
  },

  // ── Vendor Booking Alert ───────────────────────────────────────────
  vendorBookingAlert: (name, details) => {
    const html = getBaseTemplate(
      'New Booking Alert',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name || 'Vendor'},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">You have received a new booking through ShaadiSaathi!</p>
       
       <h3 style="color: ${COLORS.text}; margin-top: 30px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid ${COLORS.primary}; padding-bottom: 5px; display: inline-block;">Booking Summary</h3>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0; word-break: break-all;"><strong>Booking ID:</strong> ${details.bookingId || 'N/A'}</p>
         <p style="margin: 8px 0;"><strong>Service:</strong> ${details.serviceName || 'Wedding Service'}</p>
         <p style="margin: 8px 0;"><strong>Date:</strong> ${details.eventDate || 'To Be Confirmed'}</p>
         <p style="margin: 8px 0;"><strong>Time:</strong> ${details.eventTime || 'TBD'}</p>
         <p style="margin: 8px 0;"><strong>Location:</strong> ${details.eventLocation || 'TBD'}</p>
         <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #CCCCCC;">
           <p style="margin: 0; font-size: 18px; color: ${COLORS.primary};"><strong>Amount:</strong> ₹${details.bookingAmount || 0}</p>
         </div>
       </div>

       <h3 style="color: ${COLORS.text}; margin-top: 30px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid ${COLORS.secondary}; padding-bottom: 5px; display: inline-block;">Customer Details</h3>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0;"><strong>Name:</strong> ${details.customerName || 'Customer'}</p>
         <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${details.customerPhone || ''}" style="color: ${COLORS.text}; text-decoration: none;">${details.customerPhone || 'Not Provided'}</a></p>
         <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${details.customerEmail || ''}" style="color: ${COLORS.text}; text-decoration: none;">${details.customerEmail || 'Not Provided'}</a></p>
       </div>

       <div style="text-align: center; margin: 40px 0 20px;">
         <a href="${CLIENT_URL}/vendor/bookings" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(194, 24, 91, 0.2);">Open Vendor Dashboard</a>
       </div>`
    );
    return { subject: 'New Booking Received - ShaadiSaathi', html };
  },

  // ── Admin Booking Alert ────────────────────────────────────────────
  adminBookingAlert: (name, details) => {
    const html = getBaseTemplate(
      'Admin Booking Alert',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">A new booking has been placed on the platform.</p>
       
       <h3 style="color: ${COLORS.text}; margin-top: 30px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #333333; padding-bottom: 5px; display: inline-block;">Platform Booking Summary</h3>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0; word-break: break-all;"><strong>Booking ID:</strong> ${details.bookingId || 'N/A'}</p>
         <p style="margin: 8px 0;"><strong>Service:</strong> ${details.serviceName || 'Wedding Service'}</p>
         <p style="margin: 8px 0;"><strong>Vendor:</strong> ${details.vendorName || 'ShaadiSaathi Vendor'}</p>
         <p style="margin: 8px 0;"><strong>Date:</strong> ${details.eventDate || 'To Be Confirmed'}</p>
         <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #CCCCCC;">
           <p style="margin: 0; font-size: 18px;"><strong>Amount:</strong> ₹${details.bookingAmount || 0}</p>
         </div>
       </div>

       <h3 style="color: ${COLORS.text}; margin-top: 30px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #333333; padding-bottom: 5px; display: inline-block;">Customer Details</h3>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #EAEAEA;">
         <p style="margin: 8px 0;"><strong>Name:</strong> ${details.customerName || 'Customer'}</p>
         <p style="margin: 8px 0;"><strong>Phone:</strong> ${details.customerPhone || 'Not Provided'}</p>
         <p style="margin: 8px 0;"><strong>Email:</strong> ${details.customerEmail || 'Not Provided'}</p>
       </div>

       <div style="text-align: center; margin: 40px 0 20px;">
         <a href="${CLIENT_URL}/admin/bookings" style="display: inline-block; background-color: ${COLORS.text}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px;">View in Admin Panel</a>
       </div>`
    );
    return { subject: 'New Platform Booking - ShaadiSaathi', html };
  },

  // ── Booking Status Update ──────────────────────────────────────────
  bookingStatusUpdate: (name, details) => {
    const statusColors = {
      confirmed: '#4CAF50',
      cancelled: '#F44336',
      completed: '#2196F3',
      rejected: '#FF9800',
    };
    const statusIcons = {
      confirmed: '✅',
      cancelled: '❌',
      completed: '🎉',
      rejected: '⚠️',
    };
    const currentStatus = details.bookingStatus || details.status || 'updated';
    const color = statusColors[currentStatus] || COLORS.primary;
    const icon = statusIcons[currentStatus] || '📋';
    const statusFormatted = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);

    const html = getBaseTemplate(
      'Booking Status Update',
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
       <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Your booking status has been updated.</p>
       
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #EAEAEA; border-left: 5px solid ${color};">
         <p style="font-size: 20px; font-weight: bold; color: ${color}; margin-top: 0; margin-bottom: 15px;">${icon} ${statusFormatted}</p>
         <p style="margin: 8px 0; word-break: break-all;"><strong>Booking ID:</strong> ${details.bookingId || 'N/A'}</p>
         <p style="margin: 8px 0;"><strong>Service:</strong> ${details.serviceName || 'Wedding Service'}</p>
         <p style="margin: 8px 0;"><strong>Date:</strong> ${details.eventDate || 'To Be Confirmed'}</p>
         <p style="margin: 8px 0;"><strong>Time:</strong> ${details.eventTime || 'TBD'}</p>
         <p style="margin: 8px 0;"><strong>Vendor:</strong> ${details.vendorName || 'ShaadiSaathi Vendor'}</p>
       </div>

       <div style="text-align: center; margin: 40px 0 20px;">
         <a href="${CLIENT_URL}/user/bookings" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(194, 24, 91, 0.2);">View Booking</a>
       </div>`
    );
    return { subject: `Booking ${statusFormatted} - ShaadiSaathi`, html };
  },

  // ── Admin Notification (Generic) ───────────────────────────────────
  adminNotification: (title, details) => {
    const detailsHtml = details && typeof details === 'object'
      ? Object.entries(details).map(([key, val]) => `<p><strong>${key}:</strong> ${val}</p>`).join('')
      : `<p>${details || ''}</p>`;

    const html = getBaseTemplate(
      title,
      `<h2 style="color: ${COLORS.text}; margin-top: 0;">${title}</h2>
       <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
         ${detailsHtml}
       </div>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${CLIENT_URL}/admin" style="display: inline-block; background-color: ${COLORS.text}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Open Admin Panel</a>
       </div>`
    );
    return { subject: `${title} - ShaadiSaathi Admin`, html };
  },
};

// ─── Legacy / Newsletter helpers (migrated from utils/email.js) ──────
const getWelcomeEmailHTML = (email) => {
  const unsubscribeUrl = `${CLIENT_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  return getBaseTemplate(
    'Welcome to ShaadiSaathi!',
    `<h2 style="color: ${COLORS.text}; margin-top: 0;">Welcome to ShaadiSaathi!</h2>
     <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Thank you for subscribing to our newsletter! We are thrilled to be part of your wedding journey.</p>
     <div style="text-align: center; margin: 30px 0;">
       <a href="${CLIENT_URL}/services" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Explore Vendors</a>
     </div>
     <p style="color: #999999; font-size: 12px; text-align: center;">
        <a href="${unsubscribeUrl}" style="color: #999999; text-decoration: underline;">Unsubscribe from this list</a>
     </p>`
  );
};

const getCampaignEmailHTML = (email, subject, content, bannerUrl) => {
  const unsubscribeUrl = `${CLIENT_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  return getBaseTemplate(
    subject,
    `${bannerUrl ? `<img src="${bannerUrl}" alt="Campaign Banner" style="width: 100%; height: auto; display: block; margin-bottom: 20px; border-radius: 8px;" />` : ''}
     <h2 style="color: ${COLORS.text}; margin-top: 0;">${subject}</h2>
     <div style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">
       ${content}
     </div>
     <div style="text-align: center; margin: 30px 0;">
       <a href="${CLIENT_URL}" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold;">Visit ShaadiSaathi</a>
     </div>
     <p style="color: #999999; font-size: 12px; text-align: center;">
        <a href="${unsubscribeUrl}" style="color: #999999; text-decoration: underline;">Unsubscribe from this list</a>
     </p>`
  );
};

const getPackageUserEmailHTML = (name, packageName) => {
  return getBaseTemplate(
    'Package Inquiry Received',
    `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
     <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Thank you for inquiring about our <strong>${packageName}</strong>! We've successfully received your details.</p>
     <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Our wedding coordination team is currently reviewing your requirements and will reach out to you shortly to discuss availability, customizations, and next steps.</p>`
  );
};

const getPackageAdminEmailHTML = (inquiry, pkg) => {
  return getBaseTemplate(
    'New Package Inquiry Received',
    `<h2 style="color: ${COLORS.text}; margin-top: 0;">🚨 New Package Inquiry Received</h2>
     <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
       <p><strong>Package:</strong> ${pkg.name}</p>
       <p><strong>Name:</strong> ${inquiry.name}</p>
       <p><strong>Phone:</strong> ${inquiry.phone}</p>
       <p><strong>Email:</strong> ${inquiry.email || 'N/A'}</p>
       <p><strong>City:</strong> ${inquiry.city}</p>
       <p><strong>Wedding Date:</strong> ${new Date(inquiry.weddingDate).toLocaleDateString()}</p>
     </div>`
  );
};

const getExpertUserEmailHTML = (name, packageName) => {
  return getBaseTemplate(
    'Expert Consultation Request Received',
    `<h2 style="color: ${COLORS.text}; margin-top: 0;">Hi ${name},</h2>
     <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">Thank you for requesting an expert consultation${packageName ? ` for our <strong>${packageName.charAt(0).toUpperCase() + packageName.slice(1)} Wedding Package</strong>` : ''}.</p>
     <p style="color: ${COLORS.lightText}; font-size: 16px; line-height: 1.6;">One of our wedding experts will contact you shortly at your preferred time to discuss your dream wedding and help you plan every detail.</p>`
  );
};

const getExpertAdminEmailHTML = (consultation) => {
  return getBaseTemplate(
    'New Expert Consultation Request',
    `<h2 style="color: ${COLORS.text}; margin-top: 0;">🚨 New Expert Consultation Request</h2>
     <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
       <p><strong>Name:</strong> ${consultation.name}</p>
       <p><strong>Phone:</strong> ${consultation.phone}</p>
       <p><strong>Email:</strong> ${consultation.email || 'N/A'}</p>
       <p><strong>City:</strong> ${consultation.city || 'N/A'}</p>
       ${consultation.package ? `<p><strong>Package Context:</strong> ${consultation.package}</p>` : ''}
       ${consultation.service ? `<p><strong>Service Context:</strong> ${consultation.service}</p>` : ''}
       ${consultation.weddingDate ? `<p><strong>Wedding Date:</strong> ${new Date(consultation.weddingDate).toLocaleDateString()}</p>` : ''}
       ${consultation.preferredDate ? `<p><strong>Preferred Contact:</strong> ${new Date(consultation.preferredDate).toLocaleDateString()} at ${consultation.preferredTime || 'Any time'}</p>` : ''}
       <p><strong>Message:</strong> ${consultation.message || 'None provided'}</p>
     </div>`
  );
};

module.exports = {
  sendEmail,
  emailTemplates,
  verifyBrevo,
  getClientUrl,
  getBaseTemplate,
  getWelcomeEmailHTML,
  getCampaignEmailHTML,
  getPackageUserEmailHTML,
  getPackageAdminEmailHTML,
  getExpertUserEmailHTML,
  getExpertAdminEmailHTML,
};
