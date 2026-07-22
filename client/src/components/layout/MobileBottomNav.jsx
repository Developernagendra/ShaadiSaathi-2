import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiCalendar, FiStar, FiUser, FiGrid, FiUsers, FiBriefcase } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  let navItems = [];

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      navItems = [
        { to: "/", icon: FiHome, label: "Home" },
        { to: "/admin", icon: FiGrid, label: "Admin" },
        { to: "/admin/vendors", icon: FiUsers, label: "Vendors" },
        { to: "/admin/users", icon: FiUser, label: "Users" }
      ];
    } else if (user?.role === 'vendor') {
      navItems = [
        { to: "/", icon: FiHome, label: "Home" },
        { to: "/vendor/dashboard", icon: FiGrid, label: "Dashboard" },
        { to: "/vendor/bookings", icon: FiCalendar, label: "Bookings" },
        { to: "/vendor/services", icon: FiStar, label: "Services" }
      ];
    } else {
      // Customer
      navItems = [
        { to: "/", icon: FiHome, label: "Home" },
        { to: "/services", icon: FiSearch, label: "Explore" },
        { to: "/bookings", icon: FiCalendar, label: "मेरी बुकिंग" },
        { to: "/wishlist", icon: FiStar, label: "पसंद" },
        { to: "/dashboard", icon: FiUser, label: "Profile" }
      ];
    }
  } else {
    // Guest
    navItems = [
      { to: "/", icon: FiHome, label: "Home" },
      { to: "/services", icon: FiSearch, label: "Explore" },
      { to: "/login", icon: FiUser, label: "Login" }
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(72px+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-start justify-around pt-2 pb-[env(safe-area-inset-bottom)] px-2 z-[90] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink 
          key={item.label}
          to={item.to} 
          className={({ isActive }) => 
            `relative flex flex-1 flex-col items-center justify-center p-1 rounded-xl transition-colors ${isActive ? 'text-[#C2185B]' : 'text-slate-400 hover:text-slate-800'}`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
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
