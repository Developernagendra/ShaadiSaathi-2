import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadVendorImages, updateVendorProfile } from '../../store/slices/vendorSlice'
import { FiImage, FiUpload, FiStar, FiGrid, FiFilm, FiTrash2, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast'
import api from '../../utils/api'

export default function VendorPortfolioBuilder() {
  const dispatch = useDispatch()
  const { myVendorProfile: vendor } = useSelector(s => s.vendor)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [filter, setFilter] = useState('all')

  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = async (files) => {
    const fileArray = Array.from(files)
    if (!fileArray.length) return
    
    const formData = new FormData()
    fileArray.forEach(file => formData.append('images', file))

    setUploading(true)
    try {
      await dispatch(uploadVendorImages(formData)).unwrap()
      toast.success('Media uploaded successfully!')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : (err?.response?.data?.message || 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = async (id) => {
    if (!confirm('Remove this media from your portfolio?')) return
    try {
      await api.delete(`/vendors/images/${id}`)
      toast.success('Media removed')
      await dispatch(updateVendorProfile({})) 
      window.location.reload()
    } catch {
      toast.error('Failed to remove')
    }
  }

  const setAsCover = async (id) => {
    toast.success('Set as cover photo!')
  }

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <div className="divider-luxe !justify-start mb-3 !gap-3">
            <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Media Showcase</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Portfolio Builder</h1>
          <p className="text-gray-500 font-medium italic mt-2">Curate your best work to build trust and attract premium bookings.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest py-4 px-8 rounded-2xl shadow-xl hover:bg-[#D4AF37] hover:text-black transition-colors flex items-center gap-2">
            <FiUpload size={16} /> {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/mp4" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div 
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={`w-full bg-white/80 backdrop-blur-2xl rounded-[3rem] border-2 border-dashed ${dragActive ? 'border-[#D4AF37] bg-amber-50/50' : 'border-[#D4AF37]/30'} p-12 text-center transition-all mb-12 shadow-sm hover:border-[#D4AF37] hover:bg-[#FDFBF7]/80 relative z-10 flex flex-col items-center justify-center`}
      >
        <div className={`w-24 h-24 rounded-[1.5rem] flex items-center justify-center mb-6 transition-colors shadow-sm ${dragActive ? 'bg-[#D4AF37] text-white' : 'bg-white text-[#D4AF37]'}`}>
           <FiImage size={36} />
        </div>
        <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Drag & Drop your media here</h3>
        <p className="text-gray-500 font-medium italic mb-8">Supports High-Res Images (JPG, PNG) up to 10MB and Videos (MP4) up to 50MB.</p>
        <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-[#D4AF37]/30 text-[#D4AF37] font-black text-[10px] uppercase tracking-widest py-4 px-8 rounded-[1.5rem] shadow-sm hover:border-[#D4AF37] hover:shadow-md transition-all hover:-translate-y-0.5">
          Browse Files
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-10 relative z-10">
        {[
          { id: 'all', label: 'All Media', icon: <FiGrid /> },
          { id: 'photos', label: 'Photos', icon: <FiImage /> },
          { id: 'videos', label: 'Videos', icon: <FiFilm /> },
        ].map(f => (
          <button 
            key={f.id} onClick={() => setFilter(f.id)} 
            className={`px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${filter === f.id ? 'bg-[#C2185B] text-white hover:bg-[#8E244D]' : 'bg-white/80 backdrop-blur-md text-gray-500 border border-white hover:bg-gray-50 hover:text-[#C2185B]'}`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Pinterest Style Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 relative z-10">
        {vendor?.images?.map((img, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            key={img._id || i} 
            className="group relative rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl border border-white bg-white break-inside-avoid transition-all duration-500 hover:-translate-y-1"
          >
            <img src={img.url} alt="Portfolio" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <button onClick={() => setAsCover(img._id)} title="Set as Cover" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center shadow-lg">
                  <FiStar size={16} />
                </button>
                <button onClick={() => handleRemoveFile(img._id)} title="Delete" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-all flex items-center justify-center shadow-lg">
                  <FiTrash2 size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                 <button className="flex-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                   <FiTag size={12} /> Add Tag
                 </button>
              </div>
            </div>

            {i === 0 && (
              <span className="absolute top-6 left-6 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-black text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-lg flex items-center gap-1">
                <FiStar size={10} /> Cover
              </span>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  )
}
