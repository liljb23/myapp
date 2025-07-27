import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FIREBASE_DB } from './FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const Blog = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching blogs from Firebase...');
        
        const blogsCollectionRef = collection(FIREBASE_DB, 'Blog');
        const blogsSnapshot = await getDocs(blogsCollectionRef);
        
        const blogsData = blogsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        console.log(`✅ Fetched ${blogsData.length} blogs:`, blogsData.map(b => ({ id: b.id, title: b.title })));
        setBlogs(blogsData);
      } catch (error) {
        console.error('❌ Error fetching blogs:', error);
        setError('Failed to load blogs');
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
        <Text style={styles.loadingText}>กำลังโหลดบทความ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>ลองใหม่</Text>
        </TouchableOpacity>
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
      <Text style={styles.pageTitle}>{t('blog')}</Text>

      {/* Blog List */}
      <ScrollView>
        {blogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ไม่พบบทความ</Text>
            <Text style={styles.emptySubText}>ยังไม่มีบทความในระบบ</Text>
          </View>
        ) : (
          blogs.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.blogCard}
              onPress={() => {
                console.log('📱 Navigating to BlogDetail with:', { id: item.id, title: item.title });
                navigation.navigate('BlogDetail', { blog: item });
              }}
            >
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

                {/* Read More Button */}
                <View style={styles.actionContainer}>
                  <TouchableOpacity 
                    style={styles.readMoreButton}
                    onPress={() => {
                      console.log('📱 Read More clicked for:', item.title);
                      navigation.navigate('BlogDetail', { blog: item });
                    }}
                  >
                    <Text style={styles.readMoreText}>{t('readMore')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    fontSize: 14,
    color: '#666',
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
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#063c2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default Blog;
