import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Msr } from 'react-native-imin-hardware';
import { t } from '../i18n';

interface CardData { rawData: string; timestamp: number; }

export default function MsrScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [cardInput, setCardInput] = useState('');
  const [cardHistory, setCardHistory] = useState<CardData[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    checkMsrStatus();
    setTimeout(() => { inputRef.current?.focus(); }, 500);
  }, []);

  const checkMsrStatus = async () => {
    try { const available = await Msr.isAvailable(); setIsAvailable(available); }
    catch (error) { Alert.alert(t('msr.error'), t('msr.checkFailed')); }
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardInput = (text: string) => {
    setCardInput(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length > 0) {
      debounceRef.current = setTimeout(() => {
        const trimmed = text.trim();
        if (trimmed.length > 0) {
          const cardData: CardData = { rawData: trimmed, timestamp: Date.now() };
          setCardHistory(prev => [cardData, ...prev].slice(0, 10));
          setCardInput('');
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 800);
    }
  };

  const handleSubmit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = cardInput.trim();
    if (trimmed.length > 0) {
      const cardData: CardData = { rawData: trimmed, timestamp: Date.now() };
      setCardHistory(prev => [cardData, ...prev].slice(0, 10));
      setCardInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleTimeString();

  const parseCardData = (rawData: string) => {
    const lines = rawData.split('\n').filter(line => line.trim());
    return { track1: lines[0] || '', track2: lines[1] || '', track3: lines[2] || '' };
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('msr.status')}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('msr.available')}</Text>
            <Text style={[styles.statusValue, isAvailable ? styles.statusEnabled : styles.statusDisabled]}>{isAvailable ? t('common.yes') : t('common.no')}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('msr.swipeInput')}</Text>
          <Text style={styles.instructionText}>{t('msr.instruction')}</Text>
          <TextInput ref={inputRef} style={styles.cardInput} value={cardInput} onChangeText={handleCardInput} onSubmitEditing={handleSubmit} placeholder={t('msr.waiting')} autoFocus selectTextOnFocus blurOnSubmit={false} />
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => inputRef.current?.focus()}>
            <Text style={styles.buttonText}>{t('msr.focusInput')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.cardTitle}>{t('msr.history')}</Text>
            {cardHistory.length > 0 && <TouchableOpacity onPress={() => setCardHistory([])}><Text style={styles.clearButton}>{t('msr.clear')}</Text></TouchableOpacity>}
          </View>
          {cardHistory.length === 0 ? <Text style={styles.emptyText}>{t('msr.noRecord')}</Text> : cardHistory.map((card, index) => {
            const parsed = parseCardData(card.rawData);
            return (
              <View key={card.timestamp} style={styles.cardItem}>
                <View style={styles.cardHeader}><Text style={styles.cardIndex}>#{index + 1}</Text><Text style={styles.cardTime}>{formatTimestamp(card.timestamp)}</Text></View>
                <View style={styles.cardRow}><Text style={styles.cardLabel}>{t('msr.dataLength')}</Text><Text style={styles.cardValue}>{card.rawData.length} {t('msr.chars')}</Text></View>
                {parsed.track1 && <View style={styles.cardRow}><Text style={styles.cardLabel}>Track 1:</Text><Text style={styles.cardValueSmall} numberOfLines={1}>{parsed.track1}</Text></View>}
                {parsed.track2 && <View style={styles.cardRow}><Text style={styles.cardLabel}>Track 2:</Text><Text style={styles.cardValueSmall} numberOfLines={1}>{parsed.track2}</Text></View>}
                <View style={styles.cardRow}><Text style={styles.cardLabel}>{t('msr.rawData')}</Text><Text style={styles.cardValueSmall} numberOfLines={2}>{card.rawData}</Text></View>
              </View>
            );
          })}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('msr.info')}</Text>
          <Text style={styles.infoText}>{t('msr.infoText')}</Text>
          <View style={styles.warningBox}><Text style={styles.warningText}>{t('msr.warning')}</Text></View>
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
  cardInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, backgroundColor: '#f9f9f9', minHeight: 100, textAlignVertical: 'top', marginBottom: 12, fontFamily: 'monospace' },
  button: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonPrimary: { backgroundColor: '#2196F3' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearButton: { color: '#F44336', fontSize: 14, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 14, paddingVertical: 20 },
  cardItem: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#2196F3' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardIndex: { fontSize: 12, color: '#2196F3', fontWeight: 'bold' },
  cardTime: { fontSize: 12, color: '#999' },
  cardRow: { flexDirection: 'row', marginBottom: 4 },
  cardLabel: { fontSize: 13, color: '#666', width: 80 },
  cardValue: { fontSize: 13, color: '#333', flex: 1, fontWeight: '500' },
  cardValueSmall: { fontSize: 11, color: '#666', flex: 1, fontFamily: 'monospace' },
  infoText: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 12 },
  warningBox: { backgroundColor: '#FFF3E0', borderRadius: 8, padding: 12, borderLeftWidth: 3, borderLeftColor: '#FF9800' },
  warningText: { fontSize: 13, color: '#E65100' },
});
