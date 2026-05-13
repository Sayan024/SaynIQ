import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Save, 
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react';
import { db } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

const FeatureAds = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: 'NEW',
    icon: 'Sparkles',
    enabled: true,
    image: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'feature_ads'), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setFeatures(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenModal = (feature = null) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData({
        title: feature.title,
        description: feature.description,
        tag: feature.tag,
        icon: feature.icon,
        enabled: feature.enabled,
        image: feature.image || ''
      });
    } else {
      setEditingFeature(null);
      setFormData({
        title: '',
        description: '',
        tag: 'NEW',
        icon: 'Sparkles',
        enabled: true,
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingFeature) {
        await updateDoc(doc(db, 'feature_ads', editingFeature.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'feature_ads'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving feature:", error);
      alert("Failed to save feature advertisement.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this feature ad?")) return;
    try {
      await deleteDoc(doc(db, 'feature_ads', id));
    } catch (error) {
      console.error("Error deleting feature:", error);
    }
  };

  const toggleVisibility = async (feature) => {
    try {
      await updateDoc(doc(db, 'feature_ads', feature.id), {
        enabled: !feature.enabled
      });
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" size={48} /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Feature Advertisements</h1>
          <p className="text-theme-textSecondary font-medium">Manage the dynamic feature showcase on the user dashboard sidebar.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-theme-accent hover:bg-theme-accent/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-sleek transition-all active:scale-95"
        >
          <Plus size={20} />
          Create New Ad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => (
          <div key={feature.id} className={`glass-card p-6 border-l-4 ${feature.enabled ? 'border-l-theme-success' : 'border-l-theme-textSecondary/20'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                feature.tag === 'NEW' ? 'bg-theme-accent/10 text-theme-accent border border-theme-accent/20' :
                feature.tag === 'TRENDING' ? 'bg-theme-highlight/10 text-theme-highlight border border-theme-highlight/20' :
                'bg-theme-success/10 text-theme-success border border-theme-success/20'
              }`}>
                {feature.tag}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleVisibility(feature)} className="p-2 text-theme-textSecondary hover:text-white transition-colors">
                  {feature.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => handleOpenModal(feature)} className="p-2 text-theme-textSecondary hover:text-theme-accent transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(feature.id)} className="p-2 text-theme-textSecondary hover:text-theme-danger transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-theme-accent shrink-0">
                {feature.icon === 'Sparkles' ? <Sparkles size={24} /> : 
                 feature.icon === 'Zap' ? <Zap size={24} /> : 
                 <TrendingUp size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{feature.title}</h3>
                <p className="text-theme-textSecondary text-[13px] line-clamp-2 mt-1">{feature.description}</p>
              </div>
            </div>

            {!feature.enabled && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-theme-textSecondary/50" />
                <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">Currently Disabled</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="glass-card w-full max-w-lg p-10 relative z-10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] border-theme-accent/20">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black tracking-tight">{editingFeature ? 'Edit Advertisement' : 'Create New Ad'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-theme-textSecondary hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Feature Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-theme-accent transition-all font-bold"
                  placeholder="e.g. AI-Powered Link Saver"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-theme-accent transition-all text-sm h-24 resize-none"
                  placeholder="Tell users why this feature is awesome..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Highlight Tag</label>
                  <select 
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-theme-accent transition-all text-sm font-bold appearance-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="TRENDING">TRENDING</option>
                    <option value="AI POWERED">AI POWERED</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Icon Style</label>
                  <select 
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-theme-accent transition-all text-sm font-bold appearance-none"
                  >
                    <option value="Sparkles">Sparkles</option>
                    <option value="Zap">Zap</option>
                    <option value="TrendingUp">Trending Up</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 py-4">
                <input 
                  type="checkbox" 
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-[#0b041a] border-white/5 text-theme-accent focus:ring-theme-accent/20"
                />
                <label htmlFor="enabled" className="text-sm font-bold text-white cursor-pointer">Visible to users immediately</label>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-theme-accent hover:bg-theme-accent/90 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {editingFeature ? 'Update Advertisement' : 'Publish Advertisement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureAds;
