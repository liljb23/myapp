import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getFirestore, collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { useAuth } from '../screen/AuthContext';
import { Modal, FlatList } from 'react-native';


const db = getFirestore();

const campaignOptions = [
  { id: 1, stars: 1, price: 1, duration: '1 Month', days: 30 },
  { id: 2, stars: 3, price: 1200, duration: '3 Month', days: 90, recommended: true },
  { id: 3, stars: 5, price: 2500, duration: '6 Month', days: 180 },
];

export default function CampaignScreen({ navigation, route }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  

  useEffect(() => {
    const fetchUserServices = async () => {
      if (!user) return;
      const q = query(collection(db, 'Services'), where('EntrepreneurId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userServices = [];
      querySnapshot.forEach(doc => {
        userServices.push({ id: doc.id, ...doc.data() });
      });
      setServices(userServices);

      // 👉 ถ้ามี route.params.service ให้ set เป็น selected
      if (route?.params?.service) {
        setSelectedService(route.params.service);
      } else {
        setSelectedService(userServices[0]);
      }
    };

    fetchUserServices();
  }, [user, route?.params?.service]);


  const handlePurchase = async () => {
    if (!selectedService || !selectedCampaign) {
      Alert.alert('Please select service and campaign.');
      return;
    }

    try {
      const createdAt = new Date();
      const endDate = new Date();
      endDate.setDate(createdAt.getDate() + selectedCampaign.days);

      // บันทึกไว้ก่อนใน Firestore
      const docRef = await addDoc(collection(db, 'CampaignSubscriptions'), {
        EntrepreneurId: user.uid,
        serviceId: selectedService.id,
        campaignId: selectedCampaign.id,
        campaignName: `${selectedCampaign.stars} Stars - ${selectedCampaign.duration}`,
        price: selectedCampaign.price,
        duration: selectedCampaign.duration,
        days: selectedCampaign.days,
        createdAt: Timestamp.fromDate(createdAt),
        endDate: Timestamp.fromDate(endDate),
        status: 'waiting_payment',
      });

      // ส่งไปหน้า QR PromptPay พร้อมข้อมูล
      navigation.navigate('PaymentScreen', {
        amount: selectedCampaign.price,
        campaignName: `${selectedCampaign.stars} Stars - ${selectedCampaign.duration}`,
        campaignId: docRef.id
      });

    } catch (error) {
      console.error('Error saving campaign:', error);
      Alert.alert('Error', 'Failed to process. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
        <Image source={require('../assets/logo-removebg.png')} style={styles.logo} />
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
              Alert.alert('Please select a service first.');
            }
          }}
        >
          <Text style={styles.tabTextDisabled}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>แคมเปญเพิ่มยอดขายบริการของคุณ</Text>
        <Text style={styles.cardText}>
          "เพิ่มการมองเห็นและดึงดูดลูกค้าให้มากขึ้น! เข้าร่วมแคมเปญโปรโมชั่นของเราเพื่อให้บริการของคุณโดดเด่นและเพลิดเพลินกับสิทธิประโยชน์พิเศษที่ช่วยให้ธุรกิจของคุณเติบโต!" 🚀
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
                ⭐ {selectedService.rating || 0} / {selectedService.reviews || 0} รีวิว
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
        <Text style={styles.cardTitle}>เลือกแคมเปญ</Text>
        {campaignOptions.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.campaignOption, selectedCampaign?.id === c.id && styles.selectedOption, c.recommended && styles.recommendedOption]}
            onPress={() => setSelectedCampaign(c)}
          >
            <Text style={styles.starText}>{'★'.repeat(c.stars)}</Text>
            <View>
              <Text style={styles.priceText}>{c.price.toLocaleString()} บาท / {c.duration}</Text>
              <Text style={styles.daysText}>({c.days} วัน)</Text>
            </View>
            {c.recommended && <Text style={styles.recommendBadge}>แนะนำ</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment Confirmation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>การยืนยันการชำระเงินและสมัครสมาชิก</Text>
        <Text style={styles.totalText}>
          ฿ {selectedCampaign?.price?.toLocaleString() || '0'}
        </Text>
        <Text style={styles.durationText}>
          แคมเปญ {selectedCampaign?.price?.toLocaleString()} บาท / {selectedCampaign?.duration || '-'}
        </Text>
        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseText}>ซื้อ</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          เมื่อดำเนินการต่อ คุณยอมรับโปรแกรมโปรโมชั่น HalalWay เงื่อนไขการชำระเงิน
          และนโยบายการใช้งานแคมเปญ (การแนะนำบริการ)
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
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>เลือกบริการของคุณ</Text>
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
              <Text style={{ color: 'white', fontWeight: 'bold' }}>เสร็จสิ้น</Text>
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
});