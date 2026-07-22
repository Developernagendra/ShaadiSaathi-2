import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { FiMapPin, FiCalendar, FiCheck, FiStar, FiPackage, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { formatPrice } from '../utils/helpers'
import api from '../utils/api'
import { toast } from 'react-hot-toast'
import LoadingScreen from '../components/common/LoadingScreen'

export default function CustomPackageBuilderPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { categories } = useSelector(state => state.vendor)

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Setup, 2: Build
  
  // Setup State
  const [selectedCity, setSelectedCity] = useState('')
  const [eventDate, setEventDate] = useState('')

  // Builder State
  const [activeCategory, setActiveCategory] = useState(null)
  const [vendors, setVendors] = useState([])
  const [vendorsLoading, setVendorsLoading] = useState(false)
  
  // Cart State: { categoryId: { vendor, pkg, price } }
  const [cart, setCart] = useState({})

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Initialize active category once categories load
  useEffect(() => {
    api.post('/tools/track', { toolName: 'Package Builder', action: 'viewed_tool' }).catch(() => {});
    if (categories?.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]._id)
    }
  }, [categories])

  // Fetch Vendors when category or city changes
  useEffect(() => {
    if (step === 2 && activeCategory && selectedCity) {
      const fetchVendors = async () => {
        setVendorsLoading(true)
        try {
          const { data } = await api.get(`/vendors?category=${activeCategory}&city=${selectedCity}&approvalStatus=approved&limit=20`)
          setVendors(data.data || data.vendors || [])
        } catch (error) {
          toast.error('Failed to fetch vendors')
        } finally {
          setVendorsLoading(false)
        }
      }
      fetchVendors()
    }
  }, [activeCategory, selectedCity, step])

  const handleStartBuilding = () => {
    if (!selectedCity) return toast.error('Please enter a city')
    if (!eventDate) return toast.error('Please select an event date')
    setStep(2)
    window.scrollTo(0, 0)
  }

  const handleAddVendor = (vendor, pkg) => {
    setCart(prev => ({
      ...prev,
      [vendor.category._id || vendor.category]: {
        categoryName: categories.find(c => c._id === (vendor.category._id || vendor.category))?.name || 'Service',
        vendor,
        pkg: pkg || { name: 'Standard Service', price: vendor.basePrice },
        price: pkg ? pkg.price : vendor.basePrice
      }
    }))
    toast.success(`${vendor.businessName} added to package!`)
  }

  const handleRemoveFromCart = (categoryId) => {
    setCart(prev => {
      const newCart = { ...prev }
      delete newCart[categoryId]
      return newCart
    })
  }

  // Calculations
  const calculations = useMemo(() => {
    const cartItems = Object.values(cart)
    const totalServices = cartItems.length
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)

    let discountPercent = 0
    if (totalServices >= 4) discountPercent = 15
    else if (totalServices >= 3) discountPercent = 10
    else if (totalServices >= 2) discountPercent = 5

    const discountAmount = (subtotal * discountPercent) / 100
    const afterDiscount = subtotal - discountAmount
    const gst = afterDiscount * 0.05
    const finalAmount = afterDiscount + gst

    return { totalServices, subtotal, discountPercent, discountAmount, afterDiscount, gst, finalAmount, cartItems }
  }, [cart])

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book your package')
      navigate(`/login?redirect=/build-package`)
      return
    }

    if (calculations.totalServices === 0) {
      return toast.error('Please add at least one service to your package')
    }

    setSubmitting(true)
    try {
      // Execute all bookings in parallel via Promise.all
      const bookingPromises = calculations.cartItems.map(item => {
        // Calculate proportionally discounted price for this specific vendor invoice
        const proportionalPrice = item.price - (item.price * calculations.discountPercent / 100)
        
        return api.post('/bookings', {
          vendorId: item.vendor._id,
          eventDate,
          eventCity: selectedCity,
          packageSelected: item.pkg,
          amount: proportionalPrice,
          contactName: user?.name,
          contactPhone: user?.phone,
          specialRequirements: `MEGA PACKAGE BOOKING. Applied ${calculations.discountPercent}% Package Discount.`
        })
      })

      await Promise.all(bookingPromises)
      setSuccess(true)
      toast.success('Mega Package Confirmed!')
      api.post('/tools/track', { toolName: 'Package Builder', action: 'generated_package', metadata: { totalServices: calculations.totalServices, finalAmount: calculations.finalAmount } }).catch(() => {});
      window.scrollTo(0, 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit some bookings. Please check your dashboard.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 pt-32 pb-20">
        <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#C2185B]/10">
          <div className="w-28 h-28 bg-[#C2185B]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-[#C2185B]/20 relative">
            <div className="absolute inset-0 bg-[#C2185B]/20 rounded-full animate-ping opacity-50" />
            <FiCheck className="text-[#C2185B] text-6xl relative z-10" />
          </div>
          <h2 className="font-display text-4xl font-black text-gray-900 mb-4 tracking-tight">Package Confirmed!</h2>
          <p className="text-gray-500 mb-10 leading-relaxed text-lg">
            Your custom Mega Package has been successfully submitted! Each vendor has received their respective booking requests with the <span className="font-bold text-[#C2185B]">{calculations.discountPercent}% Discount</span> applied.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/dashboard/my-bookings')} className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors shadow-lg">
              Manage Bookings
            </button>
            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-colors">
              Build Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 font-sans selection:bg-[#C2185B]/30 selection:text-black">
      
      {/* Decorative Header */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-[#FFF0F5] to-transparent -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-72 md:w-[800px] h-[400px] bg-[#C2185B]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full border border-gray-200 mb-6 shadow-sm">
            <FiPackage className="text-[#C2185B]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C2185B]">Mega Package Builder</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter drop-shadow-lg">
            Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C2185B] to-[#E91E63] italic font-serif">Masterpiece</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Select top-tier vendors across multiple categories to create your perfect wedding package. The more services you bundle, the larger your discount!</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100">
                <h3 className="font-display text-2xl font-black text-gray-900 mb-8 text-center">Let's set the foundation</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Event City</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                      <input 
                        type="text"
                        placeholder="e.g. Udaipur"
                        value={selectedCity} 
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl pl-14 pr-5 py-5 text-sm font-bold text-gray-900 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Event Date</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                      <input 
                        type="date"
                        value={eventDate} 
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl pl-14 pr-5 py-5 text-sm font-bold text-gray-900 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleStartBuilding}
                    className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 mt-4"
                  >
                    Start Building Package
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Main Builder Area */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Categories Horizontal Tabs */}
                <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                  {categories.map(cat => {
                    const isSelected = activeCategory === cat._id
                    const isAdded = cart[cat._id]
                    return (
                      <button
                        key={cat._id}
                        onClick={() => setActiveCategory(cat._id)}
                        className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all border ${isSelected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'} flex items-center gap-2`}
                      >
                        {cat.name}
                        {isAdded && <div className="w-2 h-2 rounded-full bg-[#C2185B]" />}
                      </button>
                    )
                  })}
                </div>

                {/* Vendor Listing */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-2xl font-black text-gray-900">
                      Select {categories.find(c => c._id === activeCategory)?.name}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                      {selectedCity}
                    </span>
                  </div>

                  {vendorsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#C2185B] rounded-full"></div>
                    </div>
                  ) : vendors.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[1.5rem] border border-dashed border-gray-200">
                      <p className="text-gray-500 font-bold">No verified vendors found for this category in {selectedCity}.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {vendors.map(vendor => {
                        const inCart = cart[activeCategory]?.vendor?._id === vendor._id
                        // If vendor has packages, show the best one, otherwise fallback to basePrice
                        const bestPackage = vendor.packages && vendor.packages.length > 0 
                          ? vendor.packages.sort((a,b) => b.price - a.price)[0] 
                          : null

                        return (
                          <div key={vendor._id} className={`p-4 md:p-6 rounded-[1.5rem] border-2 transition-all ${inCart ? 'border-[#C2185B] bg-[#FFF0F5]/30' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                              <img src={vendor.coverImage?.url || vendor.coverImage} className="w-full md:w-40 h-32 object-cover rounded-[1rem]" alt={vendor.businessName} />
                              <div className="flex-1 text-center md:text-left">
                                <h4 className="font-black text-xl text-gray-900 mb-1">{vendor.businessName}</h4>
                                <div className="flex justify-center md:justify-start items-center gap-3 text-xs font-bold text-gray-500 mb-4">
                                  <span className="flex items-center gap-1 text-amber-500"><FiStar className="fill-current" /> {vendor.rating?.average || '5.0'}</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                  <span>{vendor.reviews?.length || 0} Reviews</span>
                                </div>

                                {bestPackage ? (
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 inline-block text-left mb-4 md:mb-0 w-full md:w-auto">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C2185B] mb-1">Recommended Package</p>
                                    <p className="font-bold text-gray-900 text-sm">{bestPackage.name}</p>
                                    <p className="font-black text-lg text-gray-900 mt-1">{formatPrice(bestPackage.price)}</p>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 inline-block text-left mb-4 md:mb-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Starting Price</p>
                                    <p className="font-black text-lg text-gray-900 mt-1">{formatPrice(vendor.basePrice)}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col justify-center w-full md:w-auto h-full">
                                {inCart ? (
                                  <button onClick={() => handleRemoveFromCart(activeCategory)} className="px-6 py-3 bg-[#C2185B] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_5px_15px_rgba(194,24,91,0.3)]">
                                    Added ✓
                                  </button>
                                ) : (
                                  <button onClick={() => handleAddVendor(vendor, bestPackage)} className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest transition-colors">
                                    Add to Package
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Summary Sidebar */}
              <div className="lg:col-span-4">
                <div className="sticky top-28 bg-white rounded-[2rem] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#C2185B]/5 rounded-full blur-[40px] pointer-events-none" />
                  
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="font-display text-xl font-black text-gray-900 flex items-center gap-2">
                      <FiShoppingBag className="text-[#C2185B]" /> My Package
                    </h3>
                    <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded text-xs">{calculations.totalServices} items</span>
                  </div>

                  {calculations.totalServices === 0 ? (
                    <div className="text-center py-10 opacity-50">
                      <FiPackage className="text-4xl mx-auto mb-3 text-gray-300" />
                      <p className="font-bold text-gray-500 text-sm">Your package is empty.<br/>Select vendors to start building.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {calculations.cartItems.map(item => (
                          <div key={item.vendor._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                            <button onClick={() => handleRemoveFromCart(item.vendor.category._id || item.vendor.category)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <FiTrash2 size={14} />
                            </button>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#C2185B] mb-1">{item.categoryName}</p>
                            <p className="font-bold text-sm text-gray-900 line-clamp-1">{item.vendor.businessName}</p>
                            <p className="text-xs font-medium text-gray-500 mb-2 truncate">{item.pkg.name}</p>
                            <p className="font-black text-sm text-gray-900">{formatPrice(item.price)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 mb-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between text-sm font-bold text-gray-500">
                          <span>Subtotal</span>
                          <span>{formatPrice(calculations.subtotal)}</span>
                        </div>
                        {calculations.discountPercent > 0 && (
                          <div className="flex justify-between text-sm font-black text-emerald-500">
                            <span>Bundle Discount ({calculations.discountPercent}%)</span>
                            <span>-{formatPrice(calculations.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                          <span>Taxes (5% GST)</span>
                          <span>{formatPrice(calculations.gst)}</span>
                        </div>
                      </div>

                      {/* Tier Progress Bar */}
                      <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-gray-500">
                          <span>Discount Tier</span>
                          <span className="text-[#C2185B]">{calculations.discountPercent}% Unlocked</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                          <div className={`h-full bg-emerald-400 transition-all ${calculations.totalServices >= 2 ? 'w-1/3' : 'w-0'}`} />
                          <div className={`h-full bg-emerald-500 transition-all ${calculations.totalServices >= 3 ? 'w-1/3' : 'w-0'}`} />
                          <div className={`h-full bg-emerald-600 transition-all ${calculations.totalServices >= 4 ? 'w-1/3' : 'w-0'}`} />
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-gray-400 mt-1 uppercase">
                          <span>2 items: 5%</span>
                          <span>3 items: 10%</span>
                          <span>4+ items: 15%</span>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-gray-200 flex justify-between items-end mb-6">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Total</span>
                        <span className="font-display font-black text-3xl text-gray-900 tracking-tight leading-none">{formatPrice(calculations.finalAmount)}</span>
                      </div>

                      <button 
                        onClick={handleCheckout}
                        disabled={submitting}
                        className="w-full bg-[#C2185B] text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_15px_30px_rgba(194,24,91,0.2)] hover:bg-[#A3154D] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? 'Confirming...' : 'Confirm Mega Package'}
                      </button>
                    </>
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
