import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { removeFromCart, clearCart } from '../../store/slices/uiSlice'
import { formatPrice } from '../../utils/helpers'
import EmptyState from '../../components/common/EmptyState'
import { FiTrash2 } from 'react-icons/fi';

export default function CartPage() {
  const dispatch = useDispatch()
  const { cartItems } = useSelector(s => s.ui)

  const total = cartItems.reduce((sum, item) => sum + (item.basePrice || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">My Cart</h1>
        {cartItems.length === 0 ? (
          <EmptyState icon="🛒" title="Your Cart is Empty" message="Add vendors to your cart to proceed with booking." actionLabel="Browse Services" actionTo="/services" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-100 flex-shrink-0">
                    {item.images?.[0]?.url ? <img src={item.images[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🏛️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.businessName}</p>
                    <p className="text-sm text-gray-400">{item.category?.name}</p>
                    <p className="font-bold text-primary-700 mt-1">{formatPrice(item.basePrice)}</p>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item._id))} className="text-red-400 hover:text-red-600 p-2">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
              <h3 className="font-display font-bold text-lg text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-gray-600">
                    <span className="truncate flex-1 mr-2">{item.businessName}</span>
                    <span className="font-medium">{formatPrice(item.basePrice)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-700">{formatPrice(total)}</span>
                </div>
              </div>
              <Link to={`/book-service/${cartItems[0]?._id}`} className="btn-primary w-full mt-5 text-center block">
                Proceed to Booking
              </Link>
              <button onClick={() => dispatch(clearCart())} className="w-full mt-3 text-sm text-red-500 hover:underline">
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
