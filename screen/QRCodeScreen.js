import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const QRCodeScreen = ({ route }) => {
  const { amount, campaignName } = route.params || {};
  const promptPayNumber = '0800544758';
  const qrImageUrl = amount
    ? `https://promptpay.io/${promptPayNumber}/${amount}.png`
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scan this QR Code to Pay for Campaign</Text>
      {qrImageUrl && (
        <Image source={{ uri: qrImageUrl }} style={styles.qrCode} />
      )}
      <Text style={styles.campaignInfo}>
        {campaignName ? `Campaign: ${campaignName}` : ''}
      </Text>
      <Text style={styles.amount}>
        {amount ? `฿ ${Number(amount).toLocaleString()}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, marginBottom: 20 },
  qrCode: { width: 200, height: 200, marginBottom: 20 },
  campaignInfo: { fontSize: 16, color: '#014737', marginTop: 10 },
  amount: { fontSize: 18, color: '#014737', fontWeight: 'bold', marginTop: 4 },
});

export default QRCodeScreen;
