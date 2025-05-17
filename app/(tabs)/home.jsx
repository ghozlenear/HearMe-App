import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, FlatList, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const headerImage = require('../../assets/images/pic.png');

const moods = [
  { id: 1, name: 'Very Good', icon: 'weather-sunny', color: '#FF9F1C' },
  { id: 2, name: 'Good', icon: 'white-balance-sunny', color: '#2EC4B6' },
  { id: 3, name: 'Okay', icon: 'weather-partly-cloudy', color: '#5F7ADB' },
  { id: 4, name: 'Bad', icon: 'weather-rainy', color: '#E71D36' },
];

const activities = [
  { id: 1, icon: 'moon-waning-crescent', name: 'Sleep', color: '#6A4C93' },
  { id: 2, icon: 'dumbbell', name: 'Exercise', color: '#1982C4' },
  { id: 3, icon: 'account-group', name: 'Social', color: '#8AC926' },
  { id: 4, icon: 'laptop', name: 'Work', color: '#FF595E' },
  { id: 5, icon: 'spa', name: 'Relaxation', color: '#6A4C93' },
  { id: 6, icon: 'palette', name: 'Hobbies', color: '#FFCA3A' },
  { id: 7, icon: 'yoga', name: 'Meditation', color: '#1982C4' },
];

export default function WellbeingTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      name: 'Ghozlene',
      rating: 5,
      text: 'jdrr habit',
      date: '3 minute ago'
    },
    {
      id: 2,
      name: 'chiraz',
      rating: 4,
      text: 'mlaha mlaha',
      date: '2 days ago'
    },
    {
      id: 3,
      name: 'gh',
      rating: 3,
      text: 'haba nkemel',
      date: '3 days ago'
    }
  ]);
  const popupOpacity = useState(new Animated.Value(0))[0];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivities(prev => 
      prev.some(a => a.id === activity.id) 
        ? prev.filter(a => a.id !== activity.id)
        : [...prev, activity]
    );
  };

  const handleSaveMood = () => {
    if (!selectedMood || selectedActivities.length === 0) return;

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
    setSelectedActivities([]);
  };

  const handleAddReview = () => {
    if (userReview.trim() && userRating > 0) {
      if (editingReview) {
// Update existing review
        setFeedbacks(prev => prev.map(review => 
          review.id === editingReview.id 
            ? { ...review, text: userReview, rating: userRating, date: 'Edited now' }
            : review
        ));
      } else {
// Add new review
        const newReview = {
          id: Date.now(),
          name: 'You',
          rating: userRating,
          text: userReview,
          date: 'Just now'
        };
        setFeedbacks(prev => [newReview, ...prev]);
      }
      setUserReview('');
      setUserRating(0);
      setEditingReview(null);
      setShowReviewModal(false);
    }
  };

  const handleEditReview = (review) => {
    setUserReview(review.text);
    setUserRating(review.rating);
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => 
          setFeedbacks(prev => prev.filter(r => r.id !== reviewId))
        }
      ]
    );
  };

  const renderStars = (rating) => (
    <View style={styles.starContainer}>
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          name={i < rating ? 'star' : 'star-outline'}
          size={20}
          color={i < rating ? '#FFD700' : '#E5E7EB'}
        />
      ))}
    </View>
  );

  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      {[1,2,3,4,5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
          <Icon
            name={star <= userRating ? 'star' : 'star-outline'}
            size={32}
            color={star <= userRating ? '#FFD700' : '#E5E7EB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Image source={headerImage} style={styles.headerImage} resizeMode="cover" />
          <View style={styles.headerOverlay} />
          <View style={styles.headerTextContainer}>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.title}>How are you feeling today?</Text>

          <View style={styles.moodButtonsContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodButton,
                  selectedMood?.id === mood.id && {
                    backgroundColor: mood.color + '20',
                    borderColor: mood.color,
                  }
                ]}
                onPress={() => handleMoodSelect(mood)}
              >
                <Icon name={mood.icon} size={32} color={mood.color} />
                <Text style={[
                  styles.moodButtonText,
                  selectedMood?.id === mood.id && { color: mood.color }
                ]}>
                  {mood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.activityTitle}>Daily Activities</Text>
          <Text style={styles.subtitle}>What have you been up to?</Text>

          <View style={styles.activitiesGrid}>
            {activities.map((activity) => {
              const isSelected = selectedActivities.some(a => a.id === activity.id);
              return (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    { 
                      backgroundColor: isSelected ? activity.color + '30' : activity.color + '10',
                      borderColor: isSelected ? activity.color : activity.color + '30'
                    }
                  ]}
                  onPress={() => handleActivitySelect(activity)}
                >
                  <Icon 
                    name={activity.icon} 
                    size={24} 
                    color={isSelected ? activity.color : activity.color + 'A0'} 
                  />
                  <Text style={[
                    styles.activityText,
                    { color: isSelected ? activity.color : activity.color + 'A0' },
                    isSelected && { fontWeight: '600' }
                  ]}>
                    {activity.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton, 
              (!selectedMood || selectedActivities.length === 0) && styles.saveButtonDisabled
            ]}
            disabled={!selectedMood || selectedActivities.length === 0}
            onPress={handleSaveMood}
          >
            <Icon name="bookmark-check" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Today's Entry</Text>
          </TouchableOpacity>


          <View style={styles.feedbackSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                  <Icon name="plus-circle" size={24} color="#A1C6EA" style={styles.addIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={feedbacks}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.feedbackList}
              renderItem={({ item }) => (
                <View style={styles.feedbackCard}>
                  {item.name === 'You' && (
                    <View style={styles.reviewActions}>
                      <TouchableOpacity onPress={() => handleEditReview(item)}>
                        <Icon name="pencil" size={18} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteReview(item.id)}>
                        <Icon name="trash-can-outline" size={18} color="#e11d48" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={styles.userHeader}>
                    <View style={styles.avatar}>
                      <Icon name="account" size={24} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.feedbackDate}>{item.date}</Text>
                    </View>
                  </View>
                  {renderStars(item.rating)}
                  <Text style={styles.feedbackText}>"{item.text}"</Text>
                  <View style={styles.decorativeLine} />
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>


      {showPopup && (
        <Animated.View style={[styles.popup, { opacity: popupOpacity }]}>
          <Icon name="check-circle" size={20} color="#fff" />
          <Text style={styles.popupText}>Entry has been recorded</Text>
        </Animated.View>
      )}

      {showReviewModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingReview ? 'Edit Review' : 'Add Your Review'}
            </Text>
            {renderRatingStars()}
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={userReview}
              onChangeText={setUserReview}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowReviewModal(false);
                  setUserRating(0);
                  setUserReview('');
                  setEditingReview(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddReview}
              >
                <Text style={styles.submitButtonText}>
                  {editingReview ? 'Update' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  headerTextContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
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
  activityTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  moodButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  activityCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activityText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#A1C6EA',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  popup: {
    position: 'absolute',
    top: 40,
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
    flexDirection: 'row',
    gap: 8,
    zIndex: 999,
  },
  popupText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  feedbackSection: {
    marginTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 12,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIcon: {
    marginRight: 12,
  },
  feedbackList: {
    paddingLeft: 8,
  },
  feedbackCard: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    marginBottom: 16, 
    elevation: 3,
    shadowColor: '#6A4C93',
    shadowOffset: { width: 5, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#2EC4B6',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  decorativeLine: {
    height: 3,
    backgroundColor: '#A1C6EA',
    width: '40%',
    borderRadius: 2,
  },
  feedbackText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  reviewActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 12,
    zIndex: 1,
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
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#A1C6EA',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});