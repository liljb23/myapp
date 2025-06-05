import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getFirestore, collection, addDoc } from 'firebase/firestore'; // Firebase Firestore

const db = getFirestore();

const AddMapScreen = ({ route, navigation }) => {
  const { setLocation, setLatitude, setLongitude } = route.params;
  const [region, setRegion] = useState({
    latitude: 13.622930713074025, // พิกัดเริ่มต้น
    longitude: 100.5102271018507,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // ฟังก์ชันเมื่อคลิกที่แผนที่เพื่อเลือกพิกัด
  const onMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setRegion({
      ...region,
      latitude,
      longitude,
    });
  };

  // ฟังก์ชันบันทึกตำแหน่งลง Firebase
  const saveLocation = async () => {
    try {
      // บันทึกตำแหน่งใน Firebase
      await addDoc(collection(db, "Services"), {
        location: `${region.latitude}, ${region.longitude}`,
        latitude: region.latitude,
        longitude: region.longitude,
        createdAt: new Date(),
      });

      // ตั้งค่าตำแหน่งกลับไปที่หน้าฟอร์ม
      setLocation(`${region.latitude}, ${region.longitude}`);
      setLatitude(region.latitude);
      setLongitude(region.longitude);

      Alert.alert("Success", "Location saved successfully!");
      navigation.goBack(); // กลับไปที่หน้าฟอร์ม
    } catch (error) {
      console.error("Error saving location: ", error);
      Alert.alert("Error", "Failed to save location.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onPress={onMapPress}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>
      <Button title="Save Location" onPress={saveLocation} />
    </View>
  );
};

export default AddMapScreen;
