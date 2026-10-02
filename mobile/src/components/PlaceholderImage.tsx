/**
 * PlaceholderImage — neutral dashed-border box used when a product / review
 * thumbnail has no image. Mirrors FE
 * `frontend/src/components/common/LetterAvatar.tsx` (`PlaceholderImage`
 * named export). Deliberately does NOT use a third-party fallback URL —
 * any third-party URL risks becoming a "fake" data point, see the design
 * rule in `AI_CONTEXT.md`: "If the database doesn't have the data, don't
 * show the component or show an empty state — never fake it."
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ImageOff } from 'lucide-react-native';
import { COFFEE, MUTED, SOFT, CARD } from '../theme/colors';

interface Props {
  width?: number | string;
  height?: number | string;
  label?: string;
  /** Render the dashed border so the slot still reads as "an image goes here". */
  bordered?: boolean;
  style?: ViewStyle;
}

export function PlaceholderImage({
  width = '100%',
  height = 120,
  label,
  bordered = true,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.box,
        bordered && styles.bordered,
        { width: width as ViewStyle['width'], height: height as ViewStyle['height'] },
        style,
      ]}
    >
      <ImageOff size={28} color={MUTED} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 12,
  },
  bordered: {
    borderWidth: 1.5,
    borderColor: MUTED,
    borderStyle: 'dashed',
    backgroundColor: CARD,
  },
  label: {
    color: COFFEE,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});