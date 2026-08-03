import { useEffect, useState, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiInstagram, FiFacebook, FiLinkedin, FiMail, FiPhone, FiArrowUp, FiHeart, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../../utils/api'
import { useTranslation } from 'react-i18next'
import BrandLogo from '../common/BrandLogo'
import toast from 'react-hot-toast'

// Cache contact info in sessionStorage to avoid re-fetching on every navigation
const CONTACT_CACHE_KEY = 'ss_footer_contact'

function getCachedContact() {
  try {
    const raw = sessionStorage.getItem(CONTACT_CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function setCachedContact(data) {
  try {
    sessionStorage.setItem(CONTACT_CACHE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

const DEFAULT_CONTACT = {
  email: 'hello@shaadisaathi.com',
  phone: '+91 7903075243',
  address: 'Bihar, India',
  company: 'ShaadiSaathi',
  socialLinks: {
    instagram: 'https://www.instagram.com/_shaadisaathi/',
    facebook: '#',
    linkedin: '#',
    whatsapp: 'https://wa.me/917903075243'
  }
}

// Subtle Madhubani / Floral SVG Watermark Pattern for the About Us Card
function MadhubaniCardWatermark({ className = "" }) {
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none opacity-10 group-hover:opacity-15 transition-opacity duration-500 ${className}`} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="250" cy="30" r="80" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="250" cy="30" r="50" stroke="#C2185B" strokeWidth="1.5" />
      <path d="M250 10 C 265 25, 265 35, 250 50 C 235 35, 235 25, 250 10 Z" fill="#D4AF37" fillOpacity="0.3" />
      <path d="M230 30 C 245 15, 255 15, 270 30 C 255 45, 245 45, 230 30 Z" fill="#C2185B" fillOpacity="0.2" />
      <circle cx="40" cy="170" r="40" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M20 180 Q 40 160, 60 180 T 100 180" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// Premium Branded About Us Story Card Component
function FooterAboutStoryCard() {
  return (
    <div className="relative overflow-hidden rounded-[24px] md:rounded-[28px] p-6 md:p-8 bg-gradient-to-br from-[#12192F] via-[#0D1426] to-[#161024] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.4)] group">
      {/* Decorative Madhubani Art Watermark */}
      <MadhubaniCardWatermark />

      <div className="relative z-10 flex flex-col h-full justify-between space-y-5">
        {/* Logo & Heading */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BrandLogo isDark={true} showTagline={false} />
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#C2185B]/20 text-[#FF4D6D] text-sm animate-pulse">
              ❤️
            </span>
          </div>
          <p className="text-[#D4AF37] font-display font-black text-base md:text-lg tracking-wide mb-3">
            शादी का सच्चा साथी
          </p>

          {/* Dual Description (Hindi + English Fallback) */}
          <div className="space-y-2 text-sm leading-relaxed">
            <p className="text-white/95 font-medium">
              "आपकी शादी की Planning, Vendors और Booking — सब कुछ एक ही जगह।"
            </p>
            <p className="text-slate-400 text-xs">
              Your trusted companion for planning, discovering and booking everything for your wedding.
            </p>
          </div>
        </div>

        {/* Premium Action Button / Link to existing /about-us */}
        <div className="pt-2">
          <Link
            to="/about-us"
            className="inline-flex items-center justify-between w-full sm:w-auto gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C2185B] via-[#D4AF37] to-[#C2185B] text-white font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-[0_8px_25px_rgba(194,24,91,0.4)] transition-all group/btn active:scale-95"
          >
            <span>हमारे बारे में जानें | Discover Our Story</span>
            <span className="inline-block transform group-hover/btn:translate-x-1.5 transition-transform duration-300 text-sm font-bold">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const { t } = useTranslation?.() || { t: (key) => key };
  const [contact, setContact] = useState(() => getCachedContact() || DEFAULT_CONTACT)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [openSection, setOpenSection] = useState(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  useEffect(() => {
    // Only fetch if not cached
    if (!getCachedContact()) {
      const fetchContact = async () => {
        try {
          const { data } = await api.get('/features/contact-info')
          if (data.success && data.data) {
            const merged = { ...DEFAULT_CONTACT, ...data.data }
            setContact(merged)
            setCachedContact(merged)
          }
        } catch (err) {
          // silently fail — defaults are already set
        }
      }
      fetchContact()
    }

    let rafId = null
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 400)
        rafId = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleNewsletterSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email: newsletterEmail });
      toast.success('Successfully subscribed to the newsletter!');
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  }, [newsletterEmail]);

  // Single-open accordion handler for mobile
  const toggleSection = useCallback((section) => {
    setOpenSection(prev => prev === section ? null : section)
  }, [])

  // Navigation link columns
  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Vendors' },
    { to: '/packages', label: 'Packages' },
    { to: '/baraat-cabs', label: 'Baraat Ride' },
    { to: '/about-us', label: 'About Us' }
  ]

  const weddingTools = [
    { to: '/ai-planner', label: 'AI Wedding Planner' },
    { to: '/checklist', label: 'Wedding Checklist' },
    { to: '/budget-calculator', label: 'Budget Planner' },
    { to: '/expert-consultation', label: 'Expert Consultation' }
  ]

  const forBusiness = [
    { to: '/register/vendor', label: 'Become a Vendor' },
    { to: '/vendor/dashboard', label: 'Vendor Login' },
    { to: '/vendor/dashboard', label: 'Vendor Dashboard' }
  ]

  const supportLinks = [
    { to: '/contact', label: 'Support & Contact' },
    { to: '/services?city=patna', label: 'Patna Wedding Venues' },
    { to: '/services?city=darbhanga', label: 'Darbhanga Services' }
  ]

  return (
    <footer className="relative bg-[#0A0F1C] text-slate-300 font-sans overflow-hidden">
      <div className="madhubani-border w-full h-1.5" />

      {/* ── Background Effects ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-72 md:w-[500px] h-[500px] bg-[#C2185B]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 md:w-[600px] h-[600px] bg-[#6A11CB]/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10">

        {/* ── Scroll To Top Button ── */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={scrollToTop}
              className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-[#C2185B] to-[#8E244D] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(194,24,91,0.4)] hover:shadow-[0_0_30px_rgba(194,24,91,0.6)] hover:-translate-y-1 transition-all duration-300"
              aria-label="Scroll to top of page"
            >
              <FiArrowUp size={20} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── NEWSLETTER ── */}
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-8 border-b border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 backdrop-blur-sm shadow-xl">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                <FiMail className="text-[#C2185B]" aria-hidden="true" /> Subscribe to our Newsletter
              </h3>
              <p className="text-slate-400 text-sm">
                Get the latest wedding trends, planning tips, and exclusive vendor offers delivered to your inbox.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <form onSubmit={handleNewsletterSubmit} className="flex items-center bg-white/10 p-1.5 rounded-full border border-white/10 focus-within:border-[#C2185B] transition-colors">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-transparent text-white px-4 py-2 w-full outline-none text-sm placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="bg-[#C2185B] hover:bg-[#a3154d] text-white px-5 md:px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50 whitespace-nowrap min-h-[44px]"
                >
                  {newsletterLoading ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── MAIN FOOTER COLUMNS ── */}
        <div className="max-w-7xl mx-auto px-4 pb-16 pt-10">
          
          {/* Mobile Top About Us Card (Shown first on mobile) */}
          <div className="mb-8 lg:hidden">
            <FooterAboutStoryCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">

            {/* Column 1 (Desktop Only): Branded About Us Story Card */}
            <div className="hidden lg:block lg:col-span-4">
              <FooterAboutStoryCard />
            </div>

            {/* Column 2: Quick Links */}
            <div className="lg:col-span-2 border-b border-white/10 lg:border-none pb-4 lg:pb-0">
              <button
                onClick={() => toggleSection('quickLinks')}
                aria-expanded={openSection === 'quickLinks'}
                aria-controls="footer-quick-links"
                className="w-full flex items-center justify-between lg:cursor-default focus:outline-none lg:pointer-events-none min-h-[44px]"
              >
                <h4 className="text-white font-bold text-base md:text-lg lg:mb-5 tracking-wide">Quick Links</h4>
                <FiChevronDown className={`lg:hidden transition-transform duration-300 ${openSection === 'quickLinks' ? 'rotate-180 text-[#C2185B]' : ''}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'quickLinks' && (
                  <motion.div
                    id="footer-quick-links"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden lg:hidden"
                  >
                    <FooterNavLinkList links={quickLinks} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden lg:block">
                <FooterNavLinkList links={quickLinks} />
              </div>
            </div>

            {/* Column 3: Wedding Tools */}
            <div className="lg:col-span-2 border-b border-white/10 lg:border-none pb-4 lg:pb-0">
              <button
                onClick={() => toggleSection('weddingTools')}
                aria-expanded={openSection === 'weddingTools'}
                aria-controls="footer-wedding-tools"
                className="w-full flex items-center justify-between lg:cursor-default focus:outline-none lg:pointer-events-none min-h-[44px]"
              >
                <h4 className="text-white font-bold text-base md:text-lg lg:mb-5 tracking-wide">Wedding Tools</h4>
                <FiChevronDown className={`lg:hidden transition-transform duration-300 ${openSection === 'weddingTools' ? 'rotate-180 text-[#C2185B]' : ''}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'weddingTools' && (
                  <motion.div
                    id="footer-wedding-tools"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden lg:hidden"
                  >
                    <FooterNavLinkList links={weddingTools} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden lg:block">
                <FooterNavLinkList links={weddingTools} />
              </div>
            </div>

            {/* Column 4: For Business */}
            <div className="lg:col-span-2 border-b border-white/10 lg:border-none pb-4 lg:pb-0">
              <button
                onClick={() => toggleSection('forBusiness')}
                aria-expanded={openSection === 'forBusiness'}
                aria-controls="footer-for-business"
                className="w-full flex items-center justify-between lg:cursor-default focus:outline-none lg:pointer-events-none min-h-[44px]"
              >
                <h4 className="text-white font-bold text-base md:text-lg lg:mb-5 tracking-wide">For Business</h4>
                <FiChevronDown className={`lg:hidden transition-transform duration-300 ${openSection === 'forBusiness' ? 'rotate-180 text-[#C2185B]' : ''}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'forBusiness' && (
                  <motion.div
                    id="footer-for-business"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden lg:hidden"
                  >
                    <FooterNavLinkList links={forBusiness} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden lg:block">
                <FooterNavLinkList links={forBusiness} />
              </div>
            </div>

            {/* Column 5: Connect With Us */}
            <div className="lg:col-span-2 border-b border-white/10 lg:border-none pb-4 lg:pb-0">
              <button
                onClick={() => toggleSection('connect')}
                aria-expanded={openSection === 'connect'}
                aria-controls="footer-connect"
                className="w-full flex items-center justify-between lg:cursor-default focus:outline-none lg:pointer-events-none min-h-[44px]"
              >
                <h4 className="text-white font-bold text-base md:text-lg lg:mb-5 tracking-wide">Connect With Us</h4>
                <FiChevronDown className={`lg:hidden transition-transform duration-300 ${openSection === 'connect' ? 'rotate-180 text-[#C2185B]' : ''}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'connect' && (
                  <motion.div
                    id="footer-connect"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden lg:hidden"
                  >
                    <FooterConnectContent contact={contact} supportLinks={supportLinks} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden lg:block">
                <FooterConnectContent contact={contact} supportLinks={supportLinks} />
              </div>
            </div>

          </div>
        </div>

        {/* ── SOCIAL MEDIA SECTION ── */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <nav aria-label="Social media links" className="flex justify-center gap-4">
            <a
              href={contact.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-pink-500/30 min-h-[44px] min-w-[44px]"
            >
              <FiInstagram size={20} aria-hidden="true" />
            </a>
            <a
              href={contact.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#1877F2] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/30 min-h-[44px] min-w-[44px]"
            >
              <FiFacebook size={20} aria-hidden="true" />
            </a>
            <a
              href={contact.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on LinkedIn"
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#0A66C2] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-600/30 min-h-[44px] min-w-[44px]"
            >
              <FiLinkedin size={20} aria-hidden="true" />
            </a>
            <a
              href={contact.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#25D366] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-green-500/30 min-h-[44px] min-w-[44px]"
            >
              <FaWhatsapp size={22} aria-hidden="true" />
            </a>
          </nav>
        </div>

        {/* ── BOTTOM BAR (with safe area bottom padding pb-28 md:pb-8 for mobile bottom navigation) ── */}
        <div className="border-t border-white/10 bg-black/20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-6 pb-28 md:pb-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-slate-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} ShaadiSaathi. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1.5">
              बिहार की शादी, ShaadiSaathi के साथ <span className="text-[#C2185B] animate-pulse" aria-hidden="true">❤️</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}

/* ── Helper Nav & Connect List Components ── */

function FooterNavLinkList({ links }) {
  return (
    <ul className="pt-3 lg:pt-0 space-y-2.5">
      {links.map(({ to, label }) => (
        <li key={label}>
          <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `text-sm font-medium transition-all duration-300 hover:translate-x-1.5 inline-flex items-center py-1 min-h-[36px] ${
                isActive ? 'text-[#C2185B] font-bold' : 'text-slate-400 hover:text-[#C2185B]'
              }`
            }
          >
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function FooterConnectContent({ contact, supportLinks }) {
  return (
    <div className="pt-3 lg:pt-0 space-y-4">
      <ul className="space-y-3">
        <li>
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition-colors py-1 group"
          >
            <FiMail className="text-[#C2185B] shrink-0" size={16} aria-hidden="true" />
            <span className="truncate">{contact.email}</span>
          </a>
        </li>
        <li>
          <a
            href={`tel:${contact.phone?.replace(/\s+/g, '')}`}
            className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition-colors py-1 group"
          >
            <FiPhone className="text-[#C2185B] shrink-0" size={16} aria-hidden="true" />
            <span>{contact.phone}</span>
          </a>
        </li>
      </ul>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Support</p>
        <ul className="space-y-2">
          {supportLinks.map(({ to, label }) => (
            <li key={label}>
              <Link
                to={to}
                className="text-sm font-medium text-slate-400 hover:text-[#C2185B] transition-colors inline-block py-0.5"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
