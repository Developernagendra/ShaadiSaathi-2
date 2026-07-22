import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({
  className = "",
  asLink = true,
  onClick,
  isDark = false,
  showTagline = true
}) {
  const content = (
    <div className={`flex items-center gap-2 md:gap-3 group max-w-full overflow-hidden ${className}`}>
      <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-[1rem] md:rounded-2xl flex items-center justify-center text-xl md:text-2xl lg:text-3xl transition-all shadow-xl rotate-3 group-hover:rotate-0 ${isDark ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white shadow-[#C2185B]/20'}`}>
        <span className="drop-shadow-md">💒</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`font-display font-black text-xl md:text-2xl lg:text-3xl tracking-tighter transition-colors leading-none flex items-center gap-1 md:gap-2 truncate whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Shaadi<span className="text-[#D4AF37]">Saathi</span>
        </span>
        {showTagline && (
          <span className={`text-[9px] md:text-[10px] lg:text-[11px] font-bold tracking-widest mt-1 lg:mt-1.5 transition-opacity italic leading-tight ${isDark ? 'text-[#D4AF37]' : 'text-primary-600'}`} style={{ textWrap: 'balance' }}>
            Shaadi Ki Saccha Saathi
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick}>
      {content}
    </div>
  );
}
