import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from './FirebaseConfig';

const Discount = () => {
  const navigation = useNavigation();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const promotionsCol = collection(FIREBASE_DB, 'promotions');
        const snapshot = await getDocs(promotionsCol);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDiscounts(list);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('DiscountDetail', { discount: item })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.image} />
      )}
      <View style={styles.overlay}>
        <Text style={styles.discountText}>{item.name || 'Discount'}</Text>
        <Text style={styles.discount}>{item.discount ? `${item.discount}% OFF` : ''}</Text>
        {item.validUntil && (
          <Text style={styles.expiry}>
            Valid until {new Date(item.validUntil.seconds ? item.validUntil.seconds * 1000 : item.validUntil).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#063c2f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerText}>Discounts and benefits</Text>
      <FlatList data={discounts} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#063c2f',
    paddingVertical: 40,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: '70%',
    transform: [{ translateY: -20 }],
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  card: {
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  image: {
    width: '100%',
    height: 120,
    opacity: 0.5,
    alignItems: 'flex-end',
    resizeMode: 'stretch',
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  discount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expiry: {
    color: '#fff',
    fontSize: 12,
  },
});

export default Discount;
