import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiPlay, FiX, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function PremiumTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/features/testimonials');
      if (res.data.success && res.data.data.length > 0) {
        setTestimonials(res.data.data);
      } else {
        // Fallback for visual display if no data
        setTestimonials([]);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials');
    }
  };

  // Auto-slide logic
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = offset.x;
    if (swipe < -50) {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    } else if (swipe > 50) {
      setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  if (testimonials.length === 0) return null; // Don't render if empty to save space

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50">

      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-200/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* ── HEADER ── */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4"
          >
            ❤️ हज़ारों कपल्स का भरोसा, <span className="text-[#C2185B]">ShaadiSaathi</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto"
          >
            पूरे बिहार और भारत से कपल्स के असली अनुभव।
          </motion.p>
        </div>

        {/* ── TRUST STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-20 max-w-4xl mx-auto">
          {[
            { value: "10+", label: "Happy Couples" },
            { value: "50+", label: "Verified Vendors" },
            { value: "10+", label: "Successful Bookings" },
            { value: "4/5", label: "Average Rating" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-6 text-center border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="text-3xl md:text-4xl font-black text-[#D4AF37] mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── CAROUSEL ── */}
        <div className="relative max-w-5xl mx-auto h-[600px] sm:h-[450px] md:h-[400px]">
          <AnimatePresence initial={false}>
            {testimonials.map((t, i) => {
              if (i !== currentIndex) return null;
              return (
                <motion.div
                  key={t._id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute w-full h-full cursor-grab active:cursor-grabbing"
                >
                  <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-white/50 h-full flex flex-col md:flex-row gap-8 items-center overflow-hidden relative">

                    {/* Decorative quote mark */}
                    <div className="absolute top-4 left-6 text-9xl text-[#C2185B]/10 font-serif leading-none select-none">"</div>

                    {/* Image / Video section */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-64 md:h-64 shrink-0 relative rounded-full md:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white z-10">
                      <img
                        src={t.image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80'}
                        alt="Couple"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {t.video && (
                        <div
                          className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group transition-colors hover:bg-black/20"
                          onClick={() => setActiveVideo(t.video)}
                        >
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiPlay className="text-white text-xl md:text-2xl ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left z-10 relative">
                      <div className="flex justify-center md:justify-start gap-1 mb-4">
                        {[...Array(t.rating || 5)].map((_, i) => (
                          <FiStar key={i} className="text-[#D4AF37] fill-current text-xl" />
                        ))}
                      </div>

                      <p className="text-gray-700 text-sm sm:text-lg md:text-2xl font-medium italic mb-4 sm:mb-6 leading-relaxed">
                        "{t.review}"
                      </p>

                      <div className="mt-auto">
                        <h4 className="font-display text-xl font-black text-gray-900 mb-1">
                          {t.brideName} &amp; {t.groomName}
                        </h4>
                        <p className="text-gray-500 font-medium text-sm mb-3">{t.city}</p>

                        {t.isVerified && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full mb-4">
                            <FiCheckCircle /> Verified Couple
                          </div>
                        )}

                        {t.servicesBooked && t.servicesBooked.length > 0 && (
                          <div className="pt-4 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Services Booked:</span>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                              {t.servicesBooked.map((service, idx) => (
                                <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-[#C2185B] px-3 py-1 rounded-full">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination dots */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-[#C2185B] w-8' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {/* ── CALL TO ACTION ── */}
        <div className="mt-24 text-center">
          <Link
            to="/real-weddings"
            className="inline-block bg-gray-900 text-white font-black uppercase tracking-widest text-sm px-10 py-5 rounded-full shadow-2xl hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all"
          >
            View Real Wedding Stories
          </Link>
        </div>

      </div>

      {/* ── VIDEO MODAL ── */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              onClick={() => setActiveVideo(null)}
            >
              <FiX className="text-4xl" />
            </button>

            <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              {activeVideo.includes('youtube.com') || activeVideo.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo.includes('youtu.be/') ? activeVideo.split('youtu.be/')[1] : activeVideo.split('v=')[1]?.split('&')[0]}?autoplay=1`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              ) : activeVideo.includes('vimeo.com') ? (
                <iframe
                  className="w-full h-full"
                  src={`https://player.vimeo.com/video/${activeVideo.split('vimeo.com/')[1]}?autoplay=1`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>
              ) : (
                <video className="w-full h-full outline-none" controls autoPlay src={activeVideo}></video>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
