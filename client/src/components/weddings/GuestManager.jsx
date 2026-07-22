import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash } from 'react-icons/lu';

export default function GuestManager({ guests, planId, refreshData }) {
  const { t } = useTranslation();
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', rsvpStatus: 'pending', guestCount: 1, tag: 'family' });
  const [isAdding, setIsAdding] = useState(false);

  const totalGuests = guests.reduce((acc, g) => acc + (g.guestCount || 1), 0);
  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'attending').reduce((acc, g) => acc + (g.guestCount || 1), 0);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/weddings/${planId}/guests`, newGuest);
      setNewGuest({ name: '', phone: '', rsvpStatus: 'pending', guestCount: 1, tag: 'family' });
      setIsAdding(false);
      refreshData();
      toast.success('Guest added');
    } catch (error) {
      toast.error('Failed to add guest');
    }
  };

  const handleDelete = async (guestId) => {
    if(!window.confirm('Remove this guest?')) return;
    try {
      await api.delete(`/weddings/${planId}/guests/${guestId}`);
      refreshData();
      toast.success('Guest removed');
    } catch (error) {
      toast.error('Failed to remove guest');
    }
  };

  const handleStatusChange = async (guestId, newStatus) => {
    try {
      await api.put(`/weddings/${planId}/guests/${guestId}`, { rsvpStatus: newStatus });
      refreshData();
    } catch (error) {
      toast.error('Failed to update RSVP');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase">Total Guests</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{totalGuests}</p>
        </div>
        <div className="bg-green-50 p-5 rounded-2xl shadow-sm border border-green-100 text-center">
          <p className="text-sm font-bold text-green-700 uppercase">Confirmed RSVP</p>
          <p className="text-2xl font-black text-green-700 mt-2">{confirmedGuests}</p>
        </div>
        <div className="bg-orange-50 p-5 rounded-2xl shadow-sm border border-orange-100 text-center flex flex-col justify-center">
          <button onClick={() => setIsAdding(!isAdding)} className="bg-[#C2185B] text-white py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8E244D] transition-colors">
            <LuPlus /> {t('wedding_planner.add_guest', 'Add Guest')}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddGuest} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4">
          <input required type="text" placeholder="Name" value={newGuest.name} onChange={e => setNewGuest({...newGuest, name: e.target.value})} className="px-4 py-2 border rounded-xl" />
          <input type="text" placeholder="Phone" value={newGuest.phone} onChange={e => setNewGuest({...newGuest, phone: e.target.value})} className="px-4 py-2 border rounded-xl" />
          <input type="number" min="1" placeholder="Count" value={newGuest.guestCount} onChange={e => setNewGuest({...newGuest, guestCount: Number(e.target.value)})} className="px-4 py-2 border rounded-xl" />
          <select value={newGuest.tag} onChange={e => setNewGuest({...newGuest, tag: e.target.value})} className="px-4 py-2 border rounded-xl">
            <option value="family">Family</option>
            <option value="friends">Friends</option>
            <option value="bride_side">Bride Side</option>
            <option value="groom_side">Groom Side</option>
          </select>
          <button type="submit" className="bg-gray-900 text-white rounded-xl font-bold py-2 hover:bg-gray-800">Save</button>
        </form>
      )}

      {/* Guest List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {guests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No guests added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-700">Name</th>
                  <th className="p-4 font-bold text-gray-700">Tag</th>
                  <th className="p-4 font-bold text-gray-700">Count</th>
                  <th className="p-4 font-bold text-gray-700">RSVP</th>
                  <th className="p-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-semibold text-gray-900">
                      {guest.name}
                      {guest.phone && <div className="text-xs text-gray-500">{guest.phone}</div>}
                    </td>
                    <td className="p-4 text-sm text-gray-600 capitalize">{guest.tag.replace('_', ' ')}</td>
                    <td className="p-4 text-gray-900 font-bold">{guest.guestCount}</td>
                    <td className="p-4">
                      <select 
                        value={guest.rsvpStatus} 
                        onChange={(e) => handleStatusChange(guest._id, e.target.value)}
                        className={`text-sm px-3 py-1 rounded-full font-bold border-0 ${
                          guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-700' : 
                          guest.rsvpStatus === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="attending">Attending</option>
                        <option value="not_attending">Declined</option>
                        <option value="maybe">Maybe</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(guest._id)} className="text-red-500 hover:text-red-700 p-2"><LuTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
