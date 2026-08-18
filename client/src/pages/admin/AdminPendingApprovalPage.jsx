import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatDateShort, formatPrice, getInitials } from '../../utils/helpers'
import {
  FiCheck, FiX, FiSearch, FiAlertCircle, FiEye, FiShield,
  FiFileText, FiUser, FiCheckCircle, FiAlertTriangle, FiMapPin,
  FiBriefcase, FiTag, FiClock, FiRefreshCw, FiArrowRight, FiCheckSquare,
  FiLayers, FiFilter
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPendingApprovalPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTabParam = searchParams.get('tab') || 'vendors'
  const [activeTab, setActiveTab] = useState(activeTabParam) // 'vendors' | 'services'

  // Vendors Data State
  const [vendors, setVendors] = useState([])
  const [vendorFilter, setVendorFilter] = useState('pending') // 'pending' | 'approved' | 'rejected' | 'all'
  const [vendorLoading, setVendorLoading] = useState(true)

  // Services Data State
  const [services, setServices] = useState([])
  const [serviceFilter, setServiceFilter] = useState('pending') // 'pending' | 'approved' | 'rejected' | 'all'
  const [serviceLoading, setServiceLoading] = useState(true)

  // Common Search
  const [searchTerm, setSearchTerm] = useState('')

  // Action / Audit Modal State
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [rejectionNote, setRejectionNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [targetForReject, setTargetForReject] = useState(null) // { type: 'vendor'|'service', item: object }

  // Sync activeTab with URL param
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // Load Vendors from Backend
  const loadVendors = useCallback(async () => {
    setVendorLoading(true)
    try {
      const res = await api.get('/admin/vendors')
      setVendors(res.data.vendors || [])
    } catch (err) {
      toast.error('Failed to load vendor applications.')
      setVendors([])
    } finally {
      setVendorLoading(false)
    }
  }, [])

  // Load Services from Backend
  const loadServices = useCallback(async () => {
    setServiceLoading(true)
    try {
      const res = await api.get('/admin/services')
      setServices(res.data.services || [])
    } catch (err) {
      toast.error('Failed to load service submissions.')
      setServices([])
    } finally {
      setServiceLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVendors()
    loadServices()
  }, [loadVendors, loadServices])

  // Approve Vendor Action
  const handleApproveVendor = async (vendor) => {
    if (!vendor?._id) return
    setActionLoading(true)
    try {
      await api.patch(`/admin/vendors/${vendor._id}/status`, {
        approvalStatus: 'approved',
        approvalNote: 'Approved by administrator'
      })
      toast.success(`${vendor.businessName || 'Vendor'} has been approved & is live! 🎉`)
      setVendors(prev => prev.map(v => v._id === vendor._id ? { ...v, approvalStatus: 'approved' } : v))
      if (selectedVendor?._id === vendor._id) setSelectedVendor(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve vendor.')
    } finally {
      setActionLoading(false)
    }
  }

  // Approve Service Action
  const handleApproveService = async (service) => {
    if (!service?._id) return
    setActionLoading(true)
    try {
      await api.patch(`/admin/services/${service._id}/approve`)
      toast.success(`Service "${service.title}" has been approved! 🚀`)
      setServices(prev => prev.map(s => s._id === service._id ? { ...s, status: 'approved' } : s))
      if (selectedService?._id === service._id) setSelectedService(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve service.')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Rejection Dialog
  const openRejectDialog = (item, type) => {
    setTargetForReject({ type, item })
    setRejectionNote('')
    setShowRejectModal(true)
  }

  // Submit Rejection
  const handleSubmitReject = async () => {
    if (!targetForReject) return
    setActionLoading(true)
    try {
      if (targetForReject.type === 'vendor') {
        const vendor = targetForReject.item
        await api.patch(`/admin/vendors/${vendor._id}/status`, {
          approvalStatus: 'rejected',
          approvalNote: rejectionNote || 'Documentation or requirements incomplete.'
        })
        toast.success(`Vendor ${vendor.businessName || ''} marked as rejected.`)
        setVendors(prev => prev.map(v => v._id === vendor._id ? { ...v, approvalStatus: 'rejected' } : v))
        if (selectedVendor?._id === vendor._id) setSelectedVendor(null)
      } else {
        const service = targetForReject.item
        await api.patch(`/admin/services/${service._id}/reject`, {
          notes: rejectionNote || 'Service guidelines need adjustment.'
        })
        toast.success(`Service "${service.title}" marked as rejected.`)
        setServices(prev => prev.map(s => s._id === service._id ? { ...s, status: 'rejected' } : s))
        if (selectedService?._id === service._id) setSelectedService(null)
      }
      setShowRejectModal(false)
      setTargetForReject(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject item.')
    } finally {
      setActionLoading(false)
    }
  }

  // Filtered Lists & Metrics
  const vendorCounts = useMemo(() => ({
    pending: vendors.filter(v => v.approvalStatus === 'pending').length,
    approved: vendors.filter(v => v.approvalStatus === 'approved').length,
    rejected: vendors.filter(v => v.approvalStatus === 'rejected').length,
    all: vendors.length
  }), [vendors])

  const serviceCounts = useMemo(() => ({
    pending: services.filter(s => s.status === 'pending').length,
    approved: services.filter(s => s.status === 'approved').length,
    rejected: services.filter(s => s.status === 'rejected').length,
    all: services.length
  }), [services])

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesFilter = vendorFilter === 'all' ? true : v.approvalStatus === vendorFilter
      const search = searchTerm.toLowerCase()
      const matchesSearch = !search ||
        v.businessName?.toLowerCase().includes(search) ||
        v.user?.name?.toLowerCase().includes(search) ||
        v.user?.email?.toLowerCase().includes(search) ||
        v.category?.name?.toLowerCase().includes(search) ||
        v.location?.city?.toLowerCase().includes(search)
      return matchesFilter && matchesSearch
    })
  }, [vendors, vendorFilter, searchTerm])

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesFilter = serviceFilter === 'all' ? true : s.status === serviceFilter
      const search = searchTerm.toLowerCase()
      const matchesSearch = !search ||
        s.title?.toLowerCase().includes(search) ||
        s.vendor?.businessName?.toLowerCase().includes(search) ||
        s.category?.name?.toLowerCase().includes(search)
      return matchesFilter && matchesSearch
    })
  }, [services, serviceFilter, searchTerm])

  const isLoading = activeTab === 'vendors' ? vendorLoading : serviceLoading

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* ── HEADER & TOP BARS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 uppercase tracking-wider">
              System Moderation
            </span>
            <span className="text-xs text-slate-400 font-bold">•</span>
            <span className="text-xs font-bold text-slate-500">
              Admin Governance Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pending Approvals & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Review vendor partner onboardings, identity documents, and service catalogs before they go live publicly.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => {
              loadVendors()
              loadServices()
              toast.success('Refreshing submissions...')
            }}
            aria-label="Refresh Data"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all"
          >
            <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/admin/vendors"
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-2xs transition-all"
          >
            All Vendors <FiArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700">Pending Review</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              ⏳
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {activeTab === 'vendors' ? vendorCounts.pending : serviceCounts.pending}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            Awaiting administrative audit
          </p>
        </div>

        {/* Approved Card */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Approved Live</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ✓
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {activeTab === 'vendors' ? vendorCounts.approved : serviceCounts.approved}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            Active in marketplace search
          </p>
        </div>

        {/* Rejected Card */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-700">Rejected</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              ✕
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {activeTab === 'vendors' ? vendorCounts.rejected : serviceCounts.rejected}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            Returned for revisions
          </p>
        </div>

        {/* Total Card */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800">Total Submissions</span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
              📊
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {activeTab === 'vendors' ? vendorCounts.all : serviceCounts.all}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            Across all verification statuses
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER WITH TABS ── */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
        
        {/* Navigation Tabs (Vendors vs Services) */}
        <div className="border-b border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl self-start">
            <button
              onClick={() => handleTabChange('vendors')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'vendors'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiBriefcase size={14} />
              Vendor Partners
              {vendorCounts.pending > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                  {vendorCounts.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('services')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'services'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiLayers size={14} />
              Service Catalog
              {serviceCounts.pending > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                  {serviceCounts.pending}
                </span>
              )}
            </button>
          </div>

          {/* Search and Sub-status Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[220px]">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={activeTab === 'vendors' ? "Search business, owner, city..." : "Search service, vendor..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5">
              {['pending', 'approved', 'rejected', 'all'].map(st => (
                <button
                  key={st}
                  onClick={() => activeTab === 'vendors' ? setVendorFilter(st) : setServiceFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    (activeTab === 'vendors' ? vendorFilter : serviceFilter) === st
                      ? 'bg-sky-600 text-white shadow-2xs font-black'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── TAB 1: VENDORS APPROVAL LIST ── */}
        {activeTab === 'vendors' && (
          <div>
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading vendor applications...</p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-100 text-emerald-600">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  All Caught Up!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  {vendorFilter === 'pending'
                    ? 'No vendor applications are currently waiting for approval.'
                    : `No vendors found matching "${vendorFilter}" status.`}
                </p>
                <button
                  onClick={() => setVendorFilter('all')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
                >
                  View All Vendors
                </button>
              </div>
            ) : (
              <div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Vendor / Business</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Owner Contact</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Submitted</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredVendors.map(vendor => (
                        <tr key={vendor._id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-amber-100 text-sky-800 flex items-center justify-center font-black text-sm shrink-0 border border-sky-200/60">
                                {getInitials(vendor.businessName)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">{vendor.businessName}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{vendor.user?.email || 'No email'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                              {vendor.category?.name || 'Wedding Service'}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-600">
                            <p className="font-bold text-slate-900">{vendor.user?.name || 'N/A'}</p>
                            <p className="text-[11px] text-slate-500">{vendor.phone || vendor.user?.phone || 'No phone'}</p>
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-600">
                            <span className="flex items-center gap-1">
                              <FiMapPin size={12} className="text-amber-500" />
                              {vendor.location?.city || 'Bihar'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {formatDateShort(vendor.createdAt)}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              vendor.approvalStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : vendor.approvalStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                vendor.approvalStatus === 'approved' ? 'bg-emerald-500' :
                                vendor.approvalStatus === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              {vendor.approvalStatus || 'pending'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedVendor(vendor)}
                                aria-label="View Vendor Details"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                                title="View Details"
                              >
                                <FiEye size={14} />
                              </button>

                              {vendor.approvalStatus !== 'approved' && (
                                <button
                                  onClick={() => handleApproveVendor(vendor)}
                                  disabled={actionLoading}
                                  aria-label="Approve Vendor"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}

                              {vendor.approvalStatus !== 'rejected' && (
                                <button
                                  onClick={() => openRejectDialog(vendor, 'vendor')}
                                  disabled={actionLoading}
                                  aria-label="Reject Vendor"
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards View */}
                <div className="md:hidden divide-y divide-slate-100 p-4 space-y-4">
                  {filteredVendors.map(vendor => (
                    <div key={vendor._id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{vendor.businessName}</p>
                          <p className="text-xs text-slate-500">{vendor.user?.name} • {vendor.category?.name || 'Service'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">📍 {vendor.location?.city || 'Bihar'} • {formatDateShort(vendor.createdAt)}</p>
                        </div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          vendor.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          vendor.approvalStatus === 'rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {vendor.approvalStatus || 'pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs"
                        >
                          View Details
                        </button>
                        {vendor.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => handleApproveVendor(vendor)}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {vendor.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => openRejectDialog(vendor, 'vendor')}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SERVICES APPROVAL LIST ── */}
        {activeTab === 'services' && (
          <div>
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading service submissions...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-100 text-emerald-600">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  All Caught Up!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  {serviceFilter === 'pending'
                    ? 'No service listings are currently waiting for approval.'
                    : `No services found matching "${serviceFilter}" status.`}
                </p>
                <button
                  onClick={() => setServiceFilter('all')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
                >
                  View All Services
                </button>
              </div>
            ) : (
              <div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Service Title</th>
                        <th className="px-6 py-4">Vendor Partner</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Starting Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredServices.map(service => (
                        <tr key={service._id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm">{service.title}</p>
                              {service.duration && (
                                <p className="text-[11px] text-slate-500 font-medium">⏱️ {service.duration}</p>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 font-bold text-slate-900">
                            {service.vendor?.businessName || 'Vendor'}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                              {service.category?.name || 'Wedding Service'}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-black text-slate-900">
                            {formatPrice(service.startingPrice || service.price || 0)}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              service.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : service.status === 'rejected'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                service.status === 'approved' ? 'bg-emerald-500' :
                                service.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              {service.status || 'pending'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/services/pending/${service._id}`}
                                aria-label="View Full Service Details"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                                title="Review Details"
                              >
                                <FiEye size={14} />
                              </Link>

                              {service.status !== 'approved' && (
                                <button
                                  onClick={() => handleApproveService(service)}
                                  disabled={actionLoading}
                                  aria-label="Approve Service"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}

                              {service.status !== 'rejected' && (
                                <button
                                  onClick={() => openRejectDialog(service, 'service')}
                                  disabled={actionLoading}
                                  aria-label="Reject Service"
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards View */}
                <div className="md:hidden divide-y divide-slate-100 p-4 space-y-4">
                  {filteredServices.map(service => (
                    <div key={service._id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{service.title}</p>
                          <p className="text-xs text-slate-500 font-medium">{service.vendor?.businessName} • {formatPrice(service.startingPrice || 0)}</p>
                        </div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          service.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          service.status === 'rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {service.status || 'pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Link
                          to={`/admin/services/pending/${service._id}`}
                          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center"
                        >
                          Review
                        </Link>
                        {service.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveService(service)}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {service.status !== 'rejected' && (
                          <button
                            onClick={() => openRejectDialog(service, 'service')}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL 1: VENDOR QUICK DETAILS AUDIT DRAWER ── */}
      <AnimatePresence>
        {selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                    Vendor Partner Audit
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {selectedVendor.businessName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Owner: {selectedVendor.user?.name} ({selectedVendor.user?.email})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Vendor Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Category</p>
                  <p className="font-extrabold text-slate-900">{selectedVendor.category?.name || 'Wedding Service'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Location</p>
                  <p className="font-extrabold text-slate-900">{selectedVendor.location?.city || 'Bihar'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Phone</p>
                  <p className="font-extrabold text-slate-900">{selectedVendor.phone || selectedVendor.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Approval Status</p>
                  <p className="font-extrabold capitalize text-slate-900">{selectedVendor.approvalStatus || 'pending'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Submitted On</p>
                  <p className="font-extrabold text-slate-900">{formatDateShort(selectedVendor.createdAt)}</p>
                </div>
              </div>

              {/* Verification Documents */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  KYC & Verification Documents:
                </h4>
                {selectedVendor.verificationDocuments && selectedVendor.verificationDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedVendor.verificationDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
                        <span className="flex items-center gap-2">
                          <FiFileText className="text-sky-600" />
                          {doc.documentType || `Document #${idx + 1}`}
                        </span>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline"
                          >
                            View Document →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    No uploaded KYC files attached. Basic self-registration.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => openRejectDialog(selectedVendor, 'vendor')}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs uppercase tracking-wider"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => handleApproveVendor(selectedVendor)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-xs"
                >
                  Approve Vendor Partner
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: REJECTION REASON DIALOG ── */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FiAlertTriangle className="text-rose-600" />
                  Confirm Rejection
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <FiX size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Please specify the reason for rejecting {targetForReject?.type === 'vendor' ? 'this vendor' : 'this service listing'}. This feedback will be sent to the partner.
              </p>

              <textarea
                value={rejectionNote}
                onChange={e => setRejectionNote(e.target.value)}
                placeholder="e.g. Missing required identity proof, pricing unrealistic, incomplete description..."
                rows={4}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500 resize-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReject}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
