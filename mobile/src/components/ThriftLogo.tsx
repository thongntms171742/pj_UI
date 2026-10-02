import React from 'react';
import { Image, Text, View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { ESPRESSO, serif } from '../theme/colors';

// Brand asset — bundled with the app (no network dependency).
// Resolved by Metro at build time from mobile/assets/thrift-logo.png
// (the canonical "Thriftit" logo: circular mark + "thrift it!" wordmark,
// stored as a square 800x800 PNG so the same file works for the in-app
// mark, the iOS/Android launcher icon, and the web favicon).
//
// Path notes: ThriftLogo.tsx lives at `mobile/src/components/`; `../..`
// resolves to `mobile/` where the project root and `assets/` directory
// live. Using `../../../assets/...` (one too many `..`) resolves above
// the project root and Metro reports "Unable to resolve".
const LOGO_SOURCE = require('../../assets/thrift-logo.png');

interface Props {
  size?: number;
  withText?: boolean;
  style?: ViewStyle;
  textColor?: string;
}

/**
 * ThriftLogo — uses the local brand asset bundled at
 * mobile/assets/thrift-logo.png. The source canvas is square (800x800) with
 * the circular mark on the left and the "thrift it!" wordmark on the right,
 * so we render it inside a square frame (size x size) with `contain` so the
 * full logo is always visible regardless of how the surrounding layout
 * sizes it. Loading from a local file avoids any remote-URL dependency that
 * could fall back to a plain letter when offline.
 *
 * When `withText` is true we omit the built-in wordmark and instead append a
 * styled "thrift it!" text next to the image so callers control colour/size;
 * this keeps brand presentation consistent with the web pattern.
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
          source={LOGO_SOURCE}
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