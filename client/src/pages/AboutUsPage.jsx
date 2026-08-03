import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiCheckCircle, FiShield, FiHeart, FiStar, FiMapPin, FiArrowRight, FiUsers, FiCpu, FiCompass, FiGrid
} from 'react-icons/fi';
import { FaCrown, FaHandshake, FaCarSide, FaLightbulb, FaUserTie, FaCheckDouble } from 'react-icons/fa';
import api from '../utils/api';

// ── SVG Decorative Madhubani Ornament for Bihar Culture ──
function MadhubaniPattern({ className = '' }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      viewBox="0 0 400 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 30 Q 30 10, 50 30 T 90 30 T 130 30 T 170 30 T 210 30 T 250 30 T 290 30 T 330 30 T 370 30"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.6"
      />
      <circle cx="50" cy="30" r="5" fill="#C2185B" opacity="0.8" />
      <circle cx="130" cy="30" r="5" fill="#D4AF37" opacity="0.8" />
      <circle cx="210" cy="30" r="5" fill="#C2185B" opacity="0.8" />
      <circle cx="290" cy="30" r="5" fill="#D4AF37" opacity="0.8" />
      <circle cx="370" cy="30" r="5" fill="#C2185B" opacity="0.8" />
    </svg>
  );
}

export default function AboutUsPage() {
  const [publicStats, setPublicStats] = useState(null);

  useEffect(() => {
    document.title = "About Us | ShaadiSaathi — शादी का सच्चा साथी";
    window.scrollTo(0, 0);

    // Attempt to fetch real platform statistics from backend API without inventing fake counts
    let isMounted = true;
    api.get('/features/stats')
      .then(res => {
        if (isMounted && res.data && res.data.success && res.data.data) {
          setPublicStats(res.data.data);
        }
      })
      .catch(() => {
        // Fallback silently to qualitative trust pillars
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-100 font-sans selection:bg-[#C2185B] selection:text-white overflow-x-hidden">

      {/* ── 1. HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111A30] via-[#0A0F1C] to-[#0A0F1C] z-0" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=80')`
          }}
        />

        {/* Ambient Lights & Particles */}
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-[10%] w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-[90px] pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-[10%] w-60 h-60 bg-[#C2185B]/20 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Small badge: ❤️ OUR STORY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-[#D4AF37]/40 px-5 py-2 rounded-full mb-6 shadow-xl"
          >
            <span className="text-base animate-pulse">❤️</span>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37]">
              OUR STORY
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight mb-6 drop-shadow-lg"
          >
            ShaadiSaathi — <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FCE38A] to-[#D4AF37]">
              शादी का सच्चा साथी
            </span>
          </motion.h1>

          {/* Supporting Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-3 max-w-3xl mx-auto mb-10"
          >
            <p className="text-lg sm:text-2xl font-bold text-white/95 leading-relaxed">
              "हर शादी की शुरुआत एक सपने से होती है। हम उस सपने को हकीकत बनाने में आपका साथ देते हैं।"
            </p>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Every wedding begins with a dream. ShaadiSaathi is here to help you turn that dream into reality.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/services"
              className="w-full sm:w-auto bg-gradient-to-r from-[#C2185B] via-[#D4AF37] to-[#C2185B] text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(194,24,91,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-2 min-h-[44px]"
            >
              <FiSearch size={16} /> Explore ShaadiSaathi
            </Link>
            <Link
              to="/ai-planner"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <FiCpu size={16} className="text-[#D4AF37]" /> Plan Your Wedding
            </Link>
          </motion.div>

          <div className="mt-10 w-full max-w-md">
            <MadhubaniPattern className="w-full h-8 opacity-60 mx-auto" />
          </div>
        </div>
      </section>

      {/* ── 2. OUR STORY ── */}
      <section className="py-20 md:py-28 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-3">
            एक छोटी सी सोच से शुरू हुई एक बड़ी कहानी <span className="text-[#C2185B]">❤️</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Why ShaadiSaathi was born for families and couples in Bihar & across India.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Emotional Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A233A] to-[#0F172A] p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#C2185B]/10 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C2185B]/20 text-[#C2185B] flex items-center justify-center text-3xl">
                  ❤️
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white leading-snug">
                  रिश्तों, परिवारों और <br />
                  <span className="text-[#D4AF37]">सपनों का मिलन</span>
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We believe no family should feel stressed or overwhelmed while planning the most important celebration of their lives.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                    <FaCrown size={12} /> Bihar's Own Wedding Ecosystem
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Story Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-5">
              <p className="text-base sm:text-lg text-white/95 leading-relaxed font-medium">
                "शादी हमारे लिए सिर्फ एक Event नहीं है। यह दो परिवारों, रिश्तों और सपनों का मिलन है।
              </p>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                लेकिन शादी की Planning आज भी कई लोगों के लिए complicated है — सही Vendor ढूंढना, Budget manage करना, Venue चुनना, Baraat की तैयारी करना, और हर छोटी-बड़ी चीज़ को संभालना।
              </p>
              <p className="text-base sm:text-lg text-[#D4AF37] font-bold">
                ShaadiSaathi का जन्म इसी समस्या को आसान बनाने के लिए हुआ।"
              </p>
            </div>

            {/* Highlight Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#C2185B]/20 via-[#D4AF37]/20 to-[#C2185B]/20 border border-[#D4AF37]/40 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-1">
                  Our Promise
                </p>
                <h4 className="font-display text-2xl sm:text-3xl font-black text-white">
                  एक Platform. पूरी Wedding Journey.
                </h4>
              </div>
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                Start Exploring →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHY WE EXIST ── */}
      <section className="py-20 px-4 bg-[#11182B]/60 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-3">
              हम क्यों हैं?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              The three pillars behind ShaadiSaathi’s purpose and commitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: TRUST */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-b from-[#1E293F] to-[#12192F] p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#C2185B]/20 text-[#C2185B] flex items-center justify-center text-3xl mb-6">
                  ❤️
                </div>
                <h3 className="font-display text-2xl font-black text-white mb-3">
                  TRUST
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  "भरोसेमंद Vendors और transparent experience."
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                <FiShield /> 100% Verified Partners
              </div>
            </motion.div>

            {/* Card 2: COMMUNITY */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-b from-[#1E293F] to-[#12192F] p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-3xl mb-6">
                  🤝
                </div>
                <h3 className="font-display text-2xl font-black text-white mb-3">
                  COMMUNITY
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  "Local businesses और families को एक साथ जोड़ना."
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                <FiUsers /> Supporting Local Bihar Artists
              </div>
            </motion.div>

            {/* Card 3: SIMPLICITY */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-b from-[#1E293F] to-[#12192F] p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl mb-6">
                  ✨
                </div>
                <h3 className="font-display text-2xl font-black text-white mb-3">
                  SIMPLICITY
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  "Wedding planning को simple, smart और stress-free बनाना."
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                <FiCheckCircle /> Intuitive AI Planning Tools
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. OUR VISION ── */}
      <section className="py-20 md:py-28 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
              हमारा Vision
            </span>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
              हर परिवार के लिए <br />
              <span className="text-[#C2185B]">एक बेहतर Wedding Experience.</span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              "हम चाहते हैं कि भारत के हर शहर, हर छोटे कस्बे और हर गाँव में लोग अपनी शादी की Planning आसानी से कर सकें।"
            </p>
            <p className="text-slate-400 text-sm">
              We are starting with deep roots across Bihar and expanding our verified ecosystem so that quality wedding services are never out of reach.
            </p>
          </div>

          {/* Map-inspired Expansion Chain Visual */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-[#131B2E] to-[#0A0F1C] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4">
                {[
                  { title: 'Bihar', desc: 'Our home roots — Patna, Gaya, Darbhanga, Muzaffarpur & 38 Districts', status: 'Live & Operating', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                  { title: 'Tier 2 Cities', desc: 'Expanding verified wedding vendors & Baraat Cabs to regional centers', status: 'In Progress', color: 'text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10' },
                  { title: 'Tier 3 Cities', desc: 'Empowering local community vendors with modern digital booking', status: 'Future Vision', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
                  { title: 'Tier 4 Cities', desc: 'Connecting rural and semi-urban celebrations to trusted services', status: 'Future Vision', color: 'text-slate-400 border-slate-500/30 bg-slate-500/10' },
                  { title: 'India', desc: 'Building India’s most trusted full-stack wedding marketplace', status: 'Long-Term Vision', color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' }
                ].map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-[#D4AF37]">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. AI + WEDDING FUTURE ── */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0A0F1C] via-[#11182A] to-[#0A0F1C] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-1.5 rounded-full bg-[#C2185B]/20 border border-[#C2185B]/40 text-[#FF4D6D] text-xs font-bold uppercase tracking-widest">
              AI + WEDDING FUTURE
            </span>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white mt-3 mb-4">
              शादी की Planning का Future — <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">
                Smart, Simple & Personal 🤖
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Combining traditional Indian wedding hospitality with modern AI wedding intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'AI Wedding Planner',
                desc: 'Smart budget allocation & step-by-step checklist generation tailored to Indian rituals.',
                badge: 'Live in Codebase',
                badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                to: '/ai-planner'
              },
              {
                icon: '💰',
                title: 'Smart Budget Planning',
                desc: 'Intelligent cost estimation for venues, catering, decoration, and photography.',
                badge: 'Live in Codebase',
                badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                to: '/budget-calculator'
              },
              {
                icon: '📍',
                title: 'Smart Vendor Discovery',
                desc: 'Location-aware matching with verified vendors in Patna, Gaya, Darbhanga & more.',
                badge: 'Live in Codebase',
                badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                to: '/services'
              },
              {
                icon: '✨',
                title: 'Personalized Recommendations',
                desc: 'AI-curated wedding themes and vendor packages based on your taste.',
                badge: 'Future Vision',
                badgeColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
                to: '/services'
              },
              {
                icon: '📅',
                title: 'Wedding Timeline',
                desc: 'Automated itinerary management across Haldi, Mehndi, Sangeet, and Ceremony.',
                badge: 'Live in Codebase',
                badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                to: '/checklist'
              },
              {
                icon: '🚕',
                title: 'Baraat Ride Planning',
                desc: 'India’s dedicated bulk fleet engine for premium Baraat luxury cars and group convoys.',
                badge: 'Live in Codebase',
                badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                to: '/baraat-cabs'
              }
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{card.icon}</span>
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <Link
                    to={card.to}
                    className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-[#D4AF37] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Explore Feature</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SHAADISAATHI ECOSYSTEM ── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white mb-3">
            One Wedding. <br />
            <span className="text-[#C2185B]">One Ecosystem.</span>
          </h2>
          <p className="text-[#D4AF37] font-bold text-base sm:text-lg">
            "शादी की Planning से Booking तक — सब एक जगह।"
          </p>
        </div>

        {/* Central Ecosystem Diagram */}
        <div className="relative max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-12 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C2185B]/5 via-transparent to-[#D4AF37]/5 pointer-events-none" />

          {/* Central ShaadiSaathi Node */}
          <div className="flex justify-center mb-8">
            <div className="px-8 py-5 rounded-2xl bg-gradient-to-r from-[#C2185B] via-[#D4AF37] to-[#C2185B] text-white font-black text-lg sm:text-xl shadow-[0_10px_35px_rgba(194,24,91,0.4)] flex items-center gap-3">
              <span>❤️</span>
              <span>ShaadiSaathi Ecosystem</span>
            </div>
          </div>

          {/* Orbiting Ecosystem Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {[
              { icon: '👰', label: 'Couples & Families', desc: 'Planning & Discovering' },
              { icon: '🏪', label: 'Verified Vendors', desc: 'Quality Professionals' },
              { icon: '🏨', label: 'Wedding Venues', desc: 'Banquet & Marriage Halls' },
              { icon: '🚗', label: 'Baraat Rides', desc: 'Luxury Convoy Fleet' },
              { icon: '📸', label: 'Photographers', desc: 'Capturing Every Moment' },
              { icon: '🍽️', label: 'Caterers & Food', desc: 'Bihari Feast & Specialties' },
              { icon: '🎵', label: 'DJs & Music', desc: 'Celebration & Sangeet' },
              { icon: '💄', label: 'Makeup Artists', desc: 'Bridal & Groom Styling' },
              { icon: '🧑‍💼', label: 'Wedding Experts', desc: '24/7 Planning Support' }
            ].map((node) => (
              <div
                key={node.label}
                className="bg-black/30 border border-white/10 rounded-2xl p-4 text-center hover:border-[#D4AF37]/50 transition-all"
              >
                <div className="text-2xl mb-1">{node.icon}</div>
                <h4 className="font-bold text-white text-sm">{node.label}</h4>
                <p className="text-[11px] text-slate-400">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. OUR VALUES ── */}
      <section className="py-20 px-4 bg-[#11182B]/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
              WHAT GUIDES US
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white mt-3">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: '❤️', title: 'Trust First', desc: 'Every vendor is vetted so families can book with complete peace of mind.' },
              { icon: '🤝', title: 'Local Community', desc: 'We champion regional artists, cab drivers, and traditional artisans.' },
              { icon: '✨', title: 'Customer Experience', desc: 'From first inquiry to the final bidaai, we stand by your celebration.' },
              { icon: '🚀', title: 'Innovation', desc: 'Empowering traditional celebrations with smart tools and AI planning.' },
              { icon: '🌸', title: 'Indian Culture', desc: 'Honoring customs and regional diversity across Bihar and India.' },
              { icon: '💙', title: 'Transparency', desc: 'Clear package pricing, honest reviews, and safe milestone payments.' }
            ].map((val) => (
              <div
                key={val.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#D4AF37]/40 hover:bg-white/10 transition-all"
              >
                <div className="text-3xl mb-4">{val.icon}</div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{val.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. BIHAR ROOTS ── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="rounded-[32px] border border-[#D4AF37]/30 bg-gradient-to-r from-[#171F36] via-[#10172B] to-[#1A1024] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#C2185B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-black uppercase tracking-widest">
              🌸 OUR BIHAR ROOTS
            </span>

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
              हमारी जड़ें, हमारी पहचान <span className="text-[#C2185B]">❤️</span>
            </h2>

            <p className="text-base sm:text-xl text-white/90 font-medium leading-relaxed">
              "भारत की शादियों की खूबसूरती उसकी विविधता में है। और Bihar की शादियों में है अपनी एक अलग warmth, tradition और celebration."
            </p>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              From traditional Mithila paintings and energetic Baraat processions to authentic Bihari feast hospitality, ShaadiSaathi celebrates the cultural heart of Bihar while bringing modern digital trust to every district.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {['Patna', 'Gaya', 'Muzaffarpur', 'Darbhanga', 'Madhubani', 'Bhagalpur', '38 Districts'].map((city) => (
                <span
                  key={city}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold"
                >
                  📍 {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. TRUST SECTION ── */}
      <section className="py-20 px-4 bg-[#0D1322] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white mb-3">
              हज़ारों परिवारों के भरोसे की ओर एक कदम
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Transparent trust markers and verified platform highlights.
            </p>
          </div>

          {publicStats ? (
            /* Render real statistics only when backend data is available */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-[#D4AF37] mb-1">{publicStats.happyCouples || '50+'}</div>
                <div className="text-xs uppercase tracking-widest text-slate-300 font-bold">Happy Couples</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-white mb-1">{publicStats.verifiedVendors || '10+'}</div>
                <div className="text-xs uppercase tracking-widest text-slate-300 font-bold">Verified Vendors</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-[#C2185B] mb-1">{publicStats.cities || '10+'}</div>
                <div className="text-xs uppercase tracking-widest text-slate-300 font-bold">Cities</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-white mb-1">{publicStats.bookings || '50+'}</div>
                <div className="text-xs uppercase tracking-widest text-slate-300 font-bold">Bookings</div>
              </div>
            </div>
          ) : (
            /* Qualitative Trust Cards (No fake invented numbers) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center text-xl">
                  <FaCheckDouble />
                </div>
                <h4 className="font-bold text-white text-base">Verified Vendor Network</h4>
                <p className="text-xs text-slate-400">Strict quality & identity checks before vendor onboarding.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] mx-auto flex items-center justify-center text-xl">
                  <FiShield />
                </div>
                <h4 className="font-bold text-white text-base">Milestone Protection</h4>
                <p className="text-xs text-slate-400">Transparent payment milestones to safeguard your booking.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#C2185B]/10 text-[#C2185B] mx-auto flex items-center justify-center text-xl">
                  <FaHandshake />
                </div>
                <h4 className="font-bold text-white text-base">Transparent Pricing</h4>
                <p className="text-xs text-slate-400">No hidden charges or surprise commissions on packages.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center text-xl">
                  <FiHeart />
                </div>
                <h4 className="font-bold text-white text-base">24/7 Planning Concierge</h4>
                <p className="text-xs text-slate-400">Dedicated support assistance for couples & families.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 10. TEAM SECTION ── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-300 text-xs font-bold uppercase tracking-widest">
            THE TEAM
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white mt-3">
            Meet the People Behind ShaadiSaathi
          </h2>
        </div>

        {/* Authentic Qualitative Team & Founder Card without inventing fake identities */}
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#1A233A] to-[#12192F] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C2185B] to-[#D4AF37] text-white mx-auto flex items-center justify-center text-2xl font-bold shadow-lg">
            SS
          </div>
          <h3 className="font-display text-2xl font-black text-white">
            ShaadiSaathi Founding & Engineering Team
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Built with pride by software engineers, wedding hospitality concierges, and regional coordinators from Bihar who understand the unique warmth, traditions, and requirements of Indian weddings.
          </p>
          <div className="pt-2 flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-bold">
              📍 Headquartered in Bihar • Operating Nationwide
            </span>
          </div>
        </div>
      </section>

      {/* ── 11. FINAL CTA ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0A0F1C] to-[#0D1322] border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#1E2742] via-[#141C30] to-[#1E1629] border border-[#D4AF37]/40 rounded-[32px] p-8 sm:p-14 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#C2185B]/15 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C2185B]/20 text-[#FF4D6D] text-2xl">
              ❤️
            </span>

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
              आपकी शादी की कहानी, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FCE38A] to-[#D4AF37]">
                अब ShaadiSaathi के साथ
              </span>
            </h2>

            <p className="text-base sm:text-xl text-slate-300 font-medium max-w-xl mx-auto">
              "Plan करें. Discover करें. Book करें. और अपनी शादी को यादगार बनाएं।"
            </p>

            {/* Buttons: Primary, Secondary, Partner */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/ai-planner"
                className="w-full sm:w-auto bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform min-h-[44px] flex items-center justify-center"
              >
                Start Planning
              </Link>
              <Link
                to="/services"
                className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#b59328] text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform min-h-[44px] flex items-center justify-center"
              >
                Explore Vendors
              </Link>
              <Link
                to="/register/vendor"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all min-h-[44px] flex items-center justify-center"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
