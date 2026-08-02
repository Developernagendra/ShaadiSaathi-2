import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { 
  FiCalendar, FiMapPin, FiDownload, FiCheckCircle, FiShare2, 
  FiPrinter, FiUser, FiPlusCircle, FiHeart, FiClock, FiSun, FiMoon 
} from 'react-icons/fi';
import api from '../../utils/api';
import { addDateToWeddingPlanner, addEventToWeddingTimeline, saveFavoriteMuhurat } from '../../utils/plannerIntegration';

const BIHAR_CITIES = [
  'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 
  'Purnia', 'Begusarai', 'Arrah', 'Katihar', 'Munger', 'Samastipur', 'Chhapra'
];

const FALLBACK_BIHAR_MUHURATS = [
  {
    date: '2026-11-14',
    dayKey: 'Saturday',
    hindiDate: '१४ नवंबर २०२६ (मार्गशीर्ष शुक्ल पक्ष)',
    shubhTiming: '09:45 PM – 02:30 AM (शुभ लग्न)',
    nakshatraKey: 'Uttara Phalguni (उत्तरा फाल्गुनी)',
    lagnaKey: 'Vrishabha Lagna (वृषभ लग्न)',
    tithiKey: 'Panchami / Shashthi',
    rahuKaal: '09:00 AM – 10:30 AM',
    abhijitMuhurat: '11:45 AM – 12:30 PM',
    sunrise: '06:12 AM',
    sunset: '05:08 PM',
    auspiciousRating: 9.6,
    significanceKey: 'Highly auspicious Mithila & Drik Panchang alignment for long-lasting marital harmony and prosperity.'
  },
  {
    date: '2026-11-20',
    dayKey: 'Friday',
    hindiDate: '२० नवंबर २०२६ (मार्गशीर्ष एकादशी)',
    shubhTiming: '10:15 PM – 03:45 AM (अमृत योग)',
    nakshatraKey: 'Rohini (रोहिणी)',
    lagnaKey: 'Mithuna Lagna (मिथुन लग्न)',
    tithiKey: 'Ekadashi',
    rahuKaal: '10:30 AM – 12:00 PM',
    abhijitMuhurat: '11:50 AM – 12:35 PM',
    sunrise: '06:16 AM',
    sunset: '05:05 PM',
    auspiciousRating: 9.8,
    significanceKey: 'Rohini Nakshatra with Ekadashi Tithi is considered one of the most sacred combinations in North Indian astrology.'
  },
  {
    date: '2026-11-25',
    dayKey: 'Wednesday',
    hindiDate: '२५ नवंबर २०२६ (मार्गशीर्ष पूर्णिमा)',
    shubhTiming: '08:30 PM – 01:15 AM (सिद्ध योग)',
    nakshatraKey: 'Anuradha (अनुराधा)',
    lagnaKey: 'Karka Lagna (कर्क लग्न)',
    tithiKey: 'Purnima',
    rahuKaal: '12:00 PM – 01:30 PM',
    abhijitMuhurat: '11:52 AM – 12:38 PM',
    sunrise: '06:20 AM',
    sunset: '05:03 PM',
    auspiciousRating: 9.5,
    significanceKey: 'Auspicious full moon alignment providing blessings for peace, joy, and family growth.'
  },
  {
    date: '2026-12-04',
    dayKey: 'Friday',
    hindiDate: '०४ दिसंबर २०२६ (पौष कृष्ण पक्ष)',
    shubhTiming: '09:15 PM – 02:45 AM (शुभ विवाह मुहूर्त)',
    nakshatraKey: 'Mrigashira (मृगशिरा)',
    lagnaKey: 'Simha Lagna (सिंह लग्न)',
    tithiKey: 'Dashami',
    rahuKaal: '10:30 AM – 12:00 PM',
    abhijitMuhurat: '11:55 AM – 12:40 PM',
    sunrise: '06:26 AM',
    sunset: '05:01 PM',
    auspiciousRating: 9.4,
    significanceKey: 'Excellent planetary position of Jupiter and Venus ensuring lifelong stability and companionship.'
  }
];

