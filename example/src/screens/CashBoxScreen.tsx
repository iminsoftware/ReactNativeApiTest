import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CashBox, CashBoxVoltage } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function CashBoxScreen() {
  const [status, setStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      await CashBox.open();
      Alert.alert(t('cashbox.success'), t('cashbox.opened'));
      checkStatus();
    } catch (error: any) { Alert.alert(t('cashbox.error'), error.message); }
    finally { setLoading(false); }
  };

  const checkStatus = async () => {
    try { const isOpen = await CashBox.getStatus(); setStatus(isOpen); }
    catch (error) { console.error('Failed to get status:', error); }
  };

  const handleSetVoltage = async (voltage: CashBoxVoltage) => {
    setLoading(true);
    try {
      const result = await CashBox.setVoltage(voltage);
      Alert.alert(t('cashbox.success'), result ? t('cashbox.voltageOk') : t('cashbox.voltageFail'));
    } catch (error: any) { Alert.alert(t('cashbox.error'), error.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('cashbox.status')}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>{t('cashbox.currentStatus')}</Text>
          <Text style={styles.value}>
            {status === null ? t('cashbox.unknown') : status ? t('cashbox.open') : t('cashbox.closed')}
          </Text>
        </View>
        <TouchableOpacity style={styles.buttonSecondary} onPress={checkStatus}>
          <Text style={styles.buttonText}>{t('cashbox.refreshStatus')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('cashbox.operation')}</Text>
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleOpen} disabled={loading}>
          <Text style={styles.buttonText}>{t('cashbox.openBox')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('cashbox.voltage')}</Text>
        {[{ v: CashBoxVoltage.V9, l: '9V' }, { v: CashBoxVoltage.V12, l: '12V' }, { v: CashBoxVoltage.V24, l: '24V' }].map(({ v, l }) => (
          <TouchableOpacity key={l} style={[styles.button, loading && styles.buttonDisabled]} onPress={() => handleSetVoltage(v)} disabled={loading}>
            <Text style={styles.buttonText}>{t('cashbox.set')} {l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#333', fontWeight: '500' },
  button: { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 12 },
  buttonSecondary: { backgroundColor: '#757575', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
