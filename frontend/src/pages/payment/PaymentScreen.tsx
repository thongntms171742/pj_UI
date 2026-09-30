import React, { useState } from "react";
import { CheckCircle, Check } from "lucide-react";
import { T, ESPRESSO, COFFEE, LINEN, CARD, MUTED, SOFT, serif, ff, fmt } from "../../lib/theme";
import type { Screen, CartGroup, OrderItem } from "../../types";

export function PaymentScreen({ go, cartGroups, updateCart, addOrder }: { go: (s: Screen) => void; cartGroups: CartGroup[]; updateCart: (cart: CartGroup[]) => void; addOrder: (items: OrderItem[], total: number, payment: string, name?: string, phone?: string, address?: string) => Promise<string | boolean>; }) {
  const [step, setStep] = useState<"address" | "review">("address");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [finalTotal, setFinalTotal] = useState(0);

  // Calculate totals
  const allItems = cartGroups.flatMap(g => g.items);
  const checkedItems = allItems.filter(i => i.checked);
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const checkedSellers = new Set(checkedItems.map(i => i.seller)).size;
  const ship = checkedSellers * 30000;
  const total = subtotal + ship;

  const handleNextToPayment = () => {
    if (!fullName.trim()) {
      setAddressError("Vui lòng nhập họ tên người nhận!");
      return;
    }
    if (!phone.trim() || !/^\d{10,11}$/.test(phone)) {
      setAddressError("Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)!");
      return;
    }
    if (!address.trim() || address.trim().length < 10) {
      setAddressError("Vui lòng nhập địa chỉ nhận hàng chi tiết!");
      return;
    }
    setAddressError("");
    setStep("review");
  };

  const handlePlaceCodOrder = async () => {
    setIsProcessing(true);

    const orderItems: OrderItem[] = checkedItems.map(item => ({
      id: item.id.toString(),
      apiId: item.apiId,
      productApiId: item.productApiId,
      name: item.name,
      price: item.price,
      size: item.size,
      qty: item.qty,
      image: item.image,
      condition: item.condition,
      seller: cartGroups.find(g => g.items.some(i => i.id === item.id))?.seller || "",
    }));

    // Generate tentative order ID in case backend doesn't return one
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(newOrderId);
    setFinalTotal(total);

    // Add order and clear cart
    const realOrderId = await addOrder(orderItems, total, "COD", fullName, phone, address);
    if (!realOrderId) {
      setIsProcessing(false);
      return;
    }
    setOrderId(typeof realOrderId === "string" ? realOrderId : newOrderId);

    const newCart = cartGroups.map(g => ({
      ...g,
      items: g.items.filter(i => !i.checked)
    })).filter(g => g.items.length > 0);
    updateCart(newCart);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: LINEN }}>
        <div className="text-center p-10 rounded-3xl" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}`, maxWidth: 480, width: "100%" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#27AE6022" }}>
            <CheckCircle size={48} style={{ color: "#27AE60" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ ...serif, color: ESPRESSO }}>Đặt hàng thành công!</h2>
          <p className="text-sm mb-6" style={{ color: COFFEE, ...ff }}>
            Cảm ơn bạn đã mua sắm tại Thrifti. Đơn hàng của bạn đang được xử lý và sẽ giao trong 2-5 ngày.
          </p>
          <div className="space-y-3 mb-8 p-4 rounded-2xl text-left" style={{ backgroundColor: SOFT, border: `1px solid ${MUTED}` }}>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: COFFEE, ...ff }}>Mã đơn hàng</span>
              <span className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>#{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: COFFEE, ...ff }}>Người nhận</span>
              <span className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: COFFEE, ...ff }}>SĐT liên hệ</span>
              <span className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: COFFEE, ...ff }}>Địa chỉ giao</span>
              <span className="text-sm font-bold truncate max-w-[200px]" style={{ color: ESPRESSO, ...ff }} title={address}>{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: COFFEE, ...ff }}>Phương thức</span>
              <span className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>COD (Thanh toán khi nhận hàng)</span>
            </div>
            <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px dashed ${MUTED}` }}>
              <span className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>Tổng thanh toán</span>
              <span className="text-lg font-bold" style={{ ...serif, color: T }}>{fmt(finalTotal)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => go("account")} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={{ backgroundColor: T, color: LINEN, ...ff }}>
              Xem đơn mua
            </button>
            <button onClick={() => go("home")} className="flex-1 py-3 rounded-xl font-bold text-sm border transition-all hover:opacity-90" style={{ borderColor: MUTED, color: COFFEE, backgroundColor: CARD, ...ff }}>
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: LINEN }}>
      {/* Header */}
      <div style={{ backgroundColor: COFFEE }}>
        <div className="max-w-[600px] mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => {
              if (step === "review") setStep("address");
              else go("cart");
            }}
            className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: LINEN, ...ff }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke={LINEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Quay lại
          </button>
          <div className="h-5 w-px" style={{ backgroundColor: LINEN + "44" }} />
          <h1 className="text-xl font-bold italic" style={{ ...serif, color: LINEN }}>Thanh toán</h1>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { num: 1, label: "Địa chỉ" },
            { num: 2, label: "Xác nhận đơn" },
            { num: 3, label: "Hoàn tất" },
          ].map((s, i) => {
            const currentIdx = step === "address" ? 0 : step === "review" ? 1 : 2;
            const isActive = i <= currentIdx;
            return (
              <div key={s.num} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: isActive ? T : MUTED,
                      color: isActive ? LINEN : COFFEE,
                    }}
                  >
                    {i < currentIdx ? <Check size={14} /> : s.num}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold" style={{ color: isActive ? T : COFFEE, ...ff }}>{s.label}</span>
                </div>
                {i < 2 && <div className="w-8 h-px" style={{ backgroundColor: MUTED }} />}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Địa chỉ */}
        {step === "address" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
              <h3 className="text-base font-bold mb-4 font-serif" style={{ ...serif, color: ESPRESSO }}>Thông tin nhận hàng</h3>

              {addressError && (
                <div className="mb-4 p-3.5 rounded-xl border text-xs font-semibold" style={{ backgroundColor: "#FDEDEC", color: "#E74C3C", borderColor: "#FADBD8" }}>
                  ⚠️ {addressError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: COFFEE, ...ff }}>Họ và tên người nhận *</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Thanh Linh"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 transition-all"
                    style={{ backgroundColor: SOFT, border: `2px solid ${MUTED}`, color: ESPRESSO, ...ff }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: COFFEE, ...ff }}>Số điện thoại liên hệ *</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0987654321"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 transition-all"
                    style={{ backgroundColor: SOFT, border: `2px solid ${MUTED}`, color: ESPRESSO, ...ff }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: COFFEE, ...ff }}>Địa chỉ giao hàng chi tiết *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 resize-none transition-all"
                    style={{ backgroundColor: SOFT, border: `2px solid ${MUTED}`, color: ESPRESSO, ...ff }}
                  />
                </div>
              </div>
            </div>

            {/* Next Button & Summary Preview */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs" style={{ color: COFFEE }}>Tổng tiền ({checkedItems.length} sản phẩm):</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: T }}>{fmt(total)}</p>
                </div>
                <button
                  onClick={handleNextToPayment}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-md"
                  style={{ backgroundColor: T, color: LINEN, ...ff }}
                >
                  Xác nhận thông tin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Xác nhận & Đặt hàng */}
        {step === "review" && (
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
              <h3 className="text-base font-bold mb-4" style={{ ...serif, color: ESPRESSO }}>Đơn hàng của bạn</h3>
              <div className="space-y-3">
                {checkedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: ESPRESSO, ...ff }}>{item.name}</p>
                      <p className="text-xs" style={{ color: COFFEE, ...ff }}>Size {item.size} · ×{item.qty}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: T }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 space-y-2" style={{ borderTop: `1px solid ${MUTED}` }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: COFFEE }}>Tạm tính</span>
                  <span style={{ color: ESPRESSO }}>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: COFFEE }}>Phí vận chuyển</span>
                  <span style={{ color: ESPRESSO }}>{fmt(ship)}</span>
                </div>
                <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${MUTED}` }}>
                  <span className="font-bold" style={{ color: ESPRESSO }}>Tổng thanh toán</span>
                  <span className="text-2xl font-bold" style={{ ...serif, color: T }}>{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Display */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${MUTED}` }}>
              <h3 className="text-base font-bold mb-3" style={{ ...serif, color: ESPRESSO }}>Phương thức thanh toán</h3>
              <div className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all" style={{ backgroundColor: `${T}0F`, border: `2px solid ${T}` }}>
                <div className="w-12 h-8 rounded flex items-center justify-center text-xs font-bold border-2" style={{ borderColor: T, color: T, backgroundColor: CARD }}>
                  COD
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold" style={{ color: ESPRESSO, ...ff }}>Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs" style={{ color: COFFEE, ...ff }}>Thanh toán bằng tiền mặt khi nhận hàng</p>
                </div>
                <CheckCircle size={20} style={{ color: T }} />
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePlaceCodOrder}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: isProcessing ? MUTED : T, color: LINEN, cursor: isProcessing ? "not-allowed" : "pointer", ...ff }}
            >
              {isProcessing ? "Đang xử lý..." : `Đặt hàng - Thanh toán khi nhận`}
            </button>
            <p className="text-center text-xs" style={{ color: COFFEE, ...ff }}>
              Bạn chỉ thanh toán khi đã nhận và kiểm tra hàng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}