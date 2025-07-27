import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function DiscountDetailEntrepreneur({ route }) {
  const { promotionDocId } = route.params;
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [used, setUsed] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPromotionAndUsage = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูลโปรโมชัน
        const promoRef = doc(FIREBASE_DB, 'promotions', promotionDocId);
        const promoSnap = await getDoc(promoRef);
        if (promoSnap.exists()) {
          const promoData = promoSnap.data();
          setPromotion(promoData);

          // 2. ดึงยอดใช้จริง (นับ user ที่ใช้คูปองนี้)
          let usedCount = 0;
          const usersCol = collection(FIREBASE_DB, 'user');
          const usersSnap = await getDocs(usersCol);
          for (const userDoc of usersSnap.docs) {
            const couponsCol = collection(FIREBASE_DB, 'user', userDoc.id, 'coupons');
            const couponsSnap = await getDocs(couponsCol);
            couponsSnap.forEach(couponDoc => {
              if (couponDoc.id === promotionDocId) usedCount += 1;
            });
          }
          setUsed(usedCount);
        }
      } catch (e) {
        setPromotion(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotionAndUsage();
  }, [promotionDocId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!promotion) return <Text style={{ margin: 20 }}>Promotion not found.</Text>;

  const remaining = (promotion.remaining || 0) - used;
  const validUntil = promotion.validUntil && promotion.validUntil.seconds
    ? new Date(promotion.validUntil.seconds * 1000).toLocaleDateString()
    : 'N/A';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#014737" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotion Detail</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Menu')}>
          <Feather name="menu" size={28} color="#014737" />
        </TouchableOpacity>
      </View>

      {/* Promotion Box */}
      <View style={styles.promoBox}>
        <View style={styles.promoHeader}>
          <Text style={styles.promoTitle}>{promotion.title}</Text>
          {/* Status Badge */}
          <View style={[
            styles.statusBadge, 
            promotion.status === 'active' ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              promotion.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
            ]}>
              {promotion.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text style={styles.promoDesc}>{promotion.description}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.discountLabel}>Discount</Text>
          <Text style={styles.discountValue}>{promotion.discount ? `${promotion.discount}%` : 'N/A'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.validLabel}>Valid until</Text>
          <Text style={styles.validValue}>{validUntil}</Text>
        </View>
      </View>

      {/* Usage Box */}
      <View style={styles.usageBox}>
        <View style={styles.usageRow}>
          <Text style={styles.usageLabel}>Used</Text>
          <Text style={styles.usageValue}>{used}</Text>
        </View>
        <View style={styles.usageRow}>
          <Text style={styles.usageLabel}>Remaining</Text>
          <Text style={styles.usageValue}>{remaining}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 0,
  },
  header: {
    backgroundColor: '#014737',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    justifyContent: 'space-between', // add for spacing
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    marginLeft: 16,
    padding: 4,
  },
  promoBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#014737',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#E8F5E9', // Light green background
    borderWidth: 1,
    borderColor: '#4CAF50', // Green border
  },
  inactiveBadge: {
    backgroundColor: '#FBE9E7', // Light red background
    borderWidth: 1,
    borderColor: '#E64A19', // Red border
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeStatusText: {
    color: '#4CAF50', // Green text
  },
  inactiveStatusText: {
    color: '#E64A19', // Red text
  },
  promoDesc: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  discountLabel: {
    fontSize: 16,
    color: '#666',
  },
  discountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDCB02',
  },
  validLabel: {
    fontSize: 16,
    color: '#666',
  },
  validValue: {
    fontSize: 16,
    color: '#014737',
    fontWeight: 'bold',
  },
  usageBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  usageLabel: {
    fontSize: 16,
    color: '#333',
  },
  usageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#014737',
  },
}); 