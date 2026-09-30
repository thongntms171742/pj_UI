/**
 * ReviewScreen — buyer gửi đánh giá sản phẩm sau khi đơn `COMPLETED`.
 *
 * Flow:
 *   1. Buyer mở OrderDetailScreen (status = COMPLETED)
 *   2. Bấm "⭐ Đánh giá sản phẩm" → navigate('Review', { orderId, productId, productName })
 *   3. Chọn rating 1–5 + nhập comment (optional, max 1000 chars)
 *   4. Submit → POST /api/products/:id/reviews → success: pop về OrderDetailScreen
 *   5. Nếu backend trả 409 REVIEW_ALREADY_EXISTS → toast "Bạn đã đánh giá sản phẩm này"
 *
 * Backend validation (xem docs/API_CONTRACT.md → POST /api/products/:id/reviews):
 *   - rating: integer 1–5
 *   - orderId: required, must belong to current user
 *   - comment: optional, ≤ 1000 chars
 *   - Order status must be DELIVERED or COMPLETED
 *   - Product must be in order.items
 *   - One review per (orderId, productId, buyerId) — duplicate → 409
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, CheckCircle } from 'lucide-react-native';
import {
  useRoute,
  useNavigation,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { productApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { reviewedStore } from '../../state/reviewedStore';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, serif, success } from '../../theme/colors';
import { showToast } from '../../utils/toast';
import type { CartStackParamList } from '../../navigation/types';

type Route = RouteProp<CartStackParamList, 'Review'>;

const RATING_LABELS = ['', 'Tệ', 'Không tốt', 'Tạm được', 'Tốt', 'Tuyệt vời'];

export function ReviewScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
  const { orderId, productId, productName } = route.params;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayRating = hoverRating || rating;
  const canSubmit = rating >= 1 && rating <= 5 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast('Vui lòng chọn số sao từ 1–5');
      return;
    }
    setSubmitting(true);
    try {
      await productApi.createReview(productId, {
        rating,
        comment: comment.trim() || undefined,
        orderId,
      });
      showToast('✓ Cảm ơn bạn đã đánh giá!');
      // Mark the (order, product) pair as reviewed in the shared store.
      // Both AccountScreen and OrderDetailScreen subscribe to the store and
      // hide their "Đánh giá" button on the next render. Doing this directly
      // here (instead of via a navigation-param callback) also avoids React
      // Navigation's "non-serializable value" warning, since functions cannot
      // be safely persisted in the navigation state.
      reviewedStore.add(`${orderId}_${productId}`);
      navigation.goBack();
    } catch (e) {
      let msg: string;
      if (e instanceof ApiError) {
        // Map known error patterns from API contract to user-friendly messages.
        // ApiError.message usually contains the error code text from backend.
        if (e.message.includes('REVIEW_ALREADY_EXISTS')) {
          msg = 'Bạn đã đánh giá sản phẩm này rồi';
        } else if (e.message.includes('REVIEW_RATING_INVALID')) {
          msg = 'Rating không hợp lệ (1–5)';
        } else if (e.message.includes('REVIEW_NOT_ALLOWED')) {
          msg = 'Bạn không thể đánh giá đơn hàng này';
        } else if (e.message.includes('ORDER_NOT_FOUND')) {
          msg = 'Không tìm thấy đơn hàng';
        } else if (e.message.includes('PRODUCT_NOT_FOUND')) {
          msg = 'Không tìm thấy sản phẩm';
        } else {
          msg = e.message || 'Gửi đánh giá thất bại';
        }
      } else {
        msg = e instanceof Error ? e.message : 'Gửi đánh giá thất bại';
      }
      showToast(`⚠️ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={20} color={LINEN} />
          <Text style={styles.backText}>Đánh giá</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product card */}
          <View style={styles.productCard}>
            <View style={styles.productIconWrap}>
              <CheckCircle size={28} color={success} />
            </View>
            <Text style={[styles.productTitle, serif]} numberOfLines={2}>
              {productName}
            </Text>
            <Text style={styles.productMeta}>Đơn hàng #{orderId}</Text>
          </View>

          {/* Rating */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, serif]}>Chất lượng sản phẩm</Text>
            <Text style={styles.sectionHint}>Chạm để chọn số sao (1–5)</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRating(n)}
                  onPressIn={() => setHoverRating(n)}
                  onPressOut={() => setHoverRating(0)}
                  style={styles.starBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} sao`}
                >
                  <Star
                    size={42}
                    color={n <= displayRating ? T : MUTED}
                    fill={n <= displayRating ? T : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {displayRating > 0 ? (
              <Text style={styles.ratingLabel}>
                {displayRating} sao · {RATING_LABELS[displayRating]}
              </Text>
            ) : (
              <Text style={styles.ratingLabelPlaceholder}>Chưa chọn</Text>
            )}
          </View>

          {/* Comment */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, serif]}>Nhận xét của bạn</Text>
            <Text style={styles.sectionHint}>
              Chia sẻ trải nghiệm để giúp người mua khác ({comment.length}/1000)
            </Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={(t) => setComment(t.slice(0, 1000))}
              placeholder="VD: Sản phẩm đẹp, đúng mô tả, shop tư vấn nhiệt tình..."
              placeholderTextColor={MUTED}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Mẹo viết đánh giá hữu ích</Text>
            <Text style={styles.tipLine}>• Mô tả chất lượng thực tế so với ảnh</Text>
            <Text style={styles.tipLine}>• Đánh giá size và phom dáng</Text>
            <Text style={styles.tipLine}>• Chia sẻ trải nghiệm giao hàng</Text>
          </View>
        </ScrollView>

        {/* Submit bar */}
        <View style={styles.submitBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !canSubmit && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={LINEN} />
            ) : (
              <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LINEN },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COFFEE,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: LINEN, fontWeight: '600', fontSize: 13 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  productCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MUTED,
    marginBottom: 12,
  },
  productIconWrap: { marginBottom: 8 },
  productTitle: {
    color: ESPRESSO,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  productMeta: { color: COFFEE, fontSize: 12 },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: MUTED,
    marginBottom: 12,
  },
  sectionTitle: { color: ESPRESSO, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionHint: { color: COFFEE, fontSize: 12, marginBottom: 12 },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  starBtn: { padding: 6 },
  ratingLabel: {
    textAlign: 'center',
    color: T,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 8,
  },
  ratingLabelPlaceholder: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 14,
    marginTop: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: MUTED,
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    color: ESPRESSO,
    fontSize: 14,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#FFF5E0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8A83833',
  },
  tipsTitle: {
    color: ESPRESSO,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
  },
  tipLine: { color: COFFEE, fontSize: 12, lineHeight: 18 },
  submitBar: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: MUTED,
    backgroundColor: LINEN,
  },
  submitBtn: {
    backgroundColor: T,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: MUTED },
  submitBtnText: { color: LINEN, fontWeight: '700', fontSize: 14 },
});