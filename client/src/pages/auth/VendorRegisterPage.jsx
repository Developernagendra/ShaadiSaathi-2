import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import {
  FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheckCircle,
  FiShield, FiArrowRight, FiCheck, FiPlus, FiMinus, FiStar,
  FiTrendingUp, FiCalendar, FiMessageSquare, FiDollarSign,
  FiImage, FiAward, FiHelpCircle, FiBriefcase, FiMapPin,
  FiChevronDown, FiChevronUp, FiCamera, FiTruck, FiHome, FiHeart,
  FiMusic, FiSmile, FiGift, FiSun, FiUsers, FiLayers, FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNotificationSound } from '../../context/NotificationSoundContext';
import BrandLogo from '../../components/common/BrandLogo';

import { fetchCategories } from '../../store/slices/vendorSlice';

// ── WHY JOIN SHAADISAATHI FEATURES ─────────────────────────────────────
const BENEFITS_LIST = [
  {
    title: 'GROW YOUR BUSINESS',
    desc: 'Naye customers tak apni services pahunchayein.',
    icon: '📈',
    badge: 'Active Dashboard Feature',
  },
  {
    title: 'DIGITAL BUSINESS PROFILE',
    desc: 'Apne business ki professional profile banayein.',
    icon: '📱',
    badge: 'Active Dashboard Feature',
  },
  {
    title: 'MANAGE BOOKINGS',
    desc: 'Bookings aur enquiries ko ek jagah manage karein.',
    icon: '📅',
    badge: 'Active Dashboard Feature',
  },
  {
    title: 'DIRECT CUSTOMER ENQUIRIES',
    desc: 'Customers se directly connect karein.',
    icon: '💬',
    badge: 'Active Dashboard Feature',
  },
  {
    title: 'SHOWCASE YOUR WORK',
    desc: 'Gallery ke through apna best work showcase karein.',
    icon: '📸',
    badge: 'Active Dashboard Feature',
  },
  {
    title: 'TRACK YOUR EARNINGS',
    desc: 'Bookings aur earnings ko easily track karein.',
    icon: '💰',
    badge: 'Active Dashboard Feature',
  },
];

// ── FAQ QUESTIONS & ANSWERS ──────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'Who can become a vendor?',
    a: 'Any professional wedding service provider or Baraat Cab partner operating in India (especially Bihar & Mithila region), including photographers, decorators, venues, caterers, makeup artists, DJs, and bridal wear specialists.',
  },
  {
    q: 'How do I register my business?',
    a: 'Simply fill out the 5-step registration form on this page with your business name, contact info, category, and portfolio details. Once submitted, verify your email to access your vendor dashboard immediately.',
  },
  {
    q: 'Is vendor verification required?',
    a: 'Yes! To maintain trust and quality for wedding families, our team reviews your profile information and documents before granting the official Verified Business Badge.',
  },
  {
    q: 'How do customers contact me?',
    a: 'Couples can contact you directly via WhatsApp, phone call, or message enquiry straight from your vendor profile page—with zero hidden middlemen.',
  },
  {
    q: 'How do I manage bookings?',
    a: 'Through your dedicated ShaadiSaathi Vendor Dashboard, where you can view lead enquiries, calendar availability, packages, custom quotes, and active bookings all in one place.',
  },
  {
    q: 'Can I update my business profile?',
    a: 'Absolutely! You can update your pricing, add new portfolio photos, edit your service packages, and respond to customer reviews anytime from your dashboard.',
  },
  {
    q: 'How does payment work?',
    a: 'Customers can book your services directly or pay advance tokens securely through our platform. All earnings and payout history are tracked transparently in the Earnings section of your dashboard.',
  },
];

