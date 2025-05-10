import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Phone, Heart, CircleUser as UserCircle } from 'lucide-react-native';
import { Linking } from 'react-native';
import { useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';



const [emergencySent, setEmergencySent] = useState(false);

const handleEmergency = async () => {
  const user = auth().currentUser;

  if (!user) {
    Alert.alert("User not logged in", "Please log in first.");
    return;
  }

  Geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      await firestore().collection('emergencies').add({
        userId: user.uid,
        location: {
          lat: latitude,
          lng: longitude,
        },
        trustedContact: '+213XXXXXXXX', // Later replace with actual selected contact
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      setEmergencySent(true);
      Alert.alert('🚨 Emergency Sent', 'Your emergency has been reported.');
    },
    (error) => {
      console.error(error);
      Alert.alert('Location Error', 'Unable to get location.');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
};

const emergencyContacts = [
  {
    name: 'Hospital Hotline',
    number: '0000',
    description: '24/7 support for those in emotional distress',
    isEmergency: true,
  },
  {
    name: 'Police Line',
    number: '1548',
    description: 'Call If you need help',
    isEmergency: true,
  },
];

const familyContacts = [
  {
    name: 'Add Family Member',
    number: '',
    description: 'Add a trusted family member contact',
    isFamily: true,
  },
  {
    name: 'Add Close Friend',
    number: '',
    description: 'Add a trusted friend contact',
    isFamily: true,
  },
];

export default function Calls() {
  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(err =>
      Alert.alert('Error', 'Could not initiate call')
    );
  };

  
  const handleAddContact = (type) => {
    Alert.alert(
      `Add ${type === 'family' ? 'Family Member' : 'Close Friend'}`,
      `This will open a form to add a ${type === 'family' ? 'family member' : 'close friend'} in the future.`,
    );
  };
  
  //const handleAddContact = (type) => {
    // In a real app, implement contact addition functionality
  //  console.log(`Adding ${type} contact`);
 // };
 <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
  <Text style={styles.emergencyButtonText}>
    {emergencySent ? 'Emergency Sent' : 'Trigger Emergency'}
  </Text>
</TouchableOpacity>

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer} />
      
      <View style={styles.header}>
        <Heart size={32} color="#A1C6EA" />
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          24/7 Support and Trusted Contacts
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Helplines</Text>
        {emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactDescription}>
                {contact.description}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(contact.number)}>
              <Phone size={24} color="#fff" />
              <Text style={styles.callButtonText}>{contact.number}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family & Close Friends</Text>
        {familyContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactCard}
            onPress={() => handleAddContact(contact.isFamily ? 'family' : 'friend')}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactDescription}>
                {contact.description}
              </Text>
            </View>
            <View style={styles.addButton}>
              <UserCircle size={24} color="#A1C6EA" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        If you're experiencing a medical emergency, please dial 0000 or visit your
        nearest emergency room.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#ECEEFE',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEFE',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: '#ECEEFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  callButton: {
    backgroundColor: '#A1C6EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  disclaimer: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },

  emergencyButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 30,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});