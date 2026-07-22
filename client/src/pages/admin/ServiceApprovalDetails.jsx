import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatDateShort, formatPrice } from '../../utils/helpers'
import { FiCheck, FiX, FiShield, FiFileText, FiLayers, FiImage, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion'

export default function ServiceApprovalDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeAuditTab, setActiveAuditTab] = useState('details')
  const [internalNotes, setInternalNotes] = useState('')

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/services/${id}`)
        setService(res.data.service || res.data)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Service no longer available.')
        } else {
          setError('Failed to load service details.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (id) fetchService()
  }, [id])

  const handleStatusUpdate = async (status) => {
    if (!service) return
    setActionLoading(true)
    try {
      if (status === 'approved') {
        await api.patch(`/admin/services/${service._id}/approve`)
        toast.success('Service listing approved & live publicly! 🚀')
      } else {
        await api.patch(`/admin/services/${service._id}/reject`, { notes: internalNotes })
        toast.success('Service listing rejected & returned to vendor. 📝')
      }
      navigate('/admin/services-approval')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#C2185B] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pt-12 px-4 flex flex-col items-center">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-sm border border-gray-100 mt-20">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="font-display text-2xl font-black text-gray-900 mb-2">Notice</h2>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            {error || 'Service could not be found or has been deleted.'}
          </p>
          <button 
            onClick={() => navigate('/admin/services-approval')}
            className="w-full py-4 rounded-xl bg-gray-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest transition-all shadow"
          >
            Return to Approvals
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto pt-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors"
        >
          <FiArrowLeft /> Back to Approvals
        </button>
        
        <div className="bg-white w-full rounded-[2.5rem] lg:rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[75vh]">
          {/* Header */}
          <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-900 text-[#C2185B] rounded-2xl flex items-center justify-center shadow-xl border-b-2 border-[#C2185B] flex-shrink-0">
                <FiShield size={28} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black text-gray-900 tracking-tight leading-tight">
                  Service Listing Audit
                </h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 leading-snug">
                  Auditing: {service.title} (By: {service.vendor?.businessName || 'Independent Agent'})
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                service.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                service.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Current Status: {service.status || 'Pending'}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Column */}
            <div className="w-full lg:w-[65%] border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
              <div className="bg-gray-50/30 px-6 lg:px-8 py-4 border-b border-gray-100 flex overflow-x-auto scrollbar-none items-center gap-3">
                {[
                  { id: 'details', label: 'Listing Details', icon: <FiFileText /> },
                  { id: 'packages', label: 'Rate Card Packages', icon: <FiLayers /> },
                  { id: 'media', label: 'Media Gallery', icon: <FiImage /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAuditTab(tab.id)}
                    className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all flex-shrink-0 ${
                      activeAuditTab === tab.id 
                        ? 'bg-gray-900 text-white shadow' 
                        : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 lg:p-8 custom-scrollbar">
                {activeAuditTab === 'details' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Listing Title', val: service.title },
                        { label: 'Category', val: service.category?.name || 'Uncategorized' },
                        { label: 'City', val: service.city || 'Not Specified' },
                        { label: 'Starting Price', val: formatPrice(service.startingPrice || service.price || 0) },
                        { label: 'Vendor Partner', val: service.vendor?.businessName || 'Independent Vendor' },
                        { label: 'Created On', val: formatDateShort(service.createdAt) }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-5">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                          <span className="font-bold text-gray-900 text-sm uppercase leading-tight block">{item.val}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Detailed Description</span>
                      <p className="text-sm text-gray-600 font-semibold leading-relaxed bg-[#FAF9F6] p-5 border border-gray-100 rounded-2xl whitespace-pre-line">
                        {service.description || 'No description provided.'}
                      </p>
                    </div>

                    {service.features && service.features.length > 0 && (
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Highlights & Features</span>
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feat, idx) => (
                            <span key={idx} className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[9px] font-black uppercase tracking-wider text-gray-600">
                              ✨ {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeAuditTab === 'packages' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {service.packages && service.packages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {service.packages.map((pkg, idx) => (
                          <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black px-2.5 py-1 bg-gray-900 text-white rounded-full uppercase tracking-widest">
                                Package #{idx + 1}
                              </span>
                              <span className="font-black text-base text-[#C2185B]">{formatPrice(pkg.price)}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">{pkg.name}</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{pkg.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400 text-xs font-black uppercase tracking-widest">
                        No custom packages provided
                      </div>
                    )}
                  </motion.div>
                )}

                {activeAuditTab === 'media' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {service.images && service.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {service.images.map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                            <img src={img} alt={`Media ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400 text-xs font-black uppercase tracking-widest">
                        No media gallery uploaded
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column (Actions) */}
            <div className="w-full lg:w-[35%] bg-gray-50 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <FiShield className="text-[#C2185B]" /> Moderation Verdict
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                      Internal Moderation Notes
                    </label>
                    <textarea 
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Add notes for the vendor if rejecting..."
                      className="w-full h-32 bg-white border border-gray-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all resize-none shadow-inner font-medium text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {service.status !== 'approved' && (
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate('approved')}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <FiCheck size={16} /> Approve & Publish
                  </button>
                )}
                
                {service.status !== 'rejected' && (
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate('rejected')}
                    className="w-full py-4 bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <FiX size={16} /> Reject Listing
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
