import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { FiMapPin, FiCalendar, FiClock, FiArrowRight, FiArrowLeft, FiCheck, FiTruck, FiStar, FiUser, FiPhone } from 'react-icons/fi';
import { FaCrown, FaTruck } from 'react-icons/fa';
import { formatPrice, optimizeImage } from '../utils/helpers'
import api from '../utils/api'
import { toast } from 'react-hot-toast'
import LoadingScreen from '../components/common/LoadingScreen'
import { getMe, resendVerification } from '../store/slices/authSlice'

export default function CustomBundleBuilderPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState([])
  
  // Selections
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [vendorFleet, setVendorFleet] = useState([])
  const [selectedVehicles, setSelectedVehicles] = useState({}) // { vehicleId: quantity }
  
  // Booking Form
  const [form, setForm] = useState({
    pickupLocation: '',
    dropLocation: '',
    eventDate: '',
    eventTime: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    message: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Fetch unique cities from fleet on mount
  const [availableCities, setAvailableCities] = useState([])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data } = await api.get('/fleet/browse')
        // Extract unique cities
        const cities = [...new Set(data.cabs.map(c => c.location?.city).filter(Boolean))]
        setAvailableCities(cities)
        
        // Group by vendor to find vendors with fleets
        const vendorMap = new Map()
        data.cabs.forEach(cab => {
          if (cab.vendor) {
            if (!vendorMap.has(cab.vendor._id)) {
              vendorMap.set(cab.vendor._id, { ...cab.vendor, fleet: [] })
            }
            vendorMap.get(cab.vendor._id).fleet.push(cab)
          }
        })
        setVendors(Array.from(vendorMap.values()))
      } catch (err) {
        toast.error('Failed to load fleet data')
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
    window.scrollTo(0, 0)
  }, [])

const filteredVendors = useMemo(() => {
    if (!selectedCity) return vendors
    return vendors.filter(v => v.fleet.some(c => c.location?.city?.toLowerCase() === selectedCity.toLowerCase()))
  }, [vendors, selectedCity])

  const handleSelectVendor = (vendor) => {
    setSelectedVendor(vendor)
    // Filter fleet by city if city is selected
    let fleet = vendor.fleet
    if (selectedCity) {
      fleet = fleet.filter(c => c.location?.city?.toLowerCase() === selectedCity.toLowerCase())
    }
    setVendorFleet(fleet)
    setSelectedVehicles({})
    setStep(2)
    window.scrollTo(0, 0)
  }

  const handleUpdateQuantity = (vehicleId, delta) => {
    const cab = vendorFleet.find(c => c._id === vehicleId)
    const maxLimit = cab?.availableFleet ?? cab?.totalFleet ?? cab?.quantityAvailable ?? 1
    setSelectedVehicles(prev => {
      const current = prev[vehicleId] || 0
      const next = current + delta
      if (next > maxLimit) {
        toast.error(`Only ${maxLimit} vehicles of this type available.`)
        return prev
      }
      const newSelections = { ...prev }
      if (next <= 0) delete newSelections[vehicleId]
      else newSelections[vehicleId] = next
      return newSelections
    })
  }

  // Calculations
  const calculations = useMemo(() => {
    let totalVehicles = 0
    let totalSeats = 0
    let subtotal = 0
    
    const formattedVehicles = []

    Object.entries(selectedVehicles).forEach(([id, qty]) => {
      const cab = vendorFleet.find(c => c._id === id)
      if (cab) {
        totalVehicles += qty
        totalSeats += (cab.seatingCapacity || 4) * qty
        const basePrice = cab.pricing?.baseFare || cab.price || 0
        subtotal += basePrice * qty
        
        formattedVehicles.push({
          vehicleId: cab._id,
          name: cab.name,
          quantity: qty,
          pricePerVehicle: basePrice,
          totalFare: basePrice * qty
        })
      }
    })

    // Apply bundle discount logic
    // e.g. 5% off for 3+ vehicles, 10% off for 5+ vehicles, 15% off for 10+ vehicles
    let discountPercent = 0
    if (totalVehicles >= 10) discountPercent = 15
    else if (totalVehicles >= 5) discountPercent = 10
    else if (totalVehicles >= 3) discountPercent = 5

    const discountAmount = (subtotal * discountPercent) / 100
    const afterDiscount = subtotal - discountAmount
    const gst = afterDiscount * 0.05
    const finalAmount = afterDiscount + gst

    return { totalVehicles, totalSeats, subtotal, discountPercent, discountAmount, finalAmount, formattedVehicles, gst }
  }, [selectedVehicles, vendorFleet])

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to reserve your fleet')
      navigate(`/login?redirect=/baraat-cabs/custom-bundle`)
      return
    }

