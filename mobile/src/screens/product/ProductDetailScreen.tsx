import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, Star, Plus, Minus, Shield, RotateCcw, PackageCheck } from 'lucide-react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProduct } from '../../hooks/queries';
import { sellerApi } from '../../api/endpoints';
import { QuantityStepper } from '../../components/QuantityStepper';
import { EmptyState } from '../../components/EmptyState';
import { PlaceholderImage } from '../../components/PlaceholderImage';
import { LetterAvatar } from '../../components/LetterAvatar';
import { useCart } from '../../context/CartContext';
import { adaptSeller } from '../../adapters';
import {
  T,
  ESPRESSO,
  COFFEE,
  LINEN,
  MUTED,
  CARD,
  SOFT,
  serif,
  success,
} from '../../theme/colors';
import { fmt } from '../../utils/format';
import type { Seller } from '../../types';
import type { HomeStackParamList, RootTabParamList } from '../../navigation/types';

type Route = RouteProp<HomeStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<HomeStackParamList>;

export function ProductDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { productId } = route.params;
  const { data: product, loading, error } = useProduct(productId);
  const { addItem } = useCart();
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [sellerInfo, setSeller] = useState<Seller | null>(null);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) setLiked(product.liked);
  }, [product]);

  // Load seller profile
  useEffect(() => {
    if (!product?.seller) return;
    sellerApi
      .byHandle(product.seller)
      .then((res) => setSeller(adaptSeller(res.seller)))
      .catch(() => setSeller(null));
  }, [product?.seller]);

  const onAdd = useCallback(() => {
    if (!product || !product.apiId) return;
    addItem({
      apiId: product.apiId,
      name: product.name,
      price: product.price,
      seller: product.seller,
      size: product.size,
      image: product.image,
      condition: product.condition,
      quantity: product.quantity,
      id: product.id,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [product, addItem]);

  const onBuyNow = useCallback(() => {
    if (!product || !product.apiId) return;
    addItem({
      apiId: product.apiId,
      name: product.name,
      price: product.price,
      seller: product.seller,
      size: product.size,
      image: product.image,
      condition: product.condition,
      quantity: product.quantity,
      id: product.id,
    });
    // Jump straight to Cart tab → Checkout
    navigation
      .getParent<NativeStackNavigationProp<RootTabParamList>>()
      ?.navigate('CartTab', { screen: 'CartMain' } as never);
  }, [product, addItem, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={T} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <EmptyState title="Không tìm thấy sản phẩm" subtitle="Sản phẩm này có thể đã được gỡ bỏ." />
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.goBack()}>
            <Text style={styles.btnPrimaryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isSold = product.status === 'sold';
  const condLabel =
    product.condition >= 95
      ? 'Như mới'
      : product.condition >= 85
      ? 'Rất tốt'
      : product.condition >= 70
      ? 'Tốt'
      : product.condition >= 55
      ? 'Khá'
      : 'Đã qua sử dụng';
  const condColor = product.condition >= 90 ? success : product.condition >= 75 ? T : '#E67E22';

  // BE 2026-10-03: only use the product image. If it's empty, the carousel
  // is just one slot — never fabricate thumbnail images from a third party.
  // (FE removed the Unsplash placeholder list and replaced it with
  // <PlaceholderImage/>; on mobile we mirror by hiding the carousel
  // entirely when no image is present.)
  const hasImage = Boolean(product.image);
  const images = hasImage ? [product.image as string] : [];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <ChevronLeft size={22} color={ESPRESSO} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, serif]} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity onPress={() => setLiked((v) => !v)}>
          <Heart size={22} color={liked ? T : COFFEE} fill={liked ? T : 'transparent'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Image carousel — BE 2026-10-03: no third-party fallbacks. If the
            product has no image, render a single PlaceholderImage in the
            hero and skip the thumbnail strip entirely. */}
        <View style={styles.imageWrap}>
          {hasImage ? (
            <Image
              source={{ uri: images[selectedImg] }}
              style={styles.heroImg}
              resizeMode="cover"
            />
          ) : (
            <PlaceholderImage
              width="100%"
              height="100%"
              label="Chưa có ảnh"
            />
          )}
          {isSold ? (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldText}>ĐÃ BÁN</Text>
            </View>
          ) : null}
        </View>
        {images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
          >
            {images.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedImg(i)}
                style={[
                  styles.thumb,
                  selectedImg === i && { borderColor: T },
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{product.category || 'Sản phẩm'}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: T + '22' }]}>
              <Text style={[styles.chipText, { color: T }]}>Size {product.size}</Text>
            </View>
          </View>
          <Text style={[styles.title, serif]}>{product.name}</Text>
          <Text style={[styles.price, serif]}>{fmt(product.price)}</Text>

          <View style={styles.condRow}>
            <View style={[styles.condBadge, { backgroundColor: success }]}>
              <Text style={styles.condBadgeText}>{product.condition}/100</Text>
            </View>
            <Text style={[styles.condLabel, { color: condColor }]}>✓ {condLabel}</Text>
            <Text style={styles.stockText}>
              {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
            </Text>
          </View>
        </View>

        {/* Seller */}
        {sellerInfo ? (
          // 2026-10-03: tap the seller card to open the public Shop
          // profile (BE /api/sellers/:handle). The chevron makes the
          // tappable affordance obvious on small screens.
          <TouchableOpacity
            style={styles.sellerCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Shop', { handle: sellerInfo.handle })
            }
          >
            <Text style={[styles.sectionLabel, { color: MUTED }]}>NGƯỜI BÁN</Text>
            <View style={styles.sellerRow}>
              {sellerInfo.avatar ? (
                <Image
                  source={{ uri: sellerInfo.avatar }}
                  style={styles.sellerAvatarImg}
                />
              ) : (
                // BE 2026-10-03: deterministic letter avatar instead of an
                // empty circle with a tiny initial.
                <LetterAvatar name={sellerInfo.name} size={50} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{sellerInfo.name}</Text>
                <Text style={styles.sellerHandle}>@{sellerInfo.handle}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Star size={12} color={T} fill={T} />
                  <Text style={styles.sellerRating}>
                    {sellerInfo.rating.toFixed(1)} · {sellerInfo.transactions} giao dịch
                  </Text>
                </View>
              </View>
              <ChevronLeft
                size={18}
                color={COFFEE}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Trust badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Shield size={22} color={T} />
            <Text style={styles.trustText}>Bảo vệ người mua</Text>
          </View>
          <View style={styles.trustItem}>
            <RotateCcw size={22} color={T} />
            <Text style={styles.trustText}>Đổi trả 7 ngày</Text>
          </View>
          <View style={styles.trustItem}>
            <PackageCheck size={22} color={T} />
            <Text style={styles.trustText}>Kiểm tra khi nhận</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom action bar */}
      {!isSold && product.quantity > 0 ? (
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={() => setLiked((v) => !v)} style={styles.likeBtn}>
            <Heart size={20} color={liked ? T : COFFEE} fill={liked ? T : 'transparent'} />
          </TouchableOpacity>
          <QuantityStepper
            value={qty}
            min={1}
            max={product.quantity}
            onChange={setQty}
            size="sm"
          />
          <TouchableOpacity
            onPress={onAdd}
            style={[styles.addBtn, added && { backgroundColor: '#E9F7EF', borderColor: success }]}
          >
            <Text style={[styles.addBtnText, added && { color: success }]}>
              {added ? '✓ Đã thêm' : 'Thêm vào giỏ'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBuyNow} style={styles.buyBtn}>
            <Text style={styles.buyBtnText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LINEN,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: LINEN,
  },
  topTitle: {
    flex: 1,
    color: ESPRESSO,
    fontSize: 16,
    fontWeight: '700',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: CARD,
  },
  heroImg: {
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
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    transform: [{ rotate: '12deg' }],
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: SOFT,
  },
  chipText: {
    color: COFFEE,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: ESPRESSO,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  price: {
    color: T,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
  },
  condRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  condBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  condBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  condLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockText: {
    color: COFFEE,
    fontSize: 12,
  },
  sellerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COFFEE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sellerAvatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COFFEE,
  },
  sellerName: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 14,
  },
  sellerHandle: {
    color: COFFEE,
    fontSize: 12,
    marginTop: 2,
  },
  sellerRating: {
    color: T,
    fontSize: 11,
    fontWeight: '600',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: SOFT,
    borderRadius: 14,
  },
  trustItem: {
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    color: COFFEE,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 16,
    backgroundColor: LINEN,
    borderTopWidth: 1,
    borderTopColor: MUTED,
  },
  likeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: T,
  },
  addBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: MUTED,
    alignItems: 'center',
  },
  addBtnText: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 13,
  },
  buyBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: T,
    alignItems: 'center',
  },
  buyBtnText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 13,
  },
  btnPrimary: {
    backgroundColor: T,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  btnPrimaryText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 14,
  },
});