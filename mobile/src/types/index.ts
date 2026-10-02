// ── Screen routing types ───────────────────────────────────────────────────────
export type Screen =
  | 'login'
  | 'register'
  | 'home'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'product-detail'
  | 'orders'
  | 'notifications'
  | 'account';

// ── Product ────────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  price: number;
  seller: string;
  sellerName?: string;
  condition: number;
  size: string;
  category: string;
  image: string;
  liked: boolean;
  status?: 'active' | 'pending' | 'reserved' | 'sold' | 'archived';
  apiId?: string;
  quantity: number;
}

// ── Seller ─────────────────────────────────────────────────────────────────────
export interface Seller {
  id: number;
  handle: string;
  name: string;
  avatar: string;
  rating: number;
  transactions: number;
  thumbs: string[];
  /** Optional bio / shop description — shown on the Shop screen. */
  description?: string;
  /** Optional social proof surfaced on the Shop screen (e.g. joined year,
   *  response rate). All fields are optional so legacy callers (homepage
   *  horizontal carousel) don't have to provide them. */
  joinedAt?: string;
  responseRate?: number;
  followers?: number;
}

// ── Cart ───────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number;
  apiId?: string;
  productApiId?: string;
  name: string;
  price: number;
  size: string;
  qty: number;
  image: string;
  checked: boolean;
  condition: number;
  stock: number;
}

export interface CartGroup {
  seller: string;
  items: CartItem[];
}

// ── Address (2-level post-merger; mirrors FE `frontend/src/types/index.ts`) ─
// `province` + `ward` is the canonical shape after Vietnam's 2025 admin
// merger. `district` is kept as a backward-compat alias for older API
// responses. BE 2026-10-03.
export interface Address {
  id: string;
  label?: string;
  name: string;
  phone: string;
  address: string;
  province: string;
  provinceId?: string;
  ward: string;
  wardId?: string;
  /** @deprecated alias for `ward`. */
  district?: string;
  isDefault: boolean;
  /** Effective date used when this address was resolved from CAS. */
  effectiveDate?: string;
}

// ── Order ──────────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  apiId?: string;
  productApiId?: string;
  name: string;
  price: number;
  size: string;
  qty: number;
  image: string;
  condition: number;
  seller: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PACKING'
  | 'SHIPPING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCEL_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface Order {
  id: string;
  apiId?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: string;
  trackingNumber?: string;
  shippingProvider?: string;
  paidAt?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  /** Address snapshot (BE 2026-10-03) — province/commune names captured at
   * order time so the historical record does not change when CAS data is
   * updated. */
  shippingProvinceName?: string;
  shippingCommuneName?: string;
  /** Reason buyer provided when requesting cancel. */
  cancelReason?: string;
  /** When buyer requested the cancel (ISO string). */
  cancelRequestedAt?: string;
}

// ── Notification ───────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  apiId?: string;
  type: 'order' | 'chat' | 'promo' | 'system' | 'review';
  title: string;
  desc: string;
  time: string;
  read: boolean;
  icon: string;
}

// ── Shipment ───────────────────────────────────────────────────────────────────
export type ShipmentStatus =
  | 'PENDING'
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'FAILED';

export interface Shipment {
  _id: string;
  orderCode: string;
  provider: string;
  providerShipmentId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippingFee: number;
  estimatedDeliveryAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  labelUrl?: string;
  trackingUrl?: string;
}

// ── Auth session ───────────────────────────────────────────────────────────────
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  token: string;
  roles: ('buyer' | 'seller' | 'admin')[];
  avatarUrl?: string;
  sellerStatus: string;
}