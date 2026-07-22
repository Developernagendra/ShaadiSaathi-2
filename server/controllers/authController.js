const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const { sendEmail, emailTemplates, getClientUrl } = require('../services/emailService');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ---------------- GENERATE JWT TOKEN ----------------
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// ---------------- REGISTER USER ----------------
const register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, role, vendorType } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Name, email, and password are required.', 400));
  }

  // Validate vendorType if role is vendor
  if (role === 'vendor' && !['service', 'cab'].includes(vendorType)) {
    return next(new AppError('Invalid or missing vendorType. Must be either "service" or "cab".', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone ? phone.trim() : null;

  // ── Duplicate check: email OR phone ────────────────────────────────
  const duplicateQuery = [{ email: normalizedEmail }];
  if (normalizedPhone) {
    duplicateQuery.push({ phone: normalizedPhone });
  }

  const existingUser = await User.findOne({ $or: duplicateQuery });

  if (existingUser) {
    // Case 1: Email already exists
    if (existingUser.email === normalizedEmail) {

      // Sub-case: Account exists but email not verified → resend verification
      if (!existingUser.isVerified) {
        const token = existingUser.generateEmailVerificationToken();
        await existingUser.save({ validateBeforeSave: false });

        const clientUrl = getClientUrl();
        const verificationUrl = `${clientUrl}/verify-email/${token}`;

        // Fire-and-forget: don't block the HTTP response
        const template = emailTemplates.verification(existingUser.name, verificationUrl, existingUser.preferredLanguage);
        sendEmail({ to: existingUser.email, subject: template.subject, html: template.html, text: template.text })
          .then(() => console.log(`[AUTH] ✅ Resent verification email to unverified account: ${existingUser.email}`))
          .catch((err) => {
            console.error('[AUTH] ❌ VERIFICATION_RESEND_FAILED:');
            console.error(`[AUTH]    → Email    : ${existingUser.email}`);
            console.error(`[AUTH]    → Error    : ${err.message}`);
            console.error(`[AUTH]    → Code     : ${err.code || 'UNKNOWN'}`);
          });

        return res.status(400).json({
          success: false,
          message: 'This email is already registered but not verified. We have resent the verification link to your email.',
        });
      }

      // Sub-case: Verified account already exists
      return next(new AppError('Email already registered. Please login.', 400));
    }

    // Case 2: Phone already exists (different email)
    if (normalizedPhone && existingUser.phone === normalizedPhone) {
      return next(new AppError('Phone number already registered. Please use a different number or login.', 400));
    }
  }

  // ── Create account ─────────────────────────────────────────────────
  const userRole = role === 'vendor' ? 'vendor' : 'user';

  let user;
  try {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone: normalizedPhone || undefined, // Don't save empty string (sparse index)
      role: userRole,
      isVerified: false,
      isEmailVerified: false,
    });
    console.log('[REGISTRATION] ✅ User Created successfully');
  } catch (err) {
    // Race condition: another request created the same user between our check and create
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === 'phone') {
        return next(new AppError('Phone number already registered. Please use a different number.', 400));
      }
      return next(new AppError('Email already registered. Please login.', 400));
    }
    throw err;
  }

  // Auto create vendor profile
  if (userRole === 'vendor') {
    const Vendor = require('../models/Vendor');

    const vendorProfile = await Vendor.create({
      user: user._id,
      vendorType: vendorType,
      businessName: `${name}'s Business (Pending)`,
      email: normalizedEmail,
      phone: normalizedPhone || '0000000000',
      approvalStatus: 'pending',
      profileCompletion: 0,
    });

    console.log(`[REGISTRATION] ✅ Vendor Created successfully with type: ${vendorType}`);
    console.log('VENDOR PROFILE CREATED');

    user.vendorProfile = vendorProfile._id;
  }

  // Generate email verification token
  const token = user.generateEmailVerificationToken();
  console.log('[REGISTRATION] 🔑 Verification Token Generated');

  // Auto-verify all normal users (they can use the platform immediately)
  if (userRole === 'user') {
    user.isVerified = true;
    user.isEmailVerified = true;
    console.log(`[REGISTRATION] ✅ Auto-verified normal user ${user.email}`);
  } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    user.isVerified = true;
    user.isEmailVerified = true;
    console.log(`[DEVELOPMENT] ✅ Auto-verified vendor/admin ${user.email} on registration`);
  }

  await user.save({ validateBeforeSave: false });

  const clientUrl = getClientUrl();
  const verificationUrl = `${clientUrl}/verify-email/${token}`;

  console.log('[REGISTRATION] 📨 Email Dispatch Started (Background)');

  // ── EMAIL 1: Welcome Email (always sent for all users) ─────────────
  if (userRole === 'user') {
    const welcomeTemplate = emailTemplates.welcomeUser(user.name);
    sendEmail({
      to: user.email,
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
    })
      .then(() => console.log(`[WELCOME_EMAIL] ✅ Welcome email sent to: ${user.email}`))
      .catch((err) => {
        console.error('[WELCOME_EMAIL] ❌ WELCOME_EMAIL_FAILED:');
        console.error(`[WELCOME_EMAIL]    → Email : ${user.email}`);
        console.error(`[WELCOME_EMAIL]    → Error : ${err.message}`);
      });
  }

  // ── EMAIL 2: Vendor Welcome + Verification Email ───────────────────
  if (userRole === 'vendor') {
    // Send vendor welcome email
    const vendorWelcomeTemplate = emailTemplates.vendorWelcome(user.name, `${name}'s Business`);
    sendEmail({
      to: user.email,
      subject: vendorWelcomeTemplate.subject,
      html: vendorWelcomeTemplate.html,
    })
      .then(() => console.log(`[VENDOR_WELCOME] ✅ Vendor welcome email sent to: ${user.email}`))
      .catch((err) => {
        console.error('[VENDOR_WELCOME] ❌ VENDOR_WELCOME_FAILED:');
        console.error(`[VENDOR_WELCOME]    → Email : ${user.email}`);
        console.error(`[VENDOR_WELCOME]    → Error : ${err.message}`);
      });

    // Send verification email for vendors (they need to verify)
    if (!user.isVerified) {
      const verifyTemplate = emailTemplates.verification(user.name, verificationUrl, user.preferredLanguage);
      sendEmail({
        to: user.email,
        subject: verifyTemplate.subject,
        html: verifyTemplate.html,
      })
        .then(() => {
          console.log('[VERIFY_EMAIL] ✅ Vendor verification email sent');
          console.log(`[SMTP]    → To : ${user.email}`);
        })
        .catch((err) => {
          console.error('[VERIFY_EMAIL] ❌ VENDOR_VERIFICATION_FAILED:');
          console.error(`[VERIFY_EMAIL]    → Email : ${user.email}`);
          console.error(`[VERIFY_EMAIL]    → Error : ${err.message}`);
        });
    }

    // ── EMAIL 3: Notify all admins about new vendor registration ─────
    (async () => {
      try {
        const admins = await User.find({ role: 'admin' }).lean();
        for (const admin of admins) {
          if (admin.email) {
            const adminTemplate = emailTemplates.adminVendorRegistration(
              admin.name || 'Administrator',
              {
                name: user.name,
                email: user.email,
                phone: user.phone || 'Not Provided',
                businessName: `${name}'s Business (Pending)`,
                vendorType: vendorType || 'service',
              }
            );
            await sendEmail({ to: admin.email, ...adminTemplate });
            console.log(`[ADMIN_NOTIFY] ✅ Admin notified about new vendor: ${admin.email}`);
          }
        }
      } catch (err) {
        console.error('[ADMIN_NOTIFY] ❌ ADMIN_VENDOR_NOTIFICATION_FAILED:', err.message);
      }
    })();
  }

  console.log('[REGISTER] ✅ Response Sent - Account created');

  if (user.role === 'vendor') {
    const io = req.app.get('io');
    if (io) {
      io.emit('auth-event', {
        type: 'VENDOR_REGISTER',
        role: 'vendor',
        message: 'A new vendor has registered'
      });
    }
  }

  // Generate token and log the user in immediately
  const jwtToken = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60 * 1000)),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  res.cookie('token', jwtToken, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Welcome to ShaadiSaathi!',
    token: jwtToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
});

