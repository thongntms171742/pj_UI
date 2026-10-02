import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Shield,
  Package,
  TrendingUp,
  Calendar,
} from 'lucide-react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useSeller,
  useShopProducts,
  useShopReviews,
  type ShopReview,
} from '../../hooks/queries';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { LetterAvatar } from '../../components/LetterAvatar';
import { PlaceholderImage } from '../../components/PlaceholderImage';
import { useCart } from '../../context/CartContext';
import {
  T,
  ESPRESSO,
  COFFEE,
  LINEN,
  MUTED,
  CARD,
  SOFT,
  serif,
  SUCCESS,
} from '../../theme/colors';
import type { Product } from '../../types';
import type { HomeStackParamList } from '../../navigation/types';

type Route = RouteProp<HomeStackParamList, 'Shop'>;
type Nav = NativeStackNavigationProp<HomeStackParamList, 'Shop'>;

type TabKey = 'products' | 'reviews' | 'about';

// ── Hero gradient strip (no extra deps) ──
function HeroCover({
  thumbs,
  fallbackLabel,
}: {
  thumbs: string[];
  fallbackLabel: string;
}) {
  if (thumbs.length === 0) {
    return (
      <View style={styles.heroPlaceholder}>
        <PlaceholderImage width="100%" height={220} label={fallbackLabel} />
      </View>
    );
  }
  // Show the first cover image full-width. (FE shows 3 covers in a row;
  // on mobile the 2:1 hero strip is the dominant visual so we keep just
  // the first one to avoid clutter on small screens.)
  return (
    <View style={styles.heroWrap}>
      <Image source={{ uri: thumbs[0] }} style={styles.heroImg} resizeMode="cover" />
      <View style={styles.heroOverlay} />
    </View>
  );
}

// ── Single review card ──
function ReviewCard({ review }: { review: ShopReview }) {
  const name = review.buyerName ?? 'Người mua ẩn danh';
  const product = review.productName ?? '';
  const date = useMemo(() => {
    try {
      return new Date(review.createdAt).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  }, [review.createdAt]);
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <LetterAvatar name={name} size={36} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.reviewName}>{name}</Text>
          <View style={styles.reviewStars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={12}
                color="#FFB800"
                fill={i <= review.rating ? '#FFB800' : 'transparent'}
              />
            ))}
            <Text style={styles.reviewRating}>{review.rating.toFixed(1)}</Text>
            {date ? <Text style={styles.reviewDate}> · {date}</Text> : null}
          </View>
        </View>
      </View>
      {product ? (
        <Text style={styles.reviewProduct} numberOfLines={1}>
          Sản phẩm: {product}
        </Text>
      ) : null}
      {review.comment ? (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

// ── Stat cell ──
function StatCell({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.statCell}>
      {icon ? <View style={styles.statIcon}>{icon}</View> : null}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── About row ──
function AboutRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.aboutRow}>
      <View style={styles.aboutIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.aboutLabel}>{label}</Text>
        <Text style={styles.aboutValue}>{value}</Text>
      </View>
    </View>
  );
}

