import React, { useEffect, useState } from "react";
import {
  Star,
  Heart,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  MessageCircle,
  ShieldCheck,
  RefreshCw,
  PackageCheck,
  ChevronLeft,
  Share2,
  Store,
} from "lucide-react";
import { T, ESPRESSO, COFFEE, LINEN, CARD, MUTED, SOFT, serif, ff, fmt } from "../../lib/theme";
import type { Screen, Product, Seller } from "../../types";
import { api } from "../../lib/api";
import type { ApiSeller } from "../../lib/api";
import { adaptSeller, enrichSellerStats } from "../../lib/adapters";
import { RatingStars } from "../../components/common/RatingStars";
import { LetterAvatar, PlaceholderImage } from "../../components/common/LetterAvatar";
import { ImageOff } from "lucide-react";

// ── Product Detail Screen ──────────────────────────────────────────────────────
export function ProductDetailScreen({
  product,
  go,
  onLike,
  onAddToCart,
}: {
  product: Product;
  go: (s: Screen, p?: Product, se?: Seller) => void;
  onLike: (id: number) => void;
  onAddToCart: (product: Product, qty: number) => void;
}) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch seller profile and reviews to calculate accurate transactions and rating
  useEffect(() => {
    if (!product.seller) return;
    let mounted = true;
    api
      .get<{ seller: ApiSeller }>(`/sellers/${product.seller}`)
      .then(async (res) => {
        const sellerObj = adaptSeller(res.seller);
        const enriched = await enrichSellerStats(sellerObj);
        if (mounted) setSeller(enriched);
      })
      .catch(() => {
        if (mounted) setSeller(null);
      });
    return () => {
      mounted = false;
    };
  }, [product.seller]);

  // Fetch product reviews from OpenAPI /api/products/{productId}/reviews
  useEffect(() => {
    const pid = product.apiId || product.id;
    if (!pid) return;
    let mounted = true;
    setReviewsLoading(true);
    api
      .get<{ reviews: any[] }>(`/products/${pid}/reviews`)
      .then((res) => {
        if (mounted) {
          const list = Array.isArray(res.reviews) ? res.reviews : [];
          setReviews(list);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setReviewsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [product.apiId, product.id]);

  const condLabel =
    product.condition >= 95
      ? "Như mới"
      : product.condition >= 85
      ? "Rất tốt"
      : product.condition >= 70
      ? "Tốt"
      : product.condition >= 55
      ? "Khá"
      : "Đã qua sử dụng";

  // Compute real average rating from API reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
      : 0;
  const avgRatingDisplay = avgRating > 0 ? avgRating.toFixed(1) : null;

  // Real product images from user upload (no fake Unsplash mocks injected)
  const productImages: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const activeImg = Math.min(selectedImg, productImages.length - 1);

  const handlePrevImg = () => {
    setSelectedImg((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImg = () => {
    setSelectedImg((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  const descriptionText = product.description || product.desc || "";

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: LINEN }}>
      {/* ── Breadcrumb ── */}
      <div className="w-full border-b" style={{ backgroundColor: "#F7ECE0", borderColor: `${MUTED}80` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: COFFEE, ...ff }}>
            <button
              onClick={() => go("home")}
              className="hover:text-amber-800 transition-colors font-medium"
            >
              Trang chủ
            </button>
            <ChevronRight size={13} className="opacity-60 flex-shrink-0" />
            <button
              onClick={() => go("search")}
              className="hover:text-amber-800 transition-colors font-medium"
            >
              {product.category || "Thời trang 2hand"}
            </button>
            <ChevronRight size={13} className="opacity-60 flex-shrink-0" />
            <span
              className="font-semibold truncate max-w-[200px] sm:max-w-md"
              style={{ color: ESPRESSO }}
              title={product.name}
            >
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* ── Top Main Showcase Card (Shopee / Premium Style) ── */}
        <div
          className="rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xs border"
          style={{ backgroundColor: "#FFFFFF", borderColor: `${MUTED}90` }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] xl:grid-cols-[500px_1fr] gap-8 xl:gap-12 items-start">
            
            {/* ── Left Column: Product Gallery ── */}
            <div className="w-full flex flex-col">
              {/* Main Image Frame (Square aspect ratio, no stretching/cropping) */}
              <div
                className="relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center border group"
                style={{ backgroundColor: "#FAFAFA", borderColor: `${MUTED}80` }}
              >
                {productImages.length > 0 ? (
                  <img
                    src={productImages[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-102"
                  />
                ) : (
                  <PlaceholderImage
                    width="100%"
                    height="100%"
                    radius={0}
                    label="Người bán chưa đăng ảnh"
                    icon={<ImageOff size={48} />}
                  />
                )}

                {/* Condition Badge in top-left corner */}
                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs backdrop-blur-xs"
                  style={{ backgroundColor: "#27AE60" }}
                >
                  <span>★ {product.condition}/100</span>
                  <span className="opacity-90">· {condLabel}</span>
                </div>

                {/* Sold Overlay if sold */}
                {(product.status === "sold" || product.quantity <= 0) && (
                  <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <span className="px-6 py-2.5 rounded-2xl bg-stone-900/85 text-white font-extrabold text-base tracking-wider uppercase shadow-lg">
                      {product.status === "sold" ? "Sản phẩm đã bán" : "Tạm hết hàng"}
                    </span>
                  </div>
                )}

                {/* Left/Right Floating Navigation Chevrons */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-stone-700 shadow-md flex items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
                      title="Ảnh trước"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-stone-700 shadow-md flex items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
                      title="Ảnh tiếp"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Counter badge in bottom-right corner */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 text-white backdrop-blur-xs z-10">
                  {activeImg + 1} / {productImages.length}
                </div>
              </div>

              {/* Thumbnails Row (All uploaded photos without mock images) */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-thin">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      onMouseEnter={() => setSelectedImg(i)}
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all flex-shrink-0 cursor-pointer ${
                        activeImg === i
                          ? "border-[#D27D2D] ring-2 ring-[#D27D2D]/20 opacity-100 shadow-xs scale-102"
                          : "border-stone-200/90 opacity-60 hover:opacity-100 hover:border-amber-400"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Share & report meta row */}
              <div className="flex items-center justify-between text-xs mt-5 pt-4 border-t border-stone-100" style={{ color: COFFEE, ...ff }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-600">Chia sẻ:</span>
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Đã sao chép liên kết sản phẩm!");
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <Share2 size={13} />
                    <span>Copy link</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span>Mã tin: #{product.id}</span>
                </div>
              </div>
            </div>

            {/* ── Right Column: Product Info & Purchase Panel ── */}
            <div className="w-full flex flex-col space-y-5">
              
              {/* Category, Size & Badges */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: SOFT, color: COFFEE, ...ff }}
                  >
                    {product.category}
                  </span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${T}20`, color: T, ...ff }}
                  >
                    Size {product.size}
                  </span>
                  {product.quantity > 0 && product.status !== "sold" ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Còn hàng ({product.quantity})
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      Đã bán / Hết hàng
                    </span>
                  )}
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight"
                  style={{ ...serif, color: ESPRESSO }}
                >
                  {product.name}
                </h1>

                {/* Rating & Sold Meta */}
                <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
                  {reviews.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <RatingStars rating={avgRating} size={14} />
                      <span className="font-bold underline decoration-amber-500 underline-offset-2" style={{ color: T }}>
                        {avgRatingDisplay}
                      </span>
                      <span className="text-stone-400">|</span>
                      <span style={{ color: COFFEE }}>{reviews.length} Đánh giá</span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-stone-500" style={ff}>
                      ☆ Chưa có đánh giá từ người mua
                    </span>
                  )}

                  <span className="text-stone-300">|</span>
                  <span className="text-xs text-stone-500" style={ff}>
                    Độ mới: <strong className="text-emerald-700 font-semibold">{product.condition}% ({condLabel})</strong>
                  </span>
                </div>
              </div>

              {/* ── Price Box (Shopee-Style Warm Highlight) ── */}
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: "#FFF9F4",
                  borderColor: `${T}35`,
                }}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                    style={{ ...serif, color: T }}
                  >
                    {fmt(product.price)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                    Giá 2hand tốt nhất
                  </span>
                </div>

                {/* Free shipping & guarantee notice */}
                <div className="mt-3 pt-3 border-t border-amber-100 space-y-1.5 text-xs" style={{ color: COFFEE, ...ff }}>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">🚚 Vận chuyển:</span>
                    <span>Giao hàng toàn quốc · Phí ship tính lúc thanh toán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-700 font-bold">🛡️ Cam kết:</span>
                    <span>100% kiểm tra hàng trước khi nhận · Bảo vệ thanh toán qua sàn</span>
                  </div>
                </div>
              </div>

              {/* ── Key Attributes Table ── */}
              <div className="grid grid-cols-2 gap-3 py-1 text-xs" style={{ ...ff }}>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block mb-0.5">Danh mục</span>
                  <span className="font-bold text-stone-800 text-sm">{product.category}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block mb-0.5">Kích cỡ</span>
                  <span className="font-bold text-stone-800 text-sm">Size {product.size}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block mb-0.5">Tình trạng thực tế</span>
                  <span className="font-bold text-emerald-700 text-sm">{product.condition}/100 — {condLabel}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block mb-0.5">Số lượng kho</span>
                  <span className="font-bold text-stone-800 text-sm">{product.quantity} sản phẩm</span>
                </div>
              </div>

              {/* ── Quantity Stepper & Stock ── */}
              {product.quantity > 0 && product.status !== "sold" && (
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-sm font-semibold text-stone-600" style={ff}>
                    Số lượng:
                  </span>
                  <div
                    className="flex items-center rounded-xl overflow-hidden border"
                    style={{ borderColor: MUTED }}
                  >
                    <button
                      disabled={qty <= 1}
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3.5 py-2 transition-all hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      style={{ backgroundColor: SOFT }}
                      title="Giảm số lượng"
                    >
                      <Minus size={15} style={{ color: COFFEE }} />
                    </button>
                    <span
                      className="px-4 py-2 font-bold text-sm min-w-[40px] text-center"
                      style={{ backgroundColor: "#FFFFFF", color: ESPRESSO }}
                    >
                      {qty}
                    </span>
                    <button
                      disabled={qty >= product.quantity}
                      onClick={() => setQty(qty + 1)}
                      className="px-3.5 py-2 transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      style={{ backgroundColor: T, color: LINEN }}
                      title={qty >= product.quantity ? `Chỉ còn ${product.quantity} sản phẩm` : "Tăng số lượng"}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="text-xs text-stone-400" style={ff}>
                    (Còn {product.quantity} sản phẩm)
                  </span>
                </div>
              )}

              {/* ── Call To Action Buttons (Shopee Style) ── */}
              <div className="pt-2">
                {product.status === "sold" || product.quantity <= 0 ? (
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl text-base font-bold cursor-not-allowed opacity-60 shadow-xs"
                    style={{ backgroundColor: COFFEE, color: LINEN, ...ff }}
                  >
                    {product.status === "sold" ? "SẢN PHẨM ĐÃ BÁN" : "TẠM HẾT HÀNG"}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {/* Add to Cart button (Outlined with warm background) */}
                    <button
                      onClick={() => {
                        if (qty > product.quantity) return;
                        onAddToCart(product, qty);
                        setAddedToCart(true);
                        setTimeout(() => setAddedToCart(false), 2200);
                      }}
                      disabled={qty > product.quantity}
                      className="flex-1 py-3.5 px-4 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 border-2 hover:brightness-95 active:scale-[0.98] cursor-pointer"
                      style={{
                        borderColor: addedToCart ? "#27AE60" : T,
                        backgroundColor: addedToCart ? "#E9F7EF" : "#FFF4EB",
                        color: addedToCart ? "#27AE60" : T,
                        ...ff,
                      }}
                    >
                      <ShoppingCart size={18} />
                      <span>{addedToCart ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}</span>
                    </button>

                    {/* Buy Now button (Primary Solid CTA) */}
                    <button
                      onClick={() => {
                        if (qty > product.quantity) return;
                        onAddToCart(product, qty);
                        go("cart");
                      }}
                      disabled={qty > product.quantity}
                      className="flex-1 py-3.5 px-4 rounded-xl text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all hover:brightness-105 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      style={{ backgroundColor: T, color: "#FFFFFF", ...ff }}
                    >
                      <span>Mua ngay</span>
                    </button>

                    {/* Wishlist toggle button */}
                    <button
                      onClick={() => onLike(product.id)}
                      className="px-4 py-3.5 rounded-xl font-semibold border-2 transition-all hover:bg-stone-50 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{
                        borderColor: product.liked ? "#E74C3C" : MUTED,
                        color: product.liked ? "#E74C3C" : COFFEE,
                        backgroundColor: product.liked ? "#FDEDEC" : "#FFFFFF",
                        ...ff,
                      }}
                      title={product.liked ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
                    >
                      <Heart size={18} fill={product.liked ? "#E74C3C" : "none"} />
                      <span className="hidden sm:inline text-xs">{product.liked ? "Đã thích" : "Thích"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── Seller Profile Card ── */}
              {seller && (
                <div
                  className="mt-2 p-4 sm:p-5 rounded-2xl border"
                  style={{ backgroundColor: "#FAFAFA", borderColor: `${MUTED}90` }}
                >
                  <div className="flex items-center gap-3.5">
                    {seller.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    ) : (
                      <LetterAvatar name={seller.name} size={52} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm sm:text-base truncate" style={{ color: ESPRESSO, ...ff }}>
                          {seller.name}
                        </p>
                        {seller.rating >= 4.0 && seller.transactions >= 5 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                            Shop uy tín ✓
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                            Shop mới
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: COFFEE, ...ff }}>
                        @{seller.handle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={seller.rating} size={13} />
                        <span className="text-xs font-bold" style={{ color: T }}>
                          {seller.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-600">
                          {seller.transactions} giao dịch
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                      <button
                        onClick={() => go("seller", undefined, seller)}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-stone-100 cursor-pointer"
                        style={{ borderColor: MUTED, color: ESPRESSO, ...ff }}
                      >
                        <Store size={14} />
                        <span>Xem Shop</span>
                      </button>
                      <button
                        onClick={() => go("chat")}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-105 cursor-pointer"
                        style={{ backgroundColor: `${T}20`, color: T, ...ff }}
                      >
                        <MessageCircle size={14} />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3 Trust & Protection Badges ── */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {[
                  { icon: ShieldCheck, label: "Bảo vệ người mua", desc: "Hoàn tiền 100% nếu có lỗi" },
                  { icon: RefreshCw, label: "Đổi trả 7 ngày", desc: "Khiếu nại minh bạch" },
                  { icon: PackageCheck, label: "Đồng kiểm khi nhận", desc: "Xem hàng trước khi trả tiền" },
                ].map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.label}
                      className="p-2.5 rounded-xl border flex flex-col items-center text-center"
                      style={{ backgroundColor: SOFT, borderColor: `${MUTED}80` }}
                    >
                      <Icon size={20} className="mb-1" style={{ color: T }} />
                      <p className="text-[11px] font-bold" style={{ color: ESPRESSO, ...ff }}>
                        {b.label}
                      </p>
                      <p className="text-[9px] text-stone-500 mt-0.5 leading-tight hidden sm:block">
                        {b.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* ── Lower Section: Product Description ── */}
        <div
          className="mt-8 rounded-3xl p-6 sm:p-8 shadow-xs border"
          style={{ backgroundColor: "#FFFFFF", borderColor: `${MUTED}90` }}
        >
          <div className="border-b pb-4 mb-6" style={{ borderColor: `${MUTED}80` }}>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ ...serif, color: ESPRESSO }}>
              Mô tả chi tiết sản phẩm
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: COFFEE, ...ff }}>
              Thông tin chi tiết về chất liệu, nguồn gốc và hiện trạng do người bán cung cấp
            </p>
          </div>

          <div className="space-y-6">
            {/* Description Text */}
            <div className="text-sm sm:text-base leading-relaxed text-stone-800 whitespace-pre-line" style={ff}>
              {descriptionText ? (
                descriptionText
              ) : (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-stone-600 text-sm">
                  <p className="font-semibold text-amber-900 mb-1">🌿 Sản phẩm chưa có mô tả chi tiết từ người bán</p>
                  <p>Bạn có thể nhấn nút "Chat" để hỏi trực tiếp người bán về chất liệu vải, độ co giãn, số đo vòng ngực/eo hoặc yêu cầu chụp thêm ảnh chi tiết trước khi đặt hàng nhé!</p>
                </div>
              )}
            </div>

            {/* Thrift It Quality Guidelines */}
            <div
              className="p-5 rounded-2xl border space-y-2.5"
              style={{ backgroundColor: "#FFF8F0", borderColor: `${T}25` }}
            >
              <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: T, ...ff }}>
                🌿 Lưu ý & Hướng dẫn khi mua sắm đồ 2hand trên Thrift It
              </h3>
              <ul className="text-xs space-y-1.5 text-stone-700" style={ff}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Mỗi món đồ 2hand / vintage là duy nhất. Quý khách vui lòng kiểm tra kỹ số đo và kích cỡ trước khi mua.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Hình ảnh được chụp thực tế dưới ánh sáng tự nhiên. Màu sắc có thể chênh lệch nhẹ 3-5% tùy màn hình hiển thị.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Thực hiện thanh toán qua nền tảng Thrift It để luôn được đảm bảo quyền lợi đổi trả và đồng kiểm an toàn.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Product Reviews Section (OpenAPI /api/products/{id}/reviews) ── */}
        <div
          className="mt-8 rounded-3xl p-6 sm:p-8 shadow-xs border"
          style={{ backgroundColor: "#FFFFFF", borderColor: `${MUTED}90` }}
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pb-4 border-b" style={{ borderColor: `${MUTED}80` }}>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold" style={{ ...serif, color: ESPRESSO }}>
                Đánh giá từ người mua ({reviews.length})
              </h3>
              <p className="text-xs sm:text-sm mt-1" style={{ color: COFFEE, ...ff }}>
                Nhận xét thực tế từ người dùng đã mua sản phẩm này
              </p>
            </div>
            {reviews.length > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
                style={{ backgroundColor: "#FFF9F4", borderColor: `${T}40` }}
              >
                <Star size={20} fill={T} stroke="none" />
                <span className="font-bold text-xl" style={{ color: T }}>
                  {(reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)}
                </span>
                <span className="text-xs text-stone-500">/ 5.0</span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="py-12 text-center text-sm" style={{ color: COFFEE }}>
              Đang tải đánh giá...
            </div>
          ) : reviews.length === 0 ? (
            <div
              className="py-12 px-6 rounded-2xl text-center border-2 border-dashed"
              style={{ backgroundColor: "#FAFAFA", borderColor: MUTED, color: COFFEE }}
            >
              <p className="text-base font-bold mb-1" style={{ color: ESPRESSO, ...ff }}>
                Chưa có đánh giá nào cho sản phẩm này
              </p>
              <p className="text-xs max-w-md mx-auto text-stone-500">
                Hãy là người đầu tiên trải nghiệm và để lại đánh giá cho người bán sau khi nhận hàng nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r, idx) => (
                <div
                  key={r._id || idx}
                  className="p-5 rounded-2xl border"
                  style={{ backgroundColor: "#FAFAFA", borderColor: `${MUTED}80` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs"
                        style={{ backgroundColor: SOFT, color: ESPRESSO }}
                      >
                        {(r.userName || r.userId?.name || "K")?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>
                          {r.userName || r.userId?.name || "Người mua ẩn danh"}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                        </p>
                      </div>
                    </div>
                    <RatingStars rating={r.rating || 5} size={14} />
                  </div>
                  <p className="text-sm leading-relaxed text-stone-700" style={ff}>
                    {r.comment || "Sản phẩm đúng như mô tả, chất lượng tốt và đóng gói cẩn thận."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
