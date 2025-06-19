import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FIREBASE_DB } from './FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const Blog = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const blogsCollectionRef = collection(FIREBASE_DB, 'Blog');
        const blogsSnapshot = await getDocs(blogsCollectionRef);
        setBlogs(blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#063c2f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.pageTitle}>Blog</Text>

      {/* Blog List */}
      <ScrollView>
        {blogs.map((item) => (
          <View key={item.id} style={styles.blogCard}>
            <TouchableOpacity 
              style={styles.blogCard} 
              onPress={() => navigation.navigate('BlogDetail', { blog: item })}
            />
            <Image source={{ uri: item.image }} style={styles.blogImage} />
            <View style={styles.blogContent}>
              {item.name && (
                <View style={styles.blogTag}>
                  <Text style={styles.blogTagText}>{item.name}</Text>
                </View>
              )}
              <Text style={styles.blogTitle}>{item.title}</Text>
              {/* predescription */}
              {item.predescription && (
                <Text style={styles.blogPreDescription}>{item.predescription}</Text>
              )}
              <Text style={styles.blogDescription}>{item.description}</Text>

              {/* Read More Button & Favorite */}
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => navigation.navigate('BlogDetail', { blog: item })}
                >
                  <Text style={styles.readMoreText}>Read More</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Feather
                    name={favorites.includes(item.id) ? "heart" : "heart"}
                    size={22}
                    color={favorites.includes(item.id) ? "red" : "black"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#063c2f',
    paddingVertical: 40,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: '70%',
    transform: [{ translateY: -20 }],
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  blogCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  blogImage: {
    width: '100%',
    height: 200,
  },
  blogContent: {
    padding: 15,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  blogTag: {
    backgroundColor: '#014737',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  blogTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  blogPreDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#014737',
    marginBottom: 6,
  },
  blogDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreButton: {
    backgroundColor: '#063c2f',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  readMoreText: {
    color: 'white',
    fontSize: 14,
  },
});

export default Blog;
