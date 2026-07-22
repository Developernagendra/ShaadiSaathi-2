import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

export default function StarRating({ rating = 0, count, size = 'sm', showCount = true }) {
  const sizes = { sm: 14, md: 18, lg: 22 }
  const px = sizes[size] || 14

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          if (rating >= star) return <FaStar key={star} size={px} className="text-gold-400" />
          if (rating >= star - 0.5) return <FaStarHalfAlt key={star} size={px} className="text-gold-400" />
          return <FiStar key={star} size={px} className="text-gray-300" />
        })}
      </div>
      {showCount && (
        <span className={`font-semibold text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {Number(rating).toFixed(1)}
          {count !== undefined && <span className="text-gray-400 font-normal ml-0.5">({count})</span>}
        </span>
      )}
    </div>
  )
}
