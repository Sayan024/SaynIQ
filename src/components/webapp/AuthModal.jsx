import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useWebAuth } from '../../context/WebAuthContext';
import { auth, googleProvider } from '../../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect } from 'firebase/auth';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal } = useWebAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    // Firebase requires at least 6 characters
    if (!isLoginMode && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      closeAuthModal();
    } catch (err) {
      console.error("Auth Error:", err);
      // Clean up the firebase error message to be more user friendly
      const friendlyError = err.message.replace('Firebase: ', '').replace(' (auth/email-already-in-use).', '');
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      // Using Redirect instead of Popup to solve the COOP/Cross-Origin issue
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeAuthModal}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-theme-card border border-theme-border p-6 rounded-2xl overflow-hidden shadow-sleek"
        >
          {/* Subtle Glow Background */}
          <div className="absolute -top-20 -right-20 w-40 h-40 opacity-20 rounded-full blur-3xl bg-theme-accent" />
          
          <button 
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-theme-textSecondary hover:bg-white/[0.04] hover:text-white transition-colors rounded-lg"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col items-center text-center mb-6 mt-2 relative z-10">
            <div className="w-10 h-10 bg-theme-accent/10 border border-theme-accent/20 text-theme-accent rounded-xl flex items-center justify-center mb-3 shadow-sleek">
              <Zap size={20} />
            </div>
            <h2 className="text-[18px] font-semibold text-theme-textPrimary">{isLoginMode ? 'Sign In' : 'Create Account'}</h2>
            <p className="text-[13px] text-theme-textSecondary mt-1">
              {isLoginMode ? 'Log in to securely sync your data.' : 'Create an account to save your progress.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 relative z-10">
            <div>
              <input 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-theme-background border border-theme-border rounded-lg py-2.5 px-3 text-[13px] font-medium text-theme-textPrimary placeholder:text-theme-textSecondary/50 focus:outline-none focus:border-theme-accent focus:bg-white/[0.04] transition-all"
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-theme-background border border-theme-border rounded-lg py-2.5 px-3 text-[13px] font-medium text-theme-textPrimary placeholder:text-theme-textSecondary/50 focus:outline-none focus:border-theme-accent focus:bg-white/[0.04] transition-all"
                required
              />
            </div>
            
            {error && <p className="text-theme-danger text-[11px] font-medium text-center bg-theme-danger/10 py-2 rounded-lg">{error}</p>}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-theme-primary hover:bg-white text-theme-textDark font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 text-[13px] mt-2"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : (isLoginMode ? 'Continue' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-theme-border text-center relative z-10">
             <button 
               onClick={handleGoogleAuth}
               disabled={isLoading}
               className="w-full bg-theme-cardSecondary border border-theme-border text-theme-textPrimary hover:bg-white/[0.04] hover:border-theme-accent/50 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 text-[13px] mb-4"
             >
               <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
               Continue with Google
             </button>
             
             <button 
               onClick={() => {
                 setIsLoginMode(!isLoginMode);
                 setError('');
               }}
               className="text-[12px] font-medium text-theme-textSecondary hover:text-theme-textPrimary transition-colors"
             >
               {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
