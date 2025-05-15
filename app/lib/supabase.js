import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const storage = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore read error:', e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore write error:', e);
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore delete error:', e);
    }
  }
};

const supabaseUrl = 'https://mqelzoakbtjajdduwjou.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZWx6b2FrYnRqYWpkZHV3am91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODAwMjcsImV4cCI6MjA2Mjc1NjAyN30.hUL5kWrg4T7e62KjUklDFGYID4hoGQ6K75x8Aa2LbRA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
