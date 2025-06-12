
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function PromotionList() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');

  const handleSubmit = () => {
    if (!name || !description || !discount) {
      Alert.alert('Please fill out all fields');
      return;
    }

    console.log('Submitted:', { name, description, discount });
    Alert.alert('Promotion added successfully!');
    setName('');
    setDescription('');
    setDiscount('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Promotion</Text>

      <Text style={styles.label}>Promotion Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter promotion name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Enter description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Discount (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter discount"
        keyboardType="numeric"
        value={discount}
        onChangeText={setDiscount}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00322D', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginTop: 10 },
  input: { backgroundColor: '#F0F0F0', padding: 12, borderRadius: 8, marginTop: 5 },
  button: { backgroundColor: '#00322D', padding: 15, borderRadius: 8, marginTop: 25, alignItems: 'center' },
  buttonText: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },
});
