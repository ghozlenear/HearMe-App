import React, { useState, useRef, useEffect } from 'react';
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
import api from '../../constants/api';

const { width } = Dimensions.get('window');

// ChatMessage component (unchanged)
const ChatMessage = ({ message, isUser }) => (
  <View style={[
    styles.messageContainer,
    isUser ? styles.userMessage : styles.botMessage,
  ]}>
    <Text style={[styles.messageText, isUser && styles.userMessageText]}>
      {message}
    </Text>
  </View>
);

export default function ChatBot() {
  // Chat state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "مرحبًا، كيف حالك اليوم؟", isUser: false }
  ]);
  
  // Payment modals state
  const [showSubscription, setShowSubscription] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  // Animations
  const subscriptionAnimation = useRef(new Animated.Value(0)).current;
  const paymentAnimation = useRef(new Animated.Value(0)).current;
  const messageAnimation = useRef(new Animated.Value(0)).current;

  // Handle sending messages with depression detection
  const handleSend = async () => {
    if (!message.trim()) return;

    // Animate message send
    messageAnimation.setValue(50);
    Animated.spring(messageAnimation, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Add user message immediately
    const userMessage = { text: message, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      // 1. Get depression analysis
      const predictionRes = await api.post('/predict', { text: message });
      const { prediction, symptoms } = predictionRes.data;

      // 2. Store conversation data
      await api.post('/log_conversation', {
        user_id: `user_${Date.now()}`,
        message,
        prediction,
        symptoms
      });

      // 3. Add contextual response
      setTimeout(() => {
        messageAnimation.setValue(50);
        Animated.spring(messageAnimation, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        

        setMessages(prev => [...prev, {
          text: prediction === "Depressed" ?
            "يبدو أنك قد تحتاج إلى دعم نفسي. هل تريد التحدث مع معالج متخصص؟" :
            "أنا سعيد لأنك بخير! هل لديك أي استفسارات أخرى؟",
          isUser: false
        }]);
      }, 800);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        text: "عذرًا، حدث خطأ تقني. يرجى المحاولة مرة أخرى",
        isUser: false
      }]);
    }
  };

  // Payment handlers (unchanged)
  const handleCallTherapist = () => {
    setShowSubscription(true);
    Animated.timing(subscriptionAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSubscriptionSelect = () => {
    Animated.timing(subscriptionAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSubscription(false);
      setShowPayment(true);
      Animated.timing(paymentAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handlePaymentComplete = () => {
    Animated.timing(paymentAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPayment(false);
      // the actual payment processing here
    });
  };

  // Helper functions (unchanged)
  const closeSubscriptionModal = () => {
    Animated.timing(subscriptionAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSubscription(false));
  };

  const closePaymentModal = () => {
    Animated.timing(paymentAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowPayment(false));
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.length > 2 ? 
      `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}` : cleaned;
  };

  // Animation interpolations (unchanged)
  const subscriptionTranslateY = subscriptionAnimation.interpolate({
    inputRange: [0, 1], outputRange: [300, 0]
  });
  const subscriptionOpacity = subscriptionAnimation.interpolate({
    inputRange: [0, 1], outputRange: [0, 1]
  });
  const paymentTranslateY = paymentAnimation.interpolate({
    inputRange: [0, 1], outputRange: [300, 0]
  });
  const paymentOpacity = paymentAnimation.interpolate({
    inputRange: [0, 1], outputRange: [0, 1]
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Header */}
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
            <Text style={styles.therapistName}>معالجك</Text>
            <Text style={styles.therapistSubtitle}>مدعوم بالذكاء الاصطناعي</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleCallTherapist}>
          <Phone size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((msg, index) => (
          <Animated.View 
            key={index}
            style={index === messages.length - 1 ? { 
              transform: [{ translateY: messageAnimation }] 
            } : null}
          >
            <ChatMessage message={msg.text} isUser={msg.isUser} />
          </Animated.View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="ابدأ المحادثة..."
          placeholderTextColor="#9ca3af"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Send size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Subscription Modal */}
      <Modal
        visible={showSubscription}
        transparent
        animationType="none"
        onRequestClose={closeSubscriptionModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            { 
              transform: [{ translateY: subscriptionTranslateY }],
              opacity: subscriptionOpacity
            }
          ]}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeSubscriptionModal}
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>الاشتراك</Text>
            <Text style={styles.modalSubtitle}>للتحدث مع معالج حقيقي</Text>
            
            <TouchableOpacity 
              style={styles.subscriptionOption}
              onPress={handleSubscriptionSelect}
            >
              <Text style={styles.subscriptionPrice}>500 دج يوميًا</Text>
              <Text style={styles.subscriptionDesc}>لجلسات فردية.</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.subscriptionOption}
              onPress={handleSubscriptionSelect}
            >
              <Text style={styles.subscriptionPrice}>1500 دج شهريًا</Text>
              <Text style={styles.subscriptionDesc}>لدعم مستمر.</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPayment}
        transparent
        animationType="none"
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            { 
              transform: [{ translateY: paymentTranslateY }],
              opacity: paymentOpacity
            }
          ]}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closePaymentModal}
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
            
            <Text style={styles.paymentTitle}>معلومات البطاقة</Text>
            
            <View style={styles.paymentForm}>
              <View style={styles.cardIconContainer}>
                <CreditCard size={32} color="#A1C6EA" />
                <Text style={styles.cardType}>البطاقة الذهبية الجزائرية</Text>
              </View>
              
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>اسم حامل البطاقة</Text>
                <TextInput
                  style={styles.cardInput}
                  placeholder="الاسم الكامل"
                  value={cardName}
                  onChangeText={setCardName}
                />
              </View>
              
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>رقم البطاقة</Text>
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
                  <Text style={styles.inputLabel}>تاريخ الانتهاء</Text>
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
                }}
              >
                <Text style={styles.backButtonText}>رجوع</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handlePaymentComplete}
              >
                <Text style={styles.nextButtonText}>التالي</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// Styles (unchanged)
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