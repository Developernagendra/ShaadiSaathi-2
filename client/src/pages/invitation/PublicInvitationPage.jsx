import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from '../../components/common/BrandLogo';
import api from '../../services/api';
import { FiCalendar, FiMapPin } from 'react-icons/fi';

export default function PublicInvitationPage() {
  const { id } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        // Since it's public, we might need a public endpoint or we just use the ID
        // Assuming we have a public endpoint or the existing endpoint allows reading by ID
        const res = await api.get(`/invitations/${id}`);
        setInvitation(res.data.data);
      } catch (err) {
        console.error('Error fetching public invitation:', err);
        setError('Invitation not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvitation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50/30">
        <div className="animate-pulse flex flex-col items-center">
          <span className="text-4xl mb-4">💌</span>
          <p className="text-gray-500 font-medium">Opening Invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div>
          <BrandLogo className="mb-8" />
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Invitation Unavailable</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link to="/" className="text-[#C2185B] font-bold hover:underline">Return to Homepage</Link>
        </div>
      </div>
    );
  }

  const { brideName, groomName, weddingDate, venue, customMessage, template } = invitation;
  const isDark = template === 'luxury';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-pink-50/50 text-gray-900'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className={`w-full max-w-lg rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        {/* Decorative elements based on template */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        
        <div className="p-10 md:p-14 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-4xl">✨</span>
          </motion.div>
          
          <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-gray-400' : 'text-[#C2185B]'}`}>
            You are invited to the wedding of
          </p>
          
          <h1 className="font-display text-5xl md:text-6xl font-black mb-8 leading-tight">
            {brideName || 'Bride'}<br/>
            <span className={`text-3xl italic ${isDark ? 'text-[#D4AF37]' : 'text-[#C2185B]'}`}>&</span><br/>
            {groomName || 'Groom'}
          </h1>
          
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-current to-transparent mx-auto mb-8 opacity-30" />
          
          <p className={`text-lg font-medium leading-relaxed mb-10 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {customMessage || "We'd love for you to join us on our special day as we start this new chapter together."}
          </p>
          
          <div className="space-y-4 mb-10">
            {weddingDate && (
              <div className={`flex items-center justify-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-pink-50/50'}`}>
                <FiCalendar className={isDark ? 'text-[#D4AF37]' : 'text-[#C2185B]'} size={20} />
                <span className="font-bold text-lg">{new Date(weddingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            
            {venue && (
              <div className={`flex items-center justify-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-pink-50/50'}`}>
                <FiMapPin className={isDark ? 'text-[#D4AF37]' : 'text-[#C2185B]'} size={20} />
                <span className="font-bold">{venue}</span>
              </div>
            )}
          </div>
          
          <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:-translate-y-1 ${isDark ? 'bg-[#D4AF37] text-gray-900 hover:bg-[#F3E5AB]' : 'bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white hover:shadow-pink-500/30'}`}>
            RSVP Now
          </button>
        </div>
      </motion.div>
      
      {/* Footer Branding */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Created with ShaadiSaathi
        </p>
      </div>
    </div>
  );
}
