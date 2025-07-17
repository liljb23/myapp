import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../screen/FirebaseConfig';

function timeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return `${Math.floor(diffMs / (1000 * 60))} min ago`;
  return `${diffH} hours ago`;
}

export default function NotiAdmin({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(FIREBASE_DB, 'CampaignSubscriptions'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const list = await Promise.all(snap.docs.map(async docSnap => {
          const data = docSnap.data();
          let serviceName = '';
          let serviceImage = null;
          if (data.serviceId) {
            const serviceDoc = await getDoc(doc(FIREBASE_DB, 'Services', data.serviceId));
            if (serviceDoc.exists()) {
              const serviceData = serviceDoc.data();
              serviceName = serviceData.name || '';
              serviceImage = serviceData.image || null;
            }
          }
          return {
            id: docSnap.id,
            ...data,
            serviceName,
            serviceImage,
          };
        }));
        setTransactions(list);
      } catch (e) {
        console.error('Error fetching transactions:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const renderItem = ({ item }) => {
    // เวลา
    let timeText = '';
    if (item.createdAt && item.createdAt.seconds) {
      const date = new Date(item.createdAt.seconds * 1000);
      timeText = timeAgo(date);
    }
    // สถานะ
    let statusColor = '#888';
    let statusLabel = '';
    if (item.status === 'waiting_payment') {
      statusColor = '#FFD700';
      statusLabel = 'Waiting Payment';
    } else if (item.status === 'approved') {
      statusColor = '#2ecc40';
      statusLabel = 'Approved';
    } else {
      statusLabel = item.status || '';
    }

    // รูปจาก Services
    const serviceImage = item.serviceImage;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SlipDetail', { slip: item })}
      >
        <Image source={typeof serviceImage === 'string' ? { uri: serviceImage } : serviceImage} style={styles.moneyIcon} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.timeText}>{timeText}</Text>
          <Text style={styles.boldText}>
            {item.serviceName
              ? `Money transferred for "${item.serviceName}"`
              : 'There is money transferred into the account.'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={styles.amountText}>
              Total amount {item.price ? `${item.price} ฿` : '-'}
            </Text>
            <Text style={[styles.statusText, { color: statusColor, marginLeft: 10 }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#014737" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Money Transaction</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#014737" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#777' }}>
              No transactions found.
            </Text>
          }
        />
      )}

      {/* Optional: Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminScreen')}>
          <Ionicons name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AddScreen')}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.tabText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('NotiAdmin')}>
          <Ionicons name="notifications-outline" size={24} color="#FFD700" />
          <Text style={styles.tabTextActive}>Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBar: {
    height: 80,
    backgroundColor: '#002B28',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  moneyIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  timeText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#014737',
    fontSize: 15,
    marginBottom: 2,
  },
  amountText: {
    color: '#014737',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#002B28',
    paddingVertical: 10,
    justifyContent: 'space-around',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabItem: { alignItems: 'center' },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 3,
  },
  tabTextActive: {
    color: '#FDCB02',
    fontSize: 12,
    marginTop: 3,
  },
});
