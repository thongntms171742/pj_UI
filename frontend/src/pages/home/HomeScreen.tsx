import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "../../components/product/ProductCard";
import { SellerCard } from "../../components/product/SellerCard";
import { T, MUTED, COFFEE, LINEN, ESPRESSO, SOFT, CARD, serif, ff } from "../../lib/theme";
import type { Product, Screen, Seller } from "../../types";
import { api } from "../../lib/api";
import { adaptSeller, enrichSellerStats } from "../../lib/adapters";

interface HomeScreenProps {
  go: (s: Screen, p?: Product, se?: Seller) => void;
  products: Product[];
  onLike: (id: number) => void;
  onAddToCart: (product: Product) => void;
  loading?: boolean;
  sellerStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  onCategorySelect?: (cat: string) => void;
}

function ProductSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}
    >
      <div className="w-full" style={{ paddingBottom: "130%", backgroundColor: SOFT }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded w-3/4" style={{ backgroundColor: SOFT }} />
        <div className="h-3 rounded w-1/2" style={{ backgroundColor: SOFT }} />
        <div className="h-4 rounded w-1/3 mt-2" style={{ backgroundColor: SOFT }} />
      </div>
    </div>
  );
}

function SellerSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full" style={{ backgroundColor: SOFT }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded w-2/3" style={{ backgroundColor: SOFT }} />
          <div className="h-2 rounded w-1/2" style={{ backgroundColor: SOFT }} />
        </div>
      </div>
    </div>
  );
}

