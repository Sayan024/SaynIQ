import { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, AlertTriangle, CheckCircle, Save, History, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const VersionManager = () => {
  const [versions, setVersions] = useState({
    latest: '1.0.2',
    minimum: '1.0.0',
    iosLatest: '1.0.2',
    androidLatest: '1.0.2',
    forceUpdate: true
  });

  const [releaseNotes, setReleaseNotes] = useState(
    "• Improved AI responses in Finance Hub\n• Fixed background overlap on Dashboard\n• Added end-to-end push notification support\n• Performance optimizations for low-end devices"
  );

  const [downloadLink, setDownloadLink] = useState("https://drive.usercontent.google.com/download?id=1Ew94c5ItQtYOdYpgoasxGC68J8tBbQod&export=download");

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'config', 'app');
        const snapshot = await getDoc(configRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setVersions(data.versions || versions);
          setReleaseNotes(data.releaseNotes || releaseNotes);
          setDownloadLink(data.downloadLink || downloadLink);
        }
      } catch (error) {
        console.error("Error fetching app config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configRef = doc(db, 'config', 'app');
      await setDoc(configRef, {
        versions,
        releaseNotes,
        downloadLink,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });
      alert('Version settings updated successfully in Firestore!');
    } catch (error) {
      console.error("Error saving config:", error);
      alert('Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-premium-purple" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">App Version Management</h1>
        <p className="text-gray-400">Control forced updates and manage release cycles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6 border-premium-purple/10">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Smartphone size={20} className="text-premium-lightPurple" />
            Current Version Status
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Latest Version</label>
              <input 
                type="text" 
                value={versions.latest}
                onChange={(e) => setVersions({...versions, latest: e.target.value})}
                className="w-full bg-[#0b041a] border border-premium-purple/20 rounded-xl py-2 px-4 focus:outline-none focus:border-premium-purple"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Required Version</label>
              <input 
                type="text" 
                value={versions.minimum}
                onChange={(e) => setVersions({...versions, minimum: e.target.value})}
                className="w-full bg-[#0b041a] border border-premium-purple/20 rounded-xl py-2 px-4 focus:outline-none focus:border-premium-purple"
              />
            </div>

            <div className="pt-4 border-t border-premium-purple/10">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-white group-hover:text-premium-lightPurple transition-colors">Force Update</p>
                  <p className="text-xs text-gray-500">Require users to update if version &lt; {versions.latest}</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={versions.forceUpdate}
                    onChange={(e) => setVersions({...versions, forceUpdate: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#160d33] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-premium-purple"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-premium-purple/10">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <RefreshCw size={20} className="text-premium-lightPurple" />
            Direct Download Configuration
          </h2>
          
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Public APK/Download URL</label>
                <input 
                  type="url" 
                  value={downloadLink}
                  onChange={(e) => setDownloadLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0b041a] border border-premium-purple/20 rounded-xl py-3 px-4 focus:outline-none focus:border-premium-purple text-sm font-mono"
                />
             </div>
             <p className="text-[10px] text-gray-500">This link will be used across the main website and landing pages for the "Download APK" buttons.</p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-premium-purple/10">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <RefreshCw size={20} className="text-premium-lightPurple" />
              Release Notes (v{versions.latest})
            </h2>
            
            <textarea 
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              rows="5"
              className="w-full bg-[#0b041a] border border-premium-purple/20 rounded-xl py-3 px-4 focus:outline-none focus:border-premium-purple resize-none text-sm text-gray-300 font-mono"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-premium-purple/10">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-400" />
          Update Preview
        </h2>
        
        <div className="bg-premium-purple/5 border border-premium-purple/20 p-8 rounded-2xl flex flex-col items-center text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-premium-purple/20 rounded-full flex items-center justify-center mb-4">
             <RefreshCw size={32} className="text-premium-lightPurple animate-spin-slow" />
          </div>
          <h3 className="text-xl font-bold mb-2">New Version Available!</h3>
          <p className="text-sm text-gray-400 mb-6">Version {versions.latest} is now available on the {versions.androidLatest === versions.iosLatest ? 'App Store and Play Store' : 'Stores'}.</p>
          
          <div className="w-full text-left bg-[#0b041a] p-4 rounded-xl mb-6 text-xs text-gray-300">
             <p className="font-bold mb-2 uppercase text-[10px] text-premium-lightPurple">What's New:</p>
             <div className="whitespace-pre-line">{releaseNotes}</div>
          </div>

          <button className="w-full bg-premium-purple py-3 rounded-xl font-bold text-sm">Update Now</button>
          <button className="mt-3 text-sm text-gray-500 hover:text-white transition-colors">Maybe Later</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
        <button 
          onClick={() => alert(`Version Management Log:\nLast updated at: ${new Date().toLocaleString()}\nBy: System Administrator\nActive Build: v${versions.latest}`)}
          className="w-full sm:w-auto px-6 py-4 sm:py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <History size={18} />
          <span>View History</span>
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-10 py-4 sm:py-3 rounded-xl bg-premium-purple text-white font-bold hover:bg-premium-purple/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-premium-purple/20 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default VersionManager;
