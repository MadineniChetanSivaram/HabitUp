import { Platform } from 'react-native';

/**
 * Global Font Family Configurations for HabitUp
 * Primary Font: Comfortaa (Warm, distinctive rounded geometric font)
 */
export const FONTS = {
  light: 'Comfortaa-Light',
  regular: 'Comfortaa-Regular',
  medium: 'Comfortaa-Medium',
  semiBold: 'Comfortaa-SemiBold',
  bold: 'Comfortaa-Bold',
};

/**
 * Returns the appropriate font family based on weight
 */
export const getFontFamily = (fontWeight?: string | number) => {
  if (Platform.OS === 'web') {
    return "'Comfortaa', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }

  const weight = String(fontWeight || '400');
  switch (weight) {
    case '800':
    case '900':
    case 'heavy':
    case 'black':
    case '700':
    case 'bold':
      return FONTS.bold;
    case '600':
    case 'semibold':
      return FONTS.semiBold;
    case '500':
    case 'medium':
      return FONTS.medium;
    case '300':
    case 'light':
      return FONTS.light;
    case '400':
    case 'normal':
    default:
      return FONTS.regular;
  }
};
