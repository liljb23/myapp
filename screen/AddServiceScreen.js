import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  Pressable
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import { useAuth } from './AuthContext';

export default function AddServiceScreen({ navigation }) {
  const { user } = useAuth();
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [parkingArea, setParkingArea] = useState('');
  const [serviceImages, setServiceImages] = useState([]);
  const [idImage, setIdImage] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isRecommend, setIsRecommend] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedInfo, setConfirmedInfo] = useState(false);

  // Operating hours state
  const [operatingHours, setOperatingHours] = useState([
    { day: 'Monday', openTime: '09:00', closeTime: '17:00' }
  ]);

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

  // Image picking functions
  const pickServiceImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.2,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setServiceImages([...serviceImages, ...newImages]);
    }
  };

  const pickIdImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
    }
  };

  const removeServiceImage = (index) => {
    const updatedImages = [...serviceImages];
    updatedImages.splice(index, 1);
    setServiceImages(updatedImages);
  };

  // Parking area modal
  const [showParkingModal, setShowParkingModal] = useState(false);
  const parkingOptions = ['Motorcycle', 'Car', 'Motorcycle & Car', 'None'];

  const handleSelectParking = (option) => {
    setParkingArea(option);
    setShowParkingModal(false);
  };

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [selectedTimeType, setSelectedTimeType] = useState('');

  // Handle time change
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

  // Show time picker
  const showTimePickerModal = (index, timeType) => {
    setSelectedTimeIndex(index);
    setSelectedTimeType(timeType);
    setShowTimePicker(true);
  };

  // Day picker state
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const days = ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Handle day selection
  const handleDaySelect = (day) => {
    updateOperatingHours(selectedDayIndex, 'day', day);
    setShowDayPicker(false);
  };

  // Show day picker
  const openDayPicker = (index) => {
    setSelectedDayIndex(index);
    setShowDayPicker(true);
  };

  // Location handling
  const handleLocationSelect = (selectedLocation, lat, lng) => {
    setLocation(selectedLocation);
    setLatitude(lat);
    setLongitude(lng);
  };

  // Open location picker
  const openLocationPicker = () => {
    navigation.navigate('AddMapScreen', {
      onLocationSelect: handleLocationSelect
    });
  };

  // Form submission
  const handleSubmit = async () => {
    console.log('Starting submission...');
    console.log('Form values:', {
      serviceName,
      category,
      location,
      phone,
      latitude,
      longitude,
      operatingHours,
      parkingArea,
      serviceImages
    });

    if (!serviceName || !category || !location || !phone) {
      console.log('Validation failed:', {
        serviceName: !serviceName,
        category: !category,
        location: !location,
        phone: !phone
      });
      Alert.alert("Required Fields", "Please fill in all required fields: Service Name, Category, Location, and Phone Number.");
      return;
    }

    try {
      console.log('Attempting to add document to Firestore...');
      const docRef = await addDoc(collection(FIREBASE_DB, 'Services'), {
        name: serviceName,
        category: category,
        description: description,
        location: location,
        operatingHours: operatingHours,
        phone: phone,
        parkingArea: parkingArea,
        serviceImages: serviceImages,
        idImage: idImage,
        latitude: latitude,
        longitude: longitude,
        isRecommend: isRecommend,
        rating: 0,
        reviews: 0,
        image: serviceImages[0] || '',
        createdAt: serverTimestamp(),
        EntrepreneurId: user.uid,
      });
      console.log('Document added successfully with ID:', docRef.id);

      Alert.alert(
        "Success",
        "Service added successfully!",
        [{ text: "OK", onPress: () => navigation.navigate('ServicesQuantityScreen') }]
      );
    } catch (error) {
      console.error("Error adding service:", error);
      Alert.alert(
        "Error", 
        `Failed to add service: ${error.message}. Please try again.`
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add Service</Text>
      </View>

      {/* Service Type Selection */}
      <Text style={styles.sectionTitle}>Type Service</Text>
      <View style={styles.serviceTypeContainer}>
        <TouchableOpacity
          style={[styles.serviceTypeButton, category === 'Restaurant' && styles.selectedServiceType]}
          onPress={() => setCategory('Restaurant')}>
          <Image source={require('../assets/dish.png')} style={styles.serviceTypeIcon} />
          <Text style={styles.serviceTypeText}>Restaurant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.serviceTypeButton, category === 'Beauty & Salon' && styles.selectedServiceType]}
          onPress={() => setCategory('Beauty & Salon')}>
          <Image source={require('../assets/barber-shop.png')} style={styles.serviceTypeIcon} />
          <Text style={styles.serviceTypeText}>Beauty & Salon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.serviceTypeButton, category === 'Resort & Hotel' && styles.selectedServiceType]}
          onPress={() => setCategory('Resort & Hotel')}>
          <Image source={require('../assets/resort.png')} style={styles.serviceTypeIcon} />
          <Text style={styles.serviceTypeText}>Resort & Hotel</Text>
        </TouchableOpacity>
      </View>

      {/* Service Name */}
      <Text style={styles.label}>Name Service <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter service name"
        value={serviceName}
        onChangeText={setServiceName}
        placeholderTextColor="#999"
      />

      {/* Location */}
      <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity style={styles.input} onPress={openLocationPicker}>
        <Text style={location ? styles.inputText : styles.placeholder}>
          {location || "Click to select the service location"}
        </Text>
        <Feather name="map-pin" size={20} color="#666" style={styles.inputIcon} />
      </TouchableOpacity>

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter additional service details"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor="#999"
      />

      {/* Operating Hours */}
      <Text style={styles.label}>Service operating days and hours</Text>
      {operatingHours.map((hours, index) => (
        <View key={index} style={styles.operatingHoursRow}>
          <TouchableOpacity
            style={styles.daySelector}
            onPress={() => openDayPicker(index)}
          >
            <Text>{hours.day || 'Day'}</Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => showTimePickerModal(index, 'openTime')}
          >
            <Text>{hours.openTime || 'Open Time'}</Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => showTimePickerModal(index, 'closeTime')}
          >
            <Text>{hours.closeTime || 'Close Time'}</Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          {operatingHours.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeOperatingHours(index)}
            >
              <Feather name="x" size={20} color="#666" />
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

      {/* Phone Number */}
      <Text style={styles.label}>Phone number <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter service Phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor="#999"
      />

      {/* Parking Area */}
      <Text style={styles.label}>Parking area</Text>
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

      {/* Service Images */}
      <Text style={styles.label}>Add Photos for Service <Text style={styles.fileTypes}>(File .png .jpg .jpeg)</Text></Text>
      <TouchableOpacity onPress={pickServiceImages} style={styles.uploadBox}>
        {serviceImages.length === 0 ? (
          <View style={styles.uploadPlaceholder}>
            <Feather name="upload" size={32} color="#666" />
            <Text style={styles.uploadText}>Upload images</Text>
          </View>
        ) : (
          <View style={styles.uploadedImagesContainer}>
            {serviceImages.map((uri, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeServiceImage(index)}>
                  <Feather name="x-circle" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {serviceImages.length < 5 && (
              <TouchableOpacity onPress={pickServiceImages} style={styles.addMoreImagesButton}>
                <Feather name="plus" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>

     
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
                value={new Date()}
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

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          (!serviceName || !category || !location || !phone) && styles.disabledButton,
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => {
          console.log('Button pressed - Debug Info:');
          console.log('serviceName:', serviceName);
          console.log('category:', category);
          console.log('location:', location);
          console.log('phone:', phone);
          
          if (!serviceName || !category || !location || !phone) {
            Alert.alert(
              "Required Fields", 
              "Please fill in all required fields: Service Name, Category, Location, and Phone Number."
            );
            return;
          }

          console.log('Attempting to submit...');
          handleSubmit();
        }}>
        <Text style={styles.submitButtonText}>
          {(!serviceName || !category || !location || !phone) 
            ? 'Fill Required Fields' 
            : 'Submit'}
        </Text>
      </Pressable>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  required: {
    color: 'red',
  },
  fileTypes: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  serviceTypeButton: {
    width: '30%',
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  selectedServiceType: {
    borderWidth: 2,
    borderColor: '#014737',
    backgroundColor: '#e6f2ef',
  },
  serviceTypeIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  serviceTypeText: {
    fontSize: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
    flex: 1,
  },
  inputIcon: {
    marginLeft: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    padding: 15,
  },
  operatingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  addMoreButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#666',
    marginTop: 10,
  },
  uploadedImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  imagePreviewContainer: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  addMoreImagesButton: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  idImageContainer: {
    position: 'relative',
  },
  idImagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  consentContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  checkboxTextContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  checkboxText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  highlightText: {
    color: '#014737',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#014737',
    padding: 18,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0ccc0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  placeholderText: {
    color: '#999',
  },
});
