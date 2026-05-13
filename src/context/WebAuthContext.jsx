import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const WebAuthContext = createContext();

export const WebAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin Session State (Local Only)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    localStorage.getItem('admin_session') === 'true'
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only set user if not an admin-only session or handle separately
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => {
    signOut(auth);
  };

  const loginAdmin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('admin_session', 'true');
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Require Auth wrapper function
  const requireAuth = (action) => {
    if (currentUser) {
      action();
    } else {
      openAuthModal();
    }
  };

  return (
    <WebAuthContext.Provider value={{ 
      currentUser,
      isUserAuthenticated: !!currentUser, 
      isAdminAuthenticated,
      loginAdmin,
      logoutAdmin,
      logout, 
      isAuthModalOpen, 
      openAuthModal, 
      closeAuthModal,
      requireAuth,
      loading
    }}>
      {!loading && children}
    </WebAuthContext.Provider>
  );
};

export const useWebAuth = () => useContext(WebAuthContext);
