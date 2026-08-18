import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { FiHome, FiUser, FiCalendar, FiHeart, FiUsers, FiMail, FiBell, FiSettings, FiBriefcase, FiGrid, FiDollarSign, FiImage, FiStar, FiMessageSquare, FiPieChart, FiTag, FiBookOpen, FiActivity, FiCheckSquare, FiChevronDown, FiPlus, FiPackage, FiPhoneCall } from 'react-icons/fi';
import { FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'
import BrandLogo from '../common/BrandLogo'
import LanguageSwitcher from '../common/LanguageSwitcher'

export default function Sidebar({ closeSidebar, isCollapsed }) {
  const location = useLocation()
  const { user } = useSelector(s => s.auth || {})
  const role = user?.role
  const { t } = useTranslation?.() || { t: (key) => key };
  const [invitationOpen, setInvitationOpen] = useState(location.pathname.startsWith('/invitation-creator'))

  const userLinks = [
    { to: '/dashboard', label: t('userDashboard.dashboard', 'Dashboard'), icon: <FiHome /> },
    { to: '/profile', label: t('userDashboard.profile', 'My Profile'), icon: <FiUser /> },
    { to: '/bookings', label: t('userDashboard.myBookings', 'My Bookings'), icon: <FiCalendar /> },
    { to: '/wishlist', label: t('userDashboard.wishlist', 'Saved Vendors'), icon: <FiHeart /> },
    { to: '/guests', label: t('userDashboard.guests', 'Guests'), icon: <FiUsers /> },
    {
      to: '/invitation-creator',
      label: t('userDashboard.invitations', 'Invitations'),
      icon: <FiMail />,
      subLinks: [
        { to: '/invitation-creator', label: 'Dashboard', icon: <FiHome size={14} /> },
        { to: '/invitation-creator/new', label: 'Create New', icon: <FiPlus size={14} /> },
      ],
    },
    { to: '/notifications', label: t('userDashboard.notifications', 'Notifications'), icon: <FiBell /> },
    { to: '/settings', label: t('userDashboard.settings', 'Settings'), icon: <FiSettings /> },
  ]

  const vendorType = user?.vendorProfile?.vendorType || 'service'

  // Service Vendor Links
  const serviceVendorLinks = [
    { to: '/vendor/dashboard', label: t('vendorDashboard.dashboard', 'Dashboard'), icon: <FiHome /> },
    { to: '/vendor/leads', label: t('vendorDashboard.leads', 'Leads'), icon: <FiActivity /> },
    { to: '/vendor/bookings', label: t('vendorDashboard.bookings', 'Bookings'), icon: <FiCalendar /> },
    { to: '/vendor/services', label: t('vendorDashboard.myServices', 'Services'), icon: <FiGrid /> },
    { to: '/vendor/packages', label: t('vendorDashboard.packages', 'Packages'), icon: <FiTag /> },
    { to: '/vendor/portfolio-builder', label: t('vendorDashboard.portfolio', 'Portfolio'), icon: <FiImage /> },
    { to: '/vendor/gallery', label: t('vendorDashboard.gallery', 'Gallery'), icon: <FiImage /> },
    { to: '/vendor/real-weddings', label: t('vendorDashboard.realWeddings', 'Real Weddings'), icon: <FiHeart /> },
    { to: '/vendor/reviews', label: t('vendorDashboard.reviews', 'Reviews'), icon: <FiStar /> },
    { to: '/vendor/messages', label: t('vendorDashboard.messages', 'Messages'), icon: <FiMessageSquare /> },
    { to: '/vendor/analytics', label: t('vendorDashboard.analytics', 'Analytics'), icon: <FiPieChart /> },
    { to: '/vendor-subscription', label: t('vendorDashboard.subscription', 'Subscription Plan'), icon: <FiDollarSign /> },
    { to: '/vendor/earnings', label: t('vendorDashboard.earnings', 'Earnings'), icon: <FiDollarSign /> },
    { to: '/vendor/offers', label: t('vendorDashboard.offers', 'Offers'), icon: <FiHeart /> },
    { to: '/vendor/notifications', label: t('vendorDashboard.notifications', 'Notifications'), icon: <FiBell /> },
    { to: '/vendor/settings', label: t('vendorDashboard.settings', 'Settings'), icon: <FiSettings /> },
    { to: '/vendor/profile', label: t('vendorDashboard.profile', 'Profile'), icon: <FiUser /> },
  ]

  // Cab Vendor Links
  const cabVendorLinks = [
    { to: '/vendor/dashboard', label: t('vendorDashboard.dashboard', 'Dashboard'), icon: <FiHome /> },
    { to: '/vendor/leads', label: t('vendorDashboard.leads', 'Leads'), icon: <FiActivity /> },
    { to: '/vendor/bookings', label: t('vendorDashboard.bookings', 'Bookings'), icon: <FiCalendar /> },
    { to: '/vendor/manage-cabs', label: t('vendorDashboard.myFleet', 'Fleet Management'), icon: <FaTruck /> },
    { to: '/vendor/active-trips', label: t('vendorDashboard.activeTrips', 'Live Trips'), icon: <FaMapMarkerAlt /> },
    { to: '/vendor/reviews', label: t('vendorDashboard.reviews', 'Reviews'), icon: <FiStar /> },
    { to: '/vendor/messages', label: t('vendorDashboard.messages', 'Messages'), icon: <FiMessageSquare /> },
    { to: '/vendor/analytics', label: t('vendorDashboard.analytics', 'Analytics'), icon: <FiPieChart /> },
    { to: '/vendor-subscription', label: t('vendorDashboard.subscription', 'Subscription Plan'), icon: <FiDollarSign /> },
    { to: '/vendor/earnings', label: t('vendorDashboard.earnings', 'Earnings'), icon: <FiDollarSign /> },
    { to: '/vendor/notifications', label: t('vendorDashboard.notifications', 'Notifications'), icon: <FiBell /> },
    { to: '/vendor/settings', label: t('vendorDashboard.settings', 'Settings'), icon: <FiSettings /> },
    { to: '/vendor/profile', label: t('vendorDashboard.profile', 'Profile'), icon: <FiUser /> },
  ]

  const vendorLinks = vendorType === 'cab' ? cabVendorLinks : serviceVendorLinks

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: <FiHome /> },
    { to: '/admin/users', label: 'Manage Users', icon: <FiUsers /> },
    { to: '/admin/vendors', label: 'Manage Vendors', icon: <FiBriefcase /> },
    { to: '/admin/pending-approval', label: 'Pending Approvals', icon: <FiCheckSquare /> },
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: <FiDollarSign /> },
    { to: '/admin/service-moderation', label: 'Service Moderation', icon: <FiCheckSquare /> },
    { to: '/admin/real-weddings', label: 'Real Weddings', icon: <FiHeart /> },
    { to: '/admin/gallery', label: 'Gallery Moderation', icon: <FiImage /> },
    { to: '/admin/categories', label: 'Categories', icon: <FiTag /> },
    { to: '/admin/bookings', label: 'Bookings', icon: <FiCalendar /> },
    { to: '/admin/blogs', label: 'Blogs', icon: <FiBookOpen /> },
    { to: '/admin/leads', label: 'Leads', icon: <FiMessageSquare /> },
    { to: '/admin/packages', label: 'Wedding Packages', icon: <FiPackage /> },
    { to: '/admin/package-inquiries', label: 'Package Inquiries', icon: <FiMessageSquare /> },
    { to: '/admin/expert-consultations', label: 'Expert Consults', icon: <FiPhoneCall /> },
    { to: '/admin/imperial-fleet', label: 'Fleet Registry', icon: <FaTruck /> },
    { to: '/admin/reviews', label: 'Reviews', icon: <FiStar /> },
    { to: '/admin/testimonials', label: 'Testimonials', icon: <FiHeart /> },
    { to: '/admin/newsletter', label: 'Newsletter', icon: <FiMail /> },
    { to: '/admin/astrology', label: 'Astrology Tools', icon: <FiStar /> },
    { to: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
  ]

  const links = role === 'admin' ? adminLinks : role === 'vendor' ? vendorLinks : userLinks

  return (
    <aside className="w-full h-full overflow-y-auto scrollbar-hide pb-24 md:pb-6">
      <div className="p-4 space-y-2 flex flex-col h-full">
        <div className="mb-8 hidden md:block px-4 pt-4">
          {!isCollapsed ? (
            <div className="flex flex-col gap-4">
              <BrandLogo isDark={true} className="scale-90 origin-left" />
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] drop-shadow-md">{role === 'user' ? 'मेरी शादी' : role === 'vendor' ? 'मेरा Business' : 'ShaadiSaathi Admin'}</p>
              <div className="mt-2">
                 <LanguageSwitcher />
              </div>
            </div>
          ) : (
            <div className="flex justify-center -ml-2">
              <BrandLogo isDark={true} showTagline={false} className="scale-[0.6] origin-center -ml-4" />
            </div>
          )}
        </div>

        {links.map((link) => {
          const isHome = link.to === '/dashboard' || link.to === '/admin' || link.to === '/vendor/dashboard'
          const hasSubLinks = link.subLinks && link.subLinks.length > 0
          const isActive = isHome
            ? location.pathname === link.to
            : hasSubLinks
              ? location.pathname.startsWith(link.to)
              : location.pathname.startsWith(link.to)

          // For items with sub-links, render expandable section
          if (hasSubLinks) {
            const isExpanded = invitationOpen
            return (
              <div key={link.to}>
                <button
                  onClick={() => {
                    if (isCollapsed) {
                      closeSidebar && closeSidebar()
                    } else {
                      setInvitationOpen(!isExpanded)
                    }
                  }}
                  className={`w-full group flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-6'} min-h-[48px] py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative active:scale-[0.98] ${isActive
                    ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  title={isCollapsed ? link.label : ''}
                >
                  <span className={`text-[18px] transition-transform duration-300 ${isActive ? 'text-[#D4AF37] scale-110 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'group-hover:text-white group-hover:scale-110'}`}>
                    {link.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="whitespace-nowrap flex-1 text-left">
                        {link.label}
                      </span>
                      <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-0 text-[#D4AF37]' : '-rotate-90'}`}>
                        <FiChevronDown size={16} />
                      </span>
                    </>
                  )}
                </button>

                {/* Sub Links */}
                {isExpanded && !isCollapsed && (
                  <div className="ml-8 pl-4 border-l border-white/10 space-y-1 mt-2 mb-4">
                    {link.subLinks.map(sub => {
                      const subActive = location.pathname === sub.to
                      return (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={closeSidebar}
                          className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98] ${subActive
                            ? 'text-[#D4AF37] bg-white/5'
                            : 'text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          <span className={subActive ? 'text-[#D4AF37]' : 'text-white/40'}>{sub.icon}</span>
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeSidebar}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-6'} py-4 min-h-[48px] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative active:scale-[0.98] ${isActive
                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37]'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              title={isCollapsed ? link.label : ''}
            >
              <span className={`text-[18px] transition-transform duration-300 ${isActive ? 'text-[#D4AF37] scale-110 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'group-hover:text-white group-hover:scale-110'}`}>
                {link.icon}
              </span>
              {!isCollapsed && (
                <span className="whitespace-nowrap">
                  {link.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
