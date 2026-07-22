import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { generateOpenAIWeddingPlan } from '../store/slices/featureSlice';
import { LuSparkles as Sparkles, LuMapPin as MapPin, LuWallet as Wallet, LuCalendar as Calendar, LuDownload as Download, LuCopy as Copy, LuRefreshCw as RefreshCw, LuInfo as Info } from 'react-icons/lu';
import api from '../utils/api';
import { FiUsers, FiAlertTriangle as AlertTriangle, FiCheckCircle as CheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { useTranslation } from 'react-i18next';

const SERVICES_OPTIONS = [
  'Venue', 'Photography', 'Catering', 'Decoration', 'Mehndi', 'Makeup Artist', 'Pandit', 'Cab Service', 'DJ'
];

export default function AIPlannerPage() {
  const { i18n } = useTranslation();
  const [step, setStep] = useState(1); // 1: Form, 2: Loading, 3: Results
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    city: '',
    budget: '',
    guestCount: '',
    weddingType: 'Traditional',
    servicesRequired: [],
  });
  
  const resultsRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { aiRecommendations, loading, error } = useSelector((state) => state.feature);
  const { user } = useSelector((state) => state.auth);

  React.useEffect(() => {
    api.post('/tools/track', { toolName: 'AI Wedding Planner', action: 'viewed_tool' }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      servicesRequired: prev.servicesRequired.includes(service)
        ? prev.servicesRequired.filter(s => s !== service)
        : [...prev.servicesRequired, service]
    }));
  };

  const handleSubmit = async (e, forceReset = false) => {
    if (e) e.preventDefault();
    if (!formData.city || !formData.budget || !formData.guestCount) {
      toast.error("Please fill in City, Budget, and Guest Count");
      return;
    }
    setStep(2); // Show Loading State
    
    // Pass the resetCircuit flag if user manually clicks "Retry AI Connection"
    const payload = forceReset ? { ...formData, resetCircuit: true, language: i18n.language } : { ...formData, language: i18n.language };

    const result = await dispatch(generateOpenAIWeddingPlan(payload));
    if (result.error) {
      toast.error(result.payload || "Failed to generate plan.");
      setStep(1); // Go back on error
    } else {
      setStep(3); // Show Results
      toast.success("Plan Generated Successfully!");
      
      // Save the generated plan to the database
      if (user) {
        try {
          await api.post('/tools/ai-planner', {
            weddingDate: formData.weddingDate,
            location: formData.city,
            budget: Number(formData.budget),
            guestCount: Number(formData.guestCount),
            weddingType: formData.weddingType,
            roadmap: result.payload 
          });
        } catch (err) {
          console.error("Failed to save plan to DB", err);
        }
      } else {
        toast.success("Log in to save this plan to your dashboard!", { duration: 4000, icon: '💡' });
      }

      api.post('/tools/track', { toolName: 'AI Wedding Planner', action: 'generated_plan', metadata: { budget: formData.budget } }).catch(() => {});
    }
  };

  const handleDownloadPDF = async () => {
    const element = resultsRef.current;
    if (!element) return;
    
    toast.loading("Generating PDF...", { id: 'pdf' });
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ShaadiSaathi_Wedding_Plan.pdf');
      toast.success("PDF Downloaded!", { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.", { id: 'pdf' });
    }
  };

  const handleCopyToClipboard = () => {
    if (!aiRecommendations?.aiPlan) return;
    const plan = aiRecommendations.aiPlan;
    
    const budgetText = Array.isArray(plan.budgetBreakdown) 
      ? plan.budgetBreakdown.map(b => `- ${b.category}: ₹${b.amount} (${b.percentage}%) - ${b.notes}`).join('\n') 
      : 'Not available';
      
    const timelineText = Array.isArray(plan.timeline)
      ? plan.timeline.map(t => `${t.timeframe}:\n${Array.isArray(t.tasks) ? t.tasks.map(task => `  - ${task}`).join('\n') : ''}`).join('\n\n')
      : 'Not available';
      
    const tipsText = Array.isArray(plan.tips)
      ? plan.tips.map(t => `- ${t}`).join('\n')
      : 'Not available';

    const text = `
Wedding Plan Overview:
${plan.summary || ''}

Budget Breakdown:
${budgetText}

Timeline:
${timelineText}

Expert Tips:
${tipsText}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success("Plan copied to clipboard!");
  };

  const handleRegenerate = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-sm font-medium text-slate-700 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
            <span>Powered by OpenAI GPT-4o</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D6D] via-[#FF758F] to-[#FFB347] mb-6">
            Intelligent Wedding Planner
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Generate a personalized, comprehensive wedding master plan in seconds using the world's most advanced AI.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: FORM */}
          {step === 1 && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 md:p-12 bg-gradient-to-br from-slate-50 to-white">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Sparkles className="text-[#FF4D6D]" /> Your Details
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Bride Name</label>
                        <input type="text" name="brideName" value={formData.brideName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all outline-none bg-white" placeholder="Priya" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Groom Name</label>
                        <input type="text" name="groomName" value={formData.groomName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all outline-none bg-white" placeholder="Rahul" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Wedding City *</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all outline-none bg-white" placeholder="e.g. Udaipur" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Wedding Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all outline-none bg-white" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget (₹) *</label>
                        <div className="relative">
                          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input required type="number" min="100000" step="50000" name="budget" value={formData.budget} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all outline-none bg-white" placeholder="1500000" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Guest Count *</label>
                        <div className="relative">
                          <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input required type="number" min="10" name="guestCount" value={formData.guestCount} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all outline-none bg-white" placeholder="300" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Wedding Style/Vibe</label>
                      <select name="weddingType" value={formData.weddingType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all outline-none bg-white appearance-none">
                        <option>Traditional</option>
                        <option>Destination / Royal</option>
                        <option>Minimalist / Modern</option>
                        <option>Intimate / Simple</option>
                        <option>Luxury Grand</option>
                      </select>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-[#FF4D6D] to-[#FF758F] hover:from-[#FF758F] hover:to-[#FF4D6D] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#FF4D6D]/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Generate AI Plan
                    </button>
                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                  </form>
                </div>

                <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6A11CB]/20 to-[#2575FC]/20 z-0"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D6D] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                  <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#2575FC] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6">Select Services Needed</h3>
                    <div className="flex flex-wrap gap-3">
                      {SERVICES_OPTIONS.map(service => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleServiceToggle(service)}
                          className={`px-4 py-2 rounded-full border transition-all ${formData.servicesRequired.includes(service) ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'}`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                    <div className="mt-12 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Smart Budgeting</h4>
                          <p className="text-slate-400 text-sm mt-1">AI optimizes your funds across all selected categories mathematically.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-[#FFB347]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Custom Timeline</h4>
                          <p className="text-slate-400 text-sm mt-1">Get a tailored month-by-month schedule based on your date.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOADING */}
          {step === 2 && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 md:py-24 flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#FF4D6D] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#FF4D6D] animate-pulse" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-1">
                <span>Connecting to AI</span>
                <span className="flex gap-1 ml-1">
                  <span className="animate-bounce inline-block">.</span>
                  <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="animate-bounce inline-block" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
              </h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">
                Analyzing your {formData.city || 'city'} venue options, adjusting ₹{formData.budget || 'budget'} budget, and curating your personalized timeline...
              </p>
              
              {/* Skeleton UI preview */}
              <div className="w-full max-w-3xl mx-auto space-y-4 opacity-50 pointer-events-none">
                <div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-40 bg-slate-200 rounded-2xl animate-pulse delay-75"></div>
                  <div className="h-40 bg-slate-200 rounded-2xl animate-pulse delay-150"></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 3 && aiRecommendations?.aiPlan && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF4D6D]/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-[#FF4D6D] w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Plan Generated Successfully</h3>
                    <p className="text-sm text-slate-500">Based on your ₹{formData.budget} budget in {formData.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleRegenerate} className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                    <RefreshCw className="w-4 h-4" /> Edit Details
                  </button>
                  <button onClick={handleCopyToClipboard} className="flex items-center gap-2 px-4 py-2 text-[#6A11CB] bg-[#6A11CB]/10 hover:bg-[#6A11CB]/20 rounded-xl font-medium transition-colors">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 text-white bg-[#FF4D6D] hover:bg-[#FF3355] rounded-xl font-medium shadow-md shadow-[#FF4D6D]/20 transition-colors">
                    <Download className="w-4 h-4" /> Save PDF
                  </button>
                </div>
              </div>

              {/* Fallback Banner (Smart Planning Mode) */}
              {aiRecommendations?.fallback && (
                <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <Sparkles className="text-indigo-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900 text-lg">✨ Smart Planning Mode Active</h4>
                      <p className="text-sm text-indigo-700 mt-1 max-w-2xl leading-relaxed">
                        Our AI Assistant is currently using optimized internal templates to instantly generate your personalized wedding plan without delay.
                      </p>
                    </div>
                  </div>
                  <button onClick={(e) => handleSubmit(e, true)} className="shrink-0 w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Try Live AI Connection
                  </button>
                </div>
              )}

              {/* Printable Area */}
              <div ref={resultsRef} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* PDF Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                    {formData.brideName || 'Bride'} & {formData.groomName || 'Groom'}'s Wedding Plan
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6 text-slate-300">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {formData.city}</span>
                    <span className="flex items-center gap-2"><Wallet className="w-4 h-4"/> ₹{Number(formData.budget).toLocaleString('en-IN')}</span>
                    <span className="flex items-center gap-2"><FiUsers className="w-4 h-4"/> {formData.guestCount} Guests</span>
                  </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                  
                  {/* Overview */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">Wedding Overview</h3>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl text-purple-900 leading-relaxed">
                      {aiRecommendations.aiPlan.summary || 'Your customized wedding plan is ready.'}
                    </div>
                  </section>

                  {/* Budget */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">Smart Budget Breakdown</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Array.isArray(aiRecommendations.aiPlan.budgetBreakdown) && aiRecommendations.aiPlan.budgetBreakdown.map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800">{item.category}</h4>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold">{item.percentage}%</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mb-2">₹{item.amount.toLocaleString('en-IN')}</div>
                          <p className="text-sm text-slate-500">{item.notes}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Timeline */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">Wedding Timeline</h3>
                    </div>
                    <div className="relative border-l-2 border-slate-200 ml-6 space-y-8">
                      {Array.isArray(aiRecommendations.aiPlan.timeline) && aiRecommendations.aiPlan.timeline.map((phase, idx) => (
                        <div key={idx} className="relative pl-8">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                          <h4 className="font-bold text-lg text-slate-800 mb-3">{phase.timeframe}</h4>
                          <ul className="space-y-2">
                            {Array.isArray(phase.tasks) && phase.tasks.map((task, tidx) => (
                              <li key={tidx} className="text-slate-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span> {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Recommendations */}
                  {Array.isArray(aiRecommendations.aiPlan.recommendations) && aiRecommendations.aiPlan.recommendations.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Vendor & Styling Ideas</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {aiRecommendations.aiPlan.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 text-lg border-b border-slate-200 pb-2">{rec.service}</h4>
                            <ul className="space-y-2">
                              {Array.isArray(rec.ideas) && rec.ideas.map((idea, iidx) => (
                                <li key={iidx} className="text-slate-600 text-sm flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  <span>{idea}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Local Vendor Matches (from Database) */}
                  {Array.isArray(aiRecommendations.localVendors) && aiRecommendations.localVendors.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Top Local Matches in {formData.city}</h3>
                      </div>
                      <div className="space-y-6">
                        {aiRecommendations.localVendors.map((cat, idx) => (
                          <div key={idx}>
                            <h4 className="font-semibold text-slate-700 mb-4">{cat.categoryName}</h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Array.from(new Map([...(cat.budget||[]), ...(cat.premium||[]), ...(cat.fastResponse||[])].map(v => [v._id, v])).values()).slice(0,6).map((vendor, vidx) => (
                                <div key={vidx} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                                  <img src={vendor.coverImage} alt={vendor.businessName} className="w-full h-32 object-cover" />
                                  <div className="p-4 flex-1 flex flex-col">
                                    <h5 className="font-bold text-slate-800 truncate">{vendor.businessName}</h5>
                                    <div className="flex justify-between items-center mt-2 mb-3">
                                      <span className="text-sm font-medium flex items-center gap-1 text-amber-500">
                                        ⭐ {vendor.rating?.average || 'New'}
                                      </span>
                                    </div>
                                    
                                    {vendor.recommendedPackage ? (
                                      <div className="mt-auto bg-emerald-50 rounded-lg p-3 border border-emerald-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">Perfect Match</div>
                                        <h6 className="text-sm font-bold text-emerald-900 truncate pr-16">{vendor.recommendedPackage.name}</h6>
                                        <p className="text-xs text-emerald-700 mt-1 line-clamp-2">{vendor.recommendedPackage.features?.join(', ')}</p>
                                        <div className="text-sm font-bold text-emerald-800 mt-2">₹{vendor.recommendedPackage.price.toLocaleString('en-IN')}</div>
                                      </div>
                                    ) : (
                                      <div className="mt-auto bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <h6 className="text-sm font-bold text-slate-700">Starting from</h6>
                                        <div className="text-sm font-bold text-slate-900 mt-1">₹{vendor.basePrice?.toLocaleString('en-IN') || 0}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Tips & Warnings */}
                  <section>
                    <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <AlertTriangle className="text-emerald-400" />
                          Expert Tips & Cost Saving Alerts
                        </h3>
                        <ul className="space-y-4">
                          {Array.isArray(aiRecommendations.aiPlan.tips) && aiRecommendations.aiPlan.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-slate-200">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
