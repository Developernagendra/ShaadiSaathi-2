import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchInvitations, createInvitation, updateInvitation, resetBuilder,
  loadInvitation, updateField, selectTemplate
} from '../../store/slices/invitationSlice';
import {
  FiArrowLeft, FiSave, FiEye, FiEyeOff, FiDownload, FiShare2, FiLink,
  FiCheckCircle, FiCheck, FiZoomIn, FiZoomOut, FiRefreshCw, FiCalendar,
  FiMapPin, FiClock, FiPhone, FiHeart, FiAlertCircle
} from 'react-icons/fi';
import { FaWhatsapp, FaCrown, FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ShareModal from '../../components/invitation/ShareModal';
import DownloadModal from '../../components/invitation/DownloadModal';
import api from '../../utils/api';

// ── COLOR & THEME PRESETS ──────────────────────────────────────────────
const THEME_PRESETS = [
  { id: 'royal_gold', name: 'Royal Gold', color: '#D4AF37', accent: '#B38D22', bg: 'from-[#0F172A] via-[#1E1B4B] to-[#0B1021]' },
  { id: 'traditional_red', name: 'Traditional Red', color: '#C2185B', accent: '#8E244D', bg: 'from-[#4A1525] via-[#8E244D] to-[#2D0D17]' },
  { id: 'elegant_blue', name: 'Elegant Blue', color: '#3B82F6', accent: '#1E3A8A', bg: 'from-[#0F172A] via-[#1E3A8A] to-[#1E293B]' },
  { id: 'floral_pink', name: 'Floral Pink', color: '#EC4899', accent: '#BE185D', bg: 'from-[#4C0519] via-[#831843] to-[#500724]' },
  { id: 'bihar_heritage', name: 'Bihar Heritage', color: '#EA580C', accent: '#9A3412', bg: 'from-[#431407] via-[#7C2D12] to-[#270E04]' },
  { id: 'minimal_white', name: 'Minimal Ivory', color: '#334155', accent: '#0F172A', bg: 'from-[#1E293B] via-[#334155] to-[#0F172A]' },
];

const FONT_STYLES = [
  { id: 'classic', name: 'Classic Serif', fontClass: 'font-display' },
  { id: 'royal', name: 'Royal Script', fontClass: 'font-serif italic' },
  { id: 'modern', name: 'Modern Clean', fontClass: 'font-sans font-black' },
];

const DECORATIVE_STYLES = [
  { id: 'floral', name: '🌸 Floral Borders' },
  { id: 'madhubani', name: '🎨 Madhubani Corner' },
  { id: 'gold_frame', name: '👑 Gold Frame' },
  { id: 'minimal', name: '🌿 Minimal Crest' },
];

// ── LIVE INVITATION PREVIEW COMPONENT ─────────────────────────────────
const SimplePreview = ({ data, templates, zoom = 1 }) => {
  const t = templates.find((temp) => temp.id === data.template) || templates[0] || {};
  const theme = THEME_PRESETS.find((th) => th.id === data.colorTheme) || THEME_PRESETS[0];
  const fontObj = FONT_STYLES.find((f) => f.id === data.fontStyle) || FONT_STYLES[0];
  const decor = data.decorativeStyle || 'floral';

  const formattedDate = data.weddingDate
    ? new Date(data.weddingDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : 'Saturday, 24th November 2026';

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        data-invitation-canvas
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        className="w-full max-w-[360px] sm:max-w-[380px] aspect-[9/16] rounded-[2.5rem] shadow-2xl overflow-hidden relative border-8 border-white ring-1 ring-gray-200/80 flex flex-col items-center justify-between text-center p-7 transition-transform duration-300 select-none bg-gray-950"
      >
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={t.img || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80'}
            className="w-full h-full object-cover"
            alt="Wedding Invitation Background"
            loading="lazy"
          />
        </div>
        <div className={`absolute inset-0 z-0 bg-gradient-to-b ${theme.bg} opacity-75`} />

        {/* Decorative Corner Elements */}
        {decor === 'madhubani' && (
          <>
            <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#D4AF37] opacity-80 pointer-events-none" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-[#D4AF37] opacity-80 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-[#D4AF37] opacity-80 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#D4AF37] opacity-80 pointer-events-none" />
          </>
        )}

        {decor === 'gold_frame' && (
          <div className="absolute inset-4 border border-[#D4AF37]/50 rounded-2xl pointer-events-none z-10" />
        )}

        {/* TOP: WEDDING HEADER */}
        <div className="relative z-10 w-full pt-2">
          <p
            style={{ color: theme.color }}
            className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 opacity-90"
          >
            ● TOGETHER WITH THEIR FAMILIES ●
          </p>
          <h4 className="text-white/80 text-xs tracking-widest font-medium uppercase">
            We Invite You To Celebrate
          </h4>
        </div>

        {/* MIDDLE: COUPLE NAMES & FAMILIES */}
        <div className="relative z-10 w-full my-3">
          <h2
            className={`${fontObj.fontClass} text-3xl sm:text-4xl text-white font-black leading-tight drop-shadow-md`}
          >
            {data.brideName || 'Bride Name'}
          </h2>

          {data.brideFamily && (
            <p className="text-[10px] text-white/70 italic mt-0.5">
              D/o {data.brideFamily}
            </p>
          )}

          <div className="my-2.5 flex items-center justify-center gap-3">
            <span className="h-[1px] w-12 bg-white/30" />
            <span
              style={{ color: theme.color }}
              className="text-2xl font-serif italic font-bold"
            >
              &amp;
            </span>
            <span className="h-[1px] w-12 bg-white/30" />
          </div>

          <h2
            className={`${fontObj.fontClass} text-3xl sm:text-4xl text-white font-black leading-tight drop-shadow-md`}
          >
            {data.groomName || 'Groom Name'}
          </h2>

          {data.groomFamily && (
            <p className="text-[10px] text-white/70 italic mt-0.5">
              S/o {data.groomFamily}
            </p>
          )}
        </div>

        {/* BOTTOM: DATE, TIME, VENUE & RSVP */}
        <div className="relative z-10 w-full space-y-3 pb-2">
          {/* Date Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <p className="text-white font-bold text-sm sm:text-base tracking-wide">
              {formattedDate}
            </p>
            <p style={{ color: theme.color }} className="text-xs font-bold mt-0.5">
              {data.weddingTime || '7:00 PM Onwards'}
            </p>
          </div>

          {/* Venue */}
          <div>
            <p className="font-display font-black text-white text-base sm:text-lg leading-snug">
              {data.venue || 'Grand Palace & Lawn'}
            </p>
            <p className="text-white/80 text-xs font-medium mt-0.5">
              {data.city || 'Patna, Bihar'}
            </p>
          </div>

          {/* Custom Message */}
          {data.customMessage && (
            <p className="text-[11px] text-white/90 italic line-clamp-2 px-2">
              "{data.customMessage}"
            </p>
          )}

          {/* RSVP Footer */}
          {(data.rsvpName || data.rsvpPhone) && (
            <div className="pt-2 border-t border-white/20 text-[10px] text-white/80 font-bold uppercase tracking-wider">
              RSVP: {data.rsvpName || 'Family'} {data.rsvpPhone ? `• ${data.rsvpPhone}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SimpleInvitationBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const canvasRef = useRef(null);

  // Redux State
  const { currentInvitation: form, templates, invitations, loading } = useSelector((s) => s.invitation);

  // Local UI State
  const [activeStep, setActiveStep] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Auth User check
  const { user } = useSelector((s) => s.auth || {});

  // ── TRACKING & PENDING DRAFT RESTORATION ────────────────────────────
  useEffect(() => {
    api.post('/tools/track', { toolName: 'Invitation Generator', action: 'viewed_tool' }).catch(() => { });
    dispatch(fetchInvitations());

    // Restore locally saved pending invitation if user just logged in
    const pending = localStorage.getItem('shaadisaathi_pending_invitation');
    if (pending && !id) {
      try {
        const parsed = JSON.parse(pending);
        dispatch(loadInvitation(parsed));
        toast.success('Restored your draft invitation design! ❤️');
        localStorage.removeItem('shaadisaathi_pending_invitation');
      } catch {
        // ignore JSON parse error
      }
    }
  }, [dispatch, id]);

  // Load existing invitation if editing
  useEffect(() => {
    if (id) {
      const existing = invitations.find((i) => i._id === id);
      if (existing) {
        dispatch(loadInvitation(existing));
      }
    } else {
      dispatch(resetBuilder());
    }
  }, [id, invitations, dispatch]);

  // ── FIELD UPDATE HANDLER ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ [name]: value }));
  };

  // ── FILTER TEMPLATES BY CATEGORY ────────────────────────────────────
  const filteredTemplates = templates.filter((t) => {
    if (activeCategory === 'All Styles') return true;
    if (activeCategory === '❤️ Traditional' && t.category === 'Traditional') return true;
    if (activeCategory === '👑 Royal' && t.category === 'Royal') return true;
    if (activeCategory === '🌸 Floral' && t.category === 'Floral') return true;
    if (activeCategory === '💎 Luxury' && t.category === 'Luxury') return true;
    if (activeCategory === '🌿 Minimal' && t.category === 'Minimal') return true;
    if (activeCategory === '🎨 Bihar Inspired' && t.category === 'Madhubani / Bihar Inspired') return true;
    if (activeCategory === '🕌 Elegant' && t.category === 'Elegant') return true;
    if (activeCategory === '✨ Modern' && t.category === 'Modern') return true;
    return false;
  });

  // ── SAVE / PUBLISH INVITATION ───────────────────────────────────────
  const handleSave = async (status = 'published') => {
    // If not logged in and user wants to save to account
    if (!user && status === 'draft') {
      try {
        localStorage.setItem('shaadisaathi_pending_invitation', JSON.stringify(form));
        toast('Please log in to save your draft to your account. Your design is saved!', {
          icon: '💌',
        });
        navigate('/login?redirect=/tools/invitation-generator');
        return;
      } catch {
        // storage error
      }
    }

    if (id) {
      const res = await dispatch(updateInvitation({ id, data: { ...form, status } }));
      if (!res.error) {
        toast.success(status === 'draft' ? 'Draft Updated!' : 'Invitation Updated successfully!');
      }
    } else {
      const res = await dispatch(createInvitation({ ...form, status }));
      if (!res.error) {
        toast.success(status === 'draft' ? 'Saved as Draft!' : 'Invitation Created successfully! 💌');
        api.post('/tools/track', { toolName: 'Invitation Generator', action: 'generated_invitation' }).catch(() => { });
        navigate('/invitation-creator', { replace: true });
      }
    }
  };

  // ── WHATSAPP SHARE GENERATOR ────────────────────────────────────────
  const handleWhatsAppShare = () => {
    const bride = form.brideName || 'Bride';
    const groom = form.groomName || 'Groom';
    const dateStr = form.weddingDate
      ? new Date(form.weddingDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      : 'Date TBD';
    const venueStr = `${form.venue || 'Wedding Venue'}, ${form.city || 'Patna'}`;

    const message = `You're invited to celebrate the wedding of *${bride} & ${groom}* ❤️\n\n📅 Date: ${dateStr}\n🕐 Time: ${form.weddingTime || '7:00 PM Onwards'}\n📍 Venue: ${venueStr}\n\nWe would love to celebrate this special day with you!✨\n\nView Digital Card: https://shaadisaathi.com/invite/${id || 'preview'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // ── COPY LINK HELPER ────────────────────────────────────────────────
  const copyLink = () => {
    const link = `${window.location.origin}/invitation/${id || 'preview'}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard! 🔗');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-[calc(var(--navbar-height,76px)+1rem)] text-gray-900 font-sans pb-28 flex flex-col overflow-x-hidden">

      {/* ── 1. PREMIUM HERO SECTION (STUDIO HEADER) ─────────────────────── */}
      <header className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0B1021] text-white py-10 px-4 relative overflow-hidden border-b border-gray-800">
        {/* Subtle Animated Particles */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 right-10 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-3">
              <span>💌 WEDDING INVITATION STUDIO</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
              Create Your Dream Wedding Invitation 💍
            </h1>
            <p className="text-white/80 text-sm sm:text-base mt-1">
              Apni shaadi ki kahani ko ek beautiful digital invitation mein badlein. Design a card your loved ones will remember.
            </p>
          </div>

          {/* Quick Studio Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/tools')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Back to Tools
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <FiSave /> Save Draft
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. MODERN EDITOR LAYOUT (2 COLUMNS) ─────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

        {/* LEFT / TOP COLUMN: CUSTOMIZATION CONTROLS & MULTI-STEP FORM */}
        <div className="lg:col-span-7 flex flex-col space-y-8">

          {/* Mobile Preview Toggle Accordion */}
          <div className="lg:hidden bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
            <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
              💌 Live Invitation Preview
            </span>
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="px-4 py-2 rounded-xl bg-pink-50 text-[#C2185B] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              {showMobilePreview ? <FiEyeOff /> : <FiEye />}{' '}
              {showMobilePreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Mobile Preview Overlay when Toggled */}
          {showMobilePreview && (
            <div className="lg:hidden bg-white rounded-3xl p-4 border border-gray-200 shadow-xl">
              <SimplePreview data={form} templates={templates} zoom={zoomLevel} />
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold"
                >
                  <FiZoomOut /> Zoom Out
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold"
                >
                  <FiRefreshCw /> Reset
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold"
                >
                  <FiZoomIn /> Zoom In
                </button>
              </div>
            </div>
          )}

          {/* ── 3. INVITATION TEMPLATE GALLERY ──────────────────────────── */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-[#C2185B] uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  DESIGN TEMPLATES
                </span>
                <h2 className="font-display text-2xl font-black text-gray-900 mt-2">
                  Choose Your Invitation Style ✨
                </h2>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  'All Styles',
                  '❤️ Traditional',
                  '👑 Royal',
                  '🌸 Floral',
                  '💎 Luxury',
                  '🎨 Bihar Inspired',
                  '🕌 Elegant',
                  '🌿 Minimal',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {filteredTemplates.map((t) => {
                const isSelected = form.template === t.id;
                return (
                  <motion.div
                    key={t.id}
                    whileHover={{ y: -4 }}
                    onClick={() => dispatch(selectTemplate(t.id))}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all aspect-[3/4] shadow-sm ${isSelected
                        ? 'border-[#C2185B] ring-2 ring-[#C2185B]/20 shadow-lg scale-[1.03]'
                        : 'border-gray-200 hover:border-pink-300'
                      }`}
                  >
                    <img
                      src={t.img}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={t.name}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />

                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                        {t.badge || '✨ Modern'}
                      </span>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-[#C2185B] text-white flex items-center justify-center shadow-md">
                          <FiCheck size={14} />
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 text-white text-center">
                      <p className="font-bold text-xs text-white drop-shadow-md">
                        {t.name}
                      </p>
                      <span className="inline-block mt-1 text-[10px] text-amber-200 uppercase font-extrabold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        Use This Design →
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── 4. MULTI-STEP WEDDING DETAILS FORM ──────────────────────── */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-200/80 shadow-sm">
            {/* Stepper Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8 overflow-x-auto">
              {[
                { id: 1, label: 'Couple', icon: '💍' },
                { id: 2, label: 'Wedding', icon: '📅' },
                { id: 3, label: 'Family', icon: '👨‍👩‍👧' },
                { id: 4, label: 'Message', icon: '💌' },
                { id: 5, label: 'Contact', icon: '📞' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStep(st.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeStep === st.id
                      ? 'bg-[#0F172A] text-[#D4AF37] shadow-sm'
                      : activeStep > st.id
                        ? 'text-[#C2185B] bg-pink-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                  <span>{st.icon}</span>
                  <span>
                    {st.id}. {st.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Step 1: Couple Info */}
            {activeStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="font-display font-black text-xl text-gray-900">
                  Step 1: Bride &amp; Groom Names
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Bride Name *
                    </label>
                    <input
                      type="text"
                      name="brideName"
                      value={form.brideName || ''}
                      onChange={handleChange}
                      placeholder="E.g. Priya Sharma"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Groom Name *
                    </label>
                    <input
                      type="text"
                      name="groomName"
                      value={form.groomName || ''}
                      onChange={handleChange}
                      placeholder="E.g. Rahul Verma"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all"
                  >
                    Next: Wedding Date &amp; Venue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Wedding Date, Time & Venue */}
            {activeStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="font-display font-black text-xl text-gray-900">
                  Step 2: Wedding Date &amp; Venue
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Wedding Date *
                    </label>
                    <input
                      type="date"
                      name="weddingDate"
                      value={form.weddingDate || ''}
                      onChange={handleChange}
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Wedding Time *
                    </label>
                    <input
                      type="time"
                      name="weddingTime"
                      value={form.weddingTime || '19:00'}
                      onChange={handleChange}
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Wedding Venue Name *
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={form.venue || ''}
                      onChange={handleChange}
                      placeholder="E.g. Verma Grand Palace & Lawn"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city || ''}
                      onChange={handleChange}
                      placeholder="E.g. Patna, Bihar"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all"
                  >
                    Next: Family Blessings →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Family Info */}
            {activeStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="font-display font-black text-xl text-gray-900">
                  Step 3: Family Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Bride's Family (Parents / Blessings)
                    </label>
                    <input
                      type="text"
                      name="brideFamily"
                      value={form.brideFamily || ''}
                      onChange={handleChange}
                      placeholder="E.g. Smt. & Sri R.K. Sharma"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Groom's Family (Parents / Blessings)
                    </label>
                    <input
                      type="text"
                      name="groomFamily"
                      value={form.groomFamily || ''}
                      onChange={handleChange}
                      placeholder="E.g. Smt. & Sri M.N. Verma"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all"
                  >
                    Next: Invitation Message →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Custom Message */}
            {activeStep === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="font-display font-black text-xl text-gray-900">
                  Step 4: Custom Invitation Text
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Wedding Message / Blessing Text
                  </label>
                  <textarea
                    name="customMessage"
                    value={form.customMessage || ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="E.g. With joy in our hearts, we invite you to bless our new journey together..."
                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all resize-none"
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all"
                  >
                    Next: RSVP &amp; Design →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Contact & Submit */}
            {activeStep === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="font-display font-black text-xl text-gray-900">
                  Step 5: RSVP Contact &amp; Finalize
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      RSVP Contact Name
                    </label>
                    <input
                      type="text"
                      name="rsvpName"
                      value={form.rsvpName || ''}
                      onChange={handleChange}
                      placeholder="E.g. Sharma Family"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      RSVP Mobile / Phone
                    </label>
                    <input
                      type="text"
                      name="rsvpPhone"
                      value={form.rsvpPhone || ''}
                      onChange={handleChange}
                      placeholder="E.g. +91 98765 43210"
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#C2185B] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleSave('published')}
                    disabled={loading}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
                  >
                    {loading ? 'Publishing...' : 'Save & Publish Invitation ✨'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── 6. DESIGN CUSTOMIZATION PANEL (THEMES, FONTS & BORDERS) ─── */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                🎨 STUDIO CUSTOMIZATION
              </span>
              <h2 className="font-display text-2xl font-black text-gray-900 mt-2">
                Customize Color, Typography &amp; Decor
              </h2>
            </div>

            {/* Color Theme Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                1. Select Color Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEME_PRESETS.map((theme) => {
                  const active = form.colorTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => dispatch(updateField({ colorTheme: theme.id }))}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${active
                          ? 'border-[#D4AF37] bg-amber-50/70 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <span
                        style={{ backgroundColor: theme.color }}
                        className="w-5 h-5 rounded-full inline-block shadow-sm"
                      />
                      <span className="font-bold text-xs text-gray-800">{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Typography Style */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                2. Select Font Typography
              </label>
              <div className="grid grid-cols-3 gap-3">
                {FONT_STYLES.map((f) => {
                  const active = form.fontStyle === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => dispatch(updateField({ fontStyle: f.id }))}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${active
                          ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <p className={`${f.fontClass} text-sm font-bold`}>{f.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Decorative Borders */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                3. Decorative Border Motif
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DECORATIVE_STYLES.map((dec) => {
                  const active = form.decorativeStyle === dec.id;
                  return (
                    <button
                      key={dec.id}
                      onClick={() => dispatch(updateField({ decorativeStyle: dec.id }))}
                      className={`p-3 rounded-2xl border-2 text-center text-xs font-bold transition-all ${active
                          ? 'border-[#C2185B] bg-pink-50 text-[#C2185B] shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {dec.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── 5. RIGHT / BOTTOM COLUMN: STICKY LIVE INVITATION PREVIEW ─── */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24 bg-white rounded-[2.5rem] p-6 border border-gray-200/80 shadow-xl flex flex-col items-center">

            {/* Header & Zoom Controls */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <FaCrown /> Live Preview
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                  title="Zoom Out"
                >
                  <FiZoomOut />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                  title="Reset Zoom"
                >
                  100%
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                  title="Zoom In"
                >
                  <FiZoomIn />
                </button>
              </div>
            </div>

            {/* Live Invitation Card Canvas */}
            <div className="w-full flex justify-center py-4 overflow-hidden bg-gray-50 rounded-3xl">
              <SimplePreview data={form} templates={templates} zoom={zoomLevel} />
            </div>

            {/* ── 8. INVITATION PREVIEW ACTIONS BAR ───────────────────────── */}
            <div className="w-full pt-6 mt-4 border-t border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDownloadOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <FiDownload size={16} /> Download
                </button>
                <button
                  onClick={() => setShareOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <FiShare2 size={16} /> Share Card
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <FaWhatsapp size={16} /> WhatsApp
                </button>
                <button
                  onClick={copyLink}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <FiLink size={16} /> Copy Link
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── 10. SHARE MODAL & 9. DOWNLOAD MODAL ─────────────────────────── */}
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} invitationId={id} />
      <DownloadModal isOpen={downloadOpen} onClose={() => setDownloadOpen(false)} canvasRef={canvasRef} />

    </div>
  );
}
