import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle, Truck, Package, X, ClipboardList } from 'lucide-react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { orderApi, paymentApi } from '../../api/endpoints';
import { adaptOrder, getOrderTabStatus } from '../../adapters';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, serif, success } from '../../theme/colors';
import { fmt } from '../../utils/format';
import { ApiError, type ApiOrderStatus } from '../../api/client';
import { reviewedStore } from '../../state/reviewedStore';
import type { Order, OrderStatus } from '../../types';
import type { CartStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { showToast } from '../../utils/toast';

type Route = RouteProp<CartStackParamList, 'OrderDetail'>;

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang vận chuyển',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  CANCEL_REQUESTED: 'Chờ seller duyệt hủy',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  DISPUTED: 'Tranh chấp',
  REFUNDED: 'Đã hoàn tiền',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: '#E8A838',
  PAID: T,
  CONFIRMED: T,
  PACKING: T,
  SHIPPING: '#2980B9',
  DELIVERING: '#2980B9',
  DELIVERED: success,
  CANCEL_REQUESTED: '#E8A838',
  COMPLETED: success,
  CANCELLED: '#E74C3C',
  DISPUTED: '#9B59B6',
  REFUNDED: COFFEE,
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  COD: 'Thanh toán khi nhận hàng (COD)',
  online: 'Thanh toán online',
  card: 'Thẻ tín dụng/Thẻ ghi nợ',
  bank: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
};

/**
 * Returns true only when the buyer has actually paid money.
 *
 * For COD orders: "paid" only after DELIVERED/COMPLETED — until then the
 * buyer must hand cash to the seller upon receipt.
 *
 * For online orders: paid when paidAt is set OR status reached the
 * post-payment states (PAID, CONFIRMED, PACKING, ...).
 */
function isPaid(order: Order): boolean {
  const method = (order.paymentMethod || '').toLowerCase();
  if (method === 'cod') {
    return ['DELIVERED', 'COMPLETED'].includes(order.status);
  }
  return (
    Boolean(order.paidAt) ||
    ['PAID', 'CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERING', 'DELIVERED', 'COMPLETED'].includes(
      order.status,
    )
  );
}

function paymentMethodLabel(method: string): string {
  if (!method) return 'Thanh toán khi nhận hàng (COD)';
  return PAYMENT_LABEL[method] || method.toUpperCase();
}

/**
 * Timeline steps with completion flags based on order state.
 * COD and online share the same timeline structure; only "Đã thanh toán"
 * step is gated by `isPaid`.
 */
type Step = {
  key: string;
  icon: 'create' | 'paid' | 'pack' | 'ship' | 'delivering' | 'done' | 'cancel';
  label: string;
  done: boolean;
};

function buildTimeline(order: Order): Step[] {
  const s = order.status;
  const paid = isPaid(order);
  const isCOD = (order.paymentMethod || '').toLowerCase() === 'cod';
  const steps: Step[] = [];

  // 1. Đơn hàng tạo
  steps.push({ key: 'create', icon: 'create', label: 'Đơn hàng tạo', done: true });

  // 2. Thanh toán (paid step)
  if (isCOD) {
    if (paid) {
      steps.push({ key: 'paid', icon: 'paid', label: 'Đã thanh toán (khi nhận hàng)', done: true });
    } else {
      steps.push({
        key: 'paid',
        icon: 'paid',
        label: 'Thanh toán khi nhận hàng (COD)',
        done: false,
      });
    }
  } else {
    if (paid) {
      steps.push({ key: 'paid', icon: 'paid', label: 'Đã thanh toán online', done: true });
    } else if (s === 'CANCELLED' || s === 'REFUNDED') {
      steps.push({ key: 'paid', icon: 'paid', label: 'Thanh toán', done: false });
    } else {
      steps.push({ key: 'paid', icon: 'paid', label: 'Chờ thanh toán', done: false });
    }
  }

  // 3. Xác nhận đơn
  steps.push({
    key: 'confirmed',
    icon: 'pack',
    label: 'Đơn hàng đã xác nhận',
    done: ['CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERING', 'DELIVERED', 'COMPLETED'].includes(s),
  });

  // 4. Đóng gói
  steps.push({
    key: 'packing',
    icon: 'pack',
    label: 'Shop đang chuẩn bị hàng',
    done: ['PACKING', 'SHIPPING', 'DELIVERING', 'DELIVERED', 'COMPLETED'].includes(s),
  });

  // 5. Vận chuyển
  steps.push({
    key: 'shipping',
    icon: 'ship',
    label: 'Đang vận chuyển',
    done: ['SHIPPING', 'DELIVERING', 'DELIVERED', 'COMPLETED'].includes(s),
  });

  // 6. Đang giao
  steps.push({
    key: 'delivering',
    icon: 'delivering',
    label: 'Đang giao đến bạn',
    done: ['DELIVERING', 'DELIVERED', 'COMPLETED'].includes(s),
  });

  // 7. Hoàn tất (giao + buyer xác nhận)
  if (s === 'COMPLETED') {
    steps.push({ key: 'completed', icon: 'done', label: 'Hoàn tất đơn hàng', done: true });
  } else if (s === 'CANCEL_REQUESTED') {
    steps.push({
      key: 'cancel-pending',
      icon: 'cancel',
      label: 'Chờ seller duyệt yêu cầu hủy',
      done: false,
    });
  } else if (s === 'CANCELLED') {
    steps.push({ key: 'cancel', icon: 'cancel', label: 'Đã hủy đơn', done: true });
  } else if (['DELIVERED'].includes(s)) {
    steps.push({
      key: 'delivered',
      icon: 'done',
      label: 'Đã giao hàng — chờ bạn xác nhận',
      done: true,
    });
  } else {
    steps.push({
      key: 'delivered',
      icon: 'done',
      label: 'Đã giao hàng',
      done: false,
    });
  }

  return steps;
}

