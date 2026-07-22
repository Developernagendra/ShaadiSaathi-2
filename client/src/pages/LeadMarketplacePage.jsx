import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, fetchNearbyLeads, createLead, submitQuotation } from '../store/slices/featureSlice';
import { fetchCategories } from '../store/slices/vendorSlice';
import { LuMessageSquare as MessageSquare, LuMapPin as MapPin, LuCalendar as Calendar, LuWallet as Wallet, LuSend as Send, LuPlus as Plus } from 'react-icons/lu';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const LeadMarketplacePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { leads, loading } = useSelector((state) => state.feature);
  const { categories } = useSelector((state) => state.vendor);
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    if (user?.role === 'vendor') {
      dispatch(fetchNearbyLeads());
    } else {
      dispatch(fetchLeads());
    }
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, user, categories.length]);

  const handlePostLead = async (values, { resetForm }) => {
    const result = await dispatch(createLead(values));
    if (!result.error) {
      toast.success('Requirement posted successfully!');
      setIsPostModalOpen(false);
      resetForm();
    }
  };

  const handleSubmitQuote = async (values, { resetForm }) => {
    const result = await dispatch(submitQuotation({ ...values, leadId: selectedLead._id }));
    if (!result.error) {
      toast.success('Quotation sent!');
      setSelectedLead(null);
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'vendor' ? 'Market' : 'My'} <span className="text-[#c41e6b]">Leads</span>
            </h1>
            <p className="text-gray-500">
              {user?.role === 'vendor' 
                ? 'Find wedding requirements and submit your quotations' 
                : 'Post your wedding requirements and get quotes from verified vendors'}
            </p>
          </div>
          {user?.role !== 'vendor' && (
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="bg-[#c41e6b] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-pink-100 hover:bg-[#a01857] transition-all flex items-center gap-2"
            >
              <Plus size={20} /> Post Requirement
            </button>
          )}
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📋</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No leads found</h3>
            <p className="text-gray-500">
              {user?.role === 'vendor' 
                ? 'There are no active requirements in your city right now.' 
                : 'You haven\'t posted any wedding requirements yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <motion.div
                key={lead._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-pink-50 text-[#c41e6b] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {lead.serviceType?.name || 'Requirement'}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                    lead.status === 'open' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">{lead.description}</h3>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" /> {lead.city}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" /> {new Date(lead.eventDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Wallet size={16} className="text-[#f59e0b]" /> Budget: ₹{lead.budget?.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {lead.user?.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{lead.user?.name || 'User'}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {lead.quotations?.length || 0} Quotes
                  </div>
                </div>

                <button 
                  disabled={lead.status !== 'open'}
                  onClick={() => user?.role === 'vendor' ? setSelectedLead(lead) : null}
                  className={`w-full mt-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    user?.role === 'vendor' 
                    ? 'bg-[#c41e6b] text-white hover:bg-[#a01857] disabled:bg-gray-200' 
                    : 'bg-gray-100 text-gray-600 cursor-default'
                  }`}
                >
                  {user?.role === 'vendor' ? (
                    <><Send size={18} /> Submit Quote</>
                  ) : (
                    <><MessageSquare size={18} /> {lead.quotations?.length > 0 ? 'Viewing Quotes...' : 'Awaiting Quotes'}</>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Post Lead Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Post Requirement</h2>
                  <button onClick={() => setIsPostModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
                </div>

                <Formik
                  initialValues={{ serviceType: '', budget: '', city: '', eventDate: '', description: '' }}
                  validationSchema={Yup.object({
                    serviceType: Yup.string().required('Required'),
                    budget: Yup.number().required('Required').min(1000),
                    city: Yup.string().required('Required'),
                    eventDate: Yup.date().required('Required').min(new Date()),
                    description: Yup.string().required('Required').min(20),
                  })}
                  onSubmit={handlePostLead}
                >
                  <Form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Category</label>
                        <Field as="select" name="serviceType" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c41e6b]">
                          <option value="">Select category</option>
                          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </Field>
                        <ErrorMessage name="serviceType" component="p" className="text-red-500 text-[10px] mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Budget (₹)</label>
                        <Field name="budget" type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c41e6b]" placeholder="e.g. 50000" />
                        <ErrorMessage name="budget" component="p" className="text-red-500 text-[10px] mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">City</label>
                        <Field name="city" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c41e6b]" placeholder="Event city" />
                        <ErrorMessage name="city" component="p" className="text-red-500 text-[10px] mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Event Date</label>
                        <Field name="eventDate" type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c41e6b]" />
                        <ErrorMessage name="eventDate" component="p" className="text-red-500 text-[10px] mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Description</label>
                      <Field as="textarea" name="description" rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c41e6b] resize-none" placeholder="Explain your requirements in detail..." />
                      <ErrorMessage name="description" component="p" className="text-red-500 text-[10px] mt-1" />
                    </div>
                    <button type="submit" className="w-full bg-[#c41e6b] text-white py-4 rounded-xl font-bold hover:bg-[#a01857] transition-all shadow-lg shadow-pink-100">
                      Post Lead
                    </button>
                  </Form>
                </Formik>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Quote Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Submit Quotation</h2>
                    <p className="text-xs text-gray-500 font-medium">Lead: {selectedLead.description.substring(0, 40)}...</p>
                  </div>
                  <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
                </div>

                <Formik
                  initialValues={{ amount: '', message: '' }}
                  validationSchema={Yup.object({
                    amount: Yup.number().required('Required').min(500),
                    message: Yup.string().required('Required').min(10),
                  })}
                  onSubmit={handleSubmitQuote}
                >
                  <Form className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Your Quote (₹)</label>
                      <Field name="amount" type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg font-bold text-gray-900 focus:outline-none focus:border-[#c41e6b]" placeholder="0.00" />
                      <ErrorMessage name="amount" component="p" className="text-red-500 text-[10px] mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Cover Letter / Message</label>
                      <Field as="textarea" name="message" rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c41e6b] resize-none" placeholder="Explain why you are the best fit for this requirement..." />
                      <ErrorMessage name="message" component="p" className="text-red-500 text-[10px] mt-1" />
                    </div>
                    <button type="submit" className="w-full bg-[#c41e6b] text-white py-4 rounded-xl font-bold hover:bg-[#a01857] transition-all shadow-lg shadow-pink-100 flex items-center justify-center gap-2">
                      <Send size={20} /> Send Quotation
                    </button>
                  </Form>
                </Formik>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadMarketplacePage;
