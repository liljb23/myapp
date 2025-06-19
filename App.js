// Import Screens

import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from './screen/FirebaseConfig';
import { AuthProvider } from './screen/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

// Import all screens
import Register from './screen/Register';
import LoginEmail from './screen/Login-email';
import LoginPhone from './screen/Login-phone';
import Home from './screen/Home';
import Search from './screen/Search';
import Blog from './screen/Blog';
import Detail from './screen/Detail';
import BlogDetail from './screen/BlogDetail';
import Discount from './screen/Discount';
import DiscountDetail from './screen/DiscountDetail';
import HomeScreen from './screen/HomeScreen';
import CategoryServices from './screen/CategoryServices';
import Menu from './screen/Menu';
import LanguageSettings from './screen/LanguageSettings';
import Favorites from './screen/Favorites';
import EditProfile from './screen/EditProfile';
import EntrepreneurHome from './screen/EntrepreneurHome';
import AddMapScreen from './screen/AddMapScreen';
import CampaignScreen from './screen/CampaignScreen';
import PaymentScreen from './screen/PaymentScreen';
import UploadSlipScreen from './screen/UploadSlipScreen';
import NewServices from './screen/NewServices';
import AdminScreen from './screen/AdminScreen';
import AddPromotion from './screen/AddPromotion';
import EditPromotion from './screen/EditPromotion';
import AddScreen from './screen/AddScreen';
import NotificationScreen from './screen/NotificationScreen';
import AddServiceScreen from './screen/AddServiceScreen';
import GeneralUserQuantityScreen from './screen/GeneralUserQuantityScreen';
import EntrepreneurQuantityScreen from './screen/EntrepreneurQuantityScreen';
import ServicesQuantityScreen from './screen/ServicesQuantityScreen';
import BlogQuantityScreen from './screen/BlogQuantityScreen';
import PromotionQuantityScreen from './screen/PromotionQuantityScreen';
import AddBlog from './screen/AddBlog';
import BlogList from './screen/BlogList';
import SlipDetail from './screen/SlipDetail';
import AdminNoti from './screen/AdminNoti';
import CampaignReportScreen from './screen/CampaignReportScreen';
import EditBlog from './screen/EditBlog';
import EditService from './screen/EditService';
import EditUserScreen from './screen/EditUserScreen';
import AddServices from './screen/AddServices';
import AddPromotionScreen from './screen/AddPromotionScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const GeneralUserStack = createStackNavigator();
const EntrepreneurStack = createStackNavigator();
const GuestStack = createStackNavigator();

// Auth navigator for login/register screens
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
      headerStyle: { backgroundColor: '#063c2f' },
      headerTintColor: '#fff',
    }}
  >
    <AuthStack.Screen name="HomeScreen" component={Home} options={{ headerShown: false }} />
    <AuthStack.Screen name="Register" component={Register} options={{ headerShown: false }} />
    <AuthStack.Screen name="Login-email" component={LoginEmail} options={{ headerShown: false }} />
    <AuthStack.Screen name="Login-phone" component={LoginPhone} options={{ headerShown: false }} />
  </AuthStack.Navigator>
);

// Guest user tab navigator - allows access to limited features without login
const GuestTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'HomeTab') {
          iconName = 'home';
        } else if (route.name === 'DiscountTab') {
          iconName = 'percent';
        } else if (route.name === 'SearchTab') {
          iconName = 'map';
        } else if (route.name === 'BlogTab') {
          iconName = 'book';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FDCB02',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        backgroundColor: '#014737',
        height: 60,
        paddingBottom: 5,
        display: 'flex',
      },
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={Home}
      options={{ headerShown: false, title: 'Home' }}
    />
    <Tab.Screen name="DiscountTab" component={Discount} options={{ headerShown: false, title: 'Discount' }} />
    <Tab.Screen name="SearchTab" component={Search} options={{ headerShown: false, title: 'Search' }} />
    <Tab.Screen name="BlogTab" component={Blog} options={{ headerShown: false, title: 'Blog' }} />
  </Tab.Navigator>
);

