import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminConsultations, updateConsultationStatus, deleteConsultation } from '../../store/slices/expertSlice';
import { FiDownload, FiEye, FiTrash2, FiMoreVertical, FiX, FiCheck, FiUser, FiCalendar, FiMapPin, FiMessageSquare, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminExpertConsultationsPage() {
  const dispatch = useDispatch();
  const { consultations, loading } = useSelector(state => state.expert);

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminConsultations());
  }, [dispatch]);

  const total = consultations.length;
  const pending = consultations.filter(c => c.status === 'pending').length;
  const inProgress = consultations.filter(c => c.status === 'in_progress').length;
  const completed = consultations.filter(c => c.status === 'completed').length;

  const handleStatusChange = async (id, newStatus) => {
    dispatch(updateConsultationStatus({ id, status: newStatus }));
    setActiveDropdown(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this consultation lead permanently?")) {
      dispatch(deleteConsultation(id));
      setActiveDropdown(null);
    }
  };

  const openViewModal = (consultation) => {
    setSelectedConsultation(consultation);
    setIsViewModalOpen(true);
    setActiveDropdown(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Expert Consultations</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all wedding expert consultation requests</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Leads</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{total}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
              <FiUser />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
              <h3 className="text-2xl font-black text-yellow-600 mt-1">{pending}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center text-xl">
              <FiMessageSquare />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{inProgress}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl">
              <FiCalendar />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-green-600 mt-1">{completed}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-xl">
              <FiCheck />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Context</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">Loading consultations...</td>
                  </tr>
                ) : consultations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">No consultations found.</td>
                  </tr>
                ) : (
                  consultations.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{new Date(c.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FiMapPin /> {c.city || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1"><FiPhone size={12} className="text-gray-400" /> {c.phone}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{c.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase tracking-wider">
                          {c.service || c.package || 'General'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openViewModal(c)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                            <FiEye size={14} />
                          </button>
                          
                          <div className="relative">
                            <button onClick={() => setActiveDropdown(activeDropdown === c._id ? null : c._id)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                              <FiMoreVertical size={14} />
                            </button>
                            
                            <AnimatePresence>
                              {activeDropdown === c._id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 top-10 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                                >
                                  <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Update Status</p>
                                  </div>
                                  <button onClick={() => handleStatusChange(c._id, 'pending')} className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 font-medium">Mark Pending</button>
                                  <button onClick={() => handleStatusChange(c._id, 'contacted')} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium">Mark Contacted</button>
                                  <button onClick={() => handleStatusChange(c._id, 'in_progress')} className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium">Mark In Progress</button>
                                  <button onClick={() => handleStatusChange(c._id, 'completed')} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium">Mark Completed</button>
                                  <button onClick={() => handleStatusChange(c._id, 'cancelled')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Mark Cancelled</button>
                                  
                                  <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button onClick={() => handleDelete(c._id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2">
                                      <FiTrash2 size={14} /> Delete
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedConsultation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900">Consultation Details</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Info</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><FiUser size={14} /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{selectedConsultation.name}</p>
                          <p className="text-xs text-gray-500">Submitted: {new Date(selectedConsultation.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0"><FaWhatsapp size={14} /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{selectedConsultation.phone}</p>
                          <a href={`https://wa.me/91${selectedConsultation.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">Chat on WhatsApp</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Event Requirements</h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Service:</span>
                        <span className="font-bold text-gray-900 capitalize">{selectedConsultation.service || selectedConsultation.package || 'General'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Wedding Date:</span>
                        <span className="font-bold text-gray-900">{selectedConsultation.weddingDate ? new Date(selectedConsultation.weddingDate).toLocaleDateString() : 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">City:</span>
                        <span className="font-bold text-gray-900">{selectedConsultation.city || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Guests:</span>
                        <span className="font-bold text-gray-900">{selectedConsultation.guestCount || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-500">Contact Time:</span>
                        <span className="font-bold text-[#C2185B]">{selectedConsultation.preferredTime || 'Any time'} {selectedConsultation.preferredDate ? `on ${new Date(selectedConsultation.preferredDate).toLocaleDateString()}` : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Customer Message</h4>
                  <div className="bg-[#FDFCF8] border border-[#EAE6D6] p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {selectedConsultation.message || <span className="text-gray-400 italic">No additional message provided.</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
