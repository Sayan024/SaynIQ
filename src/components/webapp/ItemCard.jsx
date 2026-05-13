import { useState } from 'react';
import { Bookmark, Edit2, Share2, PlusCircle, Trash2, Code, FileText, Youtube, Instagram, Link as LinkIcon, Sparkles, Copy, FolderPlus, Check, Globe, ChevronRight } from 'lucide-react';
import { useWebVault } from '../../context/WebVaultContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItemCard({ item, onEdit, onBookmark, onDelete, onShare }) {
  const { playlists, addItemToPlaylist } = useWebVault();
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addedStatus, setAddedStatus] = useState(null); // id of playlist added to

  const getIcon = () => {
    if (item.type === 'note') {
      return item.noteType === 'code' ? <Code size={14} className="text-theme-textPrimary" /> : <FileText size={14} className="text-theme-textPrimary" />;
    }
    if (item.domain?.includes('youtube.com') || item.domain?.includes('youtu.be')) return <Youtube size={14} className="text-theme-danger" />;
    if (item.domain?.includes('instagram.com')) return <Instagram size={14} className="text-[#EC4899]" />;
    return <LinkIcon size={14} className="text-theme-textPrimary" />;
  };

  const handleAddToPlaylist = async (playlistId) => {
    await addItemToPlaylist(playlistId, item);
    setAddedStatus(playlistId);
    setTimeout(() => {
      setAddedStatus(null);
      setShowPlaylistMenu(false);
    }, 1500);
  };

  const hasLongNote = item.type === 'note' && item.content && item.content.length > 150;

  return (
    <div className="glass-card p-5 mb-4 flex flex-col group relative overflow-visible">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            {getIcon()}
          </div>
          <span className="text-[11px] font-bold text-theme-textSecondary uppercase tracking-widest">
            {item.category || 'General'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="relative">
            <button 
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              className={`p-1.5 rounded-md text-theme-textSecondary hover:bg-white/[0.06] hover:text-theme-textPrimary transition-colors ${showPlaylistMenu ? 'bg-white/[0.06] text-theme-accent' : ''}`}
              title="Add to Playlist"
            >
              <FolderPlus size={14} />
            </button>
            
            <AnimatePresence>
              {showPlaylistMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-theme-card border border-theme-border rounded-xl shadow-2xl z-[100] p-1.5"
                >
                  <p className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest p-2 mb-1 border-b border-theme-border/50">Add to Playlist</p>
                  <div className="max-h-40 overflow-y-auto no-scrollbar">
                    {playlists.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleAddToPlaylist(p.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-all flex items-center justify-between group/p"
                      >
                        <span className="text-[12px] font-bold text-theme-textSecondary group-hover/p:text-white truncate">{p.title}</span>
                        {addedStatus === p.id ? <Check size={12} className="text-theme-success" /> : <PlusCircle size={10} className="text-theme-textSecondary opacity-0 group-hover/p:opacity-100" />}
                      </button>
                    ))}
                    {playlists.length === 0 && (
                      <p className="p-3 text-[11px] text-theme-textSecondary italic text-center">No playlists found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => onEdit?.(item)} className="p-1.5 rounded-md text-theme-textSecondary hover:bg-white/[0.06] hover:text-theme-textPrimary transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onBookmark?.(item.id)} className={`p-1.5 rounded-md transition-colors ${item.isBookmarked ? 'text-theme-warning' : 'text-theme-textSecondary hover:bg-white/[0.06] hover:text-theme-textPrimary'}`}>
            <Bookmark size={14} fill={item.isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onDelete?.(item.id)} className="p-1.5 rounded-md text-theme-textSecondary hover:bg-theme-danger/10 hover:text-theme-danger transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {item.type === 'link' ? (
        <a 
          href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group/link"
        >
          {item.thumbnail && (
            <div className="relative overflow-hidden rounded-lg mb-4 border border-theme-border shadow-sm aspect-video">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/link:scale-105" />
              <div className="absolute inset-0 bg-theme-accent/10 opacity-0 group-hover/link:opacity-100 transition-opacity flex items-center justify-center">
                <Globe className="text-white drop-shadow-lg" size={32} />
              </div>
            </div>
          )}
          {item.title && <h3 className="text-[16px] font-bold text-theme-textPrimary leading-snug mb-2 group-hover:text-theme-accent transition-colors flex items-center gap-2">
            {item.title}
            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
          </h3>}
          <p className="text-theme-textSecondary text-[13px] leading-relaxed font-medium line-clamp-2 italic opacity-60">
            {item.title ? item.url : item.url}
          </p>
        </a>
      ) : (
        <>
          {item.title && <h3 className="text-[16px] font-bold text-theme-textPrimary leading-snug mb-2">{item.title}</h3>}
          {item.noteType === 'code' ? (
            <div className="bg-black/40 border border-theme-border p-3.5 rounded-xl mt-1">
              <pre className={`text-theme-textSecondary font-mono text-[12px] leading-relaxed whitespace-pre-wrap ${!isNoteExpanded && 'line-clamp-6'}`}>
                {item.content}
              </pre>
            </div>
          ) : (
            <p className={`text-theme-textSecondary text-[14px] leading-relaxed font-medium ${!isNoteExpanded && 'line-clamp-3'}`}>
              {item.content}
            </p>
          )}
        </>
      )}

      <div className="flex justify-between items-center mt-6 pt-3 border-t border-theme-border/50">
        <div className="flex items-center gap-2">
           {item.type === 'link' && item.domain && (
             <span className="text-[11px] font-bold text-theme-accent bg-theme-accent/5 px-2 py-0.5 rounded border border-theme-accent/10">{item.domain}</span>
           )}
        </div>
        <span className="text-[11px] font-bold text-theme-textSecondary opacity-40 tabular-nums uppercase">
          {item.updatedAt?.seconds ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() : 'Syncing...'}
        </span>
      </div>
    </div>
  );
}
