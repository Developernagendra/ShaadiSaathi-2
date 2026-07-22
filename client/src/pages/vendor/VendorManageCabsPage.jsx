import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiPlus, FiTrash2, FiEdit2, FiUpload, FiX, FiMapPin, FiShield, FiUser } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import LoadingScreen from '../../components/common/LoadingScreen'
import { formatPrice, INDIAN_CITIES } from '../../utils/helpers'

import { getSocket } from '../../utils/socket'

export default function VendorManageCabsPage() {
  const [cabs, setCabs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [searchQueries, setSearchQueries] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCab, setEditingCab] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingField, setUploadingField] = useState(null)
  const [step, setStep] = useState(1)
  const [agreeChecked, setAgreeChecked] = useState(false)

  const fileInputRefs = {
    front: useRef(null),
    back: useRef(null),
    side: useRef(null),
    interior: useRef(null),
    decorated: useRef(null),
    registrationCertificate: useRef(null),
    insuranceCertificate: useRef(null),
    drivingLicense: useRef(null),
    pollutionCertificate: useRef(null),
    ownerIdProof: useRef(null)
  }

  const [formData, setFormData] = useState({
    name: '',
    type: 'sedan',
    brand: '',
    model: '',
    modelYear: new Date().getFullYear(),
    color: '',
    fuelType: 'diesel',
    ac: true,
    seatingCapacity: 4,
    vehicleNumber: '',
    registrationNumber: '',
    description: '',
    packages: [], // New Baraat Cab Premium Packages
    images: [], // array of { url, publicId, viewType, isPrimary }
    documents: {
      registrationCertificate: { url: '', publicId: '' },
      insuranceCertificate: { url: '', publicId: '' },
      drivingLicense: { url: '', publicId: '' },
      pollutionCertificate: { url: '', publicId: '' },
      ownerIdProof: { url: '', publicId: '' }
    },
    driverDetails: {
      name: '',
      phone: '',
      experienceYears: 5,
      uniformAvailable: true
    },
    availableDates: [],
    outstationAvailable: false,
    driverIncluded: true,
    additionalServices: {
      flowerDecoration: false,
      ribbonDecoration: false,
      groomEntrySetup: false,
      baraatSoundSupport: false
    },
    pricing: {
      baseFare: 3000,
      advancePercentage: 50,
      pricePerDay: 3000,
      decorationCharges: 0,
      extraKmCharges: 0,
      driverCharges: 0
    },
    price: '',
    features: {
      driverIncluded: true,
      decorationAvailable: true,
      musicSystem: true,
      ac: true,
      fuelIncluded: true
    },
    location: {
      city: 'Patna',
      state: 'Bihar'
    },
    status: 'draft'
  })

  useEffect(() => {
    loadCabs()

    // Handle outside clicks to close searchable dropdown
    const handleOutsideClick = (e) => {
      if (openDropdownId && !e.target.closest('.relative')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('click', handleOutsideClick)

    // Setup Socket Real-time Listener
    const socket = getSocket()
    if (socket) {
      const handleSync = () => {
        loadCabs()
      }
      socket.on('fleet_updated', handleSync)
      socket.on('cab_updated', handleSync)
      socket.on('vendor_updated', handleSync)

      return () => {
        document.removeEventListener('click', handleOutsideClick)
        socket.off('fleet_updated', handleSync)
        socket.off('cab_updated', handleSync)
        socket.off('vendor_updated', handleSync)
      }
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [openDropdownId])

  const loadVehicles = async () => {
    setVehiclesLoading(true)
    try {
      const { data } = await api.get('/vendors/fleet/vehicles')
      setVehicles(data.data || [])
    } catch (err) {
      console.error('Vehicles load error:', err)
    } finally {
      setVehiclesLoading(false)
    }
  }

  const loadCabs = async () => {
    try {
      const { data } = await api.get('/fleet')
      setCabs(data.cabs || [])
      // Also load approved vehicles for dropdowns in parallel
      await loadVehicles()
    } catch (err) {
      console.error('Fleet load error:', err)
      toast.error(err.response?.data?.message || 'Failed to load fleet')
    } finally {
      setLoading(false)
    }
  }

  // Handle Photo Viewpoint Uploads
  const handleViewImageUpload = async (e, viewType) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    setUploadingField(viewType)
    setUploadProgress(0)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/fleet/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      setFormData(prev => {
        // Remove existing preview of the same viewType
        const filtered = prev.images.filter(img => img.viewType !== viewType)
        return {
          ...prev,
          images: [...filtered, { url: data.url, publicId: data.publicId, viewType, isPrimary: viewType === 'front' }]
        }
      })
      toast.success(`${viewType.toUpperCase()} view uploaded successfully!`)
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      setUploadingField(null)
      setUploadProgress(0)
    }
  }

  // Handle Document Uploads
  const handleDocUpload = async (e, docKey) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    setUploadingField(docKey)
    setUploadProgress(0)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/fleet/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docKey]: { url: data.url, publicId: data.publicId }
        }
      }))
      toast.success('Document uploaded successfully!')
    } catch (err) {
      toast.error('Document upload failed')
    } finally {
      setIsUploading(false)
      setUploadingField(null)
      setUploadProgress(0)
    }
  }

  const removeViewImage = (viewType) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.viewType !== viewType)
    }))
  }

  const removeDoc = (docKey) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: { url: '', publicId: '' }
      }
    }))
  }

  // --- Package Management Handlers ---
  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      packages: [...(prev.packages || []), {
        name: '', price: '', originalPrice: '', hours: 8, kmLimit: 80,
        description: '', features: [], decorationIncluded: false,
        driverIncluded: true, fuelIncluded: true, isPopular: false
      }]
    }))
  }
  const removePackage = (index) => {
    setFormData(prev => ({ ...prev, packages: prev.packages.filter((_, i) => i !== index) }))
  }
  const updatePackage = (index, field, value) => {
    setFormData(prev => {
      const newPackages = [...prev.packages]
      newPackages[index] = { ...newPackages[index], [field]: value }
      return { ...prev, packages: newPackages }
    })
  }

  const handleSubmit = async (e, finalStatus = 'pending') => {
    if (e) e.preventDefault()

    // Validate pricing
    const priceVal = Number(formData.price || formData.pricing?.baseFare)
    if (!priceVal || isNaN(priceVal) || priceVal <= 0) {
      toast.error('Flat Pricing per Booking is required and must be a positive number')
      setStep(2)
      return
    }

    if (finalStatus === 'pending') {
      // Perform strict validation checks for official submission
      if (!formData.name) { toast.error('Vehicle Name is required'); setStep(1); return; }
      if (!formData.vehicleNumber) { toast.error('Registration/Plate Number is required'); setStep(1); return; }
      if (formData.images.filter(i => ['front', 'back', 'side', 'interior'].includes(i.viewType)).length < 4) {
        toast.error('Please upload at least Front, Back, Side, and Interior views');
        setStep(3);
        return;
      }
      const docs = formData.documents;
      if (!docs.registrationCertificate?.url || !docs.insuranceCertificate?.url || !docs.drivingLicense?.url || !docs.ownerIdProof?.url) {
        toast.error('Please upload all required verification documents (RC, Insurance, DL, Owner ID)');
        setStep(4);
        return;
      }
      if (!formData.driverDetails.name || !formData.driverDetails.phone) {
        toast.error('Driver contact details are required');
        setStep(5);
        return;
      }
      if (!agreeChecked) {
        toast.error('You must declare and certify that vehicle details and driver records are correct');
        setStep(8);
        return;
      }
    }

    const payload = {
      ...formData,
      status: finalStatus,
      price: priceVal,
      pricing: {
        ...formData.pricing,
        baseFare: priceVal
      }
    }

    try {
      if (editingCab) {
        await api.patch(`/fleet/${editingCab._id}`, payload)
        toast.success(finalStatus === 'draft' ? 'Draft specifications saved' : 'Vehicle submitted for Admin Verification!')
      } else {
        await api.post('/fleet', payload)
        toast.success(finalStatus === 'draft' ? 'New draft vehicle saved' : 'New vehicle submitted for Admin Verification!')
      }
      setShowModal(false)
      loadCabs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return
    try {
      await api.delete(`/fleet/${id}`)
      toast.success('Vehicle removed')
      loadCabs()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const openEdit = (cab) => {
    setEditingCab(cab)
    setFormData({
      name: cab.name || '',
      type: cab.type || 'sedan',
      brand: cab.brand || '',
      model: cab.model || '',
      modelYear: cab.modelYear || 2024,
      color: cab.color || '',
      fuelType: cab.fuelType || 'diesel',
      ac: cab.ac !== undefined ? cab.ac : true,
      seatingCapacity: cab.seatingCapacity || 4,
      totalFleet: cab.totalFleet || cab.quantityAvailable || 1,
      vehicleNumber: cab.vehicleNumber || '',
      registrationNumber: cab.registrationNumber || cab.vehicleNumber || '',
      description: cab.description || '',
      images: cab.images || [],
      documents: cab.documents || {
        registrationCertificate: { url: '', publicId: '' },
        insuranceCertificate: { url: '', publicId: '' },
        drivingLicense: { url: '', publicId: '' },
        pollutionCertificate: { url: '', publicId: '' },
        ownerIdProof: { url: '', publicId: '' }
      },
      driverDetails: cab.driverDetails || { name: '', phone: '', experienceYears: 5, uniformAvailable: true },
      availableDates: cab.availableDates || [],
      outstationAvailable: cab.outstationAvailable || false,
      driverIncluded: cab.driverIncluded !== undefined ? cab.driverIncluded : true,
      additionalServices: cab.additionalServices || { flowerDecoration: false, ribbonDecoration: false, groomEntrySetup: false, baraatSoundSupport: false },
      pricing: cab.pricing || { baseFare: 3000, advancePercentage: 50, pricePerDay: 3000, decorationCharges: 0, extraKmCharges: 0, driverCharges: 0 },
      price: cab.price || cab.pricing?.baseFare || '',
      features: cab.features || { driverIncluded: true, decorationAvailable: true, musicSystem: true, ac: true, fuelIncluded: true },
      location: cab.location || { city: 'Patna', state: 'Bihar' },
      status: cab.status || 'draft'
    })
    setStep(1)
    setAgreeChecked(false)
    setShowModal(true)
  }

  const openAdd = () => {
    setEditingCab(null)
    setFormData({
      name: '',
      type: 'sedan',
      brand: '',
      model: '',
      modelYear: 2024,
      color: '',
      fuelType: 'diesel',
      ac: true,
      seatingCapacity: 4,
      totalFleet: 1,
      vehicleNumber: '',
      registrationNumber: '',
      description: '',
      images: [],
      documents: {
        registrationCertificate: { url: '', publicId: '' },
        insuranceCertificate: { url: '', publicId: '' },
        drivingLicense: { url: '', publicId: '' },
        pollutionCertificate: { url: '', publicId: '' },
        ownerIdProof: { url: '', publicId: '' }
      },
      driverDetails: { name: '', phone: '', experienceYears: 5, uniformAvailable: true },
      availableDates: [],
      outstationAvailable: false,
      driverIncluded: true,
      additionalServices: { flowerDecoration: false, ribbonDecoration: false, groomEntrySetup: false, baraatSoundSupport: false },
      pricing: { baseFare: 3000, advancePercentage: 50, pricePerDay: 3000, decorationCharges: 0, extraKmCharges: 0, driverCharges: 0 },
      price: '',
      features: { driverIncluded: true, decorationAvailable: true, musicSystem: true, ac: true, fuelIncluded: true },
      location: { city: 'Patna', state: 'Bihar' },
      status: 'draft'
    })
    setStep(1)
    setAgreeChecked(false)
    setShowModal(true)
  }

  // Dynamic Availability Setter (Toggle weekdays)
  const toggleWeekday = (day) => {
    const days = formData.availableDates || []
    const updated = days.includes(day) ? days.filter(d => d !== day) : [...days, day]
    setFormData(prev => ({ ...prev, availableDates: updated }))
  }

  const steps = [
    { id: 1, name: 'Vehicle Info' },
    { id: 2, name: 'Pricing' },
    { id: 3, name: 'Showcase' },
    { id: 4, name: 'Documents' },
    { id: 5, name: 'Driver Details' },
    { id: 6, name: 'Availability' },
    { id: 7, name: 'Wedding Addons' },
    { id: 8, name: 'Authorize' }
  ]

  if (loading) return <LoadingScreen />

  // Dashboard count summaries
  const approvedCount = cabs.filter(c => c.status === 'approved').length
  const pendingCount = cabs.filter(c => c.status === 'pending').length
  const rejectedCount = cabs.filter(c => c.status === 'rejected').length
  const changesCount = cabs.filter(c => c.status === 'changes_requested').length
  const draftCount = cabs.filter(c => c.status === 'draft').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Stepper Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
        <div>
          <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-block bg-[#FFF8F0] border border-[#D4AF37]/20 text-[#D4AF37] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
            🔱 ShaadiSaathi Imperial Fleet
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
            Fleet Registry <span className="bg-gradient-to-r from-[#C2185B] to-[#D4AF37] text-transparent bg-clip-text">Console</span>
          </motion.h1>
          <p className="text-gray-500 font-medium italic mt-2">Manage commercial vehicles, licenses, driver assignments, and live verification workflows.</p>
        </div>
        <button onClick={openAdd} className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white hover:from-[#D4AF37] hover:to-[#F4D03F] hover:text-black px-10 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-premium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3">
          <FiPlus size={20} /> Register New Vehicle
        </button>
      </div>

      {/* Metrics Summary Board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16 relative z-10">
        {[
          { label: 'Total Fleet', count: cabs.length, color: 'text-gray-900', bg: 'bg-white/80 backdrop-blur-md border-white/50 shadow-sm hover:shadow-md' },
          { label: 'Approved & Live', count: approvedCount, color: 'text-emerald-600', bg: 'bg-emerald-50/50 backdrop-blur-md border-emerald-100/50 shadow-sm hover:shadow-md' },
          { label: 'Under Review', count: pendingCount, color: 'text-[#D4AF37]', bg: 'bg-[#FDFBF7]/80 backdrop-blur-md border-[#D4AF37]/20 shadow-sm hover:shadow-md' },
          { label: 'Changes Requested', count: changesCount, color: 'text-blue-500', bg: 'bg-blue-50/50 backdrop-blur-md border-blue-100/50 shadow-sm hover:shadow-md' },
          { label: 'Saved Drafts', count: draftCount, color: 'text-purple-600', bg: 'bg-purple-50/50 backdrop-blur-md border-purple-100/50 shadow-sm hover:shadow-md' }
        ].map((m, idx) => (
          <div key={idx} className={`rounded-[2.5rem] p-8 border transition-all duration-300 hover:-translate-y-1 ${m.bg} flex flex-col justify-between`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">{m.label}</p>
            <h4 className={`font-display text-5xl font-black tracking-tight ${m.color}`}>{m.count}</h4>
          </div>
        ))}
      </div>

      {/* Notification Remarks if any changes requested */}
      {cabs.some(c => c.status === 'changes_requested') && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl p-8 mb-16 flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl flex-shrink-0">⚠️</div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Action Required: Correction Requests</h3>
            <p className="text-gray-600 text-sm italic leading-relaxed">
              Admins have requested changes for one or more vehicles in your fleet. Please review the admin remarks by clicking "Update Specs" on those cards to resubmit details.
            </p>
          </div>
        </div>
      )}

      {/* Fleet Grid */}
      {cabs.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-2xl rounded-[4rem] p-32 text-center border border-white shadow-premium relative z-10">
          <div className="w-28 h-28 bg-[#FFF8F0] rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner border border-[#D4AF37]/20">🚗</div>
          <h2 className="font-display text-3xl font-black text-gray-900 mb-2 tracking-tight">Fleet Registry Empty</h2>
          <p className="text-gray-500 font-medium italic">Complete vehicle registrations to unlock bookings on the Baraat marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
          <AnimatePresence>
            {cabs.map((cab, idx) => (
              <motion.div
                key={cab._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-[3.5rem] overflow-hidden border border-white shadow-premium group hover:shadow-2xl transition-all duration-700 relative hover:-translate-y-1"
              >
                {/* Visual Cover */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={cab.images?.find(i => i.viewType === 'front' || i.isPrimary)?.url || cab.images?.[0]?.url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={cab.name}
                  />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-[1rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                      {cab?.type?.replace('_', ' ')}
                    </span>
                    <span className={`px-4 py-2 rounded-[1rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 ${cab.status === 'approved' ? 'bg-emerald-600 text-white' :
                      cab.status === 'pending' ? 'bg-[#D4AF37] text-white' :
                        cab.status === 'changes_requested' ? 'bg-blue-600 text-white' :
                          cab.status === 'draft' ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {cab.status?.replace('_', ' ') || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-display font-black text-2xl text-gray-900 mb-2 leading-tight">{cab.name}</h3>
                      <p className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                        <FiMapPin className="text-[#C2185B]" size={12} /> {cab.location?.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-gray-900 tracking-tight">{formatPrice(cab.price || cab.pricing?.baseFare)}</p>
                      <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Day Rate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100/50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Plate No</p>
                      <p className="font-black text-sm text-gray-900 uppercase">{cab.vehicleNumber}</p>
                    </div>
                    <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100/50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Inventory Today</p>
                      <p className="font-black text-sm text-gray-900">
                        {cab.availableFleet > 0 ? (
                           <span className="text-emerald-600">{cab.availableFleet} Available</span>
                        ) : (
                           <span className="text-red-500">Sold Out Today</span>
                        )}
                        <span className="text-gray-400 text-xs ml-2">/ {cab.totalFleet} Total</span>
                      </p>
                    </div>
                  </div>

                  {cab.status === 'changes_requested' && cab.rejectionReason && (
                    <div className="bg-blue-50/50 backdrop-blur-md border border-blue-100/50 rounded-[2rem] p-6 mb-8">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-2">Admin Remarks</span>
                      <p className="text-xs italic text-blue-800 leading-relaxed font-medium">"{cab.rejectionReason}"</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => openEdit(cab)}
                      className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 shadow-lg ${cab.status === 'changes_requested' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white hover:shadow-xl'
                        }`}
                    >
                      <FiEdit2 size={14} /> {cab.status === 'draft' ? 'Continue Setup' : cab.status === 'changes_requested' ? 'Correct Specs' : 'Update Specs'}
                    </button>
                    {cab.status !== 'pending' && (
                      <button onClick={() => handleDelete(cab._id)} className="w-14 h-14 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Scrollable One-Page Multi-Section Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!isUploading) setShowModal(false) }} className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#F8F9FA] rounded-[2rem] md:rounded-[3rem] w-full max-w-5xl relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden max-h-[95vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 shadow-sm z-20 relative">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-[#D4AF37] flex items-center justify-center shadow-lg border border-gray-800 shrink-0">
                    <FaTruck size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                      {editingCab ? `Edit ${formData.name || 'Vehicle'}` : 'Register New Fleet Vehicle'}
                    </h2>
                    <p className="text-xs md:text-sm font-medium text-gray-500 mt-1">
                      Complete the details below to publish your vehicle on the premium marketplace.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} disabled={isUploading} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"><FiX size={20} /></button>
              </div>

              {isUploading && (
                <div className="w-full bg-amber-50 border-b border-amber-100 px-8 py-4 flex items-center justify-between gap-4 shadow-inner shrink-0 relative z-10">
                  <span className="text-[10px] md:text-xs font-black uppercase text-[#D4AF37] tracking-widest flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full animate-ping" />
                    Uploading Securely ({uploadProgress}%)
                  </span>
                  <div className="flex-1 max-w-xs bg-amber-100/50 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#D4AF37] h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Scrolling Content Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-8 md:space-y-10 relative z-0">

                {/* 🚗 Vehicle Information */}
                <section id="section-1" className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl shadow-sm border border-blue-100">🚗</div>
                    <div>
                      <h3 className="font-display text-xl font-black text-gray-900">Vehicle Information</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Basic details, legal documents, and driver assignment.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Commercial Fleet Name *</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Wedding Mercedes S-Class" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Category *</label>
                      <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-xs uppercase tracking-widest text-gray-900 outline-none transition-all">
                        <option value="sedan">Premium Sedan</option>
                        <option value="suv">Luxury SUV</option>
                        <option value="luxury_car">Ultra Luxury Car</option>
                        <option value="vintage_car">Royal Vintage Car</option>
                        <option value="bus">Guest Coach Bus</option>
                        <option value="tempo_traveller">Tempo Traveller</option>
                        <option value="horse_carriage">Groom Horse Carriage</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Registration/Plate Number *</label>
                      <input required type="text" value={formData.vehicleNumber} onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value, registrationNumber: e.target.value })} placeholder="e.g. BR 01 AP 9999" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all uppercase" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Brand/Make *</label>
                      <input type="text" value={formData.brand || ''} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Mercedes-Benz" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Model Name *</label>
                      <input type="text" value={formData.model || ''} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="e.g. S-Class S450" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Model Year *</label>
                        <input type="number" value={formData.modelYear} onChange={e => setFormData({ ...formData, modelYear: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Vehicle Color *</label>
                        <input type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="e.g. Black" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Seating Capacity *</label>
                        <input type="number" min="1" value={formData.seatingCapacity} onChange={e => setFormData({ ...formData, seatingCapacity: parseInt(e.target.value) || 4 })} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Total Fleet Size *</label>
                        <input type="number" min="1" value={formData.totalFleet} onChange={e => setFormData({ ...formData, totalFleet: parseInt(e.target.value) || 1 })} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Fuel Type *</label>
                        <select value={formData.fuelType} onChange={e => setFormData({ ...formData, fuelType: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-xs uppercase tracking-widest text-gray-900 outline-none transition-all">
                          <option value="diesel">Diesel</option>
                          <option value="petrol">Petrol</option>
                          <option value="cng">CNG</option>
                          <option value="electric">Electric</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end">
                        <label className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-2 border-transparent hover:border-blue-200 rounded-2xl cursor-pointer transition-all">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Air Conditioning</span>
                          <input type="checkbox" checked={formData.ac} onChange={e => setFormData({ ...formData, ac: e.target.checked })} className="w-5 h-5 accent-blue-500" />
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-gray-100">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2"><FiUser /> Driver Assignment</h4>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Driver Name *</label>
                          <input required type="text" value={formData.driverDetails.name} onChange={e => setFormData({ ...formData, driverDetails: { ...formData.driverDetails, name: e.target.value } })} placeholder="Full Name" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3 font-bold text-gray-900 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Driver Phone *</label>
                          <input required type="text" value={formData.driverDetails.phone} onChange={e => setFormData({ ...formData, driverDetails: { ...formData.driverDetails, phone: e.target.value } })} placeholder="Phone Number" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3 font-bold text-gray-900 outline-none transition-all" />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center justify-between w-full px-5 py-3 bg-gray-50 border-2 border-transparent hover:border-blue-200 rounded-2xl cursor-pointer transition-all">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Uniform Ready</span>
                            <input type="checkbox" checked={formData.driverDetails.uniformAvailable} onChange={e => setFormData({ ...formData, driverDetails: { ...formData.driverDetails, uniformAvailable: e.target.checked } })} className="w-4 h-4 accent-blue-500" />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-gray-100">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2"><FiShield /> Legal Documents</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { key: 'registrationCertificate', label: 'RC Book *' },
                          { key: 'insuranceCertificate', label: 'Insurance *' },
                          { key: 'drivingLicense', label: 'Driver DL *' },
                          { key: 'ownerIdProof', label: 'Owner ID *' }
                        ].map((doc) => {
                          const existingDoc = formData.documents?.[doc.key]
                          return (
                            <div key={doc.key} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between h-36">
                              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 leading-snug">{doc.label}</span>
                              {existingDoc?.url ? (
                                <div className="flex gap-2">
                                  <a href={existingDoc.url} target="_blank" rel="noreferrer" className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest text-center shadow-sm hover:border-green-500 hover:text-green-600 transition-colors">View</a>
                                  <button type="button" onClick={() => removeDoc(doc.key)} className="w-10 bg-white border border-gray-200 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"><FiTrash2 size={14} /></button>
                                </div>
                              ) : (
                                <button type="button" onClick={() => fileInputRefs[doc.key].current.click()} disabled={isUploading} className="w-full bg-white border border-dashed border-gray-300 hover:border-blue-500 text-gray-400 hover:text-blue-500 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                  <FiUpload size={12} /> Upload
                                </button>
                              )}
                              <input type="file" ref={fileInputRefs[doc.key]} className="hidden" onChange={e => handleDocUpload(e, doc.key)} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 💰 Pricing Information */}
                <section id="section-2" className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl shadow-sm border border-emerald-100">💰</div>
                    <div>
                      <h3 className="font-display text-xl font-black text-gray-900">Pricing Information</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Base fares, additional charges, and premium packages.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Base Booking Price (Min Fare) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
                        <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value, pricing: { ...formData.pricing, baseFare: e.target.value } })} className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 font-black text-lg text-gray-900 outline-none transition-all shadow-sm" />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Per KM Charge *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
                        <input required type="number" value={formData.pricing.extraKmCharges} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, extraKmCharges: e.target.value } })} className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 font-black text-lg text-gray-900 outline-none transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Driver Allowance (₹)</label>
                      <input type="number" value={formData.pricing.driverCharges} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, driverCharges: e.target.value } })} className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 font-bold text-gray-900 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Decoration Charges (₹)</label>
                      <input type="number" value={formData.pricing.decorationCharges} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, decorationCharges: e.target.value } })} className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 font-bold text-gray-900 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Advance % Required</label>
                      <input type="number" value={formData.pricing.advancePercentage} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, advancePercentage: e.target.value } })} className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 font-bold text-emerald-600 outline-none transition-all" />
                    </div>
                  </div>

                  {/* Packages UI simplified */}
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Premium Packages</h4>
                      <button type="button" onClick={addPackage} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"><FiPlus /> Add Package</button>
                    </div>
                    {formData.packages && formData.packages.length > 0 ? (
                      <div className="space-y-4">
                        {formData.packages.map((pkg, idx) => (
                          <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative group pr-14">
                            <button type="button" onClick={() => removePackage(idx)} className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><FiTrash2 size={16} /></button>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <input type="text" value={pkg.name} onChange={e => updatePackage(idx, 'name', e.target.value)} placeholder="Name (e.g. Platinum)" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold w-full outline-none focus:border-emerald-500" />
                              <input type="number" value={pkg.price} onChange={e => updatePackage(idx, 'price', e.target.value)} placeholder="Price (₹)" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-600 w-full outline-none focus:border-emerald-500" />
                              <input type="number" value={pkg.hours} onChange={e => updatePackage(idx, 'hours', e.target.value)} placeholder="Hours" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold w-full outline-none focus:border-emerald-500" />
                              <input type="number" value={pkg.kmLimit} onChange={e => updatePackage(idx, 'kmLimit', e.target.value)} placeholder="KM Limit" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold w-full outline-none focus:border-emerald-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No custom packages added. Standard base pricing will apply.</p>
                    )}
                  </div>
                </section>

                {/* 👥 Capacity Details */}
                <section id="section-3" className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xl shadow-sm border border-purple-100">👥</div>
                    <div>
                      <h3 className="font-display text-xl font-black text-gray-900">Capacity Details</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Passenger limits and operational features.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Seating Capacity *</label>
                      <input required type="number" min="1" value={formData.seatingCapacity} onChange={e => setFormData({ ...formData, seatingCapacity: e.target.value })} className="w-full bg-white border border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-black text-lg text-gray-900 outline-none transition-all shadow-sm" />
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Quantity Available *</label>
                      <input required type="number" min="1" value={formData.quantityAvailable || 1} onChange={e => setFormData({ ...formData, quantityAvailable: e.target.value })} className="w-full bg-white border border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-black text-lg text-gray-900 outline-none transition-all shadow-sm" />
                    </div>

                    <label className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-2xl cursor-pointer transition-all">
                      <div>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Chauffeur Included</span>
                        <span className="text-[9px] text-gray-400">Driver is included in base fare</span>
                      </div>
                      <input type="checkbox" checked={formData.driverIncluded} onChange={e => setFormData({ ...formData, driverIncluded: e.target.checked })} className="w-5 h-5 accent-purple-500" />
                    </label>

                    <label className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-2xl cursor-pointer transition-all">
                      <div>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Outstation Trips</span>
                        <span className="text-[9px] text-gray-400">Allow inter-city travel bookings</span>
                      </div>
                      <input type="checkbox" checked={formData.outstationAvailable} onChange={e => setFormData({ ...formData, outstationAvailable: e.target.checked })} className="w-5 h-5 accent-purple-500" />
                    </label>
                  </div>
                </section>

                {/* 📸 Vehicle Images */}
                <section id="section-4" className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 text-xl shadow-sm border border-pink-100">📸</div>
                    <div>
                      <h3 className="font-display text-xl font-black text-gray-900">Vehicle Images</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">High-quality photos from multiple angles.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                      { type: 'front', label: 'Front View *' },
                      { type: 'back', label: 'Back View *' },
                      { type: 'side', label: 'Side View *' },
                      { type: 'interior', label: 'Interior View *' }
                    ].map((view) => {
                      const existingImg = formData.images?.find(img => img.viewType === view.type)
                      return (
                        <div key={view.type} className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center bg-gray-50 py-1.5 rounded-lg border border-gray-200">{view.label}</span>
                          {existingImg ? (
                            <div className="aspect-square rounded-2xl relative overflow-hidden group border-2 border-gray-200 shadow-sm">
                              <img src={existingImg.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button type="button" onClick={() => removeViewImage(view.type)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"><FiTrash2 size={16} /></button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRefs[view.type].current.click()}
                              disabled={isUploading}
                              className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-all flex flex-col items-center justify-center p-4 bg-gray-50/50 group"
                            >
                              {uploadingField === view.type ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                  <span className="text-[9px] font-black text-pink-500">{uploadProgress}%</span>
                                </div>
                              ) : isUploading ? (
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-300 group-hover:text-pink-400 mb-2 border border-gray-100 transition-colors"><FiUpload size={16} /></div>
                                  <span className="text-[8px] font-black uppercase text-center leading-tight">Upload<br />{view.type}</span>
                                </>
                              )}
                            </button>
                          )}
                          <input type="file" ref={fileInputRefs[view.type]} className="hidden" accept="image/*" onChange={e => handleViewImageUpload(e, view.type)} />
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* 📅 Availability */}
                <section id="section-5" className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-xl shadow-sm border border-amber-100">📅</div>
                    <div>
                      <h3 className="font-display text-xl font-black text-gray-900">Availability & Location</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Define your service area and active operating days.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Base Operations City *</label>
                      <select value={formData.location.city} onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-xs uppercase tracking-widest text-gray-900 outline-none transition-all shadow-inner">
                        {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Base State *</label>
                      <input type="text" value={formData.location.state} onChange={e => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })} className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-gray-900 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Operations Schedule (Active Days)</label>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                        const isActive = formData.availableDates?.includes(day)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekday(day)}
                            className={`flex-1 min-w-[80px] py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${isActive ? 'bg-amber-500 text-white border-transparent shadow-md hover:bg-amber-600' : 'bg-white text-gray-400 border-gray-200 hover:border-amber-300 hover:text-amber-500'}`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </section>
              </div>

              {/* Sticky Footer */}
              <div className="p-6 md:p-8 border-t border-gray-200 bg-white shrink-0 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20 relative">
                <div className="flex items-start gap-3 flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <input required type="checkbox" checked={agreeChecked} onChange={e => setAgreeChecked(e.target.checked)} id="agreeCheck" className="mt-0.5 w-5 h-5 accent-gray-900 cursor-pointer shrink-0" />
                  <label htmlFor="agreeCheck" className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed cursor-pointer">
                    I declare that all registration details, insurance coverages, and chauffeur qualifications are accurate and comply with local regulations.
                  </label>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto flex-col sm:flex-row">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="button" onClick={e => handleSubmit(e, 'draft')} className="w-full sm:w-auto px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-700 bg-white border border-gray-200 hover:border-gray-400 shadow-sm transition-all">Save Draft</button>
                  <button type="button" onClick={e => handleSubmit(e, 'pending')} disabled={!agreeChecked || isUploading} className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-black disabled:opacity-50 disabled:hover:bg-gray-900 shadow-lg transition-all transform active:scale-95 whitespace-nowrap">
                    Submit Vehicle
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
