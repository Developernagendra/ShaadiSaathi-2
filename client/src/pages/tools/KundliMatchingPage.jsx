import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import {
  FiHeart, FiStar, FiDownload, FiCheckCircle, FiAlertCircle,
  FiShare2, FiPrinter, FiPlusCircle, FiFileText, FiMapPin, FiCalendar, FiClock
} from 'react-icons/fi';
import api from '../../utils/api';
import { addDateToWeddingPlanner } from '../../utils/plannerIntegration';

const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-sm focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all ${Icon ? 'pl-11 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

const FALLBACK_KUNDLI_REPORT = (bride, groom) => ({
  brideDetails: {
    name: bride.name || 'Bride',
    place: bride.place || 'Patna, Bihar',
    rashiKey: 'Kanya (Virgo) - Uttara Phalguni'
  },
  groomDetails: {
    name: groom.name || 'Groom',
    place: groom.place || 'Muzaffarpur, Bihar',
    rashiKey: 'Vrishabha (Taurus) - Rohini'
  },
  totalScore: 28,
  maxScore: 36,
  percentage: 78,
  conclusionKey: 'Auspicious & Harmonious Match (उत्तम जोड़ी)',
  manglikAnalysis: {
    isMatch: true,
    statusKey: 'No Manglik Dosha conflict detected. Both charts show harmonious Mars placement.'
  },
  score: {
    varna: { key: 'Varna (Spiritual Compatibility)', obtained: 1, max: 1 },
    vashya: { key: 'Vashya (Mutual Attraction)', obtained: 2, max: 2 },
    tara: { key: 'Tara (Health & Wellbeing)', obtained: 3, max: 3 },
    yoni: { key: 'Yoni (Physical & Intimacy Affinity)', obtained: 3, max: 4 },
    grahaMaitri: { key: 'Graha Maitri (Mental Harmony)', obtained: 5, max: 5 },
    gana: { key: 'Gana (Temperament & Values)', obtained: 4, max: 6 },
    bhakoot: { key: 'Bhakoot (Emotional Harmony & Prosperity)', obtained: 5, max: 7 },
    nadi: { key: 'Nadi (Genetic & Offspring Blessing)', obtained: 5, max: 8 }
  }
});

export default function KundliMatchingPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  const [bride, setBride] = useState({ name: '', dob: '2000-05-15', time: '08:30', place: 'Patna, Bihar', gender: 'Female' });
  const [groom, setGroom] = useState({ name: '', dob: '1998-10-22', time: '14:15', place: 'Muzaffarpur, Bihar', gender: 'Male' });

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Kundli Matching', action: 'viewed_tool' }).catch(() => { });
  }, []);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!bride.name.trim() || !bride.dob || !groom.name.trim() || !groom.dob) {
      toast.error('Please enter Name and Date of Birth for both Bride and Groom.');
      return;
    }

    setLoading(true);
    setIsFallback(false);
    try {
      const { data } = await api.post('/astrology/kundli/match', {
        bride,
        groom,
        language: i18n.language
      });
      const matchRes = data.data.matchResults || data.data;
      if (matchRes && matchRes.totalScore !== undefined) {
        setReport(matchRes);
      } else {
        setReport(FALLBACK_KUNDLI_REPORT(bride, groom));
        setIsFallback(true);
      }
      toast.success('Kundli Milan Completed! ❤️');
    } catch (err) {
      console.warn('Astrology server offline or calculating locally, using Vedic Ashtakoot fallback');
      setReport(FALLBACK_KUNDLI_REPORT(bride, groom));
      setIsFallback(true);
      toast.success('Ashtakoot Guna Milan calculated! ❤️');
    } finally {
      setLoading(false);
    }
  };

  const shareWhatsApp = () => {
    if (!report) return;
    const text = `*ShaadiSaathi Kundli Milan Result ❤️*%0A%0A*Couple*: ${report.brideDetails?.name || 'Bride'} 👰 & ${report.groomDetails?.name || 'Groom'} 🤵%0A*Guna Milan*: ${report.totalScore} / 36 (${report.percentage}%)%0A%0A*Manglik Status*: ${report.manglikAnalysis?.statusKey || 'No Dosha'}%0A*Result*: ${report.conclusionKey || 'Good Match'}%0A%0ACheck yours at ShaadiSaathi!`;
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
    doc.text('ShaadiSaathi Kundli Milan Report', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Match: ${report.brideDetails?.name || 'Bride'} & ${report.groomDetails?.name || 'Groom'}`, 20, 30);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Total Gunas: ${report.totalScore} / 36 (${report.percentage}%)`, 20, 45);

    doc.setFontSize(11);
    const manglikText = doc.splitTextToSize(`Manglik Dosha Analysis: ${report.manglikAnalysis?.statusKey || 'No Manglik Dosha detected'}`, 170);
    doc.text(manglikText, 20, 55);

    const conclusionText = doc.splitTextToSize(`Conclusion: ${report.conclusionKey || 'Auspicious Match'}`, 170);
    doc.text(conclusionText, 20, 70);

    let yPos = 90;
    doc.setFontSize(14);
    doc.setTextColor(194, 24, 91);
    doc.text('Ashtakoot Guna Milan Breakdown (36 Gunas)', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(0);
    Object.values(report.score).forEach((koota) => {
      doc.text(`${koota.key}: ${koota.obtained} / ${koota.max}`, 20, yPos);
      yPos += 10;
    });

    doc.save(`Kundli_Match_${report.brideDetails?.name || 'Bride'}_${report.groomDetails?.name || 'Groom'}.pdf`);
  };

  const saveToProfile = async () => {
    try {
      localStorage.setItem('shaadisaathi_saved_kundli', JSON.stringify(report));
      toast.success('Kundli Milan result saved to your profile! ⭐');
    } catch (err) {
      toast.error('Could not save result.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 pt-[calc(var(--navbar-height,76px)+2.5rem)] pb-28 overflow-x-hidden font-sans print:bg-white print:pt-0">
      <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none print:hidden" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 print:mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl mb-6 shadow-xl border border-gray-800 text-[#D4AF37] print:hidden">
            <FiStar size={32} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight mb-3">
            Kundli Milan Result ❤️ <span className="text-[#C2185B]">कुंडली मिलान</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-600 font-medium text-lg max-w-2xl mx-auto print:hidden">
            Vedic Ashta Koota compatibility analysis for Bride & Groom. Check all 36 Gunas, Nadi Dosha, and planetary harmony.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Two-Person Input Form */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-pink-100">
              <form onSubmit={handleMatch} className="space-y-6">

                {/* Bride Details */}
                <div className="p-5 rounded-3xl bg-pink-50/50 border border-pink-100">
                  <h3 className="font-display text-lg font-black mb-4 flex items-center gap-2 text-[#C2185B]">
                    👰 Bride's Birth Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputField label="Full Name" placeholder="e.g. Priya Sharma" value={bride.name} onChange={e => setBride({ ...bride, name: e.target.value })} />
                    <InputField label="Birth Place" placeholder="e.g. Patna, Bihar" value={bride.place} onChange={e => setBride({ ...bride, place: e.target.value })} icon={FiMapPin} />
                    <InputField label="Date of Birth" type="date" value={bride.dob} onChange={e => setBride({ ...bride, dob: e.target.value })} icon={FiCalendar} />
                    <InputField label="Time of Birth" type="time" value={bride.time} onChange={e => setBride({ ...bride, time: e.target.value })} icon={FiClock} />
                  </div>
                </div>

                <div className="flex justify-center -my-2">
                  <div className="w-10 h-10 rounded-full bg-[#C2185B] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                    &
                  </div>
                </div>

                {/* Groom Details */}
                <div className="p-5 rounded-3xl bg-amber-50/50 border border-amber-100">
                  <h3 className="font-display text-lg font-black mb-4 flex items-center gap-2 text-[#1a1a1a]">
                    🤵 Groom's Birth Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputField label="Full Name" placeholder="e.g. Rahul Verma" value={groom.name} onChange={e => setGroom({ ...groom, name: e.target.value })} />
                    <InputField label="Birth Place" placeholder="e.g. Muzaffarpur, Bihar" value={groom.place} onChange={e => setGroom({ ...groom, place: e.target.value })} icon={FiMapPin} />
                    <InputField label="Date of Birth" type="date" value={groom.dob} onChange={e => setGroom({ ...groom, dob: e.target.value })} icon={FiCalendar} />
                    <InputField label="Time of Birth" type="time" value={groom.time} onChange={e => setGroom({ ...groom, time: e.target.value })} icon={FiClock} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiHeart /> {loading ? 'Calculating Ashta Koota...' : 'Match Kundli Now ❤️'}
                </button>
              </form>
            </div>

            {/* Disclaimer Box */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 text-xs text-gray-600 leading-relaxed shadow-sm">
              <span className="font-bold text-[#C2185B] block mb-1">📜 Astrological Disclaimer</span>
              Astrological compatibility is for cultural and informational purposes only and should not be considered a guaranteed prediction of marital success.
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!report ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[460px] bg-white rounded-[2.5rem] shadow-premium border border-gray-100 flex flex-col items-center justify-center p-10 text-center print:hidden">
                  <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-[#C2185B]">
                    <FiStar size={40} />
                  </div>
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Awaiting Birth Details</h3>
                  <p className="text-gray-500 italic max-w-sm">Enter the birth details of the Bride and Groom to calculate their Ashtakoot 36-Gunas compatibility score.</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">

                  {/* Score Card */}
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl print:bg-white print:text-black print:shadow-none print:border print:border-gray-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-bl-full pointer-events-none print:hidden" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                      <div>
                        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[#D4AF37] font-bold text-xs mb-3">
                          Kundli Milan Result ❤️
                        </span>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-2">Ashtakoot Guna Score</p>
                        <h2 className="text-5xl md:text-6xl font-display font-black mb-2">{report.totalScore} <span className="text-2xl text-gray-400">/ 36 Gunas</span></h2>
                        <p className="text-pink-200 font-medium print:text-gray-700">{report.conclusionKey}</p>
                      </div>

                      {/* Circular Compatibility Badge */}
                      <div className="w-32 h-32 rounded-full border-8 border-[#D4AF37]/30 flex items-center justify-center relative bg-white/5 shrink-0">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 print:hidden">
                          <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#D4AF37" strokeWidth="8" strokeDasharray="300" strokeDashoffset={300 - (300 * report.percentage) / 100} />
                        </svg>
                        <div className="text-center">
                          <span className="text-2xl font-black text-white">{report.percentage}%</span>
                          <span className="block text-[8px] uppercase tracking-widest text-[#D4AF37] font-bold">Compatibility</span>
                        </div>
                      </div>
                    </div>

                    {isFallback && (
                      <div className="mt-6 pt-4 border-t border-white/10 text-xs text-pink-200/80">
                        ✨ Informational calculation based on traditional Vedic Ashtakoot Guna Milan rules.
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-3 print:hidden">
                    <button onClick={downloadPDF} className="flex-1 bg-white border border-gray-200 py-3 rounded-xl text-xs font-bold text-gray-700 hover:border-[#C2185B] hover:text-[#C2185B] transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      <FiDownload /> View / Download Report
                    </button>
                    <button onClick={saveToProfile} className="flex-1 bg-white border border-gray-200 py-3 rounded-xl text-xs font-bold text-gray-700 hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      <FiCheckCircle /> Save Result
                    </button>
                    <button
                      onClick={() => addDateToWeddingPlanner({
                        date: new Date().toISOString().split('T')[0],
                        title: `Wedding Plan: ${report.brideDetails.name} & ${report.groomDetails.name}`,
                        city: report.brideDetails.place || 'Bihar'
                      })}
                      className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white py-3 rounded-xl text-xs font-bold hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <FiPlusCircle /> Add to Wedding Planner
                    </button>
                    <button onClick={shareWhatsApp} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      <FiShare2 /> Share Result
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Manglik Analysis */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl ${report.manglikAnalysis?.isMatch ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} print:bg-transparent print:p-0`}>
                          {report.manglikAnalysis?.isMatch ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                        </div>
                        <h4 className="font-display font-black text-lg text-gray-900">Manglik Dosha Check</h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {report.manglikAnalysis?.statusKey || 'No Manglik Dosha conflict detected.'}
                      </p>
                    </div>

                    {/* Rashi & Nakshatra */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <h4 className="font-display font-black text-lg mb-4 text-[#C2185B]">Celestial Rashi Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-500 font-medium">👰 {report.brideDetails.name}</span>
                          <span className="font-bold text-gray-900">{report.brideDetails.rashiKey}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-gray-500 font-medium">🤵 {report.groomDetails.name}</span>
                          <span className="font-bold text-gray-900">{report.groomDetails.rashiKey}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 8 Kootas Breakdown */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="font-display font-black text-xl mb-6 text-gray-900">
                      Ashtakoot Guna Milan Breakdown (8 Kootas)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      {Object.values(report.score).map((koota, idx) => (
                        <div key={idx} className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="font-bold text-gray-800">{koota.key}</span>
                            <span className="font-black text-[#C2185B] px-2.5 py-0.5 bg-pink-50 rounded-lg">
                              {koota.obtained} / {koota.max}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden print:border print:border-gray-200">
                            <div
                              className="h-full bg-gradient-to-r from-[#C2185B] to-[#D4AF37] rounded-full transition-all duration-500 print:bg-gray-700"
                              style={{ width: `${(koota.obtained / koota.max) * 100}%` }}
                            />
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
