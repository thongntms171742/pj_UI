import React, { useState } from "react";
import { Store, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { ThriftLogo } from "../../components/layout/Logo";
import { T, ESPRESSO, COFFEE, LINEN, MUTED, SOFT, ff, serif } from "../../lib/theme";
import type { Screen } from "../../types";
import { api, ApiError } from "../../lib/api";

function toHandleSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, 30);
}

export function SellerApplyScreen({
  go,
  onApplySuccess,
  sellerStatus = "NONE",
}: {
  go: (s: Screen) => void;
  onApplySuccess: () => void;
  sellerStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
}) {
  const [shopName, setShopName] = useState("");
  const [handle, setHandle] = useState("");
  const [isHandleCustomized, setIsHandleCustomized] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(sellerStatus === "PENDING");

  const handleShopNameChange = (val: string) => {
    setShopName(val);
    setError("");
    if (!isHandleCustomized) {
      setHandle(toHandleSlug(val));
    }
  };

  const handleHandleChange = (val: string) => {
    setIsHandleCustomized(true);
    setError("");
    const raw = val.startsWith("@") ? val.slice(1) : val;
    setHandle(toHandleSlug(raw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanShopName = shopName.trim();
    if (!cleanShopName || cleanShopName.length < 3) {
      setError("Tên Shop phải có ít nhất 3 ký tự");
      return;
    }
    const cleanHandle = handle.trim().replace(/^@+/, "").toLowerCase();
    if (!cleanHandle || cleanHandle.length < 3) {
      setError("Định danh shop (@handle) phải có ít nhất 3 ký tự");
      return;
    }
    if (cleanHandle.length > 30) {
      setError("Định danh shop (@handle) không được vượt quá 30 ký tự");
      return;
    }
    if (!/^[a-z0-9_.]+$/.test(cleanHandle)) {
      setError("Định danh shop chỉ gồm chữ thường (không dấu), số, dấu gạch dưới (_) và dấu chấm (.)");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/seller/apply", {
        shopName: cleanShopName,
        handle: cleanHandle,
        description: description.trim() || undefined,
      });
      setSuccess(true);
      onApplySuccess();
    } catch (err: unknown) {
      let msg = "Đăng ký thất bại";
      if (err instanceof ApiError) {
        if (err.message === "SELLER_HANDLE_TAKEN" || err.message.toLowerCase().includes("handle")) {
          msg = `Định danh @${cleanHandle} đã có người sử dụng. Vui lòng chọn tên định danh khác.`;
        } else if (err.message === "SELLER_SHOP_NAME_TAKEN" || err.message.toLowerCase().includes("shopname")) {
          msg = `Tên shop "${cleanShopName}" đã có người đăng ký. Vui lòng chọn tên khác.`;
        } else {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sellerStatus === "PENDING" || success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: LINEN }}>
        <div className="max-w-md w-full bg-white border border-[#E8D5BC] rounded-3xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: "#E9F7EF", color: "#27AE60" }}>
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ ...serif, color: ESPRESSO }}>
            {sellerStatus === "PENDING" ? "Hồ sơ đang chờ duyệt!" : "Đăng ký thành công!"}
          </h2>
          <p className="text-sm sm:text-base mb-8 leading-relaxed" style={{ color: COFFEE, ...ff }}>
            Đơn đăng ký trở thành người bán của bạn đã được gửi. Đội ngũ thrift it! sẽ xét duyệt trong thời gian sớm nhất.
          </p>
          <button
            onClick={() => go("account")}
            className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base text-white transition-all hover:opacity-90 shadow-md cursor-pointer"
            style={{ backgroundColor: T, ...ff }}
          >
            Quay lại Tài khoản
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: LINEN }}>
      {/* Left: Editorial Section (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 relative flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1fac08c04b?w=1200&h=1600&fit=crop&auto=format"
            alt="Editorial vintage fashion seller"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col p-16 justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ThriftLogo size={60} />
              <span className="text-4xl font-bold italic tracking-tight" style={{ ...serif, color: LINEN }}>
                thrift it!
              </span>
            </div>
          </div>
          
          <div>
            <h1 className="text-[56px] font-bold leading-[1.1] mb-6" style={{ ...serif, color: LINEN }}>
              Chia sẻ tủ đồ.
              <br />
              Kiếm thêm thu nhập.
            </h1>
            <div className="space-y-3 mb-10 text-lg opacity-90" style={{ color: LINEN, ...ff }}>
              <p className="flex items-center gap-3"><span>📦</span> Dễ dàng đăng bán sản phẩm</p>
              <p className="flex items-center gap-3"><span>💸</span> Tiếp cận hàng ngàn người mua</p>
              <p className="flex items-center gap-3"><span>🌿</span> Chung tay bảo vệ môi trường</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Apply Form */}
      <div className="w-full md:w-[480px] lg:w-[540px] flex-shrink-0 flex flex-col justify-center px-6 py-12 md:px-16 overflow-y-auto" style={{ backgroundColor: LINEN }}>
        <div className="w-full max-w-[400px] mx-auto">
          
          <button
            onClick={() => go("account")}
            className="flex items-center gap-2 text-sm font-semibold mb-8 transition-all hover:opacity-80 w-fit"
            style={{ color: COFFEE, ...ff }}
          >
            <ArrowLeft size={18} />
            Quay lại tài khoản
          </button>

          <div className="flex items-center gap-3 mb-8 md:hidden">
            <ThriftLogo size={52} />
            <span className="text-[28px] font-bold italic tracking-tight" style={{ ...serif, color: ESPRESSO }}>
              thrift it!
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ ...serif, color: ESPRESSO }}>
              Đăng ký Người bán
            </h2>
            <p className="text-base" style={{ color: COFFEE, ...ff }}>
              Bắt đầu hành trình kinh doanh đồ second-hand của bạn.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", ...ff }}
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold mb-2 uppercase tracking-wide" style={{ color: COFFEE, ...ff }}>
                  Tên Shop <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => handleShopNameChange(e.target.value)}
                  placeholder="Ví dụ: Tiệm đồ cũ của Linh, SHop thong Đồ cũ"
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none border-2 transition-all focus:border-amber-500/40"
                  style={{ backgroundColor: SOFT, border: `2px solid transparent`, color: ESPRESSO, ...ff }}
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-bold uppercase tracking-wide" style={{ color: COFFEE, ...ff }}>
                    Tên định danh (@handle) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-500" style={ff}>
                    {handle.length}/30 ký tự
                  </span>
                </div>

                <div
                  className="flex items-center px-4 py-3.5 rounded-xl border-2 transition-all focus-within:border-amber-500/50"
                  style={{ backgroundColor: SOFT, border: "2px solid transparent" }}
                >
                  <span className="text-base font-bold select-none mr-1.5" style={{ color: T }}>
                    @
                  </span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => handleHandleChange(e.target.value)}
                    placeholder="thongshop.vintage"
                    className="w-full bg-transparent text-base outline-none font-medium"
                    style={{ color: ESPRESSO, ...ff }}
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </div>

                <div className="mt-2 space-y-1 text-xs" style={ff}>
                  <p className="text-stone-500 truncate flex items-center gap-1">
                    <span>Đường dẫn shop:</span>
                    <span className="font-semibold underline" style={{ color: T }}>
                      thriftit.vn/sellers/{handle || "ten_dinh_danh"}
                    </span>
                  </p>
                  <p className="text-[11px] text-stone-400">
                    * Định danh dùng để định vị trang shop, chỉ gồm chữ thường không dấu (a-z), số (0-9), dấu chấm (.) và gạch dưới (_)
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-bold mb-2 uppercase tracking-wide" style={{ color: COFFEE, ...ff }}>
                  Giới thiệu (Tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn về các phong cách thời trang hoặc loại đồ bạn sẽ bán..."
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none border-2 transition-all resize-none"
                  style={{ backgroundColor: SOFT, border: `2px solid transparent`, color: ESPRESSO, ...ff }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-bold transition-all hover:opacity-90 active:scale-[0.99] mt-6 flex items-center justify-center gap-2"
              style={{
                backgroundColor: loading ? `${T}80` : T,
                color: LINEN,
                ...ff,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Gửi đơn đăng ký"
              )}
            </button>
          </form>

          <p className="text-xs text-center mt-8 opacity-80" style={{ color: COFFEE, ...ff }}>
            Mọi hồ sơ người bán đều được kiểm duyệt để đảm bảo{" "}
            <br className="hidden md:block" />
            cộng đồng mua bán uy tín và an toàn.
          </p>
        </div>
      </div>
    </div>
  );
}
