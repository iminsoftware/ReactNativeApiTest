import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, DeviceEventEmitter } from 'react-native';
import { ScaleNew, ScaleUnit } from 'react-native-imin-hardware';
import type { ScaleNewWeightEvent, ScaleNewStatusEvent, ScaleNewPriceEvent } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function ScaleScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isGettingData, setIsGettingData] = useState(false);
  const [serviceVersion, setServiceVersion] = useState('--');
  const [firmwareVersion, setFirmwareVersion] = useState('--');
  const [weightData, setWeightData] = useState<ScaleNewWeightEvent | null>(null);
  const [statusData, setStatusData] = useState<ScaleNewStatusEvent | null>(null);
  const [priceData, setPriceData] = useState<ScaleNewPriceEvent | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [unitPrice, setUnitPrice] = useState('');
  const [digitalTareWeight, setDigitalTareWeight] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(ScaleUnit.g);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('scale_new_data', (event: any) => {
      switch (event.type) {
        case 'weight': setWeightData(event); break;
        case 'status': setStatusData(event); break;
        case 'price': setPriceData(event); break;
        case 'connection':
          setIsConnected(event.connected);
          addLog(event.connected ? t('scale.logConnected') : t('scale.logDisconnected'));
          if (event.connected && !isGettingData) {
            ScaleNew.getData().then(() => setIsGettingData(true)).catch(() => {});
          }
          break;
        case 'error':
          if (event.errorCode !== -1) { setErrorCode(event.errorCode); addLog(`${t('scale.errorCode')}: ${event.errorCode}`); }
          break;
      }
    });
    // 自动连接
    handleConnect();
    return () => {
      sub.remove();
      ScaleNew.cancelGetData().catch(() => {});
    };
  }, []);

  const handleConnect = async () => {
    try {
      await ScaleNew.connectService();
      addLog(t('scale.logConnecting'));
      setTimeout(async () => {
        try {
          const sv = await ScaleNew.getServiceVersion();
          const fv = await ScaleNew.getFirmwareVersion();
          setServiceVersion(sv); setFirmwareVersion(fv);
          if (sv && sv !== 'Unknown') { setIsConnected(true); addLog(t('scale.logConnected')); }
        } catch (e) {}
      }, 1500);
    } catch (e: any) { addLog(`${t('scale.logConnectFail')}: ${e.message}`); }
  };

  const handleGetData = async () => {
    try { await ScaleNew.getData(); setIsGettingData(true); addLog(t('scale.logStartRead')); }
    catch (e: any) { addLog(`${t('scale.logReadFail')}: ${e.message}`); }
  };

  const handleStopData = async () => {
    try { await ScaleNew.cancelGetData(); setIsGettingData(false); addLog(t('scale.logStopRead')); }
    catch (e: any) { addLog(`${t('scale.logStopFail')}: ${e.message}`); }
  };

  const netKg = weightData ? (weightData.net / 1000).toFixed(3) : '--';
  const tareKg = weightData ? (weightData.tare / 1000).toFixed(3) : '--';
  const stableText = weightData ? (weightData.isStable ? t('scale.stable') : t('scale.unstable')) : '--';
  const stableColor = weightData ? (weightData.isStable ? '#4CAF50' : '#FF9800') : '#999';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('scale.connectionStatus')}</Text>
        <Text style={{ color: isConnected ? '#4CAF50' : '#999', marginBottom: 8 }}>
          {isConnected ? t('scale.connected') : t('scale.disconnected')}
        </Text>
        <Text style={styles.infoText}>{t('scale.serviceVersion')}: {serviceVersion}</Text>
        <Text style={styles.infoText}>{t('scale.firmwareVersion')}: {firmwareVersion}</Text>
        <View style={[styles.buttonRow, { marginTop: 12 }]}>
          <TouchableOpacity
            style={[styles.button, styles.buttonBlue, (isGettingData || !isConnected) && styles.buttonDisabled]}
            onPress={handleGetData}
            disabled={isGettingData || !isConnected}
          >
            <Text style={styles.buttonText}>{t('scale.startReading')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonRed, !isGettingData && styles.buttonDisabled]}
            onPress={handleStopData}
            disabled={!isGettingData}
          >
            <Text style={styles.buttonText}>{t('scale.stopReading')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOrange]} onPress={() => {
            Alert.alert(t('scale.restartTitle'), t('scale.restartConfirm'), [
              { text: t('scale.cancel') },
              { text: t('scale.confirm'), onPress: async () => {
                try {
                  await ScaleNew.cancelGetData().catch(() => {});
                  setIsGettingData(false);
                  setWeightData(null);
                  setStatusData(null);
                  await ScaleNew.restart();
                  setIsConnected(false);
                  setTimeout(() => handleConnect(), 2000);
                } catch (e) {}
              }},
            ]);
          }}>
            <Text style={styles.buttonText}>{t('scale.restart')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('scale.realtimeData')}</Text>
        <View style={styles.dataRow}><Text>{t('scale.netWeight')}</Text><Text style={styles.dataValue}>{netKg} kg</Text></View>
        <View style={styles.dataRow}><Text>{t('scale.tareWeight')}</Text><Text style={styles.dataValue}>{tareKg} kg</Text></View>
        <View style={styles.dataRow}><Text>{t('scale.status')}</Text><Text style={[styles.dataValue, { color: stableColor }]}>{stableText}</Text></View>
        {statusData && (
          <View style={{ marginTop: 8 }}>
            {statusData.isLightWeight && <Text style={styles.warning}>{t('scale.lightWeight')}</Text>}
            {statusData.overload && <Text style={styles.warning}>{t('scale.overload')}</Text>}
            {statusData.clearZeroErr && <Text style={styles.warning}>{t('scale.zeroErr')}</Text>}
            {statusData.calibrationErr && <Text style={styles.warning}>{t('scale.calErr')}</Text>}
          </View>
        )}
        {errorCode != null && <Text style={styles.warning}>{t('scale.errorCode')}: {errorCode}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('scale.weighOps')}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={() => ScaleNew.zero()} disabled={!isConnected}>
            <Text style={styles.buttonText}>{t('scale.zero')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOrange]} onPress={() => ScaleNew.tare()} disabled={!isConnected}>
            <Text style={styles.buttonText}>{t('scale.tare')}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.buttonRow, { marginTop: 12 }]}>
          <TextInput style={[styles.input, { flex: 1 }]} value={digitalTareWeight} onChangeText={setDigitalTareWeight} placeholder={t('scale.digitalTare')} keyboardType="numeric" />
          <TouchableOpacity style={[styles.smallBtn, styles.buttonBlue]} onPress={() => { const w = parseInt(digitalTareWeight, 10); if (!isNaN(w)) ScaleNew.digitalTare(w); }} disabled={!isConnected}>
            <Text style={styles.buttonText}>{t('scale.set')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('scale.priceCalc')}</Text>
        {priceData && (
          <View style={{ marginBottom: 12 }}>
            <View style={styles.dataRow}><Text>{t('scale.unitPrice')}</Text><Text style={styles.dataValue}>¥{priceData.unitPrice}</Text></View>
            <View style={styles.dataRow}><Text>{t('scale.totalPrice')}</Text><Text style={[styles.dataValue, { color: '#4CAF50' }]}>¥{priceData.totalPrice}</Text></View>
          </View>
        )}
        <View style={styles.buttonRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={unitPrice} onChangeText={setUnitPrice} placeholder={t('scale.unitPricePlaceholder')} keyboardType="decimal-pad" />
          <TouchableOpacity style={[styles.smallBtn, styles.buttonBlue]} onPress={() => { if (unitPrice) ScaleNew.setUnitPrice(unitPrice); }} disabled={!isConnected}>
            <Text style={styles.buttonText}>{t('scale.set')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ marginTop: 12, fontWeight: 'bold' }}>{t('scale.weightUnit')}</Text>
        <View style={[styles.buttonRow, { marginTop: 8 }]}>
          {(['g', '100g', '500g', 'kg'] as const).map((label, i) => (
            <TouchableOpacity key={label} style={[styles.unitBtn, selectedUnit === i && styles.unitBtnActive]}
              onPress={() => { setSelectedUnit(i); ScaleNew.setUnit(i); }} disabled={!isConnected}>
              <Text style={[styles.unitText, selectedUnit === i && styles.unitTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('scale.log')}</Text>
        {log.map((item, i) => <Text key={i} style={styles.logItem}>{item}</Text>)}
        {log.length === 0 && <Text style={styles.logEmpty}>{t('scale.noLog')}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  infoText: { fontSize: 13, color: '#666', marginBottom: 4 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  smallBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginLeft: 8 },
  infoBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonGreen: { backgroundColor: '#4CAF50' },
  buttonRed: { backgroundColor: '#F44336' },
  buttonBlue: { backgroundColor: '#2196F3' },
  buttonOrange: { backgroundColor: '#FF9800' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, fontSize: 14 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  dataValue: { fontSize: 16, fontWeight: 'bold' },
  warning: { color: '#FF9800', fontSize: 13, marginTop: 4, padding: 6, backgroundColor: '#FFF3E0', borderRadius: 4 },
  unitBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2196F3' },
  unitBtnActive: { backgroundColor: '#2196F3' },
  unitText: { color: '#2196F3', fontSize: 13 },
  unitTextActive: { color: '#fff' },
  logItem: { fontSize: 12, color: '#666', marginBottom: 4, fontFamily: 'monospace' },
  logEmpty: { fontSize: 12, color: '#999', textAlign: 'center' },
});
