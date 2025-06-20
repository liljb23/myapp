import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FIREBASE_DB } from './FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const CampaignReportScreen = ({ navigation, route }) => {
  const campaignId = route?.params?.campaignId || "1";
  const serviceId = route?.params?.serviceId;

  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!serviceId) return;
        const q = query(
          collection(FIREBASE_DB, 'CampaignReports'),
          where('serviceId', '==', serviceId)
        );
        const querySnapshot = await getDocs(q);

        let impressions = 0, clicks = 0, conversions = 0;
        querySnapshot.forEach(doc => {
          const data = doc.data();
          impressions += data.impressions || 0;
          clicks += data.clicks || 0;
          conversions += data.conversions || 0;
        });
        setReport({ impressions, clicks, conversions });
      } catch (e) {
        setReport({ impressions: 0, clicks: 0, conversions: 0 });
      }
    };
    fetchReport();
  }, [serviceId]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
        {/*<Image source={require('../assets/logo-removebg.png')} style={styles.logo} />*/}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.inactiveTab}><Text style={styles.tabTextInactive}  onPress={() => navigation.navigate('CampaignScreen')}>Create</Text></TouchableOpacity>
        <TouchableOpacity style={styles.activeTab}><Text style={styles.tabTextActive} >Report</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Performance Report */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Performance Report</Text>
            <Text style={styles.timeText}>1 month ago ▼</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricText}>Impressions 👀: {report?.impressions ?? '-'}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricText}>Clicks 👆: {report?.clicks ?? '-'}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricText}>Conversions 📞: {report?.conversions ?? '-'}</Text>
          </View>
        </View>

        {/* Campaign Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Campaign Summary</Text>
          <Text style={styles.summaryText}>Campaign Duration ⏳ - <Text style={styles.bold}>February 1 – February 28</Text></Text>
          <Text style={styles.summaryText}>Campaign Type 📰 - <Text style={styles.bold}>500 THB / 1 Month (30 days)</Text></Text>
          <Text style={styles.summaryText}>Campaign Cost 💰 - <Text style={styles.bold}>500 THB</Text></Text>
        </View>

        {/* Renew Button */}
        <TouchableOpacity style={styles.renewButton}>
          <Text style={styles.renewButtonText}>Renew the campaign</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#014737',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FDCB02',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  logo: {
    width: 200,
    height: 120,
    
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  activeTab: {
    backgroundColor: '#014737',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  inactiveTab: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  tabTextActive: { color: 'white', fontWeight: 'bold' },
  tabTextInactive: { color: '#555' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  timeText: { fontSize: 12, color: '#666' },
  metricBox: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  metricText: { fontSize: 14 },
  summaryText: { fontSize: 14, marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  renewButton: {
    backgroundColor: '#014737',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  renewButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#014737',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: 'white', marginTop: 4 },
});

export default CampaignReportScreen;
