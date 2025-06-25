import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { FIREBASE_DB } from '../screen/FirebaseConfig';
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export default function BlogList({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  const fetchBlogs = async () => {
    const q = query(collection(FIREBASE_DB, 'Blog'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBlogs(list);
    setFilteredBlogs(list);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const keyword = search.toLowerCase();
    const results = blogs.filter(
      blog =>
        blog.title?.toLowerCase().includes(keyword) ||
        blog.name?.toLowerCase().includes(keyword) ||
        blog.predescription?.toLowerCase().includes(keyword)
    );
    setFilteredBlogs(results);
  }, [search, blogs]);

  const handleDelete = id => {
    Alert.alert('Confirm Delete', 'Do you want to delete this blog?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(FIREBASE_DB, 'Blog', id));
            fetchBlogs(); // reload after delete
            Alert.alert('✅ Blog deleted');
          } catch (error) {
            console.error('Error deleting blog:', error);
            Alert.alert('❌ Failed to delete');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => navigation.navigate('EditBlog', { blog: item })}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text numberOfLines={2} style={styles.predescription}>
            {item.predescription}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('EditBlog', { blog: item })}
        style={styles.editBtn}
      >
        <Text style={styles.editText}>✏️</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Blogs</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search by title, name, or description"
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('AddBlog')}
      >
        <Text style={styles.addBtnText}>＋ Add Blog</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredBlogs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#777' }}>
            No results found.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  info: { flex: 1 },
  title: { fontWeight: 'bold', fontSize: 16 },
  name: { color: '#555' },
  predescription: { color: '#666', marginTop: 5 },
  deleteBtn: {
    padding: 5,
    marginLeft: 10,
  },
  deleteText: {
    fontSize: 20,
    color: '#D11A2A',
  },
  addBtn: {
    backgroundColor: '#002B28',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editBtn: {
    padding: 5,
    marginLeft: 5,
  },
  editText: {
    fontSize: 20,
    color: '#007AFF',
  },
});