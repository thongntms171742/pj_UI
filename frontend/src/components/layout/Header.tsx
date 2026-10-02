import { ShoppingCart, MessageCircle, Bell, User, Search, Sparkles, X } from "lucide-react";
import { ThriftLogo } from "./Logo";
import { COFFEE, T, LINEN, ff } from "../../lib/theme";
import type { Screen } from "../../types";

interface HeaderProps {
  screen: Screen;
  go: (s: Screen) => void;
  cartCount: number;
  activeTag?: string;
  onTagChange?: (tag: string) => void;
  headerQuery?: string;
  setHeaderQuery?: (q: string) => void;
  currentUserEmail?: string;
  unreadNotifications?: number;
  isAdmin?: boolean;
}

export function Header({
  screen,
  go,
  cartCount,
  activeTag,
  onTagChange,
  headerQuery,
  setHeaderQuery,
  currentUserEmail,
  unreadNotifications = 0,
  isAdmin,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm" style={{ backgroundColor: COFFEE }}>
      <div className="w-full px-4 md:px-8 xl:px-10 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 md:gap-6 py-3 md:py-0 md:h-20">
        {/* Left: Logo & optional Admin tag */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => go("home")} className="flex items-center gap-3 group cursor-pointer">
            <ThriftLogo size={42} />
            <span className="text-xl md:text-2xl font-extrabold italic tracking-tight transition-transform group-hover:scale-102" style={{ ...ff, color: LINEN }}>
              thrift it!
            </span>
          </button>
          {(isAdmin || currentUserEmail === "admin@thriftit.vn") && (
            <button
              onClick={() => go("admin")}
              className="text-xs font-bold hover:opacity-90 transition-all px-2.5 py-1 rounded bg-amber-500 text-espresso ml-1 cursor-pointer"
              style={ff}
            >
              Admin Panel
            </button>
          )}
        </div>

        {/* Search bar — centered, expansive & balanced */}
        <div className="flex-1 min-w-0 max-w-4xl xl:max-w-5xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 hidden sm:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go("search");
            }}
            className="w-full flex items-center gap-2 pl-4 sm:pl-5 pr-1.5 py-1 rounded-2xl bg-white shadow-xs border border-stone-200/90 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all h-12"
          >
            <Search size={20} className="text-stone-400 flex-shrink-0" />
            <input
              value={headerQuery || ""}
              onChange={(e) => setHeaderQuery?.(e.target.value)}
              placeholder="Tìm kiếm đồ vintage, thời trang 2hand, phụ kiện..."
              className="flex-1 min-w-0 bg-transparent text-sm md:text-base text-[#2B1810] placeholder:text-stone-400 outline-none font-medium h-10"
              style={ff}
            />
            {headerQuery && (
              <button
                type="button"
                onClick={() => setHeaderQuery?.("")}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-5 sm:px-6 h-10 rounded-xl text-xs md:text-sm font-bold transition-all hover:brightness-105 active:scale-95 flex-shrink-0 shadow-xs cursor-pointer"
              style={{ backgroundColor: T, color: "#FFFFFF", ...ff }}
            >
              <Search size={15} strokeWidth={2.4} />
              <span className="hidden md:inline">Tìm kiếm</span>
            </button>
          </form>
        </div>

        {/* Nav icons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {[
            { id: "cart" as Screen, icon: ShoppingCart, label: "Giỏ hàng", badge: cartCount },
            { id: "chat" as Screen, icon: MessageCircle, label: "Tin nhắn", badge: 0 },
            { id: "notification" as Screen, icon: Bell, label: "Thông báo", badge: unreadNotifications },
            { id: "account" as Screen, icon: User, label: "Tài khoản", badge: 0 },
          ].map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="relative flex flex-col items-center gap-1 px-3 sm:px-4 py-2.5 rounded-2xl transition-all hover:bg-white/10 cursor-pointer"
              style={{ color: screen === id ? T : "rgba(250,240,230,0.9)" }}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={screen === id ? 2.5 : 1.9} />
                {badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs"
                    style={{ backgroundColor: T, color: LINEN, ...ff }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-[11px] sm:text-xs font-semibold" style={ff}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go("search");
          }}
          className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-white shadow-xs border border-stone-200/80 focus-within:ring-2 focus-within:ring-amber-500 transition-all"
        >
          <Search size={16} className="text-stone-400 flex-shrink-0" />
          <input
            value={headerQuery || ""}
            onChange={(e) => setHeaderQuery?.(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 bg-transparent text-sm text-[#2B1810] placeholder:text-stone-400 outline-none font-medium"
            style={ff}
          />
          {headerQuery && (
            <button
              type="button"
              onClick={() => setHeaderQuery?.("")}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full flex-shrink-0"
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-105"
            style={{ backgroundColor: T, color: "#FFFFFF", ...ff }}
          >
            <Search size={13} strokeWidth={2.2} />
            <span>Tìm</span>
          </button>
        </form>
      </div>

    </header>
  );
}
