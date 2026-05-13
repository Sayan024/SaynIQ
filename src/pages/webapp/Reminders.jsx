import { useState } from 'react';
import { Plus, Clock, Loader2, Calendar, Bell } from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';
import { useWebVault } from '../../context/WebVaultContext';
import UniversalEmptyState from '../../components/webapp/UniversalEmptyState';
import UniversalModal from '../../components/webapp/UniversalModal';

const Reminders = () => {
  const { requireAuth } = useWebAuth();
  const { items, updateMetadata, loading } = useWebVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '' });

  // Assume reminders are stored in a specific metadata document or within items
  // To keep it simple and consistent with Tasks, we'll use a 'reminders' metadata field
  // But wait, the vault context doesn't have a specific 'reminders' state yet, 
  // let's check if we can add it or use 'metadata'
  const { reminders = [] } = useWebVault(); 

  const handleOpenModal = () => {
    requireAuth(() => {
      setFormData({ title: '', date: '', time: '' });
      setIsModalOpen(true);
    });
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    setIsSubmitting(true);
    try {
      const newReminder = {
        id: Date.now().toString(),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        createdAt: new Date().toISOString()
      };
      await updateMetadata('reminders', [newReminder, ...reminders]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteReminder = async (id) => {
    const updated = reminders.filter(r => r.id !== id);
    await updateMetadata('reminders', updated);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" /></div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-theme-textPrimary mb-1">Reminders</h1>
          <p className="text-[13px] font-medium text-theme-textSecondary/80">Never miss an important event.</p>
        </div>
        {reminders.length > 0 && (
          <button 
            onClick={handleOpenModal}
            className="bg-theme-accent text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white hover:text-theme-textDark transition-all shadow-sleek"
          >
            New Reminder
          </button>
        )}
      </div>

      {reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map(reminder => (
            <div key={reminder.id} className="glass-card p-4 hover:border-theme-accent/20 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-theme-accent/5 border border-theme-accent/20 flex items-center justify-center text-theme-accent">
                   <Bell size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-theme-textPrimary">{reminder.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-theme-textSecondary font-bold text-[10px] uppercase">
                     <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(reminder.date).toLocaleDateString()}</span>
                     {reminder.time && <span className="flex items-center gap-1"><Clock size={10} /> {reminder.time}</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => deleteReminder(reminder.id)}
                className="p-2 text-theme-textSecondary hover:text-theme-danger hover:bg-theme-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Plus className="rotate-45" size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <UniversalEmptyState 
          icon={Clock}
          title="No reminders yet"
          description="Set a reminder for important tasks, meetings, or subscriptions to stay ahead of your schedule."
          actionText="Add Your First Reminder"
          onAction={handleOpenModal}
        />
      )}

      <UniversalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Set New Reminder"
      >
        <form onSubmit={handleAddReminder} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-theme-textSecondary uppercase tracking-widest ml-1">Event Title</label>
            <input 
              type="text" 
              placeholder="What should we remind you about?"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-theme-background border border-theme-border rounded-xl py-3.5 px-4 text-[13px] font-bold text-theme-textPrimary focus:outline-none focus:border-theme-accent/50 transition-all mt-2"
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-theme-textSecondary uppercase tracking-widest ml-1">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-theme-background border border-theme-border rounded-xl py-3.5 px-4 text-[13px] font-bold text-theme-textPrimary focus:outline-none focus:border-theme-accent/50 transition-all mt-2"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-bold text-theme-textSecondary uppercase tracking-widest ml-1">Time (Optional)</label>
              <input 
                type="time" 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full bg-theme-background border border-theme-border rounded-xl py-3.5 px-4 text-[13px] font-bold text-theme-textPrimary focus:outline-none focus:border-theme-accent/50 transition-all mt-2"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-theme-accent text-white font-black py-4 rounded-xl transition-all shadow-sleek active:scale-95 disabled:opacity-50 text-[13px] mt-4"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create Reminder'}
          </button>
        </form>
      </UniversalModal>
    </div>
  );
};

export default Reminders;
