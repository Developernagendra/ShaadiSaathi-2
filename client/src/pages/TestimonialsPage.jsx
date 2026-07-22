import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTestimonials } from '../store/slices/featureSlice'
import StarRating from '../components/common/StarRating'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiMapPin, FiMessageCircle, FiHeart, FiCamera, FiCheckCircle } from 'react-icons/fi';

const DEMO_COUPLES = [
  {
    name: 'Rahul & Priya',
    city: 'Patna',
    rating: 5,
    text: 'ShaadiSaathi made our wedding planning absolutely effortless. Finding trusted vendors used to be a nightmare, but this platform turned our dream into a beautiful reality.',
    date: 'December 12, 2025',
    servicesBooked: ['Photography', 'Venue', 'Makeup'],
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
  },
  {
    name: 'Aman & Sneha',
    city: 'Darbhanga',
    rating: 5,
    text: 'From premium Baraat Cabs to the most elegant decor, everything was flawless. A truly magical experience that we will cherish forever.',
    date: 'November 28, 2025',
    servicesBooked: ['Baraat Cabs', 'Decoration'],
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
  },
  {
    name: 'Vikram & Anjali',
    city: 'Jaipur',
    rating: 5,
    text: 'A royal wedding made possible without the stress. The AI planner kept our budget perfectly on track while delivering uncompromising luxury.',
    date: 'January 15, 2026',
    servicesBooked: ['AI Planner', 'Catering', 'Photography'],
    image: 'https://images.unsplash.com/photo-1583939000140-5b323675f3a0?w=600&q=80',
  },
  {
    name: 'Rohan & Kavya',
    city: 'Delhi',
    rating: 5,
    text: 'We found the best candid photographer through ShaadiSaathi. The transparent pricing and verified reviews gave us so much peace of mind.',
    date: 'February 2, 2026',
    servicesBooked: ['Photography', 'Mehndi Artist'],
    image: 'https://images.unsplash.com/photo-1538318357039-44036f01449c?w=600&q=80',
  },
  {
    name: 'Aditya & Neha',
    city: 'Mumbai',
    rating: 4.5,
    text: 'The venue options were breathtaking. The booking process was seamless, and the customer support was there for us every step of the way.',
    date: 'March 10, 2026',
    servicesBooked: ['Venue', 'Catering', 'Music & DJ'],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  },
  {
    name: 'Karan & Pooja',
    city: 'Varanasi',
    rating: 5,
    text: 'A deeply spiritual and perfectly managed wedding by the ghats. ShaadiSaathi connected us with vendors who truly understood our cultural needs.',
    date: 'April 5, 2026',
    servicesBooked: ['Decoration', 'Priest', 'Catering'],
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80',
  }
]

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
]

