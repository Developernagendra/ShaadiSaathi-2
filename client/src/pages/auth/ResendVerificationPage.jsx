import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { resendVerification } from '../../store/slices/authSlice'
import { FiMail, FiArrowLeft } from 'react-icons/fi';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(resendVerification({ email }))
    if (!result.error) setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
            📧
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Resend Verification</h1>
          <p className="text-gray-500 mt-2">Enter your email to receive a new verification link</p>
        </div>

        {sent ? (
          <div className="text-center animate-fade-in">
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl mb-6">
              <p className="font-medium">Verification link sent!</p>
              <p className="text-sm mt-1">Please check your inbox (and spam folder).</p>
            </div>
            <Link to="/login" className="btn-primary w-full inline-block py-3">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-primary-200"
            >
              {loading ? 'Sending...' : 'Send Verification Link'}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <FiArrowLeft /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
