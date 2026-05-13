import { Plus, Link as LinkIcon } from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';
import { useWebVault } from '../../context/WebVaultContext';
import ItemCard from '../../components/webapp/ItemCard';

const LinkSaver = () => {
  const { requireAuth } = useWebAuth();
  const { items } = useWebVault();
  const links = items.filter(i => i.type === 'link');

  const handleAction = () => {
    requireAuth(() => {
      console.log('Action allowed!');
    });
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-theme-textPrimary mb-1">Links</h1>
          <p className="text-[13px] font-medium text-theme-textSecondary/80">Save and organize important URLs.</p>
        </div>
        {links.length > 0 && (
          <button onClick={handleAction} className="bg-theme-primary text-theme-textDark px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors">
            Add Link
          </button>
        )}
      </div>

      {links.length > 0 ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {links.map(link => (
            <div key={link.id} className="break-inside-avoid">
              <ItemCard item={link} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 animate-fade-in-up">
          <div className="w-16 h-16 bg-white/[0.03] border border-dashed border-theme-border text-theme-textSecondary rounded-2xl flex items-center justify-center mb-6">
            <LinkIcon size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-[18px] font-bold mb-2 text-theme-textPrimary tracking-tight">No links saved</h2>
          <p className="text-[14px] text-theme-textSecondary/80 max-w-sm mb-8 leading-relaxed font-medium">Never lose a website again. Save articles, tools, and resources for later reading.</p>
          <button 
            onClick={handleAction}
            className="bg-theme-primary text-theme-textDark px-8 py-2.5 rounded-xl text-sm font-bold shadow-sleek hover:bg-white transition-all active:scale-95"
          >
            Add Your First Link
          </button>
        </div>
      )}
    </div>
  );
};

export default LinkSaver;
