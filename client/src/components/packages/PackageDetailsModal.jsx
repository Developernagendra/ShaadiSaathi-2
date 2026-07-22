import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck, FiMinus } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function PackageDetailsModal({ pkg, onClose, onQuote }) {
  if (!pkg) return null;

  const isGold = pkg.priority === 2 || pkg.name?.toLowerCase().includes('gold') || pkg.isPopular;

  const displayPrice = pkg.finalPrice 
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pkg.finalPrice)
    : pkg.price;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full p-1 transition-colors z-10">
          <FiX size={16} />
        </button>
        
        <div className={`p-6 ${isGold ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-gray-900' : 'bg-gray-50'}`}>
          <h3 className="font-display text-xl font-black">{pkg.icon} {pkg.name}</h3>
          <p className="text-sm font-bold opacity-80 mt-1">{displayPrice}</p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {pkg.longDescription && (
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">{pkg.longDescription}</p>
            </div>
          )}

          {pkg.includedServices?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Included Services</h4>
              <ul className="space-y-2">
                {pkg.includedServices.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pkg.excludedServices?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Not Included</h4>
              <ul className="space-y-2">
                {pkg.excludedServices.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-500 line-through decoration-gray-300">
                    <FiMinus className="text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2 shrink-0">
          <button 
            onClick={() => onQuote(pkg)}
            className={`w-full block text-center py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-transform ${isGold ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-gray-900' : 'bg-gray-900 text-white'}`}
          >
            {pkg.ctaText || 'Get Quote'}
          </button>
          
          <a 
            href={`https://wa.me/917903075243?text=${encodeURIComponent(`Hi, I am interested in the ${pkg.name} Package (${displayPrice}). Please provide more details.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] py-3 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform"
          >
            <FaWhatsapp size={14}/> WhatsApp Us
          </a>
        </div>
      </motion.div>
    </div>
  );
}
