import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, ArrowLeft, Phone, X, CreditCard } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ChatMessage = ({ message, isUser }) => (
  <View
    style={[
      styles.messageContainer,
      isUser ? styles.userMessage : styles.botMessage,
    ]}>
    <Text style={[styles.messageText, isUser && styles.userMessageText]}>
      {message}
    </Text>
  </View>
);

export default function ChatBot() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      text: "Hi, how you feeling today",
      isUser: false,
    },
  ]);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  // Credit card form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  
  // Animation values
  const subscriptionAnimation = useRef(new Animated.Value(0)).current;
  const paymentAnimation = useRef(new Animated.Value(0)).current;
  const messageAnimation = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (message.trim()) {
      // Animate new message
      messageAnimation.setValue(50);
      Animated.spring(messageAnimation, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      setMessages((prev) => [...prev, { text: message, isUser: true }]);
      setMessage('');
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        messageAnimation.setValue(50);
        Animated.spring(messageAnimation, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        setMessages((prev) => [...prev, { 
          text: "I understand. Would you like to talk more about that?", 
          isUser: false 
        }]);
      }, 1000);
    }
  };

  const handleCallTherapist = () => {
    setShowSubscription(true);
    Animated.timing(subscriptionAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSubscriptionSelect = () => {
    // Animate subscription modal out
    Animated.timing(subscriptionAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSubscription(false);
      setShowPayment(true);
      // Animate payment modal in
      Animated.timing(paymentAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handlePaymentComplete = () => {
    // Animate payment modal out
    Animated.timing(paymentAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPayment(false);
      // Here you would typically handle the actual payment processing
      // and then connect to a real therapist
    });
  };
  
  const closeSubscriptionModal = () => {
    Animated.timing(subscriptionAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSubscription(false);
    });
  };
  
  const closePaymentModal = () => {
    Animated.timing(paymentAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPayment(false);
    });
  };
  
  const formatCardNumber = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Format as XXXX XXXX XXXX XXXX
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };
  
  const formatExpiryDate = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const subscriptionTranslateY = subscriptionAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  
  const subscriptionOpacity = subscriptionAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const paymentTranslateY = paymentAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  
  const paymentOpacity = paymentAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.therapistInfo}>
          <Image 
            source={require('../../assets/images/chat.png')}
            style={styles.therapistAvatar}
          />
          <View>
            <Text style={styles.therapistName}>Your Therapist</Text>
            <Text style={styles.therapistSubtitle}>AI-powered</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleCallTherapist}>
          <Phone size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <Animated.View 
            key={index} 
            style={[
              index === messages.length - 1 ? { transform: [{ translateY: messageAnimation }] } : null
            ]}>
            <ChatMessage message={msg.text} isUser={msg.isUser} />
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Start The Conversation..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Subscription Modal */}
      <Modal
        visible={showSubscription}
        transparent={true}
        animationType="none"
        onRequestClose={closeSubscriptionModal}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [{ translateY: subscriptionTranslateY }],
                opacity: subscriptionOpacity
              }
            ]}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeSubscriptionModal}>
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Subscription</Text>
            <Text style={styles.modalSubtitle}>To Contact A Real Therapist</Text>
            
            <TouchableOpacity 
              style={styles.subscriptionOption}
              onPress={handleSubscriptionSelect}>
              <Text style={styles.subscriptionPrice}>500DA par jour</Text>
              <Text style={styles.subscriptionDesc}>pour des séances individuelles.</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.subscriptionOption}
              onPress={handleSubscriptionSelect}>
              <Text style={styles.subscriptionPrice}>1500DA par mois</Text>
              <Text style={styles.subscriptionDesc}>pour un soutien continu.</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPayment}
        transparent={true}
        animationType="none"
        onRequestClose={closePaymentModal}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [{ translateY: paymentTranslateY }],
                opacity: paymentOpacity
              }
            ]}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closePaymentModal}>
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
            
            <Text style={styles.paymentTitle}>Credit Card Info</Text>
            
            <View style={styles.paymentForm}>
              <View style={styles.cardIconContainer}>
                <CreditCard size={32} color="#A1C6EA" />
                <Text style={styles.cardType}>Algerian Golden Card</Text>
              </View>
              
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.cardInput}
                  placeholder="Full Name"
                  value={cardName}
                  onChangeText={setCardName}
                />
              </View>
              
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.cardInput}
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputField, { width: '48%' }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                
                <View style={[styles.inputField, { width: '48%' }]}>
                  <Text style={styles.inputLabel}>CVC</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="XXX"
                    value={cvc}
                    onChangeText={(text) => setCvc(text.replace(/\D/g, '').substring(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.paymentActions}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  closePaymentModal();
                  setTimeout(() => {
                    setShowSubscription(true);
                    Animated.timing(subscriptionAnimation, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: true,
                    }).start();
                  }, 200);
                }}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handlePaymentComplete}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  therapistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  therapistAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  therapistSubtitle: {
    fontSize: 12,
    color: '#A1C6EA',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#A1C6EA',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#ECEEFE',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 12,
    marginRight: 8,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    backgroundColor: '#A1C6EA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    position: 'relative',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4ade80',
    marginBottom: 20,
  },
  subscriptionOption: {
    width: '100%',
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  subscriptionPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  subscriptionDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 20,
  },
  paymentForm: {
    width: '100%',
    marginBottom: 20,
  },
  cardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  inputField: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  cardInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#A1C6EA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});