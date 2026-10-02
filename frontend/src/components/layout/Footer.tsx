import { ThriftLogo } from "./Logo";
import { ESPRESSO, T, LINEN, MUTED, COFFEE, ff } from "../../lib/theme";
import type { Screen } from "../../types";

export function Footer({ go }: { go: (s: Screen) => void }) {
  const links = [
    { title: "Về thrift it!", items: ["Giới thiệu", "Blog vintage", "Câu chuyện người dùng", "Tuyển dụng"] },
    { title: "Hỗ trợ người mua", items: ["Hướng dẫn mua hàng", "Chính sách đổi trả", "Thanh toán an toàn", "Theo dõi đơn hàng"] },
    { title: "Hỗ trợ người bán", items: ["Hướng dẫn đăng bán", "Phí & hoa hồng", "Quy tắc cộng đồng", "Trở thành shop uy tín"] },
    { title: "Kết nối với chúng tôi", items: ["Instagram", "TikTok", "Facebook", "Zalo OA"] },
  ];
  return (
    <footer style={{ background: `linear-gradient(to bottom, ${ESPRESSO}, #160d08)` }}>
      <div className="w-full px-6 md:px-12 xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-4 lg:pr-12">
            <div className="flex items-center gap-3 mb-4">
              <ThriftLogo size={42} />
              <span className="text-2xl font-bold italic" style={{ ...ff, color: LINEN }}>
                thrift it!
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,240,230,0.7)", ...ff }}>
              Thị trường C2C thời trang cũ hàng đầu Việt Nam. Nơi lan tỏa phong cách vintage, giảm thiểu rác thải thời trang và xây dựng cộng đồng mua sắm bền vững.
            </p>
            <div className="mt-8">
              <div className="flex gap-2 opacity-60">
                <input 
                  disabled
                  placeholder="Tính năng đang phát triển..." 
                  className="px-4 py-2.5 rounded-xl text-sm outline-none border transition-all w-full cursor-not-allowed" 
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: LINEN, ...ff }} 
                />
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 cursor-not-allowed"
                  style={{ backgroundColor: MUTED, color: LINEN, ...ff }}
                >
                  Đăng ký
                </button>
              </div>
              <p className="text-[10px] mt-2 italic" style={{ color: "rgba(250,240,230,0.5)", ...ff }}>
                * Tính năng đăng ký bản tin sẽ ra mắt trong phiên bản tới.
              </p>
            </div>
          </div>
          
          {links.map((col) => (
            <div key={col.title} className="col-span-1 lg:col-span-2">
              <h4 className="text-xs font-bold tracking-widest mb-6" style={{ color: T, ...ff }}>
                {col.title.toUpperCase()}
              </h4>
              <ul className="space-y-3.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-amber-500 transition-colors" style={{ color: "rgba(250,240,230,0.6)", ...ff }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "rgba(250,240,230,0.5)", ...ff }}>
              © 2026 <strong>thrift it!</strong> Vietnam. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {["Điều khoản sử dụng", "Chính sách bảo mật", "Cookie", "Sơ đồ trang web"].map((l) => (
              <a key={l} href="#" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(250,240,230,0.5)", ...ff }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
