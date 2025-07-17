import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform,
    Alert,
    BackHandler
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const Menu = ({ navigation }) => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const prevUser = useRef(user);

    useEffect(() => {
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        return () => {

        };
    }, []);

    const menuItems = [
        {
            icon: 'user',
            title: 'Edit Profile',
            onPress: () => navigation.navigate('EditProfile')
        },
        {
            icon: 'heart',
            title: 'Favorites',
            onPress: () => navigation.navigate('Favorites')
        },
        {
            icon: 'globe',
            title: 'Change Language',
            onPress: () => navigation.navigate('LanguageSettings')
        },
        // {
        //     icon: 'help-circle',
        //     title: 'Help Center',
        //     onPress: () => navigation.navigate('HelpCenter')
        // }
    ];

    const handleLogout = () => {
        setShowConfirmation(true);
    };

    const confirmLogout = async () => {
        console.log('Logging out...');
        setShowConfirmation(false);
        await FIREBASE_AUTH.signOut();
        
        try {
            await Updates.reloadAsync();
        } catch (e) {
            BackHandler.exitApp(); 
        }
    };

    const cancelLogout = () => {
        setShowConfirmation(false);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Confirm Delete Account',
            'Are you sure you want to delete your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: deleteAccount, style: 'destructive' },
            ],
            { cancelable: true }
        );
    };

    const deleteAccount = () => {
        console.log('Deleting account...');
        navigation.navigate('Login-email');
    };


    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Feather name="chevron-left" size={40} color="#ffff" />
            </TouchableOpacity>

            <Image
                source={require('../assets/logo-removebg.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            <View style={styles.userSection}>
                {user ? (
                    <View>
                        <Text style={{ fontSize: 18 }}>
                            Hello, {user.displayName || user.email}
                        </Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                ) : (
                    <Text style={{ fontSize: 18, color: 'white' }}>Hello,</Text>
                )}
            </View>



            <View style={styles.menuCard}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <View style={styles.menuItemContent}>
                            <Feather
                                name={item.icon}
                                size={20}
                                color="#014737"
                                style={styles.menuIcon}
                            />
                            <Text style={styles.menuItemText}>{item.title}</Text>
                        </View>
                        <Feather
                            name="chevron-right"
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}

                >
                    <Feather
                        name="log-out"
                        size={20}
                        color="#fff"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.logoutButtonText}>{t('logout')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteAccountButton}
                    onPress={handleDeleteAccount}
                >
                    <Feather
                        name="trash-2"
                        size={20}
                        color="#FF0000"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.deleteAccountButtonText}>{t('deleteAccount')}</Text>
                </TouchableOpacity>
            </View>

            {showConfirmation && (
                <View style={styles.confirmationContainer}>
                    <Text style={styles.confirmationText}>{t('logoutConfirmation')}</Text>
                    <View style={styles.confirmationButtons}>
                        <TouchableOpacity style={styles.confirmButton} onPress={confirmLogout}>
                            <Text style={styles.confirmButtonText}>{t('yesLogout')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={cancelLogout}>
                            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

        </SafeAreaView>
    );


};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#014737',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        top: '40'
    },
    logo: {
        width: 190,
        height: 120,
        alignSelf: 'center',
        bottom: '40'
    },
    title: {
        color: '#FDCB02',
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginVertical: 20,
    },
    userGreeting: {
        marginBottom: 20,
    },
    greeting: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        padding: '10'
    },
    menuCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 15,
    },
    menuItemText: {
        fontSize: 16,
        color: '#014737',
    },
    actionButtons: {
        marginTop: 20,
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    deleteAccountButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: 'white',
        paddingVertical: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    buttonIcon: {
        marginRight: 10,
    },
    logoutButtonText: {
        color: '#ffff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteAccountButtonText: {
        color: '#FF0000',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmationContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
        elevation: 5,
    },
    confirmationText: {
        fontSize: 18,
        marginBottom: 20,
    },
    confirmationButtons: {
        flexDirection: 'row',
    },
    confirmButton: {
        backgroundColor: '#128C7E',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginRight: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Menu;