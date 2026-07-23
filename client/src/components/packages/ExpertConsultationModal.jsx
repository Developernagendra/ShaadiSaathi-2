import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { submitExpertConsultation, resetExpertSuccess } from '../../store/slices/expertSlice';

export default function ExpertConsultationModal({ packageContext, serviceContext, onClose }) {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(state => state.expert);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    weddingDate: '',
    guestCount: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    service: serviceContext || ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(resetExpertSuccess());
    };
  }, [dispatch]);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(formData.phone)) errs.phone = 'Enter valid 10-digit number';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) errs.email = 'Valid email is required';
    
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(submitExpertConsultation({
      ...formData,
      package: packageContext,
      service: serviceContext || formData.service
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full p-2 transition-colors z-10">
          <FiX size={20} />
        </button>

        {success ? (
          <div className="p-10 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6"
            >
              <FiCheckCircle size={40} />
            </motion.div>
            <h3 className="font-serif text-3xl font-black text-gray-900 mb-2">Request Submitted Successfully!</h3>
            <p className="text-gray-500 mb-8 max-w-sm">Thank you! A ShaadiSaathi wedding expert will contact you shortly at your preferred time.</p>
            <button onClick={onClose} className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#C2185B] transition-colors w-full sm:w-auto shadow-md">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <h3 className="font-serif text-2xl font-black mb-1">Talk to a Wedding Expert</h3>
              <p className="text-gray-300 text-sm">Tell us about your wedding and our expert will help you plan it.</p>
              {packageContext && (
                <div className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {packageContext} Package Context
                </div>
              )}
              {serviceContext && (
                <div className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {serviceContext}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
              {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all ${formErrors.name ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50'}`} placeholder="e.g. Rahul Sharma" />
                  {formErrors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all ${formErrors.phone ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50'}`} placeholder="10-digit number" />
                  {formErrors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{formErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all ${formErrors.email ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50'}`} placeholder="rahul@example.com" />
                {formErrors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{formErrors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Preferred Date (Optional)</label>
                  <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Preferred Time (Optional)</label>
                  <select name="preferredTime" value={formData.preferredTime} onChange={handleChange} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all">
                    <option value="">Any Time</option>
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City (Optional)</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" placeholder="e.g. Patna" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Wedding Date (Optional)</label>
                  <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message / Requirements</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="3" className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] resize-none transition-all" placeholder="Tell us what you're looking for..."></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C2185B] text-white py-4 mt-2 rounded-xl text-sm font-black uppercase tracking-wider shadow-md hover:bg-[#8E244D] hover:shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting Request...
                  </>
                ) : 'Request Expert Consultation'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
