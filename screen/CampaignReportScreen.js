import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FIREBASE_DB } from './FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const campaignIdMap = {
  1: { campaignName: '1 Star - 1 Month', price: 400 },
  2: { campaignName: '3 Stars - 3 Month', price: 1200 },
  3: { campaignName: '5 Stars - 6 Month', price: 2500 },
};

const CampaignReportScreen = ({ navigation, route }) => {
  const campaignId = route?.params?.campaignId || "1";
  const serviceId = route?.params?.serviceId;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
      try {
      console.log('serviceId used for query:', serviceId);
        const q = query(
          collection(FIREBASE_DB, 'CampaignReports'),
          where('serviceId', '==', serviceId)
        );
        const querySnapshot = await getDocs(q);
      console.log('querySnapshot size:', querySnapshot.size);
      console.log('querySnapshot docs:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        let impressions = 0, clicks = 0, conversions = 0;
      let summary = null;
      if (querySnapshot.empty) {
        setReport(null);
      } else {
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          console.log('doc:', docSnap.id, data);
          impressions += (data.impressions ?? data.viewCount ?? 0);
          clicks += (data.clicks ?? data.clickCount ?? 0);
          conversions += (data.conversions ?? 0);
          // Use the first doc for summary if available
          if (!summary) summary = { ...data };
        }
        // If campaignName or price missing, fetch from CampaignSubscriptions
        if (summary && (!summary.campaignName || !summary.price) && summary.subscriptionId) {
          try {
            const subRef = doc(FIREBASE_DB, 'CampaignSubscriptions', summary.subscriptionId);
            const subSnap = await getDoc(subRef);
            if (subSnap.exists()) {
              const subData = subSnap.data();
              summary.campaignName = subData.campaignName || summary.campaignName;
              summary.price = subData.price || summary.price;
            }
          } catch (subErr) {
            console.log('Failed to fetch CampaignSubscription:', subErr);
          }
        }
        // Fallback: use campaignId mapping if still missing
        if (summary && (!summary.campaignName || !summary.price) && summary.campaignId) {
          const fallback = campaignIdMap[summary.campaignId];
          if (fallback) {
            summary.campaignName = summary.campaignName || fallback.campaignName;
            summary.price = summary.price || fallback.price;
          }
        }
        setReport({ impressions, clicks, conversions, summary });
      }
    } catch (e) {
      setError('Failed to fetch report. Please try again.');
      setReport(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={28} color="white" />
        </TouchableOpacity>
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
            <Text style={styles.timeText}>Last 30 days</Text>
          </View>
          {loading || refreshing ? (
            <ActivityIndicator size="large" color="#014737" />
          ) : error ? (
            <Text style={{ color: 'red', marginVertical: 10 }}>{error}</Text>
          ) : report !== null ? (
            <View style={styles.metricsRow}>
              <View style={styles.metricHighlightBox}>
                <Feather name="eye" size={28} color="#014737" />
                <Text style={styles.metricNumber}>{report.impressions}</Text>
                <Text style={styles.metricLabel}>Views</Text>
              </View>
              <View style={styles.metricHighlightBox}>
                <Feather name="mouse-pointer" size={28} color="#014737" />
                <Text style={styles.metricNumber}>{report.clicks}</Text>
                <Text style={styles.metricLabel}>Clicks</Text>
          </View>
              <View style={styles.metricHighlightBox}>
                <Feather name="phone-call" size={28} color="#014737" />
                <Text style={styles.metricNumber}>{report.conversions}</Text>
                <Text style={styles.metricLabel}>Conversions</Text>
          </View>
          </View>
          ) : (
            <Text style={{ color: '#666', marginVertical: 10 }}>
              No report found for this service. Make sure your campaign is active and has received some activity.
            </Text>
          )}
        </View>

        {/* Campaign Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Campaign Summary</Text>
          {report && report.summary ? (
            <>
              <Text style={styles.summaryText}>Campaign Duration ⏳ - <Text style={styles.bold}>{report.summary.startDate ? new Date(report.summary.startDate.seconds * 1000).toLocaleDateString() : '-'} – {report.summary.endDate ? new Date(report.summary.endDate.seconds * 1000).toLocaleDateString() : '-'}</Text></Text>
              <Text style={styles.summaryText}>Campaign Type 📰 - <Text style={styles.bold}>{report.summary.campaignName || 'N/A'}</Text></Text>
              <Text style={styles.summaryText}>Campaign Cost 💰 - <Text style={styles.bold}>{report.summary.price ? `${report.summary.price} THB` : 'N/A'}</Text></Text>
            </>
          ) : (
            <Text style={styles.summaryText}>No campaign summary available.</Text>
          )}
        </View>

        {/* Renew Button */}
        <TouchableOpacity style={styles.renewButton}>
          <Text style={styles.renewButtonText}>Renew the campaign</Text>
          <Text style={styles.renewDesc}>Extend your campaign to keep your service visible and attract more customers!</Text>
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
  refreshButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  metricHighlightBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 6,
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 1,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#014737',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#014737',
    marginTop: 2,
  },
  renewDesc: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default CampaignReportScreen;
