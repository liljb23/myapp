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
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FIREBASE_DB } from '../screen/FirebaseConfig';

export default function NotiAdmin({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(FIREBASE_DB, 'CampaignSubscriptions'),
          orderBy('verifiedAt', 'desc')
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.left}>
        {item.slipUrl ? (
          <Image source={{ uri: item.slipUrl }} style={styles.image} />
        ) : (
          <Ionicons name="receipt-outline" size={40} color="#014737" />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.amount}>
          {item.amount ? `฿${item.amount}` : 'No amount'}
        </Text>
        <Text style={styles.status}>
          Status: {item.status || 'pending'}
        </Text>
        <Text style={styles.date}>
          {item.verifiedAt
            ? new Date(item.verifiedAt.seconds * 1000).toLocaleString()
            : 'No date'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => {
          if (item.slipUrl) {
            navigation.navigate('SlipDetail', { slipUrl: item.slipUrl });
          }
        }}
      >
        <Ionicons name="eye-outline" size={24} color="#014737" />
      </TouchableOpacity>
    </View>
  );

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
  left: { marginRight: 15 },
  image: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
  info: { flex: 1 },
  amount: { fontWeight: 'bold', fontSize: 16, color: '#014737' },
  status: { color: '#666', marginTop: 2 },
  date: { color: '#999', fontSize: 12, marginTop: 2 },
  viewBtn: { padding: 8 },
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
