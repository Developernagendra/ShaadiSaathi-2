import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { LuPlus, LuCircleCheck, LuCircle } from 'react-icons/lu';

export default function ChecklistManager({ checklist, planId, refreshData }) {
  const { t } = useTranslation();
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!checklist || !checklist.tasks) return <div>No tasks found.</div>;

  const handleToggle = async (taskId, currentStatus) => {
    try {
      await api.put(`/weddings/${planId}/checklist`, { taskId, isCompleted: !currentStatus });
      refreshData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await api.put(`/weddings/${planId}/checklist`, { title: newTask, category: 'Custom' });
      setNewTask('');
      setIsAdding(false);
      refreshData();
      toast.success('Task added');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const completedCount = checklist.tasks.filter(t => t.isCompleted).length;
  const progress = checklist.tasks.length > 0 ? Math.round((completedCount / checklist.tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Wedding Checklist</h3>
        <span className="font-bold text-[#C2185B] bg-[#C2185B]/10 px-3 py-1 rounded-full">{progress}% Done</span>
      </div>

      <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
        <div className="bg-[#C2185B] h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="space-y-4 mb-6">
        {checklist.tasks.map(task => (
          <div key={task._id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer hover:bg-gray-50 ${task.isCompleted ? 'bg-gray-50/50 border-gray-200' : 'border-gray-200 bg-white'}`} onClick={() => handleToggle(task._id, task.isCompleted)}>
            {task.isCompleted ? <LuCircleCheck className="text-2xl text-green-500 flex-shrink-0" /> : <LuCircle className="text-2xl text-gray-300 flex-shrink-0" />}
            <div>
              <p className={`font-semibold ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{task.category}</p>
            </div>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input autoFocus type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="E.g., Book DJ" className="flex-1 px-4 py-2 border rounded-xl" />
          <button type="submit" className="bg-[#C2185B] text-white px-6 py-2 rounded-xl font-bold">Save</button>
          <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold">Cancel</button>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-[#C2185B] font-bold py-2 hover:bg-pink-50 px-4 rounded-xl transition-colors">
          <LuPlus /> Add Custom Task
        </button>
      )}
    </div>
  );
}
