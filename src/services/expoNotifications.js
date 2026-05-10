import axios from 'axios';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Sends push notifications via Expo's Push API
 * @param {Object} notification - The notification payload
 * @param {string[]} tokens - Array of Expo Push Tokens
 * @param {Object} options - Advanced options (ttl, badge, sound, etc)
 */
export const sendExpoNotification = async (notification, tokens, options = {}) => {
  if (!tokens || tokens.length === 0) return { status: 'no_tokens' };

  const chunks = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  const results = [];

  for (const chunk of chunks) {
    const messages = chunk.map(token => ({
      to: token,
      title: notification.title,
      body: notification.message,
      subtitle: options.subtitle || '',
      badge: parseInt(options.badge) || 0,
      sound: options.sound || 'default',
      ttl: parseInt(options.ttl) || 0,
      channelId: options.channelId || 'default',
      data: { 
        ...options.data,
        imageUrl: notification.imageUrl,
        url: notification.deepLink // Synced with app listener
      },
      _displayInForeground: true,
      priority: 'high',
    }));

    try {
      // Using a CORS proxy to bypass browser security limits
      const PROXY_URL = 'https://corsproxy.io/?';
      const response = await axios.post(PROXY_URL + encodeURIComponent(EXPO_PUSH_URL), messages, {
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          ...(options.accessToken && { 'Authorization': `Bearer ${options.accessToken}` })
        },
      });

      results.push(...response.data.data);
    } catch (error) {
      console.error('Push Request Failed:', error.response?.data || error.message);
      throw error;
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

    return {
      totalUsers,
      totalNotifications,
      iosCount,
      androidCount,
      otherCount: totalUsers - iosCount - androidCount,
      activeToday,
      users: users.slice(0, 10),
      allUsers: users // For more detailed charts in Analytics
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};