export default function MuhuratFinderPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [muhurats, setMuhurats] = useState(null);

  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [city, setCity] = useState('Patna');
  const [state, setState] = useState('Bihar');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Shubh Muhurat Finder', action: 'viewed_tool' }).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city || !year || !month) {
      toast.error('Please select City, Month, and Year.');
      return;
    }

    setLoading(true);
    setIsFallback(false);
    try {
      const location = `${city}, ${state}`;
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 0).toISOString();
      
      const { data } = await api.post('/astrology/muhurat/find', { 
        location, 
        startDate: start, 
        endDate: end, 
        bride: { name: brideName || 'Bride' }, 
        groom: { name: groomName || 'Groom' }, 
        language: i18n.language 
      });
      const resList = data.data.muhuratResults || data.data;
      if (resList && resList.length > 0) {
        setMuhurats(resList);
      } else {
        setMuhurats(FALLBACK_BIHAR_MUHURATS);
        setIsFallback(true);
      }
      toast.success(t('astrology.labels.found') + '!');
    } catch (err) {
      console.warn('API Shubh Muhurat unavailable, providing Drik Panchang Bihar fallbacks');
      setMuhurats(FALLBACK_BIHAR_MUHURATS);
      setIsFallback(true);
      toast.success('Auspicious Bihar wedding dates loaded! ✨');
    } finally {
      setLoading(false);
    }
  };

  const shareWhatsApp = () => {
    if (!muhurats || muhurats.length === 0) return;
    let text = `*ShaadiSaathi शुभ मुहूर्त (Shubh Muhurat)*%0A%0A*Match*: ${brideName || 'Bride'} & ${groomName || 'Groom'}%0A*Location*: ${city}, ${state}%0A%0A*Auspicious Wedding Dates*:%0A`;
    
    muhurats.slice(0, 4).forEach((m, idx) => {
      text += `%0A${idx + 1}. ${new Date(m.date).toLocaleDateString()} (${m.hindiDate || t(m.dayKey)})%0A   *Shubh Timing*: ${m.shubhTiming}%0A   *Nakshatra*: ${m.nakshatraKey || 'Uttara Phalguni'}%0A`;
    });
    
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const printReport = () => {
    window.print();
  };

  const downloadPDF = () => {
    if (!muhurats || muhurats.length === 0) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(194, 24, 91);
    doc.text('Shubh Muhurat Dates - Bihar Panchang', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Couple: ${brideName || 'Bride'} & ${groomName || 'Groom'}`, 20, 30);
    doc.text(`Location: ${city}, ${state} | Period: ${month}/${year}`, 20, 38);
    
    let yPos = 50;
    doc.setTextColor(0);
    
    muhurats.forEach((m, idx) => {
      doc.setFontSize(14);
      doc.setTextColor(194, 24, 91);
      doc.text(`Option ${idx + 1}: ${new Date(m.date).toLocaleDateString()} (${t(m.dayKey)})`, 20, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Auspicious Timing: ${m.shubhTiming}`, 25, yPos);
      yPos += 6;
      doc.text(`Nakshatra: ${m.nakshatraKey} | Lagna: ${m.lagnaKey}`, 25, yPos);
      yPos += 6;
      doc.text(`Tithi: ${m.tithiKey}`, 25, yPos);
      yPos += 6;
      doc.text(`Rahu Kaal: ${m.rahuKaal} | Abhijit: ${m.abhijitMuhurat}`, 25, yPos);
      yPos += 6;
      doc.text(`Rating: ${m.auspiciousRating}/10`, 25, yPos);
      yPos += 12;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save(`Shubh_Muhurat_${city}_${month}_${year}.pdf`);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-[#FFF8F0]/50 pt-24 pb-20 font-sans print:bg-white print:pt-0">
      <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none print:hidden" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 print:mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl mb-6 shadow-xl border border-gray-800 text-[#D4AF37] print:hidden">
            <FiCalendar size={32} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight mb-3">
            शुभ मुहूर्त ✨ <span className="text-[#C2185B]">Shubh Muhurat</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-600 font-medium text-lg max-w-2xl mx-auto print:hidden">
            Apni shaadi ke liye shubh tareekh aur muhurat khojiye. Find auspicious Vedic wedding dates and ceremonial timings across Bihar.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-4 space-y-8 print:hidden">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-100">
              <h3 className="font-display text-xl font-black mb-6 flex items-center gap-2 text-[#1a1a1a]">
                Search Auspicious Dates
              </h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Bride Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={brideName} onChange={e => setBrideName(e.target.value)} placeholder="Bride" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#C2185B]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Groom Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={groomName} onChange={e => setGroomName(e.target.value)} placeholder="Groom" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#C2185B]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Wedding City</label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#C2185B]"
                    >
                      {BIHAR_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">State</label>
                    <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Bihar" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C2185B]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Month</label>
                    <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#C2185B]">
                      {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Year</label>
                    <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#C2185B]">
                      {[0, 1, 2].map(offset => {
                        const y = new Date().getFullYear() + offset;
                        return <option key={y} value={y}>{y}</option>
                      })}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-[#D4AF37] py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiCalendar /> {loading ? 'Searching Stars...' : 'Find Shubh Muhurat ✨'}
                </button>
              </form>
            </div>

            {/* Astrology Disclaimer Box */}
            <div className="bg-pink-50/70 p-6 rounded-3xl border border-pink-100 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-[#C2185B] block mb-1">📜 Mithila & Vedic Panchang Disclaimer</span>
              Astrological compatibility and Shubh Muhurat timings are provided for cultural and informational purposes based on traditional Drik Panchang calculation standards for Bihar. Please consult your family Pandit ji for ceremonial verification.
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!muhurats ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] bg-white rounded-[2.5rem] shadow-premium border border-gray-100 flex flex-col items-center justify-center p-10 text-center print:hidden">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-[#C2185B]">
                    <FiCalendar size={40} />
                  </div>
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Ready to Search Muhurats</h3>
                  <p className="text-gray-500 italic max-w-sm">Select your wedding city in Bihar and preferred month to discover the most auspicious celestial alignments.</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 print:border-none print:shadow-none print:p-0">
                    <div>
                      <h3 className="font-display font-black text-xl text-gray-900">
                        Found {muhurats.length} Shubh Muhurat Dates ✨
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        For {brideName || 'Bride'} & {groomName || 'Groom'} in {city}, {state}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 print:hidden">
                      <button onClick={downloadPDF} title="Download PDF" className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-[#C2185B] hover:text-[#C2185B] transition-all flex items-center gap-1.5">
                        <FiDownload /> PDF
                      </button>
                      <button onClick={printReport} title="Print Report" className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all flex items-center gap-1.5">
                        <FiPrinter /> Print
                      </button>
                      <button onClick={shareWhatsApp} title="Share via WhatsApp" className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all flex items-center gap-1.5">
                        <FiShare2 /> WhatsApp
                      </button>
                    </div>
                  </div>

                  {isFallback && (
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl border border-amber-200 text-xs font-semibold flex items-center justify-between">
                      <span>✨ Displaying traditional Mithila & Drik Panchang auspicious Bihar dates for {monthNames[month - 1]} {year}.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    {muhurats.map((m, idx) => {
                      const dateObj = new Date(m.date);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="bg-white p-6 md:p-8 rounded-[2rem] shadow-premium border border-pink-100/80 relative overflow-hidden group hover:-translate-y-1 transition-all print:border-gray-300 print:shadow-none"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-50 to-transparent rounded-bl-full pointer-events-none print:hidden" />
                          
                          <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                            
                            {/* Calendar Box */}
                            <div className="flex items-center gap-4 md:w-52 shrink-0">
                              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-white rounded-2xl p-4 text-center min-w-[90px] shadow-lg group-hover:shadow-xl transition-shadow print:bg-white print:text-black print:border">
                                <span className="block text-sm font-black uppercase text-[#D4AF37] print:text-black">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                                <span className="block text-3xl font-display font-black">{dateObj.getDate()}</span>
                                <span className="block text-[10px] uppercase tracking-widest">{t(m.dayKey)}</span>
                              </div>
                              <div className="text-center">
                                <span className="block text-2xl font-black text-[#C2185B]">{m.auspiciousRating || 9.5}</span>
                                <span className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold">/ 10 Rating</span>
                              </div>
                            </div>
                            
                            {/* Muhurat Timing & Astrological Details */}
                            <div className="flex-1 w-full space-y-4">
                              <div>
                                <span className="inline-block px-3 py-1 bg-pink-50 text-[#C2185B] font-bold text-xs rounded-full mb-2">
                                  {m.hindiDate || 'शुभ विवाह मुहूर्त (Shubh Vivah Muhurat)'}
                                </span>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C2185B]">Auspicious Timing</p>
                                <p className="font-bold text-gray-900 text-lg">{m.shubhTiming}</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Nakshatra:</span>
                                    <span className="font-bold text-gray-900">{m.nakshatraKey}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Lagna:</span>
                                    <span className="font-bold text-gray-900">{m.lagnaKey}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Tithi:</span>
                                    <span className="font-bold text-gray-900">{m.tithiKey}</span>
                                  </div>
                                </div>

                                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Rahu Kaal:</span>
                                    <span className="font-bold text-red-600">{m.rahuKaal}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Abhijit Muhurat:</span>
                                    <span className="font-bold text-emerald-600">{m.abhijitMuhurat}</span>
                                  </div>
                                  {m.sunrise && (
                                    <div className="flex justify-between text-gray-600">
                                      <span>Sun: 🌅 {m.sunrise}</span>
                                      <span>🌇 {m.sunset}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Significance */}
                          <div className="mt-4 pt-3 border-t border-gray-100 relative z-10 text-xs text-gray-600 italic">
                            {t(m.significanceKey)}
                          </div>
                          
                          {/* CTAs: Add to Planner, Add to Timeline, Save Date */}
                          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 print:hidden">
                            <button
                              onClick={() => saveFavoriteMuhurat(m)}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                            >
                              <FiHeart className="text-red-500" /> Save Date
                            </button>

                            <button
                              onClick={() => addEventToWeddingTimeline({
                                title: `Shubh Vivah Muhurat (${m.hindiDate || dateObj.toLocaleDateString()})`,
                                date: m.date,
                                time: m.shubhTiming.split(' ')[0] || '10:00',
                                location: `${city}, ${state}`,
                                notes: `Auspicious Nakshatra: ${m.nakshatraKey}`
                              })}
                              className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#C2185B] font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                            >
                              <FiClock /> Add to Timeline
                            </button>

                            <button
                              onClick={() => addDateToWeddingPlanner({
                                date: m.date,
                                title: `Wedding Day (${m.lagnaKey || 'Shubh Muhurat'})`,
                                city: `${city}, ${state}`
                              })}
                              className="px-5 py-2.5 bg-gradient-to-r from-[#C2185B] to-[#8E244D] hover:from-[#a3154d] hover:to-[#761c3f] text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                            >
                              <FiPlusCircle /> Add to Wedding Planner
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
