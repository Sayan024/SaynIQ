import React from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaGithub, FaChevronRight } from 'react-icons/fa';
import { APP_INFO } from '../constants';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden mesh-gradient">
      {/* Background Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-sm font-medium text-white/80">AI-Powered Second Brain</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="gradient-text">{APP_INFO.tagline}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-white/60 mb-10 max-w-2xl mx-auto lg:mx-0"
            >
              Unlock the full potential of your mind. SaynIQ organizes your thoughts, links, and knowledge with cutting-edge AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              <a href={APP_INFO.apkUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-3">
                <FaDownload /> Download APK
              </a>
              <a href={APP_INFO.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-3">
                <FaGithub /> View GitHub
              </a>
              <a href="#features" className="group flex items-center gap-2 text-white/70 hover:text-white transition-all px-4 py-2 font-medium">
                Explore Features <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 relative"
          >
            {/* Phone Mockup Placeholder/Visual */}
            <div className="relative w-[280px] h-[580px] lg:w-[320px] lg:h-[650px] mx-auto animate-float">
              {/* Outer frame */}
              <div className="absolute inset-0 bg-dark-soft rounded-[3rem] border-[8px] border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.3)] overflow-hidden">
                {/* Screen Content */}
                <div className="absolute inset-0 bg-primary/20 flex flex-col">
                   <img 
                    src="/screenshots/screen1.png" 
                    alt="Hero Mockup" 
                    className="w-full h-full object-cover opacity-90"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                   />
                   <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-primary/40 to-dark p-8">
                     <div className="text-center">
                        <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-3xl font-bold">S</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">SaynIQ</h3>
                        <p className="text-xs text-white/60">Active Intelligence</p>
                     </div>
                   </div>
                </div>
              </div>
              
              {/* Floating Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/20 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center rotate-12 animate-pulse-slow">
                <div className="text-accent text-3xl">✨</div>
              </div>
              <div className="absolute bottom-20 -left-16 w-20 h-20 bg-primary/20 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center -rotate-12 animate-float delay-700">
                <div className="text-white text-2xl">🧠</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
