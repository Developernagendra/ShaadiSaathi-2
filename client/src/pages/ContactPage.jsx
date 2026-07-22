import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageCircle, FiHelpCircle, FiGrid, FiUserCheck, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion'
import api from '../utils/api'
import { Link } from 'react-router-dom'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const { data } = await api.post('/features/contact', form);
      toast.success(data.message || "Message sent successfully!", {
        style: { borderRadius: '1rem', background: '#333', color: '#fff' }
      });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false)
    }
  }

  const quickLinks = [
    { icon: <FiHelpCircle />, title: 'Quick Help', desc: 'Find answers quickly', link: '/help' },
    { icon: <FiGrid />, title: 'FAQs', desc: 'Browse common questions', link: '/faq' },
    { icon: <FiUserCheck />, title: 'Vendor Support', desc: 'Help with your listing', link: '/vendor-support' },
    { icon: <FiCalendar />, title: 'Booking Help', desc: 'Assistance with bookings', link: '/booking-help' },
    { icon: <FiGrid />, title: 'AI Planner', desc: 'Try our smart planner', link: '/ai-planner' },
  ]

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 pt-20 relative overflow-hidden">
      {/* ── Background Elements ── */}
      <div className="absolute top-0 right-0 w-72 md:w-[600px] h-[600px] bg-pink-100 rounded-full blur-[150px] -z-10 opacity-50" />
      <div className="absolute bottom-0 left-0 w-72 md:w-[500px] h-[500px] bg-gold-50 rounded-full blur-[150px] -z-10 opacity-50" />

      {/* ── 📞 Hero Section ── */}
      <section className="relative bg-gray-900 py-32 px-4 overflow-hidden rounded-[3rem] mx-4 md:mx-8 mt-6 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full mb-6 shadow-xl">
              <span className="animate-pulse">📞</span> Contact Us
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-6 tracking-tighter drop-shadow-2xl">
              Get in <span className="text-[#C2185B] italic">Touch</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-2xl font-medium italic leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              We’re here to help make your wedding journey smooth, seamless, and deeply memorable.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-20">

        {/* ── Contact Info Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: <FiPhone />, title: 'Phone Support', value: '+91 7903 075 243', desc: 'Mon-Sat: 9 AM to 7 PM', href: 'tel:+917903075243' },
            { icon: <FiMail />, title: 'Email Support', value: 'n4narendrakr@gmail.com', desc: 'Usually replies within minutes', href: 'mailto:n4narendrakr@gmail.com' },
            { icon: <FiMapPin />, title: 'Office Location', value: 'Darbhanga, Bihar', desc: 'Lalbagh, Bihar - 846004', href: 'https://maps.google.com/?q=Lalbagh+Palace+Rd,+Lalbagh,+Darbhanga,+Bihar+846004' },
            { icon: <FiMessageCircle />, title: 'WhatsApp Support', value: 'Chat with Us', desc: 'Instant support via WhatsApp', href: 'https://wa.me/917903075243', color: 'text-green-500' }
          ].map(({ icon, title, value, desc, href, color }, i) => (
            <motion.a
              key={title}
              href={href}
              target={title === 'Office Location' || title === 'WhatsApp Support' ? '_blank' : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-premium border border-pink-50 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(194,24,91,0.08)] transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl bg-[#FFF8F0] flex items-center justify-center ${color || 'text-[#C2185B]'} text-2xl shadow-sm border border-pink-50 mb-6 group-hover:scale-110 transition-transform`}>
                {icon}
              </div>
              <h4 className="font-display font-black text-gray-900 text-lg mb-1">{title}</h4>
              <p className="font-bold text-[#C2185B] mb-2 group-hover:text-[#8E244D] transition-colors">{value}</p>
              <p className="text-gray-400 text-xs font-medium italic">{desc}</p>
            </motion.a>
          ))}
        </div>

        {/* ── Split Layout: Form + Map & Quick Help ── */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* 💬 Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[3.5rem] p-8 sm:p-12 md:p-16 shadow-premium border border-pink-50 relative overflow-hidden h-full">
              <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

              <div className="mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  <div className="w-8 h-px bg-[#D4AF37]" /> Send a Message
                </div>
                <h3 className="font-display font-black text-4xl md:text-5xl text-gray-900 tracking-tight leading-none mb-4">How can we help?</h3>
                <p className="text-gray-500 font-medium italic text-lg">We'd love to hear from you. Please fill out the form below.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Full Name</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-medium shadow-inner"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      required
                      className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-medium shadow-inner"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      required
                      className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-medium shadow-inner"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Subject</label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      required
                      className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-medium shadow-inner"
                      placeholder="Booking Inquiry"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    required
                    rows={5}
                    className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#C2185B] focus:bg-white rounded-3xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-medium shadow-inner resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-full shadow-[0_10px_30px_rgba(194,24,91,0.3)] hover:shadow-[0_15px_40px_rgba(194,24,91,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 w-full mt-8 active:scale-95"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSend /> Send Message</>}
                </button>
              </form>
            </motion.div>
          </div>

          {/* 🗺 Right Column: Map & Quick Help */}
          <div className="lg:col-span-5 space-y-8">

            {/* Map Section */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[3rem] p-6 shadow-premium border border-pink-50 relative overflow-hidden flex flex-col">
              <div className="px-2 mb-4">
                <h3 className="font-display font-black text-2xl text-gray-900 tracking-tight leading-none mb-1">Our Headquarters</h3>
                <p className="text-gray-400 text-xs font-medium italic">Visit us for an in-person consultation.</p>
              </div>

              {/* Embedded Interactive Map */}
              <div className="h-[250px] rounded-[2rem] overflow-hidden shadow-inner border border-gray-100 relative group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.4468641151624!2d85.8978187!3d26.182283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed3d7fd5a3fb9d%3A0xc3c5f5ed0b8ee8fb!2sLalbagh%2C%20Darbhanga%2C%20Bihar%20846004!5e0!3m2!1sen!2sin!4v1716024900000!5m2!1sen!2sin"
                  className="w-full h-full border-0 absolute inset-0 filter grayscale-[20%] contrast-125"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ShaadiSaathi Location"
                />
              </div>

              <div className="mt-4 flex items-center justify-between px-2">
                <div>
                  <p className="font-black text-gray-900 text-sm">ShaadiSaathi Office</p>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Lalbagh, Darbhanga, Bihar</p>
                </div>
                <a href="https://maps.google.com/?q=Lalbagh+Palace+Rd,+Lalbagh,+Darbhanga,+Bihar+846004" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-pink-50 text-[#C2185B] flex items-center justify-center hover:bg-[#C2185B] hover:text-white transition-colors">
                  <FiArrowRight />
                </a>
              </div>
            </motion.div>

            {/* Quick Help Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[3rem] p-8 shadow-premium border border-pink-50">
              <h3 className="font-display font-black text-2xl text-gray-900 mb-6">Quick Help</h3>
              <div className="grid grid-cols-2 gap-4">
                {quickLinks.map((item, idx) => (
                  <Link key={idx} to={item.link} className="bg-gray-50 hover:bg-pink-50 rounded-2xl p-4 transition-colors group">
                    <div className="text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform origin-left">
                      {item.icon}
                    </div>
                    <h4 className="font-black text-gray-900 text-xs mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-[10px] font-medium leading-snug">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
