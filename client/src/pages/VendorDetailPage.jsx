import { useEffect, useState, useMemo, memo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVendorById, clearCurrentVendor } from '../store/slices/vendorSlice'
import { toggleWishlist } from '../store/slices/authSlice'
import { startChat } from '../store/slices/chatSlice'
import StarRating from '../components/common/StarRating'
import Badge from '../components/common/Badge'
import BookingModal from '../components/vendor/BookingModal'
import { formatPrice, formatDate, getInitials, getWhatsAppLink } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  FiMapPin, FiPhone, FiMail, FiHeart, FiMessageCircle, FiLock,
  FiCalendar, FiCheck, FiShare2, FiImage, FiEye, FiChevronLeft, FiChevronRight, FiX, FiClock, FiUsers, FiGlobe, FiAward, FiStar, FiShield, FiCheckCircle, FiArrowLeft, FiCamera, FiVideo, FiMonitor, FiMap, FiNavigation, FiCheckSquare
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewModal from '../components/common/ReviewModal'
import FeaturedVendorCard from '../components/vendor/FeaturedVendorCard'

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
  
  const isWishlisted = useMemo(() => user?.wishlist?.includes(id), [user?.wishlist, id])

  const loadReviews = () => {
    api.get(`/reviews/vendor/${id}`).then(r => setReviews(r.data.reviews)).catch(() => { })
  }
  
  const loadSimilarVendors = async () => {
    try {
      const { data } = await api.get('/vendors/featured')
      const filtered = (data.vendors || data.data || []).filter(v => v._id !== id).slice(0, 3)
      setSimilarVendors(filtered)
    } catch (e) {
      console.log(e)
    }
  }

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
  }, [dispatch, id, vendor?._id])

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

  if (loading && !vendor) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#D4AF37] rounded-full animate-spin mb-6 shadow-xl" />
        <p className="text-[#D4AF37] font-bold animate-pulse tracking-wide uppercase text-sm">Curating Premium Experience...</p>
      </div>
    )
  }

  if (error || (!loading && !vendor)) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-2xl mb-8 border border-gray-100">✨</div>
        <h2 className="text-4xl font-display font-black text-gray-900 mb-4 text-center">Vendor Unavailable</h2>
        <p className="text-gray-500 text-center mb-10 max-w-md font-medium text-lg">This premium vendor is currently not available or has been removed.</p>
        <Link to="/services" className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-white font-bold px-10 py-4 rounded-full transition-all hover:scale-105 shadow-xl hover:shadow-[0_10px_30px_rgba(212,175,55,0.4)]">Explore Premium Vendors</Link>
      </div>
    )
  }

  if (!vendor) return null

  const vendorDesc = vendor.description || 'Welcome to our premium wedding service. We are dedicated to making your special day extraordinary with our unmatched expertise and attention to detail. Let us turn your vision into reality. We have successfully managed hundreds of high-profile events and understand the nuance of absolute perfection. Trust our team to deliver a seamless, magical experience from start to finish.';
  const isDescLong = vendorDesc.length > 200;

  return (
    <div className="min-h-screen bg-[#FFFBF8] pb-32 relative selection:bg-[#C2185B]/20 selection:text-[#C2185B]">
      
      {/* ── 1. TOP VENDOR HERO ── */}
      <div className="relative h-[50vh] md:h-[65vh] w-full bg-gray-900 overflow-hidden shadow-sm">
        {coverUrl && (
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={coverUrl}
            alt={vendor.businessName}
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="absolute top-6 left-4 md:left-10 z-20 flex items-center gap-2 bg-black/30 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/20 shadow-lg">
          <FiArrowLeft size={16} /> वापस जाएँ
        </button>

        {/* Floating Actions */}
        <div className="absolute top-6 right-4 md:right-10 flex gap-3 z-20">
          <button onClick={() => isAuthenticated ? dispatch(toggleWishlist(id)) : navigate('/login')} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all shadow-xl hover:scale-105 active:scale-95 group/btn ${isWishlisted ? 'bg-[#FF4D6D] text-white border-[#FF4D6D]' : 'bg-black/30 text-white border-white/30 hover:bg-white/20'}`}>
            <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
          <button onClick={handleShare} className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 bg-black/30 text-white hover:bg-white/20 transition-all shadow-xl hover:scale-105 active:scale-95 group/btn">
            <FiShare2 size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>

        {/* Badges on Hero */}
        <div className="absolute bottom-32 md:bottom-12 left-4 md:left-10 flex flex-wrap gap-2 z-20 hidden md:flex">
           <span className="bg-white/95 backdrop-blur-md text-[#1a1a1a] text-[10px] md:text-xs font-black uppercase tracking-[0.15em] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/50">
             💎 Premium Partner
           </span>
           <span className="bg-[#C2185B]/90 backdrop-blur-md text-white text-[10px] md:text-xs font-black uppercase tracking-[0.15em] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-pink-500/50">
             <FiCheckCircle size={14} /> Verified Vendor
           </span>
        </div>
      </div>

      {/* ── STICKY LAYOUT WRAPPER ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-[-80px] md:mt-[-60px] relative z-30">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">

          {/* ── MAIN CONTENT (LEFT) ── */}
          <div className="xl:col-span-8 space-y-8 md:space-y-12">
            
            {/* 2. VENDOR BASIC INFORMATION */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
               <div className="w-28 h-28 md:w-40 md:h-40 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white shrink-0 relative group -mt-16 md:mt-0">
                  {vendor.logo?.url ? (
                    <img src={vendor.logo.url} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : vendor.user?.avatar?.url ? (
                    <img src={vendor.user.avatar.url} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#FDF2F8] text-[#C2185B] text-5xl md:text-6xl font-black font-display">
                      {getInitials(vendor.businessName || vendor.user?.name)}
                    </div>
                  )}
               </div>
               
               <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                     <span className="text-[#C2185B] font-bold text-xs md:text-sm tracking-widest uppercase bg-pink-50 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                       {vendor.category?.name || 'Wedding Service'}
                     </span>
                     <div className="flex items-center gap-1.5 justify-center text-gray-500 text-sm font-medium">
                       <FiMapPin size={16} className="text-[#D4AF37]" /> {vendor.location?.city || 'India'}
                     </div>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 mb-4 tracking-tight leading-tight">
                    {vendor.businessName || vendor.user?.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                    <div className="bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <span className="text-yellow-600 text-sm">⭐</span>
                      <span className="text-gray-900 font-bold text-sm">{vendor.dynamicRating?.average?.toFixed(1) || vendor.rating?.average?.toFixed(1) || '4.9'}</span>
                    </div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">({vendor.dynamicRating?.count || vendor.rating?.count || '50+'} Reviews)</span>
                    <span className="text-gray-300 hidden md:block">•</span>
                    <div className="flex items-center gap-1 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#C2185B] bg-[#FFF5F8] px-3 py-1.5 rounded-full">
                      ❤️ 10+ Bookings
                    </div>
                    <div className="flex items-center gap-1 text-[10px] md:text-xs font-black uppercase tracking-widest text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                      ⚡ Fast Response
                    </div>
                    <div className="flex items-center gap-1 text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
                      ✓ Verified
                    </div>
                  </div>
               </div>
            </div>

            {/* 4. ABOUT VENDOR */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
              <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <span className="bg-[#FFF8F0] p-2 rounded-xl text-[#D4AF37]"><FiStar /></span>
                 Vendor के बारे में
              </h3>
              <p className={`text-gray-600 text-base leading-relaxed whitespace-pre-line font-medium ${readMoreAbout ? '' : 'line-clamp-4 md:line-clamp-none'}`}>
                 {vendorDesc}
              </p>
              {isDescLong && (
                 <button onClick={() => setReadMoreAbout(!readMoreAbout)} className="mt-4 text-[#C2185B] font-bold text-sm uppercase tracking-widest hover:underline md:hidden">
                    {readMoreAbout ? 'कम दिखाएं' : 'और पढ़ें'}
                 </button>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                 <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Experience</p>
                    <p className="text-gray-900 font-bold text-lg">{vendor.calculatedExperience || 5}+ Years</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Service Area</p>
                    <p className="text-gray-900 font-bold text-lg">{vendor.location?.city || 'Pan India'}</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-gray-900 font-bold text-lg">{vendor.completedBookings || '50+'} Events</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Response</p>
                    <p className="text-gray-900 font-bold text-lg">Usually in 1 hr</p>
                 </div>
              </div>
            </div>

            {/* 5. SERVICES & PACKAGES */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
               <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                 <span className="bg-[#FFF8F0] p-2 rounded-xl text-[#D4AF37]"><FiAward /></span>
                 प्रीमियम Packages
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {(vendor.packages?.length > 0 ? vendor.packages : [
                    { name: 'Basic Package', price: 25000, features: ['1 Day Coverage', 'Soft Copies', 'Traditional Video'] },
                    { name: 'Premium Package', price: 50000, isPopular: true, features: ['2 Days Coverage', 'Cinematic Video', 'Drone Shoot', 'Premium Album'] },
                    { name: 'Royal Package', price: 85000, features: ['Full Wedding Coverage', 'Pre-wedding Shoot', '2 Premium Albums', 'Reel Edits'] }
                 ]).map((pkg, i) => (
                    <div key={i} className={`relative p-6 rounded-[2rem] border transition-all duration-300 flex flex-col h-full group ${pkg.isPopular ? 'border-[#C2185B] shadow-md bg-[#FFF5F8]' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
                       {pkg.isPopular && <div className="absolute -top-3 right-6 bg-[#C2185B] text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md">Popular</div>}
                       
                       <h4 className="text-xl font-black text-gray-900 mb-1 font-display group-hover:text-[#C2185B] transition-colors">{pkg.name}</h4>
                       <div className="mb-6 flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 mb-1">शुरुआती कीमत</span>
                          <span className="text-3xl font-display font-black text-gray-900">{formatPrice(pkg.price)}</span>
                       </div>
                       
                       <ul className="space-y-3 mb-8 flex-grow">
                          {pkg.features?.map((feat, fIdx) => (
                             <li key={fIdx} className="flex items-start gap-2 text-xs font-bold text-gray-600">
                                <FiCheck size={14} strokeWidth={3} className="text-[#C2185B] mt-0.5 shrink-0" />
                                {feat}
                             </li>
                          ))}
                       </ul>
                       
                       <div className="flex flex-col gap-2 mt-auto">
                         {(!isAuthenticated || user?.role === 'user') && (
                           <button onClick={() => setBookingModalOpen(true)} className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${pkg.isPopular ? 'bg-[#C2185B] text-white hover:bg-pink-700 shadow-md' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                              अभी बुक करें
                           </button>
                         )}
                         <button className="w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#C2185B] border border-pink-100 hover:bg-pink-50 transition-all">
                            पैकेज देखें
                         </button>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

            {/* 6. PHOTO GALLERY (Masonry) */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
               <div className="flex justify-between items-end mb-8">
                  <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <span className="bg-gray-50 p-2 rounded-xl text-gray-900"><FiImage /></span>
                    फ़ोटो Gallery
                  </h3>
                  <button className="text-[10px] font-black uppercase tracking-widest text-[#C2185B] hover:underline hidden md:block">
                     सभी फ़ोटो देखें
                  </button>
               </div>
               
               {images.length === 0 ? (
                 <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium italic text-sm">Gallery is currently being updated.</p>
                 </div>
               ) : (
                 <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {images.map((img, i) => (
                       <div key={i} onClick={() => setGalleryModal({ open: true, index: i })} className="break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm border border-gray-100">
                          <img src={getOptimizedUrl(img.url, 600)} alt="Gallery" className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                             <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 drop-shadow-lg" size={28} />
                          </div>
                       </div>
                    ))}
                 </div>
               )}
               <button className="w-full py-4 mt-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-900 bg-gray-50 hover:bg-gray-100 transition-all md:hidden">
                  सभी फ़ोटो देखें
               </button>
            </div>

            {/* 7. SERVICES INCLUDED (Icon Cards) */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
               <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                 <span className="bg-blue-50 p-2 rounded-xl text-blue-600"><FiCheckSquare /></span>
                 हमारी Services
               </h3>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                     { icon: <FiCamera size={24} />, name: 'Photography' },
                     { icon: <FiVideo size={24} />, name: 'Videography' },
                     { icon: <FiHeart size={24} />, name: 'Pre-Wedding' },
                     { icon: <FiMonitor size={24} />, name: 'Reels Edit' },
                     { icon: <FiImage size={24} />, name: 'Photo Album' },
                     { icon: <FiClock size={24} />, name: '12hr Coverage' }
                  ].map((srv, i) => (
                     <div key={i} className="bg-gray-50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 group">
                        <div className="text-[#C2185B] group-hover:scale-110 transition-transform">{srv.icon}</div>
                        <span className="text-xs font-bold text-gray-900">{srv.name}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* 8. AVAILABILITY (Calendar Mock) */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
               <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
                 <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                   <span className="bg-green-50 p-2 rounded-xl text-green-600"><FiCalendar /></span>
                   Availability चेक करें
                 </h3>
                 <button onClick={() => setBookingModalOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-black transition-all">
                    अपनी Date चेक करें
                 </button>
               </div>
               
               <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 flex flex-col md:flex-row items-center gap-8 justify-center">
                  <div className="grid grid-cols-7 gap-2 md:gap-4 w-full max-w-sm text-center font-medium text-sm">
                     {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-gray-400 font-bold mb-2">{d}</div>)}
                     {Array.from({length: 31}).map((_, i) => {
                        const isBooked = [5, 12, 18, 25, 26].includes(i + 1);
                        const isPending = [14, 20].includes(i + 1);
                        return (
                           <div key={i} className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${isBooked ? 'bg-red-50 text-red-500 line-through opacity-50' : isPending ? 'bg-yellow-50 text-yellow-600' : 'bg-white hover:bg-[#C2185B] hover:text-white cursor-pointer shadow-sm border border-gray-100'}`}>
                              {i + 1}
                           </div>
                        )
                     })}
                  </div>
                  <div className="flex flex-row md:flex-col gap-4 text-xs font-bold text-gray-600">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border border-gray-200"></div> Available</div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-100"></div> Pending</div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-100"></div> Booked</div>
                  </div>
               </div>
            </div>

            {/* 9. REVIEWS & RATINGS */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                 <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                   <span className="bg-yellow-50 p-2 rounded-xl text-yellow-600"><FiStar /></span>
                   Reviews और Ratings
                 </h3>
                 {isAuthenticated && (
                   <button onClick={() => setReviewModalOpen(true)} className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all">
                     Review लिखें
                   </button>
                 )}
               </div>

               <div className="flex flex-col md:flex-row gap-10 mb-10 items-center md:items-start bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100">
                  <div className="text-center md:text-left shrink-0">
                     <p className="text-6xl font-display font-black text-gray-900 mb-2">
                        {vendor.dynamicRating?.average?.toFixed(1) || vendor.rating?.average?.toFixed(1) || '4.9'}
                     </p>
                     <div className="mb-2 justify-center md:justify-start flex"><StarRating rating={vendor.dynamicRating?.average || vendor.rating?.average || 4.9} showCount={false} size="lg" /></div>
                     <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                        {vendor.dynamicRating?.count || vendor.rating?.count || '50+'} Reviews
                     </p>
                  </div>
                  
                  <div className="w-full flex flex-col gap-2 flex-1">
                     {[5, 4, 3, 2, 1].map(star => {
                        const pct = star === 5 ? '80%' : star === 4 ? '15%' : '5%';
                        return (
                           <div key={star} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-gray-600 w-8">{star} ★</span>
                              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: pct }}></div>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>

               <div className="space-y-6">
                  {reviews.length === 0 ? (
                     <p className="text-gray-500 font-medium italic text-sm">No reviews available yet. Be the first to share your experience!</p>
                  ) : (
                     reviews.map(rev => (
                        <div key={rev._id} className="p-6 rounded-[2rem] bg-gray-50 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-lg transition-all relative group">
                           {user?._id === rev.user?._id && (
                              <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => { setEditReviewData(rev); setReviewModalOpen(true); }} className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">Edit</button>
                                 <button onClick={() => handleDeleteReview(rev._id)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Delete</button>
                              </div>
                           )}
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4D6D] to-[#6A11CB] flex items-center justify-center font-black text-white shadow-md border-2 border-white">
                                 {getInitials(rev.user?.name)}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900 text-sm md:text-base">{rev.user?.name}</p>
                                 <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">{formatDate(rev.createdAt)}</p>
                              </div>
                           </div>
                           <div className="mb-3">
                              <StarRating rating={rev.rating} size="sm" showCount={false} />
                           </div>
                           <p className="text-gray-600 font-medium leading-relaxed text-sm">"{rev.comment}"</p>
                        </div>
                     ))
                  )}
               </div>
               
               {reviews.length > 0 && (
                  <button className="w-full py-4 mt-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-900 border border-gray-200 hover:bg-gray-50 transition-all">
                     View All Reviews
                  </button>
               )}
            </div>

            {/* 10. LOCATION */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
               <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <span className="bg-red-50 p-2 rounded-xl text-red-600"><FiMapPin /></span>
                 Vendor की लोकेशन
               </h3>
               <p className="text-gray-900 font-bold text-lg mb-6">{vendor.location?.city || 'Pan India'}{vendor.location?.state ? `, ${vendor.location.state}` : ''}</p>
               
               <div className="w-full h-[250px] bg-gray-100 rounded-3xl overflow-hidden relative border border-gray-200">
                  {/* Fake map image for UI */}
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" alt="Map" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 flex flex-col items-center justify-center">
                     <div className="w-14 h-14 bg-[#C2185B] text-white rounded-full flex items-center justify-center shadow-2xl mb-4 animate-bounce border-4 border-white">
                        <FiMapPin size={24} />
                     </div>
                     <button className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all">
                        <FiNavigation size={14} /> रास्ता देखें
                     </button>
                  </div>
               </div>
            </div>

          </div>

          {/* ── 3. STICKY BOOKING CTA (RIGHT COLUMN - DESKTOP) ── */}
          <div className="xl:col-span-4 hidden xl:block relative">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 p-8 flex flex-col">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">शुरुआती कीमत</p>
                 <h4 className="text-4xl font-display font-black text-gray-900 tracking-tight mb-8">
                   {formatPrice(vendor.basePrice || vendor.packages?.[0]?.price || vendor.price || 15000)}
                 </h4>

                 <div className="space-y-4">
                   {(!isAuthenticated || user?.role === 'user') && (
                     <button
                       onClick={() => setBookingModalOpen(true)}
                       className="w-full py-4 bg-[#C2185B] hover:bg-pink-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-95"
                     >
                       <FiCalendar size={16} /> Availability चेक करें
                     </button>
                   )}

                   <button onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }} className="w-full py-4 bg-gray-50 border border-gray-200 text-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-95 shadow-sm">
                     <FiMessageCircle size={16} /> मैसेज भेजें
                   </button>

                   {vendor.phone && (
                     <button onClick={(e) => {
                       e.preventDefault()
                       if (!isAuthenticated) return navigate('/login');
                       const waLink = getWhatsAppLink(vendor.phone, `Hi ${vendor.businessName}, I found you on ShaadiSaathi and would like to inquire about your services.`)
                       window.open(waLink, '_blank')
                     }} className="w-full py-4 bg-green-50 border border-green-200 text-green-700 hover:bg-green-500 hover:text-white hover:border-green-600 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-95 shadow-sm">
                       <FiPhone size={16} /> WhatsApp
                     </button>
                   )}
                 </div>

                 <p className="text-center text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-widest flex items-center justify-center gap-1"><FiShield size={12}/> सुरक्षित बुकिंग की गारंटी</p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── 11. RELATED / SIMILAR VENDORS ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-16 md:mt-24 pb-20 relative z-20">
         <h3 className="font-display text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-10 text-center tracking-tight">
            आपके लिए कुछ और बेहतरीन Vendors
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVendors.length > 0 ? (
               similarVendors.map(v => <FeaturedVendorCard key={v._id} vendor={v} />)
            ) : (
               <div className="col-span-full text-center py-12 text-gray-400 font-medium italic">Finding premium vendors...</div>
            )}
         </div>
      </div>

      {/* ── Mobile Sticky Bottom CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-3xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 xl:hidden flex items-center gap-4 safe-area-bottom pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="hidden sm:block flex-shrink-0 pr-4 border-r border-gray-200">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">शुरुआती कीमत</p>
           <p className="font-display font-black text-gray-900 text-lg leading-none">{formatPrice(vendor.basePrice || vendor.price || 15000)}</p>
        </div>
        
        {(!isAuthenticated || user?.role === 'user') && (
          <button
            onClick={() => setBookingModalOpen(true)}
            className="flex-1 py-4 bg-[#C2185B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            Availability चेक करें
          </button>
        )}
          <button
            onClick={() => { isAuthenticated ? dispatch(startChat(id)).then(() => navigate('/chat')) : navigate('/login') }}
            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            अभी बुक करें
          </button>
      </div>

      {/* Modals */}
      <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} vendor={vendor} navigate={navigate} />

      <AnimatePresence>
        {galleryModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center">
            <button onClick={() => setGalleryModal({ open: false, index: 0 })} className="absolute top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white transition-colors bg-white/10 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md z-50 shadow-2xl hover:bg-white/20">
              <FiX size={28} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setGalleryModal(p => ({ ...p, index: (p.index - 1 + images.length) % images.length })) }}
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-50 shadow-2xl"
                ><FiChevronLeft size={36} /></button>
                <button
                  onClick={(e) => { e.stopPropagation(); setGalleryModal(p => ({ ...p, index: (p.index + 1) % images.length })) }}
                  className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-50 shadow-2xl"
                ><FiChevronRight size={36} /></button>
              </>
            )}

            <motion.img
              key={galleryModal.index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              src={images[galleryModal.index]?.url}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10"
            />

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-8 py-3 rounded-full text-white font-bold tracking-[0.2em] text-xs border border-white/20 shadow-xl">
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
          loadReviews();
          dispatch(fetchVendorById(id));
        }}
      />
    </div>
  )
}
