import React, { useState, useEffect, useCallback } from "react";
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  Image,
  Linking,
  Platform,
  Animated,
  NavItem,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';

const Search = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialCategory = route.params?.category || null;
  const [searchText, setSearchText] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Near me");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markerAnimation] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.1);
  const [region, setRegion] = useState({
    latitude: 13.7563,
    longitude: 100.5018,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // รายชื่อจังหวัดในประเทศไทย
  const provinces = {
    "Amnat Charoen": { latitude: 15.8571, longitude: 104.6258 },
    "Ang Thong": { latitude: 14.5896, longitude: 100.455 },
    Ayutthaya: { latitude: 14.3695, longitude: 100.587 },
    Bangkok: { latitude: 13.7563, longitude: 100.5018 },
    Buriram: { latitude: 14.9944, longitude: 103.1034 },
    Chachoengsao: { latitude: 13.6904, longitude: 101.0779 },
    "Chai Nat": { latitude: 15.1861, longitude: 100.1267 },
    Chaiyaphum: { latitude: 15.8107, longitude: 102.0293 },
    Chanthaburi: { latitude: 12.6112, longitude: 102.1036 },
    "Chiang Mai": { latitude: 18.7883, longitude: 98.9853 },
    "Chiang Rai": { latitude: 19.9072, longitude: 99.8309 },
    Chumphon: { latitude: 10.493, longitude: 99.18 },
    Chonburi: { latitude: 13.3611, longitude: 100.9847 },
    "Hat Yai": { latitude: 7.0083, longitude: 100.4767 },
    "Kamphaeng Phet": { latitude: 16.4827, longitude: 99.522 },
    Kanchanaburi: { latitude: 14.0246, longitude: 99.5328 },
    "Khon Kaen": { latitude: 16.4322, longitude: 102.8236 },
    Krabi: { latitude: 8.0863, longitude: 98.9063 },
    Lampang: { latitude: 18.2855, longitude: 99.5128 },
    Lamphun: { latitude: 18.574, longitude: 99.0087 },
    Loei: { latitude: 17.486, longitude: 101.7223 },
    Lopburi: { latitude: 14.7995, longitude: 100.653 },
    "Mae Hong Son": { latitude: 19.302, longitude: 97.9654 },
    "Maha Sarakham": { latitude: 16.1849, longitude: 103.3008 },
    Mukdahan: { latitude: 16.5444, longitude: 104.7185 },
    "Nakhon Nayok": { latitude: 14.2049, longitude: 101.2146 },
    "Nakhon Pathom": { latitude: 13.814, longitude: 100.037 },
    "Nakhon Phanom": { latitude: 17.4106, longitude: 104.7786 },
    "Nakhon Ratchasima": { latitude: 14.9799, longitude: 102.0978 },
    "Nakhon Si Thammarat": { latitude: 8.4325, longitude: 99.9596 },
    Nan: { latitude: 18.7756, longitude: 100.773 },
    "Nong Bua Lamphu": { latitude: 17.218, longitude: 102.426 },
    "Nong Khai": { latitude: 17.8783, longitude: 102.7413 },
    Nonthaburi: { latitude: 13.8591, longitude: 100.5216 },
    Pattani: { latitude: 6.8699, longitude: 101.2501 },
    "Pathum Thani": { latitude: 14.0205, longitude: 100.525 },
    "Phang Nga": { latitude: 8.4513, longitude: 98.525 },
    Phayao: { latitude: 19.2029, longitude: 99.8731 },
    Phichit: { latitude: 16.4467, longitude: 100.3487 },
    Phitsanulok: { latitude: 16.8211, longitude: 100.2659 },
    Phrae: { latitude: 18.1446, longitude: 100.1408 },
    Phetchabun: { latitude: 16.4198, longitude: 101.1606 },
    Phetchaburi: { latitude: 13.1138, longitude: 99.9394 },
    "Prachin Buri": { latitude: 14.0479, longitude: 101.3684 },
    "Prachuap Khiri Khan": { latitude: 11.815, longitude: 99.7987 },
    Rayong: { latitude: 12.6814, longitude: 101.281 },
    Ratchaburi: { latitude: 13.5362, longitude: 99.8171 },
    Ranang: { latitude: 9.9623, longitude: 98.6348 },
    "Roi Et": { latitude: 16.0538, longitude: 103.652 },
    "Samut Prakan": { latitude: 13.5991, longitude: 100.5998 },
    "Samut Sakhon": { latitude: 13.5472, longitude: 100.2743 },
    "Samut Songkhram": { latitude: 13.4098, longitude: 100.0023 },
    "Sakon Nakhon": { latitude: 17.1612, longitude: 104.1473 },
    Satun: { latitude: 6.6238, longitude: 100.0673 },
    "Sing Buri": { latitude: 14.886, longitude: 100.4017 },
    Songkhla: { latitude: 7.1897, longitude: 100.5951 },
    Sukhothai: { latitude: 17.0078, longitude: 99.8233 },
    "Surat Thani": { latitude: 9.1448, longitude: 99.3338 },
    Surin: { latitude: 14.8829, longitude: 103.4937 },
    Tak: { latitude: 16.8837, longitude: 99.1251 },
    Trat: { latitude: 12.2428, longitude: 102.5176 },
    "Ubon Ratchathani": { latitude: 15.2284, longitude: 104.8563 },
    "Udon Thani": { latitude: 17.3647, longitude: 102.8156 },
    "Uthai Thani": { latitude: 15.3835, longitude: 99.526 },
    Yala: { latitude: 6.5442, longitude: 101.281 },
    Yasothon: { latitude: 15.7944, longitude: 104.1453 },
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "restaurant":
        return "restaurant";
      case "Beauty & salon":
        return "scissors";
      case "Resort & Hotel":
        return "home";
      case "tourist attraction":
        return "map";
      case "place of prayer":
        return "heart";
      case "mosque":
        return "star";
      default:
        return "map-pin";
    }
  };

  const categories = [
    "All",
    "Restaurant",
    "Beauty salon",
    "Salon",
    "Resort & Hotel",
    "Resort",
    "Tourist attraction",
    "Place of prayer",
    "Mosque",
  ];

  useEffect(() => {
    console.log("🌍 Current Region:", region);
  }, [region]);
  useEffect(() => {
    if (selectedProvince && provinces[selectedProvince]) {
      const { latitude, longitude } = provinces[selectedProvince];

      console.log(`📍 Updating region for ${selectedProvince}:`, {
        latitude,
        longitude,
      });

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [selectedProvince]);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (selectedProvince === "Near me") {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("⛔ Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log("📌 User Location:", location.coords);

        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    };

    fetchUserLocation();
  }, [selectedProvince]);

  const getMarkerIcon = (category) => {
    const iconName = getCategoryIcon(category);
    return (
      <View
        style={{
          backgroundColor: "#014737",
          padding: 8,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: "white",
        }}
      >
        <Feather name={iconName} size={16} color="white" />
      </View>
    );
  };

  // โหลดข้อมูลจาก Firestore
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "Services"));
        const serviceList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(serviceList);
        setFilteredServices(serviceList);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const fetchServices = async (category) => {
  try {
    let q;
    if (category !== "All") {
      q = query(
        collection(FIREBASE_DB, "Services"),
        where("category", "==", category)
      );
    } else {
      q = collection(FIREBASE_DB, "Services");
    }
    const snapshot = await getDocs(q);
    const serviceList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setServices(serviceList);
    setFilteredServices(serviceList);
  } catch (error) {
    console.error("🔥 Error fetching services: ", error.message);
  }
};

  // ✅ โหลดข้อมูลเริ่มต้นจาก Firebase
  useEffect(() => {
    fetchServices(selectedCategory);
  }, [selectedCategory]);

  // 🔍 ค้นหาข้อมูลเมื่อพิมพ์
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((service) =>
        service.name?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchText, services]);

  // ค้นหาข้อมูลเมื่อพิมพ์ หรือเปลี่ยนจังหวัดที่เลือก
  useEffect(() => {
    let filtered = services;

    if (searchText.trim() !== "") {
      filtered = filtered.filter((service) =>
        service.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedProvince !== "All") {
      filtered = filtered.filter(
        (service) => service.province === selectedProvince
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }

    setFilteredServices(filtered);
  }, [searchText, selectedProvince, selectedCategory, services]);
  useEffect(() => {
    if (selectedProvince === "Near me" && userLocation) {
      filterNearbyServices();
    } else {
      let filtered = services;
      if (searchText.trim() !== "") {
        filtered = filtered.filter((service) =>
          service.name?.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      if (selectedProvince !== "All" && selectedProvince !== "Near me") {
        filtered = filtered.filter(
          (service) => service.province === selectedProvince
        );
      }
      setFilteredServices(filtered);
    }
  }, [searchText, selectedProvince, services, userLocation]);

  // ✅ โหลดข้อมูลเริ่มต้นจาก Firebase
  const fetchServicesByProvinceAndCategory = useCallback(
    async (province, category) => {
      setIsLoading(true);
      try {
        let q;
        if (province !== "Near me" && category !== "All") {
          q = query(
            collection(FIREBASE_DB, "Services"),
            where("province", "==", province),
            where("category", "==", category)
          );
        } else if (province !== "Near me") {
          q = query(
            collection(FIREBASE_DB, "Services"),
            where("province", "==", province)
          );
        } else if (category !== "All") {
          q = query(
            collection(FIREBASE_DB, "Services"),
            where("category", "==", category)
          );
        } else {
          q = collection(FIREBASE_DB, "Services");
        }

        const snapshot = await getDocs(q);
        const serviceList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          distance: userLocation
            ? getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                doc.data().latitude,
                doc.data().longitude
              )
            : null,
        }));

        if (province === "Near me" && userLocation) {
          serviceList.sort(
            (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
          );
        }
        setFilteredServices(serviceList);
        setServices(serviceList);
      } catch (err) {
        setError("Error fetching services");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [userLocation]
  );

  const openDirections = useCallback((latitude, longitude) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "google.navigation:q=",
    });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${latLng}`,
      android: `${scheme}${latLng}`,
    });

    Linking.openURL(url).catch((err) => setError("Error opening maps"));
  }, []);

  const filterNearbyServices = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);

    const nearbyServices = services
      .map((service) => {
        if (service.latitude && service.longitude) {
          const distance = getDistanceFromLatLonInKm(
            location.coords.latitude,
            location.coords.longitude,
            Number(service.latitude),
            Number(service.longitude)
          );

          console.log(`📍 ${service.name} is ${distance.toFixed(2)} km away`);
          return { ...service, distance: distance.toFixed(2) };
        }
        return null;
      })
      .filter((service) => service && service.distance < 10)
      .sort((a, b) => a.distance - b.distance);

    setFilteredServices(nearbyServices);
  };

  const NavItem = ({ title, iconName, active, onPress }) => (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      <Feather name={iconName} size={24} color={active ? "#FDCB02" : "white"} />
      <Text style={[styles.navText, active && styles.navTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = services.filter((service) =>
      service.name?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const CustomMarker = ({ service }) => {
    const isSelected = selectedMarker?.id === service.id;
    return (
      <Marker
        coordinate={{
          latitude: service.latitude,
          longitude: service.longitude,
        }}
        onPress={() => {
          setSelectedMarker(service);
          Animated.spring(markerAnimation, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }}
      >
        <View style={styles.markerContainer}>
          <View style={[styles.marker, isSelected && styles.markerSelected]}>
            <Feather
              name={getCategoryIcon(service.category)}
              size={16}
              color={isSelected ? "#014737" : "white"}
            />
          </View>
          {isSelected && (
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText} numberOfLines={1}>
                {service.name}
              </Text>
            </View>
          )}
        </View>
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Image
              source={{ uri: service.image }}
              style={styles.calloutImage}
            />
            <View style={styles.calloutContent}>
              <Text style={styles.calloutTitle}>{service.name}</Text>
              <Text style={styles.calloutCategory}>{service.category}</Text>
              <Text style={styles.calloutAddress} numberOfLines={2}>
                {service.location}
              </Text>
            </View>
          </View>
        </Callout>
      </Marker>
    );
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
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
    return R * c;
  };

  const renderListView = () => (
    <ScrollView contentContainerStyle={styles.resultsContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#014737" />
      ) : filteredServices.length > 0 ? (
        filteredServices.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.card}
            onPress={() => setSelectedPlace(service)}
          >
            <Image source={{ uri: service.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {service.name}
              </Text>
              <View style={styles.cardMetaContainer}>
                <Feather name="tag" size={12} color="#666" />
                <Text style={styles.cardCategory}>{service.category}</Text>
              </View>
              <View style={styles.cardMetaContainer}>
                <Feather name="map-pin" size={12} color="#666" />
                <Text style={styles.cardLocation} numberOfLines={2}>
                  {service.location}
                </Text>
              </View>
              {service?.distance && (
                <View style={styles.cardMetaContainer}>
                  <Text style={styles.cardDistance}>
                    {service.distance} km away
                  </Text>
                </View>
              )}

            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noResultsText}>No results found.</Text>
      )}
    </ScrollView>
  );


  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        provider={GOOGLE}
        style={{ flex: 1 }}
        showsUserLocation={true}
        followsUserLocation={true}
        region={{
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: zoomLevel,
          longitudeDelta: zoomLevel,
        }}
        onRegionChangeComplete={setRegion}
      >
        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
        </View>
        {/* 📍 Marker สำหรับตำแหน่งปัจจุบัน */}
        {userLocation && (
          <Marker coordinate={userLocation} title="You are here">
            <View style={styles.currentLocationMarker}>
              <FontAwesome name="map-marker" size={36} color="blue" />
            </View>
          </Marker>
        )}

        {/* 📍 Marker สำหรับสถานที่ต่าง ๆ */}
        {filteredServices.map((service) => {
          if (!service.latitude || !service.longitude) {
            console.warn("⚠️ Missing coordinates for:", service?.name);
            return null;
          }

          const lat = Number(service.latitude);
          const lng = Number(service.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.error(
              "🚨 Invalid coordinates:",
              service.name,
              service.latitude,
              service.longitude
            );
            return null;
          }

          console.log(
            `📍 Rendering marker for ${service.name} at [${lat}, ${lng}]`
          );

          return (
            <Marker
              key={service.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={service.name}
              description={service.category}
              onPress={() => {
                console.log("Selected Marker:", service.name);
                setSelectedPlace(service);
                setSelectedMarker(service.id);
              }}
            >
              {selectedMarker === service.id ? (
                <FontAwesome name="map-marker" size={36} color="red" />
              ) : (
                getCategoryIcon(service.category)
              )}
            </Marker>
          );
        })}
      </MapView>
    </View>
  );

  useEffect(() => {
    fetchServicesByProvinceAndCategory(selectedProvince, selectedCategory);
  }, [
    selectedProvince,
    selectedCategory,
    userLocation,
    fetchServicesByProvinceAndCategory,
  ]);
  const zoomIn = () => {
    const newZoomLevel = zoomLevel - 0.01; // Decrease delta for zooming in
    setZoomLevel(newZoomLevel);
    setRegion((prevRegion) => ({
      ...prevRegion,
      latitudeDelta: newZoomLevel,
      longitudeDelta: newZoomLevel,
    }));
  };

  const zoomOut = () => {
    const newZoomLevel = zoomLevel + 0.01; // Increase delta for zooming out
    setZoomLevel(newZoomLevel);
    setRegion((prevRegion) => ({
      ...prevRegion,
      latitudeDelta: newZoomLevel,
      longitudeDelta: newZoomLevel,
    }));
  };
  return (
    <View style={styles.container}>
      {/* Improved Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="chevron-left" size={32} color="white" />
        </TouchableOpacity>
        <Image
          //source={require("../assets/logo-removebg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Enhanced Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "list" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Feather
              name="list"
              size={20}
              color={viewMode === "list" ? "white" : "#666"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "map" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("map")}
          >
            <Feather
              name="map"
              size={20}
              color={viewMode === "map" ? "white" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          onPress={() => setProvinceModalVisible(true)}
          style={styles.filterButton}
        >
          <Feather name="map-pin" size={16} color="#014737" />
          <Text style={styles.filterButtonText}>
            Sort by: {selectedProvince}
          </Text>
          <Feather name="chevron-down" size={16} color="#014737" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCategoryModalVisible(true)}
          style={styles.filterButton}
        >
          <Feather name="tag" size={16} color="#014737" />
          <Text style={styles.filterButtonText}>{selectedCategory}</Text>
          <Feather name="chevron-down" size={16} color="#014737" />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {viewMode === "list" ? renderListView() : renderMapView()}

      {/*  */}

      {selectedPlace && (
        <View style={styles.popupCard}>
          <Image
            source={{ uri: selectedPlace.image }}
            style={styles.popupImage}
            //defaultSource={require("../assets/photo.png")}
          />
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>{selectedPlace.name}</Text>
            <Text style={styles.popupLocation}>{selectedPlace.location}</Text>
            {selectedPlace.hours && (
              <Text style={styles.popupHours}>Daily {selectedPlace.hours}</Text>
            )}
            {selectedPlace.rating && (
              <Text style={styles.popupReviews}>
                ⭐ {selectedPlace.rating} / {selectedPlace.reviews} Reviews
              </Text>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() =>
                  navigation.navigate("Detail", { place: selectedPlace })
                }
              >
                <Text style={styles.detailsText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() =>
                  openDirections(
                    selectedPlace.latitude,
                    selectedPlace.longitude
                  )
                }
              >
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPlace(null)}
          >
            <Feather name="x" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Selection Modals */}
      <Modal visible={provinceModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Province</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setSelectedProvince("Near me");
                  setProvinceModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>Near me</Text>
              </TouchableOpacity>
              {Object.keys(provinces).map((province) => (
                <TouchableOpacity
                  key={province}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedProvince(province);
                    setProvinceModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{province}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setProvinceModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Similar modal structure for categories */}
      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedCategory(category);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedCategory === category && styles.selectedOption,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#014737",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: Platform.OS === "ios" ? 60 : 40,
  },
  logo: {
    width: 180,
    height: 100,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: "#014737",
  },
  filterSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  filterButtonText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#014737",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#014737",
    marginBottom: 3,
  },
  cardMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  map: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#014737",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderTopWidth: 1,
    // borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#014737",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    padding: 16,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalOptionSelected: {
    color: "#014737",
    fontWeight: "bold",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 10,
  },
  dropdownButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#014737",
  },
  cardCategory: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cardDistance: {
    fontSize: 12,
    color: "#014737",
    fontWeight: "500",
    marginTop: 4,
  },
  noResultsText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 10,
    fontSize: 14,
  },
  popupCard: {
    position: "absolute",
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  popupImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  popupContent: {
    flex: 1,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#014737",
    marginBottom: 4,
  },
  popupLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  popupHours: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  popupReviews: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "#014737",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  directionsButton: {
    flex: 1,
    backgroundColor: "#0275d8",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  detailsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  directionsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "85%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#014737",
  },
  modalOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  selectedOption: {
    fontWeight: "bold",
    color: "#014737",
  },
  confirmButton: {
    backgroundColor: "#014737",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  currentLocationMarker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(253, 203, 2, 1)",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#063c2f',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  navText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FDCB02',
    fontWeight: 'bold',
  },
  zoomControls: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  zoomButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
  },
  zoomButtonText: {
    fontSize: 20,
    color: "#014737",
  },
});

export default Search;
