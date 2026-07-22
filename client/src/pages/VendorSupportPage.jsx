import { FiBriefcase, FiDollarSign, FiStar, FiChevronRight, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function VendorSupportPage() {
  const sections = [
    { title: 'Onboarding Guide', icon: <FiBriefcase />, desc: 'How to list your business on ShaadiSaathi.', link: '/faq' },
    { title: 'Subscription Plans', icon: <FiDollarSign />, desc: 'Understanding premium & featured placements.', link: '/vendor-subscription' },
    { title: 'Managing Reviews', icon: <FiStar />, desc: 'How to respond to client reviews & ratings.', link: '/faq' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0]/50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-[#D4AF37]/20">
            For Professionals
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl text-gray-900 tracking-tight">
            Vendor <span className="text-[#D4AF37] italic">Support Hub</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
            Everything you need to grow your business, manage your listings, and succeed on ShaadiSaathi.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((sec, i) => (
            <Link key={i} to={sec.link} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/30 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B38D22] text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                {sec.icon}
              </div>
              <h3 className="font-black text-gray-900 text-xl mb-2 flex items-center justify-between">
                {sec.title} <FiChevronRight className="text-gray-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">{sec.desc}</p>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] p-10 md:p-16 text-center border border-pink-50 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-[80px] -translate-y-1/2" />
          <div className="relative z-10 space-y-6">
            <h2 className="font-display font-black text-3xl text-gray-900">Need direct assistance?</h2>
            <p className="text-gray-500 font-medium">Our Vendor Success team is ready to help you optimize your profile.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors shadow-lg hover:-translate-y-1">
              <FiMessageCircle /> Contact Vendor Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
