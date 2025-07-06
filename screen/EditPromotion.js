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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';

const EditPromotion = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { promoId, existingData } = route.params;

  const [name, setName] = useState(existingData?.name || '');
  const [description, setDescription] = useState(existingData?.description || '');
  const [discount, setDiscount] = useState(String(existingData?.discount || ''));
  const [startDate, setStartDate] = useState(existingData?.startDate?.seconds ? new Date(existingData.startDate.seconds * 1000) : new Date());
  const [endDate, setEndDate] = useState(existingData?.endDate?.seconds ? new Date(existingData.endDate.seconds * 1000) : new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState('');

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');

    if (selectedDateType === 'startDate') {
      setStartDate(currentDate);
    } else if (selectedDateType === 'endDate') {
      setEndDate(currentDate);
    }
  };

  const showMode = (type) => {
    setSelectedDateType(type);
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) return 'N/A';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleUpdate = async () => {
    if (!name || !description || !discount || !startDate || !endDate) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      const promotionRef = doc(FIREBASE_DB, 'promotions', promoId);
      await updateDoc(promotionRef, {
        name,
        description,
        discount: parseFloat(discount),
        startDate,
        endDate,
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Promotion</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.label}>Promotion Name <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Promotion Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        multiline
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Discount (%) <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Discount percentage"
        value={discount}
        keyboardType="numeric"
        onChangeText={setDiscount}
      />

      <Text style={styles.label}>Start Date <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity onPress={() => showMode('startDate')} style={styles.inputField}>
        <Text>{formatDate(startDate)}</Text>
        <Ionicons name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.label}>End Date <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity onPress={() => showMode('endDate')} style={styles.inputField}>
        <Text>{formatDate(endDate)}</Text>
        <Ionicons name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDateType === 'startDate' ? startDate : endDate}
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
                    value={selectedDateType === 'startDate' ? startDate : endDate}
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
  header: {
    height: 100,
    backgroundColor: '#002B28',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  inputField: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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

export default EditPromotion;
