import { Platform } from 'react-native';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

/**
 * Global Font definitions mapped to Plus Jakarta Sans weights.
 *
 * Mapped to both standard names and weight-specific aliases so that
 * any Text component applying fontFamily or default styling picks up
 * the custom font seamlessly across Android, iOS, and Web.
 */
export const customFontsToLoad = {
  // Named font family
  'PlusJakartaSans': PlusJakartaSans_400Regular,
  'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
  'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
  'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
  'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
};
