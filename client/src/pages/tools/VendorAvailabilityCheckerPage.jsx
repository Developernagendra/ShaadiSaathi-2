import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { FiMapPin, FiCalendar, FiSearch, FiCheckCircle, FiSend } from 'react-icons/fi';
import { createLead } from '../../store/slices/featureSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function VendorAvailabilityCheckerPage() {
  const { categories } = useSelector(state => state.vendor);
  const [formData, setFormData] = useState({
    category: '',
    city: '',
    date: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Vendor Availability', action: 'viewed_tool' }).catch(() => {});
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.city || !formData.date) {
      return toast.error("Please fill all fields");
    }

    setLoading(true);
    setLeadSubmitted(false);
    try {
      const { data } = await api.get(`/tools/vendor-availability?category=${formData.category}&city=${formData.city}&date=${formData.date}`);
      setResults(data.data);
    } catch (err) {
      toast.error('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async () => {
    setIsSubmittingLead(true);
    try {
      await dispatch(createLead({
        serviceType: formData.category,
        city: formData.city,
        eventDate: formData.date,
        budget: 0,
        description: 'Auto-generated lead from Vendor Availability Checker.'
      })).unwrap();
      setLeadSubmitted(true);
      toast.success('Request sent! We will find available vendors for you.');
    } catch (err) {
      toast.error('Failed to submit request. Please ensure you are logged in.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 pt-32 pb-20 font-sans">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Real-time Status
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Vendor <span className="text-amber-500">Availability</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Check if top-rated vendors are available on your wedding date. Avoid last-minute cancellations and secure your bookings.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-premium border border-pink-50 mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Service Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-amber-400">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">City</label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="E.g. Patna" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-amber-400" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Event Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-amber-400" />
              </div>
            </div>

            <div className="flex items-end">
              <button type="submit" disabled={loading} className="w-full bg-amber-500 text-white rounded-xl py-4 font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                {loading ? 'Checking...' : <><FiSearch /> Check Now</>}
              </button>
            </div>
          </form>
        </div>

        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-display text-2xl font-black text-gray-900 mb-6">
              {results.length} Vendors Available
            </h3>
            
            {results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-amber-500 text-2xl" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">No vendors found instantly</h4>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  But don't worry! We can manually check our extensive offline network for available vendors matching your criteria.
                </p>
                <button 
                  onClick={handleLeadSubmit}
                  disabled={isSubmittingLead || leadSubmitted}
                  className="bg-[#1a1a1a] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSubmittingLead ? 'Submitting...' : (leadSubmitted ? 'Request Received ✓' : <><FiSend /> Request Custom Quotes</>)}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((vendor, i) => (
                  <motion.div key={vendor._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-200 relative">
                      {vendor.coverImage && <img src={vendor.coverImage.url || vendor.coverImage} className="w-full h-full object-cover" alt="Vendor" />}
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <FiCheckCircle /> Available
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg text-gray-900 mb-1 truncate">{vendor.businessName}</h4>
                      <p className="text-xs text-gray-500 mb-4">{vendor.categoryId?.name} • {vendor.city}</p>
                      <Link to={`/vendors/${vendor._id}`} className="block text-center w-full bg-gray-50 text-gray-900 font-bold text-xs py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors">
                        View Profile
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
