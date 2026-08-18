import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import { FiMenu, FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi';
import ErrorBoundary from '../common/ErrorBoundary'
import { useNotificationSound } from '../../context/NotificationSoundContext'
import { getInitials } from '../../utils/helpers'
import BrandLogo from '../common/BrandLogo'
import VendorBottomNav from '../vendor/VendorBottomNav'

export default function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isMuted, toggleMute } = useNotificationSound()
  const { user } = useSelector(s => s.auth || {})
  const location = useLocation()

  const getPageTitle = (path) => {
    if (path.includes('/vendor/dashboard')) return 'Dashboard Overview'
    if (path.includes('/vendor/leads')) return 'Lead Marketplace'
    if (path.includes('/vendor/bookings')) return 'Customer Reservations'
    if (path.includes('/vendor/services')) return 'Manage Services'
    if (path.includes('/vendor/packages')) return 'Pricing & Packages'
    if (path.includes('/vendor/portfolio')) return 'Portfolio Builder'
    if (path.includes('/vendor/profile')) return 'Business Profile'
    if (path.includes('/vendor/manage-cabs')) return 'Fleet Registry'
    if (path.includes('/vendor/earnings')) return 'Earning Ledger'

    if (path.includes('/admin/users')) return 'User Registry'
    if (path.includes('/admin/vendors')) return 'Partner Management'
    if (path.includes('/admin/vendor-approvals') || path.includes('/admin/pending-approval') || path.includes('/admin/services/pending')) return 'Pending Approvals & Verification'
    if (path.includes('/admin/service-moderation') || path.includes('/admin/services-approval')) return 'Service Moderation'
    if (path.includes('/admin/categories')) return 'Platform Categories'
    if (path.includes('/admin/bookings')) return 'Platform Bookings'
    if (path.includes('/admin/imperial-fleet')) return 'Imperial Fleet'
    if (path.includes('/admin/newsletter')) return 'Newsletter Campaigns'
    if (path.includes('/admin/settings')) return 'System Settings'
    if (path.includes('/admin')) return 'Global Overview'

    if (path.includes('/dashboard')) return 'Planning Hub'
    if (path.includes('/profile')) return 'Personal Profile'
    if (path.includes('/bookings')) return 'My Reservations'
    if (path.includes('/wishlist')) return 'Wishlisted Partners'
    if (path.includes('/guests')) return 'Guest Coordinator'
    if (path.includes('/invitation-creator')) return 'Digital Invitation Studio'
    if (path.includes('/settings')) return 'Account Settings'
    return 'Dashboard'
  }

  const roleLabels = {
    admin: 'System Admin',
    vendor: 'Partner',
    user: 'Couple'
  }

  // Body scroll lock on mobile when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('mobile-drawer-open');
    } else {
      document.body.classList.remove('mobile-drawer-open');
    }
    return () => document.body.classList.remove('mobile-drawer-open');
  }, [isSidebarOpen]);

  return (
    <div className="flex bg-[#FAFAFA] min-h-screen font-sans">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-[120] bg-gray-950/95 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.5)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform pt-safe pb-safe md:pt-0 md:pb-0
        w-[85vw] max-w-[320px] md:max-w-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-24' : 'md:w-72'}
      `}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} isCollapsed={isCollapsed} />

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-5 top-12 w-10 h-10 bg-gray-900 border border-white/20 shadow-2xl rounded-full items-center justify-center text-gray-400 hover:text-white hover:border-[#D4AF37] hover:scale-110 transition-all z-50"
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Main Container viewport */}
      <div className={`flex-grow flex flex-col min-h-screen overflow-hidden transition-[margin-left] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isCollapsed ? 'md:ml-24' : 'md:ml-72'}`}>

        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-30 h-16 md:h-20 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 md:px-10 flex-shrink-0 pt-safe">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl active:scale-95 transition-all flex-shrink-0"
            >
              <FiMenu size={24} />
            </button>
            <div className="md:hidden flex-shrink-0 origin-left transform scale-[0.7]">
              <BrandLogo showTagline={false} asLink={false} />
            </div>
            <div className="hidden md:block">
              <h2 className="font-display text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
                {getPageTitle(location.pathname)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition-all"
              title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
            >
              {isMuted ? <FiVolumeX size={18} className="text-red-400" /> : <FiVolume2 size={18} className="text-[#C2185B]" />}
            </button>

            {/* Profile Dropdown / Widget */}
            <div className="flex items-center pl-2 md:pl-4 border-l border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F0] border border-[#D4AF37]/20 p-0.5 flex items-center justify-center shadow-inner flex-shrink-0">
                <div className="w-full h-full rounded-[10px] overflow-hidden bg-gray-900 flex items-center justify-center">
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} className="w-full h-full object-cover" alt={user.name} />
                  ) : (
                    <span className="text-xs font-bold text-[#D4AF37]">{getInitials(user?.name)}</span>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-start text-left ml-3">
                <span className="text-xs font-bold text-gray-900 leading-none mb-1 max-w-[120px] truncate">{user?.name}</span>
                <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-wider">{roleLabels[user?.role] || 'Couple'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Content Area */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10 bg-[#FAFAFA] relative ${user?.role === 'vendor' ? 'pb-24 md:pb-10' : ''}`}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Vendor Mobile Bottom Navigation */}
      <VendorBottomNav />
    </div>
  )
}

