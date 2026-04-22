import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeviceEventEmitter } from 'react-native';
import { setLang } from './i18n';

import HomeScreen from './screens/HomeScreen';
import DeviceScreen from './screens/DeviceScreen';
import ScannerScreen from './screens/ScannerScreen';
import CashBoxScreen from './screens/CashBoxScreen';
import NfcScreen from './screens/NfcScreen';
import MsrScreen from './screens/MsrScreen';
import LightScreen from './screens/LightScreen';
import DisplayScreen from './screens/DisplayScreen';
import SegmentScreen from './screens/SegmentScreen';
import SerialScreen from './screens/SerialScreen';
import ScaleScreen from './screens/ScaleScreen';
import CameraScanScreen from './screens/CameraScanScreen';
import MultiScanScreen from './screens/MultiScanScreen';
import FloatingWindowScreen from './screens/FloatingWindowScreen';
import RfidScreen from './screens/RfidScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [langKey, setLangKey] = React.useState(0);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('localeChanged', (event) => {
      const lang = event?.language === 'zh' ? 'zh' : 'en';
      setLang(lang);
      setLangKey((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer key={langKey}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'iMin Hardware Plugin' }}
        />
        <Stack.Screen name="Device" component={DeviceScreen} options={{ title: '📱 Device' }} />
        <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: '📷 Scanner' }} />
        <Stack.Screen name="CashBox" component={CashBoxScreen} options={{ title: '💰 CashBox' }} />
        <Stack.Screen name="NFC" component={NfcScreen} options={{ title: '💳 NFC' }} />
        <Stack.Screen name="MSR" component={MsrScreen} options={{ title: '💳 MSR' }} />
        <Stack.Screen name="Light" component={LightScreen} options={{ title: '💡 Light' }} />
        <Stack.Screen name="Display" component={DisplayScreen} options={{ title: '🖥️ Display' }} />
        <Stack.Screen name="Segment" component={SegmentScreen} options={{ title: '🔢 Segment' }} />
        <Stack.Screen name="Serial" component={SerialScreen} options={{ title: '🔌 Serial' }} />
        <Stack.Screen name="Scale" component={ScaleScreen} options={{ title: '⚖️ Scale' }} />
        <Stack.Screen name="CameraScan" component={CameraScanScreen} options={{ title: '📸 Camera Scan' }} />
        <Stack.Screen name="MultiScan" component={MultiScanScreen} options={{ title: '🔍 Multi Scan' }} />
        <Stack.Screen name="FloatingWindow" component={FloatingWindowScreen} options={{ title: '📌 FloatingWindow' }} />
        <Stack.Screen name="RFID" component={RfidScreen} options={{ title: '📡 RFID' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
