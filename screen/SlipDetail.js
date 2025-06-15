import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function SlipDetail({ route }) {
  const { slipUrl } = route.params;
  return (
    <View style={styles.container}>
      <Image source={{ uri: slipUrl }} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
});
