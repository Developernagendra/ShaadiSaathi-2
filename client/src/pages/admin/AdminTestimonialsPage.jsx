import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheckCircle, FiImage, FiVideo, FiStar, FiUploadCloud } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    city: '',
    review: '',
    rating: 5,
    image: '',
    video: '',
    weddingDate: '',
    servicesBooked: '',
    isVerified: true,
    isFeatured: false
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    document.title = "Manage Testimonials - Admin Dashboard";
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/admin/testimonials');
      setTestimonials(res.data.data.testimonials || []);
    } catch (err) {
      toast.error('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image' && file.size > 5 * 1024 * 1024) {
      return toast.error("Image size must be less than 5MB");
    }

    setUploadingImage(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      // Use existing admin upload endpoint
      const res = await api.post('/admin/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, [type]: res.data.url }));
      toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`);
    } catch (err) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const openModal = (testimonial = null) => {
    if (testimonial) {
      setEditingId(testimonial._id);
      setFormData({
        brideName: testimonial.brideName || '',
        groomName: testimonial.groomName || '',
        city: testimonial.city || '',
        review: testimonial.review || '',
        rating: testimonial.rating || 5,
        image: testimonial.image || '',
        video: testimonial.video || '',
        weddingDate: testimonial.weddingDate ? testimonial.weddingDate.split('T')[0] : '',
        servicesBooked: testimonial.servicesBooked ? testimonial.servicesBooked.join(', ') : '',
        isVerified: testimonial.isVerified,
        isFeatured: testimonial.isFeatured
      });
    } else {
      setEditingId(null);
      setFormData({
        brideName: '',
        groomName: '',
        city: '',
        review: '',
        rating: 5,
        image: '',
        video: '',
        weddingDate: '',
        servicesBooked: '',
        isVerified: true,
        isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert servicesBooked string to array
    const payload = {
      ...formData,
      servicesBooked: formData.servicesBooked.split(',').map(s => s.trim()).filter(s => s)
    };

    if (editingId) payload.id = editingId;

    try {
      await api.post('/admin/testimonials', payload);
      toast.success(editingId ? 'Testimonial updated' : 'Testimonial added');
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to delete testimonial');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Testimonials</h1>
          <p className="text-gray-500 mt-1">Add and manage couple reviews shown on the homepage.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-[#C2185B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a3154d] transition-colors flex items-center gap-2"
        >
          <FiPlus /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C2185B]"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Couple</th>
                  <th className="px-6 py-4 font-semibold">Review</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testimonials.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {t.image ? (
                          <img src={t.image} alt="Couple" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-[#C2185B] font-bold">
                            {t.brideName.charAt(0)}{t.groomName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{t.brideName} &amp; {t.groomName}</div>
                          <div className="text-xs text-gray-500">{t.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{t.review}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-[#D4AF37]">
                        {[...Array(t.rating)].map((_, i) => <FiStar key={i} className="fill-current" />)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {t.isVerified && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-max"><FiCheckCircle /> Verified</span>}
                        {t.isFeatured && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-max">Featured</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(t)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {testimonials.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No testimonials found. Add your first couple review!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bride Name *</label>
                  <input type="text" name="brideName" value={formData.brideName} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Groom Name *</label>
                  <input type="text" name="groomName" value={formData.groomName} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Wedding Date</label>
                  <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Services Booked (comma separated)</label>
                <input type="text" name="servicesBooked" value={formData.servicesBooked} onChange={handleInputChange} placeholder="e.g. Photography, Venue, Baraat Cab" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review *</label>
                <textarea name="review" value={formData.review} onChange={handleInputChange} required rows="4" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Couple Photo</label>
                  <div className="flex items-center gap-4">
                    {formData.image && <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
                      <FiUploadCloud /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Video Link (Optional)</label>
                  <div className="flex items-center gap-2">
                    <FiVideo className="text-gray-400" />
                    <input type="text" name="video" value={formData.video} onChange={handleInputChange} placeholder="YouTube/Vimeo URL or MP4 Link" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <select name="rating" value={formData.rating} onChange={handleInputChange} className="border border-gray-300 rounded-lg p-2 outline-none">
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleInputChange} className="w-4 h-4 text-[#C2185B] focus:ring-[#C2185B] rounded" />
                    <span className="text-sm font-medium text-gray-700">Verified Couple</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-4 h-4 text-[#C2185B] focus:ring-[#C2185B] rounded" />
                    <span className="text-sm font-medium text-gray-700">Feature on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#C2185B] text-white font-bold rounded-lg hover:bg-[#a3154d] transition-colors disabled:opacity-50" disabled={uploadingImage}>
                  {editingId ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
