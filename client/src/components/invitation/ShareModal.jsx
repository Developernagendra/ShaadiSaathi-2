import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiCheck, FiShare2, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTelegram } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import toast from 'react-hot-toast';

const shareOptions = [
  { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp size={22} />, color: '#25D366', bgColor: 'bg-[#25D366]/10' },
  { id: 'instagram', label: 'Instagram', icon: <FaInstagram size={22} />, color: '#E4405F', bgColor: 'bg-[#E4405F]/10' },
  { id: 'facebook', label: 'Facebook', icon: <FaFacebook size={22} />, color: '#1877F2', bgColor: 'bg-[#1877F2]/10' },
  { id: 'telegram', label: 'Telegram', icon: <FaTelegram size={22} />, color: '#0088cc', bgColor: 'bg-[#0088cc]/10' },
  { id: 'email', label: 'Email', icon: <HiOutlineMail size={22} />, color: '#EA4335', bgColor: 'bg-[#EA4335]/10' },
];

export default function ShareModal({ isOpen, onClose, invitationId }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://shaadisaathi.com/invite/${invitationId || 'preview'}`;
  const shortUrl = `sdsathi.in/${invitationId || 'preview'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (platform) => {
    let url = '';
    const text = encodeURIComponent("You're invited to our wedding! 💒✨");

    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent("You're Invited! 💒")}&body=${text}%20${encodeURIComponent(shareUrl)}`;
        break;
      case 'instagram':
        toast.success('Share link copied! Paste it in your Instagram story or DM.');
        navigator.clipboard.writeText(shareUrl);
        return;
    }

    if (url) window.open(url, '_blank');
    toast.success(`Sharing via ${platform}!`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Close */}
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 hover:text-gray-600 transition-all z-10">
            <FiX size={16} />
          </button>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C2185B] to-[#8E244D] mx-auto flex items-center justify-center text-white shadow-xl mb-4">
              <FiShare2 size={24} />
            </div>
            <h3 className="font-display text-2xl font-black text-gray-900 mb-1">Share Invitation</h3>
            <p className="text-sm text-gray-400 font-medium">Send your invitation to guests</p>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-5 gap-3 mb-8">
            {shareOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleShare(opt.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${opt.bgColor} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`} style={{ color: opt.color }}>
                  {opt.icon}
                </div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Public Link */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Public Invitation Link</label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200">
              <div className="flex-1 flex items-center gap-2 px-3">
                <FiExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-600 truncate">{shareUrl}</span>
              </div>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                  copied ? 'bg-green-500 text-white' : 'bg-[#C2185B] text-white hover:bg-[#8E244D]'
                }`}
              >
                {copied ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Short URL */}
          <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-1">Short URL</p>
                <p className="text-sm font-bold text-purple-700">{shortUrl}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(`https://${shortUrl}`); toast.success('Short URL copied!'); }}
                className="bg-purple-100 text-purple-600 px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-purple-200 transition-all"
              >
                <FiCopy size={14} />
              </button>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-center">
                <span className="text-2xl mb-1 block">📱</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">QR Code</span>
              </div>
            </div>
          </div>

          {/* Branding notice */}
          <p className="text-center text-[9px] text-gray-300 mt-6 font-medium">
            Free invitations include "Powered by ShaadiSaathi" branding
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
