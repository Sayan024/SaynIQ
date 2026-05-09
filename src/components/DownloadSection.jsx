import React from 'react';
import { motion } from 'framer-motion';
import { FaAndroid, FaGithub, FaCheckCircle } from 'react-icons/fa';
import { APP_INFO } from '../constants';

const DownloadSection = () => {
  return (
    <section id="download" className="py-24 bg-dark relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-card p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">Ready to transform your <span className="text-accent">Productivity?</span></h2>
            
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <FaCheckCircle className="text-accent text-xl flex-shrink-0" />
                <p className="text-white/70">Support for {APP_INFO.androidSupport}</p>
              </div>
              <div className="flex items-center gap-4">
                <FaCheckCircle className="text-accent text-xl flex-shrink-0" />
                <p className="text-white/70">Full GitHub Repository Access</p>
              </div>
              <div className="flex items-center gap-4">
                <FaCheckCircle className="text-accent text-xl flex-shrink-0" />
                <p className="text-white/70">Regular Updates and AI Model Tuning</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <a href={APP_INFO.apkUrl} target="_blank" rel="noopener noreferrer" className="btn-accent flex items-center gap-3 px-8 py-4">
                <FaAndroid className="text-2xl" /> 
                <div className="text-left">
                  <div className="text-xs font-normal opacity-80 leading-none">Download for Android</div>
                  <div className="text-lg font-bold">Latest APK {APP_INFO.version}</div>
                </div>
              </a>
              
              <a 
                href={APP_INFO.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary flex items-center gap-3 px-8 py-4"
              >
                <FaGithub className="text-2xl" />
                <div className="text-left">
                  <div className="text-xs font-normal opacity-80 leading-none">Open Source</div>
                  <div className="text-lg font-bold">GitHub Repo</div>
                </div>
              </a>
            </div>
          </div>

          <div className="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Installation Guide</h3>
            <ul className="space-y-4 text-white/50 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold">1</span>
                Download the APK file using the button above.
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold">2</span>
                Allow installation from "Unknown Sources" in settings.
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold">3</span>
                Open the downloaded file and click "Install".
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold">4</span>
                Launch SaynIQ and start your AI journey.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
