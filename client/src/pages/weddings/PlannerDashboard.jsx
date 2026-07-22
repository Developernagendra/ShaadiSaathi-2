import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { LuCalendar, LuMapPin, LuUsers, LuWallet, LuSquareCheck, LuStar } from 'react-icons/lu';
import api from '../../utils/api';
import TimelineView from '../../components/weddings/TimelineView';
import BudgetTracker from '../../components/weddings/BudgetTracker';
import GuestManager from '../../components/weddings/GuestManager';
import ChecklistManager from '../../components/weddings/ChecklistManager';
import VendorRecommendations from '../../components/weddings/VendorRecommendations';

export default function PlannerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      const response = await api.get('/weddings/my');
      if (!response.data.plan) {
        navigate('/tools/mithila-planner'); // redirect to creation wizard
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-12 h-12 border-4 border-[#C2185B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { plan, events, budget, guests, checklist, metrics } = data;
  
  // Calculate Countdown
  const today = new Date();
  const wDate = new Date(plan.weddingDate);
  const daysDiff = Math.ceil((wDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const countdownText = daysDiff > 0 ? `${daysDiff} ${t('wedding_planner.countdown', 'Days To Go')}` : 'Just Married! 🎉';

  const tabs = [
    { id: 'timeline', label: t('wedding_planner.timeline_tab', 'Timeline'), icon: <LuCalendar /> },
    { id: 'budget', label: t('wedding_planner.budget_tab', 'Budget'), icon: <LuWallet /> },
    { id: 'guests', label: t('wedding_planner.guests_tab', 'Guests'), icon: <LuUsers /> },
    { id: 'checklist', label: t('wedding_planner.checklist_tab', 'Checklist'), icon: <LuSquareCheck /> },
    { id: 'vendors', label: t('wedding_planner.vendors_tab', 'Recommendations'), icon: <LuStar /> }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-[#FFF8F0] text-[#C2185B] rounded-full text-xs font-bold tracking-widest border border-[#D4AF37]/30 mb-3">
                {plan.planId} • {plan.weddingType}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 mb-2">
                {plan.brideName} & {plan.groomName}
              </h1>
              <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
                <span className="flex items-center gap-1"><LuCalendar className="text-[#C2185B]" /> {new Date(plan.weddingDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><LuMapPin className="text-[#C2185B]" /> {plan.city}, {plan.state}</span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-4 md:p-6 text-white text-center shadow-lg min-w-[200px]">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('wedding_planner.countdown', 'Days To Go')}</p>
              <p className="text-4xl font-black text-[#D4AF37]">{daysDiff > 0 ? daysDiff : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar mb-8 gap-2 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#C2185B] text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-[#C2185B] border border-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'timeline' && <TimelineView events={events} planId={plan._id} refreshData={fetchData} />}
          {activeTab === 'budget' && <BudgetTracker budget={budget} planId={plan._id} refreshData={fetchData} />}
          {activeTab === 'guests' && <GuestManager guests={guests} planId={plan._id} refreshData={fetchData} />}
          {activeTab === 'checklist' && <ChecklistManager checklist={checklist} planId={plan._id} refreshData={fetchData} />}
          {activeTab === 'vendors' && <VendorRecommendations planId={plan._id} />}
        </div>
        
      </div>
    </div>
  );
}
