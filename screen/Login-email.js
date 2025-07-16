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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const DARK_GREEN = '#014737';
const YELLOW = '#FFD600';
const LIGHT_GRAY = '#f5f5f5';

const LoginEmail = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login</Text>
        <Text style={styles.headerSubtitle}>Login to make your life easier.</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.profileIconContainer}>
          <View style={styles.profileIconCircle}>
            <Image
              source={require('../assets/user.png')}
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.inputSection}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Email</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login-phone')}>
              <Text style={styles.switchLoginText}>Or Login With Phone</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={{flex: 1}} />
          </View>
          <View style={styles.passwordInputRow}>
            <TextInput
              style={[styles.input, {flex: 1, marginBottom: 0}]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Image
                source={showPassword ? require('../assets/eye.png') : require('../assets/eye (1).png')}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Language</Text>
          <View style={styles.flagRow}>
            <Image source={require('../assets/thai.png')} style={styles.flagIcon} />
            <Image source={require('../assets/usa.png')} style={styles.flagIcon} />
            <Image source={require('../assets/united-arab-emirates.png')} style={styles.flagIcon} />
          </View>
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo-removebg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
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
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 44,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  profileIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profileIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    width: 80,
    height: 80,
    tintColor: DARK_GREEN,
  },
  inputSection: {
    width: '100%',
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 10,
  },
  inputLabel: {
    color: DARK_GREEN,
    fontWeight: 'bold',
    fontSize: 16,
  },
 
  input: {
    backgroundColor: LIGHT_GRAY,
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    width: '100%',
    fontSize: 16,
    color: DARK_GREEN,
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GRAY,
    borderRadius: 14,
    marginBottom: 10,
    paddingRight: 10,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: DARK_GREEN,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  switchLoginText: {
    color: YELLOW,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 180,
  },
  forgotPasswordText: {
    color: YELLOW,
    fontWeight: 'bold',
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: DARK_GREEN,
    padding: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  signupText: {
    color: DARK_GREEN,
    fontSize: 16,
  },
  signupLink: {
    color: YELLOW,
    fontWeight: 'bold',
    fontSize: 16,
  },
  languageSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  languageLabel: {
    color: 'gray',
    fontSize: 16,
    marginBottom: 26,
  },
  flagRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  flagIcon: {
    width: 38,
    height: 38,
    marginHorizontal: 8,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#eee',
  },
  brandingSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DARK_GREEN,
    letterSpacing: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:150,
  },
  logo: {
    width: 190,
    height: 150,
  },
});

export default LoginEmail;