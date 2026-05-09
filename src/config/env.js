// Use EXPO_PUBLIC_ prefix so it's accessible within the Expo app
export const ENV = {
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
};
