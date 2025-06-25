import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';

const EntrepreneurHome = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (!user) {
          navigation.navigate('Login');
          return;
        }

        const servicesRef = collection(FIREBASE_DB, 'Services');
        const q = query(servicesRef, where('entrepreneurId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
        Alert.alert('Error', 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleAddService = () => {
    navigation.navigate('NewServices');
  };

  const handleEditService = (service) => {
    navigation.navigate('EditService', { service });
  };

  const handleViewCampaigns = (serviceId) => {
    navigation.navigate('CampaignScreen', { serviceId });
  };

  const handleDelete = (userId) => {
    Alert.alert(
      'Delete Entrepreneur',
      'Are you sure you want to delete this entrepreneur?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(FIREBASE_DB, 'user', userId));
              setServices(services.filter(u => u.id !== userId));
              Alert.alert('Entrepreneur deleted');
            } catch (error) {
              console.error('Error deleting entrepreneur:', error);
              Alert.alert('Failed to delete entrepreneur');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002B28" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>My Services</Text>
          <Text style={styles.quantityText}>Total: {services.length}</Text>
        </View>
        <TouchableOpacity onPress={handleAddService}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
        {services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={50} color="#999" />
          <Text style={styles.emptyText}>No services found</Text>
          <Text style={styles.emptySubText}>Tap the + button to add your first service</Text>
          </View>
        ) : (
        <ScrollView style={styles.content}>
          {services.map((service) => (
            <View key={service.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.imageContainer}>
              <Image source={{ uri: service.image }} style={styles.serviceImage} />
                </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceLocation}>{service.location}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {service.rating || 'N/A'}</Text>
                  <Text style={styles.reviewCount}>({service.reviews || 0} reviews)</Text>
                </View>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{service.location || 'No location'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="star-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>Rating: {service.rating || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="chatbubble-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>Reviews: {service.reviews || 0}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                  <TouchableOpacity
                  style={styles.actionButton}
                    onPress={() => handleEditService(service)}
                  >
                  <Ionicons name="create-outline" size={20} color="#002B28" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                    onPress={() => handleViewCampaigns(service.id)}
                  >
                  <Ionicons name="pricetag-outline" size={20} color="#002B28" />
                  <Text style={styles.actionButtonText}>Campaigns</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ marginTop: 10, backgroundColor: '#ffeaea', padding: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}
                    onPress={() => handleDelete(service.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#D11A2A" />
                    <Text style={{ color: '#D11A2A', marginLeft: 5 }}>Delete</Text>
                  </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        )}

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={handleAddService}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.tabText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="white" />
          <Text style={styles.tabText}>Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 120,
    backgroundColor: '#002B28',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  content: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
    marginBottom: 15,
  },
  imageContainer: {
    marginRight: 15,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#002B28',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  viewButton: {
    backgroundColor: '#e8f5e9',
  },
  actionButtonText: {
    marginLeft: 5,
    color: '#002B28',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#002B28',
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 3,
  },
});

export default EntrepreneurHome;