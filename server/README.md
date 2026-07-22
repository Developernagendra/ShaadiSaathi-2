# ShaadiSaathi Server - Backend API

The backend engine for ShaadiSaathi, a robust MERN stack wedding marketplace. Built with security, scalability, and performance in mind.

## 🚀 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JSON Web Token (JWT)](https://jwt.io/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Email Service**: [Brevo API](https://www.brevo.com/)

## 🛠️ Architectural Features

### 🛡️ Advanced Authentication & Authorization
- **Multi-Role RBAC**: Support for `user`, `vendor`, and `admin` roles.
- **Approval Middleware**: `restrictToApproved` middleware ensures that only vendors verified by admins can perform business operations.
- **Atomic Sync**: Automatic role promotion from `user` to `vendor` upon administrative approval.

### 📁 Scalable Data Models
- **Vendor System**: Detailed business profiles with nested packages, locations, and social links.
- **Service Management**: Supports multi-media assets (images & MP4 videos) with high-res processing.
- **Notification System**: Integrated real-time alerts for booking updates and approval status.

### ☁️ Media Handling
- **Cloudinary Integration**: Automatic resizing, cropping, and optimization of images.
- **Video Support**: Optimized for MP4 uploads with a 50MB size limit for high-quality service demos.

## 📁 Project Structure

```text
server/
├── config/         # Database, Cloudinary, and Email configurations
├── controllers/    # Business logic (Auth, Vendor, Service, Booking)
├── middleware/     # Security, role checks, and error handling
├── models/         # Mongoose schemas (Centralized in index.js + separate files)
├── routes/         # API endpoint definitions
├── utils/          # Global error handlers and helper utilities
└── server.js       # Entry point and app configuration
```

## ⚙️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root of the `server` directory:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRE=30d
   
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   
   BREVO_API_KEY=xkeysib-your-v3-api-key
   EMAIL_FROM=hello@shaadisaathi.com
   EMAIL_FROM_NAME="ShaadiSaathi"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🔒 Security Best Practices
- **Password Hashing**: Bcryptjs with salt rounds for secure storage.
- **XSS Protection**: Sanitization of incoming request data.
- **Rate Limiting**: Protection against brute-force attacks on auth routes.
- **Secure CORS**: Controlled access for the production frontend.

---
© 2026 ShaadiSaathi. All rights reserved.
