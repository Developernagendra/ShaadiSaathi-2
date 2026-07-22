import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminInquiries, updatePackageInquiry, deletePackageInquiry } from '../../store/slices/packageSlice';
import { FiDownload, FiMessageSquare, FiEdit2, FiEye, FiTrash2, FiMoreVertical, FiX, FiCheck, FiUser, FiCalendar, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPackageInquiriesPage() {
  const dispatch = useDispatch();
  const { inquiries, loading } = useSelector(state => state.packages);

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminInquiries());
  }, [dispatch]);

  // Analytics
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(i => i.status === 'New').length;
  const convertedInquiries = inquiries.filter(i => i.status === 'Converted').length;
  const closedInquiries = inquiries.filter(i => i.status === 'Closed' || i.status === 'Rejected').length;

  const getPackageDisplay = (pkgStr) => {
    if (pkgStr === 'silver') return 'Silver Wedding';
    if (pkgStr === 'gold') return 'Gold Wedding';
    if (pkgStr === 'royal') return 'Royal Wedding';
    if (pkgStr === 'custom') return 'Custom Package';
    return 'Unknown Package';
  };

  const handleStatusChange = async (id, newStatus) => {
    dispatch(updatePackageInquiry({ id, status: newStatus }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this inquiry permanently?")) {
      dispatch(deletePackageInquiry(id));
      setActiveDropdown(null);
    }
  };

  const openViewModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
    setActiveDropdown(null);
  };

  const openEditModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Name', 'Phone', 'Email', 'City', 'Package', 'Budget', 'Guests', 'Status', 'Message'];
    const rows = inquiries.map(i => [
      new Date(i.createdAt).toLocaleDateString(),
      i.name,
      i.phone,
      i.email || '',
      i.city,
      getPackageDisplay(i.package),
      i.budget || '',
      i.guestsCount || '',
      i.status,
      `"${(i.message || i.specialRequirements || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `package-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Package Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and respond to premium wedding package leads.</p>
        </div>
        <button onClick={exportCSV} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition shadow-sm text-sm font-bold">
          <FiDownload /> Export Leads
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: totalInquiries, color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: 'New Inquiries', value: newInquiries, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
          { label: 'Converted', value: convertedInquiries, color: 'bg-green-50 text-green-700 border-green-100' },
          { label: 'Closed/Rejected', value: closedInquiries, color: 'bg-gray-50 text-gray-700 border-gray-200' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${stat.color}`}>
            <p className="text-xs font-black uppercase tracking-wider opacity-80 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="table-responsive w-full text-left border-collapse w-full sm:min-w-[900px] lg:min-w-0">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                <th className="p-5">Inquiry Details</th>
                <th className="p-5">Client Info</th>
                <th className="p-5">Event</th>
                <th className="p-5">Budget</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && inquiries.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-medium">Loading inquiries...</td></tr>
              ) : inquiries.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-medium">No inquiries found yet.</td></tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td data-label="Inquiry Details" className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37]/20 to-[#B38D22]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                          <FiMessageSquare size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{getPackageDisplay(inquiry.package)}</p>
                          <p className="text-xs text-gray-500">ID: #{inquiry._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Client Info" className="p-5">
                      <p className="font-bold text-gray-900 text-sm">{inquiry.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{inquiry.phone}</p>
                    </td>
                    <td data-label="Event" className="p-5">
                      <p className="font-medium text-gray-900 text-sm">{new Date(inquiry.weddingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{inquiry.city} • {inquiry.guestsCount || '?'} Guests</p>
                    </td>
                    <td data-label="Budget" className="p-5">
                      <p className="font-bold text-gray-900 text-sm">
                        {inquiry.budget ? `₹${inquiry.budget.toLocaleString('en-IN')}` : 'Not Specified'}
                      </p>
                    </td>
                    <td data-label="Status" className="p-5">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer border appearance-none text-center min-w-[100px]
                          ${inquiry.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            inquiry.status === 'Contacted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              inquiry.status === 'Interested' || inquiry.status === 'Negotiation' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                inquiry.status === 'Converted' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-gray-100 text-gray-600 border-gray-200'}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Converted">Converted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td data-label="Actions" className="p-5">
                      <div className="flex items-center justify-center gap-2 relative">
                        <a
                          href={`https://wa.me/91${inquiry.phone}?text=${encodeURIComponent(`Hi ${inquiry.name}, reaching out from ShaadiSaathi regarding your inquiry for the ${getPackageDisplay(inquiry.package)}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition"
                          title="WhatsApp"
                        >
                          <FaWhatsapp size={16} />
                        </a>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === inquiry._id ? null : inquiry._id)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === inquiry._id && (
                          <div className="absolute right-10 top-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                            <button onClick={() => openViewModal(inquiry)} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                              <FiEye size={14} /> View Details
                            </button>
                            <button onClick={() => openEditModal(inquiry)} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t border-gray-50">
                              <FiEdit2 size={14} /> Edit Notes
                            </button>
                            <button onClick={() => handleDelete(inquiry._id)} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-gray-50 font-medium">
                              <FiTrash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedInquiry && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h3 className="text-lg font-bold font-serif">Inquiry Details</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><FiX /></button>
              </div>
              <div className="p-6 space-y-6">

                {/* Client Info */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"><FiUser /> Client Info</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                    <p className="text-sm"><span className="text-gray-500 w-20 inline-block">Name:</span> <span className="font-bold">{selectedInquiry.name}</span></p>
                    <p className="text-sm"><span className="text-gray-500 w-20 inline-block">Phone:</span> <span className="font-bold">{selectedInquiry.phone}</span></p>
                    <p className="text-sm"><span className="text-gray-500 w-20 inline-block">Email:</span> <span className="font-bold">{selectedInquiry.email || 'N/A'}</span></p>
                  </div>
                </div>

                {/* Event Info */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"><FiCalendar /> Event Details</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                    <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Date:</span> <span className="font-bold">{new Date(selectedInquiry.weddingDate).toDateString()}</span></p>
                    <p className="text-sm"><span className="text-gray-500 w-24 inline-block">City:</span> <span className="font-bold">{selectedInquiry.city}</span></p>
                    <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Guests:</span> <span className="font-bold">{selectedInquiry.guestsCount || 'N/A'}</span></p>
                    <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Budget:</span> <span className="font-bold text-[#C2185B]">{selectedInquiry.budget ? `₹${selectedInquiry.budget.toLocaleString()}` : 'N/A'}</span></p>
                  </div>
                </div>

                {/* Package Info */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"><FiMessageSquare /> Requested Package</h4>
                  <div className="bg-[#FFFDF0] p-4 rounded-xl border border-[#D4AF37]/30">
                    <p className="font-bold text-[#D4AF37]">{getPackageDisplay(selectedInquiry.package)}</p>
                    <p className="text-xs text-[#B38D22] mt-1">Custom Pricing / Quote</p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Client Message</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 italic">
                    "{selectedInquiry.message || selectedInquiry.specialRequirements || 'No message provided.'}"
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal (Updates Note & Budget) */}
      <AnimatePresence>
        {isEditModalOpen && selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold font-serif">Edit Inquiry Admin Notes</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><FiX /></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const note = e.target.note.value;
                  const budget = e.target.budget.value;
                  dispatch(updatePackageInquiry({
                    id: selectedInquiry._id,
                    note: note ? note : undefined,
                    budget: budget ? Number(budget) : undefined
                  }));
                  setIsEditModalOpen(false);
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Update Budget Estimate (₹)</label>
                  <input type="number" name="budget" defaultValue={selectedInquiry.budget || ''} className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C2185B]" placeholder="e.g. 150000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add Admin Note</label>
                  <textarea name="note" rows="3" className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C2185B] resize-none" placeholder="Record discussion details here..."></textarea>
                </div>

                {/* Previous Notes */}
                {selectedInquiry.notes?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Previous Notes</p>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {selectedInquiry.notes.map((n, i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded text-xs text-gray-600 border border-gray-100">
                          <p>{n.text}</p>
                          <p className="text-[9px] text-gray-400 mt-1">{new Date(n.addedAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-[#C2185B] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#8E244D] mt-2">
                  Save Updates
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
