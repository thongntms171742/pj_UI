import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Star,
  LogOut,
  Package,
  Clock,
  Truck,
  X,
  ShoppingBag,
  MessageCircle,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/queries';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { orderApi } from '../../api/endpoints';
import { getOrderTabStatus } from '../../adapters';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, SOFT, serif, success } from '../../theme/colors';
import { fmt } from '../../utils/format';
import { reviewedStore } from '../../state/reviewedStore';
import type { Order } from '../../types';
import type { AccountStackParamList } from '../../navigation/types';

const ORDER_TABS = [
  { id: 'pending' as const, label: 'Chờ thanh toán', icon: Clock, color: '#E8A838' },
  { id: 'shipping' as const, label: 'Chờ xử lý', icon: Package, color: T },
  { id: 'delivering' as const, label: 'Đang vận chuyển', icon: Truck, color: '#2980B9' },
  { id: 'review' as const, label: 'Đánh giá', icon: Star, color: success },
  { id: 'cancelled' as const, label: 'Đã hủy', icon: X, color: '#E74C3C' },
];

export function AccountScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const { session, logout, showToast } = useAuth();
  const { data: orders, loading, refresh } = useOrders();
  const [orderTab, setOrderTab] = useState<typeof ORDER_TABS[number]['id']>('shipping');
  const [logoutOpen, setLogoutOpen] = useState(false);
  /**
   * Mirror the shared reviewedStore version so this screen re-renders when
   * ReviewScreen reports a new submission (via the onReviewed callback or
   * via direct write from OrderDetailScreen's flow). The actual set lives
   * in `state/reviewedStore` so OrderDetailScreen can also read/write it.
   * See that module for the in-session lifecycle limitations.
   */
  const [reviewedVersion, setReviewedVersion] = useState(0);

  const openLogout = () => setLogoutOpen(true);
  const cancelLogout = () => setLogoutOpen(false);
  const confirmLogout = () => {
    setLogoutOpen(false);
    // Fire-and-forget — AuthContext.logout clears session synchronously
    // before any storage I/O, so the navigation to AuthNavigator happens
    // even if AsyncStorage cleanup partially fails.
    Promise.resolve()
      .then(() => logout())
      .then(() => showToast('✓ Đã đăng xuất'))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Lỗi đăng xuất';
        showToast(`⚠️ ${msg}`);
      });
  };

  const counts = useMemo(() => {
    const c = { pending: 0, shipping: 0, delivering: 0, review: 0, cancelled: 0 };
    (orders ?? []).forEach((o) => {
      // Once the buyer has reviewed locally, COMPLETED orders no longer
      // count toward the "Đánh giá" tab — they would otherwise keep the
      // badge inflated and cause the list to stay "empty after review".
      if (isReviewed(o)) return;
      const t = getOrderTabStatus(o.status);
      c[t] = (c[t] ?? 0) + 1;
    });
    return c;
    // reviewedVersion ensures this recomputes when reviewedStore mutates
    // (e.g. after a review submitted from another stack).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, reviewedVersion]);

  const filtered = useMemo(
    () =>
      (orders ?? []).filter(
        (o) => !isReviewed(o) && getOrderTabStatus(o.status) === orderTab,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, orderTab, reviewedVersion],
  );

  // On initial load (when orders first arrive), if the currently selected tab
  // is empty but other tabs have orders, jump to the first non-empty tab so
  // the user always sees their orders (e.g. tab default = 'shipping' but
  // user has only COMPLETED orders → fall through to 'review').
  //
  // We deliberately do NOT auto-snap on subsequent updates: if the user is
  // on the "Đánh giá" tab and they finish reviewing their last order, the
  // list becomes empty and we should let them see the empty state — not
  // yank them back to another tab. The "user touched the tab" flag below
  // implements that.
  const [userTouchedTab, setUserTouchedTab] = useState(false);
  useEffect(() => {
    if (!orders) return;
    if (userTouchedTab) return;
    const orderedTabs: typeof ORDER_TABS[number]['id'][] = [
      'review',
      'delivering',
      'shipping',
      'pending',
      'cancelled',
    ];
    if (counts[orderTab] > 0) return;
    const next = orderedTabs.find((t) => counts[t] > 0);
    if (next) setOrderTab(next);
  }, [orders, counts, orderTab, userTouchedTab]);

  // Re-fetch orders whenever the screen regains focus so that state changes
  // made on OrderDetail/Review (status updates, reviews) are reflected here
  // without requiring a full pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // Subscribe to the shared reviewedStore so this screen re-renders when
  // ReviewScreen writes a new key — even if the write came from a sibling
  // stack (e.g. OrderDetailScreen in CartStack).
  useEffect(() => reviewedStore.subscribe(() => setReviewedVersion((v) => v + 1)), []);

  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const openCancel = (orderId: string) => setCancelOrderId(orderId);
  const cancelCancel = () => setCancelOrderId(null);
  const confirmCancel = async () => {
    const orderId = cancelOrderId;
    setCancelOrderId(null);
    if (!orderId) return;
    try {
      // Buyer only requests cancel; final CANCELLED is set by seller.
      await orderApi.updateStatus(
        orderId,
        'CANCEL_REQUESTED',
        'Yêu cầu hủy từ buyer',
      );
      showToast('✓ Đã gửi yêu cầu hủy đến seller');
      refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Thao tác thất bại';
      showToast(`⚠️ ${msg}`);
    }
  };

  if (!session) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={T} />}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            {session.avatarUrl ? (
              <Image source={{ uri: session.avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={styles.avatarText}>
                {session.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, serif]}>{session.name}</Text>
            <Text style={styles.email}>{session.email}</Text>
          </View>
          <TouchableOpacity onPress={openLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogOut size={16} color="#E74C3C" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickLink} activeOpacity={0.85}>
            <ShoppingBag size={20} color={T} />
            <Text style={styles.quickLinkText}>Đơn mua</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} activeOpacity={0.85}>
            <MessageCircle size={20} color={T} />
            <Text style={styles.quickLinkText}>Tin nhắn</Text>
          </TouchableOpacity>
        </View>

        {/* Order tabs */}
        <Text style={[styles.sectionTitle, serif]}>Đơn mua của tôi</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {ORDER_TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.tabPill,
                orderTab === t.id && {
                  backgroundColor: t.color + '22',
                  borderColor: t.color,
                },
              ]}
              onPress={() => {
                setUserTouchedTab(true);
                setOrderTab(t.id);
              }}
            >
              <t.icon size={18} color={orderTab === t.id ? t.color : COFFEE} />
              <Text
                style={[
                  styles.tabLabel,
                  orderTab === t.id && { color: t.color },
                ]}
              >
                {t.label}
              </Text>
              {counts[t.id] > 0 ? (
                <View style={[styles.tabCount, { backgroundColor: t.color }]}>
                  <Text style={styles.tabCountText}>{counts[t.id]}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Orders list */}
        {loading ? (
          <ActivityIndicator color={T} style={{ marginTop: 32 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Package size={48} color={MUTED} />
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptySubtitle}>
              Bạn chưa có đơn hàng nào trong trạng thái này.
            </Text>
          </View>
        ) : (
          filtered.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              onCancel={() => openCancel(o.id)}
              onConfirmReceived={async () => {
                try {
                  await orderApi.updateStatus(o.id, 'COMPLETED');
                  showToast('✓ Đã xác nhận nhận hàng');
                  refresh();
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Thao tác thất bại';
                  showToast(`⚠️ ${msg}`);
                }
              }}
              onReview={(item) => {
                const productId = item.apiId ?? item.productApiId;
                if (!productId) {
                  showToast('Không tìm thấy productId');
                  return;
                }
                navigation.navigate('Review', {
                  orderId: o.apiId ?? o.id,
                  productId,
                  productName: item.name,
                });
              }}
              onPress={() =>
                navigation.navigate('OrderDetail', { orderId: o.id })
              }
            />
          ))
        )}
      </ScrollView>
      <ConfirmDialog
        visible={logoutOpen}
        title="Đăng xuất"
        message="Bạn có chắc muốn đăng xuất khỏi thrift it!?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        destructive
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
      <ConfirmDialog
        visible={cancelOrderId !== null}
        title="Yêu cầu hủy đơn"
        message={
          cancelOrderId
            ? `Gửi yêu cầu hủy đơn #${cancelOrderId} đến seller?\n\nĐơn chỉ được hủy khi seller đồng ý.`
            : undefined
        }
        confirmText="Gửi yêu cầu"
        cancelText="Không"
        destructive
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />
    </SafeAreaView>
  );
}

