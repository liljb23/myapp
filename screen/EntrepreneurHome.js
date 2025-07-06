import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { signOut } from 'firebase/auth';

const EntrepreneurHome = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(FIREBASE_AUTH.currentUser);

  useFocusEffect(
    useCallback(() => {
      const fetchServices = async () => {
        const currentUser = FIREBASE_AUTH.currentUser;
        setUser(currentUser);
        setLoading(true);
        try {
          if (!currentUser) {
            navigation.navigate('Login');
            return;
          }
          const servicesRef = collection(FIREBASE_DB, 'Services');
          const q = query(servicesRef, where('EntrepreneurId', '==', currentUser.uid));
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
    }, [])
  );

  const handleAddService = () => {
    navigation.navigate('AddServices');
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

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  // handle the selected location
  const onLocationSelect = (location) => {
   
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
      {/* Custom Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo-removebg.png')}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="menu" size={24} color="white" style={{ marginRight: 16 }} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#014737"
        />
        <Ionicons name="search" size={20} color="#014737" />
      </View>

      {/* User Info Row */}
      <View style={styles.userRow}>
        <View>
          <Text style={styles.helloText}>Hello, {user?.displayName || user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        {/* <Feather name="bell" size={22} color="#014737" /> */}
        <TouchableOpacity onPress={handleLogout}>
          <Feather name="log-out" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {/* Add Service Button */}
      <TouchableOpacity style={styles.addServiceBtn} onPress={handleAddService}>
        <Feather name="plus" size={36} color="#7A8686" />
        <Text style={styles.addServiceText}>Add Service</Text>
      </TouchableOpacity>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Your Service</Text>

      {/* Content */}
      {services.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Service not found.</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#11332D',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 32,
    marginTop: -24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#014737',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 32,
    marginTop: 24,
  },
  helloText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#11332D',
  },
  emailText: {
    color: '#7A8686',
    fontSize: 13,
  },
  addServiceBtn: {
    backgroundColor: '#E9ECEC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 32,
  },
  addServiceText: {
    color: '#11332D',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 8,
  },
  sectionTitle: {
    marginHorizontal: 24,
    marginTop: 24,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#11332D',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#7A8686',
    fontSize: 16,
    marginTop: 32,
  },
  content: {
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
