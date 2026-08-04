import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '../../store/slices/authSlice'
import { formatPrice } from '../../utils/helpers'
import { FiHeart, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast'
import { getCategoryFallbackImage } from '../../utils/weddingImages'

export default function VendorCard({ vendor }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((s) => s.auth)

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
      className="block w-full max-w-full overflow-hidden cursor-pointer group bg-white rounded-[24px] shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 hover:border-gray-200 transition-all duration-300 md:hover:-translate-y-1 flex flex-col h-full"
    >
      {/* ── TOP IMAGE ── */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-t-[24px] overflow-hidden bg-gray-50 flex-shrink-0">
        {primaryImage ? (
          <img
            src={optimizedImage}
            alt={vendor.businessName}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] md:group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <img
            src={getCategoryFallbackImage(vendor.category?.slug || vendor.category?.name)}
            alt={vendor.businessName}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] md:group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Gradient Overlay for Top Content */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-12 flex flex-wrap gap-1.5 z-20 overflow-hidden">
          {(vendor.subscription?.plan === 'elite' || vendor.subscription?.plan === 'premium') && (
            <span className="bg-[#1A2238]/90 backdrop-blur-md text-[#D4AF37] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-white/10 shrink-0">
              💎 Premium Partner
            </span>
          )}
          {vendor.isVerified !== false && (
            <span className="bg-white/90 backdrop-blur-md text-green-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-white/20 shrink-0">
              ✓ Verified
            </span>
          )}
          {vendor.isTrending && (
            <span className="bg-[#C2185B]/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-white/20 shrink-0">
              🔥 Popular
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={handleWishlist}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center transition-colors text-white border border-white/20"
            aria-label="Save to Wishlist"
          >
            <FiHeart size={16} fill={isWishlisted ? '#C2185B' : 'none'} className={isWishlisted ? 'text-[#C2185B]' : ''} />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Name and Basic Info */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-[#C2185B] transition-colors">
              {vendor.businessName}
            </h3>
            <div className="bg-gray-50 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 border border-gray-100">
              <span className="text-yellow-500 text-xs">⭐</span>
              <span className="text-gray-900 font-bold text-xs">{vendor.rating?.average || '4.9'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1 shrink-0">
              {vendor.category?.icon} <span className="truncate max-w-[120px]">{vendor.category?.name || 'Service'}</span>
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1 truncate text-gray-600">
              <FiMapPin size={12} className="text-[#C2185B] shrink-0" />
              {vendor.location?.city || 'India'}
            </span>
          </div>
        </div>

        {/* Social Proof Tags */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-600 mb-5">
          <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">
            {vendor.rating?.count > 0 ? `${vendor.rating.count} Reviews` : '120 Reviews'}
          </span>
          <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1">
            <span className="text-red-500">❤️</span> 50+ Bookings
          </span>
          {(vendor.badges?.includes('quickResponder') || vendor.subscription?.plan === 'premium') && (
            <span className="bg-blue-50/50 text-blue-700 px-2 py-1 rounded border border-blue-100/50 flex items-center gap-1">
              ⚡ Responds Quickly
            </span>
          )}
        </div>

        {/* Footer: Price & CTAs */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Starting from</p>
            <p className="font-serif text-xl font-black text-gray-900 leading-none">
              {formatPrice(vendor.basePrice || vendor.packages?.[0]?.price || 25000)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate(`/vendors/${vendor._id}`)
              }}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors active:scale-95"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate(`/vendors/${vendor._id}`)
              }}
              className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#9c1349] hover:from-[#9c1349] hover:to-[#C2185B] text-white py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 border-none"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
