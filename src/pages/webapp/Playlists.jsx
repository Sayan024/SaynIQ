import { useState, useEffect } from 'react';
import { 
  Plus, 
  ListMusic, 
  Search, 
  Filter, 
  MoreVertical, 
  FolderPlus, 
  Zap, 
  Clock, 
  Star, 
  Trash2, 
  ChevronRight, 
  FileText, 
  Globe, 
  Grid, 
  List,
  Sparkles,
  Edit3,
  X,
  Share2,
  Lock,
  Eye,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useWebVault } from '../../context/WebVaultContext';
import { useWebAuth } from '../../context/WebAuthContext';

const Playlists = () => {
  const { 
    playlists, 
    items, 
    addItem, 
    updateItem, 
    deleteItem, 
    loading,
    addItemToPlaylist 
  } = useWebVault();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  
  const [localPlaylists, setLocalPlaylists] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    isPinned: false,
    bannerColor: '#EC4899'
  });
  
  useEffect(() => {
    setLocalPlaylists(playlists);
  }, [playlists]);

  const handleReorder = (newOrder) => {
    setLocalPlaylists(newOrder);
    // In a real app, you'd save the order to Firestore here
    console.log("New order:", newOrder.map(p => p.title));
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await addItem({
        ...formData,
        itemCount: 0,
        items: [],
        createdAt: new Date().toISOString()
      }, 'playlists');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', isPublic: false, isPinned: false, bannerColor: '#EC4899' });
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateSummary = (playlistId) => {
    alert("AI summary generation triggered for this playlist. Processing neural paths...");
    // Mocking AI behavior
  };

  const filteredPlaylists = playlists.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalPlaylists: playlists.length,
    pinned: playlists.filter(p => p.isPinned).length,
    recentlyAdded: playlists.slice(0, 3)
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" size={32} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="px-3 py-1 rounded-full bg-theme-accent/10 border border-theme-accent/20 text-[10px] font-black text-theme-accent uppercase tracking-[0.2em]">Curated Intelligence</div>
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{stats.totalPlaylists} COLLECTIONS</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Smart Playlists</h1>
          <p className="text-theme-textSecondary font-medium mt-1">Organize your neural assets into focused execution paths.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-textSecondary" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collections..."
                className="bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-theme-accent transition-all min-w-[300px]"
              />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-8 py-4 rounded-2xl bg-white text-theme-textDark font-black hover:bg-theme-accent hover:text-white transition-all shadow-premium flex items-center gap-2"
           >
             <FolderPlus size={20} />
             New Folder
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Quick Access */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.3em] mb-6">Execution Paths</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white hover:bg-white/[0.05] transition-all group">
                 <div className="flex items-center gap-3">
                    <Star size={16} className="text-theme-warning" />
                    <span className="text-[13px] font-bold">Pinned</span>
                 </div>
                 <span className="text-[10px] font-black opacity-40">{stats.pinned}</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] text-theme-textSecondary hover:text-white transition-all group">
                 <div className="flex items-center gap-3">
                    <Clock size={16} />
                    <span className="text-[13px] font-bold">Recently Opened</span>
                 </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] text-theme-textSecondary hover:text-white transition-all group">
                 <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-theme-accent" />
                    <span className="text-[13px] font-bold">AI Recommended</span>
                 </div>
              </button>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-theme-accent/5 to-transparent border-theme-accent/10">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-theme-accent/10 flex items-center justify-center text-theme-accent">
                   <Zap size={16} fill="currentColor" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Neural Summary</h4>
             </div>
             <p className="text-[11px] text-theme-textSecondary leading-relaxed italic">
               "You have <span className="text-white font-bold">4 high-density</span> playlists that haven't been reviewed this week. AI suggests archiving outdated research nodes."
             </p>
          </div>
        </div>

        {/* Main Content: Playlists Grid */}
        <div className="lg:col-span-9">
           {/* Quick Stats Banner */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest mb-1">Total Notes</p>
                 <p className="text-xl font-black text-white">{items.filter(i => i.type === 'note').length}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest mb-1">Saved Links</p>
                 <p className="text-xl font-black text-white">{items.filter(i => i.type === 'link').length}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest mb-1">Recent Notes</p>
                 <p className="text-xl font-black text-theme-accent">
                    {items.filter(i => i.type === 'note').slice(0, 1)[0]?.title?.slice(0, 10) || 'None'}...
                 </p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest mb-1">Collections</p>
                 <p className="text-xl font-black text-white">{playlists.length}</p>
              </div>
           </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                {selectedPlaylistId && (
                  <button 
                    onClick={() => setSelectedPlaylistId(null)}
                    className="flex items-center gap-2 text-theme-accent font-black uppercase text-[10px] tracking-widest bg-theme-accent/5 px-4 py-2 rounded-xl border border-theme-accent/20 hover:bg-theme-accent/10 transition-all"
                  >
                    <ArrowLeft size={14} />
                    Back to Paths
                  </button>
                )}
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-theme-textSecondary hover:text-white'}`}
                   >
                     <Grid size={18} />
                   </button>
                   <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-theme-textSecondary hover:text-white'}`}
                   >
                     <List size={18} />
                   </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-bold text-theme-textSecondary uppercase tracking-widest">Sort By:</span>
                 <select className="bg-transparent text-[10px] font-black uppercase text-white outline-none cursor-pointer">
                    <option className="bg-theme-card">Recently Added</option>
                    <option className="bg-theme-card">Most Items</option>
                    <option className="bg-theme-card">Alphabetical</option>
                 </select>
              </div>
           </div>

           <AnimatePresence mode="wait">
             {selectedPlaylistId ? (
               <motion.div 
                 key="selected"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="space-y-8"
               >
                 <div className="glass-card p-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: selectedPlaylist?.bannerColor }} />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="flex-1">
                          <h2 className="text-3xl font-black text-white uppercase mb-2">{selectedPlaylist?.title}</h2>
                          <p className="text-theme-textSecondary font-medium">{selectedPlaylist?.description}</p>
                       </div>
                       <button 
                         onClick={() => setShowAddAssetModal(true)}
                         className="px-6 py-3 rounded-xl bg-theme-accent text-white font-black uppercase text-[11px] tracking-widest shadow-premium hover:scale-105 active:scale-95 transition-all"
                       >
                         Add Existing Assets
                       </button>
                    </div>
                 </div>

                 {selectedPlaylist?.items?.length > 0 ? (
                   <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                      {selectedPlaylist.items.map(item => (
                        <div key={item.id} className="glass-card p-4 flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-theme-accent">
                                 {item.type === 'link' ? <Globe size={18} /> : <FileText size={18} />}
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-white">{item.title || (item.type === 'link' ? item.url : 'Untitled Note')}</h4>
                                 <p className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">{item.type}</p>
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
                   <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                      <p className="text-theme-textSecondary font-medium">No assets in this path yet.</p>
                      <button 
                        onClick={() => setShowAddAssetModal(true)}
                        className="text-theme-accent font-black uppercase text-[11px] tracking-widest mt-4"
                      >
                        Add your first asset
                      </button>
                   </div>
                 )}
               </motion.div>
             ) : (
             <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl flex items-center justify-center text-theme-textSecondary/30 mb-8">
                   <ListMusic size={40} />
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase">No Collections Found</h3>
                <p className="text-sm text-theme-textSecondary font-medium max-w-sm leading-relaxed mb-10">Start by creating a new playlist to organize your digital intelligence.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-3 bg-white text-theme-textDark rounded-xl font-black text-sm hover:bg-theme-accent hover:text-white transition-all shadow-premium"
                >
                   Initialize First Playlist
                </button>
             </div>
           ) : (
             <Reorder.Group 
               axis="y" 
               values={localPlaylists} 
               onReorder={handleReorder}
               className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "space-y-4"}
             >
                {localPlaylists.map(playlist => (
                  <Reorder.Item 
                    key={playlist.id}
                    value={playlist}
                    className={`glass-card group overflow-hidden ${viewMode === 'list' ? 'flex items-center p-4' : 'flex flex-col'}`}
                  >
                    {/* Thumbnail/Banner */}
                    <div className={`${viewMode === 'grid' ? 'h-32' : 'w-20 h-20 shrink-0'} relative overflow-hidden`}>
                       <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={{ backgroundColor: playlist.bannerColor || '#333' }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center text-white/20">
                          <ListMusic size={viewMode === 'grid' ? 48 : 24} strokeWidth={1} />
                       </div>
                       {playlist.isPinned && (
                         <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-theme-warning">
                            <Star size={12} fill="currentColor" />
                         </div>
                       )}
                    </div>

                    <div className={`${viewMode === 'grid' ? 'p-6' : 'px-6 flex-1'}`}>
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-theme-accent transition-colors line-clamp-1">{playlist.title}</h3>
                            <p className="text-[11px] font-bold text-theme-textSecondary uppercase tracking-widest mt-1">{playlist.itemCount || 0} Assets</p>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => handleGenerateSummary(playlist.id)} className="p-2 text-white/20 hover:text-theme-accent transition-colors">
                               <Sparkles size={16} />
                             </button>
                             <button className="p-2 text-white/20 hover:text-white transition-colors">
                               <MoreVertical size={16} />
                             </button>
                          </div>
                       </div>
                       
                       <p className="text-[12px] text-theme-textSecondary line-clamp-2 leading-relaxed mb-6 font-medium">
                          {playlist.description || "No description provided for this collection."}
                       </p>

                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                             {playlist.isPublic ? <Globe size={12} className="text-theme-success" /> : <Lock size={12} className="text-theme-textSecondary" />}
                             <span className="text-[9px] font-black uppercase tracking-widest text-theme-textSecondary">
                                {playlist.isPublic ? 'Public Path' : 'Private Vault'}
                             </span>
                          </div>
                          <button 
                             onClick={() => setSelectedPlaylistId(playlist.id)}
                             className="text-[10px] font-black text-theme-accent uppercase tracking-widest flex items-center gap-1 group/btn"
                           >
                              Explore
                              <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                           </button>
                       </div>
                    </div>
                  </Reorder.Item>
                ))}
             </Reorder.Group>
           )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => !isCreating && setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-xl p-10 relative z-10 border-theme-accent/20"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black tracking-tight uppercase">New Intelligence Path</h2>
                <button onClick={() => !isCreating && setIsModalOpen(false)} className="text-theme-textSecondary hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreatePlaylist} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Path Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-4 px-6 focus:outline-none focus:border-theme-accent transition-all font-bold text-lg"
                    placeholder="e.g. Q3 Growth Strategy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Context / Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-4 px-6 focus:outline-none focus:border-theme-accent transition-all text-sm h-28 resize-none font-medium"
                    placeholder="What intelligence does this path curate?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={formData.isPinned}
                              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-white/5 rounded-full peer peer-checked:bg-theme-warning transition-all" />
                            <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all" />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-theme-textSecondary group-hover:text-white">Pin to Quick Access</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={formData.isPublic}
                              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-white/5 rounded-full peer peer-checked:bg-theme-success transition-all" />
                            <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all" />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-theme-textSecondary group-hover:text-white">Public Path</span>
                      </label>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Banner Accent</label>
                      <div className="flex gap-2">
                         {['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'].map(color => (
                           <button 
                             key={color}
                             type="button"
                             onClick={() => setFormData({ ...formData, bannerColor: color })}
                             className={`w-8 h-8 rounded-lg border-2 transition-all ${formData.bannerColor === color ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                             style={{ backgroundColor: color }}
                           />
                         ))}
                      </div>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-white text-theme-textDark py-5 rounded-2xl font-black text-lg transition-all shadow-premium flex items-center justify-center gap-3 hover:bg-theme-accent hover:text-white disabled:opacity-50"
                >
                  {isCreating ? <Loader2 size={20} className="animate-spin" /> : <FolderPlus size={20} />}
                  Initialize Path
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
                          onClick={() => addItemToPlaylist(selectedPlaylistId, item)}
                          className="px-6 py-2 bg-white text-theme-textDark rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-theme-accent hover:text-white transition-all shadow-premium"
                        >
                          Add to Path
                        </button>
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

export default Playlists;
