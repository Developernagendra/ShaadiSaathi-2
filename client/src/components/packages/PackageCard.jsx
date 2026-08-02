import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

export default function PackageCard({ pkg, tier = 'silver', onOpenDetails, onOpenQuote, onOpenExpert }) {
  // Map tier to visual configurations and hardcoded display lists as requested by user
  const configs = {
    silver: {
      name: 'Silver Package',
      label: 'बेसिक (Essential)',
      subtitle: 'सिंपल और एलिगेंट',
      desc: 'उन कपल्स के लिए परफेक्ट जो एक खूबसूरत और छोटी शादी (intimate wedding) प्लान कर रहे हैं।',
      guests: '50–150 Guests',
      scale: 'छोटा समारोह',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
      icon: '💎',
      badge: null,
      serviceCount: 'Essential Services',
      features: [
        'Basic Decoration',
        'Essential Catering',
        'Wedding Photography',
        'Basic Makeup',
        'Basic Mehndi',
        'Basic DJ / Sound',
        'Venue Assistance'
      ],
      ctaText: 'Silver Package देखें →',
      bgClass: 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl',
      headerBg: 'from-gray-900/60 to-transparent',
      textClass: 'text-gray-900',
      priceClass: 'text-gray-900',
      buttonClass: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
    },
    gold: {
      name: 'Gold Package',
      label: 'सबसे लोकप्रिय',
      subtitle: 'कंप्लीट Wedding एक्सपीरियंस',
      desc: 'उन कपल्स के लिए एक पूरा पैकेज जो बिना किसी टेंशन के एक शानदार शादी चाहते हैं।',
      guests: '150–400 Guests',
      scale: 'प्रीमियम समारोह',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
      icon: '👑',
      badge: '🔥 MOST POPULAR',
      serviceCount: 'Premium Services',
      features: [
        'Premium Decoration',
        'Photography + Videography',
        'Catering',
        'Makeup Artist',
        'Mehndi Artist',
        'DJ & Entertainment',
        'Wedding Venue',
        'Wedding Invitation',
        'Baraat Cab / Transportation',
        'Event Coordination'
      ],
      ctaText: 'Gold Package चुनें →',
      bgClass: 'bg-white border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(212,175,55,0.15)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.25)] lg:-translate-y-4 lg:hover:-translate-y-6',
      headerBg: 'from-[#0B1021]/80 to-transparent',
      textClass: 'text-gray-900',
      priceClass: 'text-[#D4AF37]',
      buttonClass: 'bg-gradient-to-r from-[#C2185B] to-[#9c1349] text-white shadow-md hover:shadow-lg border-none'
    },
    royal: {
      name: 'Royal Package',
      label: 'लक्ज़री एक्सपीरियंस',
      subtitle: 'शानदार और राजशाही',
      desc: 'उन कपल्स के लिए एक लक्ज़री पैकेज जो अपनी शादी को सच में ग्रैंड और यादगार बनाना चाहते हैं।',
      guests: '400+ Guests',
      scale: 'ग्रैंड समारोह',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
      icon: '👑',
      badge: null,
      serviceCount: 'Luxury Services',
      features: [
        'Luxury Decoration & Stage',
        'Premium Photography',
        'Cinematic Videography',
        'Pre-Wedding Shoot',
        'Luxury Catering',
        'Premium Makeup Artist',
        'Mehndi Artist',
        'DJ & Live Entertainment',
        'Premium Wedding Venue',
        'Luxury Baraat Cab',
        'Wedding Invitations',
        'Guest Transportation',
        'Wedding Planner / Coordinator',
        'Complete Event Management'
      ],
      ctaText: 'Royal Package देखें →',
      bgClass: 'bg-gradient-to-b from-[#0B1021] to-[#1A2238] border-gray-800 hover:border-gray-700 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]',
      headerBg: 'from-black/80 to-transparent',
      textClass: 'text-white',
      priceClass: 'text-white',
      buttonClass: 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
    }
  };

  const config = configs[tier] || configs.silver;
  
  // Use fixed prices as requested
  const FIXED_PRICES = {
    silver: 60000,
    gold: 94500,
    royal: 195000
  };

  const currentPrice = FIXED_PRICES[tier] || pkg?.finalPrice || pkg?.price;

  const displayPrice = currentPrice
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPrice)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: tier === 'gold' ? 1.02 : 1.01, transition: { duration: 0.3 } }}
      viewport={{ once: true, margin: "-50px" }}
      className={`group relative flex flex-col transition-all duration-300 overflow-hidden rounded-[24px] sm:rounded-[28px] w-full max-w-[380px] flex-shrink-0 mx-auto sm:mx-0 border ${config.bgClass}`}
    >
      {/* Top Banner / Image Area */}
      <div className="relative w-full h-[220px] overflow-hidden bg-gray-100 shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-t ${config.headerBg} z-10 opacity-90 transition-opacity duration-300 group-hover:opacity-100`}></div>
        <img
          src={pkg?.coverImage || pkg?.image || config.image}
          alt={config.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badge */}
        {config.badge && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_5px_15px_rgba(212,175,55,0.4)] border border-white/20">
              {config.badge}
            </span>
          </div>
        )}

        {/* Icon & Title */}
        <div className="absolute bottom-4 left-6 right-6 z-20 text-white flex flex-col items-start">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl mb-3 border border-white/30 shadow-lg">
            {config.icon}
          </div>
          <h3 className="font-serif text-2xl font-bold leading-tight drop-shadow-md">
            {config.name}
          </h3>
          <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1 drop-shadow-sm">
            {config.label}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8 flex flex-col flex-1 relative z-20">
        
        {/* Package Context Info */}
        <div className="mb-5 border-b border-gray-200/20 pb-5">
          <div className="flex justify-between items-center mb-3">
             <div className={`text-[11px] font-bold uppercase tracking-widest ${tier === 'royal' ? 'text-gray-300' : 'text-gray-500'}`}>
               {config.scale}
             </div>
             <div className={`text-[11px] font-bold bg-white/10 px-2 py-1 rounded-md border ${tier === 'royal' ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
               {config.guests}
             </div>
          </div>
          <p className={`text-sm leading-relaxed ${tier === 'royal' ? 'text-gray-300' : 'text-gray-600'}`}>
            {config.desc}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-6 pb-6 border-b border-gray-200/20">
          {displayPrice ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Starting from</p>
              <div className="flex items-end gap-2">
                <span className={`font-serif text-3xl md:text-4xl font-black leading-none ${config.priceClass}`}>
                  {displayPrice}
                </span>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${tier === 'royal' ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                Custom Quote Available
              </p>
            </>
          ) : (
            <div className="flex flex-col">
              <span className={`font-serif text-3xl md:text-4xl font-black leading-none ${config.priceClass}`}>
                Custom Pricing
              </span>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${tier === 'royal' ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                Get a Quote
              </p>
            </div>
          )}
        </div>

        {/* Service Count & List */}
        <div className="mb-8 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100/10 border border-gray-200/20 mb-4">
             <span className={`text-[10px] font-black uppercase tracking-widest ${tier === 'royal' ? 'text-gray-300' : 'text-gray-500'}`}>
               {config.serviceCount} ({config.features.length})
             </span>
          </div>
          <div className="space-y-0 relative">
            <details className="group/details" open>
              <summary className={`flex items-center justify-between cursor-pointer list-none text-sm font-bold uppercase tracking-widest py-2 border-b ${tier === 'royal' ? 'border-gray-800 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
                What's Included 
                <span className="transition group-open/details:rotate-180">▼</span>
              </summary>
              <ul className="space-y-3 mt-4">
                {config.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-start gap-3 text-sm font-medium ${config.textClass}`}>
                    <div className={`mt-0.5 shrink-0 ${tier === 'royal' ? 'text-[#D4AF37]' : tier === 'gold' ? 'text-[#C2185B]' : 'text-gray-400'}`}>
                      <FiCheck size={16} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3">
          <button
            onClick={() => onOpenQuote({ ...pkg, id: tier, name: config.name })}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all active:scale-95 ${config.buttonClass}`}
          >
            {config.ctaText}
          </button>
          <button
            onClick={() => onOpenDetails({ ...pkg, id: tier, name: config.name })}
            className={`w-full flex items-center justify-center py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors hover:underline ${tier === 'royal' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Customize Package
          </button>
          <button
            onClick={() => onOpenExpert && onOpenExpert(tier)}
            className={`w-full flex items-center justify-center py-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${tier === 'royal' ? 'text-[#D4AF37] hover:text-white' : 'text-[#C2185B] hover:text-[#8E244D]'}`}
          >
            Talk to an Expert
          </button>
        </div>

      </div>
    </motion.div>
  );
}
