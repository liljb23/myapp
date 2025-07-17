import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notiData, setNotiData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(FIREBASE_DB, 'notifications'), async (snapshot) => {
      const newData = await Promise.all(snapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        let shopName = null;
        let shopImage = null;

        // ถ้า serviceId มีค่า ให้ไปดึงข้อมูลร้านจาก Services
        if (data.serviceId) {
          try {
            const serviceSnap = await getDoc(doc(FIREBASE_DB, 'Services', data.serviceId));
            if (serviceSnap.exists()) {
              const serviceData = serviceSnap.data();
              shopName = serviceData.name || null;
              shopImage = serviceData.image || null;
            }
          } catch (e) {
            shopName = null;
            shopImage = null;
          }
        }

        // ถ้ามี image ใน notification ให้ใช้เลย
        if (data.image && data.image !== '') {
          shopImage = data.image;
        }

        return {
          id: docSnap.id,
          ...data,
          shopName,
          shopImage,
        };
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
          <TouchableOpacity
            onPress={() => {
              if (item.promotionDocId) {
                navigation.navigate('DiscountDetail', { promotionDocId: item.promotionDocId });
              }
            }}
            activeOpacity={0.85}
          >
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                {item.shopImage ? (
                  <Image source={{ uri: item.shopImage }} style={styles.icon} resizeMode="cover" />
                ) : (
                  <Ionicons name="notifications" size={40} color="#014737" />
                )}
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.timeText}>{item.time}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.amountText}>
                  {item.shopName
                    ? item.shopName
                    : 'For all user'}
                  {item.validUntil && (() => {
                    let dateObj = item.validUntil instanceof Date
                      ? item.validUntil
                      : item.validUntil?.seconds
                        ? new Date(item.validUntil.seconds * 1000)
                        : null;
                    return dateObj
                      ? `หมดอายุ ${dateObj.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                      : '';
                  })()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#00322D" />
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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