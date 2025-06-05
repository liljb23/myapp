import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notiData, setNotiData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(FIREBASE_DB, 'notifications'), (snapshot) => {
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotiData(newData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      <FlatList
        data={notiData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Image
                //source={require('../Image/money-bag.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardCenter}>
              <Text style={styles.timeText}>{item.time}</Text>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.amountText}>Total amount {item.amount}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#00322D" />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminScreen')}>
          <Ionicons name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('NewServices')}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.tabText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="notifications" size={24} color="#FFD700" />
          <Text style={styles.tabTextActive}>Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 100,
    backgroundColor: '#00322D',
    paddingHorizontal: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  cardLeft: {
    marginRight: 12,
  },
  cardCenter: {
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
  },
  messageText: {
    fontWeight: 'bold',
    color: '#00322D',
    fontSize: 14,
    marginTop: 2,
  },
  amountText: {
    fontSize: 13,
    marginTop: 2,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#00322D',
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
  tabTextActive: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 3,
  },
}); 