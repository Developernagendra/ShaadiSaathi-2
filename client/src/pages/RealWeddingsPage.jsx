import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHeart, FiMapPin, FiCamera, FiFilter, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function RealWeddingsPage() {
  const [weddings, setWeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Luxury', 'Budget', 'Destination', 'Traditional', 'Modern'];

  useEffect(() => {
    document.title = "Real Weddings - ShaadiSaathi";
    window.scrollTo(0, 0);
    fetchRealWeddings();
  }, []);

  const fetchRealWeddings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/showcase/real-weddings');
      setWeddings(res.data.data);
    } catch (error) {
      console.error("Failed to fetch real weddings:", error);
      toast.error("Failed to load Real Weddings");
    } finally {
      setLoading(false);
    }
  };

  const filteredWeddings = weddings.filter(wedding => {
    const matchesSearch = wedding.brideName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          wedding.groomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wedding.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 font-sans">
      
      {/* ── HEADER & SEARCH ── */}
      <section className="bg-white border-b border-gray-100 py-12 px-4 mb-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
              Real <span className="text-[#C2185B] italic">Weddings</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-8">
              Get inspired by beautiful real weddings planned by ShaadiSaathi couples. Discover venues, vendors, and stunning stories.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input 
                type="text" 
                placeholder="Search by couple name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-12 pr-6 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/20 transition-all font-medium text-gray-700"
              />
            </div>
            <button className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full shadow-[0_10px_20px_rgba(212,175,55,0.2)] hover:-translate-y-1 transition-transform flex items-center justify-center gap-2">
              <FiFilter /> Filter
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* ── CATEGORY FILTERS ── */}
        <div className="flex overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory gap-2 md:gap-3 mb-8 md:mb-10 pb-4 justify-start md:justify-center px-1">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(cat)}
              className={`snap-center shrink-0 whitespace-nowrap px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all border ${
                activeCategory === cat 
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── WEDDING GRID OR EMPTY STATE ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="text-4xl text-[#C2185B] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading beautiful stories...</p>
          </div>
        ) : filteredWeddings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWeddings.map((wedding, i) => (
              <motion.div 
                onClick={() => window.location.href = `/real-weddings/${wedding._id}`}
                key={wedding._id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow group cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={wedding.coverImage} alt={`${wedding.brideName} & ${wedding.groomName}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-1">
                    {wedding.brideName} &amp; {wedding.groomName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
                    <FiMapPin className="text-[#D4AF37]" /> {wedding.city}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap mb-6">
                    {wedding.budget && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-[#C2185B] px-3 py-1.5 rounded-full">
                        ₹{wedding.budget}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <FiCamera className="text-gray-400" /> {wedding.vendorId?.businessName || 'Vendors'}
                    </div>
                    <span className="text-[#C2185B] font-bold text-sm group-hover:underline">View Story &rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm px-4">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <FiHeart className="text-4xl text-[#C2185B]" />
            </div>
            <h2 className="font-display text-3xl font-black text-gray-900 mb-3">Real Weddings Coming Soon!</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
              We are currently curating the most beautiful wedding stories to inspire you. Check back shortly to explore stunning venues, decor, and budgets from our couples.
            </p>
            <button onClick={() => window.history.back()} className="bg-gray-900 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:bg-[#C2185B] transition-colors shadow-lg">
              Go Back
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
