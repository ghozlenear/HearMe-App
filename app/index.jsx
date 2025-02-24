import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Image } from "react-native";
import { useRouter } from "expo-router";
import ExampleImages from "@/assets/images/example-9.png";



export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
   
       <View style={styles.topSection}>
         <Image source={ExampleImages} style={styles.illustration} />
       </View>

      
      <View style={styles.bottomSection}>
        <Text style={styles.loginTitle}>Login</Text>

        <Text style={styles.label}>Fast access</Text>
        <TextInput
          style={styles.input}
          placeholder="0X-XX-XX-XX-XX"
          placeholderTextColor="#A1A1A1"
          keyboardType="numeric"
          maxLength={10}
        />

       
        <TouchableOpacity style={styles.button} onPress={() => router.push("/verify")}>
          <Text style={styles.buttonText}>Accept and continue</Text>
        </TouchableOpacity>

        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>

        
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Signup</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECEEFE",
  },
  topSection: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
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

  bottomSection: {
    flex: 2,
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
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
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
  },
  button: {
    backgroundColor: "#A1C6EA",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#CCC",
  },
  orText: {
    marginHorizontal: 10,
    color: "#888",
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    color: "#4A90E2",
    fontWeight: "bold",
  },
});
