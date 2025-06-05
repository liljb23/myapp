import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_STORAGE, FIREBASE_AUTH } from './FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const NewServices = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    time: '',
    parking: '',
    phone: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication state
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to add services.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login-email') }]
      );
      return;
    }
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `service_${Date.now()}_${uri.substring(uri.lastIndexOf('/') + 1)}`;
      const storageRef = ref(FIREBASE_STORAGE, `services/${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name) errors.push('Service Name');
    if (!formData.location) errors.push('Location');
    if (!formData.time) errors.push('Operating Hours');
    if (!formData.phone) errors.push('Contact Number');

    if (errors.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in the following required fields:\n${errors.join('\n')}`,
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add services');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      const serviceData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        time: formData.time.trim(),
        parking: formData.parking.trim() || 'Not specified',
        phone: formData.phone.trim(),
        imageUrl: imageUrl,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'active',
      };

      const docRef = await addDoc(collection(FIREBASE_DB, 'Services'), serviceData);
      
      Alert.alert(
        'Success',
        'Service added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding service:', error);
      Alert.alert(
        'Error',
        'Failed to add service. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00322D" />
        <Text style={styles.loadingText}>Adding service...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#00322D" />
              <Text style={styles.imagePlaceholderText}>Add Service Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Service Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter service name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Operating Hours <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mon-Fri: 9:00 AM - 6:00 PM"
            value={formData.time}
            onChangeText={(text) => setFormData({ ...formData, time: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Parking Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter parking details"
            value={formData.parking}
            onChangeText={(text) => setFormData({ ...formData, parking: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Number <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>Add Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#00322D',
    fontSize: 16,
  },
  header: {
    height: 100,
    backgroundColor: '#00322D',
    paddingHorizontal: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  imagePickerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#00322D',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00322D',
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#00322D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default NewServices;
