import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatPrice, formatDateShort } from '../../utils/helpers'
import { FiAlertTriangle, FiActivity, FiZap } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast'

export default function AdminSubscriptionsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'expired'
  
  // Upgrade/Renew modal state
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [targetPlan, setTargetPlan] = useState('premium')
  const [submitting, setSubmitting] = useState(false)

  const fetchSubscriptions = () => {
    setLoading(true)
    api.get('/admin/subscriptions')
      .then(res => {
        setVendors(res.data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast.error('Failed to load subscriptions data')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleAction = async (vendorId, action, plan = null) => {
    setSubmitting(true)
    try {
      const res = await api.patch(`/admin/vendors/${vendorId}/subscription`, {
        action,
        plan
      })
      toast.success(res.data.message || 'Subscription updated successfully!')
      setSelectedVendor(null)
      fetchSubscriptions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subscription')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter vendors based on status
  const filteredVendors = vendors.filter(v => {
    const isPlanActive = v.subscription?.status === 'active' && v.subscription?.plan !== 'free';
    if (activeTab === 'active') {
      return isPlanActive;
    } else {
      // Free, Expired, or Suspended
      return !isPlanActive;
    }
  })

  // Summary counts
  const totalActive = vendors.filter(v => v.subscription?.status === 'active' && v.subscription?.plan !== 'free').length
  const eliteCount = vendors.filter(v => v.subscription?.status === 'active' && v.subscription?.plan === 'elite').length
  const premiumCount = vendors.filter(v => v.subscription?.status === 'active' && v.subscription?.plan === 'premium').length
  const expiredCount = vendors.filter(v => v.subscription?.status === 'expired' || v.subscription?.status === 'suspended').length

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 shadow-sm border border-white flex-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50" />
          
          <div className="relative z-10">
            <div className="divider-luxe !justify-start mb-3 !gap-3">
              <div className="divider-line !bg-gradient-to-r !from-[#C2185B] !to-[#8E244D] !w-12" />
              <span className="text-[#C2185B] text-[10px] font-black uppercase tracking-[0.5em] italic">System Registry</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm">Subscription Management</h1>
            <p className="text-gray-500 font-medium italic mt-2">Manage active and expired plans, upgrade tier access, or suspend partners.</p>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        {[
          { label: 'Active Subscriptions', value: totalActive, icon: <FiActivity />, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
          { label: 'Elite Subscriptions', value: eliteCount, icon: <FaCrown className="text-yellow-600" />, color: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/20' },
          { label: 'Premium Subscriptions', value: premiumCount, icon: <FiZap />, color: 'from-pink-400 to-[#C2185B]', shadow: 'shadow-pink-500/20' },
          { label: 'Expired/Suspended', value: expiredCount, icon: <FiAlertTriangle />, color: 'from-red-400 to-red-600', shadow: 'shadow-red-500/20' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-6 shadow-sm border border-white hover:shadow-lg transition-all group overflow-hidden relative">
            <div className={`w-12 h-12 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center mb-4 text-xl border border-gray-100`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
            <h3 className="font-display text-3xl font-black text-gray-900 leading-none">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pink-50 mb-8 relative z-10 gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 px-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'active' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-gray-400'
          }`}
        >
          Active Plans ({totalActive})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`pb-4 px-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'expired' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-gray-400'
          }`}
        >
          Free / Expired / Suspended ({vendors.length - totalActive})
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-pink-50 overflow-hidden relative z-10">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-pink-100 border-t-[#c41e6b] rounded-full animate-spin shadow-xl" />
            <p className="text-gray-500 font-medium animate-pulse">Loading listings...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-20 text-center">
            <div className="text-5xl mb-4">🏜️</div>
            <h3 className="font-display font-black text-xl text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-500 font-medium italic">No vendors found matching this list filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-responsive w-full text-sm text-left">
              <thead className="bg-[#FFF8F0]/30">
                <tr>
                  {['Business Info', 'Current Tier', 'Date Details', 'Access Status', 'Actions'].map(h => (
                    <th key={h} className="py-6 px-8 text-gray-400 font-black text-[9px] uppercase tracking-[0.3em] italic">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredVendors.map(v => {
                  const plan = v.subscription?.plan || 'free';
                  const status = v.subscription?.status || 'active';
                  const paymentStatus = v.subscription?.paymentStatus || 'none';

                  return (
                    <tr key={v._id} className="hover:bg-[#FFF8F0]/30 transition-all duration-500 group">
                      {/* Name / Category */}
                      <td data-label="Business Info" className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-display font-black text-[#D4AF37] border border-pink-50 text-lg flex-shrink-0">
                            {v.businessName?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-display text-lg font-black text-gray-900 group-hover:text-[#C2185B] transition-colors leading-none block mb-1">
                              {v.businessName}
                            </span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {v.user?.email || 'No email registered'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subscription Tier */}
                      <td data-label="Current Tier" className="py-6 px-8">
                        <span className={`text-[9px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider ${
                          plan === 'elite' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm shadow-yellow-500/10' :
                          plan === 'premium' ? 'bg-[#FFF8F0] text-[#C2185B] border border-pink-100' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {plan === 'elite' ? '👑 Elite' : plan === 'premium' ? '✨ Premium' : '⭐️ Free'}
                        </span>
                      </td>

                      {/* Subscription Dates */}
                      <td data-label="Date Details" className="py-6 px-8">
                        {plan !== 'free' ? (
                          <div className="space-y-1">
                            <p className="text-[10px] font-medium text-gray-500">
                              Start: {v.subscription?.startDate ? new Date(v.subscription.startDate).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                              End: {v.subscription?.endDate ? new Date(v.subscription.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium italic">Lifetime Active</span>
                        )}
                      </td>

                      {/* Statuses */}
                      <td data-label="Access Status" className="py-6 px-8">
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-[0.2em] w-max italic ${
                            status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' :
                            status === 'suspended' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {status}
                          </span>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded w-max uppercase tracking-wider ${
                            paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'
                          }`}>
                            Pay: {paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td data-label="Actions" className="py-6 px-8">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedVendor(v)
                              setTargetPlan(plan === 'free' ? 'premium' : plan === 'premium' ? 'elite' : 'premium')
                            }}
                            className="text-[9px] font-black px-4 py-2 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white rounded-lg shadow hover:scale-105 transition-all uppercase tracking-wider"
                          >
                            Upgrade/Renew
                          </button>
                          
                          {status === 'active' && plan !== 'free' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to SUSPEND the subscription for ${v.businessName}?`)) {
                                  handleAction(v._id, 'suspend')
                                }
                              }}
                              className="text-[9px] font-black px-4 py-2 border border-purple-200 hover:bg-purple-50 text-purple-600 rounded-lg hover:scale-105 transition-all uppercase tracking-wider"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade / Renew Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-pink-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full opacity-45" />
            
            <h3 className="font-display font-black text-2xl text-gray-900 mb-2 tracking-tight">Upgrade / Renew Plan</h3>
            <p className="text-gray-400 text-xs font-medium italic mb-6">Updating plan details for: <strong className="text-gray-700">{selectedVendor.businessName}</strong></p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Target Plan</label>
                <select
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none hover:border-[#D4AF37] transition-all cursor-pointer"
                >
                  <option value="premium">Premium (₹4,999 - 30 days)</option>
                  <option value="elite">Elite (₹9,999 - 365 days)</option>
                  <option value="free">Free (₹0 - Lifetime)</option>
                </select>
              </div>

              <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-pink-50 space-y-1">
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Update Summary</p>
                <p className="text-xs text-gray-600 font-medium">
                  This action will immediately override the current subscription status and end-dates with paid attributes for the selected plan.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleAction(selectedVendor._id, 'upgrade', targetPlan)}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-200/50 hover:scale-102 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm Update'}
                </button>
                <button
                  onClick={() => setSelectedVendor(null)}
                  disabled={submitting}
                  className="px-6 py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
