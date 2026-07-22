import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiMapPin, FiCalendar, FiAlignLeft, FiMoreHorizontal } from 'react-icons/fi';
import api from '../../utils/api'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'new', label: 'New Leads', color: 'text-blue-600', borderColor: 'border-t-blue-500', bg: 'bg-blue-50/50' },
  { id: 'contacted', label: 'Contacted', color: 'text-amber-600', borderColor: 'border-t-amber-500', bg: 'bg-amber-50/50' },
  { id: 'negotiation', label: 'Negotiation', color: 'text-purple-600', borderColor: 'border-t-purple-500', bg: 'bg-purple-50/50' },
  { id: 'won', label: 'Converted', color: 'text-green-600', borderColor: 'border-t-green-500', bg: 'bg-green-50/50' },
  { id: 'lost', label: 'Lost', color: 'text-red-600', borderColor: 'border-t-red-500', bg: 'bg-red-50/50' }
]

export default function VendorLeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = async () => {
    try {
      const res = await api.get('/vendors/leads/pipeline')
      setLeads(res.data.data.leads)
    } catch (err) {
      toast.error('Failed to load leads pipeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const updateStatus = async (id, newStatus) => {
    // Optimistic UI update
    const previousLeads = [...leads]
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
    
    try {
      await api.patch(`/vendors/leads/${id}/status`, { status: newStatus })
      toast.success('Lead status updated')
    } catch (err) {
      toast.error('Failed to update status')
      setLeads(previousLeads) // Revert on failure
    }
  }

  // Calculate Pipeline value (Total budget of active leads)
  const pipelineValue = leads
    .filter(l => ['new', 'contacted', 'negotiation'].includes(l.status))
    .reduce((sum, l) => {
      const amt = Number(l.budget?.replace(/[^0-9.-]+/g,"")) || 0;
      return sum + amt;
    }, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 animate-fade-in relative px-4 md:px-8 pt-8">
      
      {/* Premium Header */}
      <div className="max-w-[1600px] mx-auto mb-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-sm border border-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-1 w-12 bg-gradient-to-r from-[#C2185B] to-[#8E244D] rounded-full" />
              <span className="text-[#C2185B] text-[10px] font-black uppercase tracking-[0.5em] italic">Lead Management</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm">Sales Pipeline</h1>
            <p className="text-gray-500 font-medium italic mt-2">Drag and manage incoming inquiries across your workflow.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 w-full md:w-auto">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">New</p>
              <p className="font-display text-3xl font-black text-blue-600 drop-shadow-sm">{leads.filter(l => l.status === 'new').length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Active</p>
              <p className="font-display text-3xl font-black text-amber-600 drop-shadow-sm">{leads.filter(l => ['contacted', 'negotiation'].includes(l.status)).length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Won</p>
              <p className="font-display text-3xl font-black text-green-600 drop-shadow-sm">{leads.filter(l => l.status === 'won').length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Pipeline</p>
              <p className="font-display text-2xl font-black text-[#D4AF37] drop-shadow-sm truncate" title={`₹${pipelineValue.toLocaleString()}`}>
                ₹{pipelineValue >= 100000 ? (pipelineValue / 100000).toFixed(1) + 'L' : pipelineValue >= 1000 ? (pipelineValue / 1000).toFixed(1) + 'k' : pipelineValue}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-12 h-12 border-4 border-pink-100 border-t-[#c41e6b] rounded-full animate-spin shadow-xl" />
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar min-h-[65vh]">
            {COLUMNS.map(column => (
              <div key={column.id} className="w-full sm:min-w-[340px] max-w-[340px] w-full flex-shrink-0 flex flex-col gap-4">
                
                {/* Column Header */}
                <div className={`px-5 py-4 rounded-2xl border-t-4 bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 ${column.borderColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-display font-black text-[13px] uppercase tracking-[0.2em] ${column.color}`}>{column.label}</h3>
                    <span className="bg-gray-100/80 px-3 py-1 rounded-full text-[10px] font-black shadow-inner">{leads.filter(l => l.status === column.id).length}</span>
                  </div>
                </div>

                {/* Column Content */}
                <div className={`flex flex-col gap-4 p-3 rounded-3xl min-h-[200px] transition-colors ${column.bg} border border-white`}>
                  <AnimatePresence>
                    {leads.filter(l => l.status === column.id).map(lead => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={lead.id}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] border border-white hover:border-[#D4AF37]/30 transition-all group relative flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[9px] font-black text-gray-400 tracking-[0.2em] uppercase mb-1">{lead.requestedAt}</p>
                            <h3 className="font-display text-xl font-black text-gray-900 leading-tight">{lead.customer}</h3>
                            <p className="text-[10px] font-bold text-[#C2185B] uppercase tracking-[0.1em] mt-1">{lead.type}</p>
                          </div>
                        </div>

                        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-gray-50 mb-4">
                          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget</span>
                            <span className="font-display font-black text-[#D4AF37] text-lg">{lead.budget}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                              <FiCalendar className="text-[#C2185B]" size={12} /> {lead.date}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                              <FiMapPin className="text-[#D4AF37]" size={12} /> {lead.location}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mb-5 group/notes cursor-help">
                          <FiAlignLeft className="text-gray-300 mt-0.5 flex-shrink-0" size={14} />
                          <p className="text-xs text-gray-500 font-medium italic line-clamp-2 group-hover/notes:line-clamp-none transition-all">{lead.notes}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100/50 mt-auto">
                          <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm">
                            <FiMessageCircle size={14} /> Reply
                          </button>
                          
                          {/* Status Update Menu */}
                          {lead.status !== 'won' && lead.status !== 'lost' && (
                            <div className="relative group/menu">
                              <button className="w-10 h-10 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 rounded-xl flex items-center justify-center transition-all shadow-sm">
                                <FiMoreHorizontal size={16} />
                              </button>
                              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] px-3 py-2">Move to...</p>
                                {COLUMNS.filter(c => c.id !== lead.status).map(c => (
                                  <button key={c.id} onClick={() => updateStatus(lead.id, c.id)} className={`w-full text-left px-3 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors ${c.color} hover:bg-gray-50`}>
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {leads.filter(l => l.status === column.id).length === 0 && (
                     <div className="border-2 border-dashed border-gray-200/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white/30 text-gray-400 h-full">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black">No Leads</span>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

