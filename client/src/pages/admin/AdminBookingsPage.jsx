import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminBookings, updateBookingStatus, updateCabBookingStatus, updateLocalBooking, deleteBooking } from '../../store/slices/bookingSlice'
import { formatPrice, formatDateShort, getStatusColor } from '../../utils/helpers'
import { FiSearch, FiArrowRight, FiTrash2, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '../../utils/socket'
import Modal from '../../components/common/Modal'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }
]

export default function AdminBookingsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const socket = getSocket()
  const { adminBookings, loading, counts, pagination } = useSelector(s => s.booking)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const initialType = searchParams.get('type') || 'services'
  const [activeTab, setActiveTab] = useState('all')
  const [bookingType, setBookingType] = useState(initialType)
  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const pollTimer = useRef(null)

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchVal)
      setPage(1) // Reset to page 1 on new search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchVal])

  const fetchData = useCallback(() => {
    dispatch(fetchAdminBookings({
      status: activeTab === 'all' ? undefined : activeTab,
      search: search || undefined,
      type: bookingType,
      page,
      limit: 20
    }))
  }, [dispatch, activeTab, search, bookingType, page])

  useEffect(() => {
    fetchData()
    pollTimer.current = setInterval(fetchData, 45000)
    return () => clearInterval(pollTimer.current)
  }, [fetchData])

  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => {
      fetchData();
    };

    const handleNewBooking = () => {
      toast.success('System Alert: New Reservation!', { icon: '📢' });
      handleRefresh();
    };

    socket.on('new_booking_admin', handleNewBooking);
    
    const handleUpdate = (data) => {
      const booking = data?.booking || data;
      if (booking) {
        dispatch(updateLocalBooking(booking))
        handleRefresh()
      }
    };

    socket.on('booking_updated', handleUpdate);
    socket.on('bookingUpdated', handleUpdate);

    return () => {
      socket.off('new_booking_admin', handleNewBooking);
      socket.off('booking_updated', handleUpdate);
      socket.off('bookingUpdated', handleUpdate);
    }
  }, [socket, dispatch, activeTab, bookingType])

  const handleStatusChange = async (id, newStatus) => {
    if (bookingType === 'services') {
      await dispatch(updateBookingStatus({ id, status: newStatus }))
    } else {
      await dispatch(updateCabBookingStatus({ id, status: newStatus }))
    }
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    await dispatch(deleteBooking(deleteConfirm))
    setDeleteConfirm(null)
    fetchData()
  }

  const handleTypeChange = (type) => {
    setBookingType(type)
    setSearchParams({ type })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ── Admin Header ── */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-xl text-primary-600"><FiActivity size={18}/></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">System Administration</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">Marketplace <br/><span className="text-primary-600">Reservations</span></h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative group">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  value={searchVal} 
                  onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setSearch(searchVal)}
                  placeholder="Search ID, Customer, Vendor..." 
                  className="bg-white border-2 border-gray-100 rounded-3xl pl-14 pr-8 py-5 text-sm font-bold w-full md:w-96 focus:outline-none focus:border-primary-100 shadow-sm transition-all" 
                />
             </div>
             
             <div className="flex bg-gray-100 p-1.5 rounded-[1.75rem] shadow-inner border border-gray-100">
              {[
                { id: 'services', label: 'Services' },
                { id: 'cabs', label: 'Fleet' }
              ].map(type => (
                <button 
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${bookingType === type.id ? 'bg-white text-gray-900 shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Status Tabs ── */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide mb-10">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1) }}
              className={`px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 flex items-center gap-4 group border-2 ${activeTab === tab.id 
                ? 'bg-gray-900 text-white border-gray-900 shadow-2xl scale-105' 
                : 'bg-white border-transparent text-gray-400 hover:border-gray-100 hover:text-gray-900 shadow-sm'}`}
            >
              {tab.label}
              <span className={`px-3 py-1.5 rounded-xl text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                {counts?.[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* ── Desktop Table / Mobile Cards ── */}
        <div className="bg-white rounded-[3rem] shadow-premium border border-gray-50 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="table-responsive w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Booking ID</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Name</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Phone</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Email</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Vendor Name</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Service Name</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Event Date</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">City</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Guests</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Total Price</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Status</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Created Date</th>
                  <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan={14} className="py-10 px-6"><div className="h-12 bg-gray-50 rounded-2xl animate-pulse" /></td></tr>
                    ))
                  ) : adminBookings.length === 0 ? (
                    <tr><td colSpan={14} className="py-32 text-center">
                       <p className="text-4xl mb-4">📭</p>
                       <p className="font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">No reservations matched your criteria</p>
                    </td></tr>
                  ) : adminBookings.map((b, i) => (
                    <motion.tr 
                      key={b._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td data-label="Booking ID" className="py-6 px-6 font-black text-gray-900 text-xs">{b.bookingId}</td>
                      <td data-label="Customer Name" className="py-6 px-6 font-bold text-gray-700 text-xs">{b.contactName || b.user?.name || 'N/A'}</td>
                      <td data-label="Customer Phone" className="py-6 px-6 text-gray-600 text-xs whitespace-nowrap">{b.contactPhone || b.user?.phone || 'N/A'}</td>
                      <td data-label="Customer Email" className="py-6 px-6 text-gray-600 text-xs max-w-[150px] truncate">{b.contactEmail || b.user?.email || 'N/A'}</td>
                      <td data-label="Vendor Name" className="py-6 px-6 font-bold text-gray-800 text-xs">{b.vendor?.businessName || b.vendorProfileId?.businessName || 'N/A'}</td>
                      <td data-label="Service Name" className="py-6 px-6 font-semibold text-[#C2185B] text-xs">{b.serviceName || 'N/A'}</td>
                      <td data-label="Category" className="py-6 px-6 text-gray-500 font-bold text-[10px] uppercase tracking-wider">{b.serviceCategory || (b.bookingType === 'baraat-cab' ? 'Cab' : 'Wedding Service')}</td>
                      <td data-label="Event Date" className="py-6 px-6 text-gray-600 text-xs whitespace-nowrap">{formatDateShort(b.eventDate)}</td>
                      <td data-label="City" className="py-6 px-6 text-gray-600 text-xs">{b.eventCity || b.pickupLocation?.city || 'N/A'}</td>
                      <td data-label="Guests" className="py-6 px-6 text-gray-600 text-xs text-center">{b.guestCount || 'N/A'}</td>
                      <td data-label="Total Price" className="py-6 px-6 font-display font-black text-sm text-gray-900 tracking-tight">{formatPrice(b.amount || b.totalPrice)}</td>
                      <td data-label="Booking Status" className="py-6 px-6">
                         <select 
                            value={b.status} 
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            className={`text-[9px] font-black uppercase tracking-widest border-2 rounded-xl px-3 py-2 outline-none shadow-sm cursor-pointer transition-all ${getStatusColor(b.status)} border-transparent focus:border-gray-200`}
                         >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rejected">Rejected</option>
                         </select>
                      </td>
                      <td data-label="Created Date" className="py-6 px-6 text-gray-500 text-xs whitespace-nowrap">{formatDateShort(b.createdAt)}</td>
                      <td data-label="Action" className="py-6 px-6">
                         <div className="flex items-center justify-center gap-2">
                            <button onClick={() => navigate(`/admin/bookings/${b._id}`)} className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-primary-600 transition-all shadow-md" title="View Details">
                               <FiArrowRight size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(b._id)} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-100 transition-all" title="Delete">
                               <FiTrash2 size={14} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block xl:hidden p-6 space-y-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-gray-50 rounded-3xl animate-pulse" />
              ))
            ) : adminBookings.length === 0 ? (
              <div className="py-20 text-center">
                 <p className="text-4xl mb-4">📭</p>
                 <p className="font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">No reservations matched your criteria</p>
              </div>
            ) : (
              adminBookings.map((b) => (
                <div key={b._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <div>
                      <p className="font-black text-gray-900 text-sm">{b.bookingId}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{formatDateShort(b.createdAt)}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Customer</p>
                      <p className="font-bold text-gray-800 mt-0.5">{b.contactName || b.user?.name}</p>
                      <p className="text-gray-500 text-[11px]">{b.contactPhone || b.user?.phone}</p>
                      <p className="text-gray-400 text-[10px] truncate">{b.contactEmail || b.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Vendor</p>
                      <p className="font-bold text-gray-800 mt-0.5">{b.vendor?.businessName || b.vendorProfileId?.businessName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Service</p>
                      <p className="font-semibold text-[#C2185B] mt-0.5">{b.serviceName || 'N/A'}</p>
                      <p className="text-gray-400 text-[10px] uppercase font-bold">{b.serviceCategory || (b.bookingType === 'baraat-cab' ? 'Cab' : 'Wedding Service')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Event Details</p>
                      <p className="font-bold text-gray-800 mt-0.5">{formatDateShort(b.eventDate)}</p>
                      <p className="text-gray-500 text-[11px]">{b.eventCity || b.pickupLocation?.city || 'N/A'} ({b.guestCount || 0} guests)</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Total Price</p>
                      <p className="font-display font-black text-lg text-gray-900">{formatPrice(b.amount || b.totalPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/bookings/${b._id}`)} className="px-4 py-3 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-2">
                        View Details <FiArrowRight size={12} />
                      </button>
                      <button onClick={() => setDeleteConfirm(b._id)} className="w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          {pagination && pagination.pages > 1 && (
            <div className="p-10 border-t border-gray-50 flex justify-between items-center bg-gray-50/20">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Showing page {page} of {pagination.pages}</p>
              <div className="flex gap-3">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p} 
                    onClick={() => { setPage(p); window.scrollTo(0, 0) }}
                    className={`w-12 h-12 rounded-[1.25rem] font-black text-xs transition-all ${page === p ? 'bg-gray-900 text-white shadow-xl scale-110' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-900'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Destructive Action" size="sm">
        <div className="p-10 text-center">
           <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner"><FiTrash2 /></div>
           <h3 className="font-display font-black text-2xl text-gray-900 mb-3 tracking-tight">Delete Reservation?</h3>
           <p className="text-gray-400 text-sm font-medium italic mb-10 leading-relaxed px-6">This will permanently remove the record from the database. This action is irreversible.</p>
           <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 font-black text-[10px] uppercase tracking-widest text-gray-400">Cancel</button>
              <button onClick={handleDelete} className="flex-2 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest py-5 px-8 rounded-2xl shadow-xl shadow-red-100">Delete Permanently</button>
           </div>
        </div>
      </Modal>
    </div>
  )
}
