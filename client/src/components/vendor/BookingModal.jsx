import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createBooking } from '../../store/slices/bookingSlice'
import { fetchPublicAvailability } from '../../store/slices/availabilitySlice'
import Modal from '../common/Modal'
import { formatPrice } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { FiCheck } from 'react-icons/fi';

export default function BookingModal({ isOpen, onClose, vendor, navigate }) {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { loading } = useSelector(s => s.booking)
  const { publicAvailability, loading: availLoading } = useSelector(s => s.availability || {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    packageIdx: 0,
    eventDate: '',
    eventTime: '',
    eventVenue: '',
    eventCity: vendor?.location?.city || '',
    guestCount: '',
    specialRequirements: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    selectedSlot: '',
    selectedSlotId: ''
  })

  useEffect(() => {
    if (isOpen && vendor?._id) {
      dispatch(fetchPublicAvailability({ vendorId: vendor._id }))
    }
  }, [isOpen, vendor?._id, dispatch])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleDateChange = (e) => {
    const date = e.target.value
    setForm(prev => ({ ...prev, eventDate: date, selectedSlot: '', selectedSlotId: '' }))
  }

  const handleSlotSelect = (slot) => {
    setForm(prev => ({
      ...prev,
      selectedSlotId: slot._id,
      selectedSlot: slot.name,
      eventTime: slot.startTime
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    if (user && user.role !== 'user') {
      return toast.error('Access denied. Only users can book services.')
    }

    if (form.eventDate) {
      const date = new Date(form.eventDate)
      const avail = publicAvailability?.find(a => {
        const d = new Date(a.date)
        return d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      })

      if (avail) {
        if (avail.isBlocked) return toast.error('This date is blocked by the vendor.')
        if (avail.status === 'booked') return toast.error('This date is fully booked.')
      }
    }

    const pkg = vendor.packages?.[form.packageIdx]
    const payload = {
      vendorId: vendor._id,
      packageSelected: pkg ? { name: pkg.name, price: pkg.price, features: pkg.features } : null,
      amount: pkg?.price || vendor.price || vendor.basePrice || 0,
      ...form,
    }

    const result = await dispatch(createBooking(payload))
    setIsSubmitting(false)
    if (!result.error) { 
      onClose(); 
      navigate(`/bookings/${result.payload.booking._id}`) 
    }
  }

  const selectedDayAvail = useMemo(() => {
    if (!form.eventDate || !publicAvailability) return null
    const formD = new Date(form.eventDate)
    return publicAvailability.find(a => {
      const d = new Date(a.date)
      return d.getFullYear() === formD.getFullYear() &&
        d.getMonth() === formD.getMonth() &&
        d.getDate() === formD.getDate()
    })
  }, [form.eventDate, publicAvailability])

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book ${vendor?.businessName}`} size="xl">
      <div className="max-h-[85vh] overflow-y-auto scrollbar-hide">
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8">
          <div className="flex items-center gap-4 bg-primary-50 rounded-3xl p-6 border border-primary-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              {vendor?.category?.icon || '💒'}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 leading-tight">Securing your date</h4>
              <p className="text-sm text-primary-600 font-medium">Complete the form below to send a booking request.</p>
            </div>
          </div>

          {vendor?.packages?.length > 0 && (
            <div>
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 block">Select Package</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendor.packages.map((pkg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, packageIdx: i }))}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${form.packageIdx === i ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100' : 'border-gray-100 hover:border-primary-300'}`}
                  >
                    {form.packageIdx === i && <FiCheck className="absolute top-3 right-3 text-primary-500" />}
                    <p className="font-bold text-gray-900 truncate pr-6">{pkg.name}</p>
                    <p className="text-primary-700 font-black text-lg mt-1">{formatPrice(pkg.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest block">Event Schedule</label>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 absolute left-4 top-2 z-10 uppercase tracking-widest">Select Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleDateChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className={`input-field pt-6 pb-2 font-bold ${selectedDayAvail?.isBlocked || selectedDayAvail?.status === 'booked' ? 'border-red-200 bg-red-50 text-red-700' : 'bg-gray-50'}`}
                  />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 absolute left-4 top-2 z-10 uppercase tracking-widest">Event Time</label>
                  <input type="time" name="eventTime" value={form.eventTime} onChange={handleChange} className="input-field pt-6 pb-2 font-bold bg-gray-50" disabled={!!form.selectedSlotId} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest block">Available Slots</label>
              {selectedDayAvail?.slots?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedDayAvail.slots.map((slot) => {
                    const isFull = slot.status === 'booked' || slot.bookedCount >= slot.maxBookings
                    return (
                      <button
                        key={slot._id}
                        type="button"
                        disabled={isFull}
                        onClick={() => handleSlotSelect(slot)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center ${form.selectedSlotId === slot._id
                            ? 'border-primary-500 bg-primary-600 text-white shadow-xl'
                            : isFull
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                              : 'border-gray-100 bg-white text-gray-600 hover:border-primary-200'
                          }`}
                      >
                        <span>{slot.name}</span>
                        <span className="opacity-60 text-[9px] mt-0.5">{slot.startTime}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs text-gray-400 font-medium">{form.eventDate ? 'No specific slots listed. Enter manual time.' : 'Select a date to view slots'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-gray-100">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest block">Personal Information</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 absolute left-4 top-2 uppercase">Full Name</label>
                <input name="contactName" value={form.contactName} onChange={handleChange} required className="input-field pt-6 pb-2 font-bold bg-gray-50" />
              </div>
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 absolute left-4 top-2 uppercase">Phone Number</label>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} required className="input-field pt-6 pb-2 font-bold bg-gray-50" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading || !(vendor.packages?.[form.packageIdx]?.price || vendor.price || vendor.basePrice)}
            className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black shadow-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (vendor.packages?.[form.packageIdx]?.price || vendor.price || vendor.basePrice) ? 'Confirm Booking' : 'Price unavailable'}
          </button>

</form>
      </div>
    </Modal>
  )
}
