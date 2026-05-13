import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Circle, CheckCircle2, Loader2, Calendar, Target, ShieldCheck, Target as TargetIcon } from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';
import { useWebVault } from '../../context/WebVaultContext';
import UniversalEmptyState from '../../components/webapp/UniversalEmptyState';
import UniversalModal from '../../components/webapp/UniversalModal';
import { motion } from 'framer-motion';

const Widget = ({ children, className = "" }) => (
  <div className={`glass-card rounded-[2.5rem] border border-white/5 shadow-premium overflow-hidden ${className}`}>
    {children}
  </div>
);

const TaskManager = () => {
  const { requireAuth } = useWebAuth();
  const { tasks, updateMetadata, loading } = useWebVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', priority: 'Medium', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    requireAuth(() => {
      setEditingItem(null);
      setFormData({ title: '', priority: 'Medium', category: 'General' });
      setIsModalOpen(true);
    });
  };

  const handleEdit = (task) => {
    requireAuth(() => {
      setEditingItem(task);
      setFormData({ 
        title: task.title || '', 
        priority: task.priority || 'Medium',
        category: task.category || 'General'
      });
      setIsModalOpen(true);
    });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const updatedTasks = tasks.map(t => 
          t.id === editingItem.id ? { ...t, ...formData } : t
        );
        await updateMetadata('tasks', updatedTasks);
      } else {
        const newTask = {
          id: Date.now().toString(),
          ...formData,
          completed: false,
          createdAt: new Date().toISOString()
        };
        await updateMetadata('tasks', [newTask, ...tasks]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (taskId) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    await updateMetadata('tasks', updatedTasks);
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await updateMetadata('tasks', updatedTasks);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" /></div>;

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] animate-fade-in px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 shrink-0 gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-theme-success uppercase tracking-[0.3em]">Operational Readiness</span>
              <div className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Neural Tasks</h1>
           <p className="text-[15px] font-medium text-theme-textSecondary max-w-md">Optimize your daily execution. Priority-weighted task scheduling for peak performance.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenModal}
          className="bg-theme-accent text-white px-8 py-3.5 rounded-2xl text-[13px] font-black hover:bg-white hover:text-theme-textDark transition-all shadow-premium"
        >
          Initialize Task
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Pending Stack */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent border border-theme-accent/20 shadow-pink-glow">
                   <Target size={20} />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Active Queue</h2>
             </div>
             <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">{pendingTasks.length} Pending</span>
          </div>
          
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <motion.div 
                layout
                key={task.id} 
                className="glass-card p-6 flex items-center justify-between group border-l-4 border-l-theme-accent hover:border-theme-accent/20"
              >
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className="w-6 h-6 rounded-lg border-2 border-theme-accent/20 group-hover:border-theme-accent flex items-center justify-center transition-all bg-white/[0.02]"
                  >
                    <CheckCircle2 size={14} className="opacity-0 transition-opacity" />
                  </button>
                  <div className="cursor-pointer" onClick={() => handleEdit(task)}>
                    <h3 className="font-bold text-[15px] text-white tracking-tight group-hover:text-theme-accent transition-colors">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                         task.priority === 'High' ? 'bg-theme-danger/10 text-theme-danger' : 
                         task.priority === 'Medium' ? 'bg-theme-warning/10 text-theme-warning' : 'bg-theme-success/10 text-theme-success'
                       }`}>
                         {task.priority}
                       </span>
                       <span className="text-[9px] font-bold text-theme-textSecondary uppercase tracking-widest opacity-40">{task.category || 'Core'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-3 text-theme-textSecondary hover:text-theme-danger hover:bg-theme-danger/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Plus className="rotate-45" size={18} />
                </button>
              </motion.div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="py-20 text-center glass-card border-dashed bg-white/[0.02]">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-theme-accent/10 flex items-center justify-center text-theme-accent mx-auto mb-6 shadow-pink-glow">
                    <CheckCircle2 size={32} />
                 </div>
                 <h3 className="text-lg font-black text-white tracking-tight uppercase mb-2">Neural Synchronization Complete</h3>
                 <p className="text-[13px] text-theme-textSecondary max-w-xs mx-auto">All operational tasks have been successfully resolved. Workspace is at optimal state.</p>
              </div>
            )}
          </div>
        </section>

        {/* Resolved Stack */}
        <section className="space-y-6">
           <div className="flex items-center justify-between mb-8 opacity-40">
              <div className="flex items-center gap-3">
                 <ShieldCheck size={20} className="text-theme-success" />
                 <h2 className="text-xl font-black text-white tracking-tight uppercase">Resolved History</h2>
              </div>
              <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">{completedTasks.length} Archived</span>
           </div>

           <div className="space-y-4 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
             {completedTasks.map(task => (
               <div 
                 key={task.id} 
                 className="glass-card p-6 flex items-center justify-between border-l-4 border-l-theme-success"
               >
                 <div className="flex items-center gap-6">
                   <button 
                     onClick={() => toggleTask(task.id)}
                     className="w-6 h-6 rounded-lg bg-theme-success text-white flex items-center justify-center shadow-premium"
                   >
                     <CheckCircle2 size={14} />
                   </button>
                   <h3 className="font-bold text-[15px] text-white/50 line-through tracking-tight">{task.title}</h3>
                 </div>
                 <button 
                   onClick={() => deleteTask(task.id)}
                   className="p-3 text-white/20 hover:text-theme-danger hover:bg-theme-danger/5 rounded-xl transition-all"
                 >
                   <Plus className="rotate-45" size={18} />
                 </button>
               </div>
             ))}
           </div>
        </section>
      </div>

      <UniversalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Update Operational Task" : "New Neural Task"}
      >
        <form onSubmit={handleAddTask} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Task Definition</label>
            <input 
              type="text" 
              placeholder="e.g., Refactor Neural Engine"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Priority Load</label>
               <select 
                 value={formData.priority}
                 onChange={(e) => setFormData({...formData, priority: e.target.value})}
                 className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[13px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all"
               >
                 <option value="Low">Critical Lower</option>
                 <option value="Medium">Standard Sync</option>
                 <option value="High">Priority Overdrive</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Context</label>
               <select 
                 value={formData.category}
                 onChange={(e) => setFormData({...formData, category: e.target.value})}
                 className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[13px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all"
               >
                 <option value="General">General Intel</option>
                 <option value="Work">Strategy</option>
                 <option value="Personal">Growth</option>
               </select>
             </div>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-theme-accent text-white font-black py-5 rounded-2xl transition-all shadow-premium active:scale-[0.98] disabled:opacity-50 text-[14px] uppercase tracking-widest mt-4"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (editingItem ? 'Update Operational Link' : 'Initialize Task')}
          </button>
        </form>
      </UniversalModal>
    </div>
  );
};

export default TaskManager;
