import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import ReviewForm from "./ReviewForm";
import { useAuth } from './AuthContext';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { updateCampaignReport } from './Home';

const { width } = Dimensions.get("window");

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return "";
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d.toFixed(1);
}

const Detail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const place = route.params?.place || {};
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  const [displayLocation, setDisplayLocation] = useState(
    typeof place.location === "string" && place.location.match(/^[-\d.]+,\s*[-\d.]+$/)
      ? ""
      : place.location
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

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

  // slider
  const images = Array.isArray(place.serviceImages) && place.serviceImages.length > 0
    ? place.serviceImages
    : place.image
      ? [place.image]
      : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef();

  // Fetch reviews from Firebase Firestore
  useEffect(() => {
    if (!place.id) return;
    const reviewsRef = collection(FIREBASE_DB, 'Reviews');
    const q = query(reviewsRef, where('placeId', '==', place.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviewsData(reviews);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [place.id]);

  useEffect(() => {
    if (
      typeof place.location === "string" &&
      place.location.match(/^[-\d.]+,\s*[-\d.]+$/)
    ) {
      const [lat, lng] = place.location.split(",").map(Number);
      setLocationLoading(true);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) setDisplayLocation(data.display_name);
          setLocationLoading(false);
        })
        .catch(() => {
          setLocationLoading(false);
        });
    } else {
      setDisplayLocation(place.location);
      setLocationLoading(false);
    }
  }, [place.location]);

  // เช็คว่า favorite หรือยัง
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !place.id) return;
      const favRef = doc(FIREBASE_DB, 'user', user.uid, 'favorites', place.id);
      const favSnap = await getDoc(favRef);
      setIsFavorite(favSnap.exists());
    };
    checkFavorite();
  }, [user, place.id]);

  // toggle favorite
  const handleToggleFavorite = async () => {
    if (!user || !place.id) return;
    const favRef = doc(FIREBASE_DB, 'user', user.uid, 'favorites', place.id);
    if (isFavorite) {
      await deleteDoc(favRef);
      setIsFavorite(false);
    } else {
      await setDoc(favRef, { createdAt: new Date() });
      setIsFavorite(true);
    }
  };

  const handleReviewButtonPress = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to write a review',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    setIsReviewFormVisible(true);
  };

  const handleCall = () => {
    if (place?.phone) {
      const payload = {
        serviceId: place.id,
        type: 'conversion'
      };
      if (place.campaignId !== undefined) payload.campaignId = place.campaignId;
      if (place.entrepreneurId !== undefined) payload.entrepreneurId = place.entrepreneurId;
      updateCampaignReport(payload);
      Linking.openURL(`tel:${place.phone}`);
    }
  };

  const handleOpenMap = () => {
    if (place?.latitude && place?.longitude) {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${place.latitude},${place.longitude}`;
      const label = place.name;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });

      Linking.openURL(url);
    }
  };

  // คำนวณระยะทาง
  const distance =
    userLocation && place.latitude && place.longitude
      ? getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          place.latitude,
          place.longitude
        )
      : "";

  // เวลาเปิด-ปิด
  let operatingText = "N/A";
  if (Array.isArray(place.operatingHours) && place.operatingHours.length > 0) {
    const op = place.operatingHours[0];
    operatingText = `${op.day}: ${op.openTime} - ${op.closeTime}`;
  }

  if (loading || !place) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#014737" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.bg}>
      <View style={styles.card}>
        {/* Slider รูปภาพ */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.dotContainer}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activeIndex === idx && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* เนื้อหาทั้งหมดใน card */}
        <View style={styles.innerCard}>
          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8}}>
            <Text style={styles.title}>{place.name}</Text>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <FontAwesome
                name={isFavorite ? "heart" : "heart-o"}
                size={24}
                color={isFavorite ? "#d00" : "#014737"}
              />
            </TouchableOpacity>
          </View>

          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Feather name="user" size={16} color="#014737" />
              <Text style={styles.reviewCountText}>{reviewsData.length} Reviews</Text>
            </View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <FontAwesome name="star" size={16} color="#FDCB02" />
              <Text style={styles.ratingText}>{place.rating ? place.rating : "-"}</Text>
            </View>
          </View>
          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8}}>
            <Text style={styles.distance}>{distance ? `${distance} km` : ""}</Text>
            <Text style={styles.category}>{place.category ? `(${place.category})` : ""}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Details</Text>
            <View style={styles.infoContainer}>
              <Feather name="map-pin" size={16} color="#014737" />
              <Text style={styles.infoText}>
                {locationLoading
                  ? "กำลังโหลดที่อยู่..."
                  : displayLocation || "-"}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Feather name="clock" size={16} color="#014737" />
              <View style={{ flex: 1 }}>
                {Array.isArray(place.operatingHours) && place.operatingHours.length > 0 ? (
                  place.operatingHours.map((op, idx) => (
                    <Text key={idx} style={styles.infoText}>
                      {op.day}: {op.openTime} - {op.closeTime}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.infoText}>N/A</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.infoContainer, styles.phoneTouchable]}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Feather name="phone" size={16} color="#014737" />
              <Text style={styles.phoneText}>{place.phone || "-"}</Text>
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              <Feather name="check-circle" size={16} color="#014737" />
              <Text style={styles.infoText}>
                {place.parkingArea ? place.parkingArea : (place.available ? "Available" : "Unavailable")}
              </Text>
            </View>
            {/* ปุ่ม Directions */}
            {place.latitude && place.longitude && (
              <TouchableOpacity style={styles.directionsBtn} onPress={handleOpenMap}>
                <Feather name="navigation" size={16} color="white" />
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Section รีวิว */}
          <Text style={styles.reviewsSectionTitle}>Reviews</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#014737" />
          ) : reviewsData.length > 0 ? (
            reviewsData.slice(0, 2).map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Feather name="user" size={16} color="#014737" />
                  <Text style={styles.reviewUser}>{review.username || "Anonymous User"}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <View style={styles.starContainer}>
                  {[...Array(review.rating)].map((_, i) => (
                    <FontAwesome key={i} name="star" size={14} color="#FDCB02" />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: "#888" }}>No reviews yet. Be the first to review!</Text>
          )}

          {/* ปุ่ม Show all reviews */}
          <TouchableOpacity style={styles.showAllReviewsBtn}>
            <Text style={styles.showAllReviewsText}>Show all reviews</Text>
          </TouchableOpacity>

          {/* ปุ่ม Write review */}
          <TouchableOpacity style={styles.reviewButton} onPress={handleReviewButtonPress}>
            <Text style={styles.reviewButtonText}>Write your review</Text>
          </TouchableOpacity>

          <ReviewForm
            visible={isReviewFormVisible}
            onClose={() => setIsReviewFormVisible(false)}
            placeId={place.id}
          />

          {/* Location */}
          {place.latitude && place.longitude && (
            <View style={styles.locationSection}>
              <Text style={styles.locationSectionTitle}>Location</Text>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: place.latitude,
                    longitude: place.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: place.latitude,
                      longitude: place.longitude,
                    }}
                    title={place.name}
                  />
                </MapView>
                <TouchableOpacity style={styles.openMapButton} onPress={handleOpenMap}>
                  <Text style={styles.openMapText}>Open in Maps</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#063c2f",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  innerCard: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sliderContainer: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  mainImage: {
    width: width - 32,
    height: 200,
    borderRadius: 0,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#FDCB02",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#014737",
    marginBottom: 10,
    textAlign: "left",
    flex: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCountText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#014737",
    fontWeight: "bold",
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#FDCB02",
    fontWeight: "bold",
  },
  ratingTextSmall: {
    marginLeft: 4,
    fontSize: 13,
    color: "#666",
  },
  distance: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  detailsSection: {
    backgroundColor: "white",
    borderRadius: 0,
    padding: 0,
    marginVertical: 0,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#063c2f",
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
  },
  phoneTouchable: {
  },
  phoneText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#007A5A",
    textDecorationLine: "underline",
    fontWeight: "bold",
    flex: 1,
  },
  reviewsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#014737",
    marginBottom: 10,
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewUser: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#014737",
  },
  reviewComment: {
    color: "#666",
    marginBottom: 6,
  },
  starContainer: {
    flexDirection: "row",
    marginTop: 2,
  },
  showAllReviewsBtn: {
    backgroundColor: "#014737",
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 0,
    paddingVertical: 12,
    alignItems: "center",
  },
  showAllReviewsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewButton: {
    backgroundColor: "#014737",
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#014737",
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 10,
  },
  directionsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#014737',
    marginBottom: 8,
  },
  mapContainer: {
    height: 200,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  openMapButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#014737',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  openMapText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Detail;
