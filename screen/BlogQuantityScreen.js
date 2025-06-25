import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { FIREBASE_DB } from '../screen/FirebaseConfig';

export default function BlogQuantityScreen() {
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const snap = await getDocs(collection(FIREBASE_DB, 'Blog'));
        const blogsList = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlogs(blogsList);
      } catch (e) {
        console.error('🔥 Error fetching blogs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleDelete = (blogId) => {
    Alert.alert(
      'Delete Blog',
      'Are you sure you want to delete this blog?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(FIREBASE_DB, 'Blog', blogId));
              setBlogs(blogs.filter(b => b.id !== blogId));
              Alert.alert('Blog deleted');
            } catch (error) {
              console.error('Error deleting blog:', error);
              Alert.alert('Failed to delete blog');
            }
          },
        },
      ]
    );
  };

  const renderBlogCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.blogImage} />
          ) : (
            <Ionicons name="image-outline" size={50} color="#002B28" />
          )}
        </View>
        <View style={styles.blogInfo}>
          <Text style={styles.blogName}>{item.name || 'N/A'}</Text>
          <Text style={styles.blogTitle}>{item.title || 'N/A'}</Text>
          <Text style={styles.blogPre}>{item.predescription || 'N/A'}</Text>
        </View>
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => navigation.navigate('BlogList', { blogId: item.id })}
        >
          <Ionicons name="eye-outline" size={28} color="#014737" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditBlog', { blog: item })}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#D11A2A" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Blogs</Text>
          <Text style={styles.quantityText}>Total: {blogs.length}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#002B28" style={{ marginTop: 40 }} />
      ) : blogs.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>
          ไม่พบบทความ
        </Text>
      ) : (
        <FlatList
          data={blogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderBlogCard}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Admin')}>
          <Ionicons name="home-outline" size={24} color="#FFD700" />
          <Text style={styles.tabTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AddScreen')}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.tabText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('NotificationScreen')}>
          <Ionicons name="notifications-outline" size={24} color="white" />
          <Text style={styles.tabText}>Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 120,
    backgroundColor: '#002B28',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 15,
  },
  blogImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  blogInfo: {
    flex: 1,
  },
  blogName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  blogTitle: {
    fontSize: 15,
    color: '#002B28',
    fontWeight: '600',
    marginBottom: 2,
  },
  blogPre: {
    fontSize: 14,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#002B28',
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  tabItem: { alignItems: 'center' },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 3,
  },
  tabTextActive: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 3,
  },
  eyeBtn: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 