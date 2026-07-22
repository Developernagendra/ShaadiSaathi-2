import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiDollarSign, FiShare2, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RealWeddingDetailsPage() {
  const { id } = useParams();
  const [wedding, setWedding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchWedding();
  }, [id]);

  const fetchWedding = async () => {
    try {
      const res = await api.get(`/showcase/real-weddings/${id}`);
      setWedding(res.data.data);
      document.title = `${res.data.data.brideName} & ${res.data.data.groomName} - Real Wedding`;
    } catch (err) {
      toast.error('Failed to load wedding details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out ${wedding.brideName} & ${wedding.groomName}'s beautiful wedding on ShaadiSaathi!`;
    if (navigator.share) {
      navigator.share({ title: text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out ${wedding.brideName} & ${wedding.groomName}'s beautiful wedding on ShaadiSaathi! ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!wedding) {
    return <div className="min-h-screen flex justify-center items-center text-2xl font-bold">Wedding not found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Hero Cover */}
      <div className="relative w-full h-[60vh] md:h-[80vh]">
        <img src={wedding.coverImage} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto w-full text-center">
            <h1 className="font-display text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-4">
              {wedding.brideName} <span className="text-[#D4AF37]">&amp;</span> {wedding.groomName}
            </h1>
            <div className="flex flex-wrap justify-center gap-6 text-white/90 text-sm md:text-base font-medium drop-shadow-md">
              <span className="flex items-center gap-2"><FiMapPin className="text-[#D4AF37]" /> {wedding.venue}, {wedding.city}</span>
              <span className="flex items-center gap-2"><FiCalendar className="text-[#D4AF37]" /> {new Date(wedding.weddingDate).toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row gap-12">
          
          <div className="flex-1 space-y-8">
            <div>
              <div className="divider-luxe !justify-start mb-4 !gap-3">
                <div className="divider-line !bg-[#C2185B]/30 !w-8" />
                <span className="text-[#C2185B] text-[10px] font-black uppercase tracking-[0.4em] italic">The Story</span>
              </div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-6">A Beautiful Beginning</h2>
              <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                {wedding.story}
              </div>
            </div>

            {/* Gallery Grid */}
            {wedding.galleryImages?.length > 0 && (
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-2xl font-display font-black text-gray-900 mb-6">Wedding Album</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wedding.galleryImages.map((img, i) => (
                    <img key={i} src={img} alt="Gallery" className="w-full aspect-square object-cover rounded-2xl hover:scale-105 transition-transform cursor-pointer shadow-sm" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 space-y-6">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Wedding Details</h3>
              <div className="space-y-4">
                {wedding.budget && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><FiDollarSign /></div>
                    <div>
                      <div className="text-xs text-gray-400">Budget</div>
                      <div className="font-bold text-gray-900">₹{wedding.budget}</div>
                    </div>
                  </div>
                )}
              </div>

              {wedding.servicesUsed?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Services Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {wedding.servicesUsed.map((service, i) => (
                      <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-600">{service}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Vendor Profile */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full blur-2xl" />
              <h3 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">Primary Planner / Vendor</h3>
              <div className="flex items-center gap-4 mb-6">
                <img src={wedding.vendorId?.logo || `https://ui-avatars.com/api/?name=${wedding.vendorId?.businessName}`} className="w-16 h-16 rounded-2xl object-cover bg-white p-1" alt="Vendor Logo" />
                <div>
                  <div className="font-bold text-xl">{wedding.vendorId?.businessName}</div>
                  <div className="text-sm text-gray-400">{wedding.vendorId?.location?.city}</div>
                </div>
              </div>
              <button onClick={() => window.location.href=`/vendors/${wedding.vendorId?._id}`} className="w-full py-3 bg-[#D4AF37] hover:bg-[#F4D03F] text-black font-black uppercase tracking-widest text-xs rounded-xl transition-colors">
                View Profile
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold transition-colors">
                <FaWhatsapp size={18} /> WhatsApp
              </button>
              <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors">
                <FiShare2 /> Share
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
