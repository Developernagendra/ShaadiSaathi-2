import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatDateShort, formatPrice } from '../../utils/helpers'
import { FiCheck, FiX, FiSearch, FiAlertCircle, FiEye, FiShield, FiFileText, FiUser, FiImage, FiDownload, FiCheckCircle, FiAlertTriangle, FiCheckSquare, FiSquare, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_TABS = [
  { id: 'pending', label: 'Pending Audit', color: 'bg-amber-500 text-white' },
  { id: 'approved', label: 'Approved Live', color: 'bg-green-600 text-white' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-600 text-white' },
  { id: 'suspended', label: 'Suspended', color: 'bg-purple-600 text-white' }
]

export default function AdminVendorsPage({ defaultTab = 'pending', title = 'Verification Audit Room' }) {
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  // Search, filter, and sorting states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  
  // Audit Modal States
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [activeAuditTab, setActiveAuditTab] = useState('specs')
  const [actionLoading, setActionLoading] = useState(false)
  const [internalNotes, setInternalNotes] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  
  // Custom checkpoints for auditor checklist
  const [checkpoints, setCheckpoints] = useState({
    identityVerified: false,
    gstValidated: false,
    bankConfirmed: false,
    pricingRationalized: false
  })

  // Live document viewer drawer inside modal
  const [previewDoc, setPreviewDoc] = useState(null)

  // Load Categories & Vendors safely
  const loadCategories = async () => {
    try {
      const res = await api.get('/categories')
      const catsArray = res.data?.categories || (Array.isArray(res.data) ? res.data : [])
      setCategories(Array.isArray(catsArray) ? catsArray : [])
    } catch (err) {
      console.error('Failed to load categories', err)
      setCategories([])
    }
  }

  const loadVendors = async () => {
    setLoading(true)
    try {
      const r = await api.get('/admin/vendors')
      setVendors(r.data.vendors || [])
    } catch (err) {
      toast.error('Failed to sync vendor lists.')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
    loadVendors()
  }, [])

  // Computed stats derived dynamically from active states
  const stats = {
    totalPending: vendors.filter(v => v.approvalStatus === 'pending').length,
    approvedToday: vendors.filter(v => v.approvalStatus === 'approved').length,
    rejectedToday: vendors.filter(v => v.approvalStatus === 'rejected').length,
    documentsMissing: vendors.filter(v => !v.verificationDocuments || v.verificationDocuments.length === 0).length
  }

  // Handle single action (Approve/Reject/Suspend/Verify)
  const handleVendorStatusUpdate = async (status, isBadgeVerify = false) => {
    if (!selectedVendor) return
    setActionLoading(true)
    try {
      let body = { 
        approvalStatus: status,
        approvalNote: internalNotes,
        isFeatured: isFeatured
      }

      if (isBadgeVerify) {
        const currentBadges = selectedVendor.badges || []
        const hasVerified = currentBadges.includes('verified')
        body.badges = hasVerified 
          ? currentBadges.filter(b => b !== 'verified')
          : [...currentBadges, 'verified']
      }

      const res = await api.patch(`/admin/vendors/${selectedVendor._id}/status`, body)
      toast.success(isBadgeVerify ? 'Vendor Verification Badge Updated! 🛡️' : `Vendor registration successfully ${status}!`)
      setSelectedVendor(null)
      loadVendors()
    } catch (err) {
      toast.error('Failed to commit verification status updates.')
    } finally {
      setActionLoading(false)
    }
  }

  // Update verification status on individual documents
  const handleDocumentStatus = async (docType, status) => {
    if (!selectedVendor) return
    
    const docList = selectedVendor.verificationDocuments || []
    const updatedDocs = docList.map(doc => {
      if (doc.type === docType) {
        return { ...doc, verified: status === 'approved' }
      }
      return doc
    })

    // If document is not explicitly defined yet in vendor's profile, create a placeholder structure
    const exists = docList.some(doc => doc.type === docType)
    if (!exists) {
      updatedDocs.push({
        type: docType,
        url: '',
        verified: status === 'approved'
      })
    }

    try {
      const res = await api.patch(`/admin/vendors/${selectedVendor._id}/status`, {
        verificationDocuments: updatedDocs
      })
      setSelectedVendor({ ...selectedVendor, verificationDocuments: updatedDocs })
      toast.success(`Document ${docType} status updated to: ${status}!`)
    } catch (err) {
      toast.error('Failed to update document verification status.')
    }
  }

  // Helper to get matching document object or mock placeholder
  const getDocument = (type) => {
    return selectedVendor?.verificationDocuments?.find(d => d.type === type) || {
      type,
      url: '',
      verified: false,
      isPlaceholder: true
    }
  }

  // Filter & sort logic
  const filteredVendors = vendors
    .filter(v => {
      // Filter by active segmented tab state
      if (v.approvalStatus !== activeTab) return false;

      const matchSearch = 
        v.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone?.includes(searchTerm)
      
      const matchCategory = categoryFilter === 'all' || v.category?._id === categoryFilter || v.category?.name === categoryFilter
      return matchSearch && matchCategory
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      return 0
    })

  const openDetails = (vendor) => {
    setSelectedVendor(vendor)
    setInternalNotes(vendor.approvalNote || '')
    setIsFeatured(vendor.isFeatured || false)
    setPreviewDoc(null)
    setActiveAuditTab('specs')
    setCheckpoints({
      identityVerified: vendor.badges?.includes('verified') || false,
      gstValidated: !!vendor.gstNumber,
      bankConfirmed: !!vendor.bankDetails?.accountNumber,
      pricingRationalized: !!vendor.basePrice
    })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-8">
        
        {/* Banner Header */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 mb-8 text-white relative overflow-hidden shadow-2xl border-b-4 border-[#D4AF37]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_40%)]" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase bg-white/10 px-4 py-1.5 rounded-full">
                Imperial Administration Suite
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight mt-3 text-white">
                {title}
              </h1>
              <p className="text-gray-400 text-xs mt-2 font-medium">
                Verify business permits, legal clearances, bank assets, and award trust badges to verified vendors.
              </p>
            </div>
            <div className="w-1.5 h-12 bg-[#D4AF37] rounded-full hidden md:block" />
          </div>
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Pending Verification', val: stats.totalPending, desc: 'Needs active audit', color: 'border-l-4 border-amber-500 bg-amber-500/5', icon: <FiAlertCircle className="text-amber-500" size={24} /> },
            { label: 'Approved Today', val: stats.approvedToday, desc: 'Live in marketplace', color: 'border-l-4 border-green-600 bg-green-600/5', icon: <FiCheckCircle className="text-green-600" size={24} /> },
            { label: 'Rejected Today', val: stats.rejectedToday, desc: 'Needs modifications', color: 'border-l-4 border-red-500 bg-red-50/30', icon: <FiX className="text-red-500" size={24} /> },
            { label: 'Documents Missing', val: stats.documentsMissing, desc: 'Incomplete setups', color: 'border-l-4 border-purple-500 bg-purple-500/5', icon: <FiAlertTriangle className="text-purple-500" size={24} /> }
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

        {/* Filter Operations Workspace */}
        <div className="bg-white rounded-[2.5rem] p-6 mb-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-400 pointer-events-none">
                <FiSearch size={18} />
              </span>
              <input 
                type="text" 
                placeholder="Search vendor by business name, owner name, phone, or email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl pl-12 pr-6 py-4 font-bold text-gray-900 placeholder-gray-400 text-xs outline-none transition-all"
              />
            </div>

            {/* Selector Filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-4">
              <div className="relative w-full sm:w-48">
                <select 
                  value={categoryFilter} 
                  onChange={e => setCategoryFilter(e.target.value)} 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-5 py-4 font-bold text-xs uppercase tracking-widest text-gray-900 outline-none transition-all shadow-sm"
                >
                  <option value="all">All Categories</option>
                  {Array.isArray(categories) && categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-48">
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)} 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-2xl px-5 py-4 font-bold text-xs uppercase tracking-widest text-gray-900 outline-none transition-all shadow-sm"
                >
                  <option value="latest">Latest Registry</option>
                  <option value="oldest">Oldest Registry</option>
                </select>
              </div>
            </div>

          </div>

          {/* Status Segmented Tabs */}
          <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-gray-900 text-white shadow-xl scale-105' 
                    : 'bg-gray-50 border border-gray-100 text-gray-500 hover:border-[#D4AF37]/50 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Vendors List Display Frame (Wide screen only) */}
        <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="table-responsive w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[9px] tracking-widest">
                <tr>
                  {['Vendor Business', 'Authorized Owner', 'Service Slot', 'Operational Base', 'Registered', 'Checkpoints', 'Verification Action'].map(h => (
                    <th key={h} className="text-left py-6 px-8">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-400">
                      <div className="max-w-md mx-auto text-center">
                        <span className="text-4xl">🕊️</span>
                        <p className="font-display font-black text-xl text-gray-900 mt-4">All Clean in this Audit Registry</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">No vendors currently match the selected segmented filter state.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(v => (
                    <tr key={v._id} className="hover:bg-[#FFF8F0]/20 transition-colors">
                      <td data-label="Vendor Business" className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-[#D4AF37] flex items-center justify-center font-black text-lg shadow-md border-b-2 border-[#D4AF37]">
                            {v.businessName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-gray-900 block leading-tight">{v.businessName}</span>
                            <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest block mt-1">
                              {v.subscription?.plan || 'Free Plan'} Registry
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Authorized Owner" className="py-6 px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 leading-snug">{v.user?.name || '—'}</span>
                          <span className="text-[9px] text-gray-400 font-semibold">{v.email}</span>
                        </div>
                      </td>
                      <td data-label="Service Slot" className="py-6 px-8">
                        <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500">
                          {v.category?.name || 'Cab Operator'}
                        </span>
                      </td>
                      <td data-label="Operational Base" className="py-6 px-8 text-gray-500 font-semibold text-xs">
                        <div className="flex items-center gap-1.5 uppercase">
                          <FiMapPin className="text-[#D4AF37]" size={12} /> {v.location?.city || 'Delhi'}
                        </div>
                      </td>
                      <td data-label="Registered" className="py-6 px-8 text-gray-400 font-medium text-xs whitespace-nowrap">
                        {formatDateShort(v.createdAt)}
                      </td>
                      <td data-label="Checkpoints" className="py-6 px-8">
                        <div className="flex items-center gap-2">
                          {[
                            { key: 'ID', done: v.verificationDocuments?.some(d => d.verified) },
                            { key: 'GST', done: !!v.gstNumber },
                            { key: 'BANK', done: !!v.bankDetails?.accountNumber },
                            { key: 'PRICE', done: !!v.basePrice }
                          ].map((chk, index) => (
                            <span 
                              key={index} 
                              title={`${chk.key}: ${chk.done ? 'Verified' : 'Pending'}`}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black uppercase tracking-wider ${
                                chk.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {chk.key}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td data-label="Verification Action" className="py-6 px-8">
                        <button 
                          onClick={() => openDetails(v)} 
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

        {/* Mobile & Tablet Card Grid View (Shown on screens < 1024px) */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredVendors.length === 0 ? (
            <div className="col-span-1 md:col-span-2 bg-white border rounded-3xl py-16 text-center text-gray-400">
              <span className="text-3xl">🕊️</span>
              <p className="font-display font-black text-lg text-gray-900 mt-3">All Clean in this Audit Registry</p>
            </div>
          ) : (
            filteredVendors.map(v => (
              <div key={v._id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 hover:border-[#D4AF37]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-[#D4AF37] flex items-center justify-center font-black text-base shadow-md">
                      {v.businessName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-tight">{v.businessName}</h3>
                      <span className="text-[7px] font-black text-[#D4AF37] uppercase tracking-widest block mt-0.5">
                        {v.subscription?.plan || 'Free'} Plan
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500">
                    {v.category?.name || 'Cab Operator'}
                  </span>
                </div>

                <div className="border-t border-b border-gray-100 py-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">Owner:</span>
                    <span className="font-bold text-gray-900">{v.user?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">City:</span>
                    <span className="font-bold text-gray-900 uppercase flex items-center gap-1">
                      <FiMapPin size={10} className="text-[#D4AF37]" /> {v.location?.city || 'Delhi'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">Applied Date:</span>
                    <span className="font-bold text-gray-900">{formatDateShort(v.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {[
                      { key: 'ID', done: v.verificationDocuments?.some(d => d.verified) },
                      { key: 'GST', done: !!v.gstNumber },
                      { key: 'BANK', done: !!v.bankDetails?.accountNumber },
                      { key: 'PRICE', done: !!v.basePrice }
                    ].map((chk, index) => (
                      <span 
                        key={index} 
                        title={`${chk.key}: ${chk.done ? 'Verified' : 'Pending'}`}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black uppercase tracking-wider ${
                          chk.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {chk.key}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => openDetails(v)} 
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

      {/* Advanced Verification Split Audit popover modal */}
      <AnimatePresence>
        {selectedVendor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => { if (!actionLoading) setSelectedVendor(null) }} 
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
                   <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 text-[#D4AF37] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border-b-2 border-[#D4AF37] flex-shrink-0">
                     <FiShield size={24} className="sm:hidden" />
                     <FiShield size={28} className="hidden sm:block" />
                   </div>
                   <div>
                     <h2 className="font-display text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                       Vendor Verification Audit Room
                     </h2>
                     <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 leading-snug">
                       Reviewing: {selectedVendor.businessName} (Category: {selectedVendor.category?.name || 'Wedding Vendor'})
                     </p>
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => setSelectedVendor(null)} 
                   disabled={actionLoading} 
                   className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 border border-gray-100 flex-shrink-0 z-20"
                 >
                   <FiX size={18} />
                 </button>
               </div>

               {/* Split Columns Layout */}
               <div className="flex-1 overflow-y-auto lg:overflow-y-hidden lg:overflow-x-hidden flex flex-col lg:flex-row">
                 
                 {/* Left Column: Specs, Documents Review & Portfolio Workspace (65% on Desktop, Stacks Vertically on Tablet/Mobile) */}
                 <div className="w-full lg:w-[65%] border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col lg:h-full lg:overflow-hidden">
                   
                   {/* Workspace Navigation Tabs - Scrollable horizontal bar on tablet/mobile */}
                   <div className="bg-gray-50/30 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-100 flex overflow-x-auto scrollbar-none items-center gap-3 w-full">
                     {[
                       { id: 'specs', label: 'Specs & Profile', icon: <FiUser /> },
                       { id: 'documents', label: 'Verification Documents', icon: <FiFileText /> },
                       { id: 'portfolio', label: 'Portfolio Images', icon: <FiImage /> }
                     ].map(tab => (
                       <button
                         key={tab.id}
                         onClick={() => {
                           setActiveAuditTab(tab.id)
                           setPreviewDoc(null)
                         }}
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

                   {/* Scrollable spec/doc frames - Spacing: desktop p-8, tablet p-6, mobile p-4 */}
                   <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                     
                     {/* TAB A: Specs */}
                     {activeAuditTab === 'specs' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
                         {/* Info Cards Grid: Desktop 3 cols, Tablet 2 cols, Mobile 1 col */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                           {[
                             { label: 'Business Name', val: selectedVendor.businessName },
                             { label: 'Service Category', val: selectedVendor.category?.name || 'Cab Operator' },
                             { label: 'Authorized Owner', val: selectedVendor.user?.name || '—' },
                             { label: 'Primary Contact Phone', val: selectedVendor.phone },
                             { label: 'Primary Contact Email', val: selectedVendor.email },
                             { label: 'Years Of Experience', val: `${selectedVendor.yearsOfExperience || 0} Years` },
                             { label: 'Base Operations City', val: selectedVendor.location?.city },
                             { label: 'Team Size', val: `${selectedVendor.teamSize || 1} Members` },
                             { label: 'GST Tax ID', val: selectedVendor.gstNumber || 'NO GST PROVIDED' }
                           ].map((item, idx) => (
                             <div key={idx} className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-4 sm:p-5">
                               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                               <span className="font-bold text-gray-900 text-xs sm:text-sm uppercase leading-tight block">{item.val}</span>
                             </div>
                           ))}
                         </div>

                         {/* Pricing Card Section: Desktop 4 cols, Tablet 2 cols, Mobile 2 cols */}
                         <div className="bg-[#FFF8F0]/30 border border-[#D4AF37]/20 rounded-3xl p-4 sm:p-6">
                           <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest block mb-4">Rate Card Pricing Breakdown</span>
                           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Base Price</span>
                               <span className="font-black text-base sm:text-lg text-gray-900 block">{formatPrice(selectedVendor.basePrice || selectedVendor.price || 0)}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Max Price Range</span>
                               <span className="font-black text-base sm:text-lg text-gray-900 block">{formatPrice(selectedVendor.maxPrice || 0)}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Bookings Count</span>
                               <span className="font-black text-base sm:text-lg text-[#C2185B] block">{selectedVendor.totalBookings || 0} Bookings</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Active Packages</span>
                               <span className="font-black text-base sm:text-lg text-gray-900 block">{selectedVendor.packages?.length || 0} Deals</span>
                             </div>
                           </div>
                         </div>

                         {/* Bank Details */}
                         <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl p-4 sm:p-6">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Authorized Bank Transfer Account</span>
                           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Bank Name</span>
                               <span className="font-bold text-xs text-gray-900 uppercase block">{selectedVendor.bankDetails?.bankName || 'N/A'}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Account Holder</span>
                               <span className="font-bold text-xs text-gray-900 uppercase block">{selectedVendor.bankDetails?.accountHolder || 'N/A'}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Account Number</span>
                               <span className="font-bold text-xs text-gray-900 uppercase block">{selectedVendor.bankDetails?.accountNumber || 'N/A'}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">IFSC Code</span>
                               <span className="font-bold text-xs text-gray-900 uppercase block">{selectedVendor.bankDetails?.ifscCode || 'N/A'}</span>
                             </div>
                           </div>
                         </div>

                         {/* Business Description */}
                         <div>
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Vendor Business Description & Notes</span>
                           <p className="text-xs sm:text-sm text-gray-600 font-semibold leading-relaxed italic bg-gray-50/50 p-4 border border-gray-50 rounded-2xl">
                             "{selectedVendor.description || 'No custom description notes supplied by vendor.'}"
                           </p>
                         </div>
                       </motion.div>
                     )}

                     {/* TAB B: Documents Paperwork Review */}
                     {activeAuditTab === 'documents' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                           {[
                             { key: 'idProof', label: 'ID Proof (Aadhaar/PAN) *' },
                             { key: 'gstCertificate', label: 'GST Certificate' },
                             { key: 'businessLicense', label: 'Trade/Business License *' },
                             { key: 'registrationCertificate', label: 'Vehicle Registration Certificate (RC)' },
                             { key: 'insuranceCertificate', label: 'Vehicle Commercial Insurance' },
                             { key: 'drivingLicense', label: 'Driver Commercial DL Details' }
                           ].map(docType => {
                             const doc = getDocument(docType.key)
                             return (
                               <div key={docType.key} className="bg-gray-50 border border-gray-100 rounded-3xl p-4 sm:p-6 flex flex-col justify-between h-48 group">
                                 <div>
                                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">{docType.label}</span>
                                   {doc.url ? (
                                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[8px] font-black tracking-wider border shadow-sm ${
                                       doc.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                     }`}>
                                        {doc.verified ? '🛡️ VERIFIED & CLEARED' : '⚠️ PENDING REVIEW'}
                                     </span>
                                   ) : (
                                     <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-xl text-[8px] font-black tracking-wider border border-red-200">
                                        ❌ MISSING DOCUMENT
                                     </span>
                                   )}
                                 </div>
                                 
                                 {doc.url && (
                                   <div className="flex gap-2">
                                     <button 
                                       onClick={() => setPreviewDoc(doc)}
                                       className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm text-center min-h-[44px] flex items-center justify-center"
                                     >
                                       Review Document
                                     </button>
                                     <a 
                                       href={doc.url} 
                                       download
                                       target="_blank"
                                       rel="noreferrer"
                                       className="w-11 h-11 bg-white border border-gray-200 text-gray-700 rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all flex-shrink-0"
                                       title="Download File"
                                     >
                                       <FiDownload size={14} />
                                     </a>
                                   </div>
                                 )}
                               </div>
                             )
                           })}
                         </div>

                         {/* Lazy-loaded live document preview pane inside modal */}
                         {previewDoc && (
                           <div className="border border-gray-200 rounded-[2.5rem] bg-[#FAF9F6] p-4 sm:p-6 space-y-4">
                             <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                               <div>
                                 <span className="text-[8px] font-black text-gray-400 uppercase block">Interactive Auditor Sandbox</span>
                                 <h4 className="text-xs font-black text-gray-900 uppercase">Live Preview: {previewDoc.type}</h4>
                               </div>
                               <button onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900"><FiX size={14} /></button>
                             </div>

                             <div className="aspect-[16/9] w-full rounded-2xl bg-white border overflow-hidden relative">
                               {previewDoc.url.match(/\.(pdf)/i) ? (
                                 <iframe src={previewDoc.url} className="w-full h-full border-none" title="Document PDF Preview" />
                               ) : (
                                 <img src={previewDoc.url || 'https://via.placeholder.com/800x450?text=No+Preview+File+Uploaded'} className="w-full h-full object-contain" alt="" />
                               )}
                             </div>

                             <div className="flex flex-col sm:flex-row gap-3">
                               <button 
                                 onClick={() => handleDocumentStatus(previewDoc.type, 'approved')}
                                 className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                               >
                                 <FiCheck /> Clear & Approve
                               </button>
                               <button 
                                 onClick={() => handleDocumentStatus(previewDoc.type, 'rejected')}
                                 className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                               >
                                 <FiX /> Request Corrections
                               </button>
                             </div>
                           </div>
                         )}

                       </motion.div>
                     )}

                     {/* TAB C: Portfolio Showcase */}
                     {activeAuditTab === 'portfolio' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                           {selectedVendor.images && selectedVendor.images.length > 0 ? (
                             selectedVendor.images.map((img, idx) => (
                               <div key={idx} className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50 hover:scale-[1.02] transition-transform">
                                 <div className="bg-gray-100/50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                   <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Photo #{idx + 1}</span>
                                   {img.isPrimary && <span className="text-[8px] font-black text-[#D4AF37] uppercase">Primary Cover</span>}
                                 </div>
                                 <div className="aspect-[4/3] relative">
                                   <img src={img.url} className="w-full h-full object-cover" alt="" />
                                 </div>
                               </div>
                             ))
                           ) : (
                             <div className="col-span-3 text-center py-16 text-gray-400 italic">No portfolio work images uploaded.</div>
                           )}
                         </div>
                       </motion.div>
                     )}

                   </div>
                 </div>

                 {/* Right Column: Auditor Action Panel & Checklist (35% on Desktop, Stacks Below Content on Tablet/Mobile) */}
                 <div className="w-full lg:w-[35%] bg-gray-50/50 p-4 sm:p-6 lg:p-8 lg:overflow-y-auto flex flex-col justify-between lg:h-full border-t lg:border-t-0 lg:border-l border-gray-100 custom-scrollbar">
                   <div className="space-y-6 sm:space-y-8">
                     <div>
                       <h3 className="font-display text-lg font-black text-gray-900 tracking-tight mb-1">Auditor Control Center</h3>
                       <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider italic">Execute audit checkoffs below</p>
                     </div>

                     {/* Verification Progress Tracker */}
                     <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Verification Progress</span>
                       <div className="space-y-3">
                         {[
                           { label: 'Registry Onboarded', checked: true },
                           { label: 'Identity & GST Audit', checked: checkpoints.identityVerified || checkpoints.gstValidated },
                           { label: 'Bank Details Validated', checked: checkpoints.bankConfirmed },
                           { label: 'Registry Verification Completed', checked: selectedVendor.approvalStatus === 'approved' }
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

                     {/* Administrative Checklist switches - Minimum height 44px */}
                     <div className="space-y-3">
                       {[
                         { key: 'identityVerified', label: 'Government ID Checked', desc: 'Valid Aadhaar / PAN card match' },
                         { key: 'gstValidated', label: 'GST Identity Verified', desc: 'Verified on GSTIN active database' },
                         { key: 'bankConfirmed', label: 'Bank Account Verified', desc: 'Settle merchant payout accounts' },
                         { key: 'pricingRationalized', label: 'Marketplace Compliance', desc: 'Pricing card complies with guidelines' }
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
                             {checkpoints[chk.key] ? <FiCheckSquare className="text-green-600" size={20} /> : <FiSquare size={20} />}
                           </span>
                           <div>
                             <span className="text-[10px] font-black text-gray-900 uppercase block tracking-wider leading-none">{chk.label}</span>
                             <span className="text-[9px] text-gray-400 font-semibold mt-1.5 block italic leading-snug">{chk.desc}</span>
                           </div>
                         </button>
                       ))}
                     </div>

                     {/* Featured and Badging Promos */}
                     <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Badging & Placement</span>
                       <div className="flex items-center justify-between min-h-[44px]">
                         <div>
                           <span className="text-[10px] font-black text-gray-900 uppercase block">Promote Featured</span>
                           <span className="text-[8px] text-gray-400 font-semibold block mt-0.5">Pins vendor to top of catalog</span>
                         </div>
                         <input 
                           type="checkbox"
                           checked={isFeatured}
                           onChange={e => setIsFeatured(e.target.checked)}
                           className="w-6 h-6 accent-[#D4AF37] cursor-pointer flex-shrink-0"
                         />
                       </div>

                       <div className="border-t border-gray-100 pt-3 flex items-center justify-between min-h-[44px]">
                         <div>
                           <span className="text-[10px] font-black text-gray-900 uppercase block">Trust Badge</span>
                           <span className="text-[8px] text-gray-400 font-semibold block mt-0.5">Award verified badge</span>
                         </div>
                         <button
                           onClick={() => handleVendorStatusUpdate(selectedVendor.approvalStatus, true)}
                           className={`px-3 py-2 rounded-full text-[8px] font-black uppercase tracking-wider min-h-[44px] flex items-center justify-center ${
                             selectedVendor.badges?.includes('verified') 
                               ? 'bg-green-100 text-green-700 border border-green-200' 
                               : 'bg-gray-100 text-gray-500 border border-gray-200'
                           }`}
                         >
                           {selectedVendor.badges?.includes('verified') ? 'VERIFIED 🛡' : 'GRANT BADGE'}
                         </button>
                       </div>
                     </div>

                     {/* Internal Notes */}
                     <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Auditor Internal Remarks & Action Notes</label>
                       <textarea 
                         value={internalNotes} 
                         onChange={e => setInternalNotes(e.target.value)} 
                         rows={4} 
                         className="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-2xl p-4 font-semibold text-xs text-gray-900 outline-none resize-none shadow-sm" 
                         placeholder="Enter permanent audit compliance notes, rejection details, or correction request messages..." 
                       />
                     </div>
                   </div>

                   {/* Confirmation Actions */}
                   <div className="space-y-3 pt-6 border-t border-gray-100 mt-8">
                     <div className="flex flex-col sm:flex-row gap-3">
                       <button 
                         onClick={() => handleVendorStatusUpdate('approved')}
                         disabled={actionLoading}
                         className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
                       >
                         Approve Vendor
                       </button>
                       <button 
                         onClick={() => handleVendorStatusUpdate('rejected')}
                         disabled={actionLoading}
                         className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
                       >
                         Reject & Request
                       </button>
                     </div>
                     <button 
                       onClick={() => handleVendorStatusUpdate('suspended')}
                       disabled={actionLoading}
                       className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md text-center min-h-[44px] flex items-center justify-center"
                     >
                       Suspend Account
                     </button>
                   </div>
                 </div>

               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
