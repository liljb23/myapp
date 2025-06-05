import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DiscountDetail = ({ route }) => {
  const navigation = useNavigation();
  const { discount } = route.params;

  const [isUsed, setIsUsed] = useState(false);

  const handleUseDiscount = () => {
    setIsUsed(true);
    // สามารถเพิ่มการ Redirect หรือการสร้างโค้ดส่วนลดได้ที่นี่
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={discount.image} 
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Feather name="chevron-left" size={28} color="#063c2f" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.restaurantName}>{discount.name}</Text>
          
          <View style={styles.discountInfo}>
            <Text style={styles.discountText}>Discount <Text style={styles.discountAmount}>{discount.discount}</Text></Text>
            <Text style={styles.expiry}>Expires in {discount.expiry}</Text>
          </View>

          <Text style={styles.description}>
            {discount.description || "A discount code can only be used when booking a hotel room."}
          </Text>
        </View>
      </ScrollView>

      {/* 🔘 ปุ่มใช้ส่วนลด */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.useButton, isUsed && styles.usedButton]}
          onPress={handleUseDiscount}
          activeOpacity={0.8}
          disabled={isUsed}
        >
          <Text style={[styles.useButtonText, isUsed && styles.usedButtonText]}>
            {isUsed ? "Discount Used" : "Use Discount"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#063c2f',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    zIndex: 1,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
    minHeight: Dimensions.get('window').height - 230,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#063c2f',
    marginBottom: 10,
  },
  discountInfo: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  discountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#063c2f',
  },
  discountAmount: {
    color: '#FDCB02',
    fontSize: 20,
    fontWeight: 'bold',
  },
  expiry: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  useButton: {
    backgroundColor: '#FDCB02',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  useButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#063c2f',
  },
  usedButton: {
    backgroundColor: '#B0B0B0',
  },
  usedButtonText: {
    color: '#fff',
  },
});

export default DiscountDetail;