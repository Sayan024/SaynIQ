import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMetadata } from '../services/metadataService';
import { Alert } from 'react-native';
import { THEMES, buildTheme, loadThemeName, saveThemeName } from '../styles/theme';
import { scheduleReminder, cancelReminder } from '../services/reminderService';


export const VaultContext = createContext();

const initialState = { 
  items: [], 
  tasks: [],
  timeLogs: [],
  appStreak: 1,
  loading: true,
  themeName: 'Drops Purple',
  theme: buildTheme('Drops Purple')
};

function vaultReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SET_READY':
      return { ...state, loading: false };

    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_TIME_LOGS':
      return { ...state, timeLogs: action.payload };
    case 'SET_APP_STREAK':
      return { ...state, appStreak: action.payload };
    case 'SET_THEME':
      return { ...state, themeName: action.payload, theme: buildTheme(action.payload) };
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
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
    case 'ADD_TIME_LOG':
      return { ...state, timeLogs: [action.payload, ...state.timeLogs] };
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
    initialize();
  }, []);

  const initialize = async () => {
    const [items, tasks, logs, themeName, lastDate, savedStreak] = await Promise.all([
      AsyncStorage.getItem('@vault_items'),
      AsyncStorage.getItem('@tasks_data'),
      AsyncStorage.getItem('@time_logs_data'),
      loadThemeName(),
      AsyncStorage.getItem('@last_open_date'),
      AsyncStorage.getItem('@app_streak')
    ]);
    
    if (items) dispatch({ type: 'SET_ITEMS', payload: JSON.parse(items) });
    else dispatch({ type: 'SET_ITEMS', payload: [] });

    if (tasks) dispatch({ type: 'SET_TASKS', payload: JSON.parse(tasks) });
    else dispatch({ type: 'SET_TASKS', payload: [] });

    if (logs) dispatch({ type: 'SET_TIME_LOGS', payload: JSON.parse(logs) });
    else dispatch({ type: 'SET_TIME_LOGS', payload: [] });
    
    // Streak Logic
    const today = new Date().toDateString();
    let newStreak = savedStreak ? parseInt(savedStreak) : 1;
    
    if (lastDate && lastDate !== today) {
      const last = new Date(lastDate);
      const diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        newStreak += 1;
      } else if (diff > 1) {
        newStreak = 1;
      }
      await AsyncStorage.setItem('@app_streak', newStreak.toString());
    }
    await AsyncStorage.setItem('@last_open_date', today);
    dispatch({ type: 'SET_APP_STREAK', payload: newStreak });

    dispatch({ type: 'SET_THEME', payload: themeName });
    dispatch({ type: 'SET_READY' });
  };





  useEffect(() => {
    if (!state.loading) {
      saveData();
    }
  }, [state.items, state.tasks, state.timeLogs]);

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('@vault_items', JSON.stringify(state.items)),
        AsyncStorage.setItem('@tasks_data', JSON.stringify(state.tasks)),
        AsyncStorage.setItem('@time_logs_data', JSON.stringify(state.timeLogs))
      ]);
    } catch (e) {
      console.error("Critical: Storage Save Error", e);
    }
  };

  const setTheme = async (name) => {
    dispatch({ type: 'SET_THEME', payload: name });
    await saveThemeName(name);
  };

  const addItem = async (itemData) => {

    let newItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isBookmarked: false,
      ...itemData,
    };

    if (itemData.type === 'link') {
      try {
        const metadata = await fetchMetadata(itemData.url);
        newItem = { ...newItem, ...metadata };
      } catch (e) {
        console.warn("Metadata fetch failed", e);
      }
      if (itemData.title && itemData.title.trim().length > 0) {
        newItem.title = itemData.title.trim();
      }
    }

    if (newItem.reminderDate) {
      try {
        const nid = await scheduleReminder(newItem.id, newItem.title, newItem.type === 'note' ? newItem.text : newItem.url, newItem.reminderDate);
        newItem.notificationId = nid;
      } catch (error) {
        console.error("Non-critical: Reminder schedule failed during add", error);
        // We continue because we still want to save the note/link even if the reminder fails
      }
    }
    
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };



  const deleteItem = async (id) => {
    const itemToDelete = state.items.find(item => item.id === id);
    if (itemToDelete?.notificationId) {
      await cancelReminder(itemToDelete.notificationId);
    }
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };

  const toggleBookmark = async (id) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: id });
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
    
    if (updates.type === 'link' && updates.title && updates.title.trim().length > 0) {
      finalUpdates.title = updates.title.trim();
    }

    const currentItem = state.items.find(item => item.id === id);
    if (finalUpdates.reminderDate && finalUpdates.reminderDate !== currentItem?.reminderDate) {
      try {
        if (currentItem?.notificationId) await cancelReminder(currentItem.notificationId);
        const nid = await scheduleReminder(id, finalUpdates.title || currentItem.title, finalUpdates.text || currentItem.text || currentItem.url, finalUpdates.reminderDate);
        finalUpdates.notificationId = nid;
      } catch (error) {
        console.error("Non-critical: Reminder update failed", error);
      }
    }

    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: finalUpdates } });
  };



  return (
    <VaultContext.Provider value={{ 
      state, addItem, deleteItem, toggleBookmark, editItem, setTheme, dispatch 
    }}>
      {children}
    </VaultContext.Provider>
  );
};

