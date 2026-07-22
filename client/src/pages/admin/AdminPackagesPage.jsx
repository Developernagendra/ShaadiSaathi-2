import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminPackages, createPackage, updatePackage, deletePackage } from '../../store/slices/packageSlice';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminPackagesPage() {
  const dispatch = useDispatch();
  const { packages, loading } = useSelector(state => state.packages);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', slug: '', category: 'Wedding', priority: 0,
    shortDescription: '', longDescription: '',
    price: 0, discount: 0,
    status: 'published', visibility: true,
    guests: '', events: '',
    features: '', includedServices: '', excludedServices: ''
  });

  useEffect(() => {
    dispatch(fetchAdminPackages());
  }, [dispatch]);

  const filteredPackages = packages?.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name || '', slug: pkg.slug || '', category: pkg.category || 'Wedding', priority: pkg.priority || 0,
        shortDescription: pkg.shortDescription || '', longDescription: pkg.longDescription || '',
        price: pkg.price || 0, discount: pkg.discount || 0,
        status: pkg.status || 'published', visibility: pkg.visibility ?? true,
        guests: pkg.guests || '', events: pkg.events || '',
        features: pkg.features?.join(', ') || '',
        includedServices: pkg.includedServices?.join(', ') || '',
        excludedServices: pkg.excludedServices?.join(', ') || ''
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '', slug: '', category: 'Wedding', priority: 0,
        shortDescription: '', longDescription: '',
        price: 0, discount: 0,
        status: 'published', visibility: true,
        guests: '', events: '',
        features: '', includedServices: '', excludedServices: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Auto-generate slug from name if empty
  const handleNameBlur = () => {
    if (!formData.slug && formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert comma-separated lists back to arrays
    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount),
      priority: Number(formData.priority),
      features: formData.features.split(',').map(s => s.trim()).filter(Boolean),
      includedServices: formData.includedServices.split(',').map(s => s.trim()).filter(Boolean),
      excludedServices: formData.excludedServices.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (editingPackage) {
        await dispatch(updatePackage({ id: editingPackage._id, data: payload })).unwrap();
        toast.success('Package updated successfully');
      } else {
        await dispatch(createPackage(payload)).unwrap();
        toast.success('Package created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error(error || 'Failed to save package');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await dispatch(deletePackage(id)).unwrap();
        toast.success('Package deleted successfully');
      } catch (err) {
        toast.error(err || 'Failed to delete package');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Packages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage wedding packages, pricing, and features.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm"
            />
          </div>
          <button onClick={() => openModal()} className="bg-gray-900 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm font-medium whitespace-nowrap text-sm">
            <FiPlus /> Create Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading && !packages?.length ? (
          [...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col gap-4 animate-pulse h-[380px]">
              <div className="h-40 bg-gray-100 rounded-[16px] w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="mt-auto h-12 bg-gray-50 rounded-xl w-full"></div>
            </div>
          ))
        ) : filteredPackages?.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200 shadow-inner">
              <FiSearch className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-serif">No Packages Found</h3>
            <p className="text-gray-500 mt-2 mb-6">Create your first premium wedding package to get started.</p>
            <button onClick={() => openModal()} className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-white px-8 py-3 rounded-xl shadow-[0_8px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)] transition-all font-bold tracking-wide active:scale-95 flex items-center gap-2">
              <FiPlus /> Create Package
            </button>
          </div>
        ) : (
          filteredPackages?.map((pkg) => {
            const displayPrice = pkg.finalPrice 
              ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pkg.finalPrice)
              : pkg.price;

            const originalPrice = (pkg.discount > 0 && pkg.price)
              ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pkg.price)
              : null;

            return (
              <div 
                key={pkg._id} 
                className="group relative bg-white/70 backdrop-blur-xl rounded-[24px] border-[1.5px] border-white text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Header Image Area / Gradient */}
                <div className="h-28 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative p-5 flex items-start justify-between">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                  <div className="relative z-10 flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {pkg.category}
                    </span>
                    {pkg.status === 'published' && (
                      <span className="px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                        Published
                      </span>
                    )}
                  </div>
                  
                  {/* Floating Icon */}
                  <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-2xl z-20">
                    {pkg.icon || '💍'}
                  </div>
                </div>

                <div className="p-6 pt-10 flex flex-col flex-1 relative z-10">
                  {/* Title & Desc */}
                  <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{pkg.shortDescription || 'A beautifully curated wedding experience.'}</p>

                  {/* Pricing Section */}
                  <div className="mb-5 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Final Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900 font-serif">{displayPrice}</span>
                        {originalPrice && <span className="text-xs text-gray-400 line-through">{originalPrice}</span>}
                      </div>
                    </div>
                    {pkg.discount > 0 && (
                      <div className="bg-[#18181B] text-[#D4AF37] px-3 py-1.5 rounded-xl text-xs font-black shadow-sm">
                        Save {pkg.discount}%
                      </div>
                    )}
                  </div>

                  {/* Feature Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {pkg.features?.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-600 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-[#D4AF37]"></div>
                        {feat}
                      </div>
                    ))}
                    {pkg.features?.length > 3 && (
                      <div className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-400">
                        +{pkg.features.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => openModal(pkg)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-700 text-xs font-bold transition-all border border-transparent hover:shadow-lg active:scale-95"
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(pkg._id)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold transition-all border border-transparent hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/5 group-hover:to-transparent pointer-events-none transition-colors duration-500"></div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="packageForm" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} onBlur={handleNameBlur} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="e.g. Royal Gold Wedding" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                        <input required type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50" placeholder="royal-gold-wedding" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                          <option value="Wedding">Wedding</option>
                          <option value="Pre-Wedding">Pre-Wedding</option>
                          <option value="Destination">Destination</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Priority</label>
                        <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Higher number = displays first" />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹) *</label>
                        <input required type="number" min="0" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                        <input type="number" min="0" max="100" name="discount" value={formData.discount} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                      <input required type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="A brief hook for the package" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                      <textarea name="longDescription" value={formData.longDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" placeholder="Detailed description of what makes this package special..."></textarea>
                    </div>
                  </div>

                  {/* Features & Services */}
                  <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Inclusions & Exclusions</h3>
                    <p className="text-xs text-gray-500 mb-3">Separate items with commas (e.g. "Photography, Premium Decor, DJ")</p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Top Features (Highlights)</label>
                      <textarea name="features" value={formData.features} onChange={handleInputChange} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" placeholder="e.g. 📸 2 Cameramen, 🍽 Premium Catering"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Included Services</label>
                        <textarea name="includedServices" value={formData.includedServices} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none bg-green-50/30" placeholder="e.g. Candid Photography, Traditional Video, Stage Decor"></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Excluded Services</label>
                        <textarea name="excludedServices" value={formData.excludedServices} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none bg-red-50/30" placeholder="e.g. Transport, Hotel Stay, Makeup"></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="visibility" checked={formData.visibility} onChange={handleInputChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700">Public Visibility</span>
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={closeModal} type="button" className="px-5 py-2 text-gray-600 hover:bg-gray-200 bg-gray-100 font-medium rounded-xl transition-colors">
                Cancel
              </button>
              <button form="packageForm" type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2">
                <FiCheck /> {editingPackage ? 'Save Changes' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
