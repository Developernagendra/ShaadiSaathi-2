import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiImage, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CATEGORIES = [
  'Photography', 'Decoration', 'Mehndi', 'Makeup', 'Venue', 
  'Catering', 'DJ', 'Luxury Baraat Cabs', 'Haldi', 'Sangeet', 
  'Reception', 'Other'
];

export default function VendorGalleryPage() {
  const { myVendorProfile: vendor } = useSelector(s => s.vendor);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Photography', tags: '', videos: '', images: [], status: 'pending'
  });
  const [previews, setPreviews] = useState({ images: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await api.get('/showcase/vendor/gallery');
      setGallery(res.data.data);
    } catch (err) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setFormData(p => ({ ...p, images: [...p.images, ...files] }));
    setPreviews(p => ({ ...p, images: [...p.images, ...files.map(f => URL.createObjectURL(f))] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0 && previews.images.length === 0) {
      return toast.error('Please upload at least one image');
    }

    setUploading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('status', 'pending');

      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      tagsArray.forEach(t => submitData.append('tags[]', t));

      const videosArray = formData.videos ? formData.videos.split(',').map(v => v.trim()) : [];
      videosArray.forEach(v => submitData.append('videos[]', v));

      formData.images.forEach(item => {
        if (item instanceof File) {
          submitData.append('images', item);
        } else if (typeof item === 'string') {
          submitData.append('existingImages[]', item);
        }
      });

      if (editingId) {
        await api.patch(`/showcase/vendor/gallery/${editingId}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Gallery updated!');
      } else {
        await api.post('/showcase/vendor/gallery', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Gallery item submitted for approval!');
      }
      
      setIsModalOpen(false);
      fetchGallery();
      setFormData({ title: '', description: '', category: 'Photography', tags: '', videos: '', images: [], status: 'pending' });
      setPreviews({ images: [] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit');
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (album) => {
    setFormData({
      ...album,
      tags: album.tags?.join(', ') || '',
      videos: album.videos?.join(', ') || '',
      images: album.images || []
    });
    setPreviews({ images: album.images || [] });
    setEditingId(album._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    try {
      await api.delete(`/showcase/vendor/gallery/${id}`);
      toast.success('Deleted successfully');
      fetchGallery();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 md:mb-12 relative z-10">
        <div>
          <h1 className="font-display text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Gallery Management</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium italic mt-2">Manage your categorized albums to attract high-end clients.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', description: '', category: 'Photography', tags: '', videos: '', images: [], status: 'pending' });
            setPreviews({ images: [] });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FiPlus /> Create New Album
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : gallery.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <FiImage className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No Albums Found</h3>
          <p className="text-gray-500 mt-2">Create your first photo album to showcase your work.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {gallery.map(album => (
            <div key={album._id} className="break-inside-avoid bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group">
              <div className="relative">
                <img src={album.images[0]} alt={album.title} className="w-full object-cover aspect-[4/3]" />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
                    {album.status}
                  </span>
                  <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
                    {album.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-black text-gray-900 mb-1">{album.title}</h3>
                <p className="text-sm text-gray-500 font-medium mb-4">{album.images.length} Photos</p>
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={() => openEdit(album)} className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1 flex-1">
                    Edit Album
                  </button>
                  <button onClick={() => handleDelete(album._id)} className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1 flex-1 justify-end">
                    <FiX /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header (Fixed) */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-display font-black">Create New Album</h2>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full flex items-center justify-center transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Form Body (Scrollable) */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Album Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none appearance-none cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Traditional, Outdoors" className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Video URLs (comma separated)</label>
                  <input type="text" value={formData.videos} onChange={e => setFormData({...formData, videos: e.target.value})} placeholder="e.g. YouTube or Vimeo link" className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Upload Photos</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-3xl p-6 md:p-10 text-center hover:bg-pink-50/30 hover:border-primary-300 transition-all group">
                  <input type="file" multiple onChange={handleImageUpload} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary-50 group-hover:text-primary-500">
                      <FiUpload size={28} />
                    </div>
                    <p className="text-base font-bold text-gray-900">Click or drag images to upload</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">SVG, PNG, JPG or WebP (max. 5MB per file)</p>
                  </div>
                </div>
                
                {previews.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {previews.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Preview" />
                        <button type="button" onClick={() => {
                          setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
                          setPreviews(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
                        }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-20">
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploading && (
                <div className="bg-primary-50 text-primary-700 p-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-pulse">
                   <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div> Uploading Media...
                </div>
              )}

              </div>

              {/* Footer (Fixed) */}
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4 mt-auto rounded-b-[2rem]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 sm:py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold transition-colors shadow-sm">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3.5 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all disabled:opacity-50">
                  Save Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
