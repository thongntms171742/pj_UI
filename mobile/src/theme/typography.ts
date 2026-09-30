/**
 * Typography — kept loose in RN. Fonts are loaded via expo-font at runtime
 * if we want Playfair Display / Plus Jakarta Sans. Defaults are system fonts.
 */

import { Platform } from 'react-native';

export const fontFamilySerif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

export const fontFamilySans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const typography = {
  displayLg: { fontSize: 28, fontWeight: fontWeights.bold, lineHeight: 36 },
  h1: { fontSize: 24, fontWeight: fontWeights.bold, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: fontWeights.bold, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: fontWeights.semibold, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: fontWeights.regular, lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: fontWeights.semibold, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: fontWeights.regular, lineHeight: 16 },
  xs: { fontSize: 11, fontWeight: fontWeights.regular, lineHeight: 14 },
};