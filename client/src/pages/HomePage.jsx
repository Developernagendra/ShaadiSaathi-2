import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../store/slices/vendorSlice'
import { motion } from 'framer-motion'
import VendorCard from '../components/vendor/VendorCard'
import FeaturedVendorCard from '../components/vendor/FeaturedVendorCard'
import { SkeletonCard } from '../components/common/Skeleton'
import { INDIAN_CITIES } from '../utils/helpers'
import { FiSearch, FiMapPin, FiArrowRight, FiShield, FiDollarSign, FiStar, FiCalendar, FiHeadphones } from 'react-icons/fi';
import { FaCrown, FaCheckCircle } from 'react-icons/fa';
import api from '../utils/api'
import { getSocket } from '../utils/socket'
import { useTranslation } from 'react-i18next'

// Lazy load below-the-fold components
const PackageSection = lazy(() => import('../components/packages/PackageSection'))
const PremiumTestimonials = lazy(() => import('../components/home/PremiumTestimonials'))
const WhyShaadiSaathi = lazy(() => import('../components/home/WhyShaadiSaathi'))

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=1200&q=70', // Wedding Mandap
  'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&w=1200&q=70', // Indian Bride
  'https://plus.unsplash.com/premium_photo-1682092018999-2c8fcfe944f3?auto=format&fit=crop&w=1200&q=70', // Palace Wedding
]

const getStaticServices = (isEnglish) => [
  {
    icon: '📸',
    name: isEnglish ? 'Photography' : 'फोटोग्राफी (Photography)',
    desc: isEnglish ? 'Wedding films, candid shoots & albums' : 'शादी के अनमोल पलों को हमेशा के लिए संजोएं',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=photography',
    slug: 'photography'
  },
  {
    icon: '🍽️',
    name: isEnglish ? 'Catering' : 'कैटरिंग (Catering)',
    desc: isEnglish ? 'Authentic Bihari feasts & gourmet dining' : 'स्वादिष्ट बिहारी पकवान और बेहतरीन शादी का खाना',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=catering',
    slug: 'catering'
  },
  {
    icon: '✨',
    name: isEnglish ? 'Decoration' : 'डेकोरेशन (Decoration)',
    desc: isEnglish ? 'Stunning stage, floral & mandap decor' : 'शानदार मंडप, स्टेज और फूलों की सजावट',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=event-planners',
    slug: 'event-planners'
  },
  {
    icon: '🏛️',
    name: isEnglish ? 'Wedding Venue' : 'विवाह भवन (Venue)',
    desc: isEnglish ? 'Premium banquet halls, resorts & lawns' : 'शानदार मैरिज हॉल, रिसॉर्ट्स और लॉन',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=venues',
    slug: 'venues'
  },
  {
    icon: '🤲',
    name: isEnglish ? 'Mehndi' : 'मेहंदी (Mehndi)',
    desc: isEnglish ? 'Intricate bridal & guest mehndi designs' : 'दुल्हन और मेहमानों के लिए खूबसूरत मेहंदी डिज़ाइन',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=mehndi',
    slug: 'mehndi'
  },
  {
    icon: '💄',
    name: isEnglish ? 'Makeup Artist' : 'ब्राइडल मेकअप (Makeup)',
    desc: isEnglish ? 'Flawless bridal makeup & styling experts' : 'दुल्हन के लिए प्रोफेशनल ब्राइडल मेकअप और स्टाइलिंग',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=bridal-makeup',
    slug: 'bridal-makeup'
  },
  {
    icon: '🎪',
    name: isEnglish ? 'Tent House' : 'टेंट हाउस (Tent House)',
    desc: isEnglish ? 'Complete lighting, sound & tent setups' : 'शादी के लिए प्रीमियम टेंट, लाइट और साउंड व्यवस्था',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=tent-house',
    slug: 'tent-house'
  },
  {
    icon: '🕉️',
    name: isEnglish ? 'Pandit' : 'पंडित जी (Pandit)',
    desc: isEnglish ? 'Experienced Vedic priests for rituals' : 'वैदिक रीति-रिवाजों से विवाह संपन्न कराने वाले पंडित जी',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=pandit',
    slug: 'pandit'
  },
  {
    icon: '🎵',
    name: isEnglish ? 'DJ & Sound' : 'डीजे और साउंड (DJ)',
    desc: isEnglish ? 'High-energy music & sangeet setups' : 'संगीत और बारात के लिए शानदार साउंड सिस्टम',
    cta: isEnglish ? 'Explore →' : 'देखें →',
    to: '/services?category=dj',
    slug: 'dj'
  },
  {
    icon: '🚗',
    name: isEnglish ? 'Baraat Ride' : 'बारात राइड (Baraat Ride)',
    desc: isEnglish ? 'Luxury vintage cars & premium baraat entry' : 'अपनी बारात की शानदार एंट्री के लिए लग्जरी गाड़ियां',
    cta: isEnglish ? 'Explore Baraat Rides →' : 'बारात राइड देखें →',
    to: '/baraat-cabs',
    slug: 'baraat-cabs',
    isSpecial: true,
    badge: isEnglish ? 'Popular' : 'पॉपुलर'
  }
];

