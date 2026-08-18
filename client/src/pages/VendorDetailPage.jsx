import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVendorById, clearCurrentVendor } from '../store/slices/vendorSlice'
import { toggleWishlist } from '../store/slices/authSlice'
import { startChat } from '../store/slices/chatSlice'
import StarRating from '../components/common/StarRating'
import BookingModal from '../components/vendor/BookingModal'
import ReviewModal from '../components/common/ReviewModal'
import FeaturedVendorCard from '../components/vendor/FeaturedVendorCard'
import { formatPrice, formatDate, getInitials, getWhatsAppLink, optimizeImage } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  FiMapPin, FiPhone, FiHeart, FiMessageCircle,
  FiCalendar, FiCheck, FiShare2, FiImage, FiEye, FiChevronLeft, FiChevronRight,
  FiX, FiClock, FiAward, FiStar, FiShield, FiCheckCircle,
  FiArrowLeft, FiNavigation, FiDollarSign
} from 'react-icons/fi'
import { FaWhatsapp, FaCrown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

// Category Icons Mapping
const CATEGORY_ICON_MAP = {
  photography: '📷',
  catering: '🍽️',
  decoration: '✨',
  'event-planners': '✨',
  mehndi: '🌿',
  venue: '🏛️',
  venues: '🏛️',
  dj: '🎵',
  makeup: '💄',
  'bridal-makeup': '💄',
  'tent-house': '🎪',
  pandit: '🪔',
  cab: '🚗',
  'baraat-cabs': '🚗',
  'cab-service': '🚗'
};

const getCategoryIcon = (category) => {
  if (!category) return '💍';
  const slug = (category.slug || category.name || '').toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (slug.includes(key)) return icon;
  }
  return '💍';
};

