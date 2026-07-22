import { FiSearch, FiMessageCircle, FiPhone, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HelpPage() {
  const categories = [
    { title: 'Getting Started', icon: '🚀', desc: 'New to ShaadiSaathi? Start here.' },
    { title: 'My Account', icon: '👤', desc: 'Manage your profile and settings.' },
    { title: 'Vendor Booking', icon: '💍', desc: 'How to discover and book vendors.' },
    { title: 'Baraat Cabs', icon: '🚗', desc: 'Booking luxury fleet & baraat cabs.' },
    { title: 'Payments & Refunds', icon: '💳', desc: 'Understanding billing & refunds.' },
    { title: 'AI Planner', icon: '🤖', desc: 'Using our smart planning tools.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 tracking-tight">
            How can we <span className="text-[#C2185B] italic">help you?</span>
          </h1>
          <div className="max-w-2xl mx-auto relative group">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors text-xl" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, and FAQs..." 
              className="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-full px-6 py-5 pl-14 text-gray-900 shadow-sm focus:shadow-md outline-none transition-all font-medium text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link 
              key={i} 
              to="/faq" 
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-xl transition-all group flex flex-col items-start gap-4"
            >
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg mb-1 flex items-center gap-2">
                  {cat.title} <FiChevronRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#C2185B]" />
                </h3>
                <p className="text-gray-500 font-medium text-sm">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Still need help? */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80')] bg-cover opacity-10 mix-blend-overlay" />
          <div className="relative z-10 space-y-6">
            <h2 className="font-display font-black text-3xl text-white">Can't find what you're looking for?</h2>
            <p className="text-gray-400 font-medium max-w-lg mx-auto">Our support team is available from 9 AM to 7 PM, Monday through Saturday to assist you.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="bg-[#C2185B] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#8E244D] transition-colors flex items-center gap-2">
                <FiMessageCircle /> Contact Support
              </Link>
              <a href="tel:+917903075243" className="bg-white/10 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-md">
                <FiPhone /> Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
