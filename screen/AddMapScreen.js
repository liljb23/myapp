import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform, PermissionsAndroid } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '../config/keys';
import Icon from 'react-native-vector-icons/Feather';
import { FIREBASE_DB } from './FirebaseConfig';

const THAILAND_DEFAULT = {
  latitude: 13.622930713074025,
  longitude: 100.5102271018507,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function AddMapScreen({ navigation, route }) {
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const { onLocationSelect } = route.params;

  useEffect(() => {
    setLocation(THAILAND_DEFAULT);
    setSelectedLocation({
      latitude: THAILAND_DEFAULT.latitude,
      longitude: THAILAND_DEFAULT.longitude,
    });
    fetchAddress(THAILAND_DEFAULT.latitude, THAILAND_DEFAULT.longitude);
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      getCurrentLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocation(THAILAND_DEFAULT);
          setSelectedLocation({
            latitude: THAILAND_DEFAULT.latitude,
            longitude: THAILAND_DEFAULT.longitude,
          });
          fetchAddress(THAILAND_DEFAULT.latitude, THAILAND_DEFAULT.longitude);
          Alert.alert('Permission Denied', 'Location permission is required to use your location. Showing default location in Thailand.');
        }
      } catch (err) {
        console.warn(err);
        setLocation(THAILAND_DEFAULT);
        setSelectedLocation({
          latitude: THAILAND_DEFAULT.latitude,
          longitude: THAILAND_DEFAULT.longitude,
        });
        fetchAddress(THAILAND_DEFAULT.latitude, THAILAND_DEFAULT.longitude);
        Alert.alert('Error', 'Could not get your current location, showing default location in Thailand.');
      }
    }
  };

  const isThailand = (lat, lng) =>
    lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106;

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (isThailand(lat, lng)) {
          const coords = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setLocation(coords);
          setSelectedLocation({ latitude: lat, longitude: lng });
          fetchAddress(lat, lng);
        } else {
          setLocation(THAILAND_DEFAULT);
          setSelectedLocation({
            latitude: THAILAND_DEFAULT.latitude,
            longitude: THAILAND_DEFAULT.longitude,
          });
          fetchAddress(THAILAND_DEFAULT.latitude, THAILAND_DEFAULT.longitude);
        }
      },
      (error) => {
        setLocation(THAILAND_DEFAULT);
        setSelectedLocation({
          latitude: THAILAND_DEFAULT.latitude,
          longitude: THAILAND_DEFAULT.longitude,
        });
        fetchAddress(THAILAND_DEFAULT.latitude, THAILAND_DEFAULT.longitude);
        Alert.alert('Error', 'Could not get your current location, showing default location in Thailand.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress('');
      }
    } catch (error) {
      setAddress('');
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    fetchAddress(coordinate.latitude, coordinate.longitude);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }
    onLocationSelect(address, selectedLocation.latitude, selectedLocation.longitude);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Rounded Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Address Pill */}
      <View style={styles.addressPill}>
        <Icon name="map-pin" size={18} color="#014737" style={{ marginRight: 6 }} />
        <Text style={styles.addressText} numberOfLines={1}>
          {address ? address : 'Select a location'}
        </Text>
      </View>

      {/* Current Location Button */}
      <TouchableOpacity style={styles.currentLocationBtn} onPress={getCurrentLocation}>
        <Text style={styles.currentLocationText}>Current Location</Text>
      </TouchableOpacity>

      {/* Map */}
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={THAILAND_DEFAULT}
          region={selectedLocation ? {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          } : THAILAND_DEFAULT}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              pinColor="#014737"
            />
          )}
        </MapView>
      )}

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleConfirmLocation}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#014737',
    height: 90,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginTop: 100,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '90%',
  },
  addressText: {
    color: '#014737',
    fontSize: 15,
    flex: 1,
  },
  currentLocationBtn: {
    backgroundColor: '#014737',
    borderRadius: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 8,
  },
  currentLocationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  map: {
    flex: 1,
    marginTop: 8,
    marginBottom: 70,
  },
  doneButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#014737',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 2,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});