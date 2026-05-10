import { Bell, Search, User, Menu, X, Check, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onMenuClick }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-[#0b041a] border-b border-premium-purple/10 px-4 md:px-8 flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white"
        >
          <Menu size={24} />
        </button>
        
        <div className="relative w-64 md:w-96 hidden md:block">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search users, notifications..."
            className="w-full bg-[#160d33] border border-premium-purple/20 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-premium-purple/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 ${showNotifications ? 'text-white bg-white/5' : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-[#0b041a] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 md:w-96 bg-premium-dark/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                       <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">Alert Center</p>
                       {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-black rounded uppercase">Live</span>}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={markAllAsRead} className="text-[10px] font-black uppercase text-premium-lightPurple hover:text-white transition-colors">Read All</button>
                       <button onClick={clearNotifications} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-600 mb-4">
                           <Bell size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-400">No new alerts</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Ecosystem is quiet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`p-4 hover:bg-white/5 transition-all cursor-pointer group relative ${!n.read ? 'bg-premium-purple/[0.03]' : ''}`}
                          >
                            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-premium-purple" />}
                            <div className="flex gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'user' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-premium-purple/10 text-premium-lightPurple'}`}>
                                  {n.type === 'user' ? <User size={20} /> : <Zap size={20} />}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                     <p className={`text-sm font-bold truncate ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                     <span className="text-[9px] text-gray-600 font-bold whitespace-nowrap ml-2">{n.time}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
                       <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">View All Activities</button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-premium-purple/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Sayan Admin</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-premium-purple/20 border border-premium-purple/30 flex items-center justify-center text-premium-lightPurple font-bold">
            S
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
