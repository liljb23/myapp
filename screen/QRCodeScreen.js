import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const QRCodeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scan this QR Code to Redeem</Text>
      <Image source={require('./assets/fake-qr-code.png')} style={styles.qrCode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, marginBottom: 20 },
  qrCode: { width: 200, height: 200 },
});

export default QRCodeScreen;
