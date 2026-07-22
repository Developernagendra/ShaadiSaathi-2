# ShaadiSaathi Client - Frontend

ShaadiSaathi is a premium, production-ready MERN stack wedding marketplace platform designed to connect couples with the best wedding vendors across India.

## 🚀 Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) (with Rolldown support)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)
- **Slider/Carousel**: [Swiper.js](https://swiperjs.com/)
- **Forms & Validation**: [Formik](https://formik.org/) & [Yup](https://github.com/jquense/yup)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 🛠️ Key Features

### 🤵 For Vendors
- **Modern Dashboard**: Real-time stats on bookings, revenue, and profile views.
- **Service Management**: Multi-media service creation (Images & Videos) with package definitions.
- **Approval Gating**: Secure workflow ensuring only verified vendors can list services.
- **Business Profile**: Highly customizable business pages with galleries and reviews.
- **Availability Calendar**: Manage booking dates and availability.

### 👰 For Couples
- **Advanced Search**: Filter vendors by category, city, price, and ratings.
- **Interactive Galleries**: High-res images and video playback for vendor services.
- **Booking Flow**: Streamlined request system for checking availability and booking.
- **Wishlist**: Save favorite vendors for later planning.

### 🛡️ For Admins
- **Verification Suite**: Comprehensive interface to review and approve/reject vendor applications.
- **Global Management**: Monitor users, vendors, and marketplace health.

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (Modals, StarRating, etc.)
├── hooks/          # Custom React hooks (useAuth, useVendors, etc.)
├── layouts/        # Page layouts (Navbar, Footer, Sidebar)
├── pages/          # Page components (Home, VendorDashboard, AdminDashboard)
├── store/          # Redux Toolkit slices and global store
├── utils/          # API config, helpers, and constants
└── App.jsx         # Main routing and application logic
```

## ⚙️ Installation & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root of the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5002/api
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## 🎨 Design System
The application uses a "Premium Wedding" aesthetic:
- **Primary Color**: `#c41e6b` (Elegant Magenta)
- **Typography**: Playfair Display (Headings) & Lato (Body)
- **Components**: Rounded corners (2xl), subtle shadows, and glassmorphism effects.

---
© 2026 ShaadiSaathi. All rights reserved.
