import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const moods = [
  { emoji: "😊", mood: "happy", color: "#FFD966" },
  { emoji: "😢", mood: "sad", color: "#A1C6EA" },
  { emoji: "😡", mood: "angry", color: "#E57373" },
  { emoji: "😖", mood: "stressed", color: "#C7A589" },
  { emoji: "😨", mood: "anxious", color: "#D7C0DC" },
];

function HomeScreen() {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>HELLO, User 👋</Text>
        <FontAwesome name="user-circle" size={28} color="black" />
      </View>
      <Text style={styles.sectionTitle}>Mood Tracking</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScrollContainer}>
        {moods.map((item, index) => (
          <View key={index} style={[styles.moodItem, { backgroundColor: item.color }]}> 
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.moodText}>{item.mood}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function MainPage() {
  const [activeTab, setActiveTab] = useState("Home");
  const renderScreen = () => {
    switch (activeTab) {
      case "Messages":
        return <Text style={styles.placeholderText}>Messages Screen</Text>;
      case "Calls":
        return <Text style={styles.placeholderText}>Calls Screen</Text>;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setActiveTab("Home")} style={styles.navItem}>
          <FontAwesome name="home" size={24} color={activeTab === "Home" ? "black" : "gray"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Messages")} style={styles.navItem}>
          <FontAwesome name="comment" size={24} color={activeTab === "Messages" ? "black" : "gray"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Calls")} style={styles.navItem}>
          <FontAwesome name="phone" size={24} color={activeTab === "Calls" ? "black" : "gray"} />
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
  screenContainer: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  moodScrollContainer: {
    marginTop: 10,
  },
  moodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginRight: 10,
    borderRadius: 15,
    minWidth: 100,
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
    marginRight: 5,
  },
  moodText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholderText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#BDD1E9",
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    padding: 10,
  },
});
