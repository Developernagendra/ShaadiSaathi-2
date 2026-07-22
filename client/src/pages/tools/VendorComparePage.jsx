import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';
import { FiSearch, FiX, FiCheck, FiStar, FiPlus } from 'react-icons/fi';

export default function VendorComparePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [compareData, setCompareData] = useState([]);

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Vendor Comparison', action: 'viewed_tool' }).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get(`/vendors?search=${searchTerm}&limit=5`);
        setSearchResults(data.data || data.vendors || []);
      } catch (err) { }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleAddVendor = (vendor) => {
    if (selectedVendors.length >= 3) {
      return toast.error('You can compare up to 3 vendors at a time');
    }
    if (selectedVendors.find(v => v._id === vendor._id)) {
      return toast.error('Vendor already added');
    }
    setSelectedVendors([...selectedVendors, vendor]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveVendor = (id) => {
    setSelectedVendors(selectedVendors.filter(v => v._id !== id));
    setCompareData(compareData.filter(v => v._id !== id));
    if (selectedVendors.length <= 1) setComparing(false);
  };

  const handleCompare = async () => {
    if (selectedVendors.length < 2) {
      return toast.error('Please select at least 2 vendors to compare');
    }
    const ids = selectedVendors.map(v => v._id).join(',');
    try {
      const { data } = await api.get(`/tools/vendor-compare?ids=${ids}`);
      setCompareData(data.data);
      setComparing(true);
    } catch (err) {
      toast.error('Failed to load comparison data');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-black text-slate-900 mb-4">
            Vendor <span className="text-slate-500">Comparison Tool</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Compare prices, ratings, and features of up to 3 vendors side-by-side to make the best decision for your wedding.
          </p>
        </div>

        {/* Search & Select Section */}
        {!comparing && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-10 max-w-3xl mx-auto">
            <div className="relative mb-8">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input 
                type="text" 
                placeholder="Search vendor by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-slate-400"
              />
              
              {/* Dropdown Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                  {searchResults.map(v => (
                    <div key={v._id} className="flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer" onClick={() => handleAddVendor(v)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden">
                          {v.coverImage && <img src={v.coverImage.url || v.coverImage} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{v.businessName}</p>
                          <p className="text-xs text-slate-500">{v.city}</p>
                        </div>
                      </div>
                      <FiPlus className="text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Vendors Chips */}
            <div className="mb-8 min-h-[100px]">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Selected Vendors ({selectedVendors.length}/3)</h4>
              <div className="flex flex-wrap gap-4">
                {selectedVendors.map(v => (
                  <div key={v._id} className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-xl p-2 pr-4">
                    <img src={v.coverImage?.url || v.coverImage || ''} className="w-10 h-10 rounded-lg object-cover bg-slate-100" alt="" />
                    <span className="text-sm font-bold text-slate-900">{v.businessName}</span>
                    <button onClick={() => handleRemoveVendor(v._id)} className="ml-2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500">
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                {selectedVendors.length === 0 && (
                  <p className="text-sm font-medium text-slate-400 italic">No vendors selected yet.</p>
                )}
              </div>
            </div>

            <button 
              onClick={handleCompare}
              disabled={selectedVendors.length < 2}
              className="w-full bg-slate-900 text-white rounded-xl py-4 font-black text-sm uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
            >
              Compare Vendors Side-by-Side
            </button>
          </div>
        )}

        {/* Comparison View */}
        {comparing && compareData.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-x-auto">
            <div className="w-full sm:min-w-[800px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-6 border-b border-r border-slate-100 w-1/4 bg-slate-50/50">
                      <button onClick={() => setComparing(false)} className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2">
                        ← Back to Search
                      </button>
                    </th>
                    {compareData.map(v => (
                      <th key={`head-${v._id}`} className="p-6 border-b border-r border-slate-100 w-1/4 align-top relative group">
                        <button onClick={() => handleRemoveVendor(v._id)} className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all">
                          <FiX size={12} />
                        </button>
                        <img src={v.coverImage?.url || v.coverImage || ''} className="w-full h-32 object-cover rounded-xl mb-4 bg-slate-100" alt="" />
                        <h3 className="font-black text-xl text-slate-900">{v.businessName}</h3>
                        <p className="text-xs text-slate-500 mt-1">{v.categoryId?.name}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Rating */}
                  <tr>
                    <td className="p-6 border-b border-r border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">Rating</td>
                    {compareData.map(v => (
                      <td key={`rating-${v._id}`} className="p-6 border-b border-r border-slate-100">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                          <FiStar className="fill-current" /> {v.averageRating || '5.0'}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{v.totalReviews || 0} reviews</p>
                      </td>
                    ))}
                  </tr>
                  {/* Price */}
                  <tr>
                    <td className="p-6 border-b border-r border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">Starting Price</td>
                    {compareData.map(v => (
                      <td key={`price-${v._id}`} className="p-6 border-b border-r border-slate-100 font-black text-2xl text-slate-900">
                        {formatPrice(v.startingPrice)}
                      </td>
                    ))}
                  </tr>
                  {/* Experience */}
                  <tr>
                    <td className="p-6 border-b border-r border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">Experience</td>
                    {compareData.map(v => (
                      <td key={`exp-${v._id}`} className="p-6 border-b border-r border-slate-100 font-bold text-slate-700">
                        {v.experienceYears || 'N/A'} Years
                      </td>
                    ))}
                  </tr>
                  {/* Features */}
                  <tr>
                    <td className="p-6 border-b border-r border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">Key Features</td>
                    {compareData.map(v => (
                      <td key={`feat-${v._id}`} className="p-6 border-b border-r border-slate-100 align-top">
                        <ul className="space-y-2">
                          {v.features && v.features.slice(0, 5).map((f, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <FiCheck className="text-emerald-500 mt-0.5 shrink-0" /> {f}
                            </li>
                          ))}
                          {(!v.features || v.features.length === 0) && <li className="text-sm text-slate-400 italic">No specific features listed</li>}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
