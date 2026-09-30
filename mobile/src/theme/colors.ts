/**
 * Brand palette — copied from frontend/src/lib/theme.ts so the mobile
 * app keeps the same visual identity as the web.
 */
import { Platform, TextStyle } from 'react-native';

export const T = '#D27D2D'; // primary accent (vintage orange)
export const ESPRESSO = '#3A2312'; // darkest — used for headings, dark surfaces
export const COFFEE = '#6F4E37'; // medium brown — secondary text
export const LINEN = '#FAF0E6'; // background — warm cream
export const CARD = '#FFF8F0'; // card surface — slightly warmer than LINEN
export const MUTED = '#E8D5BC'; // borders, subtle highlights
export const SOFT = '#EFE0CC'; // soft fill background

export const SUCCESS = '#27AE60';
export const ERROR_COLOR = '#E74C3C';
export const WARNING_COLOR = '#E8A838';
export const INFO_COLOR = '#2980B9';

// Backwards-compatible lowercase aliases for older callers
export const success = SUCCESS;
export const error = ERROR_COLOR;
export const warning = WARNING_COLOR;
export const info = INFO_COLOR;

// Serif-style helper for headings. Re-exported so screens can import
// `{ T, ESPRESSO, serif }` from this single module.
export const serif: TextStyle = {
  fontFamily: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
};