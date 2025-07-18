import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  SafeAreaView,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { navigationRef } from '../App';

const Register = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('General User');
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const db = FIREBASE_DB;

  const roles = [
    { id: '1', title: t('generalUser') },
    { id: '2', title: t('entrepreneur') },
    // { id: '3', title: t('admin') }
  ];

  const languages = [
    { code: 'th', flag: require('../assets/thai.png') },
    { code: 'en', flag: require('../assets/usa.png') },
    { code: 'ar', flag: require('../assets/united-arab-emirates.png') },
  ];

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole.title);
    setIsDropdownVisible(false);
  };
  
  const handleRegister = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    if (!password) {
      alert('Please enter a password.');
      return;
    }
  
    setLoading(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      console.log("User registered:", user);
  
      // บันทึกข้อมูลผู้ใช้ลง Firestore
      await setDoc(doc(FIREBASE_DB, "user", user.uid), {
        name: name || "",  // ป้องกันค่า undefined
        email: user.email,
        phone: phone || "",
        role: role,
        createdAt: new Date(),
      });
  
      alert("Registration successful!");
  
      // ✅ ตรวจสอบ Role และเปลี่ยนหน้า
      if (role === "Admin") {
        navigation.navigate('AdminScreen'); // 👉 สำหรับผู้ดูแลระบบ
      } else if (role === "Entrepreneur") {
        navigation.navigate('EntrepreneurHome'); // 👉 สำหรับผู้ประกอบการ
      } else {
        navigationRef.current?.reset({ index: 0, routes: [ { name: 'GeneralUserTabs', state: { index: 0, routes: [{ name: 'HomeTab' }] } } ] }); // 👉 สำหรับผู้ใช้ทั่วไป
      }
      
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (code) => {
    await i18n.changeLanguage(code);
    await SecureStore.setItemAsync('appLanguage', code);
  };

  const RoleDropdown = () => (
    <Modal
      visible={isDropdownVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsDropdownVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1} 
        onPress={() => setIsDropdownVisible(false)}
      >
        <View style={[styles.dropdownContainer, { top: 470 }]}>
          <FlatList
            data={roles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleRoleSelect(item)}
              >
                <Text style={[
                  styles.dropdownItemText,
                  role === item.title && styles.dropdownItemTextSelected
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigationRef.current?.reset({ index: 0, routes: [ { name: 'GeneralUserTabs', state: { index: 0, routes: [{ name: 'HomeTab' }] } } ] })}
      >
        <Feather name="arrow-left" size={32} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>{t('createAccount')}</Text>
        <Text style={styles.headerSubtitle}>{t('setUpUserNameAndPassword')}</Text>
      </View>

      {/* <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require('./assets/add-user.png')} 
            style={styles.avatarIcon}
          />
        </View>
      </View> */}

      <KeyboardAvoidingView behavior="padding" style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('name')}<Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={name}
            style={styles.input}
            placeholder={t('username')}
            placeholderTextColor="#666666"
            autoCapitalize="none"
            onChangeText={(text) => setName(text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('email')}<Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={email}
            style={styles.input}
            placeholder={t('emailPlaceholder')}
            placeholderTextColor="#666666"
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('password')}<Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={password}
            style={styles.input}
            placeholder={t('passwordPlaceholder')}
            placeholderTextColor="#666666"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('phoneNumber')}<Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={phone}
            style={styles.input}
            placeholder={t('phonePlaceholder')}
            placeholderTextColor="#666666"
            keyboardType="phone-pad"
            onChangeText={(text) => setPhone(text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('role')}<Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={styles.roleSelector}
            onPress={() => setIsDropdownVisible(true)}
          >
            <Text style={styles.roleSelectorText}>{role}</Text>
            <View style={styles.chevronContainer}>
              <View style={styles.chevron} />
            </View>
          </TouchableOpacity>
        </View>

        <RoleDropdown />

        {loading ? (
          <ActivityIndicator size="large" color="#014737" />
        ) : (
          <TouchableOpacity style={styles.continueButton} onPress={handleRegister}>
            <Text style={styles.continueButtonText}>{t('continue')}</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>

      <View style={styles.languageSection}>
        <Text style={styles.languageLabel}>{t('language')}</Text>
        <View style={styles.flagRow}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageChange(lang.code)}
              style={[
                styles.flagIcon,
                i18n.language === lang.code && styles.selectedFlagIcon
              ]}
            >
              <Image source={lang.flag} style={styles.flagImage} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* <View style={styles.footerSection}>
        <Image 
          source={require('./assets/halal-way-logo.png')}
          style={styles.brandLogo}
        />
      </View> */}
    </SafeAreaView>
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
    marginBottom : 20,
  },
  headerText: {
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
  input: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  roleSelector: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleSelectorText: {
    fontSize: 16,
    color: '#333333',
  },
  chevronContainer: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#333333',
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  dropdownContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownItemTextSelected: {
    color: '#014737',
    fontWeight: '600',
  },
  dropdownIcon: {
    width: 24,
    height: 24,
  },
  continueButton: {
    backgroundColor: '#014737',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  brandLogo: {
    height: 40,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
    borderRadius: 20,
    padding: 4,
    elevation: 2,
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
    borderWidth: 2,
    borderColor: '#eee',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFlagIcon: {
    borderColor: '#014737',
    borderWidth: 3,
  },
  flagImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
});

export default Register;