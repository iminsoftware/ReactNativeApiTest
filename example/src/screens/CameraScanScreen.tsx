import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { CameraScan } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function CameraScanScreen() {
  const [lastResult, setLastResult] = useState<{ code: string; format: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const doScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const data = await CameraScan.scan();
      setLastResult(data);
    } catch (e: any) {
      if (e.code !== 'CANCELED') Alert.alert(t('camera.scanFailed'), e.message);
    } finally { setIsScanning(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('camera.result')}</Text>
        {lastResult ? (
          <>
            <View style={styles.dataRow}>
              <Text style={styles.label}>{t('camera.format')}</Text>
              <Text style={styles.value}>{lastResult.format}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>{t('camera.content')}</Text>
              <Text style={styles.valueHighlight} selectable>{lastResult.code}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.hint}>{t('camera.noResult')}</Text>
        )}
      </View>
      <View style={styles.card}>
        <TouchableOpacity style={[styles.btn, isScanning && styles.btnDisabled]} onPress={doScan} disabled={isScanning}>
          <Text style={styles.btnText}>{isScanning ? t('camera.scanning') : t('camera.startScan')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  hint: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 8 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#333' },
  valueHighlight: { fontSize: 16, fontWeight: 'bold', color: '#2196F3', flex: 1, textAlign: 'right' },
  btn: { backgroundColor: '#2196F3', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
