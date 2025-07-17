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
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

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

const ServiceDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const service = route.params?.service || {};
  const [displayLocation, setDisplayLocation] = useState(
    typeof service.location === "string" && service.location.match(/^[-\d.]+,\s*[-\d.]+$/)
      ? ""
      : service.location
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // slider
  const images = Array.isArray(service.serviceImages) && service.serviceImages.length > 0
    ? service.serviceImages
    : service.image
      ? [service.image]
      : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef();

  useEffect(() => {
    if (
      typeof service.location === "string" &&
      service.location.match(/^[-\d.]+,\s*[-\d.]+$/)
    ) {
      const [lat, lng] = service.location.split(",").map(Number);
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
      setDisplayLocation(service.location);
      setLocationLoading(false);
    }
  }, [service.location]);

  // คำนวณระยะทาง (admin may not need, but keep for UI match)
  const distance =
    userLocation && service.latitude && service.longitude
      ? getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          service.latitude,
          service.longitude
        )
      : "";

  // เวลาเปิด-ปิด
  let operatingText = "N/A";
  if (Array.isArray(service.operatingHours) && service.operatingHours.length > 0) {
    const op = service.operatingHours[0];
    operatingText = `${op.day}: ${op.openTime} - ${op.closeTime}`;
  }

  if (!service) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#014737" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.bg}>
      {/* Header for admin */}
      <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'#00322D',paddingTop:50,paddingBottom:20,paddingHorizontal:20,borderBottomLeftRadius:40,borderBottomRightRadius:40,marginBottom:10}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{color:'white',fontSize:18,fontWeight:'bold',marginLeft:20,flex:1}}>Service Detail (Admin)</Text>
      </View>
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
            <Text style={styles.title}>{service.name}</Text>
          </View>
          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Feather name="user" size={16} color="#014737" />
              <Text style={styles.reviewCountText}>{service.reviewCount || 0} Reviews</Text>
            </View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Feather name="star" size={16} color="#FDCB02" />
              <Text style={styles.ratingText}>{service.rating ? service.rating : "-"}</Text>
            </View>
          </View>
          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8}}>
            <Text style={styles.distance}>{distance ? `${distance} km` : ""}</Text>
            <Text style={styles.category}>{service.category ? `(${service.category})` : ""}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>{t('details')}</Text>
            <View style={styles.infoContainer}>
              <Feather name="map-pin" size={16} color="#014737" />
              <Text style={styles.infoText}>
                {locationLoading
                  ? t('loadingAddress')
                  : displayLocation || '-'}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Feather name="clock" size={16} color="#014737" />
              <View style={{ flex: 1 }}>
                {Array.isArray(service.operatingHours) && service.operatingHours.length > 0 ? (
                  service.operatingHours.map((op, idx) => (
                    <Text key={idx} style={styles.infoText}>
                      {op.day}: {op.openTime} - {op.closeTime}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.infoText}>{t('notAvailable')}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.infoContainer, styles.phoneTouchable]}
              onPress={() => service.phone && Linking.openURL(`tel:${service.phone}`)}
              activeOpacity={0.7}
            >
              <Feather name="phone" size={16} color="#014737" />
              <Text style={styles.phoneText}>{service.phone || '-'}</Text>
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              <Feather name="check-circle" size={16} color="#014737" />
              <Text style={styles.infoText}>
                {service.parkingArea ? service.parkingArea : (service.available ? t('available') : t('unavailable'))}
              </Text>
            </View>
            {/* ปุ่ม Directions */}
            {service.latitude && service.longitude && (
              <TouchableOpacity style={styles.directionsBtn} onPress={() => {
                const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                const latLng = `${service.latitude},${service.longitude}`;
                const label = service.name;
                const url = Platform.select({
                  ios: `${scheme}${label}@${latLng}`,
                  android: `${scheme}${latLng}(${label})`
                });
                Linking.openURL(url);
              }}>
                <Feather name="navigation" size={16} color="white" />
                <Text style={styles.directionsText}>{t('directions')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          {/* Location */}
          {service.latitude && service.longitude && (
            <View style={styles.locationSection}>
              <Text style={styles.locationSectionTitle}>Location</Text>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: service.latitude,
                    longitude: service.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: service.latitude,
                      longitude: service.longitude,
                    }}
                    title={service.name}
                  />
                </MapView>
                <TouchableOpacity style={styles.openMapButton} onPress={() => {
                  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                  const latLng = `${service.latitude},${service.longitude}`;
                  const label = service.name;
                  const url = Platform.select({
                    ios: `${scheme}${label}@${latLng}`,
                    android: `${scheme}${latLng}(${label})`
                  });
                  Linking.openURL(url);
                }}>
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
  phoneTouchable: {},
  phoneText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#007A5A",
    textDecorationLine: "underline",
    fontWeight: "bold",
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceDetail; 