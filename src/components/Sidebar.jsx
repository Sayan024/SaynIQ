import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Sparkles,
  MessageCircle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'App Version', icon: Smartphone, path: '/admin/version' },
    { name: 'Feature Ads', icon: Sparkles, path: '/admin/features' },
    { name: 'Support', icon: MessageCircle, path: '/admin/support' },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70] w-64 bg-[#0f0724] border-r border-premium-purple/20 flex flex-col h-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-premium-purple p-2 rounded-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-premium-lightPurple">
              SaynIQ Admin
            </span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 mb-4">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-premium-purple/10 hover:border-premium-purple/30 transition-all group"
          >
            <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <span>View Website</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-premium-purple/20 text-premium-lightPurple border border-premium-purple/30' 
                  : 'text-gray-400 hover:bg-premium-purple/10 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-premium-purple/10">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
