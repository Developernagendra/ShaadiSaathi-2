import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { updateProfile } from '../../store/slices/authSlice';

const languages = [
  { code: 'en', name: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bho', name: 'भोजपुरी', flag: '🇮🇳' },
  { code: 'mai', name: 'मैथिली', flag: '🇮🇳' },
];

const LanguageSwitcher = ({ isMobile = false, isDark = false }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = async (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);

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
        <p className="text-sm font-medium text-gray-500 mb-2 px-2 uppercase tracking-wider">
          Language
        </p>
        <div className="grid grid-cols-2 gap-2 px-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${i18n.language === lang.code
                  ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span>{lang.flag}</span>
              <span className="truncate text-xs font-bold">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm focus:outline-none ${
          isDark
            ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        <FiGlobe className={isDark ? 'text-[#D4AF37]' : 'text-primary-500'} />
        <span className="hidden sm:inline-block">{currentLang.name}</span>
        <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
        <FiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${i18n.language === lang.code
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
