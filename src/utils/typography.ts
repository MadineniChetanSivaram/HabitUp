import { Text as RNText, TextInput as RNTextInput, StyleSheet, Platform } from 'react-native';

let isConfigured = false;

/**
 * Resolves appropriate Comfortaa weight variant based on fontWeight.
 * On Android, React Native requires using the weight-specific font family directly
 * (e.g. 'Comfortaa-Bold') and setting fontWeight to 'normal' so Android's native
 * Typeface resolver does not attempt to synthesize bold or fall back to system fonts (Roboto).
 */
export function resolveComfortaaStyle(style: any) {
  if (!style) {
    return { fontFamily: 'Comfortaa-Regular' };
  }

  const flat = StyleSheet.flatten(style);
  if (!flat) {
    return { fontFamily: 'Comfortaa-Regular' };
  }

  // If already explicitly mapped to a Comfortaa font
  if (typeof flat.fontFamily === 'string' && flat.fontFamily.startsWith('Comfortaa')) {
    if (Platform.OS === 'android' && flat.fontWeight && flat.fontWeight !== 'normal') {
      return [style, { fontWeight: 'normal' }];
    }
    return style;
  }

  const weight = String(flat.fontWeight || '400').toLowerCase();
  let targetFont = 'Comfortaa-Regular';

  if (weight === 'bold' || weight === '700' || weight === '800' || weight === '900') {
    targetFont = 'Comfortaa-Bold';
  } else if (weight === '600' || weight === 'semibold') {
    targetFont = 'Comfortaa-SemiBold';
  } else if (weight === '500' || weight === 'medium') {
    targetFont = 'Comfortaa-Medium';
  } else if (weight === '300' || weight === 'light') {
    targetFont = 'Comfortaa-Light';
  }

  if (Platform.OS === 'android') {
    // Normalizing fontWeight to 'normal' ensures Android loads the custom weight TTF
    // without dropping to system fallback Roboto.
    return [style, { fontFamily: targetFont, fontWeight: 'normal' }];
  }

  return [style, { fontFamily: targetFont }];
}

/**
 * Configure default typography across React Native Text and TextInput components.
 * Monkey-patches React Native Text.render and TextInput.render to guarantee
 * that all Text components in the app inherit Comfortaa at the appropriate weight.
 */
export function configureDefaultTypography() {
  if (isConfigured) return;
  isConfigured = true;

  try {
    const TextComponent = RNText as any;
    if (TextComponent) {
      TextComponent.defaultProps = TextComponent.defaultProps || {};
      TextComponent.defaultProps.style = [
        { fontFamily: 'Comfortaa-Regular' },
        TextComponent.defaultProps.style,
      ];

      // Patch forwardRef render for modern React Native (React 18 / RN 0.76+)
      const origRender = TextComponent.render;
      if (typeof origRender === 'function') {
        TextComponent.render = function (props: any, ref: any) {
          const resolvedStyle = resolveComfortaaStyle(props?.style);
          return origRender.call(this, { ...props, style: resolvedStyle }, ref);
        };
      }
    }

    const TextInputComponent = RNTextInput as any;
    if (TextInputComponent) {
      TextInputComponent.defaultProps = TextInputComponent.defaultProps || {};
      TextInputComponent.defaultProps.style = [
        { fontFamily: 'Comfortaa-Regular' },
        TextInputComponent.defaultProps.style,
      ];

      const origInputRender = TextInputComponent.render;
      if (typeof origInputRender === 'function') {
        TextInputComponent.render = function (props: any, ref: any) {
          const resolvedStyle = resolveComfortaaStyle(props?.style);
          return origInputRender.call(this, { ...props, style: resolvedStyle }, ref);
        };
      }
    }
  } catch (err) {
    console.warn('[Typography] Non-critical warning configuring default typography:', err);
  }
}
