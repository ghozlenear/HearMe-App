import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phoneNumber.length < 10) return;

    setLoading(true);
    try {
      // Format phone number with country code (adjust as needed)
      const formattedPhoneNumber = `+91${phoneNumber}`; // Using India as default (+91)
      
      const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
      
      // Navigate to verification screen with confirmation object
      router.push({
        pathname: '/auth/verify',
        params: { 
          verificationId: confirmation.verificationId,
          phoneNumber: formattedPhoneNumber 
        }
      });
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: 'https://cdn.dribbble.com/userupload/12016465/file/original-722f3d8d0d4c8a4f3ba5c6e7a4b9a8c4.png?resize=1024x768' }}
          style={styles.illustration}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>fast access</Text>

        <View style={styles.form}>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (phoneNumber.length < 10 || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={phoneNumber.length < 10 || loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Sending OTP...' : 'Accept and continue'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity>
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupLink}>Signup</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  countryCode: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#A1C6EA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
  },
  signupText: {
    textAlign: 'center',
    color: '#6b7280',
  },
  signupLink: {
    color: '#A1C6EA',
    fontWeight: '600',
  },
});