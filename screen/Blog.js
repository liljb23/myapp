import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';


const Blog = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const blogData = [
    {
      id: 1,
      title: 'When is Ramadan 2025 in Thailand',
      description:
        'In Thailand, Eid Al Fitr is an official holiday even though only four to five percent of the population is Muslim...',
      image: 'https://sparbd.org/wp-content/uploads/2024/12/When-is-Ramadan-in-2025.jpg',
    },
    {
      id: 2,
      title: 'Halal and Haram',
      description:
        'Halal and haram are Arabic words that describe what is permitted and what is prohibited in Islamic law...',
      image: 'https://i.ytimg.com/vi/FN6vmdWHUzQ/maxresdefault.jpg',
    },
    {
      id: 3,
      title: 'How many days of shortened prayers can you pray while traveling?',
      description:
        "The prayers of those who travel long distances are given a concession by reducing the number of raka'at...",
      image: 'https://seekersguidance.org/wp-content/uploads/2024/01/shutterstock_2416559337.jpg',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
        {/*<Image source={require('../assets/logo-removebg.png')} style={styles.logo} />*/}
      </View>

      {/* Title */}
      <Text style={styles.pageTitle}>Blog</Text>

      {/* Blog List */}
      <ScrollView>
        {blogData.map((item) => (
          <View key={item.id} style={styles.blogCard}>
            <TouchableOpacity 
            key={item.id} 
            style={styles.blogCard} 
            onPress={() => navigation.navigate('BlogDetail', { blog: item })}
          ></TouchableOpacity>
            <Image source={{ uri: item.image }} style={styles.blogImage} />
            <View style={styles.blogContent}>
              <Text style={styles.blogTitle}>{item.title}</Text>
              <Text style={styles.blogDescription}>{item.description}</Text>

              {/* Read More Button & Favorite */}
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={() => navigation.navigate('BlogDetail', { blog: item })}
                >
                  <Text style={styles.readMoreText}>Read More</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Feather
                    name={favorites.includes(item.id) ? "heart" : "heart"}
                    size={22}
                    color={favorites.includes(item.id) ? "red" : "black"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem
          title="Home"
          iconName="home"
          onPress={() => navigation.navigate("Home" )} 
        />
        <NavItem
          title="Discount"
          iconName="percent"
          onPress={() => navigation.navigate("Discount")}
        />
        <NavItem
          title="Search"
          iconName="map-pin"
          onPress={() => navigation.navigate("Search")}
        />
        <NavItem
          title="Blog"
          iconName="book"
          onPress={() => navigation.navigate("Blog")}
          active
        />
      </View>

    </View>
  );
};

// Navigation Item Component with Feather Icons
const NavItem = ({ title, iconName, active, onPress }) => (
  <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
    <Feather name={iconName} size={24} color={active ? "#FDCB02" : "#9ca3af"} />
    <Text style={[styles.navText, active && styles.navTextActive]}>{title}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    left: 15,  // Keep it aligned to the left
    top: '70%',
    transform: [{ translateY: -20 }],
  },
  logo: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  blogCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  blogImage: {
    width: '100%',
    height: 200,
  },
  blogContent: {
    padding: 15,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  blogDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreButton: {
    backgroundColor: '#063c2f',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  readMoreText: {
    color: 'white',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#063c2f',
    padding: 30,
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

export default Blog;
