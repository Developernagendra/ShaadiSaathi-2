import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateVendorProfile } from '../../store/slices/vendorSlice'
import { FiPlus, FiTrash2, FiTag, FiCheck, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast'

export default function VendorPackagesPage() {
  const dispatch = useDispatch()
  const { myVendorProfile: vendor } = useSelector(s => s.vendor)
  const [packages, setPackages] = useState([])
  const [saving, setSaving] = useState(false)

  // Sync packages from Redux whenever vendor profile updates
  useEffect(() => {
    if (vendor?.packages) setPackages(vendor.packages)
  }, [vendor])

  const handleAddPackage = () => {
    setPackages([...packages, { name: '', description: '', price: '', advancePercentage: 50, features: [''], isPopular: false }])
  }

  const handleRemovePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index))
  }

  const handlePackageChange = (index, field, value) => {
    const updated = [...packages]
    updated[index] = { ...updated[index], [field]: value }
    setPackages(updated)
  }

  const handleFeatureChange = (pIndex, fIndex, value) => {
    const updated = [...packages]
    const updatedFeatures = [...updated[pIndex].features]
    updatedFeatures[fIndex] = value
    updated[pIndex] = { ...updated[pIndex], features: updatedFeatures }
    setPackages(updated)
  }

  const handleAddFeature = (pIndex) => {
    const updated = [...packages]
    updated[pIndex] = { ...updated[pIndex], features: [...updated[pIndex].features, ''] }
    setPackages(updated)
  }

  const handleSave = async () => {
    // --- Frontend Validation ---
    for (let i = 0; i < packages.length; i++) {
      if (!packages[i].name || !packages[i].name.trim()) {
        toast.error(`Package ${i + 1} requires a name.`, { id: 'pkg-validate' })
        return
      }
      if (!packages[i].price || Number(packages[i].price) <= 0) {
        toast.error(`Package "${packages[i].name || i + 1}" requires a price greater than ₹0.`, { id: 'pkg-validate' })
        return
      }
    }

    // --- Sanitize: cast to correct types ---
    const sanitizedPackages = packages.map(pkg => ({
      ...pkg,
      name: pkg.name.trim(),
      price: Number(pkg.price),
      advancePercentage: Number(pkg.advancePercentage) || 50,
      features: (pkg.features || []).filter(f => f && f.trim()),
    }))

    setSaving(true)
    try {
      const result = await dispatch(updateVendorProfile({ packages: sanitizedPackages })).unwrap()
      // Sync local state from server response to ensure full consistency
      const savedPackages = result?.vendor?.packages || sanitizedPackages
      setPackages(savedPackages)
      toast.success('Packages saved successfully!', { id: 'pkg-save' })
    } catch (err) {
      const message = typeof err === 'string' ? err : (err?.message || 'Failed to save packages. Please try again.')
      toast.error(message, { id: 'pkg-save-error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
        <div>
          <div className="divider-luxe !justify-start mb-3 !gap-3">
            <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic drop-shadow-sm">Pricing Strategy</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm">Service Packages</h1>
          <p className="text-gray-500 font-medium italic mt-2">Manage your pricing plans and premium inclusions.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAddPackage} disabled={saving} className="bg-white/90 backdrop-blur-md text-gray-900 border border-white rounded-full px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:border-[#D4AF37]/50 hover:text-[#C2185B] transition-all shadow-sm hover:shadow-md hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none">
            <FiPlus size={16} /> Add Package
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-[#C2185B] via-[#8E244D] to-[#C2185B] bg-[length:200%_auto] hover:bg-[100%_auto] text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(194,24,91,0.3)] hover:shadow-[0_15px_40px_rgba(194,24,91,0.5)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center gap-2">
            {saving ? <><FiLoader size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {packages.map((pkg, pi) => (
          <div key={pi} className={`bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 relative group border ${pkg.isPopular ? 'border-[#D4AF37]' : 'border-white hover:border-[#D4AF37]/30'} hover:-translate-y-2`}>

            {pkg.isPopular && (
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-lg border border-white/50 backdrop-blur-md">
                  Most Popular
                </span>
              </div>
            )}

            <button onClick={() => handleRemovePackage(pi)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 border border-white text-gray-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm">
              <FiTrash2 size={16} />
            </button>

            <div className="flex flex-col items-center text-center mb-8 pt-6">
              <input value={pkg.name} onChange={e => handlePackageChange(pi, 'name', e.target.value)} placeholder="Package Name" className="font-display text-2xl font-black text-gray-900 bg-transparent border-b border-transparent focus:border-[#D4AF37] outline-none w-full text-center mb-5 transition-colors placeholder:text-gray-300" />

              <div className="flex items-center justify-center text-[#D4AF37] font-black drop-shadow-sm">
                <span className="text-2xl mt-2">₹</span>
                <input type="number" required min="1" value={pkg.price} onChange={e => handlePackageChange(pi, 'price', e.target.value)} placeholder="0" className="font-display text-6xl bg-transparent border-none outline-none w-40 text-center tracking-tighter" />
              </div>

              <div className="bg-white/50 rounded-[1rem] px-5 py-3 mt-5 inline-flex items-center gap-2 border border-gray-100 shadow-inner">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Advance:</span>
                <input type="number" required min="1" max="100" value={pkg.advancePercentage || 50} onChange={e => handlePackageChange(pi, 'advancePercentage', e.target.value)} className="bg-transparent font-black text-[#C2185B] outline-none w-10 text-right" />
                <span className="text-[10px] text-[#C2185B] font-black">%</span>
              </div>
            </div>

            <textarea value={pkg.description} onChange={e => handlePackageChange(pi, 'description', e.target.value)} placeholder="Describe what makes this package special..." className="w-full text-sm text-gray-600 font-medium leading-relaxed bg-white/50 rounded-2xl p-5 resize-none border border-gray-100 focus:border-[#C2185B] focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] outline-none mb-6 transition-all" rows={3} />

            <div className="space-y-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100/50 pb-2">Included Features</p>
              {pkg.features.map((feat, fi) => (
                <div key={fi} className="flex items-start gap-3 group/feature relative">
                  <div className="mt-1 w-5 h-5 rounded-md bg-[#F0FDF4] text-green-500 border border-green-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiCheck size={12} strokeWidth={3} />
                  </div>
                  <input value={feat} onChange={e => handleFeatureChange(pi, fi, e.target.value)} placeholder="Type a feature..." className="flex-1 text-sm font-bold text-gray-700 bg-transparent border-b border-gray-100 focus:border-[#D4AF37] outline-none py-1 transition-colors" />
                </div>
              ))}
              <button onClick={() => handleAddFeature(pi)} className="text-[10px] font-black text-[#C2185B] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#8E244D] transition-colors mt-3 py-2">
                <FiPlus size={14} /> Add Feature
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100/50">
              <label className="flex items-center gap-4 cursor-pointer group/toggle">
                <div className={`w-12 h-6 rounded-full transition-all duration-300 relative border ${pkg.isPopular ? 'bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-gray-200 border-gray-300'}`}>
                  <div className={`absolute top-[1px] left-[1px] w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-sm ${pkg.isPopular ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" checked={pkg.isPopular} onChange={e => handlePackageChange(pi, 'isPopular', e.target.checked)} className="hidden" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover/toggle:text-gray-900 transition-colors">
                  Highlight as Popular
                </span>
              </label>
            </div>
          </div>
        ))}

        {packages.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-32 text-center bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 border border-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-inner">
              <FiTag size={40} />
            </div>
            <h3 className="font-display text-3xl font-black text-gray-900 mb-2">No Packages Configured</h3>
            <p className="text-gray-400 mb-8 font-medium italic text-sm">Create tiered pricing plans to give your clients amazing options.</p>
            <button onClick={handleAddPackage} className="bg-gradient-to-r from-[#C2185B] via-[#8E244D] to-[#C2185B] bg-[length:200%_auto] hover:bg-[100%_auto] text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded-full shadow-[0_10px_30px_rgba(194,24,91,0.3)] hover:shadow-[0_15px_40px_rgba(194,24,91,0.5)] transition-all hover:-translate-y-1 active:scale-95">
              Add First Package
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