export default function TestimonialsPage() {
  const dispatch = useDispatch()
  const { testimonials = [], loading = false } = useSelector((s) => s.feature || {})

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    dispatch(fetchTestimonials())
  }, [dispatch])

  const baseData = testimonials && testimonials.length > 0 ? testimonials : DEMO_COUPLES

  const uniqueCities = useMemo(() => {
    const cities = new Set(baseData.map(t => t.city))
    return Array.from(cities).sort()
  }, [baseData])

  const filteredData = useMemo(() => {
    let result = [...baseData]
    if (searchTerm.trim()) {
      const lowerQuery = searchTerm.toLowerCase()
      result = result.filter(t => 
        t.name?.toLowerCase().includes(lowerQuery) || 
        t.text?.toLowerCase().includes(lowerQuery) ||
        t.city?.toLowerCase().includes(lowerQuery)
      )
    }
    if (filterCity) {
      result = result.filter(t => t.city === filterCity)
    }
    return result
  }, [baseData, searchTerm, filterCity])

  const displayedData = filteredData.slice(0, visibleCount)

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6)
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 font-sans">
      
      {/* ── ❤️ HERO HEADER SECTION ── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#8E244D]">
        <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-[#C2185B]/30 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 md:w-[600px] md:h-[600px] bg-[#D4AF37]/20 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 mb-8 shadow-xl">
             <FiHeart className="text-[#D4AF37] fill-[#D4AF37]" size={16} />
             <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">Trusted by 10+ Couples</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">
            Happy <span className="text-[#C2185B] italic bg-clip-text text-transparent bg-gradient-to-r from-[#C2185B] to-[#D4AF37]">Couples</span> ❤️
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/80 text-lg md:text-2xl font-medium italic max-w-2xl mx-auto leading-relaxed mb-12">
            Read genuine emotional experiences from couples who trusted ShaadiSaathi to bring their dream weddings to life.
          </motion.p>
          
          {/* Filters */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white/10 backdrop-blur-2xl p-4 md:p-5 rounded-[2rem] shadow-premium border border-white/20 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={20} />
              <input 
                type="text" 
                placeholder="Search beautiful memories..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(6); }}
                className="w-full pl-14 pr-6 py-4 bg-white/10 rounded-[1.5rem] border border-white/10 focus:border-[#D4AF37] focus:bg-white/20 text-white placeholder-white/50 font-medium outline-none transition-all"
              />
            </div>
            
            <div className="relative w-full md:w-64">
              <FiMapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37] z-10" />
              <select 
                value={filterCity}
                onChange={(e) => { setFilterCity(e.target.value); setVisibleCount(6); }}
                className="w-full pl-14 pr-10 py-4 bg-white/10 rounded-[1.5rem] border border-white/10 focus:border-[#D4AF37] focus:bg-white/20 text-white font-medium outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="" className="text-gray-900">All Locations</option>
                {uniqueCities.map(c => (
                  <option key={c} value={c} className="text-gray-900">{c}</option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 👰🤵 COUPLE STORY CARDS ── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] h-96 md:h-[500px] shadow-sm border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : displayedData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-pink-100 shadow-sm max-w-3xl mx-auto">
            <FiMessageCircle className="mx-auto text-5xl text-[#C2185B]/30 mb-4" />
            <h3 className="text-2xl font-display font-black text-gray-900 mb-2">No Stories Found</h3>
            <p className="text-gray-500 font-medium italic">Try adjusting your search to discover more beautiful memories.</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence>
                {displayedData.map((t, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    key={`${t.name}-${idx}`} 
                    className="group bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(194,24,91,0.15)] transition-all duration-500 border border-pink-50/50 flex flex-col overflow-hidden hover:-translate-y-2"
                  >
                    {/* Couple Image Banner */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img 
                        src={t.image || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80'} 
                        alt={t.name}
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-2xl font-display font-black text-white drop-shadow-lg leading-tight">{t.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1 mt-1">
                          <FiMapPin /> {t.city} • {t.date}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg border border-white/20">
                         <StarRating rating={t.rating || 5} size="sm" showCount={false} />
                      </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col bg-white relative">
                      <span className="absolute -top-6 right-8 text-6xl text-[#C2185B]/10 font-display font-black leading-none rotate-180 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm">"</span>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 italic flex-grow relative z-10 font-medium">
                        "{t.text}"
                      </p>
                      
                      <div className="mt-auto">
                        {t.servicesBooked && t.servicesBooked.length > 0 && (
                          <div className="mb-6 flex flex-wrap gap-2">
                            {t.servicesBooked.map((service, i) => (
                              <span key={i} className="bg-pink-50 text-[#C2185B] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-pink-100">
                                {service}
                              </span>
                            ))}
                          </div>
                        )}
                        <button className="w-full bg-white border-2 border-gray-100 text-gray-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#C2185B] hover:text-[#C2185B] transition-all flex items-center justify-center gap-2 group-hover:bg-[#FFF8F0]">
                          View Wedding Story <FiHeart className="group-hover:fill-[#C2185B] transition-colors" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {visibleCount < filteredData.length && (
              <div className="text-center mt-16">
                <button 
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black uppercase tracking-widest text-[10px] px-10 py-5 rounded-[2rem] shadow-xl hover:shadow-[0_10px_30px_rgba(194,24,91,0.4)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
                >
                  Load More Beautiful Stories <FiHeart />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── 📸 GALLERY / MEMORY SHOWCASE ── */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FFF8F0] text-[#C2185B] px-5 py-2 rounded-full border border-pink-100 mb-6 shadow-sm">
             <FiCamera size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Memory Showcase</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-16 tracking-tight">
            Captured <span className="text-[#C2185B] italic">Moments</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GALLERY_IMAGES.map((img, idx) => (
              <div key={idx} className={`relative overflow-hidden rounded-[2rem] shadow-md group ${idx === 1 || idx === 2 ? 'md:col-span-2 lg:col-span-2' : ''} h-64 md:h-80`}>
                <img 
                  src={img} 
                  alt="Wedding Memory" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                  <FiHeart className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-50 group-hover:scale-100 transform" size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 💬 TRUST ELEMENTS ── */}
      <section className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] py-16">
        <div className="max-w-5xl mx-auto px-4 text-center flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4 text-white">
            <FiCheckCircle size={40} className="text-[#D4AF37]" />
            <div className="text-left">
              <h4 className="font-display font-black text-2xl">100% Verified Reviews</h4>
              <p className="text-white/60 text-sm font-medium italic">Every story comes from a booked client</p>
            </div>
          </div>
          <div className="w-px h-16 bg-white/10 hidden md:block" />
          <div className="flex items-center gap-4 text-white">
            <FiHeart size={40} className="text-[#C2185B] fill-[#C2185B]" />
            <div className="text-left">
              <h4 className="font-display font-black text-2xl">10+ Happy Couples</h4>
              <p className="text-white/60 text-sm font-medium italic">Trusted by families across India</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
