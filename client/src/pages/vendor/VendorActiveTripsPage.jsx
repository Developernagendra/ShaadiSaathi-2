import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiClock, FiNavigation, FiPlay } from 'react-icons/fi';
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import { getSocket } from '../../utils/socket'

export default function VendorActiveTripsPage() {
  const { user } = useSelector(state => state.auth)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTrip, setActiveTrip] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef(null)

  useEffect(() => {
    loadTrips()
    return () => stopTracking()
  }, [])

  const loadTrips = async () => {
    try {
      // Fetch bookings where vendor is this user and bookingType is cab
      const { data } = await api.get(`/bookings/vendor?bookingType=cab,baraat-cab&limit=20`)
      const tripsList = data.bookings || data.data || []
      const active = tripsList.filter(b => !['cancelled', 'rejected'].includes(b.status))
      setTrips(active)
      
      // If there's already a trip in progress, set it as active
      const inProgress = active.find(b => ['en_route_pickup', 'arrived', 'in_progress'].includes(b.tripStatus))
      if (inProgress) setActiveTrip(inProgress)
    } catch (err) {
      console.error('Failed to load trips:', err);
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      toast.error(`Error ${status || 'Network'}: ${message}`);
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (tripId, newStatus) => {
    try {
      const socket = getSocket()
      if (socket) {
        socket.emit('update_trip_status', { bookingId: tripId, status: newStatus, vendorId: user._id })
      }
      
      // Local optimistic update
      setTrips(prev => prev.map(t => t._id === tripId ? { ...t, tripStatus: newStatus } : t))
      if (activeTrip && activeTrip._id === tripId) {
        setActiveTrip({ ...activeTrip, tripStatus: newStatus })
      }
      
      if (newStatus === 'completed') {
        stopTracking()
        setActiveTrip(null)
        toast.success('Trip Completed Successfully!')
      } else if (newStatus === 'en_route_pickup') {
        startTracking(tripId)
      }
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const startTracking = (tripId) => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser")
    }
    
    if (watchIdRef.current) return // already tracking

    setIsTracking(true)
    toast.success("Live Tracking Started")
    const socket = getSocket()

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (socket) {
          socket.emit('update_location', { 
            bookingId: tripId, 
            lat: latitude, 
            lng: longitude, 
            vendorId: user._id 
          })
        }
      },
      (error) => {
        console.error("GPS Error:", error)
        toast.error("GPS Signal Lost")
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-black text-gray-900 mb-2">Driver Command Center</h1>
        <p className="text-gray-500 font-medium italic">Manage active trips and broadcast your live location.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[#C2185B] border-t-transparent rounded-full" /></div>
      ) : trips.length === 0 ? (
        <div className="bg-gray-50 rounded-[3rem] p-20 text-center border border-gray-100">
          <FiNavigation className="mx-auto text-4xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">No Active Trips</h2>
          <p className="text-gray-500">You don't have any pending cab bookings for today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Trip Panel */}
          {activeTrip && (
            <div className="lg:col-span-8 bg-gray-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <FiNavigation size={28} className={isTracking ? "animate-pulse" : ""} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Current Active Trip</span>
                  <h2 className="text-3xl font-display font-black tracking-tight">{activeTrip.serviceName || 'Baraat Cab'}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Passenger</p>
                  <p className="font-bold text-lg">{activeTrip.contactName}</p>
                  <p className="text-gray-400 text-sm">{activeTrip.contactPhone}</p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pickup Location</p>
                  <p className="font-bold text-lg truncate">{activeTrip.pickupLocation?.address || activeTrip.eventCity}</p>
                </div>
              </div>

              {/* Status Stepper */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-4 mb-8">
                <button 
                  onClick={() => handleStatusChange(activeTrip._id, 'en_route_pickup')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTrip.tripStatus === 'en_route_pickup' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
                >
                  1. En Route
                </button>
                <button 
                  onClick={() => handleStatusChange(activeTrip._id, 'arrived')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTrip.tripStatus === 'arrived' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
                >
                  2. Arrived
                </button>
                <button 
                  onClick={() => handleStatusChange(activeTrip._id, 'in_progress')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTrip.tripStatus === 'in_progress' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
                >
                  3. Started
                </button>
                <button 
                  onClick={() => handleStatusChange(activeTrip._id, 'completed')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTrip.tripStatus === 'completed' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
                >
                  4. Complete
                </button>
              </div>

              {isTracking && (
                <div className="flex items-center justify-center gap-3 text-emerald-400 font-bold text-sm bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  Live GPS Streaming Active
                </div>
              )}
            </div>
          )}

          {/* Pending Trips List */}
          <div className={`${activeTrip ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-6`}>
            <h3 className="font-display text-xl font-black text-gray-900 mb-4">Assigned Trips</h3>
            
            {trips.filter(t => t.tripStatus === 'not_started').length === 0 ? (
              <div className="text-gray-400 italic text-sm">No pending trips.</div>
            ) : (
              trips.filter(t => t.tripStatus === 'not_started').map(trip => (
                <div key={trip._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-lg text-gray-900">{trip.contactName}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{trip.contactPhone}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-bold text-gray-600 flex items-center gap-2"><FiMapPin className="text-[#C2185B]" /> {trip.pickupLocation?.address || trip.eventCity}</p>
                    <p className="text-sm font-bold text-gray-600 flex items-center gap-2"><FiClock className="text-blue-500" /> {new Date(trip.eventDate).toLocaleDateString()}</p>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTrip(trip)
                      handleStatusChange(trip._id, 'en_route_pickup')
                    }}
                    className="w-full bg-[#1a1a1a] hover:bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                  >
                    <FiPlay /> Start Trip
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
