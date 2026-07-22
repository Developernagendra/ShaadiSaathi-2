import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { formatDateShort } from '../../utils/helpers'
import StarRating from '../../components/common/StarRating'
import { FiTrash2, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/reviews')
      .then(r => setReviews(r.data.reviews))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return
    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Review deleted successfully')
      load()
    } catch {
      toast.error('Failed to delete review')
    }
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
    <div className="pb-24 animate-fade-in relative px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-black text-gray-900 tracking-tighter">Content <span className="text-primary-600">Moderation</span></h1>
          <p className="text-gray-500 font-medium italic">Manage and moderate user reviews.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl shimmer border border-gray-100" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <FiAlertCircle className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Reviews Found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center font-black text-primary-600 text-xl flex-shrink-0 border border-primary-100">
                {r.user?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{r.user?.name}</h4>
                    <p className="text-xs text-gray-400 font-medium mb-1">{formatDateShort(r.createdAt)}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                        {r.vendor ? 'Vendor' : 'Cab'}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {r.vendor?.businessName || r.cab?.name || 'Unknown Entity'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {r.status !== 'approved' && (
                      <button onClick={() => handleStatusChange(r._id, 'approved')} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100">
                        Approve
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button onClick={() => handleStatusChange(r._id, 'rejected')} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">
                        Reject
                      </button>
                    )}
                    <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <StarRating rating={r.rating} showCount={false} size="sm" />
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                    r.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed mt-2 text-sm">{r.comment}</p>
                
                {r.vendorReply && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-xl border-l-4 border-primary-300">
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Vendor Reply</p>
                    <p className="text-xs text-gray-600">{r.vendorReply.comment}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
