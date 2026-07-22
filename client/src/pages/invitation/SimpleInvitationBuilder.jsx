import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchInvitations, createInvitation, updateInvitation, resetBuilder, loadInvitation, updateField, selectTemplate } from '../../store/slices/invitationSlice';
import { FiArrowLeft, FiSave, FiEye, FiDownload, FiShare2, FiLink, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ShareModal from '../../components/invitation/ShareModal';
import DownloadModal from '../../components/invitation/DownloadModal';
import api from '../../utils/api';

// Simplified Live Preview Component built inline
const SimplePreview = ({ data, templates }) => {
  const t = templates.find(temp => temp.id === data.template) || templates[0];

  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-[375px] aspect-[9/16] bg-white rounded-3xl shadow-2xl overflow-hidden relative border-8 border-white ring-1 ring-gray-100 flex flex-col items-center justify-center text-center p-8">
        <div className="absolute inset-0 opacity-40">
          <img src={t.img} className="w-full h-full object-cover" alt="Background" />
        </div>
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-white w-full">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-80">Together with their families</p>
          <h2 className="font-display text-4xl mb-2">{data.brideName || 'Bride'}</h2>
          <span className="text-xl italic opacity-80">&</span>
          <h2 className="font-display text-4xl mt-2 mb-8">{data.groomName || 'Groom'}</h2>

          <div className="space-y-4">
            <div className="border-t border-b border-white/30 py-4 mb-4">
              <p className="text-lg font-bold tracking-wider">
                {data.weddingDate ? new Date(data.weddingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
              </p>
              <p className="text-sm opacity-90">{data.weddingTime || 'Time TBD'}</p>
            </div>

            <div>
              <p className="font-bold text-lg">{data.venue || 'Venue TBD'}</p>
              <p className="text-sm opacity-80">{data.city || 'City TBD'}</p>
            </div>

            {data.customMessage && (
              <p className="text-xs italic mt-6 opacity-90 line-clamp-3">"{data.customMessage}"</p>
            )}
          </div>
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

  const { currentInvitation: form, templates, invitations, loading } = useSelector(s => s.invitation);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Invitation Generator', action: 'viewed_tool' }).catch(() => { });
    dispatch(fetchInvitations());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const existing = invitations.find(i => i._id === id);
      if (existing) {
        dispatch(loadInvitation(existing));
      }
    } else {
      dispatch(resetBuilder());
    }
  }, [id, invitations, dispatch]);

  const handleChange = (e) => {
    dispatch(updateField({ [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (id) {
      const res = await dispatch(updateInvitation({ id, data: form }));
      if (!res.error) toast.success('Invitation Updated successfully');
    } else {
      const res = await dispatch(createInvitation({ ...form, status: 'published' }));
      if (!res.error) {
        toast.success('Invitation Created successfully');
        api.post('/tools/track', { toolName: 'Invitation Generator', action: 'generated_invitation' }).catch(() => { });
        navigate('/invitation-creator', { replace: true });
      }
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invitation/${id || 'preview'}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* LEFT: FORM */}
      <div className={`w-full md:w-1/2 lg:w-5/12 bg-white h-screen overflow-y-auto flex flex-col ${showPreviewMobile ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/invitation-creator')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <FiArrowLeft />
            </button>
            <h1 className="font-bold text-gray-900 text-lg">{id ? 'Edit Invitation' : 'Create Invitation'}</h1>
          </div>
          <button onClick={() => setShowPreviewMobile(true)} className="md:hidden text-[#C2185B] text-sm font-bold flex items-center gap-1">
            <FiEye /> Preview
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-10">
          {/* SECTION 1: Couple Info */}
          <section>
            <h2 className="text-[#C2185B] font-black uppercase tracking-widest text-xs mb-4">1. Couple Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bride Name</label>
                <input type="text" name="brideName" value={form.brideName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none transition-all" placeholder="E.g. Priya" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Groom Name</label>
                <input type="text" name="groomName" value={form.groomName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none transition-all" placeholder="E.g. Rahul" />
              </div>
            </div>
          </section>

          {/* SECTION 2: Wedding Details */}
          <section>
            <h2 className="text-[#C2185B] font-black uppercase tracking-widest text-xs mb-4">2. Wedding Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="weddingDate" value={form.weddingDate} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" name="weddingTime" value={form.weddingTime} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                <input type="text" name="venue" value={form.venue} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none transition-all" placeholder="E.g. Taj Lake Palace" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none transition-all" placeholder="E.g. Udaipur" />
              </div>
            </div>
          </section>

          {/* SECTION 3: Invitation Message */}
          <section>
            <h2 className="text-[#C2185B] font-black uppercase tracking-widest text-xs mb-4">3. Invitation Message</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Message</label>
              <textarea name="customMessage" value={form.customMessage} onChange={handleChange} rows="3" className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none transition-all resize-none" placeholder="Enter a special message for your guests..."></textarea>
            </div>
          </section>

          {/* SECTION 4: Template Selection */}
          <section>
            <h2 className="text-[#C2185B] font-black uppercase tracking-widest text-xs mb-4">4. Select Template</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => dispatch(selectTemplate(t.id))}
                  className={`aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative group border-2 transition-all ${form.template === t.id ? 'border-[#C2185B] scale-105 shadow-md' : 'border-transparent'}`}
                >
                  <img src={t.img} className="w-full h-full object-cover" alt={t.name} />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold w-full text-center">{t.name}</span>
                  </div>
                  {form.template === t.id && (
                    <div className="absolute top-2 right-2 bg-[#C2185B] text-white rounded-full p-1 shadow-lg">
                      <FiCheckCircle size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ACTIONS */}
          <section className="pt-6 border-t border-gray-100 pb-12">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mb-4"
            >
              <FiSave /> {loading ? 'Saving...' : id ? 'Update Invitation' : 'Save & Publish'}
            </button>

            {id && (
              <div className="flex gap-2">
                <button onClick={() => setShareOpen(true)} className="flex-1 bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <FiShare2 /> Share
                </button>
                <button onClick={() => setDownloadOpen(true)} className="flex-1 bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <FiDownload /> Download
                </button>
                <button onClick={copyLink} className="flex-1 bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <FiLink /> Link
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className={`w-full md:w-1/2 lg:w-7/12 h-screen sticky top-0 bg-gray-100 ${!showPreviewMobile && 'hidden md:block'}`}>
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <button onClick={() => setShowPreviewMobile(false)} className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-2 text-gray-700">
            <FiArrowLeft /> Back to Form
          </button>
        </div>

        <div ref={canvasRef} className="w-full h-full">
          <SimplePreview data={form} templates={templates} />
        </div>
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} invitationId={id} />
      <DownloadModal isOpen={downloadOpen} onClose={() => setDownloadOpen(false)} canvasRef={canvasRef} />
    </div>
  );
}
