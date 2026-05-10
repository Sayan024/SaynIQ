import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, orderBy, limit, where, Timestamp } from 'firebase/firestore';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    // We only want to notify about users who joined AFTER we opened the dashboard
    const startTime = Timestamp.now();
    
    const usersRef = collection(db, 'users');
    // We listen for any new documents in the users collection
    // Note: Since we don't have a reliable 'createdAt', we'll look for new documents added
    const q = query(usersRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isInitialized) {
        setIsInitialized(true);
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const userData = change.doc.data();
          
          // Check if this is a "new" user (joined after startTime)
          // If we don't have a joinedAt, we might get some false positives on initial sync 
          // if we aren't careful, but isInitialized helps.
          
          const newNotification = {
            id: change.doc.id,
            title: 'New User Joined! 🚀',
            message: `${userData.deviceName || 'A user'} just joined the SaynIQ ecosystem from ${userData.os || 'an unknown device'}.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'user',
            read: false,
            timestamp: new Date()
          };

          setNotifications(prev => [newNotification, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
          setToast(newNotification);
        }
      });
    });

    return () => unsubscribe();
  }, [isInitialized]);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      toast,
      setToast,
      markAsRead, 
      markAllAsRead, 
      clearNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
