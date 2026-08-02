import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { submitPackageInquiry, resetInquirySuccess } from '../../store/slices/packageSlice';

export default function QuoteFormModal({ pkg, onClose }) {
  const dispatch = useDispatch();
  const { loading, inquirySuccess, error } = useSelector(state => state.packages);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    weddingDate: '',
    city: '',
    guestsCount: pkg?.guests?.replace(/[^0-9-]/g, '') || '',
    message: '',
    budget: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(resetInquirySuccess());
    };
  }, [dispatch]);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(formData.phone)) errs.phone = 'Enter valid 10-digit number';
    if (!formData.weddingDate) errs.weddingDate = 'Date is required';
    if (!formData.city.trim()) errs.city = 'City is required';
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

    // Send the tier name (silver/gold/royal/custom) as the package identifier
    const packageTier = pkg?.id || pkg?.slug || pkg?.name?.toLowerCase() || 'custom';

    dispatch(submitPackageInquiry({
      ...formData,
      package: packageTier
    }));
  };

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full p-1 transition-colors z-10">
          <FiX size={16} />
        </button>

        {inquirySuccess ? (
          <div className="p-10 text-center flex flex-col items-center">
            <FiCheckCircle className="text-green-500 mb-4" size={48} />
            <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-gray-500 text-sm mb-6">Thank you for your interest in the {pkg.name} Package. Our team will contact you shortly.</p>
            <button onClick={onClose} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#C2185B] transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className={`p-6 ${pkg.highlight ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-gray-900' : 'bg-gray-50 border-b border-gray-100'}`}>
              <h3 className="font-display text-xl font-black">Get a Quote</h3>
              <p className="text-xs font-bold opacity-80 mt-1">{pkg.name} Package ({pkg.price})</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-[#C2185B] ${formErrors.name ? 'border-red-300' : 'border-gray-200'}`} placeholder="Your Name" />
                  {formErrors.name && <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-[#C2185B] ${formErrors.phone ? 'border-red-300' : 'border-gray-200'}`} placeholder="10-digit number" />
                  {formErrors.phone && <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
              </div>


              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C2185B]" placeholder="you@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Wedding Date *</label>
                  <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-[#C2185B] ${formErrors.weddingDate ? 'border-red-300' : 'border-gray-200'}`} />
                  {formErrors.weddingDate && <p className="text-[10px] text-red-500 mt-1">{formErrors.weddingDate}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-[#C2185B] ${formErrors.city ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g. Patna" />
                  {formErrors.city && <p className="text-[10px] text-red-500 mt-1">{formErrors.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Budget (₹)</label>
                  <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C2185B]" placeholder="e.g. 50000" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Guest Count</label>
                  <input type="number" name="guestsCount" value={formData.guestsCount} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C2185B]" placeholder="e.g. 200" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="2" className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C2185B] resize-none" placeholder="Any specific requests or questions?"></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C2185B] text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#8E244D] active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