export function ShopScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { handle } = route.params;
  const { data: seller, loading, error } = useSeller(handle);
  const { data: products, loading: productsLoading } = useShopProducts(handle);
  const { data: reviews } = useShopReviews(handle);
  const { addItem } = useCart();
  const [tab, setTab] = useState<TabKey>('products');
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const toggleLike = useCallback((id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleProductPress = useCallback(
    (p: Product) => {
      if (!p.apiId) return;
      navigation.navigate('ProductDetail', { productId: p.apiId });
    },
    [navigation],
  );

  const onAddToCart = useCallback(
    (p: Product) => {
      if (!p.apiId) return;
      addItem({
        apiId: p.apiId,
        name: p.name,
        price: p.price,
        seller: p.seller,
        size: p.size,
        image: p.image,
        condition: p.condition,
        quantity: p.quantity,
        id: p.id,
      });
      Alert.alert('Đã thêm vào giỏ', p.name);
    },
    [addItem],
  );

  // Aggregated review stats — must be declared before any early return so
  // the hook order stays stable across renders (loading → loaded). When
  // `seller` is still null/undefined we fall back to safe defaults.
  const reviewAvg = useMemo(() => {
    if (!reviews || reviews.length === 0) return seller?.rating ?? 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews, seller?.rating]);

  const reviewBuckets = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // 1⭐, 2⭐, 3⭐, 4⭐, 5⭐
    if (!reviews) return buckets;
    for (const r of reviews) {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      buckets[idx] += 1;
    }
    return buckets;
  }, [reviews]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={T} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !seller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={ESPRESSO} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <EmptyState
            title="Không tìm thấy shop"
            subtitle="Shop này có thể đã bị đóng hoặc không tồn tại."
          />
        </View>
      </SafeAreaView>
    );
  }

  const responseRateText =
    typeof seller.responseRate === 'number'
      ? `${seller.responseRate}%`
      : '—';
  const followersText =
    typeof seller.followers === 'number'
      ? seller.followers >= 1000
        ? `${(seller.followers / 1000).toFixed(1)}k`
        : String(seller.followers)
      : '—';
  const joinedYear = seller.joinedAt
    ? new Date(seller.joinedAt).getFullYear()
    : null;

  const tabProducts = tab === 'products';
  const tabReviews = tab === 'reviews';
  const tabAbout = tab === 'about';

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeft size={22} color={ESPRESSO} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, serif]} numberOfLines={1}>
          {seller.name}
        </Text>
        <TouchableOpacity onPress={() => setLiked((v) => !v)} hitSlop={8}>
          <Heart size={20} color={liked ? T : COFFEE} fill={liked ? T : 'transparent'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <HeroCover thumbs={seller.thumbs} fallbackLabel={seller.name} />

        {/* Identity block */}
        <View style={styles.identity}>
          <View style={styles.avatarWrap}>
            {seller.avatar ? (
              <Image source={{ uri: seller.avatar }} style={styles.avatar} />
            ) : (
              <LetterAvatar name={seller.name} size={72} />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.shopName, serif]} numberOfLines={1}>
              {seller.name}
            </Text>
            <Text style={styles.shopHandle}>@{seller.handle}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.ratingText}>
                {reviewAvg.toFixed(1)}
              </Text>
              <Text style={styles.ratingCount}>
                ({reviews?.length ?? 0} đánh giá)
              </Text>
              <View style={styles.dot} />
              <Text style={styles.ratingText}>
                {seller.transactions} giao dịch
              </Text>
            </View>
          </View>
        </View>

        {/* Description blurb */}
        {seller.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {seller.description}
          </Text>
        ) : null}

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.followBtn,
              following && styles.followBtnActive,
            ]}
            onPress={() => setFollowing((v) => !v)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.followBtnText,
                following && styles.followBtnTextActive,
              ]}
            >
              {following ? '✓ Đang theo dõi' : '+ Theo dõi'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => Alert.alert('Chat', 'Tính năng chat đang phát triển.')}
            activeOpacity={0.85}
          >
            <MessageCircle size={14} color={ESPRESSO} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Chia sẻ', `https://thrift-it.shop/@${seller.handle}`)}
            activeOpacity={0.85}
          >
            <Share2 size={16} color={COFFEE} />
          </TouchableOpacity>
        </View>

        {/* Stat strip */}
        <View style={styles.statRow}>
          <StatCell
            value={seller.transactions.toString()}
            label="Giao dịch"
            icon={<Package size={16} color={T} />}
          />
          <View style={styles.statDivider} />
          <StatCell
            value={`${seller.rating.toFixed(1)}⭐`}
            label="Đánh giá"
            icon={<Star size={16} color={T} />}
          />
          <View style={styles.statDivider} />
          <StatCell
            value={responseRateText}
            label="Phản hồi"
            icon={<TrendingUp size={16} color={T} />}
          />
          <View style={styles.statDivider} />
          <StatCell
            value={followersText}
            label="Theo dõi"
            icon={<Heart size={16} color={T} />}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {(
            [
              { key: 'products', label: `Sản phẩm (${products?.length ?? 0})` },
              { key: 'reviews', label: `Đánh giá (${reviews?.length ?? 0})` },
              { key: 'about', label: 'Giới thiệu' },
            ] as { key: TabKey; label: string }[]
          ).map((t) => {
            const active = (t.key === 'products' && tabProducts) ||
              (t.key === 'reviews' && tabReviews) ||
              (t.key === 'about' && tabAbout);
            return (
              <TouchableOpacity
                key={t.key}
                style={styles.tabBtn}
                onPress={() => setTab(t.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {t.label}
                </Text>
                <View
                  style={[
                    styles.tabIndicator,
                    active && styles.tabIndicatorActive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab content */}
        {tabProducts ? (
          <View style={styles.tabContent}>
            {productsLoading ? (
              <View style={styles.productsGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.gridCell}>
                    <ProductCardSkeleton />
                  </View>
                ))}
              </View>
            ) : !products || products.length === 0 ? (
              <EmptyState
                title="Shop chưa có sản phẩm"
                subtitle="Hãy quay lại sau nhé."
              />
            ) : (
              <View style={styles.productsGrid}>
                {products.map((p) => (
                  <View key={p.id} style={styles.gridCell}>
                    <ProductCard
                      product={{ ...p, liked: likedIds.has(p.id) }}
                      onPress={() => handleProductPress(p)}
                      onLike={toggleLike}
                      onAddToCart={onAddToCart}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {tabReviews ? (
          <View style={styles.tabContent}>
            {reviews && reviews.length > 0 ? (
              <>
                <View style={styles.reviewSummary}>
                  <View style={styles.reviewSummaryLeft}>
                    <Text style={[styles.reviewAvg, serif]}>
                      {reviewAvg.toFixed(1)}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          color="#FFB800"
                          fill={i <= Math.round(reviewAvg) ? '#FFB800' : 'transparent'}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewCount}>{reviews.length} đánh giá</Text>
                  </View>
                  <View style={styles.reviewBuckets}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewBuckets[stars - 1];
                      const pct = reviews.length
                        ? (count / reviews.length) * 100
                        : 0;
                      return (
                        <View key={stars} style={styles.reviewBucketRow}>
                          <Text style={styles.reviewBucketLabel}>{stars}⭐</Text>
                          <View style={styles.reviewBucketTrack}>
                            <View
                              style={[
                                styles.reviewBucketFill,
                                { width: `${pct}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.reviewBucketCount}>{count}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                <FlatList
                  data={reviews}
                  keyExtractor={(r) => r._id}
                  scrollEnabled={false}
                  renderItem={({ item }) => <ReviewCard review={item} />}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
              </>
            ) : (
              <EmptyState
                title="Chưa có đánh giá"
                subtitle="Hãy là người đầu tiên đánh giá shop này nhé."
              />
            )}
          </View>
        ) : null}

        {tabAbout ? (
          <View style={styles.tabContent}>
            {seller.description ? (
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutTitle, serif]}>Về shop</Text>
                <Text style={styles.aboutBody}>{seller.description}</Text>
              </View>
            ) : (
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutTitle, serif]}>Về shop</Text>
                <Text style={styles.aboutBody}>
                  {seller.name} là một shop đồ second-hand uy tín trên thrift it!.
                </Text>
              </View>
            )}
            <View style={[styles.aboutSection, { borderBottomWidth: 0 }]}>
              <Text style={[styles.aboutTitle, serif]}>Thông tin</Text>
              <AboutRow
                icon={<Calendar size={16} color={T} />}
                label="Năm tham gia"
                value={joinedYear ? String(joinedYear) : '—'}
              />
              <AboutRow
                icon={<Package size={16} color={T} />}
                label="Tổng giao dịch"
                value={`${seller.transactions} đơn`}
              />
              <AboutRow
                icon={<TrendingUp size={16} color={T} />}
                label="Tỉ lệ phản hồi"
                value={responseRateText}
              />
              <AboutRow
                icon={<Star size={16} color={T} />}
                label="Đánh giá trung bình"
                value={`${seller.rating.toFixed(1)}⭐ (${reviews?.length ?? 0})`}
              />
              <AboutRow
                icon={<Shield size={16} color={SUCCESS} />}
                label="Trạng thái"
                value="Đã xác minh"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
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
  heroPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: CARD,
  },
  heroWrap: {
    width: '100%',
    height: 220,
    backgroundColor: CARD,
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    // Slight dim toward the bottom so the identity block on top of the
    // gradient reads cleanly.
    backgroundColor: 'transparent',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: LINEN,
    backgroundColor: CARD,
    marginTop: -36,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  shopName: {
    color: ESPRESSO,
    fontSize: 20,
    fontWeight: '700',
  },
  shopHandle: {
    color: COFFEE,
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  ratingText: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '700',
  },
  ratingCount: {
    color: COFFEE,
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: MUTED,
    marginHorizontal: 4,
  },
  description: {
    color: COFFEE,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  followBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: T,
    alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: T,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  followBtnTextActive: {
    color: T,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: MUTED,
  },
  chatBtnText: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '700',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 14,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    marginBottom: 2,
  },
  statValue: {
    color: ESPRESSO,
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: COFFEE,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: MUTED,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: MUTED,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    color: COFFEE,
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: ESPRESSO,
  },
  tabIndicator: {
    width: 24,
    height: 2,
    backgroundColor: 'transparent',
    marginTop: 6,
    borderRadius: 1,
  },
  tabIndicatorActive: {
    backgroundColor: T,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridCell: {
    width: '50%',
    padding: 4,
  },
  reviewSummary: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
    marginBottom: 12,
  },
  reviewSummaryLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: MUTED,
  },
  reviewAvg: {
    color: ESPRESSO,
    fontSize: 28,
    fontWeight: '700',
  },
  reviewCount: {
    color: COFFEE,
    fontSize: 11,
    marginTop: 2,
  },
  reviewBuckets: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  reviewBucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewBucketLabel: {
    color: COFFEE,
    fontSize: 10,
    width: 18,
  },
  reviewBucketTrack: {
    flex: 1,
    height: 6,
    backgroundColor: SOFT,
    borderRadius: 3,
    overflow: 'hidden',
  },
  reviewBucketFill: {
    height: '100%',
    backgroundColor: '#FFB800',
  },
  reviewBucketCount: {
    color: COFFEE,
    fontSize: 10,
    width: 18,
    textAlign: 'right',
  },
  reviewCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewName: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 13,
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 3,
  },
  reviewRating: {
    color: ESPRESSO,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewDate: {
    color: COFFEE,
    fontSize: 11,
  },
  reviewProduct: {
    color: COFFEE,
    fontSize: 11,
    marginTop: 8,
  },
  reviewComment: {
    color: ESPRESSO,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  aboutSection: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
    padding: 14,
    marginBottom: 12,
  },
  aboutTitle: {
    color: ESPRESSO,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  aboutBody: {
    color: COFFEE,
    fontSize: 13,
    lineHeight: 19,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: MUTED,
    marginTop: 4,
  },
  aboutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutLabel: {
    color: COFFEE,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  aboutValue: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});