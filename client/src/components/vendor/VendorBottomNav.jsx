import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiLayers, FiCalendar, FiMessageSquare, FiUser } from 'react-icons/fi';
import { useSelector } from 'react-redux';

export default function VendorBottomNav() {
  const { user } = useSelector(s => s.auth || {});
  const location = useLocation();

  if (user?.role !== 'vendor') return null;

  const navItems = [
    { to: '/vendor/dashboard', icon: FiHome, label: 'Home' },
    { to: '/vendor/services', icon: FiLayers, label: 'Services' },
    { to: '/vendor/bookings', icon: FiCalendar, label: 'Bookings' },
    { to: '/vendor/leads', icon: FiMessageSquare, label: 'Leads' },
    { to: '/vendor/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.to);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 relative ${
                isActive 
                  ? 'text-[#C2185B]' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isActive && (
                <span className="absolute -top-3 w-1.5 h-1.5 bg-[#C2185B] rounded-full shadow-[0_0_10px_rgba(194,24,91,0.5)] animate-fade-in" />
              )}
              <Icon size={isActive ? 22 : 20} className={`mb-1 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`} />
              <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 font-medium'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
