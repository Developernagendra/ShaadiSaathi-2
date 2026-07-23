import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../utils/api';

// Madhubani subtle decorative border SVG
const MadhubaniBorder = () => (
  <svg className="w-full h-auto text-[#D4AF37] opacity-60" viewBox="0 0 400 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 10 Q20 20 40 10 T80 10 T120 10 T160 10 T200 10 T240 10 T280 10 T320 10 T360 10 T400 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="20" cy="10" r="3" fill="currentColor" />
    <circle cx="60" cy="10" r="3" fill="currentColor" />
    <circle cx="100" cy="10" r="3" fill="currentColor" />
    <circle cx="140" cy="10" r="3" fill="currentColor" />
    <circle cx="180" cy="10" r="3" fill="currentColor" />
    <circle cx="220" cy="10" r="3" fill="currentColor" />
    <circle cx="260" cy="10" r="3" fill="currentColor" />
    <circle cx="300" cy="10" r="3" fill="currentColor" />
    <circle cx="340" cy="10" r="3" fill="currentColor" />
    <circle cx="380" cy="10" r="3" fill="currentColor" />
  </svg>
);

// Curved Text for Trust Ring
const CircularText = ({ text }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 200 200">
        <path id="textPath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="none" />
        <text className="text-[14px] font-bold fill-[#1e3a8a] tracking-[4px] uppercase">
          <textPath href="#textPath" startOffset="0%">{text}</textPath>
        </text>
      </svg>
    </div>
  );
};

