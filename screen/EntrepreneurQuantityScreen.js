import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
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
      // Fetch entrepreneurs
      const snap = await getDocs(collection(FIREBASE_DB, 'user'));
      const entrepreneurs = snap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(u => u.role?.toLowerCase() === 'entrepreneur');

      // Fetch services and campaigns for each entrepreneur
      const usersWithDetails = await Promise.all(
        entrepreneurs.map(async (entrepreneur) => {
          // Fetch services
          const servicesQuery = query(
            collection(FIREBASE_DB, 'Services'),
            where('entrepreneurId', '==', entrepreneur.id)
          );
          const servicesSnap = await getDocs(servicesQuery);
          const services = servicesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Fetch campaigns
          const campaignsQuery = query(
            collection(FIREBASE_DB, 'CampaignSubscriptions'),
            where('entrepreneurId', '==', entrepreneur.id)
          );
          const campaignsSnap = await getDocs(campaignsQuery);
          const campaigns = campaignsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          return {
            ...entrepreneur,
            services,
            campaigns
          };
        })
      );

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

  const handleDelete = async (userId, services, campaigns) => {
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
              // Delete all services
              for (const service of services) {
                await deleteDoc(doc(FIREBASE_DB, 'Services', service.id));
              }

              // Delete all campaigns
              for (const campaign of campaigns) {
                await deleteDoc(doc(FIREBASE_DB, 'CampaignSubscriptions', campaign.id));
              }

              // Delete the entrepreneur
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
      
      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services ({item.services.length})</Text>
        {item.services.map(service => (
          <View key={service.id} style={styles.itemRow}>
            <Text style={styles.itemText}>• {service.name}</Text>
          </View>
        ))}
      </View>

      {/* Campaigns Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campaigns ({item.campaigns.length})</Text>
        {item.campaigns.map(campaign => (
          <View key={campaign.id} style={styles.itemRow}>
            <Text style={styles.itemText}>• {campaign.title}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id, item.services, item.campaigns)}
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