import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiLock, FiBell, FiShield, FiSmartphone, FiCreditCard } from 'react-icons/fi';
import { changePassword } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })

  const handlePassChange = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match')
    const res = await dispatch(changePassword(passForm))
    if (!res.error) setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  const sections = [
    { id: 'security', label: 'Security', icon: <FiLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'privacy', label: 'Privacy', icon: <FiShield /> },
    { id: 'app', label: 'App Settings', icon: <FiSmartphone /> },
    { id: 'billing', label: 'Billing', icon: <FiCreditCard /> },
  ]

  const [activeSection, setActiveSection] = useState('security')

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-48 flex-shrink-0">
          <div className="space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === s.id ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-800'}`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {activeSection === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiLock className="text-primary-600" /> Change Password
              </h2>
              <form onSubmit={handlePassChange} className="space-y-4 max-w-sm">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={passForm.oldPassword}
                    onChange={e => setPassForm(p => ({ ...p, oldPassword: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={passForm.newPassword}
                    onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passForm.confirmPassword}
                    onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full mt-2">Update Password</button>
              </form>

              <hr className="my-8 border-gray-100" />

              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiShield className="text-red-500" /> Account Security
              </h2>
              <p className="text-sm text-gray-500 mb-4">You are logged in as <span className="font-semibold">{user?.email}</span></p>
              <button className="text-sm font-semibold text-red-600 hover:underline">Deactivate Account</button>
            </div>
          )}

          {activeSection !== 'security' && (
            <div className="py-20 text-center text-gray-400">
              <p>Section "{activeSection}" is coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
