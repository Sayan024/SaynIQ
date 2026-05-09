import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaDownload, FaBrain, FaRobot, FaLayerGroup } from 'react-icons/fa';
import { APP_INFO } from '../constants';

const SharePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sharedData, setSharedData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setError(true);
      return;
    }

    try {
      // Decode Base64 safely
      const decoded = atob(data);
      const parsed = JSON.parse(decoded);
      setSharedData(parsed);

      // Attempt deep link after a short delay
      const deepLink = `sayniq://share?data=${data}`;
      const timeout = setTimeout(() => {
        window.location.href = deepLink;
      }, 1500);

      return () => clearTimeout(timeout);
    } catch (err) {
      console.error("Failed to decode shared data:", err);
      setError(true);
    }
  }, [searchParams]);

  const handleOpenApp = () => {
    const data = searchParams.get('data');
    window.location.href = `sayniq://share?data=${data}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass-card p-12 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-primary">Invalid Link</h2>
          <p className="text-white/60 mb-8">This shared link seems to be broken or malformed.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go to Home</button>
        </div>
      </div>
    );
  }

  if (!sharedData) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center mesh-gradient px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 lg:p-12 max-w-2xl w-full text-center relative overflow-hidden"
      >
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-3xl -z-10"></div>

        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-4xl mx-auto mb-8">
          {sharedData.type === 'link' ? <FaExternalLinkAlt /> : <FaBrain />}
        </div>

        <h2 className="text-3xl font-bold mb-4 text-white">Incoming Shared Content</h2>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase">
              {sharedData.type || 'Knowledge'}
            </span>
            {sharedData.category && (
              <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full uppercase">
                {sharedData.category}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 text-white/90">{sharedData.title || 'Shared Item'}</h3>
          {sharedData.url && (
            <p className="text-sm text-white/40 truncate mb-4">{sharedData.url}</p>
          )}
          {sharedData.text && (
            <p className="text-white/60 line-clamp-3 italic">"{sharedData.text}"</p>
          )}
        </div>

        <p className="text-white/50 mb-10">
          This content was shared via SaynIQ. Open it in the app to save it to your Knowledge Hub.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleOpenApp}
            className="btn-primary flex items-center gap-3 justify-center"
          >
            <FaLayerGroup /> Open in SaynIQ
          </button>
          <a 
            href={APP_INFO.apkUrl} 
            className="btn-secondary flex items-center gap-3 justify-center"
          >
            <FaDownload /> Download App
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-8 grayscale opacity-50">
           <div className="flex flex-col items-center">
             <FaRobot className="text-2xl mb-1" />
             <span className="text-[10px] uppercase tracking-widest font-bold">AI Powered</span>
           </div>
           <div className="flex flex-col items-center">
             <FaBrain className="text-2xl mb-1" />
             <span className="text-[10px] uppercase tracking-widest font-bold">Second Brain</span>
           </div>
        </div>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-8 text-white/30 text-sm"
      >
        Attempting to open the app automatically...
      </motion.p>
    </div>
  );
};

export default SharePage;
