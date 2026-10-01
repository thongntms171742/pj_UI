import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { ESPRESSO, SOFT, MUTED, T, LINEN, COFFEE } from '../theme/colors';

interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, min = 1, max, onChange, size = 'md' }: Props) {
  // Touch target minimum is 44 (iOS HIG) / 48 (Material). Keep md ≥ 44, sm ≥ 36.
  const dim = size === 'sm' ? 36 : 44;
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max ?? Infinity, value + 1));
  const disabledDec = value <= min;
  const disabledInc = max !== undefined && value >= max;

  return (
    <View style={[styles.row, { borderRadius: 10, borderWidth: 1.2, borderColor: MUTED }]}>
      <TouchableOpacity
        onPress={dec}
        disabled={disabledDec}
        style={[
          styles.btn,
          {
            width: dim,
            height: dim,
            backgroundColor: SOFT,
            opacity: disabledDec ? 0.4 : 1,
          },
        ]}
      >
        <Minus size={size === 'sm' ? 12 : 16} color={COFFEE} />
      </TouchableOpacity>
      <View
        style={[
          styles.val,
          {
            minWidth: dim + 8,
            height: dim,
            backgroundColor: '#FFF',
            borderColor: MUTED,
            borderLeftWidth: 1.2,
            borderRightWidth: 1.2,
          },
        ]}
      >
        <Text style={styles.valText}>{value}</Text>
      </View>
      <TouchableOpacity
        onPress={inc}
        disabled={disabledInc}
        style={[
          styles.btn,
          {
            width: dim,
            height: dim,
            backgroundColor: disabledInc ? MUTED : T,
          },
        ]}
      >
        <Plus size={size === 'sm' ? 12 : 16} color={disabledInc ? COFFEE : LINEN} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  val: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  valText: {
    fontSize: 14,
    fontWeight: '700',
    color: ESPRESSO,
  },
});