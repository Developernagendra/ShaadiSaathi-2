import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import { fetchMyVendorProfile, updateVendorProfile, uploadVendorCoverImage } from '../../store/slices/vendorSlice'
import { INDIAN_CITIES } from '../../utils/helpers'
import { FiCamera, FiUpload, FiCheck, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiFacebook, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast'

export default function VendorProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { myVendorProfile: vendor, fetchLoading: loading, actionLoading } = useSelector(s => s.vendor)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState(null)

  useEffect(() => { dispatch(fetchMyVendorProfile()) }, [dispatch])

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file')

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setUploadPreview(reader.result)
    reader.readAsDataURL(file)

    setIsUploading(true)
    const formData = new FormData()
    formData.append('coverImage', file)

    try {
      await dispatch(uploadVendorCoverImage(formData)).unwrap()
      toast.success('Cover photo updated!')
    } catch (err) {
      toast.error(err || 'Upload failed')
      setUploadPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  if (loading && !vendor) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Fetching your profile...</p>
    </div>
  )

  if (!vendor && !loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto my-12">
      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">🏪</div>
      <h2 className="font-display text-xl font-bold text-gray-900 mb-2">No Profile Found</h2>
      <p className="text-gray-500 mb-6 text-sm max-w-sm">Please set up your business profile to start managing services.</p>
      <button onClick={() => navigate('/vendor/profile')} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold transition-colors">Setup Business Profile</button>
    </div>
  )

  return (
    <div className="pb-20 relative px-4 md:px-8 pt-6 md:pt-0">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-black text-gray-900 tracking-tight drop-shadow-sm">Business Profile</h1>
            <p className="text-gray-500 mt-2 font-medium">Control how your business appears to potential clients.</p>
          </div>
          <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${vendor.approvalStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
            {vendor.approvalStatus === 'approved' ? '✓ Profile Verified' : '⌚ Awaiting Approval'}
          </div>
        </header>

        {/* Cover Image Upload Section */}
        <section className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-premium hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500 overflow-hidden relative group">
          <div className="h-64 md:h-80 w-full bg-gray-50 relative">
            {(uploadPreview || vendor.coverImage?.url) ? (
              <img src={uploadPreview || vendor.coverImage.url} className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isUploading ? 'opacity-50 blur-sm' : 'opacity-100'}`} alt="Cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100">
                <FiCamera className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">No Cover Image</p>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-[#C2185B] rounded-full animate-spin shadow-lg" />
                  <p className="text-[#C2185B] font-black text-[10px] uppercase tracking-[0.3em] drop-shadow-md">Uploading...</p>
                </div>
              </div>
            )}

            <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center ${isUploading ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-white/90 backdrop-blur-md text-gray-900 px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 hover:bg-white transition-all"
              >
                <FiUpload size={16} /> {vendor.coverImage?.url ? 'Change Cover' : 'Upload Cover'}
              </button>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCoverUpload}
            className="hidden"
            accept="image/*"
          />
          <div className="p-8 bg-white/50 backdrop-blur-md flex flex-col sm:flex-row items-center sm:justify-between border-t border-white/50 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 -mt-20 border-4 border-white rounded-[2rem] bg-gradient-to-br from-[#FFF8F0] to-[#FFE0E9] shadow-xl flex items-center justify-center text-4xl overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500">
                {vendor.images?.[0]?.url ? <img src={vendor.images[0].url} className="w-full h-full object-cover" /> : vendor.category?.icon || '🏢'}
              </div>
              <div className="text-center sm:text-left mt-2 sm:mt-0">
                <h2 className="font-display font-black text-gray-900 text-2xl tracking-tight">{vendor.businessName}</h2>
                <p className="text-[11px] text-[#C2185B] font-bold uppercase tracking-widest mt-1">{vendor.category?.name} • {vendor.location?.city}</p>
              </div>
            </div>
          </div>
        </section>

        <Formik
          initialValues={{
            businessName: vendor.businessName || '',
            tagline: vendor.tagline || '',
            description: vendor.description || '',
            phone: vendor.phone || '',
            email: vendor.email || '',
            city: vendor.location?.city || '',
            address: vendor.location?.address || '',
            state: vendor.location?.state || '',
            pincode: vendor.location?.pincode || '',
            yearsOfExperience: vendor.yearsOfExperience || 0,
            basePrice: vendor.basePrice || 0,
            responseTime: vendor.responseTime || 'Within 24 hours',
            instagram: vendor.socialLinks?.instagram || '',
            facebook: vendor.socialLinks?.facebook || '',
            website: vendor.socialLinks?.website || '',
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await dispatch(updateVendorProfile(values)).unwrap();
              // toast.success is handled in slice
            } catch (err) {
              toast.error(err || 'Failed to update profile');
            } finally {
              setSubmitting(false);
            }
          }}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-8">
              {/* Basic Info */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500">
                <h3 className="text-2xl font-display font-black text-gray-900 mb-8 flex items-center gap-4 tracking-tight">
                  <span className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-[#FFE0E9] to-[#FFF8F0] text-[#C2185B] flex items-center justify-center shadow-inner border border-white"><FiTrendingUp size={20} /></span>
                  Brand Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Business Name</label>
                    <Field name="businessName" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tagline</label>
                    <Field name="tagline" placeholder="Ex: Crafting Cinematic Memories" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">About Business</label>
                    <Field as="textarea" name="description" rows={5} className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-medium resize-none leading-relaxed" />
                  </div>
                </div>
              </div>

              {/* Contact & Pricing */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500">
                <h3 className="text-2xl font-display font-black text-gray-900 mb-8 flex items-center gap-4 tracking-tight">
                  <span className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] text-blue-600 flex items-center justify-center shadow-inner border border-white"><FiPhone size={20} /></span>
                  Contact & Economics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Primary Phone</label>
                    <Field name="phone" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Business Email</label>
                    <Field name="email" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Starting Price (₹)</label>
                    <Field type="number" name="basePrice" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-[#C2185B] outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-black text-lg" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Industry Experience (Yrs)</label>
                    <Field type="number" name="yearsOfExperience" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500">
                <h3 className="text-2xl font-display font-black text-gray-900 mb-8 flex items-center gap-4 tracking-tight">
                  <span className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-[#DCFCE7] to-[#F0FDF4] text-green-600 flex items-center justify-center shadow-inner border border-white"><FiMapPin size={20} /></span>
                  Operational Base
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">City</label>
                    <Field as="select" name="city" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold appearance-none">
                      <option value="">Select City</option>
                      {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Field>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">State / Province</label>
                    <Field name="state" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Detailed Address</label>
                    <Field name="address" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500">
                <h3 className="text-2xl font-display font-black text-gray-900 mb-8 flex items-center gap-4 tracking-tight">
                  <span className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-[#FCE7F3] to-[#FDF2F8] text-[#C2185B] flex items-center justify-center shadow-inner border border-white"><FiGlobe size={20} /></span>
                  Digital Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><FiInstagram /> Instagram</label>
                    <Field name="instagram" placeholder="https://instagram.com/..." className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><FiFacebook /> Facebook</label>
                    <Field name="facebook" placeholder="https://facebook.com/..." className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Official Website</label>
                    <Field name="website" placeholder="https://yourbrand.com" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-[#C2185B] focus:bg-white focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all font-bold" />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-20 md:bottom-8 z-30 flex justify-center mt-12 px-4 md:px-0">
                <button
                  type="submit"
                  disabled={actionLoading || isSubmitting}
                  className="w-full md:w-[60%] py-6 bg-gradient-to-r from-[#C2185B] via-[#8E244D] to-[#C2185B] bg-[length:200%_auto] hover:bg-[100%_auto] text-white rounded-full font-black text-[12px] uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(194,24,91,0.3)] hover:shadow-[0_20px_50px_rgba(194,24,91,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Synchronizing Data...
                    </>
                  ) : (
                    <>
                      <FiCheck size={20} className="group-hover:scale-125 transition-transform" />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
