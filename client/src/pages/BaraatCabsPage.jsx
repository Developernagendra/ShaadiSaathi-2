import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiUsers, FiArrowRight, FiStar, FiHeart, FiSearch, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { FaCrown, FaSnowflake, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import api from '../utils/api'
import { apiCache } from '../utils/apiCache'
import { formatPrice } from '../utils/helpers'
import { toast } from 'react-hot-toast'
import BaraatCabsSkeleton from '../components/common/BaraatCabsSkeleton'

const CATEGORIES = [
  'All',
  'Luxury Cars',
  'Premium SUVs',
  'Baraat Special',
  'Vintage Cars',
  'Decorated Cars'
]

export default function BaraatCabsPage() {
  const navigate = useNavigate()

  // Check cache synchronously
  const getInitialItems = () => {
    const cachedKey = `/fleet/browse?`
    const cached = apiCache.get(cachedKey)
    return cached ? (cached.cabs || cached.data || []) : []
  }

  const [items, setItems] = useState(getInitialItems)
  const [loading, setLoading] = useState(() => !apiCache.has('/fleet/browse?'))

  const [filters, setFilters] = useState({
    city: '',
    date: '',
    category: 'All',
  })

  // For horizontal scrolling chips
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [filters.city, filters.date])

  const fetchData = async () => {
    const params = new URLSearchParams()
    if (filters.city) params.append('city', filters.city)
    if (filters.date) params.append('date', filters.date)

    const cacheKey = `/fleet/browse?${params.toString()}`
    if (apiCache.has(cacheKey)) {
      const cached = apiCache.get(cacheKey)
      setItems(cached.cabs || cached.data || [])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await api.get(cacheKey)
      if (res.data.status === 'success') {
        apiCache.set(cacheKey, res.data)
        setItems(res.data.cabs || res.data.data || [])
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load premium fleet.')
    } finally {
      setLoading(false)
    }
  }

  // --- FILTER ENGINE ---
  const filteredItems = useMemo(() => {
    return items.filter(cab => {
      // 1. Category Chip Filtering
      if (filters.category !== 'All') {
        const type = cab.type || ''
        const isDecorated = cab.features?.decorationAvailable || cab.additionalServices?.flowerDecoration
        
        if (filters.category === 'Luxury Cars' && !['sedan', 'luxury_car'].includes(type)) return false
        if (filters.category === 'Premium SUVs' && type !== 'suv') return false
        if (filters.category === 'Vintage Cars' && type !== 'vintage_car') return false
        if (filters.category === 'Baraat Special' && !['horse_carriage', 'special', 'bus', 'tempo_traveller'].includes(type)) return false
        if (filters.category === 'Decorated Cars' && !isDecorated) return false
      }
      return true
    })
  }, [items, filters.category])

  const scrollChips = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans selection:bg-[#C2185B]/20 selection:text-[#C2185B] pb-32">
      {/* ── 👑 PREMIUM HERO SECTION ── */}
      <div className="relative bg-[#0B1021] pt-32 pb-40 overflow-hidden">
        {/* Luxury Background Layers */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=2000" alt="Luxury Baraat Wedding" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF8] via-[#0B1021]/80 to-[#0B1021]/90" />
          {/* Subtle Gold Glow */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#D4AF37]/10 backdrop-blur-md border border-[#D4AF37]/30 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <FaCrown className="text-[#D4AF37] text-lg" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Luxury Baraat Cabs</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-white mb-6 tracking-tight drop-shadow-2xl max-w-5xl mx-auto leading-tight">
            Make Your Baraat <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] italic">Grand & Royal</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-300 font-medium text-base sm:text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md mb-10">
            Travel in style with premium cars, luxury SUVs and elegant baraat vehicles.
          </motion.p>
        </div>
      </div>

      {/* ── 🔍 SEARCH & FILTERS BAR ── */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-20 mb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/90 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-4 items-center">
          
          <div className="flex-1 w-full bg-gray-50/80 rounded-2xl p-4 flex items-center gap-4 border border-transparent focus-within:border-gray-200 transition-colors">
            <FiMapPin className="text-[#D4AF37] text-2xl shrink-0" />
            <div className="w-full">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup City</p>
              <input type="text" placeholder="Where is the baraat?" value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full font-bold text-base md:text-lg" />
            </div>
          </div>
          
          <div className="flex-1 w-full bg-gray-50/80 rounded-2xl p-4 flex items-center gap-4 border border-transparent focus-within:border-gray-200 transition-colors">
            <FiUsers className="text-[#D4AF37] text-2xl shrink-0" />
            <div className="w-full">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Event Date</p>
              <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full font-bold text-base md:text-lg" />
            </div>
          </div>
          
          <div className="w-full md:w-auto shrink-0">
            <button className="bg-gradient-to-r from-[#0B1021] to-[#1A2238] text-white w-full md:w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <FiSearch size={22} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* ── 🏷️ HORIZONTAL CATEGORY CHIPS ── */}
        <div className="relative mb-10 group">
          <button onClick={() => scrollChips('left')} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-md items-center justify-center z-10 hidden md:group-hover:flex transition-opacity border border-gray-100">
            <FiChevronLeft className="text-gray-900" />
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto custom-scrollbar-hide pb-4 -mb-4 snap-x snap-mandatory"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`snap-start shrink-0 px-6 py-3.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm ${
                  filters.category === cat 
                    ? 'bg-[#0B1021] text-[#D4AF37] border-[#0B1021]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37] hover:bg-[#FDFCF8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button onClick={() => scrollChips('right')} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-md items-center justify-center z-10 hidden md:group-hover:flex transition-opacity border border-gray-100">
            <FiChevronRight className="text-gray-900" />
          </button>
        </div>

        {/* ── 🎉 BARAAT SPECIAL HIGHLIGHT BANNER ── */}
        {filters.category === 'All' && (
          <div className="w-full bg-gradient-to-br from-[#1A1C23] to-[#0B1021] rounded-[2rem] p-8 md:p-12 mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[#D4AF37]/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px]" />
            <div className="relative z-10 max-w-2xl text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-3 block">Premium Selection</span>
              <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-4 tracking-tight">🎉 Make Your Baraat Unforgettable</h2>
              <p className="text-gray-300 font-medium text-lg">Choose your perfect baraat ride and arrive in royal style. From decorated vintage classics to premium SUVs.</p>
            </div>
            <div className="relative z-10 w-full md:w-auto shrink-0">
              <button 
                onClick={() => setFilters({ ...filters, category: 'Baraat Special' })}
                className="w-full md:w-auto bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-white px-8 py-5 rounded-full font-black text-[12px] uppercase tracking-widest hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-3"
              >
                Explore Baraat Rides <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── 🚗 CAB CARDS GRID ── */}
        {loading ? (
          <BaraatCabsSkeleton />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden max-w-3xl mx-auto">
            <div className="text-6xl mb-6">🚕</div>
            <h3 className="font-display font-black text-2xl text-gray-900 mb-3">No Vehicles Found</h3>
            <p className="text-gray-500 font-medium mb-8">We couldn't find any vehicles matching your selected category or city.</p>
            <button onClick={() => setFilters({ ...filters, category: 'All', city: '' })} className="bg-[#0B1021] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredItems.map(cab => {
              const rating = cab.rating?.average || cab.vendor?.rating?.average || 4.9
              const reviewsCount = cab.rating?.count || cab.vendor?.rating?.count || 120
              const price = cab.price || cab.pricing?.baseFare || 8000
              const isAC = cab.features?.ac !== false // Default true in most premium cars
              const isDriver = cab.features?.driverIncluded !== false // Default true

              return (
                <motion.div
                  key={cab._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[28px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:border-[#D4AF37]/30 transition-all duration-300 group flex flex-col"
                >
                  {/* Image Header */}
                  <div className="relative h-64 md:h-72 w-full overflow-hidden shrink-0 bg-gray-100">
                    <LazyLoadImage
                      src={cab.images?.[0]?.url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800'}
                      alt={cab.name}
                      effect="blur"
                      wrapperProps={{ style: { display: "block", width: "100%", height: "100%" } }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-black/20 opacity-80" />
                    
                    {/* Wishlist Heart */}
                    <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/30 z-10">
                      <FiHeart size={18} />
                    </button>

                    {/* Premium Badge */}
                    <div className="absolute top-5 left-5 z-10">
                      <div className="bg-[#0B1021]/80 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5">
                        <FaCrown /> Premium Partner
                      </div>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-10">
                      <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                        <FiStar className="text-[#D4AF37] fill-[#D4AF37]" size={14} />
                        <span className="text-gray-900 text-xs font-black">{rating.toFixed(1)} <span className="text-gray-400 text-[10px] font-bold">({reviewsCount}+ Reviews)</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">
                        {cab.type?.replace('_', ' ') || 'Luxury Sedan'}
                      </p>
                      <h3 className="font-display font-black text-2xl text-gray-900 leading-tight">
                        {cab.name || cab.vehicleName || `${cab.brand} ${cab.model}`}
                      </h3>
                    </div>

                    {/* Features Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-100">
                        <FiUsers className="text-gray-400" /> {cab.seatingCapacity} Seats
                      </span>
                      {isAC && (
                        <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-100">
                          <FaSnowflake className="text-gray-400" /> AC
                        </span>
                      )}
                      {isDriver && (
                        <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-100">
                          <FaUserTie className="text-gray-400" /> Chauffeur
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                      <div className="flex flex-col gap-1 mb-5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Starting from</span>
                        <span className="font-serif font-black text-3xl text-gray-900 tracking-tight">{formatPrice(price)}</span>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => navigate(`/baraat-cabs/details/${cab._id}`)} 
                          className="flex-1 bg-white border border-gray-200 text-gray-900 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-gray-900 transition-all flex items-center justify-center"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => navigate(`/baraat-cabs/book?cabId=${cab._id}`)} 
                          className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#9c1349] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
