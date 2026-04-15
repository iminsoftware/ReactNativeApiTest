import { requireNativeComponent, UIManager, Platform } from 'react-native';

const COMPONENT_NAME = 'MsrNativeEditText';

if (Platform.OS === 'android' && UIManager.getViewManagerConfig) {
  UIManager.getViewManagerConfig(COMPONENT_NAME);
}

const MsrNativeEditText = requireNativeComponent(COMPONENT_NAME);

export default MsrNativeEditText;
