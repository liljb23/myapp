import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../screen/FirebaseConfig';

export default function AddBlog({ navigation }) {
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [predescription, setPredescription] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = async () => {
    if (!title || !name || !predescription || !image) {
      Alert.alert('Please fill out all fields');
      return;
    }

    try {
      await addDoc(collection(FIREBASE_DB, 'Blog'), {
        title,
        name,
        predescription,
        description,
        image,
        createdAt: serverTimestamp(),
      });
      Alert.alert('✅ Blog added successfully!');
      setTitle('');
      setName('');
      setPredescription('');
      setDescription('');
      setImage('');
      navigation.goBack(); // หรือ navigation.navigate('BlogList')
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Failed to add blog');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Blog</Text>

      <Text style={styles.label}>Blog Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. A Complete Guide to Ramadan" />

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Ramadan 2025" />

      <Text style={styles.label}>Predescription</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={predescription} onChangeText={setPredescription} multiline placeholder="Short summary..." />
    
      <Text style={styles.label}>description</Text>
      <TextInput style={[styles.input, { height: 120 }]} value={description} onChangeText={setDescription} multiline placeholder="Description..." />
    
      <Text style={styles.label}>Image URL</Text>
      <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="Paste image link here" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, color: '#555', marginTop: 10 },
  input: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginTop: 5 },
  button: { backgroundColor: '#00322D', padding: 15, borderRadius: 8, marginTop: 25, alignItems: 'center' },
  buttonText: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },
});
