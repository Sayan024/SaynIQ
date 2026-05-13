import { useState } from 'react';
import { Plus, StickyNote, Loader2 } from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';
import { useWebVault } from '../../context/WebVaultContext';
import ItemCard from '../../components/webapp/ItemCard';
import UniversalEmptyState from '../../components/webapp/UniversalEmptyState';
import UniversalModal from '../../components/webapp/UniversalModal';
import { motion } from 'framer-motion';

const NotesHub = () => {
  const { requireAuth } = useWebAuth();
  const { items, addItem, updateItem, deleteItem, loading } = useWebVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', noteType: 'text', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notes = items.filter(i => i.type === 'note').sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));

  const handleOpenModal = () => {
    requireAuth(() => {
      setEditingItem(null);
      setFormData({ title: '', content: '', noteType: 'text', category: 'General' });
      setIsModalOpen(true);
    });
  };

  const handleEdit = (note) => {
    requireAuth(() => {
      setEditingItem(note);
      setFormData({ 
        title: note.title || '', 
        content: note.content || '', 
        noteType: note.noteType || 'text', 
        category: note.category || 'General' 
      });
      setIsModalOpen(true);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
      } else {
        await addItem({
          ...formData,
          type: 'note',
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] animate-fade-in px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 shrink-0 gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-theme-accent uppercase tracking-[0.3em]">Vault Storage</span>
              <div className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Cognitive Vault</h1>
           <p className="text-[15px] font-medium text-theme-textSecondary max-w-md">Your decentralized intelligence hub for ideas, research, and technical synthesis.</p>
        </div>
        <div className="flex gap-4">
           <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-2xl">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active Notes</span>
              <span className="text-sm font-black text-white tabular-nums">{notes.length}</span>
           </div>
           <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={handleOpenModal}
             className="bg-theme-accent text-white px-8 py-3.5 rounded-2xl text-[13px] font-black hover:bg-white hover:text-theme-textDark transition-all shadow-premium"
           >
             New Entry
           </motion.button>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 pb-12">
          {notes.map(note => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={note.id} 
              className="break-inside-avoid"
            >
              <ItemCard 
                item={note} 
                onEdit={() => handleEdit(note)}
                onDelete={deleteItem}
                onBookmark={(id) => updateItem(id, { isBookmarked: !note.isBookmarked })}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <UniversalEmptyState 
          icon={StickyNote}
          title="Intelligence Void"
          description="Your cognitive vault is currently empty. Initialize your second brain by encoding your first idea."
          actionText="Encode First Entry"
          onAction={handleOpenModal}
        />
      )}

      <UniversalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Synthesize Entry" : "New Neural Entry"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Asset Identity</label>
            <input 
              type="text" 
              placeholder="Entry Title (Optional)"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Cognitive Content</label>
            <textarea 
              placeholder="Begin encoding intelligence..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={6}
              className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-medium text-white/80 placeholder:text-white/10 focus:outline-none focus:border-theme-accent/50 transition-all resize-none shadow-premium leading-relaxed"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-4 text-[13px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all"
              >
                <option value="General">Intelligence</option>
                <option value="Work">Strategy</option>
                <option value="Personal">Growth</option>
                <option value="Ideas">Insights</option>
                <option value="Code">Source</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Encoding</label>
              <select 
                value={formData.noteType}
                onChange={(e) => setFormData({...formData, noteType: e.target.value})}
                className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-4 text-[13px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all"
              >
                <option value="text">Neural Text</option>
                <option value="code">Source Code</option>
              </select>
            </div>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-theme-accent text-white font-black py-5 rounded-2xl transition-all shadow-premium active:scale-[0.98] disabled:opacity-50 text-[14px] uppercase tracking-widest mt-4"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (editingItem ? 'Synthesize Entry' : 'Encode Entry')}
          </button>
        </form>
      </UniversalModal>
    </div>
  );
};

export default NotesHub;
