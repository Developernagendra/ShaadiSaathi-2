import { useEffect, useState, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiInstagram, FiFacebook, FiLinkedin, FiMail, FiPhone, FiArrowUp, FiHeart, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
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

export default function Footer() {
  const { t } = useTranslation?.() || { t: (key) => key };
  const [contact, setContact] = useState(() => getCachedContact() || DEFAULT_CONTACT)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [openSection, setOpenSection] = useState(null)
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

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

  const toggleSection = useCallback((section) => {
    setOpenSection(prev => prev === section ? null : section)
  }, [])

  const forCouples = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Vendors' },
    { to: '/packages', label: 'Wedding Packages' },
    { to: '/baraat-cabs', label: 'Baraat Ride' },
    { to: '/about-us', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ]

  const forVendors = [
    { to: '/register/vendor', label: 'Vendor बनें (Join Us)' },
    { to: '/vendor/dashboard', label: 'Vendor Login' },
    { to: '/vendor/services', label: 'Manage Services' },
  ]

  const popularCities = [
    { to: '/services?city=patna', label: 'Patna' },
    { to: '/services?city=darbhanga', label: 'Darbhanga' },
    { to: '/services?city=muzaffarpur', label: 'Muzaffarpur' },
    { to: '/services?city=gaya', label: 'Gaya' },
    { to: '/services?city=madhubani', label: 'Madhubani' },
    { to: '/services?city=bhagalpur', label: 'Bhagalpur' },
  ]

  const weddingServices = [
    { to: '/services?category=venues', label: 'विवाह भवन (Venues)' },
    { to: '/services?category=photography', label: 'Photography' },
    { to: '/services?category=bridal-makeup', label: 'Makeup Artists' },
    { to: '/services?category=catering', label: 'Catering' },
    { to: '/services?category=event-planners', label: 'Decoration' },
  ]

  return (
    <footer className="relative bg-[#0A0F1C] text-slate-300 font-sans overflow-hidden">
      <div className="madhubani-border w-full h-1.5" />

      {/* ── Background Effects ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-72 md:w-[500px] h-[500px] bg-[#C2185B]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 md:w-[600px] h-[600px] bg-[#6A11CB]/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4"></div>
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
              className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-[#C2185B] to-[#8E244D] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(194,24,91,0.4)] hover:shadow-[0_0_30px_rgba(194,24,91,0.6)] hover:-translate-y-1 transition-all duration-300"
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
              <p className="text-slate-400 text-sm">Get the latest wedding trends, planning tips, and exclusive vendor offers delivered to your inbox.</p>
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
                  className="bg-[#C2185B] hover:bg-[#a3154d] text-white px-5 md:px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50 whitespace-nowrap"
                >
                  {newsletterLoading ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-16 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">

            {/* Column 1: Company */}
            <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
              <button
                onClick={() => toggleSection('company')}
                aria-expanded={openSection === 'company'}
                aria-controls="footer-company"
                className="w-full flex items-center justify-between md:cursor-default focus:outline-none md:pointer-events-none"
              >
                <h4 className="text-white font-bold text-lg md:mb-6 tracking-wide">Company</h4>
                <FiChevronDown className={`md:hidden transition-transform duration-300 ${openSection === 'company' ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {(openSection === 'company') && (
                  <motion.div id="footer-company" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden md:hidden">
                    <FooterCompanyContent contact={contact} t={t} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden md:block">
                <FooterCompanyContent contact={contact} t={t} />
              </div>
            </div>

            {/* Column 2: For Couples */}
            <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
              <button onClick={() => toggleSection('forCouples')} className="w-full flex items-center justify-between md:cursor-default focus:outline-none md:pointer-events-none">
                <h4 className="text-white font-bold text-lg md:mb-6 tracking-wide">For Couples</h4>
                <FiChevronDown className={`md:hidden transition-transform duration-300 ${openSection === 'forCouples' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'forCouples' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden md:hidden">
                    <FooterQuickLinks links={forCouples} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden md:block">
                <FooterQuickLinks links={forCouples} />
              </div>
            </div>

            {/* Column 3: For Vendors */}
            <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
              <button onClick={() => toggleSection('forVendors')} className="w-full flex items-center justify-between md:cursor-default focus:outline-none md:pointer-events-none">
                <h4 className="text-white font-bold text-lg md:mb-6 tracking-wide">For Vendors</h4>
                <FiChevronDown className={`md:hidden transition-transform duration-300 ${openSection === 'forVendors' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'forVendors' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden md:hidden">
                    <FooterQuickLinks links={forVendors} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden md:block">
                <FooterQuickLinks links={forVendors} />
              </div>
            </div>

            {/* Column 4: Wedding Services */}
            <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
              <button onClick={() => toggleSection('services')} className="w-full flex items-center justify-between md:cursor-default focus:outline-none md:pointer-events-none">
                <h4 className="text-white font-bold text-lg md:mb-6 tracking-wide">Wedding Services</h4>
                <FiChevronDown className={`md:hidden transition-transform duration-300 ${openSection === 'services' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'services' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden md:hidden">
                    <FooterServiceLinks links={weddingServices} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden md:block">
                <FooterServiceLinks links={weddingServices} />
              </div>
            </div>

            {/* Column 5: Popular Cities */}
            <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
              <button onClick={() => toggleSection('cities')} className="w-full flex items-center justify-between md:cursor-default focus:outline-none md:pointer-events-none">
                <h4 className="text-white font-bold text-lg md:mb-6 tracking-wide">Popular Cities</h4>
                <FiChevronDown className={`md:hidden transition-transform duration-300 ${openSection === 'cities' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'cities' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden md:hidden">
                    <FooterLegalLinks links={popularCities} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden md:block">
                <FooterLegalLinks links={popularCities} />
              </div>
            </div>

          </div>
        </div>

        {/* ── SOCIAL SECTION ── */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <nav aria-label="Social media links" className="flex justify-center gap-4">
            <a href={contact.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-pink-500/30">
              <FiInstagram size={20} aria-hidden="true" />
            </a>
            <a href={contact.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#1877F2] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/30">
              <FiFacebook size={20} aria-hidden="true" />
            </a>
            <a href={contact.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#0A66C2] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-600/30">
              <FiLinkedin size={20} aria-hidden="true" />
            </a>
            <a href={contact.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#25D366] hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-green-500/30">
              <FaWhatsapp size={22} aria-hidden="true" />
            </a>
          </nav>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="border-t border-white/10 bg-black/20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-6 pb-28 md:pb-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-slate-500 text-sm font-medium">&copy; {new Date().getFullYear()} ShaadiSaathi. All rights reserved.</p>
            <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1.5">
              बिहार की शादी, ShaadiSaathi के साथ <span className="text-[#C2185B] animate-pulse" aria-hidden="true">❤️</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}

/* ── Extracted sub-components to prevent inline JSX duplication ── */

function FooterCompanyContent({ contact, t }) {
  return (
    <div className="pt-4 md:pt-0 space-y-6">
      <BrandLogo isDark={true} showTagline={false} />
      <div>
        <p className="text-white font-bold text-base mb-2">शादी का सच्चा साथी</p>
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
          बिहार की शादी, अब होगी आसान। Venue से लेकर Catering तक — आपकी शादी की पूरी तैयारी, एक ही जगह।
        </p>
      </div>
      <ul className="space-y-4">
        <li>
          <a href={`mailto:${contact.email}`} className="flex items-center gap-3 group">
            <FiMail className="text-[#C2185B] flex-shrink-0" aria-hidden="true" />
            <span className="text-slate-400 group-hover:text-white text-sm transition-colors">{contact.email}</span>
          </a>
        </li>
        <li>
          <a href={`tel:${contact.phone?.replace(/\s+/g, '')}`} className="flex items-center gap-3 group">
            <FiPhone className="text-[#C2185B] flex-shrink-0" aria-hidden="true" />
            <span className="text-slate-400 group-hover:text-white text-sm transition-colors">{contact.phone}</span>
          </a>
        </li>
      </ul>
    </div>
  )
}

function FooterQuickLinks({ links }) {
  return (
    <ul className="pt-4 md:pt-0 space-y-3">
      {links.map(({ to, label }) => (
        <li key={label}>
          <NavLink to={to} end={to === '/'} className={({ isActive }) => `text-sm font-medium transition-all duration-300 hover:translate-x-2 inline-block ${isActive ? 'text-[#C2185B]' : 'text-slate-400 hover:text-[#C2185B]'}`}>
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

function FooterServiceLinks({ links }) {
  return (
    <ul className="pt-4 md:pt-0 space-y-3">
      {links.map(({ to, label }) => (
        <li key={label}>
          <Link to={to} className="text-sm font-medium text-slate-400 hover:text-[#C2185B] transition-colors flex items-center gap-2">
            <FiChevronRight size={14} className="hidden md:block flex-shrink-0" aria-hidden="true" /> {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function FooterLegalLinks({ links }) {
  return (
    <ul className="pt-4 md:pt-0 space-y-3">
      {links.map(({ to, label }) => (
        <li key={label}>
          <Link to={to} className="text-sm font-medium text-slate-400 hover:text-[#C2185B] transition-colors">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
