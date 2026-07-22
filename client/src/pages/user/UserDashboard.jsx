import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket } from '../../utils/socket'
import { fetchUserDashboard } from '../../store/slices/bookingSlice'
import { fetchUnreadChatCount } from '../../store/slices/chatSlice'
import { resendVerification } from '../../store/slices/authSlice'
import { formatPrice, formatDateShort, getStatusColor, getInitials } from '../../utils/helpers'
import { FiCalendar, FiHeart, FiMessageCircle, FiBell, FiArrowRight, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion'
import Badge from '../../components/common/Badge'

export default function UserDashboard() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const userIdFromQuery = searchParams.get('userId')
  const { user } = useSelector(s => s.auth)
  const { bookings, cabBookings, userDashboard } = useSelector(s => s.booking)
  const { unreadCount } = useSelector(s => s.notifications)

  const fetchData = useCallback(() => {
    const targetUserId = user?.role === 'admin' ? userIdFromQuery : null
    dispatch(fetchUserDashboard(targetUserId))
    dispatch(fetchUnreadChatCount())
  }, [dispatch, user?.role, userIdFromQuery])

  useEffect(() => {
    fetchData()

    const socket = getSocket()
    if (socket) {
      socket.on('booking_updated', fetchData)
      socket.on('new_booking', fetchData)
      socket.on('bookingUpdated', fetchData)
    }

    return () => {
      if (socket) {
        socket.off('booking_updated', fetchData)
        socket.off('new_booking', fetchData)
        socket.off('bookingUpdated', fetchData)
      }
    }
  }, [fetchData])

  const { unreadCount: chatUnread } = useSelector(s => s.chat)

  const stats = [
    { icon: <FiCalendar />, label: 'Total Bookings', value: userDashboard?.stats?.totalBookings || 0, link: '/bookings', color: 'blue' },
    { icon: <FiHeart />, label: 'Wishlist', value: user?.wishlist?.length || 0, link: '/wishlist', color: 'pink' },
    { icon: <FiMessageCircle />, label: 'Messages', value: chatUnread || 0, link: '/chat', color: 'green' },
    { icon: <FiBell />, label: 'Notifications', value: unreadCount || 0, link: '/notifications', color: 'orange' },
  ]

  const colorMap = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100/50 text-pink-600',
    green: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-600',
  }

  const allRecentBookings = [...(bookings || []), ...(cabBookings || [])]
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
    .slice(0, 4);

  return (
    <div className="pb-24 animate-fade-in relative">
      <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-4">
        {/* User Dashboard Header */}
        <div className="bg-gradient-to-br from-[#C2185B] via-[#8E244D] to-gray-900 rounded-2xl md:rounded-[3rem] p-6 sm:p-10 md:p-16 mb-8 md:mb-12 text-white relative overflow-hidden shadow-premium">
          <div className="absolute inset-0 floral-pattern opacity-[0.05]" />
          <div className="absolute top-0 right-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 p-1 flex items-center justify-center shadow-2xl flex-shrink-0 relative group">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800">
                {user?.avatar?.url ? (
                  <img src={user?.avatar?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <span className="text-4xl font-display font-black text-[#D4AF37]">{getInitials(user?.name || 'User')}</span>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-white shadow-lg border-4 border-[#8E244D]">
                <FiUser size={16} />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="divider-luxe !justify-start mb-6 !gap-3">
                <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
                <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">मेरी शादी Dashboard</span>
                <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none">
                Namaste, <span className="text-[#D4AF37]">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mt-2">
                <p className="text-white/80 font-medium text-sm md:text-base">आपकी शादी की सारी planning, एक ही जगह ❤️</p>
              </div>

              {user?.weddingDate && (
                <div className="mt-6 md:mt-8 inline-flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl shadow-xl max-w-full">
                  <span className="text-xl md:text-2xl">💍</span>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Wedding Date</p>
                    <p className="text-white font-display font-black text-base md:text-lg tracking-tight">
                      {formatDateShort(user?.weddingDate)} <span className="text-white/40 font-normal">in</span> {user?.weddingCity || 'your city'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wedding Journey Indicator */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-premium mb-8 md:mb-12 border border-pink-50 overflow-hidden relative">
          <div className="absolute inset-0 floral-pattern opacity-[0.03]" />
          <h3 className="font-display text-xl md:text-2xl font-black text-gray-900 mb-6 text-center md:text-left tracking-tight relative z-10">
            Your Wedding Journey
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative z-10">
            {['Planning Started', 'Vendors Selected', 'Bookings Confirmed', 'Wedding Day 🎉'].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 relative w-full md:w-auto">
                {idx < 3 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-[2px] bg-gray-100"><div className="h-full bg-[#C2185B] w-[50%]" /></div>}
                <div className="w-12 h-12 rounded-full bg-[#C2185B] text-white flex items-center justify-center font-black shadow-lg relative z-10 mb-3 border-4 border-white">
                  {idx + 1}
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-gray-600 text-center">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <Link key={s.label} to={s.link} className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-premium hover:shadow-premium-hover border border-pink-50 transition-all duration-500 group relative overflow-hidden flex flex-col">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-pink-50 rounded-full opacity-30 group-hover:scale-150 transition-transform duration-700" />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-[#FFF8F0] text-[#C2185B] shadow-sm group-hover:rotate-6 transition-all`}>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className="font-display text-5xl font-black text-gray-900 tracking-tighter mb-2">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] italic">{s.label === 'Wishlist' ? 'Saved Vendors' : s.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-[3rem] shadow-premium border border-pink-50 p-6 md:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF8F0] rounded-bl-full opacity-40" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10 relative z-10">
              <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 tracking-tight">मेरी Upcoming Bookings</h2>
              <Link to="/bookings" className="text-[10px] font-black text-[#C2185B] uppercase tracking-[0.3em] flex items-center gap-3 hover:gap-5 transition-all italic">
                सभी Bookings देखें <FiArrowRight size={18} />
              </Link>
            </div>

            <div className="flex-1 relative z-10">
              {allRecentBookings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#FFF8F0]/30 rounded-[2rem] border border-dashed border-pink-100 min-h-[350px]">
                  <span className="text-6xl mb-6">📅</span>
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-2 tracking-tight">अभी तक कोई service book नहीं की है.</h3>
                  <p className="text-gray-400 font-medium italic mb-8 max-w-xs">Browse our trusted vendors to start planning your perfect wedding.</p>
                  <Link to="/services" className="bg-[#C2185B] text-white font-black text-[10px] uppercase tracking-[0.4em] py-5 px-12 rounded-2xl shadow-xl hover:scale-105 transition-all">Wedding Services खोजें →</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {allRecentBookings.map(b => (
                    <Link key={b._id} to={b.vehicles ? `/cab-booking/${b._id}` : `/bookings/${b._id}`} className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl hover:bg-[#FFF8F0]/50 border border-transparent hover:border-pink-50 transition-all duration-500 group">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 shadow-sm flex-shrink-0 overflow-hidden relative flex items-center justify-center text-3xl">
                          {b.vehicles ? '🚕' : (b.vendor?.images?.[0]?.url ? (
                            <img src={b.vendor?.images?.[0]?.url} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                          ) : '🏛️')}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-2 italic">{b?.vehicles ? 'Baraat Cab' : (b?.vendor?.category?.name || 'Vendor')}</p>
                          <p className="font-display text-xl sm:text-2xl font-black text-gray-900 truncate group-hover:text-[#C2185B] transition-colors leading-none mb-3">{b?.vendor?.businessName || (b?.vehicles ? `${b?.vehicles?.length || 0} Vehicle(s)` : 'Wedding Service')}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 italic">
                            <FiCalendar className="text-[#C2185B]" /> {formatDateShort(b?.eventDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-pink-50">
                        <span className={`text-[8px] font-black px-4 py-1.5 rounded-lg uppercase tracking-[0.2em] italic ${getStatusColor(b.status)}`}>
                          {b.status?.replace('_', ' ') || 'Pending'}
                        </span>
                        <span className="font-display text-2xl font-black text-gray-900 tracking-tighter">{formatPrice(b.amount || b.totalAmount)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-10">

            {/* Quick Actions List */}
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-premium border border-pink-50 p-6 md:p-10 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-50/20 rounded-tl-full" />
              <h3 className="font-display text-2xl font-black text-gray-900 mb-6 md:mb-8 tracking-tight relative z-10">Quick Actions</h3>
              <div className="space-y-4 relative z-10">
                {[
                  { to: '/services', icon: '🔍', label: 'Browse Vendors', color: '#C2185B' },
                  { to: '/baraat-cabs', icon: '🚗', label: 'Imperial Fleet', color: '#8E244D' },
                  { to: '/tools', icon: '🛠️', label: 'Wedding Tools', color: '#ec4899' },
                  { to: '/astrology-reports', icon: '✨', label: 'My Astrology', color: '#6366f1' },
                  { to: '/wishlist', icon: '❤️', label: 'मेरे पसंदीदा Vendors', color: '#D4AF37' },
                  { to: '/profile', icon: '👤', label: 'My Profile', color: '#10b981' },
                  { to: '/chat', icon: '💬', label: 'My Messages', color: '#10b981' },
                ].map(({ to, icon, label, color }) => (
                  <Link key={to} to={to} className="flex items-center gap-6 p-5 rounded-[1.5rem] hover:bg-[#FFF8F0] border border-transparent hover:border-pink-50 transition-all duration-500 group">
                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                      {icon}
                    </span>
                    <span className="font-black text-gray-900 group-hover:text-[#C2185B] transition-colors text-[10px] uppercase tracking-[0.2em] italic">{label}</span>
                    <FiArrowRight size={18} className="ml-auto text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            INVITATION STUDIO PREMIUM CARD
            ========================================= */}
        <div className="mt-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 md:p-10 shadow-premium border border-pink-50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-50 to-transparent rounded-full blur-[40px] pointer-events-none" />

            <div className="flex-1 relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#FFF8F0] px-4 py-1.5 rounded-full mb-4 border border-[#D4AF37]/30 shadow-sm">
                <span className="text-lg">💌</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C2185B]">Wedding Invitation Studio</span>
              </div>
              <p className="text-gray-500 font-medium text-lg mb-6 max-w-lg mx-auto md:mx-0">
                Create beautiful wedding invitations and share them instantly with your guests.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Link to="/invitation-creator/new" className="w-full sm:w-auto bg-gray-900 text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  ✨ Create Invitation
                </Link>
                <Link to="/invitation-creator" className="w-full sm:w-auto bg-gray-100 text-gray-700 font-bold text-sm py-4 px-8 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  📂 My Invitations
                </Link>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col flex-wrap gap-4 relative z-10 justify-center">
              <div className="bg-gray-50 rounded-xl p-4 text-center min-w-[120px] flex-1">
                <p className="font-display text-3xl font-black text-gray-900">{userDashboard?.stats?.invitationsCreated || 0}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Invitations</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center min-w-[120px] flex-1">
                <p className="font-display text-3xl font-black text-gray-900">{userDashboard?.stats?.invitationViews || 0}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Views</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center min-w-[120px] flex-1">
                <p className="font-display text-3xl font-black text-emerald-600">{userDashboard?.stats?.rsvpReceived || 0}</p>
                <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">RSVP Responses</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
