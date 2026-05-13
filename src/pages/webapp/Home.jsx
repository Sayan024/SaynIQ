import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Globe, 
  Sparkles,
  ChevronDown,
  Info,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Home = () => {
  const [appConfig, setAppConfig] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'config', 'app');
        const snapshot = await getDoc(configRef);
        if (snapshot.exists()) {
          setAppConfig(snapshot.data());
        }
      } catch (error) {
        console.error("Error fetching app config:", error);
      }
    };
    fetchConfig();
  }, []);

  const features = [
    { icon: Sparkles, title: "AI-Powered Intelligence", desc: "Your personal second brain that grows with you." },
    { icon: ShieldCheck, title: "Private & Secure", desc: "Military-grade encryption for your digital vault." },
    { icon: Globe, title: "Cloud Sync", desc: "Seamless synchronization across all your devices." }
  ];

  const installSteps = [
    { title: "Download APK", desc: "Click the download button to get the latest SaynIQ APK file." },
    { title: "Enable Unknown Sources", desc: "Go to Settings > Security and enable 'Install from Unknown Sources'." },
    { title: "Install & Launch", desc: "Open the downloaded file and follow the on-screen instructions." }
  ];

  return (
    <div className="min-h-screen bg-theme-background text-white font-sans selection:bg-theme-accent/30 selection:text-white">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-theme-accent/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-theme-highlight/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-xl"
          >
            <div className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Intelligence Reinvented</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            Sayn<span className="text-theme-accent italic">IQ</span> OS
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-theme-textSecondary font-medium mb-12"
          >
            A high-performance personal intelligence system designed to capture, organize, and amplify your digital existence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/dashboard" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-theme-textDark font-black text-lg hover:bg-theme-accent hover:text-white transition-all shadow-premium group flex items-center justify-center gap-2">
              Launch Web App
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#download" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all backdrop-blur-xl flex items-center justify-center gap-2">
              <Download size={20} />
              Get Android App
            </a>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 group"
            >
              <div className="w-14 h-14 bg-theme-accent/10 rounded-2xl flex items-center justify-center text-theme-accent mb-8 group-hover:scale-110 transition-transform shadow-pink-glow">
                <f.icon size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
              <p className="text-theme-textSecondary font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* APK Download Section */}
      <section id="download" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-theme-accent/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Experience Mobile Power</h2>
            <p className="text-theme-textSecondary text-lg font-medium">Download the SaynIQ Android app for full mobile synchronization and offline access.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Version Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 border-theme-accent/20 bg-gradient-to-br from-theme-accent/[0.03] to-transparent"
            >
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-theme-accent rounded-xl flex items-center justify-center text-white shadow-pink-glow">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Android APK</h3>
                    <p className="text-theme-accent text-sm font-bold uppercase tracking-widest mt-0.5">Latest Stable Release</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-1">Version</span>
                  <span className="text-2xl font-black text-white">{appConfig?.versions?.latest || '1.5.0'}</span>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-theme-textSecondary font-bold text-sm">File Size</span>
                  <span className="text-white font-black">24.8 MB</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-theme-textSecondary font-bold text-sm">Platform</span>
                  <span className="text-white font-black">Android 8.0+</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <a 
                  href={appConfig?.androidDownloadLink || "#"} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-white text-theme-textDark rounded-2xl font-black text-lg text-center hover:bg-theme-accent hover:text-white transition-all shadow-premium flex items-center justify-center gap-2"
                >
                  <Download size={24} />
                  Download for Android
                </a>
                <button 
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-[13px] font-bold text-theme-textSecondary hover:text-white transition-colors flex items-center justify-center gap-2 uppercase tracking-widest mt-2"
                >
                  <Info size={14} />
                  Installation Instructions
                </button>
              </div>
            </motion.div>

            {/* QR Code & Meta */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-8"
            >
              <div className="glass-card p-10 flex flex-col items-center text-center">
                <div className="w-48 h-48 bg-white p-4 rounded-3xl mb-6 shadow-premium">
                  <QrCode size={160} className="text-black" />
                </div>
                <h4 className="text-lg font-black mb-2 uppercase tracking-tight">Quick Scan</h4>
                <p className="text-theme-textSecondary text-sm font-medium">Scan this QR code with your phone to download directly to your device.</p>
              </div>

              <div className="glass-card p-8">
                <h4 className="text-[11px] font-black text-theme-textSecondary uppercase tracking-[0.3em] mb-6">Recent Changes</h4>
                <div className="space-y-4">
                  {(appConfig?.releaseNotes || "• New AI Chat Engine\n• Dark Mode Improvements\n• Bug Fixes").split('\n').map((note, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-theme-accent shrink-0" />
                      <p className="text-[13px] font-medium text-theme-textSecondary">{note.replace('• ', '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Installation Instructions Overlay */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-12"
              >
                <div className="glass-card p-10 bg-white/[0.02]">
                  <h3 className="text-2xl font-black mb-10 tracking-tight uppercase">Installation Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {installSteps.map((step, i) => (
                      <div key={i} className="relative">
                        <div className="text-5xl font-black text-theme-accent/20 mb-6 tabular-nums">0{i+1}</div>
                        <h4 className="text-lg font-bold mb-3">{step.title}</h4>
                        <p className="text-theme-textSecondary text-[14px] leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-theme-accent/10 rounded-2xl flex items-center justify-center text-theme-accent mx-auto mb-10">
            <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">Ready to upgrade your mind?</h2>
          <Link to="/login" className="inline-flex px-12 py-6 rounded-2xl bg-white text-theme-textDark font-black text-xl hover:bg-theme-accent hover:text-white transition-all shadow-premium items-center gap-3">
            Get Started for Free
            <ArrowRight size={24} />
          </Link>
          <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Simple placeholders for "Trusted by" or tech stack */}
             <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase">React</div>
             <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase">Firebase</div>
             <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase">Vite</div>
             <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase">Tailwind</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
