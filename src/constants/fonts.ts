import { Platform } from 'react-native';

/**
 * Global Font Family Configurations for HabitUp
 * Primary Font: Plus Jakarta Sans (Modern Geometric UI font)
 */
export const FONTS = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
};

/**
 * Returns the appropriate font family based on weight
 */
export const getFontFamily = (fontWeight?: string | number) => {
  if (Platform.OS === 'web') {
    return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }

  const weight = String(fontWeight || '400');
  switch (weight) {
    case '800':
    case '900':
    case 'heavy':
    case 'black':
      return FONTS.extraBold;
    case '700':
    case 'bold':
      return FONTS.bold;
    case '600':
    case 'semibold':
      return FONTS.semiBold;
    case '500':
    case 'medium':
      return FONTS.medium;
    case '400':
    case 'normal':
    default:
      return FONTS.regular;
  }
};
