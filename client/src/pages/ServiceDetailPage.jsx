import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/api'
import { formatPrice, getInitials, formatDate } from '../utils/helpers'
import StarRating from '../components/common/StarRating'
import ReviewModal from '../components/common/ReviewModal'
import { toast } from 'react-hot-toast'
import { FiMapPin, FiArrowLeft, FiClock, FiCheck, FiShare2, FiHeart } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [reviews, setReviews] = useState([])
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [editReviewData, setEditReviewData] = useState(null)

  const loadReviews = (vendorId) => {
    api.get(`/reviews/vendor/${vendorId}`).then(r => setReviews(r.data.reviews)).catch(() => { })
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      toast.success('Review deleted successfully')
      loadReviews(service.vendor._id)
    } catch (err) {
      toast.error('Failed to delete review')
    }
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get(`/services/${id}`).then(r => {
      setService(r.data.service)
      if (r.data.service?.vendor?._id) {
        loadReviews(r.data.service.vendor._id)
      }
    }).catch((err) => {
      setError(err.response?.data?.message || 'Failed to load service details.')
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-gray-50/50">
      <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin mb-6 shadow-xl" />
      <p className="text-gray-500 font-bold animate-pulse tracking-wide uppercase text-sm">Loading Service...</p>
    </div>
  )

  if (error || (!loading && !service)) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-gray-50/50 px-4">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-xl mb-8">🛠️</div>
      <h2 className="text-4xl font-display font-black text-gray-900 mb-4 text-center">Service Unavailable</h2>
      <p className="text-gray-500 text-center mb-10 max-w-md font-medium text-lg">{error || 'The service you are looking for has been removed or is currently private.'}</p>
      <Link to="/services" className="bg-gray-900 hover:bg-black text-white font-bold px-10 py-4 rounded-full transition-transform hover:-translate-y-1 shadow-xl">Back to Explore</Link>
    </div>
  )

  const allMedia = []
  
  if (Array.isArray(service.images)) {
    service.images.forEach(img => {
      if (img) {
        if (typeof img === 'string') {
          allMedia.push({ url: img, type: 'image' })
        } else if (img.url) {
          allMedia.push({ url: img.url, type: 'image' })
        }
      }
    })
  }
  
  if (Array.isArray(service.gallery)) {
    service.gallery.forEach(imgUrl => {
      if (imgUrl && typeof imgUrl === 'string' && !allMedia.some(m => m.url === imgUrl)) {
        allMedia.push({ url: imgUrl, type: 'image' })
      }
    })
  }

  if (Array.isArray(service.videos)) {
    service.videos.forEach(vid => {
      if (vid) {
        if (typeof vid === 'string') {
          allMedia.push({ url: vid, type: 'video' })
        } else if (vid.url) {
          allMedia.push({ url: vid.url, type: 'video' })
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/services" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
          <FiArrowLeft /> Back to Services
        </Link>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Media Gallery */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200 border border-white">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: true }}
                className="h-64 md:h-[500px] w-full"
              >
                {allMedia.length > 0 ? allMedia.map((m, i) => (
                  <SwiperSlide key={i}>
                    {m.type === 'image' ? (
                      <img src={m.url} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <video src={m.url} controls className="w-full h-full object-cover" preload="metadata" />
                    )}
                  </SwiperSlide>
                )) : (
                  <SwiperSlide>
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300 py-20">
                      <FiHeart size={48} className="text-gray-200 mb-3 animate-pulse" />
                      <p className="font-bold text-xs uppercase tracking-widest italic">No Portfolio Media Available</p>
                    </div>
                  </SwiperSlide>
                )}
              </Swiper>
            </div>

            {/* Header Info */}
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">{service.title}</h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    <StarRating rating={service.rating?.average} count={service.rating?.count} size="md" />
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <FiMapPin className="text-primary-500" /> {service.city}
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <FiClock className="text-blue-500" /> {service.duration || 'Flexible Duration'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-pink-50 hover:text-primary-600 transition-all">
                    <FiHeart size={20} />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <FiShare2 size={20} />
                  </button>
                </div>
              </div>

              <div className="prose prose-pink max-w-none">
                <h3 className="text-xl font-bold text-gray-800 mb-3">About this service</h3>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{service.description}</p>
              </div>

              {service.features?.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">What's Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                          <FiCheck size={14} />
                        </div>
                        <span className="text-gray-700 font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Packages Section */}
            {service.packages?.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-gray-900">Available Packages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.packages.map((pkg, i) => (
                    <div key={i} className={`bg-white rounded-[32px] p-8 shadow-sm border-2 transition-all hover:shadow-xl ${pkg.isPopular ? 'border-primary-400 scale-[1.02] z-10' : 'border-gray-100'}`}>
                      {pkg.isPopular && <span className="bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block">Best Seller</span>}
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
                      <p className="text-3xl font-bold text-primary-700 mb-4">{formatPrice(pkg.price)}</p>
                      <p className="text-gray-500 text-sm mb-6 h-12 line-clamp-2">{pkg.description}</p>
                      <ul className="space-y-3 mb-8">
                        {pkg.features?.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCheck className="text-green-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Link to={`/vendors/${service.vendor?._id}`} className="w-full btn-primary py-3 rounded-2xl block text-center font-bold">Select Package</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {service.vendor && (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 mt-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-800">Vendor Reviews</h3>
                  {isAuthenticated && (
                    <button onClick={() => setReviewModalOpen(true)} className="btn-primary py-2 px-6 text-xs !rounded-xl shadow-md hover:scale-105 transition-all">
                      Write Review
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">No reviews yet. Be the first to book and review!</p>
                    </div>
                  ) : (
                    reviews.map((rev, i) => (
                      <div key={rev._id} className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
                        {user?._id === rev.user?._id && (
                          <div className="absolute top-8 right-8 flex gap-3">
                            <button onClick={() => { setEditReviewData(rev); setReviewModalOpen(true); }} className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:text-blue-700">Edit</button>
                            <button onClick={() => handleDeleteReview(rev._id)} className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-700">Delete</button>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-50 to-pink-50 flex items-center justify-center font-black text-primary-700 text-lg shadow-inner border border-primary-100/50">{getInitials(rev.user?.name)}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900">{rev.user?.name}</p>
                                {rev.status !== 'approved' && user?._id === rev.user?._id && (
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                    rev.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {rev.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-medium">{formatDate(rev.createdAt)}</p>
                            </div>
                          </div>
                          <div className="mr-16">
                            <StarRating rating={rev.rating} size="sm" showCount={false} />
                          </div>
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed mt-2">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Vendor Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-28">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary-100 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                  {service.vendor?.images?.[0]?.url ? (
                    <img src={service.vendor.images[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🏪</div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{service.vendor?.businessName}</h3>
                <p className="text-gray-400 text-sm mt-1">{service.vendor?.location?.city}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Experience</span>
                  <span className="text-gray-900 font-bold">{service.vendor?.yearsOfExperience || 0}+ Years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Avg. Response</span>
                  <span className="text-gray-900 font-bold text-green-600">{service.vendor?.responseTime || 'Quick'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Rating</span>
                  <span className="text-gray-900 font-bold">{service.vendor?.rating?.average || 0}/5</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link to={`/vendors/${service.vendor?._id}`} className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-pink-100">
                  Book Now
                </Link>
                <Link to={`/vendors/${service.vendor?._id}`} className="w-full btn-outline py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                  View Business Profile
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Verified Professional</p>
                <div className="flex justify-center gap-2">
                  {['Trust', 'Quality', 'Vetted'].map(badge => (
                    <span key={badge} className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-green-100">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {service.vendor && (
        <ReviewModal 
          isOpen={reviewModalOpen}
          onClose={() => { setReviewModalOpen(false); setEditReviewData(null); }}
          targetId={service.vendor._id}
          targetType="vendor"
          existingReview={editReviewData}
          onSuccess={() => {
            loadReviews(service.vendor._id);
            // Optional: refresh service to get new average vendor rating
            api.get(`/services/${id}`).then(r => setService(r.data.service)).catch(() => {})
          }}
        />
      )}
    </div>
  )
}
