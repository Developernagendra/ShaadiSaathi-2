import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({
  className = "",
  asLink = true,
  onClick,
  isDark = false,
  showTagline = true,
  taglineText = "शादी का सच्चा साथी"
}) {
  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group max-w-full select-none ${className}`}>
      {/* Wedding Emblem */}
      <div
        className={`relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl md:text-2xl transition-all duration-300 shadow-md group-hover:scale-105 ${
          isDark
            ? 'bg-gradient-to-br from-sky-500/20 to-amber-400/20 border border-white/20 text-white backdrop-blur-md'
            : 'bg-gradient-to-br from-sky-600 via-sky-700 to-[#0369a1] text-white shadow-sky-600/20 ring-2 ring-sky-100'
        }`}
      >
        <span className="drop-shadow-sm select-none">💒</span>
        {/* Subtle gold crown/sparkle micro badge */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[7px] text-amber-950 font-black shadow-xs">
          ✨
        </span>
      </div>

      {/* Brand Typography & Tagline */}
      <div className="flex flex-col min-w-0 justify-center">
        <div className="flex items-center gap-1 leading-none">
          <span
            className={`font-display font-black text-lg sm:text-xl md:text-2xl tracking-tight transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Shaadi<span className="text-[#D4AF37] font-black">Saathi</span>
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[9px] sm:text-[10px] font-semibold tracking-wider transition-colors mt-0.5 leading-tight ${
              isDark ? 'text-amber-300/90' : 'text-sky-700'
            }`}
          >
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" onClick={onClick} aria-label="ShaadiSaathi Home" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer">
      {content}
    </div>
  );
}
