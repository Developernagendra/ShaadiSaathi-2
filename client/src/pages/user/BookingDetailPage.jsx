import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBookingById, clearCurrentBooking } from '../../store/slices/bookingSlice'
import { formatPrice, formatDate, formatDateShort, getStatusColor } from '../../utils/helpers'
import {
  FiMapPin, FiCalendar, FiArrowLeft, FiClock, FiCheck, FiInfo,
  FiCreditCard, FiGlobe, FiInstagram, FiFacebook, FiYoutube,
  FiMessageCircle, FiMail, FiPhone, FiRefreshCw, FiAlertTriangle, FiLock, FiX
} from 'react-icons/fi'
import { motion } from 'framer-motion'

// ─────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────
function BookingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 animate-pulse">
      <div className="max-w-4xl mx-auto px-4">
        <div className="w-40 h-9 bg-gray-200 rounded-xl mb-8" />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gray-900/80 p-8 md:p-10 h-32 w-full" />
          <div className="p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-gray-200 rounded-xl w-3/4" />
                <div className="h-4 bg-gray-100 rounded-xl w-1/2" />
                <div className="h-4 bg-gray-100 rounded-xl w-1/3" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-20 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-64 rounded-3xl" />
          <div className="bg-gray-100 h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Error State — with proper differentiation
