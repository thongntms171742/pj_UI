import { T, COFFEE, CARD, MUTED, ESPRESSO, ff } from "../../lib/theme";
import type { Seller, Screen } from "../../types";
import { RatingStars } from "../common/RatingStars";
import { LetterAvatar } from "../common/LetterAvatar";

interface SellerCardProps {
  seller: Seller;
  go?: (s: Screen, p?: any, se?: Seller) => void;
}

export function SellerCard({ seller }: SellerCardProps) {
  const isReputable = seller.rating >= 4.0 && seller.transactions >= 5;
  const hasAvatar = typeof seller.avatar === "string" && seller.avatar.trim().length > 0;

  return (
    <div
      onClick={() => go && go("seller", undefined, seller)}
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
      style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {hasAvatar ? (
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-12 h-12 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: T }}
            />
          ) : (
            <LetterAvatar name={seller.name} size={48} />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-bold truncate max-w-[110px]" style={{ color: ESPRESSO, ...ff }}>
                {seller.name}
              </p>
              {isReputable ? (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                  style={{ backgroundColor: T + "22", color: T, ...ff }}
                >
                  Shop uy tín ✓
                </span>
              ) : (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 bg-stone-100 text-stone-600"
                  style={{ ...ff }}
                >
                  Shop mới
                </span>
              )}
            </div>
            <p className="text-xs truncate" style={{ color: COFFEE, ...ff }}>
              @{seller.handle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <RatingStars rating={seller.rating} size={12} />
          <span className="text-xs font-bold" style={{ color: T, ...ff }}>
            {seller.rating.toFixed(1)}
          </span>
          <span className="text-xs" style={{ color: COFFEE, ...ff }}>
            · {seller.transactions} giao dịch
          </span>
        </div>

        {seller.thumbs && seller.thumbs.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            {seller.thumbs.slice(0, 3).map((src, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden"
                style={{ paddingBottom: "100%", position: "relative", backgroundColor: MUTED }}
              >
                <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-4 mt-auto">
        <button
          className="w-full py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
          style={{ border: `1.5px solid ${T}`, color: T, ...ff }}
        >
          Xem cửa hàng
        </button>
      </div>
    </div>
  );
}