export default function VendorRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth || {});
  const { categories } = useSelector((s) => s.vendor || {});
  const { playSound } = useNotificationSound();

  React.useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories?.length]);

  // References for smooth scrolling
  const formSectionRef = useRef(null);
  const howItWorksRef = useRef(null);

  // Form State
  const [step, setStep] = useState(1); // 1: Business, 2: Contact, 3: Details, 4: Gallery, 5: Submit
  const [vendorType, setVendorType] = useState('service');
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    description: '',
    name: '',
    phone: '',
    email: '',
    city: 'Patna',
    serviceArea: 'Patna & All Bihar',
    startingPrice: '',
    experience: '5+ Years',
    services: ['Custom Packages', 'Direct WhatsApp Inquiry', 'Advance Booking', 'On-site Event Service'],
    logoUrl: '',
    coverUrl: '',
    galleryUrls: [],
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('overview');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Toggle Services Pill
  const toggleServicePill = (serviceName) => {
    setForm((prev) => {
      const exists = prev.services.includes(serviceName);
      const updated = exists
        ? prev.services.filter((s) => s !== serviceName)
        : [...prev.services, serviceName];
      return { ...prev, services: updated };
    });
  };

  // Select Category from UI Cards
  const handleCategorySelect = (categoryObj) => {
    setForm((prev) => ({ ...prev, category: categoryObj._id }));
    setVendorType(categoryObj.slug === 'cab-service' ? 'cab' : 'service');
    scrollToRegistration();
    toast.success(`${categoryObj.name} selected! Complete registration below.`, {
      icon: categoryObj.icon || '✨',
    });
  };

  // Scroll Helpers
  const scrollToRegistration = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToHowItWorks = () => {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Step Validation Logic
  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!form.businessName.trim() || form.businessName.trim().length < 2) {
        newErrors.businessName = 'Please enter a valid Business Name (at least 2 characters)';
      }
      if (!form.category) {
        newErrors.category = 'Please select a Business Category';
      }
    } else if (currentStep === 2) {
      if (!form.name.trim() || form.name.trim().length < 2) {
        newErrors.name = 'Please enter contact person full name';
      }
      if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
      }
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Please enter a valid business email address';
      }
      if (!form.city.trim()) {
        newErrors.city = 'Please specify your primary City / Service Area';
      }
    } else if (currentStep === 3) {
      if (!form.startingPrice || Number(form.startingPrice) <= 0) {
        newErrors.startingPrice = 'Please specify your starting price in ₹';
      }
    } else if (currentStep === 5) {
      if (!form.password || form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!form.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to ShaadiSaathi Partner Terms';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    } else {
      toast.error('Please check the highlighted errors to continue.');
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Final Registration
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Final validation
    if (!validateStep(5)) {
      toast.error('Please check your password and terms selection.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.toLowerCase().trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: 'vendor',
      vendorType: vendorType || 'service',
      // Pass extra profile fields so backend can populate initial vendor profile
      businessName: form.businessName.trim(),
      category: form.category,
      city: form.city.trim(),
      startingPrice: Number(form.startingPrice) || 0,
      description: form.description.trim(),
      experience: form.experience,
    };

    const result = await dispatch(registerUser(payload));

    if (!result.error) {
      playSound('success');
      setSubmitted(true);
      toast.success('Partner Account Created Successfully! Check email to verify.');
    } else {
      toast.error(result.payload || 'Registration failed. Please try again.');
    }
  };

  // ── SUBMITTED SUCCESS SCREEN ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-pink-50 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-pink-100 p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full opacity-50" />
          
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-4 border-white">
            <FiCheckCircle className="text-5xl text-white animate-bounce" />
          </div>

          <span className="inline-block px-4 py-1 rounded-full bg-green-50 text-green-700 font-bold text-xs uppercase tracking-wider mb-4 border border-green-200">
            🚀 Welcome to ShaadiSaathi Partner Network
          </span>

          <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Check Your Email!
          </h2>
          <p className="text-gray-600 font-medium text-base mb-4 leading-relaxed">
            We've sent an instant email verification link to <br />
            <strong className="text-[#C2185B] text-lg">{form.email}</strong>
          </p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8 bg-gray-50 py-3 px-4 rounded-xl border border-gray-100">
            Verify your email to unlock your Vendor Dashboard & live listing
          </p>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <Link
              to="/login"
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all text-center"
            >
              Go to Vendor Login →
            </Link>
            <Link
              to="/"
              className="py-4 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest transition-all text-center"
            >
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── MAIN LANDING & ONBOARDING UI ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF8F0] text-gray-900 font-sans overflow-x-hidden">
      
      {/* ── 1. HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#C2185B] text-white py-20 lg:py-28 px-4 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 floral-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C2185B]/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-6">
              <span>💼 FOR WEDDING BUSINESS OWNERS</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1.15] drop-shadow-lg">
              Apne Wedding Business Ko <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-amber-300">
                Nayi Udaan Dein 🚀
              </span>
            </h1>

            <p className="text-white/90 text-lg sm:text-xl font-medium mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Become a ShaadiSaathi Vendor aur apne business ko grow karein ❤️
            </p>

            <p className="text-white/70 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Apni services ko thousands of wedding families ke saamne showcase karein, enquiries paayein aur apne business ko digital banayein.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={scrollToRegistration}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B38D22] hover:from-[#c49f2b] hover:to-[#9f7b19] text-gray-950 font-black rounded-full text-sm uppercase tracking-wider transition-all shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
              >
                Become a Vendor →
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-sm uppercase tracking-wider transition-all border border-white/30 backdrop-blur-md flex items-center justify-center min-h-[44px]"
              >
                How It Works
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/60 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-[#D4AF37]" /> Verified Lead Protection
              </span>
              <span className="flex items-center gap-2">
                <FiShield className="text-[#D4AF37]" /> 0% Hidden Commission
              </span>
              <span className="flex items-center gap-2">
                <FiAward className="text-[#D4AF37]" /> Dedicated Bihar Support
              </span>
            </div>
          </div>

          {/* Right Visual: Elegant Vendor Ecosystem with Floating Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md h-[400px] sm:h-[450px] rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2185B]/30 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38D22] flex items-center justify-center text-white font-black text-lg shadow-md">
                    S
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">ShaadiSaathi Ecosystem</h3>
                    <p className="text-xs text-white/60">India's Wedding Tech Network</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30">
                  ● LIVE
                </span>
              </div>

              {/* Grid of 8 Floating Ecosystem Categories */}
              <div className="grid grid-cols-2 gap-3 my-auto py-2">
                {[
                  { icon: '📸', name: 'Photographer', tag: 'High Inquiry' },
                  { icon: '🍽️', name: 'Caterer', tag: 'Mithila Special' },
                  { icon: '🏨', name: 'Wedding Venue', tag: 'Patna & Bihar' },
                  { icon: '🚗', name: 'Baraat Ride', tag: 'Luxury Cars' },
                  { icon: '💄', name: 'Makeup Artist', tag: 'Bridal Experts' },
                  { icon: '🎵', name: 'DJ & Sound', tag: 'Sangeet Nights' },
                  { icon: '🌸', name: 'Decorator', tag: 'Royal Mandap' },
                  { icon: '💌', name: 'Wedding Card', tag: 'Digital Invite' },
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.04, translateY: -2 }}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all flex items-center gap-3 cursor-pointer"
                    onClick={scrollToRegistration}
                  >
                    <span className="text-2xl">{card.icon}</span>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white text-xs truncate">{card.name}</p>
                      <p className="text-[10px] text-[#D4AF37] truncate">{card.tag}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span>Join our growing Bihar network</span>
                <span className="font-bold text-[#D4AF37]">Apply Now →</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. VENDOR CATEGORY SELECTOR ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-[#C2185B] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              CHOOSE YOUR BUSINESS TYPE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
              आप किस तरह का Wedding Business चलाते हैं?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Apni category select karein aur registration me direct aage badhein
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(categories || []).map((cat) => {
              const isSelected = form.category === cat._id;
              return (
                <motion.div
                  key={cat._id}
                  whileHover={{ y: -4 }}
                  onClick={() => handleCategorySelect(cat)}
                  className={`p-5 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center relative overflow-hidden group ${
                    isSelected
                      ? 'bg-pink-50/70 border-[#C2185B] shadow-lg'
                      : 'bg-gray-50/70 hover:bg-white border-gray-200 hover:border-pink-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    {cat.icon || '✨'}
                  </div>
                  <h3 className={`font-bold text-[13px] sm:text-[15px] mb-1 ${isSelected ? 'text-[#C2185B]' : 'text-gray-900'}`}>
                    {cat.name}
                  </h3>
                  {isSelected && (
                    <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C2185B] text-white font-bold text-[10px] uppercase tracking-wider">
                      <FiCheck size={12} /> Selected
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. WHY JOIN SHAADISAATHI ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-[#FFF8F0] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
              PARTNER ADVANTAGES
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mt-4 mb-4">
              ShaadiSaathi ke saath judne ke fayde
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Everything you need to showcase your work, win client trust, and multiply your bookings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {BENEFITS_LIST.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-pink-100/60 flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform" />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-3xl shadow-sm border border-pink-100">
                      {item.icon}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-[10px] uppercase tracking-wider border border-green-200">
                      ● {item.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-gray-900 text-xl mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 font-medium text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#C2185B]">
                  <span>Available in Vendor Portal</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS TIMELINE ────────────────────────────────────── */}
      <section ref={howItWorksRef} id="how-it-works" className="py-16 sm:py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#C2185B] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              EASY 4-STEP ONBOARDING
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Sirf 4 aasan steps me apni wedding services live karein
            </p>
          </div>

          {/* Timeline Wrapper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Horizontal dashed connector line on desktop */}
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#D4AF37] via-[#C2185B] to-[#D4AF37] border-t-2 border-dashed border-gray-300 pointer-events-none" />

            {[
              {
                stepNum: '01',
                icon: '📝',
                title: 'Register Your Business',
                desc: 'Fill your basic business and contact info in under 2 minutes.',
              },
              {
                stepNum: '02',
                icon: '📸',
                title: 'Create Your Profile',
                desc: 'Add starting pricing, service areas, and showcase your best work in the gallery.',
              },
              {
                stepNum: '03',
                icon: '✅',
                title: 'Get Verified',
                desc: 'Our team verifies your profile to award you the official Verified Business badge.',
              },
              {
                stepNum: '04',
                icon: '💍',
                title: 'Start Receiving Enquiries',
                desc: 'Connect directly with couples and grow your wedding bookings seamlessly.',
              },
            ].map((st, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-gray-50/80 rounded-3xl p-8 border border-gray-200/80 relative z-10 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white flex items-center justify-center text-3xl font-black shadow-lg mb-6 relative">
                  {st.icon}
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#D4AF37] text-gray-950 font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                    {st.stepNum}
                  </span>
                </div>

                <h3 className="font-display font-black text-gray-900 text-lg mb-2">
                  {st.title}
                </h3>
                <p className="text-gray-600 text-sm font-medium leading-relaxed">
                  {st.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={scrollToRegistration}
              className="px-8 py-4 rounded-full bg-[#C2185B] hover:bg-[#a3154d] text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 min-h-[44px]"
            >
              Start Onboarding Now →
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. VENDOR DASHBOARD PREVIEW ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
              POWERFUL DASHBOARD EXPERIENCE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 mb-4">
              Vendor Dashboard Preview
            </h2>
            <p className="text-white/80 text-base sm:text-lg">
              Explore how you will manage inquiries, bookings, portfolio, and earnings in real-time.
            </p>
          </div>

          {/* Interactive Mockup Container */}
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38D22] flex items-center justify-center text-gray-950 font-black text-xl">
                  V
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">ShaadiSaathi Vendor Portal</h3>
                  <p className="text-xs text-white/60">Verified Business Partner Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs uppercase tracking-wider border border-[#D4AF37]/40">
                  Sample Preview
                </span>
                <span className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-300 font-bold text-xs uppercase tracking-wider border border-green-500/30">
                  ● Live Sync
                </span>
              </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[
                { title: '📊 Business Overview', val: '1,420', sub: 'Profile Views (+28%)', bg: 'from-blue-500/20 to-blue-600/10' },
                { title: '📅 Upcoming Bookings', val: '12', sub: 'Confirmed Event Dates', bg: 'from-purple-500/20 to-purple-600/10' },
                { title: '💰 Earnings Tracked', val: '₹3,85,000', sub: 'Transparent Bookings', bg: 'from-amber-500/20 to-amber-600/10' },
                { title: '⭐ Verified Reviews', val: '4.9 / 5.0', sub: '48 Happy Couples', bg: 'from-pink-500/20 to-pink-600/10' },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${m.bg} border border-white/10 flex flex-col justify-between`}
                >
                  <p className="text-xs font-bold text-white/70 uppercase tracking-wider">{m.title}</p>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white my-2">{m.val}</p>
                  <p className="text-[11px] text-[#D4AF37] font-medium">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Interactive Preview Tabs */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Enquiries Column */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-white text-sm">📩 Recent Couple Enquiries</span>
                  <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                    3 New
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Rahul & Ananya', date: 'Dec 14, 2026', loc: 'Patna', type: 'Direct WhatsApp' },
                    { name: 'Amit & Sneha', date: 'Jan 22, 2027', loc: 'Muzaffarpur', type: 'Quote Request' },
                    { name: 'Vikram & Puja', date: 'Feb 10, 2027', loc: 'Gaya', type: 'Direct WhatsApp' },
                  ].map((lead, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-xs">{lead.name}</p>
                        <p className="text-[10px] text-white/60">{lead.date} • {lead.loc}</p>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded bg-green-500/20 text-green-300 font-bold">
                        {lead.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Preview Column */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-white text-sm">📸 Portfolio Showcase</span>
                  <span className="text-xs text-[#D4AF37] font-bold">18 Photos</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1545232972-9bb88a5e6d8a?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=300&q=80',
                  ].map((src, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10">
                      <img src={src} alt="Vendor Work" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Badge & Trust Column */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-white text-sm">✓ Partner Trust Score</span>
                    <span className="text-xs text-green-400 font-bold">100% Verified</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    Verified vendors get 3x higher direct WhatsApp inquiries and priority search ranking across Bihar.
                  </p>
                  <div className="space-y-2 text-xs text-white/80">
                    <div className="flex items-center gap-2"><FiCheckCircle className="text-[#D4AF37]" /> Instant SMS/WhatsApp lead alerts</div>
                    <div className="flex items-center gap-2"><FiCheckCircle className="text-[#D4AF37]" /> Customized package builder</div>
                    <div className="flex items-center gap-2"><FiCheckCircle className="text-[#D4AF37]" /> Direct couple review collection</div>
                  </div>
                </div>

                <button
                  onClick={scrollToRegistration}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-gray-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all text-center min-h-[44px]"
                >
                  Create Your Dashboard →
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 6. VENDOR SUCCESS STORY ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-white relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#C2185B] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              INSPIRING BIHAR ENTREPRENEURS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
              Your success story could be next ❤️
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              See how wedding partners from Patna to Darbhanga are growing their digital footprint.
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 via-white to-amber-50 rounded-[3rem] p-8 sm:p-12 border border-pink-200/70 shadow-xl grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                  alt="Rajesh Verma"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Rajesh Verma</h3>
              <p className="text-xs text-[#C2185B] font-bold">Verma Grand Palace & Lawn</p>
              <p className="text-[11px] text-gray-500 mt-1">Patna, Bihar • ShaadiSaathi Verified</p>
            </div>

            <div className="md:col-span-8">
              <div className="text-[#D4AF37] text-4xl mb-4">“</div>
              <p className="font-display font-medium text-gray-800 text-lg sm:text-xl leading-relaxed italic mb-6">
                ShaadiSaathi ke saath list karne ke baad hamaari booking requests 3x badh gayi hain. Pehle hum sirf Patna ke couples tak seemit the, ab pooray Mithila aur Bihar se direct enquiries aati hain without any middlemen!
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200/60">
                <div className="flex items-center gap-1 text-amber-500 text-sm">
                  <FiStar className="fill-amber-500" />
                  <FiStar className="fill-amber-500" />
                  <FiStar className="fill-amber-500" />
                  <FiStar className="fill-amber-500" />
                  <FiStar className="fill-amber-500" />
                  <span className="text-gray-700 font-bold ml-1">5.0 / 5.0</span>
                </div>
                <button
                  onClick={scrollToRegistration}
                  className="px-6 py-3 rounded-xl bg-[#C2185B] hover:bg-[#a3154d] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2 min-h-[44px]"
                >
                  Start Your Success Story →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. REGISTRATION CTA BANNER ──────────────────────────────────── */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 floral-pattern opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-3">
            Ready to Grow Your Wedding Business?
          </h2>
          <p className="text-pink-100 text-lg sm:text-xl font-medium mb-8">
            आज ही ShaadiSaathi के साथ जुड़ें और अपने business को digital बनाएं।
          </p>
          <button
            onClick={scrollToRegistration}
            className="px-10 py-5 rounded-full bg-[#D4AF37] hover:bg-[#c49f2b] text-gray-950 font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 min-h-[44px]"
          >
            Register Your Business →
          </button>
        </div>
      </section>

      {/* ── 8. VENDOR REGISTRATION FORM UI (MULTI-STEP) ─────────────────── */}
      <section ref={formSectionRef} id="vendor-registration" className="py-16 sm:py-24 px-4 bg-[#FFF8F0] relative">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#C2185B] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              OFFICIAL PARTNER ONBOARDING
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mt-4 mb-3">
              Become a ShaadiSaathi Vendor
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Complete this quick 5-step registration to activate your live partner listing.
            </p>
          </div>

          {/* Clean Step Progress Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-gray-200 mb-8 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px]">
              {[
                { s: 1, label: '1 Business' },
                { s: 2, label: '2 Contact' },
                { s: 3, label: '3 Details' },
                { s: 4, label: '4 Gallery' },
                { s: 5, label: '5 Submit' },
              ].map((item, idx, arr) => {
                const isActive = step === item.s;
                const isPassed = step > item.s;
                return (
                  <React.Fragment key={item.s}>
                    <div
                      onClick={() => {
                        if (isPassed) setStep(item.s);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                        isPassed ? 'cursor-pointer hover:bg-gray-50' : ''
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isActive
                            ? 'bg-[#C2185B] text-white shadow-md'
                            : isPassed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isPassed ? '✓' : item.s}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isActive ? 'text-[#C2185B]' : isPassed ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    {idx < arr.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                          step > item.s ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step Form Card */}
          <div className="bg-white rounded-[3rem] shadow-2xl border border-pink-100 p-6 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 rounded-bl-full opacity-40 pointer-events-none" />

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                
                {/* ── STEP 1: BUSINESS INFORMATION ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-gray-100 pb-4 mb-6">
                      <h3 className="font-display font-black text-2xl text-gray-900">
                        Step 1: Business Information
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        What is your wedding business called, and what category do you offer?
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Business Name <span className="text-[#C2185B]">*</span>
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={form.businessName}
                        onChange={handleChange}
                        placeholder="e.g. Verma Photography Studios"
                        className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                          errors.businessName ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                        } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all`}
                      />
                      {errors.businessName && (
                        <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                          <FiAlertCircle /> {errors.businessName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Business Category <span className="text-[#C2185B]">*</span>
                      </label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => ({ ...prev, category: val }));
                            const catObj = (categories || []).find((c) => c._id === val);
                            if (catObj) {
                              setVendorType(catObj.slug === 'cab-service' ? 'cab' : 'service');
                            }
                          }}
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all"
                        >
                          <option value="">Select Category</option>
                          {(categories || []).map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.icon || '✨'} {cat.name}
                            </option>
                          ))}
                        </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Short Business Description
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Tell couples what makes your wedding services special..."
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all"
                      />
                    </div>

                    <div className="pt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-4 rounded-2xl bg-[#C2185B] hover:bg-[#a3154d] text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all inline-flex items-center gap-2 min-h-[44px]"
                      >
                        Next: Contact Info →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: CONTACT INFORMATION ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-gray-100 pb-4 mb-6">
                      <h3 className="font-display font-black text-2xl text-gray-900">
                        Step 2: Contact Information
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        We will send couple inquiries and instant WhatsApp alerts to these details.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Contact Person Name <span className="text-[#C2185B]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Full Name"
                          className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                            errors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                          } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all`}
                        />
                        {errors.name && (
                          <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                            <FiAlertCircle /> {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Mobile Number <span className="text-[#C2185B]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number"
                          className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                            errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                          } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all`}
                        />
                        {errors.phone && (
                          <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                            <FiAlertCircle /> {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Business Email <span className="text-[#C2185B]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="vendor@business.com"
                          className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                            errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                          } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all`}
                        />
                        {errors.email && (
                          <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                            <FiAlertCircle /> {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          City / Primary Service Area <span className="text-[#C2185B]">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="e.g. Patna, Muzaffarpur, All Bihar"
                          className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                            errors.city ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                          } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all`}
                        />
                        {errors.city && (
                          <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                            <FiAlertCircle /> {errors.city}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm uppercase tracking-wider transition-all min-h-[44px]"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-4 rounded-2xl bg-[#C2185B] hover:bg-[#a3154d] text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all inline-flex items-center gap-2 min-h-[44px]"
                      >
                        Next: Business Details →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: BUSINESS DETAILS ── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-gray-100 pb-4 mb-6">
                      <h3 className="font-display font-black text-2xl text-gray-900">
                        Step 3: Business Details & Pricing
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Couples look for transparent starting pricing when filtering wedding vendors.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Starting Price (₹) <span className="text-[#C2185B]">*</span>
                        </label>
                        <input
                          type="number"
                          name="startingPrice"
                          value={form.startingPrice}
                          onChange={handleChange}
                          placeholder="e.g. 25000"
                          className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                            errors.startingPrice ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                          } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all`}
                        />
                        {errors.startingPrice && (
                          <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                            <FiAlertCircle /> {errors.startingPrice}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Years of Experience
                        </label>
                        <select
                          name="experience"
                          value={form.experience}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all"
                        >
                          <option value="1-2 Years">1-2 Years</option>
                          <option value="3-5 Years">3-5 Years</option>
                          <option value="5+ Years">5+ Years</option>
                          <option value="10+ Years">10+ Years (Established)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Services Offered (Select all that apply)
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[
                          'Custom Packages',
                          'Direct WhatsApp Inquiry',
                          'Advance Booking',
                          'On-site Event Service',
                          'Online Consultation',
                          'Verified Guarantee',
                          'Refund & Reschedule Policy',
                        ].map((srv, idx) => {
                          const active = form.services.includes(srv);
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => toggleServicePill(srv)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                active
                                  ? 'bg-[#C2185B] text-white shadow-md'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <FiCheck size={14} /> {srv}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm uppercase tracking-wider transition-all min-h-[44px]"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-4 rounded-2xl bg-[#C2185B] hover:bg-[#a3154d] text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all inline-flex items-center gap-2 min-h-[44px]"
                      >
                        Next: Business Media →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: BUSINESS MEDIA ── */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-gray-100 pb-4 mb-6">
                      <h3 className="font-display font-black text-2xl text-gray-900">
                        Step 4: Business Media & Portfolio
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        You can upload your real logo and portfolio photos right now or complete them from your Vendor Dashboard anytime!
                      </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-pink-50/60 border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#C2185B] text-white flex items-center justify-center text-2xl flex-shrink-0">
                          📸
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Upload Photos in Vendor Dashboard</p>
                          <p className="text-xs text-gray-600">
                            Once your account is created, our integrated Cloudinary uploader lets you add unlimited high-res gallery pictures.
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-white text-[#C2185B] font-bold text-xs shadow-sm border border-pink-100 whitespace-nowrap">
                        ✓ Ready to Link
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
                        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
                        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
                      ].map((img, idx) => (
                        <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-gray-200 relative group">
                          <img src={img} alt="Sample Portfolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Preview Sample</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm uppercase tracking-wider transition-all min-h-[44px]"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-4 rounded-2xl bg-[#C2185B] hover:bg-[#a3154d] text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all inline-flex items-center gap-2 min-h-[44px]"
                      >
                        Next: Review & Submit →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 5: REVIEW & SUBMIT ── */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-gray-100 pb-4 mb-6">
                      <h3 className="font-display font-black text-2xl text-gray-900">
                        Step 5: Review & Create Partner Account
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Verify your details below and set a secure password for your vendor portal.
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200 grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Business Name</p>
                        <p className="font-bold text-gray-900">{form.businessName || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Category</p>
                        <p className="font-bold text-gray-900">{(categories || []).find(c => c._id === form.category)?.name || form.category} ({vendorType === 'cab' ? 'Baraat Cab' : 'Service Provider'})</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Contact Person</p>
                        <p className="font-bold text-gray-900">{form.name || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Mobile Number</p>
                        <p className="font-bold text-gray-900">{form.phone || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                        <p className="font-bold text-gray-900">{form.email || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Primary City</p>
                        <p className="font-bold text-gray-900">{form.city || 'Patna'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs font-bold text-gray-400 uppercase">Starting Price</p>
                        <p className="font-bold text-[#C2185B]">₹{form.startingPrice || '0'} / event</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Create Password <span className="text-[#C2185B]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                              errors.password ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                            } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPass ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                            <FiAlertCircle /> {errors.password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Confirm Password <span className="text-[#C2185B]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPass ? 'text' : 'password'}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                            className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${
                              errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                            } text-gray-900 font-medium focus:outline-none focus:border-[#C2185B] transition-all pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPass ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                            <FiAlertCircle /> {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={form.agreeTerms}
                          onChange={handleChange}
                          className="w-5 h-5 rounded text-[#C2185B] focus:ring-[#C2185B]"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          I agree to ShaadiSaathi Partner Terms & Conditions and Verified Business Guidelines
                        </span>
                      </label>
                      {errors.agreeTerms && (
                        <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                          <FiAlertCircle /> {errors.agreeTerms}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm uppercase tracking-wider transition-all min-h-[44px]"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#B38D22] hover:opacity-95 text-gray-950 font-black text-sm uppercase tracking-wider shadow-xl transition-all disabled:opacity-60 min-h-[44px]"
                      >
                        {loading ? 'Creating Partner Account...' : 'Create Partner Account & Start Growing 🚀'}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </div>
        </div>
      </section>

      {/* ── 9. TRUST & VERIFICATION ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-50 px-4 py-1.5 rounded-full border border-green-200">
              SAFETY & AUTHENTICITY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
              Build Trust With Your Customers
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Couples trust ShaadiSaathi because every vendor profile is verified for authenticity and excellence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '✓',
                title: 'Verified Business Profile',
                desc: 'Stand out with our official checkmark badge that tells families your business is authentic.',
              },
              {
                icon: '✓',
                title: 'Authentic Business Information',
                desc: 'Verified phone & email onboarding ensures direct, trustworthy customer connections.',
              },
              {
                icon: '✓',
                title: 'Customer Reviews',
                desc: 'Collect and display genuine ratings from verified couples to build your credibility.',
              },
              {
                icon: '✓',
                title: 'Professional Gallery',
                desc: 'High-definition portfolio showcase with transparent package & pricing details.',
              },
            ].map((tv, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-green-50/50 rounded-3xl p-6 sm:p-8 border border-green-200/60 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500 text-white font-black text-xl shadow-md mb-6">
                    {tv.icon}
                  </span>
                  <h3 className="font-display font-black text-gray-900 text-lg mb-2">
                    {tv.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">
                    {tv.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-green-200/40 text-xs font-bold text-green-700 uppercase tracking-wider">
                  Verified Feature
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. PRICING / COMMISSION ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-[#FFF8F0] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
              TRANSPARENT PARTNERSHIP
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
              Simple, Transparent Partnership
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              No hidden charges. Choose a partnership plan that fits your wedding business.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-[3rem] p-8 sm:p-10 border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider">
                  Free Forever
                </span>
                <h3 className="font-display font-black text-2xl text-gray-900 mt-4">Starter Partner</h3>
                <p className="text-3xl font-black text-[#C2185B] my-4">₹0 <span className="text-sm text-gray-500 font-medium">/ month</span></p>
                <p className="text-gray-600 text-sm mb-6">Basic visibility and direct inquiry access for new wedding vendors.</p>
                <ul className="space-y-3 text-sm text-gray-700 mb-8">
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-green-500" /> Basic Business Listing</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-green-500" /> Direct WhatsApp & Phone Inquiries</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-green-500" /> Up to 10 Portfolio Gallery Photos</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-green-500" /> Standard Search Appearance</li>
                </ul>
              </div>
              <button
                onClick={scrollToRegistration}
                className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider transition-all min-h-[44px]"
              >
                Get Started Free →
              </button>
            </div>

            {/* Featured Plan */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[3rem] p-8 sm:p-10 border-2 border-[#D4AF37] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#D4AF37] to-[#B38D22] text-gray-950 font-black text-[10px] uppercase tracking-widest py-1.5 px-6 rounded-bl-2xl">
                RECOMMENDED
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs uppercase tracking-wider border border-[#D4AF37]/40">
                  Flexible Plans Coming Soon
                </span>
                <h3 className="font-display font-black text-2xl text-white mt-4">Featured Partner</h3>
                <p className="text-3xl font-black text-[#D4AF37] my-4">Custom <span className="text-sm text-white/60 font-medium">/ category</span></p>
                <p className="text-white/80 text-sm mb-6">Priority ranking and verified trust badge across Bihar wedding searches.</p>
                <ul className="space-y-3 text-sm text-white/90 mb-8">
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#D4AF37]" /> Official "ShaadiSaathi Verified" Badge</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#D4AF37]" /> Top Search Ranking & Featured Pill</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#D4AF37]" /> Unlimited HD Portfolio & Video Links</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#D4AF37]" /> Real-Time Analytics Dashboard</li>
                </ul>
              </div>
              <button
                onClick={scrollToRegistration}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-gray-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all min-h-[44px]"
              >
                Register For Priority Access →
              </button>
            </div>

            {/* Enterprise & City Partner */}
            <div className="bg-white rounded-[3rem] p-8 sm:p-10 border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-pink-50 text-[#C2185B] font-bold text-xs uppercase tracking-wider border border-pink-100">
                  City Exclusive
                </span>
                <h3 className="font-display font-black text-2xl text-gray-900 mt-4">Enterprise Partner</h3>
                <p className="text-2xl font-black text-gray-900 my-4">Contact Vendor Team</p>
                <p className="text-gray-600 text-sm mb-6">For large venues, resort chains, and multi-city Baraat Cab fleets.</p>
                <ul className="space-y-3 text-sm text-gray-700 mb-8">
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#C2185B]" /> Dedicated Relationship Manager</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#C2185B]" /> Homepage Carousel Sponsorship</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#C2185B]" /> Zero Commission Verified Leads</li>
                  <li className="flex items-center gap-2 font-medium"><FiCheck className="text-[#C2185B]" /> Custom Marketing & Social Promotions</li>
                </ul>
              </div>
              <Link
                to="/contact"
                className="w-full py-4 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#C2185B] font-bold text-xs uppercase tracking-wider transition-all text-center block min-h-[44px] flex items-center justify-center"
              >
                Contact Our Vendor Team →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ACCORDION ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#C2185B] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
              Everything You Need to Know
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Got questions about listing your wedding business? We have answers.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200/80 bg-gray-50/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left font-display font-bold text-gray-900 text-base sm:text-lg flex items-center justify-between gap-4"
                  >
                    <span>{item.q}</span>
                    <span className="text-[#C2185B] flex-shrink-0">
                      {isOpen ? <FiChevronUp size={22} /> : <FiChevronDown size={22} />}
                    </span>
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-5 pb-6 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-200/40 pt-4"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 12. FINAL CTA ───────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#C2185B] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 floral-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight drop-shadow-lg">
            Your Business. <br />
            Your Brand. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-200 to-yellow-300">
              Your Growth.
            </span> <br />
            With ShaadiSaathi. ❤️
          </h2>

          <p className="text-white/80 text-lg sm:text-xl font-medium mb-10 max-w-2xl mx-auto">
            ShaadiSaathi par apna business list karein, naye customers tak pahunchayein aur apna wedding business grow karein.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToRegistration}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B38D22] hover:from-[#c49f2b] hover:to-[#9f7b19] text-gray-950 font-black rounded-full text-sm uppercase tracking-wider transition-all shadow-xl hover:scale-105 min-h-[44px]"
            >
              Become a Vendor
            </button>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-sm uppercase tracking-wider transition-all border border-white/30 backdrop-blur-md text-center min-h-[44px] flex items-center justify-center"
            >
              Talk to Our Team
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold rounded-full text-sm uppercase tracking-wider transition-all border border-white/20 text-center min-h-[44px] flex items-center justify-center"
            >
              Already a Vendor? Login →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
