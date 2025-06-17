import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../screen/FirebaseConfig';

export default function AddPromotion() {
  const [name, setName] = useState('');
  const [service, setService] = useState('');

  const handleSubmit = async () => {
    if (!name || !service) return Alert.alert('Error', 'Please fill all fields');
    try {
      await addDoc(collection(db, 'promotions'), { name, service });
      Alert.alert('Success', 'Promotion added successfully');
      setName('');
      setService('');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Promotion</Text>
      <TextInput placeholder="Promotion Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Service Name" value={service} onChangeText={setService} style={styles.input} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
});
