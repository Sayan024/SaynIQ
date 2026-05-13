import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import WebSidebar from './WebSidebar';
import WebHeader from './WebHeader';
import WebBottomNav from './WebBottomNav';
import GlobalAIChat from './GlobalAIChat';

const WebLayout = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-theme-background text-theme-textPrimary overflow-hidden relative">
      <WebSidebar 
        onLogout={onLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden w-full relative z-10">
        <WebHeader onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-theme-background pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <WebBottomNav />
      <GlobalAIChat />
    </div>
  );
};

export default WebLayout;
