import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from "react-router";
import { Sparkles } from "lucide-react";
import {
  T, ESPRESSO, COFFEE, LINEN, MUTED, SOFT, ff, serif,
  getStoredUser, setStoredUser, clearStoredUser,
  getStoredLikedProducts, setStoredLikedProducts,
  getStoredJSON, setStoredJSON, getStoredString, setStoredString, removeStored,
  STORAGE_KEYS,
} from "../lib/theme";
// Categories come from lib/categories.ts; chat contacts (UI-only) come from data/mock.
// We intentionally avoid using any mock data for products/cart/orders —
// those are 100% server-driven now.
import type {
  Screen, Product, Seller, CartGroup, Order, OrderItem, SellerProduct, Notification, Address,
} from "../types";
import { adaptAddress } from "../lib/adapters";
import type { ApiAddress } from "../lib/api";
import { api, ApiError, setToken } from "../lib/api";
import {
  adaptProduct, adaptSeller, enrichSellerStats, adaptOrder, adaptCartItems, adaptNotification, adaptToSellerProduct,
} from "../lib/adapters";

import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

import { LoginScreen } from "../pages/auth/LoginScreen";
import { RegisterScreen } from "../pages/auth/RegisterScreen";
import { HomeScreen } from "../pages/home/HomeScreen";
import { SearchScreen } from "../pages/search/SearchScreen";
import { CartScreen } from "../pages/cart/CartScreen";
import { ChatScreen } from "../pages/chat/ChatScreen";
import { NotificationScreen } from "../pages/notification/NotificationScreen";
import { ProductDetailScreen } from "../pages/product-detail/ProductDetailScreen";
import { SellerScreen } from "../pages/seller/SellerScreen";
import { PaymentScreen } from "../pages/payment/PaymentScreen";
import { PostScreen } from "../pages/post/PostScreen";
import { AccountScreen } from "../pages/account/AccountScreen";
import { AdminScreen } from "../pages/admin/AdminScreen";
import { SellerApplyScreen } from "../pages/seller/SellerApplyScreen";

interface AuthUser {
  name: string;
  email: string;
  token: string;
  roles: string[];
  avatarUrl?: string;
  sellerStatus: string;
}

const SESSION_KEY = "thriftit_session";

function getStoredSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

function setStoredSession(u: AuthUser | null) {
  try {
    if (u) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setToken(u.token);
    } else {
      localStorage.removeItem(SESSION_KEY);
      setToken(null);
    }
  } catch {}
}

export function screenToPath(s: Screen, product?: Product, seller?: Seller): string {
  switch (s) {
    case "home":
      return "/";
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "search":
      return "/products";
    case "cart":
      return "/cart";
    case "payment":
      return "/checkout";
    case "account":
      return "/account";
    case "chat":
      return "/messages";
    case "notification":
      return "/notifications";
    case "post":
      return "/sell";
    case "seller-apply":
      return "/seller/apply";
    case "admin":
      return "/admin";
    case "seller":
      return seller?.handle ? `/sellers/${seller.handle}` : "/seller";
    case "product-detail":
      return product ? `/products/${product.apiId || product.id}` : "/products";
    default:
      return "/";
  }
}

