// ProfilePage.jsx
import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import { updateProfile, uploadAvatar, changePassword } from '../../store/slices/authSlice'
import { getInitials, INDIAN_CITIES } from '../../utils/helpers'
import { FiCamera, FiSave, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector(s => s.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const fileRef = useRef()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState(null)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setUploadPreview(reader.result)
    reader.readAsDataURL(file)

    setIsUploading(true)
    const fd = new FormData()
    fd.append('avatar', file)

    try {
      await dispatch(uploadAvatar(fd)).unwrap()
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err || 'Upload failed')
      setUploadPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Avatar section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700 relative">
              {(uploadPreview || user?.avatar?.url) ? (
                <img src={uploadPreview || user.avatar.url} className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-40' : 'opacity-100'}`} />
              ) : (
                getInitials(user?.name)
              )}

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              disabled={isUploading}
              onClick={() => fileRef.current?.click()}
              className={`absolute bottom-0 right-0 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 shadow-md transition-all ${isUploading ? 'scale-0' : 'scale-100'}`}
            >
              <FiCamera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full capitalize mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['profile', 'security', 'wedding'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'profile' && (
            <Formik
              initialValues={{ name: user?.name || '', phone: user?.phone || '' }}
              onSubmit={(values) => dispatch(updateProfile(values))}
              enableReinitialize
            >
              {() => (
                <Form className="space-y-5">
                  <h2 className="font-display text-lg font-bold text-gray-800 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name</label>
                      <Field name="name" className="input-field" />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <Field name="phone" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email Address <span className="text-gray-400 font-normal">(cannot be changed)</span></label>
                    <input value={user?.email || ''} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    <FiSave /> {loading ? 'Saving...' : 'Update Details'}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {activeTab === 'security' && (
            <Formik
              initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
              onSubmit={async (values, { resetForm }) => {
                const r = await dispatch(changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }))
                if (!r.error) {
                  resetForm()
                  toast.success('Password updated successfully')
                }
              }}
            >
              {() => (
                <Form className="space-y-5">
                  <h2 className="font-display text-lg font-bold text-gray-800 mb-4">Change Password</h2>
                  {[
                    { name: 'currentPassword', label: 'Current Password' },
                    { name: 'newPassword', label: 'New Password' },
                    { name: 'confirmPassword', label: 'Confirm New Password' },
                  ].map(({ name, label }) => (
                    <div key={name}>
                      <label className="label">{label}</label>
                      <Field name={name} type="password" placeholder="••••••••" className="input-field" />
                    </div>
                  ))}
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    <FiLock /> {loading ? 'Updating...' : 'Update Details'}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {activeTab === 'wedding' && (
            <Formik
              initialValues={{ weddingDate: user?.weddingDate?.slice(0, 10) || '', weddingCity: user?.weddingCity || '' }}
              onSubmit={(values) => dispatch(updateProfile(values))}
              enableReinitialize
            >
              {() => (
                <Form className="space-y-5">
                  <h2 className="font-display text-lg font-bold text-gray-800 mb-4">Wedding Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Wedding Date</label>
                      <Field type="date" name="weddingDate" className="input-field" />
                    </div>
                    <div>
                      <label className="label">Wedding City</label>
                      <Field as="select" name="weddingCity" className="input-field">
                        <option value="">Select city</option>
                        {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </Field>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    <FiSave /> {loading ? 'Saving...' : 'Update Details'}
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  )
}
