import { useState, useEffect } from 'react';
import { Bell, Shield, Monitor, Loader2, CheckCircle2 } from 'lucide-react';
import { useWebVault } from '../../context/WebVaultContext';
import { motion } from 'framer-motion';

const Settings = () => {
  const { settings, updateMetadata, loading } = useWebVault();
  const [localSettings, setLocalSettings] = useState({
    theme: 'Obsidian',
    glassmorphism: true,
    pushNotifications: true,
    aiInsightsEmail: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleToggle = async (key) => {
    const newVal = !localSettings[key];
    const updated = { ...localSettings, [key]: newVal };
    setLocalSettings(updated);
    saveSettings(updated);
  };

  const setTheme = (theme) => {
    const updated = { ...localSettings, theme };
    setLocalSettings(updated);
    saveSettings(updated);
  };

  const saveSettings = async (data) => {
    setIsSaving(true);
    try {
      await updateMetadata('settings', data);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-theme-textPrimary mb-1">Settings</h1>
          <p className="text-[13px] font-medium text-theme-textSecondary">Manage your app preferences.</p>
        </div>
        {showSaved && (
           <div className="flex items-center gap-2 text-theme-success font-bold text-[12px] animate-fade-in">
              <CheckCircle2 size={14} />
              Saved to Cloud
           </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-theme-border pb-4">
            <Monitor size={18} className="text-theme-accent" />
            <h2 className="text-[15px] font-bold text-theme-textPrimary uppercase tracking-widest">Appearance</h2>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[14px] font-bold text-theme-textPrimary">Interface Theme</p>
                <p className="text-[12px] font-medium text-theme-textSecondary">Switch between dark and obsidian modes</p>
              </div>
              <div className="flex p-1 bg-theme-cardSecondary/50 border border-theme-border rounded-xl">
                 <button 
                  onClick={() => setTheme('Obsidian')}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${localSettings.theme === 'Obsidian' ? 'bg-theme-accent text-white shadow-sleek' : 'text-theme-textSecondary hover:text-white'}`}
                 >
                   Obsidian
                 </button>
                 <button 
                  onClick={() => setTheme('Default')}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${localSettings.theme === 'Default' ? 'bg-theme-accent text-white shadow-sleek' : 'text-theme-textSecondary hover:text-white'}`}
                 >
                   Default
                 </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[14px] font-bold text-theme-textPrimary">Glassmorphism Effect</p>
                <p className="text-[12px] font-medium text-theme-textSecondary">Enable translucency for cards</p>
              </div>
              <button 
                onClick={() => handleToggle('glassmorphism')}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${localSettings.glassmorphism ? 'bg-theme-accent' : 'bg-theme-cardSecondary border border-theme-border'}`}
              >
                <motion.div 
                  animate={{ x: localSettings.glassmorphism ? 20 : 2 }}
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-theme-border pb-4">
            <Bell size={18} className="text-theme-accent" />
            <h2 className="text-[15px] font-bold text-theme-textPrimary uppercase tracking-widest">Notifications</h2>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[14px] font-bold text-theme-textPrimary">Push Notifications</p>
                <p className="text-[12px] font-medium text-theme-textSecondary">Receive alerts on this device</p>
              </div>
              <button 
                onClick={() => handleToggle('pushNotifications')}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${localSettings.pushNotifications ? 'bg-theme-accent' : 'bg-theme-cardSecondary border border-theme-border'}`}
              >
                <motion.div 
                  animate={{ x: localSettings.pushNotifications ? 20 : 2 }}
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[14px] font-bold text-theme-textPrimary">AI Insights Email</p>
                <p className="text-[12px] font-medium text-theme-textSecondary">Weekly productivity reports</p>
              </div>
              <button 
                onClick={() => handleToggle('aiInsightsEmail')}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${localSettings.aiInsightsEmail ? 'bg-theme-accent' : 'bg-theme-cardSecondary border border-theme-border'}`}
              >
                <motion.div 
                  animate={{ x: localSettings.aiInsightsEmail ? 20 : 2 }}
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-theme-border pb-4">
            <Shield size={18} className="text-theme-accent" />
            <h2 className="text-[15px] font-bold text-theme-textPrimary uppercase tracking-widest">Security</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-4 rounded-xl hover:bg-white/[0.03] text-[13px] font-bold text-theme-textSecondary hover:text-white transition-all border border-theme-border bg-theme-cardSecondary/20">Change Password</button>
            <button className="w-full text-left p-4 rounded-xl hover:bg-white/[0.03] text-[13px] font-bold text-theme-textSecondary hover:text-white transition-all border border-theme-border bg-theme-cardSecondary/20">Manage Connected Devices</button>
            <div className="pt-4 mt-4 border-t border-theme-border">
              <button className="w-full text-center p-4 rounded-xl bg-theme-danger/5 text-[13px] font-black text-theme-danger hover:bg-theme-danger hover:text-white transition-all border border-theme-danger/20">Delete Account Permanently</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
