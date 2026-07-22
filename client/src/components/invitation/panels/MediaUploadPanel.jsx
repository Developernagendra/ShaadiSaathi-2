import { useDispatch, useSelector } from 'react-redux';
import { updateMedia } from '../../../store/slices/invitationSlice';
import { FiImage, FiVideo, FiMusic, FiX, FiPlus } from 'react-icons/fi';

export default function MediaUploadPanel() {
  const dispatch = useDispatch();
  const { media } = useSelector(s => s.invitation.currentInvitation);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      dispatch(updateMedia({ photos: [...media.photos, ...files] }));
    }
  };

  const removePhoto = (idx) => {
    const updated = media.photos.filter((_, i) => i !== idx);
    dispatch(updateMedia({ photos: updated }));
  };

  const handleVideo = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      dispatch(updateMedia({ videos: [...media.videos, ...files] }));
    }
  };

  const removeVideo = (idx) => {
    const updated = media.videos.filter((_, i) => i !== idx);
    dispatch(updateMedia({ videos: updated }));
  };

  const handleMusic = (e) => {
    if (e.target.files[0]) {
      dispatch(updateMedia({ bgMusic: e.target.files[0] }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <FiImage size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Media Upload</h3>
          <p className="text-[10px] text-gray-400 font-medium">Photos, videos, and background music</p>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="label flex items-center gap-2"><FiImage size={12} /> Photos</label>
        <div className="grid grid-cols-3 gap-2">
          {media.photos.map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
              <img
                src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <FiX size={10} />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#C2185B] hover:bg-pink-50/20 transition-all">
            <FiPlus className="text-gray-300 mb-1" size={20} />
            <span className="text-[8px] font-bold text-gray-300 uppercase">Add</span>
            <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
          </label>
        </div>
      </div>

      {/* Videos */}
      <div>
        <label className="label flex items-center gap-2"><FiVideo size={12} /> Videos</label>
        {media.videos.length > 0 && (
          <div className="space-y-2 mb-2">
            {media.videos.map((v, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                <FiVideo className="text-gray-400" size={14} />
                <span className="text-xs font-medium text-gray-600 flex-1 truncate">
                  {v.name || `Video ${idx + 1}`}
                </span>
                <button onClick={() => removeVideo(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-[#C2185B] hover:bg-pink-50/20 transition-all">
          <FiVideo className="mx-auto text-gray-300 mb-2" size={24} />
          <p className="text-[10px] text-gray-400 font-medium">Upload wedding video or trailer</p>
          <p className="text-[9px] text-gray-300 mt-0.5">MP4, MOV up to 100MB</p>
          <input type="file" accept="video/*" onChange={handleVideo} className="hidden" />
        </label>
      </div>

      {/* Background Music */}
      <div>
        <label className="label flex items-center gap-2"><FiMusic size={12} /> Background Music</label>
        {media.bgMusic ? (
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-4 py-3 border border-purple-100">
            <FiMusic className="text-purple-500" size={16} />
            <span className="text-xs font-medium text-purple-700 flex-1 truncate">
              {media.bgMusic.name || 'Background music'}
            </span>
            <button onClick={() => dispatch(updateMedia({ bgMusic: null }))} className="text-red-400 hover:text-red-600 transition-colors">
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/20 transition-all">
            <FiMusic className="mx-auto text-gray-300 mb-2" size={24} />
            <p className="text-[10px] text-gray-400 font-medium">Add background music</p>
            <p className="text-[9px] text-gray-300 mt-0.5">MP3, WAV up to 10MB</p>
            <input type="file" accept="audio/*" onChange={handleMusic} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}
