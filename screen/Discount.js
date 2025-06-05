import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const discounts = [
  {
    id: '1',
    image: { uri: 'https://f.ptcdn.info/335/026/000/1418041870-1-o.jpg' },
    discount: '20% OFF',
    expiry: 'Expires in February 23, 2025.',
  },
  {
    id: '2',
    image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAkU99BCezR9Jg-hi70UUH1e8VRXdtZ1y5aw&s' },
    discount: '10% OFF',
    expiry: 'Expires in February 28, 2025.',
  },
];

const Discount = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('DiscountDetail', { discount: item })}
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.discountText}>Discount</Text>
        <Text style={styles.discount}>{item.discount}</Text>
        <Text style={styles.expiry}>{item.expiry}</Text>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
        {/*<Image source={require('../assets/logo-removebg.png')} style={styles.logo} />*/}
      </View>

      <Text style={styles.headerText}>Discounts and benefits</Text>
      <FlatList data={discounts} renderItem={renderItem} keyExtractor={(item) => item.id} />

    </View>
  );
};

const NavItem = ({ title, iconName, active, onPress }) => (
  <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
    <Feather name={iconName} size={24} color={active ? "#FDCB02" : "#9ca3af"} />
    <Text style={[styles.navText, active && styles.navTextActive]}>{title}</Text>
  </TouchableOpacity>
);

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
  logo: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
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
    resizeMode:'stretch',
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  discount: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
  expiry: {
    color: '#fff',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#063c2f',
    padding: 15,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  navTextActive: {
    color: '#FDCB02',
    fontWeight: 'bold',
  },
});

export default Discount;
