import { useState, useEffect } from 'react';
import { 
  Send, Image, Link, CheckCircle, AlertCircle, Loader2, 
  Users, Smartphone, Zap, Key, Hash, Volume2, Layers, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { sendExpoNotification, fetchActiveUserTokens } from '../services/expoNotifications';

const Notifications = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    imageUrl: '',
    deepLink: '',
    target: 'all', // all, active, version, specific
    targetVersion: '1.0.2',
    specificToken: '',
    accessToken: '', // Added back as optional override
    ttl: '3600',
    badge: '1',
    sound: 'default',
    channelId: 'default',
    subtitle: '',
    jsonData: '{}'
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null); // success, error
  const [logs, setLogs] = useState([]);
  const [targetCount, setTargetCount] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Fetch real logs
  const fetchLogs = async () => {
    try {
      const q = query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc'), limit(15));
      const snapshot = await getDocs(q);
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate().toLocaleTimeString() || 'N/A'
      }));
      setLogs(logData);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const updateTargetCount = async () => {
      if (formData.target === 'specific') {
        setTargetCount(formData.specificToken ? 1 : 0);
        return;
      }
      const tokens = await fetchActiveUserTokens(formData.target, formData.targetVersion);
      setTargetCount(tokens.length);
    };
    updateTargetCount();
  }, [formData.target, formData.targetVersion, formData.specificToken]);

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      let tokens = [];
      if (formData.target === 'specific') {
        tokens = [formData.specificToken];
      } else {
        tokens = await fetchActiveUserTokens(formData.target, formData.targetVersion);
      }

      if (tokens.length === 0) {
        throw new Error("No tokens found for the selected target.");
      }

      const options = {
        accessToken: formData.accessToken, // Optional override
        ttl: formData.ttl,
        badge: formData.badge,
        sound: formData.sound,
        channelId: formData.channelId,
        subtitle: formData.subtitle,
        data: JSON.parse(formData.jsonData || '{}')
      };

      const results = await sendExpoNotification(
        { 
          title: formData.title, 
          message: formData.message, 
          imageUrl: formData.imageUrl, 
          deepLink: formData.deepLink 
        },
        tokens,
        options
      );

      // Analyze results for better logging
      const successCount = results.filter(r => r.status === 'ok').length;
      const failCount = results.length - successCount;

      // Save log to Firestore
      const logEntry = {
        timestamp: new Date(),
        title: formData.title,
        message: formData.message,
        target: formData.target,
        count: tokens.length,
        status: failCount === 0 ? 'Sent' : `Partial (${successCount}/${results.length})`,
        metadata: {
          version: formData.targetVersion,
          hasImage: !!formData.imageUrl,
          successCount,
          failCount,
          results: results.slice(0, 10) // Store first 10 for debugging
        }
      };
      
      await addDoc(collection(db, 'broadcasts'), logEntry);
      
      setStatus('success');
      fetchLogs(); // Refresh history
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message });
      
      // Log failure too
      try {
        await addDoc(collection(db, 'broadcasts'), {
          timestamp: new Date(),
          title: formData.title,
          target: formData.target,
          count: 0,
          status: 'Failed: ' + error.message
        });
        fetchLogs();
      } catch (e) {}
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Push Notification Center</h1>
          <p className="text-gray-400 text-sm">Advanced broadcast tools for SaynIQ ecosystem.</p>
        </div>
        <div className="bg-premium-purple/10 border border-premium-purple/20 px-4 py-2 rounded-xl flex items-center justify-between sm:justify-start w-full sm:w-auto">
           <span className="text-xs text-gray-400 mr-2 uppercase font-bold tracking-wider">Ready to reach:</span>
           <span className="text-lg font-black text-premium-lightPurple">{targetCount} devices</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSend} className="glass-card p-8 border-white/5 space-y-8">
            {/* Core Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-premium-lightPurple">
                <Zap size={20} className="fill-premium-lightPurple" />
                Message Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notification Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-premium-purple outline-none transition-all"
                    placeholder="E.g., New Market Insights Available 📈"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message Body</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows="3"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-premium-purple outline-none transition-all resize-none"
                    placeholder="Describe the update or alert..."
                    required
                  ></textarea>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5"><Image size={12} /> Image URL</label>
                   <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm" placeholder="https://..." />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5"><Link size={12} /> Deep Link</label>
                   <input type="text" value={formData.deepLink} onChange={(e) => setFormData({...formData, deepLink: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm" placeholder="sayniq://..." />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="pt-8 border-t border-white/5 space-y-6">
               <h2 className="text-lg font-bold flex items-center gap-2 text-premium-lightPurple">
                <Layers size={20} />
                Advanced Parameters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                     <Key size={12} /> Access Token <span className="text-[10px] text-gray-500 lowercase font-normal ml-1">(Optional)</span>
                   </label>
                   <input 
                     type="password" 
                     value={formData.accessToken} 
                     onChange={(e) => setFormData({...formData, accessToken: e.target.value})} 
                     className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm" 
                     placeholder="Override Default Token" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5"><Clock size={12} /> TTL (Seconds)</label>
                   <input type="number" value={formData.ttl} onChange={(e) => setFormData({...formData, ttl: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5"><Hash size={12} /> Badge Count</label>
                   <input type="number" value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5"><Volume2 size={12} /> Sound</label>
                   <select value={formData.sound} onChange={(e) => setFormData({...formData, sound: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm">
                      <option value="default">Default</option>
                      <option value="none">None</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">iOS Subtitle</label>
                   <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm" placeholder="Optional" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Android Channel</label>
                   <input type="text" value={formData.channelId} onChange={(e) => setFormData({...formData, channelId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm" />
                </div>
                <div className="md:col-span-3">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">JSON Payload Data</label>
                   <textarea value={formData.jsonData} onChange={(e) => setFormData({...formData, jsonData: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm font-mono h-20" placeholder="{}"></textarea>
                </div>
              </div>
            </div>

            {/* Target Selection */}
            <div className="pt-8 border-t border-white/5 space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-premium-lightPurple">
                <Users size={20} />
                Target Audience
              </h2>
              <div className="flex flex-wrap gap-3">
                {['all', 'active', 'version', 'specific'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, target: t})}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                      formData.target === t 
                        ? 'bg-premium-purple border-premium-purple text-white' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {formData.target === 'version' && (
                <div className="animate-fade-in max-w-xs">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Version</label>
                  <select 
                    value={formData.targetVersion}
                    onChange={(e) => setFormData({...formData, targetVersion: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm"
                  >
                    <option value="1.0.0">v1.0.0</option>
                    <option value="1.0.1">v1.0.1</option>
                    <option value="1.0.2">v1.0.2</option>
                  </select>
                </div>
              )}

              {formData.target === 'specific' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Expo Push Token</label>
                  <input 
                    type="text" 
                    value={formData.specificToken}
                    onChange={(e) => setFormData({...formData, specificToken: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 focus:border-premium-purple outline-none text-sm"
                    placeholder="ExponentPushToken[...]"
                  />
                </div>
              )}
            </div>

            <div className="pt-6">
              {status === 'success' && (
                <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                  <CheckCircle size={20} />
                  <span>Notification sequence initiated successfully!</span>
                </div>
              )}
              {status?.type === 'error' && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                  <AlertCircle size={20} />
                  <div className="flex flex-col">
                    <span className="font-bold">Transmission Error</span>
                    <span className="text-xs opacity-80">{status.message}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSending || !formData.title || !formData.message}
                className="w-full bg-premium-purple hover:bg-premium-purple/90 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-premium-purple/20 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isSending ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-white" />
                    <span>Transmitting Payload...</span>
                  </>
                ) : (
                  <>
                    <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Broadcast Notification</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* History Logs */}
          <div className="glass-card p-8 border-white/5 overflow-hidden">
             <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock size={20} className="text-gray-400" />
                Transmission History
             </h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                         <th className="pb-4 px-2">Time</th>
                         <th className="pb-4 px-2">Title</th>
                         <th className="pb-4 px-2">Target</th>
                         <th className="pb-4 px-2">Reach</th>
                         <th className="pb-4 px-2 text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {logs.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center text-gray-500 italic text-sm">No recent logs found.</td></tr>
                      ) : logs.map(log => (
                        <tr key={log.id} className="text-sm">
                           <td className="py-4 px-2 text-gray-400 font-mono text-xs">{log.time}</td>
                           <td className="py-4 px-2 font-bold">{log.title}</td>
                           <td className="py-4 px-2 uppercase text-[10px] text-gray-400 font-black tracking-wider">{log.target}</td>
                           <td className="py-4 px-2">{log.count}</td>
                           <td className="py-4 px-2 text-right">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                log.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {log.status}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Right Column: Preview & Stats */}
        <div className="lg:col-span-4 space-y-8">
           <h2 className="text-lg font-bold flex items-center gap-2">
            <Smartphone size={20} className="text-premium-lightPurple" />
            Device Preview
          </h2>
          
          <div className="relative w-full aspect-[9/18] bg-black rounded-[3rem] border-[8px] border-[#1a1a1a] overflow-hidden shadow-[0_0_100px_rgba(109,40,217,0.1)]">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-3xl z-30"></div>
            
            {/* Notification */}
            <div className="absolute top-20 left-3 right-3 z-20">
              <motion.div 
                key={formData.title + formData.message}
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-premium-purple rounded-lg flex items-center justify-center text-[10px] font-black text-white">S</div>
                  <span className="text-[10px] font-black text-gray-900 tracking-tight">SAYNIQ</span>
                  <span className="text-[10px] text-gray-400 ml-auto">now</span>
                </div>
                <p className="text-sm font-black text-gray-900 leading-tight mb-1">{formData.title || "Your notification title..."}</p>
                {formData.subtitle && <p className="text-xs font-bold text-gray-700 mb-1">{formData.subtitle}</p>}
                <p className="text-xs text-gray-600 leading-snug">{formData.message || "Message body will appear here."}</p>
                {formData.imageUrl && (
                  <div className="mt-3 rounded-2xl overflow-hidden h-32 bg-gray-100">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Lockscreen content */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center pt-20">
               <p className="text-xs text-white/40 font-medium tracking-widest uppercase mb-2">May 10, Sunday</p>
               <h1 className="text-6xl font-black text-white/90 tracking-tighter">12:18</h1>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 space-y-4">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Performance Estimate</h3>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-emerald-400 font-bold">98.4%</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[98.4%]"></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Avg. Click Speed</span>
                      <span className="text-premium-lightPurple font-bold">4.2s</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-premium-purple w-[75%]"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
