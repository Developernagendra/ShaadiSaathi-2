import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  FiCalendar, FiClock, FiPlus, FiEdit2, FiTrash2, FiCheckCircle,
  FiCircle, FiArrowLeft, FiAlertCircle, FiCheck, FiX, FiMapPin, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const DEFAULT_TIMELINE_EVENTS = [
  {
    _id: 'default-1',
    title: 'Roka / Engagement (रोका)',
    date: '2026-11-10',
    time: '18:00',
    description: 'Formal announcement of the wedding and ring ceremony.',
    notes: 'Confirm ring size and photographer arrival time.',
    location: 'Bride Family Residence / Banquet',
    isCompleted: true
  },
  {
    _id: 'default-2',
    title: 'Tilak / Shagun Ceremony (तिलक)',
    date: '2026-11-18',
    time: '11:00',
    description: 'Traditional Bihari Tilak ceremony at the Groom residence.',
    notes: 'Arrange thali and auspicious items for Pandit ji.',
    location: 'Groom Family Residence',
    isCompleted: false
  },
  {
    _id: 'default-3',
    title: 'Mehndi Ceremony (मेहंदी रस्म)',
    date: '2026-11-19',
    time: '16:00',
    description: 'Bridal Mehndi and family folk song evening.',
    notes: 'Mehndi artists booked for 20 ladies.',
    location: 'Wedding Venue Lawn',
    isCompleted: false
  },
  {
    _id: 'default-4',
    title: 'Haldi & Matkor Ceremony (हल्दी और मटकोर)',
    date: '2026-11-20',
    time: '09:00',
    description: 'Sacred Haldi application with traditional Mithila Matkor rituals.',
    notes: 'Keep yellow floral jewelry ready.',
    location: 'Main Lawn',
    isCompleted: false
  },
  {
    _id: 'default-5',
    title: 'Sangeet & DJ Night (संगीत और डीजे नाइट)',
    date: '2026-11-20',
    time: '19:30',
    description: 'Music, dance performances, and family celebrations.',
    notes: 'Coordinate sound check with DJ vendor.',
    location: 'Grand Ballroom',
    isCompleted: false
  },
  {
    _id: 'default-6',
    title: 'Baraat Procession (बारात प्रस्थान)',
    date: '2026-11-21',
    time: '18:30',
    description: 'Baraat arrival with Band, Vintage Car/Ghodi, and fireworks.',
    notes: 'Verify Baraat luxury cabs schedule.',
    location: 'From Groom Hotel to Wedding Palace',
    isCompleted: false
  },
  {
    _id: 'default-7',
    title: 'Jaimala & Wedding Vidhi (जयमाला और विवाह)',
    date: '2026-11-21',
    time: '21:30',
    description: 'Garland exchange followed by sacred Saat Phere.',
    notes: 'Pandit ji Muhurat starts at 10:45 PM.',
    location: 'Main Mandap Stage',
    isCompleted: false
  },
  {
    _id: 'default-8',
    title: 'Bidai (विदाई)',
    date: '2026-11-22',
    time: '06:00',
    description: 'Emotional send-off ceremony for the bride.',
    notes: 'Decorated departure car ready at gate.',
    location: 'Wedding Palace Gate',
    isCompleted: false
  }
];

