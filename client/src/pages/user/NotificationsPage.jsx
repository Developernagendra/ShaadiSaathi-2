import { useSelector, useDispatch } from 'react-redux'
import { FiBell, FiCheckCircle, FiCalendar, FiCreditCard, FiMessageSquare, FiClock, FiArrowRight } from 'react-icons/fi';
import { timeAgo } from '../../utils/helpers'
import { markAllRead, markSingleRead } from '../../store/slices/notificationSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: notifications, loading } = useSelector(s => s.notifications)

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
      case 'booking_status': return <FiCalendar className="text-blue-600" />;
      case 'payment': return <FiCreditCard className="text-emerald-600" />;
      case 'chat': return <FiMessageSquare className="text-purple-600" />;
      default: return <FiBell className="text-pink-600" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'booking':
      case 'booking_status': return 'bg-blue-50';
      case 'payment': return 'bg-emerald-50';
      case 'chat': return 'bg-purple-50';
      default: return 'bg-pink-50';
    }
  };

  return (
    <div className="pb-24 animate-fade-in relative min-h-[60vh]">
      <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="divider-luxe !justify-start mb-4 !gap-3">
              <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
              <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Stay Updated</span>
              <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Your Notifications</h1>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => dispatch(markAllRead())}
              className="bg-white border border-pink-100 text-[#C2185B] font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl hover:bg-[#C2185B] hover:text-white transition-all active:scale-95 italic flex items-center gap-3"
            >
              <FiCheckCircle /> Mark All as Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-20 text-center shadow-premium border border-pink-50 relative overflow-hidden"
          >
            <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />
            <div className="w-24 h-24 bg-[#FFF8F0] rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-[#D4AF37] shadow-inner rotate-3">
              <FiBell size={40} />
            </div>
            <h2 className="font-display text-3xl font-black text-gray-900 mb-4 tracking-tight">All Caught Up!</h2>
            <p className="text-gray-400 font-medium italic max-w-sm mx-auto mb-10 leading-relaxed">
              No new alerts at the moment. We'll notify you here about booking updates, messages, and more.
            </p>
            <Link to="/services" className="inline-flex items-center gap-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.3em] py-5 px-10 rounded-2xl shadow-xl hover:scale-105 transition-all italic">
              Explore Vendors
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((n, idx) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    if (!n.isRead) {
                      dispatch(markSingleRead(n._id))
                    }
                    if (n.link) {
                      navigate(n.link)
                    } else {
                      navigate('/dashboard')
                    }
                  }}
                  className={`group bg-white rounded-[2rem] p-6 md:p-8 shadow-premium border transition-all hover:shadow-premium-hover hover:border-[#C2185B]/30 relative overflow-hidden cursor-pointer ${n.isRead ? 'border-pink-50 opacity-80' : 'border-[#C2185B]/20 bg-gradient-to-r from-white to-[#FFF8F0]/30'
                    }`}
                >
                  <div className="flex gap-6 md:gap-8 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:rotate-6 ${getBg(n.type)}`}>
                      <span className="text-2xl">{getIcon(n.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={`font-display text-xl font-black tracking-tight leading-none ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {n.title}
                          {!n.isRead && <span className="inline-block w-2 h-2 rounded-full bg-[#C2185B] ml-3 animate-pulse" />}
                        </h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 flex-shrink-0 italic">
                          <FiClock className="text-[#D4AF37]" /> {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-500 font-medium italic leading-relaxed text-sm">
                        {n.message}
                      </p>

                      {n.link && (
                        <div
                          className="mt-6 inline-flex items-center gap-3 text-[10px] font-black text-[#C2185B] uppercase tracking-[0.2em] italic hover:gap-5 transition-all"
                        >
                          View Details <FiArrowRight />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtle decorative element */}
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 pointer-events-none ${getBg(n.type)}`} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

