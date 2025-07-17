import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';

const EditPromotion = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { promoId, existingData } = route.params;

  const [title, setTitle] = useState(existingData?.title || '');
  const [description, setDescription] = useState(existingData?.description || '');
  const [discount, setDiscount] = useState(String(existingData?.discount || ''));
  const [image, setImage] = useState(existingData?.image || '');
  const [remaining, setRemaining] = useState(String(existingData?.remaining || ''));
  const [validUntil, setValidUntil] = useState(existingData?.validUntil?.seconds ? new Date(existingData.validUntil.seconds * 1000) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState(existingData?.serviceId ? { id: existingData.serviceId, name: existingData.serviceName || '' } : null);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);

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

  const formatDate = (date) => {
    return date instanceof Date
      ? date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setServiceModalVisible(false);
    setServiceSearch('');
  };

  const handleUpdate = async () => {
    if (!title || !description || !discount || !remaining || !validUntil) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      const promotionRef = doc(FIREBASE_DB, 'promotions', promoId);
      await updateDoc(promotionRef, {
        title,
        description,
        discount: Number(discount),
        image: image || '',
        remaining: Number(remaining),
        validUntil,
        serviceId: selectedService ? selectedService.id : null,
      });
      Alert.alert("Success", "Promotion updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Update error: ", error);
      Alert.alert("Error", "Failed to update promotion.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.header}>Edit Promotion</Text>
        <View style={{ width: 24 }} />
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

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Ionicons name="save-outline" size={24} color="#fff" />
        <Text style={styles.updateButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#002B28',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#fff',
    color: '#222',
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: '#002B28',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginTop: 20
  },
  updateButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -160 }, { translateY: -180 }],
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

export default EditPromotion;
