import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { FIREBASE_DB } from '../screen/FirebaseConfig';

const ALLOWED_CATEGORIES = [
  'Restaurant',
  'Beauty & Salon',
  'Prayer Space',
  'Mosque',
  'Tourist Attraction',
  'Resort & Hotel',
];

export default function ServicesQuantityScreen() {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  const fetchServices = async () => {
    try {
      const snap = await getDocs(collection(FIREBASE_DB, 'Services'));
      const servicesList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'active', // Default to active if no status
      }));
      setServices(servicesList);
    } catch (e) {
      console.error('🔥 Error fetching services:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    setCategories(['All', ...ALLOWED_CATEGORIES]);
  }, []);

  // Filtered services based on search and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStatusToggle = async (serviceId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Service`,
      `Are you sure you want to ${actionText} this service?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: newStatus === 'inactive' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateDoc(doc(FIREBASE_DB, 'Services', serviceId), {
                status: newStatus,
                updatedAt: new Date()
              });
              
              // Update local state
              setServices(services.map(service => 
                service.id === serviceId 
                  ? { ...service, status: newStatus }
                  : service
              ));
              
              Alert.alert('Success', `Service ${actionText}d successfully`);
            } catch (error) {
              console.error('Error updating service status:', error);
              Alert.alert('Error', `Failed to ${actionText} service`);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (service) => {
    navigation.navigate('EditService', { service });
  };

  const handleView = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const renderServiceCard = ({ item }) => (
    <View style={[styles.card, item.status === 'inactive' && styles.inactiveCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {(() => {
            let imageUrl = null;
            if (item.image) {
              imageUrl = item.image;
            } else if (Array.isArray(item.serviceImages) && item.serviceImages.length > 0) {
              imageUrl = item.serviceImages[0];
            }
            if (imageUrl) {
              return (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.serviceImage}
                />
              );
            } else {
              return <Ionicons name="image-outline" size={40} color="#002B28" />;
            }
          })()}
        </View>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceNameRow}>
            <Text style={styles.serviceName}>{item.name || 'N/A'}</Text>
            <View style={[
              styles.statusBadge, 
              item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.statusText,
                item.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
              ]}>
                {item.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.category}>{item.category || 'No category'}</Text>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="document-text-outline" size={20} color="#666" />
          <Text style={styles.detailText}>{item.description || 'No description'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.detailText}>{item.location || 'No location'}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color="#002B28" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            item.status === 'active' ? styles.deactivateButton : styles.activateButton
          ]}
          onPress={() => handleStatusToggle(item.id, item.status)}
        >
          <Ionicons 
            name={item.status === 'active' ? 'pause-outline' : 'play-outline'} 
            size={20} 
            color={item.status === 'active' ? '#F44336' : '#4CAF50'} 
          />
          <Text style={[
            styles.actionButtonText,
            item.status === 'active' ? styles.deactivateButtonText : styles.activateButtonText
          ]}>
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleView(item)}
        >
          <Ionicons name="eye-outline" size={20} color="#002B28" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeServices = services.filter(service => service.status === 'active');
  const inactiveServices = services.filter(service => service.status === 'inactive');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Services Management</Text>
          <Text style={styles.quantityText}>
            Active: {activeServices.length} | Inactive: {inactiveServices.length} | Total: {services.length}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddServiceScreen')}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterButton, selectedCategory === cat && styles.filterButtonActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterButtonText, selectedCategory === cat && styles.filterButtonTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#002B28" style={{ marginTop: 40 }} />
      ) : filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={50} color="#999" />
          <Text style={styles.emptyText}>No services found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderServiceCard}
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminScreen')}>
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
  listContainer: {
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
  inactiveCard: {
    opacity: 0.7, // Make inactive cards slightly faded
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  serviceImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 10,
  },
  activeBadge: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  inactiveBadge: {
    backgroundColor: '#fdecea',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeStatusText: {
    color: '#4CAF50',
  },
  inactiveStatusText: {
    color: '#F44336',
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
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
    marginRight: 8,
  },
  activateButton: {
    backgroundColor: '#e8f5e9',
  },
  deactivateButton: {
    backgroundColor: '#fdecea',
  },
  actionButtonText: {
    marginLeft: 5,
    color: '#002B28',
    fontSize: 14,
  },
  activateButtonText: {
    color: '#4CAF50',
  },
  deactivateButtonText: {
    color: '#F44336',
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterScroll: {
    marginBottom: 10,
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 6,
    marginRight: 10,
    width: 130, // Fixed width for uniform size
    height: 40,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#002B28',
  },
  filterButtonText: {
    color: '#333',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 3,
  },
}); 