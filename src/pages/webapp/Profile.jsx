import { User, Mail, ShieldCheck, CreditCard, Calendar, Star } from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';

const Profile = () => {
  const { currentUser } = useWebAuth();

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="glass-card p-8 relative overflow-hidden mb-8 border-theme-border shadow-sleek">
        <div className="absolute -top-24 -right-24 w-64 h-64 opacity-10 rounded-full blur-3xl bg-theme-accent" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="w-28 h-28 rounded-full bg-theme-cardSecondary border-2 border-theme-border p-1 shadow-sleek overflow-hidden">
             {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" />
             ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-theme-accent to-theme-highlight flex items-center justify-center">
                   <span className="text-4xl font-black text-white">{currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}</span>
                </div>
             )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-[28px] font-bold text-theme-textPrimary tracking-tight mb-1">
              {currentUser?.displayName || 'SaynIQ User'}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[13px] font-medium text-theme-textSecondary">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-theme-textSecondary/50" /> {currentUser?.email || 'user@sayniq.app'}</span>
              <span className="flex items-center gap-1.5 text-theme-accent"><Star size={14} fill="currentColor" /> Pro Member</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
               <button className="bg-theme-primary text-theme-textDark px-5 py-2 rounded-lg text-xs font-bold shadow-sleek hover:bg-white transition-colors">
                 Edit Profile
               </button>
               <button className="bg-theme-cardSecondary border border-theme-border text-theme-textPrimary px-5 py-2 rounded-lg text-xs font-bold hover:bg-white/[0.05] transition-colors">
                 View Activity
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h2 className="text-[15px] font-semibold text-theme-textPrimary mb-6 flex items-center gap-2">
            <User size={18} className="text-theme-textSecondary" />
            Account Details
          </h2>
          <div className="space-y-6">
            <div className="group">
              <p className="text-[11px] font-bold text-theme-textSecondary/50 uppercase tracking-widest mb-1 group-hover:text-theme-accent transition-colors">Display Name</p>
              <p className="font-semibold text-sm text-theme-textPrimary">{currentUser?.displayName || 'Not Set'}</p>
            </div>
            <div className="group">
              <p className="text-[11px] font-bold text-theme-textSecondary/50 uppercase tracking-widest mb-1 group-hover:text-theme-accent transition-colors">Email Address</p>
              <p className="font-semibold text-sm text-theme-textPrimary">{currentUser?.email || 'user@sayniq.app'}</p>
            </div>
            <div className="group">
              <p className="text-[11px] font-bold text-theme-textSecondary/50 uppercase tracking-widest mb-1 group-hover:text-theme-accent transition-colors">Workspace Status</p>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
                 <p className="font-semibold text-sm text-theme-textPrimary">Sync Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-theme-textPrimary mb-6 flex items-center gap-2">
              <CreditCard size={18} className="text-theme-textSecondary" />
              Subscription
            </h2>
            <div className="bg-theme-cardSecondary border border-theme-border rounded-xl p-5 mb-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-theme-accent/5 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="flex justify-between items-center mb-2 relative z-10">
                <span className="font-bold text-theme-textPrimary text-[14px]">SaynIQ Pro</span>
                <span className="text-[9px] font-black bg-theme-accent text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sleek">Active</span>
              </div>
              <p className="text-[12px] text-theme-textSecondary font-medium leading-relaxed relative z-10">Next billing on June 12, 2026. Manage your card and invoices below.</p>
            </div>
          </div>
          <button className="w-full bg-theme-cardSecondary border border-theme-border text-theme-textPrimary py-2.5 rounded-lg text-xs font-bold hover:bg-white/[0.05] transition-colors mt-2">
            Manage Billing & Invoices
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
