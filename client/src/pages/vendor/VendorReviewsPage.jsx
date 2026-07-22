import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import { formatDateShort } from '../../utils/helpers'
import StarRating from '../../components/common/StarRating'
import { FiMessageSquare, FiCornerUpRight } from 'react-icons/fi';
import toast from 'react-hot-toast'

export default function VendorReviewsPage() {
  const { myVendorProfile: vendor } = useSelector(s => s.vendor)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [stats, setStats] = useState({ average: 0, count: 0, distribution: {} })

  const load = () => {
    setLoading(true)
    api.get(`/reviews/dashboard`)
      .then(r => {
        setReviews(r.data.reviews)
        const dist = {}
        r.data.reviews.forEach(rv => {
          dist[rv.rating] = (dist[rv.rating] || 0) + 1
        })
        setStats({ 
          average: vendor?.rating?.average || 0, 
          count: vendor?.rating?.count || 0, 
          distribution: dist 
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (vendor) load() }, [vendor])

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return
    try {
      await api.post(`/reviews/${reviewId}/reply`, { comment: replyText })
      toast.success('Reply submitted!')
      setReplying(null)
      setReplyText('')
      load()
    } catch { toast.error('Failed to reply') }
  }

  const handleStatusChange = async (reviewId, status) => {
    try {
      await api.patch(`/reviews/${reviewId}/status`, { status })
      toast.success(`Review ${status}`)
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="pb-24 animate-fade-in relative max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
        <div>
          <div className="divider-luxe !justify-start mb-3 !gap-3">
            <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Client Feedback</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Customer Reviews</h1>
          <p className="text-gray-500 font-medium italic mt-2">Manage your online reputation and reply to couples.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <button className="px-6 py-3 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest transition-all">All Reviews</button>
           <button className="px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-black text-[10px] uppercase tracking-widest transition-all">Top Rated</button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-sm border border-white mb-12 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden z-10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-shadow duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="text-center relative z-10">
          <p className="text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] to-[#C2185B] leading-none mb-4 drop-shadow-sm">{Number(stats.average).toFixed(1)}</p>
          <div className="flex justify-center mb-3">
            <StarRating rating={stats.average} showCount={false} size="lg" />
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stats.count} Verified Reviews</p>
        </div>
        
        <div className="flex-1 w-full space-y-3 relative z-10">
          {[5, 4, 3, 2, 1].map(star => {
            const count = stats.distribution[star] || 0
            const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-500 w-4">{star} <span className="text-[#D4AF37]">★</span></span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#C2185B] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-1000" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-[10px] font-black text-gray-600 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {loading ? (
          <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-40 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <span className="text-5xl block mb-4">⭐</span>
            <h3 className="font-display text-2xl font-black text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-400 font-medium italic">Satisfy your customers to get your first review!</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r._id} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white hover:border-[#D4AF37]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-[#C2185B]/5 rounded-bl-[4rem] group-hover:from-[#D4AF37]/10 group-hover:to-[#C2185B]/10 blur-xl transition-all duration-700 pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-black text-gray-500 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    {r.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-display text-xl font-black text-gray-900 mb-1 leading-tight group-hover:text-[#C2185B] transition-colors">{r.user?.name || 'Customer'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{formatDateShort(r.createdAt)}</p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <StarRating rating={r.rating} showCount={false} size="sm" />
                  <div className="mt-3">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border shadow-sm ${
                      r.status === 'approved' ? 'bg-green-50/80 text-green-600 border-green-200' : 
                      r.status === 'rejected' ? 'bg-red-50/80 text-red-600 border-red-200' : 'bg-amber-50/80 text-amber-600 border-amber-200'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10">
                 <p className="text-gray-700 font-medium italic leading-relaxed text-sm bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/50 shadow-inner">"{r.comment}"</p>
              </div>
              
              {r.images?.length > 0 && (
                <div className="flex gap-4 mt-6 overflow-x-auto pb-2 relative z-10 custom-scrollbar">
                  {r.images.map((img, idx) => (
                    <img key={idx} src={img.url} className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-sm hover:scale-105 hover:shadow-md transition-all cursor-pointer" alt="Review" />
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex flex-wrap items-center gap-3 relative z-10 pt-6 border-t border-gray-100/50">
                {r.status !== 'approved' && (
                  <button onClick={() => handleStatusChange(r._id, 'approved')} className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 border border-green-200 px-5 py-2.5 rounded-xl hover:bg-green-100 transition-colors shadow-sm">
                    Approve Publish
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => handleStatusChange(r._id, 'rejected')} className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-colors shadow-sm">
                    Hide
                  </button>
                )}
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-100 hover:bg-gray-50 hover:text-gray-900 px-5 py-2.5 rounded-xl transition-colors shadow-sm ml-auto">
                  Share
                </button>
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-100 hover:bg-gray-50 hover:text-gray-900 px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                  Report
                </button>
              </div>

              <div className="relative z-10">
                {r.vendorReply?.comment ? (
                  <div className="mt-6 p-6 bg-[#FAF8F5]/80 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 relative shadow-sm">
                    <div className="absolute top-0 left-8 -translate-y-1/2 w-4 h-4 bg-[#FAF8F5] border-t border-l border-[#D4AF37]/30 rotate-45" />
                    <p className="text-[10px] font-black text-[#8E244D] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><FiCornerUpRight size={14} /> Your Response</p>
                    <p className="text-sm font-medium text-gray-700 italic">"{r.vendorReply.comment}"</p>
                  </div>
                ) : replying === r._id ? (
                  <div className="mt-6 space-y-4">
                    <textarea 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Thank the couple for their kind words..." 
                      className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-5 text-sm font-medium outline-none focus:border-[#C2185B] focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all resize-none h-32 shadow-inner"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => handleReply(r._id)} className="bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[10px] uppercase tracking-widest py-3 px-8 rounded-xl shadow-[0_10px_20px_rgba(194,24,91,0.2)] hover:-translate-y-0.5 transition-all">Publish Reply</button>
                      <button onClick={() => setReplying(null)} className="bg-white border border-gray-200 text-gray-600 font-black text-[10px] uppercase tracking-widest py-3 px-8 rounded-xl hover:bg-gray-50 shadow-sm transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplying(r._id)} className="mt-6 text-[10px] font-black text-[#C2185B] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#C2185B] hover:text-white transition-all duration-300 bg-[#C2185B]/5 border border-[#C2185B]/10 px-6 py-3 rounded-xl w-full sm:w-auto shadow-sm">
                    <FiMessageSquare size={14} /> Reply to Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