const WHY_US_CARDS = [
  { icon: <FiShield />, title: 'Verified Vendors', desc: 'अपनी शादी के लिए सिर्फ भरोसेमंद और verified professionals चुनें।' },
  { icon: <FiDollarSign />, title: 'पारदर्शी कीमतें (Clear Pricing)', desc: 'बिना किसी छुपे खर्च के, साफ़-सुथरी pricing और packages देखें।' },
  { icon: <FiStar />, title: 'असली Reviews', desc: 'बाकी कपल्स के सच्चे अनुभव पढ़कर सही फैसला लें।' },
  { icon: <FiCalendar />, title: 'आसान Booking', desc: 'vendors ढूंढें, compare करें और आसानी से बुक करें।' },
  { icon: <FiHeadphones />, title: 'Expert की सलाह', desc: 'हमारे wedding experts से सही गाइडेंस पाएं।' },
  { icon: <FiMapPin />, title: 'लोकल Vendors', desc: 'अपने शहर और लोकेशन के आस-पास बेस्ट vendors ढूंढें।' }
]

export default function HomePage() {
  const { t, i18n } = useTranslation?.() || { t: (key) => key, i18n: { language: 'hi' } };
  const isEnglish = i18n?.language === 'en';
  const servicesList = getStaticServices(isEnglish);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { categories = [] } = useSelector((s) => s.vendor || {})

  const [heroIndex, setHeroIndex] = useState(0)
  const [searchCity, setSearchCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Featured Services State (Marketplace)
  const [featuredServices, setFeaturedServices] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedRating, setSelectedRating] = useState('')

  const fetchFeatured = useCallback(async () => {
    setFeaturedLoading(true)
    setFeaturedError(false)
    try {
      const { data } = await api.get('/vendors/featured')
      setFeaturedServices(data.vendors || data.data || [])
    } catch (err) {
      setFeaturedError(true)
    } finally {
      setFeaturedLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatured()
    const socket = getSocket()
    if (socket) {
      socket.on('service_updated', fetchFeatured)
    }
    return () => {
      if (socket) socket.off('service_updated', fetchFeatured)
    }
  }, [retryCount])

  const filteredFeatured = featuredServices.filter((vendor) => {
    if (selectedCategory && vendor.category?.slug !== selectedCategory && vendor.category?._id !== selectedCategory) return false
    if (selectedCity && vendor.location?.city?.toLowerCase() !== selectedCity.toLowerCase()) return false
    if (selectedPriceRange) {
      const price = vendor.basePrice || 0
      if (selectedPriceRange === 'under-50k' && price >= 50000) return false
      if (selectedPriceRange === '50k-1l' && (price < 50000 || price > 100000)) return false
      if (selectedPriceRange === 'above-1l' && price <= 100000) return false
    }
    if (selectedRating) {
      const avgRating = vendor.rating?.average || 0
      if (parseFloat(avgRating) < parseFloat(selectedRating)) return false
    }
    return true
  })

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories())
    }
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 5000)
    return () => clearInterval(timer)
  }, [dispatch, categories?.length])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (searchCity) params.set('city', searchCity)
    navigate(`/services?${params.toString()}`)
  }, [searchQuery, searchCity, navigate])

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {/* ── 1. Hero Section ── */}
      <section className="relative min-h-[auto] sm:min-h-[640px] lg:min-h-[760px] h-auto flex flex-col justify-center">
        {/* ── Separate Background Layer (Clips only background images & gradient, never content) ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {HERO_IMAGES.map((src, i) => {
            const isActive = i === heroIndex;
            const isNext = i === (heroIndex + 1) % HERO_IMAGES.length;
            if (!isActive && !isNext) return null;

            return (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                <img
                  src={src}
                  alt={i === 0 ? 'Indian wedding mandap ceremony' : i === 1 ? 'Indian bride on wedding day' : 'Palace wedding celebration'}
                  width="1200"
                  height="675"
                  className="w-full h-full object-cover object-center"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding={i === 0 ? 'sync' : 'async'}
                />
              </div>
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1021]/85 via-[#0B1021]/55 to-[#0B1021]/95 sm:from-[#0B1021]/70 sm:via-[#0B1021]/45 sm:to-[#0B1021]/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] px-5 py-3 rounded-full mb-6 shadow-xl max-w-full w-auto whitespace-nowrap justify-center mx-auto"
          >
            <span className="text-gold">✨</span>
            <span>बिहार की शादी, ShaadiSaathi के साथ</span>
          </motion.div>

          <h1 className="font-display text-[28px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-black text-white leading-[1.15] mb-3 sm:mb-4 text-shadow drop-shadow-2xl px-2 text-wrap-balance">
            ShaadiSaathi — शादी का सच्चा साथी <br className="hidden md:block" />
            <span className="text-[#D4AF37] text-[22px] sm:text-[28px] md:text-[40px] lg:text-[48px] italic block mt-1">बिहार की शादी, अब होगी आसान</span>
          </h1>

          <div className="mb-8 sm:mb-10 px-4 sm:px-0">
            <p className="text-white/95 text-[16px] md:text-[20px] lg:text-[24px] font-medium max-w-[750px] mx-auto text-shadow leading-relaxed italic">
              Plan, Discover & Book Everything for Your Wedding | Venue से लेकर Catering तक — आपकी शादी की पूरी तैयारी, एक ही जगह।
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-[24px] p-4 md:p-6 lg:p-8 shadow-2xl flex flex-col md:flex-row gap-3 max-w-[1200px] w-full mx-auto my-8 sm:my-10 border border-gold-100 relative overflow-hidden z-20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-pink-500 to-gold-400 opacity-50" />

            <div className="flex items-center gap-3 flex-1 px-3 md:px-4 w-full h-[52px] sm:h-[56px] md:h-[64px] border-b border-gray-100 md:border-b-0">
              <FiSearch className="text-[#C2185B] flex-shrink-0" size={18} />
              <input
                type="text"
                placeholder="Vendor, Services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none text-gray-800 placeholder-gray-400 font-medium text-sm md:text-base min-w-0"
              />
            </div>

            <div className="flex items-center gap-3 px-3 md:px-4 w-full md:w-auto md:min-w-[180px] h-[52px] sm:h-[56px] md:h-[64px] md:border-l border-gray-100 border-b md:border-b-0">
              <FiMapPin className="text-[#C2185B] flex-shrink-0" size={18} />
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="outline-none text-gray-800 font-bold text-sm bg-transparent w-full cursor-pointer min-w-0"
              >
                <option value="">शहर चुनें (Select City)</option>
                {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-[16px] h-[52px] sm:h-[56px] md:h-[64px] px-8 text-sm font-bold shine-effect w-full md:w-auto flex-shrink-0 transition-colors flex items-center justify-center mt-2 md:mt-0">
              Vendor खोजें
            </button>
          </form>

          <div className="w-full max-w-5xl mx-auto pt-2">
            <div
              className="flex overflow-x-auto flex-row flex-nowrap md:flex-wrap md:justify-center items-center gap-2.5 sm:gap-3 px-2 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <button
                onClick={() => navigate('/tools')}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] hover:from-[#B38D22] hover:to-[#927116] text-white h-[42px] sm:h-[44px] rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl text-center flex-shrink-0 flex items-center justify-center whitespace-nowrap px-4 sm:px-5 gap-1.5 border border-white/20 active:scale-95"
              >
                <span>✨ Plan Your Wedding</span>
              </button>
              {[
                { label: 'विवाह भवन 🏛️', slug: 'venues' },
                { label: 'Catering 🍽️', slug: 'catering' },
                { label: 'Photography 📷', slug: 'photography' },
                { label: 'Makeup 💄', slug: 'bridal-makeup' }
              ].map((item) => (
                <button
                  key={item.slug}
                  onClick={() => navigate(`/services?category=${item.slug}`)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white h-[42px] sm:h-[44px] rounded-full text-xs sm:text-sm font-bold transition-all hover:shadow-lg text-center flex-shrink-0 flex items-center justify-center whitespace-nowrap px-4 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Services Section ── */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 bg-[#FFF8F0]/70 overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-72 h-72 md:w-[400px] md:h-[400px] bg-[#C2185B]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3 md:mb-4"
            >
              {isEnglish ? 'Everything for Your ' : 'बिहार की शादी के लिए '}
              <span className="text-[#D4AF37] italic">{isEnglish ? 'Bihar Wedding' : 'सब कुछ'}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 font-medium text-sm md:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed"
            >
              {isEnglish
                ? 'From Venue to Catering, Photography, and Baraat Ride — your complete wedding preparation in one place.'
                : 'Venue से लेकर Catering, Photography और Baraat Ride तक — आपकी शादी की पूरी तैयारी, एक ही जगह।'}
            </motion.p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6">
            {servicesList.map((service, idx) => (
              <Link
                key={service.slug}
                to={service.to}
                className={`group relative flex flex-col items-center justify-between p-4 sm:p-5 md:p-6 rounded-[24px] transition-all duration-300 active:scale-95 text-center overflow-hidden w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] xl:w-[calc(20%-1.2rem)] ${
                  service.isSpecial
                    ? 'bg-gradient-to-br from-[#FFFDF8] via-[#FFF9EE] to-[#FFF2DF] border-2 border-[#D4AF37]/60 shadow-md hover:shadow-2xl hover:border-[#D4AF37] hover:-translate-y-1.5'
                    : 'bg-white/95 border border-pink-100/80 shadow-sm hover:shadow-xl hover:border-[#C2185B]/40 hover:-translate-y-1.5'
                }`}
              >
                {/* Top Shimmer Accent Line on Hover / Active */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 transition-opacity duration-300 ${
                    service.isSpecial
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#FF4D6D] to-[#D4AF37] opacity-100'
                      : 'bg-gradient-to-r from-pink-500 to-[#C2185B] opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Popular Badge for Baraat Ride */}
                {service.isSpecial && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    {service.badge}
                  </div>
                )}

                {/* Service Icon */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                    service.isSpecial
                      ? 'bg-gradient-to-br from-[#FFF0D0] to-[#FFE2A4] shadow-sm'
                      : 'bg-[#FFF8F0] group-hover:bg-pink-50'
                  }`}
                >
                  <span role="img" aria-label={service.name}>
                    {service.icon}
                  </span>
                </div>

                {/* Title & Short Description */}
                <div className="flex flex-col items-center gap-1.5 mb-4 flex-1">
                  <h3
                    className={`font-black uppercase tracking-wide text-xs sm:text-sm md:text-base transition-colors ${
                      service.isSpecial
                        ? 'text-[#B38D22] group-hover:text-[#927116]'
                        : 'text-gray-900 group-hover:text-[#C2185B]'
                    }`}
                  >
                    {service.name}
                  </h3>
                  <p className="text-gray-500 text-[11px] sm:text-xs font-medium leading-relaxed line-clamp-2 max-w-[220px]">
                    {service.desc}
                  </p>
                </div>

                {/* CTA Footer Link */}
                <div
                  className={`text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all duration-300 group-hover:translate-x-1 ${
                    service.isSpecial
                      ? 'text-[#B38D22] group-hover:text-[#927116]'
                      : 'text-gray-600 group-hover:text-[#C2185B]'
                  }`}
                >
                  <span>{service.cta}</span>
                  <FiArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Vendors ── */}
      <section className="relative py-12 md:py-20 lg:py-28 bg-gradient-to-b from-[#FFF8F0] to-[#FFF5F8] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 px-0 md:px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-4 px-4 md:px-0">
            <div className="max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-pink-100 shadow-sm mb-4">
                <span className="text-[#C2185B] font-black text-[10px] uppercase tracking-[0.25em]">✨ Top Picks</span>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                शादी के <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D6D] to-[#D4AF37] italic">बेस्ट Vendors</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-gray-600 font-medium text-sm md:text-base leading-relaxed">
                बिहार के सबसे भरोसेमंद wedding professionals से मिलें।
              </motion.p>
            </div>
            <Link to="/services" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-gray-900 px-8 py-4 rounded-full hover:bg-gradient-to-r hover:from-[#FF4D6D] hover:to-[#6A11CB] transition-all shadow-md active:scale-95">
              View All Vendors <FiArrowRight />
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white/90 backdrop-blur-xl rounded-[24px] p-3 shadow-sm border border-gray-100 mb-8 w-[calc(100%-2rem)] mx-auto md:w-full">
            <div className="grid grid-cols-2 md:flex md:flex-row gap-3 items-center">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-gray-50 border border-gray-100 hover:border-pink-200 transition-colors rounded-xl px-4 py-3.5 text-xs font-bold text-gray-700 outline-none w-full md:flex-1 cursor-pointer appearance-none">
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
              </select>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-gray-50 border border-gray-100 hover:border-pink-200 transition-colors rounded-xl px-4 py-3.5 text-xs font-bold text-gray-700 outline-none w-full md:flex-1 cursor-pointer appearance-none">
                <option value="">All Cities</option>
                {INDIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0 w-[calc(100%-32px)] md:w-full mx-auto">
            {featuredLoading ? (
              Array(6).fill(0).map((_, i) => <div key={i}><SkeletonCard /></div>)
            ) : filteredFeatured.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-500 font-medium bg-white rounded-[24px] border border-gray-100">No vendors found matching your criteria.</div>
            ) : (
              filteredFeatured.slice(0, 6).map((v, idx) => (
                <motion.div key={v._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} viewport={{ once: true, amount: 0.1 }}>
                  <FeaturedVendorCard vendor={v} />
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link to="/services" className="inline-flex items-center justify-center gap-2 w-full text-[10px] font-black uppercase tracking-widest text-white bg-gray-900 px-6 py-4 rounded-full hover:shadow-xl transition-all shadow-lg">
              View All Vendors <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Wedding Packages ── */}
      <Suspense fallback={<div className="py-24 text-center">Loading Packages...</div>}>
        <PackageSection />
      </Suspense>

      {/* ── 4. Baraat Cabs (USP Section) ── */}
      <section className="py-12 md:py-24 px-4 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto">
          {/* Luxury Banner Card */}
          <div className="relative bg-gradient-to-br from-[#050505] via-[#111111] to-[#050505] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row group">

            {/* Background Texture & Glow */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Mobile Image (Visible only on mobile/tablet) */}
            <div className="w-full h-[300px] md:h-[400px] lg:hidden relative">
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury Baraat Cabs"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
            </div>

            {/* Left Content Area */}
            <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-12 lg:p-16 relative z-10 flex flex-col justify-center -mt-20 lg:mt-0">

              <div className="inline-flex items-center gap-2 bg-white/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-1.5 md:px-5 md:py-2 rounded-full mb-6 md:mb-8 backdrop-blur-md shadow-lg shadow-[#D4AF37]/5 self-start">
                <span className="text-sm md:text-lg">👑</span>
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Luxury Baraat Cabs</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-[1.1]">
                अपनी बारात को बनाएं<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37]">और भी शानदार</span>
              </h2>

              <p className="text-gray-300 text-sm sm:text-base md:text-lg font-medium mb-8 leading-relaxed max-w-md">
                अपनी खास शादी के लिए premium cars के साथ शानदार एंट्री करें।
              </p>

              {/* Highlights */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-10">
                {[
                  'Luxury गाड़ियां',
                  'Professional ड्राइवर्स',
                  'समय पर पिकअप'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-200 text-xs sm:text-sm font-bold bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-sm flex-1 sm:flex-none justify-center sm:justify-start">
                    <span className="text-[#D4AF37]">✓</span>
                    <span className="whitespace-nowrap">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <Link to="/baraat-cabs" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-[#1a1a1a] font-black uppercase tracking-widest text-xs rounded-full shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-95">
                  Baraat Cabs देखें →
                </Link>
                <Link to="/services" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-white/5 transition-all duration-300">
                  सभी गाड़ियां देखें
                </Link>
              </div>
            </div>

            {/* Right Desktop Image Area */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#050505] z-10" />
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury Baraat Cabs Desktop"
                className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Why Choose ShaadiSaathi ── */}
      <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
        <WhyShaadiSaathi />
      </Suspense>

      {/* ── 5.5 Premium Testimonials ── */}
      <Suspense fallback={<div className="py-12 text-center">Loading Testimonials...</div>}>
        <PremiumTestimonials />
      </Suspense>

      {/* ── 6. Final CTA Section ── */}
      <section className="py-12 md:py-16 lg:py-24 px-4 bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 tracking-tight drop-shadow-md">
            क्या आप अपनी शादी की तैयारी <span className="italic text-[#D4AF37]">शुरू करने के लिए तैयार हैं?</span>
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-8 md:mb-10 font-medium">
            हज़ारों कपल्स की तरह अपनी शादी को भी ShaadiSaathi के साथ खास बनाएं।
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/services" className="bg-white text-[#C2185B] font-black text-xs uppercase tracking-widest py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-all">
              Vendor खोजें
            </Link>
            <Link to="/contact" className="bg-transparent border border-white/50 text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-full hover:bg-white/10 transition-all">
              संपर्क करें
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
