const path = require("path"); // Trigger nodemon restart
require("dotenv").config({ path: path.resolve(__dirname, ".env"), override: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const http = require("http");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const socketUtil = require('./utils/socket');
const { initSocketHandlers } = require('./utils/socketHandlers');
const { cloudinary } = require('./config/cloudinary');
const { errorHandler } = require('./middleware/errorMiddleware');
const { verifyBrevo } = require('./services/emailService');

// Activate keep-alive mechanism
require("./keepAlive");

// Initialize Campaign Scheduler
const initCampaignScheduler = require('./utils/campaignScheduler');
initCampaignScheduler();
const app = express();
const server = http.createServer(app);

// ---------------- SOCKET.IO ----------------
const io = socketUtil.init(server);
app.set('io', io);
initSocketHandlers(io);

// ---------------- PROMISE ERROR HANDLING ----------------
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION 💥 (Process exiting for stability...)', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  // In production, log but do NOT crash — allows the server to recover from transient failures
  console.error('UNHANDLED REJECTION ⚠️:', err);
  if (process.env.NODE_ENV === 'development') {
    // In dev, crash to surface bugs early
    process.exit(1);
  }
});

/* ---------------- CORS & DIAGNOSTIC REQUEST LOGGING (PLACED AT TOP OF MIDDLEWARE STACK) ---------------- */
const allowedOrigins = [
  "https://shaadi-saathi.vercel.app",
  "https://shaadi-saathi-2.vercel.app",
  // Development origins — safe to include since production mode is gated by NODE_ENV checks
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

if (process.env.CLIENT_URL) {
  const strippedUrl = process.env.CLIENT_URL.replace(/\/$/, '');
  if (!allowedOrigins.includes(strippedUrl)) {
    allowedOrigins.push(strippedUrl);
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin matches local, CLIENT_URL, or any Vercel domain
    const isAllowed = allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      /https:\/\/shaadi-saathi(-[a-z0-9-]+)?\.vercel\.app/.test(origin) ||
      /https:\/\/shaadisaathi(-[a-z0-9-]+)?\.vercel\.app/.test(origin);

    // In non-production, also allow private/LAN network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const isPrivateNetwork = process.env.NODE_ENV !== 'production' &&
      /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);

    if (isAllowed || isPrivateNetwork) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS BLOCKED for Origin: ${origin}`);
      callback(new Error(`Not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  maxAge: 86400 // Cache preflight requests for 24 hours to reduce server round-trips
};

// Enable CORS with dynamic settings
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Request logging middleware to trace connectivity in production
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📡 [API RESPONSE] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms) | Origin: ${req.headers.origin || 'N/A'}`);
  });
  next();
});

/* ---------------- SECURITY ---------------- */
app.set("trust proxy", 1);
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://shaadi-saathi.vercel.app", "https://*.vercel.app", "wss://*.onrender.com", "https://*.onrender.com", "http://localhost:*", "ws://localhost:*"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
app.use(compression());
app.use(morgan("dev"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

/* ---------------- RESPONSE STANDARDIZER MIDDLEWARE ---------------- */
// Adds a top-level `success` field without mutating existing keys.
// This preserves backward compatibility for all existing frontend consumers.
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const isSuccess = res.statusCode < 400 && body.success !== false && body.status !== 'fail' && body.status !== 'error';
      // Only inject `success` if not already set — avoids double-nesting
      if (!('success' in body)) {
        body.success = isSuccess;
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

/* ---------------- RATE LIMIT ---------------- */
// General API rate limit — generous in dev, protective in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use(limiter);

// Strict auth rate limit — prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in development
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  skip: (req) => req.path === '/test-email' || req.path === '/resend-verification' || process.env.NODE_ENV === 'development' // allow resend and skip in dev
});

/* ---------------- HEALTH ROUTES ---------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShaadiSaathi API Running"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Healthy"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Healthy"
  });
});

/* ---------------- AUTH MIDDLEWARE VALIDATION ---------------- */
const authMid = require('./middleware/authMiddleware');
if (!authMid.protect || !authMid.restrictTo || !authMid.adminOnly) {
  console.error('❌ CRITICAL: Auth Middleware failed to load properly. restrictTo or protect is missing.');
  process.exit(1);
} else {
  console.log('✓ Auth Middleware Loaded');
  console.log('✓ Protect Loaded');
  console.log('✓ RestrictTo Loaded');
  console.log('✓ Routes Ready');
}

/* ---------------- STARTUP ENV VALIDATION ---------------- */
// ── Required: Server WILL NOT start without these ──────────────────────
const REQUIRED_ENV_VARS = [
  { key: 'JWT_SECRET', label: 'JWT signing secret' },
];

// ── Required for Email: Server starts but emails will FAIL ─────────────
const COMMON_EMAIL_VARS = [
  { key: 'EMAIL_FROM', label: 'Sender email address (e.g. you@gmail.com)' },
  { key: 'CLIENT_URL', label: 'Frontend URL for email links (e.g. https://shaadi-saathi.vercel.app)' },
];

// ── Recommended: features degrade gracefully ───────────────────────────
const RECOMMENDED_ENV_VARS = ['OPENAI_API_KEY', 'FRONTEND_URL', 'SERVER_URL'];

// Check MongoDB URI (supports both MONGO_URI and MONGODB_URI)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ FATAL: Missing MONGO_URI (or MONGODB_URI). Server startup aborted.');
  process.exit(1);
}

// Check required vars
const missingRequired = REQUIRED_ENV_VARS.filter(v => !process.env[v.key]);
if (missingRequired.length > 0) {
  console.error('❌ FATAL: Missing required environment variables:');
  missingRequired.forEach(v => console.error(`   → ${v.key}: ${v.label}`));
  console.error('❌ Server startup aborted. Please set these variables in .env or your hosting provider.');
  process.exit(1);
}

// Check email vars — warn loudly but don't crash (allows partial operation)
const missingCommon = COMMON_EMAIL_VARS.filter(v => !process.env[v.key]);
const hasBrevo = process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.startsWith('xkeysib-');

if (missingCommon.length > 0 || !hasBrevo) {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  ⚠️  EMAIL SYSTEM DISABLED — Missing environment variables  ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  missingCommon.forEach(v => console.error(`   ❌ ${v.key}: ${v.label}`));

  if (!hasBrevo) {
    console.error('   ❌ Missing Email Provider Credentials.');
    console.error('      Set a valid BREVO_API_KEY (starts with xkeysib-)');
  }

  console.error('');
  console.error('   Emails (verification, password reset, booking) will NOT be sent.');
  console.error('   Set these in .env (local) or Render Dashboard → Environment (production).');
  console.error('');

  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey && brevoKey.startsWith('xsmtpsib-')) {
    console.error('   ⚠️  NOTE: Your BREVO_API_KEY starts with "xsmtpsib-" which is an SMTP relay key.');
    console.error('   The HTTP API requires a v3 API key starting with "xkeysib-".');
    console.error('   Generate one at: https://app.brevo.com → SMTP & API → API Keys');
    console.error('');
  }

  // Fail server startup if invalid email configurations
  process.exit(1);
} else {
  console.log('✅ All email environment variables configured. Provider: Brevo HTTP API');
}

const missingRecommended = RECOMMENDED_ENV_VARS.filter(v => !process.env[v]);

// Check Razorpay vars conditionally
if (process.env.PAYMENT_PROVIDER === 'razorpay') {
  const missingRazorpay = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'].filter(v => !process.env[v]);
  if (missingRazorpay.length > 0) {
    console.warn(`⚠️  Missing Razorpay environment variables: ${missingRazorpay.join(', ')}`);
  }
} else if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_SECRET) {
    console.warn(`⚠️  RAZORPAY_KEY_SECRET is missing. Payments may fail.`);
}

if (missingRecommended.length > 0) {
  console.warn(`⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}`);
}

// Validate CLIENT_URL has no trailing slash (common misconfiguration)
if (process.env.CLIENT_URL && process.env.CLIENT_URL.endsWith('/')) {
  console.warn(`⚠️  CLIENT_URL has a trailing slash: "${process.env.CLIENT_URL}"`);
  console.warn('   → This can cause double-slash in email verification links. Stripping it automatically.');
  process.env.CLIENT_URL = process.env.CLIENT_URL.replace(/\/+$/, '');
}

// Validate no localhost URLs in production
if (process.env.NODE_ENV === 'production') {
  const urlVars = ['CLIENT_URL', 'FRONTEND_URL', 'SERVER_URL'];
  urlVars.forEach(key => {
    const val = process.env[key];
    if (val && (val.includes('localhost') || val.includes('127.0.0.1'))) {
      console.error(`❌ CRITICAL: ${key} contains localhost in production: "${val}"`);
      console.error('   → This WILL break email links. Please set to production domain.');
    }
  });
}

console.log('✅ Environment variables validated.');
console.log(`   → NODE_ENV   : ${process.env.NODE_ENV}`);
console.log(`   → CLIENT_URL : ${process.env.CLIENT_URL || '(not set)'}`);
console.log(`   → BREVO_KEY  : ${process.env.BREVO_API_KEY ? 'Set' : '(not set)'}`);

/* ---------------- ROUTES ---------------- */
const { testEmail } = require("./controllers/authController");
app.get("/api/test-email", testEmail);

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/cab-booking", require("./routes/cabRoutes"));
app.use("/api/fleet", require("./routes/fleetRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/features", require("./routes/featureRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/offers", require("./routes/offerRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/showcase", require("./routes/showcaseRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));
app.use("/api/package-inquiries", require("./routes/packageInquiryRoutes"));
app.use("/api/expert-consultations", require("./routes/expertConsultationRoutes"));
app.use("/api/invitations", require("./routes/invitationRoutes"));
app.use("/api/tools", require("./routes/toolRoutes"));
app.use("/api/astrology", require("./routes/astrologyRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/weddings", require("./routes/weddingRoutes"));
/* ---------------- HEALTH CHECKS ---------------- */
app.get("/api/health/email", async (req, res) => {
  try {
    const { verifyBrevo } = require('./services/emailService');
    const isOk = await verifyBrevo();
    if (isOk) {
      res.json({ brevo: "connected" });
    } else {
      res.status(503).json({ brevo: "failed", reason: "Brevo verification failed. Check logs." });
    }
  } catch (error) {
    res.status(500).json({ brevo: "error", reason: error.message });
  }
});

/* ---------------- 404 ---------------- */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API Route Not Found"
  });
});

/* ---------------- ERROR HANDLER ---------------- */
app.use(errorHandler);

/* ---------------- DATABASE & SEEDERS ---------------- */
const repairCategories = async () => {
  try {
    const { Category, Service } = require('./models/index');
    const Vendor = require('./models/Vendor');

    console.log('🔄 STARTING HEURISTIC CATEGORY REPAIR & SELF-HEALING SYSTEM...');

    // 1. Ensure categories are seeded (same default categories as categoryController)
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('⏳ Seeding default categories during startup repair...');
      const defaultCategories = [
        { name: 'Photography', icon: '📷', slug: 'photography', order: 1, isActive: true },
        { name: 'Catering', icon: '🍽️', slug: 'catering', order: 2, isActive: true },
        { name: 'Decoration', icon: '✨', slug: 'decoration', order: 3, isActive: true },
        { name: 'Mehndi', icon: '🌿', slug: 'mehndi', order: 4, isActive: true },
        { name: 'Venue', icon: '🏛️', slug: 'venue', order: 5, isActive: true },
        { name: 'DJ', icon: '🎵', slug: 'dj', order: 6, isActive: true },
        { name: 'Makeup Artist', icon: '💄', slug: 'makeup-artist', order: 7, isActive: true },
        { name: 'Tent House', icon: '🎪', slug: 'tent-house', order: 8, isActive: true },
        { name: 'Pandit', icon: '🪔', slug: 'pandit', order: 9, isActive: true },
        { name: 'Cab Service', icon: '🚗', slug: 'cab-service', order: 10, isActive: true }
      ];
      await Category.create(defaultCategories);
      console.log('✅ Default categories seeded successfully.');
    }

    // Load all categories for matching
    const allCategories = await Category.find();
    const catMap = {}; // slug -> ObjectId
    allCategories.forEach(c => {
      catMap[c.slug] = c._id;
    });

    const matchCategorySlug = (text) => {
      if (!text) return 'photography';
      const t = text.toLowerCase();
      if (t.includes('photo') || t.includes('cam') || t.includes('shoot')) return 'photography';
      if (t.includes('purohit') || t.includes('pandit') || t.includes('priest') || t.includes('pujari')) return 'pandit';
      if (t.includes('mehndi') || t.includes('henna') || t.includes('mehendi')) return 'mehndi';
      if (t.includes('cater') || t.includes('food') || t.includes('kitchen') || t.includes('cook')) return 'catering';
      if (t.includes('decor') || t.includes('flower') || t.includes('light') || t.includes('theme')) return 'decoration';
      if (t.includes('hall') || t.includes('venue') || t.includes('resort') || t.includes('lawn') || t.includes('banquet')) return 'venue';
      if (t.includes('dj') || t.includes('music') || t.includes('sound') || t.includes('band') || t.includes('singer')) return 'dj';
      if (t.includes('makeup') || t.includes('parlor') || t.includes('beauty') || t.includes('salon') || t.includes('bridal')) return 'makeup-artist';
      if (t.includes('tent') || t.includes('pandal')) return 'tent-house';
      if (t.includes('cab') || t.includes('car') || t.includes('travel') || t.includes('vehicle') || t.includes('operator')) return 'cab-service';
      return 'photography'; // fallback
    };

    const validCategoryIds = allCategories.map(c => c._id);

    // 2. Repair Services missing category or with invalid category
    const servicesToRepair = await Service.find({
      $or: [
        { category: null },
        { category: { $exists: false } },
        { category: { $nin: validCategoryIds } }
      ]
    });

    if (servicesToRepair.length > 0) {
      console.log(`⏳ Found ${servicesToRepair.length} Services with missing/null category. Repairing...`);
      for (const service of servicesToRepair) {
        const textToMatch = `${service.title} ${service.description || ''}`;
        const matchedSlug = matchCategorySlug(textToMatch);
        const catId = catMap[matchedSlug] || allCategories[0]._id;
        service.category = catId;
        await service.save({ validateBeforeSave: false });
        console.log(`✅ Repaired category for Service: "${service.title}" -> Assigned: "${matchedSlug}"`);
      }
    }

    // 3. Repair Vendors missing category or with invalid category
    const vendorsToRepair = await Vendor.find({
      $or: [
        { category: null },
        { category: { $exists: false } },
        { category: { $nin: validCategoryIds } }
      ]
    });

    if (vendorsToRepair.length > 0) {
      console.log(`⏳ Found ${vendorsToRepair.length} Vendor profiles with missing/null category. Repairing...`);
      for (const vendor of vendorsToRepair) {
        // Attempt to find any service by this vendor and copy its category
        const vendorService = await Service.findOne({ vendor: vendor._id, category: { $ne: null } });
        if (vendorService) {
          vendor.category = vendorService.category;
          await vendor.save({ validateBeforeSave: false });
          console.log(`✅ Repaired category for Vendor: "${vendor.businessName}" -> Copied from Service: "${vendorService.title}"`);
        } else {
          // Check businessName or description
          const textToMatch = `${vendor.businessName || ''} ${vendor.description || ''} ${vendor.tagline || ''}`;
          const matchedSlug = matchCategorySlug(textToMatch);
          const catId = catMap[matchedSlug] || allCategories[0]._id;
          vendor.category = catId;
          await vendor.save({ validateBeforeSave: false });
          console.log(`✅ Repaired category for Vendor: "${vendor.businessName}" -> Assigned slug: "${matchedSlug}"`);
        }
      }
    }

    console.log('✅ HEURISTIC CATEGORY REPAIR & SELF-HEALING SYSTEM COMPLETED.');

  } catch (err) {
    console.error('❌ Error during Category Repair & Migration:', err);
  }
};

const startServer = async () => {
  try {
    if (cloudinary) {
      console.log('✅ Cloudinary configured');
    }

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("Mongo URI missing");
    }

    // Security guard to prevent localhost MongoDB connections in a production environment
    if (process.env.NODE_ENV === 'production' && (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1'))) {
      console.error('❌ CRITICAL CONFIGURATION ERROR: Attempted to connect to localhost MongoDB in a production environment! Server boot terminated.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 50,
      retryWrites: true,
      retryReads: true
    });
    console.log("✅ MongoDB connected");

    // Run self-healing category repair migration
    await repairCategories();

    // Seed packages
    const { seedPackagesIfEmpty } = require('./controllers/packageController');
    await seedPackagesIfEmpty();

    // Auto-seed/Ensure default admin exists with correct credentials
    try {
      const User = require('./models/User');
      const adminEmail = 'admin@shaadisaathi.com';
      let admin = await User.findOne({ email: adminEmail }).select('+password');

      if (!admin) {
        const adminPass = process.env.ADMIN_PASS || (process.env.NODE_ENV === 'development' ? 'Admin@123' : null);
        if (!adminPass || typeof adminPass !== 'string') {
          console.error('❌ ADMIN_PASS env var is required in production. Skipping admin seed.');
        } else {
          console.log('⏳ Default admin not found. Seeding admin user...');
          await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: adminPass,
            role: 'admin',
            isVerified: true,
            isEmailVerified: true,
            isActive: true
          });
          console.log(`✅ Default admin seeded successfully.`);
        }
      } else {
        let needsUpdate = false;
        if (admin.role !== 'admin') { admin.role = 'admin'; needsUpdate = true; }
        if (!admin.isActive) { admin.isActive = true; needsUpdate = true; }

        // FIX: only call comparePassword if ADMIN_PASS is a non-empty string
        // Passing null/undefined to bcrypt.compare throws "Illegal arguments: object, string"
        const adminPass = process.env.ADMIN_PASS;
        if (adminPass && typeof adminPass === 'string' && adminPass.trim() !== '') {
          try {
            const isPasswordCorrect = await admin.comparePassword(adminPass.trim());
            if (!isPasswordCorrect) {
              console.log('⏳ ADMIN_PASS changed — updating admin password...');
              admin.password = adminPass.trim();
              needsUpdate = true;
            }
          } catch (bcryptErr) {
            // Log and skip — never crash the server over a password comparison
            console.error('⚠️  Admin password comparison failed (bcrypt):', bcryptErr.message);
            console.error('⚠️  Hint: Ensure ADMIN_PASS is a plain string with at least one uppercase, one lowercase, and one digit.');
          }
        } else if (!adminPass) {
          console.log('ℹ️  ADMIN_PASS not set — skipping admin password sync (current password preserved).');
        }

        if (needsUpdate) {
          await admin.save();
          console.log('✅ Default admin account verified and updated.');
        } else {
          console.log('✅ Default admin account is up to date.');
        }
      }
    } catch (dbErr) {
      console.error('⚠️ Error verifying or seeding default admin:', dbErr.message);
    }

    // Auto-normalize and validate existing Cab documents to ensure dropdowns work
    try {
      const { Cab } = require('./models/index');
      const cabsToNormalize = await Cab.find({
        $or: [
          { vehicleName: { $exists: false } },
          { isApproved: { $exists: false } },
          { isActive: { $exists: false } },
          { vendorId: { $exists: false } },
          { category: { $exists: false } },
          { status: 'pending' }
        ]
      });

      if (cabsToNormalize.length > 0) {
        console.log(`⏳ Normalizing ${cabsToNormalize.length} fleet vehicles in the database...`);
        for (const cab of cabsToNormalize) {
          try {
            if (cab.status === 'pending') {
              cab.status = 'approved';
              cab.isAvailable = true;
            }
            await cab.save({ validateBeforeSave: false });
          } catch (e) {
            console.error(`⚠️ Failed to normalize cab ${cab._id}:`, e.message);
          }
        }
        console.log('✅ Fleet database normalization completed successfully.');
      }
    } catch (normErr) {
      console.error('⚠️ Error during startup fleet normalization:', normErr.message);
    }

    // Auto-seed premium blogs if none exist
    try {
      const { Blog } = require('./models/FeatureModels');
      const blogCount = await Blog.countDocuments();
      if (blogCount === 0) {
        console.log('⏳ Seeding premium dummy blogs...');
        const User = require('./models/User');
        const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();
        const authorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

        await Blog.insertMany([
          {
            title: 'The Ultimate Guide to Planning a Royal Palace Wedding in Rajasthan',
            slug: 'royal-palace-wedding-rajasthan',
            content: '<p>Planning a royal wedding is a dream for many. Here is our comprehensive guide to making it happen seamlessly in the majestic palaces of Rajasthan.</p><p>From booking the right venues like Umaid Bhawan Palace or Taj Lake Palace to managing logistics, every detail matters.</p>',
            excerpt: 'Discover everything you need to know about planning your dream royal wedding in Rajasthan with our expert insights and tips.',
            author: authorId,
            coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
            category: 'Trending',
            tags: ['Royal Wedding', 'Rajasthan', 'Planning'],
            views: 4500,
            isPublished: true,
          },
          {
            title: 'Top 10 Sabyasachi Bridal Lehengas of the Season',
            slug: 'sabyasachi-bridal-lehengas',
            content: '<p>Every bride dreams of wearing a Sabyasachi lehenga on her wedding day. Here are the top 10 designs that are trending this season.</p>',
            excerpt: 'Explore the most beautiful and trending Sabyasachi bridal lehengas for your big day.',
            author: authorId,
            coverImage: 'https://images.unsplash.com/photo-1583939000155-703666d3a8e9?w=800&q=80',
            category: 'Fashion',
            tags: ['Bridal', 'Lehenga', 'Sabyasachi'],
            views: 3200,
            isPublished: true,
          },
          {
            title: 'How to Build a Realistic Wedding Budget (And Actually Stick to It)',
            slug: 'realistic-wedding-budget',
            content: '<p>Budgeting is the most crucial part of wedding planning. Let us break down the costs and show you how to manage your finances effectively.</p>',
            excerpt: 'Master your wedding finances with our complete guide to building and maintaining a realistic budget.',
            author: authorId,
            coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
            category: 'Planning',
            tags: ['Budget', 'Finance', 'Planning'],
            views: 2800,
            isPublished: true,
          },
          {
            title: 'Minimalist Mandap Decor Ideas for the Modern Couple',
            slug: 'minimalist-mandap-decor',
            content: '<p>Move over heavy decorations. Minimalist mandaps are the new trend. Discover how less can be more for your wedding ceremony.</p>',
            excerpt: 'Get inspired by these stunning and elegant minimalist mandap designs for modern Indian weddings.',
            author: authorId,
            coverImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
            category: 'Decor',
            tags: ['Decor', 'Mandap', 'Minimalist'],
            views: 1950,
            isPublished: true,
          }
        ]);
        console.log('✅ Premium dummy blogs seeded successfully.');
      }
    } catch (blogErr) {
      console.error('⚠️ Error seeding blogs:', blogErr.message);
    }

    // Verify Brevo configuration on startup
    try {
      const brevoOk = await verifyBrevo();
      if (!brevoOk) {
        console.warn('⚠️  Brevo verification failed — emails may not be delivered. Check BREVO_API_KEY in .env');
      }
    } catch (brevoErr) {
      console.error('⚠️  Brevo verification error:', brevoErr.message);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup Error:", error);
    process.exit(1);
  }
};


startServer();

/* ---------------- SHUTDOWN ---------------- */
process.on("SIGINT", async () => {
  console.log("👋 Server shutting down");
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = { app, server, io };