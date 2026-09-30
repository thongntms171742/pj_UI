import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { CARD, MUTED, ESPRESSO, COFFEE, T, LINEN } from '../theme/colors';

interface Props {
  label: string;
  active?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function CategoryPill({ label, active, onPress, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        active && styles.pillActive,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: MUTED,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: T,
    borderColor: T,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: ESPRESSO,
  },
  textActive: {
    color: LINEN,
  },
});