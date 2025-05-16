import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Index() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('Checking session...'); // Debug log
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Error getting session:', error.message);
        } else {
          console.log('Session data:', data); // Debug log
        }
        
        setUser(data?.session?.user ?? null);
      } catch (e) {
        console.error('Unexpected error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session); // Debug log
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  console.log('Current user state:', user); // Debug log
  console.log('Redirecting to:', user ? '/(tabs)/home' : '/auth/login'); // Debug log

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return <Redirect href='/auth/login'  />;
}