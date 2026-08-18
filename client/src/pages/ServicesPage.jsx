import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVendors, fetchCategories } from '../store/slices/vendorSlice'
import VendorCard from '../components/vendor/VendorCard'
import { SkeletonCard } from '../components/common/Skeleton'
import { INDIAN_CITIES } from '../utils/helpers'
import { FiSearch, FiFilter, FiX, FiMapPin, FiChevronDown, FiStar, FiCheck, FiAward, FiHeart, FiShield, FiThumbsUp, FiLock, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '../utils/socket'

const SORT_OPTIONS = [
  { value: 'rating', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'bookings', label: 'Most Booked' },
]

const RATING_OPTIONS = [
  { label: 'Any Rating', value: '' },
  { label: '4.5+ (Excellent)', value: '4.5' },
  { label: '4.0+ (Very Good)', value: '4.0' },
  { label: '3.0+ (Good)', value: '3.0' },
]

export default function ServicesPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { vendors, categories, fetchLoading: loading, pagination } = useSelector(s => s.vendor)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const { categorySlug: paramCategorySlug } = useParams()
  const categorySlug = paramCategorySlug || searchParams.get('category') || ''

  const [localFilters, setLocalFilters] = useState({
    city: searchParams.get('city') || '',
    categorySlug: categorySlug,
    minPrice: searchParams.get('priceMin') || '',
    maxPrice: searchParams.get('priceMax') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'rating',
    date: searchParams.get('date') || '',
    verified: searchParams.get('verified') === 'true',
    featured: searchParams.get('featured') === 'true',
    premium: searchParams.get('premium') === 'true'
  })

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Sync category Slug from URL param changes
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      categorySlug: categorySlug
    }))
  }, [categorySlug])

  const loadVendors = useCallback(() => {
    dispatch(fetchVendors({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      city: localFilters.city || undefined,
      category: localFilters.categorySlug || undefined,
      priceMin: localFilters.minPrice || undefined,
      priceMax: localFilters.maxPrice || undefined,
      rating: localFilters.rating || undefined,
      sort: localFilters.sort,
      date: localFilters.date || undefined,
      verified: localFilters.verified ? 'true' : undefined,
      featured: localFilters.featured ? 'true' : undefined,
      premium: localFilters.premium ? 'true' : undefined
    }))
  }, [dispatch, page, debouncedSearch, localFilters])

  // Update query params when state changes
  useEffect(() => {
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (localFilters.city) params.city = localFilters.city
    if (localFilters.categorySlug) params.category = localFilters.categorySlug
    if (localFilters.minPrice) params.priceMin = localFilters.minPrice
    if (localFilters.maxPrice) params.priceMax = localFilters.maxPrice
    if (localFilters.rating) params.rating = localFilters.rating
    if (localFilters.sort) params.sort = localFilters.sort
    if (localFilters.date) params.date = localFilters.date
    if (localFilters.verified) params.verified = 'true'
    if (localFilters.featured) params.featured = 'true'
    if (localFilters.premium) params.premium = 'true'
    if (page > 1) params.page = page

    setSearchParams(params)
    loadVendors()
  }, [debouncedSearch, localFilters, page, setSearchParams])

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories())
    }
  }, [dispatch, categories?.length])

  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.on('vendor_updated', loadVendors)
    }
    return () => {
      if (socket) socket.off('vendor_updated', loadVendors)
    }
  }, [loadVendors])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setDebouncedSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setLocalFilters({
      city: '',
      categorySlug: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'rating',
      date: '',
      verified: false,
      featured: false,
      premium: false
    })
    setSearchInput('')
    setPage(1)
  }

  const activeFilterCount = [
    localFilters.city,
    localFilters.minPrice,
    localFilters.rating,
    localFilters.date,
    localFilters.verified,
    localFilters.featured,
    localFilters.premium
  ].filter(Boolean).length

  // Derived Featured Vendors
  const featuredVendors = useMemo(() => {
    return (vendors || []).filter(v => v.isFeatured || v.rating?.average >= 4.5).slice(0, 6)
  }, [vendors])

  const activeCategory = useMemo(() => {
    if (!categories || !localFilters.categorySlug) return null;
    return categories.find(c => c.slug === localFilters.categorySlug);
  }, [categories, localFilters.categorySlug]);

  return (
    <div className="min-h-screen bg-[#FFFBF9] font-sans pb-20">

      {/* ── 1. HERO SECTION ── */}
      <section className="relative pt-28 pb-16 px-4 bg-[#FFF0F5] overflow-hidden">
        {/* Subtle premium gradient/pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F5] via-[#FFF8F0] to-[#FDFDFD] z-0" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {activeCategory ? (
             <div className="mb-6 md:mb-10 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 bg-white rounded-full shadow-[0_10px_40px_rgba(194,24,91,0.15)] flex items-center justify-center text-4xl mb-4 border border-pink-100"
                >
                  {activeCategory.icon || '✨'}
                </motion.div>
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#9c1349] mb-3 tracking-tight">
                  {activeCategory.name} Vendors
                </h1>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                  Find and book the most trusted {activeCategory.name} professionals for your dream wedding. Browse portfolios, compare prices, and connect directly.
                </p>
             </div>
          ) : (
            <>
              <p className="text-[10px] md:text-xs font-black text-[#C2185B] uppercase tracking-[0.2em] mb-4 inline-block bg-white/50 px-4 py-1.5 rounded-full border border-pink-100">
                ✨ अपनी शादी के लिए बेस्ट VENDOR खोजें
              </p>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                अपनी शादी के लिए चुनें सबसे बेहतरीन Vendors
              </h1>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-10">
                भरोसेमंद वेडिंग प्रोफेशनल्स को खोजें, उनकी Services और पोर्टफोलियो देखें और अपनी शादी के लिए सही Vendor बुक करें।
              </p>
            </>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-white rounded-[2rem] p-2 shadow-[0_10px_40px_rgba(194,24,91,0.08)] flex flex-col md:flex-row items-center border border-pink-100/50 max-w-4xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-3 w-full border-b md:border-b-0 md:border-r border-gray-100">
              <FiSearch className="text-[#D4AF37] text-lg mr-3 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="फोटोग्राफर, कैटरर्स, डेकोरेटर खोजें..."
                className="w-full outline-none text-gray-900 font-medium bg-transparent"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput('')} className="text-gray-400 hover:text-gray-600 ml-2">
                  <FiX />
                </button>
              )}
            </div>

            <div className="flex-1 flex items-center px-4 py-3 w-full">
              <FiMapPin className="text-[#C2185B] text-lg mr-3 shrink-0" />
              <select
                value={localFilters.city}
                onChange={e => { setLocalFilters(prev => ({ ...prev, city: e.target.value })); setPage(1) }}
                className="w-full outline-none text-gray-900 font-medium bg-transparent appearance-none cursor-pointer"
              >
                <option value="">शहर चुनें</option>
                {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <FiChevronDown className="text-gray-400 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-[#C2185B] hover:bg-[#9c1349] text-white px-8 py-4 rounded-[1.5rem] font-bold text-sm transition-colors whitespace-nowrap mt-2 md:mt-0"
            >
              Vendors खोजें →
            </button>
          </form>
        </div>
      </section>

      {/* ── 2. CATEGORY NAVIGATION ── */}
      <section className="border-b border-gray-100 bg-white sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar py-4 gap-3 items-center">
            <button
              onClick={() => { setLocalFilters(prev => ({ ...prev, categorySlug: '' })); setPage(1) }}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${!localFilters.categorySlug ? 'bg-gradient-to-r from-[#C2185B] to-[#9c1349] text-white border-transparent shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            >
              सभी केटेगरी
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => { setLocalFilters(prev => ({ ...prev, categorySlug: cat.slug })); setPage(1) }}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${localFilters.categorySlug === cat.slug ? 'bg-gradient-to-r from-[#C2185B] to-[#9c1349] text-white border-transparent shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                <span>{cat.icon || '✨'}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-8">

        {/* ── 3. FILTER BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex items-center gap-4 w-full md:w-auto">

            {/* Desktop Quick Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <select
                value={localFilters.rating}
                onChange={e => { setLocalFilters(prev => ({ ...prev, rating: e.target.value })); setPage(1) }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#C2185B] cursor-pointer"
              >
                {RATING_OPTIONS.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
              </select>

              <button
                onClick={() => { setLocalFilters(prev => ({ ...prev, verified: !prev.verified })); setPage(1) }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-colors ${localFilters.verified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
              >
                <FiCheck /> Verified
              </button>

              <button
                onClick={() => { setLocalFilters(prev => ({ ...prev, premium: !prev.premium })); setPage(1) }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-colors ${localFilters.premium ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
              >
                <FiAward /> Premium
              </button>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 flex items-center justify-center gap-2"
            >
              <FiFilter /> Filters {activeFilterCount > 0 && <span className="bg-[#C2185B] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{activeFilterCount}</span>}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">Sort by:</span>
            <select
              value={localFilters.sort}
              onChange={e => { setLocalFilters(prev => ({ ...prev, sort: e.target.value })); setPage(1) }}
              className="w-full md:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#C2185B] cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── 6. FEATURED VENDORS STRIP ── */}
        {!loading && featuredVendors.length > 0 && page === 1 && (
          <div className="mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">✨ Top Wedding Vendors</p>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Featured Vendors</h2>
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">Meet some of the most trusted wedding professionals on ShaadiSaathi.</p>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-6 hide-scrollbar pb-6 snap-x snap-mandatory">
              {featuredVendors.map(v => (
                <div key={`featured-${v._id}`} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] snap-center shrink-0">
                  <VendorCard vendor={v} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4 & 5 & 9 & 10. VENDOR GRID / LOADING / EMPTY STATE ── */}
        <div className="mb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full aspect-[4/3] bg-gray-200" />
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded-xl w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (!vendors || vendors.length === 0) ? (
            <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center">
              <div className="w-32 h-32 mb-6">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="#FFF0F5" />
                  <path d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C63.8 75 75 63.8 75 50C75 36.2 63.8 25 50 25ZM50 68.8C39.7 68.8 31.2 60.3 31.2 50C31.2 39.7 39.7 31.2 50 31.2C60.3 31.2 68.8 39.7 68.8 50C68.8 60.3 60.3 68.8 50 68.8Z" fill="#C2185B" opacity="0.2" />
                  <path d="M53.1 46.9L62.5 37.5" stroke="#C2185B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M37.5 62.5L46.9 53.1" stroke="#C2185B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="43.8" cy="43.8" r="6.2" stroke="#C2185B" strokeWidth="4" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">Oops! We couldn't find vendors matching your search.</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Try changing your location, category, or removing some filters to see more results.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleClearFilters} className="bg-white border border-gray-200 text-gray-700 font-bold uppercase tracking-widest text-[11px] px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
                  Clear Filters
                </button>
                <button onClick={() => { handleClearFilters(); setLocalFilters(prev => ({ ...prev, categorySlug: '' })) }} className="bg-[#C2185B] text-white font-bold uppercase tracking-widest text-[11px] px-8 py-4 rounded-xl hover:bg-[#9c1349] transition-colors shadow-md">
                  Explore All Vendors
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(vendors || []).map(v => <VendorCard key={v._id} vendor={v} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${page === i + 1 ? 'bg-[#C2185B] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C2185B] hover:text-[#C2185B]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 7. TRUST SECTION ── */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-wrap justify-center md:justify-between gap-8 md:gap-4 items-center mb-10">
          <div className="flex flex-col items-center text-center gap-3 w-[45%] md:w-auto">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl"><FiShield /></div>
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Verified Vendors</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 w-[45%] md:w-auto">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl"><FiThumbsUp /></div>
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Real Reviews</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 w-[45%] md:w-auto">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#C2185B] flex items-center justify-center text-xl"><FiHeart /></div>
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Transparent Pricing</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 w-[45%] md:w-auto">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl"><FiLock /></div>
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Secure Booking</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl"><FiUsers /></div>
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Local Experts</p>
          </div>
        </div>

      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-[100] max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="font-serif font-bold text-xl text-gray-900">More Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <FiX size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Minimum Rating</label>
                  <select
                    value={localFilters.rating}
                    onChange={e => setLocalFilters(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                  >
                    {RATING_OPTIONS.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Vendor Badges</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50">
                      <input
                        type="checkbox"
                        checked={localFilters.verified}
                        onChange={() => setLocalFilters(prev => ({ ...prev, verified: !prev.verified }))}
                        className="w-5 h-5 rounded border-gray-300 text-[#C2185B] focus:ring-[#C2185B]"
                      />
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><FiCheck className="text-green-600" /> Verified Partners</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50">
                      <input
                        type="checkbox"
                        checked={localFilters.premium}
                        onChange={() => setLocalFilters(prev => ({ ...prev, premium: !prev.premium }))}
                        className="w-5 h-5 rounded border-gray-300 text-[#C2185B] focus:ring-[#C2185B]"
                      />
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><FiAward className="text-amber-500" /> Premium Vendors</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-4 bg-white">
                <button
                  onClick={() => { handleClearFilters(); setFiltersOpen(false); }}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-[11px] py-4 rounded-xl"
                >
                  Clear
                </button>
                <button
                  onClick={() => { loadVendors(); setFiltersOpen(false); }}
                  className="flex-[2] bg-[#C2185B] text-white font-bold uppercase tracking-widest text-[11px] py-4 rounded-xl shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
