import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Feather';

export default function AddMapScreen({ navigation, route }) {
  const mapRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const { onLocationSelect } = route.params;

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    getAddressFromCoordinates(latitude, longitude);
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const r = result[0];
        const fullAddress = [
          r.name,
          r.street,
          r.district,
          r.city,
          r.region,
          r.postalCode,
          r.country
        ].filter(Boolean).join(', ');
        setAddress(fullAddress.trim());
      } else {
        setAddress('Address not found');
      }
    } catch {
      setAddress('Address not found');
    }
  };

  const handleSearch = async () => {
    if (!searchText) return;
    try {
      const locations = await Location.geocodeAsync(searchText);
      if (locations.length > 0) {
        const { latitude, longitude } = locations[0];
        setSelectedLocation({ latitude, longitude });
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        getAddressFromCoordinates(latitude, longitude);
      } else {
        Alert.alert('Not Found', 'Please enter a location name');
      }
    } catch {
      Alert.alert('Failed', 'Can not find location');
    }
  };

  const handleCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('No Permission', 'Please allow location access');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setSelectedLocation({ latitude, longitude });
    mapRef.current.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    getAddressFromCoordinates(latitude, longitude);
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Select a location on the map or search for a location');
      return;
    }
    onLocationSelect(address || 'Address not found', selectedLocation.latitude, selectedLocation.longitude);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search e.g. Nong Chok"
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>

      {/* Address Display */}
      {address !== '' && (
        <View style={styles.addressPill}>
          <Icon name="map-pin" size={16} color="#014737" style={{ marginRight: 6 }} />
          <Text style={styles.addressText} numberOfLines={1}>{address}</Text>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 13.7563,
          longitude: 100.5018,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} title="Location" />
        )}
      </MapView>

      {/* Current Location Button */}
      <TouchableOpacity style={styles.currentLocationButton} onPress={handleCurrentLocation}>
        <Text style={styles.currentLocationText}>My Location</Text>
      </TouchableOpacity>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#014737',
    height: 90,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  addressPill: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    elevation: 2,
  },
  addressText: {
    color: '#014737',
    fontSize: 14,
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#014737',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  currentLocationText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#014737',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});