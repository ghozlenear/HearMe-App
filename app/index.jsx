import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image  
} from "react-native";
import { useRouter } from "expo-router";
import ExampleImage from "@/assets/images/logo.png";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* Illustration Section */}
      <View style={styles.illustrationContainer}>
        <Image source={ExampleImage} style={styles.illustration} />
      </View>

      {/* Login Section */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Login</Text>

        <Text style={styles.label}>Fast access</Text>
        <TextInput
          style={styles.input}
          placeholder="0X-XX-XX-XX-XX"
          placeholderTextColor="#A1A1A1"
          keyboardType="numeric"
          maxLength={10}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/verify")}>
          <Text style={styles.loginButtonText}>Accept and continue</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Signup Text */}
        <TouchableOpacity>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Signup</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECEEFE",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width:"100%",
  },
  illustration: {
    width: "40%",  
    height: 240,   
    marginTop: 20, 
  },
  loginContainer: {
    flex: 1.5,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 50,
    padding: 20,
    alignItems: "center",

  },
  loginTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 20,
    marginTop: 15,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 0,
    marginTop: 15,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    marginTop:15,
  },
  loginButton: {
    backgroundColor: "#A1C6EA",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    marginTop:1,
  },
  loginButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    marginTop:40,
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#CCC",
    //marginTop:40,
  },
  orText: {
    marginHorizontal: 10,
    color: "#888",
    //marginTop:40,
  },
  signupText: {
    fontSize: 14,
    color: "#666",
    marginTop:40,
  },
  signupLink: {
    color: "#4A90E2",
    fontWeight: "bold",
  },
});

