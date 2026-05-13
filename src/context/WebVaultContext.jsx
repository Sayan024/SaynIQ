import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, doc, setDoc, deleteDoc, getDocs, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useWebAuth } from './WebAuthContext';

const WebVaultContext = createContext();

// Hardcoded demo state for guests
const DEMO_STATE = {
  items: [
    { id: '1', type: 'note', title: 'Product Idea: AI Dashboard', content: 'Explore how AI can organize personal knowledge.', updatedAt: { seconds: Date.now()/1000 } },
    { id: '2', type: 'note', title: 'Meeting Notes: Q3 Planning', content: 'Focus on growth and mobile retention.', updatedAt: { seconds: Date.now()/1000 - 86400 } }
  ],
  playlists: [
    { id: 'p1', title: 'Deep Work Focus', itemCount: 12 },
    { id: 'p2', title: 'Tech Podcasts', itemCount: 5 }
  ],
  tasks: [
    { id: 't1', title: 'Review PR for Authentication', completed: false, dueDate: new Date(Date.now() + 86400000).toISOString() },
    { id: 't2', title: 'Pay Internet Bill', completed: false, dueDate: new Date(Date.now() + 172800000).toISOString() }
  ],
  finance: [
    { id: 'f1', type: 'Expense', amount: 120, title: 'AWS Hosting', date: new Date().toISOString() },
    { id: 'f2', type: 'Expense', amount: 35, title: 'Groceries', date: new Date().toISOString() }
  ],
  reminders: [],
  settings: {}
};

export const WebVaultProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useWebAuth();
  
  const [vaultState, setVaultState] = useState({
    items: [],
    playlists: [],
    tasks: [],
    finance: [],
    reminders: [],
    settings: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setVaultState(DEMO_STATE);
      setLoading(false);
      return;
    }

    let unsubItems, unsubPlaylists, unsubMetadata;
    const vaultId = currentUser.uid;

    const setupListeners = () => {
      setLoading(true);
      
      unsubItems = onSnapshot(collection(db, 'vaults', vaultId, 'items'), (snap) => {
        const items = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        setVaultState(prev => ({ ...prev, items }));
        setLoading(false);
      });

      unsubPlaylists = onSnapshot(collection(db, 'vaults', vaultId, 'playlists'), (snap) => {
        const playlists = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        setVaultState(prev => ({ ...prev, playlists }));
      });

      unsubMetadata = onSnapshot(collection(db, 'vaults', vaultId, 'metadata'), (snap) => {
        const metadata = {};
        snap.docs.forEach(d => {
          metadata[d.id] = d.data().data;
        });
        setVaultState(prev => ({
          ...prev,
          tasks: metadata.tasks || [],
          finance: metadata.finance || [],
          reminders: metadata.reminders || [],
          settings: metadata.settings || {}
        }));
      });
    };

    setupListeners();

    return () => {
      if (unsubItems) unsubItems();
      if (unsubPlaylists) unsubPlaylists();
      if (unsubMetadata) unsubMetadata();
    };
  }, [currentUser, authLoading]);

  // --- WRITE ACTIONS ---
  const addItem = async (item, targetCollection = 'items') => {
    if (!currentUser) return;
    const id = item.id || Date.now().toString();
    await setDoc(doc(db, 'vaults', currentUser.uid, targetCollection, id), {
      ...item,
      id,
      updatedAt: serverTimestamp()
    });
  };

  const updateItem = async (id, updates, targetCollection = 'items') => {
    if (!currentUser) return;
    await setDoc(doc(db, 'vaults', currentUser.uid, targetCollection, id), {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const deleteItem = async (id, targetCollection = 'items') => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'vaults', currentUser.uid, targetCollection, id));
  };

  const updateMetadata = async (collectionName, data) => {
    if (!currentUser) return;
    await setDoc(doc(db, 'vaults', currentUser.uid, 'metadata', collectionName), {
      data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  // Add item to playlist logic
  const addItemToPlaylist = async (playlistId, item) => {
    if (!currentUser) return;
    const playlist = vaultState.playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const itemsInPlaylist = playlist.items || [];
    if (itemsInPlaylist.find(i => i.id === item.id)) return; // Already in

    await updateItem(playlistId, {
      items: [...itemsInPlaylist, item],
      itemCount: itemsInPlaylist.length + 1
    }, 'playlists');
  };

  const filteredItems = vaultState.items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      (item.title?.toLowerCase().includes(q)) ||
      (item.content?.toLowerCase().includes(q)) ||
      (item.url?.toLowerCase().includes(q)) ||
      (item.category?.toLowerCase().includes(q))
    );
  });

  return (
    <WebVaultContext.Provider value={{ 
      ...vaultState, 
      items: searchQuery ? filteredItems : vaultState.items,
      loading,
      addItem,
      updateItem,
      deleteItem,
      updateMetadata,
      searchQuery,
      setSearchQuery,
      addItemToPlaylist
    }}>
      {children}
    </WebVaultContext.Provider>
  );
};

export const useWebVault = () => useContext(WebVaultContext);
