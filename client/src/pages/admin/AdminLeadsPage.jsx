import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiSearch, FiFilter, FiCalendar, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { formatDateShort, formatPrice } from '../../utils/helpers'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/leads')
      setLeads(data.leads)
    } catch (err) { toast.error('Failed to load leads') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = leads.filter(l => 
    l.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    l.city?.toLowerCase().includes(search.toLowerCase()) ||
    l.serviceType?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Platform Leads</h1>
            <p className="text-gray-500">Monitor all service enquiries and vendor assignments.</p>
          </div>
          <div className="relative w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search leads..." 
              className="input-field pl-10 py-2.5 text-sm" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="h-48 shimmer rounded-3xl" />)
          ) : filtered.map(lead => (
            <div key={lead._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 flex">
                {lead.leadType === 'whatsapp' && (
                  <div className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border-l border-b border-green-100">
                    WhatsApp
                  </div>
                )}
                <div className={`px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${
                  lead.status === 'open' ? 'bg-amber-100 text-amber-700' : 
                  lead.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                }`}>
                  {lead.status}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 text-xl font-bold">
                  {lead.user?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{lead.user?.name}</h3>
                  <p className="text-xs text-gray-400">{formatDateShort(lead.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <FiFilter className="text-gray-400" />
                  <span className="font-bold text-gray-700">{lead.serviceType?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiMapPin className="text-gray-400" />
                  <span className="text-gray-600">{lead.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiCalendar className="text-gray-400" />
                  <span className="text-gray-600">{formatDateShort(lead.eventDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiDollarSign className="text-gray-400" />
                  <span className="font-bold text-primary-600">{formatPrice(lead.budget)} Budget</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 italic line-clamp-2">"{lead.description || 'No description provided'}"</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {lead.quotations?.map((q, i) => (
                    <div key={i} title={q.vendor?.businessName} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                       <img src={q.vendor?.images?.[0]?.url || '/default-vendor.png'} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {lead.quotations?.length === 0 && <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">No Quotes Yet</span>}
                </div>
                <span className="text-xs font-bold text-gray-400">{lead.quotations?.length} Quotes</span>
              </div>
            </div>
          ))}
        </div>
        {!loading && filtered.length === 0 && <div className="p-20 text-center text-gray-400">No leads found.</div>}
      </div>
    </div>
  )
}
