import React, { useState, useEffect } from 'react';
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
import { getAuth } from 'firebase/auth';
import { doc, runTransaction, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

/**
 * DiscountDetail Component
 * 
 * หน้าที่หลัก:
 * - แสดงรายละเอียดของ promotion/discount
 * - รองรับการแสดง promotion เดี่ยว หรือหลายรายการพร้อมกัน
 * - คำนวณระยะทางจากผู้ใช้ไปยัง service
 * - จัดการการใช้งานคูปอง (use coupon)
 * 
 * Props:
 * @param {Object} route - Navigation route object
 * @param {string} route.params.promotionDocId - ID ของ promotion (กรณีแสดงเดี่ยว)
 * @param {Array} route.params.discounts - Array ของ discounts (กรณีแสดงหลายรายการ)
 */
const DiscountDetail = ({ route }) => {
  const navigation = useNavigation();
  const { promotionDocId, discounts } = route.params || {};

  // State สำหรับจัดการข้อมูล
  const [discountList, setDiscountList] = useState([]); // สำหรับหลาย discount
  const [userLocation, setUserLocation] = useState(null); // ตำแหน่งปัจจุบันของผู้ใช้
  const [discount, setDiscount] = useState(null); // ข้อมูล promotion เดี่ยว
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const [isUsed, setIsUsed] = useState(false); // สถานะการใช้งานคูปองแล้ว
  const [remaining, setRemaining] = useState(null); // จำนวนคูปองที่เหลือ

  /**
   * ดึงตำแหน่งปัจจุบันของผู้ใช้
   * ใช้สำหรับคำนวณระยะทางไปยัง service ต่างๆ
   */
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // ขออนุญาตเข้าถึงตำแหน่ง
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // ดึงตำแหน่งปัจจุบัน
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation(location.coords);
        }
      } catch (error) {
        console.log('Error getting user location:', error);
      }
    };
    
    getUserLocation();
  }, []);

  /**
   * คำนวณระยะทางระหว่างสองจุดบนโลก (Haversine formula)
   * 
   * @param {number} lat1 - ละติจูดของจุดที่ 1
   * @param {number} lon1 - ลองจิจูดของจุดที่ 1
   * @param {number} lat2 - ละติจูดของจุดที่ 2
   * @param {number} lon2 - ลองจิจูดของจุดที่ 2
   * @returns {number} ระยะทางในหน่วยกิโลเมตร
   */
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    // แปลงองศาเป็นเรเดียน
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }
    
    const R = 6371; // รัศมีของโลกในหน่วยกิโลเมตร
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    // Haversine formula
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

    /**
   * จัดการการแสดงผล discounts หลายรายการ
   * ดึงข้อมูล service ที่เกี่ยวข้องและคำนวณระยะทาง
   */
  useEffect(() => {
    // ถ้ามี discounts หลายอัน (เช่นมาจากหน้า Search)
    if (discounts && Array.isArray(discounts) && userLocation) {
      const fetchServiceDataForDiscounts = async () => {
        try {
          // ดึงข้อมูล service สำหรับแต่ละ discount พร้อมกัน
          const discountsWithServiceData = await Promise.all(
            discounts.map(async (d) => {
              let serviceData = {};
              
              // ถ้ามี serviceId ให้ดึงข้อมูล service จาก Firestore
              if (d.serviceId) {
                try {
                  const serviceRef = doc(FIREBASE_DB, 'Services', d.serviceId);
                  const serviceSnap = await getDoc(serviceRef);
                  if (serviceSnap.exists()) {
                    const service = serviceSnap.data();
                    // รวมข้อมูลที่จำเป็นจาก service
                    serviceData = {
                      shopName: service.name, // ชื่อร้าน
                      shopImage: service.image || service.serviceImages?.[0], // รูปภาพหลัก
                      shopDistance: service.location, // ที่อยู่
                      latitude: service.latitude, // ละติจูด
                      longitude: service.longitude, // ลองจิจูด
                    };
                  }
                } catch (serviceError) {
                  console.log('Error fetching service data for discount:', serviceError);
                }
              }

              // คำนวณระยะทางจากผู้ใช้ไปยัง service
              const lat = Number(serviceData.latitude || d.latitude);
              const lng = Number(serviceData.longitude || d.longitude);
              let distance = null;
              if (!isNaN(lat) && !isNaN(lng)) {
                distance = getDistanceFromLatLonInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  lat,
                  lng
                );
              }

              // รวมข้อมูล discount และ service พร้อมระยะทาง
              return { 
                ...d, 
                ...serviceData,
                _distanceValue: distance 
              };
            })
          );

          // เรียงลำดับตามระยะทาง (ใกล้ไปไกล)
          discountsWithServiceData.sort((a, b) => (a._distanceValue || Infinity) - (b._distanceValue || Infinity));
          setDiscountList(discountsWithServiceData);
        } catch (error) {
          console.log('Error fetching service data for discounts:', error);
        }
      };

      fetchServiceDataForDiscounts();
    }
  }, [discounts, userLocation]);

  /**
   * ดึงข้อมูล promotion เดี่ยวและข้อมูล service ที่เกี่ยวข้อง
   * รวมถึงตรวจสอบสถานะการใช้งานคูปองของผู้ใช้
   */
  useEffect(() => {
    const fetchPromotion = async () => {
      console.log('fetchPromotion called with promotionDocId:', promotionDocId);
      if (!promotionDocId) {
        console.log('No promotionDocId provided');
        return;
      }
      
      try {
        // ดึงข้อมูล promotion จาก Firestore
        const promoRef = doc(FIREBASE_DB, 'promotions', promotionDocId);
        console.log('promoRef:', promoRef);
        const promoSnap = await getDoc(promoRef);
        console.log('promoSnap.exists():', promoSnap.exists());
        
        if (promoSnap.exists()) {
          const promoData = promoSnap.data();
          // ตั้งค่าข้อมูล promotion พื้นฐาน
          setDiscount({ id: promoSnap.id, ...promoData });
          setRemaining(promoData.remaining);

          // ดึงข้อมูล service ที่เกี่ยวข้อง (ถ้ามี serviceId)
          if (promoData.serviceId) {
            try {
              const serviceRef = doc(FIREBASE_DB, 'Services', promoData.serviceId);
              const serviceSnap = await getDoc(serviceRef);
              if (serviceSnap.exists()) {
                const serviceData = serviceSnap.data();
                // รวมข้อมูล service เข้ากับ promotion
                setDiscount(prev => ({
                  ...prev,
                  shopName: serviceData.name, // ชื่อร้าน
                  shopImage: serviceData.image || serviceData.serviceImages?.[0], // รูปภาพหลัก
                  shopDistance: serviceData.location, // ที่อยู่
                  latitude: serviceData.latitude, // ละติจูด
                  longitude: serviceData.longitude, // ลองจิจูด
                }));
              }
            } catch (serviceError) {
              console.log('Error fetching service data:', serviceError);
            }
          }

          // ตรวจสอบสถานะการใช้งานคูปองของผู้ใช้
          const userId = getAuth().currentUser?.uid;
          console.log('userId:', userId);
          if (userId) {
            const userCouponRef = doc(FIREBASE_DB, `user/${userId}/coupons/${promoSnap.id}`);
            const userCouponSnap = await getDoc(userCouponRef);
            console.log('userCouponSnap.exists():', userCouponSnap.exists());
            if (userCouponSnap.exists()) {
              setIsUsed(true); // ผู้ใช้ได้ใช้คูปองนี้แล้ว
            }
          }
        }
      } catch (e) {
        console.log('Error in fetchPromotion:', e);
        Alert.alert('Error', 'ไม่พบข้อมูลคูปองนี้');
      } finally {
        setLoading(false);
        console.log('setLoading(false) called');
      }
    };
    
    fetchPromotion();
  }, [promotionDocId]);

  /**
   * จัดการการใช้งานคูปอง
   * ตรวจสอบเงื่อนไขต่างๆ และบันทึกการใช้งานลงใน Firestore
   */
  const handleUseDiscount = async () => {
    // ตรวจสอบว่าผู้ใช้ได้ใช้คูปองนี้ไปแล้วหรือไม่
    if (isUsed) {
      Alert.alert('Error', 'คุณใช้คูปองนี้ไปแล้ว');
      return;
    }
    
    // ตรวจสอบว่าคูปองหมดแล้วหรือไม่
    if (remaining === 0) return;
    
    try {
      // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือไม่
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'กรุณาเข้าสู่ระบบก่อนใช้คูปอง');
        return;
      }

      // ตรวจสอบซ้ำว่าผู้ใช้ได้ใช้คูปองนี้ไปแล้วหรือไม่
      const userCouponRef = doc(FIREBASE_DB, `user/${userId}/coupons/${discount.id}`);
      const userCouponSnap = await getDoc(userCouponRef);
      if (userCouponSnap.exists()) {
        Alert.alert('Error', 'คุณใช้คูปองนี้ไปแล้ว');
        setIsUsed(true);
        return;
      }

      // ใช้ Transaction เพื่อป้องกัน Race Condition
      const promoRef = doc(FIREBASE_DB, 'promotions', discount.id);
      await runTransaction(FIREBASE_DB, async (transaction) => {
        const promoDoc = await transaction.get(promoRef);
        if (!promoDoc.exists()) throw 'Promotion not found';
        
        const current = promoDoc.data().remaining ?? 0;
        if (current <= 0) throw 'Coupon limit reached';
        
        // ลดจำนวนคูปองที่เหลือลง 1
        transaction.update(promoRef, { remaining: current - 1 });
        setRemaining(current - 1);
      });

      // บันทึกการใช้คูปองใน sub-collection ของ user
      await setDoc(userCouponRef, {
        usedAt: new Date(), // เวลาที่ใช้คูปอง
        couponId: discount.id, // ID ของคูปอง
      });

      setIsUsed(true);
      Alert.alert('Success', 'บันทึกคูปองสำเร็จ!');
    } catch (e) {
      Alert.alert('Error', e.toString());
    }
  };

  // แสดง Loading Screen
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  // แสดง Error Screen เมื่อไม่พบข้อมูล
  if (!discount) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>ไม่พบข้อมูลคูปองนี้</Text>
      </View>
    );
  }

  // สร้างข้อความวันหมดอายุ
  let expiryText = '';
  if (discount.validUntil) {
    const date =
      discount.validUntil.seconds
        ? new Date(discount.validUntil.seconds * 1000) // Firestore Timestamp
        : new Date(discount.validUntil); // JavaScript Date
    expiryText = `Valid until ${date.toLocaleDateString()}`;
  }

  // DEBUG: ข้อมูลสำหรับการ debug (ถูก comment ออกแล้ว)
  const debugInfo = JSON.stringify({ ...discount, remaining }, null, 2);

  // แสดงผล discounts หลายรายการ (กรณีที่ได้รับ discounts array จาก route params)
  if (discountList.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {discountList.map((discount, idx) => {
            // สร้างข้อความวันหมดอายุสำหรับแต่ละ discount
            let expiryText = '';
            if (discount.validUntil) {
              const date =
                discount.validUntil.seconds
                  ? new Date(discount.validUntil.seconds * 1000) // Firestore Timestamp
                  : new Date(discount.validUntil); // JavaScript Date
              expiryText = `Valid until ${date.toLocaleDateString()}`;
            }

            return (
              <View key={discount.id || idx} style={styles.multiDiscountContainer}>
                {/* ส่วนแสดงรูปภาพ */}
                <View style={styles.imageContainer}>
                  {discount.shopImage ? (
                    <Image
                      source={{ uri: discount.shopImage }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    // แสดง placeholder เมื่อไม่มีรูปภาพ
                    <View style={[styles.image, { backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}>
                      <Feather name="image" size={32} color="#ccc" />
                    </View>
                  )}
                  {/* ปุ่มกลับแสดงเฉพาะใน discount แรก */}
                  {idx === 0 && (
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <View style={styles.backButtonCircle}>
                        <Feather name="chevron-left" size={28} color="#063c2f" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                {/* ส่วนแสดงเนื้อหา */}
                <View style={styles.content}>
                  {/* ชื่อร้าน/service */}
                  <Text style={styles.restaurantName}>{discount.shopName || discount.name || 'Discount'}</Text>
                  
                  {/* ระยะทางจากผู้ใช้ */}
                  <View style={styles.distanceRow}>
                    <Feather name="map-pin" size={14} color="#014737" />
                    <Text style={styles.distanceText}>
                      {discount._distanceValue ? `${discount._distanceValue.toFixed(2)} km away` : 'Distance unavailable'}
                    </Text>
                  </View>

                  {/* ข้อมูลส่วนลด */}
                  <View style={styles.discountInfo}>
                    <View style={styles.discountHeader}>
                      <Text style={styles.discountText}>
                        Discount{' '}
                        <Text style={styles.discountAmount}>
                          {discount.discount ? `${discount.discount}% OFF` : ''}
                        </Text>
                      </Text>
                      {/* Status Badge */}
                      <View style={[
                        styles.statusBadge, 
                        discount.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          discount.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
                        ]}>
                          {discount.status === 'active' ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    {/* วันหมดอายุ */}
                    {expiryText ? (
                      <Text style={styles.expiry}>{expiryText}</Text>
                    ) : null}
                  </View>

                  {/* คำอธิบาย */}
                  <Text style={styles.description}>
                    {discount.description ||
                      'A discount code can only be used when booking a hotel room.'}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // แสดงผล promotion เดี่ยว (กรณีที่ได้รับ promotionDocId จาก route params)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ส่วนแสดงรูปภาพ */}
        <View style={styles.imageContainer}>
          {discount.shopImage ? (
            <Image
              source={{ uri: discount.shopImage }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            // แสดง placeholder เมื่อไม่มีรูปภาพ
            <View style={[styles.image, { backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}>
              <Feather name="image" size={32} color="#ccc" />
            </View>
          )}
          {/* ปุ่มกลับ */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Feather name="chevron-left" size={28} color="#063c2f" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ส่วนแสดงเนื้อหา */}
        <View style={styles.content}>
          {/* ชื่อร้าน/service */}
          <Text style={styles.restaurantName}>{discount.shopName || discount.name || 'Discount'}</Text>
          
          {/* ที่อยู่ (ถ้ามี) */}
          {discount.shopDistance && discount.shopDistance !== '-' ? (
            <View style={styles.distanceRow}>
              <Feather name="map-pin" size={14} color="#014737" />
              <Text style={styles.distanceText}>{discount.shopDistance}</Text>
            </View>
          ) : null}
          
          {/* ข้อมูลส่วนลด */}
          <View style={styles.discountInfo}>
            <View style={styles.discountHeader}>
              <Text style={styles.discountText}>
                Discount{' '}
                <Text style={styles.discountAmount}>
                  {discount.discount ? `${discount.discount}% OFF` : ''}
                </Text>
              </Text>
              {/* Status Badge */}
              <View style={[
                styles.statusBadge, 
                discount.status === 'active' ? styles.activeBadge : styles.inactiveBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  discount.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
                ]}>
                  {discount.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            {/* วันหมดอายุ */}
            {expiryText ? (
              <Text style={styles.expiry}>{expiryText}</Text>
            ) : null}
          </View>

          {/* คำอธิบาย */}
          <Text style={styles.description}>
            {discount.description ||
              'A discount code can only be used when booking a hotel room.'}
          </Text>

          {/* DEBUG SECTION (ถูก comment ออกแล้ว)
          <View style={styles.debugBox}>
            <Text style={{ fontWeight: 'bold', color: '#c00' }}>DEBUG:</Text>
            <Text style={{ fontSize: 12, color: '#333' }}>{debugInfo}</Text>
          </View> */}
        </View>
      </ScrollView>

      {/* ส่วนปุ่มใช้งานคูปอง */}
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
              ? 'Coupon Limit Reached'
              : isUsed
              ? 'Discount Used'
              : 'Use Discount'}
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
  multiDiscountContainer: {
    marginBottom: 20,
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
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#E0F2F7',
    borderWidth: 1,
    borderColor: '#A7DBE6',
  },
  inactiveBadge: {
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#F5B7B7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#063c2f',
  },
  inactiveStatusText: {
    color: '#D32F2F',
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