// ---------------- LOGIN USER ----------------
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password.',
        400
      )
    );
  }

  const normalizedEmail =
    email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  if (
    !user ||
    !(await user.comparePassword(password))
  ) {
    return next(
      new AppError(
        'Invalid email or password.',
        401
      )
    );
  }

  if (!user.isActive) {
    return next(
      new AppError(
        'Your account has been deactivated. Please contact support.',
        401
      )
    );
  }

  // Normal users and vendors can login regardless of verification.
  // Only admins strictly require it in production to prevent unauthorized panel access.
  if (!user.isVerified && user.role === 'admin') {
    if (process.env.NODE_ENV === 'production') {
      return next(new AppError('Admin account must be verified before login.', 403));
    } else {
      console.log(`[LOGIN] Development mode: Admin ${user.email} logged in without prior verification. Auto-verifying account.`);
      user.isVerified = true;
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    }
  }

  console.log(`[LOGIN] ✅ User authenticated successfully: ${user.email}`);

  // Update login time
  user.lastLogin = Date.now();

  await user.save({
    validateBeforeSave: false,
  });

  const token = generateToken(
    user._id,
    user.role
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  res.cookie('token', token, cookieOptions);

  let vendorProfile = null;
  if (user.role === 'vendor') {
    const Vendor = require('../models/Vendor');
    vendorProfile = await Vendor.findOne({ user: user._id })
      .select('businessName approvalStatus isFeatured coverImage logo rating user category vendorType')
      .populate('category', 'name slug')
      .lean();
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('auth-event', {
      type: user.role === 'vendor' ? 'VENDOR_LOGIN' : 'USER_LOGIN',
      role: user.role,
      message: `${user.name} logged in successfully`
    });
  }

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Login successful.',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      phone: user.phone,
      vendorProfile: vendorProfile,
    },
  });
});

