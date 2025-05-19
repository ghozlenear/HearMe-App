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
  Platform,
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

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to send your live location.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const message = `Help me heree: ${mapsUrl}`;
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

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.callButton]}
                  onPress={() => handleCall(trustedContact)}
                >
                  <Phone size={24} color="#fff" />
                  <Text style={styles.buttonText}>Call Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, styles.locationButton]}
                  onPress={() => sendLocationSMS(trustedContact)}
                >
                  <Text style={styles.buttonText}>Send Live Location</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.secondaryButtonGroup}>
                <TouchableOpacity
                  onPress={openContactPicker}
                  style={[styles.secondaryButton, styles.updateButton]}
                >
                  <UserCircle size={20} color="#818CF8" />
                  <Text style={[styles.secondaryButtonText, { color: '#818CF8' }]}>
                    Change Contact
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={removeTrustedContact}
                  style={[styles.secondaryButton, styles.removeButton]}
                >
                  <Text style={[styles.secondaryButtonText, { color: '#F87171' }]}>
                    Remove
                  </Text>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Contact</Text>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color="#666" />
            <TextInput
              placeholder="Search"
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => selectContact(item)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactItemName}>{item.name}</Text>
                  <Text style={styles.contactItemNumber}>
                    {item.phoneNumbers[0]?.number}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.contactsList}
            showsVerticalScrollIndicator={false}
          />
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
    height: 160,
    backgroundColor: '#A1C6EA',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginTop: -60,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    marginLeft: 4,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  contactDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 20,
  },
  callButton: {
    backgroundColor: '#A1C6EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A1C6EA',
    borderStyle: 'dashed',
  },
  disclaimer: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    paddingHorizontal: 40,
    paddingVertical: 24,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  buttonGroup: {
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#34D399',
  },
  secondaryButtonGroup: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  updateButton: {
    borderColor: '#818CF8',
  },
  removeButton: {
    borderColor: '#F87171',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#A1C6EA',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  modalClose: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  contactsList: {
    padding: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A1C6EA20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A1C6EA',
  },
  contactInfo: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 12,
  },
  contactItemName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 4,
  },
  contactItemNumber: {
    fontSize: 14,
    color: '#666',
  },
});