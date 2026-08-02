import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { LuCalendar, LuMapPin, LuHeart, LuUsers, LuWallet, LuChevronRight } from 'react-icons/lu';
import api from '../../utils/api';

export default function BihariPlannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    city: '',
    district: '',
    venue: '',
    guestCount: 200,
    budget: 500000,
    weddingType: 'Traditional Bihari',
    region: 'Mithila'
  });

  useEffect(() => {
    try {
      const savedDateRaw = localStorage.getItem('shaadisaathi_planner_date');
      if (savedDateRaw) {
        const parsed = JSON.parse(savedDateRaw);
        if (parsed && parsed.date) {
          setFormData((prev) => ({
            ...prev,
            weddingDate: parsed.date,
            city: parsed.city || prev.city || 'Patna'
          }));
        }
      }
    } catch (e) {
      // Ignore localStorage read errors
    }
    checkExistingPlan();
  }, [isAuthenticated]);

  const checkExistingPlan = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await api.get('/weddings/my');
      if (data.plan) {
        // Active plan exists, redirect to dashboard
        navigate('/user/wedding-dashboard');
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to create a wedding plan');
      navigate('/login', { state: { from: '/tools/wedding-planner' } });
      return;
    }

    try {
      setLoading(true);
      await api.post('/weddings', formData);
      toast.success('Wedding plan created successfully! 🎉');
      navigate('/user/wedding-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-12 h-12 border-4 border-[#C2185B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      {/* Hero Section */}
      <div className="relative bg-[#FFF8F0] pt-32 pb-20 border-b border-[#D4AF37]/20 overflow-hidden">
        <div className="absolute inset-0 floral-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold tracking-widest mb-6 border border-[#D4AF37]/20 uppercase">
              {t('wedding_planner.hero_title', 'Plan Your Bihari Wedding ❤️')}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-display font-black text-gray-900 mb-6 tracking-tight">
              {t('wedding_planner.hero_subtitle', 'Traditional Bihar wedding planning, made simple.')}
            </motion.h1>
            
            {!showWizard && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
                <button 
                  onClick={() => setShowWizard(true)}
                  className="px-8 py-4 bg-[#C2185B] text-white rounded-full font-bold text-lg hover:bg-[#a3154d] transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto"
                >
                  {t('wedding_planner.create_plan_btn', 'Create Wedding Plan')}
                  <LuChevronRight />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Wizard Section */}
      <AnimatePresence>
        {showWizard && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-4xl mx-auto px-4 -mt-10 relative z-20"
          >
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-display font-black mb-8 text-center text-[#C2185B]">
                {t('wedding_planner.create_plan_wizard', 'Wedding Plan Setup')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bride & Groom */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.bride_name', 'Bride Name')}</label>
                    <div className="relative">
                      <LuHeart className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
                      <input required type="text" name="brideName" value={formData.brideName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.groom_name', 'Groom Name')}</label>
                    <div className="relative">
                      <LuHeart className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input required type="text" name="groomName" value={formData.groomName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                    </div>
                  </div>

                  {/* Date & Region */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.wedding_date', 'Wedding Date')}</label>
                    <div className="relative">
                      <LuCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="date" name="weddingDate" value={formData.weddingDate} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.region', 'Bihar Region')}</label>
                    <select name="region" value={formData.region} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all">
                      <option value="Mithila">Mithila (Darbhanga, Madhubani, Saharsa, etc.)</option>
                      <option value="Bhojpur">Bhojpur (Arrah, Buxar, Rohtas)</option>
                      <option value="Magadh">Magadh (Patna, Gaya, Nalanda)</option>
                      <option value="Champaran">Champaran & Tirhut (Muzaffarpur, Motihari)</option>
                      <option value="Seemanchal">Seemanchal (Purnia, Katihar)</option>
                      <option value="Anga">Anga (Bhagalpur, Munger)</option>
                    </select>
                  </div>

                  {/* Location Details */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.city', 'Wedding City')}</label>
                    <div className="relative">
                      <LuMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Patna, Darbhanga" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.wedding_type', 'Wedding Type')}</label>
                    <select name="weddingType" value={formData.weddingType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all">
                      <option value="Traditional Bihari">Traditional Bihari</option>
                      <option value="Mithila Wedding">Mithila Wedding</option>
                      <option value="Maithili Wedding">Maithili Wedding</option>
                      <option value="Bhojpuri Wedding">Bhojpuri Wedding</option>
                      <option value="Magahi Wedding">Magahi Wedding</option>
                      <option value="Modern Indian Wedding">Modern Indian Wedding</option>
                    </select>
                  </div>

                  {/* Budget & Guests */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.guest_count', 'Expected Guest Count')}</label>
                    <div className="relative">
                      <LuUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="number" name="guestCount" value={formData.guestCount} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('wedding_planner.budget', 'Total Budget (₹)')}</label>
                    <div className="relative">
                      <LuWallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="number" name="budget" value={formData.budget} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all disabled:bg-gray-400">
                    {loading ? 'Creating Plan...' : t('wedding_planner.submit_plan', 'Start Planning')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
