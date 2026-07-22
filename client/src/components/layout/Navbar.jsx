import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { fetchNotifications, markAllRead, markSingleRead } from '../../store/slices/notificationSlice'
import { getInitials, timeAgo } from '../../utils/helpers'
import { FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiShoppingCart, FiBell, FiHome, FiGrid, FiMessageCircle, FiChevronDown, FiBriefcase, FiCalendar, FiSearch } from 'react-icons/fi';
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

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('mobile-drawer-open');
    } else {
      document.body.classList.remove('mobile-drawer-open');
    }
    return () => {
      document.body.classList.remove('mobile-drawer-open');
    };
  }, [mobileOpen]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/')
    setUserMenuOpen(false)
    setMobileOpen(false)
  }, [dispatch, navigate])

  const navTransparent = isHome && !scrolled

  const toolsMenu = {
    label: 'Tools',
    icon: <FiGrid />,
    children: [
      { to: '/tools', label: '🛠 All Tools Hub' },
      { to: '/tools/ai-planner', label: '🤖 AI Wedding Planner' },
      { to: '/tools/budget-planner', label: '💰 Budget Planner' },
      { to: '/tools/guest-manager', label: '👥 Guest List Manager' },
      { to: '/tools/checklist', label: '✅ Wedding Checklist' },
      { to: '/tools/vendor-availability', label: '📍 Vendor Availability' },
      { to: '/tools/package-builder', label: '📦 Package Builder' },
      { to: '/tools/invitation-generator', label: '💌 Invitation Generator' },
      { to: '/tools/vendor-compare', label: '⚖ Vendor Comparison' },
      { to: '/tools/baraat-calculator', label: '🚘 Baraat Fleet Calculator' },
      { to: '/tools/cost-predictor', label: '📈 Wedding Cost Predictor' }
    ]
  };

  const publicLinks = [
    { to: '/services', label: 'Vendor खोजें', icon: <FiSearch /> },
    toolsMenu,
    { to: '/baraat-cabs', label: '🚗 Baraat Ride', icon: '🚗' },
  ]

  const navLinks = !isAuthenticated
    ? publicLinks
    : user?.role === 'admin'
      ? [
        { to: '/admin', label: 'ShaadiSaathi Admin' },
        { to: '/admin/vendors', label: 'Vendors' },
        { to: '/admin/users', label: 'Users' },
        toolsMenu,
      ]
      : user?.role === 'vendor'
        ? [
          { to: '/vendor/dashboard', label: 'मेरा Business' },
          { to: '/vendor/services', label: 'My Services' },
          { to: '/vendor/bookings', label: 'Bookings' },
          toolsMenu,
        ]
        : [
          { to: '/dashboard', label: 'मेरी शादी' },
          { to: '/bookings', label: 'मेरी बुकिंग' },
          { to: '/wishlist', label: 'पसंद में जोड़ें' },
          toolsMenu,
          { to: '/baraat-cabs', label: '🚗 Baraat Ride' },
        ]

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin'
    if (user?.role === 'vendor') return '/vendor/dashboard'
    return '/dashboard'
  }

  const handlePreloadBaraatCabs = useCallback(() => {
    // 1. Preload the React Component Chunk
    preloadBaraatCabsChunk().catch(() => { });

    // 2. Preload the initial API data (if not already cached)
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
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${navTransparent ? 'bg-transparent py-0' : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-pink-50/50 py-0'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 md:gap-4 h-[72px]">
            {/* ── Logo ── */}
            <div className="flex-shrink-1 min-w-0 max-w-[65%] md:max-w-full flex items-center">
              <BrandLogo
                isDark={navTransparent}
                onClick={() => setMobileOpen(false)}
              />
            </div>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => {
                const isCabs = link.to === '/baraat-cabs';

                if (link.children) {
                  return (
                    <div key={link.label} className="relative group">
                      <button
                        className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 flex items-center gap-2 ${navTransparent ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-primary-600'
                          }`}
                      >
                        {link.icon} {link.label} <FiChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                      </button>
                      <div className="absolute top-full left-0 mt-2 w-48 lg:w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-[#D4AF37]/20 p-2">
                          {link.children.map(child => (
                            <Link
                              key={child.to}
                              to={child.to}
                              className="flex flex-col gap-1 p-3 rounded-xl hover:bg-[#FFF8F0] transition-colors group/item"
                            >
                              <span className="text-sm font-black text-gray-900 group-hover/item:text-[#C2185B] transition-colors flex items-center gap-2">{child.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onMouseEnter={isCabs ? handlePreloadBaraatCabs : undefined}
                    className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 relative group flex items-center gap-2 ${isCabs
                      ? (navTransparent ? 'bg-white/10 text-white border border-white/30' : 'bg-[#FFF8F0] text-primary-600 border border-gold-200 shadow-sm hover:shadow-md')
                      : (navTransparent ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-primary-600')
                      } ${location.pathname === link.to ? (navTransparent ? 'text-white bg-white/20' : 'text-primary-600 bg-pink-50') : ''}`}
                  >
                    {isCabs && <span className="text-sm animate-pulse">🚗</span>}
                    {link.label}
                    {!isCabs && (
                      <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-[#D4AF37] transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${location.pathname === link.to ? 'scale-x-100' : ''}`} />
                    )}
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <Link
                  to="/register/vendor"
                  className={`ml-4 px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 ${navTransparent
                    ? 'bg-white text-primary-600 hover:bg-gold-50'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                >
                  <FiBriefcase size={14} />
                  Vendor बनें
                </Link>
              )}
            </div>

            {/* ── Right Side Actions ── */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Switcher */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* ── Mobile Actions (Login/Profile & Hamburger) ── */}
              <div className="flex lg:hidden items-center gap-2">
                {isAuthenticated ? (
                  <Link to={user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} className={`flex items-center justify-center w-[40px] h-[40px] rounded-full border shadow-sm transition-all active:scale-95 ${navTransparent ? 'border-white/20 bg-white/20 text-white' : 'border-gray-200 bg-gray-50'}`}>
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-[36px] h-[36px] rounded-full object-cover" />
                    ) : (
                      <span className="text-[11px] font-black">{getInitials(user?.name)}</span>
                    )}
                  </Link>
                ) : (
                  <Link to="/login" className={`flex items-center justify-center h-12 min-h-[48px] text-[11px] font-black uppercase tracking-wider px-5 rounded-xl transition-all border ${navTransparent ? 'text-white border-white/30 bg-white/10' : 'text-primary-600 border-primary-100 bg-pink-50'}`}>
                    Login
                  </Link>
                )}

                <button
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-drawer"
                  className={`w-[44px] h-[44px] flex items-center justify-center rounded-xl transition-all active:scale-95 border ${navTransparent ? 'text-white border-white/20 bg-white/10' : 'text-gray-900 border-gray-200 bg-gray-50'}`}
                >
                  <FiMenu size={20} />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-4">
                  {/* Cart */}
                  <Link to="/cart" className={`relative p-2.5 rounded-xl transition-all active:scale-95 group ${navTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-pink-50'}`}>
                    <FiShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                    {cartItems.length > 0 && <span className="absolute top-1 right-1 bg-primary-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white">{cartItems.length}</span>}
                  </Link>

                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
                      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                      aria-expanded={notifOpen}
                      aria-haspopup="true"
                      className={`relative p-3 rounded-xl transition-all active:scale-95 border ${navTransparent ? 'text-white border-white/20 hover:bg-white/10' : 'text-gray-500 border-gray-100 hover:bg-pink-50 hover:text-primary-600'}`}
                    >
                      <FiBell size={18} />
                      {unreadCount > 0 && <span className="absolute top-2 right-2 bg-primary-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm ring-2 ring-white animate-bounce" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>

                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-16 w-[min(92vw,24rem)] bg-white rounded-[2rem] shadow-premium border border-pink-50 overflow-hidden z-50">
                          <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />
                          <div className="flex items-center justify-between px-6 py-5 border-b border-pink-50 bg-[#FFF8F0]/50 relative z-10">
                            <h3 className="font-display font-black text-lg text-gray-900">Notifications</h3>
                            {unreadCount > 0 && <button onClick={() => dispatch(markAllRead())} className="text-[9px] font-black text-primary-600 uppercase tracking-widest italic">Mark all Read</button>}
                          </div>
                          <div className="max-h-[350px] overflow-y-auto relative z-10 scrollbar-hide">
                            {notifications.length === 0 ? (
                              <div className="text-center py-12 text-gray-400">
                                <FiBell size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-xs font-medium italic">No new alerts</p>
                              </div>
                            ) : (
                              notifications.slice(0, 8).map((n) => (
                                <div
                                  key={n._id}
                                  onClick={() => {
                                    if (!n.isRead) {
                                      dispatch(markSingleRead(n._id))
                                    }
                                    if (n.link) {
                                      navigate(n.link)
                                    } else {
                                      navigate('/dashboard')
                                    }
                                    setNotifOpen(false)
                                  }}
                                  className={`px-6 py-4 hover:bg-[#FFF8F0]/30 transition-all duration-200 border-b border-pink-50 last:border-0 cursor-pointer flex gap-3 items-start relative group ${!n.isRead ? 'bg-primary-50/20' : ''}`}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-black text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{n.title}</p>
                                      {!n.isRead && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(markSingleRead(n._id));
                                          }}
                                          className="w-2 h-2 rounded-full bg-primary-600 self-center shadow-sm"
                                          title="Mark as read"
                                        />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed line-clamp-2">{n.message}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37] mt-2">{timeAgo(n.createdAt)}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Menu */}
                  <div className="relative hidden sm:block" ref={userMenuRef}>
                    <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }} className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all border shadow-sm ${navTransparent ? 'border-white/20 bg-white/10 text-white hover:bg-white/20' : 'border-gray-100 bg-white hover:bg-pink-50'}`}>
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#8E244D] flex items-center justify-center text-white text-[10px] font-black">
                          {getInitials(user?.name)}
                        </div>
                      )}
                      <FiChevronDown size={14} className={`${navTransparent ? 'text-white/80' : 'text-gray-400'} ${userMenuOpen ? 'rotate-180' : ''} transition-transform hidden sm:block`} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(194,24,91,0.2)] border border-white overflow-hidden z-50">
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
                            <p className="font-black text-gray-900 text-xs truncate">{user?.name}</p>
                            <p className="text-[9px] font-bold text-primary-600 uppercase tracking-widest mt-1">{user?.role}</p>
                          </div>
                          <div className="p-1.5">
                            {[
                              { to: getDashboardLink(), icon: <FiHome />, label: 'Dashboard' },
                              { to: '/profile', icon: <FiUser />, label: 'Profile' },
                              { to: '/bookings', icon: <FiCalendar />, label: 'Bookings' },
                              { to: '/wishlist', icon: <FiHeart />, label: 'Wishlist' },
                              { to: '/chat', icon: <FiMessageCircle />, label: 'Messages' },
                            ].map((item) => (
                              <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-pink-50 hover:text-primary-600 transition-colors">
                                <span className="text-gray-400">{item.icon}</span>{item.label}
                              </Link>
                            ))}
                            <div className="h-px bg-gray-100 my-1.5 mx-3" />
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors">
                              <FiLogOut className="text-red-400" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/login" className={`text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all ${navTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>{t('auth.login', 'Login')}</Link>
                  <Link to="/register" className={`bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg hover:bg-primary-700 transition-all hover:scale-105 active:scale-95`}>{t('auth.register', 'Join')}</Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" aria-hidden="true" />
            <motion.div id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[20rem] bg-white/95 backdrop-blur-2xl rounded-l-[2.5rem] z-[120] shadow-[0_0_60px_rgba(194,24,91,0.15)] overflow-hidden flex flex-col border-l border-white/50 pt-safe pb-safe">
              <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />

              <div className="p-5 flex items-center justify-between border-b border-pink-50 relative z-10 pt-safe">
                <div className="transform scale-[0.8] origin-left">
                  <BrandLogo asLink={false} />
                </div>
                <button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="p-3 bg-gray-100 rounded-xl text-gray-500 active:scale-90 transition-transform">
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 relative z-10 scrollbar-hide flex flex-col gap-4">
                {!isAuthenticated ? (
                  // Public Navigation
                  <div className="space-y-2">
                    {[
                      { to: '/', label: 'Home', icon: <FiHome /> },
                      { to: '/services', label: 'Vendor खोजें', icon: <FiGrid /> },
                      {
                        label: 'Tools',
                        icon: <FiGrid />,
                        children: [
                          { to: '/tools', label: '🛠 All Tools Hub' },
                          { to: '/tools/ai-planner', label: '🤖 AI Wedding Planner' },
                          { to: '/tools/budget-planner', label: '💰 Budget Planner' },
                          { to: '/tools/guest-manager', label: '👥 Guest List Manager' },
                          { to: '/tools/checklist', label: '✅ Wedding Checklist' },
                          { to: '/tools/vendor-availability', label: '📍 Vendor Availability' },
                          { to: '/tools/package-builder', label: '📦 Package Builder' },
                          { to: '/tools/invitation-generator', label: '💌 Invitation Generator' },
                          { to: '/tools/vendor-compare', label: '⚖ Vendor Comparison' },
                          { to: '/tools/baraat-calculator', label: '🚘 Baraat Fleet Calculator' },
                          { to: '/tools/cost-predictor', label: '📈 Wedding Cost Predictor' }
                        ]
                      },
                      { to: '/packages', label: 'Wedding Packages', icon: <FiBriefcase /> },
                      { to: '/baraat-cabs', label: '🚗 Baraat Ride', icon: <FiSearch /> }
                    ].map((link) => {
                      if (link.children) {
                        return (
                          <div key={link.label} className="flex flex-col">
                            <button onClick={() => setMobileToolsOpen(!mobileToolsOpen)} className="flex justify-between items-center px-4 py-3 min-h-[48px] rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all w-full active:scale-[0.98]">
                              <div className="flex items-center gap-4">
                                <span className="text-xl text-gray-400">{link.icon}</span>
                                {link.label}
                              </div>
                              <FiChevronDown className={`transition-transform duration-300 ${mobileToolsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {mobileToolsOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden ml-12 border-l-2 border-pink-50 pl-4 flex flex-col gap-2 mt-2">
                                  {link.children.map(child => (
                                    <Link key={child.to} to={child.to} onClick={() => setMobileOpen(false)} className="text-sm font-bold text-gray-600 hover:text-[#C2185B] py-2 transition-colors">
                                      {child.label}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      }
                      return (
                        <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-4 px-4 py-3 min-h-[48px] rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${location.pathname === link.to ? 'bg-pink-50 text-[#C2185B]' : 'text-gray-600 hover:bg-gray-50'}`}>
                          <span className={`text-xl ${location.pathname === link.to ? 'text-[#C2185B]' : 'text-gray-400'}`}>{link.icon}</span>
                          {link.label}
                        </Link>
                      )
                    })}

                    <Link to="/register/vendor" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-5 py-4 mt-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#D4AF37]/10 to-transparent text-[#D4AF37] border border-[#D4AF37]/20">
                      <span className="text-xl">🏪</span>
                      Vendor बनें
                    </Link>
                    <div className="mt-4 px-2">
                      <LanguageSwitcher isMobile={true} />
                    </div>
                  </div>
                ) : (
                  // Authenticated Navigation
                  <div className="flex flex-col gap-6">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-br from-[#FFF8F0] to-white p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-[#D4AF37]/20 shadow-sm flex items-center gap-3 sm:gap-4">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.2rem] object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.2rem] bg-gradient-to-br from-[#C2185B] to-[#8E244D] flex items-center justify-center text-white text-base sm:text-lg font-black shadow-sm">
                          {getInitials(user?.name)}
                        </div>
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-display font-black text-sm sm:text-[15px] text-gray-900 truncate block">{user?.name}</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 truncate block">{user?.email}</span>
                        <div className="mt-1">
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest">{user?.role === 'admin' ? 'System Admin' : user?.role === 'vendor' ? 'Vendor Partner' : 'Couple'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shortcut Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {user?.role === 'user' && (
                        <>
                          <Link to="/bookings" onClick={() => setMobileOpen(false)} className="bg-pink-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#C2185B] active:scale-95 transition-transform border border-pink-100/50">
                            <FiCalendar size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">मेरी बुकिंग</span>
                          </Link>
                          <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="bg-pink-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#C2185B] active:scale-95 transition-transform border border-pink-100/50">
                            <FiHeart size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">पसंद में जोड़ें</span>
                          </Link>
                        </>
                      )}
                      {user?.role === 'vendor' && (
                        <>
                          <Link to="/vendor/bookings" onClick={() => setMobileOpen(false)} className="bg-pink-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#C2185B] active:scale-95 transition-transform border border-pink-100/50">
                            <FiCalendar size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Bookings</span>
                          </Link>
                          <Link to="/vendor/earnings" onClick={() => setMobileOpen(false)} className="bg-[#FFF8F0] p-3 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#D4AF37] active:scale-95 transition-transform border border-[#D4AF37]/20">
                            <FiBriefcase size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Earnings</span>
                          </Link>
                        </>
                      )}
                      {user?.role === 'admin' && (
                        <>
                          <Link to="/admin/vendors" onClick={() => setMobileOpen(false)} className="bg-gray-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-700 active:scale-95 transition-transform border border-gray-200">
                            <FiBriefcase size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Vendors</span>
                          </Link>
                          <Link to="/admin/users" onClick={() => setMobileOpen(false)} className="bg-gray-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-700 active:scale-95 transition-transform border border-gray-200">
                            <FiUser size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Users</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Role Navigation List */}
                    <div className="space-y-1">
                      {user?.role === 'admin' ? (
                        [
                          { to: '/admin', label: 'Admin Dashboard', icon: <FiHome /> },
                          { to: '/admin/users', label: 'Users', icon: <FiUser /> },
                          { to: '/admin/vendors', label: 'Vendors', icon: <FiBriefcase /> },
                          { to: '/admin/bookings', label: 'Bookings', icon: <FiCalendar /> },
                          { to: '/admin/service-moderation', label: 'Services Approval', icon: <FiGrid /> },
                          { to: '/admin/categories', label: 'Categories', icon: <FiGrid /> },
                          { to: '/admin/reviews', label: 'Reviews', icon: <FiMessageCircle /> },
                          { to: '/admin/leads', label: 'Leads', icon: <FiSearch /> },
                          { to: '/admin/settings', label: 'Settings', icon: <FiUser /> },
                        ].map((link) => (
                          <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-4 px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${location.pathname === link.to ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className={`text-[18px] ${location.pathname === link.to ? 'text-gray-900' : 'text-gray-400'}`}>{link.icon}</span>
                            {link.label}
                          </Link>
                        ))
                      ) : user?.role === 'vendor' ? (
                        [
                          { to: '/vendor/dashboard', label: 'Vendor Dashboard', icon: <FiHome /> },
                          { to: '/vendor/services', label: 'My Services', icon: <FiGrid /> },
                          { to: '/vendor/bookings', label: 'My Bookings', icon: <FiCalendar /> },
                          { to: '/vendor/calendar', label: 'Calendar', icon: <FiCalendar /> },
                          { to: '/vendor/earnings', label: 'Earnings', icon: <FiBriefcase /> },
                          { to: '/vendor/reviews', label: 'Reviews', icon: <FiMessageCircle /> },
                          { to: '/vendor/gallery', label: 'Gallery', icon: <FiGrid /> },
                          { to: '/vendor-subscription', label: 'Subscription', icon: <FiBriefcase /> },
                          { to: '/vendor/settings', label: 'Settings', icon: <FiUser /> },
                        ].map((link) => (
                          <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-4 px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${location.pathname === link.to ? 'bg-pink-50 text-[#C2185B]' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className={`text-[18px] ${location.pathname === link.to ? 'text-[#C2185B]' : 'text-gray-400'}`}>{link.icon}</span>
                            {link.label}
                          </Link>
                        ))
                      ) : (
                        [
                          { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
                          { to: '/profile', label: 'My Profile', icon: <FiUser /> },
                          { to: '/bookings', label: 'My Bookings', icon: <FiCalendar /> },
                          { to: '/wishlist', label: 'Wishlist', icon: <FiHeart /> },
                          { to: '/tools/ai-planner', label: 'Wedding Planner', icon: <FiGrid /> },
                          { to: '/invitation-creator', label: 'Invitations', icon: <FiMessageCircle /> },
                          { to: '/settings', label: 'Settings', icon: <FiUser /> },
                        ].map((link) => (
                          <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-4 px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${location.pathname === link.to ? 'bg-pink-50 text-[#C2185B]' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className={`text-[18px] ${location.pathname === link.to ? 'text-[#C2185B]' : 'text-gray-400'}`}>{link.icon}</span>
                            {link.label}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-pink-50 relative z-10 bg-gray-50 pb-safe">
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-center text-gray-700 bg-white border border-gray-200 shadow-sm active:scale-95 transition-all">{t('auth.login', 'Login')}</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-center text-white bg-primary-600 shadow-lg shadow-primary-900/20 active:scale-95 transition-all">{t('auth.register', 'Join')}</Link>
                  </div>
                ) : (
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 min-h-[48px] rounded-2xl text-sm font-bold text-red-600 bg-white border border-red-50 shadow-sm active:scale-95 transition-all">
                    <FiLogOut /> {t('auth.logout', 'Sign Out')}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

