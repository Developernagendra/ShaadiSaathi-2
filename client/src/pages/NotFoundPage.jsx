import { Link } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-cream text-center px-4">
      <div className="flex flex-col items-center">
        <BrandLogo className="mb-8" />
        <span className="text-8xl block mb-4">💔</span>
        <h1 className="font-display text-6xl font-bold text-primary-700 mb-2">404</h1>
        <h2 className="font-display text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist. Let's get you back to planning your dream wedding!</p>
        <Link to="/" className="btn-primary">Go Back Home</Link>
      </div>
    </div>
  )
}
