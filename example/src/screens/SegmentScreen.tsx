import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Segment } from 'react-native-imin-hardware';
import type { SegmentAlign } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function SegmentScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [dataInput, setDataInput] = useState('128.00');
  const [align, setAlign] = useState<SegmentAlign>('right');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => { setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20)); };

  const handleFindAndConnect = async () => {
    try {
      const device = await Segment.findDevice();
      if (!device.found) { Alert.alert(t('float.hint'), t('segment.disconnected')); return; }
      await Segment.requestPermission();
      await Segment.connect();
      setIsConnected(true);
      addLog(t('segment.connected'));
    } catch (e: any) { addLog(e.message); }
  };

  const handleSendData = async () => {
    try { await Segment.sendData(dataInput, align); } catch (e: any) { addLog(e.message); }
  };

  const handleClear = async () => { try { await Segment.clear(); } catch (e: any) { addLog(e.message); } };
  const handleFull = async () => { try { await Segment.full(); } catch (e: any) { addLog(e.message); } };
  const handleDisconnect = async () => { try { await Segment.disconnect(); setIsConnected(false); } catch (e: any) { addLog(e.message); } };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('segment.deviceConnection')}</Text>
        <Text style={styles.statusText}>{t('segment.status')} {isConnected ? t('segment.connected') : t('segment.disconnected')}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={handleFindAndConnect}><Text style={styles.buttonText}>{t('segment.findAndConnect')}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={handleDisconnect}><Text style={styles.buttonText}>{t('segment.disconnect')}</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('segment.displayData')}</Text>
        <TextInput style={styles.input} value={dataInput} onChangeText={setDataInput} placeholder={t('segment.inputPlaceholder')} keyboardType="numeric" maxLength={9} />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.alignBtn, align === 'left' && styles.alignBtnActive]} onPress={() => setAlign('left')}>
            <Text style={[styles.alignText, align === 'left' && styles.alignTextActive]}>{t('segment.leftAlign')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.alignBtn, align === 'right' && styles.alignBtnActive]} onPress={() => setAlign('right')}>
            <Text style={[styles.alignText, align === 'right' && styles.alignTextActive]}>{t('segment.rightAlign')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={handleSendData} disabled={!isConnected}>
          <Text style={styles.buttonText}>{t('segment.sendToSegment')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('segment.control')}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonOrange]} onPress={handleClear} disabled={!isConnected}><Text style={styles.buttonText}>{t('segment.clear')}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={handleFull} disabled={!isConnected}><Text style={styles.buttonText}>{t('segment.fullTest')}</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('segment.log')}</Text>
        {log.map((item, i) => (<Text key={i} style={styles.logItem}>{item}</Text>))}
        {log.length === 0 && <Text style={styles.logEmpty}>{t('segment.noLog')}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusText: { fontSize: 14, color: '#666', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonGreen: { backgroundColor: '#4CAF50' },
  buttonRed: { backgroundColor: '#F44336' },
  buttonBlue: { backgroundColor: '#2196F3' },
  buttonOrange: { backgroundColor: '#FF9800' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 12, textAlign: 'center', fontFamily: 'monospace' },
  alignBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2196F3' },
  alignBtnActive: { backgroundColor: '#2196F3' },
  alignText: { color: '#2196F3', fontSize: 14 },
  alignTextActive: { color: '#fff' },
  logItem: { fontSize: 12, color: '#666', marginBottom: 4, fontFamily: 'monospace' },
  logEmpty: { fontSize: 12, color: '#999', textAlign: 'center' },
});
