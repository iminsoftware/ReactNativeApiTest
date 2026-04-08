import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { FloatingWindow } from 'react-native-imin-hardware';
import { t } from '../i18n';

export default function FloatingWindowScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [inputText, setInputText] = useState('Hello iMin');
  const [posX, setPosX] = useState('100');
  const [posY, setPosY] = useState('200');

  useEffect(() => { checkPermission(); checkStatus(); }, []);

  const checkPermission = async () => { try { setHasPermission(await FloatingWindow.hasPermission()); } catch (e) {} };
  const checkStatus = async () => { try { setIsShowing(await FloatingWindow.isShowing()); } catch (e) {} };

  const handleRequestPermission = async () => {
    try {
      const result = await FloatingWindow.requestPermission();
      if (result) { setHasPermission(true); Alert.alert(t('float.hint'), t('float.hasPermission')); }
      else { Alert.alert(t('float.hint'), t('float.goToSettings')); setTimeout(checkPermission, 1000); }
    } catch (error: any) { Alert.alert(t('float.error'), error.message); }
  };

  const handleShow = async () => {
    try { await FloatingWindow.show(); setIsShowing(true); }
    catch (error: any) {
      if (error.code === 'PERMISSION_DENIED') Alert.alert(t('float.permissionDenied'), t('float.grantFirst'));
      else Alert.alert(t('float.error'), error.message);
    }
  };

  const handleHide = async () => { try { await FloatingWindow.hide(); setIsShowing(false); } catch (error: any) { Alert.alert(t('float.error'), error.message); } };

  const handleUpdateText = async () => {
    if (!inputText.trim()) { Alert.alert(t('float.hint'), t('float.enterText')); return; }
    try { await FloatingWindow.updateText(inputText); Alert.alert(t('float.success'), t('float.textUpdated')); }
    catch (error: any) { Alert.alert(t('float.error'), error.message); }
  };

  const handleSetPosition = async () => {
    const x = parseInt(posX, 10), y = parseInt(posY, 10);
    if (isNaN(x) || isNaN(y)) { Alert.alert(t('float.hint'), t('float.invalidCoords')); return; }
    try { await FloatingWindow.setPosition(x, y); Alert.alert(t('float.success'), `${t('float.positionSet')} (${x}, ${y})`); }
    catch (error: any) { Alert.alert(t('float.error'), error.message); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('float.status')}</Text>
          <View style={styles.statusRow}><Text style={styles.statusLabel}>{t('float.permission')}</Text><Text style={[styles.statusValue, hasPermission ? styles.statusOn : styles.statusOff]}>{hasPermission ? t('float.authorized') : t('float.notAuthorized')}</Text></View>
          <View style={styles.statusRow}><Text style={styles.statusLabel}>{t('float.showStatus')}</Text><Text style={[styles.statusValue, isShowing ? styles.statusOn : styles.statusOff]}>{isShowing ? t('float.showing') : t('float.hidden')}</Text></View>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => { checkPermission(); checkStatus(); }}><Text style={styles.buttonText}>{t('float.refreshStatus')}</Text></TouchableOpacity>
        </View>
        {!hasPermission && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('float.requestPermission')}</Text>
            <Text style={styles.infoText}>{t('float.permissionInfo')}</Text>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleRequestPermission}><Text style={styles.buttonText}>{t('float.requestBtn')}</Text></TouchableOpacity>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('float.showControl')}</Text>
          {!isShowing ? (
            <TouchableOpacity style={[styles.button, styles.buttonPrimary, !hasPermission && styles.buttonDisabled]} onPress={handleShow} disabled={!hasPermission}><Text style={styles.buttonText}>{t('float.show')}</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleHide}><Text style={styles.buttonText}>{t('float.hide')}</Text></TouchableOpacity>
          )}
        </View>
        {isShowing && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('float.updateText')}</Text>
            <TextInput style={styles.input} value={inputText} onChangeText={setInputText} placeholder={t('float.inputPlaceholder')} placeholderTextColor="#999" />
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleUpdateText}><Text style={styles.buttonText}>{t('float.updateBtn')}</Text></TouchableOpacity>
          </View>
        )}
        {isShowing && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('float.setPosition')}</Text>
            <View style={styles.positionRow}>
              <View style={styles.positionInput}><Text style={styles.positionLabel}>X:</Text><TextInput style={styles.input} value={posX} onChangeText={setPosX} keyboardType="numeric" placeholder="X" placeholderTextColor="#999" /></View>
              <View style={styles.positionInput}><Text style={styles.positionLabel}>Y:</Text><TextInput style={styles.input} value={posY} onChangeText={setPosY} keyboardType="numeric" placeholder="Y" placeholderTextColor="#999" /></View>
            </View>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSetPosition}><Text style={styles.buttonText}>{t('float.setPositionBtn')}</Text></TouchableOpacity>
          </View>
        )}
        <View style={styles.card}><Text style={styles.cardTitle}>{t('float.info')}</Text><Text style={styles.infoText}>{t('float.infoText')}</Text></View>
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
  statusOn: { color: '#4CAF50' },
  statusOff: { color: '#999' },
  button: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonPrimary: { backgroundColor: '#2196F3' },
  buttonSecondary: { backgroundColor: '#607D8B' },
  buttonDanger: { backgroundColor: '#F44336' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  infoText: { fontSize: 14, color: '#666', lineHeight: 22 },
  input: { height: 44, backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, borderWidth: 1, borderColor: '#e0e0e0' },
  positionRow: { flexDirection: 'row', gap: 12 },
  positionInput: { flex: 1 },
  positionLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
});
