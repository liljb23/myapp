import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AddScreen() {
  const navigation = useNavigation();

  const data = [
    { label: 'Add Service', route: 'AddServiceScreen' },
    { label: 'Add Blog', route: 'BlogList' },
    { label: 'Add Promotion', route: 'AddPromotionScreen' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Add Buttons */}
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons name="add" size={28} color="gray" />
            <Text style={styles.cardText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminScreen')}>
          <Ionicons name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AddScreen')}>
          <Ionicons name="add" size={24} color="#FFD700" />
          <Text style={styles.tabTextActive}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminNoti')}>
          <Ionicons name="notifications-outline" size={24} color="white" />
          <Text style={styles.tabText}>Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: 100,
    backgroundColor: '#00322D',
    paddingHorizontal: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  cardContainer: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#E8ECEC',
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  cardText: {
    color: '#00322D',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#00322D',
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 3,
  },
  tabTextActive: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 3,
  },
});
