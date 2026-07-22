import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiUser, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import BrandLogo from '../../components/common/BrandLogo'

export default function RegisterSelectionPage() {
  const { t } = useTranslation?.() || { t: (key) => key };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-pink-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-yellow-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10">

        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <BrandLogo className="mb-8 justify-center" />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight"
          >
            Join ShaadiSaathi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-medium italic text-lg max-w-xl mx-auto"
          >
            Choose how you want to experience India's premium wedding platform.
          </motion.p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">

          {/* Card 1: User */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-white rounded-[3rem] transform group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-500 shadow-xl border border-pink-50" />

            <Link to="/register/user" className="relative h-full flex flex-col p-10 z-10 outline-none">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-pink-100 group-hover:shadow-md transition-shadow">
                <FiUser size={36} className="text-[#C2185B]" />
              </div>

              <h2 className="font-display text-4xl font-black text-gray-900 mb-4">
                💍 Join as User
              </h2>

              <p className="text-gray-600 font-medium text-lg mb-10 leading-relaxed flex-grow">
                Book trusted wedding services, manage guests, and plan your special day seamlessly.
              </p>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-[11px] font-black text-[#C2185B] uppercase tracking-[0.2em]">
                  Continue as User
                </span>
                <div className="w-12 h-12 rounded-full bg-[#C2185B] text-white flex items-center justify-center transform group-hover:translate-x-2 transition-transform shadow-lg">
                  <FiArrowRight size={20} />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 2: Vendor */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-[3rem] transform group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-800" />

            <Link to="/register/vendor" className="relative h-full flex flex-col p-10 z-10 outline-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[40px] pointer-events-none" />

              <div className="w-20 h-20 bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-gray-700 group-hover:border-[#D4AF37]/50 transition-colors">
                <FiBriefcase size={36} className="text-[#D4AF37]" />
              </div>

              <h2 className="font-display text-4xl font-black text-white mb-4">
                🏪 Join as Vendor
              </h2>

              <p className="text-gray-400 font-medium text-lg mb-10 leading-relaxed flex-grow">
                Grow your wedding business, reach more couples, and get premium bookings easily.
              </p>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
                  Continue as Vendor
                </span>
                <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center transform group-hover:translate-x-2 transition-transform shadow-lg">
                  <FiArrowRight size={20} />
                </div>
              </div>
            </Link>
          </motion.div>

        </div>

        {/* Footer Link */}
        <div className="text-center mt-16">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            {t('auth.hasAccount', 'Already have an account?')} {' '}
            <Link to="/login" className="text-[#C2185B] hover:text-[#8E244D] underline underline-offset-4 transition-colors">
              {t('nav.login', 'Log In Here')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
