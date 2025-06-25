import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Modal,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { FIREBASE_DB } from '../screen/FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditService() {
  const navigation = useNavigation();
  const route = useRoute();
  const { service } = route.params;

  const [name, setName] = useState(service.name || '');
  const [description, setDescription] = useState(service.description || '');
  const [location, setLocation] = useState(service.location || '');
  const [parkingArea, setParkingArea] = useState(service.parkingArea || '');
  const [phone, setPhone] = useState(service.phone || '');
  const [category, setCategory] = useState(service.category || '');
  const [operatingHours, setOperatingHours] = useState(
    service.operatingHours && Array.isArray(service.operatingHours)
      ? service.operatingHours
      : [{ day: 'Monday', openTime: '09:00', closeTime: '17:00' }]
  );

  // Parking area modal
  const [showParkingModal, setShowParkingModal] = useState(false);
  const parkingOptions = ['Motorcycle', 'Car', 'Motorcycle & Car', 'None'];

  const handleSelectParking = (option) => {
    setParkingArea(option);
    setShowParkingModal(false);
  };

  const days = ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [selectedTimeType, setSelectedTimeType] = useState('');
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [time, setTime] = useState(new Date());

  const addOperatingHours = () => {
    setOperatingHours([
      ...operatingHours,
      { day: 'Monday', openTime: '09:00', closeTime: '17:00' }
    ]);
  };

  const updateOperatingHours = (index, field, value) => {
    const updatedHours = [...operatingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setOperatingHours(updatedHours);
  };

  const removeOperatingHours = (index) => {
    const updatedHours = [...operatingHours];
    updatedHours.splice(index, 1);
    setOperatingHours(updatedHours);
  };

  // Show day picker
  const openDayPicker = (index) => {
    setSelectedDayIndex(index);
    setShowDayPicker(true);
  };

  // Handle day selection
  const handleDaySelect = (day) => {
    updateOperatingHours(selectedDayIndex, 'day', day);
    setShowDayPicker(false);
  };

  // Show time picker for open or close time
  const showTimePickerModal = (index, timeType) => {
    setSelectedTimeIndex(index);
    setSelectedTimeType(timeType);
    setShowTimePicker(true);
  };

  // Handle time change (open or close time)
  const onTimeChange = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      updateOperatingHours(selectedTimeIndex, selectedTimeType, formattedTime);
    }
    setShowTimePicker(false);
  };

  const handleUpdate = async () => {
    if (!name || !category || !location || !phone) {
      Alert.alert('Error', 'Please fill in all required fields: Service Name, Category, Location, and Phone Number.');
      return;
    }

    try {
      const serviceRef = doc(FIREBASE_DB, 'Services', service.id);
      await updateDoc(serviceRef, {
        name,
        description,
        location,
        parkingArea,
        phone,
        category,
        operatingHours,
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Service updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Service</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Service Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter service name"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <Text style={styles.label}>Operating Days & Hours</Text>
        {operatingHours.map((hours, index) => (
          <View key={index} style={styles.operatingHoursRow}>
            <TouchableOpacity
              style={styles.daySelector}
              onPress={() => openDayPicker(index)}
            >
              <Text>{hours.day || 'Day'}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => showTimePickerModal(index, 'openTime')}
            >
              <Text>{hours.openTime || 'Open Time'}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => showTimePickerModal(index, 'closeTime')}
            >
              <Text>{hours.closeTime || 'Close Time'}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            {operatingHours.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeOperatingHours(index)}
              >
                <Ionicons name="x" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addMoreButton}
          onPress={addOperatingHours}
        >
          <Text style={styles.addMoreButtonText}>Add More</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Parking Area</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowParkingModal(true)}
        >
          <Text style={parkingArea ? styles.inputText : styles.placeholderText}>
            {parkingArea || "Select the type of parking area"}
          </Text>
        </TouchableOpacity>

        {/* Parking Area Modal */}
        <Modal
          visible={showParkingModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowParkingModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowParkingModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Parking area</Text>
                  {parkingOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionItem,
                        parkingArea === option && styles.selectedOption
                      ]}
                      onPress={() => handleSelectParking(option)}
                    >
                      <Text style={[
                        styles.optionText,
                        parkingArea === option && styles.selectedOptionText
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowParkingModal(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Enter category"
        />

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update Service</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Day Picker Modal */}
      <Modal
        visible={showDayPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDayPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Day</Text>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  operatingHours[selectedDayIndex]?.day === day && styles.selectedOption
                ]}
                onPress={() => handleDaySelect(day)}
              >
                <Text style={[
                  styles.optionText,
                  operatingHours[selectedDayIndex]?.day === day && styles.selectedOptionText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowDayPicker(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          transparent={true}
          visible={showTimePicker}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedTimeType === 'openTime' ? 'Open Time' : 'Close Time'}
              </Text>
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={onTimeChange}
                textColor='black'
              />
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 120,
    backgroundColor: '#002B28',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  inputText: {
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  operatingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  daySelector: {
    flex: 1.2,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSelector: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '30%',
  },
  removeButton: {
    padding: 8,
    marginLeft: 5,
  },
  addMoreButton: {
    backgroundColor: "#014737",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  addMoreButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#014737',
    marginBottom: 20,
  },
  optionItem: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#e6f2ef',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedOptionText: {
    color: '#014737',
    fontWeight: 'bold',
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
  updateButton: {
    backgroundColor: '#002B28',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 