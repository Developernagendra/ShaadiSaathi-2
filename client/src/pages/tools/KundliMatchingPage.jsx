import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { FiHeart, FiStar, FiDownload, FiCheckCircle, FiAlertCircle, FiShare2, FiPrinter } from 'react-icons/fi';
import api from '../../utils/api';

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all"
    />
  </div>
);

export default function KundliMatchingPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const [bride, setBride] = useState({ name: '', dob: '', time: '', place: '' });
  const [groom, setGroom] = useState({ name: '', dob: '', time: '', place: '' });

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Kundli Matching', action: 'viewed_tool' }).catch(() => {});
  }, []);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!bride.name || !bride.dob || !groom.name || !groom.dob) {
      toast.error('Please fill in the basic details for both Bride and Groom.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/astrology/kundli/match', { 
        bride, 
        groom,
        language: i18n.language 
      });
      setReport(data.data.matchResults || data.data);
      toast.success('Kundli Matched Successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error matching Kundli');
    } finally {
      setLoading(false);
    }
  };

  const shareWhatsApp = () => {
    if (!report) return;
    const text = `*ShaadiSaathi Gun Milan Report*%0A%0A*Match*: ${report.brideDetails?.name || 'Bride'} & ${report.groomDetails?.name || 'Groom'}%0A*${t('astrology.labels.totalGun')}*: ${report.totalScore}/36%0A*${t('astrology.labels.compatibility')}*: ${report.percentage}%25%0A%0A*${t('astrology.labels.manglikAnalysis')}*:%0A${t(report.manglikAnalysis?.statusKey || 'astrology.status.not_manglik')}%0A%0A*Conclusion*:%0A${t(report.conclusionKey || 'astrology.status.good_match')}%0A%0ACheck yours at ShaadiSaathi!`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const printReport = () => {
    window.print();
  };

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(194, 24, 91);
    doc.text('ShaadiSaathi Gun Milan Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Match: ${report.brideDetails?.name || 'Bride'} & ${report.groomDetails?.name || 'Groom'}`, 20, 30);
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`${t('astrology.labels.totalGun')}: ${report.totalScore} / 36 (${report.percentage}%)`, 20, 45);
    
    doc.setFontSize(12);
    // Use doc.splitTextToSize to handle longer translations
    const manglikText = doc.splitTextToSize(`${t('astrology.labels.manglikAnalysis')}: ${t(report.manglikAnalysis?.statusKey || 'astrology.status.not_manglik')}`, 170);
    doc.text(manglikText, 20, 55);
    
    const conclusionText = doc.splitTextToSize(`Conclusion: ${t(report.conclusionKey || 'astrology.status.good_match')}`, 170);
    doc.text(conclusionText, 20, 70);
    
    let yPos = 90;
    doc.setFontSize(14);
    doc.setTextColor(194, 24, 91);
    doc.text(t('astrology.labels.ashtaKoota'), 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    Object.values(report.score).forEach((koota) => {
      doc.text(`${t(koota.key)}: ${koota.obtained} / ${koota.max}`, 20, yPos);
      yPos += 10;
    });
    
    doc.save(`Kundli_Match_${report.brideDetails?.name || 'Bride'}_${report.groomDetails?.name || 'Groom'}.pdf`);
  };

  const saveToProfile = async () => {
    try {
      // Auto-saved by backend during generation if logged in
      toast.success(t('astrology.labels.saveToProfile') + ' Success!');
    } catch (err) {
      toast.error('You need to be logged in to save reports.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]/50 pt-24 pb-20 font-sans print:bg-white print:pt-0">
      <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none print:hidden" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 print:mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl mb-6 shadow-xl border border-gray-800 text-[#D4AF37] print:hidden">
            <FiStar size={32} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight mb-6">
            Kundli <span className="text-[#C2185B]">Matching</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 font-medium italic max-w-2xl mx-auto print:hidden">
            Check compatibility based on Vedic Ashta Koota Milan. Discover your Gun Milan score, Manglik status, and overall harmony.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-5 space-y-8 print:hidden">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-100">
              <form onSubmit={handleMatch} className="space-y-8">
                
                {/* Bride Details */}
                <div>
                  <h3 className="font-display text-xl font-black mb-4 flex items-center gap-2 text-[#C2185B]">
                    <FiHeart /> Bride's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" placeholder="e.g. Priya Sharma" value={bride.name} onChange={e => setBride({...bride, name: e.target.value})} />
                    <InputField label="Birth Place" placeholder="e.g. Mumbai" value={bride.place} onChange={e => setBride({...bride, place: e.target.value})} />
                    <InputField label="Date of Birth" type="date" value={bride.dob} onChange={e => setBride({...bride, dob: e.target.value})} />
                    <InputField label="Time of Birth" type="time" value={bride.time} onChange={e => setBride({...bride, time: e.target.value})} />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 italic font-medium border border-gray-100">
                    &
                  </div>
                </div>

                {/* Groom Details */}
                <div>
                  <h3 className="font-display text-xl font-black mb-4 flex items-center gap-2 text-[#1a1a1a]">
                    <FiHeart /> Groom's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" placeholder="e.g. Rahul Verma" value={groom.name} onChange={e => setGroom({...groom, name: e.target.value})} />
                    <InputField label="Birth Place" placeholder="e.g. Delhi" value={groom.place} onChange={e => setGroom({...groom, place: e.target.value})} />
                    <InputField label="Date of Birth" type="date" value={groom.dob} onChange={e => setGroom({...groom, dob: e.target.value})} />
                    <InputField label="Time of Birth" type="time" value={groom.time} onChange={e => setGroom({...groom, time: e.target.value})} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {loading ? 'Calculating Milan...' : 'Generate Match Report'}
                </button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!report ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] bg-white rounded-[2.5rem] shadow-premium border border-gray-100 flex flex-col items-center justify-center p-10 text-center print:hidden">
                  <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-[#C2185B]">
                    <FiStar size={40} />
                  </div>
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Awaiting Details</h3>
                  <p className="text-gray-500 italic max-w-sm">Enter the birth details of the bride and groom to view their celestial compatibility.</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  
                  {/* Score Card */}
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl print:bg-white print:text-black print:shadow-none print:border print:border-gray-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-bl-full pointer-events-none print:hidden" />
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-2">{t('astrology.labels.totalGun')}</p>
                        <h2 className="text-6xl font-display font-black mb-2">{report.totalScore} <span className="text-2xl text-gray-400">/ 36</span></h2>
                        <p className="text-gray-300 italic print:text-gray-700">{t(report.conclusionKey || 'astrology.status.good_match')}</p>
                      </div>
                      
                      <div className="w-32 h-32 rounded-full border-8 border-[#D4AF37]/30 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 print:hidden">
                          <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#D4AF37" strokeWidth="8" strokeDasharray="300" strokeDashoffset={300 - (300 * report.percentage) / 100} />
                        </svg>
                        <div className="text-center">
                          <span className="text-2xl font-black">{report.percentage}%</span>
                          <span className="block text-[8px] uppercase tracking-widest text-[#D4AF37]">{t('astrology.labels.compatibility')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 print:hidden">
                    <button onClick={downloadPDF} className="flex-1 bg-white border border-gray-200 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 hover:border-[#C2185B] hover:text-[#C2185B] transition-all flex items-center justify-center gap-2">
                      <FiDownload /> {t('astrology.labels.downloadPdf')}
                    </button>
                    <button onClick={saveToProfile} className="flex-1 bg-white border border-gray-200 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all flex items-center justify-center gap-2">
                      <FiCheckCircle /> {t('astrology.labels.saveToProfile')}
                    </button>
                    <button onClick={shareWhatsApp} className="flex-1 bg-green-500 text-white border border-green-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                      <FiShare2 /> {t('astrology.labels.shareWhatsapp')}
                    </button>
                    <button onClick={printReport} className="flex-1 bg-gray-900 text-white border border-gray-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                      <FiPrinter /> {t('astrology.labels.print')}
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Manglik Analysis */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${report.manglikAnalysis?.isMatch ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} print:bg-transparent print:p-0`}>
                          {report.manglikAnalysis?.isMatch ? <FiCheckCircle /> : <FiAlertCircle />}
                        </div>
                        <h4 className="font-display font-black text-lg">{t('astrology.labels.manglikAnalysis')}</h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        {t(report.manglikAnalysis?.statusKey || 'astrology.status.not_manglik')}
                      </p>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <h4 className="font-display font-black text-lg mb-4 text-[#C2185B]">{t('astrology.labels.rashiDetails')}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-gray-500">{report.brideDetails.name}</span>
                          <span className="font-bold">{t(report.brideDetails.rashiKey)}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-gray-500">{report.groomDetails.name}</span>
                          <span className="font-bold">{t(report.groomDetails.rashiKey)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kootas Breakdown */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="font-display font-black text-lg mb-6">{t('astrology.labels.ashtaKoota')}</h4>
                    <div className="space-y-4">
                      {Object.values(report.score).map((koota, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{t(koota.key)}</span>
                            <span className="font-bold text-gray-900">{koota.obtained} / {koota.max}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden print:border print:border-gray-200">
                            <div className="h-full bg-[#C2185B] rounded-full print:bg-gray-400" style={{ width: `${(koota.obtained / koota.max) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
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
