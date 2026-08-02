import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiCalendar, FiUser, FiGrid, FiUsers } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function MobileBottomNav() {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  const location = useLocation();
  const { t, i18n } = useTranslation?.() || { t: (key, def) => def, i18n: { language: 'en' } };
  const isEnglish = i18n.language === 'en';

  // Hide bottom nav on specific routes where it interferes with UX or where a sidebar exists
  const hideOnRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const hidePrefixes = ['/admin', '/vendor'];

  const shouldHide = hideOnRoutes.includes(location.pathname) || 
                     hidePrefixes.some(prefix => location.pathname.startsWith(prefix));

  if (shouldHide) return null;

  let navItems = [];

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      navItems = [
        { to: "/", icon: FiHome, label: isEnglish ? 'Home' : 'होम' },
        { to: "/admin", icon: FiGrid, label: isEnglish ? 'Admin' : 'एडमिन' },
        { to: "/admin/vendors", icon: FiUsers, label: isEnglish ? 'Vendors' : 'वेंडर्स' },
        { to: "/admin/users", icon: FiUser, label: isEnglish ? 'Users' : 'यूजर्स' }
      ];
    } else if (user?.role === 'vendor') {
      navItems = [
        { to: "/", icon: FiHome, label: isEnglish ? 'Home' : 'होम' },
        { to: "/vendor/dashboard", icon: FiGrid, label: isEnglish ? 'Dashboard' : 'डैशबोर्ड' },
        { to: "/vendor/bookings", icon: FiCalendar, label: isEnglish ? 'Bookings' : 'बुकिंग्स' },
        { to: "/vendor/services", icon: FiSearch, label: isEnglish ? 'Services' : 'सेवाएं' }
      ];
    } else {
      // Customer: Home, Explore, Bookings, Profile
      navItems = [
        { to: "/", icon: FiHome, label: isEnglish ? 'Home' : 'होम' },
        { to: "/services", icon: FiSearch, label: isEnglish ? 'Explore' : 'खोजें' },
        { to: "/bookings", icon: FiCalendar, label: isEnglish ? 'Bookings' : 'बुकिंग' },
        { to: "/dashboard", icon: FiUser, label: isEnglish ? 'Profile' : 'प्रोफाइल' }
      ];
    }
  } else {
    // Guest: Home, Explore, Bookings, Login
    navItems = [
      { to: "/", icon: FiHome, label: isEnglish ? 'Home' : 'होम' },
      { to: "/services", icon: FiSearch, label: isEnglish ? 'Explore' : 'खोजें' },
      { to: "/bookings", icon: FiCalendar, label: isEnglish ? 'Bookings' : 'बुकिंग' },
      { to: "/login", icon: FiUser, label: isEnglish ? 'Login' : 'लॉगिन' }
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(68px+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-gray-200/60 flex items-start justify-around pt-2 pb-[env(safe-area-inset-bottom)] px-2 z-[90] shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
      {navItems.map((item) => (
        <NavLink 
          key={item.label}
          to={item.to} 
          className={({ isActive }) => 
            `relative flex flex-1 flex-col items-center justify-center p-1 rounded-xl transition-colors ${isActive ? 'text-[#C2185B]' : 'text-gray-400 hover:text-gray-800'}`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-[#C2185B]' : 'font-medium'}`}>{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-[2px] w-8 h-1 bg-[#C2185B] rounded-t-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