export function OrderDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
  const { orderId } = route.params;
  const { session } = useAuth();

  // ─── ALL HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURN ───
  const [rawApiOrder, setRawApiOrder] = useState<
    Awaited<ReturnType<typeof orderApi.byCode>>['order'] | null
  >(null);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [payOpen, setPayOpen] = useState(false);
  const [cancelReqOpen, setCancelReqOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmActionOpen, setConfirmActionOpen] = useState<{
    title: string;
    message: string;
    next: string;
    label: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived (no hook)
  const order: Order | null = rawApiOrder ? adaptOrder(rawApiOrder) : null;

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderApi.byCode(orderId);
      setRawApiOrder(res.order);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Không tải được đơn hàng';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const updateStatus = async (next: string, reason?: string) => {
    if (!rawApiOrder) return;
    // Optimistic update: flip local state immediately so the UI reacts fast.
    // Then refetch the canonical order from the server to reconcile any
    // server-side recomputed fields (statusHistory, totals, stock restore…).
    setRawApiOrder({ ...rawApiOrder, status: next as ApiOrderStatus });
    try {
      const res = await orderApi.updateStatus(rawApiOrder.orderCode, next, reason);
      try {
        const refetch = await orderApi.byCode(rawApiOrder.orderCode);
        setRawApiOrder(refetch.order);
      } catch {
        setRawApiOrder(res.order);
      }
    } catch (e) {
      // Roll back optimistic update on failure.
      const msg = e instanceof ApiError ? e.message : 'Thao tác thất bại';
      setErrorMsg(msg);
      try {
        const refetch = await orderApi.byCode(rawApiOrder.orderCode);
        setRawApiOrder(refetch.order);
      } catch {
        /* swallow — original error already shown */
      }
    }
  };

  const handlePayment = async () => {
    if (!rawApiOrder?._id) return;
    try {
      await paymentApi.checkout({
        orderId: rawApiOrder._id,
        method: 'card',
        cardLast4: '0000',
      });
      await fetchOrder();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Thanh toán thất bại';
      setErrorMsg(msg);
    }
  };

  // Mirror of the in-session reviewedStore so the button hides once the
  // buyer submits a review and reappears on app restart. The store is
  // shared with AccountScreen so reviews done in either entry point are
  // reflected here.
  const [reviewedTick, setReviewedTick] = useState(0);
  useEffect(
    () => reviewedStore.subscribe(() => setReviewedTick((v) => v + 1)),
    [],
  );

  // ─── EARLY RETURNS (after all hooks) ───
  // Reference reviewedTick so eslint doesn't flag it as unused — the value
  // itself doesn't matter, calling setReviewedTick is what triggers a
  // re-render when the reviewedStore mutates.
  void reviewedTick;
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={T} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order || !rawApiOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const color = STATUS_COLOR[order.status] ?? T;
  const viewerId = session?.id;
  const isViewerBuyer = viewerId != null && rawApiOrder.buyerId === viewerId;
  const viewerSellerIds = new Set(rawApiOrder.items.map((it) => it.sellerId));
  const isViewerSeller = viewerId != null && viewerSellerIds.has(viewerId);

  const isCOD = (order.paymentMethod || '').toLowerCase() === 'cod';
  const paid = isPaid(order);
  const canBuyerCancel =
    isViewerBuyer &&
    !['SHIPPING', 'DELIVERING', 'DELIVERED', 'COMPLETED', 'CANCEL_REQUESTED', 'CANCELLED', 'REFUNDED'].includes(
      order.status,
    );
  const canBuyerConfirmReceived =
    isViewerBuyer && (order.status === 'DELIVERING' || order.status === 'DELIVERED');

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={20} color={LINEN} />
          <Text style={styles.backText}>Đơn hàng</Text>
        </TouchableOpacity>
        {isViewerSeller ? (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>SELLER VIEW</Text>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: color + '18', borderColor: color }]}>
          <CheckCircle size={20} color={color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color }]}>
              {STATUS_LABEL[order.status]}
            </Text>
            <Text style={styles.statusMeta}>
              Mã đơn: #{order.id} · {order.createdAt}
            </Text>
            {order.status === 'CANCEL_REQUESTED' && order.cancelReason ? (
              <Text style={styles.statusReason}>
                Lý do: {order.cancelReason}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ─── BUYER ACTION BUTTONS ─── */}
        {isViewerBuyer ? (
          <View style={styles.actionStack}>
            {/* Online pending payment */}
            {!isCOD && order.status === 'PENDING_PAYMENT' ? (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => setPayOpen(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>Thanh toán ngay</Text>
              </TouchableOpacity>
            ) : null}

            {/* Buyer requests cancel */}
            {canBuyerCancel ? (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCancelReqOpen(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>Yêu cầu hủy đơn</Text>
              </TouchableOpacity>
            ) : null}

            {/* Buyer confirms received */}
            {canBuyerConfirmReceived ? (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() =>
                  setConfirmActionOpen({
                    title: 'Xác nhận đã nhận hàng',
                    message:
                      'Sau khi xác nhận, đơn hàng sẽ hoàn tất và bạn có thể đánh giá sản phẩm.',
                    next: 'COMPLETED',
                    label: 'Xác nhận đã nhận',
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>Xác nhận đã nhận hàng</Text>
              </TouchableOpacity>
            ) : null}

            {/* Buyer reviews — one button per item */}
            {isViewerBuyer && order.status === 'COMPLETED' && order.items[0] ? (
              <>
                {order.items.map((it, idx) => {
                  const productId = it.apiId ?? it.productApiId;
                  const itemKey = productId ? `${order.apiId ?? order.id}_${productId}` : undefined;
                  if (!productId) return null;
                  const itemReviewed = !!itemKey && reviewedStore.has(itemKey);
                  if (itemReviewed) return null;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.reviewBtn}
                      onPress={() => {
                        if (!productId) {
                          showToast('Không tìm thấy productId');
                          return;
                        }
                        navigation.navigate('Review', {
                          orderId: order.apiId ?? order.id,
                          productId,
                          productName: it.name,
                        });
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.reviewBtnText}>
                        ⭐ Đánh giá: {it.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : null}

            {/* Buyer already requested cancel — show info */}
            {order.status === 'CANCEL_REQUESTED' ? (
              <View style={styles.infoBox}>
                <ClipboardList size={16} color="#E8A838" />
                <Text style={styles.infoBoxText}>
                  Đã gửi yêu cầu hủy. Vui lòng chờ seller duyệt.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ─── SELLER ACTION BUTTONS ─── */}
        {isViewerSeller ? (
          <View style={styles.actionStack}>
            {order.status === 'CONFIRMED' ? (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() =>
                  setConfirmActionOpen({
                    title: 'Bắt đầu đóng gói',
                    message: 'Xác nhận đã bắt đầu đóng gói đơn hàng?',
                    next: 'PACKING',
                    label: 'Bắt đầu đóng gói',
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>📦 Bắt đầu đóng gói</Text>
              </TouchableOpacity>
            ) : null}

            {order.status === 'PACKING' ? (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() =>
                  setConfirmActionOpen({
                    title: 'Sẵn sàng giao hàng',
                    message: 'Xác nhận đã bàn giao cho đơn vị vận chuyển?',
                    next: 'SHIPPING',
                    label: 'Xác nhận đã gửi',
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>🚚 Đã gửi hàng (SHIPPING)</Text>
              </TouchableOpacity>
            ) : null}

            {order.status === 'SHIPPING' ? (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() =>
                  setConfirmActionOpen({
                    title: 'Đang giao hàng',
                    message: 'Xác nhận đơn hàng đang được giao đến buyer?',
                    next: 'DELIVERING',
                    label: 'Đang giao',
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>🛵 Đang giao hàng</Text>
              </TouchableOpacity>
            ) : null}

            {order.status === 'DELIVERING' ? (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() =>
                  setConfirmActionOpen({
                    title: 'Đã giao hàng',
                    message: 'Xác nhận đã giao hàng thành công cho buyer?',
                    next: 'DELIVERED',
                    label: 'Đã giao xong',
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>✅ Đã giao hàng</Text>
              </TouchableOpacity>
            ) : null}

            {order.status === 'CANCEL_REQUESTED' ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.payBtn, { flex: 1 }]}
                  onPress={() =>
                    setConfirmActionOpen({
                      title: 'Duyệt hủy đơn',
                      message: `Xác nhận duyệt hủy đơn hàng này?${
                        order.cancelReason ? `\n\nLý do buyer: ${order.cancelReason}` : ''
                      }`,
                      next: 'CANCELLED',
                      label: 'Duyệt hủy',
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.payBtnText}>✓ Duyệt hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelBtn, { flex: 1, marginTop: 0 }]}
                  onPress={() =>
                    setConfirmActionOpen({
                      title: 'Từ chối hủy',
                      message:
                        'Từ chối yêu cầu hủy? Đơn sẽ quay lại trạng thái đã xác nhận.',
                      next: 'CONFIRMED',
                      label: 'Từ chối',
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.cancelBtnText}>✕ Từ chối</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Shipping info */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, serif]}>Thông tin giao hàng</Text>
          <Text style={styles.recipientName}>{order.shippingName}</Text>
          <Text style={styles.recipientInfo}>{order.shippingPhone}</Text>
          <Text style={styles.recipientInfo}>{order.shippingAddress}</Text>
          <View style={styles.divider} />
          <Text style={styles.paymentLine}>
            Phương thức:{' '}
            <Text style={{ fontWeight: '700' }}>
              {paymentMethodLabel(order.paymentMethod)}
            </Text>
          </Text>
          {!paid && isCOD ? (
            <Text style={[styles.paymentLine, { color: '#E8A838', marginTop: 4 }]}>
              ⚠️ Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng.
            </Text>
          ) : null}
          {order.trackingNumber ? (
            <Text style={styles.paymentLine}>
              Mã vận đơn:{' '}
              <Text style={{ fontWeight: '700' }}>{order.trackingNumber}</Text>
              {order.shippingProvider ? ` (${order.shippingProvider})` : ''}
            </Text>
          ) : null}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, serif]}>
            Sản phẩm ({order.items.length})
          </Text>
          {order.items.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.itemRow,
                idx < order.items.length - 1 && styles.itemRowBorder,
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={styles.itemName}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  Size {item.size} · ×{item.qty}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{fmt(item.price * item.qty)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={[styles.totalValue, serif]}>{fmt(order.total)}</Text>
          </View>
        </View>

        {/* Tracking timeline */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, serif]}>Hành trình đơn hàng</Text>
          {buildTimeline(order).map((step) => (
            <TimelineItem
              key={step.key}
              icon={step.icon}
              label={step.label}
              status={step.done ? 'done' : 'pending'}
            />
          ))}
        </View>
      </ScrollView>

      {/* Confirm payment */}
      <ConfirmDialog
        visible={payOpen}
        title="Thanh toán đơn hàng"
        message={`Xác nhận thanh toán ${fmt(order.total)} qua thẻ?`}
        confirmText="Thanh toán"
        cancelText="Hủy"
        onConfirm={() => {
          setPayOpen(false);
          handlePayment();
        }}
        onCancel={() => setPayOpen(false)}
      />

      {/* Cancel request with reason */}
      <Modal
        visible={cancelReqOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelReqOpen(false)}
        statusBarTranslucent
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.modalTitle}>Yêu cầu hủy đơn</Text>
            <Text style={styles.modalHint}>
              Nhập lý do bạn muốn hủy (sẽ gửi đến seller):
            </Text>
            <TextInput
              style={styles.textArea}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="VD: Đặt nhầm size, đổi ý..."
              placeholderTextColor={MUTED}
              multiline
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => {
                  setCancelReqOpen(false);
                  setCancelReason('');
                }}
              >
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={() => {
                  setCancelReqOpen(false);
                  updateStatus('CANCEL_REQUESTED', cancelReason.trim() || 'Không có lý do');
                  setCancelReason('');
                }}
              >
                <Text style={styles.btnDangerText}>Gửi yêu cầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Generic confirm action */}
      {confirmActionOpen ? (
        <ConfirmDialog
          visible={true}
          title={confirmActionOpen.title}
          message={confirmActionOpen.message}
          confirmText={confirmActionOpen.label}
          cancelText="Quay lại"
          destructive={confirmActionOpen.next === 'CANCELLED'}
          onConfirm={() => {
            const next = confirmActionOpen.next;
            setConfirmActionOpen(null);
            updateStatus(next);
          }}
          onCancel={() => setConfirmActionOpen(null)}
        />
      ) : null}

      {/* Error toast */}
      {errorMsg ? (
        <TouchableOpacity
          style={styles.errorToast}
          onPress={() => setErrorMsg(null)}
          activeOpacity={0.9}
        >
          <Text style={styles.errorToastText}>⚠ {errorMsg}</Text>
          <X size={14} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

function TimelineItem({
  icon,
  label,
  status,
}: {
  icon: 'create' | 'paid' | 'pack' | 'ship' | 'delivering' | 'done' | 'cancel';
  label: string;
  status: 'done' | 'pending';
}) {
  const color = status === 'done' ? T : MUTED;
  const Icon = (() => {
    switch (icon) {
      case 'create':
      case 'paid':
      case 'done':
        return CheckCircle;
      case 'pack':
        return Package;
      case 'ship':
      case 'delivering':
        return Truck;
      case 'cancel':
        return X;
    }
  })();
  return (
    <View style={tlStyles.row}>
      <View style={[tlStyles.dot, { backgroundColor: color }]}>
        <Icon size={icon === 'pack' ? 12 : 14} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[tlStyles.label, { color: status === 'done' ? ESPRESSO : COFFEE }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// Inline styles for cancel-request modal
import { Modal } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LINEN },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COFFEE,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: LINEN, fontWeight: '600', fontSize: 13 },
  roleBadge: {
    backgroundColor: T,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  statusLabel: { fontWeight: '700', fontSize: 14 },
  statusMeta: { color: COFFEE, fontSize: 11, marginTop: 2 },
  statusReason: { color: COFFEE, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  actionStack: { paddingHorizontal: 16, marginTop: 12, gap: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  payBtn: {
    backgroundColor: T,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  payBtnText: { color: LINEN, fontWeight: '700', fontSize: 13 },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E74C3C',
  },
  cancelBtnText: { color: '#E74C3C', fontWeight: '700', fontSize: 13 },
  reviewBtn: {
    backgroundColor: '#F5EFE6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: T,
  },
  reviewBtnText: { color: T, fontWeight: '700', fontSize: 13 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5E0',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8A83855',
  },
  infoBoxText: { color: COFFEE, fontSize: 12, flex: 1 },
  card: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
  },
  cardTitle: { color: ESPRESSO, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  recipientName: { color: ESPRESSO, fontWeight: '700', fontSize: 14 },
  recipientInfo: { color: COFFEE, fontSize: 13, marginTop: 4 },
  paymentLine: { color: COFFEE, fontSize: 12, marginTop: 6 },
  divider: { height: 1, backgroundColor: MUTED, marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: MUTED + '55' },
  itemImg: { width: 48, height: 48, borderRadius: 8 },
  itemName: { color: ESPRESSO, fontWeight: '600', fontSize: 13 },
  itemMeta: { color: COFFEE, fontSize: 11, marginTop: 2 },
  itemPrice: { color: T, fontWeight: '700', fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: ESPRESSO, fontWeight: '700', fontSize: 14 },
  totalValue: { color: T, fontSize: 18, fontWeight: '700' },

  // Inline modal styles
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: ESPRESSO, marginBottom: 8 },
  modalHint: { fontSize: 13, color: COFFEE, marginBottom: 8 },
  textArea: {
    borderWidth: 1,
    borderColor: MUTED,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    color: ESPRESSO,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: { backgroundColor: '#F5EFE6', borderWidth: 1, borderColor: '#E0D5C0' },
  btnCancelText: { color: ESPRESSO, fontWeight: '600', fontSize: 14 },
  btnDanger: { backgroundColor: '#E74C3C' },
  btnDangerText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Error toast
  errorToast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#C0392B',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorToastText: { color: '#fff', fontWeight: '600', fontSize: 13, flex: 1 },
});

const tlStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '600', fontSize: 13 },
});