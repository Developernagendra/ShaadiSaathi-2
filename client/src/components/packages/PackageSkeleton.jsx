import React from 'react';
import { motion } from 'framer-motion';

export default function PackageSkeleton() {
  return (
    <div className="relative rounded-2xl p-5 flex flex-col h-[360px] snap-center min-w-[85vw] md:min-w-0 bg-white shadow-sm border border-gray-100 overflow-hidden">
      {/* Shimmer Effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />

      {/* Header */}
      <div className="text-center mb-4 mt-2">
        <div className="w-24 h-6 bg-gray-200 rounded-full mx-auto mb-3" />
        <div className="w-32 h-8 bg-gray-200 rounded-lg mx-auto" />
      </div>

      {/* Guests & Events */}
      <div className="flex justify-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-20 h-4 bg-gray-200 rounded" />
        <div className="w-1 h-1 rounded-full bg-gray-200 mt-1.5" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </div>

      {/* Features */}
      <div className="flex-1 space-y-3 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-full h-3 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-3/4 h-3 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-5/6 h-3 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Footer / Buttons */}
      <div className="mt-auto space-y-3 pt-3">
        <div className="w-24 h-3 bg-gray-200 rounded mx-auto" />
        <div className="w-full h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
