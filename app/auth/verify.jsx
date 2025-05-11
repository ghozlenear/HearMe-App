import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function Verify() {
  const { verificationId, phoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30); // Resend OTP cooldown

  // Handle OTP submission
  const confirmCode = async () => {
    if (code.length !== 6) return;

    setLoading(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      await auth().signInWithCredential(credential);
      
      Alert.alert('Success', 'You are now logged in!');
      router.replace('/home'); // Navigate to home after login
    } catch (error) {
      Alert.alert('Error', 'Invalid or expired OTP. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setResendLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      Alert.alert('OTP Resent', 'A new OTP has been sent to your phone.');
      setCountdown(30); // Reset cooldown
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResendLoading(false);
    }
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {phoneNumber}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, (code.length !== 6 || loading) && styles.buttonDisabled]}
        onPress={confirmCode}
        disabled={code.length !== 6 || loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={resendOTP}
        disabled={countdown > 0 || resendLoading}>
        <Text style={styles.resendText}>
          {countdown > 0 
            ? `Resend OTP in ${countdown}s` 
            : resendLoading ? 'Sending...' : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#A1C6EA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resendText: {
    marginTop: 20,
    color: '#A1C6EA',
    textAlign: 'center',
  },
});