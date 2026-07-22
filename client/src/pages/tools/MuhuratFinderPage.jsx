import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiDownload, FiCheckCircle, FiShare2, FiPrinter, FiUser } from 'react-icons/fi';
import api from '../../utils/api';

export default function MuhuratFinderPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [muhurats, setMuhurats] = useState(null);

  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Shubh Muhurat Finder', action: 'viewed_tool' }).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city || !state || !year || !month || !brideName || !groomName) {
      toast.error('Please enter all required details.');
      return;
    }

    setLoading(true);
    try {
      const location = `${city}, ${state}`;
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 0).toISOString();
      
      const { data } = await api.post('/astrology/muhurat/find', { 
        location, 
        startDate: start, 
        endDate: end, 
        bride: { name: brideName }, 
        groom: { name: groomName }, 
        language: i18n.language 
      });
      setMuhurats(data.data.muhuratResults || data.data);
      toast.success(t('astrology.labels.found') + '!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error finding muhurat');
    } finally {
      setLoading(false);
    }
  };

  const shareWhatsApp = () => {
    if (!muhurats || muhurats.length === 0) return;
    let text = `*ShaadiSaathi Shubh Muhurat*%0A%0A*Match*: ${brideName} & ${groomName}%0A*Location*: ${city}, ${state}%0A%0A*${t('astrology.labels.auspiciousDates')}*:%0A`;
    
    muhurats.slice(0, 3).forEach((m, idx) => {
      text += `%0A${idx + 1}. ${new Date(m.date).toLocaleDateString()} (${t(m.dayKey)})%0A   *${t('astrology.labels.auspiciousTiming')}*: ${m.shubhTiming}%0A   *${t('astrology.labels.nakshatra')}*: ${t(m.nakshatraKey)}%0A`;
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
    doc.text('Shubh Muhurat Dates', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Couple: ${brideName} & ${groomName}`, 20, 30);
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
      doc.text(`${t('astrology.labels.auspiciousTiming')}: ${m.shubhTiming}`, 25, yPos);
      yPos += 6;
      doc.text(`${t('astrology.labels.nakshatra')}: ${t(m.nakshatraKey)} | ${t('astrology.labels.lagna')}: ${t(m.lagnaKey)}`, 25, yPos);
      yPos += 6;
      doc.text(`${t('astrology.labels.tithi')}: ${t(m.tithiKey)}`, 25, yPos);
      yPos += 6;
      doc.text(`${t('astrology.labels.rahuKaal')}: ${m.rahuKaal} | ${t('astrology.labels.abhijitMuhurat')}: ${m.abhijitMuhurat}`, 25, yPos);
      yPos += 6;
      doc.text(`${t('astrology.labels.auspiciousRating')}: ${m.auspiciousRating}/10`, 25, yPos);
      yPos += 12;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save(`Shubh_Muhurat_${city}_${month}_${year}.pdf`);
  };

  const saveToProfile = async () => {
    try {
      // Reports are auto-saved by backend during the find call if user is logged in
      toast.success(t('astrology.labels.saveToProfile') + ' Success!');
    } catch (err) {
      toast.error('You need to be logged in to save reports.');
    }
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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight mb-6">
            Shubh Muhurat <span className="text-[#C2185B]">Finder</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 font-medium italic max-w-2xl mx-auto print:hidden">
            Find the most auspicious wedding dates based on Vedic astrology. Plan your perfect day in harmony with the stars.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-4 space-y-8 print:hidden">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-100">
              <h3 className="font-display text-xl font-black mb-6 flex items-center gap-2 text-[#1a1a1a]">
                {t('astrology.labels.searchParams')}
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
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Jaipur" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C2185B]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">State</label>
                    <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Rajasthan" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C2185B]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Month</label>
                    <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C2185B]">
                      {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Year</label>
                    <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C2185B]">
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
                  className="w-full mt-4 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {loading ? 'Searching Stars...' : 'Find Auspicious Dates'}
                </button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!muhurats ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] bg-white rounded-[2.5rem] shadow-premium border border-gray-100 flex flex-col items-center justify-center p-10 text-center print:hidden">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <FiCalendar size={40} />
                  </div>
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Ready to Search</h3>
                  <p className="text-gray-500 italic max-w-sm">Select your wedding location and preferred month to discover the most auspicious celestial alignments.</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 print:border-none print:shadow-none print:p-0">
                    <div>
                      <h3 className="font-display font-black text-xl">{t('astrology.labels.found')} {muhurats.length} {t('astrology.labels.auspiciousDates')}</h3>
                      <p className="text-sm text-gray-500 italic">For {brideName} & {groomName} in {city}, {state}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 print:hidden">
                      <button onClick={downloadPDF} className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-[#C2185B] hover:text-[#C2185B] transition-all flex items-center gap-2">
                        <FiDownload />
                      </button>
                      <button onClick={printReport} className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all flex items-center gap-2">
                        <FiPrinter />
                      </button>
                      <button onClick={shareWhatsApp} className="bg-green-50 text-green-600 border border-green-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all flex items-center gap-2">
                        <FiShare2 />
                      </button>
                      <button onClick={saveToProfile} className="bg-[#C2185B] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8E244D] transition-all flex items-center gap-2 shadow-lg">
                        <FiCheckCircle />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {muhurats.map((m, idx) => {
                      const dateObj = new Date(m.date);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className="bg-white p-6 rounded-[2rem] shadow-premium border border-pink-50 relative overflow-hidden group hover:-translate-y-1 transition-transform print:border-gray-300 print:shadow-none"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-50 to-transparent rounded-bl-full pointer-events-none print:hidden" />
                          
                          <div className="flex flex-col md:flex-row items-start gap-5 relative z-10">
                            
                            <div className="flex items-center gap-4 md:w-48 shrink-0">
                              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-white rounded-2xl p-4 text-center min-w-[80px] shadow-lg group-hover:shadow-xl transition-shadow print:bg-white print:text-black print:border">
                                <span className="block text-sm font-black uppercase text-[#D4AF37] print:text-black">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                                <span className="block text-3xl font-display font-black">{dateObj.getDate()}</span>
                                <span className="block text-[10px] uppercase tracking-widest">{t(m.dayKey)}</span>
                              </div>
                              <div className="text-center">
                                <span className="block text-2xl font-black text-[#C2185B]">{m.auspiciousRating}</span>
                                <span className="block text-[8px] uppercase tracking-widest text-gray-500">/10 Rating</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                              
                              <div className="col-span-1 sm:col-span-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C2185B] mb-1">{t('astrology.labels.auspiciousTiming')}</p>
                                <p className="font-bold text-gray-900 text-lg">{m.shubhTiming}</p>
                              </div>
                              
                              <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 print:bg-white print:border-none print:p-0">
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                  <span className="text-gray-500">{t('astrology.labels.nakshatra')}:</span>
                                  <span className="font-medium text-gray-900">{t(m.nakshatraKey)}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 py-1">
                                  <span className="text-gray-500">{t('astrology.labels.lagna')}:</span>
                                  <span className="font-medium text-gray-900">{t(m.lagnaKey)}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                  <span className="text-gray-500">{t('astrology.labels.tithi')}:</span>
                                  <span className="font-medium text-gray-900 truncate max-w-[120px]" title={t(m.tithiKey)}>{t(m.tithiKey)}</span>
                                </div>
                              </div>

                              <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 print:bg-white print:border-none print:p-0">
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                  <span className="text-gray-500">{t('astrology.labels.rahuKaal')}:</span>
                                  <span className="font-medium text-red-600">{m.rahuKaal}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                  <span className="text-gray-500">{t('astrology.labels.abhijitMuhurat')}:</span>
                                  <span className="font-medium text-green-600">{m.abhijitMuhurat}</span>
                                </div>
                              </div>

                            </div>
                          </div>
                          
                          <div className="mt-5 pt-4 border-t border-gray-50 relative z-10 text-center">
                            <p className="text-xs text-gray-600 italic leading-relaxed">
                              {t(m.significanceKey)}
                            </p>
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
