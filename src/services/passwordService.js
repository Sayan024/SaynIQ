import * as SecureStore from 'expo-secure-store';

const PASSWORDS_META_KEY = 'vault_passwords_meta';

// Helper: Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Get the list of password metadata (without actual passwords)
 */
export const getPasswordsList = async () => {
  try {
    const metaString = await SecureStore.getItemAsync(PASSWORDS_META_KEY);
    if (metaString) {
      return JSON.parse(metaString);
    }
    return [];
  } catch (error) {
    console.error('Error fetching password list:', error);
    return [];
  }
};

/**
 * Get a specific password by ID
 */
export const getPasswordValue = async (id) => {
  try {
    return await SecureStore.getItemAsync(`password_val_${id}`);
  } catch (error) {
    console.error('Error fetching password value:', error);
    return null;
  }
};

/**
 * Add a new password entry
 */
export const addPassword = async (title, username, password) => {
  try {
    const id = generateId();
    const timestamp = new Date().toISOString();
    
    // Store metadata (title, username, etc.)
    const currentList = await getPasswordsList();
    const newEntry = { id, title, username, createdAt: timestamp, updatedAt: timestamp };
    currentList.push(newEntry);
    
    // Save metadata list
    await SecureStore.setItemAsync(PASSWORDS_META_KEY, JSON.stringify(currentList));
    // Save actual password securely
    await SecureStore.setItemAsync(`password_val_${id}`, password);
    
    return newEntry;
  } catch (error) {
    console.error('Error adding password:', error);
    throw error;
  }
};

/**
 * Update an existing password entry
 */
export const updatePassword = async (id, title, username, password) => {
  try {
    const timestamp = new Date().toISOString();
    
    const currentList = await getPasswordsList();
    const index = currentList.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Password entry not found');
    
    currentList[index] = { ...currentList[index], title, username, updatedAt: timestamp };
    
    await SecureStore.setItemAsync(PASSWORDS_META_KEY, JSON.stringify(currentList));
    if (password !== undefined) {
      await SecureStore.setItemAsync(`password_val_${id}`, password);
    }
    
    return currentList[index];
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

/**
 * Delete a password entry
 */
export const deletePassword = async (id) => {
  try {
    const currentList = await getPasswordsList();
    const filteredList = currentList.filter(item => item.id !== id);
    
    await SecureStore.setItemAsync(PASSWORDS_META_KEY, JSON.stringify(filteredList));
    await SecureStore.deleteItemAsync(`password_val_${id}`);
  } catch (error) {
    console.error('Error deleting password:', error);
    throw error;
  }
};
