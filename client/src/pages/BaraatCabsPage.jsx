import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiUsers, FiStar, FiHeart, FiSearch, FiChevronRight, FiChevronLeft,
  FiCalendar, FiClock, FiShield, FiCheckCircle, FiInfo, FiX, FiPhone, FiArrowRight
} from 'react-icons/fi';
import { FaCrown, FaSnowflake, FaUserTie, FaCarSide } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import api from '../utils/api';
import { apiCache } from '../utils/apiCache';
import { formatPrice } from '../utils/helpers';
import { toast } from 'react-hot-toast';
import BaraatCabsSkeleton from '../components/common/BaraatCabsSkeleton';
import ExpertConsultationModal from '../components/packages/ExpertConsultationModal';




// Madhubani subtle pattern
const MadhubaniBg = () => (
  <svg className="absolute inset-0 w-full h-full text-[#D4AF37] opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <pattern id="madhubani-bg-page" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M30 5 L30 55 M5 30 L55 30 M20 20 L40 40 M20 40 L40 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="30" cy="30" r="15" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="30" cy="30" r="2" fill="currentColor" />
    </pattern>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#madhubani-bg-page)" />
  </svg>
);

export default function BaraatCabsPage() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // --- STATE ---
  const [items, setItems] = useState(() => {
    const cached = apiCache.get('/fleet/browse?');
    return cached ? (cached.cabs || cached.data || []) : [];
  });
  const [loading, setLoading] = useState(() => !apiCache.has('/fleet/browse?'));
  const [filters, setFilters] = useState({
    city: '',
    venue: '',
    date: '',
    time: '',
    guests: '',
    category: 'All',
  });

  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Modal State
  const [selectedCab, setSelectedCab] = useState(null);

  // --- FETCHING ---
  useEffect(() => {
    fetchData();
  }, [filters.city, filters.date]);

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.date) params.append('date', filters.date);

    const cacheKey = `/fleet/browse?${params.toString()}`;
    if (apiCache.has(cacheKey)) {
      const cached = apiCache.get(cacheKey);
      setItems(cached.cabs || cached.data || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(cacheKey);
      if (res.data.status === 'success') {
        apiCache.set(cacheKey, res.data);
        setItems(res.data.cabs || res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Baraat rides.');
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERING ---
  const filteredItems = useMemo(() => {
    return items.filter(cab => {
      if (filters.category !== 'All') {
        const type = cab.type || '';
        const isDecorated = cab.features?.decorationAvailable || cab.additionalServices?.flowerDecoration;

        if (filters.category === 'Luxury Cars' && !['sedan', 'luxury_car'].includes(type)) return false;
        if (filters.category === 'Premium SUVs' && type !== 'suv') return false;
        if (filters.category === 'Vintage Cars' && type !== 'vintage_car') return false;
        if (filters.category === 'Baraat Special' && !['horse_carriage', 'special', 'bus', 'tempo_traveller'].includes(type)) return false;
        if (filters.category === 'Decorated Cars' && !isDecorated) return false;
      }
      return true;
    });
  }, [items, filters.category]);

  const scrollChips = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // --- QUICK VIEW MODAL COMPONENT ---
  const QuickViewModal = () => {
    if (!selectedCab) return null;
    const rating = selectedCab.rating?.average || selectedCab.vendor?.rating?.average || 4.9;
    const price = selectedCab.price || selectedCab.pricing?.baseFare || 8000;
    const image = selectedCab.images?.[0]?.url || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCab(null)}
            className="absolute inset-0 bg-[#0B1021]/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative z-10 custom-scrollbar"
          >
            <button
              onClick={() => setSelectedCab(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image Gallery (Simplified to 1 large image for quick view) */}
              <div className="md:w-1/2 relative h-64 md:h-auto min-h-[300px]">
                <img src={image} alt={selectedCab.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <div className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2 inline-block">
                    Verified Partner
                  </div>
                  <h3 className="text-3xl font-display font-black text-white">{selectedCab.name || selectedCab.vehicleName}</h3>
                </div>
              </div>

              {/* Details */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">{selectedCab.type?.replace('_', ' ') || 'Luxury Sedan'}</p>
                    <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-sm">
                      <FiStar className="fill-current" /> {rating.toFixed(1)} <span className="text-gray-400 font-medium">(120+ Reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Starting Price</p>
                    <p className="text-3xl font-serif font-black text-gray-900">{formatPrice(price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FiUsers className="text-[#C2185B] text-xl" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Capacity</p>
                      <p className="font-bold text-gray-900">{selectedCab.seatingCapacity || 4} Seats</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FaSnowflake className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Comfort</p>
                      <p className="font-bold text-gray-900">AC Available</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FaUserTie className="text-gray-900 text-xl" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Driver</p>
                      <p className="font-bold text-gray-900">Chauffeur Included</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FiMapPin className="text-green-600 text-xl" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Location</p>
                      <p className="font-bold text-gray-900">Patna, Bihar</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-2">Included Services</h4>
                  <ul className="space-y-2 text-sm text-gray-600 font-medium">
                    <li className="flex items-center gap-2"><FiCheckCircle className="text-green-500" /> Professional Chauffeur</li>
                    <li className="flex items-center gap-2"><FiCheckCircle className="text-green-500" /> Fuel for designated route</li>
                    <li className="flex items-center gap-2"><FiCheckCircle className="text-green-500" /> 8 Hours / 80 Km Package</li>
                    {(selectedCab.features?.decorationAvailable || selectedCab.additionalServices?.flowerDecoration) && (
                      <li className="flex items-center gap-2"><FiCheckCircle className="text-green-500" /> Floral Decoration (Optional)</li>
                    )}
                  </ul>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/baraat-cabs/book?cabId=${selectedCab._id}`)}
                    className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#9c1349] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(194,24,91,0.2)] hover:shadow-[0_15px_30px_rgba(194,24,91,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    Book This Ride <FiArrowRight />
                  </button>
                  <button className="sm:w-1/3 bg-gray-100 text-gray-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                    <FiPhone /> Contact
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans selection:bg-[#C2185B]/20 selection:text-[#C2185B] pb-32">
      <MadhubaniBg />

      {/* ── 1. UNIQUE HERO SECTION ── */}
      <section className="relative pt-32 pb-24 md:pb-32 lg:pb-40 bg-gradient-to-br from-[#0B1021] via-[#111827] to-[#0B1021] overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#C2185B]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
                <FaCrown className="text-sm" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">BARAAT RIDE</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Your Baraat.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37]">
                  Your Royal Ride. 👑
                </span>
              </h1>
              <p className="text-gray-300 text-base md:text-lg lg:text-xl font-medium mb-4 max-w-lg leading-relaxed">
                Find the perfect ride for your Baraat — from elegant family cars to grand luxury vehicles.
              </p>
              <p className="text-[#C2185B] text-sm md:text-base font-bold italic mb-8">
                "आपकी Baraat की शाही सवारी, अब एक ही जगह।"
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-[#0B1021] px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2">
                  Find My Baraat Ride <FiArrowRight />
                </button>
                <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all flex items-center justify-center">
                  Explore All Vehicles
                </button>
              </div>
            </motion.div>

            {/* Right Visual Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[400px] sm:h-[500px] w-full hidden md:block"
            >
              {/* Layered Cards */}
              <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#0B1021] z-20 hover:scale-105 transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Luxury Car" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#0B1021] z-30 hover:scale-105 transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Premium Sedan" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-1/2 h-1/2 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#0B1021] z-10 opacity-60">
                <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="SUV" className="w-full h-full object-cover" />
              </div>

              {/* Floating Verified Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -right-6 top-1/4 z-40 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <FiShield size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">ShaadiSaathi</p>
                  <p className="text-sm font-black text-gray-900">Verified Partners</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. SMART RIDE SEARCH PANEL ── */}
      <div className="max-w-5xl mx-auto px-4 relative z-30 -mt-16 md:-mt-20 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="font-display font-black text-xl md:text-2xl text-gray-900">Find the Perfect Ride for Your Baraat</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2 bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-200 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiMapPin className="text-[#C2185B] text-xl shrink-0" />
              <div className="w-full">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Pickup Location</p>
                <input type="text" placeholder="City or Area" value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder-gray-400" />
              </div>
            </div>

            <div className="lg:col-span-2 bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-200 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiMapPin className="text-blue-500 text-xl shrink-0" />
              <div className="w-full">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Wedding Venue</p>
                <input type="text" placeholder="Drop Location" value={filters.venue} onChange={e => setFilters({ ...filters, venue: e.target.value })} className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-200 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiCalendar className="text-[#D4AF37] text-xl shrink-0" />
              <div className="w-full">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Date</p>
                <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-200 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiUsers className="text-green-500 text-xl shrink-0" />
              <div className="w-full">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Guests</p>
                <select value={filters.guests} onChange={e => setFilters({ ...filters, guests: e.target.value })} className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 cursor-pointer">
                  <option value="">Any</option>
                  <option value="1-4">1-4</option>
                  <option value="5-7">5-7</option>
                  <option value="8+">8+</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="w-full md:w-auto bg-[#0B1021] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all">
              Search Rides
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">



        {/* ── 5. BROWSE BARAAT RIDES (LISTINGS) ── */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
            <div>
              <h3 className="font-display font-black text-3xl text-gray-900">Choose Your Baraat Ride</h3>
              <p className="text-gray-500 font-medium mt-1">Showing {filteredItems.length} vehicles matching your criteria</p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-full md:w-auto">
              <span className="text-xs font-bold uppercase text-gray-400 pl-3">Sort by:</span>
              <select className="bg-transparent border-none outline-none text-sm font-bold text-gray-900 py-2 pr-4 cursor-pointer w-full md:w-auto">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <BaraatCabsSkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300">
              <FaCarSide className="text-4xl text-gray-300 mx-auto mb-4" />
              <h4 className="font-display font-black text-xl text-gray-900 mb-2">No Rides Found</h4>
              <p className="text-gray-500 mb-6">Try adjusting your filters or category to see more options.</p>
              <button onClick={() => setFilters({ ...filters, category: 'All', city: '' })} className="bg-gray-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
                Clear Filters
              </button>
              <button 
                onClick={() => setIsConsultationModalOpen(true)}
                className="ml-4 bg-transparent border border-gray-300 text-gray-900 px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                Talk to an Expert
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredItems.map(cab => {
                const rating = cab.rating?.average || cab.vendor?.rating?.average || 4.9;
                const reviewsCount = cab.rating?.count || cab.vendor?.rating?.count || 120;
                const price = cab.price || cab.pricing?.baseFare || 8000;

                return (
                  <motion.div
                    key={cab._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#D4AF37]/30 transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <LazyLoadImage
                        src={cab.images?.[0]?.url || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                        alt={cab.name}
                        effect="blur"
                        wrapperProps={{ style: { display: "block", width: "100%", height: "100%" } }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm text-gray-900">
                        <FiShield className="text-green-500" /> Verified
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="bg-[#0B1021]/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10">
                          <FiStar className="text-[#D4AF37] fill-current" size={12} />
                          <span className="text-white text-xs font-bold">{rating.toFixed(1)} <span className="text-gray-400 font-medium">({reviewsCount})</span></span>
                        </div>
                        {(cab.features?.decorationAvailable || cab.additionalServices?.flowerDecoration) && (
                          <div className="bg-[#C2185B]/90 backdrop-blur-md px-2 py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                            <FiStar size={10} className="fill-current" /> Decoration
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                          {cab.type?.replace('_', ' ') || 'Luxury Sedan'}
                        </p>
                        <h4 className="font-display font-black text-2xl text-gray-900 leading-tight">
                          {cab.name || cab.vehicleName || `${cab.brand} ${cab.model}`}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <FiUsers className="text-gray-400" /> {cab.seatingCapacity} Seats
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <FaSnowflake className="text-gray-400" /> AC Available
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <FiMapPin className="text-gray-400" /> Patna
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <FaUserTie className="text-gray-400" /> Chauffeur
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Starting Price</p>
                          <p className="font-serif font-black text-2xl text-gray-900">{formatPrice(price)}</p>
                        </div>
                        <button
                          onClick={() => setSelectedCab(cab)}
                          className="bg-[#0B1021] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B1021] transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 8. HOW IT WORKS ── */}
        <div className="mb-24 bg-white rounded-[3rem] p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px]" />

          <div className="text-center mb-12 relative z-10">
            <h3 className="font-display font-black text-3xl md:text-4xl text-gray-900">How It Works</h3>
            <p className="text-gray-500 font-medium mt-2">Book your premium Baraat ride in 4 easy steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {/* Horizontal connecting line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-100" />

            {[
              { step: '01', title: 'Search', desc: 'Find rides near your wedding location.' },
              { step: '02', title: 'Compare', desc: 'Compare vehicles, prices and availability.' },
              { step: '03', title: 'Book', desc: 'Reserve your Baraat Ride securely.' },
              { step: '04', title: 'Celebrate', desc: 'Enjoy your Grand Entry.' }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-24 h-24 mx-auto bg-white border border-gray-200 rounded-full flex flex-col items-center justify-center shadow-sm relative z-10 mb-6">
                  <span className="font-serif font-black text-3xl text-[#D4AF37]">{item.step}</span>
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 9. TRUST & SAFETY ── */}
        <div className="mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: <FiShield />, label: 'Verified Partners' },
              { icon: <FiStar />, label: 'Transparent Pricing' },
              { icon: <FiCheckCircle />, label: 'Secure Booking' },
              { icon: <FiClock />, label: 'Booking Updates' }
            ].map((trust, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-2xl text-[#C2185B] mb-3">{trust.icon}</div>
                <h5 className="font-bold text-sm text-gray-900">{trust.label}</h5>
              </div>
            ))}
          </div>
        </div>

        {/* ── 10. FINAL CTA BANNER ── */}
        <div className="relative rounded-[3rem] overflow-hidden bg-[#0B1021] text-white p-10 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Bg" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="font-display font-black text-4xl md:text-5xl mb-4 leading-tight">Ready to Make Your Baraat Grand? 👑</h3>
            <p className="text-gray-300 font-medium text-lg mb-8">Find a ride that matches your celebration and book instantly.</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-[#0B1021] px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all">
                Explore Baraat Rides
              </button>
              <button 
                onClick={() => setIsConsultationModalOpen(true)}
                className="bg-white/10 backdrop-blur-md border border-white/20 px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <FiPhone /> Talk to an Expert
              </button>
            </div>
          </div>
        </div>

      </div>

      <QuickViewModal />
      {/* MODALS */}
      <AnimatePresence>
        {isConsultationModalOpen && (
          <ExpertConsultationModal
            packageContext={null}
            serviceContext="Baraat Ride"
            onClose={() => setIsConsultationModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
