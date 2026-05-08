import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMetadata } from '../services/metadataService';
import { Alert } from 'react-native';

export const VaultContext = createContext();

const initialState = { items: [], loading: true };

function vaultReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        ),
      };
    case 'TOGGLE_BOOKMARK':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload ? { ...item, isBookmarked: !item.isBookmarked } : item
        ),
      };
    case 'ROLLBACK':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

export const VaultProvider = ({ children }) => {
  const [state, dispatch] = useReducer(vaultReducer, initialState);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const stored = await AsyncStorage.getItem('@vault_items');
      if (stored) {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(stored) });
      } else {
        dispatch({ type: 'SET_ITEMS', payload: [] });
      }
    } catch (e) {
      console.error("Failed to load items from storage", e);
      dispatch({ type: 'SET_ITEMS', payload: [] });
    }
  };

  const persistToStorage = async (updatedItems, previousItems) => {
    try {
      await AsyncStorage.setItem('@vault_items', JSON.stringify(updatedItems));
      return true;
    } catch (error) {
      console.error("Failed to persist to storage:", error);
      Alert.alert("Storage Error", "Could not save changes locally. Restoring previous state.");
      dispatch({ type: 'ROLLBACK', payload: previousItems });
      return false;
    }
  };

  const addItem = async (itemData) => {
    let newItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isBookmarked: false,
      ...itemData,
    };

    if (itemData.type === 'link') {
      const metadata = await fetchMetadata(itemData.url);
      newItem = { ...newItem, ...metadata };
      if (itemData.customTitle && itemData.customTitle.trim().length > 0) {
        newItem.title = itemData.customTitle.trim();
      }
    }

    const previousItems = [...state.items];
    const updatedItems = [newItem, ...state.items];
    
    // Optimistic UI Update
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    await persistToStorage(updatedItems, previousItems);
  };

  const deleteItem = async (id) => {
    const previousItems = [...state.items];
    const updatedItems = state.items.filter(item => item.id !== id);
    
    // Optimistic UI Update
    dispatch({ type: 'DELETE_ITEM', payload: id });
    await persistToStorage(updatedItems, previousItems);
  };

  const toggleBookmark = async (id) => {
    const previousItems = [...state.items];
    const updatedItems = state.items.map(item => 
      item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
    );
    
    // Optimistic UI Update
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: id });
    await persistToStorage(updatedItems, previousItems);
  };

  const editItem = async (id, updates) => {
    let finalUpdates = { ...updates };
    
    if (updates.type === 'link' && updates.url) {
      const currentItem = state.items.find(item => item.id === id);
      if (currentItem && currentItem.url !== updates.url) {
        const metadata = await fetchMetadata(updates.url);
        finalUpdates = { ...finalUpdates, ...metadata };
      }
    }
    
    if (updates.type === 'link' && updates.customTitle && updates.customTitle.trim().length > 0) {
      finalUpdates.title = updates.customTitle.trim();
    }

    const previousItems = [...state.items];
    const updatedItems = state.items.map(item =>
      item.id === id ? { ...item, ...finalUpdates } : item
    );

    // Optimistic UI Update
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: finalUpdates } });
    await persistToStorage(updatedItems, previousItems);
  };

  return (
    <VaultContext.Provider value={{ state, addItem, deleteItem, toggleBookmark, editItem, dispatch }}>
      {children}
    </VaultContext.Provider>
  );
};
