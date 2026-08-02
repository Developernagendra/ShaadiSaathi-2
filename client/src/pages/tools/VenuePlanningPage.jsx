import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiSearch, FiMapPin, FiUsers, FiStar, FiArrowLeft, FiFilter, 
  FiRefreshCw, FiExternalLink, FiCalendar, FiCheck, FiHeart 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import { saveVenueToWeddingPlan } from '../../utils/plannerIntegration';

const BIHAR_CITIES = ['All Cities', 'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Begusarai', 'Arrah'];
const VENUE_TYPES = ['All Types', 'Banquet Hall', 'Marriage Lawn', 'Resort', 'Palace / Heritage', 'Hotel'];

export default function VenuePlanningPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: 'venues',
        limit: 20
      };
      if (selectedCity && selectedCity !== 'All Cities') {
        params.city = selectedCity;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const { data } = await api.get('/vendors', { params });
      const foundVenues = data?.vendors || data?.data?.vendors || [];
      setVenues(foundVenues);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
      setError('Unable to load venues right now. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCity, searchQuery]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const filteredVenues = venues.filter((venue) => {
    if (selectedType === 'All Types') return true;
    const typeLower = selectedType.toLowerCase();
    const vType = (venue.venueType || venue.subcategory || venue.description || '').toLowerCase();
    return vType.includes(typeLower) || vType.includes(selectedType.split(' ')[0].toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      {/* ── 1. HERO HEADER ── */}
      <div className="bg-gradient-to-r from-[#8E244D] via-[#C2185B] to-[#9c1349] text-white py-12 md:py-16 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 floral-pattern opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-pink-200 hover:text-white font-semibold text-sm mb-4 transition-colors"
          >
            <FiArrowLeft /> Back to Tools Hub
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight">
                {t('tools.venue_title', 'Wedding Venue Planner 🏛️')}
              </h1>
              <p className="text-pink-100 text-base md:text-lg mt-2 max-w-2xl font-medium">
                {t('tools.venue_subtitle', 'Discover, compare, and book the most stunning Banquet Halls, Marriage Lawns, and Palaces across Bihar.')}
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
              <div className="text-2xl font-black text-[#D4AF37]">{venues.length}+</div>
              <div className="text-xs text-pink-100 font-bold uppercase tracking-wider">Verified Bihar Venues</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER & SEARCH BAR ── */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-5 shadow-xl border border-pink-100 flex flex-col md:flex-row items-center gap-4">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchVenues()}
              placeholder="Search by venue name, locality, or city..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] text-sm transition-all"
            />
          </div>

          {/* City Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] text-sm font-semibold text-gray-700 transition-all"
            >
              {BIHAR_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Venue Type Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] text-sm font-semibold text-gray-700 transition-all"
            >
              {VENUE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchVenues}
            className="w-full md:w-auto px-6 py-3 bg-[#C2185B] hover:bg-[#a3154d] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm shrink-0"
          >
            <FiSearch /> Search
          </button>
        </div>

        {/* City Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {BIHAR_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCity === c
                  ? 'bg-[#C2185B] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. VENUE RESULTS GRID ── */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl w-full pt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 text-center my-8 shadow-sm border border-red-100 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-3xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Could Not Load Venues</h3>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={fetchVenues}
              className="px-6 py-3 bg-[#C2185B] text-white font-bold rounded-xl shadow-md hover:bg-[#a3154d] transition-all inline-flex items-center gap-2"
            >
              <FiRefreshCw /> Retry
            </button>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center my-8 shadow-sm border border-gray-100 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-[#C2185B] text-3xl mx-auto mb-4">
              🏛️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Venues Found</h3>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't find any venues matching your filters in {selectedCity}. Try broadening your search or choosing another city.
            </p>
            <button
              onClick={() => {
                setSelectedCity('All Cities');
                setSelectedType('All Types');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-[#C2185B] text-white font-bold rounded-xl shadow-md hover:bg-[#a3154d] transition-all inline-flex items-center gap-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => {
              const mainImage = venue.coverImage || venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800';
              const venuePrice = venue.pricing?.basePrice || venue.price || venue.startingPrice || 150000;
              const capacity = venue.capacity || venue.guestCapacity || '200 – 1,000 Guests';
              const rating = venue.rating || venue.averageRating || 4.8;
              const reviewCount = venue.numReviews || venue.reviewsCount || 24;

              return (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-pink-100/80 flex flex-col group"
                >
                  {/* Venue Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={mainImage}
                      alt={venue.businessName || venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Verified Badge */}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#C2185B] font-bold text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                      <FiCheck size={12} /> Verified Venue
                    </span>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <FiStar className="text-[#D4AF37] fill-current" />
                      <span>{rating}</span>
                      <span className="text-gray-300">({reviewCount})</span>
                    </div>

                    {/* City Badge on bottom left */}
                    <div className="absolute bottom-4 left-4 text-white font-bold text-sm flex items-center gap-1.5">
                      <FiMapPin className="text-[#D4AF37]" />
                      <span>{venue.city || 'Patna, Bihar'}</span>
                    </div>
                  </div>

                  {/* Venue Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#C2185B] transition-colors line-clamp-1 mb-1">
                        {venue.businessName || venue.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 mb-4 line-clamp-1">
                        {venue.address || `${venue.city || 'Patna'}, Bihar`}
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 bg-pink-50/50 p-3 rounded-2xl mb-5 border border-pink-100/60">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <FiUsers className="text-[#C2185B] shrink-0" size={15} />
                          <span className="truncate">{capacity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E244D]">
                          <span className="text-[#C2185B] font-normal">Starts</span> {formatPrice(venuePrice)}
                        </div>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/vendors/${venue._id}`}
                          className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs text-center transition-all flex items-center justify-center gap-1.5"
                        >
                          View Details <FiExternalLink />
                        </Link>
                        <button
                          onClick={() => saveVenueToWeddingPlan(venue)}
                          className="py-2.5 px-3 bg-pink-50 hover:bg-pink-100 text-[#C2185B] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <FiHeart /> Save to Plan
                        </button>
                      </div>
                      <Link
                        to={`/book-vendor/${venue._id}`}
                        className="block w-full py-2.5 px-4 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-bold rounded-xl text-xs text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        Enquire / Book Venue
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
