import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChecklist, updateChecklistTask } from '../store/slices/featureSlice';
import { LuCircle as Circle, LuPlus as Plus, LuTrash2 as Trash2, LuCalendar as Calendar } from 'react-icons/lu';
import { FiCheckCircle as CheckCircle2 } from 'react-icons/fi';
import api from '../utils/api';

const ChecklistPage = () => {
  const dispatch = useDispatch();
  const { checklist, loading } = useSelector((state) => state.feature);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    api.post('/tools/track', { toolName: 'Wedding Checklist', action: 'viewed_tool' }).catch(() => { });
    dispatch(fetchChecklist());
  }, [dispatch]);

  const handleToggle = (taskId, isCompleted) => {
    dispatch(updateChecklistTask({ taskId, isCompleted: !isCompleted }));
  };

  const tasks = checklist?.tasks || [];
  const categories = ['All', ...new Set(tasks.map(t => t.category))];

  const filteredTasks = activeTab === 'All'
    ? tasks
    : tasks.filter(t => t.category === activeTab);

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FFF8F0]/40 pt-[calc(var(--navbar-height,76px)+2.5rem)] pb-28 overflow-x-hidden font-sans">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header & Progress */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-pink-900/5 border border-pink-50 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-[#C2185B] text-xs font-bold mb-3">
                <span>📋</span> WEDDING PLANNING TOOL
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900 tracking-tight">Your Wedding <span className="text-[#c41e6b]">Checklist ✅</span></h1>
              <p className="text-gray-500 mt-1">Stay organized and track your wedding planning progress with ease.</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="text-center px-3">
                <span className="block text-2xl font-black text-gray-900">{tasks.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center px-3">
                <span className="block text-2xl font-black text-emerald-600">{completedCount}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Completed</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center px-3">
                <span className="block text-2xl font-black text-amber-600">{tasks.length - completedCount}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Remaining</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-500 uppercase tracking-wider">Overall Completion</span>
              <span className="text-[#c41e6b]">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#c41e6b] to-[#f59e0b] rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === cat
                ? 'bg-[#c41e6b] text-white shadow-lg shadow-pink-100'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={task._id}
              className={`bg-white p-5 rounded-2xl border transition-all flex items-center justify-between group ${task.isCompleted ? 'border-gray-100 opacity-75' : 'border-gray-200 shadow-sm'
                }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggle(task._id, task.isCompleted)}
                  className={`transition-colors ${task.isCompleted ? 'text-[#c41e6b]' : 'text-gray-300 hover:text-[#c41e6b]'}`}
                >
                  {task.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div>
                  <h4 className={`font-bold transition-all ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-[#f59e0b] bg-amber-50 px-2 py-0.5 rounded">{task.category}</span>
                    {task.deadline && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}

          <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-[#c41e6b] hover:text-[#c41e6b] transition-all">
            <Plus size={20} /> Add New Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
