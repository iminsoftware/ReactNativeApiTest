import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Msr } from 'react-native-imin-hardware';
import MsrNativeEditText from '../components/MsrNativeInput';
import { t } from '../i18n';

export default function MsrScreen() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkMsrStatus();
  }, []);

  const checkMsrStatus = async () => {
    try { const available = await Msr.isAvailable(); setIsAvailable(available); }
    catch (error) { Alert.alert(t('msr.error'), t('msr.checkFailed')); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('msr.status')}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('msr.available')}</Text>
            <Text style={[styles.statusValue, isAvailable ? styles.statusEnabled : styles.statusDisabled]}>
              {isAvailable ? t('common.yes') : t('common.no')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('msr.swipeInput')}</Text>
          <Text style={styles.instructionText}>{t('msr.instruction')}</Text>
          <MsrNativeEditText
            style={styles.nativeInput}
            placeholder={t('msr.waiting')}
          />
          <TouchableOpacity style={[styles.button, styles.buttonGray]} onPress={() => {
            // 清空需要通过原生组件，这里暂时无法直接清空
            // 用户可以手动选中全部删除
          }}>
            <Text style={styles.buttonText}>{t('msr.focusInput')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('msr.info')}</Text>
          <Text style={styles.infoText}>{t('msr.infoText')}</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{t('msr.warning')}</Text>
          </View>
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
  statusEnabled: { color: '#4CAF50' },
  statusDisabled: { color: '#F44336' },
  instructionText: { fontSize: 14, color: '#666', marginBottom: 12 },
  nativeInput: { height: 120, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  button: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  buttonGray: { backgroundColor: '#9E9E9E' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  infoText: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 12 },
  warningBox: { backgroundColor: '#FFF3E0', borderRadius: 8, padding: 12, borderLeftWidth: 3, borderLeftColor: '#FF9800' },
  warningText: { fontSize: 13, color: '#E65100' },
});
