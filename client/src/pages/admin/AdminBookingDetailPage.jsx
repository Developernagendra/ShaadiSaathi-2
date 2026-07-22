import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminBookingById, updateBookingStatus, updateCabBookingStatus } from '../../store/slices/bookingSlice'
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'
import { FiArrowLeft, FiUser, FiBriefcase, FiGrid, FiMapPin, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiGlobe, FiInstagram, FiFacebook, FiYoutube, FiMessageCircle, FiMail } from 'react-icons/fi';
import { toast } from 'react-hot-toast'

export default function AdminBookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentBooking, loading, error } = useSelector((s) => s.booking)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    dispatch(fetchAdminBookingById(id))
  }, [dispatch, id])

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      const isCab = currentBooking?.bookingType === 'cab' || currentBooking?.bookingType === 'baraat-cab'
      if (isCab) {
        await dispatch(updateCabBookingStatus({ id, status: newStatus })).unwrap()
      } else {
        await dispatch(updateBookingStatus({ id, status: newStatus })).unwrap()
      }
      toast.success(`Booking status updated to ${newStatus}`)
      dispatch(fetchAdminBookingById(id))
    } catch (err) {
      toast.error(err || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading && !currentBooking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#C2185B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !currentBooking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-inner">
          <FiAlertCircle />
        </div>
        <h3 className="font-display font-black text-2xl text-gray-900 mb-3">Reservation Not Found</h3>
        <p className="text-gray-400 text-sm font-medium italic mb-8 text-center max-w-md">
          {error || 'The requested booking could not be located in the database.'}
        </p>
        <button onClick={() => navigate('/admin/bookings')} className="btn-primary py-4 px-8 text-xs flex items-center gap-2">
          <FiArrowLeft size={16} /> Back to Reservations
        </button>
      </div>
    )
  }

  const b = currentBooking

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/bookings')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold uppercase tracking-widest text-[10px] mb-8 transition-colors"
        >
          <FiArrowLeft size={14} /> Back to Bookings List
        </button>

        {/* Header Block */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-premium border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C2185B]">
              Reservation Overview
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mt-2">
              Order <span className="text-primary-600">{b.bookingId}</span>
            </h1>
            <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">
              Created on {formatDate(b.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 relative z-10">
            <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl ${getStatusColor(b.status)}`}>
              {b.status}
            </span>
            <p className="font-display font-black text-3xl text-gray-900 tracking-tight">
              {formatPrice(b.amount || b.totalPrice)}
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Info Blocks */}
          <div className="lg:col-span-2 space-y-8">

            {/* Section 1: Customer Details */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="font-display text-lg font-black text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FiUser size={18} /></span>
                Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Name</p>
                  <p className="font-bold text-gray-800">{b.contactName || b.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Phone</p>
                  <p className="font-bold text-gray-800">{b.contactPhone || b.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Email</p>
                  <p className="font-bold text-gray-800">{b.contactEmail || b.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Vendor Details */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="font-display text-lg font-black text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><FiBriefcase size={18} /></span>
                Vendor Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Business Name</p>
                  <p className="font-bold text-gray-800">{b.vendor?.businessName || b.vendorProfileId?.businessName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Vendor Phone</p>
                  <p className="font-bold text-gray-800">{b.vendorProfileId?.phone || b.vendor?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Vendor Email</p>
                  <p className="font-bold text-gray-800">{b.vendorProfileId?.email || b.vendor?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Section 2.5: Vendor Digital Presence */}
            {(b.vendorProfileId?.socialLinks || b.vendorProfileId?.website) && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h3 className="font-display text-lg font-black text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-50 pb-4">
                  <span className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center"><FiGlobe size={18} /></span>
                  Vendor Digital Presence
                </h3>
                <div className="flex flex-wrap gap-4">
                  {(b.vendorProfileId?.socialLinks?.website || b.vendorProfileId?.website) && (
                    <a href={b.vendorProfileId?.socialLinks?.website || b.vendorProfileId?.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-gray-700 font-bold text-sm shadow-sm hover:shadow-md">
                      <FiGlobe className="text-gray-500" size={18} /> Website
                    </a>
                  )}
                  {b.vendorProfileId?.socialLinks?.instagram && (
                    <a href={b.vendorProfileId.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-pink-700 font-bold text-sm shadow-sm hover:shadow-md">
                      <FiInstagram className="text-pink-500" size={18} /> Instagram
                    </a>
                  )}
                  {b.vendorProfileId?.socialLinks?.facebook && (
                    <a href={b.vendorProfileId.socialLinks.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-blue-700 font-bold text-sm shadow-sm hover:shadow-md">
                      <FiFacebook className="text-blue-500" size={18} /> Facebook
                    </a>
                  )}
                  {b.vendorProfileId?.socialLinks?.youtube && (
                    <a href={b.vendorProfileId.socialLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-red-700 font-bold text-sm shadow-sm hover:shadow-md">
                      <FiYoutube className="text-red-500" size={18} /> YouTube
                    </a>
                  )}
                  {(b.vendor?.phone || b.vendorProfileId?.phone) && (
                    <a href={`https://wa.me/${(b.vendor?.phone || b.vendorProfileId?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-green-700 font-bold text-sm shadow-sm hover:shadow-md">
                      <FiMessageCircle className="text-green-500" size={18} /> WhatsApp
                    </a>
                  )}
                  {(b.vendor?.email || b.vendorProfileId?.email) && (
                    <a href={`mailto:${b.vendor?.email || b.vendorProfileId?.email}`} className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-gray-700 font-bold text-sm shadow-sm hover:shadow-md">
                      <FiMail className="text-gray-500" size={18} /> Email Contact
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Booking Item Details */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="font-display text-lg font-black text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><FiGrid size={18} /></span>
                Service details
              </h3>

              {b.bookingType === 'cab' || b.bookingType === 'baraat-cab' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Category</p>
                      <p className="font-bold text-primary-600">Baraat Cab Fleet</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Service Type</p>
                      <p className="font-bold text-gray-800">Premium Fleet Booking</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Fare Tier</p>
                      <p className="font-bold text-gray-800">Dynamic pricing</p>
                    </div>
                  </div>

                  {(b.fleetSelection?.length > 0 || b.vehicles?.length > 0) && (
                    <div className="mt-6 border-t border-gray-50 pt-6">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Booked Fleet Vehicles</p>
                      <div className="space-y-3">
                        {(b.fleetSelection || b.vehicles).map((v, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{v.name || v.vehicleType || 'Fleet Vehicle'}</p>
                              <p className="text-xs text-gray-400">
                                Count: {v.count} {v.pricePerVehicle > 0 ? `x ${formatPrice(v.pricePerVehicle)}` : ''}
                              </p>
                            </div>
                            <span className="font-display font-black text-gray-900 text-sm">{v.totalFare > 0 ? formatPrice(v.totalFare) : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Service Name</p>
                      <p className="font-bold text-gray-800">{b.serviceName || b.service?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Category</p>
                      <p className="font-bold text-primary-600 uppercase text-xs tracking-wider">{b.serviceCategory || 'Wedding Service'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Base Price</p>
                      <p className="font-bold text-gray-800">{formatPrice(b.packageSelected?.price || b.amount)}</p>
                    </div>
                  </div>

                  {b.packageSelected && (
                    <div className="bg-[#FFFBF2] border border-[#FBE3B5]/50 rounded-2xl p-6">
                      <h4 className="font-bold text-[#A87F18] text-xs uppercase tracking-wider mb-3">Selected Package: {b.packageSelected.name}</h4>
                      {b.packageSelected.features && b.packageSelected.features.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-gray-600 font-medium">
                          {b.packageSelected.features.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-green-500">✔</span> {f}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No explicit package features specified.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Event Details */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="font-display text-lg font-black text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><FiCalendar size={18} /></span>
                Event & Venue details
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Date</p>
                    <p className="font-bold text-gray-800 flex items-center gap-1.5"><FiCalendar className="text-gray-400" /> {formatDate(b.eventDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Time / Slot</p>
                    <p className="font-bold text-gray-800 flex items-center gap-1.5"><FiClock className="text-gray-400" /> {b.eventTime || b.selectedSlot || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">City</p>
                    <p className="font-bold text-gray-800 flex items-center gap-1.5"><FiMapPin className="text-gray-400" /> {b.eventCity || b.pickupLocation?.city || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-t border-gray-50 pt-6">
                  <div>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Venue / Pickup Location</p>
                    <p className="font-bold text-gray-800 leading-relaxed">
                      {b.eventVenue || (b.pickupLocation ? `${b.pickupLocation.address}, ${b.pickupLocation.city}, ${b.pickupLocation.state} - ${b.pickupLocation.pincode}` : 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Guests Count</p>
                    <p className="font-bold text-gray-800">{b.guestCount || 'N/A'}</p>
                  </div>
                </div>

                {b.specialRequirements && (
                  <div className="border-t border-gray-50 pt-6">
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1.5">Special Instructions / Notes</p>
                    <p className="text-gray-600 text-xs italic leading-relaxed p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      "{b.specialRequirements}"
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Action & Status Box (Sidebar) */}
          <div className="space-y-6">

            {/* Section 5: Booking Status & Action Controls */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-display text-base font-black text-gray-900 pb-4 border-b border-gray-50">
                Reservation Control
              </h3>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Current Status</p>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl ${getStatusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Admin Actions</p>

                {b.status !== 'confirmed' && b.status !== 'completed' && (
                  <button
                    disabled={updating}
                    onClick={() => handleStatusChange('confirmed')}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
                  >
                    <FiCheckCircle size={14} /> Confirm Reservation
                  </button>
                )}

                {b.status !== 'rejected' && b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button
                    disabled={updating}
                    onClick={() => handleStatusChange('rejected')}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100 disabled:opacity-50"
                  >
                    <FiXCircle size={14} /> Reject Reservation
                  </button>
                )}

                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button
                    disabled={updating}
                    onClick={() => handleStatusChange('cancelled')}
                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FiXCircle size={14} /> Cancel Reservation
                  </button>
                )}

                {b.status === 'confirmed' && (
                  <button
                    disabled={updating}
                    onClick={() => handleStatusChange('completed')}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    <FiCheckCircle size={14} /> Mark As Completed
                  </button>
                )}
              </div>
            </div>

            {/* Additional Safety Protection Info */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white text-center border border-white/5 relative overflow-hidden shadow-premium">
              <div className="absolute inset-0 floral-pattern opacity-[0.03]" />
              <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-4 text-2xl">🛡️</div>
              <h4 className="font-display text-lg font-black mb-2 tracking-tight">Escrow Safeguard</h4>
              <p className="text-gray-400 text-xs font-semibold leading-relaxed">
                As administrative control, updates status immediately. System automated notifications will trigger live alerts to customer and vendor.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
