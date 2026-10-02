import React, { useState, useEffect, useCallback } from "react";
import {
  Clock, Package, Truck, Star, X, Store, Edit3, LogOut, Plus,
  ShoppingBag, MessageCircle, TrendingUp, Heart,
  Eye, DollarSign, Shield, PlusCircle, ExternalLink, MapPinned
} from "lucide-react";
import { T, ESPRESSO, COFFEE, LINEN, CARD, MUTED, SOFT, serif, ff, fmt } from "../../lib/theme";
import { getOrderTabStatus } from "../../lib/adapters";
import { api } from "../../lib/api";
import type { Screen, Order, OrderItem, SellerProduct, Shipment } from "../../types";
import { RatingStars } from "../../components/common/RatingStars";
import { LetterAvatar, PlaceholderImage } from "../../components/common/LetterAvatar";
import { ImageOff } from "lucide-react";
import {
  AddressBookCard,
  AddressFormFields,
  useAddressCatalog,
} from "../../components/common/AddressBook";
import type { Address } from "../../types";
import type { ApiAddress } from "../../lib/api";

// ── AddressBookTab (Buyer — Sổ địa chỉ nhận hàng) ───────────────────────────
function AddressBookTab({
  addresses,
  onAddressesChanged,
  showToast,
}: {
  addresses: Address[];
  onAddressesChanged?: () => Promise<void> | void;
  showToast?: (msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    detail: "",
    provinceId: "",
    wardId: "",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catalog = useAddressCatalog();

  const resetDraft = () => {
    setDraft({ name: "", phone: "", detail: "", provinceId: "", wardId: "", isDefault: false });
    setEditingId(null);
    setError(null);
  };

  const startEdit = (a: Address) => {
    setShowForm(true);
    setEditingId(a.id);
    setError(null);
    // Try to resolve province/ward by name (CAS proxy returns id+name)
    const province = catalog.provinces.find((p) => p.name === a.province);
    setDraft({
      name: a.name,
      phone: a.phone,
      detail: a.detail,
      provinceId: province?.id || "",
      wardId: "",
      isDefault: a.isDefault,
    });
    // wardId will be auto-resolved once provinces loaded
    setTimeout(() => {
      if (province?.id) {
        const wards = catalog.communesByProvince.get(province.id) || [];
        const ward = wards.find((w) => w.name === a.ward);
        if (ward) {
          setDraft((d) => ({ ...d, wardId: ward.id }));
        }
      }
    }, 200);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!draft.name.trim()) return setError("Vui lòng nhập họ tên");
    if (!/^\d{10,11}$/.test(draft.phone.trim())) return setError("Số điện thoại phải có 10–11 chữ số");
    if (!draft.provinceId) return setError("Vui lòng chọn tỉnh/thành");
    if (!draft.wardId) return setError("Vui lòng chọn phường/xã");
    if (!draft.detail.trim() || draft.detail.trim().length < 3)
      return setError("Vui lòng nhập số nhà, tên đường");

    const province = catalog.provinces.find((p) => p.id === draft.provinceId);
    const ward = (catalog.communesByProvince.get(draft.provinceId) || []).find(
      (w) => w.id === draft.wardId
    );

    setSubmitting(true);
    try {
      const payload = {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        address: draft.detail.trim(),
        province: province?.name || "",
        district: ward?.name || "",
        ward: ward?.name || "",
        isDefault: draft.isDefault,
      };
      if (editingId) {
        await api.patch<{ address: ApiAddress }>(`/users/me/addresses/${editingId}`, payload);
        showToast?.("✓ Đã cập nhật địa chỉ");
      } else {
        await api.post<{ address: ApiAddress }>("/users/me/addresses", payload);
        showToast?.("✓ Đã thêm địa chỉ mới");
      }
      await onAddressesChanged?.();
      resetDraft();
      setShowForm(false);
    } catch (e: any) {
      setError(e?.message || "Không thể lưu địa chỉ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await api.delete(`/users/me/addresses/${id}`);
      await onAddressesChanged?.();
      showToast?.("✓ Đã xóa địa chỉ");
    } catch (e: any) {
      showToast?.(`⚠️ ${e?.message || "Lỗi khi xóa"}`);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/users/me/addresses/${id}`, { isDefault: true });
      await onAddressesChanged?.();
      showToast?.("✓ Đã đặt làm địa chỉ mặc định");
    } catch (e: any) {
      showToast?.(`⚠️ ${e?.message || "Lỗi"}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold" style={{ ...serif, color: ESPRESSO }}>
            Sổ địa chỉ nhận hàng
          </h2>
          <p className="text-xs mt-1" style={{ color: COFFEE, ...ff }}>
            Quản lý các địa chỉ để giao hàng nhanh khi thanh toán.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetDraft();
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-xs hover:opacity-90"
            style={{ backgroundColor: T, color: LINEN, ...ff }}
          >
            <Plus size={15} />
            Thêm địa chỉ
          </button>
        )}
      </div>

      {showForm && (
        <div
          className="mb-5 p-5 rounded-2xl border-2"
          style={{ borderColor: T, backgroundColor: CARD }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: ESPRESSO, ...ff }}>
            {editingId ? "Cập nhật địa chỉ" : "Địa chỉ mới"}
          </h3>
          <AddressFormFields
            name={draft.name}
            phone={draft.phone}
            detail={draft.detail}
            provinceId={draft.provinceId}
            wardId={draft.wardId}
            isDefault={draft.isDefault}
            onChange={(next) => setDraft((d) => ({ ...d, ...next }))}
            provinces={catalog.provinces}
            communesByProvince={catalog.communesByProvince}
            loadingProvinces={catalog.loadingProvinces}
            loadingCommunes={catalog.loadingCommunes}
            showDefaultToggle={addresses.length > 0}
          />
          {error && (
            <div
              className="mt-3 p-2.5 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "#FDEDEC", color: "#E74C3C", ...ff }}
            >
              ⚠️ {error}
            </div>
          )}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                resetDraft();
                setShowForm(false);
              }}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor: MUTED, color: COFFEE, ...ff }}
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
              style={{ backgroundColor: T, color: LINEN, ...ff }}
            >
              {submitting ? "Đang lưu…" : editingId ? "Lưu thay đổi" : "Thêm địa chỉ"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {addresses.map((a) => (
          <AddressBookCard
            key={a.id}
            address={a}
            onEdit={() => startEdit(a)}
            onDelete={() => handleDelete(a.id)}
            onSetDefault={() => handleSetDefault(a.id)}
          />
        ))}
        {addresses.length === 0 && !showForm && (
          <div
            className="md:col-span-2 py-12 px-6 rounded-2xl text-center border-2 border-dashed"
            style={{ backgroundColor: "#FAFAFA", borderColor: MUTED, color: COFFEE }}
          >
            <MapPinned size={42} style={{ color: MUTED }} />
            <p className="text-base font-bold mt-3 mb-1" style={{ color: ESPRESSO, ...ff }}>
              Bạn chưa có địa chỉ nào
            </p>
            <p className="text-xs max-w-md mx-auto">
              Thêm địa chỉ nhận hàng để checkout nhanh hơn — không cần gõ lại mỗi lần mua sắm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── WarehouseTab (Seller — Địa chỉ kho lấy hàng) ───────────────────────────
function WarehouseTab({
  addresses,
  onAddressesChanged,
  showToast,
}: {
  addresses: Address[];
  onAddressesChanged?: () => Promise<void> | void;
  showToast?: (msg: string) => void;
}) {
  // For seller, we surface the FIRST saved address as the pickup default
  // (consistent with the existing shipment dialog's pickup payload).
  // They can edit any saved address — the warehouse IS one of those addresses
  // (created with type=warehouse).
  const warehouse = addresses.find((a) => a.type === "warehouse") || addresses[0] || null;

  const [showForm, setShowForm] = useState(!warehouse);
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    detail: "",
    provinceId: "",
    wardId: "",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catalog = useAddressCatalog();

  const startEdit = (a: Address) => {
    setShowForm(true);
    setError(null);
    const province = catalog.provinces.find((p) => p.name === a.province);
    setDraft({
      name: a.name,
      phone: a.phone,
      detail: a.detail,
      provinceId: province?.id || "",
      wardId: "",
      isDefault: a.isDefault,
    });
    setTimeout(() => {
      if (province?.id) {
        const wards = catalog.communesByProvince.get(province.id) || [];
        const ward = wards.find((w) => w.name === a.ward);
        if (ward) setDraft((d) => ({ ...d, wardId: ward.id }));
      }
    }, 200);
  };

  const handleSave = async () => {
    setError(null);
    if (!draft.name.trim()) return setError("Vui lòng nhập tên kho / người bàn giao");
    if (!/^\d{10,11}$/.test(draft.phone.trim())) return setError("Số điện thoại phải có 10–11 chữ số");
    if (!draft.provinceId) return setError("Vui lòng chọn tỉnh/thành");
    if (!draft.wardId) return setError("Vui lòng chọn phường/xã");
    if (!draft.detail.trim() || draft.detail.trim().length < 3)
      return setError("Vui lòng nhập số nhà, tên đường");

    const province = catalog.provinces.find((p) => p.id === draft.provinceId);
    const ward = (catalog.communesByProvince.get(draft.provinceId) || []).find(
      (w) => w.id === draft.wardId
    );

    setSubmitting(true);
    try {
      const payload = {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        address: draft.detail.trim(),
        province: province?.name || "",
        district: ward?.name || "",
        ward: ward?.name || "",
        isDefault: draft.isDefault,
      };
      if (warehouse) {
        await api.patch<{ address: ApiAddress }>(`/users/me/addresses/${warehouse.id}`, payload);
        showToast?.("✓ Đã cập nhật kho hàng");
      } else {
        await api.post<{ address: ApiAddress }>("/users/me/addresses", payload);
        showToast?.("✓ Đã lưu địa chỉ kho hàng");
      }
      await onAddressesChanged?.();
      setShowForm(false);
    } catch (e: any) {
      setError(e?.message || "Không thể lưu kho hàng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold" style={{ ...serif, color: ESPRESSO }}>
          Địa chỉ kho hàng (lấy hàng)
        </h2>
        <p className="text-xs mt-1" style={{ color: COFFEE, ...ff }}>
          Đơn vị vận chuyển sẽ đến địa chỉ này để lấy hàng khi bạn tạo vận đơn.
          Hệ thống sẽ tự động điền các thông tin này vào form tạo vận đơn.
        </p>
      </div>

      {warehouse && !showForm && (
        <div
          className="mb-5 p-4 rounded-2xl border-2"
          style={{ borderColor: T, backgroundColor: `${T}08` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${T}22`, color: T }}
            >
              <MapPinned size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm" style={{ color: ESPRESSO, ...ff }}>
                  {warehouse.name}
                </span>
                <span className="text-xs" style={{ color: COFFEE, ...ff }}>
                  · {warehouse.phone}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: COFFEE, ...ff }}>
                {[warehouse.detail, warehouse.ward, warehouse.province].filter(Boolean).join(", ")}
              </p>
              <button
                onClick={() => startEdit(warehouse)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold hover:opacity-80"
                style={{ color: T, ...ff }}
              >
                <Edit3 size={12} />
                Cập nhật kho hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="mb-5 p-5 rounded-2xl border-2"
          style={{ borderColor: T, backgroundColor: CARD }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: ESPRESSO, ...ff }}>
            {warehouse ? "Cập nhật kho hàng" : "Thiết lập kho hàng"}
          </h3>
          <AddressFormFields
            name={draft.name}
            phone={draft.phone}
            detail={draft.detail}
            provinceId={draft.provinceId}
            wardId={draft.wardId}
            isDefault={draft.isDefault}
            onChange={(next) => setDraft((d) => ({ ...d, ...next }))}
            provinces={catalog.provinces}
            communesByProvince={catalog.communesByProvince}
            loadingProvinces={catalog.loadingProvinces}
            loadingCommunes={catalog.loadingCommunes}
            showDefaultToggle={false}
          />
          {error && (
            <div
              className="mt-3 p-2.5 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "#FDEDEC", color: "#E74C3C", ...ff }}
            >
              ⚠️ {error}
            </div>
          )}
          <div className="mt-4 flex items-center justify-end gap-2">
            {warehouse && (
              <button
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: MUTED, color: COFFEE, ...ff }}
              >
                Huỷ
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
              style={{ backgroundColor: T, color: LINEN, ...ff }}
            >
              {submitting ? "Đang lưu…" : warehouse ? "Lưu thay đổi" : "Lưu kho hàng"}
            </button>
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-2xl text-sm"
        style={{ backgroundColor: SOFT, color: COFFEE, ...ff }}
      >
        💡 <strong>Mẹo:</strong> Thông tin tại đây sẽ tự động điền vào hộp thoại
        "Tạo vận đơn" mỗi khi khách đặt hàng. Bạn chỉ cần xác nhận tạo đơn vận chuyển.
      </div>
    </div>
  );
}

// ── Account Screen ──────────────────────────────────────────────────────────────
export function AccountScreen({
  go,
  onLogout,
  userName = "",
  userAvatar = "",
  userRating,
  userEmail = "",
  userHandle = "",
  orders = [],
  myProducts,
  setMyProducts,
  userRole,
  setUserRole,
  onUpdateOrderStatus,
  sellerStatus,
  roles,
  isAdmin,
  showToast,
  onUpdateAvatar,
  defaultTab,
  addresses = [],
  onAddressesChanged,
}: {
  go: (s: Screen) => void;
  onLogout: () => void;
  userName?: string;
  userAvatar?: string;
  userRating?: number;
  userEmail?: string;
  userHandle?: string;
  orders?: Order[];
  myProducts: SellerProduct[];
  setMyProducts: React.Dispatch<React.SetStateAction<SellerProduct[]>>;
  userRole: "buyer" | "seller";
  setUserRole: (role: "buyer" | "seller") => void;
  showToast?: (msg: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order["status"], skipApi?: boolean) => void;
  sellerStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  roles?: string[];
  isAdmin?: boolean;
  onUpdateAvatar?: (url: string) => void;
  defaultTab?: string;
  addresses?: import("../../types").Address[];
  onAddressesChanged?: () => Promise<void> | void;
}) {
  const isUserAdmin = Boolean(isAdmin || roles?.includes("admin") || userEmail === "admin@thriftit.vn");
  // ── State quản lý ──────────────────────────────────────────────────────────
  const [accountTab, setAccountTab] = useState<string>(
    defaultTab || (userRole === "seller" ? "selling" : "purchases")
  );
  const [orderTab, setOrderTab] = useState<"pending" | "shipping" | "delivering" | "review" | "cancelled">("shipping");
  const [sellingTab, setSellingTab] = useState<"all" | "active" | "pending" | "sold" | "reviews">("all");

  useEffect(() => {
    if (defaultTab) {
      setAccountTab(defaultTab);
    } else {
      setAccountTab(userRole === "seller" ? "selling" : "purchases");
    }
  }, [defaultTab, userRole]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      showToast?.("Đang tải ảnh lên...");
      const compressed = await compressImage(file);
      const res = await api.put<{ avatarUrl: string }>("/auth/me/avatar", { avatarUrl: compressed });
      onUpdateAvatar?.(res.avatarUrl);
      showToast?.("Đã cập nhật ảnh đại diện!");
    } catch (err: any) {
      showToast?.(err.message || "Lỗi cập nhật ảnh");
    }
  };

  // ── Seller orders (fetched when user switches to "selling" tab) ──
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(false);

  const loadSellerOrders = useCallback(async () => {
    setSellerOrdersLoading(true);
    try {
      const res = await api.get<{ orders: import("../../lib/api").ApiOrder[] }>("/orders/seller");
      setSellerOrders(res.orders.map((o) => ({
        id: o.orderCode,
        apiId: o._id,
        items: o.items.map((it: any): OrderItem => ({
          id: it.productId,
          name: it.productName,
          price: it.unitPrice,
          size: "",
          qty: it.quantity,
          image: it.productImageUrl ?? "",
          condition: it.conditionSnapshot ?? 0,
          seller: it.sellerHandle || (it.sellerId && typeof it.sellerId === "object" ? (it.sellerId.handle || it.sellerId.shopName) : "") || (typeof it.sellerId === "string" ? it.sellerId : "") || it.seller || "",
        })),
        total: o.totalAmount,
        status: o.status as Order["status"],
        createdAt: new Date(o.createdAt).toLocaleDateString("vi-VN"),
        paymentMethod: o.paymentMethod ?? "",
        shippingName: o.shippingName,
        shippingPhone: o.shippingPhone,
        shippingAddress: o.shippingAddress,
      })));
    } catch {
      // fail silently — seller may not have orders yet
    } finally {
      setSellerOrdersLoading(false);
    }
  }, []);

  const [sellerReviews, setSellerReviews] = useState<any[]>([]);

  useEffect(() => {
    if (accountTab === "selling") {
      loadSellerOrders();
      api.get<{ reviews: any[] }>("/sellers/me/reviews")
        .then((res) => setSellerReviews(res.reviews || []))
        .catch(() => { });
    }
  }, [accountTab, loadSellerOrders]);

  // ── Seller shipment creation dialog ──
  const [shipDialogOrder, setShipDialogOrder] = useState<Order | null>(null);
  // Compute warehouse (pickup) address from saved addresses — surfaces the
  // first saved address as the pickup default (consistent with WarehouseTab).
  const warehousePickup: Address | null =
    addresses.find((a) => a.type === "warehouse") || addresses[0] || null;
  const [shipDialogPickup, setShipDialogPickup] = useState({
    name: warehousePickup?.name || "",
    phone: warehousePickup?.phone || "",
    address: warehousePickup?.detail || "",
    province: warehousePickup?.province || "",
    district: warehousePickup?.ward || "", // legacy 3-level field, mapped to ward
    ward: warehousePickup?.ward || "",
    email: "",
  });
  const [shipCreating, setShipCreating] = useState(false);
  const [shipError, setShipError] = useState("");

  // When seller opens shipment dialog, refresh the pickup from the latest
  // warehouse address — so they always see current values without re-typing.
  useEffect(() => {
    if (warehousePickup) {
      setShipDialogPickup({
        name: warehousePickup.name,
        phone: warehousePickup.phone,
        address: warehousePickup.detail,
        province: warehousePickup.province,
        district: warehousePickup.ward,
        ward: warehousePickup.ward,
        email: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipDialogOrder?.id]);

  // ── Review dialog state ──
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewSellerHandle, setReviewSellerHandle] = useState<string>("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());

  // Resolve shop handle for the item being reviewed
  useEffect(() => {
    if (!reviewOrder || !reviewOrder.items || !reviewOrder.items[0]) {
      setReviewSellerHandle("");
      return;
    }
    const it = reviewOrder.items[0];
    if (it.seller && it.seller !== reviewOrder.shippingName) {
      setReviewSellerHandle(it.seller.replace(/^@+/, ""));
      return;
    }
    const pid = it.id;
    if (pid) {
      api
        .get<{ product: any }>(`/products/${pid}`)
        .then((res) => {
          const s = res.product?.sellerId;
          const handle =
            s?.handle ||
            (typeof s === "string" ? s : "") ||
            (typeof res.product?.seller === "string" ? res.product.seller : "") ||
            s?.shopName;
          if (handle) {
            setReviewSellerHandle(handle.replace(/^@+/, ""));
          }
        })
        .catch(() => {});
    }
  }, [reviewOrder]);

  const RATING_LABELS: Record<number, string> = {
    1: "Không hài lòng",
    2: "Chưa hài lòng",
    3: "Bình thường",
    4: "Hài lòng",
    5: "Rất hài lòng",
  };

  const handleSellerUpdateStatus = (orderId: string, nextStatus: Order["status"], skipApi = false) => {
    setSellerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    onUpdateOrderStatus?.(orderId, nextStatus, skipApi);
  };

  const handleCreateShipment = async () => {
    if (!shipDialogOrder) return;
    setShipCreating(true);
    setShipError("");
    try {
      const res = await api.post<{ shipment: Shipment }>(`/orders/${shipDialogOrder.id}/shipment`, {
        pickup: shipDialogPickup,
      });
      // Update local order status to reflect SHIPPING (do not call onUpdateOrderStatus to avoid 422)
      setSellerOrders((prev) =>
        prev.map((o) => (o.id === shipDialogOrder.id ? { ...o, status: "SHIPPING" as const } : o))
      );
      setShipDialogOrder(null);
      showToast?.(`✓ Đã tạo vận đơn cho #${shipDialogOrder.id}. Đơn hàng đang được vận chuyển!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tạo vận đơn thất bại";
      setShipError(msg);
    } finally {
      setShipCreating(false);
    }
  };

  const handleArchiveProduct = async (product: SellerProduct) => {
    if (!confirm(`Bạn có chắc muốn lưu trữ/xóa sản phẩm "${product.name}" không?`)) return;
    const targetId = product.apiId || String(product.id);
    try {
      await api.patch(`/products/${targetId}/archive`);
      setMyProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast?.(`✓ Đã lưu trữ sản phẩm "${product.name}"`);
    } catch (err: any) {
      showToast?.(`⚠️ ${err.message || "Lỗi lưu trữ sản phẩm"}`);
    }
  };

  // ── Shipping shipments (fetched per order when order tab = shipping) ──
  const [shipments, setShipments] = useState<Record<string, Shipment>>({});
  const [shipmentsLoading, setShipmentsLoading] = useState(false);

  // Fetch shipment for an order when the user lands on "shipping" tab.
  const fetchShipment = useCallback(async (orderCode: string) => {
    if (shipments[orderCode]) return; // already loaded
    setShipmentsLoading(true);
    try {
      const res = await api.get<{ shipment: Shipment }>(`/orders/${orderCode}/shipment`);
      setShipments((prev) => ({ ...prev, [orderCode]: res.shipment }));
    } catch {
      // No shipment yet — that's fine.
    } finally {
      setShipmentsLoading(false);
    }
  }, [shipments]);

  // ── Đơn hàng & filter ──
  const allOrders = orders;
  const filteredOrders = allOrders.filter((o) => getOrderTabStatus(o.status) === orderTab);

  // Auto-fetch shipments for all "shipping" orders when tab opens.
  useEffect(() => {
    if (orderTab === "shipping") {
      filteredOrders.forEach((o) => fetchShipment(o.id));
    }
  }, [orderTab, filteredOrders, fetchShipment]);

  // ── Status badge helpers ──
  const shipmentStatusLabel: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Chờ tạo vận đơn", color: "#6B7280", bg: "#F3F4F6" },
    CREATED: { label: "Đã tạo vận đơn", color: T, bg: T + "18" },
    PICKED_UP: { label: "Đã lấy hàng", color: "#2980B9", bg: "#EBF5FF" },
    IN_TRANSIT: { label: "Đang vận chuyển", color: "#2980B9", bg: "#EBF5FF" },
    DELIVERING: { label: "Đang giao hàng", color: "#27AE60", bg: "#E9F7EF" },
    DELIVERED: { label: "Đã giao hàng", color: "#27AE60", bg: "#E9F7EF" },
    RETURNED: { label: "Hoàn trả", color: "#E67E22", bg: "#FEF9E7" },
    CANCELLED: { label: "Đã hủy vận đơn", color: "#E74C3C", bg: "#FDEDEC" },
    FAILED: { label: "Lỗi vận đơn", color: "#E74C3C", bg: "#FDEDEC" },
  };

  // ── Tin nhắn từ người mua ─────────────────────────────────────────────────
  const [messages] = useState([
    { id: 1, buyer: "minh.nguyen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", product: "Áo Khoác Denim Rửa Cũ 80s", productImg: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=150", message: "Còn size M không ạ?", time: "5 phút trước", unread: true },
    { id: 2, buyer: "thu.tran", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", product: "Quần Jean Ống Rộng", productImg: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=150", message: "Ship cho em đi Hà Nội được không?", time: "1 giờ trước", unread: true },
    { id: 3, buyer: "khanh.nguyen", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", product: "Áo Len Cổ Lọ Cozy", productImg: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=150", message: "Cảm ơn shop, đã nhận được ạ!", time: "Hôm qua", unread: false },
  ]);

  // ── Thống kê cho người bán ─────────────────────────────────────────────────
  const sellerStats = {
    totalProducts: myProducts.length,
    activeProducts: myProducts.filter(p => p.status === "active").length,
    pendingProducts: myProducts.filter(p => p.status === "pending").length,
    soldProducts: myProducts.filter(p => p.status === "sold").length,
    totalViews: myProducts.reduce((sum, p) => sum + p.views, 0),
    totalLikes: myProducts.reduce((sum, p) => sum + p.likes, 0),
    estimatedRevenue: myProducts.filter(p => p.status === "sold").reduce((sum, p) => sum + p.price, 0),
  };

  // ── Tính số đơn theo tab ───────────────────────────────────────────────────
  const orderCounts = {
    pending: allOrders.filter((o) => getOrderTabStatus(o.status) === "pending").length,
    shipping: allOrders.filter((o) => getOrderTabStatus(o.status) === "shipping").length,
    delivering: allOrders.filter((o) => getOrderTabStatus(o.status) === "delivering").length,
    review: allOrders.filter((o) => getOrderTabStatus(o.status) === "review").length,
    cancelled: allOrders.filter((o) => getOrderTabStatus(o.status) === "cancelled").length,
  };

  const orderTabs = [
    { id: "pending" as const, label: "Chờ thanh toán", icon: Clock, count: orderCounts.pending, color: "#E8A838" },
    { id: "shipping" as const, label: "Chờ lấy hàng", icon: Package, count: orderCounts.shipping, color: T },
    { id: "delivering" as const, label: "Đang giao", icon: Truck, count: orderCounts.delivering, color: "#2980B9" },
    { id: "review" as const, label: "Đánh giá", icon: Star, count: orderCounts.review, color: "#27AE60" },
    { id: "cancelled" as const, label: "Đã hủy", icon: X, count: orderCounts.cancelled, color: "#E74C3C" },
  ];

  // ── Filter sản phẩm theo tab bán ─────────────────────────────────────────────
  const filteredProducts = sellingTab === "all" ? myProducts : myProducts.filter(p => p.status === sellingTab);

  // ── Helper ──────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: "bg-green-50", color: "text-green-600", label: "● Đang bán" },
      pending: { bg: "bg-amber-50", color: "text-amber-600", label: "⏳ Chờ duyệt" },
      sold: { bg: "bg-blue-50", color: "text-blue-600", label: "✓ Đã bán" },
    };
    return badges[status] || badges.pending;
  };

  const statusLabel = (status: string): string => {
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
  };

  const unreadMessages = messages.filter(m => m.unread).length;

  // ── Render ──
  const shipmentDialog = shipDialogOrder ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={() => !shipCreating && setShipDialogOrder(null)}
    >
      <div
        className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
        style={{ backgroundColor: LINEN }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-1" style={{ ...serif, color: ESPRESSO }}>
          Tạo vận đơn cho #{shipDialogOrder.id}
        </h3>
        <p className="text-xs mb-3" style={{ color: COFFEE }}>
          Vận đơn sẽ được gửi đến đơn vị vận chuyển. Bạn không thể sửa sau khi tạo.
        </p>

        {/* Warehouse hint */}
        {warehousePickup ? (
          <div
            className="mb-3 p-2.5 rounded-xl border flex items-center gap-2 text-xs"
            style={{ borderColor: `${T}40`, backgroundColor: `${T}08`, color: COFFEE, ...ff }}
          >
            <MapPinned size={14} style={{ color: T }} />
            <span>
              Đang dùng kho hàng đã lưu — có thể chỉnh tay nếu cần.
            </span>
          </div>
        ) : (
          <div
            className="mb-3 p-2.5 rounded-xl border text-xs"
            style={{ borderColor: "#F0AD", backgroundColor: "#FFF9E6", color: "#8A6D3B", ...ff }}
          >
            ⚠️ Bạn chưa thiết lập kho hàng. Đi đến tab{" "}
            <strong>Kho hàng</strong> trong trang Tài khoản để lưu địa chỉ kho
            một lần — hệ thống sẽ tự động điền cho các vận đơn sau.
          </div>
        )}

        <div className="space-y-3">
          {[
            { key: "name" as const, label: "Tên cửa hàng" },
            { key: "phone" as const, label: "Số điện thoại" },
            { key: "address" as const, label: "Địa chỉ lấy hàng (số nhà, đường)" },
            { key: "ward" as const, label: "Phường/Xã" },
            { key: "province" as const, label: "Tỉnh/Thành" },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-semibold" style={{ color: COFFEE, ...ff }}>{field.label}</label>
              <input
                value={shipDialogPickup[field.key]}
                onChange={(e) => setShipDialogPickup((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: MUTED, ...ff }}
                disabled={shipCreating}
              />
            </div>
          ))}
        </div>
        {shipError && (
          <div className="mt-3 p-2 rounded-lg text-xs" style={{ backgroundColor: "#FDEDEC", color: "#E74C3C" }}>
            ⚠️ {shipError}
          </div>
        )}
        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={() => setShipDialogOrder(null)}
            disabled={shipCreating}
            className="px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: MUTED, color: COFFEE, ...ff }}
          >
            Hủy
          </button>
          <button
            onClick={handleCreateShipment}
            disabled={
              shipCreating ||
              !shipDialogPickup.address ||
              !shipDialogPickup.ward
            }
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: T, color: LINEN, ...ff }}
          >
            {shipCreating ? "Đang tạo…" : "Tạo vận đơn"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const reviewDialog = reviewOrder ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={() => {
        if (!isSubmittingReview) {
          setReviewOrder(null);
          setHoverRating(null);
        }
      }}
    >
      <div
        className="rounded-3xl shadow-2xl p-6 sm:p-7 max-w-md w-full border animate-scale-up"
        style={{ backgroundColor: LINEN, borderColor: `${MUTED}90` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b" style={{ borderColor: `${MUTED}80` }}>
          <h3 className="text-xl font-bold tracking-tight" style={{ ...serif, color: ESPRESSO }}>
            Đánh giá sản phẩm
          </h3>
          <button
            type="button"
            onClick={() => {
              if (!isSubmittingReview) {
                setReviewOrder(null);
                setHoverRating(null);
              }
            }}
            disabled={isSubmittingReview}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Box */}
        <div
          className="flex items-center gap-3.5 mb-5 p-3 rounded-2xl border"
          style={{ backgroundColor: SOFT, borderColor: MUTED }}
        >
          {reviewOrder.items[0]?.image ? (
            <img
              src={reviewOrder.items[0].image}
              alt={reviewOrder.items[0]?.name || "Sản phẩm"}
              className="w-13 h-13 rounded-xl object-cover border border-white/60 shadow-xs flex-shrink-0"
            />
          ) : (
            <PlaceholderImage
              width={52}
              height={52}
              radius={12}
              label="Chưa có ảnh"
              icon={<ImageOff size={20} />}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-[#3A2312]" style={ff}>
              {reviewOrder.items[0]?.name || "Sản phẩm vintage"}
            </p>
            <p className="text-xs text-[#6F4E37] truncate mt-0.5 font-medium" style={ff}>
              @{reviewSellerHandle || (reviewOrder.items[0]?.seller && reviewOrder.items[0].seller !== reviewOrder.shippingName ? reviewOrder.items[0].seller.replace(/^@+/, "") : "shop")}
            </p>
          </div>
        </div>

        {/* Rating Question & Centered Star Selector */}
        <div className="mb-5 text-center">
          <label className="text-sm font-bold block mb-2.5" style={{ color: ESPRESSO, ...ff }}>
            Bạn đánh giá sản phẩm này thế nào?
          </label>
          <div className="flex items-center justify-center gap-3 py-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const activeRating = hoverRating !== null ? hoverRating : reviewRating;
              const isFilled = star <= activeRating;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setReviewRating(star)}
                  className="transition-transform hover:scale-120 active:scale-95 cursor-pointer p-0.5 focus:outline-none"
                  title={`${star} ★ - ${RATING_LABELS[star]}`}
                >
                  <Star
                    size={34}
                    fill={isFilled ? T : "none"}
                    stroke={isFilled ? T : MUTED}
                    strokeWidth={1.8}
                  />
                </button>
              );
            })}
          </div>
          <p
            className="text-sm font-bold mt-2 h-5 transition-colors select-none"
            style={{
              color: (hoverRating !== null || reviewRating > 0) ? T : COFFEE,
              ...ff,
            }}
          >
            {(hoverRating !== null || reviewRating > 0)
              ? `${hoverRating !== null ? hoverRating : reviewRating} ★  ${RATING_LABELS[hoverRating !== null ? hoverRating : reviewRating]}`
              : "Chọn mức đánh giá"}
          </p>
        </div>

        {/* Review Comment Textarea with Character Counter */}
        <div className="mb-6">
          <label className="text-xs font-bold block mb-2" style={{ color: ESPRESSO, ...ff }}>
            Nhận xét
          </label>
          <div className="relative">
            <textarea
              value={reviewComment}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setReviewComment(e.target.value);
                }
              }}
              maxLength={500}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows={4}
              className="w-full px-3.5 py-3 pb-8 rounded-2xl text-sm border outline-none resize-none transition-all focus:ring-2 focus:ring-amber-500/40"
              style={{
                borderColor: MUTED,
                backgroundColor: "#FFFFFF",
                color: ESPRESSO,
                ...ff,
              }}
            />
            <span
              className="absolute right-3.5 bottom-2.5 text-xs font-medium pointer-events-none select-none"
              style={{
                color: reviewComment.length >= 480 ? "#E74C3C" : COFFEE + "99",
                ...ff,
              }}
            >
              {reviewComment.length}/500
            </span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setReviewOrder(null);
              setHoverRating(null);
            }}
            disabled={isSubmittingReview}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:bg-stone-100 disabled:opacity-50 cursor-pointer"
            style={{ borderColor: MUTED, color: COFFEE, ...ff }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={async () => {
              if (reviewRating === 0) {
                showToast?.("⚠️ Vui lòng chọn số sao đánh giá sản phẩm!");
                return;
              }
              setIsSubmittingReview(true);
              try {
                // Ensure order status is COMPLETED per OpenAPI state transition
                if (reviewOrder.status !== "COMPLETED") {
                  await api.patch(`/orders/${reviewOrder.id || reviewOrder.apiId}/status`, { status: "COMPLETED" }).catch(() => { });
                }

                const productId = reviewOrder.items[0]?.productApiId || reviewOrder.items[0]?.apiId || reviewOrder.items[0]?.id;
                await api.post(`/products/${productId}/reviews`, {
                  rating: reviewRating,
                  comment: reviewComment || RATING_LABELS[reviewRating] || "Đã nhận hàng",
                  orderId: reviewOrder.id || reviewOrder.apiId,
                });
                onUpdateOrderStatus && onUpdateOrderStatus(reviewOrder.id, "COMPLETED", true);
                setReviewedOrders((prev) => new Set(prev).add(reviewOrder.id));
                setReviewOrder(null);
                setReviewComment("");
                setReviewRating(0);
                setHoverRating(null);
                showToast?.("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
              } catch (err: any) {
                showToast?.(`⚠️ ${err.message || "Đánh giá thất bại"}`);
              } finally {
                setIsSubmittingReview(false);
              }
            }}
            disabled={isSubmittingReview}
            className="px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: "#27AE60", color: LINEN, ...ff }}
          >
            {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: LINEN }}>
      {shipmentDialog}
      {reviewDialog}
      {/* Profile header */}
      <div style={{ background: `linear-gradient(135deg, ${ESPRESSO} 0%, ${COFFEE} 100%)` }}>
        <div className="w-full px-4 md:px-8 xl:px-10 py-8 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
          <div className="relative group cursor-pointer">
            <label htmlFor="avatar-upload" className="cursor-pointer block">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 shadow-lg transition-all group-hover:opacity-80 mx-auto md:mx-0"
                  style={{ borderColor: T }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg transition-all group-hover:opacity-80 mx-auto md:mx-0 font-bold text-3xl select-none"
                  style={{
                    borderColor: T,
                    backgroundColor: SOFT,
                    color: ESPRESSO,
                    ...ff,
                  }}
                >
                  {userName ? userName[0].toUpperCase() : "U"}
                </div>
              )}
              {!isUserAdmin && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit3 size={20} style={{ color: LINEN }} />
                  <span className="text-[10px] text-white mt-1">Đổi ảnh</span>
                </div>
              )}
            </label>
            {!isUserAdmin && (
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            )}
          </div>
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            <h2 className="text-2xl font-bold" style={{ ...serif, color: LINEN }}>{userName}</h2>
            <p className="text-sm mt-0.5" style={{ color: MUTED, ...ff }}>
              {userRole === "seller" && userHandle ? `@${userHandle}` : userEmail}
            </p>
            {isUserAdmin ? (
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-5 mt-3">
                <span className="text-sm px-2.5 py-0.5 rounded-full font-bold bg-amber-500 text-espresso" style={ff}>Hệ thống Admin</span>
              </div>
            ) : userRole === "seller" && sellerStatus === "APPROVED" ? (
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <RatingStars
                    rating={
                      sellerReviews.length > 0
                        ? sellerReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / sellerReviews.length
                        : (userRating ?? 5)
                    }
                    size={13}
                  />
                  <span className="text-sm font-bold" style={{ color: T, ...ff }}>
                    {(sellerReviews.length > 0
                      ? sellerReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / sellerReviews.length
                      : (userRating ?? 5)
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="hidden md:block h-4 w-px" style={{ backgroundColor: MUTED + "66" }} />
                <span className="text-sm" style={{ color: MUTED, ...ff }}>
                  {Math.max(sellerStats.soldProducts, sellerOrders.length, sellerReviews.length)} giao dịch
                </span>
                <div className="hidden md:block h-4 w-px" style={{ backgroundColor: MUTED + "66" }} />
                {(sellerReviews.length > 0
                  ? sellerReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / sellerReviews.length
                  : (userRating ?? 5)) >= 4.0 &&
                Math.max(sellerStats.soldProducts, sellerOrders.length, sellerReviews.length) >= 5 ? (
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-xs"
                    style={{ backgroundColor: T + "33", borderColor: T + "66", color: "#FDE68A", ...ff }}
                  >
                    Shop uy tín ✓
                  </span>
                ) : (
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-xs"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "#FFF9F4",
                      ...ff,
                    }}
                  >
                    Shop mới
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2.5">
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    color: LINEN,
                    ...ff,
                  }}
                >
                  Tài khoản Người mua
                </span>
              </div>
            )}
          </div>
          <div className="md:ml-auto flex flex-wrap justify-center items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            {!isUserAdmin ? (
              <>
                {/* Toggle Buyer / Seller mode */}
                {sellerStatus === "APPROVED" && (
                  <button
                    onClick={() => {
                      const newRole = userRole === "buyer" ? "seller" : "buyer";
                      setUserRole(newRole);
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all"
                    style={{
                      borderColor: T,
                      color: T,
                      backgroundColor: "transparent",
                      ...ff
                    }}
                  >
                    <Store size={15} />
                    {userRole === "buyer" ? "Kênh người bán" : "Kênh mua hàng"}
                  </button>
                )}

                {sellerStatus === "PENDING" ? (
                  <div
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border shadow-xs select-none"
                    style={{
                      borderColor: "#F59E0B",
                      backgroundColor: "rgba(245, 158, 11, 0.2)",
                      color: "#FEF3C7",
                      ...ff,
                    }}
                    title="Hồ sơ người bán của bạn đang được xét duyệt"
                  >
                    <Clock size={16} className="text-amber-300" />
                    <span>Hồ sơ đang chờ duyệt</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (sellerStatus === "APPROVED") go("post");
                      else go("seller-apply");
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: T, color: LINEN, ...ff }}
                  >
                    <PlusCircle size={17} />
                    {sellerStatus === "APPROVED" ? "Đăng bán sản phẩm" : "Đăng bán ngay"}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => go("admin")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all hover:opacity-90 bg-amber-500 text-espresso"
                style={ff}
              >
                <Shield size={17} />
                Mở Admin Panel
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-white/10"
              style={{ borderColor: "#E74C3C", color: "#E74C3C", ...ff }}
            >
              <LogOut size={17} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {isUserAdmin ? (
        <div className="w-full px-4 md:px-8 xl:px-10 py-12">
          <div className="bg-white border border-muted rounded-3xl p-6 md:p-10 text-center shadow-sm max-w-2xl mx-auto animate-fade-in">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold font-serif" style={{ color: ESPRESSO, ...serif }}>Tài khoản Điều hành Admin</h3>
            <p className="text-sm text-coffee mt-3 leading-relaxed" style={ff}>
              Tài khoản này chỉ dùng để quản lý hệ thống. Bạn không tham gia các hoạt động thương mại như mua hàng hoặc ký gửi trên cửa hàng.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Để phê duyệt các sản phẩm chờ duyệt của người dùng, hãy mở Kênh quản trị chuyên dụng.
            </p>
            <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
              <button
                onClick={() => go("admin")}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md w-full md:w-auto"
                style={{ backgroundColor: T }}
              >
                Mở Bảng điều khiển Admin
              </button>
              <button
                onClick={onLogout}
                className="px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all hover:bg-gray-50 w-full md:w-auto"
                style={{ borderColor: MUTED, color: COFFEE }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full px-4 md:px-8 xl:px-10 py-8">
          {/* Tab điều hướng chính */}
          <div className="flex items-center gap-2 mb-6 md:mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {(userRole === "seller" ? [
              { id: "selling", label: "Kinh doanh", icon: TrendingUp },
              { id: "warehouse", label: "Kho hàng", icon: MapPinned },
              { id: "messages", label: "Tin nhắn", icon: MessageCircle, badge: unreadMessages },
            ] : [
              { id: "purchases", label: "Đơn mua", icon: ShoppingBag },
              { id: "addresses", label: "Sổ địa chỉ", icon: MapPinned },
              { id: "messages", label: "Tin nhắn", icon: MessageCircle, badge: unreadMessages },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAccountTab(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  backgroundColor: accountTab === tab.id ? COFFEE : CARD,
                  color: accountTab === tab.id ? LINEN : COFFEE,
                  border: `1px solid ${accountTab === tab.id ? COFFEE : MUTED}`,
                  ...ff
                }}
              >
                <tab.icon size={17} />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#E74C3C", color: LINEN }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── TAB: ĐƠN MUA ─────────────────────────────────────────────────── */}
          {accountTab === "purchases" && (
            <div>
              <h2 className="text-xl font-bold mb-5" style={{ ...serif, color: ESPRESSO }}>Đơn mua của tôi</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {orderTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderTab(tab.id)}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all hover:shadow-md"
                    style={{ backgroundColor: orderTab === tab.id ? tab.color + "18" : CARD, border: `2px solid ${orderTab === tab.id ? tab.color : MUTED}` }}
                  >
                    <div className="relative">
                      <tab.icon size={26} style={{ color: tab.color }} strokeWidth={1.8} />
                      {tab.count > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: tab.color, color: LINEN, ...ff }}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight px-1" style={{ color: orderTab === tab.id ? tab.color : COFFEE, ...ff }}>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl shadow-sm" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                    <div className="flex gap-4">
                      <img src={order.items[0]?.image} alt={order.items[0]?.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0 md:hidden block">
                        <p className="text-sm font-semibold" style={{ color: ESPRESSO, ...ff }}>
                          {order.items[0]?.name}{order.items.length > 1 && ` (+${order.items.length - 1} sản phẩm khác)`}
                        </p>
                        <p className="text-base font-bold mt-1" style={{ ...serif, color: T }}>{fmt(order.total)}</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 hidden md:block">
                      <p className="text-sm font-semibold" style={{ color: ESPRESSO, ...ff }}>
                        {order.items[0]?.name}{order.items.length > 1 && ` (+${order.items.length - 1} sản phẩm khác)`}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: COFFEE, ...ff }}>
                        @{order.items[0]?.seller} · #{order.id} · {order.createdAt}
                      </p>
                      {order.shippingAddress && (
                        <p className="text-[11px] mt-1 italic max-w-[400px]" style={{ color: COFFEE + "aa", ...ff }}>
                          Giao tới: <strong>{order.shippingName}</strong> ({order.shippingPhone}) - {order.shippingAddress}
                        </p>
                      )}
                      <span className="inline-block text-xs px-2.5 py-0.5 rounded-full mt-2" style={{ backgroundColor: SOFT, color: COFFEE, ...ff }}>
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    {/* Mobile details block */}
                    <div className="md:hidden">
                      <p className="text-xs" style={{ color: COFFEE, ...ff }}>
                        @{order.items[0]?.seller} · #{order.id} · {order.createdAt}
                      </p>
                      {order.shippingAddress && (
                        <p className="text-[11px] mt-1 italic" style={{ color: COFFEE + "aa", ...ff }}>
                          Giao tới: <strong>{order.shippingName}</strong> - {order.shippingAddress}
                        </p>
                      )}
                      <span className="inline-block text-xs px-2.5 py-0.5 rounded-full mt-2 mb-3" style={{ backgroundColor: SOFT, color: COFFEE, ...ff }}>
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    <div className="md:text-right flex-shrink-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0" style={{ borderColor: MUTED }}>
                      <p className="text-base font-bold" style={{ ...serif, color: T }}>{fmt(order.total)}</p>
                      <div className="mt-2 flex gap-2 justify-end flex-wrap">
                        {getOrderTabStatus(order.status) === "pending" && (
                          <button
                            onClick={async () => {
                              try {
                                showToast?.("Đang kết nối cổng thanh toán...");
                                await api.post(`/payments/checkout`, {
                                  orderId: order.apiId || order.id,
                                  method: "card",
                                  cardLast4: "1234",
                                });
                                showToast?.("Đã thanh toán thành công!");
                                onUpdateOrderStatus && onUpdateOrderStatus(order.id, "PAID");
                              } catch (err: any) {
                                showToast?.(`⚠️ Lỗi thanh toán: ${err.message || "Thử lại sau"}`);
                              }
                            }}
                            className="text-xs px-4 py-2 rounded-lg font-bold transition-all hover:opacity-90 shadow-md"
                            style={{ backgroundColor: T, color: LINEN, ...ff }}
                          >
                            Tiếp tục thanh toán
                          </button>
                        )}
                        {getOrderTabStatus(order.status) === "shipping" && (
                          <>
                            {/* ── Shipment tracking panel ── */}
                            {(() => {
                              const ship = shipments[order.id];
                              const loading = shipmentsLoading && !ship;
                              return (
                                <div className="w-full text-left">
                                  {loading && (
                                    <div className="mb-2 px-3 py-2 rounded-lg text-xs animate-pulse" style={{ backgroundColor: SOFT }}>
                                      Đang tải thông tin vận đơn…
                                    </div>
                                  )}
                                  {ship ? (
                                    <div className="mb-2 px-3 py-2 rounded-xl text-xs space-y-1" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                                      {/* Provider + tracking number */}
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold capitalize" style={{ color: ESPRESSO }}>
                                          {ship.provider === "mock" ? "Giao hàng tiết kiệm" : ship.provider}
                                        </span>
                                        <span
                                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                          style={{ backgroundColor: (shipmentStatusLabel[ship.status]?.bg ?? "#F3F4F6"), color: (shipmentStatusLabel[ship.status]?.color ?? "#6B7280") }}
                                        >
                                          {shipmentStatusLabel[ship.status]?.label ?? ship.status}
                                        </span>
                                      </div>
                                      {/* Tracking number */}
                                      <div className="flex items-center gap-1.5">
                                        <span style={{ color: COFFEE }}>Mã vận đơn:</span>
                                        <code className="font-mono font-semibold" style={{ color: ESPRESSO }}>{ship.trackingNumber}</code>
                                        {ship.trackingUrl && (
                                          <a
                                            href={ship.trackingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-1"
                                            title="Theo dõi trên GHTK"
                                          >
                                            <ExternalLink size={11} style={{ color: T }} />
                                          </a>
                                        )}
                                      </div>
                                      {/* Estimated delivery */}
                                      {ship.estimatedDeliveryAt && (
                                        <div className="flex items-center gap-1.5" style={{ color: COFFEE }}>
                                          <MapPinned size={11} />
                                          <span>Dự kiến giao: {new Date(ship.estimatedDeliveryAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                        </div>
                                      )}
                                      {/* Shipped / Delivered */}
                                      {ship.shippedAt && (
                                        <div className="text-[11px]" style={{ color: COFFEE }}>
                                          📦 Đã bàn giao cho đơn vị vận chuyển
                                        </div>
                                      )}
                                      {ship.deliveredAt && (
                                        <div className="text-[11px]" style={{ color: "#27AE60" }}>
                                          ✅ Đã giao: {new Date(ship.deliveredAt).toLocaleDateString("vi-VN")}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mb-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: SOFT, color: COFFEE }}>
                                      Chưa có thông tin vận đơn. Shop đang chuẩn bị hàng.
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            <div className="flex gap-2 justify-end flex-wrap mt-1">
                              <button className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all hover:opacity-80" style={{ borderColor: MUTED, color: COFFEE, ...ff }}>Xem chi tiết</button>
                              {!["SHIPPING", "DELIVERING", "DELIVERED", "COMPLETED", "CANCEL_REQUESTED", "CANCELLED", "REFUNDED"].includes(order.status) && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.id} không? Đơn sẽ chờ seller duyệt hủy.`)) {
                                      try {
                                        await api.patch(`/orders/${order.id || order.apiId}/status`, {
                                          status: "CANCEL_REQUESTED",
                                          reason: "Yêu cầu hủy từ buyer"
                                        });
                                        onUpdateOrderStatus && onUpdateOrderStatus(order.id, "CANCEL_REQUESTED", true);
                                        showToast?.("✓ Đã gửi yêu cầu hủy đến seller");
                                      } catch (err: any) {
                                        showToast?.(`⚠️ Thao tác thất bại: ${err.message}`);
                                      }
                                    }
                                  }}
                                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
                                  style={{ backgroundColor: "#FDEDEC", color: "#E74C3C", ...ff }}
                                >
                                  Yêu cầu hủy
                                </button>
                              )}
                            </div>
                          </>
                        )}
                        {getOrderTabStatus(order.status) === "delivering" && (
                          <>
                            {(order.status === "DELIVERING" || order.status === "DELIVERED") && (
                              <button
                                onClick={async () => {
                                  // Backend rule: buyer can only set CANCELLED or COMPLETED.
                                  // The state machine must walk SHIPPING/DELIVERING → COMPLETED,
                                  // which may require a DELIVERED hop first. Try direct COMPLETED,
                                  // then DELIVERED → COMPLETED as fallback.
                                  const code = order.id || order.apiId;
                                  if (!code) {
                                    showToast?.("⚠️ Thiếu mã đơn hàng.");
                                    return;
                                  }
                                  try {
                                    await api.patch(`/orders/${code}/status`, { status: "COMPLETED" });
                                    onUpdateOrderStatus?.(order.id, "COMPLETED", true);
                                    showToast?.("✓ Đã xác nhận nhận hàng. Cảm ơn bạn!");
                                  } catch (err1: any) {
                                    try {
                                      await api.patch(`/orders/${code}/status`, { status: "DELIVERED" });
                                      await api.patch(`/orders/${code}/status`, { status: "COMPLETED" });
                                      onUpdateOrderStatus?.(order.id, "COMPLETED", true);
                                      showToast?.("✓ Đã xác nhận nhận hàng. Cảm ơn bạn!");
                                    } catch (err2: any) {
                                      const msg = err2?.message || err1?.message || "Không thể xác nhận đơn hàng";
                                      showToast?.(`⚠️ ${msg}`);
                                    }
                                  }
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
                                style={{ backgroundColor: "#27AE60", color: LINEN, ...ff }}
                              >
                                Xác nhận đã nhận
                              </button>
                            )}
                            <button className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all hover:opacity-80" style={{ borderColor: MUTED, color: COFFEE, ...ff }}>Xem chi tiết</button>
                          </>
                        )}
                        {getOrderTabStatus(order.status) === "review" && (
                          <>
                            {order.status === "COMPLETED" && !reviewedOrders.has(order.id) ? (
                              <button
                                onClick={() => {
                                  setReviewOrder(order);
                                  setReviewRating(0);
                                  setHoverRating(null);
                                  setReviewComment("");
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80 cursor-pointer"
                                style={{ backgroundColor: "#27AE60", color: LINEN, ...ff }}
                              >
                                Đánh giá ngay
                              </button>
                            ) : (
                              <span className="text-xs font-semibold px-3 py-1.5" style={{ color: "#27AE60", ...ff }}>
                                ✓ Đã đánh giá
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="py-20 flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full" style={{ backgroundColor: MUTED + '22' }}>
                      <Package size={36} style={{ color: COFFEE }} />
                    </div>
                    <div>
                      <p className="text-lg font-bold" style={{ color: ESPRESSO, ...serif }}>Chưa có đơn hàng nào</p>
                      <p className="text-sm mt-1 mb-5" style={{ color: COFFEE, ...ff }}>Bạn chưa có đơn hàng nào trong trạng thái này.</p>
                    </div>
                    <button
                      onClick={() => go("search")}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-sm"
                      style={{ backgroundColor: T, color: LINEN, ...ff }}
                    >
                      Khám phá đồ vintage
                    </button>
                  </div>
                )}
              </div>

              {sellerStatus !== "APPROVED" && sellerStatus !== "PENDING" && (
                <div className="mt-8 p-6 rounded-2xl flex items-center justify-between shadow-sm" style={{ backgroundColor: "#E9F7EF", border: `1px solid #27AE60` }}>
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "#27AE60", ...serif }}>
                      <Store size={20} /> Trở thành người bán
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "#27AE60", opacity: 0.8, ...ff }}>
                      Đăng ký ngay để bắt đầu bán đồ cũ và nhận ưu đãi từ thrift it!
                    </p>
                  </div>
                  <button
                    onClick={() => go("seller-apply")}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "#27AE60", color: "#fff", ...ff }}
                  >
                    Đăng ký ngay
                  </button>
                </div>
              )}

              {sellerStatus === "PENDING" && (
                <div
                  className="mt-8 p-6 rounded-2xl flex items-center gap-4 shadow-sm border"
                  style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <Clock size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-amber-900" style={serif}>
                      Đơn đăng ký người bán đang chờ phê duyệt
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800/80 mt-1" style={ff}>
                      Hồ sơ bán hàng của bạn đang được Admin xem xét. Khi được duyệt, bạn sẽ có thể đăng bán sản phẩm và mở gian hàng. Bạn không cần nộp lại đơn.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: KINH DOANH (BÁN HÀNG) ───────────────────────────────────── */}
          {accountTab === "selling" && (
            sellerStatus === "PENDING" ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-amber-200 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} />
                </div>
                <h3 className="text-xl font-bold" style={{ ...serif, color: ESPRESSO }}>
                  Kênh người bán đang chờ xét duyệt
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto mt-2 leading-relaxed" style={ff}>
                  Hồ sơ mở shop của bạn đang được ban quản trị xét duyệt. Khi được duyệt, bạn sẽ có thể đăng bán sản phẩm và theo dõi doanh thu tại đây.
                </p>
                <button
                  onClick={() => setAccountTab("purchases")}
                  className="mt-6 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: T, ...ff }}
                >
                  Xem đơn mua hàng của tôi
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-5" style={{ ...serif, color: ESPRESSO }}>Bảng điều khiển kinh doanh</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Sản phẩm đang bán", value: sellerStats.activeProducts, icon: Store, color: "#27AE60" },
                    { label: "Doanh thu ước tính", value: fmt(sellerStats.estimatedRevenue), icon: DollarSign, color: T },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + "18" }}>
                          <stat.icon size={18} style={{ color: stat.color }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: COFFEE, ...ff }}>{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold" style={{ ...serif, color: ESPRESSO }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* ── Đơn hàng cần xử lý (seller) ── */}
                <h3 className="text-lg font-bold mb-4" style={{ ...serif, color: ESPRESSO }}>Đơn hàng cần xử lý</h3>
                {sellerOrdersLoading ? (
                  <div className="p-6 text-center text-sm" style={{ color: COFFEE }}>Đang tải đơn hàng…</div>
                ) : sellerOrders.filter((o) => ["PAID", "CONFIRMED", "PACKING", "SHIPPING", "DELIVERING"].includes(o.status)).length === 0 ? (
                  <div className="py-12 rounded-2xl flex flex-col items-center justify-center gap-3 mb-8 text-center" style={{ backgroundColor: CARD, border: `1px dashed ${MUTED}` }}>
                    <Package size={32} style={{ color: MUTED }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>Tất cả đã hoàn tất!</p>
                      <p className="text-xs mt-1" style={{ color: COFFEE, ...ff }}>Chưa có đơn hàng nào cần bạn xử lý lúc này.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mb-8">
                    {sellerOrders
                      .filter((o) => ["PAID", "CONFIRMED", "PACKING", "SHIPPING", "DELIVERING"].includes(o.status))
                      .map((order) => {
                        const isPacking = order.status === "PACKING";
                        return (
                          <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                            <div className="flex gap-4">
                              <img src={order.items[0]?.image} alt={order.items[0]?.name} className="w-16 h-16 rounded-xl object-cover" />
                              <div className="flex-1 min-w-0 md:hidden block">
                                <p className="text-sm font-semibold" style={{ color: ESPRESSO, ...ff }}>{order.items[0]?.name}</p>
                                <p className="text-sm font-bold mt-1" style={{ color: T, ...serif }}>{fmt(order.total)}</p>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 hidden md:block">
                              <p className="text-sm font-semibold" style={{ color: ESPRESSO, ...ff }}>{order.items[0]?.name}</p>
                              <p className="text-xs" style={{ color: COFFEE, ...ff }}>#{order.id} · {order.createdAt}</p>
                              {order.shippingAddress && (
                                <p className="text-[11px] mt-1 italic" style={{ color: COFFEE + "aa", ...ff }}>→ {order.shippingAddress}</p>
                              )}
                            </div>
                            {/* Mobile details */}
                            <div className="md:hidden">
                              <p className="text-xs" style={{ color: COFFEE, ...ff }}>#{order.id} · {order.createdAt}</p>
                              {order.shippingAddress && (
                                <p className="text-[11px] mt-1 italic" style={{ color: COFFEE + "aa", ...ff }}>→ {order.shippingAddress}</p>
                              )}
                            </div>
                            <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0" style={{ borderColor: MUTED }}>
                              <p className="text-sm font-bold" style={{ color: T, ...serif }}>{fmt(order.total)}</p>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: SOFT, color: COFFEE }}>{statusLabel(order.status)}</span>
                              <div className="flex gap-2 flex-wrap justify-end">
                                {(order.status === "CONFIRMED" || order.status === "PAID") && (
                                  <button
                                    onClick={() => handleSellerUpdateStatus(order.id, order.status === "PAID" ? "CONFIRMED" : "PACKING")}
                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
                                    style={{ backgroundColor: T, color: LINEN, ...ff }}
                                  >
                                    {order.status === "PAID" ? "Xác nhận đơn" : "Bắt đầu đóng gói"}
                                  </button>
                                )}
                                {isPacking && (
                                  <button
                                    onClick={() => {
                                      // Open shipment dialog with empty pickup fields — seller fills them in
                                      setShipDialogOrder(order);
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
                                    style={{ backgroundColor: T, color: LINEN, ...ff }}
                                  >
                                    <Truck size={12} className="inline mr-1" /> Tạo vận đơn
                                  </button>
                                )}
                                {(order.status === "SHIPPING" || order.status === "DELIVERING") && (
                                  <button
                                    onClick={async () => {
                                      handleSellerUpdateStatus(order.id, order.status === "SHIPPING" ? "DELIVERING" : "DELIVERED");
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all hover:opacity-80"
                                    style={{ borderColor: "#27AE60", color: "#27AE60", ...ff }}
                                  >
                                    {order.status === "SHIPPING" ? "Cập nhật: Đang đi giao" : "Cập nhật: Đã giao thành công"}
                                  </button>
                                )}
                                {order.status === "CANCEL_REQUESTED" && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Chấp nhận yêu cầu hủy đơn hàng #${order.id}?`)) {
                                        handleSellerUpdateStatus(order.id, "CANCELLED");
                                      }
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
                                    style={{ backgroundColor: "#E74C3C", color: LINEN, ...ff }}
                                  >
                                    Duyệt hủy đơn
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ ...serif, color: ESPRESSO }}>Quản lý sản phẩm</h3>
                  <button
                    onClick={() => go("post")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: T, color: LINEN, ...ff }}
                  >
                    <PlusCircle size={15} />
                    Đăng sản phẩm mới
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  {[
                    { id: "all" as const, label: "Tất cả", count: sellerStats.totalProducts },
                    { id: "active" as const, label: "Đang bán", count: sellerStats.activeProducts },
                    { id: "pending" as const, label: "Chờ duyệt", count: sellerStats.pendingProducts },
                    { id: "sold" as const, label: "Đã bán", count: sellerStats.soldProducts },
                    { id: "reviews" as const, label: "Đánh giá", count: sellerReviews.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSellingTab(tab.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ backgroundColor: sellingTab === tab.id ? COFFEE : SOFT, color: sellingTab === tab.id ? LINEN : COFFEE }}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {sellingTab === "reviews" ? (
                  <div className="space-y-4">
                    {sellerReviews.length === 0 ? (
                      <div className="p-8 text-center" style={{ color: COFFEE, ...ff }}>
                        Chưa có đánh giá nào từ khách hàng
                      </div>
                    ) : (
                      sellerReviews.map((review: any) => (
                        <div key={review.id} className="p-4 rounded-2xl flex gap-4" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold" style={{ color: COFFEE }}>
                            {review.userName?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-sm" style={{ color: ESPRESSO }}>{review.userName}</h4>
                                <p className="text-xs" style={{ color: COFFEE }}>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
                              </div>
                              <RatingStars rating={review.rating} size={14} />
                            </div>
                            <p className="text-sm mt-2" style={{ color: ESPRESSO }}>{review.comment || "Không có bình luận"}</p>
                            <div className="mt-3 p-3 rounded-lg flex gap-3 items-center" style={{ backgroundColor: SOFT }}>
                              <img src={review.productImage} alt={review.productName} className="w-10 h-10 rounded-md object-cover" />
                              <div>
                                <p className="text-xs font-semibold" style={{ color: ESPRESSO }}>{review.productName}</p>
                                <p className="text-[10px]" style={{ color: COFFEE }}>Đơn hàng: #{review.orderId.substring(review.orderId.length - 6)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => {
                      const badge = getStatusBadge(product.status);
                      return (
                        <div key={product.id} className="flex gap-4 p-4 rounded-2xl transition-all hover:shadow-md" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                          <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>{product.name}</h4>
                                <p className="text-lg font-bold mt-1" style={{ ...serif, color: T }}>{fmt(product.price)}</p>
                                <p className="text-xs mt-1" style={{ color: COFFEE, ...ff }}>Còn lại: {product.quantity} cái · Đăng: {product.createdAt}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.color}`} style={{ borderColor: "currentColor" }}>{badge.label}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COFFEE, ...ff }}>
                                <Star size={14} fill={product.avgRating ? "#E8A838" : "none"} stroke={product.avgRating ? "#E8A838" : MUTED} />
                                {product.avgRating ? (
                                  <span>{product.avgRating.toFixed(1)} ({product.reviewCount} đánh giá)</span>
                                ) : (
                                  <span style={{ color: MUTED }}>Chưa có đánh giá</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => go("post")} className="px-3 py-1.5 text-xs rounded-xl border font-semibold transition-all hover:opacity-80" style={{ borderColor: MUTED, color: COFFEE, ...ff }}>Sửa</button>
                            <button onClick={() => handleArchiveProduct(product)} className="px-3 py-1.5 text-xs rounded-xl font-semibold transition-all hover:opacity-80" style={{ backgroundColor: "#FDEDEC", color: "#E74C3C", ...ff }}>Xóa</button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <div className="py-12 flex flex-col items-center gap-3">
                        <Store size={48} style={{ color: MUTED }} />
                        <p className="text-base" style={{ color: COFFEE, ...ff }}>Chưa có sản phẩm nào</p>
                        <button onClick={() => go("post")} className="mt-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90" style={{ backgroundColor: T, color: LINEN, ...ff }}>Đăng sản phẩm đầu tiên</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

          {/* ── TAB: TIN NHẮN ─────────────────────────────────────────────────── */}
          {accountTab === "messages" && (
            <div>
              <h2 className="text-xl font-bold mb-5" style={{ ...serif, color: ESPRESSO }}>Tin nhắn từ người mua</h2>
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex gap-4 p-4 rounded-2xl transition-all hover:shadow-md"
                    style={{ backgroundColor: CARD, border: `1px solid ${MUTED}`, borderLeft: msg.unread ? `3px solid ${T}` : `1px solid ${MUTED}` }}
                  >
                    <img src={msg.avatar} alt={msg.buyer} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm" style={{ color: ESPRESSO, ...ff }}>@{msg.buyer}</span>
                          {msg.unread && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: T }} />}
                        </div>
                        <span className="text-xs" style={{ color: COFFEE, ...ff }}>{msg.time}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: COFFEE, ...ff }}>Về: <span className="font-medium">{msg.product}</span></p>
                      <p className="text-sm mt-2" style={{ color: ESPRESSO, ...ff }}>"{msg.message}"</p>
                    </div>
                    <img src={msg.productImg} alt={msg.product} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold self-center transition-all hover:opacity-80" style={{ backgroundColor: COFFEE, color: LINEN, ...ff }}>Trả lời</button>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <MessageCircle size={48} style={{ color: MUTED }} />
                    <p className="text-base" style={{ color: COFFEE, ...ff }}>Chưa có tin nhắn nào</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: SỔ ĐỊA CHỈ (Buyer) ─────────────────────────────────────────── */}
          {accountTab === "addresses" && userRole === "buyer" && (
            <AddressBookTab
              addresses={addresses}
              onAddressesChanged={onAddressesChanged}
              showToast={showToast}
            />
          )}

          {/* ── TAB: KHO HÀNG (Seller) ───────────────────────────────────────────── */}
          {accountTab === "warehouse" && userRole === "seller" && (
            <WarehouseTab
              addresses={addresses}
              onAddressesChanged={onAddressesChanged}
              showToast={showToast}
            />
          )}
        </div>
      )}

      {shipmentDialog}
    </div>
  );
}
