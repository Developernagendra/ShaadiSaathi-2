import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { fetchNotifications } from '../../store/slices/notificationSlice'
import { getInitials } from '../../utils/helpers'
import {
  FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiShoppingCart, FiBell,
  FiHome, FiGrid, FiMessageCircle, FiChevronDown, FiBriefcase, FiCalendar, FiSearch
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import api from '../../utils/api'
import { apiCache } from '../../utils/apiCache'
import BrandLogo from '../common/BrandLogo'
import LanguageSwitcher from '../common/LanguageSwitcher'

// Preload component chunk
const preloadBaraatCabsChunk = () => import('../../pages/BaraatCabsPage')

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((s) => s.auth || {})
  const { items: notifications = [], unreadCount = 0 } = useSelector((s) => s.notifications || {})
  const { cartItems = [] } = useSelector((s) => s.ui || {})

  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const userMenuRef = useRef(null)
  const notifRef = useRef(null)
  const isHome = location.pathname === '/'
  const { t, i18n } = useTranslation?.() || { t: (key) => key, i18n: { language: 'en', changeLanguage: () => { } } };

  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    let rafId = null
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20)
        rafId = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotifications())
  }, [isAuthenticated, dispatch])

  // Mobile Drawer Effect (Scroll lock and ESC key)
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('mobile-drawer-open');
    } else {
      document.body.classList.remove('mobile-drawer-open');
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('mobile-drawer-open');
    };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = useCallback(() => {
    dispatch(logoutUser())
    toast.success(isEnglish ? 'Logged out successfully' : 'लॉग-आउट सफल')
    navigate('/')
    setUserMenuOpen(false)
    setMobileOpen(false)
  }, [dispatch, navigate, isEnglish])

  const navTransparent = isHome && !scrolled

  const toolsMenu = {
    label: isEnglish ? 'Tools' : 'टूल्स',
    icon: <FiGrid />,
    children: [
      { to: '/tools', label: isEnglish ? '🛠 All Tools Hub' : '🛠 सभी टूल्स' },
      { to: '/tools/ai-planner', label: isEnglish ? '🤖 AI Wedding Planner' : '🤖 AI शादी प्लानर' },
      { to: '/tools/budget-planner', label: isEnglish ? '💰 Budget Planner' : '💰 बजट प्लानर' },
      { to: '/tools/guest-manager', label: isEnglish ? '👥 Guest List Manager' : '👥 मेहमान लिस्ट' },
      { to: '/tools/checklist', label: isEnglish ? '✅ Wedding Checklist' : '✅ शादी की चेकलिस्ट' },
      { to: '/tools/vendor-availability', label: isEnglish ? '📍 Vendor Availability' : '📍 वेंडर उपलब्धता' },
      { to: '/tools/package-builder', label: isEnglish ? '📦 Package Builder' : '📦 पैकेज बिल्डर' },
      { to: '/tools/invitation-generator', label: isEnglish ? '💌 Invitation Generator' : '💌 निमंत्रण जनरेटर' },
      { to: '/tools/vendor-compare', label: isEnglish ? '⚖ Vendor Comparison' : '⚖ वेंडर तुलना' },
      { to: '/tools/baraat-calculator', label: isEnglish ? '🚘 Baraat Fleet Calculator' : '🚘 बारात गाड़ी कैलकुलेटर' },
      { to: '/tools/cost-predictor', label: isEnglish ? '📈 Wedding Cost Predictor' : '📈 शादी खर्च अनुमान' }
    ]
  };

  const publicLinks = [
    { to: '/services', label: isEnglish ? 'Find Vendors' : 'Vendor खोजें' },
    toolsMenu,
    { to: '/baraat-cabs', label: isEnglish ? 'Baraat Ride' : 'बारात राइड', isBaraat: true },
  ];

  const navLinks = !isAuthenticated
    ? publicLinks
    : user?.role === 'admin'
      ? [
        { to: '/admin', label: isEnglish ? 'Admin Dashboard' : 'एडमिन डैशबोर्ड' },
        { to: '/admin/vendors', label: isEnglish ? 'Vendors' : 'वेंडर्स' },
        { to: '/admin/users', label: isEnglish ? 'Users' : 'यूजर्स' },
        toolsMenu,
      ]
      : user?.role === 'vendor'
        ? [
          { to: '/vendor/dashboard', label: isEnglish ? 'My Business' : 'मेरा Business' },
          { to: '/vendor/services', label: isEnglish ? 'My Services' : 'मेरी सेवाएं' },
          { to: '/vendor/bookings', label: isEnglish ? 'Bookings' : 'बुकिंग्स' },
          toolsMenu,
        ]
        : [
          { to: '/services', label: isEnglish ? 'Find Vendors' : 'Vendor खोजें' },
          toolsMenu,
          { to: '/baraat-cabs', label: isEnglish ? 'Baraat Ride' : 'बारात राइड', isBaraat: true },
        ];

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin'
    if (user?.role === 'vendor') return '/vendor/dashboard'
    return '/dashboard'
  }

  const handlePreloadBaraatCabs = useCallback(() => {
    preloadBaraatCabsChunk().catch(() => { });
    const cacheKey = `/fleet/browse?`;
    if (!apiCache.has(cacheKey)) {
      api.get(cacheKey).then(res => {
        if (res.data?.status === 'success') {
          apiCache.set(cacheKey, res.data);
        }
      }).catch(() => { });
    }
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          navTransparent
            ? 'bg-gradient-to-b from-[#0B1021]/80 via-[#0B1021]/30 to-transparent border-b border-white/10'
            : 'bg-[#FDFCF8]/95 backdrop-blur-md shadow-sm border-b border-gray-200/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-[76px]">
            {/* ── LEFT: Brand Logo & Tagline ── */}
            <div className="flex-shrink-0 min-w-0 flex items-center">
              <BrandLogo
                isDark={navTransparent}
                onClick={() => setMobileOpen(false)}
                showTagline={true}
              />
            </div>

            {/* ── CENTER: Clean Marketplace Navigation ── */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const isCabs = link.isBaraat || link.to === '/baraat-cabs';

                if (link.children) {
                  return (
                    <div key={link.label} className="relative group">
                      <button
                        className={`py-2 text-xs xl:text-sm uppercase tracking-wider font-bold transition-colors duration-200 flex items-center gap-1.5 ${
                          navTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-[#C2185B]'
                        }`}
                      >
                        <span>{link.label}</span>
                        <FiChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                      <div className="absolute top-full left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="bg-[#FDFCF8] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 p-2">
                          {link.children.map(child => (
                            <Link
                              key={child.to}
                              to={child.to}
                              className="flex flex-col gap-1 p-3 rounded-xl hover:bg-[#FFF8F0] transition-colors group/item"
                            >
                              <span className="text-sm font-bold text-gray-900 group-hover/item:text-[#C2185B] transition-colors flex items-center gap-2">
                                {child.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onMouseEnter={isCabs ? handlePreloadBaraatCabs : undefined}
                    className={`py-2 text-xs xl:text-sm uppercase tracking-wider font-bold transition-colors duration-200 relative group flex items-center gap-1.5 ${
                      navTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-[#C2185B]'
                    } ${location.pathname === link.to ? (navTransparent ? 'text-white font-black' : 'text-[#C2185B] font-black') : ''}`}
                  >
                    {isCabs && <span className="text-sm">🚗</span>}
                    <span>{link.label}</span>
                    <span
                      className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4AF37] transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${
                        location.pathname === link.to ? 'scale-x-100' : ''
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* ── RIGHT: Vendor CTA, Language Selector, Login & Register ── */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Secondary CTA: Become a Vendor */}
              <Link
                to="/register/vendor"
                className={`hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 shadow-sm ${
                  navTransparent
                    ? 'bg-white/10 hover:bg-white/20 text-[#D4AF37] border-white/20'
                    : 'bg-[#FFF8F0] hover:bg-[#FFE8D6] text-[#C2185B] border-[#C2185B]/20'
                }`}
              >
                <FiBriefcase size={13} />
                <span>{isEnglish ? 'Become a Vendor' : 'Vendor बनें'}</span>
              </Link>

              {/* Compact Language Selector */}
              <div className="hidden sm:block">
                <LanguageSwitcher isDark={navTransparent} />
              </div>

              {/* Authentication Hierarchy */}
              {!isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`text-xs xl:text-sm font-bold uppercase tracking-wider px-3 py-2 transition-colors ${
                      navTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-[#C2185B]'
                    }`}
                  >
                    {isEnglish ? 'Login' : 'लॉगिन'}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#C2185B] hover:bg-[#8E244D] text-white text-xs xl:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    {isEnglish ? 'Register' : 'रजिस्टर'}
                  </Link>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  {/* Cart */}
                  <Link
                    to="/cart"
                    className={`relative p-2.5 rounded-xl transition-all active:scale-95 group ${
                      navTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-pink-50'
                    }`}
                  >
                    <FiShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                    {cartItems.length > 0 && (
                      <span className="absolute top-1 right-1 bg-primary-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
                      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                      aria-expanded={notifOpen}
                      aria-haspopup="true"
                      className={`relative p-3 rounded-xl transition-all active:scale-95 border ${
                        navTransparent ? 'text-white border-white/20 hover:bg-white/10' : 'text-gray-500 border-gray-100 hover:bg-pink-50 hover:text-primary-600'
                      }`}
                    >
                      <FiBell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 bg-primary-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm ring-2 ring-white animate-bounce" aria-hidden="true">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-14 w-[min(92vw,24rem)] bg-white rounded-[2rem] shadow-premium border border-pink-50 overflow-hidden z-50"
                        >
                          <div className="flex items-center justify-between px-6 py-4 border-b border-pink-50 bg-[#FFF8F0]/50">
                            <span className="font-display font-black text-gray-900 text-sm">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="bg-primary-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {unreadCount} New
                              </span>
                            )}
                          </div>
                          <div className="max-h-72 overflow-y-auto p-4">
                            {notifications.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-6">No notifications</p>
                            ) : (
                              notifications.slice(0, 6).map((n, i) => (
                                <div key={i} className="p-3 border-b border-gray-50 last:border-0">
                                  <p className="text-xs font-bold text-gray-800">{n.title || n.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Profile Dropdown Button */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }}
                      className={`flex items-center gap-2 p-1.5 pl-2 rounded-2xl border transition-all active:scale-95 ${
                        navTransparent
                          ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#8E244D] flex items-center justify-center text-white text-xs font-black">
                        {getInitials(user?.name)}
                      </div>
                      <FiChevronDown size={14} className={userMenuOpen ? 'rotate-180' : ''} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-14 w-60 bg-[#FDFCF8] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-4 bg-[#FFF8F0]/70 border-b border-gray-100">
                            <p className="font-bold text-gray-900 text-xs truncate">{user?.name}</p>
                            <p className="text-[10px] text-[#D4AF37] font-black uppercase mt-0.5">{user?.role}</p>
                          </div>
                          <div className="p-2 space-y-1">
                            {[
                              { to: getDashboardLink(), icon: <FiHome />, label: isEnglish ? 'Dashboard' : 'डैशबोर्ड' },
                              { to: '/profile', icon: <FiUser />, label: isEnglish ? 'Profile' : 'प्रोफाइल' },
                              { to: '/bookings', icon: <FiCalendar />, label: isEnglish ? 'Bookings' : 'मेरी बुकिंग' },
                              { to: '/wishlist', icon: <FiHeart />, label: isEnglish ? 'Wishlist' : 'पसंद' },
                              { to: '/chat', icon: <FiMessageCircle />, label: isEnglish ? 'Messages' : 'संदेश' },
                            ].map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-pink-50 hover:text-[#C2185B] transition-colors"
                              >
                                <span className="text-gray-400">{item.icon}</span>
                                <span>{item.label}</span>
                              </Link>
                            ))}
                            <div className="h-px bg-gray-100 my-1 mx-2" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <FiLogOut className="text-red-400" />
                              <span>{isEnglish ? 'Sign Out' : 'लॉग-आउट'}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ── Mobile Hamburger Button ONLY (ZERO duplicate Login/Register in top bar!) ── */}
              <div className="flex lg:hidden items-center">
                <button
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-drawer"
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-95 border ${
                    navTransparent
                      ? 'text-white border-white/20 bg-white/10'
                      : 'text-gray-900 border-gray-200 bg-gray-50'
                  }`}
                >
                  <FiMenu size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Right-Side Drawer (< lg:hidden) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
              aria-hidden="true"
            />
            <motion.div
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[340px] bg-[#FDFCF8] rounded-l-3xl z-[120] shadow-[-10px_0_40px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col pt-safe pb-safe"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                <div className="transform scale-90 origin-left">
                  <BrandLogo asLink={false} showTagline={false} />
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 active:scale-95 transition-all"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Language Selector in Drawer */}
              <div className="p-4 border-b border-gray-100 bg-white/60">
                <LanguageSwitcher isMobile={true} />
              </div>

              {/* Drawer Navigation List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === '/' ? 'bg-pink-50 text-[#C2185B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiHome size={18} className="text-[#C2185B]" />
                  <span>{isEnglish ? 'Home' : 'होम'}</span>
                </Link>

                <Link
                  to="/services"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === '/services' ? 'bg-pink-50 text-[#C2185B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiSearch size={18} className="text-[#C2185B]" />
                  <span>{isEnglish ? 'Find Vendors' : 'Vendor खोजें'}</span>
                </Link>

                {/* Collapsible Tools Menu */}
                <div className="flex flex-col">
                  <button
                    onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                    className="flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all w-full"
                  >
                    <div className="flex items-center gap-3">
                      <FiGrid size={18} className="text-[#D4AF37]" />
                      <span>{isEnglish ? 'Tools' : 'टूल्स'}</span>
                    </div>
                    <FiChevronDown className={`transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileToolsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-9 border-l-2 border-pink-100 pl-3 flex flex-col gap-1 mt-1"
                      >
                        {toolsMenu.children.map(child => (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => setMobileOpen(false)}
                            className="text-xs font-bold text-gray-600 hover:text-[#C2185B] py-2 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/packages"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === '/packages' ? 'bg-pink-50 text-[#C2185B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiBriefcase size={18} className="text-[#C2185B]" />
                  <span>{isEnglish ? 'Wedding Packages' : 'वेडिंग पैकेज'}</span>
                </Link>

                <Link
                  to="/baraat-cabs"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === '/baraat-cabs' ? 'bg-pink-50 text-[#C2185B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">🚗</span>
                  <span>{isEnglish ? 'Baraat Ride' : 'बारात राइड'}</span>
                </Link>

                <div className="h-px bg-gray-200 my-2" />

                <Link
                  to="/register/vendor"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-[#FFF8F0] text-[#D4AF37] border border-[#D4AF37]/20 transition-all"
                >
                  <FiBriefcase size={18} />
                  <span>{isEnglish ? 'Become a Vendor' : 'Vendor बनें'}</span>
                </Link>
              </div>

              {/* Drawer Bottom Action Section */}
              <div className="p-4 border-t border-gray-100 bg-white">
                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
                    >
                      {isEnglish ? 'Login' : 'लॉगिन'}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#C2185B] hover:bg-[#8E244D] shadow-md transition-all text-center"
                    >
                      {isEnglish ? 'Register' : 'रजिस्टर'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#8E244D] flex items-center justify-center text-white text-xs font-black">
                        {getInitials(user?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-xs truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                    >
                      <FiLogOut />
                      <span>{isEnglish ? 'Sign Out' : 'लॉग-आउट'}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
