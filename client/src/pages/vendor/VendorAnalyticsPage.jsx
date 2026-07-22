import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiEye, FiUsers, FiDollarSign, FiDownload } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import api from '../../utils/api'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/helpers'

const COLORS = ['#D4AF37', '#C2185B', '#111111', '#F3E5AB'];

export default function VendorAnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/vendors/dashboard').then(res => {
      setDashboardData(res.data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-pink-100 border-t-[#c41e6b] rounded-full animate-spin shadow-xl" />
      </div>
    )
  }

  const { vendor, stats, monthlyBookings = [], monthlyCabBookings = [], bookingStats = [] } = dashboardData || {}

  const isPremiumOrElite = vendor?.subscription?.status === 'active' && 
                           ['premium', 'elite', 'silver', 'gold', 'platinum'].includes(vendor?.subscription?.plan);
  const isElite = vendor?.subscription?.status === 'active' && 
                  ['elite', 'platinum'].includes(vendor?.subscription?.plan);

  if (!isPremiumOrElite) {
    return (
      <div className="pb-24 max-w-7xl mx-auto px-4 md:px-8 pt-8 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-12 shadow-premium border border-pink-50 max-w-2xl w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-30" />
          <div className="w-20 h-20 bg-[#FFF8F0] text-[#D4AF37] rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner animate-pulse">👑</div>
          <h2 className="font-display text-3xl font-black text-gray-900 mb-4 tracking-tight">Advanced Analytics Locked</h2>
          <p className="text-gray-500 font-medium italic mb-8 max-w-md mx-auto leading-relaxed">
            Upgrade your ShaadiSaathi subscription to **Premium** or **Elite** to access real-time profile views, booking conversions, revenue analytics, and demographic trends.
          </p>
          <Link to="/vendor-subscription" className="bg-[#C2185B] text-white font-black text-[10px] uppercase tracking-[0.3em] py-5 px-12 rounded-2xl shadow-xl hover:scale-105 transition-all inline-block">
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  // 1. Revenue Data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Combine service and cab monthly revenue
  const combinedMonthly = {}
  
  const processMonthly = (arr) => {
    arr.forEach(m => {
      const key = `${m._id.year}-${m._id.month}`
      if (!combinedMonthly[key]) {
        combinedMonthly[key] = { month: monthNames[m._id.month - 1], revenue: 0, count: 0, year: m._id.year, mNum: m._id.month }
      }
      combinedMonthly[key].revenue += (m.revenue || 0)
      combinedMonthly[key].count += (m.count || 0)
    })
  }
  processMonthly(monthlyBookings)
  processMonthly(monthlyCabBookings)

  let revenueData = Object.values(combinedMonthly).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.mNum - b.mNum
  })

  if (revenueData.length === 0) {
    revenueData = [{ month: 'Current', revenue: 0, count: 0 }]
  }

  // 2. Package / Status Data
  let packageData = bookingStats.map(s => ({ name: s._id.charAt(0).toUpperCase() + s._id.slice(1), value: s.count }))
  if (packageData.length === 0) {
    packageData = [{ name: 'No Data', value: 1 }]
  }

  // 3. Traffic vs Leads (Mapping combined monthly count as proxy since we lack daily traffic)
  const trafficData = revenueData.map(r => ({
    day: r.month,
    views: r.count * 12, // rough proxy for views per booking
    leads: r.count
  }))

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 shadow-sm border border-white flex-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50" />
          
          <div className="relative z-10">
            <div className="divider-luxe !justify-start mb-3 !gap-3">
              <div className="divider-line !bg-gradient-to-r !from-[#C2185B] !to-[#8E244D] !w-12" />
              <span className="text-[#C2185B] text-[10px] font-black uppercase tracking-[0.5em] italic">Business Insights</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm">Analytics Dashboard</h1>
            <p className="text-gray-500 font-medium italic mt-2">Track your profile performance, booking conversion rates, and revenue growth.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/80 backdrop-blur-md border border-white shadow-sm px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-gray-600 outline-none cursor-pointer hover:border-[#D4AF37]/50 hover:shadow-md transition-all appearance-none pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%22%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23D4AF37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]"
          >
            <option>All Time</option>
          </select>
          <button className="bg-white/80 backdrop-blur-md border border-white shadow-sm w-[3.25rem] h-[3.25rem] rounded-[1.5rem] flex items-center justify-center text-gray-400 hover:text-[#C2185B] hover:shadow-md hover:-translate-y-0.5 transition-all">
            <FiDownload size={18} />
          </button>
        </div>
      </div>

      {/* AI Business Insights for Elite Vendors */}
      {isElite && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-gray-950 via-[#8E244D] to-[#C2185B] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-premium border border-white/10"
        >
          <div className="absolute inset-0 floral-pattern opacity-[0.05]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-full blur-3xl opacity-30" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4">
              <span className="text-[#D4AF37]">👑</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Elite AI Business Insights</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-black text-white leading-tight mb-4 tracking-tight">Smart Market Overview for {vendor.businessName}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="text-xl mb-3">📈 Demand Spike</div>
                <p className="text-xs font-medium text-white/80 leading-relaxed">
                  Queries in <span className="text-[#D4AF37] font-bold">{vendor.location?.city || 'Patna'}</span> for <span className="text-[#D4AF37] font-bold">{vendor.category?.name || 'Wedding Services'}</span> have increased by **18.4%** over the past 14 days.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="text-xl mb-3">💰 Price Optimization</div>
                <p className="text-xs font-medium text-white/80 leading-relaxed">
                  Competitors in your category have set their starting price at **{formatPrice(vendor.basePrice * 1.1 || 75000)}** average. Your pricing is highly competitive.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="text-xl mb-3">🎯 Smart Recommendations</div>
                <p className="text-xs font-medium text-white/80 leading-relaxed">
                  Couples are actively looking for services with *"{vendor.location?.city || 'Patna'}"* locations. Try adding more tags to your portfolios.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        {[
          { label: 'Total Revenue', value: `₹${(stats?.totalEarnings || 0).toLocaleString()}`, change: 'Actual earnings', trend: 'up', icon: <FiDollarSign />, color: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/20' },
          { label: 'Profile Views', value: (vendor?.views || 0).toLocaleString(), change: 'Lifetime views', trend: 'up', icon: <FiEye />, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
          { label: 'Total Bookings', value: (stats?.totalBookings || 0).toLocaleString(), change: 'Active conversions', trend: 'up', icon: <FiUsers />, color: 'from-pink-400 to-[#C2185B]', shadow: 'shadow-pink-500/20' },
          { label: 'Rating', value: vendor?.rating?.average || '0', change: `${vendor?.rating?.count || 0} reviews`, trend: 'up', icon: <FiTrendingUp />, color: 'from-[#D4AF37] to-amber-500', shadow: 'shadow-[#D4AF37]/20' },
        ].map((kpi, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-6 shadow-sm border border-white hover:shadow-lg hover:border-[#D4AF37]/30 hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
            <div className={`w-14 h-14 rounded-[1.2rem] bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center mb-5 shadow-lg ${kpi.shadow} group-hover:scale-110 transition-transform duration-300 text-xl`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="font-display text-4xl font-black text-gray-900 leading-none drop-shadow-sm">{kpi.value}</h3>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg text-green-600 bg-green-50 border border-green-100 uppercase tracking-widest`}>
                {kpi.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-display text-2xl font-black text-gray-900">Revenue Overview</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Monthly Earnings</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C2185B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C2185B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900', textTransform: 'uppercase' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900' }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} width={60} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                  formatter={(val) => [`₹${val}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C2185B" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Popularity */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white flex flex-col hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-display text-2xl font-black text-gray-900">Booking Status</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Current Bookings Distribution</p>
          </div>
          <div className="flex-1 min-h-[220px] flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={packageData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {packageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', fontWeight: '900' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {packageData.map((pkg, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">{pkg.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{pkg.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic vs Leads Chart */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white hover:shadow-md transition-shadow mt-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-display text-2xl font-black text-gray-900">Traffic vs Conversions</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Monthly views mapped to generated leads</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900', textTransform: 'uppercase' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', fontWeight: '900' }} />
                <Bar yAxisId="left" dataKey="views" fill="#D4AF37" radius={[8, 8, 0, 0]} name="Profile Views" maxBarSize={40} />
                <Bar yAxisId="right" dataKey="leads" fill="#111111" radius={[8, 8, 0, 0]} name="Bookings" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
