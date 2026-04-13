import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, DeviceEventEmitter,
} from 'react-native';
import { Rfid } from 'react-native-imin-hardware';
import { t } from '../i18n';

interface TagItem {
  epc: string;
  pc?: string;
  tid?: string;
  rssi: number;
  count: number;
  frequency: number;
  timestamp: number;
}

export default function RfidScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [totalReadCount, setTotalReadCount] = useState(0);
  const [battery, setBattery] = useState<number | null>(null);

  const isReadingRef = useRef(false);
  const isConnectedRef = useRef(false);

  // 用 ref 缓存标签数据，定时批量更新 UI
  const pendingTagsRef = useRef<Map<string, TagItem>>(new Map());
  const pendingCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 每 300ms 批量更新 UI
    timerRef.current = setInterval(() => {
      if (pendingCountRef.current > 0) {
        const pending = pendingTagsRef.current;
        setTags(Array.from(pending.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 100));
        setTotalReadCount((c) => c + pendingCountRef.current);
        pendingCountRef.current = 0;
      }
    }, 300);

    const tagSub = DeviceEventEmitter.addListener('rfid_tag', (event: any) => {
      if (event.type === 'tag') {
        const tag: TagItem = {
          epc: event.epc, pc: event.pc, tid: event.tid,
          rssi: event.rssi, count: event.count,
          frequency: event.frequency, timestamp: event.timestamp,
        };
        pendingTagsRef.current.set(event.epc, tag);
        pendingCountRef.current++;
      }
    });
    const connSub = DeviceEventEmitter.addListener('rfid_connection', (event: any) => {
      const connected = event?.connected ?? false;
      setIsConnected(connected);
      isConnectedRef.current = connected;
      if (!connected) {
        setIsReading(false);
        isReadingRef.current = false;
        setTags([]);
        setTotalReadCount(0);
        setBattery(null);
      } else {
        Rfid.getBatteryLevel().then((l) => setBattery(l)).catch(() => {});
      }
    });
    const batSub = DeviceEventEmitter.addListener('rfid_battery', (event: any) => {
      setBattery(event?.level ?? 0);
    });

    // 自动连接
    setTimeout(() => {
      Rfid.connect().catch(() => {});
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      tagSub.remove(); connSub.remove(); batSub.remove();
      Rfid.stopReading().catch(() => {});
      Rfid.disconnect().catch(() => {});
    };
  }, []);

  const handleConnect = async () => {
    try { await Rfid.connect(); } catch (e: any) { Alert.alert(t('rfid.error'), e.message); }
  };
  const handleDisconnect = async () => {
    try {
      await Rfid.stopReading().catch(() => {});
      await Rfid.disconnect();
      setIsConnected(false); setIsReading(false); setTags([]); setTotalReadCount(0); setBattery(null);
    } catch (e: any) { Alert.alert(t('rfid.error'), e.message); }
  };
  const handleStart = async () => {
    try { await Rfid.startReading(); setIsReading(true); isReadingRef.current = true; }
    catch (e: any) { Alert.alert(t('rfid.error'), e.message); }
  };
  const handleStop = async () => {
    try { await Rfid.stopReading(); setIsReading(false); isReadingRef.current = false; }
    catch (e: any) { Alert.alert(t('rfid.error'), e.message); }
  };
  const handleClear = () => {
    pendingTagsRef.current.clear();
    pendingCountRef.current = 0;
    setTags([]);
    setTotalReadCount(0);
    Rfid.clearTags().catch(() => {});
  };

  const renderTag = ({ item, index }: { item: TagItem; index: number }) => (
    <View style={styles.tagItem}>
      <View style={styles.tagHeader}>
        <View style={[styles.tagBadge, { backgroundColor: getRssiColor(item.rssi) }]}>
          <Text style={styles.tagBadgeText}>{item.count}</Text>
        </View>
        <View style={styles.tagContent}>
          <Text style={styles.tagEpc}>{item.epc}</Text>
          <Text style={styles.tagMeta}>
            RSSI: {item.rssi} dBm | {(item.frequency / 1000).toFixed(3)} MHz | x{item.count}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 状态卡片 */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Text style={[styles.statusIcon, isConnected ? styles.on : styles.off]}>
              {isConnected ? '✅' : '❌'}
            </Text>
            <Text style={styles.statusTitle}>
              {isConnected ? t('rfid.connected') : t('rfid.notConnected')}
            </Text>
          </View>
          {isConnected && battery !== null && (
            <Text style={styles.batteryText}>🔋 {battery === -1 ? t('rfid.charging') : `${battery}%`}</Text>
          )}
        </View>
        {isConnected && (
          <View style={styles.statusDetail}>
            <Text style={styles.detailLabel}>{t('rfid.readStatus')}</Text>
            <Text style={[styles.detailValue, isReading ? styles.on : styles.off]}>
              {isReading ? t('rfid.reading') : t('rfid.stopped')}
            </Text>
          </View>
        )}
      </View>

      {/* 控制按钮 */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnGreen, (!isConnected || isReading) && styles.btnDisabled]}
          onPress={handleStart} disabled={!isConnected || isReading}
        >
          <Text style={styles.btnText}>▶ {t('rfid.startReading')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnRed, !isReading && styles.btnDisabled]}
          onPress={handleStop} disabled={!isReading}
        >
          <Text style={styles.btnText}>■ {t('rfid.stopReading')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnGray, tags.length === 0 && styles.btnDisabled]}
          onPress={handleClear} disabled={tags.length === 0}
        >
          <Text style={styles.btnText}>≡ {t('rfid.clearTags')}</Text>
        </TouchableOpacity>
      </View>

      {/* 统计 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tags.length}</Text>
          <Text style={styles.statLabel}>{t('rfid.tagCount')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalReadCount}</Text>
          <Text style={styles.statLabel}>{t('rfid.totalRead')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{isReading ? `${totalReadCount > 0 ? Math.round(totalReadCount / 1) : 0}/s` : '0/s'}</Text>
          <Text style={styles.statLabel}>{t('rfid.speed')}</Text>
        </View>
      </View>

      {/* 标签列表 */}
      <FlatList
        data={tags}
        renderItem={renderTag}
        keyExtractor={(item) => item.epc}
        style={styles.list}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isConnected ? t('rfid.emptyConnected') : t('rfid.emptyDisconnected')}
            </Text>
          </View>
        }
      />

      {/* 底部连接/断开 */}
      {!isConnected ? (
        <TouchableOpacity style={styles.bottomBtn} onPress={handleConnect}>
          <Text style={styles.bottomBtnText}>{t('rfid.connectBtn')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.bottomBtn, styles.bottomBtnDanger]} onPress={handleDisconnect}>
          <Text style={styles.bottomBtnText}>{t('rfid.disconnectBtn')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function getRssiColor(rssi: number) {
  if (rssi >= -50) return '#4CAF50';
  if (rssi >= -70) return '#FF9800';
  return '#F44336';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, elevation: 3 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { fontSize: 20, marginRight: 8 },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  batteryText: { fontSize: 16, color: '#4CAF50', fontWeight: '500' },
  statusDetail: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, fontWeight: '500' },
  on: { color: '#4CAF50' },
  off: { color: '#999' },
  btnRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnGreen: { backgroundColor: '#4CAF50' },
  btnRed: { backgroundColor: '#F44336' },
  btnGray: { backgroundColor: '#9E9E9E' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12, padding: 16, elevation: 2, marginBottom: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  list: { flex: 1, marginHorizontal: 12 },
  tagItem: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 6, elevation: 1 },
  tagHeader: { flexDirection: 'row', alignItems: 'center' },
  tagBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  tagBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  tagContent: { flex: 1 },
  tagEpc: { fontSize: 13, fontWeight: 'bold', color: '#333', fontFamily: 'monospace' },
  tagMeta: { fontSize: 11, color: '#999', marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: '#999' },
  bottomBtn: { backgroundColor: '#2196F3', margin: 12, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  bottomBtnDanger: { backgroundColor: '#F44336' },
  bottomBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
