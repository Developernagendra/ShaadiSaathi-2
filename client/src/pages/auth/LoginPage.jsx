import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { loginUser } from '../../store/slices/authSlice'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNotificationSound } from '../../context/NotificationSoundContext'
import BrandLogo from '../../components/common/BrandLogo'

const LoginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Min 6 characters')
    .required('Password is required'),
})

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading } = useSelector((s) => s.auth)
  const [showPass, setShowPass] = useState(false)
  const { t } = useTranslation?.() || { t: (key) => key };
  const { playSound } = useNotificationSound()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (values) => {
    const result = await dispatch(loginUser(values))
    if (!result.error) {
      playSound('success')
      const userRole = result.payload?.user?.role
      if (userRole === 'admin') {
        navigate('/admin', { replace: true })
      } else if (userRole === 'vendor') {
        navigate('/vendor/dashboard', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      {/* Left Section: Premium Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80"
          alt="Luxury Wedding"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-black/40 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full bg-[#C2185B]/10 mix-blend-overlay" />

        <div className="absolute bottom-16 left-12 right-12 z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
              <span className="text-yellow-400">✨</span> <span className="text-[10px] font-black uppercase tracking-widest">Your Wedding Partner</span>
            </div>

            <h2 className="font-display text-5xl xl:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
              Where Forever <br />
              <span className="text-[#D4AF37] italic">Begins</span>
            </h2>

            <p className="text-white/80 text-lg font-medium italic max-w-md">
              Welcome back to ShaadiSaathi. Plan, organize, and experience the perfect wedding.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Section: Auth Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        {/* Soft Glow Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-10 shadow-premium border border-white relative z-10"
        >
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <BrandLogo className="justify-center" />
            </div>
            <h1 className="font-display text-3xl font-black text-gray-900 mt-6 mb-2">{t('auth.welcomeBack', 'Welcome Back')}</h1>
            <p className="text-gray-500 font-medium italic text-sm flex items-center justify-center gap-2">
              <FiShield className="text-[#C2185B]" /> {t('auth.loginSecurelyDesc', 'Login securely to your account')}
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">

                {/* Email */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
                    <Field
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-5 text-sm font-medium outline-none focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white transition-all"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="text-red-500 text-[10px] font-bold mt-2 pl-2" />
                </div>

                {/* Password */}
                <div className="group">
                  <div className="flex justify-between items-center mb-2 pl-2 pr-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                    <div className="flex gap-4">
                      <Link to="/forgot-password" className="text-[10px] font-bold text-[#C2185B] hover:text-[#8E244D] uppercase tracking-wider transition-colors">
                        Forgot?
                      </Link>
                    </div>
                  </div>

                  <div className="relative">
                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
                    <Field
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium outline-none focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C2185B] transition-colors outline-none"
                    >
                      {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-red-500 text-[10px] font-bold mt-2 pl-2" />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full py-4 rounded-[1.5rem] bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(194,24,91,0.3)] hover:shadow-[0_0_50px_rgba(194,24,91,0.5)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
                  >
                    {loading || isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Authenticating...
                      </>
                    ) : t('nav.login', 'Login')}
                  </button>
                </div>

                <div className="text-center pt-6 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {t('auth.noAccount', "Don't have an account?")}{' '}
                    <Link to="/register" className="text-[#C2185B] hover:text-[#8E244D] underline underline-offset-4 transition-colors">
                      {t('nav.register', 'Register Now')}
                    </Link>
                  </p>
                </div>

              </Form>
            )}
          </Formik>
        </motion.div>
      </div>
    </div>
  )
}