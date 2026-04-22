import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { CameraScan } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function MultiScanScreen() {
  const [mlkitAvailable, setMlkitAvailable] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastResults, setLastResults] = useState<{ code: string; format: string }[]>([]);
  const [lastSingle, setLastSingle] = useState<{ code: string; format: string } | null>(null);

  useEffect(() => {
    checkMLKit();
  }, []);

  const checkMLKit = async () => {
    try {
      const available = await CameraScan.isMLKitAvailable();
      setMlkitAvailable(available);
    } catch (e: any) {
      setMlkitAvailable(false);
    }
  };

  // 原有 scan() 接口测试
  const doSingleScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const data = await CameraScan.scan();
      setLastSingle(data);
    } catch (e: any) {
      if (e.code !== 'CANCELED') Alert.alert(t('camera.scanFailed'), e.message);
    } finally {
      setIsScanning(false);
    }
  };

  // 新 scanMulti() 接口 - 默认配置
  const doMultiScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const results = await CameraScan.scanMulti();
      setLastResults(results);
    } catch (e: any) {
      if (e.code !== 'CANCELED') Alert.alert('Multi Scan Failed', e.message);
    } finally {
      setIsScanning(false);
    }
  };

  // 新 scanMulti() - 多角度 + 全区域
  const doMultiAngleScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const results = await CameraScan.scanMulti({
        supportMultiAngle: true,
        supportMultiBarcode: false,
        fullAreaScan: true,
      });
      setLastResults(results);
    } catch (e: any) {
      if (e.code !== 'CANCELED') Alert.alert('Multi Angle Scan Failed', e.message);
    } finally {
      setIsScanning(false);
    }
  };

  // 新 scanMulti() - 指定格式 + 闪光灯
  const doCustomMultiScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const results = await CameraScan.scanMulti({
        formats: ['QR_CODE', 'EAN_13', 'CODE_128'],
        supportMultiBarcode: true,
        supportMultiAngle: true,
        useFlash: false,
        beepEnabled: true,
        fullAreaScan: true,
        areaRectRatio: 0.9,
        timeout: 30000,
      });
      setLastResults(results);
    } catch (e: any) {
      if (e.code !== 'CANCELED') Alert.alert('Custom Scan Failed', e.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* ML Kit 状态 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ML Kit Status</Text>
        <View style={styles.dataRow}>
          <Text style={styles.label}>ML Kit Available:</Text>
          <Text style={[styles.value, { color: mlkitAvailable ? '#4CAF50' : '#F44336' }]}>
            {mlkitAvailable === null ? 'Checking...' : mlkitAvailable ? '✅ Yes' : '❌ No'}
          </Text>
        </View>
        <TouchableOpacity style={styles.btnSmall} onPress={checkMLKit}>
          <Text style={styles.btnSmallText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* 原有接口测试 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Original API (scan)</Text>
        <TouchableOpacity
          style={[styles.btn, isScanning && styles.btnDisabled]}
          onPress={doSingleScan}
          disabled={isScanning}
        >
          <Text style={styles.btnText}>
            {isScanning ? t('camera.scanning') : 'CameraScan.scan()'}
          </Text>
        </TouchableOpacity>
        {lastSingle && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Format: {lastSingle.format}</Text>
            <Text style={styles.resultValue} selectable>{lastSingle.code}</Text>
          </View>
        )}
      </View>

      {/* 新接口测试 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>New API (scanMulti)</Text>

        <TouchableOpacity
          style={[styles.btn, styles.btnGreen, isScanning && styles.btnDisabled]}
          onPress={doMultiScan}
          disabled={isScanning}
        >
          <Text style={styles.btnText}>scanMulti() - Default</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnOrange, isScanning && styles.btnDisabled, { marginTop: 8 }]}
          onPress={doMultiAngleScan}
          disabled={isScanning}
        >
          <Text style={styles.btnText}>scanMulti() - Multi Angle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnPurple, isScanning && styles.btnDisabled, { marginTop: 8 }]}
          onPress={doCustomMultiScan}
          disabled={isScanning}
        >
          <Text style={styles.btnText}>scanMulti() - Custom Config</Text>
        </TouchableOpacity>
      </View>

      {/* 多条码结果 */}
      {lastResults.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Multi Scan Results ({lastResults.length})</Text>
          {lastResults.map((item, index) => (
            <View key={index} style={styles.resultBox}>
              <Text style={styles.resultLabel}>#{index + 1} [{item.format}]</Text>
              <Text style={styles.resultValue} selectable>{item.code}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#333', fontWeight: '500' },
  btn: { backgroundColor: '#2196F3', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnGreen: { backgroundColor: '#4CAF50' },
  btnOrange: { backgroundColor: '#FF9800' },
  btnPurple: { backgroundColor: '#9C27B0' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  btnSmall: { backgroundColor: '#e0e0e0', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  btnSmallText: { fontSize: 13, color: '#333' },
  resultBox: { backgroundColor: '#f8f8f8', borderRadius: 8, padding: 10, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#2196F3' },
  resultLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  resultValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
});
