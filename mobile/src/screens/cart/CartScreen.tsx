import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { BrandCheckbox } from '../../components/BrandCheckbox';
import { QuantityStepper } from '../../components/QuantityStepper';
import { EmptyCartState } from '../../components/EmptyCartState';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, SOFT, serif } from '../../theme/colors';
import { fmt } from '../../utils/format';
import type { CartStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<CartStackParamList, 'CartMain'>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const {
    cartGroups,
    loading,
    refresh,
    updateItem,
    removeItem,
    toggleAll,
    toggleGroup,
    clearChecked,
  } = useCart();

  const allItems = useMemo(() => cartGroups.flatMap((g) => g.items), [cartGroups]);
  const checkedItems = useMemo(
    () =>
      cartGroups
        .flatMap((g) => g.items.map((i) => ({ ...i, seller: g.seller })))
        .filter((i) => i.checked),
    [cartGroups],
  );
  const allChecked = allItems.length > 0 && allItems.every((i) => i.checked);

  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const checkedSellers = new Set(checkedItems.map((i) => i.seller)).size;
  const ship = checkedSellers * 30000;
  const total = subtotal + ship;

  const handleCheckout = () => {
    if (!session) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để đặt hàng.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Checkout') },
        ],
      );
      return;
    }
    if (checkedItems.length === 0) return;
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <ShoppingCart size={20} color={LINEN} />
        <Text style={[styles.headerTitle, serif]}>Giỏ hàng của tôi</Text>
        <Text style={styles.headerCount}>{allItems.length} sp</Text>
      </View>

      {allItems.length === 0 ? (
        <EmptyCartState
          title="Giỏ hàng trống"
          subtitle="Hãy thêm vài món vintage vào giỏ nhé!"
          ctaLabel="Tiếp tục mua sắm"
          onCtaPress={() => navigation.getParent()?.navigate('HomeTab' as never)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 200 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={T} />}
        >
          {/* Select-all bar */}
          <View style={styles.selectAllBar}>
            <BrandCheckbox checked={allChecked} onChange={toggleAll} />
            <Text style={styles.selectAllText}>Chọn tất cả ({allItems.length})</Text>
            {checkedItems.length > 0 ? (
              <TouchableOpacity
                style={styles.removeCheckedBtn}
                onPress={() => {
                  Alert.alert(
                    'Xóa sản phẩm đã chọn',
                    `Xóa ${checkedItems.length} sản phẩm đã chọn?`,
                    [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Xóa', style: 'destructive', onPress: clearChecked },
                    ],
                  );
                }}
              >
                <Trash2 size={12} color="#C0392B" />
                <Text style={styles.removeCheckedText}>Xóa ({checkedItems.length})</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {cartGroups.map((group) => {
            const groupChecked = group.items.every((i) => i.checked);
            return (
              <View key={group.seller} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <BrandCheckbox checked={groupChecked} onChange={(v) => toggleGroup(group.seller, v)} />
                  <View style={styles.sellerIcon}>
                    <Text style={styles.sellerIconText}>
                      {group.seller.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sellerName}>@{group.seller}</Text>
                    <Text style={styles.sellerBadge}>⭐ Shop uy tín</Text>
                  </View>
                  <Text style={styles.groupCount}>{group.items.length} món</Text>
                </View>

                {group.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <BrandCheckbox
                      checked={item.checked}
                      onChange={(v) => updateItem(group.seller, item.id, { checked: v })}
                    />
                    <View style={styles.itemImageWrap}>
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      <View style={styles.condDot}>
                        <Text style={styles.condDotText}>{item.condition}%</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={2} style={styles.itemName}>
                        {item.name}
                      </Text>
                      <View style={styles.itemTags}>
                        <View style={styles.itemTag}>
                          <Text style={styles.itemTagText}>Size {item.size}</Text>
                        </View>
                      </View>
                      <Text style={styles.itemPrice}>{fmt(item.price)}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <QuantityStepper
                        size="sm"
                        value={item.qty}
                        max={item.stock}
                        onChange={(next) => updateItem(group.seller, item.id, { qty: next })}
                      />
                      <TouchableOpacity
                        onPress={() => removeItem(group.seller, item.id)}
                        style={styles.removeBtn}
                      >
                        <Trash2 size={14} color="#C0392B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Sticky checkout bar */}
      {allItems.length > 0 ? (
        <View style={styles.checkoutBar}>
          <View>
            <Text style={styles.totalLabel}>Tổng ({checkedItems.length} sp)</Text>
            <Text style={[styles.totalValue, serif]}>{fmt(total)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutBtn, checkedItems.length === 0 && styles.checkoutBtnDisabled]}
            onPress={handleCheckout}
            disabled={checkedItems.length === 0}
          >
            <Text style={styles.checkoutBtnText}>
              {checkedItems.length === 0 ? 'Chọn sản phẩm' : 'Mua hàng'}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COFFEE,
  },
  headerTitle: {
    color: LINEN,
    fontSize: 17,
    fontWeight: '700',
    fontStyle: 'italic',
    flex: 1,
  },
  headerCount: {
    color: LINEN,
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  selectAllBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MUTED,
  },
  selectAllText: {
    flex: 1,
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 12,
  },
  removeCheckedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDEDEC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeCheckedText: {
    color: '#C0392B',
    fontSize: 11,
    fontWeight: '700',
  },
  groupCard: {
    backgroundColor: CARD,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: SOFT,
  },
  sellerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COFFEE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerIconText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 13,
  },
  sellerName: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 13,
  },
  sellerBadge: {
    color: T,
    fontSize: 10,
    marginTop: 2,
  },
  groupCount: {
    color: COFFEE,
    fontSize: 11,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: MUTED + '66',
  },
  itemImageWrap: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MUTED,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  condDot: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(58,35,18,0.85)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
  },
  condDotText: {
    color: LINEN,
    fontSize: 9,
    fontWeight: '700',
  },
  itemName: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
  },
  itemTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  itemTag: {
    backgroundColor: SOFT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MUTED,
  },
  itemTagText: {
    color: COFFEE,
    fontSize: 10,
    fontWeight: '600',
  },
  itemPrice: {
    color: T,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 6,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  removeBtn: {
    backgroundColor: '#FDEDEC',
    padding: 6,
    borderRadius: 8,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 16,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: MUTED,
    gap: 16,
  },
  totalLabel: {
    color: COFFEE,
    fontSize: 11,
    fontWeight: '600',
  },
  totalValue: {
    color: T,
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: T,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    backgroundColor: MUTED,
  },
  checkoutBtnText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 14,
  },
});