// ─────────────────────────────────────────────
function BookingErrorState({ error, onRetry }) {
  const errorMsg = typeof error === 'string' ? error : error?.message || ''
  const errorStatus = typeof error === 'object' ? error?.status : null

  let icon = '🔍'
  let title = 'Reservation Not Found'
  let description = "We couldn't retrieve the details for this reservation."
  let showRetry = false
  let is403 = false

  if (errorStatus === 403 || errorMsg?.toLowerCase().includes('not authorized') || errorMsg?.toLowerCase().includes('access denied')) {
    icon = '🔒'
    title = 'Access Denied'
    description = "You don't have permission to view this booking. This reservation belongs to another account."
    is403 = true
  } else if (errorStatus === 404 || errorMsg?.toLowerCase().includes('not found')) {
    icon = '🔍'
    title = 'Booking Not Found'
    description = "This booking ID doesn't exist or may have been removed."
  } else if (errorStatus >= 500 || errorMsg?.toLowerCase().includes('server') || errorMsg?.toLowerCase().includes('try again')) {
    icon = '⚡'
    title = 'Server Error'
    description = 'Unable to load booking details right now. Please try again in a moment.'
    showRetry = true
  } else if (errorMsg) {
    description = errorMsg
    showRetry = true
  }

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-gray-50/50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-premium border border-gray-100">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 ${
          is403 ? 'bg-red-50 text-red-500' : showRetry ? 'bg-orange-50 text-orange-500' : 'bg-amber-50 text-amber-500'
        }`}>
          {icon}
        </div>
        <h2 className="font-display text-2xl font-black text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-500 font-medium italic mb-8 leading-relaxed text-sm">{description}</p>

        <div className="flex flex-col gap-3">
          {showRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-[#C2185B] text-white hover:bg-[#a8154f] transition-all shadow-lg shadow-[#C2185B]/30"
            >
              <FiRefreshCw size={14} /> Retry
            </button>
          )}
          <Link
            to="/bookings"
            className="w-full py-4 rounded-2xl text-[10px] uppercase tracking-widest bg-gray-900 text-white font-black inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            <FiArrowLeft size={12} /> Back to Reservations
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { color: 'bg-amber-500', label: 'Pending Confirmation', step: 1 },
  accepted:   { color: 'bg-blue-500',  label: 'Vendor Accepted',      step: 2 },
  confirmed:  { color: 'bg-green-500', label: 'Confirmed',            step: 3 },
  in_progress:{ color: 'bg-indigo-500',label: 'In Progress',          step: 4 },
  completed:  { color: 'bg-emerald-600',label: 'Completed',           step: 5 },
  cancelled:  { color: 'bg-red-500',   label: 'Cancelled',            step: 0 },
  rejected:   { color: 'bg-red-600',   label: 'Rejected',             step: 0 },
}

const TIMELINE_STEPS = [
  { key: 'pending',     label: 'Booking Created' },
  { key: 'accepted',    label: 'Vendor Accepted' },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
]

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function BookingDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentBooking: booking, loading, error } = useSelector(s => s.booking)
  const { user } = useSelector(s => s.auth)

  // Fetch on mount; clear stale data on unmount to avoid flash of old booking
  useEffect(() => {
    dispatch(clearCurrentBooking())
    dispatch(fetchBookingById(id))
    return () => { dispatch(clearCurrentBooking()) }
  }, [dispatch, id])

  const handleRetry = () => {
    dispatch(clearCurrentBooking())
    dispatch(fetchBookingById(id))
  }

  // Show skeleton while fetching
  if (loading || (!booking && !error)) {
    return <BookingDetailSkeleton />
  }

  // Show proper error screen — NEVER redirect to /
  if (error || !booking) {
    return <BookingErrorState error={error} onRetry={handleRetry} />
  }

  // ── Helpers ──
  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
  const currentStep = statusCfg.step
  const isCancelled = ['cancelled', 'rejected'].includes(booking.status)

  const vendorName = booking.vendor?.businessName || booking.vendorProfileId?.businessName || 'Vendor'
  const vendorPhone = booking.vendor?.phone || booking.vendorProfileId?.phone || ''
  const vendorEmail = booking.vendor?.email || booking.vendorProfileId?.email || ''
  const vendorCity = booking.vendor?.location?.city || booking.vendorProfileId?.location?.city || ''
  const vendorImage = booking.vendor?.images?.[0]?.url || booking.vendorProfileId?.images?.[0]?.url

  const isUser = user?.role === 'user'
  const isVendor = user?.role === 'vendor'
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">

        {/* ── Back Navigation ── */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl mb-8 transition-all shadow-sm hover:shadow-md font-bold text-sm"
        >
          <FiArrowLeft /> Back to Reservations
        </Link>

        {/* ── Header Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          {/* Dark header with booking ID */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C2185B]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Reservation ID</p>
                <p className="font-mono font-black text-xl md:text-2xl text-white tracking-widest bg-white/10 w-fit px-4 py-1.5 rounded-xl border border-white/20">
                  {booking.bookingId}
                </p>
                <p className="text-gray-400 font-medium text-xs mt-3 italic">
                  Created: {formatDateShort(booking.createdAt)}
                </p>
              </div>
              <div className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg ${statusCfg.color} text-white`}>
                {statusCfg.label}
              </div>
            </div>
          </div>

          {/* ── Status Timeline ── */}
          {!isCancelled && (
            <div className="px-8 md:px-10 py-6 border-b border-gray-100 bg-gray-50/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Booking Progress</p>
              <div className="flex items-center gap-0">
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone = currentStep > step.step || booking.status === step.key
                  const isCurrent = booking.status === step.key
                  const stepNum = i + 1
                  return (
                    <div key={step.key} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
                          isDone ? 'bg-[#C2185B] text-white shadow-lg shadow-[#C2185B]/30 scale-110' :
                          isCurrent ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {isDone ? <FiCheck size={14} /> : stepNum}
                        </div>
                        <p className={`text-[8px] font-black uppercase tracking-wider mt-2 text-center leading-tight max-w-[60px] ${
                          isDone || isCurrent ? 'text-gray-700' : 'text-gray-300'
                        }`}>{step.label}</p>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                          currentStep > stepNum ? 'bg-[#C2185B]' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {isCancelled && (
            <div className="px-8 md:px-10 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <FiX className="text-red-500 flex-shrink-0" />
              <p className="text-sm font-bold text-red-600">
                This booking was {booking.status}. {booking.timeline?.[booking.timeline.length - 1]?.note || ''}
              </p>
            </div>
          )}

          <div className="p-8 md:p-10 space-y-10">

            {/* ── Vendor Profile ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-white flex-shrink-0 shadow-sm border border-gray-100">
                  {vendorImage
                    ? <img src={vendorImage} alt={vendorName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🏛️</div>
                  }
                </div>
                <div>
                  <p className="font-display font-black text-2xl text-gray-900 mb-1">{vendorName}</p>
                  <p className="text-[#C2185B] font-extrabold text-sm uppercase tracking-wider mb-2">
                    {booking.serviceName || booking.service?.title || booking.service?.name || booking.serviceCategory || (booking.bookingType === 'baraat-cab' ? 'Baraat Cab' : 'Wedding Service')}
                  </p>
                  {vendorCity && (
                    <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                      <FiMapPin className="text-[#C2185B]" />{vendorCity}
                    </p>
                  )}
                </div>
              </div>

              {/* Vendor Contact — for all roles */}
              <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 space-y-2 shrink-0 min-w-[200px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C2185B]">📞 Vendor Contact</p>
                <div className="space-y-1 text-xs font-bold text-gray-700">
                  {vendorPhone && (
                    <p className="flex items-center gap-2">
                      <FiPhone size={12} className="text-gray-400" />
                      <a href={`tel:${vendorPhone}`} className="hover:underline text-gray-900">{vendorPhone}</a>
                    </p>
                  )}
                  {vendorPhone && (
                    <p className="flex items-center gap-2">
                      <FiMessageCircle size={12} className="text-green-500" />
                      <a
                        href={`https://wa.me/${vendorPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank" rel="noreferrer"
                        className="hover:underline text-green-700"
                      >
                        WhatsApp
                      </a>
                    </p>
                  )}
                  {vendorEmail && (
                    <p className="flex items-center gap-2">
                      <FiMail size={12} className="text-gray-400" />
                      <a href={`mailto:${vendorEmail}`} className="hover:underline text-gray-900 truncate max-w-[160px] block">{vendorEmail}</a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Customer Contact — Vendor & Admin only ── */}
            {(isVendor || isAdmin) && (
              <div className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.2rem] bg-white flex items-center justify-center text-3xl shadow-sm border border-blue-200">👤</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C2185B] mb-0.5">👤 Customer Details</p>
                    <p className="font-display font-black text-xl text-gray-900">
                      {booking.contactName || booking.userId?.name || booking.user?.name || 'Wedding Client'}
                    </p>
                    <p className="text-xs text-gray-500 font-bold tracking-wide mt-1">Registered client details</p>
                  </div>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-blue-200 pt-4 md:pt-0 md:pl-6 space-y-2 shrink-0 min-w-[240px]">
                  <div className="space-y-1 text-xs font-bold text-gray-700">
                    <p className="flex items-center gap-2">
                      <FiPhone size={12} className="text-gray-400" />
                      <a href={`tel:${booking.contactPhone || booking.userId?.phone || booking.user?.phone}`} className="hover:underline text-gray-900">
                        {booking.contactPhone || booking.userId?.phone || booking.user?.phone || 'N/A'}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiMail size={12} className="text-gray-400" />
                      <a href={`mailto:${booking.contactEmail || booking.userId?.email || booking.user?.email}`} className="hover:underline text-gray-900 truncate max-w-[200px] block">
                        {booking.contactEmail || booking.userId?.email || booking.user?.email || 'N/A'}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Vendor Digital Presence ── */}
            {(booking.vendorProfileId?.socialLinks || booking.vendorProfileId?.website) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-display font-black text-xl text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600"><FiGlobe /></span>
                  Vendor Digital Presence
                </h3>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex flex-wrap gap-3">
                    {(booking.vendorProfileId?.socialLinks?.website || booking.vendorProfileId?.website) && (
                      <a href={booking.vendorProfileId?.socialLinks?.website || booking.vendorProfileId?.website} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 text-gray-700 font-bold text-sm shadow-sm">
                        <FiGlobe size={15} /> Website
                      </a>
                    )}
                    {booking.vendorProfileId?.socialLinks?.instagram && (
                      <a href={booking.vendorProfileId.socialLinks.instagram} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 text-pink-700 font-bold text-sm shadow-sm">
                        <FiInstagram size={15} /> Instagram
                      </a>
                    )}
                    {booking.vendorProfileId?.socialLinks?.facebook && (
                      <a href={booking.vendorProfileId.socialLinks.facebook} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 text-blue-700 font-bold text-sm shadow-sm">
                        <FiFacebook size={15} /> Facebook
                      </a>
                    )}
                    {booking.vendorProfileId?.socialLinks?.youtube && (
                      <a href={booking.vendorProfileId.socialLinks.youtube} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 text-red-700 font-bold text-sm shadow-sm">
                        <FiYoutube size={15} /> YouTube
                      </a>
                    )}
                    {vendorPhone && (
                      <a href={`https://wa.me/${vendorPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 text-green-700 font-bold text-sm shadow-sm">
                        <FiMessageCircle size={15} /> WhatsApp
                      </a>
                    )}
                    {vendorEmail && (
                      <a href={`mailto:${vendorEmail}`}
                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 text-gray-700 font-bold text-sm shadow-sm">
                        <FiMail size={15} /> Email
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Event Logistics ── */}
            <div>
              <h3 className="font-display font-black text-xl text-gray-900 mb-5 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#C2185B]"><FiCalendar /></span>
                Event Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Event Date', value: formatDate(booking.eventDate) },
                  { label: 'Event Time', value: booking.eventTime || 'Full Day' },
                  { label: 'Event City', value: booking.eventCity || '—' },
                  { label: 'Venue', value: booking.eventVenue || '—' },
                  { label: 'Guest Count', value: booking.guestCount ? `${booking.guestCount} guests` : '—' },
                  { label: 'Contact Name', value: booking.contactName || '—' },
                  { label: 'Contact Phone', value: booking.contactPhone || '—' },
                  { label: 'Contact Email', value: booking.contactEmail || '—' },
                ].filter(i => i.value && i.value !== '—').map(({ label, value }) => (
                  <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="font-bold text-gray-900 text-sm leading-snug break-words">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Package Details ── */}
            {booking.packageSelected && (
              <div>
                <h3 className="font-display font-black text-xl text-gray-900 mb-5 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#FFF8F0] flex items-center justify-center text-[#D4AF37]"><FiCheck /></span>
                  Selected Package
                </h3>
                <div className="border-2 border-[#D4AF37]/20 bg-[#FFF8F0]/30 rounded-2xl p-8">
                  <p className="font-black text-xl text-gray-900 mb-4">{booking.packageSelected.name}</p>
                  {booking.packageSelected.features?.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {booking.packageSelected.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white px-4 py-3 rounded-xl border border-[#D4AF37]/10 shadow-sm">
                          <FiCheck className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-700">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </motion.div>

        {/* ── Bottom Grid: Pricing + Timeline/Notes ── */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2185B]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="font-display font-black text-2xl mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm"><FiCreditCard /></span>
              Pricing Summary
            </h3>

            <div className="space-y-3 mb-8">
              {booking.amount && (
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400 font-bold text-sm">Booking Amount</span>
                  <span className="font-black text-lg">{formatPrice(booking.amount)}</span>
                </div>
              )}
              {booking.totalPrice && booking.totalPrice !== booking.amount && (
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400 font-bold text-sm">Total Price</span>
                  <span className="font-black text-lg">{formatPrice(booking.totalPrice)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-300 font-black uppercase tracking-widest text-xs">Total Due</span>
                <span className="text-3xl font-black text-white">{formatPrice(booking.totalPrice || booking.amount || 0)}</span>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 mb-5 backdrop-blur-sm border border-white/10 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Booking Status</span>
              <span className={`w-fit px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${statusCfg.color} text-white shadow-lg`}>
                {statusCfg.label}
              </span>
            </div>

            {/* Payment Reference */}
            {booking.paymentId && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Payment Reference</p>
                <p className="font-mono text-sm font-bold text-white/80">{booking.paymentId}</p>
              </div>
            )}

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-400 leading-relaxed font-medium">
              Payment is managed offline directly with the vendor. Contact them to confirm payment details.
            </div>

            {/* User Actions */}
            {isUser && (
              <div className="mt-6 space-y-3">
                {vendorPhone && (
                  <a
                    href={`https://wa.me/${vendorPhone.replace(/[^0-9]/g, '')}?text=Hi, I have a booking with you (ID: ${booking.bookingId}). I'd like to discuss details.`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/30"
                  >
                    <FiMessageCircle size={14} /> WhatsApp Vendor
                  </a>
                )}
                {vendorPhone && (
                  <a
                    href={`tel:${vendorPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/20"
                  >
                    <FiPhone size={14} /> Call Vendor
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Timeline + Special Requirements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Status Timeline from backend */}
            {booking.timeline?.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="font-display font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500"><FiClock /></span>
                  Activity Timeline
                </h3>
                <div className="space-y-4">
                  {[...booking.timeline].reverse().map((t, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        STATUS_CONFIG[t.status]?.color || 'bg-gray-400'
                      } text-white shadow-sm`}>
                        <FiCheck size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 capitalize text-sm">{t.status?.replace('_', ' ')}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDateShort(t.updatedAt)}</p>
                        {t.note && (
                          <p className="text-sm font-medium text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 mt-2">{t.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requirements */}
            {booking.specialRequirements && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="font-display font-black text-xl text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><FiInfo /></span>
                  Special Requirements
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                  {booking.specialRequirements}
                </p>
              </div>
            )}

            {/* Vendor Actions Panel */}
            {(isVendor || isAdmin) && ['pending', 'accepted', 'confirmed', 'in_progress'].includes(booking.status) && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="font-display font-black text-xl text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#FFF8F0] flex items-center justify-center text-[#D4AF37]"><FiAlertTriangle size={16} /></span>
                  Manage Booking
                </h3>
                <div className="space-y-3">
                  {booking.contactPhone && (
                    <a
                      href={`https://wa.me/${booking.contactPhone.replace(/[^0-9]/g, '')}?text=Hi ${booking.contactName || ''}, regarding your booking ${booking.bookingId}:`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/30"
                    >
                      <FiMessageCircle size={14} /> WhatsApp Customer
                    </a>
                  )}
                  {booking.contactPhone && (
                    <a
                      href={`tel:${booking.contactPhone}`}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <FiPhone size={14} /> Call Customer
                    </a>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </div>

      </div>
    </div>
  )
}
