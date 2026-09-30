import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { CARD, MUTED, ESPRESSO, COFFEE } from '../theme/colors';

interface Props {
  label: string;
  active?: boolean;
  count?: number;
  color?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function StatusBadge({ label, active, count, color, onPress, style }: Props) {
  const bg = active ? `${color ?? '#888'}22` : CARD;
  const border = active ? color ?? '#888' : MUTED;
  return (
    <View
      style={[styles.wrap, { backgroundColor: bg, borderColor: border }, style]}
      onTouchEnd={onPress}
    >
      <Text style={[styles.label, { color: active ? color ?? COFFEE : COFFEE }]}>
        {label}
      </Text>
      {count !== undefined && count > 0 ? (
        <Text style={[styles.count, { backgroundColor: color ?? COFFEE }]}>{count}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.2,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  count: {
    marginLeft: 6,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
});