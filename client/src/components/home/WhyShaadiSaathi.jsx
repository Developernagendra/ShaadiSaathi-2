import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiMapPin, FiPieChart, FiGift, FiTruck, FiHeart, FiStar } from 'react-icons/fi';

const features = [
  {
    icon: <FiCpu className="text-2xl text-blue-500" />,
    title: "AI-Powered Planning",
    desc: "आपके Budget और जरूरत के अनुसार Smart Wedding Planning.",
    num: "01"
  },
  {
    icon: <FiMapPin className="text-2xl text-[#C2185B]" />,
    title: "Bihar's Local Network",
    desc: "आपके शहर और आसपास के भरोसेमंद Wedding Vendors.",
    num: "02"
  },
  {
    icon: <FiPieChart className="text-2xl text-green-500" />,
    title: "Smart Budget",
    desc: "शादी के Budget को बेहतर तरीके से Plan और Track करें.",
    num: "03"
  },
  {
    icon: <FiGift className="text-2xl text-purple-500" />,
    title: "Personalized Packages",
    desc: "आपकी शादी के हिसाब से Custom Wedding Packages.",
    num: "04"
  },
  {
    icon: <FiTruck className="text-2xl text-[#D4AF37]" />,
    title: "Baraat Made Easy",
    desc: "Cab से लेकर Baraat तक की Planning एक ही जगह.",
    num: "05"
  },
  {
    icon: <FiHeart className="text-2xl text-pink-500" />,
    title: "One Wedding Partner",
    desc: "Planning से Booking तक — हर कदम पर ShaadiSaathi.",
    num: "06"
  }
];

const floatingChips = [
  "🤖 AI Wedding Planner",
  "📍 Local Bihar Vendors",
  "💰 Smart Budget Planning",
  "✨ Personalized Packages",
  "🚕 Smart Baraat Cab Booking",
  "📅 Wedding Timeline",
  "💬 Expert Consultation",
  "📱 WhatsApp Updates"
];

// Madhubani background pattern (very subtle)
const MadhubaniBg = () => (
  <svg className="absolute inset-0 w-full h-full text-gray-200/20" xmlns="http://www.w3.org/2000/svg">
    <pattern id="madhubani-bg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M30 5 L30 55 M5 30 L55 30 M20 20 L40 40 M20 40 L40 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="30" cy="30" r="15" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="30" cy="30" r="2" fill="currentColor" />
    </pattern>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#madhubani-bg)" />
  </svg>
);

export default function WhyShaadiSaathi() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#fdfbf7] via-white to-[#f0f9ff]">
      <MadhubaniBg />
      
      {/* Soft Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100/40 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        
        {/* ── TOP SECTION: HEADING, ORB, SMART MATCH ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-24">
          
          {/* 1. HEADING */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl lg:text-5xl font-black text-[#1e3a8a] mb-6 leading-tight">
                ShaadiSaathi ही क्यों? ❤️
              </h2>
              <div className="h-1 w-16 bg-[#D4AF37] mx-auto lg:mx-0 mb-6 rounded-full" />
              <p className="text-gray-600 text-lg md:text-xl italic font-serif leading-relaxed mb-4">
                "क्योंकि आपकी शादी सिर्फ एक Event नहीं, बल्कि आपकी ज़िंदगी की सबसे खूबसूरत कहानी है।"
              </p>
              <p className="text-gray-500 font-medium leading-relaxed">
                यह सिर्फ एक Vendor Listing वेबसाइट नहीं, बल्कि आपका अपना स्मार्ट AI Wedding Partner है।
              </p>
            </motion.div>
          </div>

          {/* 2. AI ORB */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative min-h-[350px]">
            {/* Desktop Floating Chips */}
            <div className="hidden lg:block absolute inset-0">
              {floatingChips.map((chip, i) => {
                const angle = (i * (360 / floatingChips.length)) * (Math.PI / 180);
                const radius = 150;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 4 + (i % 3), delay: i * 0.2 }}
                    className="absolute top-1/2 left-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-[10px] font-bold text-gray-700 whitespace-nowrap border border-gray-100 z-20"
                    style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  >
                    {chip}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Orb Core */}
            <motion.div 
              className="relative w-56 h-56 flex items-center justify-center z-10 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-200/40 to-pink-200/40 blur-2xl animate-pulse group-hover:blur-3xl transition-all" />
              <div className="absolute inset-4 rounded-full border-[1.5px] border-dashed border-blue-300/60 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-8 rounded-full border border-pink-300/40 animate-[spin_15s_linear_infinite_reverse]" />
              
              <div className="relative w-32 h-32 bg-white/90 backdrop-blur-md rounded-full shadow-[0_0_50px_rgba(59,130,246,0.2)] border-4 border-white flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50" />
                <span className="text-3xl mb-1 relative z-10">❤️</span>
                <span className="text-[10px] font-black uppercase text-[#1e3a8a] tracking-wider text-center leading-tight relative z-10">
                  AI Wedding<br/>Assistant
                </span>
              </div>
            </motion.div>
            
            <p className="mt-8 text-center text-sm font-bold text-[#C2185B] bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 lg:hidden">
              आपकी शादी, हमारी स्मार्ट Planning
            </p>
          </div>

          {/* Mobile Chips (Horizontal Scroll) */}
          <div className="lg:hidden flex overflow-x-auto gap-3 pb-4 px-2 no-scrollbar w-full">
            {floatingChips.map((chip, i) => (
              <div key={i} className="shrink-0 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-xs font-bold text-gray-600">
                {chip}
              </div>
            ))}
          </div>

          {/* 3. AI SMART MATCH CARD */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_20px_60px_rgba(30,58,138,0.08)] border border-blue-50/50 w-full max-w-[320px] relative group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent opacity-50 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FiCpu className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Analysis</h4>
                  <p className="text-sm font-bold text-[#1e3a8a]">Finding the Perfect Vendor...</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {/* Match Progress */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1 text-green-600"><span className="text-base leading-none">🎯</span> 98% Match</span>
                    <span className="text-gray-400">Best Value</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" 
                      initial={{ width: 0 }}
                      whileInView={{ width: "98%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#f8fafc] p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <FiMapPin className="text-[#C2185B]" /> 2.4 km Away
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#D4AF37]">
                    <FiStar className="fill-current" /> 4.9 Rating
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* ── BOTTOM SECTION: 6 FEATURE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100/50 hover:border-blue-100 group transition-all duration-300 relative overflow-hidden"
            >
              {/* Card Number Bg */}
              <div className="absolute -top-4 -right-4 text-8xl font-black text-gray-50 opacity-50 group-hover:text-blue-50/50 transition-colors pointer-events-none select-none">
                {feature.num}
              </div>
              
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white shadow-sm transition-all duration-300 relative z-10">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-[#1e3a8a] transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-500 font-medium text-sm leading-relaxed relative z-10">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
