import {
  Comfortaa_300Light,
  Comfortaa_400Regular,
  Comfortaa_500Medium,
  Comfortaa_600SemiBold,
  Comfortaa_700Bold,
} from '@expo-google-fonts/comfortaa';

/**
 * Global Font definitions mapped to Comfortaa weights.
 *
 * Mapped to standard names and weight-specific aliases so that
 * any Text component applying fontFamily or default styling picks up
 * the custom font seamlessly across Android, iOS, and Web.
 */
export const customFontsToLoad = {
  // Named font family
  'Comfortaa': Comfortaa_400Regular,
  'Comfortaa-Light': Comfortaa_300Light,
  'Comfortaa-Regular': Comfortaa_400Regular,
  'Comfortaa-Medium': Comfortaa_500Medium,
  'Comfortaa-SemiBold': Comfortaa_600SemiBold,
  'Comfortaa-Bold': Comfortaa_700Bold,
};
