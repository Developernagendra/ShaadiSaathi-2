import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/authSlice'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheckCircle, FiShield, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useNotificationSound } from '../../context/NotificationSoundContext'
import BrandLogo from '../../components/common/BrandLogo'

export default function VendorRegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(s => s.auth)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { playSound } = useNotificationSound()

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Valid 10-digit mobile number required'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords must match'
    return e
  }

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const [step, setStep] = useState(1)
  const [vendorType, setVendorType] = useState('')

  const handleTypeSelection = (type) => {
    setVendorType(type)
    setStep(2)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const result = await dispatch(registerUser({
      name: form.name.trim(),
      email: form.email.toLowerCase().trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: 'vendor',
      vendorType: vendorType,
    }))

    if (!result.error) {
      playSound('success')
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-pink-50 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[3rem] shadow-premium border border-pink-50 p-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full opacity-50" />
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
            <span className="text-5xl text-white">✉️</span>
          </div>
          <h2 className="font-display text-3xl font-black text-gray-900 mb-3 tracking-tight">Check Your Email!</h2>
          <p className="text-gray-500 font-medium mb-4">
            We've sent a secure verification link to <br /><strong className="text-gray-900">{form.email}</strong>
          </p>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-10 italic">
            Verify your email to access the vendor dashboard
          </p>
          <div className="space-y-4 relative z-10">
            <Link
              to="/login"
              className="block w-full py-4 rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-105 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      {/* Left Panel: Branding & Benefits (Hidden on Mobile) */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#C2185B] relative flex-col justify-between p-12 lg:p-20 overflow-hidden text-white">
        <div className="absolute inset-0 floral-pattern opacity-[0.05]" />
        <div className="absolute top-0 left-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="mb-16">
            <BrandLogo isDark={true} />
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-5xl xl:text-6xl font-black mb-6 tracking-tighter leading-tight drop-shadow-2xl">
              Become a <span className="text-[#D4AF37] italic">Partner</span>
            </h1>
            <p className="text-white/80 text-lg font-medium italic mb-12 max-w-md">
              Grow your wedding business with India's trusted wedding marketplace.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              { icon: '🎯', title: 'Get Verified Leads', desc: 'Connect with genuine couples planning their weddings.' },
              { icon: '📈', title: 'Increase Bookings', desc: 'Boost your revenue with consistent client inquiries.' },
              { icon: '🌍', title: 'Reach More Customers', desc: 'Expand your business presence nationwide.' },
              { icon: '💻', title: 'Manage Your Business Online', desc: 'All your bookings and payments in one dashboard.' },
              { icon: '⭐', title: 'Premium Vendor Profile', desc: 'Showcase your portfolio in a luxury format.' },
              { icon: '🤝', title: 'Dedicated Support', desc: '24/7 priority assistance for our partners.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg shadow-lg border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide text-sm">{item.title}</h3>
                  <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12 flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
          <FiShield size={16} /> 100% Secure Vendor Portal
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-100 rounded-full blur-[100px] opacity-60" />

        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl relative z-10"
          >
            <div className="mb-10 flex flex-col items-center text-center">
              <BrandLogo className="mb-6 justify-center" />
              <h2 className="font-display text-4xl font-black text-gray-900 tracking-tight mb-3">Become a Partner</h2>
              <p className="text-gray-500 font-medium text-sm">Join ShaadiSaathi and grow your wedding business with verified leads, bookings, and premium visibility.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Service Vendor Card */}
              <button
                onClick={() => handleTypeSelection('service')}
                className="group relative bg-white/80 backdrop-blur-xl border-2 border-transparent hover:border-[#C2185B] rounded-[2rem] p-8 text-left transition-all hover:shadow-[0_20px_50px_rgba(194,24,91,0.1)] hover:-translate-y-2 overflow-hidden flex flex-col items-start h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-pink-100 text-[#C2185B] flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    📸
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Service Provider</h3>
                  <p className="text-gray-500 mb-6 flex-grow">
                    For photographers, decorators, makeup artists, venues, and other wedding service professionals.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><FiCheckCircle className="text-[#C2185B]" /> Service Portfolios</li>
                    <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><FiCheckCircle className="text-[#C2185B]" /> Custom Packages</li>
                    <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><FiCheckCircle className="text-[#C2185B]" /> Booking Management</li>
                  </ul>
                  <div className="inline-flex items-center gap-2 text-[#C2185B] font-bold text-sm uppercase tracking-widest mt-auto">
                    Select <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Baraat Cab Provider Card */}
              <button
                onClick={() => handleTypeSelection('cab')}
                className="group relative bg-white/80 backdrop-blur-xl border-2 border-transparent hover:border-[#D4AF37] rounded-[2rem] p-8 text-left transition-all hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] hover:-translate-y-2 overflow-hidden flex flex-col items-start h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-100 text-[#D4AF37] flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    🚘
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Baraat Cab Provider</h3>
                  <p className="text-gray-500 mb-6 flex-grow">
                    For fleet owners, luxury car rentals, and transportation providers for weddings.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><FiCheckCircle className="text-[#D4AF37]" /> Fleet Management</li>
                    <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><FiCheckCircle className="text-[#D4AF37]" /> Availability Calendar</li>
                    <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><FiCheckCircle className="text-[#D4AF37]" /> Dynamic Pricing</li>
                  </ul>
                  <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-sm uppercase tracking-widest mt-auto">
                    Select <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
            <div className="text-center mt-8">
              <p className="text-gray-500 font-medium">Already have an account? <Link to="/login" className="text-[#C2185B] font-bold hover:underline">Log in here</Link></p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 shadow-premium border border-white relative z-10"
          >
            <div className="mb-10 flex flex-col items-center text-center">
              <BrandLogo className="mb-6 justify-center" />
              <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#C2185B] transition-colors mb-4 block">&larr; Back to Type Selection</button>
              <h2 className="font-display text-4xl font-black text-gray-900 tracking-tight mb-3">Create Account</h2>
              <p className="text-gray-500 font-medium italic">Registering as a {vendorType === 'service' ? 'Service Provider' : 'Baraat Cab Provider'}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-2">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border transition-all duration-300 outline-none text-sm font-medium ${errors.name ? 'border-red-400 focus:ring-4 focus:ring-red-50 bg-red-50/50' : 'border-gray-200 focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white'}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 pl-2">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="business@example.com"
                      className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border transition-all duration-300 outline-none text-sm font-medium ${errors.email ? 'border-red-400 focus:ring-4 focus:ring-red-50 bg-red-50/50' : 'border-gray-200 focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white'}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 pl-2">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-2">Mobile Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border transition-all duration-300 outline-none text-sm font-medium ${errors.phone ? 'border-red-400 focus:ring-4 focus:ring-red-50 bg-red-50/50' : 'border-gray-200 focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-2 pl-2">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-2">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border transition-all duration-300 outline-none text-sm font-medium ${errors.password ? 'border-red-400 focus:ring-4 focus:ring-red-50 bg-red-50/50' : 'border-gray-200 focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C2185B] transition-colors focus:outline-none"
                    >
                      {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-[10px] font-bold mt-2 pl-2">{errors.password}</p>}
                </div>
                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-2">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Match password"
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border transition-all duration-300 outline-none text-sm font-medium ${errors.confirmPassword ? 'border-red-400 focus:ring-4 focus:ring-red-50 bg-red-50/50' : 'border-gray-200 focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C2185B] transition-colors focus:outline-none"
                  >
                    {showConfirmPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold mt-2 pl-2">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-[1.5rem] bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(194,24,91,0.3)] hover:shadow-[0_0_50px_rgba(194,24,91,0.5)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : 'Create Vendor Account'}
              </button>
            </div>

          </form>

          <div className="mt-10 flex flex-col items-center gap-6">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Already a partner?{' '}
              <Link to="/login" className="text-[#C2185B] hover:text-[#8E244D] underline underline-offset-4 transition-colors">Log In</Link>
            </p>
            <p className="text-[9px] text-gray-400 text-center max-w-xs leading-relaxed italic">
              By registering, you agree to ShaadiSaathi's <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>
          </div>

        </motion.div>
        )}
      </div>
    </div>
  )
}
