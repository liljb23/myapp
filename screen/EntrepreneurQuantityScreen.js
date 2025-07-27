import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, updateDoc, doc, query, where, getDoc } from 'firebase/firestore';
import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FIREBASE_DB } from '../screen/FirebaseConfig';

export default function EntrepreneurQuantityScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // 1. Fetch all entrepreneurs
      const userSnap = await getDocs(collection(FIREBASE_DB, 'user'));
      const entrepreneurs = userSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.role && u.role.toLowerCase() === 'entrepreneur');

      if (entrepreneurs.length === 0) {
        console.log('No entrepreneurs found.');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // 2. Fetch all services and campaigns at once
      const servicesSnap = await getDocs(collection(FIREBASE_DB, 'Services'));
      const campaignsSnap = await getDocs(collection(FIREBASE_DB, 'CampaignSubscriptions'));
      const promotionsSnap = await getDocs(collection(FIREBASE_DB, 'promotions'));
      console.log('Fetched services:', servicesSnap.docs.length);
      console.log('Fetched campaigns:', campaignsSnap.docs.length);
      console.log('Fetched promotions:', promotionsSnap.docs.length);

      // 3. Group services and campaigns by entrepreneur ID for efficient lookup
      const servicesByEntrepreneur = servicesSnap.docs.reduce((acc, doc) => {
        const service = { id: doc.id, ...doc.data() };
        if (service.EntrepreneurId) {
          (acc[service.EntrepreneurId] = acc[service.EntrepreneurId] || []).push(service);
        }
        return acc;
      }, {});

      const campaignsByEntrepreneur = campaignsSnap.docs.reduce((acc, doc) => {
        const campaign = { id: doc.id, ...doc.data() };
        if (campaign.EntrepreneurId) {
          (acc[campaign.EntrepreneurId] = acc[campaign.EntrepreneurId] || []).push(campaign);
        }
        return acc;
      }, {});

      // Create a map of all services for quick name lookup
      const serviceNameMap = servicesSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name;
        return acc;
      }, {});
      
      // 4. Combine the data
      const usersWithDetails = entrepreneurs.map(entrepreneur => {
        const services = servicesByEntrepreneur[entrepreneur.id] || [];
        const campaigns = (campaignsByEntrepreneur[entrepreneur.id] || []).map(campaign => ({
          ...campaign,
          serviceName: serviceNameMap[campaign.serviceId] || 'Service not found',
        }));

        // Get promotions for this entrepreneur's services
        const entrepreneurServiceIds = services.map(service => service.id);
        const promotions = [];
        if (entrepreneurServiceIds.length > 0) {
          entrepreneurServiceIds.forEach(serviceId => {
            const servicePromotions = promotionsSnap.docs
              .filter(doc => doc.data().serviceId === serviceId)
              .map(doc => ({ id: doc.id, ...doc.data() }));
            promotions.push(...servicePromotions);
          });
        }

        return {
          ...entrepreneur,
          services,
          campaigns,
          promotions,
          status: entrepreneur.status || 'active', 
        };
      });

      console.log('✅ Entrepreneurs with details:', usersWithDetails);
      setUsers(usersWithDetails);
    } catch (e) {
      console.error('🔥 Error fetching entrepreneurs:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Entrepreneur`,
      `Are you sure you want to ${actionText} this entrepreneur? This will also ${actionText} all associated services and campaigns.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: newStatus === 'inactive' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              // 1. Update entrepreneur status
              await updateDoc(doc(FIREBASE_DB, 'user', userId), {
                status: newStatus,
                updatedAt: new Date()
              });

              // 2. Update all services status for this entrepreneur
              const servicesQuery = query(
                collection(FIREBASE_DB, 'Services'),
                where('EntrepreneurId', '==', userId)
              );
              const servicesSnap = await getDocs(servicesQuery);
              for (const docSnap of servicesSnap.docs) {
                await updateDoc(doc(FIREBASE_DB, 'Services', docSnap.id), {
                  status: newStatus,
                  updatedAt: new Date()
                });
              }

              // 3. Update all campaigns status for this entrepreneur only
              const campaignsQuery = query(
                collection(FIREBASE_DB, 'CampaignSubscriptions'),
                where('EntrepreneurId', '==', userId)
              );
              const campaignsSnap = await getDocs(campaignsQuery);
              for (const docSnap of campaignsSnap.docs) {
                await updateDoc(doc(FIREBASE_DB, 'CampaignSubscriptions', docSnap.id), {
                  status: newStatus,
                  updatedAt: new Date()
                });
              }

              // 4. Update promotions status for this entrepreneur only (by serviceId)
              // First get all service IDs for this entrepreneur
              const entrepreneurServiceIds = servicesSnap.docs.map(doc => doc.id);
              
              if (entrepreneurServiceIds.length > 0) {
                // Get all promotions for these services
                const promotionsQuery = query(
                  collection(FIREBASE_DB, 'promotions'),
                  where('serviceId', 'in', entrepreneurServiceIds)
                );
                const promotionsSnap = await getDocs(promotionsQuery);
                for (const docSnap of promotionsSnap.docs) {
                  await updateDoc(doc(FIREBASE_DB, 'promotions', docSnap.id), {
                    status: newStatus,
                    updatedAt: new Date()
                  });
                }
              }

              // 5. Update local state
              setUsers(users.map(user => 
                user.id === userId 
                  ? { ...user, status: newStatus }
                  : user
              ));

              Alert.alert(
                'Success', 
                `Entrepreneur and all associated data ${actionText}d successfully`
              );
            } catch (error) {
              console.error('Error updating entrepreneur status:', error);
              Alert.alert('Error', `Failed to ${actionText} entrepreneur and associated data`);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.status === 'inactive' && styles.inactiveCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.username}>ชื่อ: {item.name || 'N/A'}</Text>
        <View style={[
          styles.statusBadge, 
          item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
          ]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.email}>อีเมล: {item.email || 'N/A'}</Text>
      <Text style={styles.email}>เบอร์โทร: {item.phone || '-'}</Text>
      <Text style={styles.email}>EntrepreneurId: {item.id}</Text>
      
      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Services ({item.services.length}) 
          {item.status === 'inactive' && <Text style={styles.inactiveNote}> - All Inactive</Text>}
        </Text>
        {item.services.map(service => (
          <View key={service.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              • {service.name} (ServiceId: {service.id}, EntrepreneurId: {service.EntrepreneurId})
            </Text>
            {/* Active button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  { backgroundColor: service.active ? '#eaffea' : '#ffeaea' }
                ]}
                onPress={async () => {
                  try {
                    // Toggle active status
                    const newStatus = !service.active;
                    // Update the service's active status in Firestore
                    await updateDoc(doc(FIREBASE_DB, 'Services', service.id), { active: newStatus });

                    if (!newStatus) {
                      // Deactivate campaigns
                      const campaignsSnap = await getDocs(
                        query(
                          collection(FIREBASE_DB, 'Campaigns'),
                          where('serviceId', '==', service.id)
                        )
                      );
                      for (const docSnap of campaignsSnap.docs) {
                        await updateDoc(doc(FIREBASE_DB, 'Campaigns', docSnap.id), { active: false });
                      }

                      // Deactivate campaign subscriptions
                      const subsSnap = await getDocs(
                        query(
                          collection(FIREBASE_DB, 'CampaignSubscriptions'),
                          where('serviceId', '==', service.id)
                        )
                      );
                      for (const docSnap of subsSnap.docs) {
                        await updateDoc(doc(FIREBASE_DB, 'CampaignSubscriptions', docSnap.id), { active: false });
                      }
                      const closePromotion = async (promoId) => {
                        try {
                          // อ้างอิงไปที่โปรโมชันที่ต้องการปิดใน Firestore
                          const promoRef = doc(FIREBASE_DB, 'promotions', promoId);
                          // อัปเดตสถานะโปรโมชันเป็น 'inactive'
                          await updateDoc(promoRef, { active: false });
                          console.log(`Promotion with ID ${promoId} has been deactivated.`);
                        } catch (error) {
                          console.error('Error deactivating promotion:', error);
                        }
                      };
                      // Call closePromotion for specific promotion IDs if needed
                      // closePromotion('promo123'); // Uncomment and modify as needed
                    }

                    // Update local state
                    setUsers(prevUsers =>
                      prevUsers.map(u =>
                        u.id === item.id
                          ? {
                              ...u,
                              services: u.services.map(s =>
                                s.id === service.id ? { ...s, active: newStatus } : s
                              ),
                            }
                          : u
                      )
                    );
                    Alert.alert(
                      'Success',
                      `Service "${service.name}" is now ${newStatus ? 'Active' : 'Inactive'}`
                    );
                  } catch (error) {
                    console.error('Error updating service status:', error);
                    Alert.alert('Error', 'Failed to update service status');
                  }
                }}
              >
                <Ionicons
                  name={service.active ? "checkmark-circle-outline" : "close-circle-outline"}
                  size={18}
                  color={service.active ? "#2E7D32" : "#D11A2A"}
                />
                <Text
                  style={[
                    styles.deleteButtonText,
                    { color: service.active ? "#2E7D32" : "#D11A2A" }
                  ]}
                >
                  {service.active ? "Active" : "Inactive"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Campaigns Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Campaigns ({item.campaigns.length})
          {item.status === 'inactive' && <Text style={styles.inactiveNote}> - All Inactive</Text>}
        </Text>
        {item.campaigns.map(campaign => (
          <View key={campaign.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              • Campaign ID: {campaign.id} for service '{campaign.serviceName}' (Service ID: {campaign.serviceId})
            </Text>
          </View>
        ))}
      </View>

      {/* Promotions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Promotions ({item.promotions.length})
          {item.status === 'inactive' && <Text style={styles.inactiveNote}> - All Inactive</Text>}
        </Text>
        {item.promotions.map(promotion => (
          <View key={promotion.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              • {promotion.title} - {promotion.discount ? `${promotion.discount}% OFF` : 'N/A'} (Service ID: {promotion.serviceId})
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.statusButton,
          item.status === 'active' ? styles.deactivateButton : styles.activateButton
        ]}
        onPress={() => handleStatusToggle(item.id, item.status)}
      >
        <Ionicons 
          name={item.status === 'active' ? 'pause-outline' : 'play-outline'} 
          size={18} 
          color={item.status === 'active' ? '#D11A2A' : '#28a745'} 
        />
        <Text style={[
          styles.statusButtonText,
          item.status === 'active' ? styles.deactivateButtonText : styles.activateButtonText
        ]}>
          {item.status === 'active' ? 'Deactivate' : 'Activate'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const activeUsers = users.filter(user => user.status === 'active');
  const inactiveUsers = users.filter(user => user.status === 'inactive');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Entrepreneurs Management</Text>
          <Text style={styles.quantityText}>
            Active: {activeUsers.length} | Inactive: {inactiveUsers.length} | Total: {users.length}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#002B28" style={{ marginTop: 40 }} />
      ) : users.length === 0 ? (
        <Text style={styles.noDataText}>
          ไม่พบผู้ใช้ประเภท Entrepreneur
        </Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
        />
      )}

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Admin')}>
          <Ionicons name="home-outline" size={24} color="#FFD700" />
          <Text style={styles.tabTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AddScreen')}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.tabText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('NotificationScreen')}>
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
    height: 120,
    backgroundColor: '#002B28',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  activeBadge: {
    backgroundColor: '#e0f2f7',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeStatusText: {
    color: '#007bff',
  },
  inactiveStatusText: {
    color: '#dc3545',
  },
  inactiveNote: {
    fontSize: 12,
    color: '#dc3545',
    marginLeft: 10,
  },
  section: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002B28',
    marginBottom: 8,
  },
  itemRow: {
    marginLeft: 10,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
  },
  statusButton: {
    marginTop: 15,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activateButton: {
    backgroundColor: '#e0f2f7',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  deactivateButton: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  statusButtonText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: 'bold',
  },
  activateButtonText: {
    color: '#007bff',
  },
  deactivateButtonText: {
    color: '#dc3545',
  },
  listContent: {
    padding: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#002B28',
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  tabItem: { alignItems: 'center' },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 3,
  },
  tabTextActive:{
    color:'#FFD700',
    fontSize: 12,
    marginTop: 3,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: 'bold',
  },
}); 
