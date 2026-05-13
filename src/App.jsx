import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import VersionManager from './pages/VersionManager';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Web App Imports
import UserLogin from './pages/webapp/UserLogin';
import WebLayout from './components/webapp/WebLayout';
import WebDashboard from './pages/webapp/Dashboard';
import NotesHub from './pages/webapp/NotesHub';
import Library from './pages/webapp/Library';
import FinanceHub from './pages/webapp/FinanceHub';
import TaskManager from './pages/webapp/TaskManager';
import Reminders from './pages/webapp/Reminders';
import Settings from './pages/webapp/Settings';
import Profile from './pages/webapp/Profile';
import AuthModal from './components/webapp/AuthModal';
import BootLoader from './components/webapp/BootLoader';
import Home from './pages/webapp/Home';
import Support from './pages/webapp/Support';
import FeatureAds from './pages/FeatureAds';
import SupportAdmin from './pages/SupportAdmin';

import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { useWebAuth } from './context/WebAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Zap } from 'lucide-react';

const ToastManager = () => {
  const { toast, setToast } = useNotifications();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[100] w-full max-w-sm"
        >
          <div className="bg-premium-dark/90 backdrop-blur-2xl border border-premium-purple/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-premium-purple" />
            <div className="w-12 h-12 bg-premium-purple/20 rounded-xl flex items-center justify-center text-premium-lightPurple shrink-0">
               {toast.type === 'user' ? <User size={24} /> : <Zap size={24} />}
            </div>
            <div className="flex-1">
               <h4 className="text-sm font-black text-white mb-0.5">{toast.title}</h4>
               <p className="text-xs text-gray-400 line-clamp-1">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
            >
               <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  const { 
    isAdminAuthenticated, 
    loginAdmin, 
    logoutAdmin,
    logout: logoutUser 
  } = useWebAuth();

  const handleAdminLogin = (status) => {
    if (status) loginAdmin();
  };

  const handleAdminLogout = () => {
    logoutAdmin();
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [isBooting, setIsBooting] = useState(true);

  if (isBooting) {
    return <BootLoader onComplete={() => setIsBooting(false)} />;
  }

  return (
    <>
    <Routes>
      {/* User Login */}
      <Route path="/login" element={<UserLogin />} />

      {/* Public User Web App Routes (Root Level) */}
      <Route 
        path="/*" 
        element={
          <Routes>
            <Route element={<WebLayout onLogout={logoutUser} />}>
              <Route path="dashboard" element={<WebDashboard />} />
              <Route path="notes" element={<NotesHub />} />
              <Route path="library" element={<Library />} />
              <Route path="finance" element={<FinanceHub />} />
              <Route path="tasks" element={<TaskManager />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="support" element={<Support />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        }
      />

      {/* Admin Login */}
      <Route path="/admin-login" element={<Login onLogin={handleAdminLogin} />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          isAdminAuthenticated ? (
            <NotificationProvider>
              <div className="flex h-screen bg-premium-dark text-white overflow-hidden relative">
                <Sidebar 
                  onLogout={handleAdminLogout} 
                  isOpen={isSidebarOpen} 
                  onClose={() => setIsSidebarOpen(false)} 
                />
                <div className="flex-1 flex flex-col overflow-hidden w-full">
                  <Header onMenuClick={toggleSidebar} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/version" element={<VersionManager />} />
                      <Route path="/features" element={<FeatureAds />} />
                      <Route path="/support" element={<SupportAdmin />} />
                      <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
              <ToastManager />
            </NotificationProvider>
          ) : (
            <Navigate to="/admin-login" replace />
          )
        }
      />
    </Routes>
    <AuthModal />
    </>
  );
}

export default App;
