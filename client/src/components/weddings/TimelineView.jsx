import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function TimelineView({ events, planId, refreshData }) {
  const { t } = useTranslation();

  const toggleEventStatus = async (eventId, currentStatus) => {
    try {
      await api.put(`/weddings/${planId}/events/${eventId}`, { isCompleted: !currentStatus });
      refreshData();
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  if (!events || events.length === 0) return <div>No timeline events found.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{t('wedding_planner.timeline_tab', 'Timeline')}</h3>
      <div className="relative border-l-2 border-[#C2185B]/20 ml-4 md:ml-6 space-y-8 pb-4">
        {events.map((event, index) => {
          const isCompleted = event.isCompleted;
          const eventDate = new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
          
          return (
            <div key={event._id} className="relative pl-8 md:pl-10">
              {/* Timeline dot */}
              <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer bg-white transition-colors`} onClick={() => toggleEventStatus(event._id, isCompleted)}>
                {isCompleted ? (
                  <FiCheckCircle className="text-[#C2185B] text-xl bg-white" />
                ) : (
                  <FiCircle className="text-gray-300 hover:text-[#C2185B] text-xl bg-white" />
                )}
              </div>
              
              <div className={`bg-gray-50 rounded-xl p-5 border border-gray-100 transition-all ${isCompleted ? 'opacity-60' : 'hover:shadow-md'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h4 className={`text-lg font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{event.title}</h4>
                  <span className="text-sm font-semibold text-[#8E244D] bg-[#C2185B]/10 px-3 py-1 rounded-full w-fit mt-2 md:mt-0">{eventDate}</span>
                </div>
                <p className="text-gray-600 text-sm">{event.description}</p>
                {event.notes && (
                  <div className="mt-3 text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100">
                    <span className="font-bold">Notes:</span> {event.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
