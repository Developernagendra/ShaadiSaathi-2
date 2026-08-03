import React, { useState } from 'react';
import { FiCheckCircle, FiClock, FiDollarSign, FiMapPin, FiUsers, FiStar, FiChevronDown, FiCalendar, FiBookOpen, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const AIPlannerPage = () => {
  const { user } = useSelector(state => state.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const [formData, setFormData] = useState({
    budget: '',
    guestCount: '',
    location: '',
    weddingStyle: 'Traditional Indian',
    durationDays: 2,
    foodPreferences: 'Vegetarian',
    eventCount: 3,
    specialPreferences: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/wedding-planner', {
        ...formData,
        budget: Number(formData.budget),
        guestCount: Number(formData.guestCount),
        durationDays: Number(formData.durationDays),
        eventCount: Number(formData.eventCount)
      });

      if (res.data?.success || res.data?.status === 'success') {
        const planData = res.data?.data?.plan || res.data?.data;
        if (planData) {
          setPlan(planData);
          setStep(2);
          toast.success("AI generated your custom wedding plan!");
        } else {
          toast.error("AI plan was empty. Please try again.");
        }
      } else {
        toast.error(res.data?.message || "Failed to generate plan.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to generate AI Plan");
    } finally {
      setLoading(false);
    }
  };

  const resetPlanner = () => {
    setPlan(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-[calc(var(--navbar-height,76px)+2.5rem)] pb-28 overflow-x-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4 border border-purple-200 shadow-sm">
            <span>✨</span> AI Wedding Planner
          </motion.div>
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-4 tracking-tight">
            Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C2185B] via-purple-600 to-[#D4AF37]">Dream Wedding with AI</span>
          </motion.h1>
          <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-600 max-w-2xl mx-auto text-lg">
            Get a complete, personalized wedding timeline, budget breakdown, and vendor recommendations generated in seconds by our expert AI.
          </motion.p>

          {/* Step Progress Bar */}
          <div className="flex items-center justify-center gap-4 mt-8 max-w-md mx-auto">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${step === 1 ? 'bg-[#C2185B] text-white shadow-md' : 'bg-green-100 text-green-700'}`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">1</span>
              <span>Wedding Details</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${step === 2 ? 'bg-[#C2185B] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">2</span>
              <span>AI Plan Summary</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-pink-900/5 p-6 md:p-10 border border-pink-50 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 via-pink-500 to-gold-400"></div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8 font-playfair flex items-center gap-2">
                Tell us about your dream wedding
              </h2>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiDollarSign /> Estimated Budget (₹)</label>
                    <input type="number" name="budget" required value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="e.g. 1500000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiUsers /> Number of Guests</label>
                    <input type="number" name="guestCount" required value={formData.guestCount} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="e.g. 500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiMapPin /> Wedding Location / City</label>
                  <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="e.g. Patna, Darbhanga, Destination in Jaipur" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiStar /> Theme & Style</label>
                    <select name="weddingStyle" value={formData.weddingStyle} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition appearance-none">
                      <option value="Traditional Indian">Traditional Indian</option>
                      <option value="Bihari/Mithila Traditional">Bihari/Mithila Traditional</option>
                      <option value="Royal/Luxury">Royal/Luxury</option>
                      <option value="Modern Minimalist">Modern Minimalist</option>
                      <option value="Destination/Resort">Destination/Resort</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiClock /> Duration (Days)</label>
                    <select name="durationDays" value={formData.durationDays} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition appearance-none">
                      <option value="1">1 Day (Compact)</option>
                      <option value="2">2 Days (Standard)</option>
                      <option value="3">3 Days (Elaborate)</option>
                      <option value="4">4+ Days (Grand)</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiBookOpen /> Food Preferences</label>
                    <select name="foodPreferences" value={formData.foodPreferences} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition appearance-none">
                      <option value="Vegetarian">Pure Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian Included</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Jain Food">Jain Food Available</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiCalendar /> Number of Events</label>
                    <input type="number" name="eventCount" required value={formData.eventCount} onChange={handleChange} min="1" max="10" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="e.g. 3" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">✨ Special Preferences or Notes</label>
                  <textarea name="specialPreferences" value={formData.specialPreferences} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" placeholder="e.g. Need a vintage car for baraat, prefer outdoor mandap..." />
                </div>

                {!user && (
                  <div className="p-4 bg-orange-50 rounded-xl text-orange-800 text-sm border border-orange-100 flex items-start gap-3 mt-4">
                    <FiInfo className="text-xl flex-shrink-0 mt-0.5" />
                    <p>You are not logged in. Your AI plan will be generated but won't be saved to your dashboard. <Link to="/login" className="font-bold underline">Login here</Link>.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:-translate-y-0.5 hover:shadow-gray-900/40 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-pink-500 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? <FiClock className="animate-spin" /> : '✨'}
                    {loading ? 'AI is drafting your plan...' : 'Generate AI Wedding Plan'}
                  </span>
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && plan && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-pink-50">
                <h3 className="font-bold text-gray-900 text-lg">Your Personalized Plan</h3>
                <button onClick={resetPlanner} className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-pink-50 px-4 py-2 rounded-lg transition-colors">
                  Generate New Plan
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">

                {/* Left Column: Budget */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary-50 rounded-bl-full -z-10"></div>
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6"><FiDollarSign className="text-primary-500" /> Budget Breakdown</h3>

                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-1">Total Estimated</p>
                      <p className="text-3xl font-black text-gray-900">₹{plan.budgetDetails?.totalBudget?.toLocaleString('en-IN') || '0'}</p>
                    </div>

                    <div className="space-y-4">
                      {Array.isArray(plan.budgetDetails?.breakdown) && plan.budgetDetails.breakdown.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-gray-700">{item.category}</span>
                            <span className="font-bold text-primary-600">₹{item.estimatedCost.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-400 to-pink-500 rounded-full" style={{ width: `${plan.budgetDetails?.totalBudget > 0 ? (item.estimatedCost / plan.budgetDetails.totalBudget) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vendor Suggestions */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-lg text-white">
                    <h3 className="text-xl font-black flex items-center gap-2 mb-6"><FiCheckCircle className="text-gold-400" /> AI Recommendations</h3>
                    <div className="space-y-4">
                      {Array.isArray(plan.vendorSuggestions) && plan.vendorSuggestions.map((v, i) => (
                        <div key={i} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gold-200">{v.type}</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${v.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                              {v.priority} Priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{v.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-50 h-full">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-8"><FiCalendar className="text-primary-500" /> Event Timeline</h3>

                    <div className="space-y-8">
                      {Array.isArray(plan.timeline) && plan.timeline.map((day, dIdx) => (
                        <div key={dIdx} className="relative">
                          <h4 className="text-lg font-bold text-primary-700 bg-pink-50 inline-block px-4 py-1.5 rounded-lg mb-6">Day {day.day}</h4>
                          <div className="space-y-6 ml-4 border-l-2 border-gray-100 pl-6 relative">
                            {day.events.map((ev, eIdx) => (
                              <div key={eIdx} className="relative">
                                <div className="absolute -left-[33px] top-1.5 w-4 h-4 bg-white border-2 border-primary-500 rounded-full"></div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                    <h5 className="font-bold text-gray-900 text-lg">{ev.name}</h5>
                                    <span className="text-sm font-bold text-primary-600 bg-white px-3 py-1 rounded-full shadow-sm">{ev.time}</span>
                                  </div>
                                  <p className="text-gray-600 text-sm">{ev.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPlannerPage;
