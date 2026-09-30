import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COFFEE, MUTED } from '../theme/colors';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, subtitle, icon }: Props) {
  return (
    <View style={styles.wrap}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: MUTED + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COFFEE,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COFFEE,
    textAlign: 'center',
    opacity: 0.7,
  },
});