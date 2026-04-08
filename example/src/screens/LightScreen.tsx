import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Light } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function LightScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentColor, setCurrentColor] = useState<'off' | 'green' | 'red'>('off');

  const handleConnect = async () => {
    try {
      const success = await Light.connect();
      setIsConnected(success);
      Alert.alert(success ? t('light.success') : t('light.fail'), success ? t('light.deviceConnected') : t('light.connectFailed'));
    } catch (error: any) { Alert.alert(t('light.error'), error.message); }
  };

  const handleTurnOnGreen = async () => {
    try { await Light.turnOnGreen(); setCurrentColor('green'); Alert.alert(t('light.success'), t('light.greenOn')); }
    catch (error: any) { Alert.alert(t('light.error'), error.message); }
  };

  const handleTurnOnRed = async () => {
    try { await Light.turnOnRed(); setCurrentColor('red'); Alert.alert(t('light.success'), t('light.redOn')); }
    catch (error: any) { Alert.alert(t('light.error'), error.message); }
  };

  const handleTurnOff = async () => {
    try { await Light.turnOff(); setCurrentColor('off'); Alert.alert(t('light.success'), t('light.lightOff')); }
    catch (error: any) { Alert.alert(t('light.error'), error.message); }
  };

  const handleDisconnect = async () => {
    try { await Light.disconnect(); setIsConnected(false); setCurrentColor('off'); Alert.alert(t('light.success'), t('light.deviceDisconnected')); }
    catch (error: any) { Alert.alert(t('light.error'), error.message); }
  };

  const colorText = currentColor === 'off' ? t('light.off') : currentColor === 'green' ? t('light.green') : t('light.red');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('light.status')}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('light.connectionStatus')}</Text>
            <Text style={[styles.statusValue, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
              {isConnected ? t('light.connected') : t('light.notConnected')}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('light.currentColor')}</Text>
            <View style={styles.colorIndicator}>
              <View style={[styles.colorDot, currentColor === 'green' && styles.colorGreen, currentColor === 'red' && styles.colorRed]} />
              <Text style={styles.colorText}>{colorText}</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('light.control')}</Text>
          {!isConnected && (
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleConnect}>
              <Text style={styles.buttonText}>{t('light.connect')}</Text>
            </TouchableOpacity>
          )}
          {isConnected && (
            <>
              <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={handleTurnOnGreen}>
                <Text style={styles.buttonText}>{t('light.turnOnGreen')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={handleTurnOnRed}>
                <Text style={styles.buttonText}>{t('light.turnOnRed')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleTurnOff}>
                <Text style={styles.buttonText}>{t('light.turnOff')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleDisconnect}>
                <Text style={styles.buttonText}>{t('light.disconnect')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('light.info')}</Text>
          <Text style={styles.infoText}>{t('light.infoText')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusLabel: { fontSize: 14, color: '#666' },
  statusValue: { fontSize: 14, fontWeight: '500' },
  statusConnected: { color: '#4CAF50' },
  statusDisconnected: { color: '#999' },
  colorIndicator: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ccc', marginRight: 8 },
  colorGreen: { backgroundColor: '#4CAF50' },
  colorRed: { backgroundColor: '#F44336' },
  colorText: { fontSize: 14, color: '#333', fontWeight: '500' },
  button: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  buttonPrimary: { backgroundColor: '#2196F3' },
  buttonGreen: { backgroundColor: '#4CAF50' },
  buttonRed: { backgroundColor: '#F44336' },
  buttonSecondary: { backgroundColor: '#607D8B' },
  buttonDanger: { backgroundColor: '#FF5722' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  infoText: { fontSize: 14, color: '#666', lineHeight: 22 },
});