// Validation
    if (!form.pickupLocation) return toast.error('Pickup location is required')
    if (!form.dropLocation) return toast.error('Drop location is required')
    if (!form.eventDate) return toast.error('Event date is required')
    if (!form.contactName) return toast.error('Contact name is required')
    if (!form.contactPhone) return toast.error('Contact phone is required')

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        city: selectedCity || vendorFleet[0]?.location?.city || 'Nationwide',
        vendorId: selectedVendor._id,
        cabId: calculations.formattedVehicles[0]?.vehicleId, // Required fallback for backend
        guestCount: calculations.totalSeats,
        selectedVehicles: calculations.formattedVehicles,
        packageType: 'custom_bundle',
        subtotal: calculations.subtotal,
        gst: calculations.gst,
        totalAmount: calculations.finalAmount,
        specialRequests: `CUSTOM BUNDLE BOOKING. Total Vehicles: ${calculations.totalVehicles}. Discount Applied: ${calculations.discountPercent}%. User Message: ${form.message}`
      }

      await api.post('/cab-booking', payload)
      setSuccess(true)
      toast.success('Custom Fleet Reserved Successfully!')
      window.scrollTo(0, 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bundle request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen />

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 pt-32 pb-20">
        <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gold-50">
          <div className="w-28 h-28 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-gold-100 relative">
            <div className="absolute inset-0 bg-gold-50 rounded-full animate-ping opacity-50" />
            <FiCheck className="text-[#D4AF37] text-6xl relative z-10" />
          </div>
          <h2 className="font-display text-4xl font-black text-gray-900 mb-4 tracking-tight">Fleet Reserved!</h2>
          <p className="text-gray-500 mb-10 leading-relaxed text-lg">
            Your custom Baraat fleet bundle request has been securely transmitted to <span className="font-bold text-gray-900">{selectedVendor?.businessName}</span>. They will review and confirm your multi-vehicle reservation shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/dashboard/my-bookings')} className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors shadow-lg">
              Manage Bookings
            </button>
            <button onClick={() => navigate('/baraat-cabs')} className="px-8 py-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-colors">
              Return to Fleet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 font-sans selection:bg-[#D4AF37]/30 selection:text-black">
      
      {/* Decorative Header */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-950 to-transparent -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-72 md:w-[800px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 mb-6 shadow-lg">
            <FaCrown className="text-[#D4AF37]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Custom Fleet Builder</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-lg">
            Build Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] italic font-serif">Baraat</span>
          </h1>
          <p className="text-gray-300 font-medium text-lg">Mix and match vehicles to create a majestic wedding procession.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-xl">
            {[1, 2, 3].map(num => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${step >= num ? 'bg-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-gray-800 text-gray-500'}`}>
                  {step > num ? <FiCheck size={16} /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 rounded-full transition-all duration-500 ${step > num ? 'bg-[#D4AF37]' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Location & Partner Selection */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold-50 rounded-full blur-[60px]" />
                    <h3 className="font-display text-2xl font-black text-gray-900 mb-6 relative z-10">Where is the Baraat?</h3>
                    
                    <div className="relative z-10">
                      <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                      <select 
                        value={selectedCity} 
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl pl-14 pr-5 py-5 text-sm font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="">All Regions / Nationwide</option>
                        {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100">
                    <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Select a Fleet Partner</h3>
                    <p className="text-gray-500 font-medium mb-8 text-sm">To ensure seamless coordination and massive bulk discounts, custom bundles are sourced from a single premium vendor.</p>

                    <div className="space-y-4">
                      {filteredVendors.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <p className="text-gray-500 font-bold">No partners found in this region.</p>
                        </div>
                      ) : (
                        filteredVendors.map(vendor => (
                          <div 
                            key={vendor._id} 
                            onClick={() => handleSelectVendor(vendor)}
                            className="p-6 rounded-[2rem] border-2 border-gray-100 hover:border-[#D4AF37] hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group bg-white"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                                <img src={vendor.profileImage?.url || `https://ui-avatars.com/api/?name=${vendor.businessName}&background=random`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-black text-lg text-gray-900 group-hover:text-[#D4AF37] transition-colors">{vendor.businessName}</h4>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                                  <span className="flex items-center gap-1"><FiTruck className="text-blue-500" /> {vendor.fleet.length} Vehicles</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                  <span className="flex items-center gap-1 text-yellow-500"><FiStar className="fill-current" /> {vendor.rating?.average || '5.0'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#D4AF37] group-hover:text-white flex items-center justify-center transition-colors text-gray-400">
                              <FiArrowRight />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Fleet Selection */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors bg-gray-900/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                      <FiArrowLeft /> Back to Partners
                    </button>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Browsing Fleet From</p>
                      <h3 className="font-display text-xl font-black text-white tracking-tight">{selectedVendor?.businessName}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendorFleet.map(cab => {
                      const qty = selectedVehicles[cab._id] || 0
                      const basePrice = cab.pricing?.baseFare || cab.price
                      return (
                        <div key={cab._id} className={`bg-white rounded-[2rem] overflow-hidden border-2 transition-all duration-300 ${qty > 0 ? 'border-[#C2185B] shadow-[0_15px_40px_rgba(194,24,91,0.15)]' : 'border-gray-100 hover:border-gray-300 shadow-sm'}`}>
                          <div className="h-40 bg-gray-100 relative">
                            <img src={optimizeImage(cab.images?.[0]?.url, 600)} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                              {cab.type?.replace('_', ' ')}
                            </div>
                            {qty > 0 && (
                              <div className="absolute top-0 right-0 w-16 h-16 bg-[#C2185B] rounded-bl-[2rem] flex items-center justify-center text-white shadow-lg">
                                <span className="font-display font-black text-2xl">{qty}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h4 className="font-black text-lg text-gray-900 mb-1 line-clamp-1">{cab.name}</h4>
                            <div className="flex justify-between items-center mb-5">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{cab.seatingCapacity} Seats</span>
                              <span className="font-black text-[#D4AF37]">{formatPrice(basePrice)}<span className="text-[9px] text-gray-400">/vehicle</span></span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 rounded-[1.5rem] p-2 border border-gray-100">
                              <button onClick={() => handleUpdateQuantity(cab._id, -1)} disabled={qty === 0} className="w-12 h-12 rounded-[1rem] bg-white text-gray-600 font-black text-xl flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">-</button>
                              <span className="font-display font-black text-2xl w-12 text-center text-gray-900">{qty}</span>
                              <button onClick={() => handleUpdateQuantity(cab._id, 1)} className="w-12 h-12 rounded-[1rem] bg-gray-900 text-white font-black text-xl flex items-center justify-center shadow-sm hover:bg-black transition-colors">+</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Details & Confirmation */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  
                  <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors bg-gray-900/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 mb-2">
                    <FiArrowLeft /> Modify Fleet
                  </button>

                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100">
                    <h3 className="font-display text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-4">Itinerary & Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Event Date</label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gold-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Reporting Time</label>
                        <div className="relative">
                          <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="time" value={form.eventTime} onChange={e => setForm({...form, eventTime: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gold-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Pickup Address</label>
                        <input type="text" placeholder="Starting Point" value={form.pickupLocation} onChange={e => setForm({...form, pickupLocation: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gold-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Destination / Drop</label>
                        <input type="text" placeholder="Wedding Venue" value={form.dropLocation} onChange={e => setForm({...form, dropLocation: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gold-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100">
                    <h3 className="font-display text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-4">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contact Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gold-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="tel" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gold-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Special Requests</label>
                        <textarea placeholder="e.g. Ribbon color preference" rows="3" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gold-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all resize-none" />
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── RIGHT SIDEBAR: Live Summary ── */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-[3rem] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[50px] pointer-events-none" />
              
              <h3 className="font-display text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-5">Live Quotation</h3>

              {step === 1 ? (
                <div className="text-center py-10 opacity-50">
                  <FiMapPin className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p className="font-bold text-gray-500">Select a partner to begin</p>
                </div>
              ) : calculations.totalVehicles === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <FaTruck className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p className="font-bold text-gray-500">Add vehicles to calculate price</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {calculations.formattedVehicles.map(v => (
                      <div key={v.vehicleId} className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm text-gray-900 line-clamp-1">{v.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{v.quantity} × {formatPrice(v.pricePerVehicle)}</p>
                        </div>
                        <p className="font-black text-sm text-gray-900">{formatPrice(v.totalFare)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Fleet Size</p>
                      <p className="font-black text-xl text-gray-900">{calculations.totalVehicles}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Seats</p>
                      <p className="font-black text-xl text-gray-900">{calculations.totalSeats}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between text-sm font-bold text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(calculations.subtotal)}</span>
                    </div>
                    {calculations.discountPercent > 0 && (
                      <div className="flex justify-between text-sm font-bold text-emerald-500">
                        <span>Bundle Discount ({calculations.discountPercent}%)</span>
                        <span>-{formatPrice(calculations.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-gray-500">
                      <span>Taxes (5% GST)</span>
                      <span>{formatPrice(calculations.gst)}</span>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-200 flex justify-between items-end mb-8">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Total</span>
                    <span className="font-display font-black text-3xl text-[#C2185B] tracking-tight leading-none">{formatPrice(calculations.finalAmount)}</span>
                  </div>

                  {step === 2 && (
                    <button 
                      onClick={() => setStep(3)}
                      className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      Proceed to Details <FiArrowRight size={16} />
                    </button>
                  )}

                  {step === 3 && (
                    <button 
                      onClick={handleCheckout}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_15px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.4)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? 'Encrypting...' : 'Confirm Request'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

</div>
  )
}
