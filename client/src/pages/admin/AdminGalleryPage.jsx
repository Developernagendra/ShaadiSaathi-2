import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiStar, FiTrash2, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await api.get('/showcase/admin/gallery');
      setGallery(res.data.data);
    } catch (err) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.patch(`/showcase/admin/gallery/${id}`, updates);
      toast.success('Updated successfully');
      fetchGallery();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this album permanently?')) return;
    try {
      await api.delete(`/showcase/admin/gallery/${id}`);
      toast.success('Deleted successfully');
      fetchGallery();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-4xl font-black text-gray-900">Gallery Moderation</h1>
          <p className="text-gray-500 font-medium mt-2">Review, approve, and feature vendor photo albums.</p>
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
                  <th className="p-4 font-bold text-gray-600 text-sm">Details</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Vendor</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gallery.map(album => (
                  <tr key={album._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      {album.images?.length > 0 ? (
                        <img src={album.images[0]} alt="Cover" className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><FiImage size={24} /></div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{album.title}</div>
                      <div className="text-sm text-gray-500 font-medium">{album.category} • {album.images?.length || 0} photos</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {album.vendorId?.businessName || 'Unknown Vendor'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        album.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                        album.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                        album.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                      }`}>
                        {album.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {album.status !== 'approved' && (
                          <button onClick={() => handleUpdate(album._id, { status: 'approved' })} className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 hover:scale-110 transition-transform shadow-sm" title="Approve">
                            <FiCheck />
                          </button>
                        )}
                        {album.status !== 'rejected' && (
                          <button onClick={() => handleUpdate(album._id, { status: 'rejected' })} className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 hover:scale-110 transition-transform shadow-sm" title="Reject">
                            <FiX />
                          </button>
                        )}
                        <button onClick={() => handleUpdate(album._id, { featured: !album.featured })} className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${album.featured ? 'bg-yellow-50 text-yellow-500 border border-yellow-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`} title="Feature on Homepage">
                          <FiStar className={album.featured ? 'fill-current' : ''} />
                        </button>
                        <button onClick={() => handleDelete(album._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:scale-110 transition-transform shadow-sm" title="Delete">
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
            {gallery.map(album => (
              <div key={album._id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  {album.images?.length > 0 ? (
                    <img src={album.images[0]} alt="Cover" className="w-20 h-20 object-cover rounded-2xl shadow-sm border border-gray-100" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100"><FiImage size={24} /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-black text-gray-900 truncate text-lg">{album.title}</div>
                    <div className="text-sm text-gray-500 font-medium truncate mb-2">{album.category} • {album.vendorId?.businessName || 'Unknown'}</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      album.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                      album.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                      album.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                    }`}>
                      {album.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50 overflow-x-auto hide-scrollbar pb-1">
                  {album.status !== 'approved' && (
                    <button onClick={() => handleUpdate(album._id, { status: 'approved' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 flex-shrink-0">
                      <FiCheck /> Approve
                    </button>
                  )}
                  {album.status !== 'rejected' && (
                    <button onClick={() => handleUpdate(album._id, { status: 'rejected' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 flex-shrink-0">
                      <FiX /> Reject
                    </button>
                  )}
                  <button onClick={() => handleUpdate(album._id, { featured: !album.featured })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ${album.featured ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <FiStar className={album.featured ? 'fill-current' : ''} /> Feature
                  </button>
                  <button onClick={() => handleDelete(album._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 flex-shrink-0">
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