export default function WeddingTimelinePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth || {});
  const isLoggedIn = !!authState.isAuthenticated || !!authState.token || !!authState.user;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planId, setPlanId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    description: '',
    notes: '',
    location: ''
  });

  useEffect(() => {
    fetchTimelineEvents();
  }, [isLoggedIn]);

  const fetchTimelineEvents = async () => {
    setLoading(true);
    if (isLoggedIn) {
      try {
        const { data } = await api.get('/weddings/my');
        if (data && data.plan) {
          setPlanId(data.plan._id);
          if (data.plan.events && data.plan.events.length > 0) {
            setEvents(data.plan.events);
          } else {
            setEvents(DEFAULT_TIMELINE_EVENTS);
          }
        } else {
          // No plan found on backend, load from localStorage or defaults
          loadLocalOrDefault();
        }
      } catch (err) {
        console.warn('Could not fetch backend wedding plan, using local events:', err);
        loadLocalOrDefault();
      }
    } else {
      loadLocalOrDefault();
    }
    setLoading(false);
  };

  const loadLocalOrDefault = () => {
    const saved = localStorage.getItem('shaadisaathi_timeline_events');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        setEvents(DEFAULT_TIMELINE_EVENTS);
      }
    } else {
      setEvents(DEFAULT_TIMELINE_EVENTS);
    }
  };

  const saveToLocal = (newEvents) => {
    localStorage.setItem('shaadisaathi_timeline_events', JSON.stringify(newEvents));
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      description: '',
      notes: '',
      location: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: event.time || '12:00',
      description: event.description || '',
      notes: event.notes || '',
      location: event.location || ''
    });
    setShowModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }

    if (planId && isLoggedIn) {
      try {
        if (editingEvent && editingEvent._id && !editingEvent._id.toString().startsWith('default-')) {
          await api.put(`/weddings/${planId}/events/${editingEvent._id}`, formData);
          toast.success('Event updated successfully');
        } else {
          await api.post(`/weddings/${planId}/events`, formData);
          toast.success('Event added successfully');
        }
        await fetchTimelineEvents();
        setShowModal(false);
        return;
      } catch (err) {
        console.warn('API save failed, falling back to local state');
      }
    }

    // Local / unauthenticated handling
    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map((ev) =>
        ev._id === editingEvent._id ? { ...ev, ...formData } : ev
      );
      toast.success('Timeline event updated');
    } else {
      const newEvent = {
        _id: 'local-' + Date.now(),
        ...formData,
        isCompleted: false
      };
      updatedEvents = [...events, newEvent];
      toast.success('Timeline event added');
    }

    // Sort chronologically by date then time
    updatedEvents.sort((a, b) => {
      const dtA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dtB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dtA - dtB;
    });

    setEvents(updatedEvents);
    saveToLocal(updatedEvents);
    setShowModal(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event from your timeline?')) return;

    if (planId && isLoggedIn && !eventId.toString().startsWith('default-') && !eventId.toString().startsWith('local-')) {
      try {
        await api.delete(`/weddings/${planId}/events/${eventId}`);
        toast.success('Event deleted');
        fetchTimelineEvents();
        return;
      } catch (err) {
        console.warn('API delete failed, updating locally');
      }
    }

    const updated = events.filter((ev) => ev._id !== eventId);
    setEvents(updated);
    saveToLocal(updated);
    toast.success('Event deleted');
  };

  const handleToggleComplete = async (eventId, currentStatus) => {
    if (planId && isLoggedIn && !eventId.toString().startsWith('default-') && !eventId.toString().startsWith('local-')) {
      try {
        await api.put(`/weddings/${planId}/events/${eventId}`, { isCompleted: !currentStatus });
        fetchTimelineEvents();
        return;
      } catch (err) {
        console.warn('API status toggle failed');
      }
    }

    const updated = events.map((ev) =>
      ev._id === eventId ? { ...ev, isCompleted: !currentStatus } : ev
    );
    setEvents(updated);
    saveToLocal(updated);
  };

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const dtA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dtB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dtA - dtB;
  });

  const filteredEvents = sortedEvents.filter((ev) => {
    if (filter === 'completed') return ev.isCompleted;
    if (filter === 'upcoming') return !ev.isCompleted;
    return true;
  });

  const completedCount = events.filter((ev) => ev.isCompleted).length;
  const totalCount = events.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[calc(var(--navbar-height,76px)+1rem)] font-sans pb-28 overflow-x-hidden">
      {/* ── 1. HERO HEADER ── */}
      <div className="bg-gradient-to-r from-[#8E244D] via-[#C2185B] to-[#9c1349] text-white py-12 md:py-16 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 floral-pattern opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 text-pink-200 hover:text-white font-semibold text-sm mb-4 transition-colors"
              >
                <FiArrowLeft /> Back to Tools Hub
              </Link>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight">
                {t('tools.timeline_title', 'Wedding Timeline Planner 📅')}
              </h1>
              <p className="text-pink-100 text-base md:text-lg mt-2 max-w-2xl font-medium">
                {t('tools.timeline_subtitle', 'Plan every auspicious ceremony, ritual, and event in perfect chronological order.')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenAddModal}
                className="px-6 py-3.5 bg-white text-[#C2185B] font-bold rounded-xl shadow-lg hover:bg-pink-50 transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                <FiPlus size={18} /> Add Timeline Event
              </button>
            </div>
          </div>

          {/* Progress Bar Banner */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <div className="flex items-center justify-between text-sm font-bold mb-2">
              <span>Timeline Progress</span>
              <span>{completedCount} of {totalCount} Events Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D4AF37] to-amber-300 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER & TOOLBAR ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'all'
                  ? 'bg-[#C2185B] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Events ({totalCount})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'upcoming'
                  ? 'bg-[#C2185B] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Upcoming ({totalCount - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'completed'
                  ? 'bg-[#C2185B] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!isLoggedIn && (
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold flex items-center gap-1.5">
                <FiAlertCircle /> Saved locally. <Link to="/login" className="underline font-bold">Login</Link> to sync.
              </span>
            )}
            <button
              onClick={() => setEvents(DEFAULT_TIMELINE_EVENTS)}
              className="text-xs text-gray-600 hover:text-[#C2185B] font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors"
              title="Reset to default Bihari wedding timeline"
            >
              <FiRefreshCw size={14} /> Reset Defaults
            </button>
          </div>
        </div>

        {/* ── 3. TIMELINE EVENTS VIEW ── */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-[#C2185B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Loading your wedding timeline...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center my-8 shadow-sm border border-gray-100 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-[#C2185B] text-3xl mx-auto mb-4">
              <FiCalendar />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No timeline events found</h3>
            <p className="text-gray-500 text-sm mb-6">
              You haven't added any events for this filter yet. Create custom ceremonies or reset to defaults!
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 bg-[#C2185B] text-white font-bold rounded-xl shadow-md hover:bg-[#a3154d] transition-all inline-flex items-center gap-2"
            >
              <FiPlus /> Add First Event
            </button>
          </div>
        ) : (
          <div className="mt-8 relative">
            {/* Vertical timeline spine */}
            <div className="absolute left-6 md:left-48 top-4 bottom-4 w-1 bg-gradient-to-b from-[#C2185B] via-pink-300 to-gray-200 rounded-full pointer-events-none" />

            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const eventDateFormatted = event.date
                  ? new Date(event.date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                  : 'Date TBD';

                return (
                  <motion.div
                    key={event._id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col md:flex-row items-start relative pl-16 md:pl-0 group"
                  >
                    {/* Desktop Date/Time Column */}
                    <div className="hidden md:block w-40 pr-8 text-right pt-4 shrink-0">
                      <div className="font-black text-gray-900 text-base">{eventDateFormatted}</div>
                      <div className="text-xs font-semibold text-gray-500 flex items-center justify-end gap-1 mt-1">
                        <FiClock size={12} className="text-[#C2185B]" /> {event.time || '12:00 PM'}
                      </div>
                    </div>

                    {/* Timeline Node Circle */}
                    <button
                      onClick={() => handleToggleComplete(event._id, event.isCompleted)}
                      className={`absolute left-[14px] md:left-[178px] top-4 w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#FAFAFA] shadow-md z-10 transition-transform hover:scale-110 ${event.isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-[#C2185B] ring-2 ring-[#C2185B]/30'
                        }`}
                      title={event.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {event.isCompleted ? <FiCheck size={14} /> : <div className="w-2.5 h-2.5 rounded-full bg-[#C2185B]" />}
                    </button>

                    {/* Event Card Content */}
                    <div
                      className={`flex-1 w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border ${event.isCompleted
                          ? 'border-emerald-100 bg-emerald-50/20 opacity-80'
                          : 'border-pink-100/80 hover:border-pink-300'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <h3
                            className={`text-lg md:text-xl font-bold ${event.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}
                          >
                            {event.title}
                          </h3>
                          {event.isCompleted && (
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleOpenEditModal(event)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Event"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Mobile date badge */}
                      <div className="md:hidden flex items-center gap-3 text-xs font-semibold text-gray-500 mb-3">
                        <span className="bg-pink-50 text-[#C2185B] px-2.5 py-1 rounded-md font-bold">
                          {eventDateFormatted}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock size={12} /> {event.time || '12:00 PM'}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{event.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {event.location && (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full">
                            <FiMapPin className="text-[#C2185B]" /> {event.location}
                          </span>
                        )}
                        {event.notes && (
                          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 font-medium px-3 py-1 rounded-full border border-yellow-200">
                            💡 {event.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. ADD / EDIT MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Timeline Event' : 'Add New Timeline Event'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Haldi Ceremony, Reception Night"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Groom Residence, Grand Ballroom"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of rituals and activities..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Notes / Checklist Tip</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Keep flower thali ready, Pandit ji timing"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#C2185B] text-white font-bold rounded-xl shadow-lg hover:bg-[#a3154d] transition-all"
                  >
                    {editingEvent ? 'Save Changes' : 'Add Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
