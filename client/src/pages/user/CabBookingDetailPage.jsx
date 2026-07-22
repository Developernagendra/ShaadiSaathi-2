import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCabBookingById } from '../../store/slices/bookingSlice'
import { formatPrice, formatDate, formatDateShort, getStatusColor } from '../../utils/helpers'
import { FiPhone, FiMapPin, FiArrowLeft, FiUser, FiMail, FiGlobe, FiInstagram, FiFacebook, FiYoutube, FiMessageCircle } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';
import { motion } from 'framer-motion'
import { getSocket } from '../../utils/socket'
import toast from 'react-hot-toast'

export default function CabBookingDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentCabBooking: booking, loading, error } = useSelector(s => s.booking)
  const { user } = useSelector(s => s.auth)
  const [processing, setProcessing] = useState(false)
  const [liveLocation, setLiveLocation] = useState(null)
  const [tripStatus, setTripStatus] = useState(null)

  useEffect(() => { dispatch(fetchCabBookingById(id)) }, [dispatch, id])

  useEffect(() => {
    if (booking) {
      setTripStatus(booking.tripStatus)
      if (booking.currentLocation) {
        setLiveLocation(booking.currentLocation)
      }
      
      const socket = getSocket()
      if (socket) {
        socket.emit('join_trip', booking._id)
        
        socket.on('location_updated', (data) => {
          if (data.bookingId === booking._id) {
            setLiveLocation({ lat: data.lat, lng: data.lng, updatedAt: data.updatedAt })
          }
        })
        
        socket.on('trip_status_updated', (data) => {
          if (data.bookingId === booking._id) {
            setTripStatus(data.status)
            if (data.status === 'completed') toast.success('Trip Completed!')
            else toast(`Trip Status: ${data.status.replace('_', ' ')}`, { icon: '🚕' })
          }
        })
      }
      
      return () => {
        if (socket) {
          socket.emit('leave_trip', booking._id)
          socket.off('location_updated')
          socket.off('trip_status_updated')
        }
      }
    }
  }, [booking])

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin shadow-xl" />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Cab Details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-gray-50/50">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-premium border border-gray-100">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
           <h2 className="font-display text-2xl font-black text-gray-900 mb-2">Booking Not Found</h2>
           <p className="text-gray-500 font-medium italic mb-8">{error || "We couldn't retrieve the details for this reservation."}</p>
           <Link to="/bookings" className="btn-primary w-full py-4 rounded-2xl text-[10px] uppercase tracking-widest bg-gray-900 text-white inline-block">
             Back to Reservations
           </Link>
        </div>
      </div>
    )
  }

  const statusColor = getStatusColor(booking.status)

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/bookings" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl mb-8 transition-all shadow-sm hover:shadow-md font-bold text-sm">
          <FiArrowLeft /> Back to Reservations
        </Link>

        {/* ── Header Card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">{booking.serviceName || 'Baraat Cab Booking'}</p>
                <p className="font-mono font-black text-2xl md:text-3xl text-white tracking-widest bg-white/10 w-fit px-4 py-1.5 rounded-xl border border-white/20">{booking.bookingId}</p>
              </div>
              <div className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg ${statusColor}`}>
                {booking.status?.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Vendor & Contact */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-[#FFF8F0]/50 rounded-2xl border border-pink-50 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Service Provider</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-pink-100 text-2xl overflow-hidden shrink-0">
                      {booking.vendor?.images?.[0]?.url || booking.vendorProfileId?.images?.[0]?.url ? (
                        <img src={booking.vendor?.images?.[0]?.url || booking.vendorProfileId?.images?.[0]?.url} className="w-full h-full object-cover rounded-2xl" />
                      ) : '🚕'}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">{booking.vendor?.businessName || booking.vendorProfileId?.businessName || 'ShaadiSaathi Cabs'}</p>
                      <p className="text-sm font-bold text-gray-500">{booking.vendor?.location?.city || booking.vendorProfileId?.location?.city}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-pink-100/50 pt-4 space-y-2">
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
                      <a href={`mailto:${booking.vendor?.email || booking.vendorProfileId?.email}`} className="hover:underline text-gray-900 block truncate max-w-[150px]">{booking.vendor?.email || booking.vendorProfileId?.email || 'N/A'}</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Details</p>
                <div className="space-y-2">
                  <p className="font-black text-gray-900 flex items-center gap-2"><FiUser className="text-primary-500" /> {booking.contactName}</p>
                  <p className="text-sm font-bold text-gray-500 flex items-center gap-2"><FiPhone className="text-blue-500" /> {booking.contactPhone}</p>
                  {booking.email && <p className="text-sm font-bold text-gray-500 flex items-center gap-2"><FiMail className="text-green-500" /> {booking.email}</p>}
                </div>
              </div>
            </div>

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

            {/* Trip Details */}
            <div>
              <h3 className="font-display font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><FiMapPin /></span>
                Trip Itinerary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100 relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary-600 border border-gray-100">
                    <FiArrowLeft className="rotate-180" />
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City</p>
                  <p className="font-black text-gray-900 text-lg">{booking.pickupLocation?.city}</p>
                </div>

                <div className="md:text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pickup Location / Address</p>
                  <p className="font-black text-gray-900 text-lg">{booking.pickupLocation?.address}</p>
                </div>

                <div className="col-span-full pt-6 mt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold text-gray-900">{formatDate(booking.eventDate)}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Message</p>
                    <p className="font-bold text-gray-900">{booking.message || 'No additional message'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <h3 className="font-display font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600"><FaTruck /></span>
                Booked Vehicles
              </h3>
              <div className="space-y-4">
                {booking.vehicles?.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:border-gold-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-xl text-white">
                        {v.vehicleType === 'bus' ? '🚌' : v.vehicleType === 'luxury_car' ? '🏎️' : '🚗'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight">{(v.vehicleType || v.type || '').replace('_', ' ') || 'Vehicle'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-gray-900">{formatPrice(v.totalFare)}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incl. all taxes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE TRACKING UI */}
          {['en_route_pickup', 'arrived', 'in_progress'].includes(tripStatus) && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-emerald-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <h3 className="font-display font-black text-2xl text-white mb-8 flex items-center gap-3 relative z-10">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <FiMapPin className="animate-bounce" />
                </span>
                Live Trip Tracker
              </h3>
              
              <div className="flex flex-col gap-8 relative z-10">
                {/* Status Indicator */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Current Status</p>
                    <p className="text-xl font-black">{tripStatus.replace(/_/g, ' ').toUpperCase()}</p>
                  </div>
                  {liveLocation && (
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Last Updated</p>
                      <p className="text-sm font-bold text-gray-300">{new Date(liveLocation.updatedAt).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>

                {/* Animated Route Progress */}
                <div className="relative pt-8 pb-4 px-4">
                  <div className="absolute top-1/2 left-4 right-4 h-1 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: tripStatus === 'en_route_pickup' ? '25%' : 
                               tripStatus === 'arrived' ? '50%' : 
                               tripStatus === 'in_progress' ? '75%' : '100%' 
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  
                  <div className="flex justify-between relative z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${['en_route_pickup', 'arrived', 'in_progress'].includes(tripStatus) ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-white/20'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Dispatch</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${['arrived', 'in_progress'].includes(tripStatus) ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-white/20'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Arrived</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${tripStatus === 'in_progress' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-white/20'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">En Route</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/20" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Dest</span>
                    </div>
                  </div>
                </div>

                {liveLocation && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-center justify-between">
                     <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                       <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Live GPS streaming active
                     </p>
                     <div className="text-right">
                       <p className="text-[10px] text-emerald-400/50 uppercase font-mono tracking-widest">Lat: {liveLocation.lat.toFixed(4)}</p>
                       <p className="text-[10px] text-emerald-400/50 uppercase font-mono tracking-widest">Lng: {liveLocation.lng.toFixed(4)}</p>
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Summary Card */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px]" />
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-black text-2xl">Fare Breakdown</h3>
            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              booking.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {booking.status?.replace('_', ' ')}
            </div>
          </div>
          
          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-black uppercase tracking-widest text-primary-400">Total Price</span>
              <span className="text-4xl font-black">{formatPrice(booking.totalPrice || booking.amount)}</span>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-xs text-gray-300 leading-relaxed font-medium">
            No online payment required. Your booking request has been submitted. Cabs are managed directly offline with the vendor.
          </div>
        </div>

      </div>
    </div>
  )
}
