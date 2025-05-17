import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Linking,
  TextInput,
} from 'react-native';
import { Phone, Heart, CircleUser as UserCircle, Search } from 'lucide-react-native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

const emergencyContacts = [
  { name: 'Hospital Hotline', number: '0000', description: '24/7 support' },
  { name: 'Police Line', number: '1548', description: 'Call if you need help' },
];

export default function Calls() {
  const [trustedContact, setTrustedContact] = useState(null);
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchTrustedContact = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data, error } = await supabase
          .from('patient')
          .select('trusted_contact')
          .eq('id', userData.user.id)
          .single();

        if (!error && data?.trusted_contact) {
          setTrustedContact(data.trusted_contact);
        }
      }
    };
    fetchTrustedContact();
  }, []);

  const handleCall = (number) => {
    if (number) Linking.openURL(`tel:${number}`);
    else Alert.alert('Error', 'No number to call.');
  };

  const sendLocationSMS = async (number) => {
    if (!number) {
      Alert.alert('Error', 'No trusted contact number saved.');
      return;
    }

    // Ask for location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to send your live location.');
      return;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Construct Google Maps link
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const message = `Help me heree: ${mapsUrl}`;

    // Open SMS app with prefilled message
    const smsUrl = `sms:${number}?body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl);
  };

  const openContactPicker = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'App needs contact access.');
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const contactsWithNumbers = data.filter(
      (contact) => contact.phoneNumbers?.length > 0
    );

    setAllContacts(contactsWithNumbers);
    setFilteredContacts(contactsWithNumbers);
    setModalVisible(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = allContacts.filter((contact) =>
      contact.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  const selectContact = async (contact) => {
    const number = contact.phoneNumbers[0].number;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const { error } = await supabase
      .from('patient')
      .update({ trusted_contact: number })
      .eq('id', userData.user.id);

    if (error) {
      console.log('Supabase update error:', error);
      Alert.alert('Error', 'Failed to save contact: ' + error.message);
    } else {
      setTrustedContact(number);
      setModalVisible(false);
      Alert.alert('Success', `${contact.name} saved as trusted contact.`);
    }
  };

  const removeTrustedContact = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const { error } = await supabase
      .from('patient')
      .update({ trusted_contact: null })
      .eq('id', userData.user.id);

    if (error) {
      console.log('Supabase remove error:', error);
      Alert.alert('Error', 'Failed to remove contact: ' + error.message);
    } else {
      setTrustedContact(null);
      Alert.alert('Removed', 'Trusted contact has been removed.');
    }
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
              onPress={() => handleCall(contact.number)}
            >
              <Phone size={24} color="#fff" />
              <Text style={styles.callButtonText}>{contact.number}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trusted Contact</Text>
        <View style={styles.contactCard}>
          {trustedContact ? (
            <>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Saved Contact</Text>
                <Text style={styles.contactDescription}>
                  {trustedContact}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(trustedContact)}
              >
                <Phone size={24} color="#fff" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.callButton, { marginTop: 10, backgroundColor: '#10b981' }]}
                onPress={() => sendLocationSMS(trustedContact)}
              >
                <Text style={styles.callButtonText}>Send Live Location SMS</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={openContactPicker}
                  style={[styles.manageButton, { backgroundColor: '#facc15' }]}
                >
                  <Text style={styles.manageButtonText}>Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={removeTrustedContact}
                  style={[styles.manageButton, { backgroundColor: '#ef4444' }]}
                >
                  <Text style={styles.manageButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={openContactPicker}>
              <UserCircle size={24} color="#A1C6EA" />
              <Text style={{ marginTop: 8, color: '#1f2937' }}>Add Trusted Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.disclaimer}>
        If you're experiencing a medical emergency, please dial 0000 or visit your
        nearest emergency room.
      </Text>

      {/* Contact Picker Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
            Select a Contact
          </Text>

          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                }}
                onPress={() => selectContact(item)}
              >
                <Text style={{ fontSize: 16 }}>{item.name}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  {item.phoneNumbers[0]?.number}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              marginTop: 20,
              backgroundColor: '#ef4444',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    padding: 16,
  },
  disclaimer: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  manageButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
});
