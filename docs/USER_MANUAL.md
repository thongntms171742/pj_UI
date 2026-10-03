# thrift it! — User Manual

> Tài liệu hướng dẫn sử dụng cho người dùng cuối của sàn thương mại điện tử **thrift it!** (Vintage Clothing Marketplace).
> Tài liệu này được tổng hợp dựa trên frontend hiện tại của dự án (`frontend/src/`), cập nhật lần cuối ngày **2026-10-03**.

---

## Mục lục

1. [Giới thiệu về thrift it!](#1-giới-thiệu-về-thrift-it)
2. [Bắt đầu nhanh](#2-bắt-đầu-nhanh)
3. [Hướng dẫn cho Người mua (Buyer)](#3-hướng-dẫn-cho-người-mua-buyer)
4. [Hướng dẫn cho Người bán (Seller)](#4-hướng-dẫn-cho-người-bán-seller)
5. [Hướng dẫn cho Quản trị viên (Admin)](#5-hướng-dẫn-cho-quản-trị-viên-admin)
6. [Câu hỏi thường gặp (FAQ)](#6-câu-hỏi-thường-gặp-faq)
7. [Liên hệ & Hỗ trợ](#7-liên-hệ--hỗ-trợ)

---

## 1. Giới thiệu về thrift it!

### 1.1. thrift it! là gì?

**thrift it!** là **sàn thương mại điện tử C2C (Consumer-to-Consumer)** chuyên về thời trang cũ / vintage tại Việt Nam. Sàn kết nối trực tiếp giữa:

- **Người mua (Buyer)** — những người tìm kiếm các món đồ thời trang đã qua sử dụng có phong cách riêng với mức giá hợp lý.
- **Người bán (Seller)** — cá nhân hoặc shop muốn thanh lý / ký gửi quần áo cũ, phụ kiện vintage.

### 1.2. Sứ mệnh

> *"Mặc vintage, sống có tâm 🌿 — Mua và bán đồ cũ, góp phần giảm thiểu rác thải thời trang."*

Sàn hướng đến xây dựng cộng đồng mua sắm **bền vững**, nơi mỗi món đồ second-hand được tái sử dụng thay vì bị vứt đi.

### 1.3. Các tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| 🛍️ **Danh mục đa dạng** | Áo, Quần, Váy, Áo khoác, Phụ kiện — tất cả phong cách vintage, Y2K, retro, minimalist… |
| 🤖 **AI Smart Search** | Tìm kiếm bằng câu mô tả tự nhiên (VD: *"áo dạ retro cho mùa thu"*). |
| 💡 **AI gợi ý giá & phân loại** | Khi đăng bán, AI phân tích tên sản phẩm + ảnh để gợi ý giá và danh mục phù hợp. |
| 🏪 **Hệ thống Shop** | Người bán đăng ký Shop với định danh `@handle`, nhận huy hiệu "Shop uy tín" khi đủ điều kiện. |
| 📍 **Sổ địa chỉ thông minh** | Tích hợp CAS Address Kit — chọn Tỉnh/Phường/Xã chính xác sau sáp nhập hành chính. |
| 🛒 **Giỏ hàng đa-shop** | Mua từ nhiều shop trong một đơn, hỗ trợ mã giảm giá (`THRIFT10`, `VINTAGE`). |
| 💰 **Thanh toán COD** | Thanh toán khi nhận hàng — không cần cổng thanh toán phức tạp. |
| 🚚 **Theo dõi vận đơn** | Mã vận đơn, timeline giao hàng, dự kiến giao, tracking URL. |
| ⭐ **Đánh giá sản phẩm** | Buyer đánh giá 1–5 sao sau khi đơn hoàn tất. |
| 🔒 **Bảo vệ người mua** | Đổi trả trong 7 ngày, đồng kiểm khi nhận hàng. |
| 🌱 **Phí nền tảng 5%** | Chỉ tính phí hoa hồng nhỏ khi giao dịch thành công. |

### 1.4. Thống kê nền tảng (hiển thị trên trang chủ)

- 🌿 **12.000+** sản phẩm
- 🏪 **4.800+** người bán
- 💛 **98%** khách hàng hài lòng

### 1.5. Công nghệ & Bảo mật

- Đăng nhập bằng **JWT (JSON Web Token)** — bảo mật, không lưu mật khẩu thô trong cookie.
- Mật khẩu được hash an toàn phía backend.
- Tất cả đơn hàng được quản lý qua **state machine 11 bước** (PENDING_PAYMENT → … → COMPLETED).
- Sàn duy trì **lịch sử tài chính** (Ledger, Order audit) — không xóa lịch sử.

---

## 2. Bắt đầu nhanh

### 2.1. Truy cập hệ thống

Mở trình duyệt (Chrome / Edge / Firefox / Safari) và truy cập:
- **Production**: `https://thriftit.vn`
- **Development (local)**: `http://localhost:5173` (frontend) → backend `http://localhost:4000`

### 2.2. Đăng ký tài khoản mới

> **Bước 1.** Truy cập trang chủ → nhấn **"Đăng ký tài khoản mới"** (góc phải trên).

> **Bước 2.** Điền các trường bắt buộc:
> - **Họ và tên** (VD: Nguyễn Văn A)
> - **Email** (VD: `ban@email.com`)
> - **Số điện thoại** (10 chữ số, VD: `0901234567`)
> - **Mật khẩu** (tối thiểu 6 ký tự)
> - **Xác nhận mật khẩu**

> **Bước 3.** Nhấn **"Đăng Ký"**.

Sau khi đăng ký, bạn được đăng nhập tự động và được điều hướng về Trang chủ.

### 2.3. Đăng nhập

> **Bước 1.** Truy cập `/login`.

> **Bước 2.** Nhập **Email** + **Mật khẩu**.

> **Bước 3.** Nhấn **"Đăng Nhập"** (hoặc phím `Enter`).

Hệ thống sẽ tự động:
- Lưu **JWT token** vào `localStorage`.
- Gộp giỏ hàng tạm (nếu có) vào tài khoản vừa đăng nhập.
- Nếu là Admin → chuyển đến Bảng quản trị.
- Nếu là Buyer/Seller → chuyển về Trang chủ.

### 2.4. Tài khoản demo (chỉ dành cho môi trường dev/test)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| 🛒 **Buyer** | `linh.nguyen@gmail.com` | `123456` |
| 🏪 **Seller** | `shop.minhtu@thriftit.vn` | `shop123` |
| 🎯 **Demo** | `demo@thriftit.vn` | `demo123` |
| 🛡️ **Admin** | `admin@thriftit.vn` | `admin` |

> ⚠️ **Lưu ý bảo mật:** KHÔNG sử dụng các tài khoản demo này cho mục đích thật.

### 2.5. Đăng xuất

Vào **Tài khoản** (góc phải header) → nhấn nút **"Đăng xuất"** (màu đỏ).

Hệ thống sẽ xóa: session, token, role cache, giỏ hàng tạm, địa chỉ đã lưu.

---

## 3. Hướng dẫn cho Người mua (Buyer)

### 3.1. Tổng quan các trang người mua hay dùng

| Đường dẫn | Trang | Mục đích |
|-----------|-------|----------|
| `/` | **Trang chủ** | Khám phá sản phẩm, danh mục, shop nổi bật |
| `/products` | **Tìm kiếm** | Tìm & lọc sản phẩm theo danh mục, size, giá… |
| `/products/:id` | **Chi tiết sản phẩm** | Xem ảnh, mô tả, shop bán, đánh giá |
| `/sellers/:handle` | **Trang Shop** | Xem toàn bộ sản phẩm + đánh giá của 1 shop |
| `/cart` | **Giỏ hàng** | Quản lý sản phẩm đã chọn, áp mã giảm giá |
| `/checkout` | **Thanh toán** | Nhập địa chỉ, đặt hàng COD |
| `/account` | **Tài khoản** | Đơn mua, sổ địa chỉ, tin nhắn |
| `/notifications` | **Thông báo** | Trạng thái đơn, tin từ shop |

---

### 3.2. Khám phá sản phẩm (Trang chủ)

URL: `/`

**Các khu vực trên trang:**

1. **Banner Hero** — Tiêu điều chỉnh + 2 nút CTA:
   - 🌿 **"Khám phá ngay"** → sang trang Tìm kiếm.
   - 🏪 **"Kênh người bán"** (nếu bạn đã đăng ký Seller được duyệt) → sang trang Đăng bán.
   - Hoặc **"+ Đăng bán ngay"** (nếu chưa đăng ký Seller).

2. **Danh mục nổi bật** (6 ô):
   - ✨ Tất cả
   - 👕 Áo (Sơ mi, thun)
   - 👖 Quần (Jeans, kaki)
   - 👗 Váy (Đầm, chân váy)
   - 🧥 Áo khoác (Blazer, bomber)
   - 🧣 Phụ kiện (Khăn, thắt lưng)

   Nhấn vào một danh mục để lọc sản phẩm.

3. **Sản phẩm mới** — Grid sản phẩm (responsive 2 → 6 cột).
4. **Gợi ý Shop** — Các shop được đánh giá cao trong cộng đồng.

---

### 3.3. Tìm kiếm sản phẩm

URL: `/products`

#### 3.3.1. Tìm bằng từ khóa (Header Search)

- **Ô tìm kiếm trên Header** (luôn hiển thị): nhập từ khóa và nhấn 🔍 hoặc phím `Enter`.
- Kết quả sẽ hiển thị những sản phẩm có tên / danh mục / tên shop chứa từ khóa.

#### 3.3.2. Tìm kiếm bằng AI 🤖

- Nhấn **"AI Smart Search"** trong **Bộ lọc nâng cao** (cột trái) → thanh tìm kiếm chuyển sang chế độ AI.
- Gõ câu mô tả tự nhiên, ví dụ:
  - *"áo dạ retro cho mùa thu"*
  - *"quần jeans ống rộng size M nữ"*
  - *"váy hoa vintage đi biển"*
- AI sẽ phân tích ngữ nghĩa và trả về các sản phẩm liên quan nhất. Thời gian phản hồi ~ 600 ms.

#### 3.3.3. Bộ lọc nâng cao (Filter Sidebar)

| Bộ lọc | Cách dùng |
|--------|-----------|
| **Danh mục** | Tick chọn: Áo / Quần / Váy / Áo khoác / Phụ kiện (checkbox) |
| **Size** | Tick chọn: XS, S, M, L, XL, XXL |
| **Khoảng giá** | Nhập **Từ ₫** và **Đến ₫** → nhấn **Áp dụng** |
| **Độ mới** | Kéo thanh trượt (30% – 100%). Mặc định ≥ 50% |
| **Đánh giá shop** | Tick: Shop ⭐ 4+ trở lên / Shop ⭐ 4.5+ trở lên |

Nhấn **"Xóa tất cả"** để reset mọi bộ lọc.

#### 3.3.4. Sắp xếp

Menu thả xuống phía trên danh sách sản phẩm:
- **Mới nhất** (mặc định)
- **Giá tăng dần** / **Giá giảm dần**
- **Độ mới cao nhất**
- **Nổi bật nhất**

#### 3.3.5. Thích sản phẩm (Yêu thích) ❤️

- Trên mỗi **ProductCard**, nhấn vào **icon trái tim** (góc trên phải ảnh).
- Trạng thái "đã thích" được lưu cục bộ (`localStorage`) — danh sách yêu thích hiển thị qua icon ❤️.

---

### 3.4. Xem chi tiết sản phẩm

URL: `/products/:id`

#### 3.4.1. Các thông tin hiển thị

- **Ảnh sản phẩm**: Gallery (mũi tên trái / phải để chuyển ảnh, click thumbnail bên dưới).
- **Tên sản phẩm**, danh mục, size, độ mới (%), trạng thái kho.
- **Giá bán** (định dạng VND).
- **Bảng thuộc tính**: Danh mục, Size, Tình trạng thực tế, Số lượng kho.
- **Mô tả chi tiết** từ người bán.
- **Card Shop bán** (avatar, rating, số giao dịch, nút "Xem Shop" + "Chat").
- **3 huy hiệu bảo vệ**:
  - 🛡️ **Bảo vệ người mua** — Hoàn tiền 100% nếu có lỗi.
  - 🔄 **Đổi trả 7 ngày** — Khiếu nại minh bạch.
  - 📦 **Đồng kiểm khi nhận** — Xem hàng trước khi trả tiền.
- **Đánh giá từ người mua** (nếu có).

#### 3.4.2. Các hành động

| Nút | Hành động |
|-----|-----------|
| **Thêm vào giỏ hàng** | Thêm sản phẩm (với số lượng đã chọn) vào giỏ. Nút chuyển thành "✓ Đã thêm vào giỏ" trong 2 giây. |
| **Mua ngay** | Thêm vào giỏ + chuyển thẳng sang trang Giỏ hàng. |
| **Thích / Đã thích** ❤️ | Toggle trạng thái yêu thích. |
| **Xem Shop** | Đi đến trang Shop của người bán (`/sellers/@handle`). |
| **Chat** | Đi đến trang Tin nhắn (preview). |
| **Copy link** | Sao chép URL sản phẩm vào clipboard. |

#### 3.4.3. Điều chỉnh số lượng

- Sử dụng nút **−** / **+** hoặc nhập trực tiếp.
- Tối đa bằng **số lượng kho** còn lại.
- Tối thiểu = 1.

---

### 3.5. Quản lý Giỏ hàng

URL: `/cart`

> ⚠️ Giỏ hàng được lưu trên **server** (sau khi đăng nhập) và tự động **gộp với giỏ tạm** khi đăng nhập.

#### 3.5.1. Cấu trúc giỏ hàng

- **Giỏ hàng** được chia theo **Shop** (nhóm theo `@handle`).
- Mỗi shop có checkbox "chọn tất cả" riêng.
- Có thể chọn mua từ nhiều shop trong một lần thanh toán.

#### 3.5.2. Các hành động trên sản phẩm

| Hành động | Mô tả |
|-----------|-------|
| ✅ Chọn mua | Tick vào ô vuông để đưa vào đơn thanh toán |
| ➕ / ➖ Tăng/giảm số lượng | Cập nhật trực tiếp lên backend (`PATCH /api/cart/items/:id`) |
| 🗑️ Xóa | Xóa sản phẩm khỏi giỏ |
| 🗑️ **Xóa SP hết hàng** | Xóa nhanh các sản phẩm đã bán / hết kho |
| 🗑️ **Xóa đã chọn** | Xóa nhanh các sản phẩm đang chọn |

> 💡 Sản phẩm **hết hàng** hoặc **đã bán** hiển thị với overlay "ĐÃ BÁN" / "HẾT HÀNG" và không thể chọn mua.

#### 3.5.3. Mã giảm giá (Promo Code)

Nhập một trong các mã (nếu có):
- `THRIFT10` — Giảm 10% tổng tạm tính
- `VINTAGE` — Tương tự THRIFT10
- `FREESHIP` — (đang phát triển)

Nhấn **"Áp dụng"**. Mã hợp lệ sẽ hiển thị "✓ Đã dùng".

#### 3.5.4. Tóm tắt đơn hàng (Sidebar phải)

- **Tạm tính**: Tổng tiền các sản phẩm đã chọn.
- **Phí vận chuyển**: `30.000 ₫ × số shop khác nhau` (mỗi shop tính 30.000₫).
- **Giảm giá**: Hiển thị khi áp mã thành công.
- **Tổng thanh toán**: Tạm tính + Ship − Giảm giá.

#### 3.5.5. Tiến hành thanh toán

Nhấn nút **"Mua Hàng (X món)"** (màu cam) → chuyển sang trang Thanh toán (`/checkout`).

> ⚠️ Phải chọn **ít nhất 1 sản phẩm khả dụng** mới có thể bấm Mua.

---

### 3.6. Thanh toán (Checkout)

URL: `/checkout` (Yêu cầu đăng nhập)

Quy trình gồm **3 bước** (hiển thị thanh tiến trình trên đầu):

#### Bước 1 — Địa chỉ (Address)

**Hệ thống Sổ địa chỉ thông minh:**

- Nếu đã có địa chỉ mặc định → tự động điền sẵn.
- Nhấn **"Đổi"** (góc phải thẻ địa chỉ) → mở modal chọn địa chỉ.
- Hoặc nhấn **"Chọn từ sổ địa chỉ (đã lưu)"** để mở modal.

**Modal Sổ địa chỉ** cho phép:
- Chọn 1 địa chỉ đã lưu.
- **Thêm địa chỉ mới** ngay trong modal:
  - Họ tên người nhận
  - Số điện thoại (10–11 chữ số)
  - **Tỉnh/Thành phố** → chọn từ dropdown (dữ liệu từ **CAS Address Kit**)
  - **Phường/Xã** → dropdown phụ thuộc Tỉnh đã chọn
  - Số nhà, tên đường (ô nhập tự do)
  - ☑️ Đặt làm mặc định (nếu đã có địa chỉ khác)

> 📦 **Lưu ý hành chính:** Sau sáp nhập, chỉ còn **2 cấp**: Tỉnh/Thành + Phường/Xã. Hệ thống KHÔNG dùng Quận/Huyện nữa.

**Các trường bắt buộc** (validation):
- ✅ Họ tên (không rỗng)
- ✅ Số điện thoại 10–11 chữ số (`/^\d{10,11}$/`)
- ✅ Địa chỉ chi tiết ≥ 10 ký tự

Nhấn **"Xác nhận thông tin"** → sang bước 2.

#### Bước 2 — Xác nhận đơn (Review)

- Hiển thị danh sách sản phẩm đã chọn (ảnh, tên, size × qty, thành tiền).
- Phương thức thanh toán: **COD (Thanh toán khi nhận hàng)** — phương thức duy nhất hiện tại.
- Tổng tiền cuối cùng.

Nhấn **"Đặt hàng - Thanh toán khi nhận"** → hệ thống gọi:
1. `POST /api/orders` — tạo đơn.
2. `POST /api/payments/checkout` — xác nhận thanh toán (auto COD → `CONFIRMED`).
3. Giỏ hàng tự động được làm mới (đã loại bỏ sản phẩm đã đặt).

#### Bước 3 — Hoàn tất

- Hiển thị **Mã đơn hàng** (VD: `ORD-123456`).
- Thông tin người nhận, địa chỉ, tổng tiền.
- 2 nút: **"Xem đơn mua"** → `/account` hoặc **"Tiếp tục mua sắm"** → `/`.

---

### 3.7. Quản lý Đơn mua (Buyer Dashboard)

URL: `/account` → tab **"Đơn mua"** (mặc định cho Buyer)

#### 3.7.1. Các trạng thái đơn (5 tab)

| Tab | Trạng thái Order tươngứng | Mô tả |
|-----|---------------------------|-------|
| ⏰ **Chờ thanh toán** | `PENDING_PAYMENT` | Đơn chưa thanh toán (hiếm — COD tự động `CONFIRMED`) |
| 📦 **Chờ lấy hàng** | `CONFIRMED`, `PACKING` | Đã thanh toán, shop đang chuẩn bị hàng |
| 🚚 **Đang giao** | `SHIPPING`, `DELIVERING`, `DELIVERED` | Đang vận chuyển / đã giao |
| ⭐ **Đánh giá** | `COMPLETED` | Đơn hoàn tất, có thể đánh giá |
| ❌ **Đã hủy** | `CANCEL_REQUESTED`, `CANCELLED`, `DISPUTED`, `REFUNDED` | Đơn hủy / tranh chấp |

#### 3.7.2. Hành động theo trạng thái

**Chờ thanh toán:**
- Nút **"Tiếp tục thanh toán"** → thử thanh toán lại qua cổng (mock card `1234`).

**Chờ lấy hàng:**
- Hiển thị thông tin **vận đơn** ngay khi seller tạo:
  - Đơn vị vận chuyển (GHTK / mock)
  - Mã vận đơn (`GHTK...`)
  - Trạng thái: Chờ tạo / Đã tạo / Đã lấy / Đang vận chuyển / Đã giao
  - Dự kiến giao (ngày)
  - Link theo dõi ↗
- Nút **"Yêu cầu hủy"** → gửi yêu cầu hủy đến seller (chuyển trạng thái `CANCEL_REQUESTED`).

**Đang giao:**
- Nút **"Xác nhận đã nhận"** → chuyển trạng thái `COMPLETED` (sau khi đã `DELIVERED`).

**Đánh giá:**
- Nút **"Đánh giá ngay"** → mở modal đánh giá (xem mục 3.8).
- Sau khi đánh giá, hiển thị **"✓ Đã đánh giá"**.

---

### 3.8. Đánh giá sản phẩm

Khi đơn ở trạng thái `COMPLETED`, nhấn **"Đánh giá ngay"** trên đơn → mở modal với:

- **Ảnh & tên sản phẩm** + tên shop.
- **5 ngôi sao** — chọn mức đánh giá:
  - ⭐ 1: *Không hài lòng*
  - ⭐⭐ 2: *Chưa hài lòng*
  - ⭐⭐⭐ 3: *Bình thường*
  - ⭐⭐⭐⭐ 4: *Hài lòng*
  - ⭐⭐⭐⭐⭐ 5: *Rất hài lòng*
- **Ô nhận xét** (tối đa 500 ký tự).
- Nhấn **"Gửi đánh giá"** → lưu vào database, gửi thông báo cho seller.

> 💡 Mỗi đơn hàng chỉ được đánh giá **1 lần duy nhất**. Không thể sửa sau khi gửi.

---

### 3.9. Sổ địa chỉ

URL: `/account` → tab **"Sổ địa chỉ"** (chỉ cho Buyer)

#### 3.9.1. Xem địa chỉ

Mỗi địa chỉ hiển thị dưới dạng **thẻ (card)** với:
- Họ tên người nhận, SĐT
- Địa chỉ đầy đủ (số nhà + phường/xã + tỉnh/thành)
- Tag **"Mặc định"** (nếu là địa chỉ mặc định)

#### 3.9.2. Thêm địa chỉ mới

Nhấn **"Thêm địa chỉ"** → form hiện ra:
1. Họ tên + SĐT
2. Chọn Tỉnh/Thành (dropdown từ CAS Address Kit)
3. Chọn Phường/Xã (dropdown phụ thuộc)
4. Số nhà, tên đường
5. ☑️ Đặt làm mặc định (chỉ hiện nếu đã có địa chỉ khác)

Nhấn **"Thêm địa chỉ"** → lưu.

#### 3.9.3. Sửa / Xóa / Đặt mặc định

- Trên mỗi thẻ địa chỉ:
  - ✏️ **Sửa** → mở form sửa.
  - 🗑️ **Xóa** → xác nhận → xóa vĩnh viễn.
  - ⭐ **Đặt làm mặc định** → đánh dấu làm mặc định (các địa chỉ khác sẽ bỏ tag mặc định).

---

### 3.10. Tin nhắn (Preview)

URL: `/messages`

> ⚠️ **Trạng thái:** Tính năng nhắn tin giữa người mua và người bán đang trong giai đoạn **preview**. Hội thoại hiển thị với dữ liệu mẫu. Dự kiến ra mắt chính thức trong phiên bản tiếp theo.

#### 3.10.1. Giao diện

- **Cột trái**: Danh sách liên hệ (search, badge tin chưa đọc).
- **Cột phải**: Cửa sổ chat
  - Header: Avatar shop + trạng thái online + sản phẩm đang hỏi
  - Messages: Bong bóng chat (trái = của shop, phải = của bạn)
  - Footer: Ô nhập + nút gửi

#### 3.10.2. Cách gửi tin nhắn

- Nhập text → nhấn **Enter** hoặc nút 📤.
- Shop sẽ tự động reply sau ~1.5 giây (mô phỏng).

---

### 3.11. Thông báo

URL: `/notifications`

- Hiển thị tất cả thông báo của bạn (đơn hàng, chat, khuyến mãi, đánh giá, hệ thống).
- **Badge đỏ** trên Header cho biết số thông báo chưa đọc.
- Nút **"Đánh dấu đã đọc tất cả"** → đánh dấu toàn bộ là đã đọc.

Các loại thông báo:

| Icon | Loại | Mô tả |
|------|------|-------|
| 📦 | `order` | Đơn hàng cập nhật trạng thái |
| 💬 | `chat` | Tin nhắn mới từ shop |
| 🏷️ | `promo` | Khuyến mãi, mã giảm giá |
| 🔔 | `system` | Thông báo hệ thống |
| ⭐ | `review` | Đánh giá mới cho shop |

---

### 3.12. Quy trình mua sắm tổng hợp

```
Trang chủ / Trang sản phẩm
        │
        ▼
Tìm kiếm (từ khóa / AI / lọc)
        │
        ▼
Xem chi tiết sản phẩm
        │
        ├─── Thêm vào giỏ ───────────┐
        │                            │
        └─── Mua ngay ───┐           │
                          ▼           ▼
                       Giỏ hàng ←────┘
                          │
                  (chọn sản phẩm, áp mã)
                          │
                          ▼
                    Thanh toán
                  (chọn địa chỉ)
                          │
                          ▼
                   Đặt hàng COD
                          │
                          ▼
                Chờ seller xác nhận
                          │
                          ▼
              Seller tạo vận đơn
                          │
                          ▼
                Vận chuyển / Giao hàng
                          │
                          ▼
                  Nhận hàng & Kiểm tra
                          │
                          ▼
                Xác nhận đã nhận (COMPLETED)
                          │
                          ▼
                    Đánh giá sản phẩm ⭐
```

---

## 4. Hướng dẫn cho Người bán (Seller)

### 4.1. Trở thành Người bán

#### 4.1.1. Ai có thể trở thành Seller?

- Bất kỳ user đã đăng ký tài khoản đều có thể đăng ký trở thành Seller.
- Không giới hạn — mỗi người chỉ có thể đăng ký **1 Shop** với **1 định danh `@handle`**.

#### 4.1.2. Quy trình đăng ký Shop

> **Bước 1.** Đăng nhập → vào `/account` → nhấn **"+ Đăng bán ngay"** (hoặc vào `/seller/apply`).

> **Bước 2.** Điền **form đăng ký Shop**:
> - **Tên Shop** *(bắt buộc, ≥ 3 ký tự, ≤ 100 ký tự)*
>   - VD: `Tiệm đồ cũ của Linh`, `Shop Thông Đồ cũ`
> - **Tên định danh (`@handle`)** *(bắt buộc, 3–30 ký tự)*
>   - Quy tắc: chữ thường không dấu (a-z), số (0-9), dấu chấm (`.`), gạch dưới (`_`).
>   - VD: `thongshop.vintage`, `linh_vintage`, `tieulam_2nd`
>   - Hệ thống tự động gợi ý handle từ tên shop (có thể chỉnh tay).
> - **Giới thiệu Shop** *(tùy chọn)* — Mô tả ngắn phong cách, loại đồ sẽ bán.

> **Bước 3.** Nhấn **"Gửi đơn đăng ký"**.

> **Bước 4.** Hệ thống chuyển sang trạng thái **`PENDING`** — chờ Admin duyệt.

> **Bước 5.** Admin duyệt → bạn nhận được thông báo → chuyển trạng thái **`APPROVED`** → có thể đăng bán ngay.

#### 4.1.3. Các trạng thái Seller

| Trạng thái | Ý nghĩa | Hành động được phép |
|------------|----------|---------------------|
| `NONE` | Mặc định khi mới đăng ký tài khoản | Đăng ký Shop |
| `PENDING` | Đã nộp hồ sơ, chờ Admin duyệt | Chờ |
| `APPROVED` | Đã được duyệt, có thể đăng bán | Đăng bán, quản lý Shop |
| `REJECTED` | Bị từ chối | Nộp lại hồ sơ mới |

> ⚠️ Nếu hồ sơ bị từ chối, người dùng có thể đăng ký lại với tên/handle khác.

---

### 4.2. Đăng bán sản phẩm

URL: `/sell` (Yêu cầu Seller Status = `APPROVED`)

#### 4.2.1. Các bước đăng bán

> **Bước 1.** Truy cập `/sell` (hoặc nhấn **"Đăng bán sản phẩm"** trong trang Tài khoản).

> **Bước 2.** **Upload ảnh sản phẩm** (tối đa 6 ảnh):
> - Kéo thả ảnh vào ô vuông **HOẶC** nhấn để chọn từ máy.
> - Định dạng: JPG, PNG. Tối đa 10MB/ảnh.
> - **Ảnh đầu tiên** sẽ là **ảnh bìa** (hiển thị trên ProductCard).
> - Hệ thống tự động nén ảnh xuống ≤ 800×800 px để tối ưu.

> **Mẹo chụp ảnh bán nhanh:**
> - 📸 Chụp dưới ánh sáng tự nhiên (màu thật nhất)
> - 📸 Chụp nhiều góc: trước, sau, cổ, tay áo, chi tiết đặc biệt
> - 📸 Đặt hàng phẳng hoặc trên mannequin
> - 📸 Ảnh rõ nét bán nhanh gấp 3 lần ảo nhòe

> **Bước 3.** Điền **thông tin sản phẩm**:

| Trường | Bắt buộc | Quy tắc |
|--------|----------|---------|
| **Tên sản phẩm** | ✅ | 5–100 ký tự |
| **Danh mục** | ✅ | Áo / Quần / Váy / Áo khoác / Phụ kiện |
| **Mô tả chi tiết** | ❌ | ≤ 2000 ký tự (khuyến nghị ≥ 20 ký tự) |
| **Giá bán** | ✅ | > 0, ≤ 999.999.999₫ |
| **Số lượng** | ✅ | ≥ 1 |
| **Size** | ❌ | XS / S / M / L / XL / XXL (mặc định M) |
| **Độ mới (%)** | ❌ | 30% – 100% (kéo thanh trượt) |

> **Bước 4 (Tùy chọn).** Nhấn **"AI gợi ý giá & loại"** để AI phân tích:
> - Gợi ý **giá bán** phù hợp với thị trường.
> - Gợi ý **danh mục** chính xác.
> - Thêm **tags** vào mô tả.

> **Bước 5.** Nhấn **"Đăng bán ngay 🌿"** → hiển thị modal **"Kiểm tra sản phẩm"** (review).

> **Bước 6.** Nhấn **"Gửi duyệt 🌿"** → sản phẩm ở trạng thái **`pending`** (chờ Admin duyệt).

> 💡 Hệ thống sẽ thông báo: *"Đã gửi yêu cầu đăng bán sản phẩm 'X'. Admin sẽ duyệt tin của bạn trong thời gian sớm nhất!"*

#### 4.2.2. Phí nền tảng

- Phí hoa hồng: **5%** trên giá bán.
- Khi nhập giá, hệ thống tự hiển thị **"Thực nhận"** (sau khi trừ phí).
- Phí chỉ được tính khi đơn hàng **giao thành công**.

---

### 4.3. Quản lý Shop (Kênh người bán)

URL: `/account` → tab **"Kinh doanh"** (mặc định cho Seller)

#### 4.3.1. Các tab trong Kênh người bán

| Tab | Mô tả |
|-----|-------|
| 🏪 **Tất cả** | Hiển thị toàn bộ sản phẩm (mọi trạng thái) |
| 🟢 **Đang bán** | Sản phẩm đang active |
| 🟡 **Chờ duyệt** | Sản phẩm chờ Admin duyệt |
| 🔵 **Đã bán** | Sản phẩm đã hoàn tất giao dịch |
| ⭐ **Đánh giá** | Tổng hợp đánh giá từ khách hàng |

#### 4.3.2. Thống kê tổng quan

Phía trên các tab hiển thị các chỉ số:

- 📦 **Tổng sản phẩm**
- 🟢 **Đang bán** (active)
- 🟡 **Chờ duyệt** (pending)
- 🔵 **Đã bán** (sold)
- 👁️ **Tổng lượt xem**
- ❤️ **Tổng lượt thích**
- 💰 **Doanh thu ước tính**

#### 4.3.3. Hành động trên sản phẩm

| Hành động | Mô tả |
|-----------|-------|
| ✏️ **Sửa** | Sửa thông tin (chưa được triển khai UI trong phiên bản này) |
| 🗃️ **Lưu trữ** | Chuyển sang `archived` — ẩn khỏi trang chủ nhưng giữ lịch sử |
| 📊 **Xem chi tiết** | Xem lượt xem, lượt thích, đánh giá |

---

### 4.4. Quản lý Đơn bán (Seller Orders)

URL: `/account` → tab **"Kinh doanh"** → cuộn xuống phần đơn hàng

#### 4.4.1. Các trạng thái đơn Seller xử lý

Đơn hàng chứa sản phẩm của bạn sẽ hiển thị ở đây với các trạng thái:

| Trạng thái | Ý nghĩa | Hành động Seller |
|------------|----------|------------------|
| `PENDING_PAYMENT` | Chờ thanh toán | Chờ |
| `PAID` | Đã thanh toán | Chuẩn bị hàng |
| `CONFIRMED` | Đã xác nhận | Đóng gói |
| `PACKING` | Đang đóng gói | Tạo vận đơn |
| `SHIPPING` | Đang vận chuyển | Theo dõi |
| `DELIVERING` | Đang giao | Theo dõi |
| `DELIVERED` | Đã giao | Chờ buyer xác nhận |
| `COMPLETED` | Hoàn tất | Đã xong |
| `CANCEL_REQUESTED` | Buyer yêu cầu hủy | Duyệt/Từ chối |
| `CANCELLED` | Đã hủy | Hoàn kho |
| `DISPUTED` | Tranh chấp | Xử lý khiếu nại |
| `REFUNDED` | Đã hoàn tiền | Hoàn tất |

#### 4.4.2. Tạo Vận đơn (Shipment)

Khi đơn ở trạng thái `CONFIRMED` hoặc `PACKING`, seller nhấn **"Tạo vận đơn"** → mở dialog:

> 📦 **Lưu ý quan trọng:** Trước khi tạo vận đơn, bạn nên **Thiết lập Kho hàng** trước (xem mục 4.5) để hệ thống tự động điền thông tin lấy hàng.

**Dialog Tạo vận đơn:**

- **Tên cửa hàng** *(tự động từ Kho hàng)*
- **Số điện thoại** *(tự động từ Kho hàng)*
- **Địa chỉ lấy hàng** *(số nhà, đường — tự động từ Kho hàng)*
- **Phường/Xã** *(tự động từ Kho hàng)*
- **Tỉnh/Thành** *(tự động từ Kho hàng)*

Có thể chỉnh tay trước khi tạo.

Nhấn **"Tạo vận đơn"** → hệ thống tạo:
- Mã vận đơn GHTK (`GHTK...`)
- Tracking URL
- Estimated delivery
- Timeline events (CREATED, PICKED_UP, IN_TRANSIT)

Đơn tự động chuyển sang trạng thái **`SHIPPING`**.

#### 4.4.3. Theo dõi đơn

Mỗi đơn hiển thị:
- Mã đơn (`ORD-xxx`)
- Sản phẩm, số lượng, giá
- Tên + SĐT người nhận
- Địa chỉ giao hàng (đã snapshot lúc đặt)
- Trạng thái hiện tại (badge màu)

---

### 4.5. Kho hàng (Pickup Address)

URL: `/account` → tab **"Kho hàng"** (chỉ cho Seller)

#### 4.5.1. Tại sao cần thiết lập Kho?

- Đơn vị vận chuyển (GHTK / đối tác) cần đến **1 địa chỉ cố định** để lấy hàng.
- Nếu bạn **CHƯA** thiết lập Kho, mỗi lần tạo vận đơn sẽ phải nhập tay → mất thời gian.
- Nếu đã thiết lập Kho → hệ thống tự động điền vào dialog Tạo vận đơn.

#### 4.5.2. Thiết lập Kho lần đầu

Tab **"Kho hàng"** → nếu chưa có kho, hiển thị form yêu cầu nhập:

- **Tên Kho / Người bàn giao** *(VD: "Kho chính - Anh Tuấn")*
- **Số điện thoại** *(10-11 chữ số)*
- **Tỉnh/Thành** *(dropdown CAS)*
- **Phường/Xã** *(dropdown phụ thuộc)*
- **Số nhà, tên đường**

Nhấn **"Lưu kho hàng"** → Kho được lưu vào Address Book với `type = "warehouse"`.

#### 4.5.3. Cập nhật Kho

Nhấn **"Cập nhật kho hàng"** → chỉnh sửa → nhấn **"Lưu thay đổi"**.

> 💡 Mẹo: Thông tin Kho sẽ tự động điền vào dialog Tạo vận đơn mỗi khi có đơn mới. Bạn chỉ cần xác nhận tạo đơn vận chuyển.

---

### 4.6. Tin nhắn với Khách (Seller side)

URL: `/account` → tab **"Tin nhắn"** (preview)

> Xem chi tiết tại mục 3.10 — giao diện tương tự Buyer.

---

### 4.7. Huy hiệu "Shop uy tín"

Một Shop được gắn huy hiệu **"Shop uy tín ✓"** khi thỏa **CẢ 2 điều kiện**:

- ⭐ **Rating trung bình ≥ 4.0 / 5.0**
- 📦 **Số giao dịch (transactions) ≥ 5**

Huy hiệu hiển thị:
- Trên trang cá nhân Shop
- Trên ProductCard (badge "● Shop uy tín")
- Trên trang chi tiết sản phẩm (card seller)

> ⚠️ Không có huy hiệu = Shop mới. Hệ thống vẫn cho phép hoạt động bình thường.

---

### 4.8. Các số liệu & KPI cần quan tâm

| Chỉ số | Vai trò | Cách tăng |
|--------|---------|-----------|
| Rating (⭐) | Uy tín shop | Giao hàng đúng hẹn, đóng gói cẩn thận, mô tả trung thực |
| Transactions | Số giao dịch hoàn tất | Tăng số lượng sản phẩm + duy trì chất lượng dịch vụ |
| Views | Lượt xem sản phẩm | Ảnh đẹp + SEO từkhóa trong tên/mô tả |
| Likes | Lượt thích | Ảnh đẹp + mô tả chi tiết |
| Estimated Revenue | Doanh thu ước tính | Giá hợp lý + đề xuất sản phẩm hot |

---

### 4.9. Quy trình bán hàng tổng hợp

```
Đăng ký Shop → Chờ Admin duyệt
        │
        ▼
Đăng bán sản phẩm → Chờ Admin duyệt tin
        │
        ▼
Sản phẩm ACTIVE hiển thị trên sàn
        │
        ▼
Buyer đặt hàng → Đơn CONFIRMED
        │
        ▼
Đóng gói & Tạo vận đơn
        │
        ▼
Vận chuyển → Giao hàng → Buyer nhận
        │
        ▼
Buyer xác nhận → Đơn COMPLETED
        │
        ▼
Buyer đánh giá ⭐
```

---

## 5. Hướng dẫn cho Quản trị viên (Admin)

### 5.1. Đăng nhập Admin

> **Bước 1.** Truy cập `/login`.

> **Bước 2.** Đăng nhập bằng tài khoản Admin:
> - Email: `admin@thriftit.vn`
> - Mật khẩu: `admin`

> **Bước 3.** Hệ thống tự động chuyển đến **Bảng quản trị** (`/admin`).

> 💡 Tài khoản Admin cũng có thể truy cập Bảng quản trị bất kỳ lúc nào qua nút **"Admin Panel"** trên Header.

---

### 5.2. Tổng quan Bảng quản trị

URL: `/admin`

**Bố cục:**
- **Sidebar trái**: Logo + 4 tab + nút Đăng xuất.
- **Top bar**: Tiêu đề trang + thông tin admin đang đăng nhập.
- **Main content**: Nội dung tương ứng với tab đang chọn.

---

### 5.3. Tab "Tổng quan thống kê"

Hiển thị các chỉ số:

| Metric | Ý nghĩa |
|--------|----------|
| 💰 **Phí Hoa hồng C2C** | Tổng phí sàn thu được |
| ⏰ **Tin C2C chờ duyệt** | Số bài đăng C2C đang chờ duyệt |
| 📈 **Tổng doanh số C2C** | Tổng giá trị giao dịch |

**Panel Tỷ lệ Chiết khấu Platform:**
- Hiển thị tỷ lệ hoa hồng hiện tại (mặc định 5%).
- Thay đổi tỷ lệ cần cập nhật **PlatformFeeConfig** ở backend (qua API admin).

---

### 5.4. Tab "Duyệt bài đăng C2C"

> **Đây là tab quan trọng nhất** — mỗi sản phẩm mới đăng đều phải được Admin duyệt trước khi hiển thị công khai.

#### Quy trình duyệt

> **Bước 1.** Vào tab **"Duyệt bài đăng C2C"**.

> **Bước 2.** Xem bảng danh sách bài đăng chờ duyệt. Mỗi hàng gồm:
> - Ảnh thumbnail
> - Tên sản phẩm + ID
> - Người đăng (`@handle`)
> - Giá bán
> - 2 nút hành động

> **Bước 3.** Đối với mỗi bài đăng:
> - **Kiểm tra nội dung**: ảnh rõ ràng, mô tả trung thực, giá hợp lý, không vi phạm chính sách.
> - Nhấn **"✓ Duyệt bài"** → sản phẩm chuyển sang `active`, hiển thị trên trang chủ.
> - Hoặc nhấn **"✗ Từ chối"** → sản phẩm bị archive, người đăng được thông báo.

> ⚠️ Hành động duyệt/từ chối là **không thể hoàn tác** qua giao diện. Cần can thiệp backend nếu muốn khôi phục.

#### Tiêu chí duyệt bài

✅ **NÊN DUYỆT** khi:
- Ảnh rõ ràng, đúng sản phẩm
- Mô tả trung thực (chất liệu, kích thước, tình trạng)
- Giá hợp lý so với thị trường
- Danh mục chính xác

❌ **NÊN TỪ CHỐI** khi:
- Ảnh mờ, ảnh mạng, không phải sản phẩm thật
- Mô tả sai lệch hoặc không có
- Giá bất hợp lý (quá cao hoặc quá thấp)
- Sản phẩm bị cấm (đồ nhái, hàng cấm,…)
- Spam / đăng trùng lặp

---

### 5.5. Tab "Duyệt Shop"

> Tương tự duyệt bài, nhưng là **hồ sơ đăng ký Shop** (trở thành Seller).

#### Quy trình

> **Bước 1.** Vào tab **"Duyệt Shop"**.

> **Bước 2.** Xem bảng hồ sơ chờ duyệt:
> - Tên Shop
> - Người đăng ký (Họ tên + Email)
> - Giới thiệu Shop

> **Bước 3.** Đối với mỗi hồ sơ:
> - Nhấn **"✓ Cấp quyền"** → user được cấp role `seller`, có thể đăng bán.
> - Hoặc nhấn **"✗ Từ chối"** → hồ sơ bị từ chối.

---

### 5.6. Tab "Danh sách tài khoản"

URL: `/admin` → tab **"Danh sách tài khoản"**

#### 5.6.1. Chức năng

- Hiển thị danh sách tất cả user (Buyer, Seller, Admin).
- **Lọc theo vai trò**: Tất cả / Người mua (Buyer) / Người bán (Seller).
- **Phân trang**: 15 users/trang.

#### 5.6.2. Hành động trên tài khoản

| Nút | Hành động |
|-----|-----------|
| **🔒 Khóa TK** | Khóa tài khoản — nhập lý do (lý do được lưu vào `accountStatusReason`) |
| **🔓 Mở Khóa** | Khôi phục tài khoản bị khóa |

> ⚠️ Tài khoản bị khóa (`suspended`) **KHÔNG THỂ** đăng nhập hoặc thực hiện hành động. Đơn hàng đang xử lý vẫn được giữ để giải quyết.

---

### 5.7. Các quy ước Quản trị quan trọng

#### 5.7.1. Nguyên tắc KHÔNG xóa dữ liệu lịch sử

- ❌ **KHÔNG** xóa sản phẩm có đơn hàng phụ thuộc.
- ❌ **KHÔNG** truncate `ledgers`, `platformfeeconfigs`, `orders`.
- ✅ Dùng **`archive`** thay vì `delete` cho sản phẩm.
- ✅ Backup trước khi thay đổi lớn: `npm run db:backup`.

#### 5.7.2. Scripts quản trị Backend

| Lệnh | Mục đích |
|------|----------|
| `npm run db:backup` | Tạo snapshot JSON của database |
| `npm run db:reset -- --execute --confirm-reset` | Xóa sạch carts/notifications, archive sản phẩm active (giữ lịch sử) |
| `npm run db:seed -- --execute --confirm-seed` | Tạo 25 sản phẩm demo phân bố cho các seller hiện có |

> ⚠️ Tuyệt đối **KHÔNG** dùng production URI làm fallback khi test.

---

## 6. Câu hỏi thường gặp (FAQ)

### 6.1. Cho người mua

**Q: Tôi có thể mua hàng mà không cần đăng ký tài khoản không?**
> A: Có — bạn có thể duyệt sản phẩm và thêm vào giỏ hàng tạm. Tuy nhiên, để thanh toán, bạn **BẮT BUỘC** phải đăng nhập.

**Q: Mật khẩu yêu cầu tối thiểu bao nhiêu ký tự?**
> A: Tối thiểu **6 ký tự**.

**Q: Phí vận chuyển được tính thế nào?**
> A: Phí ship = **30.000₫ × số shop khác nhau** trong giỏ hàng. Mỗi shop tính riêng.

**Q: Tôi có thể hủy đơn sau khi đã đặt không?**
> A: Có — bạn có thể gửi **"Yêu cầu hủy"** khi đơn ở trạng thái `Chờ lấy hàng`. Seller sẽ duyệt.

**Q: Phương thức thanh toán nào được hỗ trợ?**
> A: Hiện tại chỉ hỗ trợ **COD (Thanh toán khi nhận hàng)**. Các phương thức khác (thẻ, ví điện tử) sẽ được bổ sung trong phiên bản tiếp theo.

**Q: Khi nào tôi nên đánh giá sản phẩm?**
> A: Sau khi đơn hàng ở trạng thái **`COMPLETED`** (đã xác nhận nhận hàng). Bạn chỉ có thể đánh giá **1 lần** cho mỗi đơn.

**Q: AI Smart Search hoạt động thế nào?**
> A: Bạn bật toggle **"AI"** trong Bộ lọc → nhập câu mô tả tự nhiên (VD: *"áo dạ retro cho mùa thu"*) → AI phân tích ngữ nghĩa và trả về kết quả phù hợp nhất.

**Q: Mã giảm giá có giá trị thế nào?**
> A: Mã `THRIFT10` / `VINTAGE` giảm **10%** tổng tạm tính (chưa tính phí ship).

---

### 6.2. Cho người bán

**Q: Ai có thể trở thành Seller?**
> A: Bất kỳ user nào đã đăng ký tài khoản. Sau khi điền form Shop, hồ sơ chờ Admin duyệt (thường 24–48 giờ).

**Q: Tôi có thể đổi `@handle` sau khi đã đăng ký không?**
> A: Hiện tại KHÔNG — `@handle` là định danh cố định, không thể đổi qua UI. Liên hệ Admin nếu cần thiết.

**Q: Phí nền tảng là bao nhiêu?**
> A: **5%** trên giá bán thành công. Phí chỉ tính khi đơn `COMPLETED`.

**Q: Tại sao sản phẩm của tôi chưa hiển thị sau khi đăng?**
> A: Sản phẩm mới đăng ở trạng thái `pending` và cần Admin duyệt. Thời gian duyệt: thường 2–4 giờ trong giờ làm việc.

**Q: Tôi có thể bán đồ mới (chưa qua sử dụng) không?**
> A: Có — đặt "Độ mới" = 100%. Tuy nhiên, sàn thiên về đồ 2hand/vintage.

**Q: Tôi có thể bán ở nhiều danh mục khác nhau không?**
> A: Có — mỗi sản phẩm đăng chọn 1 danh mục, nhưng Shop có thể bán đa dạng danh mục.

**Q: Làm sao để có huy hiệu "Shop uy tín"?**
> A: Rating ≥ 4.0 ⭐ VÀ ≥ 5 giao dịch hoàn tất.

---

### 6.3. Cho Admin

**Q: Tôi có thể khôi phục sản phẩm đã archive không?**
> A: Cần can thiệp backend (PATCH `/api/products/:id` để un-archive) hoặc qua database.

**Q: Phí hoa hồng được tính thế nào?**
> A: Hiện tại là **5%** mặc định (hardcoded trong backend). Sắp tới sẽ có bảng `PlatformFeeConfig` linh hoạt hơn.

**Q: Tôi có thể tạo tài khoản Admin mới không?**
> A: Cần thao tác trực tiếp trong database hoặc qua API admin (đang phát triển).

**Q: Khi nào nên dùng script `db:reset`?**
> A: Chỉ trên môi trường **dev/test** để dọn dẹp catalog trước khi demo. **TUYỆT ĐỐI KHÔNG** chạy trên production.

---

## 7. Liên hệ & Hỗ trợ

### 7.1. Kênh hỗ trợ

| Kênh | Thông tin |
|------|-----------|
| 💬 **Tin nhắn trong app** | `/messages` (preview) |
| 🔔 **Thông báo** | `/notifications` |
| 📧 **Email hỗ trợ** | support@thriftit.vn (tham khảo) |
| 📱 **Hotline** | *(tham khảo footer)* |
| 📘 **Facebook / Instagram / TikTok / Zalo** | Xem Footer trên trang chủ |

### 7.2. Tài liệu kỹ thuật tham khảo (dành cho dev)

| Tài liệu | Đường dẫn |
|----------|-----------|
| API Contract | `docs/API_CONTRACT.md` |
| Auth Specification | `docs/AUTH_SPEC.md` |
| Error Codes | `docs/ERROR_CODES.md` |
| Enum Mapping | `docs/ENUMS.md` |
| API Changelog | `docs/API_CHANGELOG.md` |
| API Matrix | `docs/API_MATRIX.md` |
| Integration Guide | `docs/INTEGRATION_GUIDE.md` |
| OpenAPI Spec | `docs/openapi.yaml` |
| AI Context | `AI_CONTEXT.md` |
| Project Rules | `AGENTS.md` |

### 7.3. Phím tắt hữu ích (UI)

| Phím | Hành động |
|------|-----------|
| `Enter` (trên Login) | Đăng nhập |
| `Enter` (trên Search bar) | Tìm kiếm |
| `Enter` (trên Chat input) | Gửi tin nhắn |

---

## Phụ lục: Thông số kỹ thuật (Tech Stack)

### Frontend
- **Framework**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS + CSS variables (theme màu cà phê vintage)
- **Routing**: react-router v6
- **HTTP Client**: Custom `api.ts` với JWT interceptor
- **State**: React `useState`/`useEffect` + localStorage cache

### Backend
- **Framework**: Express + TypeScript
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT (HS256) + bcrypt
- **Order State Machine**: 11 trạng thái với audit trail
- **Shipment**: GHTK integration (mock provider trong dev)
- **Payment**: COD-first, hỗ trợ card (qua `/api/payments/checkout`)
- **Address**: CAS Address Kit proxy (2-level hành chính)

### Tích hợp bên thứ 3
- **CAS Address Kit**: `https://production.cas.so/address-kit` (proxy qua backend, cache 24h)
- **Shipping**: GHTK (Giao Hàng Tiết Kiệm)
- **AI Search**: `POST /api/ai/search` (semantic search)
- **AI Analyze Listing**: `POST /api/ai/analyze-listing`

---

**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-10-03
**Frontend version**: tương ứng với `frontend/src/` tại ngày 03/10/2026.

> Tài liệu này được sinh tự động dựa trên mã nguồn frontend thực tế của dự án. Nếu phát hiện sai lệch, vui lòng cập nhật tài liệu cùng với code change.