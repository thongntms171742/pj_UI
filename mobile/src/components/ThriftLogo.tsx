import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { T, ESPRESSO, COFFEE, serif } from '../theme/colors';

interface Props {
  size?: number;
  withText?: boolean;
  style?: ViewStyle;
  textColor?: string;
}

/**
 * ThriftLogo — recreated as a stylised SVG-free wordmark using View shapes.
 * The web app uses a full SVG logo; on mobile we keep it simple (avoid bundling
 * the SVG and let the brand feel carry through the typography + colors).
 */
export function ThriftLogo({ size = 36, withText = false, style, textColor = ESPRESSO }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: T,
            borderColor: ESPRESSO,
            borderWidth: size * 0.06,
          },
        ]}
      >
        <View
          style={[
            styles.innerDot,
            {
              width: size * 0.32,
              height: size * 0.32,
              borderRadius: size * 0.16,
              backgroundColor: ESPRESSO,
            },
          ]}
        />
      </View>
      {withText ? (
        <Text style={[styles.text, { color: textColor, fontSize: size * 0.55 }, serif]}>
          thrift it!
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {},
  text: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
});