// ---------------- VERIFY EMAIL ----------------
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (
    !token ||
    token === 'undefined' ||
    token === 'null'
  ) {
    return next(
      new AppError(
        'Invalid or missing verification token.',
        400
      )
    );
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(
      new AppError(
        'Email verification token is invalid or has expired.',
        400
      )
    );
  }

  // Prevent reuse — verify and invalidate token
  user.isVerified = true;
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;

  await user.save({ validateBeforeSave: false });

  console.log(`[VERIFY_EMAIL] ✅ Email verified successfully for: ${user.email}`);

  res.status(200).json({
    status: 'success',
    message:
      'Email verified successfully! You can now login.',
  });
});

// ---------------- FORGOT PASSWORD ----------------
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const normalizedEmail =
    email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  // prevent email enumeration
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message:
        'If an account exists with this email, you will receive a password reset link.',
    });
  }

  const resetToken =
    user.generatePasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  const clientUrl = getClientUrl();
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const template =
    emailTemplates.resetPassword(
      user.name,
      resetUrl
    );

  console.log('[FORGOT_PASSWORD] 📨 Reset Email Attempt Started (Background)');

  sendEmail({
    to: user.email,
    ...template,
  }).then(() => {
    console.log(`[FORGOT_PASSWORD] ✅ Reset email sent to: ${user.email}`);
  }).catch((err) => {
    // Do NOT clear the reset token here — the user should be able to retry
    // or use the resend flow. Clearing it means the link in any delayed email
    // becomes permanently invalid.
    console.error('[FORGOT_PASSWORD] ❌ RESET_EMAIL_FAILED:');
    console.error(`[FORGOT_PASSWORD]    → Email : ${user.email}`);
    console.error(`[FORGOT_PASSWORD]    → Error : ${err.message}`);
    console.error(`[FORGOT_PASSWORD]    → Code  : ${err.code || 'UNKNOWN'}`);
    console.error('[FORGOT_PASSWORD]    → Token preserved so user can request another email');
  });

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    console.log(`[DEVELOPMENT] 🔗 Password Reset Link: ${resetUrl}`);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Password reset email sent successfully.',
  });
});

