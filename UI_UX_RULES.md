# 🎨 THRIFT IT! — UI/UX RULES

## 1. Mục tiêu tổng thể

> **Modern second-hand marketplace — Mobile-first — Clean — Editorial — Trustworthy — Product-first**

Ưu tiên:

1. Dễ dùng
2. Dễ tìm sản phẩm
3. Dễ mua
4. Dễ bán
5. Responsive
6. Tin cậy
7. Đồng nhất giao diện

**Không redesign business logic. Không thay đổi API/business flow nếu không được yêu cầu.**

---

## 2. Mobile-first là bắt buộc

Thiết kế từ mobile trước, sau đó mở rộng lên tablet/desktop.

### Breakpoint tư duy

```text
Mobile       360–430px
Tablet       768px+
Desktop      1024px+
Large        1280px+
```

### Mobile rules

* Không horizontal overflow.
* Không để component bị cắt.
* Không ép desktop layout xuống mobile.
* Button đủ lớn để bấm bằng ngón tay.
* Input full width.
* Navigation có thể scroll ngang nếu danh mục nhiều.
* Product grid thường **2 cột**.
* Khoảng cách phải thoáng nhưng không làm mất quá nhiều nội dung.
* Nội dung quan trọng phải xuất hiện sớm.

**Đặc biệt:**

> Mobile không phải desktop thu nhỏ.

---

## 3. Visual hierarchy

Mỗi màn hình phải có thứ tự thị giác rõ:

```text
Page title
↓
Primary information
↓
Primary action
↓
Secondary information
↓
Secondary action
```

Không để mọi thứ đều nổi bật như nhau.

### Ví dụ Product

```text
Ảnh
↓
Tên sản phẩm
↓
Giá
↓
Condition
↓
Location/Seller
↓
CTA
```

---

## 4. Product-first

`thrift it!` là marketplace nên **sản phẩm phải là trung tâm**, không phải decoration.

Homepage ưu tiên:

```text
Header
↓
Search
↓
Category
↓
Hero ngắn
↓
Sản phẩm mới
↓
Sản phẩm nổi bật / Seller
↓
Footer
```

Không để hero/banner chiếm quá nhiều màn hình mobile khiến người dùng phải scroll lâu mới thấy sản phẩm.

---

## 5. Product Card

Product card phải ưu tiên:

```text
[ IMAGE ]
    ♡

Product name
Price
Condition
Location / Seller
```

Không nhồi quá nhiều badge.

### Image

* Tỷ lệ đồng nhất.
* Không méo ảnh.
* Không crop ngẫu nhiên giữa các card.
* Loading state rõ ràng.

### Heart

* Nhỏ gọn.
* Không che sản phẩm quá nhiều.
* Có trạng thái active/inactive rõ ràng.

---

## 6. CTA — chỉ có 3 cấp độ

Không tạo quá nhiều kiểu button.

### Primary

Orange / brand color.

Dùng cho:

* Mua ngay
* Đăng nhập
* Đăng ký
* Checkout
* Đăng bán

### Secondary

Outline / neutral.

Dùng cho:

* Thêm vào giỏ
* Đăng bán cá nhân
* Tiếp tục mua

### Tertiary

Text button.

Dùng cho:

* Xem tất cả
* Quay lại
* Hủy
* Chi tiết

**Một màn hình chỉ nên có 1 primary CTA chính.**

---

## 7. Design system phải đồng nhất

Không tự tạo style riêng cho từng page.

### Typography

Giữ một hệ thống font:

```text
Heading
Subheading
Body
Caption
```

Heading có thể dùng serif/editorial để tạo chất fashion.

Body dùng sans-serif dễ đọc.

### Spacing

Dùng hệ thống spacing nhất quán:

```text
4, 8, 12, 16, 24, 32, 48, 64
```

### Border radius

Chọn một hệ thống radius thống nhất: Small, Medium, Large, Pill.

---

## 8. Color rule

Palette hiện tại của `thrift it!`:

```text
Cream
Brown
Espresso
Orange
Soft Beige
```

Orange là **accent/action color**.

Nguyên tắc:

> Neutral background + dark typography + orange CTA.

---

## 9. Header

Header phải responsive, rõ hierarchy, không quá cao, search dễ thấy.
Mobile ưu tiên:

```text
Logo        Icons
------------------
Search
------------------
Categories
```

Nếu categories nhiều -> horizontal scroll. **Không để category bị cắt ngang màn hình.**

---

## 10. Hero

Hero chỉ có nhiệm vụ: truyền tải brand + đưa người dùng tới sản phẩm.
Mobile: Hero thấp hơn desktop. Headline vừa phải. Description ngắn. 1 primary CTA.

---

## 11. Form UI

Login/Register/Seller Apply/Checkout phải:
* Label rõ.
* Input full width trên mobile.
* Error hiển thị ngay gần field.
* Focus state rõ.
* Password có show/hide.
* Không tạo card quá hẹp trên mobile.

---

## 12. Authentication UI

Không được dùng: fake login, demo account fallback, hardcoded emails, fake role, fake user data.
Phải lấy từ JWT -> session/user -> roles -> sellerStatus.

---

## 13. Không fake functionality

Không làm UI trông như tính năng đã hoạt động nếu backend chưa hỗ trợ (ví dụ: mock stats, fake review prompt, fake order status).

---

## 14. Backend là source of truth

Frontend **không được quyết định** logic kinh doanh (giá cuối, stock, order status, role).
UI phải hiển thị lỗi backend trả về.

---

## 15. Mọi màn hình phải có đủ states

Mỗi API-driven screen phải nghĩ tới: Loading, Success, Empty, Error, Unauthorized, Forbidden, Offline, Retry.

---

## 16. Error state

Không dùng lỗi kỹ thuật trực tiếp cho người dùng (vd: AxiosError 403). Hãy chuyển đổi thành text thân thiện (vd: "Bạn không có quyền thực hiện thao tác này").

---

## 17. Loading state

Không để màn hình trắng. Dùng skeleton, spinner nhỏ, hoặc disabled button. Tránh double submit.

---

## 18. Empty state

Cần có: Icon / illustration, Title, Short explanation, Action.

---

## 19. Accessibility

Contrast đủ rõ, input có label, touch target đủ lớn. Không dùng text quá nhỏ trên mobile.

---

## 20. Responsive QA

Test tối thiểu các breakpoint: 360, 375, 393, 430, 768, 1024, 1280.
Kiểm tra overflow, button width, header, modal, form, grid.

---

## 21. Route UX

Các màn hình chính phải có URL riêng (vd: /, /login, /products, /cart, /checkout).

---

## 22. Buyer & Seller Funnel

Toàn bộ UI phải phục vụ flow cốt lõi của người mua và người bán. UI không được cho seller thực hiện action mà backend cấm.

---

## 23. Không thêm feature chỉ để UI đẹp

Trong MVP: Không chat phức tạp, không AI recommendation, không animation cầu kỳ, không social login.
Ưu tiên: Data integrity -> Auth -> API -> Forms -> States -> Responsive -> Accessibility -> Visual.

---

## 24. Rule quan trọng nhất

> **DO NOT change business logic, API contract, authentication, authorization, database behavior, or existing working flows unless explicitly requested.**
> **Do not introduce mock data, hardcoded users, fake IDs, fake status, fake statistics, or fake functionality.**

---

## 25. Definition of Done

* Desktop/Tablet/Mobile OK (No horizontal overflow)
* API thật, Không mock data
* Có đủ Loading / Success / Empty / Error state
* Typography, Spacing, Color nhất quán
* Route hoạt động
* Browser test PASS
