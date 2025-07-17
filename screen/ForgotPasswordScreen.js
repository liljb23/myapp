import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

// ใช้ค่าสีเดียวกับหน้า Login เพื่อความสอดคล้อง
const DARK_GREEN = '#014737';
const YELLOW = '#FFD600';
const LIGHT_GRAY = '#f5f5f5';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      Alert.alert(
        'Success',
        'A password reset link has been sent to your email. Please check your inbox.',
        [{ text: 'OK', onPress: () => navigation.goBack() }] // กด OK แล้วกลับไปหน้า Login
      );
    } catch (error) {
      console.error(error);
      // แปลงข้อความ error ของ Firebase ให้เข้าใจง่ายขึ้น
      let errorMessage = 'An unknown error occurred.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'This email is not registered. Please check your email or sign up.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is badly formatted.';
      } else {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Text style={styles.headerSubtitle}>Enter your email to receive a reset link</Text>
      </View>
      <View style={styles.content}>
        <Image
            //source={require('../assets/forgot-password.png')} // ควรหา icon ที่เหมาะสมมาใส่
            style={styles.icon}
            resizeMode="contain"
        />
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handlePasswordReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: DARK_GREEN,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 40,
    tintColor: DARK_GREEN,
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    color: DARK_GREEN,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: LIGHT_GRAY,
    padding: 15,
    borderRadius: 14,
    width: '100%',
    fontSize: 16,
    color: DARK_GREEN,
  },
  submitButton: {
    backgroundColor: DARK_GREEN,
    padding: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backLink: {
    marginTop: 20,
    color: YELLOW,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;