// ---------------- RESET PASSWORD ----------------
const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (
    !token ||
    token === 'undefined' ||
    token === 'null'
  ) {
    return next(
      new AppError(
        'Invalid or missing password reset token.',
        400
      )
    );
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(
      new AppError(
        'Password reset token is invalid or has expired.',
        400
      )
    );
  }

  user.password = req.body.password;

  // Invalidate token after use — prevent reuse
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  console.log(`[RESET_PASSWORD] ✅ Password reset successful for: ${user.email}`);

  // Send password-changed confirmation email (fire-and-forget)
  const confirmTemplate = emailTemplates.passwordChanged(user.name);
  sendEmail({
    to: user.email,
    ...confirmTemplate,
  })
    .then(() => console.log(`[RESET_PASSWORD] ✅ Password changed confirmation email sent to: ${user.email}`))
    .catch((err) => {
      console.error('[RESET_PASSWORD] ❌ PASSWORD_CHANGED_EMAIL_FAILED:');
      console.error(`[RESET_PASSWORD]    → Email : ${user.email}`);
      console.error(`[RESET_PASSWORD]    → Error : ${err.message}`);
    });

  const jwtToken = generateToken(
    user._id,
    user.role
  );

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful.',
    token: jwtToken,
  });
});

// ---------------- GET CURRENT USER ----------------
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('name email role avatar isVerified isEmailVerified phone isActive wishlist')
    .lean();

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  let vendorProfile = null;
  if (user.role === 'vendor') {
    const Vendor = require('../models/Vendor');
    vendorProfile = await Vendor.findOne({ user: user._id })
      .select('businessName approvalStatus isFeatured coverImage logo rating user category vendorType')
      .populate('category', 'name slug')
      .lean();

    if (!vendorProfile) {
      console.log('VENDOR PROFILE NOT FOUND IN getMe - AUTO-CREATING FAIL-SAFE PROFILE');
      const newProfile = await Vendor.create({
        user: user._id,
        businessName: `${user.name}'s Business (Pending)`,
        email: user.email,
        phone: user.phone || '0000000000',
        approvalStatus: 'pending',
        profileCompletion: 0,
      });
      await User.findByIdAndUpdate(user._id, { vendorProfile: newProfile._id });

      vendorProfile = await Vendor.findById(newProfile._id)
        .select('businessName approvalStatus isFeatured coverImage logo rating user category vendorType')
        .populate('category', 'name slug')
        .lean();
    }
  }

  res.status(200).json({
    status: 'success',
    user: {
      ...user,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      vendorProfile,
    },
  });
});

const changePassword = catchAsync(async (req, res, next) => {
  const currentPassword = req.body.currentPassword || req.body.oldPassword;
  const { newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current/old password and new password.', 400));
  }

  const user = await User.findById(
    req.user._id
  ).select('+password');

  if (
    !(await user.comparePassword(currentPassword))
  ) {
    return next(
      new AppError(
        'Current password is incorrect.',
        400
      )
    );
  }

  user.password = newPassword;

  await user.save();

  // Send password changed confirmation (fire-and-forget)
  const confirmTemplate = emailTemplates.passwordChanged(user.name);
  sendEmail({ to: user.email, ...confirmTemplate })
    .then(() => console.log(`[CHANGE_PASSWORD] ✅ Password changed confirmation sent to: ${user.email}`))
    .catch((err) => console.error(`[CHANGE_PASSWORD] ❌ Confirmation email failed: ${err.message}`));

  res.status(200).json({
    status: 'success',
    message:
      'Password changed successfully.',
  });
});

