import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi';
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function ReviewModal({ isOpen, onClose, targetId, targetType, existingReview, onSuccess, availableBookings }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [selectedBooking, setSelectedBooking] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setComment(existingReview.comment)
      setSelectedBooking(existingReview.booking || '')
    } else {
      setRating(5)
      setComment('')
      if (availableBookings && availableBookings.length > 0) {
        setSelectedBooking(availableBookings[0]._id)
      } else {
        setSelectedBooking('')
      }
    }
  }, [existingReview, availableBookings, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return toast.error('Please write a review.')

    setLoading(true)
    try {
      const payload = {
        rating,
        comment,
        [targetType === 'vendor' ? 'vendorId' : 'cabId']: targetId,
      }

      if (existingReview) {
        await api.put(`/reviews/${existingReview._id}`, payload)
        toast.success('Review updated successfully!')
      } else {
        await api.post('/reviews', payload)
        toast.success('Review submitted successfully!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-lg relative z-10 p-6 sm:p-8 shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full transition-all">
              <FiX size={20} />
            </button>

            <h3 className="text-2xl font-display font-black text-gray-900 mb-6">
              {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-[#D4AF37]' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Experience</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell others about your experience..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[120px] font-medium outline-none focus:border-primary-500"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
