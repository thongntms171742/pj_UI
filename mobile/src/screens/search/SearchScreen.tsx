import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search as SearchIcon,
  X,
  ChevronDown,
  SlidersHorizontal,
  Star,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from '../../hooks/queries';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { useCart } from '../../context/CartContext';
import { aiApi } from '../../api/endpoints';
import { adaptProduct } from '../../adapters';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, serif } from '../../theme/colors';
import { SORT_OPTIONS } from '../../types/filters';
import type { Product } from '../../types';
import type { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SearchMain'>;

interface FilterState {
  cats: string[];
  minP: string;
  maxP: string;
  sizes: string[];
  cond: number;
  rating: number | undefined;
  ai: boolean;
}

// Mirror of FE categories. The backend `/api/products?category=<name>` is
// the source of truth — these labels are also the names used by the seller
// when adding products, so they line up with backend `categoryId.name`.
const FILTER_CATEGORIES = ['Áo', 'Quần', 'Váy', 'Áo khoác', 'Phụ kiện', 'Giày', 'Túi'] as const;
const FILTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

interface PricePreset {
  label: string;
  min: string;
  max: string;
}
const PRICE_PRESETS: PricePreset[] = [
  { label: '< 100k', min: '', max: '100000' },
  { label: '100-300k', min: '100000', max: '300000' },
  { label: '300-500k', min: '300000', max: '500000' },
  { label: '> 500k', min: '500000', max: '' },
];

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
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Mới nhất');
  const [filters, setFilters] = useState<FilterState>({
    cats: [],
    minP: '',
    maxP: '',
    sizes: [],
    cond: 50,
    rating: undefined,
    ai: false,
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  // Local pending edits inside the filter modal — only commit to `filters`
  // when the user hits "Áp dụng" so closing the sheet doesn't lose work.
  const [draft, setDraft] = useState<FilterState>(filters);
  useEffect(() => {
    setDraft(filters);
  }, [filters, filterSheetOpen]);

  // ── Data sources ──
  // Backend category filter — only the first category is forwarded because
  // the current BE endpoint accepts a single `category` query param. The
  // remaining categories still apply client-side via `matchCategory`.
  const apiCategory = filters.cats[0];
  const { data: baseProducts, loading, refresh } = useProducts(
    apiCategory ? { category: apiCategory } : undefined,
  );

  // AI Smart Search (BE 2026-10-03) — mirrors frontend SearchScreen:
  // when `filters.ai` is on and there's a query, debounce 600ms then call
  // `POST /api/ai/search`. Falls back to the regular list if AI returns no
  // products. Always run on a single token so toggling `ai` cancels stale
  // results.
  const [aiProducts, setAiProducts] = useState<Product[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiTokenRef = useRef(0);
  useEffect(() => {
    if (!filters.ai || !query.trim()) {
      setAiProducts(null);
      return;
    }
    const myToken = ++aiTokenRef.current;
    setAiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await aiApi.search(query);
        if (myToken !== aiTokenRef.current) return;
        if (Array.isArray(res.products) && res.products.length > 0) {
          setAiProducts(res.products.map((p) => adaptProduct(p, new Set())));
        } else {
          setAiProducts(null);
        }
      } catch {
        if (myToken === aiTokenRef.current) setAiProducts(null);
      } finally {
        if (myToken === aiTokenRef.current) setAiLoading(false);
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      aiTokenRef.current += 1; // invalidate any pending fetch
    };
  }, [filters.ai, query]);
  // If AI is on and returned results, prefer them; otherwise use the
  // regular backend list.
  const products =
    filters.ai && aiProducts && aiProducts.length > 0 ? aiProducts : baseProducts;
  const { addItem } = useCart();

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.toLowerCase();
    return products.filter((p) => {
      // When AI search returned results, skip the textual match and trust
      // the server's semantic ranking — matches FE behavior.
      const skipTextMatch = filters.ai && aiProducts && aiProducts.length > 0;
      if (
        !skipTextMatch &&
        q &&
        !(
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      // Category — server-side already narrowed by the first category, but
      // we apply any extra selected categories client-side via the alias
      // matcher so multi-select still works.
      if (
        filters.cats.length > 0 &&
        !filters.cats.some((c) => matchCategory(p.category, c))
      ) {
        return false;
      }
      // Size multi-select
      if (filters.sizes.length > 0 && !filters.sizes.includes(p.size)) {
        return false;
      }
      if (p.condition < filters.cond) return false;
      const minP = filters.minP ? parseInt(filters.minP.replace(/\D/g, ''), 10) : 0;
      const maxP = filters.maxP ? parseInt(filters.maxP.replace(/\D/g, ''), 10) : Infinity;
      if (p.price < minP || p.price > maxP) return false;
      // Shop rating — backend products don't carry a seller rating field
      // today, so this filter currently has no effect; we keep the option
      // for parity with FE and forward-compat.
      if (filters.rating) {
        const r = (p as Product & { sellerRating?: number }).sellerRating ?? 5;
        if (r < filters.rating) return false;
      }
      return true;
    });
  }, [products, query, filters, aiProducts]);

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

      {/* Active filter chips — 2026-10-03: surface the user's current
          filters as removable chips so they can see (and quickly undo)
          any narrowing without re-opening the modal. */}
      <FilterChips
        filters={filters}
        onRemove={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onClearAll={() =>
          setFilters({
            cats: [],
            minP: '',
            maxP: '',
            sizes: [],
            cond: 50,
            rating: undefined,
            ai: false,
          })
        }
      />

      {/* AI Smart Search banner */}
      {filters.ai ? (
        <View style={styles.aiBanner}>
          <Sparkles size={14} color={T} />
          <Text style={styles.aiBannerText}>
            {aiLoading
              ? 'AI đang tìm sản phẩm phù hợp…'
              : aiProducts && aiProducts.length > 0
              ? `✨ ${aiProducts.length} kết quả từ AI Smart Search`
              : 'AI Smart Search đang bật — gõ mô tả tự nhiên (VD: "áo dạ retro mùa thu")'}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(i) => String(i)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={() => (
            <View style={styles.gridCell}>
              <ProductCardSkeleton />
            </View>
          )}
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
            // 2026-10-03: fixed-width cell so an odd item count (e.g. 3
            // products) never makes the trailing card stretch to full row
            // width. Mirrors the fix applied to HomeScreen.
            <View style={styles.gridCell}>
              <ProductCard
                product={{ ...item, liked: likedIds.has(item.id) }}
                onLike={toggleLike}
                onPress={() => handleProductPress(item)}
                onAddToCart={onAddToCart}
              />
            </View>
          )}
        />
      )}
      <FilterModal
        visible={filterSheetOpen}
        draft={draft}
        setDraft={setDraft}
        onClose={() => setFilterSheetOpen(false)}
        onApply={() => {
          setFilters(draft);
          setFilterSheetOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

// ── Active filter chips ──────────────────────────────────────────────────
function FilterChips({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: FilterState;
  onRemove: (patch: Partial<FilterState>) => void;
  onClearAll: () => void;
}) {
  const chips: { key: keyof FilterState; label: string }[] = [];
  for (const c of filters.cats) chips.push({ key: 'cats', label: c });
  for (const s of filters.sizes) chips.push({ key: 'sizes', label: s });
  if (filters.minP || filters.maxP) {
    const min = filters.minP ? Number(filters.minP).toLocaleString('vi-VN') : '0';
    const max = filters.maxP ? Number(filters.maxP).toLocaleString('vi-VN') + '₫' : '∞';
    chips.push({ key: 'minP', label: `Giá: ${min}₫ — ${max}` });
  }
  if (filters.cond > 50) chips.push({ key: 'cond', label: `Độ mới ≥ ${filters.cond}%` });
  if (filters.rating) chips.push({ key: 'rating', label: `Shop ${filters.rating}⭐ trở lên` });
  if (filters.ai) chips.push({ key: 'ai', label: 'AI Smart Search' });
  if (chips.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {chips.map((chip, i) => (
        <TouchableOpacity
          key={`${chip.key}-${chip.label}-${i}`}
          style={styles.activeChip}
          onPress={() => {
            // Remove just this one entry from its array, or reset to
            // default for non-array keys.
            if (chip.key === 'cats') {
              onRemove({ cats: filters.cats.filter((c) => c !== chip.label) });
            } else if (chip.key === 'sizes') {
              onRemove({ sizes: filters.sizes.filter((s) => s !== chip.label) });
            } else if (chip.key === 'minP') {
              onRemove({ minP: '', maxP: '' });
            } else if (chip.key === 'cond') {
              onRemove({ cond: 50 });
            } else if (chip.key === 'rating') {
              onRemove({ rating: undefined });
            } else if (chip.key === 'ai') {
              onRemove({ ai: false });
            }
          }}
        >
          <Text style={styles.activeChipText}>{chip.label}</Text>
          <X size={12} color={T} />
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.clearAllChip} onPress={onClearAll}>
        <Text style={styles.clearAllChipText}>Xóa hết</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Filter Modal (BE 2026-10-03) ──────────────────────────────────────────
// Full-screen modal that mirrors FE FilterSidebar: category multi-select,
// price inputs with presets + Apply, size multi-select, rating stars,
// condition slider, and AI Smart Search toggle. Edits live in `draft`
// until "Áp dụng" is pressed so closing the sheet without applying
// doesn't lose work.
function FilterModal({
  visible,
  draft,
  setDraft,
  onClose,
  onApply,
}: {
  visible: boolean;
  draft: FilterState;
  setDraft: (f: FilterState) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const setDraftField = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => setDraft({ ...draft, [key]: value });
  const toggleInArray = (key: 'cats' | 'sizes', value: string) => {
    const arr = draft[key];
    setDraft({
      ...draft,
      [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
    });
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, serif]}>Bộ lọc nâng cao</Text>
            <TouchableOpacity
              onPress={() =>
                setDraft({
                  cats: [],
                  minP: '',
                  maxP: '',
                  sizes: [],
                  cond: 50,
                  rating: undefined,
                  ai: false,
                })
              }
            >
              <Text style={styles.modalClear}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ maxHeight: 480 }}
            showsVerticalScrollIndicator={false}
          >
            <ModalSection label="Danh mục">
              <View style={styles.tagWrap}>
                {FILTER_CATEGORIES.map((c) => {
                  const active = draft.cats.includes(c);
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.tag, active && styles.tagActive]}
                      onPress={() => toggleInArray('cats', c)}
                    >
                      <Text style={[styles.tagText, active && styles.tagTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ModalSection>

            <ModalSection label="Khoảng giá (₫)">
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Từ"
                  placeholderTextColor={MUTED}
                  value={draft.minP}
                  onChangeText={(v) => setDraftField('minP', v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                />
                <Text style={{ color: COFFEE }}>—</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Đến"
                  placeholderTextColor={MUTED}
                  value={draft.maxP}
                  onChangeText={(v) => setDraftField('maxP', v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.presetRow}>
                {PRICE_PRESETS.map((p) => {
                  const active = draft.minP === p.min && draft.maxP === p.max;
                  return (
                    <TouchableOpacity
                      key={p.label}
                      style={[styles.preset, active && styles.presetActive]}
                      onPress={() =>
                        setDraft({ ...draft, minP: p.min, maxP: p.max })
                      }
                    >
                      <Text style={[styles.presetText, active && styles.presetTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ModalSection>

            <ModalSection label="Kích cỡ">
              <View style={styles.tagWrap}>
                {FILTER_SIZES.map((s) => {
                  const active = draft.sizes.includes(s);
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sizeTag, active && styles.sizeTagActive]}
                      onPress={() => toggleInArray('sizes', s)}
                    >
                      <Text style={[styles.sizeTagText, active && styles.sizeTagTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ModalSection>

            <ModalSection label="Đánh giá shop">
              <View style={styles.ratingRow}>
                {([5, 4, 3, 2, 1] as const).map((stars) => {
                  const active = draft.rating === stars;
                  return (
                    <TouchableOpacity
                      key={stars}
                      style={[styles.ratingBtn, active && styles.ratingBtnActive]}
                      onPress={() =>
                        setDraftField('rating', active ? undefined : stars)
                      }
                    >
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            color="#FFB800"
                            fill={i <= stars ? '#FFB800' : 'transparent'}
                          />
                        ))}
                      </View>
                      <Text
                        style={[styles.ratingLabel, active && styles.ratingLabelActive]}
                      >
                        {stars === 5 ? '5⭐' : `${stars}⭐ trở lên`}
                      </Text>
                      {active ? <Check size={14} color={T} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ModalSection>

            <ModalSection label={`Độ mới tối thiểu: ${draft.cond}%`}>
              <View style={styles.sliderRow}>
                {[50, 60, 70, 80, 90, 95].map((c) => {
                  const active = draft.cond === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.condPill, active && styles.condPillActive]}
                      onPress={() => setDraftField('cond', c)}
                    >
                      <Text
                        style={[
                          styles.condPillText,
                          active && styles.condPillTextActive,
                        ]}
                      >
                        {c}%+
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ModalSection>

            <ModalSection label="Gợi ý từ AI">
              <View style={styles.aiToggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiToggleTitle}>✨ AI Smart Search</Text>
                  <Text style={styles.aiToggleSub}>
                    Gõ mô tả tự nhiên, AI sẽ tìm sản phẩm phù hợp.
                  </Text>
                </View>
                <Switch
                  value={draft.ai}
                  onValueChange={(v) => setDraftField('ai', v)}
                  trackColor={{ false: MUTED, true: T }}
                  thumbColor="#fff"
                />
              </View>
            </ModalSection>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalApplyBtn} onPress={onApply}>
              <Text style={styles.modalApplyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ModalSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.modalSection}>
      <Text style={styles.modalSectionLabel}>{label}</Text>
      {children}
    </View>
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
    backgroundColor: LINEN,
    color: ESPRESSO,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    height: 36,
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
  gridCell: {
    // Fixed-width column so an odd product count (3 products) leaves the
    // trailing card at the same size as the others instead of stretching
    // to fill the row. Mirrors the HomeScreen `gridCell` fix.
    width: '50%',
    padding: 4,
  },
  // ── Filter chips row (active filters) ──
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    alignItems: 'center',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: T + '15',
    borderWidth: 1,
    borderColor: T + '55',
  },
  activeChipText: {
    color: T,
    fontSize: 12,
    fontWeight: '700',
  },
  clearAllChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: MUTED,
  },
  clearAllChipText: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
  },
  // ── AI banner ──
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: T + '12',
    borderWidth: 1,
    borderColor: T + '33',
  },
  aiBannerText: {
    color: ESPRESSO,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  // ── Filter modal (shared) ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: LINEN,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: MUTED,
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: ESPRESSO,
    fontSize: 17,
    fontWeight: '700',
  },
  modalClear: {
    color: T,
    fontSize: 12,
    fontWeight: '700',
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionLabel: {
    color: COFFEE,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: MUTED,
    backgroundColor: CARD,
  },
  tagActive: {
    backgroundColor: T,
    borderColor: T,
  },
  tagText: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextActive: {
    color: '#fff',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  priceInput: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1.2,
    borderColor: MUTED,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: ESPRESSO,
    fontSize: 13,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  preset: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MUTED,
  },
  presetActive: {
    borderColor: T,
    backgroundColor: T,
  },
  presetText: {
    color: COFFEE,
    fontSize: 11,
    fontWeight: '700',
  },
  presetTextActive: {
    color: '#fff',
  },
  sizeTag: {
    width: 48,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: MUTED,
    alignItems: 'center',
    backgroundColor: CARD,
  },
  sizeTagActive: {
    borderColor: T,
    backgroundColor: T,
  },
  sizeTagText: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
  },
  sizeTagTextActive: {
    color: '#fff',
  },
  ratingRow: {
    gap: 6,
  },
  ratingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: MUTED,
    backgroundColor: CARD,
  },
  ratingBtnActive: {
    borderColor: '#FFB800',
    backgroundColor: '#FFB80022',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingLabel: {
    flex: 1,
    color: COFFEE,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingLabelActive: {
    color: ESPRESSO,
    fontWeight: '700',
  },
  sliderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  condPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MUTED,
    backgroundColor: CARD,
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
  aiToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MUTED,
  },
  aiToggleTitle: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '700',
  },
  aiToggleSub: {
    color: COFFEE,
    fontSize: 11,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: MUTED,
    alignItems: 'center',
    backgroundColor: CARD,
  },
  modalCancelBtnText: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '700',
  },
  modalApplyBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: T,
    alignItems: 'center',
  },
  modalApplyBtnText: {
    color: '#fff',
    fontSize: 13,
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