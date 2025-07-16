import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking, Platform } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import { useAuth } from './AuthContext';
import * as Location from 'expo-location';

const Favorites = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressMap, setAddressMap] = useState({});

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      const favRef = collection(FIREBASE_DB, 'user', user.uid, 'favorites');
      const favSnap = await getDocs(favRef);
      const favIds = favSnap.docs.map(doc => doc.id);

      if (favIds.length > 0) {
        const servicesSnap = await getDocs(collection(FIREBASE_DB, 'Services'));
        let services = servicesSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(service => favIds.includes(service.id));

        await Promise.all(
          services.map(async (service) => {
            const reviewsSnap = await getDocs(
              query(
                collection(FIREBASE_DB, 'Reviews'),
                where('placeId', '==', service.id)
              )
            );
            service.reviewsCount = reviewsSnap.size;
          })
        );

        setFavorites(services);

        // หาที่อยู่ตอนเป็น lat,long
        services.forEach(async (service) => {
          if (
            typeof service.location === "string" &&
            service.location.match(/^[-\d.]+,\s*[-\d.]+$/)
          ) {
            const [lat, lng] = service.location.split(',').map(Number);
            try {
              const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
              if (geocode && geocode.length > 0) {
                const addr = `${geocode[0].name || ''} ${geocode[0].street || ''} ${geocode[0].district || ''} ${geocode[0].city || ''} ${geocode[0].region || ''} ${geocode[0].postalCode || ''}`.replace(/\s+/g, ' ').trim();
                setAddressMap(prev => ({ ...prev, [service.id]: addr }));
              }
            } catch (e) {
              setAddressMap(prev => ({ ...prev, [service.id]: service.location }));
            }
          }
        });
      } else {
        setFavorites([]);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const handleDetails = (service) => {
    navigation.navigate('Detail', { place: service });
  };

  const handleDirections = (service) => {
    if (service.latitude && service.longitude) {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${service.latitude},${service.longitude}`;
      const label = service.name;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}> 
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : favorites.length === 0 ? (
          <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No favorites yet.</Text>
        ) : (
          favorites.map(service => (
            <View key={service.id} style={styles.card}>
              <Image source={{ uri: service.image }} style={styles.image} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.name}>{service.name}</Text>
                <Text style={styles.address} numberOfLines={2}>
                  {typeof service.location === "string" && service.location.match(/^[-\d.]+,\s*[-\d.]+$/)
                    ? (addressMap[service.id] || "Loading address...")
                    : service.location}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Feather name="clock" size={14} color="#014737" />
                  <Text style={styles.timeText} numberOfLines={1}>
                    {Array.isArray(service.operatingHours) && service.operatingHours.length > 0
                      ? service.operatingHours.map(op => `${op.day} ${op.openTime}-${op.closeTime}`).join(' | ')
                      : 'N/A'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <FontAwesome name="star" size={14} color="#FDCB02" />
                  <Text style={styles.ratingText}>
                    {service.rating ? service.rating : '-'} / {service.reviewsCount ? service.reviewsCount : '0'} Reviews
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity style={styles.detailsBtn} onPress={() => handleDetails(service)}>
                    <Text style={styles.detailsBtnText}>Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.directionsBtn} onPress={() => handleDirections(service)}>
                    <Feather name="navigation" size={20} color="white" style={{ marginRight: 6, marginTop: 2 }} />
                    <Text style={styles.directionsBtnText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#014737',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 70, height: 70, borderRadius: 10, marginRight: 10,
  },
  name: {
    fontWeight: 'bold', fontSize: 16, color: '#014737', marginBottom: 2,
  },
  address: {
    color: '#444', fontSize: 13, marginBottom: 2,
  },
  timeText: {
    marginLeft: 6, color: '#014737', fontSize: 13,
  },
  ratingText: {
    marginLeft: 6, color: '#FDCB02', fontSize: 13,
  },
  detailsBtn: {
    backgroundColor: '#014737',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  detailsBtnText: {
    color: 'white', fontWeight: 'bold', fontSize: 14,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#014737',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  directionsBtnText: {
    color: 'white', fontWeight: 'bold', fontSize: 14, marginLeft: 6,
  },
});

export default Favorites;