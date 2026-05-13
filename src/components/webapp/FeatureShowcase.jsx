import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, ChevronRight, Cpu } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const FeatureShowcase = () => {
  const [features, setFeatures] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feature_ads'), where('enabled', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setFeatures(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (features.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features]);

  if (loading || features.length === 0) return null;

  const currentFeature = features[currentIndex];
  
  const IconComponent = () => {
    switch (currentFeature.icon) {
      case 'Zap': return <Zap size={18} />;
      case 'TrendingUp': return <TrendingUp size={18} />;
      case 'Cpu': return <Cpu size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-[9px] font-black text-theme-textSecondary uppercase tracking-[0.3em] opacity-40">Featured Intel</span>
        <div className="flex gap-1">
          {features.map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-theme-accent w-3' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentFeature.id}
          initial={{ opacity: 0, x: 10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="glass-card p-5 bg-gradient-to-br from-theme-accent/[0.05] to-transparent border-theme-accent/10 relative overflow-hidden group cursor-pointer"
        >
          {/* Animated Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-theme-accent/10 blur-[40px] group-hover:bg-theme-accent/20 transition-all duration-700" />
          
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 rounded-xl bg-theme-accent/10 border border-theme-accent/20 flex items-center justify-center text-theme-accent shadow-pink-glow">
              <IconComponent />
            </div>
            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black tracking-[0.1em] uppercase ${
              currentFeature.tag === 'NEW' ? 'bg-theme-accent/20 text-theme-accent border border-theme-accent/30' :
              currentFeature.tag === 'TRENDING' ? 'bg-theme-highlight/20 text-theme-highlight border border-theme-highlight/30' :
              'bg-theme-success/20 text-theme-success border border-theme-success/30'
            }`}>
              {currentFeature.tag}
            </div>
          </div>

          <h4 className="text-[13px] font-black text-white tracking-tight mb-2 group-hover:text-theme-accent transition-colors">
            {currentFeature.title}
          </h4>
          <p className="text-[11px] text-theme-textSecondary font-medium leading-relaxed mb-4 line-clamp-2">
            {currentFeature.description}
          </p>

          <div className="flex items-center gap-2 text-[10px] font-black text-white/40 group-hover:text-white transition-colors uppercase tracking-widest">
            <span>Learn More</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FeatureShowcase;
