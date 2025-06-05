import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL , uploadBytesResumable} from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'; 
import { FIREBASE_AUTH , FIREBASE_DB, FIREBASE_STORAGE } from '../screen/FirebaseConfig';

// const db = getFirestore();
// const storage = getStorage();

const GOOGLE_VISION_API_KEY = 'AIzaSyAw3gaZKrM26XnJv1uId05yG3lIrmmcyNI'; 


const UploadSlipScreen = ({ route }) => {
  const navigation = useNavigation();
  const { campaignId , amount } = route.params;
  const [imageUri, setImageUri] = useState();
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadToBackend = async () => {
    try {
    setUploading(true);
    console.log('Uploading image:', imageUri);
    // ตรวจสอบ QR จากสลิปก่อน
    const isValidQR = await checkSlipWithVision(imageUri);
    const status = isValidQR ? 'approved' : 'rejected';
    console.log('Status:', status);
    const userId = FIREBASE_AUTH.currentUser.uid;
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    formData.append("userId", userId); // ✅ เพิ่ม userId

    // const response = await fetch("http://192.168.1.121:8000/upload-to-firebase", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    //   body: formData,
    // });
    const response = await fetch("http://192.168.1.121:8000/upload-to-firebase", {
      method: "POST",
      body: formData, // ✅ เท่านี้พอ
    });

    const result = await response.json();
    console.log("✅ Upload complete:", result);
  // บันทึกลง Firestore
    await updateDoc(doc(FIREBASE_DB, 'CampaignSubscriptions', campaignId), {
      slipUrl: imageUri,
      status: status,
      verifiedAt: new Date(),
    });

    Alert.alert(
      status === 'approved' ? '✅ Approved' : '❌ Rejected',
      status === 'approved'
        ? 'Your slip has been verified successfully.'
        : 'The slip was invalid. Please try again.'
    );

      navigation.navigate('EntrepreneurHome');
    } catch (error) {
      console.error("❌ Upload error:", error);
      Alert.alert("Error", "Upload failed. Try again.");
    }finally {
      setUploading(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading image:', imageUri);
      // ตรวจสอบ QR จากสลิปก่อน
      const isValidQR = await checkSlipWithVision(imageUri);
      const status = isValidQR ? 'approved' : 'rejected';
      const response = await fetch(imageUri);

      console.log('Response:', response);
      const blob = await response.blob();
      console.log('Blob:', blob);
      // Upload ไป Firebase Storage
      
      const userId = FIREBASE_AUTH.currentUser.uid;
      const filename = `${campaignId}_${Date.now()}`;
      
      // const storageRef = ref(FIREBASE_STORAGE, `slips/${userId}/${filename}`);
      
      // const uploadResult = await uploadBytes(storageRef, blob);
      // const downloadURL = await getDownloadURL(uploadResult);

      const storageRef = ref(FIREBASE_STORAGE, `slips/${userId}/${filename}`)
      const uploadResult = await uploadBytes(storageRef, blob)
      console.log('Upload result:', uploadResult);
      const imageUrl = await getDownloadURL(uploadResult.ref)
      console.log('Image URL:', imageUrl);

      // บันทึกลง Firestore
      await updateDoc(doc(FIREBASE_DB, 'CampaignSubscriptions', campaignId), {
        slipUrl: imageUrl,
        status: status,
        verifiedAt: new Date(),
      });

      Alert.alert(
        status === 'approved' ? '✅ Approved' : '❌ Rejected',
        status === 'approved'
          ? 'Your slip has been verified successfully.'
          : 'The slip was invalid. Please try again.'
      );

      navigation.navigate('EntrepreneurHome');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

const checkSlipWithVision = async (imageUri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64
    });



    const body = {
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    };

    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const result = await res.json();
    const detectedText = result?.responses?.[0]?.fullTextAnnotation?.text || '';

    console.log('[OCR Text]', detectedText);

    // ✅ เงื่อนไขตรวจสอบ OCR
    return detectedText.toLowerCase().includes('น.ส. กัลยา แมสซิลี') ||
           detectedText.toLowerCase().includes('พร้อมเพย์') ||
           detectedText.includes('0800544758') 
       
  } catch (err) {
    console.error('Vision API error:', err);
    return false;
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Payment Slip</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <>
            <Feather name="upload" size={40} color="#666" />
            <Text style={styles.uploadText}>Select Image</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, uploading && styles.disabled]}
        onPress={uploadToBackend}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#014737' },
  uploadBox: {
    height: 500,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: { color: '#666', marginTop: 10 },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  button: {
    backgroundColor: '#014737',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  disabled: { backgroundColor: '#ccc' },
});

export default UploadSlipScreen;