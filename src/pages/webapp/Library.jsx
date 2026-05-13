import { useState } from 'react';
import { 
  Link as LinkIcon, 
  ListMusic, 
  Plus, 
  Loader2, 
  Globe, 
  Bookmark, 
  Edit2, 
  Zap, 
  Search, 
  ChevronRight,
  TrendingUp,
  FileText,
  ArrowLeft,
  X,
  Trash2
} from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';
import { useWebVault } from '../../context/WebVaultContext';
import ItemCard from '../../components/webapp/ItemCard';
import UniversalEmptyState from '../../components/webapp/UniversalEmptyState';
import UniversalModal from '../../components/webapp/UniversalModal';
import { motion, AnimatePresence } from 'framer-motion';

const Widget = ({ children, className = "" }) => (
  <div className={`glass-card rounded-[2.5rem] border border-white/5 shadow-premium overflow-hidden ${className}`}>
    {children}
  </div>
);

const Library = () => {
  const [activeTab, setActiveTab] = useState('links');
  const { requireAuth } = useWebAuth();
  const { items, playlists, addItem, updateItem, deleteItem, loading } = useWebVault();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  const links = items.filter(i => i.type === 'link').sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));

  const handleOpenModal = () => {
    requireAuth(() => {
      setEditingItem(null);
      setFormData({ title: '', url: '', category: 'General' });
      setIsModalOpen(true);
    });
  };

  const handleEdit = (item) => {
    requireAuth(() => {
      setEditingItem(item);
      setFormData({ 
        title: item.title || '', 
        url: item.url || '', 
        category: item.category || 'General' 
      });
      setIsModalOpen(true);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'links') {
        if (!formData.url) return;
        const domain = new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`).hostname;
        
        if (editingItem) {
          await updateItem(editingItem.id, { ...formData, domain });
        } else {
          await addItem({
            ...formData,
            type: 'link',
            domain,
          });
        }
      } else {
        if (!formData.title) return;
        if (editingItem) {
          await updateItem(editingItem.id, { title: formData.title }, 'playlists');
        } else {
          await addItem({
            title: formData.title,
            type: 'playlist',
            itemCount: 0
          }, 'playlists');
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" /></div>;

  return (
    <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] animate-fade-in px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 shrink-0 gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-theme-accent uppercase tracking-[0.3em]">Knowledge Base</span>
              <div className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Resource Library</h1>
           <p className="text-[15px] font-medium text-theme-textSecondary max-w-md">Your centralized intelligence archive for curated links, assets, and research streams.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white/[0.03] p-1.5 rounded-[1.25rem] border border-white/5">
              <button 
                onClick={() => setActiveTab('links')}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-theme-accent text-white shadow-premium' : 'text-theme-textSecondary hover:text-white'}`}
              >
                Neural Links
              </button>
              <button 
                onClick={() => setActiveTab('playlists')}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'playlists' ? 'bg-theme-accent text-white shadow-premium' : 'text-theme-textSecondary hover:text-white'}`}
              >
                Collections
              </button>
           </div>
           <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={handleOpenModal}
             className="bg-white text-theme-textDark px-8 py-3.5 rounded-2xl text-[13px] font-black hover:bg-theme-accent hover:text-white transition-all shadow-premium"
           >
             {activeTab === 'links' ? 'Encode Link' : 'Initialize Collection'}
           </motion.button>
        </div>
      </div>

      <div className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'links' ? (
            <motion.div 
              key="links"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {links.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  {links.map(link => (
                    <motion.div layout key={link.id} className="break-inside-avoid">
                      <ItemCard 
                        item={link} 
                        onEdit={() => handleEdit(link)}
                        onDelete={deleteItem}
                        onBookmark={(id) => updateItem(id, { isBookmarked: !link.isBookmarked })}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <UniversalEmptyState 
                  icon={LinkIcon}
                  title="Archive Depleted"
                  description="Your link repository is currently offline. Map your first neural connection to begin archiving."
                  actionText="Map Neural Link"
                  onAction={handleOpenModal}
                />
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="playlists"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {selectedPlaylistId ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                    <button 
                      onClick={() => setSelectedPlaylistId(null)}
                      className="flex items-center gap-2 text-theme-accent font-black uppercase text-[10px] tracking-widest bg-theme-accent/5 px-4 py-2 rounded-xl border border-theme-accent/20 hover:bg-theme-accent/10 transition-all"
                    >
                      <ArrowLeft size={14} />
                      Back to Collections
                    </button>
                    <button 
                       onClick={() => setShowAddAssetModal(true)}
                       className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-black uppercase text-[11px] tracking-widest shadow-premium hover:scale-105 active:scale-95 transition-all"
                    >
                       Add Existing Assets
                    </button>
                  </div>

                  <div className="glass-card p-8 relative overflow-hidden mb-12">
                     <div className="absolute inset-0 bg-theme-accent/5" />
                     <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white uppercase mb-2">{selectedPlaylist?.title}</h2>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">{selectedPlaylist?.itemCount || 0} Assets Encoded</span>
                           <div className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
                           <span className="text-[10px] font-black text-theme-accent uppercase tracking-widest italic">Live Neural Path</span>
                        </div>
                     </div>
                  </div>

                  {selectedPlaylist?.items?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {selectedPlaylist.items.map(item => (
                         <div key={item.id} className="glass-card p-5 flex items-center justify-between group border-white/5 hover:border-theme-accent/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-theme-accent">
                                  {item.type === 'link' ? <Globe size={18} /> : <FileText size={18} />}
                               </div>
                               <div>
                                  <h4 className="text-sm font-bold text-white group-hover:text-theme-accent transition-colors">{item.title || (item.type === 'link' ? item.url : 'Untitled Note')}</h4>
                                  <p className="text-[9px] font-black text-theme-textSecondary uppercase tracking-[0.2em]">{item.type}</p>
                               </div>
                            </div>
                            <button 
                              onClick={async () => {
                                const updatedItems = selectedPlaylist.items.filter(i => i.id !== item.id);
                                await updateItem(selectedPlaylist.id, { 
                                  items: updatedItems,
                                  itemCount: updatedItems.length
                                }, 'playlists');
                              }}
                              className="p-2 text-white/20 hover:text-theme-danger transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                       <p className="text-theme-textSecondary font-bold text-sm">No intelligence assets mapped to this path.</p>
                       <button 
                         onClick={() => setShowAddAssetModal(true)}
                         className="text-theme-accent font-black uppercase text-[11px] tracking-widest mt-4 hover:underline"
                       >
                         Initialize First Asset
                       </button>
                    </div>
                  )}
                </div>
              ) : (
                playlists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {playlists.map(playlist => (
                      <Widget 
                        key={playlist.id} 
                        className="group cursor-pointer hover:border-theme-accent/20 transition-all flex flex-col justify-between aspect-[1/1] p-8"
                        onClick={() => setSelectedPlaylistId(playlist.id)}
                      >
                         <div className="flex justify-between items-start">
                            <div className="w-14 h-14 rounded-2xl bg-theme-accent/5 border border-theme-accent/10 flex items-center justify-center text-theme-accent group-hover:bg-theme-accent group-hover:text-white transition-all shadow-pink-glow">
                               <ListMusic size={24} />
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(playlist);
                              }}
                              className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-theme-accent/10"
                            >
                              <Edit2 size={16} className="text-theme-textSecondary hover:text-white" />
                            </button>
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-white tracking-tighter mb-2 group-hover:text-theme-accent transition-colors">{playlist.title}</h3>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">{playlist.itemCount || 0} Assets Encoded</span>
                               <div className="w-1 h-1 rounded-full bg-white/10" />
                               <span className="text-[10px] font-black text-theme-accent uppercase tracking-widest">Active Collection</span>
                            </div>
                         </div>
                      </Widget>
                    ))}
                  </div>
                ) : (
                  <UniversalEmptyState 
                    icon={ListMusic}
                    title="Collections Offline"
                    description="Group your high-value intelligence assets into thematic streams for optimized recall."
                    actionText="Initialize Stream"
                    onAction={handleOpenModal}
                  />
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UniversalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Update Intelligence Asset" : "Initialize Asset Registry"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'links' ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Asset Identity</label>
                <input 
                  type="text" 
                  placeholder="e.g., Quantum Computing Whitepaper"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Registry Pointer (URL)</label>
                <input 
                  type="text" 
                  placeholder="https://intel.registry.io/asset"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium"
                  required
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Collection Workspace Name</label>
              <input 
                type="text" 
                placeholder="e.g., Deep Learning Architecture"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium"
                required
              />
            </div>
          )}
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-theme-accent text-white font-black py-5 rounded-2xl transition-all shadow-premium active:scale-[0.98] disabled:opacity-50 text-[14px] uppercase tracking-widest mt-4"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (editingItem ? 'Update Registry' : 'Confirm Initialization')}
          </button>
        </form>
      </UniversalModal>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {showAddAssetModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
              onClick={() => setShowAddAssetModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl p-10 relative z-10 border-theme-accent/30 max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-2xl font-black uppercase tracking-tight">Select Intelligence Assets</h2>
                <button onClick={() => setShowAddAssetModal(false)} className="text-theme-textSecondary hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 space-y-4 no-scrollbar">
                 {items.filter(item => !selectedPlaylist?.items?.find(i => i.id === item.id)).length > 0 ? (
                   items.filter(item => !selectedPlaylist?.items?.find(i => i.id === item.id)).map(item => (
                     <div key={item.id} className="glass-card p-6 flex items-center justify-between hover:border-theme-accent/40 transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-theme-accent">
                              {item.type === 'link' ? <Globe size={20} /> : <FileText size={20} />}
                           </div>
                           <div>
                              <h4 className="text-base font-bold text-white group-hover:text-theme-accent transition-colors">{item.title || item.url}</h4>
                              <p className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">{item.category} • {item.type}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => {
                            const { addItemToPlaylist } = useWebVault(); // Not ideal but works for now, better to get it from context top level
                            // wait, addItemToPlaylist is already in the context we destructure at top
                          }}
                          className="hidden" // Placeholder, will fix below
                        />
                        <button 
                          onClick={() => {
                            const { addItemToPlaylist } = useWebVault.getState(); // If using zustand, but we are using Context
                          }}
                          className="hidden"
                        />
                        {/* Fix: useWebVault was already called at top, destructure addItemToPlaylist there */}
                        <AddButton item={item} playlistId={selectedPlaylistId} />
                     </div>
                   ))
                 ) : (
                   <p className="text-center py-20 text-theme-textSecondary font-medium">No new assets found in your vault.</p>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component for the add button to access context properly if needed, or just use the one from top
const AddButton = ({ item, playlistId }) => {
  const { addItemToPlaylist } = useWebVault();
  return (
    <button 
      onClick={() => addItemToPlaylist(playlistId, item)}
      className="px-6 py-2 bg-white text-theme-textDark rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-theme-accent hover:text-white transition-all shadow-premium"
    >
      Add to Collection
    </button>
  );
};

export default Library;
