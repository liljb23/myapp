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
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#014737" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Services</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="package" size={48} color="#014737" />
            <Text style={styles.emptyStateText}>
              You haven't added any services yet.{'\n'}
              Tap the + button to add your first service.
            </Text>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <Image source={{ uri: service.image }} style={styles.serviceImage} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceLocation}>{service.location}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {service.rating || 'N/A'}</Text>
                  <Text style={styles.reviewCount}>({service.reviews || 0} reviews)</Text>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditService(service)}
                  >
                    <Feather name="edit-2" size={16} color="#014737" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.campaignButton]}
                    onPress={() => handleViewCampaigns(service.id)}
                  >
                    <Feather name="tag" size={16} color="#014737" />
                    <Text style={styles.campaignButtonText}>Campaigns</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#014737',
  },
  addButton: {
    backgroundColor: '#014737',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  serviceInfo: {
    padding: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#014737',
  },
  serviceLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    color: '#014737',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    borderColor: '#014737',
    marginRight: 8,
  },
  campaignButton: {
    borderColor: '#014737',
    marginLeft: 8,
  },
  editButtonText: {
    marginLeft: 8,
    color: '#014737',
    fontSize: 14,
    fontWeight: '500',
  },
  campaignButtonText: {
    marginLeft: 8,
    color: '#014737',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EntrepreneurHome;