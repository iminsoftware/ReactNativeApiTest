import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, NativeModules, NativeEventEmitter, Clipboard } from 'react-native';
import { Nfc } from 'react-native-imin-hardware';
import type { NfcTagData } from 'react-native-imin-hardware';
import { t } from '../i18n';

const nfcEmitter = new NativeEventEmitter(NativeModules.IminHardware);

export default function NfcScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tagHistory, setTagHistory] = useState<NfcTagData[]>([]);

  const [currentTag, setCurrentTag] = useState<NfcTagData | null>(null);

  useEffect(() => {
    checkNfcStatus();
    const subscription = nfcEmitter.addListener('nfc_tag_detected', (data: NfcTagData) => {
      setCurrentTag(data);
      setTagHistory(prev => [data, ...prev].slice(0, 20));
    });
    return () => { subscription.remove(); Nfc.stopListening().catch(() => {}); };
  }, []);

  const checkNfcStatus = async () => {
    try {
      setLoading(true);
      const available = await Nfc.isAvailable(); setIsAvailable(available);
      if (available) { const enabled = await Nfc.isEnabled(); setIsEnabled(enabled); }
    } catch (error) { Alert.alert(t('nfc.error'), t('nfc.checkingStatus')); }
    finally { setLoading(false); }
  };

  const handleStartListening = async () => {
    if (!isEnabled) {
      Alert.alert(t('nfc.nfcNotEnabled'), t('nfc.enableFirst'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('nfc.openSettingsBtn'), onPress: () => Nfc.openSettings() },
      ]);
      return;
    }
    try { const success = await Nfc.startListening(); if (success) { setIsListening(true); Alert.alert(t('nfc.success'), t('nfc.startListenSuccess')); } }
    catch (error: any) { Alert.alert(t('nfc.error'), error.message); }
  };

  const handleStopListening = async () => {
    try { const success = await Nfc.stopListening(); if (success) { setIsListening(false); Alert.alert(t('nfc.success'), t('nfc.stopListenSuccess')); } }
    catch (error: any) { Alert.alert(t('nfc.error'), error.message); }
  };

  const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleTimeString();

  if (loading) {
    return (<View style={styles.centerContainer}><ActivityIndicator size="large" color="#2196F3" /><Text style={styles.loadingText}>{t('nfc.checkingStatus')}</Text></View>);
  }
  if (!isAvailable) {
    return (<View style={styles.centerContainer}><Text style={styles.errorIcon}>❌</Text><Text style={styles.errorText}>{t('nfc.notSupported')}</Text></View>);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('nfc.status')}</Text>
          <View style={styles.statusRow}><Text style={styles.statusLabel}>{t('nfc.deviceSupport')}</Text><Text style={[styles.statusValue, styles.statusEnabled]}>{t('common.yes')}</Text></View>
          <View style={styles.statusRow}><Text style={styles.statusLabel}>{t('nfc.nfcEnabled')}</Text><Text style={[styles.statusValue, isEnabled ? styles.statusEnabled : styles.statusDisabled]}>{isEnabled ? t('nfc.enabled') : t('nfc.notEnabled')}</Text></View>
          <View style={styles.statusRow}><Text style={styles.statusLabel}>{t('nfc.listenStatus')}</Text><Text style={[styles.statusValue, isListening ? styles.statusEnabled : styles.statusDisabled]}>{isListening ? t('nfc.listening') : t('nfc.notListening')}</Text></View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('nfc.control')}</Text>
          {!isEnabled && <TouchableOpacity style={[styles.button, styles.buttonWarning]} onPress={() => Nfc.openSettings()}><Text style={styles.buttonText}>{t('nfc.openSettings')}</Text></TouchableOpacity>}
          {isEnabled && !isListening && <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleStartListening}><Text style={styles.buttonText}>{t('nfc.startListen')}</Text></TouchableOpacity>}
          {isListening && <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleStopListening}><Text style={styles.buttonText}>{t('nfc.stopListen')}</Text></TouchableOpacity>}
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={checkNfcStatus}><Text style={styles.buttonText}>{t('nfc.refreshStatus')}</Text></TouchableOpacity>
        </View>
        {/* 当前标签 */}
        {currentTag && (
          <View style={[styles.card, styles.currentTagCard]}>
            <Text style={styles.currentTagTitle}>📱 当前标签</Text>
            <Text style={styles.currentTagId}>{currentTag.id}</Text>
            {(currentTag as any).tagType ? <Text style={styles.currentTagType}>标签类型: {(currentTag as any).tagType}</Text> : null}
            {currentTag.content ? <Text style={styles.currentTagContent}>{t('nfc.content')} {currentTag.content}</Text> : null}
            {currentTag.technology ? <Text style={styles.currentTagTech}>{t('nfc.technology')} {currentTag.technology}</Text> : null}
            <Text style={styles.currentTagTime}>{formatTimestamp(currentTag.timestamp)}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.cardTitle}>{t('nfc.tagHistory')}</Text>
            {tagHistory.length > 0 && <TouchableOpacity onPress={() => setTagHistory([])}><Text style={styles.clearButton}>{t('nfc.clear')}</Text></TouchableOpacity>}
          </View>
          {tagHistory.length === 0 ? <Text style={styles.emptyText}>{t('nfc.noRecord')}</Text> : tagHistory.map((tag, index) => (
            <View key={`${tag.id}-${tag.timestamp}`} style={styles.tagItem}>
              <View style={styles.tagHeader}><Text style={styles.tagIndex}>#{index + 1}</Text><Text style={styles.tagTime}>{formatTimestamp(tag.timestamp)}</Text></View>
              <View style={styles.tagRow}><Text style={styles.tagLabel}>ID:</Text><Text style={styles.tagValue}>{tag.id}</Text></View>
              {tag.content && <View style={styles.tagRow}><Text style={styles.tagLabel}>{t('nfc.content')}</Text><Text style={styles.tagValue}>{tag.content}</Text></View>}
              {tag.technology && <View style={styles.tagRow}><Text style={styles.tagLabel}>{t('nfc.technology')}</Text><Text style={styles.tagValueSmall}>{tag.technology}</Text></View>}
            </View>
          ))}
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>{t('nfc.info')}</Text><Text style={styles.infoText}>{t('nfc.infoText')}</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorIcon: { fontSize: 64, marginBottom: 16 },
  errorText: { fontSize: 18, color: '#666', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusLabel: { fontSize: 14, color: '#666' },
  statusValue: { fontSize: 14, fontWeight: '500' },
  statusEnabled: { color: '#4CAF50' },
  statusDisabled: { color: '#F44336' },
  button: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  buttonPrimary: { backgroundColor: '#4CAF50' },
  buttonDanger: { backgroundColor: '#F44336' },
  buttonWarning: { backgroundColor: '#FF9800' },
  buttonSecondary: { backgroundColor: '#2196F3' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearButton: { color: '#F44336', fontSize: 14, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 14, paddingVertical: 20 },
  tagItem: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#2196F3' },
  tagHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tagIndex: { fontSize: 12, color: '#2196F3', fontWeight: 'bold' },
  tagTime: { fontSize: 12, color: '#999' },
  tagRow: { flexDirection: 'row', marginBottom: 4 },
  tagLabel: { fontSize: 13, color: '#666', width: 50 },
  tagValue: { fontSize: 13, color: '#333', flex: 1, fontWeight: '500' },
  tagValueSmall: { fontSize: 11, color: '#666', flex: 1 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 22 },
  currentTagCard: { backgroundColor: '#E3F2FD', borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  currentTagTitle: { fontSize: 16, fontWeight: 'bold', color: '#1565C0', marginBottom: 8 },
  currentTagId: { fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace', color: '#0D47A1', marginBottom: 4 },
  currentTagType: { fontSize: 14, color: '#1565C0', fontWeight: '500', marginBottom: 4 },
  currentTagContent: { fontSize: 14, color: '#333', marginBottom: 4 },
  currentTagTech: { fontSize: 12, color: '#666', marginBottom: 4 },
  currentTagTime: { fontSize: 12, color: '#999' },
});
