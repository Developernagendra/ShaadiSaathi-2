require('dotenv').config({ override: true });
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary-v2');
const multer = require('multer');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Cloudinary configuration from environment variables

// Validation for placeholder values
const isPlaceholder = (val) => !val || val.includes('your_') || val === '';

if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
  const errorMsg = `
❌ CLOUDINARY CONFIGURATION ERROR:
Placeholder values detected in .env. 
Please replace 'your_cloud_name', 'your_api_key', and 'your_api_secret' with real credentials from your Cloudinary Dashboard.
Error: Cloudinary will fail with "Unknown API key" or "cloud_name is disabled".
  `;
  console.error(errorMsg);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Profile image storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shaadisaathi/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', quality: 'auto' }],
  },
});

// Service/vendor media storage (Images & Videos)
const serviceStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'shaadisaathi/services',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'webm']
        : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    };
  },
});

// Document storage (for vendor verification)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shaadisaathi/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const uploadService = multer({
  storage: serviceStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  },
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = { cloudinary, uploadProfile, uploadService, uploadDocument, deleteFromCloudinary };
