import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiUploadCloud, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function VendorRealWeddingsPage() {
  const { myVendorProfile: vendor } = useSelector(s => s.vendor);
  const [weddings, setWeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    brideName: '', groomName: '', city: '', venue: '', weddingDate: '',
    story: '', budget: '', coverImage: null, galleryImages: [], servicesUsed: ''
  });
  const [previews, setPreviews] = useState({ coverImage: null, galleryImages: [] });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    try {
      const res = await api.get('/showcase/vendor/real-weddings');
      setWeddings(res.data.data);
    } catch (err) {
      toast.error('Failed to load Real Weddings');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e, field) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (field === 'coverImage') {
      const file = files[0];
      setFormData(p => ({ ...p, coverImage: file }));
      setPreviews(p => ({ ...p, coverImage: URL.createObjectURL(file) }));
    } else {
      setFormData(p => ({ ...p, galleryImages: [...p.galleryImages, ...files] }));
      setPreviews(p => ({ ...p, galleryImages: [...p.galleryImages, ...files.map(f => URL.createObjectURL(f))] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coverImage && !previews.coverImage) {
      return toast.error('Please upload a cover image');
    }

    setUploading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'galleryImages' || key === 'coverImage' || key === 'servicesUsed') return;
        submitData.append(key, formData[key]);
      });

      submitData.append('status', 'pending');

      const services = formData.servicesUsed ? formData.servicesUsed.split(',').map(s => s.trim()) : [];
      services.forEach(s => submitData.append('servicesUsed', s));

      if (formData.coverImage instanceof File) {
        submitData.append('coverImage', formData.coverImage);
      } else if (typeof formData.coverImage === 'string') {
        submitData.append('coverImage', formData.coverImage);
      }

      formData.galleryImages.forEach(item => {
        submitData.append('galleryImages', item);
      });

      if (editingId) {
        await api.patch(`/showcase/vendor/real-weddings/${editingId}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Real Wedding updated!');
      } else {
        await api.post('/showcase/vendor/real-weddings', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Real Wedding submitted for approval!');
      }
      setIsModalOpen(false);
      fetchWeddings();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this wedding?')) return;
    try {
      await api.delete(`/showcase/vendor/real-weddings/${id}`);
      toast.success('Deleted successfully');
      fetchWeddings();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (wedding) => {
    setFormData({
      ...wedding,
      weddingDate: new Date(wedding.weddingDate).toISOString().split('T')[0],
      servicesUsed: wedding.servicesUsed.join(', '),
      coverImage: wedding.coverImage,
      galleryImages: wedding.galleryImages || []
    });
    setPreviews({
      coverImage: wedding.coverImage,
      galleryImages: wedding.galleryImages || []
    });
    setEditingId(wedding._id);
    setIsModalOpen(true);
  };

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-gray-900">Real Weddings</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Showcase your best weddings to attract premium clients.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ brideName: '', groomName: '', city: '', venue: '', weddingDate: '', story: '', budget: '', coverImage: null, galleryImages: [], servicesUsed: '' });
            setPreviews({ coverImage: null, galleryImages: [] });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FiPlus /> Add Real Wedding
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : weddings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <FiImage className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No Weddings Added</h3>
          <p className="text-gray-500 mt-2">Add your first real wedding to showcase your work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map(wedding => (
            <div key={wedding._id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={wedding.coverImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
                  {wedding.status}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-black text-gray-900 mb-1">{wedding.brideName} & {wedding.groomName}</h3>
                <p className="text-sm text-gray-500 font-medium">{wedding.city} • {new Date(wedding.weddingDate).toLocaleDateString()}</p>
                
                <div className="flex gap-2 mt-6">
                  <button onClick={() => openEdit(wedding)} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(wedding._id)} className="w-10 flex-shrink-0 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex justify-center items-center transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header (Fixed) */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-display font-black">{editingId ? 'Edit Wedding' : 'Add Real Wedding'}</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bride Name</label>
                  <input type="text" value={formData.brideName} onChange={e => setFormData({...formData, brideName: e.target.value})} required className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Groom Name</label>
                  <input type="text" value={formData.groomName} onChange={e => setFormData({...formData, groomName: e.target.value})} required className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Venue</label>
                  <input type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} required className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Wedding Date</label>
                  <input type="date" value={formData.weddingDate} onChange={e => setFormData({...formData, weddingDate: e.target.value})} required className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Budget (e.g. 10-15 Lakhs)</label>
                  <input type="text" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Services Used (comma separated)</label>
                <input type="text" value={formData.servicesUsed} onChange={e => setFormData({...formData, servicesUsed: e.target.value})} placeholder="Photography, Venue, Catering..." className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Wedding Story</label>
                <textarea value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} required rows="4" className="w-full p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary-500 focus:bg-white transition-colors outline-none"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Cover Image</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center hover:bg-pink-50/30 hover:border-primary-300 transition-all group h-48 flex flex-col items-center justify-center overflow-hidden">
                    <input type="file" onChange={e => handleImageUpload(e, 'coverImage')} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {previews.coverImage ? (
                      <>
                        <img src={previews.coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                        <span className="text-sm font-bold text-primary-900 bg-white/80 px-3 py-1 rounded-full relative z-20">Replace</span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center pointer-events-none relative z-20">
                        <FiUploadCloud size={24} className="text-gray-400 mb-2 group-hover:text-primary-500" />
                        <p className="text-sm font-bold text-gray-900">Cover Image</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Gallery Images</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center hover:bg-pink-50/30 hover:border-primary-300 transition-all group h-48 flex flex-col items-center justify-center overflow-hidden">
                    <input type="file" multiple onChange={e => handleImageUpload(e, 'galleryImages')} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {previews.galleryImages?.length > 0 ? (
                      <div className="w-full h-full absolute inset-0 p-2 flex flex-wrap gap-1 justify-center items-center overflow-hidden bg-gray-50/50">
                         {previews.galleryImages.slice(0, 4).map((img, i) => (
                           <img key={i} src={img} className="w-[45%] h-[45%] object-cover rounded-lg shadow-sm" alt="Gallery preview" />
                         ))}
                         {previews.galleryImages.length > 4 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">+{previews.galleryImages.length - 4} More</div>}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center pointer-events-none relative z-20">
                        <FiImage size={24} className="text-gray-400 mb-2 group-hover:text-primary-500" />
                        <p className="text-sm font-bold text-gray-900">Upload Gallery</p>
                      </div>
                    )}
                  </div>
                </div>
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
                  {uploading ? 'Uploading...' : 'Save Wedding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
