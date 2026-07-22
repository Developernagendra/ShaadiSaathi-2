import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { formatDateShort } from '../../utils/helpers'
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiTrash2, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast'
import EmptyState from '../../components/common/EmptyState'

export default function VendorNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/notifications')
      .then(r => setNotifications(r.data.notifications))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleNotifClick = (n) => {
    if (!n.isRead) {
      handleMarkAsRead(n._id)
    }
    if (n.link) {
      navigate(n.link)
    } else {
      navigate('/vendor/dashboard')
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <FiCheckCircle className="text-green-500" />
      case 'payment': return <FiCheckCircle className="text-blue-500" />
      case 'alert': return <FiAlertCircle className="text-red-500" />
      default: return <FiInfo className="text-primary-500" />
    }
  }

  return (
    <div className="pb-24 animate-fade-in relative max-w-5xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
        <div>
          <div className="divider-luxe !justify-start mb-3 !gap-3">
            <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Alerts & Updates</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Notification Center</h1>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => {
              api.patch('/notifications/read-all').then(() => {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                toast.success('All marked as read')
              })
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all shadow-sm"
          >
            <FiCheckCircle size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="relative z-10 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-16 shadow-sm border border-white text-center">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner"><FiBell className="text-gray-300" /></div>
             <h3 className="font-display text-2xl font-black text-gray-900 mb-2">You're all caught up!</h3>
             <p className="text-gray-500 font-medium italic">No new notifications right now. Enjoy the silence.</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-6 md:p-10 shadow-sm border border-white space-y-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/10 to-[#C2185B]/10 rounded-full blur-[80px] pointer-events-none" />
             
             {notifications.map((n, i) => (
                <div
                  key={n._id}
                  onClick={() => handleNotifClick(n)}
                  className={`relative p-5 md:p-6 rounded-[2rem] border transition-all duration-300 group cursor-pointer ${
                    n.isRead 
                      ? 'bg-transparent border-transparent hover:bg-gray-50/50' 
                      : 'bg-white border-[#D4AF37]/20 shadow-[0_10px_30px_rgba(212,175,55,0.05)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)] hover:-translate-y-0.5 z-10'
                  } flex items-start gap-5`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0 transition-transform group-hover:scale-105 ${
                    n.isRead 
                      ? 'bg-gray-50 text-gray-400' 
                      : 'bg-gradient-to-br from-[#FAF8F5] to-white border border-[#D4AF37]/30 text-[#D4AF37]'
                  }`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
                      <h3 className={`font-bold text-sm md:text-base leading-tight ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</h3>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex-shrink-0">{formatDateShort(n.createdAt)}</span>
                    </div>
                    <p className={`text-xs md:text-sm leading-relaxed line-clamp-2 ${n.isRead ? 'text-gray-400 font-medium' : 'text-gray-600 font-medium italic'}`}>{n.message}</p>
                    {n.link && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-[#C2185B] uppercase tracking-[0.2em] group-hover:gap-2.5 transition-all">
                        View Details <FiArrowRight size={12} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-6 top-6 sm:static sm:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n._id);
                      }}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors shadow-sm bg-white border border-gray-100 sm:border-transparent sm:bg-transparent sm:shadow-none hover:border-red-100"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n._id);
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)] mt-2 mr-4 sm:mr-0 animate-pulse"
                        title="Mark as read"
                      />
                    )}
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}
