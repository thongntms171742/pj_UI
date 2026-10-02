import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { T, MUTED, COFFEE, ESPRESSO, CARD, LINEN, ff } from "../../lib/theme";
import type { FilterState } from "../../types";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const { cats, minP, maxP, sizes, cond, rating, ai } = filters;

  const [localMinP, setLocalMinP] = useState(minP);
  const [localMaxP, setLocalMaxP] = useState(maxP);

  useEffect(() => {
    setLocalMinP(minP);
  }, [minP]);

  useEffect(() => {
    setLocalMaxP(maxP);
  }, [maxP]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setLocalMinP(val);
    onChange({ ...filters, minP: val });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setLocalMaxP(val);
    onChange({ ...filters, maxP: val });
  };

  const handleApplyPrice = () => {
    onChange({ ...filters, minP: localMinP, maxP: localMaxP });
  };

  const toggleCat = (c: string) =>
    onChange({
      ...filters,
      cats: cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c],
    });

  const toggleSize = (s: string) =>
    onChange({
      ...filters,
      sizes: sizes.includes(s) ? sizes.filter((x) => x !== s) : [...sizes, s],
    });

  const setCond = (v: number) => onChange({ ...filters, cond: v });
  const setAi = (v: boolean) => onChange({ ...filters, ai: v });

  const clearAll = () => {
    setLocalMinP("");
    setLocalMaxP("");
    onChange({ cats: [], minP: "", maxP: "", sizes: [], cond: 50, rating: undefined, ai: false });
  };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="py-4" style={{ borderBottom: `1px solid ${MUTED}` }}>
      <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COFFEE, ...ff }}>
        {label}
      </h4>
      {children}
    </div>
  );

  return (
    <aside
      className="w-full lg:w-60 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: CARD,
        border: `1px solid ${MUTED}`,
        alignSelf: "start",
        position: "sticky",
        top: "84px",
      }}
    >
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold" style={{ ...ff, fontFamily: "'Playfair Display', serif", color: ESPRESSO }}>
            Bộ lọc nâng cao
          </h3>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: T, ...ff }}
          >
            Xóa tất cả
          </button>
        </div>
        <p className="text-xs" style={{ color: COFFEE, ...ff }}>
          Tìm đúng món bạn cần
        </p>
      </div>

      <div className="px-5">
        {/* Danh mục */}
        <Row label="Danh mục">
          <div className="space-y-2">
            {["Áo", "Quần", "Váy", "Áo khoác", "Phụ kiện"].map((c) => (
              <label key={c} className="flex items-center gap-2.5 cursor-pointer group select-none">
                <div
                  onClick={() => toggleCat(c)}
                  className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    borderColor: cats.includes(c) ? T : MUTED,
                    backgroundColor: cats.includes(c) ? T : "transparent",
                  }}
                >
                  {cats.includes(c) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5L4 8L9 2" stroke={LINEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium" style={{ color: ESPRESSO, ...ff }}>
                  {c}
                </span>
              </label>
            ))}
          </div>
        </Row>

        {/* Khoảng Giá — Shopee style */}
        <Row label="Khoảng Giá">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={localMinP}
                  onChange={handleMinChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyPrice();
                  }}
                  placeholder="₫ TỪ"
                  className="w-full px-3 py-1.5 rounded border text-xs outline-none bg-white text-[#2B1810] placeholder:text-stone-400 focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D] transition-all font-medium cursor-text shadow-2xs"
                  style={{ border: `1px solid ${MUTED}`, color: ESPRESSO, ...ff }}
                />
              </div>
              <span className="text-stone-400 font-bold">—</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={localMaxP}
                  onChange={handleMaxChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyPrice();
                  }}
                  placeholder="₫ ĐẾN"
                  className="w-full px-3 py-1.5 rounded border text-xs outline-none bg-white text-[#2B1810] placeholder:text-stone-400 focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D] transition-all font-medium cursor-text shadow-2xs"
                  style={{ border: `1px solid ${MUTED}`, color: ESPRESSO, ...ff }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyPrice}
              className="w-full py-2 rounded text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:brightness-105 active:scale-98 cursor-pointer"
              style={{ backgroundColor: "#EE4D2D", ...ff }}
            >
              Áp dụng
            </button>

            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {[
                { label: "< 100k", min: "", max: "100000" },
                { label: "100-300k", min: "100000", max: "300000" },
                { label: "300-500k", min: "300000", max: "500000" },
                { label: "> 500k", min: "500000", max: "" },
              ].map((r) => {
                const isActive = minP === r.min && maxP === r.max;
                return (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => {
                      setLocalMinP(r.min);
                      setLocalMaxP(r.max);
                      onChange({ ...filters, minP: r.min, maxP: r.max });
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer"
                    style={{
                      border: `1px solid ${isActive ? T : MUTED}`,
                      backgroundColor: isActive ? T : "transparent",
                      color: isActive ? LINEN : COFFEE,
                      ...ff,
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Row>

        {/* Đánh Giá (Shop Rating) — Shopee style */}
        <Row label="Đánh Giá">
          <div className="space-y-1">
            {[
              { stars: 5, label: "" },
              { stars: 4, label: "trở lên" },
              { stars: 3, label: "trở lên" },
              { stars: 2, label: "trở lên" },
              { stars: 1, label: "trở lên" },
            ].map(({ stars, label }) => {
              const isSelected = rating === stars;
              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => onChange({ ...filters, rating: isSelected ? undefined : stars })}
                  className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all text-left cursor-pointer group ${
                    isSelected ? "bg-amber-100/80 font-semibold" : "hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={15}
                        className={
                          i <= stars
                            ? "fill-[#FFB800] text-[#FFB800]"
                            : "fill-none text-[#FFB800]"
                        }
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  {label && (
                    <span className="text-xs font-medium" style={{ color: ESPRESSO, ...ff }}>
                      {label}
                    </span>
                  )}
                  {isSelected && (
                    <span className="ml-auto text-[10px] text-amber-800 font-bold bg-amber-200/70 px-1.5 py-0.5 rounded">
                      Đã chọn
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Row>

        {/* Kích cỡ */}
        <Row label="Kích cỡ">
          <div className="flex flex-wrap gap-1.5">
            {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className="w-10 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                style={{
                  border: `1.5px solid ${sizes.includes(s) ? T : MUTED}`,
                  backgroundColor: sizes.includes(s) ? T : "transparent",
                  color: sizes.includes(s) ? LINEN : COFFEE,
                  ...ff,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Row>

        {/* Độ mới */}
        <Row label={`Độ mới tối thiểu: ${cond}%`}>
          <input
            type="range"
            min={30}
            max={100}
            value={cond}
            onChange={(e) => setCond(Number(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer"
            style={{ accentColor: T }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: COFFEE, ...ff }}>
              30%
            </span>
            <span className="text-[10px]" style={{ color: COFFEE, ...ff }}>
              100%
            </span>
          </div>
        </Row>

        {/* Gợi ý từ AI */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: ESPRESSO, ...ff }}>
                ✨ Gợi ý từ AI
              </p>
              <p className="text-xs mt-0.5" style={{ color: COFFEE, ...ff }}>
                Để AI tìm món phù hợp phong cách bạn
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAi(!ai)}
              className="w-12 h-6 rounded-full transition-all relative cursor-pointer"
              style={{ backgroundColor: ai ? T : MUTED }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm"
                style={{ backgroundColor: "white", left: ai ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
