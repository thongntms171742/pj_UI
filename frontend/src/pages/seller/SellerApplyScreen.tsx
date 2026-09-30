import React, { useState } from "react";
import { Store, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { ThriftLogo } from "../../components/layout/Logo";
import { T, ESPRESSO, COFFEE, LINEN, MUTED, SOFT, ff, serif } from "../../lib/theme";
import type { Screen } from "../../types";
import { api, ApiError } from "../../lib/api";

export function SellerApplyScreen({ go, onApplySuccess }: { go: (s: Screen) => void, onApplySuccess: () => void }) {
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || shopName.trim().length < 3) {
      setError("Tên Shop phải có ít nhất 3 ký tự");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/seller/apply", {
        shopName,
        description,
      });
      setSuccess(true);
      onApplySuccess();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Đăng ký thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: LINEN }}>
        <div className="max-w-md w-full bg-transparent p-8 text-center">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: "#E9F7EF", color: "#27AE60" }}>
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ ...serif, color: ESPRESSO }}>Đăng ký thành công!</h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: COFFEE, ...ff }}>
            Đơn đăng ký trở thành người bán của bạn đã được gửi. Đội ngũ thrift it! sẽ xét duyệt trong thời gian sớm nhất.
          </p>
          <button
            onClick={() => go("account")}
            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 shadow-md"
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
                  Tên Shop
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    setError("");
                  }}
                  placeholder="Ví dụ: Tiệm đồ cũ của Linh"
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none border-2 transition-all"
                  style={{ backgroundColor: SOFT, border: `2px solid transparent`, color: ESPRESSO, ...ff }}
                  required
                />
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
