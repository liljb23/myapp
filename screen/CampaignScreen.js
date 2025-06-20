import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from './FirebaseConfig';
import { Modal, FlatList } from 'react-native';

const CampaignScreen = ({ route }) => {
  const params = route?.params || {};
  const serviceId = params.serviceId;

  const navigation = useNavigation();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserServices = async () => {
      if (!user) return;
      const q = query(
        collection(FIREBASE_DB, 'Services'),
        where('EntrepreneurId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const userServices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(userServices);

      if (navigation.getState().routes[navigation.getState().index].params?.service) {
        setSelectedService(navigation.getState().routes[navigation.getState().index].params.service);
      } else {
        setSelectedService(userServices[0]);
      }
    };

    fetchUserServices();
  }, [navigation.getState().routes, navigation.getState().index, user]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsRef = collection(FIREBASE_DB, 'Campaigns');
        const q = query(campaignsRef, where('serviceId', '==', serviceId));
        const querySnapshot = await getDocs(q);
        const campaignsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        Alert.alert('Error', 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [serviceId]);

  const handlePayment = async (campaign) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please login to proceed with payment');
        return;
      }

      const paymentData = {
        userId: user.uid,
        serviceId,
        campaignId: campaign.id,
        amount: campaign.price,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const paymentRef = await addDoc(collection(FIREBASE_DB, 'Payments'), paymentData);
      navigation.navigate('Payment', { paymentId: paymentRef.id });
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#014737" />
      </View>
    );
  }

  if (!serviceId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>
          Please select a service from "My Services" before viewing campaigns.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
        {/*<Image source={require('../assets/logo-removebg.png')} style={styles.logo} />*/}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.tabTextActive}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButtonDisabled}
          onPress={() => {
            if (selectedService) {
              navigation.navigate('CampaignReportScreen', { serviceId: selectedService.id });
            } else {
              Alert.alert('กรุณาเลือกบริการก่อนดูรายงาน');
            }
          }}
        >
          <Text style={styles.tabTextDisabled}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Campaign Boost Your Service</Text>
        <Text style={styles.cardText}>
          "Increase visibility and attract more customers! Join our promotional campaign to get your service featured and enjoy exclusive benefits that help your business grow!" 🚀
        </Text>
      </View>

      {/* Select Service */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => setModalVisible(true)}
      >

        {selectedService ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: selectedService.image }}
              style={styles.serviceImage}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.serviceName}>{selectedService.name}</Text>
              <Text style={styles.serviceDetail} numberOfLines={1}>
                📍 {selectedService.location}
              </Text>
              <Text style={styles.serviceDetail}>
                🕒 {selectedService.operatingHours?.[0]?.day || '-'} {selectedService.operatingHours?.[0]?.openTime || ''}–{selectedService.operatingHours?.[0]?.closeTime || ''}
              </Text>
              <Text style={styles.serviceRating}>
                ⭐ {selectedService.rating || 0} / {selectedService.reviews || 0} Reviews
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#014737" />
          </View>
        ) : (
          <Text style={styles.servicePlaceholder}>เลือกบริการที่ต้องการ</Text>
        )}
      </TouchableOpacity>

      {/* Campaign Options */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select a campaign</Text>
        {campaigns.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.campaignOption, selectedCampaign?.id === c.id && styles.selectedOption, c.recommended && styles.recommendedOption]}
            onPress={() => setSelectedCampaign(c)}
          >
            <Text style={styles.starText}>{'★'.repeat(c.stars)}</Text>
            <View>
              <Text style={styles.priceText}>{c.price.toLocaleString()} THB / {c.duration}</Text>
              <Text style={styles.daysText}>({c.days} days)</Text>
            </View>
            {c.recommended && <Text style={styles.recommendBadge}>Recommend</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment Confirmation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment & Subscription Confirmation</Text>
        <Text style={styles.totalText}>
          ฿ {selectedCampaign?.price?.toLocaleString() || '0'}
        </Text>
        <Text style={styles.durationText}>
          Campaign {selectedCampaign?.price?.toLocaleString()} THB / {selectedCampaign?.duration || '-'}
        </Text>
        <TouchableOpacity style={styles.purchaseButton} onPress={() => handlePayment(selectedCampaign)}>
          <Text style={styles.purchaseText}>Proceed to Payment</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          By proceeding, you agree to HalalWay promotional program, payment terms,
          and campaign usage policy (service recommendation).
        </Text>
      </View>

      {/* Modal เลือกร้าน */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: 'white',
            width: '90%',
            borderRadius: 12,
            padding: 20,
            maxHeight: '80%',
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Select Your Services</Text>
            <FlatList
              data={services}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedService(item);
                    setModalVisible(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: selectedService?.id === item.id ? '#E6F4F2' : '#f2f2f2',
                  }}
                >
                  <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#014737' }}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{item.location}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 10,
                backgroundColor: '#014737',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#014737',
    padding: 16,
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  logo: {
    width: 200,
    height: 120,
  },
  tabContainer: { flexDirection: 'row', margin: 16 },
  tabButton: {
    flex: 1,
    backgroundColor: '#014737',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  activeTab: { backgroundColor: '#014737' },
  tabButtonDisabled: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabTextActive: { color: 'white', fontWeight: 'bold' },
  tabTextDisabled: { color: '#999' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardText: { color: '#555' },
  cardSubText: { color: '#014737', fontWeight: '600' },
  campaignOption: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  selectedOption: { borderWidth: 2, borderColor: '#014737' },
  starText: { fontSize: 20, color: '#FFD700', marginRight: 12 },
  priceText: { fontWeight: 'bold', fontSize: 16 },
  daysText: { fontSize: 12, color: '#666' },
  recommendBadge: {
    position: 'absolute',
    top: 0,
    right: 10,
    backgroundColor: '#014737',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  totalText: { fontSize: 22, fontWeight: 'bold', color: '#014737', marginTop: 8 },
  durationText: { fontSize: 14, color: '#666', marginBottom: 12 },
  purchaseButton: {
    backgroundColor: '#014737',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  purchaseText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footerNote: { fontSize: 12, color: '#666', textAlign: 'center' },
  serviceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#014737',
  },
  serviceDetail: {
    fontSize: 12,
    color: '#666',
  },
  serviceRating: {
    fontSize: 12,
    color: '#f39c12',
    marginTop: 2,
  },
  servicePlaceholder: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CampaignScreen;
