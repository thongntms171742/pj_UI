import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { ESPRESSO, T, LINEN } from '../theme/colors';

interface Props {
  message: string | null;
}

export function Toast({ message }: Props) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [message, translateY, opacity]);

  if (!message) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Sparkles size={16} color={T} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: ESPRESSO,
    borderWidth: 1.5,
    borderColor: T,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    elevation: 12,
  },
  text: {
    color: LINEN,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});