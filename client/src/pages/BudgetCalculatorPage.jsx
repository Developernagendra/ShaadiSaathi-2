import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LuWallet as Wallet, LuUsers as Users, LuDownload as Download, LuTrendingDown as TrendingDown } from 'react-icons/lu';
import { FiCheckCircle, FiPieChart as PieChartIcon } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import { formatPrice } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#C2185B', '#D4AF37', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

const BudgetCalculatorPage = () => {
  const [budget, setBudget] = useState(1500000);
  const [guestCount, setGuestCount] = useState(300);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Budget Planner', action: 'viewed_tool' }).catch(() => { });

    // Fetch saved budget
    api.get('/tools/budget')
      .then(res => {
        if (res.data.success && res.data.data) {
          setBudget(res.data.data.totalBudget);
          setGuestCount(300); // we could store guestCount in budget later, but for now we have totalBudget
        }
      })
      .catch(err => console.log('No saved budget found', err));
  }, []);

  const handleSaveBudget = async () => {
    setIsSaving(true);
    try {
      const allocations = {};
      distribution.forEach(d => { allocations[d.name] = d.value; });
      await api.post('/tools/budget', { totalBudget: budget, allocations, customCategories: [] });
      setHasSaved(true);
      toast.success('Budget saved to your profile!');
    } catch (err) {
      toast.error('Failed to save budget. Please ensure you are logged in.');
    } finally {
      setIsSaving(false);
    }
  };

  const costPerGuest = useMemo(() => {
    return guestCount && Number(guestCount) > 0 ? Math.round(budget / guestCount) : 0;
  }, [budget, guestCount]);

  const distribution = useMemo(() => [
    { name: 'Venue', value: budget * 0.25, icon: '🏰', color: '#C2185B' },
    { name: 'Catering', value: budget * 0.20, icon: '🍽️', color: '#f59e0b' },
    { name: 'Photography', value: budget * 0.15, icon: '📸', color: '#10b981' },
    { name: 'Decoration', value: budget * 0.15, icon: '🌸', color: '#D4AF37' },
    { name: 'Makeup', value: budget * 0.08, icon: '💄', color: '#3b82f6' },
    { name: 'Mehndi', value: budget * 0.05, icon: '🌿', color: '#8b5cf6' },
    { name: 'DJ', value: budget * 0.05, icon: '🎵', color: '#64748b' },
    { name: 'Baraat Cabs', value: budget * 0.07, icon: '🚖', color: '#ec4899' },
  ], [budget]);

  const handleDownloadPDF = () => {
    api.post('/tools/track', { toolName: 'Budget Planner', action: 'saved_budget', metadata: { budget, guestCount } }).catch(() => { });

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(194, 24, 91); // #C2185B
    doc.text('ShaadiSaathi Premium Budget Report', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Summary Box
    doc.setDrawColor(230);
    doc.setFillColor(250);
    doc.roundedRect(20, 40, 170, 40, 5, 5, 'FD');

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary Overview', 30, 50);

    doc.setFontSize(11);
    doc.text(`Total Budget: Rs. ${budget.toLocaleString()}`, 30, 60);
    doc.text(`Guest Count: ${guestCount}`, 30, 68);
    doc.text(`Cost Per Guest: Rs. ${costPerGuest.toLocaleString()}`, 30, 76);

    // Breakdown Table
    doc.setFontSize(16);
    doc.setTextColor(194, 24, 91);
    doc.text('Category Breakdown', 20, 100);

    let yPos = 115;
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Category', 25, 110);
    doc.text('Allocation (%)', 90, 110);
    doc.text('Estimated Cost', 150, 110);

    doc.setDrawColor(200);
    doc.line(20, 112, 190, 112);

    distribution.forEach((item, index) => {
      doc.setTextColor(0);
      doc.text(item.name, 25, yPos);
      doc.text(`${Math.round((item.value / budget) * 100)}%`, 95, yPos);
      doc.text(`Rs. ${item.value.toLocaleString()}`, 150, yPos);

      doc.setDrawColor(240);
      doc.line(20, yPos + 5, 190, yPos + 5);
      yPos += 15;
    });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Plan your dream wedding with ShaadiSaathi AI', 20, 280);
    doc.save(`ShaadiSaathi-Budget-Report.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]/50 pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4">

        {/* 🤖 HERO SECTION */}
        <div className="text-center mb-16 relative">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl mb-6 shadow-xl border border-gray-800">
            <Wallet className="text-[#D4AF37] text-3xl" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-display font-black text-gray-900 mb-6 tracking-tight drop-shadow-sm">
            Smart AI <span className="text-[#C2185B]">Budget Planner</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 text-lg md:text-2xl font-medium italic max-w-2xl mx-auto leading-relaxed">
            Manage your wedding expenses with surgical precision. Let AI optimize every rupee of your special day.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Inputs & AI Insights */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2185B]/5 rounded-bl-[100px] pointer-events-none" />
              <h3 className="text-2xl font-display font-black mb-8 text-gray-900 flex items-center gap-3">
                <PieChartIcon className="text-[#C2185B]" /> Configure Budget
              </h3>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Total Budget (₹)</label>
                    <span className="text-xl font-display font-black text-[#C2185B]">{formatPrice(budget)}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="50000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#C2185B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-3 block">Guest Count</label>
                  <div className="relative group">
                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" size={20} />
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-5 text-gray-900 font-bold outline-none focus:border-[#C2185B] focus:bg-white transition-all text-lg"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
                  <button
                    onClick={handleSaveBudget}
                    disabled={isSaving}
                    className="w-full bg-[#C2185B] text-white py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : (hasSaved ? <><FiCheckCircle size={16} /> Saved to Profile</> : 'Save to Profile')}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-[#1a1a1a] text-white py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                  >
                    <Download size={16} /> Export PDF Report
                  </button>
                </div>
              </div>
            </div>

            {/* AI Savings Suggestions */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-[80px]" />
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-6 flex items-center gap-2">
                  <TrendingDown size={14} /> AI Savings Insights
                </h3>
                <ul className="space-y-4">
                  {[
                    "Book vendors on weekdays to save up to 15%.",
                    "Merge Haldi & Mehendi events to cut decoration costs.",
                    "Opt for local seasonal flowers instead of imported ones.",
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <FiCheckCircle className="text-green-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-white/90 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-premium border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-10">

              {/* Chart */}
              <div className="md:col-span-7 h-64 md:h-[350px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      innerRadius={80}
                      outerRadius={130}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatPrice(value)}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#1a1a1a' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                  <p className="text-2xl font-display font-black text-gray-900">{formatPrice(budget)}</p>
                </div>
              </div>

              {/* High Level Summary */}
              <div className="md:col-span-5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-10">
                <h4 className="text-2xl font-display font-black mb-6 text-gray-900">Budget Analytics</h4>
                <div className="space-y-6">
                  <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-pink-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C2185B] mb-1">Cost Per Guest</p>
                    <p className="font-display font-black text-3xl text-gray-900">{formatPrice(costPerGuest)}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Primary Expenses (60%)</p>
                    <p className="font-display font-black text-xl text-gray-900">{formatPrice(budget * 0.60)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {distribution.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.name}
                  className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none" style={{ backgroundColor: item.color }} />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-gray-50 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h5 className="font-black text-gray-900 text-lg">{item.name}</h5>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{Math.round((item.value / budget) * 100)}% Allocation</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <p className="font-display font-black text-2xl text-gray-900">{formatPrice(item.value)}</p>
                  </div>

                  {/* Progress bar inside card */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-5">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((item.value / budget) * 100)}%`, backgroundColor: item.color }}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BudgetCalculatorPage;
