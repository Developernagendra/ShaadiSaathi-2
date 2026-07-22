import { useDispatch, useSelector } from 'react-redux';
import { updateCouple } from '../../../store/slices/invitationSlice';
import { FiUser, FiHeart, FiCamera, FiEdit3 } from 'react-icons/fi';

export default function CoupleInfoPanel() {
  const dispatch = useDispatch();
  const { couple } = useSelector(s => s.invitation.currentInvitation);

  const handleChange = (field, value) => {
    dispatch(updateCouple({ [field]: value }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#C2185B] flex items-center justify-center">
          <FiHeart size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Couple Information</h3>
          <p className="text-[10px] text-gray-400 font-medium">Names and story of the couple</p>
        </div>
      </div>

      <div>
        <label className="label">Groom's Name</label>
        <div className="relative">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={couple.groomName}
            onChange={e => handleChange('groomName', e.target.value)}
            placeholder="Enter groom's name"
            className="input-field !pl-11"
          />
        </div>
      </div>

      <div>
        <label className="label">Bride's Name</label>
        <div className="relative">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={couple.brideName}
            onChange={e => handleChange('brideName', e.target.value)}
            placeholder="Enter bride's name"
            className="input-field !pl-11"
          />
        </div>
      </div>

      <div>
        <label className="label">Couple Photo</label>
        <div className="relative group">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#C2185B] hover:bg-pink-50/30 transition-all cursor-pointer">
            {couple.couplePhoto ? (
              <div className="relative">
                <img src={typeof couple.couplePhoto === 'string' ? couple.couplePhoto : URL.createObjectURL(couple.couplePhoto)} alt="Couple" className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-lg" />
                <button onClick={() => handleChange('couplePhoto', null)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-lg">×</button>
              </div>
            ) : (
              <>
                <FiCamera className="mx-auto text-gray-300 mb-3" size={28} />
                <p className="text-xs text-gray-400 font-medium">Click to upload couple photo</p>
                <p className="text-[10px] text-gray-300 mt-1">JPG, PNG up to 5MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={e => e.target.files[0] && handleChange('couplePhoto', e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="label">Our Story</label>
        <div className="relative">
          <FiEdit3 className="absolute left-4 top-4 text-gray-400" size={16} />
          <textarea
            value={couple.coupleStory}
            onChange={e => handleChange('coupleStory', e.target.value)}
            placeholder="Share your love story..."
            rows={3}
            className="input-field !pl-11 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
