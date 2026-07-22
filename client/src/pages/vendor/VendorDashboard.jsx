import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket } from '../../utils/socket'
import { fetchVendorDashboard } from '../../store/slices/vendorSlice'
import { fetchVendorBookings } from '../../store/slices/bookingSlice'
import { fetchUnreadChatCount } from '../../store/slices/chatSlice'
import { formatPrice, formatDateShort, getStatusColor } from '../../utils/helpers'
import StarRating from '../../components/common/StarRating'
import { FiArrowRight, FiCalendar, FiDollarSign, FiEye, FiPlus, FiImage, FiTag, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';

export default function VendorDashboard() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const vendorIdFromQuery = searchParams.get('vendorId')
  const { user } = useSelector(s => s.auth)
  const { dashboard, myVendorProfile: vendor, dashboardLoading: loading } = useSelector(s => s.vendor)

  const getActiveSubscriptionPlan = () => {
    if (vendor?.subscription?.status === 'active') {
      return vendor.subscription.plan?.toLowerCase() || 'free';
    }
    return 'free';
  };
  const currentPlan = getActiveSubscriptionPlan();

  const fetchData = useCallback(() => {
    const targetVendorId = user?.role === 'admin' ? vendorIdFromQuery : null
    dispatch(fetchVendorDashboard(targetVendorId))
    dispatch(fetchUnreadChatCount())
  }, [dispatch, user?.role, vendorIdFromQuery])

  useEffect(() => {
    fetchData()

    const socket = getSocket()
    if (socket) {
      socket.on('booking_updated', fetchData)
      socket.on('new_booking', fetchData)
      socket.on('newBooking', fetchData)
    }

    return () => {
      if (socket) {
        socket.off('booking_updated', fetchData)
        socket.off('new_booking', fetchData)
        socket.off('newBooking', fetchData)
      }
    }
  }, [fetchData])

  const { unreadCount: chatUnread } = useSelector(s => s.chat)

  if (loading && !vendor) return (
    <div className="min-h-screen pt-12 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin shadow-xl" />
        <p className="text-gray-500 font-medium animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  )

  if (!vendor && !loading) return (
    <div className="min-h-screen pt-12 flex items-center justify-center">
      <div className="text-center max-w-md bg-white p-12 rounded-2xl shadow-xl border border-gray-100">
        <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">🏪</div>
        <h2 className="font-display text-2xl font-black text-gray-900 mb-3">Welcome to Business Dashboard</h2>
        <p className="text-gray-500 font-medium mb-8">Create your premium business profile to start showcasing your services to thousands of couples.</p>
        <Link to="/vendor/profile" className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-200 hover:-translate-y-1">Setup Business Profile</Link>
      </div>
    </div>
  )

  const stats = [
    { label: 'Total Bookings', value: dashboard?.stats?.totalBookings || 0, icon: <FiCalendar />, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50', link: '/vendor/bookings' },
    { label: 'Total Earnings', value: formatPrice(dashboard?.stats?.totalEarnings || 0), icon: <FiDollarSign />, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50', link: '/vendor/earnings' },
    { label: 'Profile Views', value: vendor?.views || 0, icon: <FiEye />, color: 'text-purple-600', bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50', link: '/vendor/profile' },
    { label: 'My Fleet', value: dashboard?.stats?.totalCabs || 0, icon: <FaTruck />, color: 'text-indigo-600', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50', link: '/vendor/manage-cabs' },
  ]

  const bookingStatsGrid = [
    { label: 'Pending', count: dashboard?.stats?.pendingBookings || 0, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50', icon: '⏳' },
    { label: 'Confirmed', count: dashboard?.stats?.confirmedBookings || 0, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50', icon: '✅' },
    { label: 'Completed', count: dashboard?.stats?.completedBookings || 0, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50', icon: '🎉' },
    { label: 'Cancelled', count: dashboard?.stats?.cancelledBookings || 0, color: 'text-red-600', bg: 'bg-gradient-to-br from-red-50 to-red-100/50', icon: '❌' },
  ]

  const calculateCompletion = (v) => {
    let score = 0
    if (v.businessName && v.category && v.description) score += 20
    if (v.location?.city && v.location?.address) score += 15
    if (v.images?.length >= 3) score += 20
    else if (v.images?.length > 0) score += 10
    if (v.packages?.length > 0) score += 15
    if (v.phone && v.email) score += 10
    if (v.verificationDocuments?.length > 0) score += 10
    if (v.bankDetails?.accountNumber && v.bankDetails?.ifscCode) score += 10
    return score
  }

  const allRecentBookings = [...(dashboard?.recentBookings || []), ...(dashboard?.recentCabBookings || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const completion = calculateCompletion(vendor)

  return (
    <div className="pb-24 animate-fade-in relative">
      <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-4">
        {/* Business Header */}
        <div className="bg-gray-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[3rem] p-6 sm:p-10 md:p-16 mb-8 md:mb-12 text-white relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 floral-pattern opacity-[0.03]" />
          <div className="absolute top-0 right-0 w-72 h-72 md:w-[600px] md:h-[600px] bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C2185B]/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border-2 border-white/20 p-1 flex items-center justify-center shadow-2xl flex-shrink-0 relative group">
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-800">
                {vendor?.images?.[0]?.url ? (
                  <img src={vendor?.images?.[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <span className="text-5xl font-display font-black text-[#D4AF37]">🏪</span>
                )}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="divider-luxe !justify-start mb-4 !gap-3">
                <div className="divider-line !bg-[#D4AF37]/40 !w-8" />
                <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em]">Business Category: {vendor.category?.name || 'Professional'}</span>
                <div className="divider-line !bg-[#D4AF37]/40 !w-8" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1.1] drop-shadow-lg">
                <span className="text-white/70 block text-2xl md:text-3xl font-medium tracking-normal mb-2">Namaste, 👋</span>
                {vendor.businessName}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 shadow-lg">
                  <StarRating rating={vendor?.rating?.average || 0} count={vendor?.rating?.count || 0} size="sm" />
                </div>
                {vendor?.approvalStatus === 'approved' && (
                  <div className={`px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-lg bg-green-500/20 border-green-500/30 text-green-400 flex items-center gap-1.5`}>
                    <FiCheckCircle size={14} /> Verified Partner
                  </div>
                )}
                {currentPlan === 'elite' && (
                  <div className="px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-lg bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37] flex items-center gap-1.5 shine-effect">
                    👑 Elite Partner
                  </div>
                )}
                {currentPlan === 'premium' && (
                  <div className="px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-lg bg-pink-500/20 border-pink-500/30 text-pink-400 flex items-center gap-1.5 shine-effect">
                    ⚡ Premium Partner
                  </div>
                )}
                {currentPlan === 'free' && (
                  <div className="px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-lg bg-gray-500/20 border-gray-500/30 text-gray-400 flex items-center gap-1.5">
                    ⭐ Free Tier
                  </div>
                )}
                {chatUnread > 0 && (
                  <div className="px-4 py-1.5 rounded-xl bg-pink-600 border border-white/20 font-black text-[10px] uppercase tracking-widest shadow-lg text-white animate-pulse">
                    {chatUnread} NEW MESSAGES
                  </div>
                )}
              </div>

              {/* Large CTA Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-3 mt-8">
                <Link to="/vendor/services" className="bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-xl shadow-[0_5px_15px_rgba(194,24,91,0.3)] hover:shadow-[0_8px_25px_rgba(194,24,91,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border border-pink-500/50 w-full sm:w-auto">
                  <FiPlus size={16} /> Add Service
                </Link>
                <Link to="/vendor/portfolio-builder" className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                  <FiImage size={16} /> Upload Portfolio
                </Link>
                <Link to="/vendor/packages" className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                  <FiTag size={16} /> Create Package
                </Link>
                <Link to="/vendor/offers" className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-xl shadow-[0_5px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                  <FiActivity size={16} /> Promote Business
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── ⭐ PREMIUM STATUS WIDGET ── */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F1E43] via-[#1E3A8A] to-[#0B1530] border border-white/10 p-6 sm:p-8 text-white shadow-[0_15px_45px_rgba(30,58,138,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
          <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#D4AF37]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${currentPlan === 'elite' ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/35 text-[#D4AF37] shine-effect' : currentPlan === 'premium' ? 'bg-pink-500/20 border border-pink-500/30 text-pink-400 shine-effect' : 'bg-gray-700/30 border border-gray-600/30 text-gray-400'
              }`}>
              {currentPlan === 'elite' ? '👑' : currentPlan === 'premium' ? '⚡' : '⭐'}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h4 className="font-display font-black text-xl tracking-wide uppercase">
                  {currentPlan === 'elite' ? 'Elite Partner Status' : currentPlan === 'premium' ? 'Premium Partner Status' : 'Free Tier Active'}
                </h4>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${currentPlan !== 'free' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                  {currentPlan !== 'free' ? 'Premium Active' : 'Limited Visibility'}
                </span>
              </div>

              <div className="text-white/60 text-xs sm:text-sm font-medium">
                {currentPlan !== 'free' && vendor?.subscription?.endDate ? (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2">
                    <span>📅 Plan renewal date:</span> <span className="text-white font-bold">{new Date(vendor.subscription.endDate).toLocaleDateString()}</span>
                    <span className="text-white/30">|</span>
                    <span>📈</span> <span className="text-[#D4AF37] font-black">{Math.max(0, Math.ceil((new Date(vendor.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} Days Remaining</span>
                  </div>
                ) : (
                  <span>Upgrade to Premium or Elite to lock in priority leads, top search rankings, and unlimited uploads.</span>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full sm:w-auto text-center sm:text-left">
            {currentPlan !== 'free' ? (
              <Link
                to="/vendor-subscription"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg hover:scale-102 hover:shadow-xl transition-all select-none shine-effect border border-[#D4AF37]/50"
              >
                Renew Plan
              </Link>
            ) : (
              <Link
                to="/vendor-subscription"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg hover:scale-102 hover:shadow-xl transition-all select-none shine-effect border border-pink-500/30"
              >
                🚀 Upgrade Plan Now
              </Link>
            )}
          </div>
        </div>

        {/* Pending Approval Notice */}
        {vendor?.approvalStatus === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start md:items-center gap-5">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⏳</div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-1">Profile Under Review</h3>
              <p className="text-amber-800 text-sm leading-relaxed">Your profile is currently being reviewed by our moderation team. This usually takes 24–48 hours. You'll receive an email notification once approved.</p>
            </div>
          </div>
        )}

        {/* Business Metrics & Profile Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 mb-12">
          {/* Metrics */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {stats.map((s, i) => (
              <Link key={s.label} to={s.link} className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white transition-all duration-500 group relative overflow-hidden flex flex-col justify-between hover:-translate-y-2">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-700" />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-white ${s.color} shadow-sm group-hover:rotate-12 transition-all border border-gray-100`}>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <div className="relative z-10">
                  <p className="font-display text-4xl font-black text-gray-900 tracking-tight mb-2">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{s.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-2xl md:rounded-[3rem] p-6 md:p-12 border border-pink-50 shadow-premium relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-50/20 rounded-bl-full" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none text-center sm:text-left">Profile Completion</h3>
                <span className="font-display text-3xl md:text-4xl font-black text-[#C2185B] bg-[#FFF8F0] px-6 py-2 rounded-2xl w-full sm:w-auto text-center">{completion}%</span>
              </div>
              <div className="w-full bg-pink-50 rounded-full h-3 mb-8 overflow-hidden border border-white">
                <div className="bg-gradient-to-r from-[#C2185B] via-[#D4AF37] to-[#C2185B] bg-[length:200%_auto] h-full rounded-full transition-all duration-[2s] animate-shimmer" style={{ width: `${completion}%` }} />
              </div>
              <p className="text-gray-400 text-sm md:text-base font-medium italic mb-6 md:mb-10 leading-relaxed">Ensure your profile details are complete to maintain your visibility on the platform.</p>
            </div>
            {completion < 100 ? (
              <Link to="/vendor/profile" className="bg-[#C2185B] text-white font-black text-[10px] uppercase tracking-[0.4em] py-5 text-center rounded-2xl shadow-xl hover:scale-105 transition-all">
                Complete Profile
              </Link>
            ) : (
              <div className="bg-[#FFF8F0] text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em] py-5 px-6 rounded-2xl text-center border-2 border-[#D4AF37]/20 italic">
                Profile Complete 🔱
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {bookingStatsGrid.map(s => (
            <div key={s.label} className="bg-white/60 backdrop-blur-xl rounded-2xl md:rounded-[2rem] p-4 md:p-8 border border-white shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 flex flex-col items-center justify-center text-center transition-all duration-500 group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:rotate-[10deg] transition-all border border-gray-100">{s.icon}</div>
              <p className="font-display text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">{s.count}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Fleet Inventory Summary for Cab Vendors */}
        {vendor?.vendorType === 'cab' && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] bg-[#D4AF37]/45 w-8" />
              <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Live Fleet Inventory Today</span>
              <div className="h-[2px] bg-[#D4AF37]/45 w-8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-all">
                  🟢
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Vehicles</p>
                  <p className="font-display text-4xl font-black text-gray-950">{dashboard?.stats?.availableVehicles ?? 0}</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-all">
                  ⏳
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Booked Vehicles</p>
                  <p className="font-display text-4xl font-black text-gray-950">{dashboard?.stats?.bookedVehicles ?? 0}</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-all">
                  🔴
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sold Out Vehicles</p>
                  <p className="font-display text-4xl font-black text-gray-950">{dashboard?.stats?.soldOutVehicles ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-premium border border-pink-50 p-6 md:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF8F0] rounded-bl-full opacity-40" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10 relative z-10">
              <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 tracking-tight">मेरी Recent Bookings</h2>
              <Link to="/vendor/bookings" className="text-[10px] font-black text-[#C2185B] uppercase tracking-[0.3em] flex items-center gap-3 hover:gap-5 transition-all italic">
                सभी Bookings देखें <FiArrowRight size={18} />
              </Link>
            </div>

            <div className="flex-1 relative z-10">
              {!allRecentBookings?.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#FFF8F0]/30 rounded-[2rem] border border-dashed border-pink-100 min-h-[300px]">
                  <span className="text-6xl mb-6">📅</span>
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-2 tracking-tight">No bookings yet</h3>
                  <p className="text-gray-400 font-medium italic">New bookings will appear here once customers book your services.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {allRecentBookings.map(b => (
                    <div key={b._id} className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 p-5 md:p-6 rounded-2xl md:rounded-[2rem] hover:bg-[#FFF8F0]/50 border border-transparent hover:border-pink-50 transition-all duration-500 group">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-display font-black text-[#C2185B] flex-shrink-0 relative overflow-hidden">
                          {(b.userId?.avatar?.url || b.user?.avatar?.url) ? (
                            <img src={b.userId?.avatar?.url || b.user?.avatar?.url} className="w-full h-full object-cover" />
                          ) : (b.userId?.name?.charAt(0) || b.user?.name?.charAt(0) || '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-2 italic truncate">#{b.bookingId || b._id.slice(-6)}</p>
                          <p className="font-display text-xl sm:text-2xl font-black text-gray-900 truncate group-hover:text-[#C2185B] transition-colors leading-none mb-2">{b.userId?.name || b.user?.name || 'Guest User'}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 italic">
                            <FiCalendar className="text-[#C2185B]" /> {formatDateShort(b.eventDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-pink-50">
                        <span className={`text-[8px] font-black px-4 py-1.5 rounded-lg uppercase tracking-[0.2em] italic ${getStatusColor(b.status)}`}>
                          {b.status?.replace('_', ' ') || 'Pending'}
                        </span>
                        <span className="font-display text-xl font-black text-gray-900 tracking-tighter">{formatPrice(b.amount || b.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-premium border border-pink-50 p-6 md:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-50/10 rounded-tl-full opacity-40" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10 relative z-10">
              <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 tracking-tight text-shadow-sm">Recent Reviews</h2>
              <Link to="/vendor/reviews" className="text-[10px] font-black text-[#C2185B] uppercase tracking-[0.3em] flex items-center gap-3 hover:gap-5 transition-all italic">
                View All <FiArrowRight size={18} />
              </Link>
            </div>

            <div className="flex-1 relative z-10">
              {!dashboard?.recentReviews?.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-pink-50/20 rounded-[2rem] border border-dashed border-pink-100 min-h-[300px]">
                  <span className="text-6xl mb-6">⭐</span>
                  <h3 className="font-display text-2xl font-black text-gray-900 mb-2 tracking-tight">Customer Feedback</h3>
                  <p className="text-gray-400 font-medium italic">Customer reviews will show up here once bookings are completed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dashboard.recentReviews.map(r => (
                    <div key={r._id} className="p-5 md:p-8 rounded-2xl md:rounded-[2rem] bg-[#FFF8F0]/50 border border-pink-50 hover:bg-white hover:shadow-premium transition-all duration-500">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl font-display font-black text-[#D4AF37] flex-shrink-0">
                          {r.user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-display text-xl font-black text-gray-900 tracking-tight leading-none">{r?.user?.name || 'User'}</p>
                            <StarRating rating={r?.rating || 0} showCount={false} size="sm" />
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed italic line-clamp-3 mb-4">"{r?.comment || 'No comment provided.'}"</p>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">{formatDateShort(r.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mt-12">
          {[
            { to: '/vendor/services', icon: '🛍️', label: 'My Services' },
            { to: '/vendor/gallery', icon: '📸', label: 'Photo Gallery' },
            { to: '/tools', icon: '🛠️', label: 'Wedding Tools' },
            { to: '/vendor/manage-cabs', icon: '🚗', label: 'Imperial Fleet' },
            { to: '/chat', icon: '💬', label: 'Messages' },
          ].map(({ to, icon, label }) => (
            <Link key={to} to={to} className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-10 border border-pink-50 shadow-premium hover:shadow-premium-hover transition-all duration-700 group flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF8F0] flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm">
                {icon}
              </div>
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] italic group-hover:text-[#C2185B] transition-colors">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
