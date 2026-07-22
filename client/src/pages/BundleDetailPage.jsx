import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMapPin, FiStar, FiCheck, FiArrowRight, FiArrowLeft, FiShield, FiUsers, FiClock, FiCheckCircle, FiMessageCircle, FiGift } from 'react-icons/fi'
import { FaTruck, FaCrown } from 'react-icons/fa'
import api from '../utils/api'
import LoadingScreen from '../components/common/LoadingScreen'
import { formatPrice } from '../utils/helpers'

export default function BundleDetailPage() {
  const { bundleId } = useParams()
  const navigate = useNavigate()
  const [bundle, setBundle] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const { data } = await api.get(`/cab-booking/bundle/${bundleId}`)
        setBundle(data.bundle)
        setVendor(data.vendor)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bundle details')
      } finally {
        setLoading(false)
      }
    }
    fetchBundle()
    window.scrollTo(0, 0)
  }, [bundleId])

  if (loading) return <LoadingScreen />

  if (error || !bundle) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-[#FFF8F0]/30">
      <div className="text-6xl mb-6">📦</div>
      <h2 className="font-display text-4xl font-black text-gray-900 mb-4">Bundle Not Found</h2>
      <p className="text-gray-500 mb-8 font-medium">{error || 'This package might have been removed.'}</p>
      <button onClick={() => navigate('/baraat-cabs')} className="btn-primary flex items-center gap-2">
        <FiArrowLeft /> Browse Baraat Fleet
      </button>
    </div>
  )

  const totalVehicles = bundle.vehicles?.reduce((acc, v) => acc + v.quantity, 0) || 0
  const finalPrice = bundle.discountedPrice || bundle.totalPrice
  const savings = bundle.discountedPrice ? bundle.totalPrice - bundle.discountedPrice : 0

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24 selection:bg-[#C2185B]/20 selection:text-[#C2185B]">

      {/* ── ✨ Hero Section ── */}
      <div className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-gray-900 mx-4 md:mx-8 mt-4 md:mt-8 rounded-[3rem] shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={bundle.images?.[0]?.url || "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1600"}
            className="w-full h-full object-cover opacity-50"
            alt="Bundle Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center lg:text-left flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-2">
                <FiGift /> Premium Fleet Bundle
              </span>
              {bundle.isLuxury && (
                <span className="bg-gray-900/80 backdrop-blur-md border border-yellow-500/30 text-[#D4AF37] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                  <FaCrown /> Luxury Package
                </span>
              )}
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl leading-[1.1]">
              {bundle.bundleName}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl font-medium italic leading-relaxed drop-shadow-md">
              {bundle.description}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] text-center w-full lg:w-auto shadow-2xl shrink-0">
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Package Starting At</p>
            <div className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
              {formatPrice(finalPrice)}
            </div>
            {savings > 0 && (
              <div className="inline-block bg-green-500/20 border border-green-500/50 text-green-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                You Save {formatPrice(savings)}
              </div>
            )}
            <div className="flex gap-2 justify-center text-yellow-500 text-sm mb-1">
              {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-current" />)}
            </div>
            <p className="text-white/80 text-xs font-bold">4.9/5 (120+ Reviews)</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT: INCLUDED VEHICLES & FEATURES ── */}
          <div className="lg:col-span-8 space-y-10">

            {/* Quick Overview Strip */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-50 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
              <div className="text-center px-4">
                <FiUsers className="text-[#C2185B] text-2xl mx-auto mb-2" />
                <p className="font-black text-gray-900 text-sm mb-1">{(totalVehicles * 4)}+</p>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Guest Capacity</p>
              </div>
              <div className="text-center px-4">
                <FaTruck className="text-[#D4AF37] text-2xl mx-auto mb-2" />
                <p className="font-black text-gray-900 text-sm mb-1">{totalVehicles} Cars</p>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Total Fleet</p>
              </div>
              <div className="text-center px-4">
                <FiClock className="text-blue-500 text-2xl mx-auto mb-2" />
                <p className="font-black text-gray-900 text-sm mb-1">8-12 Hrs</p>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Duration</p>
              </div>
              <div className="text-center px-4">
                <FiShield className="text-green-500 text-2xl mx-auto mb-2" />
                <p className="font-black text-gray-900 text-sm mb-1">Premium</p>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Insurance</p>
              </div>
            </div>

            {/* Included Fleet List */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-premium border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-[80px] pointer-events-none" />

              <div className="inline-flex items-center gap-2 text-[#C2185B] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <div className="w-8 h-px bg-[#C2185B]" /> Included Services
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-gray-900 mb-10 tracking-tight">
                Your Premium Fleet
              </h2>

              <div className="space-y-6">
                {bundle.vehicles?.map((v, idx) => {
                  const cab = v.vehicleId || {}
                  if (!cab || !cab.name) return null;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col sm:flex-row gap-6 p-6 rounded-[2rem] bg-gray-50 border border-gray-100 hover:border-pink-200 hover:shadow-[0_10px_30px_rgba(194,24,91,0.06)] transition-all duration-300 group"
                    >
                      <div className="w-full sm:w-56 h-40 rounded-[1.5rem] overflow-hidden flex-shrink-0 relative">
                        <img
                          src={cab.images?.[0]?.url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400'}
                          alt={cab.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#C2185B] font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                          Qty: {v.quantity}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-display font-black text-2xl text-gray-900 group-hover:text-[#C2185B] transition-colors">{cab.name}</h3>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                            {cab.type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 italic mb-5 leading-relaxed">
                          Premium {cab.brand || ''} {cab.model || ''} equipped with luxury interiors and experienced chauffeurs.
                        </p>

                        <div className="flex flex-wrap gap-6 pt-5 border-t border-gray-200 mt-auto">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Included Hours</p>
                            <p className="text-sm font-black text-gray-900">{v.includedHours} Hrs</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Included Distance</p>
                            <p className="text-sm font-black text-gray-900">{v.includedKm} KM</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Capacity</p>
                            <p className="text-sm font-black text-gray-900 flex items-center gap-1"><FiUsers className="text-[#D4AF37]" /> {(cab.seatingCapacity || 4) * v.quantity} Seats</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Bundle Features */}
            {bundle.features && bundle.features.length > 0 && (
              <div className="bg-gradient-to-br from-[#FFF8F0] to-white rounded-[3rem] p-8 md:p-12 shadow-premium border border-gold-100">
                <h3 className="font-display text-2xl md:text-3xl font-black text-gray-900 mb-8 tracking-tight">Package Highlights & Inclusions</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {bundle.features.map((feat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-white hover:border-gold-200 transition-colors shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center flex-shrink-0 border border-gold-100 shadow-inner">
                        <FiCheckCircle className="text-[#D4AF37]" size={16} />
                      </div>
                      <span className="text-gray-700 font-medium leading-relaxed">{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: PRICING & BOOKING SIDEBAR ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Main Booking Card */}
            <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_60px_rgba(194,24,91,0.08)] border border-pink-100 sticky top-32">
              <div className="text-center mb-8 border-b border-gray-100 pb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Total Package Value</p>
                {bundle.discountedPrice && (
                  <p className="text-lg font-bold text-gray-400 line-through mb-1">{formatPrice(bundle.totalPrice)}</p>
                )}
                <p className="font-display text-5xl font-black text-[#C2185B] tracking-tight mb-3">
                  {formatPrice(finalPrice)}
                </p>
                {savings > 0 && (
                  <div className="inline-flex bg-green-50 text-green-600 border border-green-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    You Save {formatPrice(savings)}!
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-gray-500 font-bold text-sm">Total Fleet Size</span>
                  <span className="font-black text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">{totalVehicles} Vehicles</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-gray-500 font-bold text-sm">Advance Required</span>
                  <span className="font-black text-gray-900">20% to Book</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/baraat-cabs/book?bundleId=${bundleId}`)}
                className="w-full bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white rounded-full py-5 font-black text-[11px] uppercase tracking-[0.2em] hover:shadow-[0_15px_40px_rgba(194,24,91,0.5)] transition-all flex items-center justify-center gap-3 active:scale-95 mb-4"
              >
                Proceed to Book <FiArrowRight size={16} />
              </button>

              <button className="w-full bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-full py-4 font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95">
                <FiMessageCircle size={16} /> WhatsApp Inquiry
              </button>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <FiShield className="text-green-500 text-sm" /> 100% Secure Payment Guarantee
              </div>
            </div>

            {/* Vendor Profile Mini Card */}
            {vendor && (
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:border-gold-200 transition-colors group">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Service Provided By</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-[#D4AF37] p-1 shadow-inner flex-shrink-0">
                    <img
                      src={vendor.profileImage?.url || `https://ui-avatars.com/api/?name=${vendor.businessName}&background=random`}
                      alt={vendor.businessName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#D4AF37] transition-colors">{vendor.businessName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-500 text-xs">
                        {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-current" />)}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">({vendor.rating?.average || '5.0'})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}
