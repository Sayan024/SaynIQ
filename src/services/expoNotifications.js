import axios from 'axios';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * Sends push notifications via internal backend API
 * @param {Object} notification - The notification payload
 * @param {string[]} tokens - Array of Expo Push Tokens
 * @param {Object} options - Advanced options (ttl, badge, sound, etc)
 */
export const sendExpoNotification = async (notification, tokens, options = {}) => {
  if (!tokens || tokens.length === 0) return { status: 'no_tokens' };

  const chunks = [];
  // Expo handles up to 100 tokens per request
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  const results = [];

  for (const chunk of chunks) {
    try {
      // Calling our own backend API instead of Expo directly or via proxy
      const response = await axios.post('/api/send-notification', {
        tokens: chunk,
        notification,
        options,
        accessToken: options.accessToken // Pass the token if provided as an override
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (response.data && response.data.data) {
        results.push(...response.data.data);
      }
    } catch (error) {
      console.error('Push Request Failed:', error.response?.data || error.message);
      
      // More descriptive error for the UI
      const errorMessage = error.response?.data?.details?.error || error.response?.data?.error || error.message;
      throw new Error(`Backend API Error: ${errorMessage}`);
    }
  }

  return results;
};

/**
 * Fetches active user tokens from Firestore
 */
export const fetchActiveUserTokens = async (target = 'all', version = null) => {
  try {
    const usersRef = collection(db, 'users');
    let q;
    
    if (target === 'all') {
      q = query(usersRef, where('pushToken', '!=', null));
    } else if (target === 'active') {
      // Assuming 'lastActive' is a timestamp
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      q = query(usersRef, where('lastActive', '>=', yesterday));
    } else if (target === 'version' && version) {
      q = query(usersRef, where('appVersion', '==', version));
    } else {
      q = query(usersRef, where('pushToken', '!=', null));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => doc.data().pushToken)
      .filter(token => token && token.startsWith('ExponentPushToken'));
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
};

/**
 * Fetches real analytics from Firestore
 */
export const fetchRealAnalytics = async () => {
  try {
    // Fetch users
    const usersRef = collection(db, 'users');
    const userSnapshot = await getDocs(usersRef);
    const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalUsers = users.length;
    
    // Fetch notifications (broadcasts)
    let totalNotifications = 0;
    try {
      const broadcastsRef = collection(db, 'broadcasts');
      const broadcastSnapshot = await getDocs(broadcastsRef);
      totalNotifications = broadcastSnapshot.size;
    } catch (e) {
      console.warn('Broadcasts collection not found or inaccessible');
    }

    const iosCount = users.filter(u => u.os?.toLowerCase().includes('ios')).length;
    const androidCount = users.filter(u => u.os?.toLowerCase().includes('android')).length;
    
    // Calculate "Active Today" (last 24h)
    const now = new Date();
    const activeToday = users.filter(u => {
      if (!u.lastActive) return false;
      const lastActiveDate = u.lastActive.toDate ? u.lastActive.toDate() : new Date(u.lastActive);
      return (now - lastActiveDate) < (24 * 60 * 60 * 1000);
    }).length;

    // Fetch support tickets
    let totalTickets = 0;
    let openTicketsCount = 0;
    let resolvedTicketsCount = 0;
    try {
      const ticketsRef = collection(db, 'support_tickets');
      const ticketsSnapshot = await getDocs(ticketsRef);
      totalTickets = ticketsSnapshot.size;
      openTicketsCount = ticketsSnapshot.docs.filter(d => d.data().status === 'Open').length;
      resolvedTicketsCount = ticketsSnapshot.docs.filter(d => d.data().status === 'Resolved').length;
    } catch (e) {
      console.warn('Support tickets collection not found or inaccessible');
    }

    return {
      totalUsers,
      totalNotifications,
      iosCount,
      androidCount,
      otherCount: totalUsers - iosCount - androidCount,
      activeToday,
      totalTickets,
      openTicketsCount,
      resolvedTicketsCount,
      users: users.slice(0, 10),
      allUsers: users // For more detailed charts in Analytics
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};
