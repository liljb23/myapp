import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import * as Location from 'expo-location';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

const Discount = () => {
  const navigation = useNavigation();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation(null);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const promotionsCol = collection(FIREBASE_DB, 'promotions');
        const snapshot = await getDocs(promotionsCol);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const serviceIds = list.map(p => p.serviceId).filter(Boolean);
        let servicesMap = {};
        if (serviceIds.length > 0) {
          const batchSize = 10;
          for (let i = 0; i < serviceIds.length; i += batchSize) {
            const batchIds = serviceIds.slice(i, i + batchSize);
            const servicesQuery = query(
              collection(FIREBASE_DB, 'Services'),
              where('__name__', 'in', batchIds)
            );
            const servicesSnapshot = await getDocs(servicesQuery);
            servicesSnapshot.docs.forEach(doc => {
              servicesMap[doc.id] = { id: doc.id, ...doc.data() };
            });
          }
        }

        const discountsWithShop = list.map(promo => {
          let service = promo.serviceId ? servicesMap[promo.serviceId] : null;
          let distance = '-';
          if (service && userLocation && service.latitude && service.longitude) {
            const d = getDistanceFromLatLonInKm(
              userLocation.latitude,
              userLocation.longitude,
              Number(service.latitude),
              Number(service.longitude)
            );
            distance = `${d.toFixed(2)} km`;
          }
          return {
            ...promo,
            shopName: service?.name || '',
            shopImage: service?.image || '',
            shopDistance: distance,
          };
        });
        setDiscounts(discountsWithShop);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, [userLocation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('DiscountDetail', { discount: item })}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={item.shopImage ? { uri: item.shopImage } : undefined}
        style={styles.bgImage}
        imageStyle={styles.bgImageStyle}
      >
        <View style={styles.overlay}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.row}>
              <Text style={styles.discount}>{item.discount ? `${item.discount}% OFF` : ''}</Text>
              {item.shopDistance && item.shopDistance !== '-' && (
                <View style={styles.distanceRow}>
                  <Feather name="map-pin" size={13} color="#fff" />
                  <Text style={styles.distanceText}>{item.shopDistance}</Text>
                </View>
              )}
            </View>
            <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            {item.validUntil && (
              <Text style={styles.expiry}>
                Valid until {new Date(item.validUntil.seconds ? item.validUntil.seconds * 1000 : item.validUntil).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#063c2f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerText}>Discounts and benefits</Text>
      <FlatList data={discounts} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#063c2f',
    paddingVertical: 40,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: '70%',
    transform: [{ translateY: -20 }],
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  card: {
    height: 140,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 18,
    marginHorizontal: 16,
    backgroundColor: '#eee',
    elevation: 2,
  },
  bgImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bgImageStyle: {
    resizeMode: 'cover',
    borderRadius: 15,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 12,
    borderRadius: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  discount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDCB02',
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 2,
  },
  expiry: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.85,
  },
});

export default Discount;
