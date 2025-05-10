import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const VerifyScreen = () => {
  const [otp, setOtp] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { confirmation } = route.params || {};

  const handleVerify = async () => {
    if (!confirmation) {
      Alert.alert('Error', 'Confirmation object missing.');
      return;
    }

    try {
      await confirmation.confirm(otp);
      Alert.alert('Success', 'Phone number verified!');
      navigation.navigate('tabs'); // Or your home/dashboard screen
    } catch (error) {
      console.error('OTP verification failed:', error);
      Alert.alert('Error', 'Invalid OTP. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="123456"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    height: 50, borderColor: '#ccc', borderWidth: 1,
    marginBottom: 20, paddingHorizontal: 15, borderRadius: 8, fontSize: 16,
  },
  button: {
    backgroundColor: '#34C759', paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
});
