// ── Screen routing types ───────────────────────────────────────────────────────
export type Screen =
  | "login"
  | "register"
  | "home"
  | "search"
  | "cart"
  | "chat"
  | "account"
  | "post"
  | "notification"
  | "product-detail"
  | "seller"
  | "seller-apply"
  | "payment"
  | "admin";

// ── Product ─────────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  price: number;
  seller: string;
  sellerName?: string;
  sellerRating?: number;
  condition: number;
  size: string;
  category: string;
  image: string;
  images?: string[];
  liked: boolean;
  status?: "active" | "pending" | "sold";
  apiId?: string;
  quantity: number;
  desc?: string;
  description?: string;
}

// ── Seller ──────────────────────────────────────────────────────────────────────
export interface Seller {
  id: number;
  handle: string;
  name: string;
  avatar: string;
  rating: number;
  transactions: number;
  thumbs: string[];
}

// ── Cart ────────────────────────────────────────────────────────────────────────
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
  status?: string;
  seller?: string;
}

export interface CartGroup {
  seller: string;
  items: CartItem[];
}

// ── Order ───────────────────────────────────────────────────────────────────────
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

export interface Order {
  id: string;
  apiId?: string;
  items: OrderItem[];
  total: number;
  status:
    | "PENDING_PAYMENT"
    | "PAID"
    | "CONFIRMED"
    | "PACKING"
    | "SHIPPING"
    | "DELIVERING"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED"
    | "REFUNDED";
  createdAt: string;
  paymentMethod: string;
  trackingNumber?: string;
  shippingProvider?: string;
  paidAt?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
}

// ── Seller product (the owner's product listing) ───────────────────────────────
export interface SellerProduct {
  id: number;
  apiId?: string;
  name: string;
  price: number;
  quantity: number;
  status: "active" | "pending" | "sold";
  image: string;
  views: number;
  likes: number;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  seller?: string;
}

// ── Account / Session ──────────────────────────────────────────────────────────
export interface MockAccount {
  email: string;
  password: string;
  name: string;
}

// ── Search filter state ────────────────────────────────────────────────────────
export interface FilterState {
  cats: string[];
  minP: string;
  maxP: string;
  sizes: string[];
  cond: number;
  rating?: number;
  ai: boolean;
}

// ── Contact / Chat ─────────────────────────────────────────────────────────────
export interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  product: { name: string; price: number; image: string };
}

export interface ChatMessage {
  id: number;
  from: "me" | "seller";
  text: string;
  time: string;
}

// ── Notification ──────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  apiId?: string;
  type: "order" | "chat" | "promo" | "system" | "review";
  title: string;
  desc: string;
  time: string;
  read: boolean;
  icon: string;
}

// ── Shipment (from GHTK / shipping providers) ─────────────────────────────────
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

export type ShipmentStatus =
  | "PENDING"
  | "CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERING"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED"
  | "FAILED";

// The backend returns embedded Address documents with these fields:
//   { _id, name, phone, address (full street), province, district, ward, isDefault }
// After Vietnam's 2-level administrative merger (Tỉnh/Thành -> Xã/Phường),
// "district" is no longer part of the official hierarchy — we still preserve
// the field for backward compatibility but it's effectively the same as "ward"
// in modern addresses.
export interface Address {
  id: string; // From backend _id
  label?: string; // Optional human label (e.g. "Nhà riêng", "Công ty")
  name: string; // Receiver full name
  phone: string;
  province: string; // Tỉnh/Thành phố
  provinceId?: string; // CAS province code (e.g. "79")
  ward: string; // Phường/Xã (post-merger, the only sub-province level)
  wardId?: string; // CAS commune code
  detail: string; // Số nhà, ngõ, tên đường
  /** Legacy 3-level field kept for backward compat — same as `ward` after merger. */
  district?: string;
  isDefault: boolean;
  /** "delivery" = buyer's address book; "warehouse" = seller's pickup address. */
  type: "delivery" | "warehouse";
}
