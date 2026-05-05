import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMetadata } from '../services/metadataService';

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

    const updatedItems = [newItem, ...state.items];
    try {
      await AsyncStorage.setItem('@vault_items', JSON.stringify(updatedItems));
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    } catch (e) {
      console.error("Failed to save item", e);
    }
  };

  const deleteItem = async (id) => {
    const updatedItems = state.items.filter(item => item.id !== id);
    try {
      await AsyncStorage.setItem('@vault_items', JSON.stringify(updatedItems));
      dispatch({ type: 'DELETE_ITEM', payload: id });
    } catch(e) {
      console.error("Failed to delete item", e);
    }
  }

  const toggleBookmark = async (id) => {
    const updatedItems = state.items.map(item => 
      item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
    );
    try {
      await AsyncStorage.setItem('@vault_items', JSON.stringify(updatedItems));
      dispatch({ type: 'TOGGLE_BOOKMARK', payload: id });
    } catch(e) {
      console.error("Failed to toggle bookmark", e);
    }
  }

  const editItem = async (id, updates) => {
    let finalUpdates = { ...updates };
    
    // If the URL changed, fetch new metadata
    if (updates.type === 'link' && updates.url) {
      const currentItem = state.items.find(item => item.id === id);
      if (currentItem && currentItem.url !== updates.url) {
        const metadata = await fetchMetadata(updates.url);
        finalUpdates = { ...finalUpdates, ...metadata };
      }
    }
    
    // Always apply custom title override if provided for links
    if (updates.type === 'link' && updates.customTitle && updates.customTitle.trim().length > 0) {
      finalUpdates.title = updates.customTitle.trim();
    }

    const updatedItems = state.items.map(item =>
      item.id === id ? { ...item, ...finalUpdates } : item
    );

    try {
      await AsyncStorage.setItem('@vault_items', JSON.stringify(updatedItems));
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: finalUpdates } });
    } catch (e) {
      console.error("Failed to update item", e);
    }
  };

  return (
    <VaultContext.Provider value={{ state, addItem, deleteItem, toggleBookmark, editItem, dispatch }}>
      {children}
    </VaultContext.Provider>
  );
};
