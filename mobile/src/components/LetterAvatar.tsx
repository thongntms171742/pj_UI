/**
 * LetterAvatar — deterministic initial-based circular avatar used whenever
 * the user/seller has no avatar image uploaded. Mirrors FE
 * `frontend/src/components/common/LetterAvatar.tsx` (BE 2026-10-03 — Unsplash
 * cleanup). Color comes from a small palette so the same name always maps
 * to the same colour across the app (basic visual stability).
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ESPRESSO, COFFEE, LINEN } from '../theme/colors';

const PALETTE = [
  '#D27D2D', // primary
  '#3A2312', // espresso
  '#6F4E37', // coffee
  '#27AE60', // success
  '#2980B9', // info
  '#8E44AD', // purple
  '#C0392B', // danger
  '#E67E22', // warning
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function colorFor(seed: string): string {
  return PALETTE[hashCode(seed) % PALETTE.length];
}

interface Props {
  /** Used to seed the color and to extract the initial. */
  name: string;
  size?: number;
  /** Override background color (rare). Defaults to a palette color from `name`. */
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function LetterAvatar({ name, size = 40, color, style, textStyle }: Props) {
  const initial = (name?.trim().charAt(0) || '?').toUpperCase();
  const bg = color ?? colorFor(name || '?');
  const fontSize = Math.round(size * 0.45);

  // Memo the colour so re-renders don't churn styles.
  const containerStyle = useMemo<ViewStyle>(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }),
    [size, bg],
  );

  return (
    <View style={[containerStyle, style]}>
      <Text
        style={[
          styles.text,
          { fontSize, lineHeight: fontSize * 1.05 },
          textStyle,
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: LINEN,
    fontWeight: '700',
  },
});