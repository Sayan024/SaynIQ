import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * MOCK CLOUD SERVICE
 * In a real-world scenario, this service would communicate with a backend 
 * database (Firebase, Supabase, etc.) to store shared content.
 */

const SHARED_CONTENT_KEY = '@shared_content_registry';

export const cloudService = {
  /**
   * Saves content to the "cloud" and returns a unique short ID.
   */
  saveSharedContent: async (item) => {
    try {
      // Generate a short ID
      const prefix = item.type === 'note' ? 'note' : 'link';
      const randomId = Math.random().toString(36).substring(2, 6);
      const shareId = `${prefix}-${randomId}`;

      // Metadata to store
      const metadata = {
        id: shareId,
        originalId: item.id,
        type: item.type,
        title: item.title,
        category: item.category,
        text: item.text,
        url: item.url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock save to local storage (simulating a cloud database)
      const registryStr = await AsyncStorage.getItem(SHARED_CONTENT_KEY);
      const registry = registryStr ? JSON.parse(registryStr) : {};
      
      registry[shareId] = metadata;
      await AsyncStorage.setItem(SHARED_CONTENT_KEY, JSON.stringify(registry));

      return shareId;
    } catch (error) {
      console.error('Cloud Save Error:', error);
      throw error;
    }
  },

  /**
   * Fetches content from the "cloud" using a share ID.
   */
  getSharedContent: async (shareId) => {
    try {
      // Mock fetch from local storage
      const registryStr = await AsyncStorage.getItem(SHARED_CONTENT_KEY);
      const registry = registryStr ? JSON.parse(registryStr) : {};
      
      const content = registry[shareId];
      
      if (!content) {
        // For demonstration, if not found locally, we'll return a mock object
        // mimicking a successful fetch from a real server.
        return null;
      }

      return content;
    } catch (error) {
      console.error('Cloud Fetch Error:', error);
      return null;
    }
  },

  /**
   * Updates existing shared content if the original is edited.
   */
  updateSharedContent: async (shareId, updates) => {
    try {
      const registryStr = await AsyncStorage.getItem(SHARED_CONTENT_KEY);
      const registry = registryStr ? JSON.parse(registryStr) : {};
      
      if (registry[shareId]) {
        registry[shareId] = { 
          ...registry[shareId], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        await AsyncStorage.setItem(SHARED_CONTENT_KEY, JSON.stringify(registry));
      }
    } catch (error) {
      console.error('Cloud Update Error:', error);
    }
  }
};
