import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import VendorCard from '../../components/vendor/VendorCard'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'

export default function WishlistPage() {
  const { user } = useSelector(s => s.auth)
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/wishlist')
      .then(r => setWishlist(r.data.wishlist || []))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <h1 className="font-display text-4xl md:text-5xl font-black mb-4 tracking-tight">
              My <span className="text-primary-400">Wishlist</span> ❤️
            </h1>
            <p className="text-gray-300 text-lg font-medium">You have saved {wishlist.length} premium vendor{wishlist.length !== 1 ? 's' : ''} to your collection.</p>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : wishlist.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your Wishlist is Empty"
            message="Save your favourite vendors to compare and book later."
            actionLabel="Browse Vendors"
            actionTo="/services"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(vendor => vendor && (
              <VendorCard key={vendor._id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
