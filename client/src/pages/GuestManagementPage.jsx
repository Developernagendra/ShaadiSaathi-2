import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGuests, importGuests, exportGuests } from '../store/slices/featureSlice';
import api from '../utils/api';
import { LuUsers as Users, LuUserPlus as UserPlus, LuMail as Mail, LuPhone as Phone, LuSearch as Search, LuDownload as Download, LuUpload as Upload, LuPencil, LuTrash2, LuUtensils, LuHouse } from 'react-icons/lu';
import { FiCheckCircle as CheckCircle, FiXCircle as XCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from '../components/common/Modal';

const GuestManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const { guests, loading } = useSelector((state) => state.feature || { guests: [] });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tag: 'friends',
    guestCount: 1,
    rsvpStatus: 'pending',
    mealPreference: 'veg',
    roomAllocated: '',
    invitationSent: false
  });

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Guest List Manager', action: 'viewed_tool' }).catch(() => {});
    dispatch(fetchGuests());
  }, [dispatch]);

  const handleOpenModal = (guest = null) => {
    if (guest) {
      setSelectedGuest(guest);
      setFormData({
        name: guest.name,
        email: guest.email || '',
        phone: guest.phone || '',
        tag: guest.tag || 'friends',
        guestCount: guest.guestCount || 1,
        rsvpStatus: guest.rsvpStatus || 'pending',
        mealPreference: guest.mealPreference || 'veg',
        roomAllocated: guest.roomAllocated || '',
        invitationSent: guest.invitationSent || false
      });
    } else {
      setSelectedGuest(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        tag: 'friends',
        guestCount: 1,
        rsvpStatus: 'pending',
        mealPreference: 'veg',
        roomAllocated: '',
        invitationSent: false
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedGuest) {
        await api.patch(`/features/guests/${selectedGuest._id}`, formData);
        toast.success('Guest updated successfully');
      } else {
        await api.post('/features/guests', formData);
        toast.success('Guest added successfully');
      }
      dispatch(fetchGuests());
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    try {
      await api.delete(`/features/guests/${id}`);
      toast.success('Guest deleted');
      dispatch(fetchGuests());
    } catch (err) {
      toast.error('Failed to delete guest');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await dispatch(exportGuests()).unwrap();
      toast.success('Guest list exported successfully');
    } catch (err) {
      toast.error('Failed to export guest list');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    setIsImporting(true);
    try {
      await dispatch(importGuests(data)).unwrap();
      toast.success('Guests imported');
      e.target.value = '';
    } catch (err) {
      toast.error(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredGuests = Array.isArray(guests) ? guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Guest <span className="text-primary-600">Management</span></h1>
            <p className="text-gray-500">Manage RSVPs, meals, and room allocations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              {isImporting ? <FiLoader className="animate-spin" /> : <Upload size={18} />}
              {isImporting ? 'Importing...' : 'Import CSV'}
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2 rounded-xl"
            >
              <UserPlus size={18} /> Add Guest
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Guests', value: filteredGuests.reduce((acc, g) => acc + (g.guestCount || 1), 0), icon: <Users />, color: 'blue' },
            { label: 'Attending', value: filteredGuests.filter(g => g.rsvpStatus === 'attending').length, icon: <CheckCircle />, color: 'green' },
            { label: 'Pending', value: filteredGuests.filter(g => g.rsvpStatus === 'pending').length, icon: <XCircle />, color: 'yellow' },
            { label: 'Invites Sent', value: filteredGuests.filter(g => g.invitationSent).length, icon: <Mail />, color: 'pink' },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-50 text-green-600' :
                    stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-pink-50 text-pink-600'
                }`}>
                {stat.icon}
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || filteredGuests.length === 0}
              className="flex items-center gap-2 text-gray-600 font-bold hover:text-primary-600 transition-colors disabled:opacity-50"
            >
              {isExporting ? <FiLoader className="animate-spin" /> : <Download size={18} />}
              Export Guest List (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table-responsive w-full text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5">Guest Detail</th>
                  <th className="px-6 py-5">RSVP Status</th>
                  <th className="px-6 py-5">Meal & Group</th>
                  <th className="px-6 py-5">Accommodation</th>
                  <th className="px-6 py-5">Invitation</th>
                  <th className="px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="6" className="py-20 text-center"><FiLoader className="animate-spin mx-auto text-primary-600" size={40} /></td></tr>
                ) : filteredGuests.length > 0 ? filteredGuests.map((guest, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={guest._id}
                    className="hover:bg-primary-50/30 transition-all group"
                  >
                    <td data-label="Guest Detail" className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-lg shadow-primary-100 uppercase">
                          {guest.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{guest.name}</p>
                          <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Users size={10} /> {guest.guestCount} Guests · <Phone size={10} /> {guest.phone || 'No Phone'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td data-label="RSVP Status" className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-700' :
                          guest.rsvpStatus === 'not_attending' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {guest.rsvpStatus}
                      </span>
                    </td>
                    <td data-label="Meal & Group" className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                          <LuUtensils size={12} className="text-primary-500" /> {guest.mealPreference || 'Veg'}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold uppercase w-fit">
                          {guest.tag || 'Family'}
                        </span>
                      </div>
                    </td>
                    <td data-label="Accommodation" className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <LuHouse size={16} className={guest.roomAllocated ? "text-green-500" : "text-gray-300"} />
                        <span className="font-medium">{guest.roomAllocated || 'Not Assigned'}</span>
                      </div>
                    </td>
                    <td data-label="Invitation" className="px-6 py-5">
                      {guest.invitationSent ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle size={14} /> Sent
                        </div>
                      ) : (
                        <button className="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-primary-100 transition-colors">SEND INVITE</button>
                      )}
                    </td>
                    <td data-label="Actions" className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal(guest)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><LuPencil size={14} /></button>
                        <button onClick={() => handleDelete(guest._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><LuTrash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan="6" className="py-20 text-center text-gray-400 italic">Your guest list is currently empty.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedGuest ? 'Edit Guest Details' : 'Add New Guest'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Full Name *</label>
              <input name="name" value={formData.name} onChange={handleInputChange} required className="input-field" placeholder="Guest Name" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Group / Tag</label>
              <select name="tag" value={formData.tag} onChange={handleInputChange} className="input-field">
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="vip">VIP</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} className="input-field" placeholder="+91 ..." />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">RSVP Status</label>
              <select name="rsvpStatus" value={formData.rsvpStatus} onChange={handleInputChange} className="input-field">
                <option value="pending">Pending</option>
                <option value="attending">Attending</option>
                <option value="not_attending">Not Attending</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Meal Preference</label>
              <select name="mealPreference" value={formData.mealPreference} onChange={handleInputChange} className="input-field">
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="jain">Jain</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Guest Count</label>
              <input type="number" name="guestCount" value={formData.guestCount} onChange={handleInputChange} min="1" className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Room Allocation / Notes</label>
            <input name="roomAllocated" value={formData.roomAllocated} onChange={handleInputChange} className="input-field" placeholder="e.g. Room 302, Taj Hotel" />
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <input type="checkbox" name="invitationSent" checked={formData.invitationSent} onChange={handleInputChange} className="w-5 h-5 rounded accent-primary-600" />
            <label className="text-sm font-bold text-gray-700 italic">Digital invitation has been sent to this guest</label>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all">
              {selectedGuest ? 'Update Guest' : 'Add Guest'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GuestManagementPage;
