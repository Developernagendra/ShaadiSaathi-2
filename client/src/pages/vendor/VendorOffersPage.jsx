import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTag, FiCalendar, FiPercent, FiPlus, FiCheckCircle, FiTrash2, FiEdit2, FiPauseCircle, FiPlayCircle, FiX, FiTrendingUp, FiDollarSign, FiCopy } from 'react-icons/fi';
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatPrice, formatDateShort } from '../../utils/helpers'
import EmptyState from '../../components/common/EmptyState'

export default function VendorOffersPage() {
  const [offers, setOffers] = useState([])
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('active')
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    maxUsage: ''
  })
  const [editingId, setEditingId] = useState(null)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/offers')
      if (res.data.success) {
        setOffers(res.data.data.offers)
        setStats(res.data.stats)
      }
    } catch (err) {
      toast.error('Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setFormData({
        title: offer.title,
        description: offer.description,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
        endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
        maxUsage: offer.maxUsage || ''
      })
      setEditingId(offer._id)
    } else {
      setFormData({
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        startDate: '',
        endDate: '',
        maxUsage: ''
      })
      setEditingId(null)
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    
    // Formatting data
    const payload = { ...formData }
    if (!payload.maxUsage) payload.maxUsage = 0
    payload.discountValue = Number(payload.discountValue)
    
    try {
      if (editingId) {
        await api.patch(`/offers/${editingId}`, payload)
        toast.success('Offer updated successfully')
      } else {
        await api.post('/offers', payload)
        toast.success('Offer created successfully')
      }
      setIsModalOpen(false)
      fetchOffers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    try {
      await api.delete(`/offers/${id}`)
      toast.success('Offer deleted')
      fetchOffers()
    } catch (err) {
      toast.error('Failed to delete offer')
    }
  }

  const handleTogglePause = async (offer) => {
    try {
      const newStatus = offer.status === 'paused' ? 'active' : 'paused' // backend auto-resolves active/upcoming
      await api.patch(`/offers/${offer._id}`, { status: newStatus })
      toast.success(newStatus === 'paused' ? 'Offer Paused' : 'Offer Resumed')
      fetchOffers()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/offers/${id}/duplicate`)
      toast.success('Offer duplicated')
      fetchOffers()
    } catch (err) {
      toast.error('Failed to duplicate offer')
    }
  }

  const filteredOffers = offers.filter(o => o.status === activeTab)

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <div className="divider-luxe !justify-start mb-3 !gap-3">
            <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Promotions</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Offer Management</h1>
          <p className="text-gray-500 font-medium italic mt-2">Create exclusive seasonal discounts and festival offers to boost your bookings.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-black text-[10px] uppercase tracking-widest py-4 px-8 rounded-2xl shadow-[0_5px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <FiPlus size={16} /> Create New Offer
        </button>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
        {[
          { label: 'Total Offers', value: stats?.total || 0, icon: <FiTag />, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Active Offers', value: stats?.active || 0, icon: <FiCheckCircle />, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'Total Conversions', value: stats?.totalConversions || 0, icon: <FiTrendingUp />, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Revenue Generated', value: formatPrice(stats?.totalRevenue || 0), icon: <FiDollarSign />, color: 'text-[#D4AF37]', bg: 'bg-amber-50/50' }
        ].map((s, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <p className="font-display text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-2 border border-white shadow-sm inline-flex mb-8 overflow-x-auto max-w-full">
        {[
          { id: 'active', label: 'Active Offers' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'paused', label: 'Paused' },
          { id: 'expired', label: 'Expired' },
          { id: 'draft', label: 'Drafts' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 md:px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white shadow-lg shadow-black/10' 
                : 'text-gray-400 hover:bg-[#FFF8F0] hover:text-[#D4AF37]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-white/50 backdrop-blur-md rounded-[3rem] animate-pulse border border-white"></div>)}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-[3rem] p-16 text-center">
           <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-[#C2185B] text-4xl mx-auto mb-6 shadow-inner"><FiTag /></div>
           <h3 className="font-display text-3xl font-black text-gray-900 mb-3 tracking-tight">No {activeTab} offers</h3>
           <p className="text-gray-500 font-medium italic mb-8 max-w-md mx-auto">You don't have any offers in this category. Create engaging discounts to attract more clients.</p>
           <button onClick={() => handleOpenModal()} className="btn-primary py-4 px-8 text-sm shadow-xl shadow-primary-200">Create Your First Offer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOffers.map((offer) => (
            <motion.div key={offer._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 shadow-premium border border-white group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF8F0] to-transparent rounded-bl-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-16 h-16 bg-[#FFF8F0] border border-[#D4AF37]/20 rounded-[1.2rem] flex items-center justify-center text-[#D4AF37] shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <FiPercent size={24} />
                </div>
                
                {/* Status Badges */}
                {offer.status === 'active' && <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><FiCheckCircle size={12} /> Live</span>}
                {offer.status === 'paused' && <span className="text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><FiPauseCircle size={12} /> Paused</span>}
                {offer.status === 'expired' && <span className="text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">Expired</span>}
                {offer.status === 'upcoming' && <span className="text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">Upcoming</span>}
              </div>

              <div className="flex-1 relative z-10 mb-6">
                <h3 className="font-display text-2xl font-black text-gray-900 leading-tight mb-2 truncate" title={offer.title}>{offer.title}</h3>
                <p className="text-gray-500 text-sm font-medium line-clamp-2 italic mb-4">{offer.description}</p>
                
                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100/50 mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-1">Discount</p>
                  <p className="font-display text-3xl font-black text-gray-900 leading-none tracking-tight">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `Flat ${formatPrice(offer.discountValue)}`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                  <span className="flex items-center gap-2"><FiCalendar className="text-[#C2185B]" size={14} /> {formatDateShort(offer.startDate)} - {formatDateShort(offer.endDate)}</span>
                </div>
              </div>
              
              {/* Actions & Stats */}
              <div className="border-t border-gray-100/50 pt-5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><FiTag /> {offer.usageCount} {offer.maxUsage > 0 ? `/ ${offer.maxUsage}` : ''} Uses</span>
                  <span className="flex items-center gap-1.5"><FiTrendingUp /> {offer.analytics?.conversions || 0} Conv</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => handleTogglePause(offer)} className="w-10 h-10 hover:bg-amber-50 hover:text-amber-600 rounded-xl flex items-center justify-center transition-colors text-gray-400" title={offer.status === 'paused' ? 'Resume' : 'Pause'}>
                    {offer.status === 'paused' ? <FiPlayCircle size={18} /> : <FiPauseCircle size={18} />}
                  </button>
                  <button onClick={() => handleOpenModal(offer)} className="w-10 h-10 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center justify-center transition-colors text-gray-400" title="Edit">
                    <FiEdit2 size={16} />
                  </button>
                  <button onClick={() => handleDuplicate(offer._id)} className="w-10 h-10 hover:bg-purple-50 hover:text-purple-600 rounded-xl flex items-center justify-center transition-colors text-gray-400" title="Duplicate">
                    <FiCopy size={16} />
                  </button>
                  <button onClick={() => handleDelete(offer._id)} className="w-10 h-10 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center transition-colors text-gray-400" title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="p-8 md:p-10 border-b border-gray-100 flex items-center justify-between bg-[#FFF8F0]/30 shrink-0">
                <div>
                  <h2 className="font-display text-3xl font-black text-gray-900 tracking-tight">{editingId ? 'Edit Offer' : 'Create New Offer'}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mt-1">Configure your promotion details</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
                <form id="offerForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Offer Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Bridal Special" className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none transition-all shadow-inner" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                    <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief details about the offer terms and inclusions..." className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none transition-all resize-none shadow-inner" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discount Type</label>
                      <select required value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none transition-all shadow-inner appearance-none">
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discount Value</label>
                      <input required type="number" min="1" max={formData.discountType === 'percentage' ? "100" : undefined} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} placeholder={formData.discountType === 'percentage' ? "e.g. 20" : "e.g. 5000"} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start Date</label>
                      <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">End Date</label>
                      <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center justify-between">
                      <span>Max Usage Limit</span>
                      <span className="text-gray-400 lowercase font-medium tracking-normal">(Leave blank for unlimited)</span>
                    </label>
                    <input type="number" min="0" value={formData.maxUsage} onChange={e => setFormData({...formData, maxUsage: e.target.value})} placeholder="e.g. 50 (First 50 customers)" className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none transition-all shadow-inner" />
                  </div>

                </form>
              </div>

              <div className="p-8 md:p-10 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-end gap-4">
                <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button form="offerForm" disabled={formLoading} className="bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_5px_15px_rgba(194,24,91,0.3)] hover:shadow-[0_8px_25px_rgba(194,24,91,0.5)] transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center gap-2">
                  {formLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheckCircle size={16} />}
                  {editingId ? 'Save Changes' : 'Publish Offer'}
                </button>
              </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  )
}
