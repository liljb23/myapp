import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from './AuthContext';




const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryServices', { category });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Menu')}>
            <Feather name="menu" size={35} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image
            //source={require('../png/logo.png')}
            style={[styles.logo]} 
            resizeMode="contain"
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
          >
            <Feather name="search" size={20} color="#666" />
            <Text style={styles.searchPlaceholderText}>Search...</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Section */}
        {!user && (
          <View style={styles.authButtons}>
            {/* ปุ่ม Login */}
            <TouchableOpacity
              style={[styles.authButton, styles.loginButton]}
              onPress={() => navigation.navigate('Login-email')}
            >
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>

            {/* ปุ่ม Register */}
            <TouchableOpacity
              style={[styles.authButton, styles.registerButton]}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        )}



        {/* Recommends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommends</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <RecommendCard
              title="Halal Food Hua Hin 105"
              category="Restaurant"
              rating="4.8"
              location="Petchkasem 404"
              distance="1.2 km"
              imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZO56UCCmdRQ8W8JDteyRR-l9o6KKlALySCw&s"
            />
            <RecommendCard
              title="Saki Halal Kitchen"
              category="Restaurant"
              rating="4.5"
              location="The Promenade"
              distance="2.5 km"
              imageUrl="https://lh3.googleusercontent.com/proxy/mDSe70WRkwvRt4wqDvrMyHdexfoWemYGCcnObdgJcbYrtGZQxnKbv9Q7kJiA15JeYEu9oAZQUtG3d5usnSuBfgk3Qt4d-db6r5V1aQCQWJiO1CA7p9IJRi6vCw"
            />
            <RecommendCard
              title="Aroiboktor H."
              category="Restaurant"
              rating="4.6"
              location="Plus Phahonyat, Bangkok"
              distance="1.5 km"
              imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHnBN1HAe8jnw34i5plqOk603GYoBmbz_pVg&s"
            />
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategoryIcon title="Restaurant" emoji="🍽️" onPress={() => navigation.navigate('Search', { category: 'Restaurant' })} />
            <CategoryIcon title="Beauty & Salon" emoji="💈" onPress={() => navigation.navigate('Search', { category: 'Beauty salon' })} />
            <CategoryIcon title="Resort & Hotel" emoji="🏖️" onPress={() => navigation.navigate('Search', { category: 'Resort & Hotel' })} />
            <CategoryIcon title="Tourist Attraction" emoji="⛰️" onPress={() => navigation.navigate('Search', { category: 'attraction' })} />
            <CategoryIcon title="Mosque" emoji="🕌" onPress={() => navigation.navigate('Search', { category: 'Mosque' })} />
          </ScrollView>
        </View>

        {/* Blog Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blog</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.blogCard}>
            <Image
              source={{ uri: 'https://sparbd.org/wp-content/uploads/2024/12/When-is-Ramadan-in-2025.jpg' }}
              style={styles.blogImage}
            />
            <View style={styles.blogContent}>
              <View style={styles.blogTag}>
                <Text style={styles.blogTagText}>Ramadan 2025</Text>
              </View>
              <Text style={styles.blogTitle}>A Complete Guide to Ramadan</Text>
              <Text style={styles.blogDescription}>Learn about dates, traditions, and preparing for the holy month</Text>
            </View>
          </View>
        </View>

        {/* Mosque Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mosque near you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LocationCard
              title="Nurul Ihsan Mosque"
              type="Mosque"
              distance="0.8 km"
              imageUrl="https://lh3.googleusercontent.com/p/AF1QipOpAJbs0m-DZbkLr8AKFxU8FM6KBotpyOl3qiOv=s1360-w1360-h1020"
            />
            <LocationCard
              title="Darul Muhajirin Mosque"
              type="Mosque"
              distance="1.5 km"
              imageUrl="https://www.cicot.or.th/storages/mosques/illustration/PBI151200012_01.jfif"
            />
          </ScrollView>
        </View>

        {/* Tourist Attractions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tourist attractions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LocationCard
              title="Huai Thung Wildlife Breeding Center"
              type="Tourist attraction"
              distance="3.2 km"
              imageUrl="https://travelling-as-a-couple.com/wp-content/uploads/2022/05/22-05-02-14-03-04-138_deco.jpg?w=1024"

            />
            <LocationCard
              title="Camel Republic"
              type="Tourist attraction"
              distance="5.0 km"
              imageUrl="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/64/1b/c8/getlstd-property-photo.jpg?w=1200&h=-1&s=1"

            />
          </ScrollView>
        </View>

        {/* Places of Prayer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Places of prayer near you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LocationCard
              title="Blueport Prayer Room"
              type="Prayer Space"
              distance="0.5 km"
              imageUrl="https://www.chillpainai.com/src/wewakeup/scoop/img_scoop/Jibby/Bluport/web.jpg"

            />
            <LocationCard
              title="PTT Station (Lung Theng)"
              type="Prayer Space"
              distance="1.0 km"
              imageUrl="https://images.autofun.co.th/file1/ba68bfe3dfed4784a91a61194f8f5295_678x380.jpg"
            />
          </ScrollView>
        </View>

        {/* Discounts and Benefits */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Discounts and benefits</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <PromotionCard
              discount="15%"
              title="Minimum of 300 baht"
              description="Discount when purchasing a minimum of 300 baht"
              expiryDate="Valid until 15 Apr"

            />
            <PromotionCard
              discount="₿80"
              title="New User Bonus"
              description="Special welcome discount"
              expiryDate="Valid for 7 days"
            />
            <PromotionCard
              discount="50%"
              title="Member special discount"
              description="Special for member 1 mouth"
              expiryDate="Valid for 7 days"
            />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const LocationCard = ({ title, type, distance, imageUrl }) => (
  <TouchableOpacity style={styles.locationCard}>
    <Image
      source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
      style={styles.locationImage}
    />
    <View style={styles.locationContent}>
      <View style={styles.locationHeader}>
        <Text style={styles.locationTitle} numberOfLines={2}>{title}</Text>
        <TouchableOpacity style={styles.heartButton}>
          <Feather name="heart" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.locationType}>{type}</Text>
      <View style={styles.locationFooter}>
        <Feather name="map-pin" size={14} color="#666" />
        <Text style={styles.distanceText}>{distance}</Text>
      </View>
    </View>
  </TouchableOpacity>
);



