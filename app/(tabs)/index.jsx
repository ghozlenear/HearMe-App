import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';

const moods = [
  { id: 1, emoji: '😢', name: 'Very Sad', color: '#ef4444' },
  { id: 2, emoji: '😔', name: 'Sad', color: '#fb923c' },
  { id: 3, emoji: '😐', name: 'Neutral', color: '#6b7280' },
  { id: 4, emoji: '🙂', name: 'Good', color: '#A1C6EA' },
  { id: 5, emoji: '😄', name: 'Very Happy', color: '#22c55e' },
];

const activities = [
  { id: 1, emoji: '💼', name: 'Work' },
  { id: 2, emoji: '🏋️', name: 'Exercise' },
  { id: 3, emoji: '🛀', name: 'Relaxing' },
  { id: 4, emoji: '🗣️', name: 'Socializing' },
  { id: 5, emoji: '💤', name: 'Sleeping' },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [sliderPosition] = useState(new Animated.Value(0));
  const [showPopup, setShowPopup] = useState(false);
  const popupOpacity = useState(new Animated.Value(0))[0];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    const index = moods.findIndex((m) => m.id === mood.id);
    const step = 100 / (moods.length - 1);

    Animated.spring(sliderPosition, {
      toValue: index * step,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity((prevActivity) =>
      prevActivity?.id === activity.id ? null : activity
    );
  };
  

  const handleSaveMood = () => {
    if (!selectedMood || !selectedActivity) return;

    setShowPopup(true);
    Animated.timing(popupOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(popupOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowPopup(false));
      }, 2000);
    });

    setSelectedMood(null);
    setSelectedActivity(null);
    Animated.timing(sliderPosition, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerPlaceholder} />

      <View style={styles.content}>
        <Text style={styles.greeting}>Hello!</Text>
        <Text style={styles.title}>How are you feeling today?</Text>

        <View style={styles.moodSliderContainer}>
          <View style={styles.emojiContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[styles.emojiButton, selectedMood?.id === mood.id && styles.selectedEmoji]}
                onPress={() => handleMoodSelect(mood)}
              >
                <Text style={styles.emoji}>{mood.emoji}</Text>
                <Text style={[styles.moodText, selectedMood?.id === mood.id && styles.selectedMoodText]}>
                  {mood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <Animated.View
                style={[
                  styles.sliderProgress,
                  {
                    width: sliderPosition.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: selectedMood?.color || '#A1C6EA',
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.sliderThumb,
                  {
                    left: sliderPosition.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '95%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <Text style={styles.subtitle}>Daily Activities</Text>

        <View style={styles.activitiesGrid}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[styles.activityCard, selectedActivity?.id === activity.id && styles.selectedActivityCard]}
              onPress={() => handleActivitySelect(activity)}
            >
              <Text style={styles.activityIcon}>{activity.emoji}</Text>
              <Text style={[styles.activityText, selectedActivity?.id === activity.id && styles.selectedActivityText]}>
                {activity.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (!selectedMood || !selectedActivity) && styles.saveButtonDisabled]}
          disabled={!selectedMood || !selectedActivity}
          onPress={handleSaveMood}
        >
          <Text style={styles.saveButtonText}>Save Today's Entry</Text>
        </TouchableOpacity>

        {showPopup && (
          <Animated.View style={[styles.popup, { opacity: popupOpacity }]}>
            <Text style={styles.popupText}>✅ Mood & Activity Saved!</Text>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#ECEEFE',
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#6b7280',
  },
  moodSliderContainer: {
    height: 160,
    marginBottom: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  emojiButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
  selectedEmoji: {
    backgroundColor: '#fff',
    elevation: 3,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  selectedMoodText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sliderTrack: {
    width: '90%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    position: 'relative',
  },
  sliderProgress: {
    position: 'absolute',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#A1C6EA',
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#A1C6EA',
    marginTop: -9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedActivityCard: {
    backgroundColor: '#A1C6EA',
  },
  saveButton: {
    backgroundColor: '#A1C6EA',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  saveButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
 popup: {
  position: 'absolute',
  top: 20, 
  left: '10%',
  right: '10%',
  backgroundColor: '#22c55e',
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3.84,
},

  popupText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

