import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiActivity, FiTool, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import api from '../../utils/api';

const COLORS = ['#C2185B', '#D4AF37', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b', '#0ea5e9', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-gray-100">
        <p className="font-bold text-gray-900 text-xs mb-1">{payload[0].name}</p>
        <p className="font-black text-[#C2185B] text-sm">{payload[0].value} Uses</p>
      </div>
    );
  }
  return null;
};

export default function ToolAnalyticsWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tools/analytics')
      .then(res => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-premium border border-gray-100 h-[400px] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-[#C2185B] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || !data.mostUsedTools || data.mostUsedTools.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-premium border border-gray-100 h-[400px] flex items-center justify-center flex-col text-gray-400">
        <FiPieChart className="text-5xl mb-4 text-gray-300" />
        <p className="text-lg font-bold text-gray-500">No Tool Analytics Yet</p>
        <p className="text-sm font-medium mt-1">Users haven't interacted with tools.</p>
      </div>
    );
  }

  const pieData = data.mostUsedTools.map(item => ({
    name: item._id,
    value: item.count
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C2185B]/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent rounded-tr-full pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C2185B] to-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <FiActivity className="text-white text-xl" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-black text-gray-900 tracking-tight">Tool Analytics</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Usage Data</p>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 bg-pink-50 text-[#C2185B] rounded-full flex items-center justify-center">
              <FiTrendingUp className="text-sm" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Interactions</p>
          <p className="font-display text-3xl font-black text-gray-900">{data.totalInteractions}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 bg-amber-50 text-[#D4AF37] rounded-full flex items-center justify-center">
              <FiTool className="text-sm" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Active Tools</p>
          <p className="font-display text-3xl font-black text-gray-900">{pieData.length}</p>
        </motion.div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[250px] relative z-10 bg-gray-50/50 rounded-3xl border border-gray-50 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={6}
              cornerRadius={8}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ filter: `drop-shadow(0px 4px 10px ${COLORS[index % COLORS.length]}40)` }}
                />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ 
                fontSize: '11px', 
                fontWeight: '700',
                color: '#4b5563'
              }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
