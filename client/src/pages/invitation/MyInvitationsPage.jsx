import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvitations, deleteInvitation } from '../../store/slices/invitationSlice';
import { FiPlus, FiEdit3, FiEye, FiShare2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MyInvitationsPage() {
  const dispatch = useDispatch();
  const { invitations, templates, loading } = useSelector(s => s.invitation);

  useEffect(() => {
    dispatch(fetchInvitations());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      const res = await dispatch(deleteInvitation(id));
      if (!res.error) toast.success('Invitation deleted');
    }
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/invitation/${id}`);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return <div className="p-10 text-center">Loading your invitations...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-gray-900 tracking-tight">My Invitations</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and track your wedding invitations</p>
        </div>
        <Link
          to="/invitation-creator/new"
          className="bg-[#C2185B] text-white font-black text-sm uppercase tracking-widest py-3 px-6 rounded-xl hover:bg-[#8E244D] transition-all flex items-center gap-2 shadow-lg"
        >
          <FiPlus size={16} /> Create Invitation
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">💌</div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No invitations yet</h3>
          <p className="text-gray-500 mb-6">You haven't created any wedding invitations. Start designing your digital invitation now!</p>
          <Link
            to="/invitation-creator/new"
            className="inline-flex bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Create Your First Invitation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => {
            const t = templates.find(temp => temp.id === inv.template) || templates[0];
            return (
              <div key={inv._id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img src={t.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={t.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                      {t.name}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-display text-2xl font-black leading-tight mb-1">
                      {inv.brideName || 'Bride'} & {inv.groomName || 'Groom'}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium opacity-90">
                      <span>{inv.weddingDate ? new Date(inv.weddingDate).toLocaleDateString() : 'No Date'}</span>
                      <span className="flex items-center gap-1"><FiEye /> {inv.analytics?.views || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-4 gap-2">
                    <Link to={`/invitation-creator/edit/${inv._id}`} className="col-span-2 bg-gray-50 text-gray-900 font-bold text-[11px] uppercase tracking-widest py-2.5 rounded-xl text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <FiEdit3 size={14} /> Edit
                    </Link>
                    <button onClick={() => copyLink(inv._id)} className="bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors tooltip" title="Copy Link">
                      <FiShare2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(inv._id)} className="bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors tooltip" title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
