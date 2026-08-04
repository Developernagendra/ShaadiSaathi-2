import React, { useState, useEffect } from 'react';
import { FaCrown } from 'react-icons/fa';

/**
 * Reusable SafeImage Component
 * Guaranteed zero broken image icons, zero empty grey boxes, and zero raw URL display.
 * 
 * Loading Multi-Tier Strategy:
 * 1. Primary: Load `src`
 * 2. Fallback: If `src` fails, swap to `fallbackSrc`
 * 3. Branded Placeholder: If both fail, display a royal ShaadiSaathi branded card with category icon & title.
 */
export default function SafeImage({
  src,
  fallbackSrc,
  alt = 'ShaadiSaathi Royal Wedding Asset',
  title = '',
  subtitle = 'Verified Wedding Asset',
  categoryIcon = '👑',
  className = 'w-full h-full object-cover',
  containerClassName = '',
  aspectRatio = '16/10',
  showSkeleton = true,
  onClick
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'fallback-loading' | 'fallback-loaded' | 'error'
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setStatus(src ? 'loading' : (fallbackSrc ? 'fallback-loading' : 'error'));
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (status === 'loading' && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStatus('fallback-loading');
    } else {
      setStatus('error');
    }
  };

  const handleLoad = () => {
    if (status === 'loading') {
      setStatus('loaded');
    } else if (status === 'fallback-loading') {
      setStatus('fallback-loaded');
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16/10':
      case '16 / 10':
        return 'aspect-[16/10]';
      case '16/9':
      case '16 / 9':
        return 'aspect-video';
      case '4/3':
      case '4 / 3':
        return 'aspect-[4/3]';
      case '1/1':
      case 'square':
        return 'aspect-square';
      default:
        return 'aspect-[16/10]';
    }
  };

  const displayTitle = title || alt || 'ShaadiSaathi Royal Fleet';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-[#0B1021] ${getAspectClass()} ${containerClassName}`}
    >
      {/* ── SKELETON STATE ── */}
      {(status === 'loading' || status === 'fallback-loading') && showSkeleton && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#121A30] via-[#1E294B] to-[#121A30] animate-pulse flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <span className="text-2xl">{categoryIcon || '👑'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">
              Loading Royal Asset...
            </span>
          </div>
        </div>
      )}

      {/* ── ERROR / BRANDED PLACEHOLDER STATE (ZERO GREY BOX OR BROKEN ICON) ── */}
      {status === 'error' ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1021] via-[#151E38] to-[#0A0E1D] flex flex-col items-center justify-center p-4 text-center border border-[#D4AF37]/20 select-none z-20">
          {/* Subtle Madhubani corner accent */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/40 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/40 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/40 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/40 pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-2xl mb-2.5 shadow-md">
            <span>{categoryIcon || '👑'}</span>
          </div>
          <h4 className="font-serif font-black text-sm sm:text-base text-white tracking-wide max-w-[90%] truncate">
            {displayTitle}
          </h4>
          <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-1">
            {subtitle || 'ShaadiSaathi Verified Fleet'}
          </p>
        </div>
      ) : (
        /* ── NORMAL IMAGE LOAD ── */
        <img
          src={currentSrc}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
          className={`${className} transition-all duration-500 ${
            status === 'loading' || status === 'fallback-loading' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />
      )}
    </div>
  );
}
