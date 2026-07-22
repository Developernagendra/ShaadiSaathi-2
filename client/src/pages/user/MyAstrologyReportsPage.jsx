import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { FiStar, FiCalendar, FiTrash2, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MyAstrologyReportsPage() {
  const { t } = useTranslation();
  const [kundlis, setKundlis] = useState([]);
  const [muhurats, setMuhurats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // NOTE: Creating specific GET endpoints for these user models in userController or toolController
      const [kundliRes, muhuratRes] = await Promise.all([
        api.get('/tools/kundli/saved'),
        api.get('/tools/muhurat/saved')
      ]);
      setKundlis(kundliRes.data.data);
      setMuhurats(muhuratRes.data.data);
    } catch (err) {
      // endpoints might not exist yet, we'll create them in toolController next.
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteKundli = async (id) => {
    try {
      await api.delete(`/tools/kundli/saved/${id}`);
      setKundlis(kundlis.filter(k => k._id !== id));
      toast.success('Report deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const deleteMuhurat = async (id) => {
    try {
      await api.delete(`/tools/muhurat/saved/${id}`);
      setMuhurats(muhurats.filter(m => m._id !== id));
      toast.success('Search deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]/50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-display font-black text-gray-900 mb-8">My Astrology Reports</h1>
        
        {loading ? (
          <div className="text-center py-20 text-gray-500 italic">Loading your celestial history...</div>
        ) : (
          <div className="space-y-12">
            
            {/* Kundli Reports */}
            <div>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><FiStar className="text-[#C2185B]" /> Saved Kundli Matches</h2>
              {kundlis.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-gray-500 italic text-center">No saved Kundli matches yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kundlis.map(k => (
                    <div key={k._id} className="bg-white p-6 rounded-[2rem] shadow-premium border border-pink-50 relative group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-1">Match Report</p>
                          <h3 className="font-display font-black text-lg">{k.brideName} & {k.groomName}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-[#C2185B]/20 flex items-center justify-center font-black text-[#C2185B]">
                          {k.percentage}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-4 italic">{new Date(k.createdAt).toLocaleDateString()}</p>
                      <button onClick={() => deleteKundli(k._id)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Muhurat Searches */}
            <div>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><FiCalendar className="text-[#D4AF37]" /> Saved Muhurat Searches</h2>
              {muhurats.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-gray-500 italic text-center">No saved Muhurat searches yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {muhurats.map(m => (
                    <div key={m._id} className="bg-white p-6 rounded-[2rem] shadow-premium border border-orange-50 relative group">
                      <div className="mb-4">
                        <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-1">Muhurat Search</p>
                        <h3 className="font-display font-black text-lg">{m.city}, {m.state}</h3>
                        <p className="text-sm font-medium">{m.month}/{m.year}</p>
                      </div>
                      <p className="text-xs text-gray-500 italic">Saved {new Date(m.createdAt).toLocaleDateString()}</p>
                      <button onClick={() => deleteMuhurat(m._id)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
