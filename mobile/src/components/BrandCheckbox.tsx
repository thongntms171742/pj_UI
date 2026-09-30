import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { T, LINEN, CARD, COFFEE, MUTED } from '../theme/colors';

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: number;
  style?: ViewStyle;
}

export function BrandCheckbox({ checked, onChange, size = 22, style }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      activeOpacity={0.8}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 5,
          backgroundColor: checked ? T : CARD,
          borderColor: checked ? T : MUTED,
        },
        style,
      ]}
    >
      {checked ? <Check size={size - 8} color={LINEN} strokeWidth={3} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});