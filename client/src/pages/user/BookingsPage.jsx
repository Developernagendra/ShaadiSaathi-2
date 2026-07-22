import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyBookings, fetchMyCabBookings, cancelBooking, updateLocalBooking } from '../../store/slices/bookingSlice'
import { formatPrice, formatDateShort, getStatusColor } from '../../utils/helpers'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import { FiCalendar, FiMapPin, FiX, FiArrowRight, FiInfo } from 'react-icons/fi';

import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '../../utils/socket'

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }
]

export default function BookingsPage() {
  const dispatch = useDispatch()
  const socket = getSocket()
  const { bookings, cabBookings, loading, counts } = useSelector(s => s.booking)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialType = searchParams.get('type') || 'services'
  const [activeTab, setActiveTab] = useState('all')
  const [bookingType, setBookingType] = useState(initialType)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const pollTimer = useRef(null)

  const fetchData = () => {
    const params = { status: activeTab === 'all' ? undefined : activeTab };
    if (bookingType === 'services') {
      dispatch(fetchMyBookings(params))
    } else {
      dispatch(fetchMyCabBookings(params))
    }
  }

  useEffect(() => {
    fetchData()
    // Polling as fallback for real-time
    pollTimer.current = setInterval(fetchData, 30000)
    return () => clearInterval(pollTimer.current)
  }, [dispatch, activeTab, bookingType])

  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = (data) => {
      const booking = data?.booking || data;
      if (booking) {
        dispatch(updateLocalBooking(booking))
        fetchData()
      }
    };

    socket.on('booking_updated', handleUpdate);
    socket.on('bookingUpdated', handleUpdate);

    return () => {
      socket.off('booking_updated', handleUpdate);
      socket.off('bookingUpdated', handleUpdate);
    }
  }, [socket, dispatch, activeTab])

  const handleCancel = async () => {
    if (!cancelModal) return
    await dispatch(cancelBooking({ id: cancelModal, reason: cancelReason }))
    setCancelModal(null)
    setCancelReason('')
    fetchData()
  }

  const handleTypeChange = (type) => {
    setBookingType(type)
    setSearchParams({ type })
  }

  const currentList = bookingType === 'services' ? bookings : cabBookings

  return (
    <div className="pb-24 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4">

        {/* ── Header Section ── */}
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#C2185B] rounded-[2.5rem] p-8 md:p-14 mb-10 text-white relative overflow-hidden shadow-premium">
          <div className="absolute inset-0 floral-pattern opacity-[0.05]" />
          <div className="absolute top-0 right-0 w-72 h-72 md:w-[400px] md:h-[400px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 bg-[#D4AF37] rounded-full" />
                <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Manage Reservations</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">My <span className="text-[#D4AF37]">Bookings</span></h1>
            </div>

            <div className="flex bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 shadow-2xl">
              {[
                { id: 'services', label: 'Services', icon: '✨' },
                { id: 'baraat-cab', label: 'Baraat Cabs', icon: '🚗' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${bookingType === type.id ? 'bg-white text-gray-900 shadow-xl scale-105' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="text-sm">{type.icon}</span> {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Enhanced Filter Tabs ── */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-12 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 flex items-center gap-3 group border ${activeTab === tab.id
                ? 'bg-gray-900 text-white border-gray-900 shadow-premium-hover scale-105'
                : 'bg-white text-gray-400 border-gray-100 hover:border-[#C2185B] hover:text-[#C2185B]'
                }`}
            >
              {tab.label}
              <span className={`px-2.5 py-1 rounded-lg text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-[#C2185B]/10 group-hover:text-[#C2185B]'}`}>
                {counts?.[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* ── Bookings List ── */}
        {loading ? (
          <div className="grid gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-gray-50 animate-shimmer" />
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] border border-dashed border-pink-100 p-20 shadow-premium text-center">
            <EmptyState
              icon={bookingType === 'baraat-cab' ? '🚗' : '📅'}
              title="No Reservations Found"
              message={`We couldn't find any ${activeTab === 'all' ? '' : activeTab} ${bookingType} records in your account.`}
              actionLabel={bookingType === 'baraat-cab' ? 'Book a Wedding Cab' : 'Find Wedding Vendors'}
              actionTo={bookingType === 'baraat-cab' ? '/baraat-cabs' : '/services'}
            />
          </motion.div>
        ) : (
          <div className="grid gap-8">
            <AnimatePresence mode="popLayout">
              {currentList.map((b, i) => (
                <motion.div
                  key={b._id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="bg-white rounded-[2.5rem] shadow-premium border border-gray-50 p-8 flex flex-col lg:flex-row lg:items-center gap-10 group relative overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                >
                  {/* Status Indicator Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${getStatusColor(b.status).split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`} />

                  <Link
                    to={bookingType === 'baraat-cab' ? `/cab-booking/${b._id}` : `/bookings/${b._id}`}
                    className="flex-1 flex flex-col lg:flex-row lg:items-center gap-10 min-w-0"
                  >
                    {/* Visual ID */}
                    <div className="w-24 h-24 rounded-3xl bg-[#FFF8F0] flex-shrink-0 overflow-hidden shadow-inner border border-pink-50 flex items-center justify-center text-4xl group-hover:rotate-3 transition-transform">
                      {bookingType === 'baraat-cab' ? '🚕' : (b.vendor?.images?.[0]?.url ? <img src={b.vendor?.images?.[0]?.url} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" /> : '💒')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-display font-black text-2xl text-gray-900 group-hover:text-[#C2185B] transition-colors tracking-tight truncate">
                            {bookingType === 'baraat-cab' ? `${b.vehicles?.length || 1} Vehicle(s) Reservation` : (b.vendor?.businessName || 'Wedding Service')}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {b.bookingId}</span>
                            <div className="h-1 w-1 rounded-full bg-gray-200" />
                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest italic">
                              {b.serviceName || b.service?.title || b.service?.name || b.serviceCategory || (bookingType === 'baraat-cab' ? 'Baraat Cab' : 'Wedding Service')}
                            </span>
                          </div>
                        </div>
                        <div className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border ${getStatusColor(b.status)}`}>
                          {b.status?.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><FiCalendar /></div>
                          <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Event Date</p>
                            <p className="text-xs font-bold text-gray-700">{formatDateShort(b.eventDate)}</p>
                            <p className="text-[10px] text-gray-400 font-medium italic">{b.eventTime || 'Full Day'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><FiMapPin /></div>
                          <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                            <p className="text-xs font-bold text-gray-700 truncate">{b.eventCity || b.pickupLocation?.city || b.vendor?.location?.city || 'Darbhanga, BR'}</p>
                            <p className="text-[10px] text-gray-400 font-medium italic">{bookingType === 'baraat-cab' ? 'Pickup Scheduled' : 'Venue Provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#C2185B] shadow-sm font-bold text-xs">₹</div>
                          <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-xl font-black text-gray-900 leading-none">{formatPrice(b.amount || b.totalAmount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Actions Area */}
                  <div className="flex flex-row lg:flex-col gap-3 lg:w-44 flex-shrink-0 z-10">
                    <Link to={bookingType === 'baraat-cab' ? `/cab-booking/${b._id}` : `/bookings/${b._id}`} className="flex-1 bg-gray-900 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#C2185B] transition-all shadow-xl shadow-gray-200">
                      Details <FiArrowRight />
                    </Link>
                    {['pending', 'confirmed'].includes(b.status) && (
                      <button onClick={() => setCancelModal(b._id)} className="flex-1 border border-red-100 text-red-500 rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all italic">
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking" size="md">
        <div className="p-10 text-center">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner rotate-3"><FiX /></div>
          <h3 className="font-display font-black text-3xl text-gray-900 mb-3 tracking-tight">Cancel Reservation?</h3>
          <p className="text-gray-400 mb-10 text-sm font-medium italic leading-relaxed">This action will notify the vendor and release the booked slots. This cannot be undone once confirmed.</p>
          <div className="bg-amber-50 p-4 rounded-2xl mb-8 flex items-start gap-4 text-left border border-amber-100">
            <FiInfo className="text-amber-500 mt-1 shrink-0" />
            <p className="text-xs font-medium text-amber-800 italic leading-relaxed">Cancellation policy: The vendor will be immediately notified of your cancel request.</p>
          </div>
          <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={4} className="w-full bg-gray-50 border-2 border-transparent focus:border-red-200 focus:bg-white rounded-2xl px-6 py-5 text-sm focus:outline-none transition-all mb-8 shadow-sm" />
          <div className="flex gap-4">
            <button onClick={() => setCancelModal(null)} className="flex-1 font-black text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-gray-600 transition-colors">Back</button>
            <button onClick={handleCancel} disabled={!cancelReason.trim()} className="flex-2 btn-primary !bg-red-600 !py-5 !px-10 !text-[10px] !rounded-2xl shadow-xl shadow-red-100 disabled:opacity-50">Confirm Cancellation</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
