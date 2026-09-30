import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, X, ChevronDown, SlidersHorizontal } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from '../../hooks/queries';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { useCart } from '../../context/CartContext';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, serif } from '../../theme/colors';
import { FILTER_TAGS, SORT_OPTIONS } from '../../types/filters';
import type { Product } from '../../types';
import type { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SearchMain'>;

interface FilterState {
  cats: string[];
  minP: string;
  maxP: string;
  cond: number;
}

/**
 * Defensive fallback for client-side category matching. Backend `/api/products
 * ?category=<name>` is the source of truth — this helper only kicks in when
 * the API returned a wider set (e.g. stale cache) and we still want the UI
 * to look consistent.
 *
 * It compares the chip (Vietnamese) against the backend `categoryId.name` by
 * normalising diacritics + casing and falling back to a small Vietnamese↔
 * English alias map for the common fashion categories. Add entries to
 * CATEGORY_ALIASES if a backend category keeps slipping through.
 */
const CATEGORY_ALIASES: Record<string, string[]> = {
  Áo: ['top', 'tops', 'shirt', 'shirts', 'tee', 'tshirt', 't-shirt'],
  Quần: ['bottom', 'bottoms', 'pants', 'trousers', 'jeans'],
  Váy: ['skirt', 'skirts', 'dress', 'dresses'],
  'Áo khoác': ['jacket', 'jackets', 'coat', 'outerwear'],
  'Phụ kiện': ['accessory', 'accessories'],
  Giày: ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots'],
  Túi: ['bag', 'bags', 'handbag'],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchCategory(backendName: string, chip: string): boolean {
  if (!backendName || !chip) return false;
  const a = normalize(backendName);
  const b = normalize(chip);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aliases = CATEGORY_ALIASES[chip] ?? [];
  return aliases.some((alias) => a.includes(alias) || alias.includes(a));
}

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  // Backend `/api/products` accepts a `category` query param that matches by
  // Vietnamese name or slug. We forward the currently-selected chip here so
  // a category tap actually narrows the list — the previous client-side
  // `p.category.includes(tag)` was brittle because backend `categoryId.name`
  // doesn't always line up byte-for-byte with the chip label.
  const [activeTag, setActiveTag] = useState('Tất cả');
  const apiCategory = activeTag === 'Tất cả' ? undefined : activeTag;
  const { data: products, loading, refresh } = useProducts(
    apiCategory ? { category: apiCategory } : undefined,
  );
  const { addItem } = useCart();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Mới nhất');
  const [filters, setFilters] = useState<FilterState>({
    cats: [],
    minP: '',
    maxP: '',
    cond: 50,
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.toLowerCase();
    return products.filter((p) => {
      if (
        q &&
        !(
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      // Category is now filtered server-side, but we still keep a defensive
      // client-side check in case the backend returns a wider set (e.g.
      // stale cache). Match either the Vietnamese chip label or a
      // case-insensitive substring of the categoryId name.
      if (
        filters.cats.length > 0 &&
        !filters.cats.some((c) => matchCategory(p.category, c))
      ) {
        return false;
      }
      if (p.condition < filters.cond) return false;
      const minP = filters.minP ? parseInt(filters.minP.replace(/\D/g, ''), 10) : 0;
      const maxP = filters.maxP ? parseInt(filters.maxP.replace(/\D/g, ''), 10) : Infinity;
      if (p.price < minP || p.price > maxP) return false;
      return true;
    });
  }, [products, query, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'Giá tăng dần':
        return list.sort((a, b) => a.price - b.price);
      case 'Giá giảm dần':
        return list.sort((a, b) => b.price - a.price);
      case 'Độ mới cao nhất':
        return list.sort((a, b) => b.condition - a.condition);
      case 'Nổi bật nhất':
        return list.sort((a, b) => (likedIds.has(b.id) ? 1 : 0) - (likedIds.has(a.id) ? 1 : 0));
      default:
        return list;
    }
  }, [filtered, sort, likedIds]);

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
      <View style={styles.searchBar}>
        <SearchIcon size={18} color={COFFEE} />
        <TextInput
          style={styles.input}
          placeholder="Tìm sản phẩm..."
          placeholderTextColor={MUTED}
          value={query}
          onChangeText={setQuery}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <X size={16} color={COFFEE} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {FILTER_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.chip, activeTag === tag && styles.chipActive]}
            onPress={() => setActiveTag(tag)}
          >
            <Text style={[styles.chipText, activeTag === tag && styles.chipTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <View>
          <Text style={styles.resultTitle}>
            {query ? (
              <>
                Kết quả cho <Text style={{ color: T }}>"{query}"</Text>
              </>
            ) : (
              'Tất cả sản phẩm'
            )}
          </Text>
          <Text style={styles.resultSubtitle}>{sorted.length} sản phẩm</Text>
        </View>
        <View style={styles.sortRight}>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setFilterSheetOpen((v) => !v)}
          >
            <SlidersHorizontal size={14} color={COFFEE} />
            <Text style={styles.sortBtnText}>Lọc</Text>
          </TouchableOpacity>
          <View style={styles.sortSelect}>
            <TouchableOpacity
              onPress={() => {
                const i = SORT_OPTIONS.indexOf(sort);
                const next = SORT_OPTIONS[(i + 1) % SORT_OPTIONS.length];
                setSort(next);
              }}
              style={styles.sortSelectInner}
            >
              <Text style={styles.sortBtnText}>{sort}</Text>
              <ChevronDown size={12} color={COFFEE} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {filterSheetOpen ? (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Khoảng giá (₫)</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              placeholder="Từ"
              placeholderTextColor={MUTED}
              value={filters.minP}
              onChangeText={(v) => setFilters((f) => ({ ...f, minP: v }))}
              keyboardType="numeric"
            />
            <Text style={{ color: COFFEE }}>—</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Đến"
              placeholderTextColor={MUTED}
              value={filters.maxP}
              onChangeText={(v) => setFilters((f) => ({ ...f, maxP: v }))}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.filterLabel}>Độ mới tối thiểu: {filters.cond}%</Text>
          <View style={styles.condRow}>
            {[50, 70, 80, 90].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.condPill, filters.cond === c && styles.condPillActive]}
                onPress={() => setFilters((f) => ({ ...f, cond: c }))}
              >
                <Text style={[styles.condPillText, filters.cond === c && styles.condPillTextActive]}>
                  {c}%+
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() =>
              setFilters({ cats: [], minP: '', maxP: '', cond: 50 })
            }
          >
            <Text style={styles.clearBtnText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(i) => String(i)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={() => <ProductCardSkeleton />}
        />
      ) : sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm nào</Text>
          <Text style={styles.emptySubtitle}>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={T} />}
          renderItem={({ item }) => (
            <ProductCard
              product={{ ...item, liked: likedIds.has(item.id) }}
              onLike={toggleLike}
              onPress={() => handleProductPress(item)}
              onAddToCart={onAddToCart}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LINEN,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  input: {
    flex: 1,
    color: ESPRESSO,
    fontSize: 14,
    padding: 0,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  chipActive: {
    backgroundColor: T,
    borderColor: T,
  },
  chipText: {
    color: ESPRESSO,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: MUTED,
  },
  sortBtnText: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '600',
  },
  sortSelect: {
    borderWidth: 1.2,
    borderColor: MUTED,
    borderRadius: 10,
  },
  sortSelectInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resultTitle: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 16,
  },
  resultSubtitle: {
    color: COFFEE,
    fontSize: 12,
    marginTop: 2,
  },
  filterPanel: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  filterLabel: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: LINEN,
    borderWidth: 1.2,
    borderColor: MUTED,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: ESPRESSO,
  },
  condRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  condPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MUTED,
  },
  condPillActive: {
    backgroundColor: T,
    borderColor: T,
  },
  condPillText: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
  },
  condPillTextActive: {
    color: '#fff',
  },
  clearBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearBtnText: {
    color: T,
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: ESPRESSO,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COFFEE,
    fontSize: 13,
    textAlign: 'center',
  },
});