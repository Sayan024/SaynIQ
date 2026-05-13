import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Brain, Shield, Rocket } from 'lucide-react';

const BootLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing Core...');
  
const steps = [
    { threshold: 20, text: 'Mapping Cognitive Pathways...', icon: Brain },
    { threshold: 45, text: 'Initializing Neural Vault...', icon: Shield },
    { threshold: 70, text: 'Calibrating Intelligence OS...', icon: Sparkles },
    { threshold: 90, text: 'Synchronizing Consciousness...', icon: Rocket }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1200); // Longer pause for cinematic impact
          return 100;
        }
        
        const next = prev + Math.floor(Math.random() * 2) + 1;
        const currentStep = steps.reverse().find(s => next >= s.threshold);
        if (currentStep) setStatus(currentStep.text);
        steps.reverse(); // Reset steps order
        
        return next > 100 ? 100 : next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-[#020202] flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05)_0%,transparent_70%)]" />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-theme-highlight/5 rounded-full blur-[140px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-theme-card border border-white/5 rounded-[2rem] flex items-center justify-center mb-10 relative group shadow-premium">
           <Zap size={44} className="text-theme-accent drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" fill="currentColor" />
           
           {/* Rotating Rings */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-[-15px] border border-dashed border-theme-accent/10 rounded-full" 
           />
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="absolute inset-[-25px] border border-dotted border-theme-highlight/10 rounded-full" 
           />
        </div>

        <div className="flex flex-col items-center">
          <motion.h1 
            initial={{ letterSpacing: '0.5em', opacity: 0 }}
            animate={{ letterSpacing: '0.2em', opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-3xl font-black text-white tracking-widest mb-3"
          >
            SAYN<span className="text-theme-accent">IQ</span>
          </motion.h1>
          
          <div className="flex items-center gap-3 mb-12 h-6">
             <AnimatePresence mode="wait">
                <motion.p 
                  key={status}
                  initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                  animate={{ opacity: 0.6, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                  className="text-[11px] font-bold text-white uppercase tracking-[0.4em]"
                >
                  {status}
                </motion.p>
             </AnimatePresence>
          </div>
        </div>

        {/* Cinematic Progress Bar */}
        <div className="w-72 relative">
           <div className="flex justify-between items-end mb-3">
              <span className="text-[9px] font-black text-theme-accent uppercase tracking-[0.3em] opacity-50">Intelligence Kernel</span>
              <span className="text-[14px] font-black text-white tabular-nums opacity-80">{progress}%</span>
           </div>
           <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-theme-accent to-theme-highlight shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                style={{ width: `${progress}%` }}
                layout
              />
           </div>
           
           {/* Ambient Scanline */}
           <motion.div 
             animate={{ x: ['0%', '100%', '0%'] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="absolute bottom-[-10px] w-20 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
           />
        </div>
      </motion.div>

      {/* OS Metadata */}
      <div className="absolute bottom-12 left-12 flex flex-col gap-3 opacity-20">
         <div className="w-24 h-[1px] bg-white/30" />
         <div className="flex flex-col gap-1">
           <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Build 024.Alpha</span>
           <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Neural Engine v1.5</span>
         </div>
      </div>
    </div>
  );
};

export default BootLoader;
