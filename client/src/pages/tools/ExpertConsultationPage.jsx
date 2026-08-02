import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { submitExpertConsultation, resetExpertSuccess } from '../../store/slices/expertSlice';
import { FiArrowLeft, FiCheckCircle, FiPhoneCall, FiUser, FiMail, FiMapPin, FiCalendar, FiClock, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ExpertConsultationPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.expert);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    weddingDate: '',
    guestCount: '',
    preferredDate: '',
    preferredTime: 'Morning (10 AM - 1 PM)',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast.error('Please complete name, phone, and email.');
      return;
    }
    const resultAction = await dispatch(submitExpertConsultation(formData));
    if (submitExpertConsultation.fulfilled.match(resultAction)) {
      toast.success('Consultation booked! An expert will call you soon.');
    } else {
      toast.error(error || 'Could not book consultation right now.');
    }
  };

  const handleReset = () => {
    dispatch(resetExpertSuccess());
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      weddingDate: '',
      guestCount: '',
      preferredDate: '',
      preferredTime: 'Morning (10 AM - 1 PM)',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#8E244D] via-[#C2185B] to-[#9c1349] text-white py-12 md:py-16 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 floral-pattern opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-pink-200 hover:text-white font-semibold text-sm mb-4 transition-colors"
          >
            <FiArrowLeft /> Back to Tools Hub
          </Link>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight">
            {t('tools.expert_title', 'Talk to a Wedding Expert 📞')}
          </h1>
          <p className="text-pink-100 text-base md:text-lg mt-2 max-w-2xl font-medium">
            {t('tools.expert_subtitle', 'Get complimentary 1-on-1 guidance on budget planning, venue selection, and vendor booking in Bihar.')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-pink-100">
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
                <FiCheckCircle />
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">
                Consultation Request Received! 🎉
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                Thank you for reaching out, <span className="font-bold text-gray-900">{formData.name}</span>! Our ShaadiSaathi wedding expert will call you on <span className="font-bold text-gray-900">{formData.phone}</span> shortly.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-sm transition-all"
                >
                  Book Another Call
                </button>
                <Link
                  to="/tools"
                  className="px-8 py-3 bg-[#C2185B] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#a3154d] transition-all"
                >
                  Explore More Tools
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      name="phone"
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Wedding City</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Patna, Muzaffarpur, Gaya"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Wedding Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Call Slot</label>
                  <div className="relative">
                    <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    >
                      <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                      <option value="Afternoon (2 PM - 5 PM)">Afternoon (2 PM - 5 PM)</option>
                      <option value="Evening (6 PM - 9 PM)">Evening (6 PM - 9 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  What do you need help with?
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your budget, venue preferences, Baraat cab requirements, or any specific help you need..."
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting Request...' : 'Book Free Consultation Now →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
