import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiSettings, FiGlobe, FiDatabase, FiSave } from 'react-icons/fi';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    siteName: 'ShaadiSaathi',
    contactEmail: 'admin@shaadisaathi.com',
    maintenanceMode: false,
    enableRegistration: true,
    platformFee: 10, // %
    minPayout: 1000,
    showContactAfterBookingOnly: true
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/admin/config')
        if (res.data?.data) {
          setConfig(res.data.data)
        }
      } catch (err) {
        toast.error('Failed to load platform settings')
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.patch('/admin/config', config)
      toast.success('Configuration saved successfully!')
    } catch { toast.error('Failed to save settings') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Platform Settings</h1>

        <div className="space-y-6">
          {/* General Config */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FiGlobe size={20} /></span>
              General Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="label">Site Name</label><input value={config.siteName} onChange={e => setConfig(p => ({ ...p, siteName: e.target.value }))} className="input-field" /></div>
              <div><label className="label">Contact Email</label><input value={config.contactEmail} onChange={e => setConfig(p => ({ ...p, contactEmail: e.target.value }))} className="input-field" /></div>
            </div>
          </div>

          {/* Business Rules */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center"><FiSettings size={20} /></span>
              Business Rules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="label">Platform Fee (%)</label><input type="number" value={config.platformFee} onChange={e => setConfig(p => ({ ...p, platformFee: e.target.value }))} className="input-field" /></div>
              <div><label className="label">Min Payout Amount (₹)</label><input type="number" value={config.minPayout} onChange={e => setConfig(p => ({ ...p, minPayout: e.target.value }))} className="input-field" /></div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><FiDatabase size={20} /></span>
              System Control
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-800 text-sm">Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Only admins can access the frontend</p>
                </div>
                <input type="checkbox" checked={config.maintenanceMode} onChange={e => setConfig(p => ({ ...p, maintenanceMode: e.target.checked }))} className="w-5 h-5 accent-primary-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-800 text-sm">New Vendor Registrations</p>
                  <p className="text-xs text-gray-500">Allow new vendors to sign up</p>
                </div>
                <input type="checkbox" checked={config.enableRegistration} onChange={e => setConfig(p => ({ ...p, enableRegistration: e.target.checked }))} className="w-5 h-5 accent-primary-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-800 text-sm">Protect Vendor Contact Details</p>
                  <p className="text-xs text-gray-500">Only reveal phone/email/address after a booking or chat inquiry is submitted</p>
                </div>
                <input type="checkbox" checked={config.showContactAfterBookingOnly || false} onChange={e => setConfig(p => ({ ...p, showContactAfterBookingOnly: e.target.checked }))} className="w-5 h-5 accent-primary-600" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={loading}
            className="btn-primary w-full py-5 text-base flex items-center justify-center gap-3 shadow-xl shadow-primary-100"
          >
            <FiSave size={20} /> {loading ? 'Saving Changes...' : 'Save Platform Configuration'}
          </button>
        </div>
      </div>
    </div>
  )
}
