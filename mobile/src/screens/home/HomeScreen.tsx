import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, ChevronRight, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts, useSellers } from '../../hooks/queries';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, serif } from '../../theme/colors';
import type { Product, Seller } from '../../types';
import { FILTER_TAGS } from '../../types/filters';
import type { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const CATEGORIES = ['Tất cả', 'Áo', 'Quần', 'Váy', 'Áo khoác', 'Phụ kiện', 'Giày', 'Túi'];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { addItem } = useCart();
  const { session } = useAuth();
  const { data: products, loading, refresh } = useProducts({ status: 'active' });
  const { data: sellers } = useSellers();
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const toggleLike = useCallback((id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
    },
    [addItem],
  );

  const handleProductPress = useCallback(
    (p: Product) => {
      if (!p.apiId) return;
      navigation.navigate('ProductDetail', { productId: p.apiId });
    },
    [navigation],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={T} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SearchMain')}
        >
          <SearchIcon size={18} color={COFFEE} />
          <Text style={styles.searchPlaceholder}>Tìm sản phẩm vintage...</Text>
        </TouchableOpacity>

        {/* Hero banner */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=400&fit=crop&auto=format',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={[styles.heroEyebrow, { color: T }]}>✦ Bộ sưu tập mới tuần này</Text>
            <Text style={[styles.heroTitle, serif]}>
              Mặc vintage,{'\n'}sống có tâm 🌿
            </Text>
            <Text style={styles.heroSubtitle}>
              Mua và bán đồ cũ — góp phần giảm thiểu rác thải thời trang
            </Text>
            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => navigation.navigate('SearchMain')}
            >
              <Text style={styles.heroCtaText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.chip}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('SearchMain')}
            >
              <Text style={styles.chipText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, serif]}>Sản phẩm mới</Text>
              <Text style={styles.sectionSubtitle}>
                {products?.length ?? 0} sản phẩm vừa được đăng
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('SearchMain')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </View>
          ) : !products || products.length === 0 ? (
            <View style={styles.emptyBox}>
              <Sparkles size={28} color={MUTED} />
              <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.slice(0, 8).map((p) => (
                <ProductCard
                  key={p.id}
                  product={{ ...p, liked: likedIds.has(p.id) }}
                  onPress={() => handleProductPress(p)}
                  onLike={toggleLike}
                  onAddToCart={onAddToCart}
                />
              ))}
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, serif]}>Khám phá theo danh mục</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.catPill}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('SearchMain')}
              >
                <Text style={styles.catPillText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trusted sellers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, serif]}>Shop uy tín</Text>
              <Text style={styles.sectionSubtitle}>
                Được đánh giá cao từ cộng đồng thrift it!
              </Text>
            </View>
          </View>
          {sellers && sellers.length > 0 ? (
            <FlatList
              horizontal
              data={sellers.slice(0, 6)}
              keyExtractor={(s) => String(s.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => <SellerCardMini seller={item} />}
            />
          ) : null}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SellerCardMini({ seller }: { seller: Seller }) {
  return (
    <View style={styles.sellerCard}>
      <View style={styles.sellerAvatar}>
        {seller.avatar ? (
          <Image source={{ uri: seller.avatar }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text style={{ color: LINEN, fontWeight: '700', fontSize: 18 }}>
            {seller.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text numberOfLines={1} style={styles.sellerName}>
        {seller.name}
      </Text>
      <Text style={styles.sellerMeta}>⭐ {seller.rating.toFixed(1)} · {seller.transactions} GD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LINEN,
  },
  scroll: {
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  searchPlaceholder: {
    color: COFFEE,
    fontSize: 14,
  },
  hero: {
    height: 220,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(58,35,18,0.55)',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: LINEN,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#E8D5BC',
    fontSize: 12,
    marginBottom: 12,
  },
  heroCta: {
    backgroundColor: T,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 13,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: MUTED,
    marginRight: 8,
  },
  chipText: {
    color: ESPRESSO,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: ESPRESSO,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: COFFEE,
    fontSize: 12,
    marginTop: 2,
  },
  seeAll: {
    color: T,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  emptyText: {
    color: COFFEE,
    marginTop: 8,
    fontSize: 13,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: MUTED,
  },
  catPillText: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '600',
  },
  sellerCard: {
    width: 140,
    padding: 12,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
    marginRight: 10,
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COFFEE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  sellerName: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  sellerMeta: {
    color: COFFEE,
    fontSize: 11,
  },
});