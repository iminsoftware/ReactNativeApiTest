import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Image } from 'react-native';
import { Display } from 'react-native-imin-hardware';
import { t } from '../i18n';

const localImage = require('../assets/images/imin_product.png');

export default function DisplayScreen() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [textInput, setTextInput] = useState('Hello iMin!');
  const [imageUrl, setImageUrl] = useState('https://picsum.photos/800/480');
  const [videoUrl, setVideoUrl] = useState('');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => { setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20)); };

  useEffect(() => { checkAvailable(); return () => { Display.disable().catch(() => {}); }; }, []);

  const checkAvailable = async () => {
    try { const available = await Display.isAvailable(); setIsAvailable(available); }
    catch (e: any) { setIsAvailable(false); }
  };

  const handleEnable = async () => {
    try { const result = await Display.enable(); setIsEnabled(result); }
    catch (e: any) { Alert.alert(t('display.error'), e.message); }
  };

  const handleDisable = async () => {
    try { await Display.disable(); setIsEnabled(false); } catch (e: any) {}
  };

  const handleShowText = async () => {
    try { await Display.showText(textInput); } catch (e: any) { addLog(e.message); }
  };

  const handleShowLocalImage = async () => {
    try { const resolved = Image.resolveAssetSource(localImage); await Display.showImage(resolved.uri); }
    catch (e: any) { addLog(e.message); }
  };

  const handleShowNetworkImage = async () => {
    const url = imageUrl.trim();
    if (!url) { Alert.alert(t('display.hint'), t('display.enterImageUrl')); return; }
    try { await Display.showImage(url); } catch (e: any) { addLog(e.message); }
  };

  const handlePlayLocalVideo = async () => {
    try { await Display.playVideo('imin_video_3.mp4'); } catch (e: any) { addLog(e.message); }
  };

  const handlePlayVideo = async () => {
    const url = videoUrl.trim();
    if (!url) { Alert.alert(t('display.hint'), t('display.enterVideoUrl')); return; }
    try { await Display.playVideo(url); } catch (e: any) { addLog(e.message); }
  };

  const handleClear = async () => {
    try { await Display.clear(); } catch (e: any) { addLog(e.message); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('display.status')}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>{t('display.available')}</Text>
          <Text style={[styles.value, { color: isAvailable ? '#4CAF50' : '#F44336' }]}>
            {isAvailable === null ? t('display.checking') : isAvailable ? t('display.yes') : t('display.no')}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>{t('display.displayStatus')}</Text>
          <Text style={[styles.value, { color: isEnabled ? '#4CAF50' : '#999' }]}>
            {isEnabled ? t('display.enabled') : t('display.notEnabled')}
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('display.control')}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={handleEnable} disabled={!isAvailable}>
            <Text style={styles.buttonText}>{t('display.enable')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={handleDisable}>
            <Text style={styles.buttonText}>{t('display.disable')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('display.showText')}</Text>
        <TextInput style={styles.input} value={textInput} onChangeText={setTextInput} placeholder={t('display.inputPlaceholder')} multiline />
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={handleShowText} disabled={!isEnabled}>
          <Text style={styles.buttonText}>{t('display.sendToDisplay')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('display.showImage')}</Text>
        <TouchableOpacity style={[styles.button, styles.buttonBlue, { marginBottom: 12 }]} onPress={handleShowLocalImage} disabled={!isEnabled}>
          <Text style={styles.buttonText}>{t('display.showLocalImage')}</Text>
        </TouchableOpacity>
        <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder={t('display.imageUrlPlaceholder')} />
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={handleShowNetworkImage} disabled={!isEnabled}>
          <Text style={styles.buttonText}>{t('display.showNetworkImage')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('display.playVideo')}</Text>
        <TouchableOpacity style={[styles.button, styles.buttonBlue, { marginBottom: 12 }]} onPress={handlePlayLocalVideo} disabled={!isEnabled}>
          <Text style={styles.buttonText}>{t('display.playLocalVideo')}</Text>
        </TouchableOpacity>
        <TextInput style={styles.input} value={videoUrl} onChangeText={setVideoUrl} placeholder={t('display.videoUrlPlaceholder')} />
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={handlePlayVideo} disabled={!isEnabled}>
          <Text style={styles.buttonText}>{t('display.playNetworkVideo')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <TouchableOpacity style={[styles.button, styles.buttonOrange]} onPress={handleClear} disabled={!isEnabled}>
          <Text style={styles.buttonText}>{t('display.clearContent')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('display.log')}</Text>
        {log.map((item, index) => (<Text key={index} style={styles.logItem}>{item}</Text>))}
        {log.length === 0 && <Text style={styles.logEmpty}>{t('display.noLog')}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonGreen: { backgroundColor: '#4CAF50' },
  buttonRed: { backgroundColor: '#F44336' },
  buttonBlue: { backgroundColor: '#2196F3' },
  buttonOrange: { backgroundColor: '#FF9800' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12, minHeight: 44 },
  logItem: { fontSize: 12, color: '#666', marginBottom: 4, fontFamily: 'monospace' },
  logEmpty: { fontSize: 12, color: '#999', textAlign: 'center' },
});
