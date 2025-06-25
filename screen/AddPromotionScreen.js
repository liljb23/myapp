import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons'; // Assuming you still use this for icons

export default function AddPromotionScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [validUntil, setValidUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || validUntil;
    setShowDatePicker(Platform.OS === 'ios');
    setValidUntil(currentDate);
  };

  const showMode = () => {
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!name || !description || !discount || !validUntil) {
      Alert.alert('Required Fields', 'Please fill out all fields: Promotion Name, Description, Discount, and Valid Until.');
      return;
    }

    try {
      const promotionData = {
        name,
        description,
        discount: parseFloat(discount),
        validUntil: validUntil,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(FIREBASE_DB, 'promotions'), promotionData);

      Alert.alert(
        'Success',
        'Promotion added successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('PromotionQuantityScreen') }]
      );
      setName('');
      setDescription('');
      setDiscount('');
      setValidUntil(new Date());
    } catch (error) {
      console.error('Error adding promotion:', error);
      Alert.alert('Error', 'Failed to add promotion. Please try again.');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add Promotion</Text>
      </View>

      <Text style={styles.label}>Promotion Name <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter promotion name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Discount (%) <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter discount percentage (e.g., 10)"
        keyboardType="numeric"
        value={discount}
        onChangeText={setDiscount}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Valid Until <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity onPress={showMode} style={styles.input}>
        <Text style={validUntil ? styles.inputText : styles.placeholderText}>
          {validUntil ? formatDate(validUntil) : 'Select End Date'}
        </Text>
        <Feather name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      {/* Date Picker Modal */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={validUntil}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <DateTimePicker
                    value={validUntil}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                  />
                  <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

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
  },
  required: {
    color: 'red',
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
  placeholderText: {
    color: '#999',
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    padding: 15,
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
}); 