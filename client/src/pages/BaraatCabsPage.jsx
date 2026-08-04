import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiUsers, FiStar, FiHeart, FiSearch, FiChevronRight, FiChevronLeft,
  FiCalendar, FiClock, FiShield, FiCheckCircle, FiInfo, FiX, FiPhone, FiArrowRight,
  FiSliders, FiCheck, FiAward, FiMessageCircle, FiRefreshCw
} from 'react-icons/fi';
import { FaCrown, FaSnowflake, FaUserTie, FaCarSide, FaWhatsapp, FaHorseHead, FaBusAlt, FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import api from '../utils/api';
import { apiCache } from '../utils/apiCache';
import { formatPrice } from '../utils/helpers';
import { toast } from 'react-hot-toast';
import BaraatCabsSkeleton from '../components/common/BaraatCabsSkeleton';
import ExpertConsultationModal from '../components/packages/ExpertConsultationModal';
import { BARAAT_VEHICLE_IMAGES, BARAAT_RIDE_CATEGORIES, getVehicleFallbackImage } from '../utils/weddingImages';
import SafeImage from '../components/common/SafeImage';

// Subtle Madhubani background pattern for authentic Bihar royal heritage
const MadhubaniBg = () => (
  <svg className="absolute inset-0 w-full h-full text-[#D4AF37] opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <pattern id="madhubani-bg-page" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M40 5 L40 75 M5 40 L75 40 M25 25 L55 55 M25 55 L55 25" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="40" cy="40" r="2.5" fill="currentColor" />
    </pattern>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#madhubani-bg-page)" />
  </svg>
);

// Bihar Cities for dynamic selection
const BIHAR_CITIES = [
  {
    name: 'Patna',
    image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=600&q=80',
    tag: 'Capital Hub'
  },
  {
    name: 'Darbhanga',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    tag: 'Mithila Royal'
  },
  {
    name: 'Muzaffarpur',
    image: 'https://images.unsplash.com/photo-1623166541571-066c1b3f7902?auto=format&fit=crop&w=600&q=80',
    tag: 'North Bihar'
  },
  {
    name: 'Gaya',
    image: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=600&q=80',
    tag: 'Heritage City'
  },
  {
    name: 'Bhagalpur',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    tag: 'Silk City'
  },
  {
    name: 'Madhubani',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    tag: 'Cultural Pride'
  },
];

// Ride Categories matching backend fleet classifications
const RIDE_CATEGORIES = BARAAT_RIDE_CATEGORIES;

// Choose Your Baraat Style cards
const BARAAT_STYLES = [
  {
    id: 'royal_entry',
    title: 'ROYAL ENTRY 👑',
    subtitle: 'Make your grand entrance unforgettable.',
    description: 'Step out of a classic vintage or regal carriage decorated with fresh orchids and golden lights.',
    image: BARAAT_VEHICLE_IMAGES.vintage_car,
    categoryFilter: 'Royal Cars'
  },
  {
    id: 'premium_baraat',
    title: 'PREMIUM BARAAT 🚗',
    subtitle: 'Travel in comfort and style.',
    description: 'Executive chauffeur-driven luxury sedans ensuring the groom arrives in unmatched elegance.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    categoryFilter: 'Luxury Cars'
  },
  {
    id: 'family_baraat',
    title: 'FAMILY BARAAT 👨‍👩‍👧‍👦',
    subtitle: 'Perfect for your family and guests.',
    description: 'Spacious luxury SUVs and premium coaches so your closest family travels together in comfort.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    categoryFilter: 'Premium SUVs'
  },
  {
    id: 'grand_procession',
    title: 'GRAND PROCESSION 🎉',
    subtitle: 'Make the entire Baraat a celebration.',
    description: 'Complete convoy coordination with decorated lead vehicles and guest tempo travellers.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    categoryFilter: 'Decorated Vehicles'
  }
];

export default function BaraatCabsPage() {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const listingsRef = useRef(null);

  // --- STATE ---
  const [items, setItems] = useState(() => {
    const cached = apiCache.get('/fleet/browse?');
    return cached ? (cached.cabs || cached.data || []) : [];
  });
  const [loading, setLoading] = useState(() => !apiCache.has('/fleet/browse?'));
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    destination: '',
    date: '',
    time: '',
    guests: '',
    category: 'All',
  });
  const [sortBy, setSortBy] = useState('Recommended');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);

  // --- FETCHING REAL DATA FROM BACKEND ---
  useEffect(() => {
    fetchData();
  }, [filters.city, filters.date]);

  const fetchData = async () => {
    setError(false);
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
      } else {
        setItems(res.data.cabs || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load Baraat rides:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERING & SORTING REAL VEHICLES ---
  const filteredItems = useMemo(() => {
    let result = items.filter(cab => {
      if (filters.category !== 'All') {
        const type = cab.type || '';
        const isDecorated = Boolean(
          cab.features?.decorationAvailable ||
          cab.additionalServices?.flowerDecoration ||
          cab.isDecorated
        );

        if (filters.category === 'Luxury Cars' && !['sedan', 'luxury_car'].includes(type)) return false;
        if (filters.category === 'Royal Cars' && !['vintage_car', 'royal_car', 'horse_carriage'].includes(type)) return false;
        if (filters.category === 'Premium SUVs' && type !== 'suv') return false;
        if (filters.category === 'Tempo Traveller' && type !== 'tempo_traveller') return false;
        if (filters.category === 'Baraat Bus' && type !== 'bus') return false;
        if (filters.category === 'Decorated Vehicles' && !isDecorated) return false;
        if (filters.category === 'Traditional Baraat' && !['horse_carriage', 'special'].includes(type)) return false;
      }

      if (filters.guests) {
        const capacity = Number(cab.seatingCapacity || 4);
        if (filters.guests === '1-4' && capacity > 4) return false;
        if (filters.guests === '5-7' && (capacity < 5 || capacity > 7)) return false;
        if (filters.guests === '8+' && capacity < 8) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => (a.price || a.pricing?.baseFare || 99999) - (b.price || b.pricing?.baseFare || 99999));
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => (b.price || b.pricing?.baseFare || 0) - (a.price || a.pricing?.baseFare || 0));
    } else if (sortBy === 'Top Rated') {
      result.sort((a, b) => (b.rating?.average || b.vendor?.rating?.average || 0) - (a.rating?.average || a.vendor?.rating?.average || 0));
    }

    return result;
  }, [items, filters.category, filters.guests, sortBy]);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryClick = (categoryName) => {
    setFilters(prev => ({ ...prev, category: categoryName }));
    scrollToSection(listingsRef);
  };

  const handleCityClick = (cityName) => {
    setFilters(prev => ({ ...prev, city: cityName }));
    scrollToSection(listingsRef);
  };

  const handleWhatsAppUs = () => {
    const text = `Namaste! I want assistance for selecting a Baraat Ride for my wedding celebration on ShaadiSaathi.`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- QUICK VIEW MODAL FOR VEHICLE ---
  const QuickViewModal = () => {
    if (!selectedCab) return null;
    const rating = selectedCab.rating?.average || selectedCab.vendor?.rating?.average || 4.9;
    const reviewsCount = selectedCab.rating?.count || selectedCab.vendor?.rating?.count || 120;
    const rawPrice = selectedCab.price || selectedCab.pricing?.baseFare;
    const priceDisplay = rawPrice ? formatPrice(rawPrice) : 'Contact for Price';
    const image = selectedCab.images?.[0]?.url || getVehicleFallbackImage(selectedCab.vehicleType || selectedCab.category);
    const vehicleName = selectedCab.name || selectedCab.vehicleName || `${selectedCab.brand || 'Luxury'} ${selectedCab.model || 'Baraat Car'}`;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-8">
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
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative z-10 custom-scrollbar border border-gray-100"
          >
            <button
              onClick={() => setSelectedCab(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Close modal"
            >
              <FiX size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left Image Gallery Banner */}
              <div className="md:w-1/2 relative h-64 md:h-auto min-h-[300px]">
                <SafeImage
                  src={image}
                  fallbackSrc={getVehicleFallbackImage(selectedCab.vehicleType || selectedCab.category)}
                  alt={vehicleName}
                  title={vehicleName}
                  categoryIcon="👑"
                  aspectRatio="16/10"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#D4AF37] text-[#0B1021] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 shadow-md">
                    <FiShield className="text-black" /> Verified Baraat Partner
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-white mb-1 leading-tight">{vehicleName}</h3>
                  <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                    <FiMapPin className="text-[#D4AF37]" /> {selectedCab.location?.city || 'Patna, Bihar'}
                  </p>
                </div>
              </div>

              {/* Right Vehicle Info */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                      {selectedCab.type?.replace('_', ' ') || 'Premium Wedding Ride'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-sm">
                      <FiStar className="fill-current" /> {rating.toFixed(1)}{' '}
                      <span className="text-gray-400 font-medium">({reviewsCount} Reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Starting Price</p>
                    <p className="text-2xl sm:text-3xl font-serif font-black text-gray-900">{priceDisplay}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FiUsers className="text-[#C2185B] text-xl shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">Capacity</p>
                      <p className="font-bold text-gray-900 text-xs">{selectedCab.seatingCapacity || 4} Seats</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FaSnowflake className="text-blue-500 text-xl shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">Comfort</p>
                      <p className="font-bold text-gray-900 text-xs">AC Available</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FaUserTie className="text-gray-900 text-xl shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">Driver</p>
                      <p className="font-bold text-gray-900 text-xs">Chauffeur Included</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FiShield className="text-emerald-600 text-xl shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">Status</p>
                      <p className="font-bold text-emerald-600 text-xs">Available Now</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm">Included Services & Highlights</h4>
                  <ul className="space-y-2 text-xs text-gray-600 font-medium">
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500 shrink-0" /> Professional Uniformed Chauffeur
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500 shrink-0" /> Fuel included for designated route
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500 shrink-0" /> 8 Hours / 80 Km Ceremonial Package
                    </li>
                    {(selectedCab.features?.decorationAvailable || selectedCab.additionalServices?.flowerDecoration) && (
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-[#C2185B] shrink-0" /> Floral Decoration Available on Request
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/baraat-cabs/details/${selectedCab._id}`)}
                    className="flex-1 bg-gray-100 text-gray-900 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    View Complete Details <FiArrowRight />
                  </button>
                  <button
                    onClick={() => navigate(`/baraat-cabs/book?cabId=${selectedCab._id}`)}
                    className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#9c1349] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(194,24,91,0.2)] hover:shadow-[0_15px_30px_rgba(194,24,91,0.3)] transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    Book Now <FiArrowRight />
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
    <div className="min-h-screen bg-[#FDFCF8] font-sans selection:bg-[#C2185B]/20 selection:text-[#C2185B] pb-24 overflow-x-hidden">
      <MadhubaniBg />

      {/* =========================================================
          1. PREMIUM HERO SECTION
          ========================================================= */}
      <section className="relative pt-28 pb-28 md:pt-36 md:pb-36 bg-gradient-to-br from-[#0B1021] via-[#121A30] to-[#0A0E1D] overflow-hidden">
        {/* Subtle Golden Particles & Lights Effect */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[140px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-[#C2185B]/15 rounded-full blur-[130px] mix-blend-screen pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-[#F4D03F]/10 rounded-full blur-[90px] mix-blend-screen pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
                <FaCrown className="text-xs" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">ROYAL BARAAT RIDE MARKETPLACE</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.08] tracking-tight">
                Make Your Baraat <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37]">
                  Grand &amp; Royal 👑
                </span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg md:text-xl font-medium mb-4 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Royal rides, premium cars aur complete Baraat transportation — aapki celebration ke liye perfect ride ek hi jagah.
              </p>

              <p className="text-[#D4AF37] text-sm md:text-base font-bold italic mb-8">
                "आपकी शाही बारात के लिए पटना और बिहार में सबसे बेहतरीन लग्जरी और विंटेज गाड़ियां।"
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => scrollToSection(searchRef)}
                  className="bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#B38D22] text-[#0B1021] px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  Explore Baraat Rides <FiArrowRight />
                </button>
                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <FiPhone /> Talk to an Expert
                </button>
              </div>

              {/* Trust Indicators below buttons */}
              <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-300 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <FiCheckCircle className="text-[#D4AF37]" /> 100% Verified Fleet
                </span>
                <span className="inline-flex items-center gap-2">
                  <FiCheckCircle className="text-[#D4AF37]" /> Local Bihar Availability
                </span>
                <span className="inline-flex items-center gap-2">
                  <FiCheckCircle className="text-[#D4AF37]" /> Transparent Pricing
                </span>
              </div>
            </motion.div>

            {/* Right Visual Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative h-[340px] sm:h-[420px] lg:h-[460px] w-full mt-8 lg:mt-0"
            >
              {/* Main Decorative Luxury Wedding Car Card */}
              <div className="absolute inset-0 sm:inset-4 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 z-20 group">
                <SafeImage
                  src={BARAAT_VEHICLE_IMAGES.vintage_car}
                  fallbackSrc={BARAAT_VEHICLE_IMAGES.luxury_car}
                  alt="Royal Decorated Vintage Wedding Car"
                  title="Classic Rolls Ceremonial"
                  categoryIcon="👑"
                  aspectRatio="16/10"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021]/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="bg-[#D4AF37] text-[#0B1021] text-[9px] font-black uppercase px-2.5 py-1 rounded-md mb-2 inline-block">
                      Royal Choice 👑
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-black text-white">Classic Rolls Ceremonial</h3>
                    <p className="text-xs text-gray-300 font-medium">Patna &amp; Mithila Region</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white font-bold text-xs flex items-center gap-1">
                    <FiStar className="text-[#D4AF37] fill-current" /> 5.0
                  </div>
                </div>
              </div>

              {/* Floating Verified Badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5 }}
                className="absolute -bottom-4 right-4 sm:right-8 z-30 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                  <FiShield size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">ShaadiSaathi Guarantee</p>
                  <p className="text-xs sm:text-sm font-black text-gray-900">Verified &amp; Insured Rides</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. SMART RIDE SEARCH / BOOKING PANEL
          ========================================================= */}
      <div ref={searchRef} className="max-w-6xl mx-auto px-4 sm:px-6 relative z-30 -mt-14 sm:-mt-16 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-gray-900">Smart Baraat Ride Search</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Check real-time availability in your wedding city</p>
            </div>
            <button
              onClick={() => setFilters({ city: '', destination: '', date: '', time: '', guests: '', category: 'All' })}
              className="text-xs font-bold text-[#C2185B] hover:underline self-start sm:self-auto inline-flex items-center gap-1"
            >
              <FiRefreshCw /> Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* 1. Pickup Location */}
            <div className="lg:col-span-3 bg-gray-50/80 rounded-2xl p-3.5 flex items-center gap-3 border border-gray-200/80 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiMapPin className="text-[#C2185B] text-xl shrink-0" />
              <div className="w-full min-w-0">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">Pickup City / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Patna, Muzaffarpur"
                  value={filters.city}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder-gray-400 truncate"
                />
              </div>
            </div>

            {/* 2. Destination */}
            <div className="lg:col-span-3 bg-gray-50/80 rounded-2xl p-3.5 flex items-center gap-3 border border-gray-200/80 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiMapPin className="text-blue-500 text-xl shrink-0" />
              <div className="w-full min-w-0">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">Destination / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Darbhanga Venue"
                  value={filters.destination}
                  onChange={e => setFilters({ ...filters, destination: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder-gray-400 truncate"
                />
              </div>
            </div>

            {/* 3. Date & Time */}
            <div className="lg:col-span-2 bg-gray-50/80 rounded-2xl p-3.5 flex items-center gap-3 border border-gray-200/80 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiCalendar className="text-[#D4AF37] text-xl shrink-0" />
              <div className="w-full min-w-0">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">Wedding Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={e => setFilters({ ...filters, date: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            {/* 4. Guests / Seating */}
            <div className="lg:col-span-2 bg-gray-50/80 rounded-2xl p-3.5 flex items-center gap-3 border border-gray-200/80 focus-within:border-[#D4AF37] focus-within:bg-white transition-all">
              <FiUsers className="text-emerald-500 text-xl shrink-0" />
              <div className="w-full min-w-0">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">Guests / Seats</label>
                <select
                  value={filters.guests}
                  onChange={e => setFilters({ ...filters, guests: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 cursor-pointer"
                >
                  <option value="">Any Seating</option>
                  <option value="1-4">1-4 Seats (Car/Sedan)</option>
                  <option value="5-7">5-7 Seats (Luxury SUV)</option>
                  <option value="8+">8+ Seats (Traveller/Bus)</option>
                </select>
              </div>
            </div>

            {/* 5. Search Button */}
            <div className="lg:col-span-2 flex">
              <button
                onClick={() => scrollToSection(listingsRef)}
                className="w-full bg-[#0B1021] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[50px] py-3.5"
              >
                <FiSearch /> Find Ride &rarr;
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            3. RIDE CATEGORIES SECTION
            ========================================================= */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">ROYAL FLEET SELECTION</span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 mb-3">
              Find the Perfect Ride for Your Baraat 👑
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Explore ceremonial vintage cars, luxury sedans, VIP SUVs, and Baraat buses tailored for your wedding procession.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {RIDE_CATEGORIES.map((cat) => {
              const isSelected = filters.category === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -5 }}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`group cursor-pointer rounded-[2rem] overflow-hidden border transition-all duration-300 flex flex-col bg-white shadow-sm hover:shadow-xl ${isSelected ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 bg-amber-50/20' : 'border-gray-100 hover:border-gray-300'
                    }`}
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-900">
                    <SafeImage
                      src={cat.image}
                      fallbackSrc={cat.fallbackImage || getVehicleFallbackImage(cat.id)}
                      alt={cat.name}
                      title={cat.name}
                      categoryIcon={cat.icon}
                      aspectRatio="16/10"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                    <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm z-10">
                      {cat.icon}
                    </div>
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                      <h3 className="font-serif font-black text-lg sm:text-xl text-white leading-tight drop-shadow-md">{cat.name}</h3>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <p className="text-xs text-gray-600 font-medium mb-4 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#C2185B] group-hover:text-gray-900 transition-colors">
                      <span>Explore Fleet</span>
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            4. FEATURED BARAAT RIDES (LISTINGS)
            ========================================================= */}
        <div ref={listingsRef} className="mb-24 scroll-mt-28">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-1">AVAILABLE NOW IN BIHAR</span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-gray-900">Popular Baraat Rides Near You</h2>
              <p className="text-gray-500 font-medium mt-1 text-sm">
                Showing {filteredItems.length} verified vehicles matching <span className="font-bold text-gray-800">{filters.category}</span>
                {filters.city && ` in ${filters.city}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {filters.category !== 'All' && (
                <button
                  onClick={() => setFilters({ ...filters, category: 'All' })}
                  className="bg-gray-100 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors inline-flex items-center gap-1.5"
                >
                  {filters.category} <FiX />
                </button>
              )}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-xs w-full sm:w-auto">
                <span className="text-xs font-bold uppercase text-gray-400 pl-3">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 py-2 pr-4 cursor-pointer w-full sm:w-auto"
                >
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings State */}
          {loading ? (
            <BaraatCabsSkeleton />
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm max-w-xl mx-auto px-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
              <h3 className="font-serif font-black text-2xl text-gray-900 mb-2">Oops! Rides load nahi ho paayi.</h3>
              <p className="text-gray-500 mb-8 text-sm">We encountered a temporary network issue while loading available vehicles.</p>
              <button
                onClick={fetchData}
                className="bg-[#0B1021] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            /* 18. EMPTY STATE — Exactly as required */
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-300 max-w-2xl mx-auto px-6">
              <FaCarSide className="text-5xl text-[#D4AF37] mx-auto mb-4 opacity-80" />
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-gray-900 mb-2">
                Abhi is location ke liye koi Baraat Ride available nahi hai.
              </h3>
              <p className="text-gray-500 font-medium mb-8 text-sm max-w-md mx-auto">
                We are actively adding more royal vehicles across Bihar. You can change your filter location or speak with our wedding transportation specialist.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setFilters({ ...filters, city: '', category: 'All' })}
                  className="bg-[#0B1021] text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Change Location
                </button>
                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="bg-transparent border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  Talk to an Expert
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map(cab => {
                const rating = cab.rating?.average || cab.vendor?.rating?.average || 4.9;
                const reviewsCount = cab.rating?.count || cab.vendor?.rating?.count || 120;
                const rawPrice = cab.price || cab.pricing?.baseFare;
                const priceDisplay = rawPrice ? formatPrice(rawPrice) : 'Contact for Price';
                const vehicleName = cab.name || cab.vehicleName || `${cab.brand || 'Royal'} ${cab.model || 'Baraat Car'}`;
                const cityLocation = cab.location?.city || 'Patna';

                return (
                  <motion.div
                    key={cab._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:border-[#D4AF37]/40 transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Header with Aspect Ratio 16:10 */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                      <SafeImage
                        src={cab.images?.[0]?.url || getVehicleFallbackImage(cab.vehicleType || cab.category)}
                        fallbackSrc={getVehicleFallbackImage(cab.vehicleType || cab.category)}
                        alt={vehicleName}
                        title={vehicleName}
                        subtitle={cab.category || 'Verified Baraat Ride'}
                        categoryIcon="🚗"
                        aspectRatio="16/10"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Verified Badge */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm text-gray-900">
                        <FiShield className="text-emerald-500" /> Verified
                      </div>

                      {/* Availability Badge */}
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Available Now
                      </div>

                      {/* Rating & Decor pill */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="bg-[#0B1021]/85 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10 text-white text-xs font-bold">
                          <FiStar className="text-[#D4AF37] fill-current" size={13} />
                          <span>{rating.toFixed(1)}</span>
                          <span className="text-gray-400 text-[11px] font-medium">({reviewsCount})</span>
                        </div>
                        {(cab.features?.decorationAvailable || cab.additionalServices?.flowerDecoration || cab.isDecorated) && (
                          <div className="bg-[#C2185B]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                            <FaCrown size={10} className="text-[#D4AF37]" /> Decorated
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-7 flex flex-col flex-1">
                      <div className="mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                          {cab.type?.replace('_', ' ') || 'Luxury Ceremonial Car'} • {cityLocation}
                        </span>
                        <h3 className="font-serif font-black text-xl sm:text-2xl text-gray-900 leading-tight group-hover:text-[#C2185B] transition-colors">
                          {vehicleName}
                        </h3>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-3 mb-6 border-b border-gray-100 pb-5 text-xs text-gray-600 font-medium">
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-[#C2185B] shrink-0" />
                          <span>{cab.seatingCapacity || 4} Seater</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaSnowflake className="text-blue-500 shrink-0" />
                          <span>AC Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-emerald-500 shrink-0" />
                          <span>{cityLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-gray-900 shrink-0" />
                          <span>Chauffeur Included</span>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3">
                        <div>
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">Starting Price</span>
                          <span className="font-serif font-black text-xl text-gray-900">{priceDisplay}</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setSelectedCab(cab)}
                            className="flex-1 sm:flex-none bg-gray-100 text-gray-800 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-200 transition-all min-h-[44px]"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => navigate(`/baraat-cabs/book?cabId=${cab._id}`)}
                            className="flex-1 sm:flex-none bg-[#0B1021] text-[#D4AF37] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#0B1021] transition-all shadow-md min-h-[44px]"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* =========================================================
            5. CHOOSE YOUR BARAAT STYLE ✨
            ========================================================= */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">ROYAL INSPIRATIONS</span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 mb-3">
              Choose Your Baraat Style ✨
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Every wedding story is unique. Select a celebration theme that complements your grand procession.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BARAAT_STYLES.map((style) => (
              <motion.div
                key={style.id}
                whileHover={{ y: -6 }}
                onClick={() => handleCategoryClick(style.categoryFilter)}
                className="cursor-pointer group relative h-96 rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100 bg-gray-900"
              >
                <SafeImage
                  src={style.image}
                  fallbackSrc={BARAAT_VEHICLE_IMAGES.vintage_car}
                  alt={style.title}
                  title={style.title}
                  subtitle={style.subtitle}
                  categoryIcon="👑"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] via-[#0B1021]/50 to-transparent" />
                <div className="absolute inset-0 p-7 flex flex-col justify-end text-white">
                  <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-1">
                    {style.subtitle}
                  </span>
                  <h3 className="font-serif font-black text-2xl text-white mb-2 leading-tight">
                    {style.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-medium line-clamp-3 mb-4 leading-relaxed">
                    {style.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                    <span>Explore {style.categoryFilter}</span>
                    <FiArrowRight />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* =========================================================
            6. HOW BOOKING WORKS
            ========================================================= */}
        <div className="mb-24 bg-white rounded-[3rem] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-[90px] pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-14 relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">SIMPLE &amp; RELIABLE</span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 mb-2">
              How Booking Works
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Secure your wedding transportation in 5 easy steps with full ShaadiSaathi support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {/* Horizontal Connecting Line on Desktop */}
            <div className="hidden md:block absolute top-12 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />

            {[
              { step: '01', title: 'Choose Your Ride', desc: 'Select from luxury sedans, vintage cars, or VIP coaches.' },
              { step: '02', title: 'Select Date & Time', desc: 'Enter your wedding ceremony schedule & duration.' },
              { step: '03', title: 'Enter Pickup & Destination', desc: 'Specify city, venue & ceremonial route in Bihar.' },
              { step: '04', title: 'Confirm Booking', desc: 'Secure reservation with instant verified partner confirmation.' },
              { step: '05', title: 'Enjoy Your Baraat 👑', desc: 'Celebrate with a royal entrance & chauffeur service.' }
            ].map((item, i) => (
              <div key={i} className="relative text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-white border-2 border-amber-300 rounded-full flex flex-col items-center justify-center shadow-md relative z-10 mb-5 group-hover:scale-105 transition-transform">
                  <span className="font-serif font-black text-2xl text-[#D4AF37]">{item.step}</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[180px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            7. EXPLORE BARAAT RIDES BY CITY
            ========================================================= */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">BIHAR LOCAL COVERAGE</span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 mb-3">
              Find Baraat Rides Across Bihar
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              We connect you with verified local wedding transportation partners in your hometown.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BIHAR_CITIES.map((city) => (
              <motion.div
                key={city.name}
                whileHover={{ y: -4 }}
                onClick={() => handleCityClick(city.name)}
                className="cursor-pointer group relative h-48 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 bg-gray-900"
              >
                <SafeImage
                  src={city.image}
                  fallbackSrc={BARAAT_VEHICLE_IMAGES.luxury_car}
                  alt={city.name}
                  title={city.name}
                  subtitle={city.tag}
                  categoryIcon="📍"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] via-[#0B1021]/30 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] mb-0.5">
                    {city.tag}
                  </span>
                  <h3 className="font-serif font-black text-base text-white">{city.name}</h3>
                  <span className="text-[10px] text-gray-300 font-bold group-hover:text-white inline-flex items-center gap-1 mt-1">
                    Explore Rides &rarr;
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* =========================================================
            8. WHY SHAADISAATHI BARAAT RIDE
            ========================================================= */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">THE SHAADISAATHI ADVANTAGE</span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 mb-3">
              Why ShaadiSaathi Baraat Ride
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Built exclusively for Indian weddings with royal hospitality and trusted local service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '👑',
                title: 'Royal Experience',
                desc: 'Every vehicle is immaculately groomed, polished, and ready for your ceremonial entrance.'
              },
              {
                icon: '🚗',
                title: 'Multiple Ride Options',
                desc: 'From vintage classics and convertible cars to AC tempo travellers for your entire Baraat.'
              },
              {
                icon: '📍',
                title: 'Local Availability',
                desc: 'Reliable fleet partners based across Patna, Darbhanga, Muzaffarpur, Gaya, and Mithilanchal.'
              },
              {
                icon: '💬',
                title: 'Easy Vendor Communication',
                desc: 'Direct communication & WhatsApp integration so you can coordinate timings effortlessly.'
              },
              {
                icon: '📅',
                title: 'Simple Booking',
                desc: 'Transparent packages with driver, fuel, and hours included without hidden costs.'
              },
              {
                icon: '❤️',
                title: 'Wedding-focused Support',
                desc: 'Dedicated ShaadiSaathi expert advisors to assist with your wedding logistics 7 days a week.'
              }
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-white rounded-[2.25rem] p-8 border border-gray-100 shadow-xs hover:shadow-lg transition-all flex flex-col items-start"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-xs">
                  {feat.icon}
                </div>
                <h3 className="font-serif font-black text-xl text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            9. TALK TO AN EXPERT
            ========================================================= */}
        <div className="mb-24 bg-gradient-to-r from-[#0B1021] via-[#151D3B] to-[#0B1021] rounded-[3rem] p-8 sm:p-14 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
              <FiPhone />
            </div>
            <h2 className="font-serif font-black text-3xl sm:text-4xl mb-4 leading-tight">
              Not Sure Which Ride Is Perfect for Your Baraat?
            </h2>
            <p className="text-gray-300 font-medium text-base sm:text-lg mb-8">
              "Hum aapko aapki wedding ke liye perfect ride choose karne mein help karenge."
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setIsConsultationModalOpen(true)}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-[#0B1021] px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <FiPhone /> Talk to an Expert
              </button>
              <button
                onClick={handleWhatsAppUs}
                className="bg-[#25D366] hover:bg-[#20b858] text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <FaWhatsapp size={18} /> WhatsApp Us
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            10. FINAL CTA
            ========================================================= */}
        <div className="relative rounded-[3rem] overflow-hidden bg-[#0B1021] text-white p-10 sm:p-16 text-center shadow-2xl border border-white/10">
          <div className="absolute inset-0 opacity-20">
            <SafeImage
              src={BARAAT_VEHICLE_IMAGES.horse_carriage}
              fallbackSrc={BARAAT_VEHICLE_IMAGES.luxury_car}
              alt="Royal Baraat Carriage"
              title="Royal Baraat"
              categoryIcon="👑"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] via-[#0B1021]/80 to-transparent" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif font-black text-3xl sm:text-5xl mb-4 leading-tight">
              Ready to Make Your Baraat Grand? 👑
            </h2>
            <p className="text-gray-300 font-medium text-base sm:text-lg mb-8">
              Find a ride that matches your celebration and book your Baraat experience with ShaadiSaathi.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => scrollToSection(searchRef)}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-[#0B1021] px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-95 transition-all min-h-[44px]"
              >
                Explore Baraat Rides &rarr;
              </button>
              <button
                onClick={() => setIsConsultationModalOpen(true)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <FiPhone /> Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal />

      {/* CONSULTATION MODAL */}
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
