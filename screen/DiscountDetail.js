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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { doc, runTransaction } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const DiscountDetail = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { discount } = route.params;

  if (!discount) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: '#c00', fontWeight: 'bold' }}>No discount data found.</Text>
      </View>
    );
  }

  const [isUsed, setIsUsed] = useState(false);
  const [remaining, setRemaining] = useState(discount?.remaining ?? 0);

  let expiryText = '';
  if (discount.validUntil) {
    const date =
      discount.validUntil.seconds
        ? new Date(discount.validUntil.seconds * 1000)
        : new Date(discount.validUntil);
    expiryText = t('expiresIn', { date: date.toLocaleDateString() });
  }

  // DEBUG
  //const debugInfo = JSON.stringify({ ...discount, remaining }, null, 2);

  // คูปอง
  const handleUseDiscount = async () => {
    if (isUsed || remaining === 0) return;
    try {
      const promoRef = doc(FIREBASE_DB, 'promotions', discount.id);
      await runTransaction(FIREBASE_DB, async (transaction) => {
        const promoDoc = await transaction.get(promoRef);
        if (!promoDoc.exists()) throw t('error');
        const current = promoDoc.data().remaining ?? 0;
        if (current <= 0) throw t('couponLimitReached');
        transaction.update(promoRef, { remaining: current - 1 });
        setRemaining(current - 1);
      });
      setIsUsed(true);
      Alert.alert(t('success'), t('couponSaved'));
    } catch (e) {
      Alert.alert(t('error'), e.toString());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {discount.shopImage ? (
            <Image
              source={{ uri: discount.shopImage }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, { backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}>
              <Feather name="image" size={32} color="#ccc" />
            </View>
          )}
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
          <Text style={styles.restaurantName}>{discount.shopName || discount.name || t('discount')}</Text>
          {discount.shopDistance && discount.shopDistance !== '-' ? (
            <View style={styles.distanceRow}>
              <Feather name="map-pin" size={14} color="#014737" />
              <Text style={styles.distanceText}>{discount.shopDistance}</Text>
            </View>
          ) : null}
          <View style={styles.discountInfo}>
            <Text style={styles.discountText}>
              {t('discount')}{' '}
              <Text style={styles.discountAmount}>
                {discount.discount ? `${discount.discount}% ${t('discount')}` : ''}
              </Text>
            </Text>
            {expiryText ? (
              <Text style={styles.expiry}>{expiryText}</Text>
            ) : null}
          </View>

          <Text style={styles.description}>
            {discount.description || t('discountDescription')}
          </Text>

          {/* DEBUG SECTION
          <View style={styles.debugBox}>
            <Text style={{ fontWeight: 'bold', color: '#c00' }}>DEBUG:</Text>
            <Text style={{ fontSize: 12, color: '#333' }}>{debugInfo}</Text>
          </View> */}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.useButton,
            isUsed && styles.usedButton,
            remaining === 0 && styles.usedButton,
          ]}
          onPress={handleUseDiscount}
          activeOpacity={0.8}
          disabled={isUsed || remaining === 0}
        >
          <Text
            style={[
              styles.useButtonText,
              (isUsed || remaining === 0) && styles.usedButtonText,
            ]}
          >
            {remaining === 0
              ? t('couponLimitReached')
              : isUsed
              ? t('discountUsed')
              : t('useDiscount')}
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
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 5,
  },
  distanceText: {
    fontSize: 12,
    color: '#014737',
    fontWeight: '500',
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
  debugBox: {
    marginTop: 18,
    backgroundColor: '#ffeaea',
    borderRadius: 8,
    padding: 10,
  },
});

export default DiscountDetail;