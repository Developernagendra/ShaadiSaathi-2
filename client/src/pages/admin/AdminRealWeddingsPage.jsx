import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiStar, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminRealWeddingsPage() {
  const [weddings, setWeddings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    try {
      const res = await api.get('/showcase/admin/real-weddings');
      setWeddings(res.data.data);
    } catch (err) {
      toast.error('Failed to load Real Weddings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.patch(`/showcase/admin/real-weddings/${id}`, updates);
      toast.success('Updated successfully');
      fetchWeddings();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this wedding permanently?')) return;
    try {
      await api.delete(`/showcase/admin/real-weddings/${id}`);
      toast.success('Deleted successfully');
      fetchWeddings();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-4xl font-black text-gray-900">Real Weddings Moderation</h1>
          <p className="text-gray-500 font-medium mt-2">Approve and feature real weddings submitted by vendors.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-600 text-sm">Cover</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Couple & City</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Vendor</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {weddings.map(wedding => (
                  <tr key={wedding._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <img src={wedding.coverImage} alt="Cover" className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{wedding.brideName} & {wedding.groomName}</div>
                      <div className="text-sm text-gray-500 font-medium">{wedding.city}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {wedding.vendorId?.businessName || 'Unknown Vendor'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        wedding.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                        wedding.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                        wedding.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                      }`}>
                        {wedding.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {wedding.status !== 'approved' && (
                          <button onClick={() => handleUpdate(wedding._id, { status: 'approved' })} className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 hover:scale-110 transition-transform shadow-sm" title="Approve">
                            <FiCheck />
                          </button>
                        )}
                        {wedding.status !== 'rejected' && (
                          <button onClick={() => handleUpdate(wedding._id, { status: 'rejected' })} className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 hover:scale-110 transition-transform shadow-sm" title="Reject">
                            <FiX />
                          </button>
                        )}
                        <button onClick={() => handleUpdate(wedding._id, { featured: !wedding.featured })} className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${wedding.featured ? 'bg-yellow-50 text-yellow-500 border border-yellow-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`} title="Feature on Homepage">
                          <FiStar className={wedding.featured ? 'fill-current' : ''} />
                        </button>
                        <a href={`/real-weddings/${wedding._id}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-transform shadow-sm" title="View">
                          <FiEye />
                        </a>
                        <button onClick={() => handleDelete(wedding._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:scale-110 transition-transform shadow-sm" title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-gray-50">
            {weddings.map(wedding => (
              <div key={wedding._id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <img src={wedding.coverImage} alt="Cover" className="w-20 h-20 object-cover rounded-2xl shadow-sm border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-black text-gray-900 truncate text-lg">{wedding.brideName} & {wedding.groomName}</div>
                    <div className="text-sm text-gray-500 font-medium truncate mb-2">{wedding.city} • {wedding.vendorId?.businessName || 'Unknown Vendor'}</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      wedding.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                      wedding.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                      wedding.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                    }`}>
                      {wedding.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50 overflow-x-auto hide-scrollbar pb-1">
                  {wedding.status !== 'approved' && (
                    <button onClick={() => handleUpdate(wedding._id, { status: 'approved' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 flex-shrink-0">
                      <FiCheck /> Approve
                    </button>
                  )}
                  {wedding.status !== 'rejected' && (
                    <button onClick={() => handleUpdate(wedding._id, { status: 'rejected' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 flex-shrink-0">
                      <FiX /> Reject
                    </button>
                  )}
                  <button onClick={() => handleUpdate(wedding._id, { featured: !wedding.featured })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ${wedding.featured ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <FiStar className={wedding.featured ? 'fill-current' : ''} /> Feature
                  </button>
                  <a href={`/real-weddings/${wedding._id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 flex-shrink-0">
                    <FiEye /> View
                  </a>
                  <button onClick={() => handleDelete(wedding._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 flex-shrink-0">
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