// Guest stack for non-logged in users
const GuestStackNavigator = () => (
  <GuestStack.Navigator
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
      headerStyle: { backgroundColor: '#063c2f' },
      headerTintColor: '#fff',
    }}
  >
    <GuestStack.Screen
      name="GuestTabs"
      component={GuestTabs}
      options={{ headerShown: false }}
    />
    <GuestStack.Screen name="Detail" component={Detail} />
    <GuestStack.Screen name="Search" component={Search} options={{ headerShown: false }} />
    <GuestStack.Screen name="BlogDetail" component={BlogDetail} options={{ headerShown: false }} />
    <GuestStack.Screen name="DiscountDetail" component={DiscountDetail} options={{ headerShown: false }} />
    <GuestStack.Screen name="Register" component={Register} options={{ headerShown: false }} />
    <GuestStack.Screen name="Login-email" component={LoginEmail} options={{ headerShown: false }} />
    <GuestStack.Screen name="Login-phone" component={LoginPhone} options={{ headerShown: false }} />
    <GuestStack.Screen name="Menu" component={Menu} options={{ headerShown: false }} />
  </GuestStack.Navigator>
);

// General user main tab navigator
const GeneralUserTabs = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'HomeTab') {
          iconName = 'home';
        } else if (route.name === 'DiscountTab') {
          iconName = 'percent';
        } else if (route.name === 'SearchTab') {
          iconName = 'map';
        } else if (route.name === 'BlogTab') {
          iconName = 'book';
        } else if (route.name === 'MenuTab') {
          iconName = 'menu';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FDCB02',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        backgroundColor: '#014737',
        height: 60,
        paddingBottom: 5,
        display: 'flex',
      },
    })}
  >
    <Tab.Screen
      name="HomeTab"
      options={{ headerShown: false, title: 'Home' }}
    >
      {props => <Home {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen name="DiscountTab" component={Discount} options={{ headerShown: false, title: 'Discount' }} />
    <Tab.Screen name="SearchTab" component={Search} options={{ headerShown: false, title: 'Search' }} />
    <Tab.Screen name="BlogTab" component={Blog} options={{ headerShown: false, title: 'Blog' }} />
  </Tab.Navigator>
);

// Entrepreneur user main tab navigator
const EntrepreneurTabs = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'EntrepreneurTab') {
          iconName = 'home';
        } else if (route.name === 'CampaignsTab') {
          iconName = 'campaign';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FDCB02',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        backgroundColor: '#014737',
        height: 60,
        paddingBottom: 5,
        display: 'flex',
      },
    })}
  >
    <Tab.Screen
      name="EntrepreneurHome"
      options={{ headerShown: false, title: 'Home' }}
    >
      {props => <EntrepreneurHome {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen
      name="CampaignsTab"
      component={CampaignScreen}
      options={{ title: 'Campaigns' }}
    />
  </Tab.Navigator>
);


// General user stack for detailed screens
const GeneralUserStackNavigator = ({ user, onLogout }) => (
  <GeneralUserStack.Navigator
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
      headerStyle: { backgroundColor: '#063c2f' },
      headerTintColor: '#fff',
    }}
  >
    <GeneralUserStack.Screen
      name="GeneralUserTabs"
      options={{ headerShown: false }}
    >
      {props => <GeneralUserTabs {...props} user={user} onLogout={onLogout} />}
    </GeneralUserStack.Screen>
    <GeneralUserStack.Screen name="Detail" component={Detail} />
    <GeneralUserStack.Screen name="BlogDetail" component={BlogDetail} options={{ headerShown: false }} />
    <GeneralUserStack.Screen name="DiscountDetail" component={DiscountDetail} options={{ headerShown: false }} />
    <GeneralUserStack.Screen name="CategoryServices" component={CategoryServices} />
    <GeneralUserStack.Screen name="LanguageSettings" component={LanguageSettings} options={{ headerShown: false }} />
    <GeneralUserStack.Screen name="Favorites" component={Favorites} options={{ headerShown: false }} />
    <GeneralUserStack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
    <GeneralUserStack.Screen name="Menu" component={Menu} options={{ headerShown: false }} />
    <GeneralUserStack.Screen name="Search" component={Search} options={{ headerShown: false }} />
  </GeneralUserStack.Navigator>
);

