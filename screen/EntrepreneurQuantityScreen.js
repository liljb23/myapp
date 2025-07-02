import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FIREBASE_DB } from '../screen/FirebaseConfig';

export default function EntrepreneurQuantityScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // 1. Fetch all entrepreneurs
      const userSnap = await getDocs(collection(FIREBASE_DB, 'user'));
      const entrepreneurs = userSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.role && u.role.toLowerCase() === 'entrepreneur');

      if (entrepreneurs.length === 0) {
        console.log('No entrepreneurs found.');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // 2. Fetch all services and campaigns at once
      const servicesSnap = await getDocs(collection(FIREBASE_DB, 'Services'));
      const campaignsSnap = await getDocs(collection(FIREBASE_DB, 'CampaignSubscriptions'));
      console.log('Fetched services:', servicesSnap.docs.length);
      console.log('Fetched campaigns:', campaignsSnap.docs.length);

      // 3. Group services and campaigns by entrepreneur ID for efficient lookup
      const servicesByEntrepreneur = servicesSnap.docs.reduce((acc, doc) => {
        const service = { id: doc.id, ...doc.data() };
        if (service.EntrepreneurId) {
          (acc[service.EntrepreneurId] = acc[service.EntrepreneurId] || []).push(service);
        }
        return acc;
      }, {});

      const campaignsByEntrepreneur = campaignsSnap.docs.reduce((acc, doc) => {
        const campaign = { id: doc.id, ...doc.data() };
        if (campaign.EntrepreneurId) {
          (acc[campaign.EntrepreneurId] = acc[campaign.EntrepreneurId] || []).push(campaign);
        }
        return acc;
      }, {});

      // Create a map of all services for quick name lookup
      const serviceNameMap = servicesSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name;
        return acc;
      }, {});
      
      // 4. Combine the data
      const usersWithDetails = entrepreneurs.map(entrepreneur => {
        const services = servicesByEntrepreneur[entrepreneur.id] || [];
        const campaigns = (campaignsByEntrepreneur[entrepreneur.id] || []).map(campaign => ({
          ...campaign,
          serviceName: serviceNameMap[campaign.serviceId] || 'Service not found',
        }));

        return {
          ...entrepreneur,
          services,
          campaigns,
        };
      });

      console.log('✅ Entrepreneurs with details:', usersWithDetails);
      setUsers(usersWithDetails);
    } catch (e) {
      console.error('🔥 Error fetching entrepreneurs:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleDelete = async (userId) => {
    Alert.alert(
      'Delete Entrepreneur',
      'Are you sure you want to delete this entrepreneur? This will also delete all associated services and campaigns.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. ลบ Services ทั้งหมดของ entrepreneur
              const servicesQuery = query(
                collection(FIREBASE_DB, 'Services'),
                where('EntrepreneurId', '==', userId)
              );
              const servicesSnap = await getDocs(servicesQuery);
              for (const docSnap of servicesSnap.docs) {
                await deleteDoc(doc(FIREBASE_DB, 'Services', docSnap.id));
              }

              // 2. ลบ Campaigns ทั้งหมดของ entrepreneur
              const campaignsQuery = query(
                collection(FIREBASE_DB, 'CampaignSubscriptions'),
                where('EntrepreneurId', '==', userId)
              );
              const campaignsSnap = await getDocs(campaignsQuery);
              for (const docSnap of campaignsSnap.docs) {
                await deleteDoc(doc(FIREBASE_DB, 'CampaignSubscriptions', docSnap.id));
              }

              // 3. ลบ entrepreneur
              await deleteDoc(doc(FIREBASE_DB, 'user', userId));

              setUsers(users.filter(u => u.id !== userId));
              Alert.alert('Success', 'Entrepreneur and all associated data deleted successfully');
            } catch (error) {
              console.error('Error deleting entrepreneur:', error);
              Alert.alert('Error', 'Failed to delete entrepreneur and associated data');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.username}>ชื่อ: {item.name || 'N/A'}</Text>
      <Text style={styles.email}>อีเมล: {item.email || 'N/A'}</Text>
      <Text style={styles.email}>เบอร์โทร: {item.phone || '-'}</Text>
      <Text style={styles.email}>EntrepreneurId: {item.id}</Text>
      
      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services ({item.services.length})</Text>
        {item.services.map(service => (
          <View key={service.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              • {service.name} (ServiceId: {service.id}, EntrepreneurId: {service.EntrepreneurId})
            </Text>
          </View>
        ))}
      </View>

      {/* Campaigns Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campaigns ({item.campaigns.length})</Text>
        {item.campaigns.map(campaign => (
          <View key={campaign.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              • Campaign ID: {campaign.id} for service '{campaign.serviceName}' (Service ID: {campaign.serviceId})
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#D11A2A" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Entrepreneurs Quantity</Text>
          <Text style={styles.quantityText}>Total: {users.length}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#002B28" style={{ marginTop: 40 }} />
      ) : users.length === 0 ? (
        <Text style={styles.noDataText}>
          ไม่พบผู้ใช้ประเภท Entrepreneur
        </Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
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
  card: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002B28',
    marginBottom: 8,
  },
  itemRow: {
    marginLeft: 10,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    marginTop: 15,
    backgroundColor: '#ffeaea',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#D11A2A',
    marginLeft: 5,
  },
  listContent: {
    padding: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
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
  tabTextActive:{
    color:'#FFD700',
    fontSize: 12,
    marginTop: 3,
  }
}); 
