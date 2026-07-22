import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBookingById } from '../../store/slices/bookingSlice'
import { formatPrice, formatDate, formatDateShort, getStatusColor } from '../../utils/helpers'
import { FiMapPin, FiCalendar, FiArrowLeft, FiClock, FiCheck, FiInfo, FiCreditCard, FiGlobe, FiInstagram, FiFacebook, FiYoutube, FiMessageCircle, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function BookingDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentBooking: booking, loading, error } = useSelector(s => s.booking)
  const { user } = useSelector(s => s.auth)

  useEffect(() => { dispatch(fetchBookingById(id)) }, [dispatch, id])

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin shadow-xl" />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-gray-50/50">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-premium border border-gray-100">
           <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🔍</div>
           <h2 className="font-display text-2xl font-black text-gray-900 mb-2">Reservation Not Found</h2>
           <p className="text-gray-500 font-medium italic mb-8">{error || "We couldn't retrieve the details for this reservation."}</p>
           <Link to="/bookings" className="btn-primary w-full py-4 rounded-2xl text-[10px] uppercase tracking-widest bg-gray-900 text-white inline-block">
             Back to Reservations
           </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/bookings" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl mb-8 transition-all shadow-sm hover:shadow-md font-bold text-sm">
          <FiArrowLeft /> Back to Reservations
        </Link>

        {/* ── Header Card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Reservation ID</p>
                <p className="font-mono font-black text-2xl md:text-3xl text-white tracking-widest bg-white/10 w-fit px-4 py-1.5 rounded-xl border border-white/20">{booking.bookingId}</p>
              </div>
              <div className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg ${
                booking.status === 'confirmed' ? 'bg-green-500 text-white shadow-green-500/30' : 
                booking.status === 'pending' ? 'bg-amber-500 text-white shadow-amber-500/30' : 
                booking.status === 'cancelled' ? 'bg-red-500 text-white shadow-red-500/30' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status?.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Vendor Profile */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-white flex-shrink-0 shadow-sm border border-gray-100">
                  {(booking.vendor?.images?.[0]?.url || booking.vendorProfileId?.images?.[0]?.url)
                    ? <img src={booking.vendor?.images?.[0]?.url || booking.vendorProfileId?.images?.[0]?.url} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🏛️</div>}
                </div>
                <div>
                  <p className="font-display font-black text-2xl text-gray-900 mb-1">{booking.vendor?.businessName || booking.vendorProfileId?.businessName}</p>
                  <p className="text-[#C2185B] font-extrabold text-sm uppercase tracking-wider mb-2">
                    {booking.serviceName || booking.service?.title || booking.service?.name || booking.serviceCategory || (booking.bookingType === 'baraat-cab' ? 'Baraat Cab' : 'Wedding Service')}
                  </p>
                  {(booking.vendor?.location?.city || booking.vendorProfileId?.location?.city) && (
                    <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5"><FiMapPin className="text-primary-500" />{booking.vendor?.location?.city || booking.vendorProfileId?.location?.city}</p>
                  )}
                </div>
              </div>
              
              <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 space-y-2 shrink-0 min-w-[200px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C2185B]">📞 Vendor Contact Details</p>
                <div className="space-y-1 text-xs font-bold text-gray-700">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400 w-16">Phone:</span> 
                    <a href={`tel:${booking.vendor?.phone || booking.vendorProfileId?.phone}`} className="hover:underline text-gray-900">{booking.vendor?.phone || booking.vendorProfileId?.phone || 'N/A'}</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400 w-16">WhatsApp:</span>
                    <a href={`https://wa.me/${(booking.vendor?.phone || booking.vendorProfileId?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline text-green-600">{(booking.vendor?.phone || booking.vendorProfileId?.phone) || 'N/A'}</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400 w-16">Email:</span>
                    <a href={`mailto:${booking.vendor?.email || booking.vendorProfileId?.email}`} className="hover:underline text-gray-900 max-w-[120px] truncate block">{booking.vendor?.email || booking.vendorProfileId?.email || 'N/A'}</a>
                  </p>
                </div>
              </div>
            </div>

            {(user?.role === 'vendor' || user?.role === 'admin') && (
              <div className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.2rem] bg-white flex items-center justify-center text-3xl shadow-sm border border-blue-200">
                    👤
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C2185B] mb-0.5">👤 Customer Contact Details</p>
                    <p className="font-display font-black text-xl text-gray-900">{booking.contactName || booking.userId?.name || booking.user?.name || 'Wedding Client'}</p>
                    <p className="text-xs text-gray-500 font-bold tracking-wide mt-1">Client account holder details registered for offline contact</p>
                  </div>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l border-blue-200 pt-4 md:pt-0 md:pl-6 space-y-2 shrink-0 min-w-[240px]">
                  <div className="space-y-1 text-xs font-bold text-gray-700">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400 w-16">Phone:</span> 
                      <a href={`tel:${booking.contactPhone || booking.userId?.phone || booking.user?.phone}`} className="hover:underline text-gray-900">{booking.contactPhone || booking.userId?.phone || booking.user?.phone || 'N/A'}</a>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400 w-16">Email:</span>
                      <a href={`mailto:${booking.contactEmail || booking.userId?.email || booking.user?.email}`} className="hover:underline text-gray-900 truncate max-w-[160px] block">{booking.contactEmail || booking.userId?.email || booking.user?.email || 'N/A'}</a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Presence / Social Links */}
            {(booking.vendorProfileId?.socialLinks || booking.vendorProfileId?.website) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-display font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600"><FiGlobe /></span>
                  Vendor Digital Presence
                </h3>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 font-medium mb-6 text-sm">You have exclusive access to these details since you have an active booking with this vendor.</p>
                  <div className="flex flex-wrap gap-4">
                    {(booking.vendorProfileId?.socialLinks?.website || booking.vendorProfileId?.website) && (
                      <a href={booking.vendorProfileId?.socialLinks?.website || booking.vendorProfileId?.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-gray-700 font-bold text-sm shadow-sm hover:shadow-md">
                        <FiGlobe className="text-gray-500" size={18} /> Website
                      </a>
                    )}
                    {booking.vendorProfileId?.socialLinks?.instagram && (
                      <a href={booking.vendorProfileId.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-pink-700 font-bold text-sm shadow-sm hover:shadow-md">
                        <FiInstagram className="text-pink-500" size={18} /> Instagram
                      </a>
                    )}
                    {booking.vendorProfileId?.socialLinks?.facebook && (
                      <a href={booking.vendorProfileId.socialLinks.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-blue-700 font-bold text-sm shadow-sm hover:shadow-md">
                        <FiFacebook className="text-blue-500" size={18} /> Facebook
                      </a>
                    )}
                    {booking.vendorProfileId?.socialLinks?.youtube && (
                      <a href={booking.vendorProfileId.socialLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-red-700 font-bold text-sm shadow-sm hover:shadow-md">
                        <FiYoutube className="text-red-500" size={18} /> YouTube
                      </a>
                    )}
                    {(booking.vendor?.phone || booking.vendorProfileId?.phone) && (
                      <a href={`https://wa.me/${(booking.vendor?.phone || booking.vendorProfileId?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-green-700 font-bold text-sm shadow-sm hover:shadow-md">
                        <FiMessageCircle className="text-green-500" size={18} /> WhatsApp
                      </a>
                    )}
                    {(booking.vendor?.email || booking.vendorProfileId?.email) && (
                      <a href={`mailto:${booking.vendor?.email || booking.vendorProfileId?.email}`} className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-gray-700 font-bold text-sm shadow-sm hover:shadow-md">
                        <FiMail className="text-gray-500" size={18} /> Email Contact
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Event Logistics */}
            <div>
              <h3 className="font-display font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><FiCalendar /></span>
                Event Logistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Event Date', value: formatDate(booking.eventDate) },
                  { label: 'Event City', value: booking.eventCity || '—' },
                  { label: 'Venue Location', value: booking.eventVenue || '—' },
                  { label: 'Guest Count', value: booking.guestCount || '—' },
                  { label: 'Contact Name', value: booking.contactName },
                  { label: 'Contact Phone', value: booking.contactPhone },
                  { label: 'Contact Email', value: booking.contactEmail || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Package details */}
            {booking.packageSelected && (
              <div>
                <h3 className="font-display font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600"><FiCheck /></span>
                  Selected Package
                </h3>
                <div className="border-2 border-gold-100 bg-gold-50/30 rounded-2xl p-8">
                  <p className="font-black text-xl text-gray-900 mb-4">{booking.packageSelected.name}</p>
                  {booking.packageSelected.features?.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {booking.packageSelected.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white px-4 py-3 rounded-xl border border-gold-100/50 shadow-sm">
                          <FiCheck className="text-gold-500 mt-0.5 flex-shrink-0" />
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pricing Summary Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="font-display font-black text-2xl mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm"><FiCreditCard /></span>
              Pricing details
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Price</span>
                <span className="text-3xl font-black">{formatPrice(booking.totalPrice || booking.amount)}</span>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 mb-6 backdrop-blur-sm border border-white/10 flex flex-col gap-2">
              <span className="text-sm font-bold uppercase tracking-widest text-gray-300">Booking Status</span>
              <span className={`w-fit px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                booking.status === 'confirmed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 
                booking.status === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 
                'bg-red-500 text-white shadow-lg shadow-red-500/20'
              }`}>
                {booking.status?.replace('_', ' ')}
              </span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-300 leading-relaxed font-medium">
              No online payment required. Your booking is managed offline directly with the vendor.
            </div>
          </motion.div>

          {/* Timeline & Notes */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
            
            {booking.timeline?.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="font-display font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500"><FiClock /></span>
                  Timeline
                </h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {booking.timeline.map((t, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-100 text-primary-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <FiCheck size={14} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-gray-900 capitalize text-sm">{t.status?.replace('_', ' ')}</p>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{formatDateShort(t.updatedAt)}</p>
                        {t.note && <p className="text-sm font-medium text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-100/50 mt-2">{t.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.specialRequirements && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="font-display font-black text-xl text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><FiInfo /></span>
                  Special Requirements
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100/50">{booking.specialRequirements}</p>
              </div>
            )}
            
          </motion.div>
        </div>

      </div>
    </div>
  )
}
