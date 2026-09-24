import { Platform, Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { getFontFamily } from '../constants/fonts';

// Guard against executing multiple times
let isConfigured = false;

/**
 * Configure default typography for all React Native Text and TextInput components.
 * This injects the custom Plus Jakarta Sans font family across the entire application,
 * respecting each component's specified fontWeight (bold, semibold, medium, regular).
 */
export function configureDefaultTypography() {
  if (isConfigured) return;
  isConfigured = true;

  // 1. Text Component Global Patching
  const TextComponent = RNText as any;
  const originalTextRender = TextComponent.render;

  if (typeof originalTextRender === 'function') {
    TextComponent.render = function (...args: any[]) {
      const origin = originalTextRender.apply(this, args);
      const props = origin.props;
      const flat = StyleSheet.flatten(props.style) || {};

      // If fontFamily is already explicitly provided (e.g., monospace in ErrorBoundary), keep it
      const fontFamily = flat.fontFamily || getFontFamily(flat.fontWeight);

      return {
        ...origin,
        props: {
          ...props,
          style: [
            { fontFamily },
            props.style,
          ],
        },
      };
    };
  }

  // 2. TextInput Component Global Patching
  const TextInputComponent = RNTextInput as any;
  const originalTextInputRender = TextInputComponent.render;

  if (typeof originalTextInputRender === 'function') {
    TextInputComponent.render = function (...args: any[]) {
      const origin = originalTextInputRender.apply(this, args);
      const props = origin.props;
      const flat = StyleSheet.flatten(props.style) || {};
      const fontFamily = flat.fontFamily || getFontFamily(flat.fontWeight);

      return {
        ...origin,
        props: {
          ...props,
          style: [
            { fontFamily },
            props.style,
          ],
        },
      };
    };
  }
}
