import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNotificationSound } from '../../context/NotificationSoundContext';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../../components/common/BrandLogo';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const { t } = useTranslation?.() || { t: (key) => key };
  const { playSound } = useNotificationSound();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      e.name = t('auth.errors.name', 'Name must be at least 2 characters');
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = t('auth.errors.email', 'Valid email is required');
    }
    if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      e.phone = t('auth.errors.phone', 'Valid 10-digit mobile number required');
    }
    if (!form.password || form.password.length < 6) {
      e.password = t('auth.errors.password', 'Password must be at least 6 characters');
    }
    if (form.password !== form.confirmPassword) {
      e.confirmPassword = t('auth.errors.confirmPassword', 'Passwords must match');
    }
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((er) => ({ ...er, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const result = await dispatch(
      registerUser({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: 'user',
      })
    );

    if (!result.error) {
      playSound('success');
      navigate('/');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

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
              Plan Your <span className="text-[#D4AF37] italic">Dream Wedding</span>
            </h1>
            <p className="text-white/80 text-lg font-medium italic mb-12 max-w-md">
              Discover verified wedding vendors, browse luxury fleets, and coordinate your complete wedding plans in one premium dashboard.
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              { icon: '👑', title: 'Top Tier Vendors', desc: 'Book verified caterers, venues, and photographers.' },
              { icon: '🚗', title: 'Luxury Baraat Cabs', desc: 'Secure reliable premium transport for your entourage.' },
              { icon: '📅', title: 'Personalized Planning', desc: 'Coordinate dates, details, and budgets dynamically.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex items-start gap-5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-lg border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">{item.title}</h3>
                  <p className="text-sm text-white/60 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12 flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
          <FiShield size={16} /> 100% Secure User Account
        </div>
      </div>

      {/* Right Panel: Form Content */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-100 rounded-full blur-[100px] opacity-60" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 shadow-premium border border-white relative z-10"
        >
          <div className="mb-10 flex flex-col items-center">
            <BrandLogo className="mb-6 justify-center" />
            <h2 className="font-display text-4xl font-black text-gray-900 tracking-tight mb-3">Join as User</h2>
            <p className="text-gray-500 font-medium italic">Create your personal account to begin planning your wedding.</p>
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
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border transition-all duration-300 outline-none text-sm font-medium ${errors.email ? 'border-red-400 focus:ring-4 focus:ring-red-50 bg-red-50/50' : 'border-gray-200 focus:border-[#C2185B] focus:ring-4 focus:ring-pink-50 focus:bg-white'}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 pl-2">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-2">Mobile Number (Optional)</label>
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
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                ) : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-col items-center gap-6">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-[#C2185B] hover:text-[#8E244D] underline underline-offset-4 transition-colors">Log In</Link>
            </p>
            <p className="text-[9px] text-gray-400 text-center max-w-xs leading-relaxed italic">
              By registering, you agree to ShaadiSaathi's <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}