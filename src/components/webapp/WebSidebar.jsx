import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebAuth } from '../../context/WebAuthContext';
import { 
  LayoutDashboard, 
  StickyNote, 
  Link as LinkIcon, 
  ListMusic, 
  Bot, 
  Wallet, 
  CheckSquare, 
  Clock, 
  Settings, 
  User,
  LogOut,
  Zap,
  X,
  MessageCircle
} from 'lucide-react';

import FeatureShowcase from './FeatureShowcase';

const WebSidebar = ({ onLogout, isOpen, onClose }) => {
  const { currentUser } = useWebAuth();
  const navItems = [
    { name: 'Intelligence Hub', icon: LayoutDashboard, path: '/dashboard', label: 'HUB' },
    { name: 'Cognitive Vault', icon: StickyNote, path: '/notes', label: 'NOTES' },
    { name: 'Resource Library', icon: ListMusic, path: '/library', label: 'LIB' },
    { name: 'Financial Cockpit', icon: Wallet, path: '/finance', label: 'FIN' },
    { name: 'Neural Tasks', icon: CheckSquare, path: '/tasks', label: 'TASK' },
    { name: 'Support Center', icon: MessageCircle, path: '/support', label: 'HELP' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[65]" 
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-[70] w-64 bg-[#050505]/50 backdrop-blur-3xl border-r border-white/5 flex flex-col h-full
        transition-all duration-500 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-theme-accent/10 border border-theme-accent/20 flex items-center justify-center text-theme-accent shadow-pink-glow group-hover:scale-110 transition-transform">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tighter uppercase leading-none">
                SaynIQ
              </span>
              <span className="text-[10px] font-bold text-theme-accent/50 tracking-[0.2em] mt-1">OS 024</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-theme-textSecondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
          <p className="text-[9px] font-black text-theme-textSecondary uppercase tracking-[0.3em] px-4 mb-4 opacity-40">Command Center</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative
                ${isActive 
                  ? 'bg-white/[0.04] text-white shadow-premium' 
                  : 'text-theme-textSecondary hover:bg-white/[0.02] hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-theme-accent/10 text-theme-accent' : 'bg-transparent text-theme-textSecondary group-hover:text-white'}`}>
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold tracking-tight">{item.name}</span>
                      {isActive && <span className="text-[9px] font-black text-theme-accent/60 tracking-widest mt-0.5">{item.label}</span>}
                    </div>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="w-1.5 h-1.5 rounded-full bg-theme-accent shadow-pink-glow"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          <FeatureShowcase />
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 space-y-3">
          <div className="px-4 py-3 glass-card bg-theme-accent/5 border-theme-accent/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
              <span className="text-[11px] font-black text-theme-accent/80 uppercase tracking-widest">Neural Link</span>
            </div>
            <span className="text-[10px] font-bold text-white/40">v1.5</span>
          </div>

          {currentUser ? (
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                }
                onClose?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-theme-textSecondary hover:text-theme-danger hover:bg-theme-danger/5 transition-all group font-bold text-[13px]"
            >
              <div className="p-2 rounded-xl bg-white/[0.02] group-hover:bg-theme-danger/10 group-hover:text-theme-danger transition-all">
                <LogOut size={18} />
              </div>
              Terminate Session
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-theme-textDark hover:bg-theme-accent hover:text-white transition-all group font-black text-[13px] shadow-sleek"
              >
                <div className="p-2 rounded-xl bg-theme-textDark/5 group-hover:bg-white/20 transition-all">
                  <User size={18} />
                </div>
                Sign In
              </Link>
              <Link
                to="/admin-login"
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-theme-textSecondary hover:text-white transition-all font-bold text-[11px] uppercase tracking-widest justify-center opacity-60 hover:opacity-100"
              >
                Admin Access
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default WebSidebar;
