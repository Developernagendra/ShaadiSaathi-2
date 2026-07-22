import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiPieChart, FiMapPin, FiStar, FiCalendar, FiGlobe, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminAstrologyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/astrology');
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load astrology analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    let csv = 'Type,City,Language,Date\n';
    
    data.recentSavedKundlis.forEach(k => {
      csv += `Kundli Match,-,${k.language || 'en'},${new Date(k.createdAt).toLocaleDateString()}\n`;
    });
    
    data.recentSavedMuhurats.forEach(m => {
      csv += `Muhurat Search,"${m.city}, ${m.state}",${m.language || 'en'},${new Date(m.createdAt).toLocaleDateString()}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrology_reports.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center p-20">Loading Astrology Analytics...</div>;
  if (!data) return <div className="text-center p-20 text-red-500">Error loading data.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900 tracking-tight">Astrology Tools Analytics</h1>
          <p className="text-gray-500 italic text-sm">Monitor Shubh Muhurat and Kundli Matching usage.</p>
        </div>
        <button onClick={exportCSV} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none" />
          <FiPieChart className="text-4xl text-[#D4AF37] mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total API Queries</p>
          <h2 className="text-4xl font-display font-black mt-1">{data.totalSearches}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-pink-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50/50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <FiStar className="text-4xl text-[#C2185B] mb-4 relative z-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 relative z-10">Kundli Matches</p>
          <h2 className="text-4xl font-display font-black text-gray-900 mt-1 relative z-10">{data.totalKundlis}</h2>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <FiCalendar className="text-4xl text-orange-500 mb-4 relative z-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 relative z-10">Muhurat Searches</p>
          <h2 className="text-4xl font-display font-black text-gray-900 mt-1 relative z-10">{data.totalMuhurats}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Usage */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="font-display font-black text-lg mb-6 flex items-center gap-2"><FiGlobe className="text-[#C2185B]" /> Language Distribution</h3>
          <div className="space-y-4">
            {data.languageDistribution.length === 0 && <p className="text-sm italic text-gray-500">No language data yet.</p>}
            {data.languageDistribution.map(l => {
              const langMap = { 'en': 'English', 'hi': 'Hindi', 'bho': 'Bhojpuri', 'mai': 'Maithili' };
              const percentage = Math.round((l.count / data.totalSearches) * 100);
              return (
                <div key={l.language}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold">{langMap[l.language] || l.language}</span>
                    <span className="text-gray-500">{l.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* State Usage */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="font-display font-black text-lg mb-6 flex items-center gap-2"><FiMapPin className="text-[#D4AF37]" /> Top States (Muhurat)</h3>
          <div className="space-y-3">
            {data.stateDistribution.length === 0 && <p className="text-sm italic text-gray-500">No state data yet.</p>}
            {data.stateDistribution.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">{s.state}</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#C2185B] bg-pink-50 px-3 py-1 rounded-lg">{s.count} Searches</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
