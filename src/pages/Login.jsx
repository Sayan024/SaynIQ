import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Check local fallback first for dev convenience
      if (adminId === 'admin' && password === 'sayanadmin123') {
        onLogin(true);
        navigate('/admin');
        return;
      }

      // 2. Check Firestore admins collection
      const adminRef = doc(db, 'admins', adminId);
      const snapshot = await getDoc(adminRef);

      if (snapshot.exists() && snapshot.data().password === password) {
        onLogin(true);
        navigate('/admin');
      } else {
        setError('Invalid credentials. Please contact system administrator.');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('Connection failed. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-dark flex items-center justify-center p-6 bg-premium-gradient">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-premium-purple/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-premium-purple/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 border-premium-purple/20 relative z-10"
      >
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-premium-purple/20 transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-medium">Back to Website</span>
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-premium-purple p-4 rounded-2xl mb-4 purple-glow">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">SaynIQ Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Admin ID</label>
            <input 
              type="text" 
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full bg-[#0b041a] border border-premium-purple/20 rounded-xl py-3 px-4 focus:outline-none focus:border-premium-purple focus:ring-1 focus:ring-premium-purple/30 transition-all"
              placeholder="Enter admin ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b041a] border border-premium-purple/20 rounded-xl py-3 px-4 focus:outline-none focus:border-premium-purple focus:ring-1 focus:ring-premium-purple/30 transition-all"
                placeholder="Enter password"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-premium-purple hover:bg-premium-purple/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 purple-glow active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            &copy; 2026 SaynIQ Platform. All Rights Reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
