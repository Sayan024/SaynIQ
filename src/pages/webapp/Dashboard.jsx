import { 
  Flame, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Zap,
  Globe,
  Star,
  Share2,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Target
} from 'lucide-react';
import { useWebVault } from '../../context/WebVaultContext';
import { useWebAuth } from '../../context/WebAuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const Widget = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-5 relative overflow-hidden group ${className}`}
  >
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-theme-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {children}
  </motion.div>
);

const TrendingTech = () => {
  const techs = [
    { name: 'AI Reasoning', icon: Cpu, color: '#EC4899', url: 'https://openai.com' },
    { name: 'React Native', icon: Zap, color: '#3B82F6', url: 'https://reactnative.dev' },
    { name: 'Microsoft Fabric', icon: Globe, color: '#8B5CF6', url: 'https://microsoft.com/fabric' },
    { name: 'Cybersecurity', icon: Sparkles, color: '#10B981', url: 'https://crowdstrike.com' }
  ];

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
      {techs.map((tech, i) => (
        <a 
          key={i} 
          href={tech.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 bg-theme-cardSecondary/50 border border-theme-border px-4 py-2.5 rounded-xl hover:border-theme-accent/30 transition-all cursor-pointer active:scale-95"
        >
          <tech.icon size={14} style={{ color: tech.color }} />
          <span className="text-[12px] font-bold text-theme-textPrimary whitespace-nowrap">{tech.name}</span>
        </a>
      ))}
    </div>
  );
};

