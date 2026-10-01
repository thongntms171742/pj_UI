import React, { useState } from "react";
import {
  TrendingUp, Package, Users, LogOut, DollarSign, Clock
} from "lucide-react";
import {
  T, ESPRESSO, COFFEE, LINEN, MUTED, SOFT, ff, serif, fmt,
} from "../../lib/theme";
import type { Product, Screen, SellerProduct } from "../../types";
import { ThriftLogo } from "../../components/layout/Logo";
import { api, ApiError } from "../../lib/api";
import { adaptToSellerProduct } from "../../lib/adapters";

interface AdminScreenProps {
  go: (s: Screen) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  myProductsByEmail: Record<string, SellerProduct[]>;
  setMyProductsByEmail: React.Dispatch<React.SetStateAction<Record<string, SellerProduct[]>>>;
  userRole: string;
  setUserRole: (role: "buyer" | "seller") => void;
  onLogout: () => void;
}

export function AdminScreen({
  go,
  products,
  setProducts,
  myProductsByEmail,
  setMyProductsByEmail,
  userRole,
  setUserRole,
  onLogout
}: AdminScreenProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<"stats" | "c2c" | "users" | "sellers">("stats");
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "quarter" | "year">("week");
  const [adminStats, setAdminStats] = useState<{ pendingListings: number; soldProducts: number; totalOrders: number; totalUsers: number; totalSellers: number; platformProfit: number; platformFeeRate?: number; totalSales?: number } | null>(null);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<SellerProduct[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "seller">("all");

  // Fetch Stats & Pending
  React.useEffect(() => {
    let mounted = true;
    api
      .get<{ stats: typeof adminStats }>("/admin/stats")
      .then((res) => mounted && setAdminStats(res.stats))
      .catch(() => {/* silent */});
    api
      .get<any>("/admin/pending-sellers")
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.users || res?.sellers || [];
        setPendingSellers(list);
      })
      .catch(() => {});
    api
      .get<any>("/admin/pending-listings")
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.products || [];
        const pending: SellerProduct[] = list.map((p: any) =>
          adaptToSellerProduct(p, p.sellerId?.handle ?? "")
        );
        setPendingProducts(pending);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch Users List
  React.useEffect(() => {
    if (activeAdminTab !== "users") return;
    let mounted = true;
    const roleQuery = roleFilter === "all" ? "" : `&role=${roleFilter}`;
    api
      .get<any>(`/admin/users?page=${userPage}&limit=15${roleQuery}`)
      .then((res) => {
        if (!mounted) return;
        setAllUsers(res.users || []);
        setUserTotalPages(res.totalPages || 1);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [activeAdminTab, userPage, roleFilter]);

  const handleApproveListing = async (id: number, apiId?: string) => {
    const previousPendingProducts = pendingProducts;
    const previousProducts = products;

    // Optimistic local update
    setPendingProducts(prev => prev.filter(p => p.id !== id));
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "active" } : p));

    if (apiId) {
      try {
        await api.patch(`/admin/listings/${apiId}/approve`);
        alert("Duyệt tin đăng bán C2C thành công! Sản phẩm đã xuất hiện trên trang chủ.");
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Lỗi duyệt tin";
        alert(`Duyệt thất bại: ${msg}`);
        setPendingProducts(previousPendingProducts);
        setProducts(previousProducts);
      }
    } else {
      alert("Duyệt tin đăng bán C2C thành công! Sản phẩm đã xuất hiện trên trang chủ.");
    }
  };

  const handleRejectListing = async (id: number, apiId?: string) => {
    const previousPendingProducts = pendingProducts;
    const previousProducts = products;

    setPendingProducts(prev => prev.filter(p => p.id !== id));
    setProducts(prev => prev.filter(p => p.id !== id));

    if (apiId) {
      try {
        await api.patch(`/admin/listings/${apiId}/reject`).catch(async () => {
          await api.patch(`/products/${apiId}/archive`);
        });
        alert("Đã từ chối tin đăng bán sản phẩm.");
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Lỗi từ chối";
        console.error("Reject failed:", msg);
        alert(`Từ chối thất bại: ${msg}`);
        setPendingProducts(previousPendingProducts);
        setProducts(previousProducts);
      }
    } else {
      alert("Đã từ chối tin đăng bán sản phẩm.");
    }
  };

  const handleApproveSeller = async (id: string) => {
    try {
      await api.patch(`/admin/sellers/${id}/approve`);
      setPendingSellers(prev => prev.filter(u => u.id !== id));
      alert("Đã duyệt đăng ký người bán thành công!");
    } catch (err) {
      alert("Lỗi duyệt đăng ký người bán");
    }
  };

  const handleRejectSeller = async (id: string) => {
    try {
      await api.patch(`/admin/sellers/${id}/reject`);
      setPendingSellers(prev => prev.filter(u => u.id !== id));
      alert("Đã từ chối đăng ký người bán.");
    } catch (err) {
      alert("Lỗi từ chối");
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    let reason = "";
    if (newStatus === "suspended") {
      const input = prompt("Nhập lý do khóa tài khoản (hoặc để trống):");
      if (input === null) return; // User cancelled prompt
      reason = input || "Vi phạm chính sách";
    }
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus, reason });
      setAllUsers(prev => prev.map(u => (u._id === id || u.id === id) ? { ...u, accountStatus: newStatus, accountStatusReason: reason } : u));
      alert(`Đã ${newStatus === "suspended" ? "khóa" : "mở khóa"} tài khoản.`);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || "Không thể cập nhật trạng thái tài khoản"}`);
    }
  };

  // Platform revenue: pull entirely from /admin/stats — no client-side calculation
  const commissionRate = adminStats?.platformFeeRate != null
    ? Math.round(adminStats.platformFeeRate * 100)
    : 5; // Default 5% as per backend business rule
  const totalC2CRevenue = adminStats?.totalSales ?? (adminStats?.platformProfit
    ? Math.round(adminStats.platformProfit / (commissionRate / 100))
    : 0);
  const platformProfitFromC2C = adminStats?.platformProfit ?? 0;

  return (
    <div className="min-h-screen flex w-full" style={{ backgroundColor: "#F7F5F0" }}>
      {/* ── Left Sidebar ── */}
      <div className="w-64 flex-shrink-0 flex flex-col justify-between" style={{ backgroundColor: COFFEE, color: LINEN }}>
        <div>
          <div className="p-6 border-b border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <ThriftLogo size={38} />
              <span className="text-xl font-bold italic" style={{ ...serif, color: LINEN, letterSpacing: "-0.3px" }}>
                thrift it!
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-espresso text-[9px] font-bold uppercase tracking-wider flex-shrink-0" style={ff}>
                Admin
              </span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wider block" style={ff}>
              Hệ thống quản trị nền tảng
            </span>
          </div>

          <div className="p-4 space-y-1">
            {[
              { id: "stats", label: "Tổng quan thống kê", icon: TrendingUp },
              { id: "c2c", label: "Duyệt bài đăng C2C", icon: Package, badge: pendingProducts.length },
              { id: "sellers", label: "Duyệt Shop", icon: Users, badge: pendingSellers.length },
              { id: "users", label: "Danh sách tài khoản", icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
                style={{
                  backgroundColor: activeAdminTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeAdminTab === tab.id ? LINEN : MUTED,
                  ...ff
                }}
              >
                <div className="flex items-center gap-2.5">
                  <tab.icon size={15} style={{ color: activeAdminTab === tab.id ? T : "inherit" }} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white transition-all hover:bg-red-700 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Đăng xuất Admin
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar */}
        <div className="h-16 bg-white border-b border-muted px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-coffee uppercase tracking-wider" style={ff}>Bảng điều khiển</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-semibold text-espresso capitalize" style={ff}>
              {activeAdminTab === "stats" ? "Thống kê tổng quan" : activeAdminTab === "c2c" ? "Duyệt bài đăng" : activeAdminTab === "sellers" ? "Duyệt Shop" : "Danh sách tài khoản"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-espresso">System Administrator</p>
              <p className="text-[10px] text-muted-foreground">admin@thriftit.vn</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">
              AD
            </div>
          </div>
        </div>

        {/* Inner Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* TAB 1: OVERVIEW STATS */}
          {activeAdminTab === "stats" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-3 gap-5">
                {[
                  { label: "Phí Hoa hồng C2C", value: `${fmt(platformProfitFromC2C)}`, sub: `Tỷ lệ hoa hồng: ${commissionRate}%`, color: "#2980B9", icon: DollarSign },
                  { label: "Tin C2C chờ duyệt", value: `${pendingProducts.length} bài đăng`, sub: "Cần phê duyệt", color: "#E74C3C", icon: Clock },
                  { label: "Tổng doanh số C2C", value: fmt(totalC2CRevenue), sub: "Doanh số ký gửi", color: "#27AE60", icon: TrendingUp },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-5 rounded-2xl bg-white border border-muted shadow-sm flex items-center justify-between transition-all hover:shadow-md"
                  >
                    <div>
                      <span className="text-xs font-bold text-coffee" style={ff}>{stat.label}</span>
                      <p className="text-xl font-bold mt-1.5" style={{ ...ff, color: stat.color }}>{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-muted">
                      <stat.icon size={18} style={{ color: stat.color }} />
                    </span>
                  </div>
                ))}
              </div>

              {/* Commission Control panel */}
              <div className="grid grid-cols-1 gap-8">
                <div className="p-6 rounded-3xl bg-white border border-muted shadow-sm flex flex-col">
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: ESPRESSO, ...ff }}>Tỷ lệ Chiết khấu Platform</h3>
                    <p className="text-xs text-coffee mb-6 leading-relaxed" style={ff}>
                      Tỷ lệ hoa hồng được quy định bởi hệ thống backend. Thay đổi tỷ lệ cần được thực hiện qua cấu hình server.
                    </p>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center text-xs font-bold" style={ff}>
                      <span className="text-coffee">Tỷ lệ hoa hồng sàn:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-700 font-mono text-sm">{commissionRate}%</span>
                        <button 
                          onClick={() => alert("Tính năng cấu hình Platform Fee Config đang được phát triển ở Backend.")}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded transition-colors text-[10px]"
                        >
                          Thay đổi
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: MUTED }}>
                      <div className="h-full rounded-full" style={{ width: `${(commissionRate / 30) * 100}%`, backgroundColor: T }} />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border text-[11px] text-coffee mt-4 leading-relaxed" style={ff}>
                    <strong>Phí hoa hồng thực tế:</strong> {fmt(platformProfitFromC2C)} (dựa trên tổng doanh số C2C đạt {fmt(totalC2CRevenue)}).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: C2C LISTING MODERATION */}
          {activeAdminTab === "c2c" && (
            <div className="p-6 rounded-3xl bg-white border border-muted shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold font-serif" style={{ color: ESPRESSO }}>Bài đăng chờ duyệt ({pendingProducts.length})</h3>
                <span className="text-xs text-muted-foreground font-semibold">Cần duyệt trước khi hiển thị trên Home</span>
              </div>

              {pendingProducts.length === 0 ? (
                <div className="text-center py-16 text-coffee" style={ff}>
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-xl font-bold mb-3">✓</div>
                  <p className="text-sm font-bold">Không có bài đăng nào cần duyệt!</p>
                  <p className="text-xs text-muted-foreground mt-1">Các bài đăng từ cá nhân và shop đều đã hoạt động.</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-muted rounded-2xl">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-muted text-coffee font-bold">
                        <th className="p-4 w-24">Ảnh</th>
                        <th className="p-4">Sản phẩm</th>
                        <th className="p-4">Người đăng</th>
                        <th className="p-4">Giá bán</th>
                        <th className="p-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted bg-white">
                      {pendingProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/55 transition-colors">
                          <td className="p-4">
                            <img src={p.image} className="w-12 h-16 rounded-lg object-cover border" />
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-espresso text-sm">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">ID: PROD-{p.id} · C2C Listing</p>
                          </td>
                          <td className="p-4 font-mono font-bold text-coffee">
                            @{p.seller || "linh.vintage"}
                          </td>
                          <td className="p-4 font-bold text-amber-700">
                            {fmt(p.price)}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleApproveListing(p.id, p.apiId)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all bg-green-600 hover:bg-green-700"
                              >
                                ✓ Duyệt bài
                              </button>
                              <button
                                onClick={() => handleRejectListing(p.id, p.apiId)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all bg-red-600 hover:bg-red-700"
                              >
                                ✗ Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: SELLERS MODERATION */}
          {activeAdminTab === "sellers" && (
            <div className="p-6 rounded-3xl bg-white border border-muted shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold font-serif" style={{ color: ESPRESSO }}>Hồ sơ đăng ký Shop ({pendingSellers.length})</h3>
                <span className="text-xs text-muted-foreground font-semibold">Cần duyệt trước khi User được phép bán hàng</span>
              </div>

              {pendingSellers.length === 0 ? (
                <div className="text-center py-16 text-coffee" style={ff}>
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-xl font-bold mb-3">✓</div>
                  <p className="text-sm font-bold">Không có hồ sơ nào cần duyệt!</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-muted rounded-2xl">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-muted text-coffee font-bold">
                        <th className="p-4">Tên Shop</th>
                        <th className="p-4">Người đăng ký (Email)</th>
                        <th className="p-4">Giới thiệu</th>
                        <th className="p-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted bg-white">
                      {pendingSellers.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/55 transition-colors">
                          <td className="p-4 font-bold text-espresso text-sm">
                            {s.shopName}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-coffee">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{s.email}</p>
                          </td>
                          <td className="p-4 text-coffee truncate max-w-[200px]">
                            {s.description || "-"}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleApproveSeller(s.id)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all bg-green-600 hover:bg-green-700"
                              >
                                ✓ Cấp quyền
                              </button>
                              <button
                                onClick={() => handleRejectSeller(s.id)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all bg-red-600 hover:bg-red-700"
                              >
                                ✗ Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: USERS */}
          {activeAdminTab === "users" && (
            <div className="p-6 rounded-3xl bg-white border border-muted shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold font-serif" style={{ color: ESPRESSO }}>Quản lý Tài khoản</h3>
                <div className="flex items-center gap-3">
                  <select
                    className="text-xs font-bold border border-muted rounded-xl px-4 py-2 bg-gray-50 text-coffee focus:outline-none focus:border-coffee transition-all cursor-pointer"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value as any);
                      setUserPage(1); // Reset page on filter
                    }}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="buyer">Người mua (Buyer)</option>
                    <option value="seller">Người bán (Seller)</option>
                  </select>
                </div>
              </div>

              {allUsers.length === 0 ? (
                <div className="text-center py-16 text-coffee" style={ff}>
                  <p className="text-sm font-bold">Không có tài khoản nào!</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-muted rounded-2xl">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-muted text-coffee font-bold">
                        <th className="p-4">Tên / Email</th>
                        <th className="p-4">Vai trò</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted bg-white">
                      {allUsers.map((u) => (
                        <tr key={u._id || u.id} className="hover:bg-gray-50/55 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-coffee">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{u.email}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1 flex-wrap">
                              {u.roles?.map((r: string) => (
                                <span key={r} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded uppercase text-[9px] font-bold">
                                  {r}
                               </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            {u.accountStatus === "suspended" ? (
                              <div>
                                <span className="text-red-600 font-bold">Đã Khóa</span>
                                <p className="text-[10px] text-red-500 max-w-[150px] truncate">{u.accountStatusReason}</p>
                              </div>
                            ) : (
                              <span className="text-green-600 font-bold">Đang Hoạt động</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleToggleUserStatus(u._id || u.id, u.accountStatus || "active")}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all ${
                                  u.accountStatus === "suspended" 
                                    ? "bg-green-600 hover:bg-green-700" 
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                              >
                                {u.accountStatus === "suspended" ? "Mở Khóa" : "Khóa TK"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Footer */}
                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-muted">
                      <button
                        disabled={userPage <= 1}
                        onClick={() => setUserPage((p) => p - 1)}
                        className="px-4 py-2 text-xs font-bold bg-white border border-muted rounded-xl text-coffee disabled:opacity-40 transition-all hover:bg-gray-100 disabled:hover:bg-white"
                      >
                        Trang trước
                      </button>
                      <span className="text-xs font-bold text-espresso">
                        Trang {userPage} / {userTotalPages}
                      </span>
                      <button
                        disabled={userPage >= userTotalPages}
                        onClick={() => setUserPage((p) => p + 1)}
                        className="px-4 py-2 text-xs font-bold bg-white border border-muted rounded-xl text-coffee disabled:opacity-40 transition-all hover:bg-gray-100 disabled:hover:bg-white"
                      >
                        Trang tiếp
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
