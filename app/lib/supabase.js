import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqelzoakbtjajdduwjou.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZWx6b2FrYnRqYWpkZHV3am91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODAwMjcsImV4cCI6MjA2Mjc1NjAyN30.hUL5kWrg4T7e62KjUklDFGYID4hoGQ6K75x8Aa2LbRA'; // Replace with your actual key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});