import { NavLink } from 'react-router-dom';
import { LayoutDashboard, StickyNote, Bot, Wallet, User } from 'lucide-react';

const WebBottomNav = () => {
  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Notes', icon: StickyNote, path: '/notes' },
    { name: 'AI Chat', icon: Bot, path: '/chat' },
    { name: 'Finance', icon: Wallet, path: '/finance' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-theme-background/80 backdrop-blur-xl border-t border-theme-border pb-safe z-[80]">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200
              ${isActive 
                ? 'text-theme-textPrimary' 
                : 'text-theme-textSecondary hover:text-theme-textPrimary'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/[0.06] border border-white/[0.08]' : ''}`}>
                  <item.icon size={20} className={isActive ? 'text-theme-textPrimary' : ''} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-theme-textPrimary' : ''}`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default WebBottomNav;
