import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi';
import { updateProfile } from '../../store/slices/authSlice';

const languages = [
  { code: 'en', name: 'English', shortName: 'EN', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', shortName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bho', name: 'भोजपुरी', shortName: 'भोजपुरी', flag: '🟢' },
  { code: 'mai', name: 'मैथिली', shortName: 'मैथिली', flag: '🟣' },
];

const LanguageSwitcher = ({ isMobile = false, isDark = false, onSelect }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = async (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    if (onSelect) onSelect(code);

    if (user && user.preferredLanguage !== code) {
      dispatch(updateProfile({ preferredLanguage: code }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FiGlobe className="text-sky-600" size={13} />
            Choose Language / भाषा चुनें
          </span>
          <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            {currentLang.name}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                aria-pressed={isSelected}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/90 text-sky-800 shadow-xs ring-1 ring-sky-300'
                    : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <FiCheck className="text-sky-600 flex-shrink-0" size={14} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Language"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 select-none ${
          isDark
            ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
            : 'border-sky-200/80 bg-white hover:bg-sky-50/60 text-slate-700 hover:text-sky-700 shadow-[0_2px_8px_rgba(2,132,199,0.06)]'
        }`}
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="font-semibold tracking-tight">{currentLang.shortName}</span>
        <FiChevronDown
          size={13}
          className={`transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-sky-600' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-[0_15px_40px_rgba(2,132,199,0.12)] border border-sky-100/80 py-1.5 z-[120] overflow-hidden backdrop-blur-xl"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 bg-sky-50/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Language
            </div>
            {languages.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {isSelected && <FiCheck className="text-sky-600" size={14} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
