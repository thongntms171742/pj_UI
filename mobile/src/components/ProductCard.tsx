import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Heart, ShoppingBag } from 'lucide-react-native';
import { ESPRESSO, COFFEE, CARD, MUTED, T, LINEN, serif, success } from '../theme/colors';
import { fmt } from '../utils/format';
import type { Product } from '../types';

interface Props {
  product: Product;
  onLike?: (id: number) => void;
  onPress?: () => void;
  onAddToCart?: (product: Product) => void;
  compact?: boolean;
}

export function ProductCard({ product, onLike, onPress, onAddToCart, compact }: Props) {
  const condColor =
    product.condition >= 90 ? success : product.condition >= 75 ? T : '#E67E22';
  const isSold = product.status === 'sold';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {isSold && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>ĐÃ BÁN</Text>
          </View>
        )}
        {onLike && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onLike(product.id);
            }}
            style={styles.heartBtn}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Heart
              size={16}
              color={product.liked ? T : COFFEE}
              fill={product.liked ? T : 'transparent'}
            />
          </TouchableOpacity>
        )}
        {onAddToCart && !isSold && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            style={styles.cartBtn}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <ShoppingBag size={14} color={LINEN} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.price}>{fmt(product.price)}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: condColor }]}>✓ {product.condition}% Mới</Text>
        </View>
        <Text numberOfLines={1} style={styles.seller}>
          {product.sellerName ? `Shop: ${product.sellerName}` : `@${product.seller}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MUTED,
    flex: 1,
    margin: 4,
  },
  cardCompact: {
    margin: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrap: {
    position: 'relative',
    aspectRatio: 0.78,
    width: '100%',
    backgroundColor: MUTED,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 6,
    transform: [{ rotate: '12deg' }],
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,248,240,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: ESPRESSO,
    marginBottom: 4,
    lineHeight: 17,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: T,
    ...serif,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
  },
  seller: {
    fontSize: 11,
    color: COFFEE,
    marginTop: 2,
  },
});