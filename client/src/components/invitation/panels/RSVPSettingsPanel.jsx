import { useDispatch, useSelector } from 'react-redux';
import { updateRSVP } from '../../../store/slices/invitationSlice';
import { FiUser, FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';

export default function RSVPSettingsPanel() {
  const dispatch = useDispatch();
  const { rsvp } = useSelector(s => s.invitation.currentInvitation);

  const handleChange = (field, value) => {
    dispatch(updateRSVP({ [field]: value }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <FiMail size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">RSVP Settings</h3>
          <p className="text-[10px] text-gray-400 font-medium">Contact details for guest responses</p>
        </div>
      </div>

      <div>
        <label className="label">Contact Person</label>
        <div className="relative">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={rsvp.contactPerson}
            onChange={e => handleChange('contactPerson', e.target.value)}
            placeholder="RSVP contact name"
            className="input-field !pl-11"
          />
        </div>
      </div>

      <div>
        <label className="label">Phone Number</label>
        <div className="relative">
          <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="tel"
            value={rsvp.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="input-field !pl-11"
          />
        </div>
      </div>

      <div>
        <label className="label">Email Address</label>
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="email"
            value={rsvp.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="rsvp@example.com"
            className="input-field !pl-11"
          />
        </div>
      </div>

      <div>
        <label className="label">WhatsApp Number</label>
        <div className="relative">
          <FiMessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="tel"
            value={rsvp.whatsapp}
            onChange={e => handleChange('whatsapp', e.target.value)}
            placeholder="+91 98765 43210"
            className="input-field !pl-11"
          />
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">💡 Tip</p>
        <p className="text-xs text-emerald-600 leading-relaxed">Guests can RSVP directly from your invitation. Their responses will appear in your RSVP Management dashboard.</p>
      </div>
    </div>
  );
}