const CategoryIcon = ({ title, emoji, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.categoryItem}>
    <View style={styles.categoryIcon}>
      <Text style={styles.categoryEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.categoryLabel}>{title}</Text>
  </TouchableOpacity>
);

const RecommendCard = ({ title, category, location, imageUrl }) => (
  <TouchableOpacity style={styles.recommendCard}>
    <Image
      source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
      style={styles.recommendImage}
    />
    <View style={styles.recommendContent}>
      <View style={styles.recommendHeader}>
        <Text style={styles.recommendTitle} numberOfLines={2}>{title}</Text>
        <TouchableOpacity style={styles.heartButton}>
          <Feather name="heart" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.recommendCategory}>({category})</Text>
      <View style={styles.recommendLocation}>
        <Feather name="map-pin" size={14} color="#666" />
        <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const NearestCard = ({ title, type, distance }) => (
  <TouchableOpacity style={styles.nearestCard}>
    <Image
      source={{ uri: 'https://via.placeholder.com/100' }}
      style={styles.nearestImage}
    />
    <View style={styles.nearestContent}>
      <Text style={styles.nearestTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.nearestType}>{type}</Text>
      <Text style={styles.nearestDistance}>{distance}</Text>
    </View>
  </TouchableOpacity>
);

const PromotionCard = ({ discount, title, description, expiryDate }) => (
  <TouchableOpacity style={styles.promotionCard}>
    <View style={styles.promotionHeader}>
      <Text style={styles.promotionDiscount}>{discount}</Text>
      <Text style={styles.promotionOff}>OFF</Text>
    </View>
    <Text style={styles.promotionTitle}>{title}</Text>
    <Text style={styles.promotionDescription}>{description}</Text>
    <Text style={styles.promotionExpiry}>{expiryDate}</Text>
  </TouchableOpacity>
);

const NavItem = ({ title, iconName, active, onPress }) => (
  <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
    <Feather name={iconName} size={24} color={active ? "#FDCB02" : "#9ca3af"} />
    <Text style={[styles.navText, active && styles.navTextActive]}>{title}</Text>
  </TouchableOpacity>
);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#014737',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'relative',
    height: 200,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 150,
  },
  logo: {
    width: 190,
    height: 150,
  },
  searchBarContainer: {
    paddingHorizontal: 5,
  },
  searchWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingHorizontal: 20,
    zIndex: 1,
    bottom: -10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  searchPlaceholderText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginVertical: 20,  
    gap: 10, 
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130, 
  },
  loginButton: {
    backgroundColor: '#063c2f',
  },
  registerButton: {
    backgroundColor: 'white', 
    borderWidth: 2,
    borderColor: '#063c2f',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#063c2f', 
  },
  iconButton: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#014737',
    marginBottom: 20,
  },
  seeAll: {
    fontSize: 14,
    color: '#666',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 15,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  locationImage: {
    width: '100%',
    height: 120,
  },
  locationContent: {
    padding: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#014737',
    flex: 1,
    marginRight: 8,
  },
  locationType: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 12,
    color: '#014737',
    fontWeight: '500',
  },
  heartButton: {
    padding: 4,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconActive: {
    backgroundColor: '#014737',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  categoryLabelActive: {
    color: '#014737',
    fontWeight: '500',
  },
  recommendCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 15,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  recommendContent: {
    padding: 12,
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#014737',
    flex: 1,
    marginRight: 10,
  },
  heartButton: {
    padding: 5,
  },
  recommendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  recommendCategory: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  recommendLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    color: '#014737',
    fontWeight: '500',
  },
  blogCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blogImage: {
    width: '100%',
    height: 180,
  },
  blogContent: {
    padding: 15,
  },
  blogTag: {
    backgroundColor: '#014737',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  blogTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#014737',
    marginBottom: 8,
  },
  blogDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nearestGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  nearestCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nearestImage: {
    width: '100%',
    height: 120,
  },
  nearestContent: {
    padding: 12,
  },
  nearestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#014737',
    marginBottom: 4,
  },
  nearestType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nearestDistance: {
    fontSize: 12,
    color: '#014737',
    fontWeight: '500',
  },
  promotionSection: {
    marginBottom: 80,
  },
  promotionCard: {
    width: 200,
    backgroundColor: '#014737',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
  },
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  promotionDiscount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 5,
  },
  promotionOff: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  promotionDescription: {
    fontSize: 13,
    color: 'white',
    opacity: 0.8,
    marginBottom: 12,
  },
  promotionExpiry: {
    fontSize: 12,
    color: 'white',
    opacity: 0.6,
  },
});

export default HomeScreen;