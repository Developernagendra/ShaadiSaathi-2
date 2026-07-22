import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchVendorAvailability, 
  updateAvailability, 
  bulkUpdateAvailability 
} from '../../store/slices/availabilitySlice'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns'
import { FiChevronLeft, FiChevronRight, FiPlus, FiX, FiLock, FiUnlock, FiClock, FiUsers, FiSave } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../../components/common/Modal'

export default function VendorCalendarPage() {
  const dispatch = useDispatch()
  const { vendorAvailability, loading } = useSelector(s => s.availability)
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const [editForm, setEditForm] = useState({
    maxBookings: 1,
    isBlocked: false,
    blockReason: '',
    slots: []
  })

  useEffect(() => {
    dispatch(fetchVendorAvailability({
      month: currentMonth.getMonth() + 1,
      year: currentMonth.getFullYear()
    }))
  }, [dispatch, currentMonth])

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
      <div>
        <div className="divider-luxe !justify-start mb-3 !gap-3">
          <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Schedule & Capacity</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Availability Calendar</h1>
        <p className="text-gray-500 font-medium italic mt-2">Manage your slots, blocked dates, and booking capacity</p>
      </div>
      <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-[1.5rem] shadow-sm border border-white">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-3 hover:bg-gray-50 hover:text-[#C2185B] rounded-xl transition-colors text-gray-500 hover:shadow-sm"
        >
          <FiChevronLeft size={20} />
        </button>
        <span className="font-display font-black text-xl min-w-[160px] text-center text-gray-900 drop-shadow-sm">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-3 hover:bg-gray-50 hover:text-[#C2185B] rounded-xl transition-colors text-gray-500 hover:shadow-sm"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  )

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {calendarDays.map((day, idx) => {
          const availability = vendorAvailability.find(a => isSameDay(new Date(a.date), day))
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, monthStart)
          
          let bgColor = 'bg-white/50 backdrop-blur-sm'
          let textColor = 'text-gray-900'
          let statusLabel = ''

          if (availability) {
            if (availability.isBlocked) {
              bgColor = 'bg-gray-100/80 backdrop-blur-sm'
              statusLabel = 'Blocked'
            } else if (availability.status === 'booked') {
              bgColor = 'bg-red-50/80 backdrop-blur-sm'
              textColor = 'text-red-700'
              statusLabel = 'Full'
            } else if (availability.status === 'partially_booked') {
              bgColor = 'bg-amber-50/80 backdrop-blur-sm'
              textColor = 'text-amber-700'
              statusLabel = `${availability.bookedCount}/${availability.maxBookings}`
            } else {
              bgColor = 'bg-[#FDFBF7]/80 backdrop-blur-sm'
              textColor = 'text-[#D4AF37]'
              statusLabel = 'Available'
            }
          }

          if (!isCurrentMonth) {
            textColor = 'text-gray-300'
            bgColor = 'bg-gray-50/30'
          }

          return (
            <motion.button
              whileHover={isCurrentMonth ? { scale: 1.02, y: -2 } : {}}
              whileTap={isCurrentMonth ? { scale: 0.98 } : {}}
              key={idx}
              onClick={() => handleDateClick(day, availability)}
              disabled={!isCurrentMonth}
              className={`relative h-24 md:h-32 p-3 md:p-4 rounded-[1.5rem] transition-all text-left flex flex-col justify-between shadow-sm border ${
                isSelected ? 'ring-2 ring-[#C2185B] border-[#C2185B] shadow-md' : 'border-white hover:shadow-md'
              } ${bgColor} ${!isCurrentMonth && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-sm md:text-base font-black ${isToday(day) ? 'bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white w-8 h-8 flex items-center justify-center rounded-xl -mt-1 -ml-1 shadow-md' : textColor}`}>
                  {format(day, 'd')}
                </span>
                {availability?.isBlocked && <FiLock size={14} className="text-gray-400 mt-1" />}
              </div>
              
              {isCurrentMonth && statusLabel && (
                <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg self-start shadow-sm ${
                  availability?.status === 'booked' ? 'bg-red-100/80 text-red-700 border border-red-200' :
                  availability?.status === 'partially_booked' ? 'bg-amber-100/80 text-amber-700 border border-amber-200' :
                  availability?.isBlocked ? 'bg-gray-200/80 text-gray-600 border border-gray-300' :
                  'bg-white border border-[#D4AF37]/30 text-[#D4AF37]'
                }`}>
                  {statusLabel}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    )
  }

  const handleDateClick = (day, availability) => {
    setSelectedDate(day)
    if (availability) {
      setEditForm({
        maxBookings: availability.maxBookings || 1,
        isBlocked: availability.isBlocked || false,
        blockReason: availability.blockReason || '',
        slots: availability.slots || []
      })
    } else {
      setEditForm({
        maxBookings: 1,
        isBlocked: false,
        blockReason: '',
        slots: []
      })
    }
    setIsEditModalOpen(true)
  }

  const handleAddSlot = () => {
    setEditForm(prev => ({
      ...prev,
      slots: [...prev.slots, { name: 'Morning', startTime: '09:00', endTime: '12:00', maxBookings: 1 }]
    }))
  }

  const handleRemoveSlot = (index) => {
    setEditForm(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }))
  }

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...editForm.slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setEditForm(prev => ({ ...prev, slots: newSlots }))
  }

  const handleSave = () => {
    dispatch(updateAvailability({
      date: selectedDate,
      ...editForm
    }))
    setIsEditModalOpen(false)
  }

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />
      {renderHeader()}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        {/* Legend & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-sm border border-white">
            <h3 className="font-display text-2xl font-black text-gray-900 mb-6">Status Legend</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#FDFBF7]/50 p-3 rounded-xl border border-gray-100/50">
                <div className="w-5 h-5 bg-[#FDFBF7] border border-[#D4AF37]/30 rounded-lg shadow-inner" />
                <span className="text-xs font-bold text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-4 bg-amber-50/30 p-3 rounded-xl border border-gray-100/50">
                <div className="w-5 h-5 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" />
                <span className="text-xs font-bold text-gray-700">Partially Booked</span>
              </div>
              <div className="flex items-center gap-4 bg-red-50/30 p-3 rounded-xl border border-gray-100/50">
                <div className="w-5 h-5 bg-red-50 border border-red-200 rounded-lg shadow-inner" />
                <span className="text-xs font-bold text-gray-700">Fully Booked</span>
              </div>
              <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                <div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded-lg shadow-inner" />
                <span className="text-xs font-bold text-gray-700">Blocked / Leave</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-8 rounded-[2.5rem] shadow-premium text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-display text-2xl font-black mb-6 flex items-center gap-3"><FiClock className="text-[#D4AF37]" /> Quick Actions</h3>
            <div className="space-y-4 relative z-10">
              <button 
                onClick={() => {
                  const today = new Date();
                  const next30Days = Array.from({length: 30}, (_, i) => addDays(today, i));
                  dispatch(bulkUpdateAvailability({
                    dates: next30Days.map(d => format(d, 'yyyy-MM-dd')),
                    action: 'available'
                  }))
                }}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-sm"
              >
                <FiUnlock size={14} /> Open Next 30 Days
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] shadow-sm border border-white">
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={selectedDate ? `Manage: ${format(selectedDate, 'do MMMM yyyy')}` : ''}
        size="lg"
      >
        <div className="p-6 md:p-8 space-y-8">
          {/* Top Toggles */}
          <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100/50">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${editForm.isBlocked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {editForm.isBlocked ? <FiLock size={24} /> : <FiUnlock size={24} />}
              </div>
              <div>
                <p className="font-display font-black text-lg text-gray-900">{editForm.isBlocked ? 'Date is Blocked' : 'Date is Available'}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Toggle status for this specific date</p>
              </div>
            </div>
            <button 
              onClick={() => setEditForm(prev => ({ ...prev, isBlocked: !prev.isBlocked }))}
              className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                editForm.isBlocked 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:-translate-y-0.5' 
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {editForm.isBlocked ? 'Mark Available' : 'Block Date'}
            </button>
          </div>

          {!editForm.isBlocked ? (
            <>
              {/* Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Daily Booking Capacity</label>
                  <div className="flex items-center gap-4 bg-gray-50/50 px-5 py-4 rounded-2xl border border-gray-100/50">
                    <FiUsers className="text-[#D4AF37]" size={20} />
                    <input 
                      type="number" 
                      min="1" 
                      value={editForm.maxBookings}
                      onChange={(e) => setEditForm(prev => ({ ...prev, maxBookings: parseInt(e.target.value) }))}
                      className="w-full bg-transparent font-black text-xl text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Slots */}
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-display font-black text-lg text-gray-900 flex items-center gap-3">
                    <span className="p-2 bg-pink-50 text-[#C2185B] rounded-xl"><FiClock size={16} /></span> Time Slots (Optional)
                  </h4>
                  <button 
                    onClick={handleAddSlot}
                    className="bg-[#1a1a1a] hover:bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <FiPlus size={14} /> Add Slot
                  </button>
                </div>

                <div className="space-y-4">
                  {editForm.slots.map((slot, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-center gap-4 p-5 border border-gray-100 rounded-2xl bg-gray-50/30 group">
                      <input 
                        placeholder="Slot Name (e.g. Morning)" 
                        value={slot.name}
                        onChange={(e) => handleSlotChange(i, 'name', e.target.value)}
                        className="w-full md:w-1/3 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#C2185B]"
                      />
                      <input 
                        type="time" 
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(i, 'startTime', e.target.value)}
                        className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 focus:outline-none focus:border-[#C2185B]"
                      />
                      <input 
                        type="time" 
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(i, 'endTime', e.target.value)}
                        className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 focus:outline-none focus:border-[#C2185B]"
                      />
                      <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                        <input 
                          type="number" 
                          placeholder="Capacity" 
                          value={slot.maxBookings}
                          onChange={(e) => handleSlotChange(i, 'maxBookings', parseInt(e.target.value))}
                          className="w-24 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#C2185B]"
                        />
                        <button onClick={() => handleRemoveSlot(i)} className="text-gray-400 p-3 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                          <FiX size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editForm.slots.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100/50 border-dashed">
                      <FiClock size={32} className="mb-3 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No specific slots defined. User will book for the full day.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Block Reason (Internal)</label>
              <textarea 
                value={editForm.blockReason}
                onChange={(e) => setEditForm(prev => ({ ...prev, blockReason: e.target.value }))}
                placeholder="e.g. Personal vacation, Offline booking at venue..."
                className="w-full px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none h-32 resize-none font-medium text-gray-900"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-100">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 py-4 border border-gray-200 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-4 bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <FiSave size={14} /> Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