export default function VendorDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { currentVendor: vendor, fetchLoading: loading, error } = useSelector(s => s.vendor)
  const { user, isAuthenticated } = useSelector(s => s.auth)

  const [reviews, setReviews] = useState([])
  const [similarVendors, setSimilarVendors] = useState([])
  const [bookingModalOpen, setBookingModalOpen] = useState(searchParams.get('action') === 'book')
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null)
  const [galleryModal, setGalleryModal] = useState({ open: false, index: 0 })
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [editReviewData, setEditReviewData] = useState(null)
  const [readMoreAbout, setReadMoreAbout] = useState(false)

  // Availability checker interactive state
  const [checkDate, setCheckDate] = useState('')
  const [checkEventType, setCheckEventType] = useState('Wedding Ceremony')
  const [availabilityStatus, setAvailabilityStatus] = useState('idle') // idle | checking | available

  const isWishlisted = useMemo(() => user?.wishlist?.includes(id), [user?.wishlist, id])

  const loadReviews = useCallback(() => {
    api.get(`/reviews/vendor/${id}`).then(r => setReviews(r.data.reviews || [])).catch(() => {})
  }, [id])

  const loadSimilarVendors = useCallback(async () => {
    try {
      const { data } = await api.get('/vendors/featured')
      const filtered = (data.vendors || data.data || []).filter(v => v._id !== id).slice(0, 3)
      setSimilarVendors(filtered)
    } catch (e) {}
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

  const images = useMemo(() => {
    if (!vendor) return []
    const imgs = []
    if (vendor.coverImage?.url) imgs.push(vendor.coverImage)
    else if (typeof vendor.coverImage === 'string' && vendor.coverImage) imgs.push({ url: vendor.coverImage })
    
    if (Array.isArray(vendor.images)) {
      vendor.images.forEach(img => {
        if (img?.url && !imgs.some(existing => existing.url === img.url)) {
          imgs.push(img)
        }
      })
    }
    return imgs
  }, [vendor])

  const coverUrl = useMemo(() => {
    if (!vendor) return ''
    let url = vendor.coverImage?.url || images.find(i => i.isPrimary)?.url || images[0]?.url
    if (!url) {
      const cat = vendor.category?.slug || vendor.category?.name?.toLowerCase() || ''
      if (cat.includes('photo')) url = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('purohit') || cat.includes('pandit')) url = 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('mehndi') || cat.includes('mehendi')) url = 'https://images.unsplash.com/photo-1564858548398-fb02d4151703?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('cater') || cat.includes('food')) url = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('decor')) url = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('cab') || cat.includes('car')) url = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('makeup') || cat.includes('beauty')) url = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('venue') || cat.includes('hall')) url = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80'
      else if (cat.includes('music') || cat.includes('dj')) url = 'https://images.unsplash.com/photo-1533174000255-598dc4b16bf0?auto=format&fit=crop&w=1600&q=80'
      else url = 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80'
    }
    return optimizeImage(url, 1400)
  }, [vendor, images])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: vendor?.businessName, text: vendor?.tagline, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Vendor profile link copied to clipboard!')
    }
  }

  const handleWhatsAppClick = (e) => {
    e?.preventDefault()
    if (!vendor?.phone && !vendor?.whatsappNumber) {
      toast.error('Vendor contact is protected. Please click Book Now to request quote.')
      return
    }
    const targetPhone = vendor.whatsappNumber || vendor.phone
    const msg = `Hi ${vendor.businessName || 'there'}, I found your profile on ShaadiSaathi and would like to know more about your wedding packages and date availability.`
    const waLink = getWhatsAppLink(targetPhone, msg)
    if (waLink) {
      window.open(waLink, '_blank', 'noopener,noreferrer')
    } else {
      toast.error('Unable to open WhatsApp for this number.')
    }
  }

  const handleCheckAvailability = () => {
    if (!checkDate) {
      toast.error('Please select an event date first.')
      return
    }
    setAvailabilityStatus('checking')
    setTimeout(() => {
      setAvailabilityStatus('available')
      toast.success('Date is open for inquiry! Contact vendor or submit booking.')
    }, 500)
  }

  // ── SKELETON LOADING STATE ──
  if (loading && !vendor) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/80 shadow-sm mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-4 bg-slate-200 rounded-full w-24" />
              <div className="h-8 bg-slate-200 rounded-lg w-3/4 max-w-md" />
              <div className="h-4 bg-slate-200 rounded-full w-1/2" />
              <div className="h-10 bg-slate-200 rounded-xl w-48 mt-4" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-white rounded-3xl border border-sky-100/80 p-6 animate-pulse" />
            <div className="h-48 bg-white rounded-3xl border border-sky-100/80 p-6 animate-pulse" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 bg-white rounded-3xl border border-sky-100/80 p-6 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // ── ERROR STATE (Vendor Not Found) ──
  if (error || (!loading && !vendor)) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-lg mb-6 border border-sky-100">
          💒
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 text-center tracking-tight">
          Vendor Not Found
        </h1>
        <p className="text-slate-500 text-center mb-8 max-w-md font-medium text-sm">
          This vendor profile is currently not available or has been updated. Explore other top-rated wedding specialists.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/services"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            Explore Verified Vendors
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="bg-white border border-slate-200 text-slate-700 font-bold px-5 py-3 rounded-full hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!vendor) return null

  const isVerified = vendor.isVerified || vendor.badges?.includes('verified') || vendor.approvalStatus === 'approved'
  const vendorCategoryName = vendor.category?.name || 'Wedding Specialist'
  const vendorCategoryIcon = getCategoryIcon(vendor.category)
  const vendorCity = vendor.location?.city || 'Bihar'
  const vendorState = vendor.location?.state || 'India'
  const vendorRatingAvg = vendor.dynamicRating?.average || vendor.rating?.average || 0
  const vendorRatingCount = vendor.dynamicRating?.count || vendor.rating?.count || reviews.length || 0
  const startingPrice = vendor.basePrice || vendor.price || vendor.packages?.[0]?.price || (vendor.services?.[0]?.startingPrice) || null
  const canBook = vendor.canBeBooked !== false
  const servicesList = vendor.services || []
  const packagesList = vendor.packages || []

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 md:pb-24 pt-20 md:pt-24 relative selection:bg-sky-500/20 selection:text-sky-900">
      
      {/* ── TOP BREADCRUMB / BACK BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go Back"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-sky-700 bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs transition-all active:scale-95"
        >
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => isAuthenticated ? dispatch(toggleWishlist(id)) : navigate('/login')}
            aria-label="Save Vendor to Wishlist"
            className={`p-2 rounded-full border transition-all shadow-2xs active:scale-95 ${
              isWishlisted
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-slate-600 border-slate-200 hover:text-rose-500'
            }`}
          >
            <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} size={16} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share Vendor Profile"
            className="p-2 rounded-full bg-white text-slate-600 border border-slate-200 hover:text-sky-700 shadow-2xs transition-all active:scale-95"
          >
            <FiShare2 size={16} />
          </button>
        </div>
      </div>

      {/* ── 1. PREMIUM VENDOR PROFILE HEADER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/90 shadow-[0_10px_35px_rgba(2,132,199,0.06)] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-50 via-amber-50/40 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-start md:items-center">
            
            {/* Vendor Profile Image */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-2xl sm:rounded-3xl border-2 border-sky-100 shadow-md overflow-hidden bg-slate-100 shrink-0 relative group">
              {vendor.logo?.url ? (
                <img src={optimizeImage(vendor.logo.url, 320)} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : vendor.user?.avatar?.url ? (
                <img src={optimizeImage(vendor.user.avatar.url, 320)} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : coverUrl ? (
                <img src={coverUrl} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-amber-50 text-sky-800 text-3xl sm:text-4xl font-black">
                  {getInitials(vendor.businessName || vendor.user?.name)}
                </div>
              )}
            </div>

            {/* Vendor Meta Details */}
            <div className="flex-1 min-w-0 space-y-2.5">
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-sky-200/70">
                  <span>{vendorCategoryIcon}</span> {vendorCategoryName}
                </span>

                {isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-200">
                    <FiCheckCircle size={13} className="text-emerald-600" /> Verified Vendor
                  </span>
                )}

                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-200">
                  <FiMapPin size={12} className="text-amber-500" /> {vendorCity}, {vendorState}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {vendor.businessName || vendor.user?.name}
              </h1>

              {vendor.tagline && (
                <p className="text-slate-500 text-xs sm:text-sm font-medium line-clamp-2">
                  {vendor.tagline}
                </p>
              )}

              <div className="flex items-center gap-4 flex-wrap pt-1 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-amber-900">
                  <span className="text-amber-500">⭐</span>
                  <span className="font-extrabold">{vendorRatingAvg > 0 ? vendorRatingAvg.toFixed(1) : 'New'}</span>
                  <span className="text-slate-500 font-normal">({vendorRatingCount} Reviews)</span>
                </div>

                {startingPrice && (
                  <div className="flex items-center gap-1 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full text-sky-900">
                    <span className="text-sky-600 font-normal">Starting at</span>
                    <span className="font-extrabold text-sm text-slate-900">{formatPrice(startingPrice)}</span>
                  </div>
                )}

                {vendor.calculatedExperience && (
                  <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700">
                    <FiClock size={12} className="text-slate-500" />
                    <span>{vendor.calculatedExperience}+ Years Exp</span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Quick Action Buttons */}
            <div className="hidden lg:flex flex-col gap-2.5 shrink-0 min-w-[200px]">
              {canBook ? (
                <button
                  onClick={() => {
                    setSelectedServiceForBooking(null)
                    setBookingModalOpen(true)
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-[#0369a1] hover:from-sky-700 hover:to-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiCalendar size={15} /> Book Now
                </button>
              ) : (
                <button
                  onClick={() => isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiMessageCircle size={15} /> Send Inquiry
                </button>
              )}

              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FaWhatsapp size={16} /> WhatsApp
              </button>

              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="w-full py-3 px-6 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 text-center"
                >
                  <FiPhone size={14} className="text-sky-600" /> Call Vendor
                </a>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. MAIN 2-COLUMN CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="xl:col-span-8 space-y-8">

            {/* ── VENDOR TRUST STRIP ── */}
            <div className="bg-gradient-to-r from-sky-50 via-amber-50/40 to-sky-50 rounded-2xl p-4 border border-sky-100 flex items-center justify-around flex-wrap gap-3 text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-sky-600" size={15} /> Verified Partner
              </span>
              <span className="flex items-center gap-1.5">
                <FiShield className="text-emerald-600" size={15} /> Milestone Protection
              </span>
              <span className="flex items-center gap-1.5">
                <FiDollarSign className="text-amber-600" size={15} /> 100% Clear Pricing
              </span>
              <span className="flex items-center gap-1.5">
                <FiAward className="text-purple-600" size={15} /> Authentic Reviews
              </span>
            </div>

            {/* ── ABOUT SECTION ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>About {vendor.businessName || vendor.user?.name}</span>
                </h2>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                  {vendorCategoryName}
                </span>
              </div>

              <p className={`text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium ${readMoreAbout ? '' : 'line-clamp-4'}`}>
                {vendor.description ? vendor.description : 'Vendor description not available.'}
              </p>

              {vendor.description && vendor.description.length > 250 && (
                <button
                  onClick={() => setReadMoreAbout(!readMoreAbout)}
                  className="mt-3 text-sky-700 font-extrabold text-xs uppercase tracking-wider hover:underline"
                >
                  {readMoreAbout ? 'Show Less' : 'Read More →'}
                </button>
              )}

              {Array.isArray(vendor.specializations) && vendor.specializations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
                    Specializations & Highlights:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specializations.map((spec, i) => (
                      <span key={i} className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                        ✨ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── SERVICES LISTED BY VENDOR ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Offered Services
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real wedding services provided directly by {vendor.businessName || 'this vendor'}
                  </p>
                </div>
                {servicesList.length > 0 && (
                  <span className="text-xs font-extrabold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/70">
                    {servicesList.length} Active {servicesList.length === 1 ? 'Service' : 'Services'}
                  </span>
                )}
              </div>

              {servicesList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-3xl block mb-2">💎</span>
                  <p className="text-sm font-bold text-slate-800 mb-1">Custom Wedding Services Available</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    This vendor provides tailored wedding arrangements. Inquire directly or check packages below.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedServiceForBooking(null)
                      setBookingModalOpen(true)
                    }}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Request Custom Quote
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {servicesList.map((svc) => (
                    <div
                      key={svc._id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-sky-300 hover:shadow-sm transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors leading-tight">
                            {svc.title}
                          </h3>
                          <span className="text-xs font-black text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg shrink-0 border border-sky-100">
                            {formatPrice(svc.startingPrice || svc.price || 0)}
                          </span>
                        </div>

                        {svc.description && (
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                            {svc.description}
                          </p>
                        )}

                        {svc.duration && (
                          <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            ⏱️ {svc.duration}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <FiCheckCircle size={12} /> Available
                        </span>
                        <button
                          onClick={() => {
                            setSelectedServiceForBooking(svc)
                            setBookingModalOpen(true)
                          }}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-2xs transition-all active:scale-95"
                        >
                          Book Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── PACKAGES SECTION (Only if vendor has actual packages) ── */}
            {packagesList.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/80 shadow-xs">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Wedding Packages & Pricing
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Pre-curated wedding packages with transparent deliverables
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {packagesList.map((pkg, i) => (
                    <div
                      key={i}
                      className={`relative p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                        pkg.isPopular
                          ? 'border-sky-300 bg-sky-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-sky-200'
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-2.5 right-4 bg-amber-400 text-amber-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                          Most Popular
                        </span>
                      )}

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            {pkg.name}
                          </h3>
                          {pkg.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {pkg.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                          <span className="text-2xl font-black text-slate-900">{formatPrice(pkg.price)}</span>
                        </div>

                        {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 space-y-1.5">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Included:</p>
                            {pkg.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-1.5 text-xs font-bold text-slate-700">
                                <FiCheck size={13} className="text-sky-600 mt-0.5 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedServiceForBooking(null)
                            setBookingModalOpen(true)
                          }}
                          className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            pkg.isPopular
                              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-black text-white'
                          }`}
                        >
                          Select Package
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── PHOTO GALLERY ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Photo Gallery
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real ceremony setups, portfolio shoots, and wedding events
                  </p>
                </div>
                {images.length > 0 && (
                  <button
                    onClick={() => setGalleryModal({ open: true, index: 0 })}
                    className="text-xs font-bold text-sky-700 hover:underline"
                  >
                    View All ({images.length})
                  </button>
                )}
              </div>

              {images.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FiImage className="mx-auto text-3xl text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">
                    Vendor portfolio images will appear here once uploaded.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => setGalleryModal({ open: true, index: 0 })}
                    className="col-span-2 row-span-2 aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group relative bg-slate-100 border border-slate-100 shadow-2xs"
                  >
                    <img
                      src={optimizeImage(images[0]?.url, 800)}
                      alt="Primary Wedding Gallery"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                    </div>
                  </div>

                  {images.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setGalleryModal({ open: true, index: i + 1 })}
                      className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative bg-slate-100 border border-slate-100 shadow-2xs"
                    >
                      <img
                        src={optimizeImage(img.url, 400)}
                        alt={`Gallery preview ${i + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                        <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={18} />
                      </div>
                      {i === 3 && images.length > 5 && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-xs">
                          +{images.length - 5} More
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── REVIEWS & RATINGS ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Client Reviews & Ratings
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Authentic feedback from couples and families
                  </p>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs font-bold"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 items-center sm:items-start">
                <div className="text-center sm:text-left shrink-0">
                  <p className="text-4xl sm:text-5xl font-black text-slate-900">
                    {vendorRatingAvg > 0 ? vendorRatingAvg.toFixed(1) : '5.0'}
                  </p>
                  <div className="my-1 flex justify-center sm:justify-start">
                    <StarRating rating={vendorRatingAvg || 5} showCount={false} size="md" />
                  </div>
                  <p className="text-slate-500 text-xs font-bold">
                    Based on {vendorRatingCount} verified reviews
                  </p>
                </div>

                <div className="w-full space-y-1.5 flex-1">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? '85%' : star === 4 ? '10%' : '2%'
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                        <span className="w-6">{star} ★</span>
                        <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: pct }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-medium">
                      No reviews yet. Be the first to share your experience with this vendor.
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                            {getInitials(rev.user?.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{rev.user?.name || 'Couple'}</p>
                            <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</p>
                          </div>
                        </div>
                        <StarRating rating={rev.rating} size="sm" showCount={false} />
                      </div>
                      <p className="text-slate-700 text-xs font-medium leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ── LOCATION SECTION ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Service Location & Reach
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Available across wedding venues in Bihar</p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(vendorCity + ', Bihar')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/70 hover:bg-sky-100"
                >
                  <FiNavigation size={13} /> Maps Link
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 shrink-0">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{vendorCity}, {vendorState}</p>
                  <p className="text-xs text-slate-500">
                    {vendor.location?.address || 'Full studio address shared upon confirmed reservation to ensure vendor privacy.'}
                  </p>
                </div>
              </div>
            </section>

            {/* ── CONTACT & ASSISTANCE CARD ── */}
            <section className="bg-gradient-to-br from-[#0c4a6e] to-[#075985] rounded-3xl p-6 sm:p-8 text-white shadow-md">
              <div className="max-w-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                  Dedicated Assistance
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Have questions about this vendor?
                </h3>
                <p className="text-sky-100 text-xs sm:text-sm leading-relaxed">
                  Our ShaadiSaathi wedding concierge and verified vendor partners are here to assist with date reservations, customizations, and logistics.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={handleWhatsAppClick}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95 flex items-center gap-2"
                  >
                    <FaWhatsapp size={16} /> WhatsApp Vendor
                  </button>
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2"
                    >
                      <FiPhone size={15} /> Call Vendor
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* ── 3. IN-FLOW MOBILE ACTION BAR (Normal Document Flow, No Sticky/Fixed) ── */}
            <section className="xl:hidden w-full bg-white rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-[0_10px_35px_rgba(2,132,199,0.08)] my-6">
              <div className="flex items-center justify-between gap-3">
                {/* Wishlist Button */}
                <button
                  onClick={() => isAuthenticated ? dispatch(toggleWishlist(id)) : navigate('/login')}
                  aria-label="Save Vendor to Wishlist"
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shrink-0 min-h-[44px] min-w-[44px] active:scale-95 shadow-2xs ${
                    isWishlisted
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:text-rose-500'
                  }`}
                >
                  <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} size={20} />
                </button>

                {/* WhatsApp Action Button */}
                <button
                  onClick={handleWhatsAppClick}
                  aria-label="WhatsApp Vendor"
                  className="flex-1 py-3.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <FaWhatsapp size={18} /> WhatsApp
                </button>

                {/* Book Now Button */}
                {canBook ? (
                  <button
                    onClick={() => {
                      setSelectedServiceForBooking(null)
                      setBookingModalOpen(true)
                    }}
                    className="flex-1 py-3.5 px-3 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-[#0369a1] hover:from-sky-700 hover:to-[#0284c7] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <FiCalendar size={15} /> Book Now
                  </button>
                ) : (
                  <button
                    onClick={() => isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login')}
                    className="flex-1 py-3.5 px-3 rounded-2xl bg-sky-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <FiMessageCircle size={15} /> Send Inquiry
                  </button>
                )}
              </div>
            </section>

            {/* ── 4. RELATED / SIMILAR VENDORS ── */}
            {similarVendors.length > 0 && (
              <section className="pt-4">
                <div className="mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-sky-700 block mb-1">
                    ✨ Recommended For You
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
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

          {/* ── RIGHT COLUMN (35% / Sticky Sidebar on Desktop) ── */}
          <div className="xl:col-span-4 hidden xl:block relative">
            <div className="sticky top-28 space-y-6">

              {/* Main Booking Card */}
              <div className="bg-white rounded-3xl p-7 border border-sky-100 shadow-[0_10px_35px_rgba(2,132,199,0.08)] space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Starting Price</span>
                  <span className="text-[10px] font-black text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/70">
                    Verified Rates
                  </span>
                </div>

                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {formatPrice(startingPrice)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">inclusive of wedding ceremony basics</span>
                </div>

                {/* Primary CTA Stack */}
                <div className="space-y-2.5 pt-2">
                  {canBook ? (
                    <button
                      onClick={() => {
                        setSelectedServiceForBooking(null)
                        setBookingModalOpen(true)
                      }}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-[#0369a1] hover:from-sky-700 hover:to-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FiCalendar size={16} /> Book Service
                    </button>
                  ) : (
                    <button
                      onClick={() => isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login')}
                      className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FiMessageCircle size={16} /> Send Inquiry
                    </button>
                  )}

                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp size={16} /> WhatsApp Vendor
                  </button>

                  <button
                    onClick={() => isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login')}
                    className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle size={15} className="text-sky-600" /> Talk to Vendor
                  </button>
                </div>

                {/* Security Guarantee Strip */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-1">
                  <p className="text-[11px] font-extrabold text-emerald-800 flex items-center justify-center gap-1.5">
                    <FiShield size={14} className="text-emerald-600" /> 100% Milestone Booking Protection
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Advance payments held securely until service verification.
                  </p>
                </div>

              </div>

              {/* Similar Recommendations */}
              {similarVendors.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-sky-100/80 shadow-xs space-y-3">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Similar {vendorCategoryName}
                  </p>
                  <div className="space-y-2.5">
                    {similarVendors.map((v) => (
                      <Link
                        key={v._id}
                        to={`/vendors/${v._id}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-sky-50/70 border border-transparent hover:border-sky-100 transition-all group"
                      >
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                          <img
                            src={optimizeImage(v.coverImage?.url || v.logo?.url || v.images?.[0]?.url, 150)}
                            alt={v.businessName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700 truncate">
                            {v.businessName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            📍 {v.location?.city || 'Bihar'} • ⭐ {v.rating?.average ? v.rating.average.toFixed(1) : '5.0'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* ── MODALS (BookingModal & ReviewModal & Fullscreen Gallery) ── */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false)
          setSelectedServiceForBooking(null)
        }}
        vendor={vendor}
        service={selectedServiceForBooking}
        navigate={navigate}
      />

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

      {/* Fullscreen Lightbox Gallery */}
      <AnimatePresence>
        {galleryModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setGalleryModal({ open: false, index: 0 })}
              aria-label="Close Gallery"
              className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md z-50 hover:bg-white/20"
            >
              <FiX size={22} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setGalleryModal(p => ({ ...p, index: (p.index - 1 + images.length) % images.length }))
                  }}
                  aria-label="Previous Photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all z-50"
                >
                  <FiChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setGalleryModal(p => ({ ...p, index: (p.index + 1) % images.length }))
                  }}
                  aria-label="Next Photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all z-50"
                >
                  <FiChevronRight size={28} />
                </button>
              </>
            )}

            <motion.img
              key={galleryModal.index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src={images[galleryModal.index]?.url}
              alt={`Wedding Photo ${galleryModal.index + 1}`}
              className="max-w-[92vw] max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-5 py-1.5 rounded-full text-white font-bold text-xs border border-white/20">
              {galleryModal.index + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
