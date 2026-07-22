import { useDispatch, useSelector } from 'react-redux';
import { updateEvent } from '../../../store/slices/invitationSlice';
import { FiCalendar, FiClock, FiMapPin, FiNavigation, FiHome } from 'react-icons/fi';

export default function EventInfoPanel() {
  const dispatch = useDispatch();
  const { event } = useSelector(s => s.invitation.currentInvitation);

  const handleChange = (field, value) => {
    dispatch(updateEvent({ [field]: value }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <FiCalendar size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Event Details</h3>
          <p className="text-[10px] text-gray-400 font-medium">Date, time, and venue information</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Wedding Date</label>
          <div className="relative">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={event.weddingDate}
              onChange={e => handleChange('weddingDate', e.target.value)}
              className="input-field !pl-11"
            />
          </div>
        </div>
        <div>
          <label className="label">Wedding Time</label>
          <div className="relative">
            <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="time"
              value={event.weddingTime}
              onChange={e => handleChange('weddingTime', e.target.value)}
              className="input-field !pl-11"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">Venue Name</label>
        <div className="relative">
          <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={event.venueName}
            onChange={e => handleChange('venueName', e.target.value)}
            placeholder="e.g., ITC Maurya, New Delhi"
            className="input-field !pl-11"
          />
        </div>
      </div>

      <div>
        <label className="label">Venue Address</label>
        <div className="relative">
          <FiMapPin className="absolute left-4 top-4 text-gray-400" size={16} />
          <textarea
            value={event.venueAddress}
            onChange={e => handleChange('venueAddress', e.target.value)}
            placeholder="Full venue address..."
            rows={2}
            className="input-field !pl-11 resize-none"
          />
        </div>
      </div>

      <div>
        <label className="label">Google Maps Link</label>
        <div className="relative">
          <FiNavigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="url"
            value={event.googleMapsLink}
            onChange={e => handleChange('googleMapsLink', e.target.value)}
            placeholder="https://maps.google.com/..."
            className="input-field !pl-11"
          />
        </div>
      </div>
    </div>
  );
}