// EntrepreneurStackNavigator should be referencing EntrepreneurTabs on the first screen
const EntrepreneurStackNavigator = ({ user, onLogout }) => (
  <EntrepreneurStack.Navigator
    initialRouteName="EntrepreneurTabs"
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
      headerStyle: { backgroundColor: '#063c2f' },
      headerTintColor: '#fff',
    }}
  >
    <EntrepreneurStack.Screen
      name="EntrepreneurTabs"
      options={{ headerShown: false }}
    >
      {props => <EntrepreneurTabs {...props} user={user} onLogout={onLogout} />}
    </EntrepreneurStack.Screen>
    <EntrepreneurStack.Screen name="EntrepreneurHome" component={EntrepreneurHome} options={{ headerShown: false }} />
    <EntrepreneurStack.Screen name="NewServices" component={NewServices} options={{ headerShown: true }} />
    <EntrepreneurStack.Screen name="Menu" component={Menu} options={{ headerShown: false }} />
    <EntrepreneurStack.Screen name="AddMapScreen" component={AddMapScreen} />
    <EntrepreneurStack.Screen name="PaymentScreen" component={PaymentScreen} />
    <EntrepreneurStack.Screen name="UploadSlipScreen" component={UploadSlipScreen} />
    <EntrepreneurStack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
    <EntrepreneurStack.Screen name="LanguageSettings" component={LanguageSettings} options={{ headerShown: false }} />
    <EntrepreneurStack.Screen name="CampaignReportScreen" component={CampaignReportScreen} />
    <EntrepreneurStack.Screen name="CampaignScreen" component={CampaignScreen} />

  </EntrepreneurStack.Navigator>
);
const AdminStackNavigator = ({ user }) => (
  <Stack.Navigator
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
      headerStyle: { backgroundColor: '#063c2f' },
      headerTintColor: '#fff',
    }}
  >
    <Stack.Screen name="AdminScreen" component={AdminScreen} options={{ headerShown: false }} />
   
    {/* Other Admin Screens */}
    <Stack.Screen name="AddPromotionScreen" component={AddPromotionScreen} />
    <Stack.Screen name="EditPromotion" component={EditPromotion} />
    <Stack.Screen name="AddScreen" component={AddScreen} />
    <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
    <Stack.Screen name="AddServiceScreen" component={AddServiceScreen} />
    <Stack.Screen name="GeneralUserQuantityScreen" component={GeneralUserQuantityScreen} />
    <Stack.Screen name="EntrepreneurQuantityScreen" component={EntrepreneurQuantityScreen} />
    <Stack.Screen name="ServicesQuantityScreen" component={ServicesQuantityScreen} />
    <Stack.Screen name="BlogQuantityScreen" component={BlogQuantityScreen} />
    <Stack.Screen name="PromotionQuantityScreen" component={PromotionQuantityScreen} />
    <Stack.Screen name="AddBlog" component={AddBlog} />
    <Stack.Screen name="BlogList" component={BlogList} />
    <Stack.Screen name="SlipDetail" component={SlipDetail} />
    <Stack.Screen name="AdminNoti" component={AdminNoti} />
    <Stack.Screen name="CampaignReportScreen" component={CampaignReportScreen} />
    <Stack.Screen name="EditBlog" component={EditBlog} />
    <Stack.Screen name="EditService" component={EditService} />
    <Stack.Screen name="EditUserScreen" component={EditUserScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddServices" component={AddServices} />
    <Stack.Screen name="AddMapScreen" component={AddMapScreen} />
  </Stack.Navigator>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDoc = await getDoc(doc(FIREBASE_DB, "user", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            setRole("General User");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#063c2f" />
        <Text style={styles.splashText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        {!user ? (
          <GuestStackNavigator />
        ) : role === "Admin" ? (
          <AdminStackNavigator user={user} />
        ) : role === "Entrepreneur" ? (
          <EntrepreneurStackNavigator user={user} onLogout={() => signOut(FIREBASE_AUTH)} />
        ) : (
          <GeneralUserStackNavigator user={user} onLogout={() => signOut(FIREBASE_AUTH)} />
        )}
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#063c2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    marginTop: 10,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
