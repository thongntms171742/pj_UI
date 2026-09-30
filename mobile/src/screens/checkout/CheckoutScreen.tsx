import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, SOFT, serif } from '../../theme/colors';
import { fmt } from '../../utils/format';
import type { CartStackParamList } from '../../navigation/types';
import type { OrderItem } from '../../types';

type Nav = NativeStackNavigationProp<CartStackParamList, 'Checkout'>;

export function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { cartGroups, placeOrder } = useCart();
  const { session } = useAuth();

  const [step, setStep] = useState<'address' | 'review'>('address');
  const [fullName, setFullName] = useState(session?.name ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkedItems = useMemo(
    () =>
      cartGroups.flatMap((g) =>
        g.items.filter((i) => i.checked).map((i) => ({ ...i, seller: g.seller })),
      ),
    [cartGroups],
  );
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const checkedSellers = new Set(checkedItems.map((i) => i.seller)).size;
  const ship = checkedSellers * 30000;
  const total = subtotal + ship;

  const validate = (): boolean => {
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên người nhận');
      return false;
    }
    if (!/^\d{10,11}$/.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ (10-11 chữ số)');
      return false;
    }
    if (address.trim().length < 10) {
      setError('Vui lòng nhập địa chỉ chi tiết (ít nhất 10 ký tự)');
      return false;
    }
    setError('');
    return true;
  };

  const onContinue = () => {
    if (validate()) setStep('review');
  };

  const onPlaceOrder = async () => {
    if (!validate()) {
      setStep('address');
      return;
    }
    if (checkedItems.length === 0) return;
    setIsSubmitting(true);
    const orderItems: OrderItem[] = checkedItems.map((item) => ({
      id: String(item.id),
      apiId: item.apiId,
      productApiId: item.productApiId,
      name: item.name,
      price: item.price,
      size: item.size,
      qty: item.qty,
      image: item.image,
      condition: item.condition,
      seller: cartGroups.find((g) => g.items.some((i) => i.id === item.id))?.seller ?? '',
    }));
    const order = await placeOrder({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: 'COD',
      items: orderItems,
      total,
    });
    setIsSubmitting(false);
    if (order) {
      // Navigate to OrderDetail — replace the checkout so back goes to Cart
      navigation.replace('OrderDetail', { orderId: order.id });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'review') setStep('address');
            else navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ChevronLeft size={20} color={LINEN} />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, serif]}>Thanh toán</Text>
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {['Địa chỉ', 'Xác nhận'].map((label, i) => {
          const isActive =
            (i === 0 && step === 'address') ||
            (i === 1 && step === 'review');
          return (
            <View key={label} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  isActive && { backgroundColor: T },
                ]}
              >
                <Text
                  style={[styles.stepDotText, isActive && { color: LINEN }]}
                >
                  {i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, isActive && { color: T }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {step === 'address' ? (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, serif]}>Thông tin nhận hàng</Text>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={MUTED}
            />
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="0987654321"
              placeholderTextColor={MUTED}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>Địa chỉ giao hàng *</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              placeholderTextColor={MUTED}
              multiline
            />
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={[styles.cardTitle, serif]}>Đơn hàng của bạn</Text>
              {checkedItems.map((item) => (
                <View key={item.id} style={styles.reviewItem}>
                  <Image source={{ uri: item.image }} style={styles.reviewImg} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={2} style={styles.reviewName}>
                      {item.name}
                    </Text>
                    <Text style={styles.reviewMeta}>
                      Size {item.size} · ×{item.qty}
                    </Text>
                  </View>
                  <Text style={styles.reviewPrice}>{fmt(item.price * item.qty)}</Text>
                </View>
              ))}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                <Text style={styles.summaryValue}>{fmt(ship)}</Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>
                  Tổng thanh toán
                </Text>
                <Text style={[styles.summaryValue, { fontSize: 20, color: T }, serif]}>
                  {fmt(total)}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.cardTitle, serif]}>Phương thức thanh toán</Text>
              <View style={styles.paymentMethod}>
                <View style={styles.codBadge}>
                  <Text style={styles.codBadgeText}>COD</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentTitle}>Thanh toán khi nhận hàng (COD)</Text>
                  <Text style={styles.paymentSubtitle}>
                    Bạn chỉ thanh toán khi đã nhận và kiểm tra hàng.
                  </Text>
                </View>
                <CheckCircle size={22} color={T} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.cardTitle, serif]}>Giao tới</Text>
              <Text style={styles.recipientName}>{fullName}</Text>
              <Text style={styles.recipientInfo}>{phone}</Text>
              <Text style={styles.recipientInfo}>{address}</Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
          <Text style={[styles.bottomValue, serif]}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, isSubmitting && { opacity: 0.6 }]}
          onPress={step === 'address' ? onContinue : onPlaceOrder}
          disabled={isSubmitting || checkedItems.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color={LINEN} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {step === 'address' ? 'Xác nhận thông tin' : 'Đặt hàng'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COFFEE,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: LINEN,
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    color: LINEN,
    fontSize: 17,
    fontWeight: '700',
    fontStyle: 'italic',
    flex: 1,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    color: COFFEE,
    fontWeight: '700',
    fontSize: 13,
  },
  stepLabel: {
    color: COFFEE,
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: MUTED,
    marginBottom: 12,
  },
  cardTitle: {
    color: ESPRESSO,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#FADBD8',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    color: COFFEE,
    fontWeight: '700',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: SOFT,
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: ESPRESSO,
    fontSize: 14,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  reviewImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  reviewName: {
    color: ESPRESSO,
    fontWeight: '600',
    fontSize: 13,
  },
  reviewMeta: {
    color: COFFEE,
    fontSize: 11,
    marginTop: 2,
  },
  reviewPrice: {
    color: T,
    fontWeight: '700',
    fontSize: 14,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: MUTED,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    color: COFFEE,
    fontSize: 13,
  },
  summaryValue: {
    color: ESPRESSO,
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: T + '0F',
    borderWidth: 2,
    borderColor: T,
    borderRadius: 12,
  },
  codBadge: {
    width: 50,
    height: 32,
    borderWidth: 2,
    borderColor: T,
    backgroundColor: CARD,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codBadgeText: {
    color: T,
    fontWeight: '700',
    fontSize: 12,
  },
  paymentTitle: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 14,
  },
  paymentSubtitle: {
    color: COFFEE,
    fontSize: 11,
    marginTop: 2,
  },
  recipientName: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 14,
  },
  recipientInfo: {
    color: COFFEE,
    fontSize: 13,
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: MUTED,
    gap: 12,
  },
  bottomLabel: {
    color: COFFEE,
    fontSize: 11,
    fontWeight: '600',
  },
  bottomValue: {
    color: T,
    fontSize: 20,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: T,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 14,
  },
});