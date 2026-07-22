import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated, token, isInitialized, loading } = useSelector((s) => s.auth)
  const location = useLocation()

  // Still loading initial auth state
  if (token && !isInitialized) {
    return <LoadingScreen />
  }

  // Not authenticated
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check - wait until user is loaded
  if (roles.length > 0) {
    if (loading || !user) return <LoadingScreen />
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
