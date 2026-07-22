import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FiCheck, FiMapPin, FiCalendar, FiClock, FiUsers, FiArrowRight, FiArrowLeft, FiZap, FiUser, FiPhone, FiShield } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { formatPrice } from '../utils/helpers'
import api from '../utils/api'
import { toast } from 'react-hot-toast'
import LoadingScreen from '../components/common/LoadingScreen'
import { getMe, resendVerification } from '../store/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'

export default function CabBookingPage() {
  const { id } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const cabId = id || searchParams.get('cabId')
  const packageId = searchParams.get('packageId')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector(s => s.auth)

  const [cab, setCab] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Fleet Builder State
  const stateData = location.state || {}
  const isFleetBuilder = stateData.bookingType === 'baraat-fleet'
  const fleetSelection = stateData.fleetSelection || []

  const [form, setForm] = useState({
    city: stateData.city || searchParams.get('city') || '',
    pickupLocation: searchParams.get('pickup') || '',
    dropLocation: searchParams.get('drop') || '',
    guestCount: stateData.guestCount || searchParams.get('guests') || '',
    eventDate: stateData.eventDate || searchParams.get('date') || '',
    eventTime: searchParams.get('time') || '',
    contactName: searchParams.get('name') || user?.name || '',
    contactPhone: searchParams.get('phone') || user?.phone || '',
    message: ''
  })

  useEffect(() => {
    if (user && user.role !== 'user') {
      toast.error('Only users can book cabs')
      navigate('/baraat-cabs')
      return
    }

    if (!cabId && !isFleetBuilder) {
      // No cab data available — immediately stop loading so fallback UI renders
      setLoading(false)
      return;
    }

    const fetchData = async () => {
      try {
        if (isFleetBuilder) {
          // Data is already passed in location.state
          setLoading(false)
        } else if (cabId) {
          const { data } = await api.get(`/cab-booking/details/${cabId}`)
          setCab(data.cab)
          setForm(f => ({
            ...f,
            city: f.city || data.cab.location?.city || '',
            guestCount: f.guestCount || String(data.cab.seatingCapacity || '')
          }))
          if (packageId && data.cab.packages) {
            const pkg = data.cab.packages.find(p => p._id === packageId)
            if (pkg) setSelectedPackage(pkg)
          }
          setLoading(false)
        }
      } catch (err) {
        toast.error('Failed to load details')
        navigate('/baraat-cabs')
      }
    }
    fetchData()
  }, [cabId, isFleetBuilder, packageId, navigate, user])

  const baseFare = isFleetBuilder ? stateData.totalAmount : (selectedPackage ? selectedPackage.price : (cab?.pricing?.baseFare || 0));
  const subtotal = baseFare;
  const gst = subtotal * 0.05;
  const totalAmount = subtotal + gst;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!user) {
      toast.error('Please login to book a cab')
      navigate('/login', { state: { from: location } })
      return
    }

    // Validation
    if (!form.city?.trim()) { toast.error('Please enter the city'); return; }
    if (!form.pickupLocation?.trim()) { toast.error('Please enter the pickup location'); return; }
    if (!form.dropLocation?.trim()) { toast.error('Please enter the drop location'); return; }
    if (!form.guestCount || Number(form.guestCount) <= 0) { toast.error('Please enter a valid guest count'); return; }
    if (!form.eventDate) { toast.error('Please select the event date'); return; }
    if (!form.contactName?.trim()) { toast.error('Please enter your contact name'); return; }
    if (!form.contactPhone?.trim()) { toast.error('Please enter a valid contact phone number'); return; }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        guestCount: Number(form.guestCount) || 1,
        specialRequests: form.message,
        subtotal,
        gst,
        totalAmount
      }

      if (isFleetBuilder) {
        payload.fleetSelection = fleetSelection
        payload.packageType = 'custom_fleet'
      } else {
        payload.cabId = cabId
        payload.packageId = selectedPackage?._id || null
        payload.packageType = selectedPackage ? 'package' : 'custom'
      }

      const { data } = await api.post('/cab-booking', payload)

      setSuccess(true)
      setCreatedBookingId(data.booking?._id || data.bookingId)
      toast.success('Booking request sent successfully!')
    } catch (err) {
      console.error('Booking submission error:', err);
      toast.error(err.message || err.response?.data?.message || 'Failed to submit booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen />

  if (!cabId && !isFleetBuilder) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative">
        <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl border border-red-50">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            <FiZap />
          </div>
          <h2 className="font-display font-black text-3xl text-gray-900 mb-4 tracking-tight">Vehicle data unavailable.</h2>
          <p className="text-gray-500 font-medium mb-8">Please refresh or select another vehicle to proceed with booking.</p>
          <button onClick={() => navigate('/baraat-cabs')} className="px-8 py-4 bg-gray-900 text-white rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 pt-32 pb-20 relative overflow-hidden">
        {/* Luxury Background for Success */}
        <div className="absolute top-0 right-0 w-72 md:w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 md:w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[4rem] p-12 md:p-16 max-w-2xl w-full text-center shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white relative z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-bl-[4rem] pointer-events-none" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative"
          >
            <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] border-l-transparent animate-spin" />
            <FaCrown className="text-[#D4AF37] text-5xl relative z-10" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white"
            >
              <FiCheck strokeWidth={4} />
            </motion.div>
          </motion.div>

          <h2 className="font-display text-5xl font-black text-gray-900 mb-6 tracking-tight">Reservation <span className="text-[#D4AF37] italic">Confirmed</span></h2>
          <p className="text-gray-500 mb-12 leading-relaxed text-lg max-w-lg mx-auto">
            Your premium Baraat Cab booking request has been securely transmitted. The fleet partner will contact you shortly to finalize details.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard/my-bookings')}
              className="px-10 py-5 bg-gray-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl hover:-translate-y-1"
            >
              Manage Bookings
            </button>
            <button
              onClick={() => navigate('/baraat-cabs')}
              className="px-10 py-5 bg-gray-50 border-2 border-gray-100 text-gray-600 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-100 hover:border-gray-200 transition-all"
            >
              Browse More
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // --- Step Validation ---
  const handleNextStep = (targetStep) => {
    if (targetStep === 2) {
      setCurrentStep(2);
    } else if (targetStep === 3) {
      if (!form.city?.trim() || !form.pickupLocation?.trim() || !form.dropLocation?.trim() || !form.guestCount || !form.eventDate || !form.eventTime) {
        toast.error("Please fill all required itinerary fields.");
        return;
      }
      setCurrentStep(3);
    } else if (targetStep === 4) {
      if (!form.contactName?.trim() || !form.contactPhone?.trim()) {
        toast.error("Please provide contact details.");
        return;
      }
      setCurrentStep(4);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-32 pb-32 px-4 font-sans selection:bg-[#D4AF37]/20 selection:text-[#D4AF37]">

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-black -z-10" />
      <div className="absolute top-0 right-0 w-full h-[500px] bg-[url('https://images.unsplash.com/photo-1546297374-fb211f4cc09a?w=2000')] bg-cover opacity-30 mix-blend-overlay -z-10" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-transparent to-[#FDFCF8] -z-10" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 mb-8 shadow-sm">
            <FiShield className="text-[#D4AF37]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Secure Checkout</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-xl">
            Finalize <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] italic font-serif">Reservation</span>
          </h1>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/20 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] -translate-y-1/2 z-0 transition-all duration-700 ease-in-out" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />

          <div className="flex justify-between relative z-10">
            {['Fleet Review', 'Itinerary', 'Contact', 'Confirmation'].map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;

              return (
                <div key={idx} className="flex flex-col items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-black text-lg transition-all duration-500 shadow-xl ${isActive ? 'bg-[#D4AF37] text-gray-900 scale-110 ring-4 ring-[#D4AF37]/30' : isCompleted ? 'bg-gray-900 text-[#D4AF37] border-2 border-[#D4AF37]' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                    {isCompleted ? <FiCheck /> : stepNum}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block transition-colors duration-500 ${isActive ? 'text-[#D4AF37]' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── WIZARD FORM ── */}
        <form id="bookingForm" onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-8 md:p-14 shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden min-h-[500px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-bl-[8rem] pointer-events-none" />

          <AnimatePresence mode="wait">

            {/* ── STEP 1: FLEET REVIEW ── */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 relative z-10">
                <div>
                  <h3 className="font-display font-black text-4xl text-gray-900 tracking-tight">Review Selected Fleet</h3>
                  <p className="text-gray-500 font-medium mt-3 text-lg">Confirm the luxury vehicles you've selected for your Baraat procession.</p>
                </div>

                {isFleetBuilder ? (
                  <div className="space-y-6">
                    <div className="aspect-[21/9] rounded-[2rem] overflow-hidden bg-gray-100 shadow-inner relative flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1546297374-fb211f4cc09a?w=1200"
                        alt="Fleet"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200';
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50" />
                      <FaCrown className="absolute text-[#D4AF37] text-7xl drop-shadow-2xl" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {fleetSelection.map((item, idx) => {
                        if (!item || !item.data) {
                          return (
                            <div key={idx} className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
                              <p className="font-bold text-red-900 text-sm mb-1">Selected vehicle unavailable</p>
                              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Please go back and select again.</p>
                            </div>
                          );
                        }

                        // Try multiple data fields to find a valid image URL
                        let imgSrc = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400';
                        const vData = item.data;

                        if (vData?.images && vData.images.length > 0 && vData.images[0]?.url) {
                          imgSrc = vData.images[0].url;
                        } else if (vData?.vehicleImages && vData.vehicleImages.length > 0) {
                          imgSrc = vData.vehicleImages[0];
                        } else if (vData?.imageUrl) {
                          imgSrc = vData.imageUrl;
                        } else if (vData?.image) {
                          imgSrc = vData.image;
                        } else if (vData?.thumbnail) {
                          imgSrc = vData.thumbnail;
                        }

                        return (
                          <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="w-full h-24 bg-white rounded-xl mb-3 overflow-hidden flex items-center justify-center relative bg-gray-200">
                              <img
                                src={imgSrc}
                                alt={vData?.name || vData?.type || 'Vehicle'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400';
                                  e.currentTarget.onerror = null;
                                }}
                              />
                            </div>
                            <p className="font-bold text-gray-900 text-sm leading-none mb-1">{vData?.name || vData?.type || item.name || 'Vehicle'}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.count} Selected</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-[#FFF8F0] p-6 rounded-[2rem] flex justify-between items-center border border-[#D4AF37]/20">
                      <div>
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest block mb-1">Total Fleet Capacity</span>
                        <span className="text-xl font-black text-gray-900 flex items-center gap-2"><FiUsers className="text-[#C2185B]" /> {stateData.guestCount} Guests Covered</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest block mb-1">Subtotal</span>
                        <span className="text-3xl font-display font-black text-gray-900">{formatPrice(baseFare)}</span>
                      </div>
                    </div>
                  </div>
                ) : cab && (
                  <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
                    <div className="w-full md:w-1/2 aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
                      <img
                        src={cab?.images?.[0]?.url || cab?.vehicleImages?.[0] || cab?.imageUrl || cab?.image || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800'}
                        alt={cab.name || 'Cab'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800';
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </div>
                    <div className="w-full md:w-1/2 space-y-4">
                      <h4 className="font-display font-black text-4xl text-gray-900 tracking-tight">{cab.name}</h4>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest inline-block bg-white px-3 py-1.5 rounded-lg border border-gray-100">{cab.type?.replace('_', ' ')}</p>

                      <div className="flex gap-6 py-6 border-y border-gray-200">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Capacity</span>
                          <span className="text-lg font-black text-gray-900 flex items-center gap-2"><FiUsers className="text-[#C2185B]" /> {cab.seatingCapacity}</span>
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{selectedPackage ? 'Package Rate' : 'Base Rate'}</span>
                          <span className="text-lg font-black text-[#C2185B]">{selectedPackage ? formatPrice(selectedPackage.price) : formatPrice(cab.pricing?.baseFare)}</span>
                        </div>
                      </div>

                      {selectedPackage && (
                        <div className="p-5 bg-pink-50 rounded-[1.5rem] border border-pink-100">
                          <p className="text-sm font-black text-gray-900 mb-1">{selectedPackage.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedPackage.hours} Hours • {selectedPackage.kmLimit} KM Limit</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-8 border-t border-gray-100 mt-10">
                  <button type="button" onClick={() => handleNextStep(2)} className="px-10 py-5 bg-gray-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3">
                    Confirm Fleet <FiArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: EVENT ITINERARY ── */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 relative z-10">
                <div>
                  <h3 className="font-display font-black text-4xl text-gray-900 tracking-tight">Event Itinerary</h3>
                  <p className="text-gray-500 font-medium mt-3 text-lg">When and where do you need the fleet?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100"><FiCalendar className="text-amber-500" /> Schedule</h4>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Event Date *</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all text-gray-900 shadow-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Reporting Time *</label>
                      <div className="relative">
                        <FiClock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="time" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all text-gray-900 shadow-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Estimated Guest Count *</label>
                      <div className="relative">
                        <FiUsers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="number" min="1" value={form.guestCount} onChange={e => setForm({ ...form, guestCount: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all text-gray-900 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100"><FiMapPin className="text-blue-500" /> Locations</h4>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Base City *</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Patna" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all shadow-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Exact Pickup Address *</label>
                      <input required type="text" value={form.pickupLocation} onChange={e => setForm({ ...form, pickupLocation: e.target.value })} placeholder="House/Hotel Name" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Destination Address *</label>
                      <input required type="text" value={form.dropLocation} onChange={e => setForm({ ...form, dropLocation: e.target.value })} placeholder="Venue Name" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Additional Instructions (Optional)</label>
                  <textarea rows="3" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Specific route requests, decor preferences..." className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all resize-none shadow-sm" />
                </div>

                <div className="flex justify-between pt-8 border-t border-gray-100 mt-10">
                  <button type="button" onClick={() => setCurrentStep(1)} className="px-8 py-5 bg-white border-2 border-gray-100 text-gray-600 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-50 transition-all flex items-center gap-3">
                    <FiArrowLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={() => handleNextStep(3)} className="px-10 py-5 bg-gray-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3">
                    Continue <FiArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: CONTACT DETAILS ── */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 relative z-10">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-[#C2185B] text-3xl mx-auto mb-6 shadow-inner"><FiUser /></div>
                  <h3 className="font-display font-black text-4xl text-gray-900 tracking-tight mb-3">Contact Information</h3>
                  <p className="text-gray-500 font-medium text-lg">Who should the chauffeur contact on the event day?</p>
                </div>

                <div className="max-w-xl mx-auto space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Primary Contact Name *</label>
                    <input required type="text" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="E.g. Rahul Sharma" className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-[1.5rem] px-6 py-5 text-base font-bold outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contact Phone Number *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                      <input required type="tel" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="+91" className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-[1.5rem] pl-14 pr-6 py-5 text-base font-bold outline-none transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-gray-100 mt-10 max-w-2xl mx-auto">
                  <button type="button" onClick={() => setCurrentStep(2)} className="px-8 py-5 bg-white border-2 border-gray-100 text-gray-600 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-50 transition-all flex items-center gap-3">
                    <FiArrowLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={() => handleNextStep(4)} className="px-10 py-5 bg-gray-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3">
                    Review Booking <FiArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: CONFIRMATION & PAYMENT ── */}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 relative z-10">
                <div>
                  <h3 className="font-display font-black text-4xl text-gray-900 tracking-tight">Final Confirmation</h3>
                  <p className="text-gray-500 font-medium mt-3 text-lg">Review your booking summary before submitting.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Summary Boxes */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiCalendar className="text-amber-500" /> Schedule & Itinerary</h4>
                      <p className="font-bold text-gray-900 text-sm mb-1">{form.eventDate} at {form.eventTime}</p>
                      <p className="text-xs text-gray-500 font-medium mb-3">From: {form.pickupLocation} <br />To: {form.dropLocation}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base City: {form.city}</p>
                    </div>
                    <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiUser className="text-[#C2185B]" /> Contact Info</h4>
                      <p className="font-bold text-gray-900 text-sm mb-1">{form.contactName}</p>
                      <p className="text-xs text-gray-500 font-medium">{form.contactPhone}</p>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-[#FFF8F0] rounded-[2.5rem] p-8 border border-[#D4AF37]/20 flex flex-col">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4AF37] text-xl mb-6 shadow-sm"><FaCrown /></div>
                    <h4 className="font-display font-black text-2xl text-gray-900 mb-6 border-b border-[#D4AF37]/20 pb-4">Payment Summary</h4>

                    <div className="space-y-4 mb-6 flex-1">
                      <div className="flex justify-between text-sm font-bold text-gray-600">
                        <span>Subtotal</span>
                        <span className="text-gray-900">{formatPrice(baseFare)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-600">
                        <span>Taxes (5% GST)</span>
                        <span className="text-gray-900">{formatPrice(gst)}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#D4AF37]/20 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Amount</span>
                      <span className="font-display font-black text-4xl text-[#C2185B]">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-gray-100 mt-10">
                  <button type="button" onClick={() => setCurrentStep(3)} className="px-8 py-5 bg-white border-2 border-gray-100 text-gray-600 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-50 transition-all flex items-center gap-3">
                    <FiArrowLeft size={16} /> Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="px-10 py-5 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-gray-900 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[gold-shine_2s_infinite]" />
                    <span className="relative z-10 flex items-center gap-3">
                      {submitting ? 'Processing...' : 'Confirm Reservation'} {!submitting && <FiCheck size={18} />}
                    </span>
                  </button>
                </div>

                <div className="text-center mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <FiZap className="text-amber-400" /> No Payment Required Now - Pay after vendor confirmation
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>

    </div>
  )
}
