import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig, auth } from './firebase'; // ✅ make sure firebase.js exports both
import { signInWithPhoneNumber } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const OTPAuth = () => {
  const [phone, setPhone] = useState('');
  const recaptchaVerifier = useRef(null);
  const navigation = useNavigation();

  const handleSendOTP = async () => {
    try {
      if (!phone || phone.length < 10) {
        Alert.alert('Invalid phone number');
        return;
      }

      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier.current);
      Alert.alert('OTP Sent!', 'Check your phone for the verification code.');
      navigation.navigate('Verify', { confirmation }); // ✅ Pass confirmation object
    } catch (error) {
      console.error('OTP Send Error:', error);
      Alert.alert('Failed to send OTP', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="+216 12 345 678"
        keyboardType="phone-pad"
        onChangeText={setPhone}
        value={phone}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#2e86de',
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
