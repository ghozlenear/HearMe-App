import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  FlatList,
  TextInput,
  Alert,
  Dimensions,
  LinearGradient,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import { saveMood } from '../services/moodService';
import { saveActivitiesToMood } from '../services/activityService';
import {
  fetchFeedbacks,
  submitFeedback,
  deleteFeedback,
} from '../services/feedbackService';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const MOODS = [
  { 
    id: 1, 
    name: 'Very Good', 
    icon: 'emoticon-excited-outline', 
    color: '#4CAF50',
    scale: 5,
    lightColor: '#E8F5E9'
  },
  { 
    id: 2, 
    name: 'Good', 
    icon: 'emoticon-happy-outline', 
    color: '#8BC34A',
    scale: 4,
    lightColor: '#F1F8E9'
  },
  { 
    id: 3, 
    name: 'Okay', 
    icon: 'emoticon-neutral-outline', 
    color: '#FFC107',
    scale: 3,
    lightColor: '#FFF8E1'
  },
  { 
    id: 4, 
    name: 'Bad', 
    icon: 'emoticon-sad-outline', 
    color: '#FF5722',
    scale: 2,
    lightColor: '#FBE9E7'
  },
  { 
    id: 5, 
    name: 'Very Bad', 
    icon: 'emoticon-cry-outline', 
    color: '#F44336',
    scale: 1,
    lightColor: '#FFEBEE'
  },
];

const ACTIVITIES = [
  { 
    id: 1, 
    icon: 'moon-waning-crescent', 
    name: 'Sleep', 
    color: '#673AB7',
    lightColor: '#EDE7F6',
    recommendedMoods: [3, 4, 5] 
  },
  { 
    id: 2, 
    icon: 'dumbbell', 
    name: 'Exercise', 
    color: '#2196F3',
    lightColor: '#E3F2FD',
    recommendedMoods: [1, 2] 
  },
  { 
    id: 3, 
    icon: 'account-group', 
    name: 'Social', 
    color: '#009688',
    lightColor: '#E0F2F1',
    recommendedMoods: [1, 2] 
  },
  { 
    id: 4, 
    icon: 'laptop', 
    name: 'Work', 
    color: '#607D8B',
    lightColor: '#ECEFF1',
    recommendedMoods: [1, 2, 3] 
  },
  { 
    id: 5, 
    icon: 'spa', 
    name: 'Relaxation', 
    color: '#8E24AA',
    lightColor: '#F3E5F5',
    recommendedMoods: [3, 4, 5] 
  },
  { 
    id: 6, 
    icon: 'palette', 
    name: 'Hobbies', 
    color: '#00BCD4',
    lightColor: '#E0F7FA',
    recommendedMoods: [1, 2] 
  },
  { 
    id: 7, 
    icon: 'yoga', 
    name: 'Meditation', 
    color: '#3F51B5',
    lightColor: '#E8EAF6',
    recommendedMoods: [3, 4, 5] 
  },
  { 
    id: 8, 
    icon: 'music', 
    name: 'Music', 
    color: '#E91E63',
    lightColor: '#FCE4EC',
    recommendedMoods: [1, 2, 3, 4, 5] 
  },
  { 
    id: 9, 
    icon: 'food', 
    name: 'Eating', 
    color: '#FF9800',
    lightColor: '#FFF3E0',
    recommendedMoods: [1, 2, 3] 
  },
];

