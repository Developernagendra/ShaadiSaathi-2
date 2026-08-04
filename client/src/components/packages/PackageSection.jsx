import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiMessageCircle } from 'react-icons/fi';
import { fetchPackages } from '../../store/slices/packageSlice';
import PackageCard from './PackageCard';
import PackageSkeleton from './PackageSkeleton';
import PackageDetailsModal from './PackageDetailsModal';
import QuoteFormModal from './QuoteFormModal';
import ExpertConsultationModal from './ExpertConsultationModal';
import { useNavigate } from 'react-router-dom';
import { PACKAGE_IMAGES } from '../../utils/weddingImages';

export default function PackageSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { packages, loading, error } = useSelector(state => state.packages);

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedExpertContext, setSelectedExpertContext] = useState(null);

  useEffect(() => {
    if (packages.length === 0) {
      dispatch(fetchPackages());
    }
  }, [dispatch, packages.length]);

  const handleCustomPackage = () => {
    // Fallback/Custom route assuming they might have a custom package builder or we just open a quote without a specific pkg
    setSelectedQuote({ name: 'Custom Dream Package', isCustom: true });
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-[#FDFCF8] overflow-x-hidden relative" id="wedding-packages">
      <div className="max-w-[1280px] mx-auto relative z-10">

        {/* ── SECTION HEADER ── */}
        <div className="text-center mb-16 relative">

          {/* Decorative Floating Elements */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-10 left-[10%] md:left-[20%] text-3xl opacity-60">✨</motion.div>
          <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-10 right-[15%] md:right-[25%] text-4xl opacity-50">🌸</motion.div>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-24 left-[15%] md:left-[25%] text-2xl opacity-40">💍</motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#D4AF37]/10 backdrop-blur-md border border-[#D4AF37]/30 px-5 py-2 rounded-full mb-6 shadow-sm"
          >
            <span className="text-[10px] font-black text-[#B38D22] uppercase tracking-[0.3em]">✨ Wedding Packages</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight max-w-3xl mx-auto"
          >
            अपनी शादी के लिए चुनें <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C2185B] italic">बेस्ट Package</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mt-6 font-medium leading-relaxed"
          >
            छोटे समारोह से लेकर शानदार राजशाही शादी तक, अपने बजट और पसंद के अनुसार package चुनें।
          </motion.p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-center text-sm font-bold mb-6 border border-red-100 max-w-xl mx-auto">
            {error} - Please try refreshing the page.
          </div>
        )}

        {/* ── PACKAGE CARDS GRID ── */}
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 lg:gap-6 pb-16">
          {loading && packages.length === 0 ? (
            <div className="w-full flex flex-col md:flex-row justify-center gap-6">
              <PackageSkeleton />
              <PackageSkeleton />
              <PackageSkeleton />
            </div>
          ) : (
            <>
              {/* Silver (Index 0 or fallback) */}
              <div className="w-full lg:w-1/3 flex justify-center lg:justify-end lg:mt-8">
                <PackageCard
                  pkg={packages[0] || null}
                  tier="silver"
                  onOpenDetails={setSelectedDetails}
                  onOpenQuote={setSelectedQuote}
                  onOpenExpert={setSelectedExpertContext}
                />
              </div>

              {/* Gold (Index 1 or fallback) - Elevated */}
              <div className="w-full lg:w-1/3 flex justify-center z-10">
                <PackageCard
                  pkg={packages[1] || null}
                  tier="gold"
                  onOpenDetails={setSelectedDetails}
                  onOpenQuote={setSelectedQuote}
                  onOpenExpert={setSelectedExpertContext}
                />
              </div>

              {/* Royal (Index 2 or fallback) */}
              <div className="w-full lg:w-1/3 flex justify-center lg:justify-start lg:mt-8">
                <PackageCard
                  pkg={packages[2] || null}
                  tier="royal"
                  onOpenDetails={setSelectedDetails}
                  onOpenQuote={setSelectedQuote}
                  onOpenExpert={setSelectedExpertContext}
                />
              </div>
            </>
          )}
        </div>


        {/* ── CUSTOM PACKAGE CTA BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={PACKAGE_IMAGES.customBanner}
              alt="Custom Wedding Package"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1021]/95 via-[#0B1021]/80 to-transparent" />
          </div>

          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
            <div className="text-center md:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                ✨ Completely Tailored
              </div>
              <h3 className="font-serif text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                Want Something Different?
              </h3>
              <p className="text-gray-300 font-medium text-lg">
                Build your own wedding package with only the services you need.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <button
                onClick={handleCustomPackage}
                className="w-full sm:w-auto bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-white px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
              >
                Create Custom Package <FiArrowRight size={16} />
              </button>
              <button
                onClick={() => setSelectedExpertContext('custom')}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <FiMessageCircle size={16} /> Talk to an Expert
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedDetails && (
          <PackageDetailsModal
            pkg={selectedDetails}
            onClose={() => setSelectedDetails(null)}
            onQuote={(pkg) => {
              setSelectedDetails(null);
              setSelectedQuote(pkg);
            }}
          />
        )}
        {selectedQuote && (
          <QuoteFormModal
            pkg={selectedQuote}
            onClose={() => setSelectedQuote(null)}
          />
        )}
        {selectedExpertContext && (
          <ExpertConsultationModal
            packageContext={selectedExpertContext === 'custom' ? null : selectedExpertContext}
            onClose={() => setSelectedExpertContext(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
