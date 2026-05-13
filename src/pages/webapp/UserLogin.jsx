import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect } from 'firebase/auth';

const UserLogin = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-theme-accent/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-theme-highlight/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] glass-card p-8 relative z-10"
      >
        <div className="mb-10 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Zap size={18} className="text-theme-accent group-hover:scale-110 transition-transform" fill="currentColor" />
            <span className="text-sm font-black text-theme-textPrimary tracking-widest">SAYNIQ</span>
          </Link>
          <div className="text-[10px] font-bold text-theme-textSecondary uppercase tracking-widest bg-white/[0.03] px-3 py-1 rounded-full border border-theme-border">
            Cloud Sync
          </div>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-theme-accent/10 border border-theme-accent/20 rounded-xl flex items-center justify-center mb-4 shadow-sleek">
            <Zap size={20} className="text-theme-accent" fill="currentColor" />
          </div>
          <h1 className="text-[22px] font-bold text-theme-textPrimary tracking-tight">
            {isLoginMode ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-theme-textSecondary text-[13px] mt-1 font-medium text-center">
            {isLoginMode ? 'Sign in to access your knowledge hub' : 'Get started with your personal vault'}
          </p>
        </div>

        <div className="space-y-4">
           <button 
             onClick={handleGoogleAuth}
             disabled={isLoading}
             className="w-full bg-white/[0.03] border border-theme-border text-theme-textPrimary hover:bg-white/[0.08] hover:border-theme-accent/50 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 text-[13px]"
           >
             <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
             Continue with Google
           </button>

           <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-theme-border flex-1" />
              <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-[0.2em]">OR</span>
              <div className="h-px bg-theme-border flex-1" />
           </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[12px] font-semibold text-theme-textSecondary ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-theme-background border border-theme-border rounded-xl py-2.5 px-4 text-[13px] font-medium text-theme-textPrimary placeholder:text-theme-textSecondary/30 focus:outline-none focus:border-theme-accent/50 focus:bg-white/[0.02] transition-all"
                placeholder="name@work.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[12px] font-semibold text-theme-textSecondary">Password</label>
                {isLoginMode && <a href="#" className="text-[11px] font-semibold text-theme-accent hover:text-white transition-colors">Forgot?</a>}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-theme-background border border-theme-border rounded-xl py-2.5 px-4 text-[13px] font-medium text-theme-textPrimary placeholder:text-theme-textSecondary/30 focus:outline-none focus:border-theme-accent/50 focus:bg-white/[0.02] transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-textSecondary hover:text-theme-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-theme-danger/10 border border-theme-danger/20 text-theme-danger p-3 rounded-xl text-[12px] font-medium text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-theme-textDark font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-premium active:scale-[0.98] disabled:opacity-50 text-[13px] hover:bg-theme-accent hover:text-white"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isLoginMode ? 'Authenticate' : 'Initialize Account')}
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
           <button 
             onClick={() => {
               setIsLoginMode(!isLoginMode);
               setError('');
             }}
             className="text-[12px] font-medium text-theme-textSecondary hover:text-theme-textPrimary transition-colors"
           >
             {isLoginMode ? (
               <>Don't have an account? <span className="text-theme-accent font-semibold">Create one</span></>
             ) : (
               <>Already have an account? <span className="text-theme-accent font-semibold">Sign in</span></>
             )}
           </button>
           
           <div className="h-px w-full bg-theme-border/50" />
           
           <Link to="/admin-login" className="text-[11px] font-bold text-theme-textSecondary/50 hover:text-theme-textSecondary transition-colors uppercase tracking-widest">
             Admin Access
           </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UserLogin;
