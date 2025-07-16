import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FIREBASE_DB } from '../screen/FirebaseConfig';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

export default function AdminScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const { user: authUser } = useAuth();


  const [counts, setCounts] = useState({
    users: 0,
    entrepreneurs: 0,
    services: 0,
    blogs: 0,
    promotions: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get users collection counts
        const usersSnap = await getDocs(collection(FIREBASE_DB, 'user'));
        let generalUserCount = 0;
        let entrepreneurCount = 0;

        usersSnap.forEach(doc => {
          const role = doc.data().role;
          if (role === 'General User') generalUserCount++;
          if (role === 'Entrepreneur') entrepreneurCount++;
        });

        // Get all services and count only those with allowed categories
        const ALLOWED_CATEGORIES = [
          'Restaurant',
          'Beauty & Salon',
          'Prayer Space',
          'Mosque',
          'Tourist attraction',
          'Resort & Hotel',
        ];
        const servicesSnap = await getDocs(collection(FIREBASE_DB, 'Services'));
        const allowedServicesCount = servicesSnap.docs.filter(doc =>
          ALLOWED_CATEGORIES.includes(doc.data().category)
        ).length;

        // Get other collection counts
        const blogsSnap = await getCountFromServer(collection(FIREBASE_DB, 'Blog'));
        const promosSnap = await getCountFromServer(collection(FIREBASE_DB, 'promotions'));

        setCounts({
          users: generalUserCount,
          entrepreneurs: entrepreneurCount,
          services: allowedServicesCount,
          blogs: blogsSnap.data().count,
          promotions: promosSnap.data().count,
        });
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const handleCardPress = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo-removebg.png')}
          style={{ width: 150, height: 150, alignItems: 'center' }}
          resizeMode="contain"
        />
        <Feather name="menu" size={24} color="white" />
      </View>

      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={{ fontSize: 18 }}>
            Hello, {
              (authUser?.username
                || (authUser?.email && authUser.email.endsWith('@halalway.com')
                  ? authUser.email.split('@')[0]
                  : authUser?.email)
                || 'Admin')?.toUpperCase()
            }
          </Text>
          <Text style={styles.userEmail}>{authUser?.email || ''}</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            navigation.navigate('Login-email');
          }}
        >
          <Feather name="log-out" size={23} color="#D11A2A" />
          <Text style={styles.logoutButtonText}>logout</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Cards */}
      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        {[
          { label: 'General user quantity', value: counts.users, screen: 'GeneralUserQuantityScreen' },
          { label: 'Entrepreneur quantity', value: counts.entrepreneurs, screen: 'EntrepreneurQuantityScreen' },
          { label: 'Services quantity', value: counts.services, screen: 'ServicesQuantityScreen' },
          { label: 'Blog quantity', value: counts.blogs, screen: 'BlogQuantityScreen' },
          { label: 'Promotion quantity', value: counts.promotions, screen: 'PromotionQuantityScreen' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleCardPress(item.screen)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardValue}>{item.value}</Text>
              <Feather name="more-horizontal" size={20} color="white" />
            </View>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminNoti')}>
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
    height: 200,
    backgroundColor: '#002B28',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'relative',
  },
  logoText: { fontSize: 22, color: 'white', fontWeight: 'bold' },
  logoYellow: { color: '#FDCB02' },

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  helloText: { fontSize: 16, fontWeight: 'bold' },
  emailText: { color: 'gray', fontSize: 14 },

  cardsContainer: {
    padding: 20,
    flex: 1,
  },
  card: {
    backgroundColor: '#00524F',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  cardLabel: {
    marginTop: 5,
    color: 'white',
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
  tabTextActive: {
    color: '#FDCB02',
    fontSize: 12,
    marginTop: 3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: '#D11A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#D11A2A',
    fontSize: 14,
    marginLeft: 6,
  },
});