export default function PremiumTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Trust Stats (Configurable/Placeholder)
  const stats = [
    { value: "10+", label: "Verified Vendors" },
    { value: "10+", label: "Successful Bookings" },
    { value: "4.9/5", label: "Couple Rating" }
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/features/testimonials');
      if (res.data?.success && res.data.data?.length > 0) {
        setTestimonials(res.data.data);
      } else {
        // Graceful empty state with dummy data if API fails or is empty
        setTestimonials([
          {
            _id: '1',
            brideName: 'Priya',
            groomName: 'Rahul',
            city: 'Patna',
            review: 'ShaadiSaathi ने हमारी शादी की सारी planning बहुत आसान कर दी। Vendor से लेकर booking तक सब कुछ एक ही जगह मिल गया।',
            rating: 5,
            isVerified: true,
            image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=400',
            year: '2023'
          },
          {
            _id: '2',
            brideName: 'Anjali',
            groomName: 'Vikram',
            city: 'Muzaffarpur',
            review: 'The best wedding platform for Bihar! We found our dream venue and the most amazing photographer through ShaadiSaathi.',
            rating: 5,
            isVerified: true,
            image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
            year: '2024'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials', err);
      // Fallback
      setTestimonials([
        {
          _id: '1',
          brideName: 'Priya',
          groomName: 'Rahul',
          city: 'Patna',
          review: 'ShaadiSaathi ने हमारी शादी की सारी planning बहुत आसान कर दी। Vendor से लेकर booking तक सब कुछ एक ही जगह मिल गया।',
          rating: 5,
          isVerified: true,
          image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=400',
          year: '2023'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-play
  useEffect(() => {
    if (testimonials.length <= 1 || isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, isHovered, nextSlide]);

  const handleDragEnd = (e, { offset }) => {
    const swipe = offset.x;
    if (swipe < -50) {
      nextSlide();
    } else if (swipe > 50) {
      prevSlide();
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading Testimonials...</div>;
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-[#fdfbf7]">
      {/* ── BACKGROUND DECORATIONS ── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-[#e0f2fe]/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-[#fbcfe8]/40 rounded-full blur-[100px]" />

        {/* Floating Sparkles & Hearts */}
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-[20%] left-[5%] text-xl">✨</motion.div>
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-[20%] right-[5%] text-2xl">❤️</motion.div>
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute top-[10%] right-[30%] text-xl">🌸</motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── LEFT: HEADLINE ── */}
          <div className="lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <FiCheckCircle className="text-sm" /> Trusted Wedding Partner
            </div>

            <h2 className="font-display text-4xl lg:text-5xl font-black text-[#1e3a8a] mb-6 leading-tight">
              हज़ारों कपल्स का भरोसा ❤️
            </h2>

            <p className="text-gray-600 text-lg lg:text-xl font-medium mb-8 leading-relaxed max-w-md">
              ShaadiSaathi के साथ, आपकी शादी की हर तैयारी आसान, भरोसेमंद और यादगार।
            </p>

            <div className="w-48 opacity-70 hidden lg:block">
              <MadhubaniBorder />
            </div>
          </div>

          {/* ── CENTER: TRUST VISUAL & STATS ── */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center">
            {/* Animated Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#1e3a8a]/20 animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-[#D4AF37]/40" />
              <CircularText text="• Couples Trust ShaadiSaathi ❤️ • Couples Trust ShaadiSaathi ❤️ " />

              <div className="relative z-10 bg-white w-40 h-40 rounded-full shadow-[0_10px_30px_rgba(30,58,138,0.1)] flex flex-col items-center justify-center border-4 border-[#e0f2fe]">
                <span className="text-3xl font-black text-[#C2185B]">10+</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">Happy<br />Couples</span>
              </div>
            </div>

            {/* Other Stats Grid */}
            <div className="flex flex-col gap-4 w-full max-w-[250px]">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <span className="font-bold text-[#1e3a8a] text-lg">{stat.value}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-right w-20 leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: TESTIMONIAL CAROUSEL ── */}
          <div
            className="lg:col-span-5 relative w-full h-[450px] sm:h-[400px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing pb-12"
              >
                <div className="bg-white h-full rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#D4AF37]/20 flex flex-col relative overflow-hidden">

                  {/* Card Madhubani Deco Top/Bottom */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 opacity-30 mt-2">
                    <MadhubaniBorder />
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 opacity-30 mb-2 rotate-180">
                    <MadhubaniBorder />
                  </div>

                  {/* Header: Avatar & Info */}
                  <div className="flex items-center gap-4 mb-6 relative z-10 pt-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#D4AF37] overflow-hidden shrink-0 shadow-md">
                      <img
                        src={testimonials[currentIndex]?.image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80'}
                        alt="Couple"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xl text-[#1e3a8a] leading-none mb-1">
                        {testimonials[currentIndex]?.brideName} &amp; {testimonials[currentIndex]?.groomName}
                      </h4>
                      <p className="text-gray-500 text-sm font-medium">
                        {testimonials[currentIndex]?.city} {testimonials[currentIndex]?.year && `• ${testimonials[currentIndex].year}`}
                      </p>
                    </div>
                  </div>

                  {/* Rating & Verified */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex gap-1">
                      {[...Array(testimonials[currentIndex]?.rating || 5)].map((_, i) => (
                        <FiStar key={i} className="text-[#D4AF37] fill-current text-lg" />
                      ))}
                    </div>
                    {testimonials[currentIndex]?.isVerified && (
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <FiCheckCircle /> Verified
                      </div>
                    )}
                  </div>

                  {/* Review Text */}
                  <div className="flex-1 relative z-10 flex items-center">
                    <p className="text-gray-700 text-base sm:text-lg italic font-medium leading-relaxed">
                      "{testimonials[currentIndex]?.review}"
                    </p>
                  </div>

                  {/* Decorative Quote */}
                  <div className="absolute bottom-4 right-6 text-8xl text-[#e0f2fe] font-serif leading-none select-none z-0">
                    "
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-0 left-0 w-full flex items-center justify-between px-4 z-20">
              <button
                onClick={prevSlide}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              >
                <FiChevronLeft className="text-xl" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === currentIndex ? 'bg-[#C2185B] w-6' : 'bg-gray-300 w-2'}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              >
                <FiChevronRight className="text-xl" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