export function HomeScreen({ go, products, onLike, onAddToCart, loading, sellerStatus = "NONE", onCategorySelect }: HomeScreenProps) {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellersLoading, setSellersLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get<{ sellers: any[] }>("/sellers")
      .then(async (res) => {
        if (!mounted) return;
        const initialSellers = (res.sellers || []).map(adaptSeller);
        setSellers(initialSellers);
        setSellersLoading(false);

        // Fetch real reviews & stats for each seller to stay synchronized with SellerScreen & ProductDetailScreen
        const enriched = await Promise.all(initialSellers.map((s) => enrichSellerStats(s)));
        if (mounted) {
          setSellers(enriched);
        }
      })
      .catch(() => {
        // backend unreachable — show empty list, not mock
        if (mounted) setSellersLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const productGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
      {loading
        ? Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)
        : products.length === 0
          ? (
            <div className="col-span-full py-16 text-center" style={{ color: COFFEE, ...ff }}>
              Chưa có sản phẩm nào. Hãy là người đầu tiên đăng bán!
            </div>
          )
          : products.map((p) => (
            <ProductCard go={go} key={p.id} product={p} onLike={onLike} onAddToCart={onAddToCart} />
          ))}
    </div>
  );

  return (
    <div style={{ backgroundColor: LINEN }}>
      {/* Hero banner */}
      <div className="relative w-full overflow-hidden h-[280px] md:h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1920&h=500&fit=crop&auto=format"
          alt="Vintage collection"
          className="w-full h-full object-cover object-top"
        />
        <div
          className="absolute inset-0 flex items-center"
          style={{
            background:
              "linear-gradient(90deg, rgba(58,35,18,0.85) 0%, rgba(58,35,18,0.4) 60%, transparent 100%)",
          }}
        >
          <div className="w-full px-4 md:px-8 xl:px-10">
            <p className="hidden md:block text-sm font-bold mb-2 uppercase tracking-widest" style={{ color: T, ...ff }}>
              ✦ Bộ sưu tập mới tuần này
            </p>
            <h2 className="text-[32px] md:text-5xl font-bold leading-[1.15] mb-2 md:mb-4" style={{ ...serif, color: LINEN }}>
              Mặc vintage,
              <br />
              sống có tâm 🌿
            </h2>
            <p className="text-sm md:text-base mb-5 md:mb-6 max-w-[280px] md:max-w-none opacity-90" style={{ color: LINEN, ...ff }}>
              Mua và bán đồ cũ — góp phần giảm thiểu rác thải thời trang
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              <button
                onClick={() => go("search")}
                className="px-6 md:px-8 py-2.5 md:py-3.5 rounded-xl font-bold text-sm md:text-base transition-all hover:opacity-90 shadow-lg w-full sm:w-auto text-center"
                style={{ backgroundColor: T, color: LINEN, ...ff }}
              >
                Khám phá ngay
              </button>
              {sellerStatus !== "PENDING" && (
                <button
                  onClick={() => {
                    if (sellerStatus === "APPROVED") go("post");
                    else go("seller-apply");
                  }}
                  className="px-2 py-2 text-sm font-semibold hover:underline w-full sm:w-auto text-center sm:text-left cursor-pointer"
                  style={{ color: LINEN, ...ff }}
                >
                  {sellerStatus === "APPROVED"
                    ? "🏪 Kênh người bán"
                    : sellerStatus === "REJECTED"
                      ? "Hồ sơ chưa được duyệt"
                      : "+ Đăng bán ngay"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-4 md:px-8 xl:px-10 py-6 md:py-10">
        {/* Categories — Shopee-style full width card */}
        <div className="mb-10 bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-[#E8D5BC]/60">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm md:text-base font-bold tracking-wider uppercase flex items-center gap-2" style={{ color: ESPRESSO, ...ff }}>
              <span className="w-2 h-4 rounded-full bg-amber-600 inline-block" />
              DANH MỤC NỔI BẬT
            </h2>
            <button
              onClick={() => go("search")}
              className="text-xs md:text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: T, ...ff }}
            >
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { name: "Tất cả", icon: "✨", subtitle: "Mọi sản phẩm" },
              { name: "Áo", icon: "👕", subtitle: "Sơ mi, thun" },
              { name: "Quần", icon: "👖", subtitle: "Jeans, kaki" },
              { name: "Váy", icon: "👗", subtitle: "Đầm, chân váy" },
              { name: "Áo khoác", icon: "🧥", subtitle: "Blazer, bomber" },
              { name: "Phụ kiện", icon: "🧣", subtitle: "Khăn, thắt lưng" },
            ].map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  if (onCategorySelect) {
                    onCategorySelect(cat.name);
                  } else {
                    go("search");
                  }
                }}
                className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all bg-[#FFFDFB] text-center cursor-pointer"
              >
                <span className="text-2xl md:text-3xl mb-1.5 group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </span>
                <span className="text-xs md:text-sm font-bold truncate max-w-full" style={{ color: ESPRESSO, ...ff }}>
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 truncate max-w-full hidden sm:block">
                  {cat.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>



        {/* New Listings */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ ...serif, color: ESPRESSO }}>
                Sản phẩm mới
              </h2>
              <p className="text-sm mt-0.5" style={{ color: COFFEE, ...ff }}>
                {products.length} sản phẩm vừa được đăng
              </p>
            </div>
            <button
              onClick={() => go("search")}
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: T, ...ff }}
            >
              Xem tất cả <ChevronRight size={15} />
            </button>
          </div>
          {productGrid}
        </div>

        {/* Trusted Sellers */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ ...serif, color: ESPRESSO }}>
                Gợi ý Shop
              </h2>
              <p className="text-sm mt-0.5" style={{ color: COFFEE, ...ff }}>
                Được đánh giá cao từ cộng đồng thrift it!
              </p>
            </div>
            <button
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: T, ...ff }}
            >
              Xem tất cả <ChevronRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {sellersLoading
              ? Array.from({ length: 5 }).map((_, i) => <SellerSkeleton key={i} />)
              : sellers.length === 0
                ? (
                  <div className="col-span-full py-12 text-center" style={{ color: COFFEE, ...ff }}>
                    Chưa có shop nào.
                  </div>
                )
                : sellers.map((s) => {
                    const thumbs = (s.thumbs && s.thumbs.length > 0)
                      ? s.thumbs
                      : products.filter((p) => p.seller === s.handle && p.image).map((p) => p.image).slice(0, 3);
                    return <SellerCard key={s.id} seller={{ ...s, thumbs }} go={go} />;
                  })}
          </div>
        </div>
      </div>
    </div >
  );
}
