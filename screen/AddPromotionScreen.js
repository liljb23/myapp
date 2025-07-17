import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

export default function AddPromotionScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [image, setImage] = useState('');
  const [remaining, setRemaining] = useState('');
  const [validUntil, setValidUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);

  const [sendNotification, setSendNotification] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const snap = await getDocs(collection(FIREBASE_DB, 'Services'));
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s =>
    s.name && s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!title || !description || !discount || !remaining || !validUntil) {
      Alert.alert('Required Fields', 'Please fill out all fields.');
      return;
    }

    try {
      const promotionData = {
        title,
        description,
        discount: Number(discount),
        image: image || '',
        remaining: Number(remaining),
        validUntil,
        serviceId: selectedService ? selectedService.id : null,
        createdAt: serverTimestamp(),
      };

      const promotionRef = await addDoc(collection(FIREBASE_DB, 'promotions'), promotionData);

      if (sendNotification) {
        await addDoc(collection(FIREBASE_DB, 'notifications'), {
          type: 'promotion',
          message: `New promotion: ${title} - ${description}`,
          serviceId: selectedService ? selectedService.id : null,
          image: image || '',
          validUntil,
          promotionDocId: promotionRef.id,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert(
        'Success',
        'Promotion added successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('PromotionQuantityScreen') }]
      );
      setTitle('');
      setDescription('');
      setDiscount('');
      setImage('');
      setRemaining('');
      setValidUntil(new Date());
      setSelectedService(null);
      setServiceSearch('');
    } catch (error) {
      console.error('Error adding promotion:', error);
      Alert.alert('Error', 'Failed to add promotion. Please try again.');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setServiceModalVisible(false);
    setServiceSearch('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add Promotion</Text>
      </View>

      <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Promotion title"
        placeholderTextColor="#555"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Promotion description"
        placeholderTextColor="#555"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Discount (%) <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Discount percentage"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={discount}
        onChangeText={setDiscount}
      />

      <Text style={styles.label}>Image URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Promotion image URL"
        placeholderTextColor="#555"
        value={image}
        onChangeText={setImage}
      />

      <Text style={styles.label}>Remaining <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Remaining quantity"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={remaining}
        onChangeText={setRemaining}
      />

      <Text style={styles.label}>Valid Until <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={validUntil ? styles.inputText : styles.placeholderText}>
          {validUntil ? formatDate(validUntil) : 'Select End Date'}
        </Text>
        <Feather name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={validUntil}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setValidUntil(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Service <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setServiceModalVisible(true)}
      >
        <Text style={selectedService ? styles.inputText : styles.placeholderText}>
          {selectedService
            ? selectedService.name
            : 'โปรโมชันรวม (All Services)'}
        </Text>
        <Feather name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {/* Modal เลือก service */}
      <Modal
        visible={serviceModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setServiceModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setServiceModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Service</Text>
          <TouchableOpacity
            style={[
              styles.serviceItem,
              !selectedService && styles.serviceItemSelected
            ]}
            onPress={() => handleServiceSelect(null)}
          >
            <Text style={styles.serviceName}>โปรโมชันรวม (All Services)</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            placeholder="Search service"
            value={serviceSearch}
            onChangeText={setServiceSearch}
          />
          <FlatList
            data={filteredServices}
            keyExtractor={item => item.id}
            style={{ maxHeight: 200, width: '100%' }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.serviceItem,
                  selectedService && selectedService.id === item.id && styles.serviceItemSelected
                ]}
                onPress={() => handleServiceSelect(item)}
              >
                <Text style={styles.serviceName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.doneButton} onPress={() => setServiceModalVisible(false)}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => setSendNotification(!sendNotification)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: '#014737',
            backgroundColor: sendNotification ? '#014737' : '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          {sendNotification && (
            <Feather name="check" size={16} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={{ color: '#222', fontSize: 15 }}>
          ส่งแจ้งเตือนไปยังผู้ใช้
        </Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Promotion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#014737',
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 153,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginBottom: 20,
    position: 'relative',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    top: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 20,
    color: '#222',
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputText: {
    color: '#222',
    fontWeight: '600',
    flex: 1,
  },
  placeholderText: {
    color: '#555',
    fontWeight: '500',
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    padding: 15,
    backgroundColor: '#fff',
    color: '#222',
  },
  submitButton: {
    backgroundColor: '#014737',
    padding: 18,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -160 }, { translateY: -180 }],
    width: 320,
    minHeight: 250,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#014737',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#014737',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  serviceItemSelected: {
    backgroundColor: '#e0f7fa',
  },
  serviceName: {
    fontSize: 16,
    color: '#014737',
  },
});