export function pathToScreen(pathname: string): Screen {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/register")) return "register";
  if (pathname.startsWith("/cart")) return "cart";
  if (pathname.startsWith("/checkout") || pathname.startsWith("/payment")) return "payment";
  if (pathname.startsWith("/account")) return "account";
  if (pathname.startsWith("/messages") || pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/notifications")) return "notification";
  if (pathname.startsWith("/sell") || pathname.startsWith("/post")) return "post";
  if (pathname.startsWith("/seller/apply")) return "seller-apply";
  if (pathname.startsWith("/sellers/") || pathname === "/seller") return "seller";
  if (pathname.startsWith("/products/")) return "product-detail";
  if (pathname.startsWith("/products") || pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/admin")) return "admin";
  return "home";
}

function ProductDetailRouteWrapper({
  products,
  go,
  onLike,
  onAddToCart,
  selectedProduct,
  setSelectedProduct,
}: {
  products: Product[];
  go: (s: Screen, p?: Product, se?: Seller) => void;
  onLike: (id: number) => void;
  onAddToCart: (product: Product, qty: number) => void;
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}) {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(
    !selectedProduct || (selectedProduct.apiId !== id && String(selectedProduct.id) !== id)
  );
  const [product, setProduct] = useState<Product | null>(
    selectedProduct && (selectedProduct.apiId === id || String(selectedProduct.id) === id)
      ? selectedProduct
      : products.find((p) => p.apiId === id || String(p.id) === id) || null
  );

  useEffect(() => {
    if (!id) return;
    const existing = products.find((p) => p.apiId === id || String(p.id) === id);
    if (existing) {
      setProduct(existing);
      setSelectedProduct(existing);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get<{ product: any }>(`/products/${id}`)
      .then((res) => {
        const likedIds = new Set(getStoredLikedProducts().map(String));
        const adapted = adaptProduct(res.product, likedIds);
        setProduct(adapted);
        setSelectedProduct(adapted);
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id, products, setSelectedProduct]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12" style={{ backgroundColor: LINEN }}>
        <p className="text-base font-semibold" style={{ color: COFFEE, ...ff }}>
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 gap-4" style={{ backgroundColor: LINEN }}>
        <p className="text-lg font-bold" style={{ color: ESPRESSO, ...serif }}>
          Không tìm thấy sản phẩm
        </p>
        <button
          onClick={() => go("search")}
          className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: T, color: LINEN, ...ff }}
        >
          Xem tất cả sản phẩm
        </button>
      </div>
    );
  }

  const handleLike = (productId: number) => {
    onLike(productId);
    setProduct((prev) => (prev && prev.id === productId ? { ...prev, liked: !prev.liked } : prev));
  };

  return <ProductDetailScreen product={product} go={go} onLike={handleLike} onAddToCart={onAddToCart} />;
}

function SellerRouteWrapper({
  go,
  products,
  onAddToCart,
  selectedSeller,
  setSelectedSeller,
}: {
  go: (s: Screen, p?: Product, se?: Seller) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  selectedSeller: Seller | null;
  setSelectedSeller: React.Dispatch<React.SetStateAction<Seller | null>>;
}) {
  const { handle } = useParams<{ handle: string }>();
  const [loading, setLoading] = useState(!selectedSeller || selectedSeller.handle !== handle);
  const [seller, setSeller] = useState<Seller | null>(
    selectedSeller && selectedSeller.handle === handle ? selectedSeller : null
  );

  useEffect(() => {
    if (!handle) return;
    if (selectedSeller && selectedSeller.handle === handle) {
      setSeller(selectedSeller);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<{ seller: any }>(`/sellers/${handle}`)
      .then(async (res) => {
        const adapted = adaptSeller(res.seller);
        const enriched = await enrichSellerStats(adapted);
        setSeller(enriched);
        setSelectedSeller(enriched);
      })
      .catch(() => {
        setSeller(null);
      })
      .finally(() => setLoading(false));
  }, [handle, selectedSeller, setSelectedSeller]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12" style={{ backgroundColor: LINEN }}>
        <p className="text-base font-semibold" style={{ color: COFFEE, ...ff }}>
          Đang tải thông tin cửa hàng...
        </p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 gap-4" style={{ backgroundColor: LINEN }}>
        <p className="text-lg font-bold" style={{ color: ESPRESSO, ...serif }}>
          Không tìm thấy cửa hàng
        </p>
        <button
          onClick={() => go("home")}
          className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: T, color: LINEN, ...ff }}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <SellerScreen
      seller={seller}
      go={go}
      products={products.filter((p) => p.status === "active")}
      onAddToCart={onAddToCart}
    />
  );
}

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const session = getStoredSession();
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = session.roles || [];
    const isAllowed = allowedRoles.some((role) => {
      if (role === "admin") {
        return userRoles.includes("admin") || session.email === "admin@thriftit.vn";
      }
      return userRoles.includes(role);
    });

    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const screen = pathToScreen(location.pathname);

  const session = getStoredSession();
  const storedUser = getStoredUser();
  const storedLiked = getStoredLikedProducts();
  const storedCart = getStoredJSON<CartGroup[]>(STORAGE_KEYS.cart);

  // Products: loaded from backend. Empty initial state — show loading skeleton until API responds.
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart: server-driven, empty when no session.
  const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Orders: server-driven, empty when no session.
  const [orders, setOrders] = useState<Order[]>([]);

  const [currentUser, setCurrentUser] = useState<string>(session?.name || storedUser.name || "");
  const [currentEmail, setCurrentEmail] = useState<string>(session?.email || storedUser.email || "");
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>(session?.avatarUrl || "");
  const [currentRoles, setCurrentRoles] = useState<string[]>(session?.roles || []);
  const [sellerStatus, setSellerStatus] = useState<string>(session?.sellerStatus || "NONE");

  const effectiveSellerStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" =
    currentRoles.includes("seller")
      ? "APPROVED"
      : (sellerStatus?.toUpperCase() === "PENDING" || sellerStatus?.toLowerCase() === "pending_approval")
      ? "PENDING"
      : (sellerStatus?.toUpperCase() === "APPROVED")
      ? "APPROVED"
      : (sellerStatus?.toUpperCase() === "REJECTED")
      ? "REJECTED"
      : "NONE";

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [activeTag, setActiveTag] = useState<string>("");
  const [headerQuery, setHeaderQuery] = useState<string>("");
  const [currentShopName, setCurrentShopName] = useState<string>("");
  const [currentShopHandle, setCurrentShopHandle] = useState<string>("");
  const [currentShopAvatar, setCurrentShopAvatar] = useState<string>("");
  const [currentShopRating, setCurrentShopRating] = useState<number>(5);
  const [userRole, setUserRole] = useState<"buyer" | "seller">(() => {
    const saved = getStoredString(STORAGE_KEYS.userRole);
    if (saved === "buyer" || saved === "seller") return saved;
    if (session?.roles?.includes("seller") || currentRoles.includes("seller")) return "seller";
    return "buyer";
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  // Seller's own listings, populated by API per session. No mock fallback.
  const [myProductsByEmail, setMyProductsByEmail] = useState<Record<string, SellerProduct[]>>({});

  // ── Address book (Buyer delivery addresses) ──
  const [addresses, setAddresses] = useState<Address[]>([]);
  const defaultDeliveryAddress = useMemo(
    () => addresses.find((a) => a.isDefault) || addresses[0] || null,
    [addresses]
  );

  const refreshAddresses = useCallback(async () => {
    if (!session?.token) {
      setAddresses([]);
      return;
    }
    try {
      const res = await api.get<{ addresses: ApiAddress[] }>("/users/me/addresses");
      const list = (res.addresses || []).map((a) => adaptAddress(a, "delivery"));
      setAddresses(list);
    } catch (err) {
      // Silent — fail open; user can still checkout by typing address.
      console.warn("[addresses] load failed:", err);
    }
  }, [session?.token]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const myProducts = myProductsByEmail[currentEmail] || [];
  const setMyProducts = (newProds: React.SetStateAction<SellerProduct[]>) => {
    setMyProductsByEmail((prev) => ({
      ...prev,
      [currentEmail]:
        typeof newProds === "function" ? (newProds as (prev: SellerProduct[]) => SellerProduct[])(prev[currentEmail] || []) : newProds,
    }));
  };

  // ── Initial products load from API ──
  useEffect(() => {
    setProductsLoading(true);
    api
      .get<{ products: import("../lib/api").ApiProduct[] }>("/products")
      .then((res) => {
        const likedIds = new Set(getStoredLikedProducts().map(String));
        const adapted = res.products.map((p) => adaptProduct(p, likedIds));
        setProducts(adapted);
      })
      .catch(() => {
        // Backend unreachable — keep product list empty. UI will show empty state.
      })
      .finally(() => setProductsLoading(false));
  }, []);

  // ── Hydrate cart + orders + seller dashboard when session is active ──
  useEffect(() => {
    if (!session?.token) {
      setUnreadNotifications(0);
      return;
    }

    setCartLoading(true);
    api
      .get<{ cart: unknown; items: import("../lib/api").ApiCartItem[] }>("/cart")
      .then((res) => {
        const { groups } = adaptCartItems(res.items);
        setCartGroups(groups);
      })
      .catch(() => {})
      .finally(() => setCartLoading(false));

    api
      .get<{ orders: import("../lib/api").ApiOrder[] }>("/orders")
      .then((res) => setOrders(res.orders.map(adaptOrder)))
      .catch(() => {});

    api
      .get<{ notifications: import("../lib/api").ApiNotification[] }>("/notifications")
      .then((res) => {
        setUnreadNotifications(res.notifications.filter((n) => !n.isRead).length);
      })
      .catch(() => {});

    if (currentRoles.includes("seller")) {
      api
        .get<{ products: import("../lib/api").ApiProduct[] }>("/products/mine")
        .then((res) => {
          const sellerProds: SellerProduct[] = res.products.map((p) =>
            adaptToSellerProduct(p, p.sellerId?.handle ?? "")
          );
          setMyProductsByEmail((prev) => ({
            ...prev,
            [currentEmail]: sellerProds,
          }));
        })
        .catch(() => {});

      api
        .get<{ seller: import("../types").Seller }>("/sellers/me")
        .then((res) => {
          setCurrentShopName(res.seller.name);
          setCurrentShopHandle(res.seller.handle || "");
          setCurrentShopAvatar(res.seller.avatar || "");
          setCurrentShopRating(res.seller.rating || 5);
        })
        .catch(() => {});
    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  // ── Restore selected product on refresh ──
  useEffect(() => {
    if (screen === "product-detail" && !selectedProduct) {
      const pid = getStoredString("selectedProductId");
      if (pid) {
        api
          .get<{ product: import("../lib/api").ApiProduct }>(`/products/${pid}`)
          .then((res) => {
            const likedIds = new Set(getStoredLikedProducts().map(String));
            setSelectedProduct(adaptProduct(res.product, likedIds));
          })
          .catch(() => go("home"));
      } else {
        go("home");
      }
    }
  }, [screen, selectedProduct]);

  // Only user-role preference is kept in localStorage. Everything else is server-driven.

  useEffect(() => {
    setStoredString(STORAGE_KEYS.userRole, userRole);
  }, [userRole]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Post a new listing ──
  const handleAddProduct = async (newProd: {
    name: string; price: number; category: string; desc: string; size: string; condition: number; image: string; images?: string[]; quantity: number;
  }) => {
    try {
      const res = await api.post<{ product: import("../lib/api").ApiProduct }>("/products", {
        title: newProd.name,
        price: newProd.price,
        category: newProd.category,
        condition: newProd.condition,
        size: newProd.size,
        quantity: newProd.quantity,
        description: newProd.desc,
        coverImage: newProd.image,
        coverImages: newProd.images && newProd.images.length > 0 ? newProd.images : [newProd.image],
        images: newProd.images && newProd.images.length > 0 ? newProd.images : [newProd.image],
      });
      
      if (newProd.images && newProd.images.length > 0) {
        try {
          localStorage.setItem(`thriftit_images_${res.product._id}`, JSON.stringify(newProd.images));
        } catch {}
      }
      const addedProduct = adaptProduct(res.product, new Set(getStoredLikedProducts().map(String)));
      if (newProd.images && newProd.images.length > 0) {
        addedProduct.images = newProd.images;
      }
      setProducts((prev) => [addedProduct, ...prev]);

      const newSellerProd = adaptToSellerProduct(res.product, currentUser);
      if (newProd.images && newProd.images.length > 0) {
        newSellerProd.image = newProd.images[0];
      }
      setMyProducts((prev) => [newSellerProd, ...prev]);

      showToast(`Đã gửi yêu cầu đăng bán sản phẩm "${newProd.name}". Admin sẽ duyệt tin của bạn trong thời gian sớm nhất!`);
      go("seller"); // redirect to shop
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Đăng sản phẩm thất bại";
      showToast(`⚠️ ${msg}`);
    }
  };

  const SCREEN_LABEL: Record<Screen, string> = {
    login: "Đăng nhập",
    register: "Đăng ký",
    home: "Trang chủ",
    search: "Tìm kiếm",
    cart: "Giỏ hàng",
    chat: "Tin nhắn",
    notification: "Thông báo",
    "product-detail": "Chi tiết sản phẩm",
    seller: "Shop",
    payment: "Thanh toán",
    account: "Tài khoản",
    post: "Đăng bán",
    admin: "Bảng quản trị",
  };

  const go = (s: Screen, product?: Product, seller?: Seller) => {
    if (s === "admin") {
      const isAllowedAdmin =
        currentRoles.includes("admin") ||
        session?.roles?.includes("admin") ||
        currentEmail === "admin@thriftit.vn" ||
        session?.email === "admin@thriftit.vn";
      if (!isAllowedAdmin) {
        showToast("⚠️ Bạn không có quyền truy cập trang quản trị Admin");
        return;
      }
    }
    if (currentRoles.includes("admin") && s !== "admin" && s !== "login") {
      navigate("/admin");
      return;
    }
    if (product) {
      setSelectedProduct(product);
      setStoredString("selectedProductId", product.apiId || product.id.toString());
    }
    if (seller) setSelectedSeller(seller);

    const targetPath = screenToPath(s, product, seller);
    navigate(targetPath);
    // Reset scroll on screen change so we don't jump mid-page.
    window.scrollTo({ top: 0 });
  };

  const goToSearchWithTag = (tag: string) => {
    setActiveTag(tag);
    navigate("/products");
  };

  const toggleLike = (id: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p));
      const likedIds = updated.filter((p) => p.liked).map((p) => p.id);
      setStoredLikedProducts(likedIds);
      return updated;
    });
  };

  const updateCart = (newCart: CartGroup[]) => {
    setCartGroups(newCart);
    setStoredJSON(STORAGE_KEYS.cart, newCart);
  };

  // ── Cart mutations wired to backend ──
  // The UI updates locally first (optimistic), then we PATCH the server so
  // the source of truth stays correct across devices / page reloads.
  const updateCartItemApi = (
    itemApiId: string,
    patch: { quantity?: number; checked?: boolean }
  ) => {
    if (!session?.token) return;
    api.patch(`/cart/items/${itemApiId}`, patch).catch((err) => {
      console.warn("[cart] PATCH failed:", err);
    });
  };

  const deleteCartItemApi = (itemApiId: string) => {
    if (!session?.token) return;
    api.delete(`/cart/items/${itemApiId}`).catch((err) => {
      console.warn("[cart] DELETE failed:", err);
    });
  };

  // ── addToCart: optimistic local + backend POST if logged in ──
  const addToCart = async (product: Product, qty: number = 1) => {
    let finalApiId = product.apiId; // fallback for guests
    const productApiId = product.apiId;

    if (product.apiId && session?.token) {
      try {
        const res = await api.post<{ item: import("../lib/api").ApiCartItem }>("/cart/items", { productId: product.apiId, quantity: qty });
        finalApiId = res.item._id;
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Thêm vào giỏ hàng thất bại";
        showToast(`⚠️ ${msg}`);
        return; // Stop if backend rejects
      }
    }

    // Local update
    setCartGroups((prev) => {
      const existingGroup = prev.find((g) => g.seller === product.seller);
      if (existingGroup) {
        const existingItem = existingGroup.items.find((i) => i.id === product.id);
        if (existingItem) {
          if (existingItem.qty + qty > product.quantity) {
            if (!session?.token) showToast(`⚠️ Sản phẩm này chỉ còn ${product.quantity} cái`);
            return prev;
          }
          if (!session?.token) showToast(`Đã thêm ${qty} x "${product.name}" vào giỏ hàng!`);
          else showToast(`Đã thêm ${qty} x "${product.name}" vào giỏ hàng!`);

          return prev.map((g) =>
            g.seller === product.seller
              ? {
                  ...g,
                  items: g.items.map((i) =>
                    i.id === product.id ? { ...i, qty: i.qty + qty, apiId: finalApiId, productApiId } : i
                  ),
                }
              : g
          );
        }
        if (qty > product.quantity) {
          if (!session?.token) showToast(`⚠️ Sản phẩm này chỉ còn ${product.quantity} cái`);
          return prev;
        }
        showToast(`Đã thêm ${qty} x "${product.name}" vào giỏ hàng!`);
        return prev.map((g) =>
          g.seller === product.seller
            ? {
                ...g,
                items: [
                  ...g.items,
                  {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    size: product.size,
                    qty,
                    image: product.image,
                    checked: false,
                    condition: product.condition,
                    apiId: finalApiId,
                    productApiId,
                    stock: product.quantity,
                  },
                ],
              }
            : g
        );
      }
      if (qty > product.quantity) {
        if (!session?.token) showToast(`⚠️ Sản phẩm này chỉ còn ${product.quantity} cái`);
        return prev;
      }
      showToast(`Đã thêm ${qty} x "${product.name}" vào giỏ hàng!`);
      return [
        ...prev,
        {
          seller: product.seller,
          items: [
            {
              id: product.id,
              name: product.name,
              price: product.price,
              size: product.size,
              qty,
              image: product.image,
              checked: false,
              condition: product.condition,
              apiId: finalApiId,
              productApiId,
              stock: product.quantity,
            },
          ],
        },
      ];
    });
  };

  const cartCount = cartGroups.flatMap((g) => g.items).filter((i) => i.checked).length;

  // ── LOGIN ──
  const handleLogin = async (userName: string, userEmail: string, password?: string) => {
    if (!password) {
      // No password provided — backend requires it for JWT issuance, so we refuse rather than fake login.
      showToast("⚠️ Vui lòng nhập mật khẩu để đăng nhập.");
      return;
    }
    try {
      const res = await api.post<{ token: string; user: { name: string; email: string; roles: string[], avatarUrl?: string, sellerStatus?: string } }>(
        "/auth/login",
        { email: userEmail, password }
      );
      const next: AuthUser = {
        name: res.user.name,
        email: res.user.email,
        token: res.token,
        roles: res.user.roles,
        avatarUrl: res.user.avatarUrl,
        sellerStatus: res.user.sellerStatus || "none",
      };
      setStoredSession(next);
      setCurrentUser(next.name);
      setCurrentEmail(next.email);
      setCurrentUserAvatar(next.avatarUrl || "");
      setCurrentRoles(next.roles);
      setSellerStatus(next.sellerStatus);
      setStoredUser(next.name, next.email);
      setUserRole(next.roles.includes("seller") ? "seller" : "buyer");

      // Merge any guest cart items the user accumulated before signing in.
      const guestCart = getStoredJSON<CartGroup[]>(STORAGE_KEYS.cart) ?? [];
      const guestItems = guestCart.flatMap((g) =>
        g.items
          .filter((i) => !!i.productApiId)
          .map((i) => ({ productId: i.productApiId as string, quantity: i.qty }))
      );
      if (guestItems.length > 0) {
        try {
          const merged = await api.post<{ items: import("../lib/api").ApiCartItem[] }>(
            "/cart/merge",
            { items: guestItems }
          );
          const { groups } = adaptCartItems(merged.items);
          setCartGroups(groups);
          setStoredJSON(STORAGE_KEYS.cart, groups);
          showToast(
            `Chào mừng ${next.name}! Đã gộp ${guestItems.length} sản phẩm từ giỏ tạm vào tài khoản.`
          );
        } catch (err) {
          console.warn("[cart] merge failed:", err);
          showToast(`Chào mừng ${next.name}!`);
        }
      } else {
        showToast(`Chào mừng ${next.name}!`);
      }

      if (next.roles.includes("admin")) {
        go("admin");
      } else {
        go("home");
      }
      return;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Đăng nhập thất bại";
      showToast(`⚠️ ${msg}`);
      return;
    }
  };

  // ── REGISTER ──
  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post<{ token: string; user: { name: string; email: string; roles: string[], avatarUrl?: string, sellerStatus?: string } }>(
        "/auth/register",
        { name, email, password }
      );
      const next: AuthUser = {
        name: res.user.name,
        email: res.user.email,
        token: res.token,
        roles: res.user.roles,
        avatarUrl: res.user.avatarUrl,
        sellerStatus: res.user.sellerStatus || "none",
      };
      setStoredSession(next);
      setCurrentUser(next.name);
      setCurrentEmail(next.email);
      setCurrentUserAvatar(next.avatarUrl || "");
      setCurrentRoles(next.roles);
      setSellerStatus(next.sellerStatus);
      setStoredUser(next.name, next.email);
      setUserRole("buyer");
      go("home");
      showToast("Đăng ký thành công!");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Đăng ký thất bại";
      showToast(`⚠️ ${msg}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser("");
    setCurrentEmail("");
    setCurrentUserAvatar("");
    setCurrentRoles([]);
    setSellerStatus("NONE");
    setUserRole("buyer");
    setStoredSession(null);
    clearStoredUser();
    removeStored(STORAGE_KEYS.screen);
    removeStored(STORAGE_KEYS.products);
    removeStored(STORAGE_KEYS.myProductsByEmail);
    removeStored(STORAGE_KEYS.orders);
    removeStored(STORAGE_KEYS.userRole);

    // Reset to empty — cart/orders are server-driven per session.
    // We intentionally don't clear setProducts([]) here so the home page keeps showing public listings.
    setOrders([]);
    setCartGroups([]);
    setMyProductsByEmail({});
    setAddresses([]);

    go("login");
  };

  // ── CHECKOUT → POST /api/orders ──
  const addOrder = async (
    orderItems: OrderItem[],
    total: number,
    paymentMethod: string,
    name?: string,
    phone?: string,
    address?: string
  ): Promise<string | boolean> => {
    if (!session?.token) {
      showToast("⚠️ Vui lòng đăng nhập để thanh toán.");
      return false;
    }

    // Idempotency key so a retry / double-click never produces two orders.
    const idempotencyKey = `idem-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

    try {
      const res = await api.post<{ order: import("../lib/api").ApiOrder }>("/orders", {
        shippingName: name,
        shippingPhone: phone,
        shippingAddress: address,
        paymentMethod,
        idempotencyKey,
        items: orderItems.map((item) => ({
          productId: item.productApiId || item.apiId || item.id,
          quantity: item.qty || 1,
        })),
      });

      const serverOrder = adaptOrder(res.order);
      if (serverOrder.items && serverOrder.items.length > 0) {
        serverOrder.items = serverOrder.items.map((it, idx) => ({
          ...it,
          seller: it.seller || orderItems[idx]?.seller || "",
        }));
      }
      setOrders((prev) => [serverOrder, ...prev]);

      // Refresh cart from server (purchased items removed)
      try {
        const fresh = await api.get<{ items: import("../lib/api").ApiCartItem[] }>("/cart");
        const { groups } = adaptCartItems(fresh.items);
        setCartGroups(groups);
      } catch {/* best-effort */}

      // Auto-pay (mock) so the state machine advances. In production this
      // is replaced by a gateway webhook.
      try {
        await api.post<{ order: import("../lib/api").ApiOrder }>("/payments/checkout", {
          orderId: serverOrder.apiId ?? serverOrder.id,
          method: paymentMethod === "COD" ? "COD" : "card",
          cardLast4: paymentMethod === "COD" ? "" : paymentMethod.slice(-4),
        });
        const finalStatus = paymentMethod === "COD" ? "CONFIRMED" : "PAID";
        setOrders((prev) => prev.map((o) => (o.id === serverOrder.id ? { ...o, status: finalStatus } : o)));
        showToast(`✓ Đơn ${serverOrder.id} đã ${paymentMethod === "COD" ? "được xác nhận" : "thanh toán và chờ shop xác nhận"}`);
        return serverOrder.id;
      } catch (payErr) {
        const msg = payErr instanceof ApiError ? payErr.message : "Thanh toán thất bại";
        showToast(`⚠️ Đơn đã tạo nhưng thanh toán lỗi: ${msg}`);
        return serverOrder.id;
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Đặt hàng không thành công";
      showToast(`⚠️ Đặt hàng thất bại: ${msg}`);
      // Refresh cart to show user if any product became out of stock or sold
      try {
        const fresh = await api.get<{ items: import("../lib/api").ApiCartItem[] }>("/cart");
        const { groups } = adaptCartItems(fresh.items);
        setCartGroups(groups);
      } catch {}
      return false;
    }
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: Order["status"], skipApi = false) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));

    let msg = "";
    if (nextStatus === "CANCELLED") msg = "Đã hủy đơn hàng thành công!";
    else if (nextStatus === "DELIVERED") msg = "Đã nhận hàng thành công! Bạn có thể đánh giá sản phẩm.";
    else if (nextStatus === "COMPLETED") msg = "Cảm ơn bạn đã gửi đánh giá sản phẩm!";
    if (msg) showToast(msg);

    if (session?.token && !skipApi) {
      api
        .patch(`/orders/${orderId}/status`, { status: nextStatus })
        .catch((err) => {
          console.warn("[order] status update failed:", err);
          const apiMsg = err instanceof ApiError ? err.message : "transition rejected";
          showToast(`⚠️ Không thể đổi trạng thái: ${apiMsg}`);
          // Roll back local change
          api.get<{ orders: import("../lib/api").ApiOrder[] }>("/orders").then((res) => {
            setOrders(res.orders.map(adaptOrder));
          }).catch(() => {});
        });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col min-w-[320px] relative overflow-x-hidden" style={{ backgroundColor: LINEN, ...ff }}>
      {toastMsg && (
        <div
          className="fixed top-24 right-8 z-[9999] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-down transition-all"
          style={{ backgroundColor: ESPRESSO, color: LINEN, border: `1.5px solid ${T}` }}
        >
          <Sparkles size={18} style={{ color: T }} />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {screen !== "login" && screen !== "register" && screen !== "admin" && (
        <Header
          screen={screen}
          go={go}
          cartCount={cartCount}
          activeTag={activeTag}
          onTagChange={goToSearchWithTag}
          headerQuery={headerQuery}
          setHeaderQuery={setHeaderQuery}
          currentUserEmail={currentEmail}
          unreadNotifications={unreadNotifications}
          isAdmin={currentRoles.includes("admin") || currentEmail === "admin@thriftit.vn"}
        />
      )}
      <main className="flex-1 w-full">
        <Routes>
          <Route
            path="/"
            element={
              <HomeScreen
                go={go}
                products={products.filter((p) => p.status === "active")}
                onLike={toggleLike}
                onAddToCart={addToCart}
                loading={productsLoading}
                onCategorySelect={goToSearchWithTag}
                sellerStatus={effectiveSellerStatus}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginScreen
                onLogin={(name, email, pwd) => handleLogin(name, email, pwd)}
                onRegister={() => go("register")}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterScreen
                onRegister={(name, email, pwd) => handleRegister(name, email, pwd)}
                onBack={() => go("login")}
              />
            }
          />
          <Route
            path="/products"
            element={
              <SearchScreen
                products={products.filter((p) => p.status === "active")}
                onLike={toggleLike}
                go={go}
                onAddToCart={addToCart}
                activeTag={activeTag}
                headerQuery={headerQuery}
                setHeaderQuery={setHeaderQuery}
              />
            }
          />
          <Route path="/search" element={<Navigate to="/products" replace />} />
          <Route
            path="/products/:id"
            element={
              <ProductDetailRouteWrapper
                products={products}
                go={go}
                onLike={toggleLike}
                onAddToCart={addToCart}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartScreen
                go={go}
                cartGroups={cartGroups}
                updateCart={updateCart}
                syncItem={updateCartItemApi}
                deleteItem={deleteCartItemApi}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <PaymentScreen
                  go={go}
                  cartGroups={cartGroups}
                  updateCart={updateCart}
                  addOrder={addOrder}
                  addresses={addresses}
                  defaultAddress={defaultDeliveryAddress}
                  onAddressesChanged={refreshAddresses}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/payment" element={<Navigate to="/checkout" replace />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountScreen
                  go={go}
                  onLogout={handleLogout}
                  userName={userRole === "seller" && currentShopName ? currentShopName : currentUser}
                  userAvatar={userRole === "seller" && currentShopAvatar ? currentShopAvatar : currentUserAvatar}
                  userRating={userRole === "seller" ? currentShopRating : undefined}
                  userEmail={currentEmail}
                  userHandle={userRole === "seller" && currentShopHandle ? currentShopHandle : undefined}
                  orders={orders}
                  myProducts={myProducts}
                  setMyProducts={setMyProducts}
                  userRole={userRole}
                  setUserRole={setUserRole}
                  showToast={showToast}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  sellerStatus={effectiveSellerStatus}
                  roles={currentRoles}
                  onUpdateAvatar={(url) => {
                    setCurrentUserAvatar(url);
                    if (session) {
                      setStoredSession({ ...session, avatarUrl: url });
                    }
                  }}
                  addresses={addresses}
                  onAddressesChanged={refreshAddresses}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/orders"
            element={
              <ProtectedRoute>
                <AccountScreen
                  defaultTab="purchases"
                  go={go}
                  onLogout={handleLogout}
                  userName={userRole === "seller" && currentShopName ? currentShopName : currentUser}
                  userAvatar={userRole === "seller" && currentShopAvatar ? currentShopAvatar : currentUserAvatar}
                  userRating={userRole === "seller" ? currentShopRating : undefined}
                  userEmail={currentEmail}
                  userHandle={userRole === "seller" && currentShopHandle ? currentShopHandle : undefined}
                  orders={orders}
                  myProducts={myProducts}
                  setMyProducts={setMyProducts}
                  userRole={userRole}
                  setUserRole={setUserRole}
                  showToast={showToast}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  sellerStatus={effectiveSellerStatus}
                  roles={currentRoles}
                  onUpdateAvatar={(url) => {
                    setCurrentUserAvatar(url);
                    if (session) {
                      setStoredSession({ ...session, avatarUrl: url });
                    }
                  }}
                  addresses={addresses}
                  onAddressesChanged={refreshAddresses}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/selling"
            element={
              <ProtectedRoute>
                <AccountScreen
                  defaultTab="selling"
                  go={go}
                  onLogout={handleLogout}
                  userName={userRole === "seller" && currentShopName ? currentShopName : currentUser}
                  userAvatar={userRole === "seller" && currentShopAvatar ? currentShopAvatar : currentUserAvatar}
                  userRating={userRole === "seller" ? currentShopRating : undefined}
                  userEmail={currentEmail}
                  userHandle={userRole === "seller" && currentShopHandle ? currentShopHandle : undefined}
                  orders={orders}
                  myProducts={myProducts}
                  setMyProducts={setMyProducts}
                  userRole={userRole}
                  setUserRole={setUserRole}
                  showToast={showToast}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  sellerStatus={effectiveSellerStatus}
                  roles={currentRoles}
                  onUpdateAvatar={(url) => {
                    setCurrentUserAvatar(url);
                    if (session) {
                      setStoredSession({ ...session, avatarUrl: url });
                    }
                  }}
                  addresses={addresses}
                  onAddressesChanged={refreshAddresses}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/messages" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
          <Route path="/chat" element={<Navigate to="/messages" replace />} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationScreen go={go} /></ProtectedRoute>} />
          <Route path="/notification" element={<Navigate to="/notifications" replace />} />
          <Route
            path="/sellers/:handle"
            element={
              <SellerRouteWrapper
                go={go}
                products={products}
                onAddToCart={addToCart}
                selectedSeller={selectedSeller}
                setSelectedSeller={setSelectedSeller}
              />
            }
          />
          <Route
            path="/seller"
            element={
              selectedSeller?.handle ? (
                <Navigate to={`/sellers/${selectedSeller.handle}`} replace />
              ) : userRole === "seller" ? (
                <Navigate to="/account/selling" replace />
              ) : (
                <Navigate to="/seller/apply" replace />
              )
            }
          />
          <Route
            path="/seller/apply"
            element={
              <ProtectedRoute>
                <SellerApplyScreen
                  go={go}
                  sellerStatus={effectiveSellerStatus}
                  onApplySuccess={() => {
                    setSellerStatus("PENDING");
                    const currentSession = getStoredSession();
                    if (currentSession) {
                      setStoredSession({
                        ...currentSession,
                        sellerStatus: "PENDING",
                      });
                    }
                  }}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                {effectiveSellerStatus === "PENDING" ? (
                  <Navigate to="/account" replace />
                ) : (
                  <PostScreen go={go} onAddProduct={handleAddProduct} />
                )}
              </ProtectedRoute>
            }
          />
          <Route path="/post" element={<Navigate to="/sell" replace />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminScreen
                  go={go}
                  products={products}
                  setProducts={setProducts}
                  myProductsByEmail={myProductsByEmail}
                  setMyProductsByEmail={setMyProductsByEmail}
                  userRole={userRole}
                  setUserRole={setUserRole}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {screen !== "login" && screen !== "register" && screen !== "cart" && screen !== "payment" && screen !== "admin" && (
        <Footer go={go} />
      )}
    </div>
  );
}
