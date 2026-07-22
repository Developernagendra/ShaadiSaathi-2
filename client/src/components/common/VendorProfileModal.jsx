import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiStar, FiMapPin, FiCheckCircle, FiShield, FiHeart } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';

export default function VendorProfileModal({ isOpen, onClose, vendor }) {
  if (!isOpen || !vendor) return null

  const vendorName = vendor.businessName || vendor.name || 'Premium Vendor'
  const vendorLogo = vendor.images?.[0]?.url || vendor.logo || `https://ui-avatars.com/api/?name=${vendorName}&background=C2185B&color=fff`
  const rating = vendor.rating?.average?.toFixed(1) || '5.0'
  const reviews = vendor.rating?.count || 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm" 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.2)] overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center z-20 transition-colors"
          >
            <FiX size={20} />
          </button>

          {/* Cover Photo */}
          <div className="h-48 md:h-64 relative bg-gray-900 shrink-0">
            <img 
              src={vendor.coverImage?.url || vendorLogo} 
              alt="Vendor Cover" 
              className="w-full h-full object-cover opacity-60 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl shrink-0 relative">
                <img src={vendorLogo} className="w-full h-full object-cover" alt={vendorName} />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <FiCheckCircle className="text-white text-xs" />
                </div>
              </div>
              <div className="pb-2 md:pb-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-2xl md:text-4xl font-black tracking-tight drop-shadow-lg leading-none">{vendorName}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/80 drop-shadow-sm mt-3">
                  <span className="flex items-center gap-1.5"><FiMapPin className="text-[#D4AF37]" /> {vendor.location?.city || 'Nationwide'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <span className="flex items-center gap-1.5 text-yellow-400"><FiStar className="fill-yellow-400" /> {rating} ({reviews})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar bg-[#FAFAFA] flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { icon: <FiShield />, label: 'Verified Partner', value: 'Yes', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: <FaTruck />, label: 'Fleet Size', value: '12+ Vehicles', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: <FiHeart />, label: 'Bookings', value: '150+', color: 'text-pink-500', bg: 'bg-pink-50' },
                { icon: <FiStar />, label: 'Response Rate', value: '100%', color: 'text-yellow-500', bg: 'bg-yellow-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center group hover:-translate-y-1 transition-all">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center text-lg mb-3 shadow-inner`}>
                    {stat.icon}
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                  <p className="font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-pink-50 shadow-sm relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-[50px]" />
              <h3 className="font-display text-xl font-black text-gray-900 mb-4 tracking-tight relative z-10">About the Fleet Provider</h3>
              <p className="text-gray-600 leading-relaxed font-medium relative z-10">
                {vendor.description || `${vendorName} is a premium, verified Baraat Cabs partner. They specialize in providing luxury, well-maintained vehicles with professional chauffeurs specifically trained for wedding events. Their fleet guarantees elegance, punctuality, and an imperial experience.`}
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full bg-gray-900 text-white hover:bg-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              Continue Booking
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
