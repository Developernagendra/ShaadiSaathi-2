import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiFileText, FiGlobe, FiImage, FiClock, FiLoader } from 'react-icons/fi';
import { formatDateShort, optimizeImage } from '../../utils/helpers'
import Modal from '../../components/common/Modal'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('edit') // 'edit' or 'preview'
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    isPublished: false,
    coverImage: ''
  })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/blogs')
      // Ensure data.blogs is an array
      const blogList = Array.isArray(data?.blogs) ? data.blogs : 
                       (Array.isArray(data?.data?.blogs) ? data.data.blogs : [])
      setBlogs(blogList)
    } catch (err) { 
      console.error('Failed to load blogs:', err)
      toast.error('Failed to load blogs') 
      setBlogs([])
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { load() }, [])

  const filteredBlogs = (Array.isArray(blogs) ? blogs : []).filter(b => {
    if (!b) return false
    const title = b.title || ''
    const category = b.category || ''
    const query = (searchQuery || '').toLowerCase()
    return title.toLowerCase().includes(query) || category.toLowerCase().includes(query)
  })

  const handleEdit = (blog) => {
    if (!blog) return
    setEditingBlog(blog)
    setForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      isPublished: !!blog.isPublished,
      coverImage: blog.coverImage || ''
    })
    setActiveTab('edit')
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Delete this blog article permanently?')) return
    try {
      await api.delete(`/admin/blogs/${id}`)
      setBlogs(prev => prev.filter(b => b?._id !== id))
      toast.success('Blog deleted successfully')
    } catch (err) { toast.error('Failed to delete') }
  }

  const uploadImageFile = async (file) => {
    if (!file) return

    // Quick frontend size and type validations
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(file.type)) {
      setUploadError('Invalid format. Only JPG, JPEG, PNG, and WEBP images are allowed.')
      toast.error('Invalid image format')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('File too large. Maximum size is 5MB.')
      toast.error('File size too large')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      })
      setForm(prev => ({ ...prev, coverImage: data?.url || '' }))
      toast.success('Cover image uploaded! 📸')
    } catch (err) {
      console.error('Image upload failed:', err)
      const errorMsg = err.response?.data?.message || 'Upload failed'
      setUploadError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    uploadImageFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadImageFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e, forcePublish = null) => {
    if (e) e.preventDefault()

    const isPublishedValue = forcePublish !== null ? forcePublish : form.isPublished
    
    if (!form.title?.trim() || !form.content?.trim()) {
      return toast.error('Title and content are required')
    }

    const payload = {
      ...form,
      id: editingBlog?._id,
      isPublished: isPublishedValue,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    }

    try {
      const { data } = await api.post('/admin/blogs', payload)
      const savedBlog = data?.blog
      if (!savedBlog) throw new Error('No blog data returned')

      if (editingBlog) {
        setBlogs(prev => prev.map(b => b?._id === savedBlog._id ? savedBlog : b))
      } else {
        setBlogs(prev => [savedBlog, ...prev])
      }
      toast.success(isPublishedValue ? 'Blog published!' : 'Draft saved!')
      setIsModalOpen(false)
    } catch (err) { 
      console.error('Save error:', err)
      toast.error('Failed to save blog') 
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#C2185B] text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">
              <div className="w-8 h-[1px] bg-[#C2185B]/30" />
              Content Management
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
              Manage <span className="text-[#D4AF37]">Blogs</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C2185B] transition-colors" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-pink-50 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-[#C2185B]/30 focus:shadow-xl transition-all w-full md:w-64"
              />
            </div>
            <button
              onClick={() => {
                setEditingBlog(null);
                setForm({ title: '', excerpt: '', content: '', category: '', tags: '', isPublished: false, coverImage: '' });
                setActiveTab('edit');
                setIsModalOpen(true)
              }}
              className="bg-[#C2185B] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-pink-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 italic"
            >
              <FiPlus size={18} /> New Article
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-pink-50 overflow-hidden">
          {loading ? (
            <div className="p-12 space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-[2rem]" />
              ))}
            </div>
          ) : filteredBlogs.length > 0 ? (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table-responsive w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-pink-50">
                      {['Article', 'Category', 'Stats', 'Status', 'Actions'].map(h => (
                        <th key={h} className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] italic">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {filteredBlogs.map(b => (
                      <tr key={b?._id || Math.random()} className="hover:bg-[#FFF8F0]/30 transition-all group">
                        <td data-label="Article" className="py-6 px-8">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-pink-50">
                              {b?.coverImage ? (
                                <img src={optimizeImage(b.coverImage, 200)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">🖼️</div>
                              )}
                            </div>
                            <div>
                              <p className="font-display font-black text-gray-900 group-hover:text-[#C2185B] transition-colors line-clamp-1">{b?.title || 'Untitled Article'}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">
                                By {b?.author?.name || 'ShaadiSaathi Admin'} • {b?.createdAt ? formatDateShort(b.createdAt) : 'Recent'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td data-label="Category" className="py-6 px-8">
                          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest italic bg-[#FFF8F0] px-4 py-1.5 rounded-full border border-pink-50">
                            {b?.category || 'General'}
                          </span>
                        </td>
                        <td data-label="Stats" className="py-6 px-8">
                          <div className="flex items-center gap-4 text-gray-400 text-xs">
                            <span className="flex items-center gap-1.5 font-bold"><FiEye className="text-blue-400" /> {b?.views || 0}</span>
                            <span className="flex items-center gap-1.5 font-bold"><FiClock className="text-amber-400" /> {b?.content ? Math.ceil(b.content.split(' ').length / 200) : 0}m</span>
                          </div>
                        </td>
                        <td data-label="Status" className="py-6 px-8">
                          {b?.isPublished ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <FiGlobe size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Published</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <FiFileText size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Draft</span>
                            </div>
                          )}
                        </td>
                        <td data-label="Actions" className="py-6 px-8">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(b)} className="p-3 bg-white text-gray-400 hover:text-blue-500 hover:shadow-lg rounded-xl border border-pink-50 transition-all"><FiEdit2 size={16} /></button>
                            <button onClick={() => handleDelete(b?._id)} className="p-3 bg-white text-gray-400 hover:text-red-500 hover:shadow-lg rounded-xl border border-pink-50 transition-all"><FiTrash2 size={16} /></button>
                            <Link to={`/blog/${b?.slug}`} className="p-3 bg-white text-gray-400 hover:text-[#C2185B] hover:shadow-lg rounded-xl border border-pink-50 transition-all"><FiEye size={16} /></Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-pink-50">
                {filteredBlogs.map(b => (
                  <div key={b?._id || Math.random()} className="p-6 space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-gray-100 overflow-hidden flex-shrink-0 border border-pink-50">
                        {b?.coverImage ? (
                          <img src={optimizeImage(b.coverImage, 200)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">🖼️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest italic">{b?.category || 'General'}</span>
                        <h3 className="font-display font-black text-gray-900 line-clamp-2 mt-1">{b?.title || 'Untitled'}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${b?.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        {b?.isPublished ? 'Published' : 'Draft'}
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(b)} className="p-3 bg-gray-50 text-gray-400 rounded-xl"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDelete(b?._id)} className="p-3 bg-gray-50 text-red-400 rounded-xl"><FiTrash2 size={16} /></button>
                        <Link to={`/blog/${b?.slug}`} className="p-3 bg-gray-50 text-[#C2185B] rounded-xl"><FiEye size={16} /></Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-32 text-center">
              <div className="text-6xl mb-6 opacity-20">✍️</div>
              <h3 className="font-display text-2xl font-black text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-400 font-medium italic">Start by creating your first wedding inspiration article.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBlog ? 'Edit Masterpiece' : 'Compose New Article'}
        size="4xl"
      >
        <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />
        
        {/* Tabs */}
        <div className="flex items-center gap-8 px-12 border-b border-pink-50 bg-[#FFF8F0]/20 relative z-10">
          <button 
            onClick={() => setActiveTab('edit')}
            className={`py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'edit' ? 'text-[#C2185B]' : 'text-gray-400'}`}
          >
            Editor
            {activeTab === 'edit' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C2185B]" />}
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'preview' ? 'text-[#C2185B]' : 'text-gray-400'}`}
          >
            Preview
            {activeTab === 'preview' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C2185B]" />}
          </button>
        </div>

        <div className="p-8 md:p-12 relative z-10 overflow-y-auto max-h-[70vh]">
          {activeTab === 'edit' ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3 italic ml-1">Article Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full bg-[#FFF8F0]/30 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-5 text-gray-900 placeholder-gray-300 focus:outline-none transition-all font-display text-xl font-black shadow-sm"
                    placeholder="e.g. 10 Trends That Will Define 2026 Weddings"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3 italic ml-1">Short Excerpt</label>
                  <textarea
                    value={form.excerpt}
                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                    className="w-full bg-[#FFF8F0]/30 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-300 focus:outline-none transition-all font-bold shadow-sm"
                    placeholder="A brief summary for the blog card..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3 italic ml-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    required
                    className="w-full bg-[#FFF8F0]/30 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-4 text-gray-900 focus:outline-none transition-all font-bold shadow-sm appearance-none"
                  >
                    <option value="">Select Category</option>
                    {['Planning', 'Fashion', 'Venues', 'Photography', 'Decor', 'Real Weddings', 'Jewelry', 'Makeup'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3 italic ml-1">Tags (separated by comma)</label>
                  <input
                    value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                    className="w-full bg-[#FFF8F0]/30 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-300 focus:outline-none transition-all font-bold shadow-sm"
                    placeholder="modern, minimal, traditional"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3 italic ml-1">Cover Image</label>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative group">
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`w-full h-48 rounded-2xl border-2 border-dashed relative flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
                          dragActive 
                            ? 'border-[#C2185B] bg-[#FFF8F0]/80 scale-[1.02]' 
                            : form.coverImage 
                              ? 'border-[#C2185B]/20 bg-gray-50/50' 
                              : 'border-gray-200 bg-gray-50/50'
                        } ${uploadError ? 'border-red-400 bg-red-50/10' : ''}`}
                      >
                        {form.coverImage ? (
                          <div className="w-full h-full relative group">
                            <img src={form.coverImage} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <button 
                                type="button"
                                onClick={() => setForm(p => ({ ...p, coverImage: '' }))}
                                className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="Remove image"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-6 pointer-events-none">
                            <FiImage size={32} className={`mx-auto mb-2 transition-colors ${dragActive ? 'text-[#C2185B]' : 'text-gray-300'}`} />
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                              {dragActive ? 'Drop it here!' : 'Drag & drop image'}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                              or click to browse
                            </p>
                          </div>
                        )}
                        
                        {!form.coverImage && !uploading && (
                          <input 
                            type="file" 
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/jpeg, image/jpg, image/png, image/webp"
                          />
                        )}
                        
                        {uploading && (
                          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                            <FiLoader className="animate-spin text-[#C2185B] mb-3" size={24} />
                            <p className="text-[10px] font-black text-[#C2185B] uppercase tracking-widest">Uploading... {uploadProgress}%</p>
                            <div className="w-32 bg-gray-100 h-1 rounded-full overflow-hidden mt-2">
                              <div className="bg-[#C2185B] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {uploadError && (
                        <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{uploadError}</p>
                          <button 
                            type="button"
                            onClick={() => {
                              setUploadError(null);
                            }}
                            className="text-[9px] font-black text-[#C2185B] uppercase tracking-widest hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:w-1/2 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-widest leading-relaxed mb-4">
                          Upload a high-quality cover image. Accepted formats: JPG, JPEG, PNG, WEBP. Max size: 5MB.
                        </p>
                        <input 
                          value={form.coverImage}
                          onChange={e => setForm({ ...form, coverImage: e.target.value })}
                          className="w-full bg-[#FFF8F0]/30 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-xl px-4 py-3 text-[10px] font-bold text-gray-500 focus:outline-none transition-all shadow-inner"
                          placeholder="Or paste direct image URL..."
                        />
                      </div>
                      {form.coverImage && (
                        <div className="mt-4 flex gap-4">
                          <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, coverImage: '' }))}
                            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1.5"
                          >
                            <FiTrash2 size={12} /> Clear Cover Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-3 ml-1">
                    <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] italic">Full Story</label>
                  </div>
                  <div className="quill-container">
                    <ReactQuill 
                      theme="snow"
                      value={form.content}
                      onChange={val => setForm({ ...form, content: val })}
                      modules={quillModules}
                      className="bg-white rounded-2xl overflow-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#FFF8F0]/50 p-6 rounded-[2rem] border border-pink-50">
                <div className="relative inline-flex items-center cursor-pointer group" onClick={() => setForm({ ...form, isPublished: !form.isPublished })}>
                  <div className={`w-14 h-8 rounded-full transition-all duration-300 relative ${form.isPublished ? 'bg-[#27ae60]' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${form.isPublished ? 'translate-x-6' : 'translate-x-0'} shadow-sm`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 italic uppercase tracking-widest">Public Visibility</p>
                  <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-widest mt-1">Make this article visible to all users immediately</p>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src={form.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80'} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <span className="bg-[#D4AF37] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {form.category || 'Category'}
                  </span>
                  <h2 className="font-display text-4xl md:text-6xl font-black text-white mt-6 leading-tight drop-shadow-2xl">
                    {form.title || 'Untitled Article'}
                  </h2>
                </div>
              </div>
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-6 mb-12 py-8 border-y border-pink-50">
                  <div className="w-16 h-16 rounded-2xl bg-[#C2185B] text-white flex items-center justify-center font-display text-2xl font-black shadow-xl shadow-pink-100">
                    A
                  </div>
                  <div>
                    <p className="text-gray-900 font-black text-xs uppercase tracking-widest italic">Admin Editor</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Preview Mode
                    </p>
                  </div>
                </div>
                <p className="text-2xl text-gray-500 font-medium italic mb-12 leading-relaxed border-l-4 border-[#D4AF37] pl-8 py-2">
                  {form.excerpt || 'No excerpt provided.'}
                </p>
                <div 
                  className="prose prose-luxe prose-pink max-w-none text-gray-700 leading-loose text-lg"
                  dangerouslySetInnerHTML={{ __html: form.content || '<p className="text-gray-400 italic">No content written yet...</p>' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-12 py-8 border-t border-pink-50 flex flex-col md:flex-row gap-4 bg-white/50 relative z-10">
          <button
            type="button"
            onClick={() => handleSubmit(null, false)}
            disabled={uploading}
            className="flex-1 bg-white border-2 border-pink-50 text-gray-400 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:border-gray-900 hover:text-gray-900 transition-all italic active:scale-95 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(null, true)}
            disabled={uploading}
            className="flex-[2] bg-[#C2185B] text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all italic flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {uploading ? <FiLoader className="animate-spin" /> : <FiGlobe />} {editingBlog ? 'Update & Publish' : 'Launch Masterpiece'}
          </button>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .quill-container .ql-container {
          min-height: 300px;
          font-family: 'Lato', sans-serif;
          font-size: 16px;
          border-color: transparent !important;
          background: #FFF8F0/30;
        }
        .quill-container .ql-toolbar {
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          border-color: #fce7f3 !important;
          background: white;
          padding: 1rem;
        }
        .quill-container .ql-container {
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          background: #FFF8F0/30;
        }
        .prose-luxe h1, .prose-luxe h2, .prose-luxe h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          color: #1a1a1a;
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
        }
        .prose-luxe p { margin-bottom: 1.5rem; }
        .prose-luxe img { border-radius: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.1); margin: 3rem 0; }
      `}} />
    </div>
  )
}
