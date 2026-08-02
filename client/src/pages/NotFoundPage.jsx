import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import BrandLogo from '../components/common/BrandLogo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans px-4 py-16 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 floral-pattern opacity-5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-pink-100 text-center relative z-10"
      >
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>

        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-[#C2185B] text-5xl mx-auto mb-6 shadow-inner border-4 border-white">
          💍
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-black text-[#C2185B] mb-3 tracking-tight">
          404
        </h1>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Oops! This wedding journey took a wrong turn 💍
        </h2>
        <p className="text-gray-600 text-base mb-8 max-w-md mx-auto leading-relaxed font-medium">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable. Let's get you back on track to your dream wedding!
        </p>

        {/* 3 Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <FiHome /> Go Home
          </Link>
          <Link
            to="/services"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <FiSearch /> Explore Vendors
          </Link>
          <Link
            to="/tools/wedding-planner"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#C2185B] to-[#8E244D] hover:from-[#a3154d] hover:to-[#761c3f] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <FiCalendar /> Start Planning
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
