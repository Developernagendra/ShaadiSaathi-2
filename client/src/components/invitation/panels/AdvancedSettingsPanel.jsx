import { useDispatch, useSelector } from 'react-redux';
import { updateAdvanced } from '../../../store/slices/invitationSlice';
import { FiClock, FiGrid, FiLink, FiInstagram, FiFacebook, FiTwitter, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function AdvancedSettingsPanel() {
  const dispatch = useDispatch();
  const { advanced } = useSelector(s => s.invitation.currentInvitation);

  const handleChange = (field, value) => {
    dispatch(updateAdvanced({ [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    dispatch(updateAdvanced({ socialLinks: { ...advanced.socialLinks, [platform]: value } }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
          <FiGrid size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Advanced Settings</h3>
          <p className="text-[10px] text-gray-400 font-medium">Countdown, QR code, and more</p>
        </div>
      </div>

      {/* Toggle switches */}
      <div className="space-y-3">
        {/* Countdown Timer */}
        <button
          onClick={() => handleChange('countdownEnabled', !advanced.countdownEnabled)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
            advanced.countdownEnabled ? 'border-[#C2185B]/20 bg-pink-50/30' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <FiClock className={advanced.countdownEnabled ? 'text-[#C2185B]' : 'text-gray-400'} size={18} />
            <div className="text-left">
              <span className={`text-sm font-bold ${advanced.countdownEnabled ? 'text-[#C2185B]' : 'text-gray-600'}`}>
                Countdown Timer
              </span>
              <p className="text-[10px] text-gray-400">Show days remaining until wedding</p>
            </div>
          </div>
          {advanced.countdownEnabled ? (
            <FiToggleRight className="text-[#C2185B]" size={24} />
          ) : (
            <FiToggleLeft className="text-gray-300" size={24} />
          )}
        </button>

        {/* QR Code */}
        <button
          onClick={() => handleChange('qrCode', !advanced.qrCode)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
            advanced.qrCode ? 'border-[#C2185B]/20 bg-pink-50/30' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <FiGrid className={advanced.qrCode ? 'text-[#C2185B]' : 'text-gray-400'} size={18} />
            <div className="text-left">
              <span className={`text-sm font-bold ${advanced.qrCode ? 'text-[#C2185B]' : 'text-gray-600'}`}>
                QR Code
              </span>
              <p className="text-[10px] text-gray-400">Scannable code for invitation link</p>
            </div>
          </div>
          {advanced.qrCode ? (
            <FiToggleRight className="text-[#C2185B]" size={24} />
          ) : (
            <FiToggleLeft className="text-gray-300" size={24} />
          )}
        </button>
      </div>

      {/* Custom URL */}
      <div>
        <label className="label flex items-center gap-2"><FiLink size={12} /> Custom URL Slug</label>
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-pink-100 focus-within:border-[#C2185B] transition-all">
          <span className="pl-4 pr-1 text-xs font-bold text-gray-400 whitespace-nowrap">shaadisaathi.com/invite/</span>
          <input
            type="text"
            value={advanced.customUrl}
            onChange={e => handleChange('customUrl', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="rahul-anjali"
            className="flex-1 py-3.5 pr-4 text-sm font-medium text-gray-800 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <label className="label">Social Media Links</label>
        <div className="space-y-3">
          <div className="relative">
            <FiInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={16} />
            <input
              type="url"
              value={advanced.socialLinks.instagram}
              onChange={e => handleSocialChange('instagram', e.target.value)}
              placeholder="Instagram profile URL"
              className="input-field !pl-11"
            />
          </div>
          <div className="relative">
            <FiFacebook className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
            <input
              type="url"
              value={advanced.socialLinks.facebook}
              onChange={e => handleSocialChange('facebook', e.target.value)}
              placeholder="Facebook profile URL"
              className="input-field !pl-11"
            />
          </div>
          <div className="relative">
            <FiTwitter className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" size={16} />
            <input
              type="url"
              value={advanced.socialLinks.twitter}
              onChange={e => handleSocialChange('twitter', e.target.value)}
              placeholder="Twitter profile URL"
              className="input-field !pl-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
