import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { getInitials } from '../../utils/helpers';
import {
  FiMenu, FiX, FiUser, FiLogOut, FiBell,
  FiChevronDown, FiCalendar, FiSearch, FiGrid,
  FiCamera, FiCoffee, FiStar, FiMapPin, FiMusic, FiGift, FiBriefcase,
  FiExternalLink, FiMessageSquare,
  FiDollarSign, FiUsers, FiLayers,
  FiCheckCircle, FiShield
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { apiCache } from '../../utils/apiCache';
import BrandLogo from '../common/BrandLogo';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useMobileNavScroll } from '../../hooks/useMobileNavScroll';

// Preload Baraat Ride chunk on hover
const preloadBaraatCabsChunk = () => import('../../pages/BaraatCabsPage').catch(() => { });

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((s) => s.auth || {});
  const { items: notifications = [], unreadCount = 0 } = useSelector((s) => s.notifications || {});

  // Mobile drawer and accordion states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileVendorsOpen, setMobileVendorsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  // Desktop dropdown states
  const [desktopVendorsOpen, setDesktopVendorsOpen] = useState(false);
  const [desktopToolsOpen, setDesktopToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Scroll detection hook
  const { isNavHidden, isScrolled: scrolled } = useMobileNavScroll({
    disabled: mobileOpen || desktopVendorsOpen || desktopToolsOpen || userMenuOpen || notifOpen
  });

  // DOM Refs for click outside
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const desktopVendorsRef = useRef(null);
  const desktopToolsRef = useRef(null);

  const isHome = location.pathname === '/';
  const { t, i18n } = useTranslation?.() || {
    t: (key, fallback) => fallback || key,
    i18n: { language: 'en', changeLanguage: () => { } }
  };

  // Fetch notifications on auth
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (mobileOpen) document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileOpen]);

  // Close all open popovers/drawers on route changes
  useEffect(() => {
    setMobileOpen(false);
    setDesktopVendorsOpen(false);
    setDesktopToolsOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Click outside detection for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (desktopVendorsRef.current && !desktopVendorsRef.current.contains(e.target)) setDesktopVendorsOpen(false);
      if (desktopToolsRef.current && !desktopToolsRef.current.contains(e.target)) setDesktopToolsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    toast.success(t('auth.logoutSuccess', 'Logged out successfully'));
    navigate('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [dispatch, navigate, t]);

  const handlePreloadBaraatCabs = useCallback(() => {
    preloadBaraatCabsChunk();
    const cacheKey = `/fleet/browse?`;
    if (!apiCache.has(cacheKey)) {
      api.get(cacheKey).then((res) => {
        if (res.data?.status === 'success') {
          apiCache.set(cacheKey, res.data);
        }
      }).catch(() => { });
    }
  }, []);

  // Transparent header state for homepage hero
  const navTransparent = isHome && !scrolled;

  // ── 1. Vendor Categories Dropdown Data ──
  const vendorCategories = useMemo(() => [
    { to: '/services?category=photography', label: t('vendors.photography', 'Photography & Cinema'), desc: 'Pre-wedding, candid & drone shoots', icon: <FiCamera className="text-sky-600" /> },
    { to: '/services?category=catering', label: t('vendors.catering', 'Catering & Banquets'), desc: 'Multi-cuisine wedding buffets & live counters', icon: <FiCoffee className="text-amber-600" /> },
    { to: '/services?category=decoration', label: t('vendors.decoration', 'Decor & Floral Design'), desc: 'Mandap, entrance & thematic stage decor', icon: <FiStar className="text-rose-500" /> },
    { to: '/services?category=venue', label: t('vendors.venue', 'Wedding Venues & Resorts'), desc: 'Palaces, lawns, heritage halls & banquets', icon: <FiMapPin className="text-emerald-600" /> },
    { to: '/services?category=makeup', label: t('vendors.makeup', 'Bridal Makeup & Hair'), desc: 'HD bridal styling, draping & party glam', icon: <FiUser className="text-pink-500" /> },
    { to: '/services?category=dj', label: t('vendors.dj', 'DJ, Music & Dhol'), desc: 'Live sangeet bands, sound & wedding dhol', icon: <FiMusic className="text-indigo-600" /> },
    { to: '/services?category=mehndi', label: t('vendors.mehndi', 'Mehndi Artists'), desc: 'Bridal, Marwari, Arabic & customized henna', icon: <FiGift className="text-orange-500" /> },
    { to: '/services?category=tent-house', label: t('vendors.tent', 'Tent & Lighting House'), desc: 'Grand royal shamianas & ambient lighting', icon: <FiLayers className="text-cyan-600" /> }
  ], [t]);

  // ── 2. Active Wedding Tools Data (NO removed features) ──
  const weddingToolsGroups = useMemo(() => [
    {
      group: 'AI & Smart Planning',
      items: [
        { to: '/tools/ai-planner', label: t('tools.aiPlanner', 'AI Wedding Planner'), desc: 'Complete personalized plan in 60s', icon: '🪄', badge: 'AI' },
        { to: '/tools/wedding-timeline', label: t('tools.timeline', 'Wedding Timeline'), desc: 'Ritual schedules & event tracker', icon: '📅' },
        { to: '/tools/budget-planner', label: t('tools.budget', 'Budget Planner'), desc: 'Track wedding expenses & estimates', icon: '💰' }
      ]
    },
    {
      group: 'Traditions & Coordination',
      items: [
        { to: '/tools/shubh-muhurat', label: t('tools.muhurat', 'Shubh Muhurat Finder'), desc: 'Auspicious wedding dates & times', icon: '✨' },
        { to: '/tools/kundli-matching', label: t('tools.kundli', 'Kundli Matching'), desc: 'Gun Milan & Vedic compatibility', icon: '💫' },
        { to: '/tools/guest-manager', label: t('tools.guests', 'Guest Manager & RSVP'), desc: 'Organize invitations & confirmations', icon: '👥' }
      ]
    },
    {
      group: 'Invitations & Advice',
      items: [
        { to: '/invitation-creator/new', label: t('tools.invitations', 'Digital E-Invitations'), desc: 'Create & share WhatsApp wedding cards', icon: '💌', badge: 'Free' },
        { to: '/expert-consultation', label: t('tools.expert', 'Expert Consultation'), desc: '1-on-1 wedding specialist advice', icon: '🧑‍💼' }
      ]
    }
  ], [t]);

  // Flattened tools for mobile
  const allWeddingTools = useMemo(() => {
    return weddingToolsGroups.flatMap(g => g.items);
  }, [weddingToolsGroups]);

  // Role based helper
  const roleLabel = useMemo(() => {
    if (user?.role === 'admin') return 'Super Admin';
    if (user?.role === 'vendor') return 'Verified Vendor';
    return 'Couple / Family';
  }, [user?.role]);

  return (
    <>
      <header
        role="banner"
        style={{
          transform: isNavHidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
        }}
        className={`fixed top-0 left-0 w-full z-[100] select-none ${navTransparent
            ? 'bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-transparent border-b border-white/10'
            : 'bg-white/95 backdrop-blur-xl border-b border-sky-100/70 shadow-[0_4px_25px_rgba(2,132,199,0.05)]'
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between h-[66px] sm:h-[70px]">

            {/* ══════════════ LEFT: Brand Logo Area ══════════════ */}
            <div className="flex-shrink-0 flex items-center">
              <BrandLogo
                isDark={navTransparent}
                onClick={() => setMobileOpen(false)}
                showTagline={true}
                taglineText={i18n.language === 'en' ? 'Bihar\'s Trusted Shaadi App' : 'शादी का सच्चा साथी'}
              />
            </div>

            {/* ══════════════ CENTER: Desktop Navigation ══════════════ */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3" aria-label="Main Navigation">

              {/* 1. Vendors Dropdown */}
              <div
                className="relative"
                ref={desktopVendorsRef}
                onMouseEnter={() => setDesktopVendorsOpen(true)}
                onMouseLeave={() => setDesktopVendorsOpen(false)}
              >
                <button
                  onClick={() => setDesktopVendorsOpen(!desktopVendorsOpen)}
                  aria-expanded={desktopVendorsOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs xl:text-sm font-bold tracking-tight transition-all ${location.pathname.startsWith('/services')
                      ? navTransparent
                        ? 'bg-white/15 text-white'
                        : 'bg-sky-50 text-sky-700 font-extrabold shadow-2xs'
                      : navTransparent
                        ? 'text-white/85 hover:text-white hover:bg-white/10'
                        : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50/60'
                    }`}
                >
                  <span>{t('nav.vendors', 'Vendors')}</span>
                  <FiChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${desktopVendorsOpen ? 'rotate-180 text-sky-600' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {desktopVendorsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[560px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(2,132,199,0.14)] border border-sky-100 overflow-hidden z-50 p-4"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 px-1">
                        <div>
                          <p className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                            <span className="text-sky-600">💍</span> Verified Wedding Categories
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">Browse verified photographers, caterers, venues & artists</p>
                        </div>
                        <Link
                          to="/services"
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/60"
                        >
                          All Categories <FiExternalLink size={11} />
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {vendorCategories.map((cat, idx) => (
                          <Link
                            key={idx}
                            to={cat.to}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50/70 border border-transparent hover:border-sky-100 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-sky-50 group-hover:bg-white text-base flex items-center justify-center transition-colors shadow-xs flex-shrink-0 mt-0.5 border border-sky-100/60">
                              {cat.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors leading-tight">
                                {cat.label}
                              </p>
                              <p className="text-[10.5px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                {cat.desc}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100/80 bg-slate-50/60 -mx-4 -mb-4 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <FiShield className="text-emerald-600" size={13} /> 100% Price & Quality Guarantee
                        </span>
                        <Link to="/services" className="text-xs font-extrabold text-sky-700 hover:underline">
                          View All Vendors →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Baraat Ride (🚗 Highlighted Luxury Pill) */}
              <Link
                to="/baraat-cabs"
                onMouseEnter={handlePreloadBaraatCabs}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs xl:text-sm font-extrabold tracking-tight transition-all border shadow-xs ${location.pathname === '/baraat-cabs'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-amber-500/20'
                    : navTransparent
                      ? 'bg-gradient-to-r from-amber-500/20 via-sky-400/20 to-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                      : 'bg-gradient-to-r from-sky-50 via-amber-50/60 to-sky-50 text-slate-900 border-sky-200/90 hover:border-amber-300 hover:shadow-sm'
                  }`}
              >
                <span className="text-sm">🚗</span>
                <span>{t('nav.baraatRide', 'Baraat Ride')}</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-md tracking-wider shadow-2xs">
                  VIP
                </span>
              </Link>

              {/* 3. Wedding Tools Dropdown (Active only) */}
              <div
                className="relative"
                ref={desktopToolsRef}
                onMouseEnter={() => setDesktopToolsOpen(true)}
                onMouseLeave={() => setDesktopToolsOpen(false)}
              >
                <button
                  onClick={() => setDesktopToolsOpen(!desktopToolsOpen)}
                  aria-expanded={desktopToolsOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs xl:text-sm font-bold tracking-tight transition-all ${location.pathname.startsWith('/tools') || location.pathname.startsWith('/invitation') || location.pathname.startsWith('/expert')
                      ? navTransparent
                        ? 'bg-white/15 text-white'
                        : 'bg-sky-50 text-sky-700 font-extrabold shadow-2xs'
                      : navTransparent
                        ? 'text-white/85 hover:text-white hover:bg-white/10'
                        : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50/60'
                    }`}
                >
                  <HiSparkles className="text-amber-500" size={15} />
                  <span>{t('nav.weddingTools', 'Wedding Tools')}</span>
                  <FiChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${desktopToolsOpen ? 'rotate-180 text-sky-600' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {desktopToolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[620px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(2,132,199,0.14)] border border-sky-100 overflow-hidden z-50 p-4"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 px-1">
                        <div>
                          <p className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                            <span className="text-amber-500">✨</span> Smart Wedding Planning Suite
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">Free digital tools to make your wedding hassle-free</p>
                        </div>
                        <Link
                          to="/tools"
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/60"
                        >
                          All Tools <FiExternalLink size={11} />
                        </Link>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {weddingToolsGroups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
                              {group.group}
                            </span>
                            <div className="space-y-1">
                              {group.items.map((tool, tIdx) => (
                                <Link
                                  key={tIdx}
                                  to={tool.to}
                                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-sky-50/70 border border-transparent hover:border-sky-100 transition-all group"
                                >
                                  <span className="text-base flex-shrink-0 mt-0.5">{tool.icon}</span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors leading-tight flex items-center gap-1">
                                      {tool.label}
                                      {tool.badge && (
                                        <span className="text-[8.5px] font-black bg-sky-100 text-sky-700 px-1 rounded">
                                          {tool.badge}
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                      {tool.desc}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 bg-sky-50/40 -mx-4 -mb-4 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[11px] text-slate-600 font-medium">
                          Need personalized help planning your wedding?
                        </span>
                        <Link to="/expert-consultation" className="text-xs font-extrabold text-sky-700 hover:underline">
                          Talk to Wedding Expert →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </nav>

            {/* ══════════════ RIGHT: Language & User Actions ══════════════ */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Vendor Fast Link (Desktop Guest) */}
              {!isAuthenticated && (
                <Link
                  to="/register/vendor"
                  className={`hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${navTransparent
                      ? 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/20'
                      : 'bg-sky-50/90 hover:bg-sky-100 text-sky-800 border-sky-200 shadow-2xs'
                    }`}
                >
                  <FiBriefcase size={13} className="text-sky-600" />
                  <span>{t('nav.becomeVendor', 'Become a Vendor')}</span>
                </Link>
              )}

              {/* Language Switcher (Desktop) */}
              <div className="hidden sm:block">
                <LanguageSwitcher isDark={navTransparent} />
              </div>

              {/* ── Guest Action Buttons ── */}
              {!isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className={`text-xs xl:text-sm font-bold tracking-tight px-3.5 py-2 rounded-full transition-all ${navTransparent
                        ? 'text-white hover:bg-white/15'
                        : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50'
                      }`}
                  >
                    {t('nav.login', 'Login')}
                  </Link>

                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-sky-600 via-sky-700 to-[#0369a1] hover:from-sky-700 hover:to-[#0284c7] text-white text-xs font-black tracking-wider uppercase px-4 xl:px-5 py-2.5 rounded-full shadow-[0_4px_15px_rgba(2,132,199,0.35)] transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span>{t('nav.getStarted', 'Get Started')}</span>
                    <span className="text-amber-300">✨</span>
                  </Link>
                </div>
              ) : (
                /* ── Authenticated User Navigation ── */
                <div className="flex items-center gap-2">

                  {/* Role Specific Fast Pill (Vendor / Admin) */}
                  {user?.role === 'vendor' && (
                    <Link
                      to="/vendor/dashboard"
                      className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                    >
                      <FiGrid size={13} className="text-amber-700" />
                      <span>Vendor Portal</span>
                    </Link>
                  )}

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200/80 hover:bg-purple-100 transition-colors"
                    >
                      <FiGrid size={13} className="text-purple-700" />
                      <span>Admin Hub</span>
                    </Link>
                  )}

                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => {
                        setNotifOpen(!notifOpen);
                        setUserMenuOpen(false);
                      }}
                      aria-label="View Notifications"
                      className={`relative p-2 sm:p-2.5 rounded-full transition-colors ${navTransparent
                          ? 'text-white hover:bg-white/15'
                          : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                        }`}
                    >
                      <FiBell size={19} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-[0_20px_50px_rgba(2,132,199,0.18)] border border-sky-100 overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-slate-100 bg-sky-50/50 flex justify-between items-center">
                            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                              <FiBell className="text-sky-600" /> Notifications
                            </span>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-50">
                            {notifications.length === 0 ? (
                              <div className="py-8 text-center">
                                <span className="text-2xl block mb-1">🔔</span>
                                <p className="text-xs font-semibold text-slate-400">No new notifications</p>
                              </div>
                            ) : (
                              notifications.slice(0, 6).map((n, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    if (n.link) navigate(n.link);
                                    setNotifOpen(false);
                                  }}
                                  className="p-3 hover:bg-sky-50/60 rounded-xl transition-colors cursor-pointer"
                                >
                                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{n.title || 'Notification'}</p>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Menu (Desktop) */}
                  <div className="relative hidden md:block" ref={userMenuRef}>
                    <button
                      onClick={() => {
                        setUserMenuOpen(!userMenuOpen);
                        setNotifOpen(false);
                      }}
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                      aria-label="User Profile Menu"
                      className={`flex items-center gap-2 p-1 pr-2.5 rounded-full border transition-all active:scale-95 ${navTransparent
                          ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                          : 'border-sky-200/80 bg-white text-slate-800 hover:border-sky-300 shadow-xs'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-600 via-sky-700 to-[#0369a1] text-white flex items-center justify-center text-xs font-black shadow-xs ring-1 ring-sky-300">
                        {getInitials(user?.name)}
                      </div>
                      <span className="text-xs font-bold truncate max-w-[100px] hidden xl:inline">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                      <FiChevronDown
                        size={13}
                        className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180 text-sky-600' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(2,132,199,0.18)] border border-sky-100 overflow-hidden z-50 p-2"
                        >
                          {/* User Header */}
                          <div className="px-3 py-2.5 mb-1.5 bg-sky-50/50 rounded-xl border border-sky-100/60">
                            <p className="font-extrabold text-slate-900 text-xs truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                            <span className="inline-block text-[9px] font-black text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-200/60 uppercase tracking-wider mt-1.5 shadow-2xs">
                              {roleLabel}
                            </span>
                          </div>

                          {/* Role Specific Navigation */}
                          {user?.role === 'admin' ? (
                            <div className="space-y-0.5">
                              <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiGrid size={14} className="text-sky-600" /> Admin Dashboard</Link>
                              <Link to="/admin/users" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiUsers size={14} className="text-sky-600" /> Manage Users</Link>
                              <Link to="/admin/vendors" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiBriefcase size={14} className="text-sky-600" /> Manage Vendors</Link>
                              <Link to="/admin/pending-approval" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiCheckCircle size={14} className="text-sky-600" /> Pending Approvals</Link>
                              <Link to="/admin/bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiCalendar size={14} className="text-sky-600" /> All Bookings</Link>
                            </div>
                          ) : user?.role === 'vendor' ? (
                            <div className="space-y-0.5">
                              <Link to="/vendor/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiGrid size={14} className="text-sky-600" /> Vendor Dashboard</Link>
                              <Link to="/vendor/services" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiSearch size={14} className="text-sky-600" /> My Services</Link>
                              <Link to="/vendor/bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiCalendar size={14} className="text-sky-600" /> Client Bookings</Link>
                              <Link to="/vendor/earnings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiDollarSign size={14} className="text-sky-600" /> Earnings & Payouts</Link>
                              <Link to="/vendor/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiMessageSquare size={14} className="text-sky-600" /> Inquiries & Chat</Link>
                              <Link to="/vendor/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiUser size={14} className="text-sky-600" /> Business Profile</Link>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiGrid size={14} className="text-sky-600" /> Wedding Dashboard</Link>
                              <Link to="/bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiCalendar size={14} className="text-sky-600" /> My Bookings</Link>
                              <Link to="/invitations" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiGift size={14} className="text-sky-600" /> My E-Invitations</Link>
                              <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"><FiUser size={14} className="text-sky-600" /> Profile Settings</Link>
                            </div>
                          )}

                          <div className="h-px bg-slate-100 my-1 mx-2" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <FiLogOut size={14} /> {t('auth.logout', 'Logout')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ── Mobile Hamburger Toggle ── */}
              <div className="flex lg:hidden items-center gap-1.5">
                <button
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open Navigation Menu"
                  className={`p-2 rounded-xl transition-all active:scale-95 ${navTransparent
                      ? 'text-white hover:bg-white/15'
                      : 'text-slate-800 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                >
                  <FiMenu size={24} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE SLIDE-IN DRAWER
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110]"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[88vw] max-w-[370px] bg-white z-[120] shadow-[-15px_0_40px_rgba(2,132,199,0.15)] flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-sky-100 bg-sky-50/30">
                <BrandLogo
                  asLink={false}
                  showTagline={true}
                  taglineText="शादी का सच्चा साथी"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-full bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200/80 shadow-xs"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="px-5 py-3 border-b border-slate-100 bg-white">
                <LanguageSwitcher isMobile={true} onSelect={() => { }} />
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 divide-y divide-slate-100/80">

                {/* 1. Primary Links */}
                <div className="space-y-1 pb-2">

                  {/* Vendors Accordion */}
                  <div>
                    <button
                      onClick={() => setMobileVendorsOpen(!mobileVendorsOpen)}
                      className="flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-bold text-slate-800 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors min-h-[44px]"
                    >
                      <span className="flex items-center gap-2.5">
                        <span>💍</span> {t('nav.vendors', 'Wedding Vendors')}
                      </span>
                      <FiChevronDown
                        className={`transition-transform duration-200 ${mobileVendorsOpen ? 'rotate-180 text-sky-600' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileVendorsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-4 pr-1 py-1 space-y-1 bg-sky-50/40 rounded-xl border border-sky-100/60 my-1"
                        >
                          {vendorCategories.map((c, i) => (
                            <Link
                              key={i}
                              to={c.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-2.5 py-2 px-2 text-xs font-bold text-slate-700 hover:text-sky-700"
                            >
                              <span className="text-sm">{c.icon}</span>
                              <span>{c.label}</span>
                            </Link>
                          ))}
                          <Link
                            to="/services"
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 text-xs font-black text-sky-700 hover:underline border-t border-sky-100/80 pt-2"
                          >
                            Explore All Categories →
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Baraat Ride Highlighted Pill */}
                  <Link
                    to="/baraat-cabs"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm font-extrabold text-slate-900 bg-gradient-to-r from-sky-50 via-amber-50 to-sky-50 border border-sky-200 rounded-xl hover:border-amber-300 transition-colors min-h-[44px] shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🚗</span>
                      <span>{t('nav.baraatRide', 'Baraat Ride')}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-400 text-amber-950 rounded-md">
                      Featured
                    </span>
                  </Link>

                  {/* Wedding Tools Accordion */}
                  <div>
                    <button
                      onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                      className="flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-bold text-slate-800 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors min-h-[44px]"
                    >
                      <span className="flex items-center gap-2.5">
                        <span>✨</span> {t('nav.weddingTools', 'Wedding Tools')}
                      </span>
                      <FiChevronDown
                        className={`transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180 text-sky-600' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileToolsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-4 pr-1 py-1 space-y-1 bg-sky-50/40 rounded-xl border border-sky-100/60 my-1"
                        >
                          {allWeddingTools.map((tool, i) => (
                            <Link
                              key={i}
                              to={tool.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between py-2 px-2 text-xs font-bold text-slate-700 hover:text-sky-700"
                            >
                              <div className="flex items-center gap-2">
                                <span>{tool.icon}</span>
                                <span>{tool.label}</span>
                              </div>
                              {tool.badge && (
                                <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-black">
                                  {tool.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* 2. Become a Vendor Card */}
                <div className="pt-3 pb-2">
                  <Link
                    to="/register/vendor"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-50 to-amber-50 text-slate-900 border border-sky-200 shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FiBriefcase size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 leading-tight">Grow Your Wedding Business</p>
                      <p className="text-[10px] text-sky-700 font-semibold mt-0.5">List services & get booking leads →</p>
                    </div>
                  </Link>
                </div>

              </div>

              {/* ── Drawer Bottom Auth Section ── */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/80">
                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="py-3 text-center text-xs font-extrabold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 min-h-[44px] flex items-center justify-center shadow-2xs"
                    >
                      {t('nav.login', 'Login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="py-3 text-center text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-sky-600 to-sky-700 rounded-xl shadow-md min-h-[44px] flex items-center justify-center"
                    >
                      {t('nav.getStarted', 'Get Started')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-sky-100 shadow-2xs">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-600 to-[#0369a1] text-white flex items-center justify-center font-black text-sm shadow-xs">
                        {getInitials(user?.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{roleLabel}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'}
                        onClick={() => setMobileOpen(false)}
                        className="py-2.5 text-center text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 flex items-center justify-center gap-1.5"
                      >
                        <FiGrid size={13} /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="py-2.5 text-center text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center justify-center gap-1.5"
                      >
                        <FiLogOut size={13} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