export default function WellbeingTracker() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupOpacity] = useState(new Animated.Value(0));
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scaleAnimation] = useState(new Animated.Value(0));
  const [cardScale] = useState(new Animated.Value(1));

  useEffect(() => {
    loadFeedbacks();
    if (selectedMood) {
      Animated.spring(scaleAnimation, {
        toValue: selectedMood.scale,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    }

    // Check authentication status
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('Auth error:', error);
      
      if (!user) {
        console.log('No user found, redirecting to login');
        router.replace('/auth/login');
        return;
      }
    };
    
    checkAuth();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMoodSelect = async (mood) => {
    animatePress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedMood(mood);
    
    Animated.spring(scaleAnimation, {
      toValue: mood.scale,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
    
    setSelectedActivities(prev => 
      prev.filter(activity => 
        ACTIVITIES.find(a => a.id === activity.id)?.recommendedMoods.includes(mood.id)
      )
    );
  };

  const handleActivitySelect = (activity) => {
    animatePress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!selectedMood) {
      Alert.alert('Select Mood', 'Please select your mood first');
      return;
    }

    if (!activity.recommendedMoods.includes(selectedMood.id)) {
      Alert.alert(
        'Activity Not Recommended',
        `This activity might not be the best for your current mood. Would you still like to add it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Anyway',
            onPress: () => toggleActivity(activity)
          }
        ]
      );
      return;
    }

    toggleActivity(activity);
  };

  const toggleActivity = (activity) => {
    setSelectedActivities(prev =>
      prev.some(a => a.id === activity.id)
        ? prev.filter(a => a.id !== activity.id)
        : [...prev, activity]
    );
  };

  const handleSaveMood = async () => {
    if (!selectedMood || selectedActivities.length === 0) {
      Alert.alert('Incomplete', 'Please select both mood and activities');
      return;
    }

    try {
      // Check authentication again before saving
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to save your mood');
        router.replace('/auth/login');
        return;
      }

      console.log('Saving mood:', selectedMood);
      const moodEntry = await saveMood(selectedMood);
      console.log('Mood saved successfully:', moodEntry);
      
      console.log('Saving activities:', selectedActivities);
      await saveActivitiesToMood(moodEntry.id, selectedActivities);
      console.log('Activities saved successfully');
      
      showSuccessPopup();
      
      // Reset state and animation
      setSelectedMood(null);
      setSelectedActivities([]);
      Animated.timing(scaleAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } catch (err) {
      console.error('Error saving mood and activities:', err);
      Alert.alert('Error', 'Failed to save mood entry: ' + err.message);
    }
  };

  const showSuccessPopup = () => {
    setShowPopup(true);
    Animated.sequence([
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => setShowPopup(false));
  };

  const handleReviewSubmit = async () => {
    if (!userReview.trim() || userRating === 0) {
      Alert.alert('Incomplete', 'Please provide both rating and review');
      return;
    }

    try {
      if (editingReview) {
        await submitFeedback(userRating, userReview);
        setFeedbacks(prev =>
          prev.map(f =>
            f.id === editingReview.id
              ? { ...f, text: userReview, rating: userRating }
              : f
          )
        );
      } else {
        await submitFeedback(userRating, userReview);
        const now = new Date();
        setFeedbacks(prev => [{
          id: Date.now().toString(),
          name: 'You',
          text: userReview,
          rating: userRating,
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }, ...prev]);
      }

      resetReviewForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
      console.error(error);
    }
  };

  const resetReviewForm = () => {
    setUserReview('');
    setUserRating(0);
    setEditingReview(null);
    setShowReviewModal(false);
  };

  const handleEditReview = (review) => {
    setUserReview(review.text);
    setUserRating(review.rating);
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFeedback(reviewId);
              setFeedbacks(prev => prev.filter(f => f.id !== reviewId));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete review');
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={16}
          color={star <= rating ? '#FFC107' : '#e5e7eb'}
        />
      ))}
    </View>
  );

  const renderRatingInput = () => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          onPress={() => setUserRating(star)}
          style={styles.starButton}
        >
          <Icon
            name={star <= userRating ? 'star' : 'star-outline'}
            size={32}
            color={star <= userRating ? '#FFC107' : '#e5e7eb'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <View>
          <Text style={styles.feedbackName}>{item.name}</Text>
          <Text style={styles.feedbackDate}>{item.date} • {item.time}</Text>
        </View>
        {item.name === 'You' && (
          <View style={styles.feedbackActions}>
            <TouchableOpacity 
              onPress={() => handleEditReview(item)}
              style={styles.actionButton}
            >
              <Icon name="pencil" size={18} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteReview(item.id)}
              style={styles.actionButton}
            >
              <Icon name="trash-can-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {renderStars(item.rating)}
      <Text style={styles.feedbackText}>{item.text}</Text>
    </View>
  );

  const renderMoodItem = ({ item }) => {
    const isSelected = selectedMood?.id === item.id;
    
    return (
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
        <TouchableOpacity
          onPress={() => handleMoodSelect(item)}
          style={[
            styles.moodCard,
            { backgroundColor: isSelected ? item.color : item.lightColor },
            isSelected && styles.selectedMoodCard,
          ]}
        >
          <Icon 
            name={item.icon} 
            size={32} 
            color={isSelected ? '#fff' : item.color} 
          />
          <Text style={[
            styles.moodText,
            { color: isSelected ? '#fff' : item.color }
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderActivityItem = ({ item }) => {
    const isSelected = selectedActivities.some(a => a.id === item.id);
    const isRecommended = selectedMood && item.recommendedMoods.includes(selectedMood.id);

    return (
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
        <TouchableOpacity
          onPress={() => handleActivitySelect(item)}
          style={[
            styles.activityCard,
            { backgroundColor: isSelected ? item.color : item.lightColor },
            isSelected && styles.selectedActivityCard,
            !isRecommended && selectedMood && styles.notRecommendedActivity
          ]}
        >
          <Icon 
            name={item.icon} 
            size={24} 
            color={isSelected ? '#fff' : item.color} 
          />
          <Text style={[
            styles.activityText,
            { color: isSelected ? '#fff' : item.color }
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>Track your mood and activities</Text>
        </View>

        <View style={styles.moodSection}>
          <View style={styles.moodScale}>
            <Animated.View 
              style={[
                styles.moodScaleFill,
                { 
                  width: scaleAnimation.interpolate({
                    inputRange: [1, 5],
                    outputRange: ['20%', '100%']
                  }),
                  backgroundColor: selectedMood?.color || '#e5e7eb'
                }
              ]} 
            />
          </View>
          <FlatList
            horizontal
            data={MOODS}
            renderItem={renderMoodItem}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodList}
          />
        </View>

        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>What are you up to?</Text>
          <View style={styles.activitiesGrid}>
            {ACTIVITIES.map(activity => (
              <View key={activity.id} style={styles.activityWrapper}>
                {renderActivityItem({ item: activity })}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedMood || selectedActivities.length === 0) && styles.saveButtonDisabled
            ]}
            onPress={handleSaveMood}
            disabled={!selectedMood || selectedActivities.length === 0}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedbackSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Reviews</Text>
            <TouchableOpacity 
              onPress={() => setShowReviewModal(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Review</Text>
              <Icon name="plus" size={20} color="#60A5FA" />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={feedbacks}
            renderItem={renderFeedbackItem}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.feedbackList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No reviews yet.</Text>
            }
          />
        </View>
      </ScrollView>

      {showReviewModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReview ? 'Edit Review' : 'Add Review'}
              </Text>
              <TouchableOpacity 
                onPress={resetReviewForm}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {renderRatingInput()}
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review..."
              multiline
              value={userReview}
              onChangeText={setUserReview}
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!userReview.trim() || !userRating) && styles.submitButtonDisabled
              ]}
              onPress={handleReviewSubmit}
              disabled={!userReview.trim() || !userRating}
            >
              <Text style={styles.submitButtonText}>
                {editingReview ? 'Update' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showPopup && (
        <Animated.View style={[styles.popup, { opacity: popupOpacity }]}>
          <BlurView intensity={80} style={styles.popupBlur}>
            <Icon name="check-circle" size={24} color="#fff" />
            <Text style={styles.popupText}>Entry Saved!</Text>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  moodSection: {
    marginBottom: 32,
  },
  moodScale: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 20,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  moodScaleFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#A1C6EA',
  },
  moodList: {
    paddingVertical: 8,
  },
  moodCard: {
    width: width * 0.35,
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  selectedMoodCard: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
    elevation: 5,
  },
  moodText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  activityWrapper: {
    width: '33.33%',
    padding: 6,
  },
  activityCard: {
    aspectRatio: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  selectedActivityCard: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.15,
    elevation: 4,
  },
  notRecommendedActivity: {
    opacity: 0.5,
  },
  activityText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#A1C6EA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  popup: {
    position: 'absolute',
    top: 60,
    left: '10%',
    right: '10%',
    alignItems: 'center',
  },
  popupBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#A1C6EA',
  },
  popupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2EC4B6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackList: {
    paddingRight: 20,
  },
  feedbackCard: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});