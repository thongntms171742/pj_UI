import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SOFT, MUTED } from '../theme/colors';

interface Props {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 6, backgroundColor: SOFT, opacity },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height="100%" style={{ width: '100%', aspectRatio: 0.78, borderRadius: 0 }} />
      <View style={{ padding: 10 }}>
        <Skeleton width="80%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MUTED,
  },
});