function OrderRow({
  order,
  onCancel,
  onConfirmReceived,
  onReview,
  onPress,
}: {
  order: Order;
  onCancel: () => void;
  onConfirmReceived?: () => void;
  onReview?: (item: Order['items'][number]) => void;
  onPress: () => void;
}) {
  // Use the same helper as the parent so the row button and the list filter
  // can never disagree about whether an item has been reviewed.
  const reviewed = isReviewed(order);
  const first = order.items[0];
  const showCancel = canBuyerCancel(order.status) && order.status !== 'CANCEL_REQUESTED';
  const showConfirm = canBuyerConfirmReceived(order.status);
  const showReview = canBuyerReview(order.status) && !!first && !reviewed;
  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderCode}>#{order.id}</Text>
        <Text style={styles.orderDate}>{order.createdAt}</Text>
      </View>
      <View style={styles.orderItem}>
        {first ? (
          <Image source={{ uri: first.image }} style={styles.orderImg} />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={styles.orderItemName}>
            {first?.name}
            {order.items.length > 1 ? ` (+${order.items.length - 1} sp)` : ''}
          </Text>
          <Text style={styles.orderItemMeta}>
            {first ? `Size ${first.size} · ×${first.qty}` : ''}
          </Text>
        </View>
        <Text style={[styles.orderTotal, serif]}>{fmt(order.total)}</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderStatus}>{statusLabel(order.status)}</Text>
        <View style={styles.actionRow}>
          {showReview ? (
            <TouchableOpacity
              style={styles.reviewRowBtn}
              onPress={(e) => {
                e.stopPropagation();
                if (first) onReview?.(first);
              }}
            >
              <Text style={styles.reviewRowBtnText}>⭐ Đánh giá</Text>
            </TouchableOpacity>
          ) : null}
          {showConfirm ? (
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={(e) => {
                e.stopPropagation();
                onConfirmReceived?.();
              }}
            >
              <Text style={styles.confirmBtnText}>Đã nhận hàng</Text>
            </TouchableOpacity>
          ) : null}
          {showCancel ? (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={(e) => {
                e.stopPropagation();
                onCancel();
              }}
            >
              <Text style={styles.cancelBtnText}>Yêu cầu hủy</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
            <Text style={styles.detailBtnText}>Chi tiết</Text>
            <ChevronRight size={14} color={T} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function statusLabel(status: string): string {
  const m: Record<string, string> = {
    PENDING_PAYMENT: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    CONFIRMED: 'Đã xác nhận',
    PACKING: 'Đang đóng gói',
    SHIPPING: 'Đang vận chuyển',
    DELIVERING: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn tất',
    CANCEL_REQUESTED: 'Chờ duyệt hủy',
    CANCELLED: 'Đã hủy',
    DISPUTED: 'Tranh chấp',
    REFUNDED: 'Hoàn tiền',
  };
  return m[status] ?? status;
}

/**
 * Buyer can request cancel as long as the seller hasn't shipped yet.
 * Mirrors canBuyerCancel in OrderDetailScreen so the row actions stay
 * consistent with what the detail screen shows.
 */
function canBuyerCancel(status: string): boolean {
  return ![
    'SHIPPING',
    'DELIVERING',
    'DELIVERED',
    'COMPLETED',
    'CANCEL_REQUESTED',
    'CANCELLED',
    'REFUNDED',
  ].includes(status);
}

/**
 * Buyer can confirm receipt while the order is being delivered / delivered.
 * Mirrors canBuyerConfirmReceived in OrderDetailScreen.
 */
function canBuyerConfirmReceived(status: string): boolean {
  return status === 'DELIVERING' || status === 'DELIVERED';
}

/**
 * Buyer can review an order once it's COMPLETED.
 * Mirrors canBuyerReview in OrderDetailScreen.
 */
function canBuyerReview(status: string): boolean {
  return status === 'COMPLETED';
}

/**
 * Whether the buyer has already reviewed the primary (first) item of this
 * order in the current session. Returns true only when the underlying order
 * is COMPLETED and the shared `reviewedStore` contains the matching key.
 *
 * The store is in-memory only — it resets when the app is killed. On a
 * fresh launch, the button may briefly reappear, but the API will then
 * reject duplicates with 409 REVIEW_ALREADY_EXISTS and ReviewScreen
 * surfaces that as a friendly toast.
 */
function isReviewed(order: Order): boolean {
  if (order.status !== 'COMPLETED') return false;
  const firstProductId = order.items[0]?.apiId ?? order.items[0]?.productApiId;
  if (!firstProductId) return false;
  const key = `${order.apiId ?? order.id}_${firstProductId}`;
  return reviewedStore.has(key);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LINEN,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: ESPRESSO,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COFFEE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: T,
    overflow: 'hidden',
  },
  avatarText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 24,
  },
  name: {
    color: LINEN,
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    color: MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  logoutText: {
    color: '#E74C3C',
    fontWeight: '700',
    fontSize: 12,
  },
  quickLinks: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  quickLink: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: MUTED,
  },
  quickLinkText: {
    color: COFFEE,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    color: ESPRESSO,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  tabRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: MUTED,
  },
  tabLabel: {
    color: COFFEE,
    fontWeight: '700',
    fontSize: 12,
  },
  tabCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 56,
    alignItems: 'center',
  },
  emptyTitle: {
    color: ESPRESSO,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: COFFEE,
    fontSize: 13,
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderCode: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 13,
  },
  orderDate: {
    color: COFFEE,
    fontSize: 11,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  orderItemName: {
    color: ESPRESSO,
    fontWeight: '600',
    fontSize: 13,
  },
  orderItemMeta: {
    color: COFFEE,
    fontSize: 11,
    marginTop: 2,
  },
  orderTotal: {
    color: T,
    fontWeight: '700',
    fontSize: 16,
  },
  orderFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: MUTED + '88',
  },
  orderStatus: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cancelBtnText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '700',
  },
  confirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: success,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewRowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8A838',
  },
  reviewRowBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: T + '15',
    borderRadius: 8,
  },
  detailBtnText: {
    color: T,
    fontWeight: '700',
    fontSize: 12,
  },
});