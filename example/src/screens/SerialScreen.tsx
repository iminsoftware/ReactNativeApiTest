import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Serial } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function SerialScreen() {
  const [isPortOpen, setIsPortOpen] = useState(false);
  const [portPath, setPortPath] = useState('/dev/ttyS4');
  const [baudRate, setBaudRate] = useState('115200');
  const [sendText, setSendText] = useState('Hello');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => { setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30)); };

  useEffect(() => {
    const sub = Serial.addListener((event) => {
      if (event.event === 'data') { const text = String.fromCharCode(...event.data); addLog(`← [${event.data.join(',')}] "${text}"`); }
    });
    return () => { sub.remove(); Serial.close().catch(() => {}); };
  }, []);

  const handleOpen = async () => {
    try { const rate = parseInt(baudRate, 10) || 115200; await Serial.open(portPath, rate); setIsPortOpen(true); addLog(`${t('serial.opened')}: ${portPath} @ ${rate}`); }
    catch (e: any) { addLog(e.message); }
  };

  const handleClose = async () => {
    try { await Serial.close(); setIsPortOpen(false); addLog(t('serial.closed')); }
    catch (e: any) { addLog(e.message); }
  };

  const handleSend = async () => {
    try { await Serial.writeString(sendText); addLog(`→ "${sendText}"`); }
    catch (e: any) { addLog(e.message); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('serial.config')}</Text>
        <Text style={styles.statusText}>{t('serial.status')} {isPortOpen ? t('serial.opened') : t('serial.closed')}</Text>
        <TextInput style={styles.input} value={portPath} onChangeText={setPortPath} placeholder={t('serial.portPath')} />
        <TextInput style={styles.input} value={baudRate} onChangeText={setBaudRate} placeholder={t('serial.baudRate')} keyboardType="numeric" />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={handleOpen}><Text style={styles.buttonText}>{t('serial.openPort')}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={handleClose}><Text style={styles.buttonText}>{t('serial.closePort')}</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('serial.sendData')}</Text>
        <TextInput style={styles.input} value={sendText} onChangeText={setSendText} placeholder={t('serial.inputPlaceholder')} />
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={handleSend} disabled={!isPortOpen}><Text style={styles.buttonText}>{t('serial.send')}</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('serial.log')}</Text>
        {log.map((item, i) => (<Text key={i} style={styles.logItem}>{item}</Text>))}
        {log.length === 0 && <Text style={styles.logEmpty}>{t('serial.noLog')}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusText: { fontSize: 14, color: '#666', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonGreen: { backgroundColor: '#4CAF50' },
  buttonRed: { backgroundColor: '#F44336' },
  buttonBlue: { backgroundColor: '#2196F3' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12 },
  logItem: { fontSize: 12, color: '#666', marginBottom: 4, fontFamily: 'monospace' },
  logEmpty: { fontSize: 12, color: '#999', textAlign: 'center' },
});
