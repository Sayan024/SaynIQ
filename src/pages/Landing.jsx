import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Zap, Bell, Users, ArrowRight, Github, 
  Smartphone, Cpu, BarChart3, Globe, Shield, Heart,
  Mail, MessageSquare, Download, Sparkles, Database,
  Lock, Layout, Layers, RefreshCw, Bookmark, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

// Assets
import financeHubImg from '../assets/screenshots/real_knowledge.png';
import knowledgeHubImg from '../assets/screenshots/real_chat.png';
import aiChatImg from '../assets/screenshots/real_productivity.png';
import productivityImg from '../assets/screenshots/real_tasks.png';
import heroImg from '../assets/screenshots/real_knowledge.png';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Landing = () => {
  const [apkLink, setApkLink] = React.useState("https://drive.usercontent.google.com/download?id=1Ew94c5ItQtYOdYpgoasxGC68J8tBbQod&export=download");

  React.useEffect(() => {
    const fetchLink = async () => {
      try {
        const configRef = doc(db, 'config', 'app');
        const snap = await getDoc(configRef);
        if (snap.exists() && snap.data().downloadLink) {
          setApkLink(snap.data().downloadLink);
        }
      } catch (e) {
        console.error("Failed to fetch download link", e);
      }
    };
    fetchLink();
  }, []);

  return (
    <div className="min-h-screen bg-premium-dark text-white selection:bg-premium-purple/30">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-premium-purple/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-premium-purple/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-left space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-premium-purple/10 border border-premium-purple/20 px-4 py-2 rounded-full text-premium-lightPurple text-xs font-black uppercase tracking-widest"
              >
                <Sparkles size={14} className="fill-premium-lightPurple" />
                <span>Next-Gen Knowledge Ecosystem</span>
              </motion.div>
              
              <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] lg:leading-[0.85]"
               >
                 YOUR AI <br />
                 <span className="text-gradient">SECOND BRAIN</span> <br />
                 IS HERE.
               </motion.h1>

               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-gray-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed"
               >
                 SaynIQ unifies your notes, finance tracking, and AI insights into one fluid, 
                 high-performance experience. Built for the modern mind.
               </motion.p>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
               >
                 <a 
                   href={apkLink}
                   className="bg-premium-purple hover:bg-premium-purple/90 px-8 lg:px-10 py-4 lg:py-5 rounded-2xl font-black text-lg lg:text-xl flex items-center justify-center gap-3 shadow-2xl shadow-premium-purple/20 transition-all hover:scale-105 active:scale-95 group"
                 >
                   <Download size={22} className="group-hover:-translate-y-1 transition-transform" />
                   <span>Get SaynIQ</span>
                 </a>
                 <a 
                   href="#features"
                   className="bg-white/5 hover:bg-white/10 px-8 lg:px-10 py-4 lg:py-5 rounded-2xl font-black text-lg lg:text-xl border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                 >
                   Explore Features
                 </a>
               </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex-1 relative hidden lg:block"
            >
              <div className="relative w-full max-w-lg mx-auto">
                 <div className="absolute inset-0 bg-premium-purple/20 blur-[100px] rounded-full"></div>
                  <img 
                    src={heroImg} 
                    alt="SaynIQ Overview" 
                    className="relative z-10 w-full rounded-[2.5rem] lg:rounded-[3rem] border-[8px] lg:border-[12px] border-white/5 shadow-2xl shadow-black/50 hover:rotate-1 transition-transform duration-700"
                  />
                  <div className="absolute -left-12 top-20 glass-card p-6 animate-bounce-slow z-20 hidden xl:block">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                          <BarChart3 size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Finance Update</p>
                          <p className="text-lg font-black text-white">₹12,450 Saved</p>
                       </div>
                    </div>
                 </div>
                  <div className="absolute -right-12 bottom-20 glass-card p-6 animate-bounce-slow z-20 hidden xl:block" style={{ animationDelay: '1.5s' }}>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-premium-purple/20 rounded-2xl flex items-center justify-center text-premium-lightPurple">
                          <Zap size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">AI Insight</p>
                          <p className="text-lg font-black text-white">15 Day Streak!</p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dynamic Feature Hub */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* AI Productivity */}
          <FeatureSection 
            image={aiChatImg}
            title="AI Productivity"
            subtitle="INTELLIGENT REASONING"
            desc="Leverage state-of-the-art AI to summarize your notes, analyze complex documents, and chat with your knowledge base in real-time."
            points={[
              { icon: Sparkles, text: "Gemini-powered AI Chat assistant" },
              { icon: Cpu, text: "Automated note summarization" },
              { icon: MessageSquare, text: "Context-aware knowledge recall" }
            ]}
            reverse={false}
          />

          {/* Finance Hub */}
          <FeatureSection 
            image={financeHubImg}
            title="Finance Intelligence"
            subtitle="FINANCE HUB"
            desc="Total control over your financial life. Automatically parse bank SMS, track spending patterns, and export detailed CSV statements."
            points={[
              { icon: BarChart3, text: "Deep SMS Transaction Parser" },
              { icon: Database, text: "Dynamic spending analytics" },
              { icon: Download, text: "One-click CSV Export" }
            ]}
            reverse={true}
          />

          {/* Knowledge Hub */}
          <FeatureSection 
            image={knowledgeHubImg}
            title="Knowledge Management"
            subtitle="THE VAULT"
            desc="A unified home for your notes and web links. Our smart metadata fetcher automatically organizes your digital assets with icons and titles."
            points={[
              { icon: Bookmark, text: "Smart Link Metadata Fetcher" },
              { icon: Layers, text: "Unified Notes & Links Hub" },
              { icon: Layout, text: "Aesthetic Grid & List Views" }
            ]}
            reverse={false}
          />

          {/* Discipline Tracking */}
          <FeatureSection 
            image={productivityImg}
            title="Discipline Tracking"
            subtitle="PRODUCTIVITY DASHBOARD"
            desc="Stay focused with integrated study trackers and streak systems. Gamify your productivity and watch your progress unfold."
            points={[
              { icon: RefreshCw, text: "Automated Streak System" },
              { icon: Heart, text: "Study Time Logs & Analytics" },
              { icon: ShieldCheck, text: "Goal-Oriented Task Manager" }
            ]}
            reverse={true}
          />

        </div>
      </section>

      {/* Secure Vault Section */}
      <section className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
           <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">Secure Vault</h2>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">Your data is yours alone. SaynIQ implements military-grade local security with biometric and PIN protection.</p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <SmallFeatureCard 
                icon={Lock}
                title="PIN Protection"
                desc="Dual-layer PINs for app and finance hubs."
              />
              <SmallFeatureCard 
                icon={Shield}
                title="Biometrics"
                desc="FaceID & Fingerprint authentication."
              />
              <SmallFeatureCard 
                icon={Database}
                title="Local-First"
                desc="All sensitive data stays on your device."
              />
              <SmallFeatureCard 
                icon={Sparkles}
                title="Secure Sync"
                desc="Encrypted cloud backups for peace of mind."
              />
           </div>
        </div>
      </section>

      {/* Vision / About Section */}
      <section id="about" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-premium-purple/5 opacity-50"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">The Vision behind SaynIQ</h2>
            <div className="space-y-8 text-gray-400 text-xl leading-relaxed font-medium">
              <p>
                SaynIQ was born from a simple observation: we are drowning in information but starving for knowledge. 
                Our mission is to build the ultimate interface between your biological mind and the digital world.
              </p>
              <p>
                By combining state-of-the-art AI models with intuitive design, we've created a "Second Brain" 
                that doesn't just store data, but helps you process, connect, and recall it exactly when you need it most.
              </p>
            </div>
          </motion.div>
          <div className="pt-12 flex flex-col items-center">
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-premium-purple to-premium-lightPurple p-1 mb-6">
                <div className="w-full h-full rounded-full bg-premium-dark flex items-center justify-center text-4xl font-black text-white">
                   S
                </div>
             </div>
             <p className="font-bold text-2xl">Sayan Admin</p>
             <p className="text-premium-lightPurple text-xs uppercase tracking-[0.3em] font-black mt-2">Lead Architect & AI Designer</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-premium-purple/10 blur-[150px] rounded-full"></div>
        <div className="max-w-3xl mx-auto space-y-10 relative z-10">
           <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-gradient">READY TO UPGRADE <br/>YOUR BRAIN?</h2>
           <p className="text-gray-400 text-xl font-medium">Download the latest SaynIQ APK and join thousands of power users managing their digital life.</p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href={apkLink}
                className="bg-premium-purple hover:bg-premium-purple/90 px-12 py-6 rounded-2xl font-black text-2xl flex items-center gap-3 shadow-2xl shadow-premium-purple/20 transition-all hover:scale-105 active:scale-95 group"
              >
                <Download size={28} />
                <span>Download APK</span>
              </a>
              <Link 
                to="/login"
                className="bg-white/5 hover:bg-white/10 px-12 py-6 rounded-2xl font-black text-2xl border border-white/10 transition-all hover:scale-105 active:scale-95"
              >
                Admin Portal
              </Link>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-[#080314]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
             <div className="flex items-center gap-3">
                <div className="bg-premium-purple p-2 rounded-xl shadow-lg shadow-premium-purple/20">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase text-gradient">SaynIQ</span>
             </div>
             <p className="text-gray-500 max-w-sm font-medium text-lg leading-relaxed">
               The premier AI-powered knowledge OS. Built for thinkers, builders, and everyone in between.
             </p>
             <div className="flex items-center gap-8 pt-4">
                <a href="https://github.com/Sayan024/SaynIQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-premium-lightPurple transition-all hover:scale-110"><Github size={24} /></a>
                <a href="#" className="text-gray-400 hover:text-premium-lightPurple transition-all hover:scale-110"><Smartphone size={24} /></a>
                <a href="mailto:hello@sayniq.com" className="text-gray-400 hover:text-premium-lightPurple transition-all hover:scale-110"><Mail size={24} /></a>
             </div>
          </div>
          
          <div className="space-y-8">
             <h4 className="font-black uppercase tracking-widest text-xs text-gray-300">Quick Links</h4>
             <ul className="space-y-4 text-gray-500 text-sm font-bold">
                <li><a href="#home" className="hover:text-premium-lightPurple transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-premium-lightPurple transition-colors">Features Hub</a></li>
                <li><a href="#about" className="hover:text-premium-lightPurple transition-colors">Our Vision</a></li>
                <li><a href={apkLink} className="hover:text-premium-lightPurple transition-colors">Download App</a></li>
             </ul>
          </div>

          <div className="space-y-8">
             <h4 className="font-black uppercase tracking-widest text-xs text-gray-300">Community</h4>
             <ul className="space-y-4 text-gray-500 text-sm font-bold">
                <li><a href="#" className="hover:text-premium-lightPurple transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-premium-lightPurple transition-colors">Twitter / X</a></li>
                <li><a href="#" className="hover:text-premium-lightPurple transition-colors">Open Source</a></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 border-t border-white/5 mt-20 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-black uppercase tracking-widest text-gray-600">© {new Date().getFullYear()} SaynIQ Ecosystem. All Rights Reserved.</p>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-gray-600">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="#contact" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureSection = ({ image, title, subtitle, desc, points, reverse }) => (
  <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-20`}>
    <motion.div 
      initial={{ opacity: 0, x: reverse ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex-1 w-full"
    >
      <img 
        src={image} 
        alt={title} 
        className="w-full rounded-[2.5rem] border-[10px] border-white/5 shadow-2xl shadow-black/50 hover:scale-[1.02] transition-transform duration-500"
      />
    </motion.div>
    <div className="flex-1 space-y-8">
      <div className="space-y-4">
        <p className="text-premium-lightPurple text-xs font-black uppercase tracking-[0.2em]">{subtitle}</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">{title}</h2>
        <p className="text-gray-400 text-lg leading-relaxed font-medium">{desc}</p>
      </div>
      <div className="space-y-4">
        {points.map((p, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-premium-purple/30 transition-all group">
             <div className="w-12 h-12 rounded-xl bg-premium-purple/10 flex items-center justify-center text-premium-lightPurple group-hover:scale-110 transition-transform">
                <p.icon size={24} />
             </div>
             <p className="font-bold text-gray-200">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SmallFeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="glass-card p-6 border-white/5 space-y-3 hover:border-premium-purple/30 transition-all group">
    <div className="w-10 h-10 bg-premium-purple/10 rounded-xl flex items-center justify-center text-premium-lightPurple group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <h4 className="text-lg font-bold">{title}</h4>
    <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

export default Landing;
