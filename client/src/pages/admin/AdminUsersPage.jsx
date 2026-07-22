import { useEffect, useState, useCallback } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatDateShort, getInitials } from '../../utils/helpers'
import { FiSearch, FiUsers } from 'react-icons/fi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchVal)
      setPage(1) // Reset to page 1 on new search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchVal])

  const load = useCallback((currentPage = 1) => {
    setLoading(true)
    api.get('/users', { params: { search: search || undefined, role: role || undefined, page: currentPage, limit: 20 } })
      .then(r => {
        setUsers(r.data.users)
        setPagination(r.data.pagination)
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load users')
        setUsers([])
      })
      .finally(() => setLoading(false))
  }, [search, role])

  useEffect(() => { load(page) }, [load, page])

  const handleToggle = async (id) => {
    try {
      const r = await api.patch(`/users/${id}/toggle-status`)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: r.data.isActive } : u))
      toast.success(r.data.message)
    } catch (err) { toast.error('Failed') }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">Manage Users</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex gap-4 flex-wrap items-center">
            <div className="relative flex-1 min-w-[300px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={searchVal} 
                onChange={e => setSearchVal(e.target.value)} 
                placeholder="Search users by name or email..." 
                className="input-field pl-11 py-3 text-sm" 
              />
            </div>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="input-field py-3 text-sm w-44"
            >
              <option value="">All Roles</option>
              <option value="user">Couples / Users</option>
              <option value="vendor">Service Providers</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="table-responsive w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  {['User Profile', 'Contact', 'Phone', 'Role', 'Joined', 'Verified', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-4 px-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={8} className="py-4 px-4"><div className="h-8 shimmer rounded-lg" /></td></tr>)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FiUsers size={48} className="mb-4 opacity-20" />
                        <p className="font-display text-xl font-bold">No users found</p>
                        <p className="text-sm mt-1 italic">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td data-label="User Profile" className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-xs font-black text-primary-600 flex-shrink-0 overflow-hidden border border-primary-100">
                          {u.avatar?.url ? <img src={u.avatar.url} className="w-full h-full object-cover" /> : getInitials(u.name)}
                        </div>
                        <span className="font-bold text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td data-label="Contact" className="py-4 px-6 font-medium text-gray-600">{u.email}</td>
                    <td data-label="Phone" className="py-4 px-6 text-gray-400">{u.phone || '—'}</td>
                    <td data-label="Role" className="py-4 px-6">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'vendor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td data-label="Joined" className="py-4 px-6 text-gray-400 whitespace-nowrap">{formatDateShort(u.createdAt)}</td>
                    <td data-label="Verified" className="py-4 px-6">
                      {u.isVerified ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full w-fit">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 font-bold text-[10px] uppercase tracking-widest bg-red-50 px-2 py-1 rounded-full w-fit">
                          ✗ Unverified
                        </span>
                      )}
                    </td>
                    <td data-label="Status" className="py-4 px-6">
                      {u.isActive ? (
                        <span className="text-[10px] font-black bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="text-[10px] font-black bg-red-100 text-red-600 px-2.5 py-1 rounded-full uppercase tracking-wider">Inactive</span>
                      )}
                    </td>
                    <td data-label="Actions" className="py-4 px-6">
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleToggle(u._id)} 
                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${page === p ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:border-primary-300'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
