import React from 'react';
import { View, Image, StyleSheet, Text, ScrollView } from 'react-native';

export default function SlipDetail({ route }) {
  const { slip } = route.params;

  // Helper to render date fields
  const renderDate = (date) => {
    if (!date) return '-';
    if (typeof date === 'string') return date;
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleString();
    return '-';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {slip.slipUrl && (
        <Image source={{ uri: slip.slipUrl }} style={styles.image} resizeMode="contain" />
      )}
      <View style={styles.details}>
        <Text style={styles.label}>EntrepreneurId: <Text style={styles.value}>{slip.EntrepreneurId || '-'}</Text></Text>
        <Text style={styles.label}>Campaign ID: <Text style={styles.value}>{slip.campaignId || '-'}</Text></Text>
        <Text style={styles.label}>Campaign Name: <Text style={styles.value}>{slip.campaignName || '-'}</Text></Text>
        <Text style={styles.label}>Service ID: <Text style={styles.value}>{slip.serviceId || '-'}</Text></Text>
        <Text style={styles.label}>Days: <Text style={styles.value}>{slip.days || '-'}</Text></Text>
        <Text style={styles.label}>Duration: <Text style={styles.value}>{slip.duration || '-'}</Text></Text>
        <Text style={styles.label}>End Date: <Text style={styles.value}>{renderDate(slip.endDate)}</Text></Text>
        <Text style={styles.label}>Status: <Text style={styles.value}>{slip.status || 'pending'}</Text></Text>
        <Text style={styles.label}>Created At: <Text style={styles.value}>{renderDate(slip.createdAt)}</Text></Text>
        <Text style={styles.label}>Price: <Text style={styles.value}>{slip.price ? `฿${slip.price}` : '-'}</Text></Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 20 },
  details: { width: '100%' },
  label: { fontWeight: 'bold', color: '#014737', fontSize: 15, marginTop: 8 },
  value: { fontWeight: 'normal', color: '#333' },
});
