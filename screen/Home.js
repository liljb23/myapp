import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { collection, getDocs, query, where, doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';

const updateCampaignReport = async ({ campaignId, serviceId, entrepreneurId, type }) => {
  try {
    if (!campaignId || !serviceId || !entrepreneurId || !type) {
      console.log('Missing field:', { campaignId, serviceId, entrepreneurId, type });
      return;
    }
    const reportRef = doc(FIREBASE_DB, 'CampaignReports', String(campaignId));
    const updateData = {
      updatedAt: serverTimestamp(),
    };
    if (type === 'impression') updateData.impressions = increment(1);
    if (type === 'click') updateData.clicks = increment(1);
    if (type === 'conversion') updateData.conversions = increment(1);

    await setDoc(reportRef, {
      campaignId,
      serviceId,
      entrepreneurId,
      createdAt: serverTimestamp(),
      ...updateData,
    }, { merge: true });
    console.log('✅ Firestore write success:', campaignId);
  } catch (e) {
    console.error('❌ Firestore write error:', e);
  }
};

const Home = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [recommends, setRecommends] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [mosques, setMosques] = useState([]);
  const [touristAttractions, setTouristAttractions] = useState([]);
  const [prayerPlaces, setPrayerPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation(null);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Services
        const servicesCollectionRef = collection(FIREBASE_DB, 'Services');
        const servicesSnapshot = await getDocs(servicesCollectionRef);
        setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Recommends
        const recommendCollectionRef = collection(FIREBASE_DB, 'CampaignSubscriptions');
        const recommendQuery = query(recommendCollectionRef, where('status', '==', 'approved'));
        const recommendSnapshot = await getDocs(recommendQuery);
        const recommendsRaw = recommendSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const serviceIds = recommendsRaw.map(r => r.serviceId).filter(Boolean);
        let recommendsWithService = [];
        if (serviceIds.length > 0) {
          const batchSize = 10;
          let servicesMap = {};
          for (let i = 0; i < serviceIds.length; i += batchSize) {
            const batchIds = serviceIds.slice(i, i + batchSize);
            const servicesQuery = query(
              servicesCollectionRef,
              where('__name__', 'in', batchIds)
            );
            const servicesSnapshot = await getDocs(servicesQuery);
            servicesSnapshot.docs.forEach(doc => {
              servicesMap[doc.id] = { id: doc.id, ...doc.data() };
            });
          }
          recommendsWithService = recommendsRaw.map(r => ({
            ...r,
            ...servicesMap[r.serviceId],
          }));

          const seen = new Set();
          recommendsWithService = recommendsWithService.filter(r => {
            if (!r.serviceId) return false;
            if (seen.has(r.serviceId)) return false;
            seen.add(r.serviceId);
            return true;
          });
        }
        setRecommends(recommendsWithService);

        // Blog
        const blogsCollectionRef = collection(FIREBASE_DB, 'Blog');
        const blogsSnapshot = await getDocs(blogsCollectionRef);
        setBlogs(blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Mosques
        const mosqueCollectionRef = collection(FIREBASE_DB, 'Services');
        const mosqueQuery = query(mosqueCollectionRef, where('category', '==', 'Mosque'));
        const mosqueSnapshot = await getDocs(mosqueQuery);
        setMosques(mosqueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Tourist Attractions
        const touristCollectionRef = collection(FIREBASE_DB, 'Services');
        const touristQuery = query(touristCollectionRef, where('category', '==', 'Tourist attraction'));
        const touristSnapshot = await getDocs(touristQuery);
        setTouristAttractions(touristSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Places of Prayer
        const prayerCollectionRef = collection(FIREBASE_DB, 'Services');
        const prayerQuery = query(prayerCollectionRef, where('category', '==', 'Prayer Space'));
        const prayerSnapshot = await getDocs(prayerQuery);
        setPrayerPlaces(prayerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));


        const addDistanceAndSort = (list) => {
          if (!userLocation) return list;
          return list
            .map(item => {
              if (item.latitude && item.longitude) {
                const distance = getDistanceFromLatLonInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  Number(item.latitude),
                  Number(item.longitude)
                );
                return { ...item, distance: `${distance.toFixed(2)} km`, _distanceValue: distance };
              }
              return { ...item, distance: '-', _distanceValue: Infinity };
            })
            .sort((a, b) => a._distanceValue - b._distanceValue);
        };

        setMosques(prev => addDistanceAndSort(prev));
        setTouristAttractions(prev => addDistanceAndSort(prev));
        setPrayerPlaces(prev => addDistanceAndSort(prev));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#063c2f" />
      </View>
    );
  }

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
            //source={require('../png/logo-removebg.png')}
            style={styles.logo}
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
        {user ? (
          // 🔹 ถ้าผู้ใช้ล็อกอินอยู่
          <View style={styles.userSection}>
            <View>
            <Text style={{ fontSize: 18 }}>Hello, {user.username || user.email}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="heart" size={22} color="#014737" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={22} color="#014737" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => FIREBASE_AUTH.signOut()}>
                <Feather name="log-out" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // 🔹 ถ้ายังไม่ล็อกอิน แสดงปุ่มสมัครและล็อกอิน
          <View style={styles.authButtons}>
            <TouchableOpacity style={[styles.authButton, styles.loginButton]} onPress={() => navigation.navigate('Login-email')}>
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.authButton, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
          
        )}
        {/* <View style={styles.userSection}>
          <View>
          <Text style={styles.greeting}>Hello , Yussrol</Text>
          <Text style={styles.userEmail}>yussrolmass@gmail.com</Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="heart" size={22} color="#014737" />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={22} color="#014737" />
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Recommends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommends</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </ScrollView> */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommends.map(recommend => (
              <RecommendCard
                key={recommend.id}
                campaignId={recommend.campaignId || recommend.id}
                serviceId={recommend.serviceId}
                entrepreneurId={recommend.EntrepreneurId}
                name={recommend.name}
                category={recommend.category}
                location={recommend.location}
                image={recommend.image}
              />
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategoryIcon title="Restaurant" emoji="🍽️" onPress={() => navigation.navigate('Search', { category: 'Restaurant' })}/>
            <CategoryIcon title="Beauty & Salon" emoji="💈" onPress={() => navigation.navigate('Search', { category: 'Beauty & salon' })}/>
            <CategoryIcon title="Resort & Hotel" emoji="🏖️" onPress={() => navigation.navigate('Search', { category: 'Resort & Hotel' })}/>
            <CategoryIcon title="Tourist Attraction" emoji="⛰️" onPress={() => navigation.navigate('Search', { category: 'attraction' })}/>
            <CategoryIcon title="Mosque" emoji="🕌" onPress={() => navigation.navigate('Search', { category: 'Mosque' })}/>
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
          {blogs.map(blog => (
            <BlogCard key={blog.id} {...blog} />
          ))}
          {/* <View style={styles.blogCard}>
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
          </View> */}
        </View>

        {/* Mosque Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mosque near you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mosques.map(mosque => (
              <LocationCard key={mosque.id} {...mosque} />
            ))}
          </ScrollView>
        </View>
        {/* <View style={styles.section}>
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
        </View> */}

        {/* Tourist Attractions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tourist attractions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {touristAttractions.map(attraction => (
              <LocationCard key={attraction.id} {...attraction} />
            ))}
          </ScrollView>
        </View>

        {/* <View style={styles.section}>
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
        </View> */}

        {/* Places of Prayer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Places of prayer near you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {prayerPlaces.map(place => (
              <LocationCard key={place.id} {...place} />
            ))}
          </ScrollView>
        </View>

        {/* <View style={styles.section}>
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
        </View> */}

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
// const getDistanceFromGoogle = async (latitude, longitude) => {
//   try {
//     // ขอสิทธิ์เข้าถึงตำแหน่งของผู้ใช้
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       console.log("Permission to access location was denied");
//       return "Location Permission Denied";
//     }

//     // ดึงตำแหน่งปัจจุบันของผู้ใช้
//     let location = await Location.getCurrentPositionAsync({});
//     const { destinationLat, destinationLon } = location.coords;

//     // เรียก API Google Maps Distance Matrix
//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${destinationLat},${destinationLon}&destinations=${latitude},${longitude}&key=${API_KEY}`;
    
//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.rows.length > 0 && data.rows[0].elements.length > 0) {
//       return data.rows[0].elements[0].distance.text; // ได้ค่าระยะทางเป็น string เช่น "5.2 km"
//     } else {
//       return "Distance not found";
//     }
//   } catch (error) {
//     console.error(error);
//     return "Error fetching distance";
//   }
// };
// const LocationCard = ({ name, category, latitude, longitude, image }) => {
//   const [distance, setDistance] = useState("...");

//   useEffect(() => {
//     getDistanceFromGoogle(latitude, longitude).then((dist) => {
//       setDistance(dist);
//     });
//   }, []);
  const LocationCard = ({ name, category, distance, image }) => (
  <TouchableOpacity style={styles.locationCard} onPress={() => navigation.navigate("Detail")} >
      <Image source={{ uri: image }} style={styles.locationImage} />
      <View style={styles.locationContent}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationTitle} numberOfLines={2}>{name}</Text>
          <TouchableOpacity style={styles.heartButton}>
            <Feather name="heart" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.locationType}>{category}</Text>
        <View style={styles.locationFooter}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

const CategoryIcon = ({ title, emoji, onPress, isActive }) => (
  <TouchableOpacity style={[styles.categoryItem, isActive && styles.categoryItemActive]}onPress={onPress}>
    <View style={[styles.categoryIcon, isActive && styles.categoryIconActive]}>
      <Text style={styles.categoryEmoji}>{emoji}</Text>
    </View>
    <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>{title}</Text>
  </TouchableOpacity>
);

const RecommendCard = ({ campaignId, serviceId, entrepreneurId, name, category, location, image }) => {
  useEffect(() => {
    console.log('Impression:', { campaignId, serviceId, entrepreneurId });
    updateCampaignReport({ campaignId, serviceId, entrepreneurId, type: 'impression' });
  }, []);

  const handleClick = () => {
    updateCampaignReport({ campaignId, serviceId, entrepreneurId, type: 'click' });
  };

  return (
    <TouchableOpacity style={styles.recommendCard} onPress={handleClick}>
      <Image source={{ uri: image }} style={styles.recommendImage} />
      <View style={styles.recommendContent}>
        <View style={styles.recommendHeader}>
          <Text style={styles.recommendTitle} numberOfLines={2}>{name}</Text>
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
};
const BlogCard = ({ name, title, predescription, image }) => (
  <TouchableOpacity style={styles.blogCard} onPress={() => navigation.navigate('BlogDetail')} >
    <Image source={{ uri: image }} style={styles.blogImage} />
    <View style={styles.blogContent}>
      <View style={styles.blogTag}>
          <Text style={styles.blogTagText}>{name}</Text>
      </View>
      <Text style={styles.blogTitle}>{title}</Text>
      <Text style={styles.blogDescription}>{predescription}</Text>
    </View>
  </TouchableOpacity>
);

// const NearestCard = ({ title, type, distance }) => (
//   <TouchableOpacity style={styles.nearestCard}>
//     <Image
//       source={{ uri: 'https://via.placeholder.com/100' }}
//       style={styles.nearestImage}
//     />
//     <View style={styles.nearestContent}>
//       <Text style={styles.nearestTitle} numberOfLines={2}>{title}</Text>
//       <Text style={styles.nearestType}>{type}</Text>
//       <Text style={styles.nearestDistance}>{distance}</Text>
//     </View>
//   </TouchableOpacity>
// );

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
    // paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'relative',
    height: 200,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    top:70,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Change from 'space-between' to 'flex-end'
    alignItems: 'center',
    marginBottom: 15,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:150,
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
    justifyContent: 'center',  // ปรับให้อยู่กึ่งกลาง
    alignItems: 'center',
    marginVertical: 20,  // ระยะห่างจาก Search Bar
    gap: 10, // ระยะห่างระหว่างปุ่ม
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130, // ขนาดให้พอดีกับดีไซน์
  },
  loginButton: {
    backgroundColor: '#063c2f', 
  },
  registerButton: {
    backgroundColor: 'white', 
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
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#014737',
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
    minWidth: 15 ,
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
    marginBottom: 25,
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
    color: '#333',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#063c2f',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  navText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FDCB02',
    fontWeight: 'bold',  }
});

export default Home;
