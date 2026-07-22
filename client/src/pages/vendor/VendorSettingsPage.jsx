import { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiLock, FiBell, FiShield, FiCreditCard } from 'react-icons/fi';

export default function VendorSettingsPage() {
  const { user } = useSelector(s => s.auth)
  const [loading, setLoading] = useState(false)
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await api.patch('/auth/update-password', passForm)
      toast.success('Password updated successfully!')
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] bg-transparent pb-24 px-4 md:px-8 relative animate-fade-in pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="mb-12">
          <div className="divider-luxe !justify-start mb-3 !gap-3">
            <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Preferences</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Account <span className="bg-gradient-to-r from-[#C2185B] to-[#D4AF37] text-transparent bg-clip-text">Settings</span></h1>
          <p className="text-gray-500 font-medium italic mt-2">Manage your security, notifications, and account visibility.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1 space-y-3">
            {[
              { id: 'security', label: 'Security', icon: <FiLock size={16} /> },
              { id: 'notifications', label: 'Notifications', icon: <FiBell size={16} /> },
              { id: 'billing', label: 'Billing & Plans', icon: <FiCreditCard size={16} /> },
            ].map(item => (
              <button key={item.id} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 ${item.id === 'security' ? 'bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-[#D4AF37] shadow-premium hover:-translate-y-0.5' : 'bg-white/80 backdrop-blur-md text-gray-400 hover:bg-[#FFF8F0] hover:text-[#C2185B] border border-white'}`}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Password Section */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-premium border border-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF8F0] to-transparent rounded-bl-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-[1.5rem] bg-[#FFF8F0] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <FiShield size={24} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-gray-900 tracking-tight">Change Password</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic mt-1">Secure your account</p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 italic ml-1">Current Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passForm.oldPassword} 
                    onChange={e => setPassForm(p => ({ ...p, oldPassword: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white transition-all font-bold shadow-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 italic ml-1">New Password</label>
                    <input 
                      type="password" 
                      required 
                      value={passForm.newPassword} 
                      onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white transition-all font-bold shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 italic ml-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      required 
                      value={passForm.confirmPassword} 
                      onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white transition-all font-bold shadow-sm" 
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white hover:shadow-[0_8px_25px_rgba(194,24,91,0.4)] px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 mt-4">
                  {loading ? 'Updating Security...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Account Status */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-premium border border-white">
              <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Account Status</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 italic">Manage your account visibility and presence on ShaadiSaathi.</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-red-50/30 rounded-[2rem] border border-red-100/50 gap-4">
                <div>
                  <p className="font-display font-black text-red-600 text-lg mb-1">Deactivate Account</p>
                  <p className="text-[9px] text-red-400 uppercase tracking-[0.2em] font-bold">Temporary or Permanent</p>
                </div>
                <button className="text-[10px] font-black text-red-500 bg-white border-2 border-red-100 hover:border-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-sm whitespace-nowrap">
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

