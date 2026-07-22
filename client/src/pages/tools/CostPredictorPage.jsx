import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';
import { FiTrendingUp, FiMapPin, FiUsers, FiStar } from 'react-icons/fi';

export default function CostPredictorPage() {
  const [formData, setFormData] = useState({
    city: '',
    guestCount: 300,
    tier: 'premium'
  });
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Wedding Cost Predictor', action: 'viewed_tool' }).catch(() => {});
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.city) {
      return toast.error('Please enter a city');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/tools/predict-cost', formData);
      setResults(data.data);
      setHasSaved(false);
    } catch (err) {
      toast.error('Failed to predict costs');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!results) return;
    setIsSaving(true);
    try {
      const payload = {
        city: formData.city,
        guestCount: formData.guestCount,
        weddingType: formData.tier,
        services: [],
        totalEstimatedCost: results.total,
        rangeLow: results.rangeLow,
        rangeHigh: results.rangeHigh,
        breakdown: results.breakdown.reduce((acc, curr) => {
          acc[curr.category] = curr.amount;
          return acc;
        }, {})
      };
      await api.post('/tools/predict-cost/save', payload);
      setHasSaved(true);
      toast.success('Cost prediction saved to profile!');
    } catch (err) {
      toast.error('Failed to save prediction. Please log in.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-[#C2185B]/10 text-[#C2185B] rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            AI Powered
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Wedding Cost <span className="text-[#C2185B]">Predictor</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Use historical data and current market rates to estimate your total wedding cost based on city, guest count, and quality tier.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-premium border border-slate-100 mb-10">
          <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">City</label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="E.g. Patna" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-[#C2185B]" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Guest Count</label>
              <div className="relative">
                <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  name="guestCount" 
                  min="50" max="5000" step="50"
                  value={formData.guestCount} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-[#C2185B]" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Quality Tier</label>
              <div className="relative">
                <FiStar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  name="tier" 
                  value={formData.tier} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-[#C2185B] appearance-none"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-3 mt-2">
              <button type="submit" disabled={loading} className="w-full bg-[#C2185B] text-white rounded-xl py-4 font-black text-sm uppercase tracking-widest hover:bg-[#A3154D] transition-colors shadow-[0_10px_20px_rgba(194,24,91,0.2)]">
                {loading ? 'Predicting...' : 'Predict Estimated Costs'}
              </button>
            </div>
          </form>
        </div>

        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Estimated Total Cost</p>
              <h3 className="font-display text-4xl md:text-5xl font-black text-[#C2185B] mb-2">{formatPrice(results.total)}</h3>
              <p className="text-slate-500 text-sm font-medium">Based on {formData.guestCount} guests in {formData.city} ({formData.tier} tier)</p>
            </div>
            
            <div className="p-8">
              <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Expected Breakdown</h4>
              <div className="space-y-4">
                {results.breakdown.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#C2185B]/30 transition-colors bg-white group">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-bold text-slate-900">{item.category}</p>
                      <p className="text-xs text-slate-500">{item.percentage}% of total budget</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-slate-900">{formatPrice(item.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                  <FiTrendingUp /> Estimates are subject to market conditions and specific vendor choices.
                </div>
                <button 
                  onClick={handleSavePrediction}
                  disabled={isSaving || hasSaved}
                  className="px-6 py-3 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : (hasSaved ? 'Saved to Profile' : 'Save Prediction')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
