import { useDispatch, useSelector } from 'react-redux';
import { updateTheme } from '../../../store/slices/invitationSlice';
import { FiDroplet, FiType, FiSliders } from 'react-icons/fi';

const fontOptions = [
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
  'Inter',
  'Poppins',
  'Merriweather',
  'Cinzel',
  'Amiri',
  'Dancing Script',
  'Great Vibes',
];

const presetPalettes = [
  { name: 'Royal Gold', bg: '#1a0a0a', text: '#ffffff', accent: '#D4AF37' },
  { name: 'Rani Pink', bg: '#2d0a1a', text: '#ffffff', accent: '#C2185B' },
  { name: 'Garden Green', bg: '#f5f0e8', text: '#2d2d2d', accent: '#6b8e5a' },
  { name: 'Midnight Purple', bg: '#0f0f1a', text: '#ffffff', accent: '#8b5cf6' },
  { name: 'Ivory Classic', bg: '#faf6f0', text: '#3d2b1f', accent: '#D4AF37' },
  { name: 'Pure White', bg: '#ffffff', text: '#111111', accent: '#000000' },
];

export default function ThemeSettingsPanel() {
  const dispatch = useDispatch();
  const { theme } = useSelector(s => s.invitation.currentInvitation);

  const handleChange = (field, value) => {
    dispatch(updateTheme({ [field]: value }));
  };

  const applyPalette = (palette) => {
    dispatch(updateTheme({ bgColor: palette.bg, textColor: palette.text, accentColor: palette.accent }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
          <FiDroplet size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Theme Settings</h3>
          <p className="text-[10px] text-gray-400 font-medium">Colors, fonts, and visual style</p>
        </div>
      </div>

      {/* Preset Palettes */}
      <div>
        <label className="label">Quick Palettes</label>
        <div className="grid grid-cols-3 gap-2">
          {presetPalettes.map(p => (
            <button
              key={p.name}
              onClick={() => applyPalette(p)}
              className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-gray-100 hover:border-[#C2185B] hover:bg-pink-50/30 transition-all"
            >
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: p.bg }} />
                <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: p.accent }} />
                <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: p.text }} />
              </div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#C2185B]">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Background</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.bgColor}
              onChange={e => handleChange('bgColor', e.target.value)}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer appearance-none bg-transparent p-0.5"
            />
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">{theme.bgColor}</span>
          </div>
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Text</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.textColor}
              onChange={e => handleChange('textColor', e.target.value)}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer appearance-none bg-transparent p-0.5"
            />
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">{theme.textColor}</span>
          </div>
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Accent</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.accentColor}
              onChange={e => handleChange('accentColor', e.target.value)}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer appearance-none bg-transparent p-0.5"
            />
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">{theme.accentColor}</span>
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="label flex items-center gap-2"><FiType size={12} /> Font Family</label>
        <select
          value={theme.fontFamily}
          onChange={e => handleChange('fontFamily', e.target.value)}
          className="input-field text-sm"
        >
          {fontOptions.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="label flex items-center justify-between">
          <span className="flex items-center gap-2"><FiSliders size={12} /> Font Size</span>
          <span className="text-[#C2185B] font-bold">{theme.fontSize}px</span>
        </label>
        <input
          type="range"
          min={12}
          max={24}
          value={theme.fontSize}
          onChange={e => handleChange('fontSize', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#C2185B]"
        />
        <div className="flex justify-between text-[9px] text-gray-300 font-bold mt-1">
          <span>12px</span>
          <span>24px</span>
        </div>
      </div>

      {/* Font Style */}
      <div>
        <label className="label">Font Style</label>
        <div className="flex gap-2">
          {['normal', 'italic'].map(style => (
            <button
              key={style}
              onClick={() => handleChange('fontStyle', style)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all ${
                theme.fontStyle === style
                  ? 'border-[#C2185B] bg-pink-50 text-[#C2185B]'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
              style={{ fontStyle: style }}
            >
              {style === 'normal' ? 'Normal' : 'Italic'}
            </button>
          ))}
        </div>
      </div>

      {/* Preview swatch */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div
          className="p-6 text-center"
          style={{ backgroundColor: theme.bgColor, color: theme.textColor, fontFamily: theme.fontFamily, fontSize: `${theme.fontSize}px`, fontStyle: theme.fontStyle }}
        >
          <p style={{ color: theme.accentColor }} className="text-xs font-bold uppercase tracking-[0.3em] mb-2">Preview</p>
          <p>Rahul & Anjali</p>
        </div>
      </div>
    </div>
  );
}
