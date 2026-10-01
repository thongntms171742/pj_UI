import React from 'react';
import { Image, Text, View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { ESPRESSO, serif } from '../theme/colors';

interface Props {
  size?: number;
  withText?: boolean;
  style?: ViewStyle;
  textColor?: string;
}

/**
 * ThriftLogo — uses the same brand asset as the web app
 * (https://i.postimg.cc/44tgtTTG/thrift-logo.png) so the logo is identical
 * across web and mobile. When `withText` is true, the italic "thrift it!"
 * wordmark is rendered next to the logo to mirror the web pattern.
 */
export function ThriftLogo({ size = 36, withText = false, style, textColor = ESPRESSO }: Props) {
  const logoStyle: ImageStyle = {
    width: size,
    height: size,
    resizeMode: 'contain',
  };

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.logoWrap}>
        <Image
          source={{ uri: 'https://i.postimg.cc/44tgtTTG/thrift-logo.png' }}
          style={logoStyle}
          accessibilityLabel="thrift it! Logo"
        />
      </View>
      {withText ? (
        <Text style={[styles.text, { color: textColor, fontSize: size * 0.55, marginLeft: 8 }, serif]}>
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
  },
  logoWrap: {
    // explicit wrap so we can rely on flex layout without gap
  },
  text: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
});