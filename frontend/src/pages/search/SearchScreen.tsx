import { useEffect, useState } from "react";
import { Search, X, ChevronDown, Sparkles } from "lucide-react";
import { ProductCard } from "../../components/product/ProductCard";
import { FilterSidebar } from "../../components/product/FilterSidebar";
import { T, MUTED, COFFEE, LINEN, CARD, ESPRESSO, SOFT, ff, serif } from "../../lib/theme";
import type { FilterState, Product, Screen } from "../../types";
import { api } from "../../lib/api";
import { adaptProduct } from "../../lib/adapters";

interface SearchScreenProps {
  products: Product[];
  onLike: (id: number) => void;
  go: (s: Screen, p?: Product) => void;
  onAddToCart: (product: Product) => void;
  activeTag?: string;
  headerQuery?: string;
  setHeaderQuery?: (q: string) => void;
}

export function SearchScreen({
  products,
  onLike,
  go,
  onAddToCart,
  activeTag,
  headerQuery = "",
  setHeaderQuery,
}: SearchScreenProps) {
  const query = headerQuery;
  const [sort, setSort] = useState("Mới nhất");
  const [filters, setFilters] = useState<FilterState>({
    cats: [],
    minP: "",
    maxP: "",
    sizes: [],
    cond: 50,
    rating: undefined,
    ai: false,
  });

  useEffect(() => {
    if (activeTag === "Tất cả" || !activeTag) {
      setFilters({ cats: [], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
    } else if (activeTag === "Áo") {
      setFilters({ cats: ["Áo"], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
    } else if (activeTag === "Quần") {
      setFilters({ cats: ["Quần"], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
    } else if (activeTag === "Váy") {
      setFilters({ cats: ["Váy"], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
    } else if (activeTag === "Áo khoác") {
      setFilters({ cats: ["Áo khoác"], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
    } else if (activeTag === "Phụ kiện") {
      setFilters({ cats: ["Phụ kiện"], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
    } else if (activeTag === "Độ mới >90%") {
      setFilters({ cats: [], minP: "", maxP: "", sizes: [], cond: 90, rating: undefined, ai: false });
    } else if (activeTag === "Gần đây") {
      setFilters({ cats: [], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
    }
  }, [activeTag]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiProducts, setAiProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!filters.ai || !query.trim()) {
      setAiProducts(null);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await api.post<{ products: any[] }>("/ai/search", { query });
        if (!active) return;
        if (Array.isArray(res.products) && res.products.length > 0) {
          const likedIds = new Set(products.filter((p) => p.liked).map((p) => String(p.id)));
          setAiProducts(res.products.map((p) => adaptProduct(p, likedIds)));
        } else {
          setAiProducts(null);
        }
      } catch {
        if (active) setAiProducts(null);
      } finally {
        if (active) setAiLoading(false);
      }
    }, 600);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters.ai, query, products]);

  const baseProducts = filters.ai && aiProducts && aiProducts.length > 0 ? aiProducts : products;

  const filteredProducts = baseProducts.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery =
      filters.ai && aiProducts && aiProducts.length > 0
        ? true
        : !q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q);
    const matchesCat = filters.cats.length === 0 || filters.cats.includes(p.category);
    const matchesSize = filters.sizes.length === 0 || filters.sizes.includes(p.size);
    const matchesCond = p.condition >= filters.cond;
    const minPrice = filters.minP ? parseInt(filters.minP.replace(/\D/g, "")) : 0;
    const maxPrice = filters.maxP ? parseInt(filters.maxP.replace(/\D/g, "")) : Infinity;
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesRating = !filters.rating || (p.sellerRating ?? 5) >= filters.rating;
    return matchesQuery && matchesCat && matchesSize && matchesCond && matchesPrice && matchesRating;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "Giá tăng dần":
        return a.price - b.price;
      case "Giá giảm dần":
        return b.price - a.price;
      case "Độ mới cao nhất":
        return b.condition - a.condition;
      case "Nổi bật nhất":
        return (b.liked ? 1 : 0) - (a.liked ? 1 : 0);
      default:
        return a.id - b.id;
    }
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: LINEN }}>
      <div className="w-full px-4 md:px-8 xl:px-10 py-8">

        {filters.ai && (
          <div
            className="mb-6 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold"
            style={{
              backgroundColor: T + "15",
              color: ESPRESSO,
              border: `1px solid ${T}33`,
            }}
          >
            <Sparkles size={16} style={{ color: T }} />
            <span>
              {aiLoading
                ? "AI đang tìm kiếm và đối sánh ngữ nghĩa sản phẩm..."
                : aiProducts && aiProducts.length > 0
                ? `✨ Đã tìm thấy ${aiProducts.length} sản phẩm phù hợp qua AI Smart Search`
                : "Tính năng Tìm kiếm AI đang bật. Bạn có thể gõ câu mô tả tự nhiên (VD: 'áo dạ retro cho mùa thu')."}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold" style={{ ...serif, color: ESPRESSO }}>
                {query ? (
                  <>
                    Kết quả tìm kiếm cho: <span style={{ color: T }}>"{query}"</span>
                  </>
                ) : (
                  "Tất cả sản phẩm"
                )}
              </h2>
              {query && (
                <button
                  type="button"
                  onClick={() => setHeaderQuery?.("")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-200/80 hover:bg-stone-300 text-espresso transition-colors cursor-pointer"
                  title="Xóa từ khóa tìm kiếm"
                >
                  <X size={13} />
                  <span>Xóa tìm kiếm</span>
                </button>
              )}
              {filters.rating && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, rating: undefined }))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100/90 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer"
                  title="Xóa lọc đánh giá"
                >
                  <span>Shop {filters.rating}⭐ trở lên</span>
                  <X size={13} />
                </button>
              )}
              {(filters.minP || filters.maxP) && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, minP: "", maxP: "" }))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100/90 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer"
                  title="Xóa lọc khoảng giá"
                >
                  <span>
                    Giá: {filters.minP ? Number(filters.minP).toLocaleString("vi-VN") + "₫" : "0₫"} —{" "}
                    {filters.maxP ? Number(filters.maxP).toLocaleString("vi-VN") + "₫" : "∞"}
                  </span>
                  <X size={13} />
                </button>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: COFFEE, ...ff }}>
              {sortedProducts.length} sản phẩm
              {filters.cats.length > 0 ||
              filters.sizes.length > 0 ||
              filters.minP ||
              filters.maxP ||
              filters.rating
                ? " · Đã lọc"
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: COFFEE, ...ff }}>
              Sắp xếp theo:
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm outline-none border cursor-pointer"
                style={{ border: `1.5px solid ${MUTED}`, color: ESPRESSO, backgroundColor: CARD, ...ff }}
              >
                {["Mới nhất", "Giá tăng dần", "Giá giảm dần", "Độ mới cao nhất", "Nổi bật nhất"].map(
                  (o) => (
                    <option key={o}>{o}</option>
                  )
                )}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: COFFEE }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-7">
          <FilterSidebar filters={filters} onChange={setFilters} />
          <div className="flex-1">
            {!filters.ai && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
                style={{ backgroundColor: `${T}18`, border: `1.5px solid ${T}44` }}
              >
                <Sparkles size={18} style={{ color: T }} />
                <p className="text-sm" style={{ color: ESPRESSO, ...ff }}>
                  <strong>AI gợi ý:</strong> Dựa trên lịch sử tìm kiếm, bạn có thể thích các kiểu áo
                  linen cổ điển và áo sơ mi vintage oversize.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onLike={onLike} go={go} onAddToCart={onAddToCart} />
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg font-bold" style={{ color: ESPRESSO }}>
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-sm mt-2" style={{ color: COFFEE }}>
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}

            {sortedProducts.length > 0 && (
              <div className="flex justify-center mt-10">
                <button
                  className="px-8 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:opacity-80"
                  style={{ border: `2px solid ${T}`, color: T, ...ff }}
                >
                  Tải thêm sản phẩm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
