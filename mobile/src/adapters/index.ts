/**
 * Adapters: convert API shapes → mobile UI models.
 * Mirrors frontend/src/lib/adapters.ts so call sites stay 1:1.
 */
import {
  ApiProduct,
  ApiSeller,
  ApiCartItem,
  ApiOrder,
  ApiNotification,
} from '../api/client';
import {
  Product,
  Seller,
  CartGroup,
  Order,
  OrderItem,
  Notification,
  OrderStatus,
} from '../types';
import { hashId, timeAgo } from '../utils/format';

// ── Product ──
export function adaptProduct(p: ApiProduct, likedIds: Set<string>): Product {
  const id = hashId(p._id);
  return {
    id,
    apiId: p._id,
    name: p.title,
    price: p.price,
    seller: p.sellerId?.handle ?? '',
    sellerName: p.sellerId?.shopName,
    condition: p.condition,
    size: p.size,
    category: p.categoryId?.name ?? '',
    image: p.coverImage,
    liked: likedIds.has(p._id),
    status: p.status,
    quantity: p.quantity ?? 1,
  };
}

// ── Seller ──
export function adaptSeller(s: ApiSeller): Seller {
  return {
    id: hashId(s._id),
    handle: s.handle,
    name: s.shopName,
    avatar: s.avatarUrl ?? '',
    rating: s.rating,
    transactions: s.totalTransactions,
    thumbs: s.coverImages ?? [],
  };
}

// ── Cart → grouped CartGroup ──
export function adaptCartItems(items: ApiCartItem[]): {
  groups: CartGroup[];
  likedIds: Set<string>;
} {
  const likedIds = new Set<string>();
  const groupMap = new Map<string, CartGroup>();
  for (const ci of items) {
    const prod = ci.productId;
    likedIds.add(prod._id);
    const sellerHandle = prod.sellerId?.handle ?? 'unknown';
    const item = {
      id: hashId(prod._id),
      apiId: ci._id,
      productApiId: prod._id,
      name: prod.title,
      price: ci.priceSnapshot ?? prod.price,
      size: prod.size,
      qty: ci.quantity,
      image: prod.coverImage,
      checked: ci.checked,
      condition: prod.condition,
      stock: prod.quantity ?? 1,
    };
    const existing = groupMap.get(sellerHandle);
    if (existing) {
      existing.items.push(item);
    } else {
      groupMap.set(sellerHandle, { seller: sellerHandle, items: [item] });
    }
  }
  return {
    groups: Array.from(groupMap.values()),
    likedIds,
  };
}

// ── Order ──
const STATUS_TAB_MAP: Record<
  string,
  'pending' | 'shipping' | 'delivering' | 'review' | 'cancelled'
> = {
  PENDING_PAYMENT: 'pending',
  PAID: 'shipping',
  CONFIRMED: 'shipping',
  PACKING: 'shipping',
  SHIPPING: 'delivering',
  DELIVERING: 'delivering',
  DELIVERED: 'review',
  COMPLETED: 'review',
  CANCEL_REQUESTED: 'pending',
  CANCELLED: 'cancelled',
  DISPUTED: 'delivering',
  REFUNDED: 'cancelled',
};

export const STATUS_INTENT_MAP: Record<string, string> = {
  pending: 'PENDING_PAYMENT',
  cancelled: 'CANCELLED',
  completed: 'COMPLETED',
  delivered: 'DELIVERED',
  disputed: 'DISPUTED',
};

export function getOrderTabStatus(
  status: string,
): 'pending' | 'shipping' | 'delivering' | 'review' | 'cancelled' {
  return STATUS_TAB_MAP[status] ?? 'pending';
}

export function adaptOrder(o: ApiOrder): Order {
  return {
    id: o.orderCode,
    apiId: o._id,
    items: o.items.map(
      (it): OrderItem => ({
        id: it.productId,
        apiId: it.productId,
        productApiId: it.productId,
        name: it.productName,
        price: it.unitPrice,
        size: '',
        qty: it.quantity,
        image: it.productImageUrl ?? '',
        condition: it.conditionSnapshot ?? 0,
        seller: '',
      }),
    ),
    total: o.totalAmount,
    status: o.status as OrderStatus,
    createdAt: new Date(o.createdAt).toLocaleDateString('vi-VN'),
    paymentMethod: o.paymentMethod ?? '',
    shippingName: o.shippingName,
    shippingPhone: o.shippingPhone,
    shippingAddress: o.shippingAddress,
    trackingNumber: o.trackingNumber,
    shippingProvider: o.shippingProvider,
    paidAt: o.paidAt,
    cancelReason: o.cancelReason,
    cancelRequestedAt: o.cancelRequestedAt,
  };
}

// ── Notification ──
export function adaptNotification(n: ApiNotification): Notification {
  return {
    id: hashId(n._id),
    apiId: n._id,
    type: n.type,
    title: n.title,
    desc: n.message ?? '',
    time: timeAgo(new Date(n.createdAt)),
    read: n.isRead,
    icon: iconForType(n.type),
  };
}

function iconForType(t: ApiNotification['type']): string {
  switch (t) {
    case 'order':
      return 'Package';
    case 'chat':
      return 'MessageCircle';
    case 'promo':
      return 'Percent';
    case 'system':
      return 'Bell';
    case 'review':
      return 'Star';
  }
}