import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import ReviewForm from "./ReviewForm";
import { useAuth } from './AuthContext';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

const Detail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const place = route.params?.place || {};
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

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

  if (loading || !place) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#014737" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="chevron-left" size={32} color="white" />
      </TouchableOpacity>

      {/* 📷 Image */}
      <Image source={{ uri: place.image }} style={styles.mainImage} />

      <View style={styles.detailContainer}>
        <Text style={styles.title}>{t('detail')}</Text>

        {/* ⭐ Rating */}
        <View style={styles.metaContainer}>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="gold" />
            <Text style={styles.ratingText}>{place.rating}</Text>
            <Text style={styles.reviewCountText}>({reviewsData.length} Reviews)</Text>
          </View>
        </View>

        <Text style={styles.distance}>{place.distance} km</Text>
        <Text style={styles.category}>({place.category})</Text>

        {/* 📍 Details */}
        <View style={styles.detailsSection}>
          <View style={styles.infoContainer}>
            <Feather name="map-pin" size={16} color="#014737" />
            <Text style={styles.infoText}>{place.location}</Text>
          </View>
        </View>

        {/* 📝 Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsSectionTitle}>Reviews</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#014737" />
          ) : reviewsData.length > 0 ? (
            reviewsData.slice(0, 2).map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Feather name="user" size={16} color="#014737" />
                  <Text style={styles.reviewUser}>{review.username}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <View style={styles.starContainer}>
                  {[...Array(review.rating)].map((_, i) => (
                    <FontAwesome key={i} name="star" size={14} color="gold" />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noReviewText}>No reviews yet. Be the first to review!</Text>
          )}
          <TouchableOpacity>
            <Text style={styles.showAllReviews}>Show all reviews</Text>
          </TouchableOpacity>
        </View>

        {/* 📝 Write Review Button */}
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={handleReviewButtonPress}
        >
          <Text style={styles.reviewButtonText}>Write your review</Text>
        </TouchableOpacity>

        <ReviewForm
          visible={isReviewFormVisible}
          onClose={() => setIsReviewFormVisible(false)}
          placeId={place.id}
        />

        {/* Contact Button */}
        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
          <Feather name="phone" size={24} color="white" />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
    zIndex: 2,
  },
  mainImage: {
    width: "100%",
    height: 250,
  },
  detailContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    marginTop: -30, // Overlap effect
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#014737",
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  reviewCountText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  favoriteButton: {
    padding: 5,
  },
  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  distanceContainer: {
    marginBottom: 15,
  },
  distance: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    width: "100%",
  },
  detailsSection: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#014737",
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  directionsContainer: {
    marginTop: 10,
  },
  directionsButton: {
    backgroundColor: "#014737",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  directionsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  reviewsSection: {
    marginBottom: 15,
  },
  reviewsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#014737",
    marginBottom: 10,
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewUser: {
    marginLeft: 10,
    fontWeight: "bold",
    color: "#014737",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: "row",
  },
  showAllReviews:{
    backgroundColor: "#014737",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  reviewButton: {
    backgroundColor: "#014737",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  reviewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#014737',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
