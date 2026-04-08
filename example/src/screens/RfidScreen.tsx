import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Rfid } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function RfidScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [battery, setBattery] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 用 ref 追踪最新状态，避免 cleanup 闭包拿到旧值
  const isReadingRef = useRef(false);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const tagSub = Rfid.addTagListener((event) => {
      if (event.type === 'tag') {
        setTags((prev) => {
          const existing = prev.findIndex((tag) => tag.epc === (event as any).epc);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = event;
            return updated;
          }
          return [event, ...prev].slice(0, 50);
        });
      }
    });
    const connSub = Rfid.addConnectionListener((connected) => {
      setIsConnected(connected);
      isConnectedRef.current = connected;
      setIsConnecting(false);
      if (!connected) {
        setIsReading(false);
        isReadingRef.current = false;
      }
    });
    const batSub = Rfid.addBatteryListener((status) => {
      setBattery(status.level);
    });

    return () => {
      tagSub.remove();
      connSub.remove();
      batSub.remove();
      // 退出页面时，如果正在读取则先停止，再断开连接
      if (isReadingRef.current) {
        Rfid.stopReading().catch(() => {});
      }
      if (isConnectedRef.current) {
        Rfid.disconnect().catch(() => {});
      }
    };
  }, []);

  const handleConnect = async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    try {
      await Rfid.connect();
      const connected = await Rfid.isConnected();
      setIsConnected(connected);
      isConnectedRef.current = connected;
      setIsConnecting(false);
    } catch (e: any) {
      setIsConnecting(false);
      Alert.alert(t('rfid.error'), e.message);
    }
  };

  const handleGetBattery = async () => {
    try {
      const level = await Rfid.getBatteryLevel();
      setBattery(level);
      Alert.alert(t('rfid.batteryLevel'), `${level}%`);
    } catch (e: any) {
      Alert.alert(t('rfid.error'), e.message);
    }
  };

  const handleStartReading = async () => {
    try {
      await Rfid.startReading();
      setIsReading(true);
      isReadingRef.current = true;
    } catch (e: any) {
      Alert.alert(t('rfid.error'), e.message);
    }
  };

  const handleStopReading = async () => {
    try {
      await Rfid.stopReading();
      setIsReading(false);
      isReadingRef.current = false;
    } catch (e: any) {
      Alert.alert(t('rfid.error'), e.message);
    }
  };

  const handleClearTags = async () => {
    try {
      await Rfid.clearTags();
    } catch (_) {}
    setTags([]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* RFID 状态 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('rfid.status')}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('rfid.connectionStatus')}</Text>
            <Text style={[styles.statusValue, isConnected ? styles.on : styles.off]}>
              {isConnected ? t('rfid.connected') : t('rfid.notConnected')}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('rfid.readStatus')}</Text>
            <Text style={[styles.statusValue, isReading ? styles.on : styles.off]}>
              {isReading ? t('rfid.reading') : t('rfid.stopped')}
            </Text>
          </View>
          <Text style={styles.stubNote}>{t('rfid.stubNote')}</Text>
        </View>

        {/* 连接控制 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('rfid.connectionControl')}</Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, isConnected && styles.btnDisabled]}
            onPress={handleConnect}
            disabled={isConnected || isConnecting}
          >
            <Text style={styles.btnText}>
              {isConnecting ? '连接中...' : t('rfid.connect')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleGetBattery}>
            <Text style={styles.btnText}>{t('rfid.checkBattery')}</Text>
          </TouchableOpacity>
          {battery !== null && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t('rfid.battery')}</Text>
              <Text style={styles.statusValue}>{battery}%</Text>
            </View>
          )}
        </View>

        {/* 标签读取 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('rfid.tagRead')}</Text>
          {!isReading ? (
            <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={handleStartReading}>
              <Text style={styles.btnText}>{t('rfid.startReading')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btn, styles.btnOrange]} onPress={handleStopReading}>
              <Text style={styles.btnText}>{t('rfid.stopReading')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleClearTags}>
            <Text style={styles.btnText}>{t('rfid.clearTags')}</Text>
          </TouchableOpacity>
        </View>

        {/* 标签列表 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('rfid.tagList')} ({tags.length})</Text>
          {tags.length === 0 ? (
            <Text style={styles.hint}>{t('rfid.noTags')}</Text>
          ) : (
            tags.map((tag, i) => (
              <View key={i} style={styles.tagItem}>
                <Text style={styles.tagEpc}>{tag.epc || 'N/A'}</Text>
                <Text style={styles.tagMeta}>RSSI: {tag.rssi ?? '-'} | Count: {tag.count ?? '-'}</Text>
              </View>
            ))
          )}
        </View>

        {/* 使用说明 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('rfid.info')}</Text>
          <Text style={styles.infoText}>{t('rfid.infoText')}</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusLabel: { fontSize: 14, color: '#666' },
  statusValue: { fontSize: 14, fontWeight: '500' },
  on: { color: '#4CAF50' },
  off: { color: '#999' },
  stubNote: { fontSize: 12, color: '#FF9800', marginTop: 8, fontStyle: 'italic' },
  btn: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  btnPrimary: { backgroundColor: '#2196F3' },
  btnSecondary: { backgroundColor: '#607D8B' },
  btnGreen: { backgroundColor: '#4CAF50' },
  btnOrange: { backgroundColor: '#FF9800' },
  btnDisabled: { backgroundColor: '#B0BEC5' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  hint: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 8 },
  tagItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tagEpc: { fontSize: 14, fontWeight: 'bold', color: '#333', fontFamily: 'monospace' },
  tagMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 22 },
});
