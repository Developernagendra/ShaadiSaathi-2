import { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiTrash2, FiDownload, FiSearch, FiSend, FiLoader, FiEdit, FiCalendar, FiBarChart2, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns', 'builder', 'subscribers'
  const [loading, setLoading] = useState(true);
  
  // Subscribers State
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  
  // Builder State
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [campaignBanner, setCampaignBanner] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [testEmail, setTestEmail] = useState('');
  
  const [processing, setProcessing] = useState({
    save: false,
    test: false,
    send: false,
    schedule: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, campsRes] = await Promise.all([
        api.get('/newsletter/subscribers'),
        api.get('/newsletter/campaigns')
      ]);
      setSubscribers(subsRes.data.data.subscribers);
      setCampaigns(campsRes.data.data.campaigns);
    } catch (err) {
      toast.error('Failed to load newsletter data');
    } finally {
      setLoading(false);
    }
  };

  // --- SUBSCRIBER ACTIONS ---
  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      await api.delete(`/newsletter/subscribers/${id}`);
      setSubscribers(prev => prev.filter(s => s._id !== id));
      toast.success('Subscriber deleted');
    } catch (err) {
      toast.error('Failed to delete subscriber');
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Status', 'Source', 'Subscribed At'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(s => `"${s.email}","${s.status}","${s.source}","${new Date(s.subscribedAt).toLocaleString()}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shaadisaathi_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // --- CAMPAIGN ACTIONS ---
  const handleSaveDraft = async () => {
    if (!campaignSubject || !campaignContent) {
      toast.error('Subject and HTML content are required');
      return;
    }
    setProcessing({ ...processing, save: true });
    try {
      let res;
      if (editingCampaignId) {
        res = await api.patch(`/newsletter/campaigns/${editingCampaignId}`, {
          subject: campaignSubject,
          content: campaignContent,
          bannerUrl: campaignBanner,
          status: 'draft'
        });
      } else {
        res = await api.post('/newsletter/campaigns', {
          name: campaignSubject,
          subject: campaignSubject,
          content: campaignContent,
          bannerUrl: campaignBanner
        });
        setEditingCampaignId(res.data.data.campaign._id);
      }
      toast.success('Draft saved successfully');
      fetchData(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setProcessing({ ...processing, save: false });
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }
    if (!editingCampaignId) {
      toast.error('Please save as draft first before testing');
      return;
    }
    setProcessing({ ...processing, test: true });
    try {
      await api.patch(`/newsletter/campaigns/${editingCampaignId}`, {
        subject: campaignSubject, content: campaignContent, bannerUrl: campaignBanner
      });
      await api.post(`/newsletter/campaigns/${editingCampaignId}/test`, { email: testEmail });
      toast.success('Test email sent successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setProcessing({ ...processing, test: false });
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) {
      toast.error('Please select a date and time');
      return;
    }
    if (!editingCampaignId) {
      toast.error('Please save as draft first');
      return;
    }
    setProcessing({ ...processing, schedule: true });
    try {
      await api.patch(`/newsletter/campaigns/${editingCampaignId}`, {
        subject: campaignSubject, content: campaignContent, bannerUrl: campaignBanner,
        status: 'scheduled', scheduledAt
      });
      toast.success('Campaign scheduled successfully');
      fetchData();
      setActiveTab('campaigns');
      resetBuilder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule campaign');
    } finally {
      setProcessing({ ...processing, schedule: false });
    }
  };

  const handleBlastNow = async () => {
    if (!window.confirm('Are you sure you want to blast this to ALL active subscribers?')) return;
    if (!editingCampaignId) {
      toast.error('Please save as draft first');
      return;
    }
    setProcessing({ ...processing, send: true });
    try {
      await api.patch(`/newsletter/campaigns/${editingCampaignId}`, {
        subject: campaignSubject, content: campaignContent, bannerUrl: campaignBanner
      });
      await api.post(`/newsletter/campaigns/${editingCampaignId}/send`);
      toast.success('Campaign blast started in background');
      fetchData();
      setActiveTab('campaigns');
      resetBuilder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start campaign blast');
    } finally {
      setProcessing({ ...processing, send: false });
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/newsletter/campaigns/${id}`);
      toast.success('Campaign deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const loadCampaignToBuilder = (campaign) => {
    setEditingCampaignId(campaign._id);
    setCampaignSubject(campaign.subject);
    setCampaignContent(campaign.content);
    setCampaignBanner(campaign.bannerUrl || '');
    setScheduledAt(campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '');
    setActiveTab('builder');
  };

  const resetBuilder = () => {
    setEditingCampaignId(null);
    setCampaignSubject('');
    setCampaignContent('');
    setCampaignBanner('');
    setScheduledAt('');
  };

  // --- RENDER HELPERS ---
  const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const StatusBadge = ({ status }) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-600',
      scheduled: 'bg-blue-100 text-blue-600',
      sending: 'bg-yellow-100 text-yellow-600',
      sent: 'bg-emerald-100 text-emerald-600',
      failed: 'bg-red-100 text-red-600',
      partial_success: 'bg-orange-100 text-orange-600'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-black text-gray-900">Newsletter System</h1>
        <p className="text-gray-500">End-to-End Campaign Management & Subscribers.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-8">
        <button 
          onClick={() => setActiveTab('campaigns')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'campaigns' ? 'border-b-2 border-[#C2185B] text-[#C2185B]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center gap-2"><FiBarChart2 /> Campaigns</div>
        </button>
        <button 
          onClick={() => { setActiveTab('builder'); resetBuilder(); }}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'builder' ? 'border-b-2 border-[#C2185B] text-[#C2185B]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center gap-2"><FiEdit /> Campaign Builder</div>
        </button>
        <button 
          onClick={() => setActiveTab('subscribers')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'subscribers' ? 'border-b-2 border-[#C2185B] text-[#C2185B]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center gap-2"><FiUsers /> Subscribers ({subscribers.length})</div>
        </button>
      </div>

      {/* --- CAMPAIGNS TAB --- */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiMail className="text-[#C2185B]" /> Campaign History
            </h2>
            <button 
              onClick={() => { setActiveTab('builder'); resetBuilder(); }}
              className="px-4 py-2 bg-[#111] text-white rounded-lg font-bold text-sm hover:bg-black transition-colors"
            >
              + New Campaign
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table-responsive w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="pb-3 font-black">Campaign Subject</th>
                  <th className="pb-3 font-black">Status</th>
                  <th className="pb-3 font-black">Scheduled/Sent</th>
                  <th className="pb-3 font-black text-center">Delivered</th>
                  <th className="pb-3 font-black text-center">Failed</th>
                  <th className="pb-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-400"><FiLoader className="animate-spin text-2xl mx-auto" /></td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-500 font-medium">No campaigns found.</td></tr>
                ) : (
                  campaigns.map(camp => (
                    <tr key={camp._id} className="hover:bg-gray-50 transition-colors">
                      <td data-label="Campaign Subject" className="py-4 font-medium text-gray-900 max-w-xs truncate">{camp.subject}</td>
                      <td data-label="Status" className="py-4"><StatusBadge status={camp.status} /></td>
                      <td data-label="Scheduled/Sent" className="py-4 text-sm text-gray-500">
                        {camp.sentAt ? new Date(camp.sentAt).toLocaleString() : (camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleString() : '-')}
                      </td>
                      <td data-label="Delivered" className="py-4 text-center text-sm font-bold text-emerald-600">
                        {camp.stats.delivered}/{camp.stats.totalSent}
                      </td>
                      <td data-label="Failed" className="py-4 text-center text-sm font-bold text-red-500">
                        {camp.stats.failed}
                      </td>
                      <td data-label="Actions" className="py-4 text-right space-x-2">
                        {['draft', 'scheduled'].includes(camp.status) && (
                          <button onClick={() => loadCampaignToBuilder(camp)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                            <FiEdit />
                          </button>
                        )}
                        <button onClick={() => handleDeleteCampaign(camp._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- BUILDER TAB --- */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {editingCampaignId ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email Subject *</label>
                  <input 
                    type="text" value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)}
                    placeholder="e.g. Top 5 Wedding Trends of 2024" 
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#C2185B] rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Banner Image URL (Optional)</label>
                  <input 
                    type="url" value={campaignBanner} onChange={(e) => setCampaignBanner(e.target.value)}
                    placeholder="https://..." 
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#C2185B] rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">HTML Content *</label>
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                    <ReactQuill 
                      theme="snow" 
                      value={campaignContent} 
                      onChange={setCampaignContent}
                      className="h-64"
                      modules={{ toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['link', 'image'],
                        ['clean']
                      ]}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 space-y-6">
              
              <button 
                onClick={handleSaveDraft} disabled={processing.save}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                {processing.save ? <FiLoader className="animate-spin" /> : <><FiCheckCircle /> Save Draft</>}
              </button>

              <hr className="border-gray-100" />

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Send Test Email</label>
                <div className="flex gap-2">
                  <input 
                    type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="admin@example.com" 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#C2185B]"
                  />
                  <button onClick={handleSendTest} disabled={processing.test} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100">
                    {processing.test ? <FiLoader className="animate-spin" /> : 'Send'}
                  </button>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Schedule For Later</label>
                <input 
                  type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C2185B]"
                />
                <button onClick={handleSchedule} disabled={processing.schedule} className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg font-bold text-sm hover:bg-purple-100 flex items-center justify-center gap-2">
                  {processing.schedule ? <FiLoader className="animate-spin" /> : <><FiCalendar /> Schedule Campaign</>}
                </button>
              </div>

              <hr className="border-gray-100" />

              <button 
                onClick={handleBlastNow} disabled={processing.send}
                className="w-full py-4 bg-[#C2185B] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#A0144B] transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {processing.send ? <FiLoader className="animate-spin" /> : <><FiSend /> Blast Now</>}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* --- SUBSCRIBERS TAB --- */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiUsers className="text-[#C2185B]" /> Subscribers
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" placeholder="Search emails..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C2185B] text-sm"
                />
              </div>
              <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 flex items-center gap-2">
                <FiDownload /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-responsive w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="pb-3 font-black">Email Address</th>
                  <th className="pb-3 font-black">Status</th>
                  <th className="pb-3 font-black">Subscribed Date</th>
                  <th className="pb-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="4" className="py-8 text-center"><FiLoader className="animate-spin text-2xl mx-auto text-gray-400" /></td></tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-500 font-medium">No subscribers found.</td></tr>
                ) : (
                  filteredSubscribers.map(sub => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                      <td data-label="Email Address" className="py-4 font-medium text-gray-900">{sub.email}</td>
                      <td data-label="Status" className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td data-label="Subscribed Date" className="py-4 text-sm text-gray-500">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                      <td data-label="Actions" className="py-4 text-right">
                        <button onClick={() => handleDeleteSubscriber(sub._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
