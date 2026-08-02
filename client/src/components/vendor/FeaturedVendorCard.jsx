import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '../../store/slices/authSlice'
import StarRating from '../common/StarRating'
import { formatPrice, getWhatsAppLink } from '../../utils/helpers'
import { FiHeart, FiMapPin, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-hot-toast'

export default function FeaturedVendorCard({ vendor }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [waLoading, setWaLoading] = useState(false)

  const handleWhatsAppClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please login to access vendor contact details.', { icon: '🔒' })
      navigate('/login', { state: { from: { pathname: window.location.pathname, search: `?action=whatsapp&vendorId=${vendor._id}` } } })
      return
    }

    try {
      setWaLoading(true)
      const api = await import('../../utils/api').then(m => m.default)
      const res = await api.get(`/vendors/${vendor._id}/contact`)
      if (res.data?.success && res.data?.whatsappNumber) {
        let phone = res.data.whatsappNumber.replace(/[^0-9]/g, '')
        if (phone.length === 10) phone = `91${phone}`
        const encodedMsg = res.data.encodedMessage || encodeURIComponent("Hello, I found your service on ShaadiSaathi and I am interested in your wedding services.");
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank')
      } else {
        toast.error('WhatsApp number not available for this vendor.')
      }
    } catch (err) {
      toast.error('Failed to get contact details. Please try again.')
    } finally {
      setWaLoading(false)
    }
  }

  const getOptimizedUrl = (url, width = 600) => {
    if (!url || !url.includes('cloudinary')) return url
    return url.replace('/upload/', `/upload/c_scale,w_${width},f_auto,q_auto/`)
  }

  const getPrimaryImage = () => {
    if (vendor.coverImage?.url) return vendor.coverImage.url
    if (typeof vendor.coverImage === 'string') return vendor.coverImage
    if (Array.isArray(vendor.images) && vendor.images.length > 0) {
      const primary = vendor.images.find((i) => i && i.isPrimary)
      if (primary && primary.url) return primary.url
      if (primary && typeof primary === 'string') return primary
      const first = vendor.images[0]
      if (first && first.url) return first.url
      if (first && typeof first === 'string') return first
    }
    if (Array.isArray(vendor.gallery) && vendor.gallery.length > 0) {
      return vendor.gallery[0]
    }
    return null
  }
  const primaryImage = getPrimaryImage()
  const optimizedImage = getOptimizedUrl(primaryImage)
  const isWishlisted = user?.wishlist?.includes(vendor._id)

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to save to wishlist')
      navigate('/login')
      return
    }
    dispatch(toggleWishlist(vendor._id))
  }

  const getVendorInitials = (name) => {
    if (!name) return 'V'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div
      onClick={() => navigate(`/vendors/${vendor._id}`)}
      className="block h-full cursor-pointer group w-full max-w-full overflow-hidden"
    >
      <div className="bg-white rounded-[20px] md:rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 hover:border-pink-100 transition-all duration-500 overflow-hidden relative flex flex-col h-full group hover:-translate-y-2">
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D6D]/5 to-[#6A11CB]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Cover Image Section */}
        <div className="relative h-[240px] md:h-[260px] bg-gray-50 flex-shrink-0 z-10 w-full overflow-hidden">
          {primaryImage ? (
            <img
              src={optimizedImage}
              alt={vendor.businessName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
              <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">{vendor.category?.icon || '✨'}</span>
            </div>
          )}

          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Premium Ribbons & Badges */}
          <div className="absolute top-4 left-4 right-16 flex flex-col gap-2 z-20 items-start overflow-hidden">
            {vendor.subscription?.plan === 'elite' || vendor.subscription?.plan === 'premium' ? (
              <span className="bg-white/95 backdrop-blur-md text-[#1a1a1a] text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 max-w-full truncate border border-white/50">
                💎 <span className="truncate">Premium Partner</span>
              </span>
            ) : null}
          </div>

          {/* Quick Actions (Wishlist) */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={handleWishlist}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md border ${isWishlisted
                ? 'bg-[#FF4D6D] text-white border-[#FF4D6D]'
                : 'bg-black/30 text-white border-white/20 hover:bg-white hover:text-[#FF4D6D] hover:scale-110'
                }`}
            >
              <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'scale-110' : ''} />
            </button>
          </div>

          {/* Social Proof & Location Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-2">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full w-fit max-w-full truncate inline-block shadow-sm">
                {vendor.category?.icon} <span className="truncate">{vendor.category?.name || 'Service'}</span>
              </span>
              <div className="flex items-center gap-1 text-white/95 text-xs font-bold drop-shadow-md min-w-0">
                <FiMapPin size={12} className="text-[#D4AF37] flex-shrink-0" />
                <span className="truncate flex-1">{vendor.location?.city || 'India'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 md:p-5 flex flex-col flex-1 relative z-10 bg-white">
          
          {/* Rating Badge (Floating between image and content) */}
          <div className="absolute right-4 md:right-5 -top-5 z-30">
            <div className="bg-white rounded-xl px-3 py-2 flex flex-col items-center shadow-lg border border-gray-50">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[#D4AF37] text-sm">⭐</span>
                <span className="text-gray-900 font-black text-sm leading-none">{vendor.rating?.average || '4.9'}</span>
              </div>
              <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest leading-none">
                {vendor.rating?.count > 0 ? `${vendor.rating.count} Revs` : '50+ Revs'}
              </span>
            </div>
          </div>

          {/* Header Row: Logo & Name */}
          <div className="flex gap-4 items-start mb-4 pr-16">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#FFF8F0] to-[#FDF2F8] flex-shrink-0 flex items-center justify-center text-[#C2185B] font-display font-black text-xl border border-pink-100 overflow-hidden">
              {vendor.logo ? <img src={vendor.logo} alt="Logo" className="w-full h-full object-cover" /> : getVendorInitials(vendor.businessName)}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-display font-black text-gray-900 text-lg md:text-xl leading-tight group-hover:text-[#FF4D6D] transition-colors truncate">
                {vendor.businessName}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  <FiCheckCircle size={10} className="text-green-500" strokeWidth={3} /> Verified
                </span>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#C2185B] bg-pink-50/70 px-2.5 py-1 rounded-md border border-pink-100">
                  <span>🏆</span> {vendor.experienceYears ? `${vendor.experienceYears} Yrs Exp` : 'Verified Exp'}
                </span>
                {(vendor.badges?.includes('quickResponder') || vendor.subscription?.plan === 'premium') && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    ⚡ Fast Response
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bookings / Popularity indicator */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-600 mb-5">
            <div className="flex items-center gap-1 bg-[#FFF5F8] px-2.5 py-1 rounded-md text-[#C2185B]">
              <span>❤️</span> 10+ Bookings
            </div>
            <div className="flex items-center gap-1 bg-[#FFF8F0] px-2.5 py-1 rounded-md text-[#D4AF37]">
              <span>🔥</span> Popular Choice
            </div>
          </div>

          {/* Price & Actions Row */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4 w-full">
            <div className="flex items-end justify-between w-full">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Starting Price</p>
                <p className="font-display font-black text-gray-900 text-2xl tracking-tight leading-none">
                  {formatPrice(vendor.basePrice || vendor.packages?.[0]?.price || 15000)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigate(`/vendors/${vendor._id}`)
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 h-[44px] md:h-[48px] rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center whitespace-nowrap px-3"
              >
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigate(`/vendors/${vendor._id}?action=book`)
                }}
                className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#8E244D] hover:from-[#8E244D] hover:to-[#5C1130] text-white h-[44px] md:h-[48px] rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 flex items-center justify-center whitespace-nowrap px-3"
              >
                Book Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