// ---------------- RESEND VERIFICATION ----------------
const resendVerification = catchAsync(async (req, res, next) => {

  const { email } = req.body;

  if (!email) {
    return next(
      new AppError(
        'Please provide an email address.',
        400
      )
    );
  }

  const normalizedEmail =
    email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    return next(
      new AppError(
        'No user found with this email address.',
        404
      )
    );
  }

  if (user.isVerified) {
    return next(
      new AppError(
        'This account is already verified.',
        400
      )
    );
  }

  const token = user.generateEmailVerificationToken();

  await user.save({
    validateBeforeSave: false,
  });

  const clientUrl = getClientUrl();
  const verificationUrl = `${clientUrl}/verify-email/${token}`;

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    console.log(`[DEVELOPMENT] 🔗 Resend Verification Link: ${verificationUrl}`);
  }

  const template =
    emailTemplates.verification(
      user.name,
      verificationUrl,
      user.preferredLanguage
    );

  console.log('[VERIFY_EMAIL] 📨 Resend Attempt Started (Background)');

  sendEmail({
    to: user.email,
    ...template,
  }).then(() => {
    console.log(`[VERIFY_EMAIL] ✅ Resend verification sent to: ${user.email}`);
  }).catch((err) => {
    console.error('[VERIFY_EMAIL] ❌ RESEND_VERIFICATION_FAILED:');
    console.error(`[VERIFY_EMAIL]    → Email : ${user.email}`);
    console.error(`[VERIFY_EMAIL]    → Error : ${err.message}`);
    console.error(`[VERIFY_EMAIL]    → Code  : ${err.code || 'UNKNOWN'}`);
  });

  return res.status(200).json({
    status: 'success',
    message: 'Verification link sent to your email.',
  });
});

// ---------------- LOGOUT ----------------
const logout = catchAsync(async (req, res, next) => {

  res.cookie('token', 'none', {
    expires:
      new Date(Date.now() + 10 * 1000),

    httpOnly: true,

    secure:
      process.env.NODE_ENV === 'production' ||
      req.secure ||
      req.headers['x-forwarded-proto'] === 'https',

    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax',
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('auth-event', {
      type: 'USER_LOGOUT',
      role: 'user',
      message: 'User logged out'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

// ---------------- TEST EMAIL DIAGNOSTIC ----------------
const testEmail = catchAsync(async (req, res, next) => {
  try {
    const to = process.env.EMAIL_FROM;
    if (!to) {
      return next(new AppError('EMAIL_FROM environment variable is not configured.', 500));
    }

    // Pre-check Brevo key format
    const brevoKey = process.env.BREVO_API_KEY;
    const keyStatus = !brevoKey
      ? 'MISSING'
      : brevoKey.startsWith('xkeysib-')
        ? 'VALID (v3 API key)'
        : brevoKey.startsWith('xsmtpsib-')
          ? 'INVALID (SMTP key — need v3 API key starting with xkeysib-)'
          : `UNKNOWN FORMAT (starts with ${brevoKey.substring(0, 8)}...)`;

    const subject = 'ShaadiSaathi Email Diagnostic Test';
    const html = `
      <div style="font-family:sans-serif;padding:20px;border:1px solid #ddd;border-radius:8px;">
        <h2 style="color:#22c55e;">Email System Test Successful! ✅</h2>
        <p>If you are reading this email, the email integration in <b>ShaadiSaathi</b> is fully functional.</p>
        <p><b>Time:</b> ${new Date().toISOString()}</p>
        <p><b>Environment:</b> ${process.env.NODE_ENV}</p>
        <p><b>Brevo Key Status:</b> ${keyStatus}</p>
        <p><b>CLIENT_URL:</b> ${getClientUrl()}</p>
        <p>Your authentication, verification, and booking email flows will now work smoothly.</p>
      </div>
    `;

    // Explicitly await for testing purposes to catch actual errors synchronously
    const info = await sendEmail({ to, subject, html });

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        messageId: info.messageId,
        recipient: to,
        emailProviderUsed: info.provider || 'unknown',
        brevoKeyStatus: keyStatus,
        clientUrl: getClientUrl(),
      }
    });
  } catch (error) {
    console.error('[EMAIL] Test Endpoint Failed:', error);
    return next(new AppError(`Email Configuration Error: ${error.message}`, 500));
  }
});

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
  resendVerification,
  testEmail,
};