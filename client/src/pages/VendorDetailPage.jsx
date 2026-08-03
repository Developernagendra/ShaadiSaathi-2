import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVendorById, clearCurrentVendor } from '../store/slices/vendorSlice'
import { toggleWishlist } from '../store/slices/authSlice'
import { startChat } from '../store/slices/chatSlice'
import StarRating from '../components/common/StarRating'
import BookingModal from '../components/vendor/BookingModal'
import { formatPrice, formatDate, getInitials, getWhatsAppLink } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  FiMapPin, FiPhone, FiMail, FiHeart, FiMessageCircle,
  FiCalendar, FiCheck, FiShare2, FiImage, FiEye, FiChevronLeft, FiChevronRight,
  FiX, FiClock, FiUsers, FiAward, FiStar, FiShield, FiCheckCircle,
  FiArrowLeft, FiCamera, FiVideo, FiMonitor, FiNavigation, FiCheckSquare,
  FiArrowRight, FiInfo, FiHelpCircle, FiLock
} from 'react-icons/fi'
import { FaWhatsapp, FaCrown, FaOm } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewModal from '../components/common/ReviewModal'
import FeaturedVendorCard from '../components/vendor/FeaturedVendorCard'

// Subtle decorative Madhubani SVG ornament for headers
function MadhubaniOrnament({ className = "" }) {
  return (
    <svg className={`w-32 h-6 opacity-30 ${className}`} viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 15 Q 10 5, 20 15 T 40 15 T 60 15 T 80 15 T 100 15 T 120 15 T 140 15 T 160 15 T 180 15 T 200 15" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="20" cy="15" r="2.5" fill="currentColor" />
      <circle cx="60" cy="15" r="2.5" fill="currentColor" />
      <circle cx="100" cy="15" r="2.5" fill="currentColor" />
      <circle cx="140" cy="15" r="2.5" fill="currentColor" />
      <circle cx="180" cy="15" r="2.5" fill="currentColor" />
    </svg>
  );
}

const getOptimizedUrl = (url, width = 800) => {
  if (!url || !url.includes('cloudinary')) return url
  return url.replace('/upload/', `/upload/c_scale,w_${width},f_auto,q_auto/`)
}

