import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH, FIREBASE_STORAGE } from '../screen/FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function EditServiceEntrepreneur() {
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
  const [serviceImages, setServiceImages] = useState(service.serviceImages || []);
  const [showParkingModal, setShowParkingModal] = useState(false);
  const parkingOptions = ['Motorcycle', 'Car', 'Motorcycle & Car', 'None'];

  const handleSelectParking = (option) => {
    setParkingArea(option);
    setShowParkingModal(false);
  };

  const days = ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const openDayPicker = (index) => {
    setSelectedDayIndex(index);
    setShowDayPicker(true);
  };

  const handleDaySelect = (day) => {
    updateOperatingHours(selectedDayIndex, 'day', day);
    setShowDayPicker(false);
  };

  const showTimePickerModal = (index, timeType) => {
    setSelectedTimeIndex(index);
    setSelectedTimeType(timeType);
    setShowTimePicker(true);
  };

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

  const handleSelectLocation = () => {
    navigation.navigate('AddMapScreen', {
      onLocationSelect: (address, lat, lng) => {
        setLocation(address);
      }
    });
  };

  const pickServiceImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE,
      allowsMultipleSelection: true,
      quality: 0.2,
    });
    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setServiceImages([...serviceImages, ...newImages]);
    }
  };

  const removeServiceImage = (index) => {
    const updatedImages = [...serviceImages];
    updatedImages.splice(index, 1);
    setServiceImages(updatedImages);
  };

  const uploadImageAsync = async (uri, serviceId) => {
    try {
      console.log('=== Upload Start ===');
      console.log('URI:', uri);
      console.log('ServiceID:', serviceId);
      
      const response = await fetch(uri);
      console.log('Fetch response status:', response.status);
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'Type:', blob.type);
      
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      console.log('Filename:', filename);
      
      const storageRef = ref(FIREBASE_STORAGE, `serviceImages/${serviceId}/${filename}`);
      console.log('Storage path:', `serviceImages/${serviceId}/${filename}`);
      
      await uploadBytes(storageRef, blob);
      console.log('Upload successful');
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('=== Upload Error ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const serviceRef = doc(FIREBASE_DB, 'Services', service.id);
        const serviceDoc = await getDoc(serviceRef);
        
        if (serviceDoc.exists()) {
          const latestData = serviceDoc.data();
          setName(latestData.name || '');
          setDescription(latestData.description || '');
          setLocation(latestData.location || '');
          setParkingArea(latestData.parkingArea || '');
          setPhone(latestData.phone || '');
          setCategory(latestData.category || '');
          setOperatingHours(latestData.operatingHours || [{ day: 'Monday', openTime: '09:00', closeTime: '17:00' }]);
          setServiceImages(latestData.serviceImages || []);
        }
      } catch (error) {
        console.error('Error fetching latest data:', error);
      }
    };

    fetchLatestData();
  }, [service.id]);

  const handleUpdate = async () => {
    console.log('Update Service clicked');

    try {
      const serviceId = service.id;
      const serviceRef = doc(FIREBASE_DB, 'Services', serviceId);

      const uploadedImageUrls = [];
      for (const image of serviceImages) {
        if (image.startsWith('http')) {
          uploadedImageUrls.push(image);
        } else {
          const url = await uploadImageAsync(image, serviceId);
          uploadedImageUrls.push(url);
        }
      }

      await updateDoc(serviceRef, {
        name,
        description,
        location,
        parkingArea,
        phone,
        category,
        operatingHours,
        serviceImages: uploadedImageUrls,
        image: uploadedImageUrls[0] || '',
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
        {/* Service Type Selection */}
        <Text style={styles.label}>Type Service</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
          contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <TouchableOpacity
            style={[styles.serviceTypeButton, category === 'Restaurant' && styles.selectedServiceType]}
            onPress={() => setCategory('Restaurant')}>
            <Image source={require('../assets/dish.png')} style={styles.serviceTypeIcon} />
            <Text style={[styles.serviceTypeText, category === 'Restaurant' && styles.selectedServiceTypeText]}>Restaurant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.serviceTypeButton, category === 'Beauty & Salon' && styles.selectedServiceType]}
            onPress={() => setCategory('Beauty & Salon')}>
            <Image source={require('../assets/barber-shop.png')} style={styles.serviceTypeIcon} />
            <Text style={[styles.serviceTypeText, category === 'Beauty & Salon' && styles.selectedServiceTypeText]}>Beauty & Salon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.serviceTypeButton, category === 'Resort & Hotel' && styles.selectedServiceType]}
            onPress={() => setCategory('Resort & Hotel')}>
            <Image source={require('../assets/resort.png')} style={styles.serviceTypeIcon} />
            <Text style={[styles.serviceTypeText, category === 'Resort & Hotel' && styles.selectedServiceTypeText]}>Resort & Hotel</Text>
          </TouchableOpacity>
        </ScrollView>

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
        <TouchableOpacity
          style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}
          onPress={handleSelectLocation}
        >
          <Text style={{ flex: 1, color: location ? '#333' : '#999' }}>
            {location || 'Select location on map'}
          </Text>
          <Ionicons name="map" size={20} color="#014737" />
        </TouchableOpacity>

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
                style={styles.deleteIconButton}
                onPress={() => removeOperatingHours(index)}
              >
                <Ionicons name="trash" size={20} color="red" />
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

        <Text style={styles.label}>Add Photos for Service <Text style={styles.fileTypes}>(File .png .jpg .jpeg)</Text></Text>
        <TouchableOpacity onPress={pickServiceImages} style={styles.uploadBox}>
          {serviceImages.length === 0 ? (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={32} color="#666" />
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
                    <Ionicons name="close-circle" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {serviceImages.length < 5 && (
                <TouchableOpacity onPress={pickServiceImages} style={styles.addMoreImagesButton}>
                  <Ionicons name="add" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>

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
  deleteIconButton: {
    
    borderRadius: 16,
    padding: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  uploadBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
    width: 80,
    height: 80,
    margin: 5,
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
    width: 80,
    height: 80,
    margin: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  fileTypes: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
  },
  serviceTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedServiceType: {
    backgroundColor: '#014737',
    borderColor: '#014737',
  },
  serviceTypeIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  serviceTypeText: {
    fontSize: 14,
    color: '#333',
  },
  selectedServiceTypeText: {
    color: 'white',
  },
});