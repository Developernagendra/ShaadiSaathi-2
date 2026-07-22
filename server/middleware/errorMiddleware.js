// 404 Not Found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  console.error('\n❌ [GLOBAL ERROR HANDLER]', err.message, err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0];
    const friendlyMessages = {
      email: 'Email already registered. Please login instead.',
      phone: 'Phone number already registered. Please use a different number.',
    };
    message = friendlyMessages[field] || `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Maximum allowed is 10MB.';
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body. Please check your request format.';
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload is too large. Maximum allowed is 50MB.';
  }

  // Cloudinary Errors
  if (err.message && err.message.includes('cloud_name is disabled')) {
    statusCode = 403;
    message = 'Cloudinary cloud name is disabled. Please check your Cloudinary dashboard.';
  }

  if (err.message && err.message.includes('Unknown API key')) {
    statusCode = 401;
    message = 'Invalid Cloudinary API key. Please check your environment variables.';
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
