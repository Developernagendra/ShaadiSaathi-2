import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { getSocket } from '../../utils/socket'
import toast from 'react-hot-toast'
import { formatDateShort, formatPrice } from '../../utils/helpers'
import { FiCheck, FiX, FiSearch, FiAlertCircle, FiEye, FiShield, FiFileText, FiImage, FiCheckCircle, FiAlertTriangle, FiMapPin, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminServicesApprovalPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Navigation Tabs State (All, Pending, Approved, Rejected)
  const [activeTab, setActiveTab] = useState('pending')
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 })
  
  // Search and filter operations
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  
  // Audit Modal States
  const [selectedService, setSelectedService] = useState(null)
  const [activeAuditTab, setActiveAuditTab] = useState('details')
  const [actionLoading, setActionLoading] = useState(false)
  const [internalNotes, setInternalNotes] = useState('')
  
  // Custom checkpoints for auditor checklist
  const [checkpoints, setCheckpoints] = useState({
    descriptionValid: false,
    pricingCompliant: false,
    mediaHighQuality: false,
    packagesStructured: false
  })

  // Load Services for active tab
  const loadServices = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/services?status=${activeTab}`)
      setServices(res.data.services || [])
      if (res.data.counts) {
        setCounts(res.data.counts)
      }
    } catch (err) {
      toast.error('Failed to sync service submissions.')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [activeTab])

  useEffect(() => {
    const socket = getSocket();
    const handleServiceUpdated = () => {
      loadServices();
    };
    if (socket) {
      socket.on('service_updated', handleServiceUpdated);
    }
    return () => {
      if (socket) {
        socket.off('service_updated', handleServiceUpdated);
      }
    };
  }, [activeTab]);

  // Computed stats derived dynamically for sidecards
  const stats = {
    totalPending: counts.pending,
    totalApproved: counts.approved,
    totalRejected: counts.rejected,
    totalAll: counts.all
  }

  // Handle single action (Approve/Reject) using the dedicated endpoints
  const handleServiceStatusUpdate = async (status) => {
    if (!selectedService) return
    setActionLoading(true)
    const serviceId = selectedService._id
    try {
      if (status === 'approved') {
        await api.patch(`/admin/services/${serviceId}/approve`)
        toast.success('Service listing approved & live publicly! 🚀')
      } else {
        await api.patch(`/admin/services/${serviceId}/reject`, { notes: internalNotes })
        toast.success('Service listing rejected & returned to vendor. 📝')
      }
      
      // Realtime UI state update (Instant render & removal)
      setServices(prev => prev.filter(item => item._id !== serviceId))
      
      // Instant Counts Adjustment
      setCounts(prev => {
        const nextCounts = { ...prev }
        if (activeTab === 'pending') {
          if (nextCounts.pending > 0) nextCounts.pending -= 1
        } else if (activeTab === 'approved') {
          if (nextCounts.approved > 0) nextCounts.approved -= 1
        } else if (activeTab === 'rejected') {
          if (nextCounts.rejected > 0) nextCounts.rejected -= 1
        }
        
        if (status === 'approved') {
          nextCounts.approved += 1
        } else {
          nextCounts.rejected += 1
        }
        return nextCounts
      })
      
      setSelectedService(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to commit verification status updates.')
    } finally {
      setActionLoading(false)
    }
  }

  // Filter & sort logic
  const filteredServices = services
    .filter(s => {
      const matchSearch = 
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.vendor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchCategory = categoryFilter === 'all' || s.category?._id === categoryFilter || s.category?.name === categoryFilter
      return matchSearch && matchCategory
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      return 0
    })

  const openDetails = (service) => {
    setSelectedService(service)
    setInternalNotes('')
    setActiveAuditTab('details')
    setCheckpoints({
      descriptionValid: !!service.description && service.description.length > 50,
      pricingCompliant: (service.startingPrice || service.price) > 0,
      mediaHighQuality: service.images && service.images.length > 0,
      packagesStructured: service.packages && service.packages.length > 0
    })
  }

  // Extract unique categories from loaded services for filter
  const categories = Array.from(new Set(services.map(s => s.category?.name))).filter(Boolean)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" /> Approved & Live
          </span>
        )
      case 'rejected':
        return (
          <span className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-100 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm" /> Rejected
          </span>
        )
      default:
        return (
          <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-8">
        
        {/* Banner Header */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 mb-8 text-white relative overflow-hidden shadow-2xl border-b-4 border-[#C2185B]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,24,91,0.15),transparent_40%)]" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase bg-white/10 px-4 py-1.5 rounded-full">
                Imperial Moderation Center
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight mt-3 text-white">
                Service Approvals Suite
              </h1>
              <p className="text-gray-400 text-xs mt-2 font-medium">
                Review wedding services, inspect packaging options, check pricing compliance, and approve listings onto the live marketplace.
              </p>
            </div>
            <div className="w-1.5 h-12 bg-[#C2185B] rounded-full hidden md:block" />
          </div>
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Pending Moderation', val: stats.totalPending, desc: 'Needs active audit', color: 'border-l-4 border-amber-500 bg-amber-500/5', icon: <FiAlertCircle className="text-amber-500" size={24} /> },
            { label: 'Approved & Live', val: stats.totalApproved, desc: 'Active in catalog', color: 'border-l-4 border-green-600 bg-green-600/5', icon: <FiCheckCircle className="text-green-600" size={24} /> },
            { label: 'Rejected Listings', val: stats.totalRejected, desc: 'Returned to vendor', color: 'border-l-4 border-red-500 bg-red-500/5', icon: <FiAlertTriangle className="text-red-500" size={24} /> },
            { label: 'Total Services', val: stats.totalAll, desc: 'All platform listings', color: 'border-l-4 border-purple-500 bg-purple-500/5', icon: <FiLayers className="text-purple-500" size={24} /> }
          ].map((card, idx) => (
            <div key={idx} className={`bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between ${card.color} hover:scale-[1.02] transition-transform`}>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block italic">{card.label}</span>
                <span className="text-3xl font-black text-gray-900 tracking-tight mt-1 block">{card.val}</span>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">{card.desc}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner">
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Status Tabs Workspace */}
        <div className="bg-white rounded-[2.5rem] p-6 mb-8 border border-gray-100 shadow-sm space-y-6">
          
          {/* Status Segmented Tabs */}
          <div className="flex overflow-x-auto scrollbar-none items-center gap-2 border-b border-gray-100 pb-4">
            {[
              { id: 'pending', label: 'Pending Approvals', count: counts.pending, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { id: 'approved', label: 'Approved & Live', count: counts.approved, color: 'text-green-700 bg-green-50 border-green-100' },
              { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-red-700 bg-red-50 border-red-100' },
              { id: 'all', label: 'All Services', count: counts.all, color: 'text-purple-700 bg-purple-50 border-purple-100' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSearchTerm('')
                }}
                className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                    : 'bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-400 pointer-events-none">
                <FiSearch size={18} />
              </span>
              <input 
                type="text" 
                placeholder="Search services by title, vendor business name, or category..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl pl-12 pr-6 py-4 font-bold text-gray-900 placeholder-gray-400 text-xs outline-none transition-all"
              />
            </div>

            {/* Selector Filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-4">
              <div className="relative w-full sm:w-48">
                <select 
                  value={categoryFilter} 
                  onChange={e => setCategoryFilter(e.target.value)} 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl px-5 py-4 font-bold text-xs uppercase tracking-widest text-gray-900 outline-none transition-all shadow-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(catName => (
                    <option key={catName} value={catName}>{catName}</option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-48">
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)} 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C2185B] focus:bg-white rounded-2xl px-5 py-4 font-bold text-xs uppercase tracking-widest text-gray-900 outline-none transition-all shadow-sm"
                >
                  <option value="latest">Latest Submissions</option>
                  <option value="oldest">Oldest Submissions</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Desktop Services List Table Display */}
        <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="table-responsive w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[9px] tracking-widest">
                <tr>
                  {['Service Title', 'Vendor Business', 'Category', 'Starting Price', 'Packages', 'Status', 'Submitted On', 'Verification Action'].map(h => (
                    <th key={h} className="text-left py-6 px-8">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#C2185B] rounded-full animate-spin shadow-md" />
                        <span className="text-xs font-semibold animate-pulse">Syncing platform listings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-gray-400">
                      <div className="max-w-md mx-auto text-center">
                        <span className="text-4xl">🕊️</span>
                        <p className="font-display font-black text-xl text-gray-900 mt-4">All Clean in this Audit Registry</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">No service listings found in this category/status.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredServices.map(s => (
                    <tr key={s._id} className="hover:bg-[#FFF8F0]/25 transition-colors">
                      <td data-label="Service Title" className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                            {s.coverImage || s.images?.[0]?.url ? (
                              <img src={s.coverImage || s.images[0].url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full bg-gray-900 text-[#C2185B] flex items-center justify-center font-black text-base">✨</div>
                            )}
                          </div>
                          <div>
                            <span className="font-black text-gray-900 block leading-tight max-w-[200px] truncate" title={s.title}>{s.title}</span>
                            <span className="text-[8px] text-gray-400 font-bold block mt-1">ID: {s._id?.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Vendor Business" className="py-6 px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 leading-snug">{s.vendor?.businessName || 'Independent Vendor'}</span>
                          <span className="text-[9px] text-gray-400 font-semibold uppercase flex items-center gap-1"><FiMapPin size={9} /> {s.city || 'Delhi'}</span>
                        </div>
                      </td>
                      <td data-label="Category" className="py-6 px-8">
                        <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500 font-display font-black">
                          {s.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td data-label="Starting Price" className="py-6 px-8 font-black text-gray-900">
                        {formatPrice(s.startingPrice || s.price || 0)}
                      </td>
                      <td data-label="Packages" className="py-6 px-8 text-gray-500 font-semibold text-xs">
                        <div className="flex items-center gap-1.5">
                          <FiLayers className="text-[#C2185B]" size={12} /> {s.packages?.length || 0} Rate Cards
                        </div>
                      </td>
                      <td data-label="Status" className="py-6 px-8">
                        {getStatusBadge(s.status)}
                      </td>
                      <td data-label="Submitted On" className="py-6 px-8 text-gray-400 font-medium text-xs whitespace-nowrap">
                        {formatDateShort(s.createdAt)}
                      </td>
                      <td data-label="Verification Action" className="py-6 px-8">
                        <button 
                          onClick={() => openDetails(s)} 
                          className="h-11 px-5 rounded-xl bg-gray-900 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                        >
                          <FiEye size={14} /> Audit Room
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile & Tablet Card Grid View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <div className="col-span-1 md:col-span-2 text-center py-16 text-gray-400">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#C2185B] rounded-full animate-spin shadow mx-auto mb-3" />
              <span className="text-xs font-semibold">Loading data...</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-1 md:col-span-2 bg-white border rounded-3xl py-16 text-center text-gray-400">
              <span className="text-3xl">🕊️</span>
              <p className="font-display font-black text-lg text-gray-900 mt-3">All Clean in this Audit Registry</p>
            </div>
          ) : (
            filteredServices.map(s => (
              <div key={s._id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 hover:border-[#C2185B]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                      {s.coverImage || s.images?.[0]?.url ? (
                        <img src={s.coverImage || s.images[0].url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gray-900 text-[#C2185B] flex items-center justify-center font-black">✨</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-tight max-w-[150px] truncate" title={s.title}>{s.title}</h3>
                      <span className="text-[7px] text-gray-400 block mt-0.5">ID: {s._id?.substring(0, 8)}...</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500 font-display font-black">
                    {s.category?.name || 'Uncategorized'}
                  </span>
                </div>

                <div className="border-t border-b border-gray-100 py-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">Vendor:</span>
                    <span className="font-bold text-gray-900">{s.vendor?.businessName || 'Independent Vendor'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">Rate:</span>
                    <span className="font-black text-gray-900">{formatPrice(s.startingPrice || s.price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">Submitted:</span>
                    <span className="font-bold text-gray-900">{formatDateShort(s.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">Status:</span>
                    {getStatusBadge(s.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                    <FiLayers className="text-[#C2185B]" /> {s.packages?.length || 0} Package Plans
                  </div>

                  <button 
                    onClick={() => openDetails(s)} 
                    className="h-10 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest transition-all shadow flex items-center gap-1.5"
                  >
                    <FiEye size={12} /> Audit Room
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Advanced Service Split Audit popover modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => { if (!actionLoading) setSelectedService(null) }} 
              className="fixed inset-0 bg-gray-900/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 30 }} 
              className="bg-white w-full h-full sm:w-[96vw] sm:h-[90vh] lg:w-[95vw] lg:max-w-[1600px] lg:h-[92vh] rounded-none sm:rounded-[2.5rem] lg:rounded-[3.5rem] relative z-10 shadow-2xl overflow-y-auto lg:overflow-hidden flex flex-col"
            >
               {/* Modal Header */}
               <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4 relative">
                 <div className="flex items-center gap-4 pr-12 sm:pr-0">
                   <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 text-[#C2185B] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border-b-2 border-[#C2185B] flex-shrink-0">
                     <FiShield size={24} className="sm:hidden text-white" />
                     <FiShield size={28} className="hidden sm:block text-white" />
                   </div>
                   <div>
                     <h2 className="font-display text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                       Service Listing Audit Room
                     </h2>
                     <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 leading-snug">
                       Auditing: {selectedService.title} (By: {selectedService.vendor?.businessName || 'Independent Agent'})
                     </p>
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => setSelectedService(null)} 
                   disabled={actionLoading} 
                   className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 border border-gray-100 flex-shrink-0 z-20"
                 >
                   <FiX size={18} />
                 </button>
               </div>

               {/* Split Columns Layout */}
               <div className="flex-1 overflow-y-auto lg:overflow-y-hidden lg:overflow-x-hidden flex flex-col lg:flex-row">
                 
                 {/* Left Column: Details, Packages, Gallery (65% on Desktop) */}
                 <div className="w-full lg:w-[65%] border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col lg:h-full lg:overflow-hidden">
                   
                   {/* Workspace Navigation Tabs */}
                   <div className="bg-gray-50/30 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-100 flex overflow-x-auto scrollbar-none items-center gap-3 w-full">
                     {[
                       { id: 'details', label: 'Listing Details', icon: <FiFileText /> },
                       { id: 'packages', label: 'Rate Card Packages', icon: <FiLayers /> },
                       { id: 'media', label: 'Media Gallery', icon: <FiImage /> }
                     ].map(tab => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveAuditTab(tab.id)}
                         className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all flex-shrink-0 min-h-[44px] ${
                           activeAuditTab === tab.id 
                             ? 'bg-gray-900 text-white shadow' 
                             : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-700'
                         }`}
                       >
                         {tab.icon} {tab.label}
                       </button>
                     ))}
                   </div>

                   {/* Content Viewframe */}
                   <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                     
                     {/* TAB 1: Listing Details */}
                     {activeAuditTab === 'details' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                           {[
                             { label: 'Listing Title', val: selectedService.title },
                             { label: 'Service Category', val: selectedService.category?.name || 'Uncategorized' },
                             { label: 'Registered City', val: selectedService.city || 'Delhi' },
                             { label: 'Starting Price', val: formatPrice(selectedService.startingPrice || selectedService.price || 0) },
                             { label: 'Vendor Partner', val: selectedService.vendor?.businessName || 'Independent Vendor' },
                             { label: 'Vendor Contact Phone', val: selectedService.vendor?.phone || 'N/A' },
                             { label: 'Vendor Contact Email', val: selectedService.vendor?.email || 'N/A' },
                             { label: 'Submission Timestamp', val: formatDateShort(selectedService.createdAt) }
                           ].map((item, idx) => (
                             <div key={idx} className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-4 sm:p-5">
                               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                               <span className="font-bold text-gray-900 text-xs sm:text-sm uppercase leading-tight block">{item.val}</span>
                             </div>
                           ))}
                         </div>

                         <div>
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Detailed Listing Description</span>
                           <p className="text-xs sm:text-sm text-gray-600 font-semibold leading-relaxed bg-[#FAF9F6] p-5 border border-gray-100 rounded-2xl shadow-inner whitespace-pre-line">
                             {selectedService.description || 'No custom description notes supplied.'}
                           </p>
                         </div>

                         {selectedService.features && selectedService.features.length > 0 && (
                           <div>
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Service Highlights & Features</span>
                             <div className="flex flex-wrap gap-2">
                               {selectedService.features.map((feat, idx) => (
                                 <span key={idx} className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-150 text-[9px] font-black uppercase tracking-wider text-gray-600">
                                   ✨ {feat}
                                 </span>
                               ))}
                             </div>
                           </div>
                         )}
                       </motion.div>
                     )}

                     {/* TAB 2: Rate Card Packages */}
                     {activeAuditTab === 'packages' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         {selectedService.packages && selectedService.packages.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {selectedService.packages.map((pkg, idx) => (
                               <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full opacity-35" />
                                 <div className="space-y-3 relative z-10">
                                   <div className="flex justify-between items-start gap-2">
                                     <span className="text-[8px] font-black px-2.5 py-1 bg-gray-900 text-white rounded-full uppercase tracking-widest">
                                       Option Plan #{idx + 1}
                                     </span>
                                     <span className="font-black text-base text-[#C2185B]">{formatPrice(pkg.price)}</span>
                                   </div>
                                   <h4 className="font-display font-black text-lg text-gray-900 truncate tracking-tight">{pkg.name}</h4>
                                   <p className="text-xs text-gray-500 font-semibold leading-relaxed line-clamp-4">{pkg.description}</p>
                                 </div>

                                 {pkg.features && pkg.features.length > 0 && (
                                   <div className="border-t border-gray-100 pt-3 mt-2">
                                     <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Package Highlights</span>
                                     <ul className="space-y-1.5">
                                       {pkg.features.slice(0, 3).map((f, i) => (
                                         <li key={i} className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5">
                                           <FiCheck className="text-green-600 flex-shrink-0" /> <span className="truncate">{f}</span>
                                         </li>
                                       ))}
                                     </ul>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                             <FiLayers className="mx-auto text-gray-300 mb-3" size={32} />
                             <span className="text-xs font-semibold text-gray-400 block">No package details defined. Default starting price will be used.</span>
                           </div>
                         )}
                       </motion.div>
                     )}

                     {/* TAB 3: Media Gallery */}
                     {activeAuditTab === 'media' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                           {selectedService.images && selectedService.images.length > 0 ? (
                             selectedService.images.map((img, idx) => (
                               <div key={idx} className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50 hover:scale-[1.02] transition-transform shadow-sm">
                                 <div className="bg-gray-100/50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                   <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Photo #{idx + 1}</span>
                                   {(img.url === selectedService.coverImage) && (
                                     <span className="text-[8px] font-black text-[#D4AF37] uppercase">Primary Cover</span>
                                   )}
                                 </div>
                                 <div className="aspect-[4/3] relative">
                                   <img src={img.url} className="w-full h-full object-cover" alt="" />
                                 </div>
                               </div>
                             ))
                           ) : (
                             <div className="col-span-3 text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                               <FiImage className="mx-auto text-gray-300 mb-3" size={32} />
                               <span className="text-xs font-semibold text-gray-400">No media work gallery uploads provided.</span>
                             </div>
                           )}
                         </div>
                       </motion.div>
                     )}

                   </div>
                 </div>

                 {/* Right Column: Auditor Action Panel & Checklist (35% on Desktop) */}
                 <div className="w-full lg:w-[35%] bg-gray-50/50 p-4 sm:p-6 lg:p-8 lg:overflow-y-auto flex flex-col justify-between lg:h-full border-t lg:border-t-0 lg:border-l border-gray-100 custom-scrollbar">
                   <div className="space-y-6 sm:space-y-8">
                     <div>
                       <h3 className="font-display text-lg font-black text-gray-900 tracking-tight mb-1">Auditor Control Center</h3>
                       <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider italic">Execute audit listing compliance</p>
                     </div>

                     {/* Verification Progress Tracker */}
                     <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Verification Checklist</span>
                       <div className="space-y-3">
                         {[
                           { label: 'Listing Structure Valid', checked: checkpoints.descriptionValid },
                           { label: 'Price Compliance Cleared', checked: checkpoints.pricingCompliant },
                           { label: 'Hi-Res Media Assets', checked: checkpoints.mediaHighQuality },
                           { label: 'Multiple Tier Rates', checked: checkpoints.packagesStructured }
                         ].map((prog, idx) => (
                           <div key={idx} className="flex items-center gap-3">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                               prog.checked ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                             }`}>
                               {prog.checked ? <FiCheck size={12} /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-wider ${
                               prog.checked ? 'text-gray-900' : 'text-gray-400'
                             }`}>{prog.label}</span>
                           </div>
                         ))}
                       </div>
                     </div>

                     {/* Manual Overrides */}
                     <div className="space-y-3">
                       {[
                         { key: 'descriptionValid', label: 'Listing Content Verified', desc: 'Title matches service operations desc' },
                         { key: 'pricingCompliant', label: 'Fair Price Certified', desc: 'Complies with marketplace base averages' },
                         { key: 'mediaHighQuality', label: 'Copyright & Quality Clear', desc: 'No watermark or generic graphics' },
                         { key: 'packagesStructured', label: 'Standard Packages Done', desc: 'Packages have clear delivery dates' }
                       ].map(chk => (
                         <button
                           key={chk.key}
                           type="button"
                           onClick={() => setCheckpoints({ ...checkpoints, [chk.key]: !checkpoints[chk.key] })}
                           className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all min-h-[56px] ${
                             checkpoints[chk.key] ? 'border-green-200 bg-green-50/20' : 'border-gray-100 bg-white hover:border-gray-200'
                           }`}
                         >
                           <span className="mt-0.5 text-gray-400 flex-shrink-0 w-6 h-6 flex items-center justify-center">
                             {checkpoints[chk.key] ? <FiCheckCircle className="text-green-600 animate-pulse" size={20} /> : <div className="w-5 h-5 border-2 rounded-full border-gray-300" />}
                           </span>
                           <div>
                             <span className={`text-[10px] font-black uppercase block tracking-wider leading-none ${checkpoints[chk.key] ? 'text-gray-900' : 'text-gray-500'}`}>{chk.label}</span>
                             <span className="text-[9px] text-gray-400 font-semibold mt-1.5 block italic leading-snug">{chk.desc}</span>
                           </div>
                         </button>
                       ))}
                     </div>

                     {/* Internal remarks */}
                     <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Auditor Remarks & Return Instructions</label>
                       <textarea 
                         value={internalNotes}
                         onChange={e => setInternalNotes(e.target.value)}
                         rows={4}
                         className="w-full bg-white border border-gray-200 focus:border-[#C2185B] rounded-2xl p-4 font-semibold text-xs text-gray-900 outline-none resize-none shadow-sm"
                         placeholder="Enter return notes or rejection reasons. Sent directly as alerts to vendor partners upon rejection."
                       />
                     </div>
                   </div>

                   {/* Action Buttons */}
                   {selectedService.status === 'pending' ? (
                     <div className="space-y-3 pt-6 border-t border-gray-100 mt-8">
                       <div className="flex flex-col sm:flex-row gap-3">
                         <button 
                           onClick={() => handleServiceStatusUpdate('approved')}
                           disabled={actionLoading}
                           className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#EC4899] text-white py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
                         >
                           {actionLoading ? 'Processing...' : 'Approve Listing'}
                         </button>
                         <button 
                           onClick={() => handleServiceStatusUpdate('rejected')}
                           disabled={actionLoading}
                           className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
                         >
                           {actionLoading ? 'Processing...' : 'Reject Listing'}
                         </button>
                       </div>
                     </div>
                   ) : (
                     <div className="pt-6 border-t border-gray-100 mt-8">
                       <div className="p-4 rounded-2xl bg-gray-100/50 border border-gray-200 text-center">
                         <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Moderation Complete</span>
                         <span className="text-[9px] font-bold text-gray-400 mt-1 block">This service listing has already been moderated.</span>
                       </div>
                     </div>
                   )}
                 </div>

               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
