import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiX, FiSearch, FiMapPin, FiAlertCircle, FiEye, FiShield, FiActivity, FiBriefcase, FiFileText, FiUser, FiCalendar, FiImage, FiClock } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import { formatPrice } from '../../utils/helpers'
import LoadingScreen from '../../components/common/LoadingScreen'

export default function AdminManageCabsPage() {
  const [cabs, setCabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)
  
  // Advanced Audit states
  const [selectedCab, setSelectedCab] = useState(null)
  const [checklist, setChecklist] = useState({
    documentsComplete: false,
    registrationVerified: false,
    insuranceValid: false,
    imagesVerified: false,
    pricingApproved: false
  })
  const [adminRemarks, setAdminRemarks] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [activeTab, setActiveTab] = useState('specs') // specs | photos | documents | driver

  useEffect(() => {
    loadCabs()
  }, [])

  const loadCabs = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/fleet')
      setCabs(data.cabs)
    } catch (err) {
      toast.error("Failed to load Fleet Registry")
    } finally {
      setLoading(false)
    }
  }

  const openDetails = (cab) => {
    setSelectedCab(cab)
    setChecklist({
      documentsComplete: cab.verificationChecklist?.documentsComplete || false,
      registrationVerified: cab.verificationChecklist?.registrationVerified || false,
      insuranceValid: cab.verificationChecklist?.insuranceValid || false,
      imagesVerified: cab.verificationChecklist?.imagesVerified || false,
      pricingApproved: cab.verificationChecklist?.pricingApproved || false
    })
    setAdminRemarks(cab.adminRemarks || '')
    setRejectionReason(cab.rejectionReason || '')
    setInternalNotes(cab.internalNotes || '')
    setIsFeatured(cab.isFeatured || false)
    setActiveTab('specs')
  }

  // Handle high-fidelity verification submission
  const handleVerify = async (status) => {
    if (status === 'changes_requested' && !rejectionReason && !adminRemarks) {
      toast.error('Please provide details in Rejection Reason / Remarks for the vendor to correct.')
      return
    }
    if (status === 'rejected' && !rejectionReason) {
      toast.error('Rejection reason is required to submit a flat reject.')
      return
    }

    setActionLoading(selectedCab._id)
    try {
      const { data } = await api.patch(`/fleet/moderate/${selectedCab._id}`, {
        status,
        verificationChecklist: checklist,
        adminRemarks,
        rejectionReason: status === 'approved' ? '' : (rejectionReason || adminRemarks),
        internalNotes,
        isFeatured
      })
      
      toast.success(`Vehicle listing successfully moderated as ${status.toUpperCase()}!`)
      setSelectedCab(null)
      loadCabs()
    } catch (err) {
      toast.error(err.response?.data?.message || "Moderation update failed")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredCabs = cabs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
                          c.vendor?.businessName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const checklistItems = [
    { key: 'documentsComplete', label: 'Legal Documents Complete' },
    { key: 'registrationVerified', label: 'Registration Verified (RC)' },
    { key: 'insuranceValid', label: 'Insurance Certificate Valid' },
    { key: 'imagesVerified', label: 'High-Res Photos Approved' },
    { key: 'pricingApproved', label: 'Rate & Pricing Approved' }
  ]

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-2xl bg-gray-900 text-[#D4AF37] flex items-center justify-center shadow-xl">
                  <FiShield size={20} />
               </div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Platform Governance</h4>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
              Fleet <span className="text-[#C2185B]">Registry Auditor</span>
            </h1>
            <p className="text-gray-500 font-medium italic mt-2">Audit commercial registrations, verify legal documents, and approve premium listings.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-3xl shadow-premium border border-gray-100">
             {['all', 'pending', 'approved', 'changes_requested', 'rejected'].map(s => (
               <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === s ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
                }`}
               >
                 {s.replace('_', ' ')}
               </button>
             ))}
          </div>
        </div>

        {/* Registry Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: 'Total Fleet Size', val: cabs.length, icon: <FaTruck />, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Pending Verification', val: cabs.filter(c => c.status === 'pending').length, icon: <FiActivity />, color: 'text-amber-600', bg: 'bg-amber-50 animate-pulse' },
             { label: 'Live Catalog Vehicles', val: cabs.filter(c => c.status === 'approved').length, icon: <FiCheck />, color: 'text-green-600', bg: 'bg-green-50' },
             { label: 'Changes Pending', val: cabs.filter(c => c.status === 'changes_requested').length, icon: <FiAlertCircle />, color: 'text-blue-600', bg: 'bg-blue-50' },
           ].map(s => (
             <div key={s.label} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-premium flex flex-col items-center text-center group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${s.bg} ${s.color} transition-transform group-hover:scale-110`}>{s.icon}</div>
                <p className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{s.val}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
             </div>
           ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-premium mb-8 flex items-center gap-6">
           <div className="flex-1 flex items-center gap-4 px-4">
             <FiSearch className="text-[#D4AF37]" />
             <input 
               type="text" 
               placeholder="Search by vehicle name, plate number, or vendor business..." 
               className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
           </div>
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-6">{filteredCabs.length} Vehicles surfaced</p>
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-premium overflow-hidden">
           <div className="overflow-x-auto">
              <table className="table-responsive w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                       <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Vehicle & Vendor Owner</th>
                       <th className="py-8 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Specifications</th>
                       <th className="py-8 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Pricing</th>
                       <th className="py-8 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Status Badge</th>
                       <th className="py-8 px-10 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Moderation Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredCabs.map(cab => (
                      <motion.tr layout key={cab._id} className="hover:bg-gray-50/30 transition-all group">
                         <td data-label="Vehicle & Vendor Owner" className="py-8 px-10">
                            <div className="flex items-center gap-6">
                               <div className="w-20 h-16 rounded-2xl bg-gray-100 overflow-hidden shadow-sm relative flex-shrink-0">
                                  <img src={cab.images?.find(i => i.viewType === 'front' || i.isPrimary)?.url || cab.images?.[0]?.url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                  {cab.isFeatured && <div className="absolute top-1 right-1 w-3 h-3 bg-[#D4AF37] rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white">★</div>}
                               </div>
                               <div>
                                  <p className="font-black text-gray-900 group-hover:text-[#C2185B] transition-colors text-lg">{cab.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                     <FiBriefcase className="text-[#D4AF37]" size={12} />
                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{cab.vendor?.businessName || 'ShaadiSaathi Direct'}</p>
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td data-label="Specifications" className="py-8 px-8">
                            <div className="space-y-1">
                               <p className="text-xs font-black text-gray-700 uppercase tracking-widest">{cab.type?.replace('_', ' ')}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase">Plate: {cab.vehicleNumber}</p>
                               <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><FiMapPin size={10} /> {cab.location?.city}</p>
                            </div>
                         </td>
                         <td data-label="Pricing" className="py-8 px-8">
                            <p className="font-black text-gray-900 text-lg">{formatPrice(cab.price || cab.pricing?.baseFare)}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">Day Rate</p>
                         </td>
                         <td data-label="Status Badge" className="py-8 px-8">
                            <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-2 ${
                              cab.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              cab.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              cab.status === 'changes_requested' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${
                                 cab.status === 'approved' ? 'bg-green-500' : 
                                 cab.status === 'pending' ? 'bg-amber-500 animate-pulse' :
                                 cab.status === 'changes_requested' ? 'bg-blue-500' : 'bg-red-500'
                               }`} />
                               {cab.status?.replace('_', ' ') || 'pending'}
                            </span>
                         </td>
                         <td data-label="Moderation Actions" className="py-8 px-10">
                            <div className="flex items-center justify-end gap-3">
                               <button 
                                 onClick={() => openDetails(cab)}
                                 className="h-11 px-6 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-sm flex items-center gap-2"
                                 title="Open Audit Panel"
                               >
                                 <FiEye size={16} /> Audit Profile
                               </button>
                            </div>
                         </td>
                      </motion.tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Advanced Verification & Split details Modal */}
      <AnimatePresence>
        {selectedCab && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!actionLoading) setSelectedCab(null) }} className="fixed inset-0 bg-gray-900/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-none sm:rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-6xl relative z-10 shadow-2xl overflow-y-auto md:overflow-hidden h-full sm:h-[90vh] md:max-h-[92vh] flex flex-col"
            >
               {/* Modal Header */}
               <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 relative">
                 <div className="flex items-center gap-4 pr-12 sm:pr-0">
                   <div className="w-12 h-12 bg-gray-900 text-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                     <FiShield size={24} />
                   </div>
                   <div>
                     <h2 className="font-display text-lg sm:text-2xl font-black text-gray-900 leading-tight">Verification Audit Room</h2>
                     <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest italic mt-1.5 leading-snug">Auditing: {selectedCab.name} (Plate: {selectedCab.vehicleNumber})</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedCab(null)} disabled={actionLoading} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 flex-shrink-0"><FiX /></button>
               </div>

               {/* Split panes */}
               <div className="flex-1 overflow-y-auto md:overflow-y-hidden md:overflow-x-hidden flex flex-col md:flex-row">
                 
                 {/* Left Column: Vendor vehicle data & Tabs (Scrollable) */}
                 <div className="w-full md:w-2/3 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col md:h-full md:overflow-hidden flex-shrink-0">
                   
                   {/* Tabs bar */}
                   <div className="bg-gray-50/30 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex overflow-x-auto scrollbar-none items-center gap-3 w-full">
                     {[
                       { id: 'specs', label: 'Specs & Pricing', icon: <FaTruck /> },
                       { id: 'photos', label: 'Showcase Photos', icon: <FiImage /> },
                       { id: 'documents', label: 'Legal Docs', icon: <FiFileText /> },
                       { id: 'driver', label: 'Chauffeur Profile', icon: <FiUser /> },
                       { id: 'audit', label: 'Audit History', icon: <FiClock /> }
                     ].map(tab => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id)}
                         className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                           activeTab === tab.id ? 'bg-gray-900 text-white shadow' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-700'
                         }`}
                       >
                         {tab.icon} {tab.label}
                       </button>
                     ))}
                   </div>

                   {/* Scrollable specs frame */}
                   <div className="flex-1 md:overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
                     
                     {/* TAB A: Specs */}
                     {activeTab === 'specs' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                           {[
                             { label: 'Category', val: selectedCab.type?.replace('_', ' ') },
                             { label: 'Brand/Make', val: selectedCab.brand || 'Mercedes-Benz' },
                             { label: 'Model Spec', val: selectedCab.model || 'S-Class' },
                             { label: 'Model Year', val: selectedCab.modelYear || '2024' },
                             { label: 'Exterior Color', val: selectedCab.color || 'Ivory White' },
                             { label: 'Fuel Type', val: selectedCab.fuelType || 'Diesel' },
                             { label: 'Passenger Capacity', val: `${selectedCab.seatingCapacity} Passengers` },
                             { label: 'Air Conditioning', val: selectedCab.ac ? 'AC Equipped' : 'Non-AC' },
                             { label: 'Base Operations City', val: selectedCab.location?.city }
                           ].map((item, idx) => (
                             <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                               <span className="font-bold text-gray-900 text-xs uppercase">{item.val}</span>
                             </div>
                           ))}
                         </div>

                         {/* Pricing breakdown card */}
                         <div className="bg-[#FFF8F0]/30 border border-[#D4AF37]/20 rounded-3xl p-6">
                           <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest block mb-4">Pricing & Rate Card Details</span>
                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Base Rate (₹)</span>
                               <span className="font-black text-lg text-gray-900">{formatPrice(selectedCab.price || selectedCab.pricing?.baseFare)}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Per Day Charge (₹)</span>
                               <span className="font-black text-lg text-gray-900">{formatPrice(selectedCab.pricing?.pricePerDay || selectedCab.price)}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Advance Lock</span>
                               <span className="font-black text-lg text-[#C2185B]">{selectedCab.pricing?.advancePercentage || 50}%</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Flower Decoration</span>
                               <span className="font-black text-lg text-gray-900">{formatPrice(selectedCab.pricing?.decorationCharges || 0)}</span>
                             </div>
                           </div>
                         </div>

                         {/* Description */}
                         <div>
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Vendor Description & Notes</span>
                           <p className="text-xs text-gray-600 font-semibold leading-relaxed italic bg-gray-50/50 p-4 border border-gray-50 rounded-2xl">
                             "{selectedCab.description || 'No custom description notes supplied.'}"
                           </p>
                         </div>
                       </motion.div>
                     )}

                     {/* TAB B: Photos Showcase */}
                     {activeTab === 'photos' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                           {['front', 'back', 'side', 'interior', 'decorated'].map((view) => {
                             const img = selectedCab.images?.find(i => i.viewType === view)
                             return (
                               <div key={view} className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50">
                                 <div className="bg-gray-100/50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                   <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider">{view} view</span>
                                   {img && <span className="text-[8px] font-black text-green-600 uppercase">ACTIVE</span>}
                                 </div>
                                 <div className="aspect-[4/3] relative">
                                   {img ? (
                                     <img src={img.url} className="w-full h-full object-cover" alt="" />
                                   ) : (
                                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 text-xs italic">
                                       No image uploaded for this view
                                     </div>
                                   )}
                                 </div>
                               </div>
                             )
                           })}
                         </div>
                       </motion.div>
                     )}

                     {/* TAB C: Documents Paperwork */}
                     {activeTab === 'documents' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                         {[
                           { key: 'registrationCertificate', label: 'Registration Certificate (RC)' },
                           { key: 'insuranceCertificate', label: 'Insurance Certificate' },
                           { key: 'drivingLicense', label: 'Chauffeur DL Details' },
                           { key: 'pollutionCertificate', label: 'Pollution Certificate (PUC)' },
                           { key: 'ownerIdProof', label: 'Owner ID Proof' }
                         ].map(doc => {
                           const docObj = selectedCab.documents?.[doc.key]
                           return (
                             <div key={doc.key} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col justify-between h-40">
                               <div>
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">{doc.label}</span>
                                 {docObj?.url ? (
                                   <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-xl text-[8px] font-black tracking-wider border border-green-200 shadow-sm">
                                      🛡️ LEGAL & AUTHENTIC
                                   </span>
                                 ) : (
                                   <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-xl text-[8px] font-black tracking-wider border border-red-200">
                                      ⚠️ MISSING PAPERWORK
                                   </span>
                                 )}
                               </div>
                               
                               {docObj?.url && (
                                 <a 
                                   href={docObj.url} 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest text-center hover:bg-gray-50 transition-colors shadow-sm block"
                                 >
                                   Open Verification File
                                 </a>
                               )}
                             </div>
                           )
                         })}
                       </motion.div>
                     )}

                     {/* TAB D: Chauffeur Details */}
                     {activeTab === 'driver' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 max-w-xl">
                           <div className="flex items-center gap-6 mb-6">
                             <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-3xl">👨🏽‍✈️</div>
                             <div>
                               <h4 className="text-xl font-black text-gray-900">{selectedCab.driverDetails?.name || 'No Chauffeur assigned'}</h4>
                               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">Assigned Baraat Chauffeur</p>
                             </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Contact Number</span>
                               <span className="font-bold text-gray-900 text-xs">{selectedCab.driverDetails?.phone || 'N/A'}</span>
                             </div>
                             <div>
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Driving Experience</span>
                               <span className="font-bold text-gray-900 text-xs">{selectedCab.driverDetails?.experienceYears || 0} Years</span>
                             </div>
                             <div className="col-span-2">
                               <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Dress/Uniform Compliance</span>
                               <span className="font-bold text-gray-900 text-xs uppercase">{selectedCab.driverDetails?.uniformAvailable ? 'Formals/Uniform Available ✅' : 'Standard casual/dress'}</span>
                             </div>
                           </div>
                         </div>
                       </motion.div>
                     )}

                     {/* TAB E: Audit History */}
                     {activeTab === 'audit' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 max-w-3xl">
                           <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
                             <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg"><FiClock size={20} /></div>
                             <div>
                               <h4 className="text-xl font-black text-gray-900 tracking-tight">Timeline & Activity Logs</h4>
                               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic mt-1">Official Moderation Records</p>
                             </div>
                           </div>

                           {(!selectedCab.auditLogs || selectedCab.auditLogs.length === 0) ? (
                             <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                               <p className="text-gray-400 font-medium italic text-sm">No audit logs available for this vehicle yet.</p>
                             </div>
                           ) : (
                             <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                               {selectedCab.auditLogs.map((log, idx) => (
                                 <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                   <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-100 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                     {log.action === 'approved' ? <FiCheck className="text-green-600" /> : log.action === 'rejected' ? <FiX className="text-red-600" /> : <FiAlertCircle className="text-blue-600" />}
                                   </div>
                                   <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 group-hover:border-gray-300 transition-colors relative">
                                     <div className="flex items-center justify-between mb-3">
                                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                         log.action === 'approved' ? 'bg-green-50 text-green-700' : 
                                         log.action === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                                       }`}>
                                         {log.action.replace('_', ' ')}
                                       </span>
                                       <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1"><FiCalendar size={10} /> {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                     </div>
                                     <p className="text-sm font-semibold text-gray-800 leading-snug mb-4">"{log.reason}"</p>
                                     <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                                       <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500">{log.adminName?.charAt(0) || 'A'}</div>
                                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{log.adminName} (Auditor)</span>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       </motion.div>
                     )}

                   </div>
                 </div>

                 {/* Right Column: Checklist Audits & Actions (Saves Draft, Rejects, Approves) */}
                 <div className="w-full md:w-1/3 bg-gray-50/50 p-4 sm:p-6 md:p-8 md:overflow-y-auto flex flex-col justify-between md:h-full border-t md:border-t-0 md:border-l border-gray-100 custom-scrollbar">
                   <div className="space-y-8">
                     <div>
                       <h3 className="font-display text-lg font-black text-gray-900 tracking-tight mb-1">Verification Checklist</h3>
                       <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider italic">Auditor checkoff lists</p>
                     </div>

                     {/* Checklist toggles */}
                     <div className="space-y-3">
                       {checklistItems.map(item => (
                         <button
                           key={item.key}
                           type="button"
                           onClick={() => setChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                           className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                             checklist[item.key]
                               ? 'border-green-500 bg-green-50 text-green-800 shadow-sm shadow-green-50'
                               : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                           }`}
                         >
                           <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
                           <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                             checklist[item.key] ? 'bg-green-600 border-transparent text-white' : 'border-gray-200 bg-white'
                           }`}>
                             {checklist[item.key] && <FiCheck size={10} />}
                           </div>
                         </button>
                       ))}
                     </div>

                     {/* Action Notes Fields */}
                     <div className="space-y-4 pt-4 border-t border-gray-100">
                       <div>
                         <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Internal Notes (Auditor Only)</label>
                         <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Write internal auditing notes here..." className="w-full bg-white border border-gray-200 rounded-xl p-3 font-semibold text-xs outline-none focus:border-gray-400 h-16 resize-none" />
                       </div>

                       <div>
                         <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Admin Remarks (Visible to Vendor)</label>
                         <textarea value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} placeholder="This feedback is sent to the vendor..." className="w-full bg-white border border-gray-200 rounded-xl p-3 font-semibold text-xs outline-none focus:border-gray-400 h-16 resize-none" />
                       </div>

                       <div>
                         <label className="text-[8px] font-black text-[#C2185B] uppercase tracking-widest block mb-2">Rejection / Change Request Reason</label>
                         <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Provide correction details or rejection reason..." className="w-full bg-white border border-[#C2185B]/20 rounded-xl p-3 font-semibold text-xs outline-none focus:border-[#C2185B] h-16 resize-none" />
                       </div>

                       {/* Featured listings switch */}
                       <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                         <div>
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Featured Promotion</span>
                           <span className="text-[9px] font-bold text-gray-900">Pin to Top of Catalog</span>
                         </div>
                         <input 
                           type="checkbox" 
                           checked={isFeatured}
                           onChange={e => setIsFeatured(e.target.checked)}
                           className="w-5 h-5 accent-[#D4AF37] cursor-pointer" 
                         />
                       </div>
                     </div>
                   </div>

                   {/* Audit Action Buttons */}
                   <div className="pt-8 border-t border-gray-100 space-y-3">
                     <button
                       type="button"
                       disabled={actionLoading}
                       onClick={() => handleVerify('approved')}
                       className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                     >
                       {actionLoading ? 'Saving...' : <><FiCheck /> Approve & Launch Live</>}
                     </button>

                     <div className="grid grid-cols-2 gap-3">
                       <button
                         type="button"
                         disabled={actionLoading}
                         onClick={() => handleVerify('changes_requested')}
                         className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                       >
                         Request Changes
                       </button>

                       <button
                         type="button"
                         disabled={actionLoading}
                         onClick={() => handleVerify('rejected')}
                         className="bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                       >
                         Reject Listing
                       </button>
                     </div>

                     {selectedCab.status === 'approved' && (
                       <button
                         type="button"
                         disabled={actionLoading}
                         onClick={() => handleVerify('suspended')}
                         className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest"
                       >
                         Suspend Listing
                       </button>
                     )}
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
