import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Phone, Heart, CircleUser as UserCircle } from 'lucide-react-native';

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
    // In a real app, implement actual calling functionality
    console.log(`Calling ${number}`);
  };

  const handleAddContact = (type) => {
    // In a real app, implement contact addition functionality
    console.log(`Adding ${type} contact`);
  };

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
});