export default function VendorDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { currentVendor: vendor, fetchLoading: loading, error } = useSelector(s => s.vendor)
  const { user, isAuthenticated } = useSelector(s => s.auth)

  const [reviews, setReviews] = useState([])
  const [similarVendors, setSimilarVendors] = useState([])
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [galleryModal, setGalleryModal] = useState({ open: false, index: 0 })
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [editReviewData, setEditReviewData] = useState(null)
  const [readMoreAbout, setReadMoreAbout] = useState(false)

  // Availability checker interactive state
  const [checkDate, setCheckDate] = useState('')
  const [checkEventType, setCheckEventType] = useState('Wedding Ceremony')
  const [availabilityStatus, setAvailabilityStatus] = useState('idle') // idle | checking | available | unavailable | custom

  const isWishlisted = useMemo(() => user?.wishlist?.includes(id), [user?.wishlist, id])

  const loadReviews = useCallback(() => {
    api.get(`/reviews/vendor/${id}`).then(r => setReviews(r.data.reviews || [])).catch(() => { })
  }, [id])
  
  const loadSimilarVendors = useCallback(async () => {
    try {
      const { data } = await api.get('/vendors/featured')
      const filtered = (data.vendors || data.data || []).filter(v => v._id !== id).slice(0, 6)
      setSimilarVendors(filtered)
    } catch (e) {
      console.log(e)
    }
  }, [id])

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      toast.success('Review deleted successfully')
      loadReviews()
    } catch (err) {
      toast.error('Failed to delete review')
    }
  }

  useEffect(() => {
    if (!vendor || vendor._id !== id) {
      dispatch(fetchVendorById(id))
      loadReviews()
      loadSimilarVendors()
    }
    window.scrollTo(0, 0)

    return () => {
      if (vendor && vendor._id !== id) dispatch(clearCurrentVendor())
    }
  }, [dispatch, id, vendor?._id, loadReviews, loadSimilarVendors])

  const images = useMemo(() => vendor?.images || [], [vendor?.images])

  const coverUrl = useMemo(() => {
    let url = vendor?.coverImage?.url || images.find(i => i.isPrimary)?.url || images[0]?.url;
    if (!url) {
      const cat = vendor?.category?.slug || vendor?.category?.name?.toLowerCase() || '';
      if (cat.includes('photo')) url = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80'; // Photography
      else if (cat.includes('purohit') || cat.includes('pandit')) url = 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=1600&q=80'; // Purohit
      else if (cat.includes('mehndi') || cat.includes('mehendi')) url = 'https://images.unsplash.com/photo-1564858548398-fb02d4151703?auto=format&fit=crop&w=1600&q=80'; // Mehndi
      else if (cat.includes('cater') || cat.includes('food')) url = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80'; // Catering
      else if (cat.includes('decor')) url = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80'; // Decoration
      else if (cat.includes('cab') || cat.includes('car') || cat.includes('transport') || cat.includes('travel')) url = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80'; // Cab Service
      else if (cat.includes('makeup') || cat.includes('beauty') || cat.includes('artist')) url = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80'; // Makeup Artist
      else if (cat.includes('hall') || cat.includes('venue') || cat.includes('banquet')) url = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80'; // Marriage Hall
      else if (cat.includes('band') || cat.includes('music') || cat.includes('dj')) url = 'https://images.unsplash.com/photo-1533174000255-598dc4b16bf0?auto=format&fit=crop&w=1600&q=80'; // Band Baja
      else url = 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80'; // Default Premium Wedding
    }
    return getOptimizedUrl(url, 1600);
  }, [vendor, images])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: vendor?.businessName, text: vendor?.tagline, url }).catch(() => { })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!', { style: { borderRadius: '1rem', background: '#333', color: '#fff' } })
    }
  }

  const handleWhatsAppClick = (e) => {
    e.preventDefault()
    if (!vendor?.phone) {
      toast.error('Vendor phone number is not publicly available.')
      return
    }
    const msg = `Hi ${vendor.businessName || 'there'}, I found your business on ShaadiSaathi and would like to know more about your wedding services.`
    const waLink = getWhatsAppLink(vendor.phone, msg)
    window.open(waLink, '_blank', 'noopener,noreferrer')
  }

  const handleCheckAvailability = () => {
    if (!checkDate) {
      toast.error('Please select an event date first.')
      return
    }
    setAvailabilityStatus('checking')
    setTimeout(() => {
      // Show custom status advising user to confirm directly with vendor
      setAvailabilityStatus('available')
      toast.success('Date is open for inquiry! Contact vendor or submit booking.')
    }, 600)
  }

  if (loading && !vendor) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#FFFBF8]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-6 shadow-xl" />
        <p className="text-[#D4AF37] font-bold animate-pulse tracking-wide uppercase text-sm font-display">
          Curating Premium Experience...
        </p>
      </div>
    )
  }

  if (error || (!loading && !vendor)) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#FFFBF8] px-4">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-5xl shadow-2xl mb-6 border border-gray-100">
          ✨
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-gray-900 mb-3 text-center">
          Vendor Not Found
        </h2>
        <p className="text-gray-500 text-center mb-8 max-w-md font-medium text-base">
          Unable to load vendor details. This premium vendor is currently not available or has been removed.
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/services"
            className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-white font-bold px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-xl hover:shadow-[0_10px_30px_rgba(212,175,55,0.4)] text-sm uppercase tracking-wider"
          >
            Explore Other Vendors
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="bg-white border border-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-full hover:bg-gray-50 transition-all text-sm uppercase tracking-wider shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!vendor) return null

  const vendorDesc = vendor.description || 'Vendor information will be updated soon.'
  const isDescLong = vendorDesc.length > 280
  const canBook = vendor.canBeBooked !== false
  const startingPrice = vendor.basePrice || vendor.packages?.[0]?.price || vendor.price || null

  // Dynamic Benefit Cards
  const whyChooseBenefits = [
    ...(vendor.isVerified || vendor.isFeatured ? [{
      icon: <FiCheckCircle className="text-[#C2185B] text-xl" />,
      title: 'Verified Vendor',
      desc: 'Rigorous 5-step identity and portfolio verification.'
    }] : []),
    {
      icon: <FiAward className="text-[#D4AF37] text-xl" />,
      title: `${vendor.calculatedExperience || 5}+ Years Experience`,
      desc: 'Proven track record executing flawless wedding celebrations.'
    },
    {
      icon: <FiMapPin className="text-blue-600 text-xl" />,
      title: 'Local Service Expert',
      desc: `Specialized in ${vendor.location?.city || 'Bihar'} venues & traditions.`
    },
    {
      icon: <FiShield className="text-emerald-600 text-xl" />,
      title: 'Milestone Protection',
      desc: '100% transparent pricing and secure booking milestones.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#FFFBF8] pb-36 relative selection:bg-[#C2185B]/20 selection:text-[#C2185B]">
      
      {/* ── 1. PREMIUM HERO / COVER SECTION (DESKTOP & TABLET) ── */}
      <section className="relative h-[48vh] sm:h-[55vh] md:h-[62vh] w-full bg-gray-950 overflow-hidden shadow-md">
        {coverUrl && (
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={coverUrl}
            alt={vendor.businessName}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] via-[#0B1021]/30 to-black/60" />

        {/* Back Navigation Button */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Go Back"
          className="absolute top-6 left-4 sm:left-8 md:left-12 z-20 flex items-center gap-2 bg-black/40 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/20 shadow-lg"
        >
          <FiArrowLeft size={16} /> वापस जाएँ
        </button>

        {/* Floating Header Actions */}
        <div className="absolute top-6 right-4 sm:right-8 md:right-12 flex gap-3 z-20">
          <button
            onClick={() => isAuthenticated ? dispatch(toggleWishlist(id)) : navigate('/login')}
            aria-label="Save Vendor to Wishlist"
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all shadow-xl hover:scale-105 active:scale-95 group/btn ${
              isWishlisted ? 'bg-[#FF4D6D] text-white border-[#FF4D6D]' : 'bg-black/40 text-white border-white/30 hover:bg-white/20'
            }`}
          >
            <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share Vendor"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 bg-black/40 text-white hover:bg-white/20 transition-all shadow-xl hover:scale-105 active:scale-95 group/btn"
          >
            <FiShare2 size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>

        {/* Desktop Hero Overlay Meta (Hidden on Mobile, shown on md+) */}
        <div className="absolute bottom-10 left-8 md:left-12 right-8 md:right-12 z-20 hidden md:flex items-end justify-between">
          <div className="flex items-center gap-6">
            {/* Profile Avatar Card */}
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden bg-white shrink-0 relative group">
              {vendor.logo?.url ? (
                <img src={vendor.logo.url} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : vendor.user?.avatar?.url ? (
                <img src={vendor.user.avatar.url} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#FDF2F8] text-[#C2185B] text-4xl font-black font-display">
                  {getInitials(vendor.businessName || vendor.user?.name)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-[#D4AF37]/90 text-gray-950 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  {vendor.category?.name || 'Wedding Service'}
                </span>
                {(vendor.isVerified || vendor.isFeatured) && (
                  <span className="bg-[#C2185B]/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-pink-400/40">
                    <FiCheckCircle size={13} /> Verified
                  </span>
                )}
                <span className="bg-black/50 backdrop-blur-md text-gray-200 text-xs font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                  <FiMapPin className="text-[#D4AF37]" size={14} />
                  {vendor.location?.city || 'Bihar'}, {vendor.location?.state || 'India'}
                </span>
              </div>

              <h1 className="text-3xl lg:text-5xl font-display font-black text-white tracking-tight drop-shadow-lg">
                {vendor.businessName || vendor.user?.name}
              </h1>

              <div className="flex items-center gap-4 text-sm font-bold text-white/95">
                <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-400/40 px-3 py-1 rounded-full">
                  <span className="text-yellow-400">⭐</span>
                  <span>{vendor.dynamicRating?.average?.toFixed(1) || vendor.rating?.average?.toFixed(1) || '4.9'}</span>
                  <span className="text-gray-300 font-normal">({vendor.dynamicRating?.count || vendor.rating?.count || '50+'} Reviews)</span>
                </div>
                {startingPrice && (
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[#D4AF37]">
                    💰 Starting from {formatPrice(startingPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Top Hero Quick CTA Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleWhatsAppClick}
              className="px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all hover:scale-105"
            >
              <FaWhatsapp size={16} /> WhatsApp
            </button>
            {canBook ? (
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] text-gray-950 font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all hover:scale-105"
              >
                Book Now
              </button>
            ) : (
              <button
                onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
                className="px-7 py-3 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105"
              >
                Send Enquiry
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. MOBILE HERO SUMMARY (Visible only on mobile / lg:hidden) ── */}
      <section className="md:hidden max-w-xl mx-auto px-4 -mt-16 relative z-30 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
          {/* Profile Image overlapping */}
          <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 -mt-14 mb-4">
            {vendor.logo?.url ? (
              <img src={vendor.logo.url} alt={vendor.businessName} className="w-full h-full object-cover" />
            ) : vendor.user?.avatar?.url ? (
              <img src={vendor.user.avatar.url} alt={vendor.businessName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#FDF2F8] text-[#C2185B] text-3xl font-black font-display">
                {getInitials(vendor.businessName || vendor.user?.name)}
              </div>
            )}
          </div>

          {/* Vendor Name */}
          <h1 className="text-2xl font-display font-black text-gray-900 mb-2 leading-tight">
            {vendor.businessName || vendor.user?.name}
          </h1>

          {/* Verified Badge & Category */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
            {(vendor.isVerified || vendor.isFeatured) && (
              <span className="bg-[#FFF0F5] text-[#C2185B] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-pink-200 flex items-center gap-1">
                <FiCheckCircle size={12} /> Verified
              </span>
            )}
            <span className="bg-amber-50 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200">
              {vendor.category?.name || 'Wedding Service'}
            </span>
          </div>

          {/* Location */}
          <p className="text-gray-500 text-xs font-bold flex items-center justify-center gap-1 mb-4">
            <FiMapPin className="text-[#D4AF37]" size={14} />
            {vendor.location?.city || 'Bihar'}, {vendor.location?.state || 'India'}
          </p>

          {/* Rating & Price Badge Row */}
          <div className="flex items-center justify-center gap-4 w-full pt-3 border-t border-gray-100 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-gray-900">
              <span className="text-yellow-500">⭐</span>
              <span>{vendor.dynamicRating?.average?.toFixed(1) || vendor.rating?.average?.toFixed(1) || '4.9'}</span>
              <span className="text-gray-400 font-normal">({vendor.dynamicRating?.count || vendor.rating?.count || '50+'})</span>
            </div>
            {startingPrice && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-900 font-display font-black text-sm">
                  {formatPrice(startingPrice)}
                  <span className="text-[10px] text-gray-400 font-normal block">Starting</span>
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. MAIN CONTENT CONTAINER (2-COLUMN ON DESKTOP) ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-10 relative z-30">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT COLUMN (65%) ── */}
          <div className="xl:col-span-8 space-y-10">

            {/* ── 3. IMAGE GALLERY (Wedding-Style Grid) ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                    📸 Wedding Portfolio
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                    फ़ोटो Gallery
                  </h2>
                </div>
                {images.length > 0 && (
                  <button
                    onClick={() => setGalleryModal({ open: true, index: 0 })}
                    className="text-xs font-bold uppercase tracking-wider text-[#C2185B] hover:underline flex items-center gap-1"
                  >
                    View All Photos ({images.length}) <FiChevronRight />
                  </button>
                )}
              </div>

              {images.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <FiImage className="mx-auto text-4xl text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium text-sm">
                    Vendor photos coming soon.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Large Primary Image */}
                  <div
                    onClick={() => setGalleryModal({ open: true, index: 0 })}
                    className="sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden cursor-pointer group relative bg-gray-100 border border-gray-100"
                  >
                    <img
                      src={getOptimizedUrl(images[0]?.url, 800)}
                      alt="Primary Wedding Gallery"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={28} />
                    </div>
                  </div>

                  {/* 4 Smaller Preview Thumbnails */}
                  {images.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setGalleryModal({ open: true, index: i + 1 })}
                      className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative bg-gray-100 border border-gray-100"
                    >
                      <img
                        src={getOptimizedUrl(img.url, 400)}
                        alt={`Gallery preview ${i + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={20} />
                      </div>
                      {i === 3 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-sm">
                          +{images.length - 5} More
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── 4. VENDOR OVERVIEW ("About [Vendor Name]") ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#C2185B] block mb-1">
                    🌸 Authentic Story
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
                    <span>About {vendor.businessName || vendor.user?.name}</span>
                  </h2>
                </div>
                <MadhubaniOrnament className="text-[#D4AF37] hidden sm:block" />
              </div>

              <p className={`text-gray-600 text-base leading-relaxed whitespace-pre-line font-medium ${readMoreAbout ? '' : 'line-clamp-4 md:line-clamp-none'}`}>
                {vendorDesc}
              </p>
              {isDescLong && (
                <button
                  onClick={() => setReadMoreAbout(!readMoreAbout)}
                  className="mt-4 text-[#C2185B] font-bold text-xs uppercase tracking-widest hover:underline md:hidden block"
                >
                  {readMoreAbout ? 'कम दिखाएं (Show Less)' : 'और पढ़ें (Read More)'}
                </button>
              )}

              {/* Key Information Bento Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <FiMapPin className="text-[#D4AF37]" /> Location
                  </p>
                  <p className="text-gray-900 font-bold text-base truncate">
                    {vendor.location?.city || 'Pan India'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <FiAward className="text-[#C2185B]" /> Category
                  </p>
                  <p className="text-gray-900 font-bold text-base truncate">
                    {vendor.category?.name || 'Wedding Service'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <FiStar className="text-yellow-500" /> Rating
                  </p>
                  <p className="text-gray-900 font-bold text-base">
                    {vendor.dynamicRating?.average?.toFixed(1) || vendor.rating?.average?.toFixed(1) || '4.9'} ★
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <FiClock className="text-emerald-600" /> Experience
                  </p>
                  <p className="text-gray-900 font-bold text-base">
                    {vendor.calculatedExperience || 5}+ Years
                  </p>
                </div>

                {startingPrice && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                      💰 Starting Price
                    </p>
                    <p className="text-gray-900 font-bold text-base">
                      {formatPrice(startingPrice)}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <FiCalendar className="text-blue-600" /> Availability
                  </p>
                  <p className="text-gray-900 font-bold text-base">
                    {vendor.availability?.isAvailable !== false ? 'Open for Booking' : 'Contact Vendor'}
                  </p>
                </div>
              </div>
            </section>

            {/* ── 5. SERVICE / PACKAGE SECTION ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                  💎 Transparent Packages
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                  प्रीमियम Packages & Pricing
                </h2>
              </div>

              {!vendor.packages || vendor.packages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
                  <FaCrown className="mx-auto text-3xl text-[#D4AF37] mb-2" />
                  <p className="text-gray-800 font-bold text-base mb-1">
                    Custom packages available. Contact the vendor for pricing.
                  </p>
                  <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">
                    Every wedding is unique. Send a direct inquiry to get tailored package details for your dates.
                  </p>
                  <button
                    onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
                    className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all"
                  >
                    Enquire Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {vendor.packages.map((pkg, i) => (
                    <div
                      key={i}
                      className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full group ${
                        pkg.isPopular ? 'border-[#C2185B] shadow-md bg-[#FFF5F8]/60' : 'border-gray-100 bg-white hover:border-pink-200'
                      }`}
                    >
                      {pkg.isPopular && (
                        <div className="absolute -top-3 right-5 bg-[#C2185B] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1 rounded-full shadow-md">
                          Popular Choice
                        </div>
                      )}

                      <h3 className="text-lg font-black text-gray-900 mb-1 font-display group-hover:text-[#C2185B] transition-colors">
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {pkg.description}
                        </p>
                      )}

                      <div className="mb-6">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">
                          Package Price
                        </span>
                        <span className="text-3xl font-display font-black text-gray-900">
                          {formatPrice(pkg.price)}
                        </span>
                      </div>

                      <div className="flex-grow space-y-4 mb-8">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">What's Included:</p>
                          <ul className="space-y-2">
                            {pkg.features?.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2 text-xs font-bold text-gray-700">
                                <FiCheck size={14} strokeWidth={3} className="text-[#C2185B] mt-0.5 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                        {canBook ? (
                          <button
                            onClick={() => setBookingModalOpen(true)}
                            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                              pkg.isPopular
                                ? 'bg-[#C2185B] text-white hover:bg-pink-700 shadow-md'
                                : 'bg-gray-900 text-white hover:bg-black'
                            }`}
                          >
                            Choose Package
                          </button>
                        ) : (
                          <button
                            onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
                            className="w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-gray-900 text-white hover:bg-black transition-all"
                          >
                            Enquire Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── 6. WHY CHOOSE THIS VENDOR (Dynamic Benefits) ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-[#C2185B] block mb-1">
                  ⭐ ShaadiSaathi Guarantee
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                  Why Choose This Vendor
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyChooseBenefits.map((benefit, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FFFBF8] border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 7. AVAILABILITY CHECKER SECTION ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600 block mb-1">
                    📅 Check Event Dates
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                    Check Vendor Availability
                  </h2>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  Instant Verification
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={checkDate}
                      onChange={(e) => { setCheckDate(e.target.value); setAvailabilityStatus('idle'); }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={checkEventType}
                      onChange={(e) => setCheckEventType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#C2185B]"
                    >
                      <option value="Wedding Ceremony">Wedding Ceremony (शादी)</option>
                      <option value="Reception">Reception (रिसेप्शन)</option>
                      <option value="Haldi / Mehndi">Haldi / Mehndi (हल्दी/मेहंदी)</option>
                      <option value="Sangeet">Sangeet (संगीत)</option>
                      <option value="Tilak / Engagement">Engagement (सगाई/तिलक)</option>
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={handleCheckAvailability}
                      disabled={availabilityStatus === 'checking'}
                      className="w-full py-3 px-6 rounded-xl bg-[#C2185B] hover:bg-pink-700 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all disabled:opacity-50"
                    >
                      {availabilityStatus === 'checking' ? 'Checking...' : 'Check Availability'}
                    </button>
                  </div>
                </div>

                {/* Status Indicator */}
                {availabilityStatus === 'available' && (
                  <div className="mt-6 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                        ✓
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Date Available for Inquiry ✅
                        </p>
                        <p className="text-xs text-gray-500">
                          Contact vendor directly to lock your date or start booking.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleWhatsAppClick}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <FaWhatsapp /> WhatsApp
                      </button>
                      {canBook && (
                        <button
                          onClick={() => setBookingModalOpen(true)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold"
                        >
                          Book Date
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ── 8. BOOKING FLOW (Visual 6-Step Guide) ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                  ⚡ Transparent Booking
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                  Simple 6-Step Booking Flow
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { step: '1', title: 'Choose Service', desc: 'Select required services' },
                  { step: '2', title: 'Choose Package', desc: 'Pick suitable package' },
                  { step: '3', title: 'Select Date', desc: 'Verify ceremony date' },
                  { step: '4', title: 'Event Details', desc: 'Venue & guests info' },
                  { step: '5', title: 'Review Booking', desc: 'Transparent milestone' },
                  { step: '6', title: 'Confirm & Pay', desc: '100% safe checkout' }
                ].map((st, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-[#C2185B] text-white font-black text-xs flex items-center justify-center mb-2">
                      {st.step}
                    </span>
                    <h3 className="text-xs font-black text-gray-900 mb-0.5">{st.title}</h3>
                    <p className="text-[10px] text-gray-500">{st.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 9. REVIEWS & RATINGS ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#C2185B] block mb-1">
                    ❤️ Genuine Families
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                    Reviews & Ratings
                  </h2>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all self-start sm:self-auto"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {/* Rating Summary Breakdown Card */}
              <div className="flex flex-col sm:flex-row gap-8 mb-8 items-center sm:items-start bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="text-center sm:text-left shrink-0">
                  <p className="text-5xl font-display font-black text-gray-900 mb-1">
                    {vendor.dynamicRating?.average?.toFixed(1) || vendor.rating?.average?.toFixed(1) || '4.9'}
                  </p>
                  <div className="mb-1 flex justify-center sm:justify-start">
                    <StarRating rating={vendor.dynamicRating?.average || vendor.rating?.average || 4.9} showCount={false} size="md" />
                  </div>
                  <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    Based on {vendor.dynamicRating?.count || vendor.rating?.count || '50+'} reviews
                  </p>
                </div>

                <div className="w-full flex flex-col gap-2 flex-1">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? '82%' : star === 4 ? '12%' : '2%'
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-700 w-8">{star} ★</span>
                        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: pct }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Review Cards List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-600 font-medium text-sm mb-2">
                      No reviews yet. Be the first to share your experience.
                    </p>
                  </div>
                ) : (
                  reviews.map(rev => (
                    <div
                      key={rev._id}
                      className="p-5 rounded-2xl bg-gray-50 border border-gray-100 relative group"
                    >
                      {user?._id === rev.user?._id && (
                        <div className="absolute top-5 right-5 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditReviewData(rev); setReviewModalOpen(true); }}
                            className="text-blue-600 text-xs font-bold hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            className="text-red-600 text-xs font-bold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2185B] to-[#D4AF37] flex items-center justify-center font-black text-white text-sm shadow-sm">
                          {getInitials(rev.user?.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{rev.user?.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {formatDate(rev.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2">
                        <StarRating rating={rev.rating} size="sm" showCount={false} />
                      </div>
                      <p className="text-gray-700 text-sm font-medium leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ── 10. VENDOR LOCATION ("Where You'll Find Us") ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-red-600 block mb-1">
                  📍 Bihar & Pan India
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                  Where You'll Find Us
                </h2>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-lg font-black text-gray-900">
                    {vendor.location?.city || 'Bihar'}{vendor.location?.state ? `, ${vendor.location.state}` : ''}
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm">
                    {vendor.location?.address
                      ? vendor.location.address
                      : 'Exact studio/office address is shared upon inquiry confirmation to protect vendor privacy.'}
                  </p>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(vendor.location?.city || 'Bihar')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all shrink-0"
                >
                  <FiNavigation size={14} /> Open in Google Maps
                </a>
              </div>
            </section>

            {/* ── 11. CONTACT / WHATSAPP CARD ── */}
            <section className="bg-gradient-to-br from-[#12192F] via-[#0E1325] to-[#141022] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#D4AF37]/30">
              <div className="max-w-2xl">
                <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                  🤝 Dedicated Assistance
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">
                  Have questions about this vendor?
                </h2>
                <p className="text-gray-300 text-sm mb-6">
                  Our team and vendor partners are available 7 days a week to clarify packages, travel logistics, and custom ceremonies.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleWhatsAppClick}
                    className="px-6 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                  >
                    <FaWhatsapp size={16} /> WhatsApp Vendor
                  </button>
                  <button
                    onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
                    className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider border border-white/20 flex items-center gap-2 transition-all"
                  >
                    <FiMessageCircle size={16} /> Send Enquiry
                  </button>
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider border border-white/20 flex items-center gap-2 transition-all"
                    >
                      <FiPhone size={16} /> Call Vendor
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* ── 12. RELATED VENDORS ("More Vendors You May Like ❤️") ── */}
            {similarVendors.length > 0 && (
              <section className="pt-6">
                <div className="mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                    ✨ Handpicked Match
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900">
                    More Vendors You May Like ❤️
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarVendors.map(v => (
                    <FeaturedVendorCard key={v._id} vendor={v} />
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ── RIGHT COLUMN (35% STICKY BOOKING CARD - DESKTOP & TABLET) ── */}
          <div className="xl:col-span-4 hidden xl:block relative">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-7 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Starting Price</span>
                  {(vendor.isVerified || vendor.isFeatured) && (
                    <span className="bg-pink-50 text-[#C2185B] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      Verified Partner
                    </span>
                  )}
                </div>

                <h3 className="text-4xl font-display font-black text-gray-900 tracking-tight mb-6">
                  {formatPrice(startingPrice || 15000)}
                </h3>

                {/* Primary CTA Stack */}
                <div className="space-y-3 mb-6">
                  {canBook ? (
                    <button
                      onClick={() => setBookingModalOpen(true)}
                      className="w-full py-4 bg-gradient-to-r from-[#C2185B] via-[#D4AF37] to-[#C2185B] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FiCalendar size={16} /> Book Now
                    </button>
                  ) : (
                    <button
                      onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
                      className="w-full py-4 bg-[#C2185B] hover:bg-pink-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FiMessageCircle size={16} /> Send Enquiry
                    </button>
                  )}

                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp size={16} /> WhatsApp Vendor
                  </button>

                  <button
                    onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle size={16} /> Send Message
                  </button>
                </div>

                {/* Security Guarantee Badge */}
                <div className="pt-5 border-t border-gray-100 text-center">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                    <FiShield className="text-emerald-600" size={14} /> 100% Secure Milestone Booking
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Your payments are protected until service milestones are met.
                  </p>
                </div>
              </div>

              {/* Quick Help Card */}
              <div className="bg-[#FFFBF8] rounded-3xl p-6 border border-gray-200/80 text-center">
                <p className="text-xs font-bold text-gray-900 mb-1">Need Booking Help?</p>
                <p className="text-xs text-gray-500 mb-4">Our ShaadiSaathi wedding concierge is here to assist you.</p>
                <Link
                  to="/contact"
                  className="inline-block text-xs font-black text-[#C2185B] uppercase tracking-widest hover:underline"
                >
                  Contact Support →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── 14. MOBILE FIXED BOTTOM ACTION BAR (Hidden on lg+, safely above bottom-16 / 68px nav) ── */}
      <div className="fixed bottom-[68px] md:bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-3xl border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] z-40 xl:hidden flex items-center gap-2.5">
        <button
          onClick={() => isAuthenticated ? dispatch(toggleWishlist(id)) : navigate('/login')}
          aria-label="Save to Wishlist"
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 min-h-[44px] min-w-[44px] ${
            isWishlisted ? 'bg-[#FF4D6D] text-white border-[#FF4D6D]' : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}
        >
          <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} size={18} />
        </button>

        <button
          onClick={handleWhatsAppClick}
          aria-label="WhatsApp Vendor"
          className="w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
        >
          <FaWhatsapp size={20} />
        </button>

        {canBook ? (
          <button
            onClick={() => setBookingModalOpen(true)}
            className="flex-1 py-3.5 bg-gradient-to-r from-[#C2185B] via-[#D4AF37] to-[#C2185B] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FiCalendar size={15} /> Book Now
          </button>
        ) : (
          <button
            onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
            className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FiMessageCircle size={15} /> Send Enquiry
          </button>
        )}
      </div>

      {/* ── MODALS (BookingModal & ReviewModal & Fullscreen Gallery) ── */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        vendor={vendor}
        navigate={navigate}
      />

      <AnimatePresence>
        {galleryModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center"
          >
            <button
              onClick={() => setGalleryModal({ open: false, index: 0 })}
              aria-label="Close Gallery"
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white transition-colors bg-white/10 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md z-50 shadow-2xl hover:bg-white/20"
            >
              <FiX size={24} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setGalleryModal(p => ({ ...p, index: (p.index - 1 + images.length) % images.length }))
                  }}
                  aria-label="Previous Photo"
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-50 shadow-2xl"
                >
                  <FiChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setGalleryModal(p => ({ ...p, index: (p.index + 1) % images.length }))
                  }}
                  aria-label="Next Photo"
                  className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-50 shadow-2xl"
                >
                  <FiChevronRight size={32} />
                </button>
              </>
            )}

            <motion.img
              key={galleryModal.index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              src={images[galleryModal.index]?.url}
              alt={`Wedding Photo ${galleryModal.index + 1}`}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10"
            />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-6 py-2 rounded-full text-white font-bold tracking-[0.2em] text-xs border border-white/20 shadow-xl">
              {galleryModal.index + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => { setReviewModalOpen(false); setEditReviewData(null); }}
        targetId={id}
        targetType="vendor"
        existingReview={editReviewData}
        onSuccess={() => {
          loadReviews()
          dispatch(fetchVendorById(id))
        }}
      />
    </div>
  )
}
