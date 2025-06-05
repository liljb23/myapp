import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { 
  PhoneAuthProvider, 
  signInWithCredential,
  RecaptchaVerifier
} from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const LoginPhone = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      // Initialize RecaptchaVerifier
      const recaptchaVerifier = new RecaptchaVerifier(FIREBASE_AUTH, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          Alert.alert('Error', 'reCAPTCHA expired. Please try again.');
        }
      });

      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const provider = new PhoneAuthProvider(FIREBASE_AUTH);
      const verificationId = await provider.verifyPhoneNumber(
        formattedPhoneNumber,
        recaptchaVerifier
      );
      
      setVerificationId(verificationId);
      Alert.alert('Success', 'Verification code has been sent to your phone');
    } catch (error) {
      console.error('Error sending code:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(FIREBASE_AUTH, credential);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Login</Text>
        <Text style={styles.headerSubtitle}>Login to make your life easier.</Text>
      </View>

      {/* <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('./assets/user-icon.png')}
            style={styles.avatarIcon}
          />
        </View>
      </View> */}

      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Phone number (+66...)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          {verificationId && (
            <TextInput
              style={styles.input}
              placeholder="Verification code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
            />
          )}
        </View>

        <TouchableOpacity 
          style={styles.alternateLogin}
          onPress={() => navigation.navigate('LoginEmail')}
        >
          <Text style={styles.alternateLoginText}>Or Login With Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={verificationId ? handleVerifyCode : handleSendCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>
              {verificationId ? 'Verify Code' : 'Send Code'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hidden reCAPTCHA container */}
      <View id="recaptcha-container" />

      <View style={styles.footer}>
        {/* <Text style={styles.languageText}>Language</Text>
        <View style={styles.languageFlags}>
          <TouchableOpacity style={styles.flagContainer}>
            <Image
              source={require('./assets/flag-th.png')}
              style={styles.flagIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.flagContainer}>
            <Image
              source={require('./assets/flag-us.png')}
              style={styles.flagIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.flagContainer}>
            <Image
              source={require('./assets/flag-ae.png')}
              style={styles.flagIcon}
            />
          </TouchableOpacity>
        </View>
        <Image
          source={require('./assets/halal-way-logo.png')}
          style={styles.logo}
        /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 30,
    backgroundColor: '#014737',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginBottom : 30,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    paddingBottom: 20,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 40,
    height: 40,
  },
  formSection: {
    paddingHorizontal: 24,
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  alternateLogin: {
    alignItems: 'center',
    marginVertical: 16,
  },
  alternateLoginText: {
    color: '#FFC107',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#014737',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#333333',
    fontSize: 14,
  },
  signupLink: {
    color: '#014737',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  languageText: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 12,
  },
  languageFlags: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  flagContainer: {
    width: 32,
    height: 32,
  },
  flagIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
});

export default LoginPhone;