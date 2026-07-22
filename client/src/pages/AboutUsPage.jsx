import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiSearch, FiCheckCircle, FiShield, FiHeart, FiStar, FiMapPin, FiTruck, FiPlay, FiChevronRight, FiChevronLeft, FiArrowRight
} from 'react-icons/fi';
import { FaCrown, FaCarSide, FaHandshake, FaGlobe, FaBus, FaCar } from 'react-icons/fa';

export default function AboutUsPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "About Us - ShaadiSaathi | Bihar's Premium Wedding Marketplace";
    window.scrollTo(0, 0);
  }, []);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeCab, setActiveCab] = useState(0);

  const stats = [
    { value: '10+', label: 'Vendors' },
    { value: '50+', label: 'Weddings' },
    { value: '1+', label: 'Cities' },
    { value: '24×7', label: 'Support' }
  ];

  const storyTimeline = [
    { year: '2023', title: 'The Spark', desc: 'Realized the massive fragmentation in Bihar\'s wedding planning.' },
    { year: '2024', title: 'Platform Launch', desc: 'Launched ShaadiSaathi to connect verified vendors with families.' },
    { year: '2025', title: 'Baraat Cabs Introduced', desc: 'Pioneered Bihar’s first premium fleet booking for weddings.' },
    { year: '2026', title: 'Statewide Scale', desc: 'Expanding to 38 districts with an AI-driven planning ecosystem.' }
  ];

  const bentoItems = [
    { title: 'Luxury Baraat Cabs', desc: 'Arrive like royalty in our premium fleet.', span: 'md:col-span-2 md:row-span-2', bg: 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]', text: 'text-white', icon: <FaCrown className="text-[#D4AF37]" /> },
    { title: 'Verified Vendors', desc: 'Strict 5-step quality checks.', span: 'md:col-span-1 md:row-span-1', bg: 'bg-white', text: 'text-gray-900', icon: <FiCheckCircle className="text-[#C2185B]" /> },
    { title: 'AI Planner', desc: 'Smart budget & itinerary generation.', span: 'md:col-span-1 md:row-span-1', bg: 'bg-gradient-to-br from-pink-50 to-white', text: 'text-gray-900', icon: <FiStar className="text-[#C2185B]" /> },
    { title: 'Secure Payments', desc: '100% safe milestone payments.', span: 'md:col-span-1 md:row-span-1', bg: 'bg-white', text: 'text-gray-900', icon: <FiShield className="text-[#C2185B]" /> },
    { title: 'Dedicated Support', desc: 'Your personal wedding concierges.', span: 'md:col-span-1 md:row-span-1', bg: 'bg-[#C2185B]', text: 'text-white', icon: <FiHeart className="text-white" /> },
  ];

  const baraatCabs = [
    { name: 'BMW 5 Series', type: 'Luxury Arrival', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
    { name: 'Audi A6', type: 'Premium Sedan', img: '/images/baraat/audi_wedding.png' },
    { name: 'Fortuner Royal', type: 'SUV Convoy', img: '/images/baraat/fortuner_wedding.png' },
    { name: 'Scorpio Classic', type: 'Baraat VIP', img: '/images/baraat/scorpio_wedding.png' },
    { name: 'Innova Crysta', type: 'Family Comfort', img: '/images/baraat/innova_wedding.png' },
    { name: 'Luxury Bus', type: 'Mass Transit', img: '/images/baraat/luxury_bus_wedding.png' },
    { name: 'Tempo Traveller', type: 'Group Convoy', img: '/images/baraat/tempo_traveller_wedding.png' }
  ];

  const testimonials = [
    { name: 'Rahul & Neha', text: 'ShaadiSaathi made our wedding effortless. The Baraat Cab service was impeccable—our Fortuner arrived beautifully decorated and right on time!', rating: 5, city: 'Patna' },
    { name: 'Priya & Aman', text: 'We booked our entire photography and catering team through the platform. The AI planner kept us perfectly on budget. Highly recommended!', rating: 5, city: 'Gaya' },
    { name: 'Vikram Singh', text: 'Renting a luxury bus for my sister\'s baraat was a breeze. Live tracking gave us total peace of mind during the chaotic wedding day.', rating: 5, city: 'Muzaffarpur' }
  ];

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const nextCab = () => setActiveCab((prev) => (prev + 1) % baraatCabs.length);
  const prevCab = () => setActiveCab((prev) => (prev - 1 + baraatCabs.length) % baraatCabs.length);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans selection:bg-[#C2185B] selection:text-white overflow-hidden">

      {/* 1. HERO SECTION (Full-screen) */}
      <section className="relative w-full h-[100svh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&w=2500&q=80')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />

        {/* Floating Elements */}
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-[10%] w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl" />
        <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 right-[10%] w-32 h-32 bg-[#C2185B]/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full flex flex-col items-center text-center mt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-full mb-8 shadow-2xl">
            <FaCrown className="text-[#D4AF37]" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Bihar's Next Gen Wedding Tech</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-6 drop-shadow-2xl max-w-5xl">
            Making Every Bihar Wedding <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] italic block sm:inline">Stress-Free & Memorable</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-2xl text-gray-200 font-medium max-w-3xl mb-12 drop-shadow-md">
            Find trusted vendors, book luxury Baraat Cabs, and plan your dream wedding from one intuitive platform.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/services" className="w-full sm:w-auto bg-white text-black font-black uppercase tracking-widest text-xs px-10 py-5 rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              <FiSearch className="text-lg" /> Find Vendors
            </Link>
            <Link to="/baraat-cabs" className="w-full sm:w-auto bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-black font-black uppercase tracking-widest text-xs px-10 py-5 rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(212,175,55,0.3)]">
              <FaCarSide className="text-lg" /> Book Baraat Cab
            </Link>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center gap-3">
              <FiPlay className="text-lg" /> Watch Our Story
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="absolute bottom-10 left-0 w-full px-4 hidden md:block">
            <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4 divide-x divide-white/10 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. OUR STORY (Premium Timeline) */}
      <section className="py-24 md:py-40 px-4 max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-4 dark:text-white tracking-tight">Our <span className="text-[#C2185B] italic">Journey</span></h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">From a simple idea to Bihar's most advanced wedding technology platform.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-pink-200 dark:via-pink-900 to-transparent md:-translate-x-1/2" />

          <div className="space-y-12 md:space-y-24">
            {storyTimeline.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className={`flex flex-col md:flex-row items-center justify-between ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''} relative`}>
                <div className="w-full md:w-5/12 pl-12 md:pl-0" />

                {/* Marker */}
                <div className="absolute left-[20px] md:left-1/2 w-10 h-10 bg-white dark:bg-black border-4 border-[#C2185B] rounded-full shadow-xl -translate-x-1/2 flex items-center justify-center z-10">
                  <div className="w-3 h-3 bg-[#D4AF37] rounded-full" />
                </div>

                <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 hover:-translate-y-2 transition-transform">
                    <div className="text-[#D4AF37] font-black text-2xl mb-2">{item.year}</div>
                    <h3 className="font-display text-2xl font-black mb-3 dark:text-white">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MISSION & VISION (Split Cards) */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-[#111]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white dark:bg-[#1a1a1a] p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-[#C2185B]/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <FiSearch className="text-4xl sm:text-6xl text-[#C2185B] mb-6 sm:mb-8" />
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-4 dark:text-white">Our Mission</h3>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-8">To bring transparency, trust, and zero-stress planning to every family in Bihar organizing a wedding.</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-pink-50 dark:bg-pink-900/20 text-[#C2185B] text-sm font-bold rounded-full">Trust</span>
              <span className="px-4 py-2 bg-pink-50 dark:bg-pink-900/20 text-[#C2185B] text-sm font-bold rounded-full">Transparency</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-[#1a1a1a] to-[#050505] text-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-[#D4AF37]/10 rounded-bl-full transition-transform group-hover:scale-110" />
            <FiStar className="text-4xl sm:text-6xl text-[#D4AF37] mb-6 sm:mb-8" />
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-4">Our Vision</h3>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">To become the absolute standard for premium wedding technology and luxury event transportation globally.</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-bold rounded-full">Innovation</span>
              <span className="px-4 py-2 bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-bold rounded-full">Customer First</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. WHAT MAKES US DIFFERENT (Premium Bento Grid) */}
      <section className="py-24 md:py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-4 dark:text-white tracking-tight">The ShaadiSaathi <span className="text-[#C2185B] italic">Edge</span></h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Why thousands of couples trust us with their most important day.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
          {bentoItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`${item.span} ${item.bg} rounded-[2rem] p-8 flex flex-col justify-between shadow-lg border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-transform`}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div>
                <h3 className={`font-display text-2xl font-black mb-2 ${item.text}`}>{item.title}</h3>
                <p className={`${item.text} opacity-80 text-sm md:text-base`}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. BARAAT CABS SHOWCASE (Most Premium Section) */}
      <section className="py-32 relative bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] px-6 py-2 rounded-full mb-6">
              <FaCrown />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Signature Service</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-black text-white mb-6">Luxury <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] italic">Baraat Cabs</span></h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">Bihar's first and largest dedicated wedding fleet booking platform. Real-time availability, verified drivers, and immaculate luxury vehicles.</p>
          </div>

          {/* Custom Carousel */}
          <div className="relative max-w-5xl mx-auto h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeCab}
                src={baraatCabs[activeCab].img}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
              <div>
                <motion.div key={`type-${activeCab}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-2">
                  {baraatCabs[activeCab].type}
                </motion.div>
                <motion.h3 key={`name-${activeCab}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl font-black text-white">
                  {baraatCabs[activeCab].name}
                </motion.h3>
              </div>

              <div className="flex gap-4">
                <button onClick={prevCab} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-black transition-colors border border-white/20">
                  <FiChevronLeft className="text-2xl" />
                </button>
                <button onClick={nextCab} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-black transition-colors border border-white/20">
                  <FiChevronRight className="text-2xl" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {['Live Tracking', 'WhatsApp Updates', 'Driver Verification', 'Wedding Decoration', 'Bulk Fleet'].map((feat, i) => (
              <span key={i} className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-2xl backdrop-blur-sm text-sm">
                <FiCheckCircle className="inline text-[#D4AF37] mr-2" /> {feat}
              </span>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/baraat-cabs" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-black font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform">
              Book Your Royal Fleet <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. HOW SHAADISAATHI WORKS (Interactive Timeline) */}
      <section className="py-24 md:py-32 px-4 bg-gray-50 dark:bg-[#111]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-black mb-16 dark:text-white">How It <span className="text-[#C2185B] italic">Works</span></h2>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-4 relative">
            {/* Desktop Connect Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-transparent via-[#C2185B]/30 to-transparent z-0" />

            {[
              { step: '01', title: 'Search Vendors', desc: 'Find top-rated professionals in your city.', icon: <FiSearch /> },
              { step: '02', title: 'Compare Packages', desc: 'Transparent pricing with no hidden fees.', icon: <FiStar /> },
              { step: '03', title: 'Book Instantly', desc: 'Secure milestone-based payments.', icon: <FiShield /> },
              { step: '04', title: 'Enjoy The Day', desc: 'We handle the stress, you enjoy.', icon: <FiHeart /> }
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }} className="w-full md:w-1/4 relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white dark:bg-[#1a1a1a] rounded-[2rem] shadow-xl border border-pink-100 dark:border-white/5 flex items-center justify-center text-3xl text-[#C2185B] mb-6 relative group hover:-translate-y-2 transition-transform">
                  {item.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#D4AF37] text-white text-xs font-black rounded-full flex items-center justify-center shadow-md">
                    {item.step}
                  </div>
                </div>
                <h4 className="font-black text-xl mb-2 dark:text-white">{item.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER TESTIMONIALS (Slider) */}
      <section className="py-24 md:py-32 px-4 overflow-hidden dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-black mb-16 dark:text-white">Couples <span className="text-[#C2185B] italic">Love Us</span></h2>

          <div className="relative bg-white dark:bg-[#111] p-8 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="text-6xl text-[#D4AF37]/20 absolute top-8 left-8 font-serif">"</div>
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => <FiStar key={i} className="text-[#D4AF37] fill-[#D4AF37] text-xl" />)}
                </div>
                <p className="text-xl md:text-3xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-8 italic">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div>
                  <h4 className="font-black text-lg dark:text-white">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-sm text-[#C2185B] font-bold uppercase tracking-widest">{testimonials[activeTestimonial].city}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-4 mt-10">
              <button onClick={prevTestimonial} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-[#C2185B] hover:text-white transition-colors">
                <FiChevronLeft className="text-xl" />
              </button>
              <button onClick={nextTestimonial} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-[#C2185B] hover:text-white transition-colors">
                <FiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. BIHAR COVERAGE MAP (Stylized UI) */}
      <section className="py-24 bg-[#C2185B] text-white px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-20 mix-blend-overlay" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-1/2">
            <h2 className="font-display text-4xl md:text-6xl font-black mb-6">Expanding Across <br /><span className="text-[#D4AF37] italic">Bihar</span></h2>
            <p className="text-pink-100 text-lg mb-8 max-w-md">Currently operating in 10+ cities across Bihar. Our vision is to reach every district, making premium wedding services accessible everywhere.</p>
            <div className="grid grid-cols-2 gap-6">
              {['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia'].map((city, i) => (
                <div key={i} className="flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <FiMapPin className="text-[#D4AF37]" /> {city}
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center relative">
            <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-white/5 border-[10px] border-white/10 relative flex items-center justify-center">
              <FaGlobe className="text-9xl text-white/20" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-4 h-4 bg-[#D4AF37] rounded-full top-[30%] left-[40%]" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} className="absolute w-4 h-4 bg-[#D4AF37] rounded-full top-[50%] left-[30%]" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, delay: 1, repeat: Infinity }} className="absolute w-4 h-4 bg-[#D4AF37] rounded-full top-[60%] right-[30%]" />
            </div>
          </div>
        </div>
      </section>

      {/* 10. CTA SECTION */}
      <section className="py-32 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-[#0a0a0a] dark:to-[#111]">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white dark:bg-[#1a1a1a] border border-pink-100 dark:border-white/10 p-12 md:p-20 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <FaCrown className="text-5xl text-[#D4AF37] mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black mb-6 dark:text-white">Ready To Plan Your <br /><span className="text-[#C2185B] italic">Dream Wedding?</span></h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 max-w-2xl mx-auto">Join thousands of couples who have trusted ShaadiSaathi for a flawless wedding experience.</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/services" className="bg-[#C2185B] text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-full hover:bg-[#8E244D] hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(194,24,91,0.3)]">
                Find Vendors
              </Link>
              <Link to="/baraat-cabs" className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-black font-black uppercase tracking-widest text-xs px-10 py-5 rounded-full hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
                Book Baraat Cab
              </Link>
              <Link to="/register/vendor" className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 hover:-translate-y-1 transition-all">
                Become a Partner
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
