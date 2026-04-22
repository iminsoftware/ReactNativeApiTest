import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Device } from 'react-native-imin-hardware';
import { t } from '../i18n';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Module {
  id: string;
  name: string;
  icon: string;
  descKey: string;
  screen: string;
  enabled: boolean;
}

const MODULES: Module[] = [
  { id: 'device', name: 'Device', icon: '📱', descKey: 'mod.device', screen: 'Device', enabled: true },
  { id: 'scanner', name: 'Scanner', icon: '📷', descKey: 'mod.scanner', screen: 'Scanner', enabled: true },
  { id: 'cashbox', name: 'CashBox', icon: '💰', descKey: 'mod.cashbox', screen: 'CashBox', enabled: true },
  { id: 'nfc', name: 'NFC', icon: '💳', descKey: 'mod.nfc', screen: 'NFC', enabled: true },
  { id: 'msr', name: 'MSR', icon: '💳', descKey: 'mod.msr', screen: 'MSR', enabled: true },
  { id: 'light', name: 'Light', icon: '💡', descKey: 'mod.light', screen: 'Light', enabled: true },
  { id: 'display', name: 'Display', icon: '🖥️', descKey: 'mod.display', screen: 'Display', enabled: true },
  { id: 'segment', name: 'Segment', icon: '🔢', descKey: 'mod.segment', screen: 'Segment', enabled: true },
  { id: 'serial', name: 'Serial', icon: '🔌', descKey: 'mod.serial', screen: 'Serial', enabled: true },
  { id: 'scale', name: 'Scale', icon: '⚖️', descKey: 'mod.scale', screen: 'Scale', enabled: true },
  { id: 'cameraScan', name: 'CameraScan', icon: '📸', descKey: 'mod.cameraScan', screen: 'CameraScan', enabled: true },
  { id: 'multiScan', name: 'MultiScan', icon: '🔍', descKey: 'mod.multiScan', screen: 'MultiScan', enabled: true },
  { id: 'floatingWindow', name: 'FloatingWindow', icon: '📌', descKey: 'mod.floatingWindow', screen: 'FloatingWindow', enabled: true },
  { id: 'rfid', name: 'RFID', icon: '📡', descKey: 'mod.rfid', screen: 'RFID', enabled: true },
];

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({
    model: t('home.loading'),
    androidVersion: t('home.loading'),
  });

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const model = await Device.getModel();
      const androidVersion = await Device.getAndroidVersion();
      setDeviceInfo({ model, androidVersion });
    } catch (error) {
      console.error('Failed to load device info:', error);
      setDeviceInfo({
        model: t('home.unknown'),
        androidVersion: Platform.Version.toString(),
      });
    }
  };

  const filteredModules = MODULES.filter(
    (module) =>
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(module.descKey).includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.deviceInfoCard}>
          <Text style={styles.deviceInfoTitle}>{t('home.deviceInfo')}</Text>
          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoLabel}>{t('home.model')}</Text>
            <Text style={styles.deviceInfoValue}>{deviceInfo.model}</Text>
          </View>
          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoLabel}>{t('home.android')}</Text>
            <Text style={styles.deviceInfoValue}>{deviceInfo.androidVersion}</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder={t('home.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />

        <View style={styles.modulesGrid}>
          {filteredModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[styles.moduleButton, !module.enabled && styles.moduleButtonDisabled]}
              onPress={() => module.enabled && navigation.navigate(module.screen)}
              disabled={!module.enabled}
            >
              <Text style={styles.moduleIcon}>{module.icon}</Text>
              <Text style={styles.moduleName}>{module.name}</Text>
              <Text style={styles.moduleDescription}>{t(module.descKey)}</Text>
              {!module.enabled && <Text style={styles.comingSoon}>{t('home.comingSoon')}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 80 },
  deviceInfoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  deviceInfoTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  deviceInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  deviceInfoLabel: { fontSize: 14, color: '#666' },
  deviceInfoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  searchInput: { height: 44, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16 },
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moduleButton: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3, minHeight: 120, justifyContent: 'center', marginBottom: 12 },
  moduleButtonDisabled: { opacity: 0.5 },
  moduleIcon: { fontSize: 40, marginBottom: 8 },
  moduleName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  moduleDescription: { fontSize: 12, color: '#666', textAlign: 'center' },
  comingSoon: { fontSize: 10, color: '#999', marginTop: 4 },
});
