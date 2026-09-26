import { Text as RNText, TextInput as RNTextInput } from 'react-native';

let isConfigured = false;

/**
 * Configure default typography across React Native Text and TextInput components.
 * Patches both defaultProps and internal render function for React 18 / React Native compatibility.
 */
export function configureDefaultTypography() {
  if (isConfigured) return;
  isConfigured = true;

  try {
    const TextComponent = RNText as any;
    if (TextComponent) {
      TextComponent.defaultProps = TextComponent.defaultProps || {};
      TextComponent.defaultProps.style = [
        { fontFamily: 'Comfortaa' },
        TextComponent.defaultProps.style,
      ];

      // Patch forwardRef render for modern React Native
      const origRender = TextComponent.render;
      if (typeof origRender === 'function') {
        TextComponent.render = function (props: any, ref: any) {
          const style = [{ fontFamily: 'Comfortaa' }, props?.style];
          return origRender.call(this, { ...props, style }, ref);
        };
      }
    }

    const TextInputComponent = RNTextInput as any;
    if (TextInputComponent) {
      TextInputComponent.defaultProps = TextInputComponent.defaultProps || {};
      TextInputComponent.defaultProps.style = [
        { fontFamily: 'Comfortaa' },
        TextInputComponent.defaultProps.style,
      ];

      const origInputRender = TextInputComponent.render;
      if (typeof origInputRender === 'function') {
        TextInputComponent.render = function (props: any, ref: any) {
          const style = [{ fontFamily: 'Comfortaa' }, props?.style];
          return origInputRender.call(this, { ...props, style }, ref);
        };
      }
    }
  } catch (err) {
    console.warn('[Typography] Non-critical warning configuring default typography:', err);
  }
}
