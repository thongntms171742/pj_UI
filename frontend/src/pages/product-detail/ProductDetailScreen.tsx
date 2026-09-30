import React, { useEffect, useState } from "react";
import { Star, Heart, ChevronRight, Plus, Minus } from "lucide-react";
import { T, ESPRESSO, COFFEE, LINEN, CARD, MUTED, SOFT, serif, ff, fmt } from "../../lib/theme";
import type { Screen, Product, Seller } from "../../types";
import { api } from "../../lib/api";
import type { ApiSeller } from "../../lib/api";
import { adaptSeller } from "../../lib/adapters";

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
  const [showReview, setShowReview] = useState(false);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch seller profile from API
  useEffect(() => {
    if (!product.seller) return;
    let mounted = true;
    api
      .get<{ seller: ApiSeller }>(`/sellers/${product.seller}`)
      .then((res) => {
        if (mounted) setSeller(adaptSeller(res.seller));
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

  const condLabel = product.condition >= 95 ? "Như mới" : product.condition >= 85 ? "Rất tốt" : product.condition >= 70 ? "Tốt" : product.condition >= 55 ? "Khá" : "Đã qua sử dụng";

  // Compute real average rating from API reviews
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
    : 0;
  const avgRatingDisplay = avgRating > 0 ? avgRating.toFixed(1) : null;

  const categoryImages: Record<string, string[]> = {
    "Áo": [
      product.image,
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=520&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=520&fit=crop"
    ],
    "Quần": [
      product.image,
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=520&fit=crop",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=520&fit=crop"
    ],
    "Váy": [
      product.image,
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=520&fit=crop",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=520&fit=crop"
    ],
  };

  const reviewImages = categoryImages[product.category] || [
    product.image,
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=520&fit=crop",
    "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=400&h=520&fit=crop"
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: LINEN }}>
      {/* Breadcrumb */}
      <div className="px-8 py-4" style={{ backgroundColor: SOFT }}>
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-sm" style={{ color: COFFEE, ...ff }}>
          <button onClick={() => go("home")} className="hover:text-amber-700 transition-colors">Trang chủ</button>
          <ChevronRight size={14} />
          <button onClick={() => go("search")} className="hover:text-amber-700 transition-colors">{product.category || "Sản phẩm"}</button>
          <ChevronRight size={14} />
          <span className="font-semibold" style={{ color: ESPRESSO }}>{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Images */}
          <div className="flex-1 lg:max-w-[calc(100%-528px)]">
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
              <img
                src={reviewImages[selectedImg]}
                alt={product.name}
                className="w-full object-cover"
                style={{ height: "500px" }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {reviewImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className="rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: selectedImg === i ? T : "transparent",
                    opacity: selectedImg === i ? 1 : 0.7
                  }}
                >
                  <img src={img} alt="" className="w-full object-cover" style={{ height: "100px" }} />
                </button>
              ))}
            </div>

            {/* Seller info moved to Right Column to preserve mobile visual hierarchy */}
          </div>

          {/* Right: Info */}
          <div className="lg:w-[480px] flex-shrink-0 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: SOFT, color: COFFEE, ...ff }}>{product.category}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${T}20`, color: T, ...ff }}>Size {product.size}</span>
              </div>
              <h1 className="text-2xl font-bold leading-tight" style={{ ...serif, color: ESPRESSO }}>{product.name}</h1>
              {reviews.length > 0 ? (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= Math.round(avgRating) ? T : "none"} stroke={i <= Math.round(avgRating) ? "none" : MUTED} />)}
                    </div>
                    <span className="text-sm font-bold" style={{ color: T }}>{avgRatingDisplay}</span>
                    <span className="text-sm" style={{ color: COFFEE }}>({reviews.length} đánh giá)</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm mt-3" style={{ color: COFFEE, ...ff }}>☆ Chưa có đánh giá</p>
              )}
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: CARD, border: `2px solid ${T}30` }}>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ ...serif, color: T }}>{fmt(product.price)}</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "#27AE60", color: "white", ...ff }}>
                  {product.condition}/100
                </span>
                <span className="text-sm font-semibold" style={{ color: COFFEE, ...ff }}>{condLabel}</span>
              </div>
              <p className="text-xs mt-2" style={{ color: COFFEE, ...ff }}>
                {product.quantity > 0
                  ? `Còn ${product.quantity} sản phẩm`
                  : "Hết hàng"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onLike(product.id)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border-2 transition-all hover:opacity-80"
                style={{ borderColor: T, color: product.liked ? "#E74C3C" : T, backgroundColor: product.liked ? "#FDEDEC" : "transparent", ...ff }}
              >
                <Heart size={18} fill={product.liked ? "#E74C3C" : "none"} />
                {product.liked ? "Đã thích" : "Yêu thích"}
              </button>
              {product.quantity > 0 && product.status !== "sold" && (
                <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{ border: `1.5px solid ${MUTED}` }}>
                  <button disabled={qty <= 1} onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: SOFT }}>
                    <Minus size={16} style={{ color: COFFEE }} />
                  </button>
                  <span className="px-4 py-3 font-bold" style={{ backgroundColor: CARD, color: ESPRESSO }}>{qty}</span>
                  <button disabled={qty >= product.quantity} onClick={() => setQty(qty + 1)} className="px-4 py-3 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: T, color: LINEN }}
                    title={qty >= product.quantity ? `Chỉ còn ${product.quantity} sản phẩm` : undefined}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            {product.status === "sold" || product.quantity <= 0 ? (
              <button
                disabled
                className="w-full py-4 rounded-2xl text-base font-bold cursor-not-allowed opacity-60 shadow-md"
                style={{ backgroundColor: COFFEE, color: LINEN, ...ff }}
              >
                {product.status === "sold" ? "SẢN PHẨM ĐÃ BÁN" : "HẾT HÀNG"}
              </button>
            ) : (
              <>
                <button
                  onClick={() => { 
                    if (qty > product.quantity) return;
                    onAddToCart(product, qty); setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); 
                  }}
                  disabled={qty > product.quantity}
                  className="w-full py-4 rounded-2xl text-base font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-2"
                  style={{ borderColor: addedToCart ? "#27AE60" : MUTED, backgroundColor: addedToCart ? "#E9F7EF" : "transparent", color: addedToCart ? "#27AE60" : ESPRESSO, ...ff }}
                >
                  {addedToCart ? "✓ Đã thêm vào giỏ hàng" : "Thêm vào giỏ hàng"}
                </button>
                <button
                  onClick={() => { 
                    if (qty > product.quantity) return;
                    onAddToCart(product, qty); go("cart"); 
                  }}
                  disabled={qty > product.quantity}
                  className="w-full py-4 rounded-2xl text-base font-bold shadow-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: T, color: LINEN, ...ff }}
                >
                  Mua ngay
                </button>
              </>
            )}

            {/* Seller info */}
            {seller && (
              <div className="mt-8 p-5 rounded-2xl" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                <h3 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: MUTED, ...ff }}>Người bán</h3>
                <div className="flex items-center gap-4">
                  <img src={seller.avatar} alt={seller.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: ESPRESSO, ...ff }}>{seller.name}</p>
                    <p className="text-sm" style={{ color: COFFEE, ...ff }}>@{seller.handle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= Math.round(seller.rating) ? T : "none"} stroke={i <= Math.round(seller.rating) ? "none" : MUTED} />)}
                      </div>
                      <span className="text-xs font-bold" style={{ color: T }}>{seller.rating.toFixed(1)}</span>
                      <span className="text-xs" style={{ color: COFFEE }}>· {seller.transactions} giao dịch</span>
                    </div>
                  </div>
                  <button
                    onClick={() => go("seller", undefined, seller)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:underline"
                    style={{ color: T, ...ff }}
                  >
                    Xem shop
                  </button>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🛡️", label: "Bảo vệ người mua" },
                { icon: "🔄", label: "Đổi trả 7 ngày" },
                { icon: "📦", label: "Kiểm tra khi nhận" },
              ].map(b => (
                <div key={b.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: SOFT }}>
                  <span className="text-xl">{b.icon}</span>
                  <p className="text-[10px] mt-1 font-semibold" style={{ color: COFFEE }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Product Reviews Section (OpenAPI /api/products/{id}/reviews) ── */}
        <div className="mt-16 pt-10 border-t" style={{ borderColor: MUTED }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold" style={{ ...serif, color: ESPRESSO }}>
                Đánh giá từ người mua ({reviews.length})
              </h3>
              <p className="text-sm mt-1" style={{ color: COFFEE }}>
                Nhận xét thực tế từ người dùng đã mua sản phẩm này
              </p>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                <Star size={18} fill={T} stroke="none" />
                <span className="font-bold text-lg" style={{ color: T }}>
                  {(reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: COFFEE }}>/ 5.0</span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: COFFEE }}>
              Đang tải đánh giá...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: CARD, border: `1px dashed ${MUTED}`, color: COFFEE }}>
              <p className="text-base font-semibold mb-1" style={{ color: ESPRESSO }}>Chưa có đánh giá nào</p>
              <p className="text-xs">Hãy là người đầu tiên trải nghiệm và để lại đánh giá cho sản phẩm này sau khi mua!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r, idx) => (
                <div key={r._id || idx} className="p-5 rounded-2xl" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: SOFT, color: ESPRESSO }}>
                        {(r.userName || r.userId?.name || "Khách")?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: ESPRESSO }}>{r.userName || r.userId?.name || "Người mua ẩn danh"}</p>
                        <p className="text-[11px]" style={{ color: COFFEE }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={star <= (r.rating || 5) ? T : "none"} stroke={T} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: COFFEE }}>
                    {r.comment || "Sản phẩm đúng như mô tả, đóng gói cẩn thận."}
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
