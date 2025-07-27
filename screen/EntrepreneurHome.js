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
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

/**
 * หน้าหลักสำหรับผู้ประกอบการ - จัดการบริการและโปรโมชั่น
 */
const EntrepreneurHome = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(FIREBASE_AUTH.currentUser);
  const { t } = useTranslation();
  const [promotionsMap, setPromotionsMap] = useState({});

  /**
   * ดึงข้อมูลบริการและโปรโมชั่นเมื่อเข้าหน้า
   */
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
            ...doc.data(),
            status: doc.data().status || 'active', // Default to active if no status
          }));
          setServices(servicesData);

          // Fetch promotions for all services
          if (servicesData.length > 0) {
            const serviceIds = servicesData.map(s => s.id);
            const promoQ = query(collection(FIREBASE_DB, 'promotions'), where('serviceId', 'in', serviceIds));
            const promoSnap = await getDocs(promoQ);
            const map = {};
            promoSnap.docs.forEach(doc => {
              const promo = { id: doc.id, ...doc.data() };
              if (!map[promo.serviceId]) map[promo.serviceId] = [];
              map[promo.serviceId].push(promo);
            });
            setPromotionsMap(map);
          } else {
            setPromotionsMap({});
          }
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

  /**
   * นำทางไปหน้าเพิ่มบริการ
   */
  const handleAddService = () => {
    navigation.navigate('AddServices');
  };

  /**
   * นำทางไปหน้าแก้ไขบริการ
   */
  const handleEditService = (service) => {
    navigation.navigate('EditServiceEntrepreneur', { service });
  };

  /**
   * นำทางไปหน้าจัดการแคมเปญ
   */
  const handleViewCampaigns = (serviceId) => {
    navigation.navigate('CampaignScreen', { serviceId });
  };

  /**
   * จัดการสถานะบริการ (active/inactive)
   */
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

  /**
   * ออกจากระบบ
   */
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

  /**
   * จัดการตำแหน่งที่เลือก
   */
  const onLocationSelect = (location) => {
   
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002B28" />
      </View>
    );
  }

  const activeServices = services.filter(service => service.status === 'active');
  const inactiveServices = services.filter(service => service.status === 'inactive');

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo-removebg.png')}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Menu')}>
          <Feather name="menu" size={28} color="white" />
        </TouchableOpacity>
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
          <Text style={styles.helloText}>{t('helloUser', { name: user?.displayName || user?.email?.split('@')[0] || t('user') })}</Text>
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
        <Text style={styles.addServiceText}>{t('addService')}</Text>
      </TouchableOpacity>

      {/* Section Title with Status Counts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('yourService')}</Text>
        <Text style={styles.statusCount}>
          Active: {activeServices.length} | Inactive: {inactiveServices.length} | Total: {services.length}
        </Text>
      </View>

      {/* Content */}
      {services.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Service not found.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {services.map((service) => (
            <View key={service.id} style={[styles.card, service.status === 'inactive' && styles.inactiveCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: service.image }} style={styles.serviceImage} />
                </View>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNameRow}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={[
                      styles.statusBadge, 
                      service.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                    ]}>
                      <Text style={[
                        styles.statusText,
                        service.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
                      ]}>
                        {service.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
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

              {/* Promotions Section */}
              {promotionsMap[service.id] && promotionsMap[service.id].length > 0 && (
                <View style={{ marginTop: 10, backgroundColor: '#e6f2ef', borderRadius: 8, padding: 10 }}>
                  <Text style={{ fontWeight: 'bold', color: '#014737', marginBottom: 4 }}>Promotions</Text>
                  {promotionsMap[service.id].map(promo => (
                    <TouchableOpacity
                      key={promo.id}
                      style={{ marginBottom: 6, padding: 6, backgroundColor: '#fff', borderRadius: 6 }}
                      onPress={() => navigation.navigate('DiscountDetailEntrepreneur', { promotionDocId: promo.id })}
                    >
                      <Text style={{ fontWeight: 'bold', color: '#11332D' }}>{promo.title}</Text>
                      <Text style={{ color: '#666' }}>{promo.description}</Text>
                      <Text style={{ color: '#014737' }}>Discount: {promo.discount ? `${promo.discount}%` : 'N/A'}</Text>
                      <Text style={{ color: '#999', fontSize: 12 }}>Valid until: {promo.validUntil && promo.validUntil.seconds ? new Date(promo.validUntil.seconds * 1000).toLocaleDateString() : 'N/A'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

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
                  style={[
                    styles.actionButton,
                    service.status === 'active' ? styles.deactivateButton : styles.activateButton
                  ]}
                  onPress={() => handleStatusToggle(service.id, service.status)}
                >
                  <Ionicons 
                    name={service.status === 'active' ? 'pause-outline' : 'play-outline'} 
                    size={20} 
                    color={service.status === 'active' ? '#F44336' : '#4CAF50'} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    service.status === 'active' ? styles.deactivateButtonText : styles.activateButtonText
                  ]}>
                    {service.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Text>
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
    fontWeight: 'bold',
    fontSize: 16,
    color: '#11332D',
  },
  statusCount: {
    fontSize: 14,
    color: '#7A8686',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
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
  inactiveCard: {
    opacity: 0.7,
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
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 10,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#FBE9E7',
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
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  activateButton: {
    backgroundColor: '#E8F5E9',
  },
  activateButtonText: {
    color: '#4CAF50',
  },
  deactivateButton: {
    backgroundColor: '#FFEBEE',
  },
  deactivateButtonText: {
    color: '#F44336',
  },
});

export default EntrepreneurHome;