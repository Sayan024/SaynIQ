import { Bell, Search, Menu, LayoutGrid } from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';
import { useWebVault } from '../../context/WebVaultContext';
import { Link } from 'react-router-dom';

const WebHeader = ({ onMenuClick }) => {
  const { currentUser } = useWebAuth();
  const { searchQuery, setSearchQuery } = useWebVault();

  return (
    <header className="h-[80px] bg-[#020202]/30 backdrop-blur-xl border-b border-white/5 px-6 md:px-10 flex items-center justify-between z-50 relative">
      {/* Search Cockpit */}
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 text-theme-textSecondary hover:text-white transition-all bg-white/5 rounded-2xl"
        >
          <Menu size={22} />
        </button>
        
        <div className="relative w-full hidden md:block group">
          <span className="absolute inset-y-0 left-4 flex items-center text-theme-textSecondary group-focus-within:text-theme-accent transition-all duration-300">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search Intelligence Registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-[13px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-theme-accent/40 focus:bg-white/[0.04] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity">
             <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-white/40 tracking-tighter">ESC</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* Global Notifications */}
        <div className="flex items-center gap-2">
          <button className="relative text-theme-textSecondary hover:text-white transition-all p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-theme-accent rounded-full border-2 border-[#020202] shadow-pink-glow"></span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-white/5 mx-2 hidden sm:block"></div>

        {/* User Identity */}
        <div className="flex items-center gap-4 cursor-pointer group p-1.5 pr-4 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-theme-accent/20 transition-all active:scale-95">
          <div className="w-10 h-10 rounded-[1.25rem] bg-gradient-to-br from-theme-accent/20 to-theme-highlight/20 border border-white/10 flex items-center justify-center overflow-hidden shadow-premium">
             {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                <span className="text-[13px] font-black text-white">
                  {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </span>
             )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[13px] font-black text-white group-hover:text-theme-accent transition-colors">
              {currentUser?.displayName || 'User'}
            </p>
            <p className="text-[9px] font-bold text-theme-textSecondary uppercase tracking-widest mt-0.5">Verified</p>
          </div>
        </div>
      </div>

      {/* Decorative Scanline */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </header>
  );
};

export default WebHeader;
