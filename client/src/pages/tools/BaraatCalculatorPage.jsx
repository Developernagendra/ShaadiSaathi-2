import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { FaTruck, FaCarSide, FaBus } from 'react-icons/fa';

export default function BaraatCalculatorPage() {
  const [formData, setFormData] = useState({
    distance: 10,
    guests: 50
  });
  
  const [loading, setLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Baraat Fleet Calculator', action: 'viewed_tool' }).catch(() => {});
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: Number(e.target.value) });

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (formData.distance <= 0 || formData.guests <= 0) {
      return toast.error('Please enter valid positive numbers');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/tools/baraat-calc', formData);
      setResults(data.data);
      setHasBooked(false);
    } catch (err) {
      toast.error('Failed to calculate fleet requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleBookFleet = async () => {
    if (!results) return;
    setIsBooking(true);
    try {
      await api.post('/tools/baraat-calc/book', {
        guestCount: formData.guests,
        distance: formData.distance,
        breakdown: results.breakdown,
        estimatedCost: results.estimatedCost
      });
      setHasBooked(true);
      toast.success('Fleet booking request submitted! Admin will contact you soon.');
    } catch (err) {
      toast.error('Failed to submit booking request. Please log in.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-32 pb-20 font-sans text-white">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Imperial Fleet
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Baraat Fleet <span className="text-amber-500">Calculator</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto">
            Calculate the exact number of vehicles needed for your Baraat procession and estimate the costs instantly.
          </p>
        </div>

        <div className="bg-slate-800 rounded-[2rem] p-6 md:p-8 shadow-premium border border-slate-700 mb-10">
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Total Distance (km)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  name="distance" 
                  min="1" max="500" 
                  value={formData.distance} 
                  onChange={handleChange} 
                  className="w-full accent-amber-500"
                />
                <span className="font-bold text-xl min-w-[60px] text-right">{formData.distance} km</span>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Number of Guests</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  name="guests" 
                  min="10" max="1000" step="10"
                  value={formData.guests} 
                  onChange={handleChange} 
                  className="w-full accent-amber-500"
                />
                <span className="font-bold text-xl min-w-[60px] text-right">{formData.guests}</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="w-full bg-amber-500 text-slate-900 rounded-xl py-4 font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-[0_10px_20px_rgba(245,158,11,0.2)]">
                {loading ? 'Calculating...' : 'Calculate Fleet Details'}
              </button>
            </div>
          </form>
        </div>

        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-[2rem] border border-slate-700 overflow-hidden">
            <div className="p-8 text-center border-b border-slate-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Estimated Cost</p>
              <h3 className="font-display text-4xl font-black">{formatPrice(results.estimatedCost)}</h3>
              <p className="text-slate-400 text-sm mt-2">Total Capacity: {results.totalCapacity} guests</p>
            </div>
            
            <div className="p-8">
              <h4 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-widest">Recommended Fleet Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* SUVs */}
                <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600 text-center relative overflow-hidden">
                  <FaTruck className="text-4xl text-slate-400 mx-auto mb-4 opacity-50" />
                  <p className="font-black text-3xl mb-1">{results.breakdown.suvs}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">SUVs (7 Seater)</p>
                </div>

                {/* Sedans */}
                <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600 text-center relative overflow-hidden">
                  <FaCarSide className="text-4xl text-slate-400 mx-auto mb-4 opacity-50" />
                  <p className="font-black text-3xl mb-1">{results.breakdown.sedans}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Sedans (4 Seater)</p>
                </div>

                {/* Buses */}
                <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600 text-center relative overflow-hidden">
                  <FaBus className="text-4xl text-slate-400 mx-auto mb-4 opacity-50" />
                  <p className="font-black text-3xl mb-1">{results.breakdown.buses}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Buses (40 Seater)</p>
                </div>
                
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={handleBookFleet}
                  disabled={isBooking || hasBooked}
                  className="inline-block bg-amber-500 text-slate-900 rounded-xl px-8 py-3 font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isBooking ? 'Submitting...' : (hasBooked ? 'Request Submitted ✓' : 'Book Imperial Fleet Now →')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
