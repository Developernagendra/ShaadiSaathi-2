import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);

        setStatus('success');

        // Trigger cross-tab sync so other tabs update their state instantly
        localStorage.setItem('force_auth_refresh', Date.now());

        // Refresh state locally in this tab and clear any stale data
        dispatch(logout());
        dispatch({ type: 'auth/clearError' });

        // Go back to login or dashboard. App.jsx will automatically route correctly if they are logged in
        setTimeout(() => {
          navigate('/login?verified=true');
        }, 2000);
      } catch (err) {
        setStatus('error');
        const errMsg = err.response?.data?.message || err?.message || 'Verification failed';
        setMessage(errMsg);
      }
    };

    if (token) {
      verify();
    }
  }, [token, dispatch, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Verifying Email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <span className="text-6xl">✅</span>
            <h2 className="font-display text-2xl font-bold text-green-700 mt-4">Email Verified!</h2>
            <p className="text-gray-500 mt-2">Email verified successfully. Please login.</p>
            <Link to="/login" className="btn-primary inline-block mt-6">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
              ❌
            </div>
            <h2 className="font-display text-2xl font-bold text-red-600 mt-4">Verification Failed</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <div className="flex flex-col gap-3 mt-8">
              <Link to="/resend-verification" className="btn-primary py-3">Resend Verification Link</Link>
              <Link to="/login" className="btn-outline py-3">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
