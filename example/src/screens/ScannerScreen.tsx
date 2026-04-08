import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { Scanner } from 'react-native-imin-hardware';
import type { EmitterSubscription } from 'react-native';
import { t } from '../i18n';

interface ScanRecord {
  id: string;
  data: string;
  labelType: string;
  timestamp: number;
}

export default function ScannerScreen() {
  const [connected, setConnected] = useState(false);
  const [listening, setListening] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [scanCount, setScanCount] = useState(0);

  // 自定义配置
  const [action, setAction] = useState('com.imin.scanner.api.RESULT_ACTION');
  const [dataKey, setDataKey] = useState('decode_data_str');
  const [byteDataKey, setByteDataKey] = useState('decode_data');

  const listenerRef = useRef<EmitterSubscription | null>(null);

  useEffect(() => {
    checkConnection();
    return () => {
      listenerRef.current?.remove();
      listenerRef.current = null;
      Scanner.stopListening().catch(() => {});
    };
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await Scanner.isConnected();
      setConnected(isConnected);
    } catch (e) {}
  };

  const handleConfigure = async () => {
    try {
      await Scanner.configure({ action, dataKey, byteDataKey });
      Keyboard.dismiss();
    } catch (e) {}
  };

  const handleStartListening = async () => {
    try {
      await handleConfigure();
      const started = await Scanner.startListening();
      if (started) {
        setListening(true);
        listenerRef.current?.remove();
        listenerRef.current = Scanner.addListener((event: any) => {
          if (event.type === 'scanResult') {
            const record: ScanRecord = {
              id: Date.now().toString(),
              data: event.data.data,
              labelType: event.data.labelType,
              timestamp: event.data.timestamp,
            };
            setScanHistory((prev) => [record, ...prev].slice(0, 50));
            setScanCount((c) => c + 1);
          } else if (event.type === 'connected') {
            setConnected(true);
          } else if (event.type === 'disconnected') {
            setConnected(false);
          }
        });
      }
    } catch (e) {}
  };

  const handleStopListening = async () => {
    try {
      listenerRef.current?.remove();
      listenerRef.current = null;
      await Scanner.stopListening();
      setListening(false);
    } catch (e) {}
  };

  const handleClear = () => {
    setScanHistory([]);
    setScanCount(0);
  };

  const renderRecord = ({ item, index }: { item: ScanRecord; index: number }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordBadge}>
          <Text style={styles.recordBadgeText}>{scanHistory.length - index}</Text>
        </View>
        <View style={styles.recordContent}>
          <Text style={styles.recordData}>{item.data}</Text>
          <Text style={styles.recordMeta}>
            {t('scanner.type')}: {item.labelType}
          </Text>
          <Text style={styles.recordTime}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 配置区域 - 仅未监听时显示 */}
      {!listening && (
        <View style={styles.configSection}>
          <Text style={styles.configTitle}>{t('scanner.startListen')} - 自定义配置（可选）</Text>
          <TextInput
            style={styles.configInput}
            value={action}
            onChangeText={setAction}
            placeholder="广播动作"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.configInput}
            value={dataKey}
            onChangeText={setDataKey}
            placeholder="字符串数据键"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.configInput}
            value={byteDataKey}
            onChangeText={setByteDataKey}
            placeholder="字节数据键"
            placeholderTextColor="#aaa"
            onSubmitEditing={handleConfigure}
          />
          <TouchableOpacity style={styles.applyBtn} onPress={handleConfigure}>
            <Text style={styles.applyBtnText}>应用配置</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 控制按钮 */}
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnGreen, listening && styles.btnDisabled]}
          onPress={handleStartListening}
          disabled={listening}
        >
          <Text style={styles.btnText}>▶ {t('scanner.startListen')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnRed, !listening && styles.btnDisabled]}
          onPress={handleStopListening}
          disabled={!listening}
        >
          <Text style={styles.btnText}>■ {t('scanner.stopListen')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controlRow}>
        <TouchableOpacity style={[styles.btn, styles.btnGray]} onPress={checkConnection}>
          <Text style={styles.btnText}>↺ 状态</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnGray, scanHistory.length === 0 && styles.btnDisabled]}
          onPress={handleClear}
          disabled={scanHistory.length === 0}
        >
          <Text style={styles.btnText}>≡ {t('scanner.clearHistory')}</Text>
        </TouchableOpacity>
      </View>

      {/* 状态栏 */}
      <View style={[styles.statusBar, listening && styles.statusBarActive]}>
        <Text style={[styles.statusText, listening ? styles.statusOn : styles.statusOff]}>
          {listening ? `🟢 ${t('scanner.listening')}` : `⚪ ${t('scanner.notListening')}`}
        </Text>
        <Text style={styles.statusCount}>扫码次数: {scanCount}</Text>
      </View>

      {/* 连接状态 */}
      <View style={styles.connRow}>
        <Text style={styles.connLabel}>{t('scanner.connectionStatus')}</Text>
        <Text style={[styles.connValue, connected ? styles.connOn : styles.connOff]}>
          {connected ? t('scanner.connected') : t('scanner.notConnected')}
        </Text>
      </View>

      {/* 扫描历史 */}
      <FlatList
        data={scanHistory}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⬜</Text>
            <Text style={styles.emptyText}>
              {listening ? t('scanner.noRecord') : '· 连接硬件扫码头\n· 点击"开始监听"按钮\n· 扫描条码或二维码\n· 自动接收扫码数据'}
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  configSection: { backgroundColor: '#f0f0f0', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  configTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  configInput: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 6, padding: 10, fontSize: 13, marginBottom: 8, color: '#333',
  },
  applyBtn: { alignItems: 'center', paddingVertical: 8 },
  applyBtnText: { color: '#2196F3', fontSize: 14 },
  controlRow: { flexDirection: 'row', padding: 12, gap: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnGreen: { backgroundColor: '#4CAF50' },
  btnRed: { backgroundColor: '#F44336' },
  btnGray: { backgroundColor: '#9E9E9E' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5',
  },
  statusBarActive: { backgroundColor: '#E8F5E9' },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  statusOn: { color: '#4CAF50' },
  statusOff: { color: '#9E9E9E' },
  statusCount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  connRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  connLabel: { fontSize: 13, color: '#666' },
  connValue: { fontSize: 13, fontWeight: '500' },
  connOn: { color: '#4CAF50' },
  connOff: { color: '#F44336' },
  list: { flex: 1 },
  recordCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8, borderRadius: 8, padding: 12, elevation: 1 },
  recordHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  recordBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  recordBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  recordContent: { flex: 1 },
  recordData: { fontSize: 14, fontWeight: 'bold', color: '#333', fontFamily: 'monospace' },
  recordMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  recordTime: { fontSize: 11, color: '#aaa', marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#9E9E9E', textAlign: 'center', lineHeight: 24 },
});
