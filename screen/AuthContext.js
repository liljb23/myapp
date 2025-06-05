// screen/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { ActivityIndicator, View } from 'react-native';
import { FIREBASE_AUTH } from "./FirebaseConfig";
// import * as SecureStore from 'expo-secure-store';

// Create Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check SecureStore first
        // const storedUser = await SecureStore.getItemAsync('user');
        if (user) {
          setUser(JSON.parse(user));
        }

        // Subscribe to auth state changes
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
          setUser(user);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      // await SecureStore.deleteItemAsync('user');
      await FIREBASE_AUTH.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#014737" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};