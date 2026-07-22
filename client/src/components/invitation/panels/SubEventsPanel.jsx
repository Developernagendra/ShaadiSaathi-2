import { useDispatch, useSelector } from 'react-redux';
import { updateSubEvent } from '../../../store/slices/invitationSlice';
import { FiCalendar, FiClock, FiMapPin, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const eventEmojis = {
  'Engagement': '💍',
  'Haldi': '🌼',
  'Mehndi': '🎨',
  'Sangeet': '🎶',
  'Wedding': '💒',
  'Reception': '🎉',
};

export default function SubEventsPanel() {
  const dispatch = useDispatch();
  const { subEvents } = useSelector(s => s.invitation.currentInvitation);

  const handleChange = (index, data) => {
    dispatch(updateSubEvent({ index, data }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <span className="text-lg">🎊</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Wedding Events</h3>
          <p className="text-[10px] text-gray-400 font-medium">Toggle and customize each ceremony</p>
        </div>
      </div>

      {subEvents.map((evt, index) => (
        <div key={evt.name} className={`rounded-2xl border-2 transition-all duration-300 ${evt.enabled ? 'border-[#C2185B]/20 bg-pink-50/30' : 'border-gray-100 bg-white'}`}>
          {/* Header */}
          <button
            onClick={() => handleChange(index, { enabled: !evt.enabled })}
            className="w-full flex items-center justify-between p-4 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{eventEmojis[evt.name] || '✨'}</span>
              <span className={`font-bold text-sm transition-colors ${evt.enabled ? 'text-[#C2185B]' : 'text-gray-500'}`}>{evt.name}</span>
            </div>
            {evt.enabled ? (
              <FiToggleRight className="text-[#C2185B]" size={24} />
            ) : (
              <FiToggleLeft className="text-gray-300 group-hover:text-gray-400" size={24} />
            )}
          </button>

          {/* Details (collapsed when disabled) */}
          {evt.enabled && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input
                      type="date"
                      value={evt.date}
                      onChange={e => handleChange(index, { date: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Time</label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input
                      type="time"
                      value={evt.time}
                      onChange={e => handleChange(index, { time: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-[#C2185B] transition-all"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Venue</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input
                    type="text"
                    value={evt.venue}
                    onChange={e => handleChange(index, { venue: e.target.value })}
                    placeholder={`${evt.name} venue...`}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-[#C2185B] transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
