import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';

export default function AddServiceScreen() {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    if (!serviceName || !description || !price) {
      Alert.alert('Please fill out all fields');
      return;
    }

    console.log('Submitted:', { serviceName, description, price });
    Alert.alert('Service added successfully!');

    setServiceName('');
    setDescription('');
    setPrice('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Service</Text>

      <Text style={styles.label}>Service Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter service name"
        placeholderTextColor="#999"
        value={serviceName}
        onChangeText={setServiceName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Enter service description"
        placeholderTextColor="#999"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Price (THB)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter price"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#00322D',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#00322D',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#E8ECEC',
    padding: 12,
    borderRadius: 14,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#00322D',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
