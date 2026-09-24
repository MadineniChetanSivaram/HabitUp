import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { getFontFamily } from '../constants/fonts';

let isConfigured = false;

/**
 * Configure default typography across React Native Text and TextInput components.
 * Sets defaultProps with safety checks for React 18 / React Native compatibility.
 */
export function configureDefaultTypography() {
  if (isConfigured) return;
  isConfigured = true;

  try {
    const TextComponent = RNText as any;
    if (TextComponent) {
      TextComponent.defaultProps = TextComponent.defaultProps || {};
      TextComponent.defaultProps.style = [
        { fontFamily: getFontFamily('400') },
        TextComponent.defaultProps.style,
      ];
    }

    const TextInputComponent = RNTextInput as any;
    if (TextInputComponent) {
      TextInputComponent.defaultProps = TextInputComponent.defaultProps || {};
      TextInputComponent.defaultProps.style = [
        { fontFamily: getFontFamily('400') },
        TextInputComponent.defaultProps.style,
      ];
    }
  } catch (err) {
    console.warn('[Typography] Non-critical warning configuring default typography:', err);
  }
}
