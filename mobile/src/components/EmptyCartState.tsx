import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { T, LINEN, MUTED, COFFEE, ESPRESSO, CARD } from '../theme/colors';

interface Props {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export function EmptyCartState({ title, subtitle, ctaLabel, onCtaPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <ShoppingBag size={48} color={COFFEE} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {ctaLabel && onCtaPress ? (
        <TouchableOpacity style={styles.btn} onPress={onCtaPress} activeOpacity={0.8}>
          <Text style={styles.btnText}>{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 64,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: ESPRESSO,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COFFEE,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: T,
  },
  btnText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 14,
  },
});