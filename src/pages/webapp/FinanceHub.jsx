import { useState } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, ShieldCheck, Loader2 } from 'lucide-react';
import { useWebAuth } from '../../context/WebAuthContext';
import { useWebVault } from '../../context/WebVaultContext';
import UniversalEmptyState from '../../components/webapp/UniversalEmptyState';
import UniversalModal from '../../components/webapp/UniversalModal';
import { motion } from 'framer-motion';

const Widget = ({ children, className = "" }) => (
  <div className={`glass-card rounded-[2.5rem] border border-white/5 shadow-premium overflow-hidden ${className}`}>
    {children}
  </div>
);

const FinanceHub = () => {
  const { requireAuth } = useWebAuth();
  const { finance, updateMetadata, loading } = useWebVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', amount: '', type: 'Expense' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    requireAuth(() => {
      setEditingItem(null);
      setFormData({ title: '', amount: '', type: 'Expense' });
      setIsModalOpen(true);
    });
  };

  const handleEdit = (tx) => {
    requireAuth(() => {
      setEditingItem(tx);
      setFormData({ 
        title: tx.title || '', 
        amount: tx.amount || '', 
        type: tx.type || 'Expense' 
      });
      setIsModalOpen(true);
    });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const updatedFinance = finance.map(f => 
          f.id === editingItem.id ? { ...f, ...formData } : f
        );
        await updateMetadata('finance', updatedFinance);
      } else {
        const newTx = {
          id: Date.now().toString(),
          ...formData,
          date: new Date().toISOString()
        };
        await updateMetadata('finance', [newTx, ...finance]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransaction = async (txId) => {
    const updatedFinance = finance.filter(f => f.id !== txId);
    await updateMetadata('finance', updatedFinance);
  };

  const totalIncome = finance.reduce((acc, t) => acc + (t.type === 'Income' ? Number(t.amount) : 0), 0);
  const totalExpense = finance.reduce((acc, t) => acc + (t.type === 'Expense' ? Number(t.amount) : 0), 0);
  const balance = totalIncome - totalExpense;

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" /></div>;

  return (
    <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] animate-fade-in px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 shrink-0 gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-theme-highlight uppercase tracking-[0.3em]">Financial Intelligence</span>
              <div className="w-1.5 h-1.5 rounded-full bg-theme-highlight animate-pulse" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Wealth Vault</h1>
           <p className="text-[15px] font-medium text-theme-textSecondary max-w-md">Synchronized financial monitoring and AI-driven liquidity analysis.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenModal}
          className="bg-white text-theme-textDark px-8 py-3.5 rounded-2xl text-[13px] font-black hover:bg-theme-accent hover:text-white transition-all shadow-premium"
        >
          New Transaction
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
         <div className="lg:col-span-8">
            <Widget className="bg-gradient-to-br from-theme-highlight/10 to-transparent border-theme-highlight/20 p-10 h-full flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Wallet size={200} />
               </div>
               <div>
                  <p className="text-[11px] font-black text-theme-textSecondary uppercase tracking-[0.4em] mb-4">Total Liquidity</p>
                  <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums mb-2">₹{balance.toLocaleString()}</h2>
                  <div className="flex items-center gap-4 mt-6">
                     <div className="flex items-center gap-2 bg-theme-success/10 border border-theme-success/20 px-4 py-1.5 rounded-full">
                        <TrendingUp size={14} className="text-theme-success" />
                        <span className="text-[12px] font-black text-theme-success tabular-nums">₹{totalIncome.toLocaleString()}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-theme-danger/10 border border-theme-danger/20 px-4 py-1.5 rounded-full">
                        <TrendingDown size={14} className="text-theme-danger" />
                        <span className="text-[12px] font-black text-theme-danger tabular-nums">₹{totalExpense.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
               
               <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">AI Projection</p>
                     <p className="text-sm font-bold text-white/60 leading-relaxed">Your monthly burn rate is optimized. Savings target is <span className="text-theme-highlight">84%</span> achievable.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-theme-highlight/20 border-t-theme-highlight animate-spin-slow" />
               </div>
            </Widget>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <Widget className="p-8">
               <h3 className="text-[11px] font-black text-theme-textSecondary uppercase tracking-widest mb-6">Distribution</h3>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[12px] font-bold text-white/60">Spending</span>
                        <span className="text-[12px] font-black text-white">{Math.round((totalExpense / (totalIncome || 1)) * 100)}%</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(totalExpense / (totalIncome || 1)) * 100}%` }} className="h-full bg-theme-accent shadow-pink-glow" />
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[12px] font-bold text-white/60">Savings Gap</span>
                        <span className="text-[12px] font-black text-white">22%</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '22%' }} className="h-full bg-theme-highlight shadow-ai-glow" />
                     </div>
                  </div>
               </div>
            </Widget>
            <div className="p-8 glass-card bg-theme-accent/5 border-theme-accent/10">
               <p className="text-[12px] font-bold text-theme-accent leading-relaxed italic">
                  "Sayan, you spent 12% less on groceries this week. Keep this trend to reach your goal faster."
               </p>
            </div>
         </div>
      </div>

      <div className="space-y-4 pb-12">
        <div className="flex items-center gap-3 mb-6">
           <ShieldCheck size={20} className="text-theme-accent" />
           <h2 className="text-xl font-black text-white tracking-tight uppercase">Registry Ledger</h2>
        </div>
        {finance.map(tx => (
          <motion.div 
            layout
            key={tx.id} 
            className="glass-card p-6 flex items-center justify-between group hover:border-theme-accent/20"
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                tx.type === 'Income' ? 'bg-theme-success/10 text-theme-success' : 'bg-theme-danger/10 text-theme-danger'
              }`}>
                {tx.type === 'Income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div className="cursor-pointer" onClick={() => handleEdit(tx)}>
                <h3 className="font-bold text-[15px] text-white tracking-tight group-hover:text-theme-accent transition-colors">{tx.title}</h3>
                <p className="text-[11px] font-bold text-theme-textSecondary uppercase tracking-widest mt-1">{new Date(tx.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <p className={`text-[16px] font-black tabular-nums ${
                tx.type === 'Income' ? 'text-theme-success' : 'text-theme-danger'
              }`}>
                {tx.type === 'Income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
              </p>
              <button 
                onClick={() => deleteTransaction(tx.id)}
                className="p-3 text-theme-textSecondary hover:text-theme-danger hover:bg-theme-danger/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Plus className="rotate-45" size={18} />
              </button>
            </div>
          </motion.div>
        ))}
        {finance.length === 0 && (
          <UniversalEmptyState 
            icon={Wallet}
            title="Empty Ledger"
            description="Your financial registry is waiting for data. Log your first transaction to initialize monitoring."
            actionText="Initialize Ledger"
            onAction={handleOpenModal}
          />
        )}
      </div>

      <UniversalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Update Transaction" : "New Financial Entry"}
      >
        <form onSubmit={handleAddTransaction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Asset Identity</label>
            <input 
              type="text" 
              placeholder="e.g., Cloud Server Subscription"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Quantitative Value (₹)</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-black text-white focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium tabular-nums"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em] ml-1">Registry Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 px-6 text-[13px] font-bold text-white focus:outline-none focus:border-theme-accent/50 transition-all shadow-premium"
            >
              <option value="Expense">Liquidity Out (Expense)</option>
              <option value="Income">Liquidity In (Income)</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-theme-accent text-white font-black py-5 rounded-2xl transition-all shadow-premium active:scale-[0.98] disabled:opacity-50 text-[14px] uppercase tracking-widest mt-4"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (editingItem ? 'Update Registry' : 'Confirm Entry')}
          </button>
        </form>
      </UniversalModal>
    </div>
  );
};

export default FinanceHub;
