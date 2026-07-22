import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import { formatPrice, formatDateShort } from '../../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDollarSign, FiTrendingUp, FiDownload, FiBriefcase, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast'

export default function VendorEarningsPage() {
  const { myVendorProfile: vendor } = useSelector(s => s.vendor || {})
  const [data, setData] = useState(null)
  const [chartMode, setChartMode] = useState('bar') // 'bar' or 'area'
  const [timeFilter, setTimeFilter] = useState('all') // 'all', '6months', '1year'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/vendors/dashboard')
      .then(r => {
        setData(r.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Format monthly stats
  let chartData = data?.monthlyBookings?.map(m => ({
    month: monthNames[(m._id.month - 1)] + ' ' + m._id.year,
    bookings: m.count,
    revenue: m.revenue || 0,
  })).reverse() || []

  // Filter based on selected timeframe
  if (timeFilter === '6months') {
    chartData = chartData.slice(-6)
  } else if (timeFilter === '1year') {
    chartData = chartData.slice(-12)
  }

  // Calculate cumulative earnings progression
  let cumulative = 0
  const areaChartData = chartData.map(d => {
    cumulative += d.revenue
    return {
      ...d,
      cumulativeRevenue: cumulative
    }
  })

  const simulatedTransactions = data?.recentBookings?.map(b => ({
    id: b.bookingId || b._id,
    customer: b.contactName || 'Valued Couple',
    date: b.eventDate,
    amount: b.amount,
    advance: b.advanceAmount,
    status: b.paymentStatus === 'advance_paid' ? 'Advance Received' : b.paymentStatus === 'fully_paid' ? 'Settled' : 'Pending',
    type: b.bookingType === 'baraat-cab' ? 'Baraat Cab' : 'Service'
  })) || [];

  const handleExportCSV = () => {
    try {
      const headers = ['Transaction ID', 'Customer Name', 'Event Date', 'Total Amount (₹)', 'Advance Collected (₹)', 'Status', 'Booking Type']
      const rows = simulatedTransactions.map(t => [
        t.id,
        t.customer,
        formatDateShort(t.date),
        t.amount,
        t.advance,
        t.status,
        t.type
      ])

      const csvContent = "data:text/csv;charset=utf-8,"
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `ShaadiSaathi_Payouts_Report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Financial Report Exported Successfully!')
    } catch (e) {
      toast.error('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-100 border-t-[#c41e6b] rounded-full animate-spin shadow-xl" />
          <p className="text-gray-500 font-bold tracking-wider animate-pulse">GENERATING FINANCIAL INTELLIGENCE...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-16 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Title Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 shadow-sm border border-white flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-[#C2185B]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50" />

            <div className="relative z-10">
              <div className="divider-luxe !justify-start mb-3 !gap-3">
                <div className="divider-line !bg-gradient-to-r !from-[#C2185B] !to-[#8E244D] !w-12" />
                <span className="text-[#C2185B] text-[10px] font-black uppercase tracking-[0.5em] italic">Financial Intelligence</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm">Revenue Ledger</h1>
              <p className="text-gray-500 font-medium italic mt-2">Track real-time payouts, advance balances, and revenue growth statistics</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="bg-white/80 backdrop-blur-md border border-white shadow-sm rounded-[1.5rem] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-2 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:shadow-md hover:-translate-y-0.5 transition-all">
              <FiDollarSign size={14} /> Withdraw Funds
            </button>
            <button className="bg-white/80 backdrop-blur-md border border-white shadow-sm rounded-[1.5rem] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-2 hover:border-[#C2185B]/50 hover:text-[#C2185B] hover:shadow-md hover:-translate-y-0.5 transition-all">
              <FiDownload size={14} /> GST Report
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white rounded-[1.5rem] px-8 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300"
            >
              <FiDownload size={14} /> Export All
            </button>
          </div>
        </div>

        {/* ── Premium Glassmorphic Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
          {[
            {
              label: 'Total Realized Earnings',
              value: formatPrice(vendor?.totalEarnings || 0),
              change: '+14.2% from last quarter',
              icon: <FiDollarSign />,
              bg: 'bg-white/80 backdrop-blur-2xl border-white',
              textColor: 'text-gray-900',
              subColor: 'text-[#C2185B] bg-pink-50 border border-pink-100',
              iconBg: 'bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white shadow-[0_10px_20px_rgba(194,24,91,0.2)]'
            },
            {
              label: 'Confirmed Reservations',
              value: `${vendor?.totalBookings || 0} Bookings`,
              change: 'Average booking size: ₹' + (vendor?.totalBookings > 0 ? Math.round((vendor?.totalEarnings || 0) / vendor.totalBookings).toLocaleString() : '0'),
              icon: <FiBriefcase />,
              bg: 'bg-white/80 backdrop-blur-2xl border-white',
              textColor: 'text-gray-900',
              subColor: 'text-[#D4AF37] bg-amber-50 border border-amber-100',
              iconBg: 'bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-black shadow-[0_10px_20px_rgba(212,175,55,0.2)]'
            },
            {
              label: 'Pending Balance Due',
              value: formatPrice(Math.round((vendor?.totalEarnings || 0) * 0.5)),
              change: 'Estimated payout upon completion',
              icon: <FiClock />,
              bg: 'bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border-[#333]',
              textColor: 'text-white',
              subColor: 'text-gray-300 bg-white/10 border border-white/10',
              iconBg: 'bg-white/10 text-white shadow-[0_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-md'
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-sm hover:shadow-lg border hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between ${stat.bg}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${stat.textColor === 'text-white' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</span>
                  <span className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${stat.iconBg}`}>
                    {stat.icon}
                  </span>
                </div>
                <p className={`font-display font-black text-4xl md:text-5xl tracking-tighter ${stat.textColor} mb-3 leading-none drop-shadow-sm`}>{stat.value}</p>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest inline-block px-3 py-1.5 rounded-xl ${stat.subColor} mt-4 self-start`}>{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Interactive Charts Suite ── */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-sm p-8 md:p-10 mb-10 relative overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-shadow">
          <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-gray-900 tracking-tight">Revenue Analytics</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Visualize growth rates and cyclical business models</p>
            </div>

            {/* Chart Mode & Filter Selectors */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-gray-50/80 backdrop-blur-md rounded-2xl p-1.5 flex gap-1 border border-gray-100/50 shadow-inner">
                <button
                  onClick={() => setChartMode('bar')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chartMode === 'bar' ? 'bg-white text-[#C2185B] shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}
                >
                  Monthly Payout
                </button>
                <button
                  onClick={() => setChartMode('area')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chartMode === 'area' ? 'bg-white text-[#C2185B] shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}
                >
                  Growth Curve
                </button>
              </div>

              <div className="relative">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-white hover:bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:border-[#D4AF37] shadow-sm appearance-none pr-10 cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%22%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23D4AF37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_1rem_center]"
                >
                  <option value="all">All-time Range</option>
                  <option value="1year">Last 12 Months</option>
                  <option value="6months">Last 6 Months</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full h-[360px]">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-5xl mb-4 opacity-50">📊</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for booking statistics to populate</p>
              </div>
            ) : chartMode === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C2185B" />
                      <stop offset="100%" stopColor="#8E244D" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900', textTransform: 'uppercase' }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                    formatter={(v) => [formatPrice(v), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900', textTransform: 'uppercase' }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '900' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                    formatter={(v) => [formatPrice(v), 'Cumulative Revenue']}
                  />
                  <Area type="monotone" dataKey="cumulativeRevenue" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#areaGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Transaction History Table ── */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-sm overflow-hidden mb-12 relative z-10">
          <div className="px-8 py-8 md:px-10 border-b border-gray-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-gray-900 tracking-tight">Recent Payout Transactions</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Audit trail of advance allocations and final settlements</p>
            </div>
            <span className="w-14 h-14 bg-emerald-50/80 text-emerald-600 rounded-[1.2rem] flex items-center justify-center shadow-sm border border-emerald-100">
              <FiTrendingUp size={24} />
            </span>
          </div>

          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="table-responsive w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] border-b border-gray-100/50">
                  <th className="py-5 px-8 md:px-10">Transaction ID</th>
                  <th className="py-5 px-6">Customer Couple</th>
                  <th className="py-5 px-6">Date</th>
                  <th className="py-5 px-6 text-right">Total Price</th>
                  <th className="py-5 px-6 text-right">Advance Handoff</th>
                  <th className="py-5 px-8 md:px-10 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 font-semibold text-xs text-gray-700">
                {simulatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white transition-colors group">
                    <td data-label="Transaction ID" className="py-6 px-8 md:px-10 font-black text-gray-900 tracking-widest">{t.id}</td>
                    <td data-label="Customer Couple" className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-sm shadow-inner group-hover:scale-105 transition-transform">{t.customer.charAt(0)}</div>
                        <div>
                          <p className="font-black text-sm text-gray-900">{t.customer}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{t.type}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Date" className="py-6 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{formatDateShort(t.date)}</td>
                    <td data-label="Total Price" className="py-6 px-6 text-right font-black text-sm text-gray-900">{formatPrice(t.amount)}</td>
                    <td data-label="Advance Handoff" className="py-6 px-6 text-right font-black text-sm text-[#C2185B]">{formatPrice(t.advance)}</td>
                    <td data-label="Settlement Status" className="py-6 px-8 md:px-10 text-center">
                      <span className={`inline-block px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border shadow-sm ${t.status === 'Settled'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : t.status === 'Advance Received'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
