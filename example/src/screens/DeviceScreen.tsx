import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Device } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function DeviceScreen() {
  const [loading, setLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState({
    model: '', serialNumber: '', androidVersion: '', sdkVersion: '',
    brand: '', deviceName: '', androidVersionName: '', serviceVersion: '',
  });

  useEffect(() => { loadDeviceInfo(); }, []);

  const loadDeviceInfo = async () => {
    try {
      const info = await (Device.getDeviceInfo as any)();
      setDeviceInfo(info);
    } catch (error) {
      console.error('Failed to load device info:', error);
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>{t('device.loading')}</Text>
      </View>
    );
  }

  const rows = [
    { label: t('device.brand'), value: deviceInfo.brand },
    { label: t('device.deviceName'), value: deviceInfo.deviceName },
    { label: t('device.model'), value: deviceInfo.model },
    { label: t('device.serialNumber'), value: deviceInfo.serialNumber },
    { label: t('device.androidVersion'), value: deviceInfo.androidVersion },
    { label: t('device.androidSdk'), value: deviceInfo.sdkVersion },
    { label: t('device.sdkVersion'), value: deviceInfo.serviceVersion },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('device.title')}</Text>
        {rows.map((row, index) => (
          <View key={row.label} style={[styles.infoRow, index === rows.length - 1 && styles.lastRow]}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value} selectable>{row.value || '-'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', padding: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0' },
  lastRow: { borderBottomWidth: 0 },
  label: { fontSize: 15, color: '#555' },
  value: { fontSize: 15, color: '#111', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
});
