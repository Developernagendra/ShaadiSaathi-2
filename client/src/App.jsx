import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMe, setInitialized } from './store/slices/authSlice'
import { initSocket, disconnectSocket } from './utils/socket'
import { fetchCategories } from './store/slices/vendorSlice'
import { useTranslation } from 'react-i18next'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'
import ScrollToTop from './components/common/ScrollToTop'
import LoadingScreen from './components/common/LoadingScreen'
import BaraatCabsSkeleton from './components/common/BaraatCabsSkeleton'
import FloatingWhatsApp from './components/common/FloatingWhatsApp'
import SocketListener from './components/common/SocketListener'
import AuthSoundListener from './components/common/AuthSoundListener'
import ErrorBoundary from './components/common/ErrorBoundary'
import WhatsAppRedirectHandler from './components/common/WhatsAppRedirectHandler'
import { NotificationSoundProvider } from './context/NotificationSoundContext'
import MobileBottomNav from './components/layout/MobileBottomNav'
const BaraatCabsPage = lazy(() => import('./pages/BaraatCabsPage'))
const CabDetailPage = lazy(() => import('./pages/CabDetailPage'))
const VendorManageCabsPage = lazy(() => import('./pages/vendor/VendorManageCabsPage'))
const VendorActiveTripsPage = lazy(() => import('./pages/vendor/VendorActiveTripsPage'))
const BundleDetailPage = lazy(() => import('./pages/BundleDetailPage'))
const CustomBundleBuilderPage = lazy(() => import('./pages/CustomBundleBuilderPage'))
const CustomPackageBuilderPage = lazy(() => import('./pages/CustomPackageBuilderPage'))

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const VendorDetailPage = lazy(() => import('./pages/VendorDetailPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const VendorSupportPage = lazy(() => import('./pages/VendorSupportPage'))
const BookingHelpPage = lazy(() => import('./pages/BookingHelpPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'))
const CancellationPolicyPage = lazy(() => import('./pages/CancellationPolicyPage'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const RealWeddingsPage = lazy(() => import('./pages/RealWeddingsPage'))
const RealWeddingDetailsPage = lazy(() => import('./pages/RealWeddingDetailsPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterSelectionPage = lazy(() => import('./pages/auth/RegisterSelectionPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const VendorRegisterPage = lazy(() => import('./pages/auth/VendorRegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const ResendVerificationPage = lazy(() => import('./pages/auth/ResendVerificationPage'))

// User Pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'))
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'))
const BookingsPage = lazy(() => import('./pages/user/BookingsPage'))
const BookingDetailPage = lazy(() => import('./pages/user/BookingDetailPage'))
const CabBookingDetailPage = lazy(() => import('./pages/user/CabBookingDetailPage'))
const WishlistPage = lazy(() => import('./pages/user/WishlistPage'))
const ChatPage = lazy(() => import('./pages/user/ChatPage'))
const CartPage = lazy(() => import('./pages/user/CartPage'))
const BookService = lazy(() => import('./pages/user/CheckoutPage'))
const BookCab = lazy(() => import('./pages/CabBookingPage'))

// Vendor Pages
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'))
const VendorProfilePage = lazy(() => import('./pages/vendor/VendorProfilePage'))
const VendorServicesPage = lazy(() => import('./pages/vendor/VendorServicesPage'))
const VendorBookingsPage = lazy(() => import('./pages/vendor/VendorBookingsPage'))
const VendorEarningsPage = lazy(() => import('./pages/vendor/VendorEarningsPage'))
const VendorBlogsPage = lazy(() => import('./pages/vendor/VendorBlogsPage'))
const VendorPortfolioBuilder = lazy(() => import('./pages/vendor/VendorPortfolioBuilder'))
const VendorLeadsPage = lazy(() => import('./pages/vendor/VendorLeadsPage'))
const VendorAnalyticsPage = lazy(() => import('./pages/vendor/VendorAnalyticsPage'))
const VendorOffersPage = lazy(() => import('./pages/vendor/VendorOffersPage'))
const VendorMessagesPage = lazy(() => import('./pages/vendor/VendorMessagesPage'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminVendorsPage = lazy(() => import('./pages/admin/AdminVendorsPage'))
const AdminServicesApprovalPage = lazy(() => import('./pages/admin/AdminServicesApprovalPage'))
const ServiceApprovalDetails = lazy(() => import('./pages/admin/ServiceApprovalDetails'))
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'))
const AdminBookingDetailPage = lazy(() => import('./pages/admin/AdminBookingDetailPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage'))

// Special Pages
const CabBookingPage = lazy(() => import('./pages/CabBookingPage'))
const AIPlannerPage = lazy(() => import('./pages/AIPlannerPage'))
const BudgetCalculatorPage = lazy(() => import('./pages/BudgetCalculatorPage'))
const ToolsHubPage = lazy(() => import('./pages/tools/ToolsHubPage'))
const VendorAvailabilityCheckerPage = lazy(() => import('./pages/tools/VendorAvailabilityCheckerPage'))
const VendorComparePage = lazy(() => import('./pages/tools/VendorComparePage'))
const BaraatCalculatorPage = lazy(() => import('./pages/tools/BaraatCalculatorPage'))
const CostPredictorPage = lazy(() => import('./pages/tools/CostPredictorPage'))
const KundliMatchingPage = lazy(() => import('./pages/tools/KundliMatchingPage'))
const MuhuratFinderPage = lazy(() => import('./pages/tools/MuhuratFinderPage'))
const GuestManagementPage = lazy(() => import('./pages/GuestManagementPage'))
const ChecklistPage = lazy(() => import('./pages/ChecklistPage'))
const MyInvitationsPage = lazy(() => import('./pages/invitation/MyInvitationsPage'))
const SimpleInvitationBuilder = lazy(() => import('./pages/invitation/SimpleInvitationBuilder'))
const PublicInvitationPage = lazy(() => import('./pages/invitation/PublicInvitationPage'))
const LeadMarketplacePage = lazy(() => import('./pages/LeadMarketplacePage'))
const VendorSubscriptionPage = lazy(() => import('./pages/VendorSubscriptionPage'))
const PackagesPage = lazy(() => import('./pages/PackagesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Wedding Planner Pages
const BihariPlannerPage = lazy(() => import('./pages/weddings/BihariPlannerPage'))
const PlannerDashboard = lazy(() => import('./pages/weddings/PlannerDashboard'))

const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'))

// User Sub-Pages
const NotificationsPage = lazy(() => import('./pages/user/NotificationsPage'))
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'))
const MyAstrologyReportsPage = lazy(() => import('./pages/user/MyAstrologyReportsPage'))

// Vendor Sub-Pages
const VendorPackagesPage = lazy(() => import('./pages/vendor/VendorPackagesPage'))
const VendorGalleryPage = lazy(() => import('./pages/vendor/VendorGalleryPage'))
const VendorRealWeddingsPage = lazy(() => import('./pages/vendor/VendorRealWeddingsPage'))
const VendorCalendarPage = lazy(() => import('./pages/vendor/VendorCalendarPage'))
const VendorReviewsPage = lazy(() => import('./pages/vendor/VendorReviewsPage'))
const VendorNotificationsPage = lazy(() => import('./pages/vendor/VendorNotificationsPage'))
const VendorSettingsPage = lazy(() => import('./pages/vendor/VendorSettingsPage'))

// Admin Sub-Pages
// Deleted duplicate AdminApprovalsPage
const AdminBlogsPage = lazy(() => import('./pages/admin/AdminBlogsPage'))
const AdminLeadsPage = lazy(() => import('./pages/admin/AdminLeadsPage'))
const AdminManageCabsPage = lazy(() => import('./pages/admin/AdminManageCabsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminRealWeddingsPage = lazy(() => import('./pages/admin/AdminRealWeddingsPage'))
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'))
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/AdminSubscriptionsPage'))
const AdminNewsletterPage = lazy(() => import('./pages/admin/AdminNewsletterPage'))
const AdminPackagesPage = lazy(() => import('./pages/admin/AdminPackagesPage'))
const AdminPackageInquiriesPage = lazy(() => import('./pages/admin/AdminPackageInquiriesPage'))
const AdminExpertConsultationsPage = lazy(() => import('./pages/admin/AdminExpertConsultationsPage'))
const AdminAstrologyPage = lazy(() => import('./pages/admin/AdminAstrologyPage'))

export default function App() {
  const dispatch = useDispatch()
  const { token, user, isInitialized } = useSelector((state) => state.auth || {})
  const { categories = [] } = useSelector((state) => state.vendor || {})
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language || 'en'
    document.documentElement.dir = i18n.dir(i18n.language) || 'ltr'

    // Dynamically update hreflang tag for SEO
    let link = document.querySelector('link[rel="alternate"][hreflang]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'alternate';
      document.head.appendChild(link);
    }
    link.hreflang = i18n.language;
    link.href = window.location.href;

  }, [i18n, i18n.language])

  // Listen for unauthorized events from api.js to dispatch logout cleanly
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch({ type: 'auth/logout' });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [dispatch]);

  // Cross-Tab State Sync (Point 15)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          dispatch(getMe()) // Tab 2 logged in
        } else {
          dispatch({ type: 'auth/logout' }) // Tab 2 logged out
        }
      }
      if (e.key === 'force_auth_refresh') {
        if (token) dispatch(getMe()) // Tab 2 verified email or got approved
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [dispatch, token])

  useEffect(() => {
    dispatch(fetchCategories())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    if (token) {
      dispatch(getMe())
    } else {
      dispatch(setInitialized())
    }
  }, [dispatch, token])

  useEffect(() => {
    if (user?._id) {
      initSocket(user)
    }
    return () => {
      disconnectSocket()
    }
  }, [user])

  return (
    <ErrorBoundary>
      <NotificationSoundProvider>
        <Suspense fallback={<LoadingScreen />}>
          <ScrollToTop />
          <SocketListener />
          <AuthSoundListener />
          <WhatsAppRedirectHandler />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-24 md:pb-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/tools" element={<ToolsHubPage />} />
                <Route path="/tools/ai-planner" element={<AIPlannerPage />} />
                <Route path="/tools/budget-planner" element={<BudgetCalculatorPage />} />
                <Route path="/tools/guest-manager" element={<GuestManagementPage />} />
                <Route path="/tools/checklist" element={<ChecklistPage />} />
                <Route path="/tools/vendor-availability" element={<VendorAvailabilityCheckerPage />} />
                <Route path="/tools/package-builder" element={<CustomPackageBuilderPage />} />
                <Route path="/tools/invitation-generator" element={<SimpleInvitationBuilder />} />
                <Route path="/tools/vendor-compare" element={<VendorComparePage />} />
                <Route path="/tools/baraat-calculator" element={<BaraatCalculatorPage />} />
                <Route path="/tools/cost-predictor" element={<CostPredictorPage />} />
                <Route path="/tools/kundli-matching" element={<KundliMatchingPage />} />
                <Route path="/tools/muhurat-finder" element={<MuhuratFinderPage />} />
                <Route path="/tools/mithila-planner" element={<BihariPlannerPage />} />
                {/* Baraat Cabs Routes — use skeleton fallback, NOT global LoadingScreen */}
                <Route path="/baraat-cabs" element={
                  <Suspense fallback={<BaraatCabsSkeleton />}>
                    <BaraatCabsPage />
                  </Suspense>
                } />
                <Route path="/baraat-cabs/details/:id" element={
                  <Suspense fallback={<BaraatCabsSkeleton />}>
                    <CabDetailPage />
                  </Suspense>
                } />
                <Route path="/baraat-cabs/book" element={
                  <Suspense fallback={<BaraatCabsSkeleton />}>
                    <CabBookingPage />
                  </Suspense>
                } />
                <Route path="/baraat-cabs/bundle/:bundleId" element={
                  <Suspense fallback={<BaraatCabsSkeleton />}>
                    <BundleDetailPage />
                  </Suspense>
                } />
                <Route path="/baraat-cabs/custom-bundle" element={
                  <Suspense fallback={<BaraatCabsSkeleton />}>
                    <CustomBundleBuilderPage />
                  </Suspense>
                } />
                <Route path="/build-package" element={
                  <Suspense fallback={<LoadingScreen />}>
                    <CustomPackageBuilderPage />
                  </Suspense>
                } />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/real-weddings" element={<RealWeddingsPage />} />
                <Route path="/real-weddings/:id" element={<RealWeddingDetailsPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/services/:categorySlug" element={<ServicesPage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/vendors" element={<ServicesPage />} />
                <Route path="/vendors/:id" element={<VendorDetailPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/cab-booking" element={
                  <Suspense fallback={<BaraatCabsSkeleton />}>
                    <CabBookingPage />
                  </Suspense>
                } />

                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/vendor-support" element={<VendorSupportPage />} />
                <Route path="/booking-help" element={<BookingHelpPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/about" element={<Navigate to="/about-us" replace />} />
                <Route path="/our-story" element={<Navigate to="/about-us" replace />} />
                <Route path="/reviews" element={<Navigate to="/testimonials" replace />} />

                {/* Public Invitation Route */}
                <Route path="/invitation/:id" element={<PublicInvitationPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <RegisterSelectionPage /> : <Navigate to="/" />} />
                <Route path="/register/user" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
                <Route path="/register/vendor" element={!user ? <VendorRegisterPage /> : <Navigate to="/" />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="/resend-verification" element={<ResendVerificationPage />} />

                {/* User Dashboard Routes */}
                <Route element={<ProtectedRoute roles={['user']}><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/dashboard/my-bookings" element={<BookingsPage />} />
                  <Route path="/bookings/:id" element={<BookingDetailPage />} />
                  <Route path="/cab-booking/:id" element={<CabBookingDetailPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/guests" element={<GuestManagementPage />} />
                  <Route path="/checklist" element={<ChecklistPage />} />
                  <Route path="/invitation-creator" element={<MyInvitationsPage />} />
                  <Route path="/invitation-creator/new" element={<SimpleInvitationBuilder />} />
                  <Route path="/invitation-creator/edit/:id" element={<SimpleInvitationBuilder />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/leads" element={<LeadMarketplacePage />} />
                  <Route path="/astrology-reports" element={<MyAstrologyReportsPage />} />
                  <Route path="/user/wedding-dashboard" element={<PlannerDashboard />} />
                </Route>

                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/book-service/:id" element={<ProtectedRoute><BookService /></ProtectedRoute>} />
                <Route path="/book-vendor/:id" element={<ProtectedRoute><BookService /></ProtectedRoute>} />
                <Route path="/book-cab/:id" element={<ProtectedRoute><BookCab /></ProtectedRoute>} />

                {/* Vendor Dashboard Routes */}
                <Route element={<ProtectedRoute roles={['vendor']}><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                  <Route path="/vendor/profile" element={<VendorProfilePage />} />
                  <Route path="/vendor/services" element={<VendorServicesPage />} />
                  <Route path="/vendor/packages" element={<VendorPackagesPage />} />
                  <Route path="/vendor/gallery" element={<VendorGalleryPage />} />
                  <Route path="/vendor/real-weddings" element={<VendorRealWeddingsPage />} />
                  <Route path="/vendor/portfolio-builder" element={<VendorPortfolioBuilder />} />
                  <Route path="/vendor/bookings" element={<VendorBookingsPage />} />
                  <Route path="/vendor/bookings/:id" element={<BookingDetailPage />} />
                  <Route path="/vendor/dashboard/customer-bookings" element={<VendorBookingsPage />} />
                  <Route path="/vendor/calendar" element={<VendorCalendarPage />} />
                  <Route path="/vendor/earnings" element={<VendorEarningsPage />} />
                  <Route path="/vendor/blogs" element={<VendorBlogsPage />} />
                  <Route path="/vendor/reviews" element={<VendorReviewsPage />} />
                  <Route path="/vendor/notifications" element={<VendorNotificationsPage />} />
                  <Route path="/vendor/settings" element={<VendorSettingsPage />} />
                  {/* Vendor Cab Fleet */}
                  <Route path="/vendor/manage-cabs" element={<VendorManageCabsPage />} />
                  <Route path="/vendor/active-trips" element={<VendorActiveTripsPage />} />
                  <Route path="/vendor/leads" element={<VendorLeadsPage />} />
                  <Route path="/vendor/analytics" element={<VendorAnalyticsPage />} />
                  <Route path="/vendor/offers" element={<VendorOffersPage />} />
                  <Route path="/vendor/messages" element={<VendorMessagesPage />} />

                  <Route path="/vendor-subscription" element={<VendorSubscriptionPage />} />
                </Route>

                {/* Admin Dashboard Routes */}
                <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/vendors" element={<AdminVendorsPage />} />
                  <Route path="/admin/vendor-approvals" element={<AdminVendorsPage defaultTab="pending" title="Review Approvals" />} />
                  <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
                  <Route path="/admin/service-moderation" element={<AdminServicesApprovalPage />} />
                  <Route path="/admin/services/pending/:id" element={<ServiceApprovalDetails />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                  <Route path="/admin/bookings/:id" element={<AdminBookingDetailPage />} />
                  <Route path="/admin/blogs" element={<AdminBlogsPage />} />
                  <Route path="/admin/testimonials" element={<AdminTestimonialsPage />} />
                  <Route path="/admin/leads" element={<AdminLeadsPage />} />
                  <Route path="/admin/imperial-fleet" element={<AdminManageCabsPage />} />
                  <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                  <Route path="/admin/real-weddings" element={<AdminRealWeddingsPage />} />
                  <Route path="/admin/gallery" element={<AdminGalleryPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  <Route path="/admin/newsletter" element={<AdminNewsletterPage />} />
                  <Route path="/admin/packages" element={<AdminPackagesPage />} />
                  <Route path="/admin/package-inquiries" element={<AdminPackageInquiriesPage />} />
                  <Route path="/admin/expert-consultations" element={<AdminExpertConsultationsPage />} />
                  <Route path="/admin/astrology" element={<AdminAstrologyPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <FloatingWhatsApp />
            <MobileBottomNav />
          </div>
        </Suspense>
      </NotificationSoundProvider>
    </ErrorBoundary>
  )
}

