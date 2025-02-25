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
import ExampleImage from "@/assets/images/example1.png";

export default function VerifyScreen() {
  const [otp, setOtp] = useState("");
  const router = useRouter();  

  return (
    <View style={styles.container}>

      <View style={styles.illustrationContainer}>
        <Image source={ExampleImage} style={styles.illustration} />
      </View>
      
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verification</Text>

        <Text style={styles.label}>OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="XX-XX-XX"
          placeholderTextColor="#A1A1A1"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        
        <TouchableOpacity 
          style={styles.verifyButton} 
          onPress={() => router.push("/mainpage")} 
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>

        {/* Resend Message */}
        <TouchableOpacity>
          <Text style={styles.resendText}>Resend the message</Text>
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
  },
  illustration: {
    width: 403,  
    height: 340, 
    marginTop:40,
    justifyContent:"center",
  },
  verificationContainer: {
    flex: 1.5,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 50,
    padding: 20,
    alignItems: "center",
  },
  verificationTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 20,
    marginTop:15,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    marginTop:15,
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
  verifyButton: {
    backgroundColor: "#A1C6EA",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    marginTop:1,
  },
  verifyButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  resendText: {
    marginTop: 10,
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
  },
});
