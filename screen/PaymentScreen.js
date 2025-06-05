// ✅ แก้ไขให้ใช้ QR Code เป็นลิงก์ภาพ
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { amount, campaignName, campaignId } = route.params;

  
  const promptPayNumber = '0800544758';
  const qrImageUrl = `https://promptpay.io/${promptPayNumber}/${amount}.png`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.subTitle}>Scan QR Code to proceed</Text>
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrImageUrl }} style={{ width: 200, height: 200 }} />
        </View>
        <Text style={styles.brand}>Halalway</Text>
        <Text style={styles.amount}>฿ {amount.toLocaleString()}</Text>
        <Text style={styles.campaignInfo}>{campaignName}</Text>
      </View>

      {/* Button to Upload Slip */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UploadSlipScreen', { campaignId })}
      >
        <Text style={styles.buttonText}>Upload Slip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#014737',
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backArrow: {
    color: 'white',
    fontSize: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  subTitle: {
    fontSize: 14,
    color: '#014737',
    marginBottom: 12,
  },
  qrContainer: {
    marginVertical: 20,
    backgroundColor: 'white',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  brand: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#014737',
    marginTop: 10,
  },
  amount: {
    fontSize: 18,
    color: '#014737',
    fontWeight: 'bold',
    marginTop: 4,
  },
  campaignInfo: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#014737',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
