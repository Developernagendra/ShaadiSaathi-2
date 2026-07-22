import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function EmptyState({ icon = '🔍', title, message, actionLabel, actionTo, onAction, className = '' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className={`flex flex-col items-center justify-center py-24 px-6 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-pink-50 shadow-premium ${className}`}
    >
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-pink-100 rounded-full blur-xl opacity-50 group-hover:scale-125 transition-transform duration-500" />
        <div className="w-24 h-24 bg-gradient-to-br from-[#FFF8F0] to-white rounded-[2rem] shadow-sm border border-pink-100 flex items-center justify-center text-5xl relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500 rotate-3 group-hover:rotate-0">
          {icon}
        </div>
      </div>
      <h3 className="font-display text-3xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
      {message && <p className="text-gray-500 max-w-sm mb-10 font-medium leading-relaxed">{message}</p>}
      
      <div className="flex gap-4">
        {(actionLabel && actionTo) && (
          <Link to={actionTo} className="btn-primary">{actionLabel}</Link>
        )}
        {(actionLabel && onAction) && (
          <button onClick={onAction} className="btn-primary">{actionLabel}</button>
        )}
      </div>
    </motion.div>
  )
}
