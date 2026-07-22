import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import { FiArrowRight, FiShield, FiHeart, FiStar, FiMapPin, FiGrid, FiCalendar, FiAward, FiCheckCircle } from 'react-icons/fi';

function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (inView && ref.current) {
      // Special case for numbers that aren't actually numeric like "4/5"
      if (value === '4/5') {
         ref.current.textContent = value;
         return;
      }
      
      const controls = animate(0, numValue, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate: (v) => {
          if (ref.current) {
            ref.current.textContent = Math.round(v) + suffix;
          }
        }
      });
      return controls.stop;
    }
  }, [inView, numValue, suffix, value]);

  return <span ref={ref}>{value === '4/5' ? value : '0' + suffix}</span>;
}

export default function AboutPage() {
  const stats = [
    { value: '10+', label: 'Happy Couples', icon: <FiHeart /> },
    { value: '10+', label: 'Top Vendors', icon: <FiAward /> },
    { value: '1+', label: 'Cities Covered', icon: <FiMapPin /> },
    { value: '4/5', label: 'Customer Rating', icon: <FiStar /> },
  ];

  const features = [
    { title: 'Trusted Vendors', desc: 'Handpicked and verified professionals for your big day.', icon: <FiShield /> },
    { title: 'Premium Baraat Cabs', desc: 'India’s first bulk transportation engine for weddings.', icon: '🚗' },
    { title: 'AI Wedding Planner', desc: 'Smart tools to organize your tasks and timeline.', icon: <FiGrid /> },
    { title: 'Budget Tools', desc: 'Keep track of every penny with our simple budget calculator.', icon: <FiCalendar /> },
  ];

  const timeline = [
    { 
      year: 'The Journey Begins', 
      title: 'A Reality Check',
      desc: 'Planning a wedding should be a joyous celebration, not a logistical nightmare. After witnessing countless families struggle with finding trustworthy vendors, negotiating hidden fees, and managing stressful transportation, we knew there had to be a better way.'
    },
    { 
      year: 'The Foundation', 
      title: 'Building The Platform',
      desc: 'We built ShaadiSaathi to bring transparency, ease, and absolute reliability to the Indian wedding ecosystem. Your big day is our biggest priority.'
    },
    { 
      year: 'Growth & Ecosystem', 
      title: 'A One-Stop Solution',
      desc: 'ShaadiSaathi is a one-stop wedding platform designed to simplify Indian wedding planning. We bring the best wedding professionals and services to your fingertips, ensuring your special day is nothing short of perfect.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 pt-16 relative overflow-hidden">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <motion.img
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury Wedding Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        
        {/* Floating Decorative Elements */}
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-10 md:left-32 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-[40px]" />
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 right-10 md:right-32 w-48 h-48 bg-[#C2185B]/20 rounded-full blur-[50px]" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 1 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] px-8 py-3 rounded-full mb-8 shadow-2xl">
              <span className="animate-pulse">✨</span> ShaadiSaathi – शादी का सच्चा साथी
            </div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none mb-8 drop-shadow-2xl tracking-tighter">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C2185B] italic">Story</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-medium italic max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
              Your trusted platform for finding wedding vendors, venues, photographers, catering, and Premium Baraat Cabs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Trust Banner ── */}
      <section className="relative z-20 -mt-10 mx-4 md:mx-8">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-premium border border-white flex flex-wrap justify-center md:justify-between items-center gap-6">
          {['Verified Vendors', 'Secure Booking', 'Premium Services', 'Customer Support'].map((trust, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <FiCheckCircle size={16} />
              </div>
              <span className="font-black text-gray-900 text-sm tracking-wide uppercase">{trust}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. Our Story (Timeline) ── */}
      <section className="py-24 px-4 bg-[#FFF8F0]/30 relative">
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-[#C2185B] text-xs font-black uppercase tracking-[0.3em] mb-4">Our Genesis</h2>
            <h3 className="font-display text-4xl md:text-5xl font-black text-gray-900">The ShaadiSaathi Journey</h3>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#C2185B] via-[#D4AF37] to-transparent -translate-x-1/2 rounded-full" />

            {timeline.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-16 relative w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Marker */}
                  <div className="absolute left-[28px] md:left-1/2 w-5 h-5 bg-white border-4 border-[#C2185B] rounded-full -translate-x-1/2 shadow-[0_0_20px_rgba(194,24,91,0.5)] z-10" />

                  <div className="w-full md:w-[45%] pl-16 md:pl-0">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-premium border border-white hover:border-pink-100 hover:shadow-2xl transition-all duration-300 group">
                      <div className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-2 bg-gold-50 inline-block px-3 py-1 rounded-full">{item.year}</div>
                      <h4 className="font-display text-2xl font-black text-gray-900 mb-3 group-hover:text-[#C2185B] transition-colors">{item.title}</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Mission & Vision ── */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-pink-50 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gold-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] p-12 relative group shadow-premium border border-pink-50 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-[0_10px_30px_rgba(194,24,91,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                🎯
              </div>
              <h3 className="font-display text-4xl font-black text-gray-900 mb-6">Our Mission</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                Making wedding planning easy, affordable, and stress-free. We believe that organizing your big day should be a joyful experience, not a chore.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] p-12 relative group shadow-premium border border-gold-50 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B38D22] text-white rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-[0_10px_30px_rgba(212,175,55,0.3)] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                👁️
              </div>
              <h3 className="font-display text-4xl font-black text-gray-900 mb-6">Our Vision</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                To become India’s trusted digital wedding ecosystem. Setting the standard for transparency, quality, and convenience in the wedding industry.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. Why Choose Us (Feature Grid) ── */}
      <section className="py-24 px-4 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.3em] mb-4">The ShaadiSaathi Advantage</h2>
            <h3 className="font-display text-4xl md:text-6xl font-black text-white drop-shadow-lg">Why Choose Us</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all duration-500 group hover:-translate-y-3 shadow-2xl relative overflow-hidden text-center flex flex-col items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 flex items-center justify-center text-4xl mb-8 text-[#D4AF37] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-500">
                  {feat.icon}
                </div>
                <h4 className="font-display font-black text-2xl text-white mb-4 tracking-wide">{feat.title}</h4>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Stats Section (Animated Counters) ── */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-pink-50">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group bg-gray-50 rounded-[3rem] p-10 hover:bg-white border border-transparent hover:border-pink-50 hover:shadow-premium transition-all duration-500 hover:-translate-y-2"
              >
                <div className="text-4xl text-[#C2185B] mb-6 flex justify-center group-hover:scale-125 transition-transform duration-500">
                  {stat.icon}
                </div>
                <div className="font-display text-5xl md:text-7xl font-black text-gray-900 mb-4 tracking-tighter">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="h-1 w-12 bg-gradient-to-r from-[#D4AF37] to-[#C2185B] mx-auto my-4 rounded-full" />
                <p className="text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA Section ── */}
      <section className="py-32 px-4 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/80 to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="font-display text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
              Start Planning Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C2185B] italic">Dream Wedding</span>
            </h2>
            <p className="text-gray-300 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of happy couples who found their perfect vendors and premium Baraat Cabs on ShaadiSaathi.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/services" className="w-full sm:w-auto bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 px-10 rounded-full shadow-[0_10px_30px_rgba(194,24,91,0.3)] hover:shadow-[0_15px_40px_rgba(194,24,91,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                Explore Vendors <FiArrowRight size={16} />
              </Link>
              <Link to="/baraat-cabs" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/30 text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 px-10 rounded-full hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                Book Baraat Cabs 🚗
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