const SmartOverview = () => {
  const { items, tasks, loading, finance } = useWebVault();
  const { currentUser } = useWebAuth();
  const [isFinanceLocked, setIsFinanceLocked] = useState(true);
  const [greeting, setGreeting] = useState("Synchronizing Intelligence...");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning, Initiate");
    else if (hour < 18) setGreeting("Good Afternoon, Architect");
    else setGreeting("Good Evening, Strategist");
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-theme-background"><Loader2 size={32} className="animate-spin text-theme-accent" /></div>;
  }

  const notes = items.filter(i => i.type === 'note');
  const links = items.filter(i => i.type === 'link');
  const recentItems = [...items].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)).slice(0, 3);
  const importantNotes = notes.filter(n => n.isBookmarked).slice(0, 2);
  const aiActivity = items.filter(i => i.summary).length;

  const totalIncome = finance.reduce((acc, t) => acc + (t.type === 'Income' ? Number(t.amount) : 0), 0);
  const totalExpense = finance.reduce((acc, t) => acc + (t.type === 'Expense' ? Number(t.amount) : 0), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 animate-fade-in">
      {/* Cinematic Header */}
      <div className="relative mb-12 py-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-theme-accent/5 to-transparent rounded-[3rem] -z-10" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Neural Link Active</span>
              </div>
              <span className="text-[10px] font-bold text-theme-accent uppercase tracking-widest bg-theme-accent/5 px-3 py-1 rounded-full border border-theme-accent/10">024.Alpha</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
              {greeting}
            </h1>
            <p className="text-[15px] font-medium text-theme-textSecondary flex items-center gap-2">
              Welcome back, <span className="text-white font-bold">{currentUser?.displayName?.split(' ')[0] || 'Sayan'}</span>. Your second brain is at optimal capacity.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/notes" className="px-8 py-4 rounded-2xl bg-white text-theme-textDark text-[14px] font-black hover:bg-theme-accent hover:text-white transition-all shadow-premium flex items-center gap-2">
                <Plus size={18} />
                Quick Insight
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Intel & Metrics */}
        <div className="lg:col-span-8 space-y-8">
          {/* AI Daily Briefing */}
          <Widget className="bg-gradient-to-br from-theme-accent/5 to-transparent border-theme-accent/10 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent shadow-pink-glow">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight uppercase">AI Daily Briefing</h2>
                  <p className="text-[11px] font-bold text-theme-textSecondary uppercase tracking-widest">Intelligence Summary</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-theme-accent uppercase tracking-[0.2em]">Density Score</p>
                <p className="text-2xl font-black text-white tabular-nums">84%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-[14px] text-theme-textSecondary leading-relaxed">
                  "Sayan, you have <span className="text-white font-bold">{tasks.filter(t => !t.completed).length} pending tasks</span> for today. Your productivity streak is increasing. AI analyzed your recent notes on <span className="text-theme-accent font-bold">Deep Work</span> and suggests organizing them into a new collection."
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">Growth Path</span>
                  <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">Focus Mode</span>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <TrendingUp size={64} />
                 </div>
                 <h4 className="text-[11px] font-black text-theme-textSecondary uppercase tracking-[0.2em] mb-4">Neural Activity</h4>
                 <div className="flex items-end gap-1 h-20">
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                        className="flex-1 bg-theme-accent/20 border-t-2 border-theme-accent rounded-t-sm"
                      />
                    ))}
                 </div>
              </div>
            </div>
          </Widget>

          {/* Recently Synced Intelligence */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-theme-accent" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Cognitive Feed</h2>
              </div>
              <Link to="/library" className="text-[11px] font-black text-theme-textSecondary hover:text-white transition-colors uppercase tracking-[0.2em]">View All Registry</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {recentItems.map((item, i) => (
                 <Widget key={item.id} className="p-6 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-theme-textSecondary group-hover:text-theme-accent transition-colors">
                          {item.type === 'note' ? <FileText size={18} /> : <Globe size={18} />}
                       </div>
                       <span className="text-[9px] font-black text-theme-textSecondary/40 uppercase tracking-widest">{item.category || 'Core'}</span>
                    </div>
                    <h3 className="text-[14px] font-bold text-white line-clamp-1 mb-2 tracking-tight group-hover:text-theme-accent transition-colors">{item.title || 'Neural Entry'}</h3>
                    <div className="flex items-center justify-between mt-6">
                       <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">{item.type}</span>
                       <span className="text-[10px] font-bold text-white/20 tabular-nums">0{i+1}</span>
                    </div>
                 </Widget>
               ))}
            </div>
          </div>

          {/* Important Knowledge Assets */}
          <div>
             <div className="flex items-center gap-3 mb-6">
                <Star size={20} className="text-theme-warning" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">High Priority Assets</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {importantNotes.map(note => (
                   <Widget key={note.id} className="p-8 border-l-4 border-l-theme-warning bg-white/[0.02]">
                      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{note.title}</h3>
                      <p className="text-[13px] text-theme-textSecondary line-clamp-2 leading-relaxed mb-6 italic">"{note.content}"</p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-theme-warning" />
                            <span className="text-[10px] font-black text-theme-warning uppercase tracking-[0.2em]">Pinned Knowledge</span>
                         </div>
                         <Link to="/notes" className="text-white/20 hover:text-white transition-colors">
                            <ChevronRight size={16} />
                         </Link>
                      </div>
                   </Widget>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Cockpit Stats */}
        <div className="lg:col-span-4 space-y-8">
           {/* Financial Health Cockpit */}
           <Widget className="bg-gradient-to-br from-theme-highlight/10 to-transparent border-theme-highlight/20 p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-theme-highlight/10 border border-theme-highlight/20 flex items-center justify-center text-theme-highlight shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <TrendingUp size={24} />
                 </div>
                 <button 
                   onClick={() => setIsFinanceLocked(!isFinanceLocked)}
                   className="text-white/20 hover:text-white transition-colors p-2 rounded-xl bg-white/5"
                 >
                   {isFinanceLocked ? <Lock size={16} /> : <Eye size={16} />}
                 </button>
              </div>
              <p className="text-[11px] font-black text-theme-textSecondary uppercase tracking-[0.3em] mb-2">Vault Liquidity</p>
              <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums mb-6">
                 {isFinanceLocked ? '••••••' : `₹${balance.toLocaleString()}`}
              </h3>
              <div className="space-y-4 pt-6 border-t border-white/5">
                 <div className="flex justify-between items-center text-[12px]">
                    <span className="font-bold text-theme-textSecondary">Monthly Delta</span>
                    <span className="font-black text-theme-success">+12.4%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-theme-highlight" style={{ width: '65%' }} />
                 </div>
              </div>
           </Widget>

           {/* Productivity Engine */}
           <Widget className="p-8">
              <div className="flex items-center gap-3 mb-8">
                 <Target size={20} className="text-theme-accent" />
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Engine</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] text-center">
                    <p className="text-3xl font-black text-white tabular-nums">{tasks.filter(t => t.completed).length}</p>
                    <p className="text-[9px] font-bold text-theme-textSecondary uppercase tracking-widest mt-1">Resolved</p>
                 </div>
                 <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] text-center">
                    <p className="text-3xl font-black text-white tabular-nums">{notes.length}</p>
                    <p className="text-[9px] font-bold text-theme-textSecondary uppercase tracking-widest mt-1">Encoded</p>
                 </div>
              </div>
              <div className="p-5 bg-theme-accent/5 rounded-3xl border border-theme-accent/10">
                 <p className="text-[11px] text-theme-textSecondary leading-relaxed italic text-center">
                    "Intelligence Hub is functioning at <span className="text-theme-accent font-bold">100% capacity</span>. No bottlenecks detected."
                 </p>
              </div>
           </Widget>

           {/* Trending Intelligence */}
           <div className="px-4">
              <h3 className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.3em] mb-6">Market Intelligence</h3>
              <div className="space-y-4">
                 {[
                   { name: 'OpenAI o3', type: 'Reasoning', trend: '+14%' },
                   { name: 'WebGPU 2.0', type: 'Rendering', trend: '+08%' },
                   { name: 'Quantum Cloud', type: 'Compute', trend: '+22%' }
                 ].map((t, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                      <div className="flex flex-col">
                         <span className="text-[13px] font-bold text-white group-hover:text-theme-accent transition-colors">{t.name}</span>
                         <span className="text-[9px] font-bold text-theme-textSecondary uppercase tracking-widest">{t.type}</span>
                      </div>
                      <span className="text-[11px] font-black text-theme-success tabular-nums">{t.trend}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SmartOverview;
