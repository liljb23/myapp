import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from './screen/FirebaseConfig';
import { AuthProvider } from './screen/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { User } from 'firebase/auth';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


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
import CampaignReportScreen from './screen/CampaignReportScreen';
import NewServices from './screen/NewServices';
import AdminScreen from './screen/AdminScreen';
import NotificationScreen from './screen/NotificationScreen';
import './screen/i18n'; // Import i18n configuration

// Define types for navigation
type RootStackParamList = {
  HomeScreen: undefined;
  Register: undefined;
  'Login-email': undefined;
  'Login-phone': undefined;
  auth: undefined;
  Detail: undefined;
  Search: undefined;
  BlogDetail: undefined;
  DiscountDetail: undefined;
  CategoryServices: undefined;
  LanguageSettings: undefined;
  Favorites: undefined;
  EditProfile: undefined;
  Menu: undefined;
  NewServices: undefined;
  AddMapScreen: undefined;
  PaymentScreen: undefined;
  UploadSlipScreen: undefined;
  CampaignReportScreen: undefined;
  CampaignScreen: undefined;
  AdminScreen: undefined;
  NotiAdmin: undefined;
  GuestTabs: undefined;
  GeneralUserTabs: undefined;
  EntrepreneurTabs: undefined;
  EntrepreneurHome: undefined;
};

type TabParamList = {
  HomeTab: undefined;
  DiscountTab: undefined;
  SearchTab: undefined;
  BlogTab: undefined;
  MenuTab: undefined;
  EntrepreneurTab: undefined;
  CampaignsTab: undefined;
  AdminTab: undefined;
  EntrepreneurHome: undefined;
};

// Create navigators with proper typing
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createStackNavigator<RootStackParamList>();
const GeneralUserStack = createStackNavigator<RootStackParamList>();
const EntrepreneurStack = createStackNavigator<RootStackParamList>();
const GuestStack = createStackNavigator<RootStackParamList>();
const AdminStack = createStackNavigator<RootStackParamList>();

// Define props interfaces
interface TabNavigatorProps {
  user: User | null;
  onLogout?: () => void;
}

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

interface HomeProps {
  user: User | null;
  onLogout?: () => void;
  route: RouteProp<TabParamList, 'HomeTab'>;
  navigation: StackNavigationProp<RootStackParamList>;
}

interface EntrepreneurHomeProps {
  user: User | null;
  onLogout?: () => void;
  route: RouteProp<TabParamList, 'EntrepreneurHome'>;
  navigation: StackNavigationProp<RootStackParamList>;
}

// Auth navigator for login/register screens
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
      headerStyle: { backgroundColor: '#063c2f' },
      headerTintColor: '#fff',
    }}
  >
    <AuthStack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    <AuthStack.Screen name="Register" component={Register} options={{ headerShown: false }} />
    <AuthStack.Screen name="Login-email" component={LoginEmail} options={{ headerShown: false }} />
    <AuthStack.Screen name="Login-phone" component={LoginPhone} options={{ headerShown: false }} />
    <AuthStack.Screen name="auth" component={() => <View><Text>AuthPlaceholder</Text></View>} />
  </AuthStack.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => ({
      tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
        let iconName: keyof typeof MaterialIcons.glyphMap = 'admin-panel-settings';
        if (route.name === 'AdminTab') {
          iconName = 'admin-panel-settings';
        }
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FDCB02',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        backgroundColor: '#014737',   
      },
    })}
  >
    <Tab.Screen name="AdminTab" component={AdminScreen} options={{ headerShown: false, title: 'Admin' }} />
  </Tab.Navigator>
);

// Guest user tab navigator - allows access to limited features without login
const GuestTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => ({
      tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
        let iconName: keyof typeof MaterialIcons.glyphMap = 'home';
        if (route.name === 'HomeTab') {
          iconName = 'home';
        } else if (route.name === 'DiscountTab') {
          iconName = 'local-offer';
        } else if (route.name === 'SearchTab') {
          iconName = 'search';
        } else if (route.name === 'BlogTab') {
          iconName = 'article';
        }
        return <MaterialIcons name={iconName} size={size} color={color} />;
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
      component={HomeScreen}
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
const GeneralUserTabs: React.FC<TabNavigatorProps> = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => ({
      tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
        let iconName: keyof typeof MaterialIcons.glyphMap = 'home';
        if (route.name === 'HomeTab') {
          iconName = 'home';
        } else if (route.name === 'DiscountTab') {
          iconName = 'local-offer';
        } else if (route.name === 'SearchTab') {
          iconName = 'search';
        } else if (route.name === 'BlogTab') {
          iconName = 'article';
        } else if (route.name === 'MenuTab') {
          iconName = 'menu';
        }
        return <MaterialIcons name={iconName} size={size} color={color} />;
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
      {() => <Home />}
    </Tab.Screen>
    <Tab.Screen name="DiscountTab" component={Discount} options={{ headerShown: false, title: 'Discount' }} />
    <Tab.Screen name="SearchTab" component={Search} options={{ headerShown: false, title: 'Search' }} />
    <Tab.Screen name="BlogTab" component={Blog} options={{ headerShown: false, title: 'Blog' }} />
  </Tab.Navigator>
);

// Entrepreneur user main tab navigator
const EntrepreneurTabs: React.FC<TabNavigatorProps> = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => ({
      tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
        let iconName: keyof typeof MaterialIcons.glyphMap = 'home';
        if (route.name === 'EntrepreneurHome') {
          iconName = 'home';
        } else if (route.name === 'CampaignsTab') {
          iconName = 'campaign';
        }
        return <MaterialIcons name={iconName} size={size} color={color} />;
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
      {() => <EntrepreneurHome />}
    </Tab.Screen>
    <Tab.Screen
      name="CampaignsTab"
      component={CampaignScreen}
      options={{ title: 'Campaigns' }}
    />
  </Tab.Navigator>
);

// General user stack for detailed screens
const GeneralUserStackNavigator: React.FC<TabNavigatorProps> = ({ user, onLogout }) => (
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

// EntrepreneurStackNavigator
const EntrepreneurStackNavigator: React.FC<TabNavigatorProps> = ({ user, onLogout }) => (
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

const AdminStackNavigator: React.FC<{ user: User | null }> = ({ user }) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#063c2f' },
      headerTintColor: '#fff',
    }}
  >
    <Stack.Screen name="AdminScreen" component={AdminScreen} options={{ title: 'Admin Dashboard' }} />
    <Stack.Screen name="NewServices" component={NewServices} options={{ title: 'Add New Service' }} />
    <Stack.Screen name="NotiAdmin" component={NotificationScreen} options={{ title: 'Notifications' }} />
  </Stack.Navigator>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDoc = await FIREBASE_DB.collection('user').doc(currentUser.uid).get();
          if (userDoc.exists) {
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

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#014737" />
      </View>
    );
  }

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
          <EntrepreneurStackNavigator user={user} onLogout={() => FIREBASE_AUTH.signOut()} />
        ) : (
          <GeneralUserStackNavigator user={user} onLogout={() => FIREBASE_AUTH.signOut()} />
        )}
      </NavigationContainer>
    </AuthProvider>
  );
};

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

export default App;
