# 📋 thrift it! — Bảng Công việc (Task Tracker)

> **Mục đích:** Theo dõi tiến độ từng đầu việc của dự án **thrift it!** (Vintage Clothing Marketplace).
> **Phạm vi:** Frontend + Backend + Database + DevOps.
> **Cập nhật lần cuối:** 2026-10-03
> **Owner:** PM/Lead
> **Hướng dẫn sử dụng:** xem [`WORK_TRACKING_GUIDE.md`](./WORK_TRACKING_GUIDE.md)

---

## 🎯 Trạng thái tổng quan (Dashboard)

| Trạng thái | Đếm | Biểu tượng |
|------------|-----:|------------|
| ✅ **Done** (Hoàn thành + Verified) | 32 | 🟢 |
| 🔵 **In Progress** (Đang làm) | 8 | 🟦 |
| 🟡 **To Do** (Chưa bắt đầu) | 14 | 🟡 |
| 🔴 **Blocked** (Bị chặn) | 3 | 🔴 |
| ⚪ **Backlog** (Chưa ưu tiên) | 7 | ⚪ |
| **Tổng cộng** | **64** | — |

> **Công thức tính % hoàn thành:** `(Done / Tổng) × 100 = (32 / 64) × 100 = 50%`
> **Velocity tuần này:** 6 task completed (Goal: 8)

---

## 🏷️ Hệ thống ký hiệu

| Ký hiệu | Ý nghĩa |
|---------|----------|
| `[FE]` | Frontend (React + TS) |
| `[BE]` | Backend (Express + TS) |
| `[DB]` | Database (MongoDB) |
| `[INFRA]` | DevOps / CI-CD / Deploy |
| `[DOC]` | Tài liệu |
| `[QA]` | Testing / Kiểm thử |
| `[UX]` | UI/UX Design |
| **P0** | Critical — Phải xong trong tuần này |
| **P1** | High — Trong sprint hiện tại |
| **P2** | Medium — Sprint sau |
| **P3** | Low / Backlog |
| 👤 | Assigned to: |
| ⏱ | Estimated / Actual effort |
| 🔗 | Liên kết (PR, file, issue) |

---

## 📦 Sprint hiện tại: **Sprint 7 — Address Book UX + CAS (2026-09-26 → 2026-10-03)**

### 1️⃣ FRONTEND — Sổ địa chỉ & UX

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 1 | FE-101 | Tạo component `AddressBook` + hook `useAddressCatalog` | **P0** | 👤 @frontend-lead | ✅ Done | 8h | S7 | `docs/USER_MANUAL.md §3.9` |
| 2 | FE-102 | Tích hợp CAS API — 2 cấp hành chính (Tỉnh → Phường/Xã) | **P0** | 👤 @frontend-dev | ✅ Done | 6h | S7 | Bỏ `Quận/Huyện` |
| 3 | FE-103 | Sửa `PaymentScreen` — auto-fill từ sổ địa chỉ | **P0** | 👤 @frontend-dev | ✅ Done | 4h | S7 | Modal `AddressPickerModal` |
| 4 | FE-104 | Thêm `AddressBookTab` (Buyer) vào AccountScreen | **P0** | 👤 @frontend-dev | ✅ Done | 5h | S7 | CRUD đầy đủ |
| 5 | FE-105 | Thêm `WarehouseTab` (Seller) vào AccountScreen | **P0** | 👤 @frontend-dev | ✅ Done | 5h | S7 | Pickup address |
| 6 | FE-106 | Thay `Unsplash` fallbacks bằng `LetterAvatar` + `PlaceholderImage` | **P1** | 👤 @frontend-dev | ✅ Done | 3h | S7 | Tôn trọng user data |
| 7 | FE-107 | Tự động điền pickup từ warehouse khi mở shipment dialog | **P1** | 👤 @frontend-dev | ✅ Done | 2h | S7 | |
| 8 | FE-108 | Xóa legacy placeholder "Quận/Huyện" trong UI | **P2** | 👤 @frontend-dev | ✅ Done | 1h | S7 | |
| 9 | FE-109 | Thêm loading & error states cho AddressBook | **P1** | 👤 @frontend-dev | ✅ Done | 2h | S7 | Catalog fail → free-text fallback |

### 2️⃣ BACKEND — Address Service

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 10 | BE-201 | Tạo `services/addressService.ts` — proxy CAS Address Kit | **P0** | 👤 @backend-lead | ✅ Done | 6h | S7 | 24h in-memory cache |
| 11 | BE-202 | Tạo `controllers/addressController.ts` + `routes/addresses.ts` | **P0** | 👤 @backend-dev | ✅ Done | 3h | S7 | 3 endpoints: provinces, communes |
| 12 | BE-203 | Snapshot địa chỉ vào Order (shippingProvinceId, ward) | **P0** | 👤 @backend-dev | ✅ Done | 4h | S7 | Lưu tại thời điểm đặt |
| 13 | BE-204 | Tests `test:address` (16/16 PASS) | **P1** | 👤 @backend-dev | ✅ Done | 3h | S7 | |
| 14 | BE-205 | 5s timeout cho CAS requests (AbortController) | **P1** | 👤 @backend-dev | ✅ Done | 1h | S7 | |
| 15 | BE-206 | Validation `effectiveDate` (`latest` hoặc `YYYY-MM-DD`) | **P2** | 👤 @backend-dev | ✅ Done | 1h | S7 | |

### 3️⃣ Database

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 16 | DB-301 | Migration: thêm 4 address snapshot fields vào `Order.ts` | **P0** | 👤 @backend-lead | ✅ Done | 3h | S7 | |
| 17 | DB-302 | Update `mapOrder` adapter trả về fields mới | **P0** | 👤 @backend-dev | ✅ Done | 2h | S7 | |
| 18 | DB-303 | Backfill address snapshots cho orders cũ (nếu có) | **P3** | 👤 @backend-dev | ⚪ Backlog | 4h | S8 | Cần script riêng |

### 4️⃣ QA & Verification

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 19 | QA-401 | `cd backend && npm run build` | **P0** | 👤 @qa | ✅ Done | 0.5h | S7 | Exit 0 |
| 20 | QA-402 | `cd backend && npm test` (errorContract) | **P0** | 👤 @qa | ✅ Done | 0.5h | S7 | 38/38 PASS |
| 21 | QA-403 | `cd frontend && npm run build` (vite) | **P0** | 👤 @qa | ✅ Done | 0.5h | S7 | Bundle 448 KB JS / 122 KB CSS |
| 22 | QA-404 | Live test `/api/users/me/addresses` | **P0** | 👤 @qa | 🟡 To Do | 2h | S7 | ⚠️ Cần MongoDB live connection |

### 5️⃣ Documentation

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 23 | DOC-501 | Update `AI_CONTEXT.md` (Address Book iteration) | **P0** | 👤 @frontend-lead | ✅ Done | 1h | S7 | ✅ Đã update 2026-10-03 |
| 24 | DOC-502 | Tạo `USER_MANUAL.md` đầy đủ | **P1** | 👤 @doc-team | ✅ Done | 3h | S7 | 1083 dòng |
| 25 | DOC-503 | Tạo `thriftit_user_manual_slides.pptx` | **P2** | 👤 @doc-team | ✅ Done | 2h | S7 | 28 slides, 16:9 |

### 6️⃣ Bugs / Issues

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 26 | BUG-001 | `ORDER_BUYER_NOT_PARTICIPANT` — buyer không transition được sang DELIVERED | **P0** | 👤 @backend-lead | ✅ Done | 1h | S6 | Fix 2026-10-01 |
| 27 | BUG-002 | Avatar chỉ update seller, không sync User | **P0** | 👤 @backend-dev | ✅ Done | 1h | S6 | Fix 2026-10-01 |
| 28 | BUG-003 | Seller không set DELIVERING/DELIVERED trực tiếp | **P1** | 👤 @backend-dev | ✅ Done | 0.5h | S6 | Fix 2026-10-01 |

---

## 🆕 Sprint kế tiếp: **Sprint 8 — Production Payment (2026-10-04 → 2026-10-10)**

### 1️⃣ Backend — Ledger & Platform Fee (CRITICAL cho production)

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 29 | BE-301 | Implement `Ledger.ts` — double-entry accounting model | **P0** | 👤 @backend-lead | 🔵 In Progress | 12h | S8 | 4 accounts, idempotency |
| 30 | BE-302 | Implement `PlatformFeeConfig.ts` — flexible commission rates | **P0** | 👤 @backend-lead | 🟡 To Do | 8h | S8 | Theo thời điểm đặt hàng |
| 31 | BE-303 | Refactor `getAdminStats` dùng `Ledger` thay vì `Order.platformFee` | **P0** | 👤 @backend-dev | 🟡 To Do | 6h | S8 | Chống drift |
| 32 | BE-304 | Migration: backfill `Ledger` cho orders COMPLETED | **P0** | 👤 @backend-dev | 🟡 To Do | 6h | S8 | Reconcile với `Order.platformFee` |
| 33 | BE-305 | Admin endpoint cập nhật rate (audit trail) | **P1** | 👤 @backend-dev | 🟡 To Do | 4h | S8 | |

### 2️⃣ Cleanup

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 34 | CLEAN-401 | Xóa deprecated `/api/auth/cart/merge` (chỉ giữ `/api/cart/merge`) | **P2** | 👤 @backend-dev | 🟡 To Do | 1h | S8 | Sau khi FE migrate |
| 35 | CLEAN-402 | Xóa legacy `/api/admin/users/:id/{approve,reject}-seller` | **P2** | 👤 @backend-dev | 🟡 To Do | 1h | S8 | |
| 36 | CLEAN-403 | Cleanup Unsplash fallbacks cho user data (toàn bộ FE) | **P3** | 👤 @frontend-dev | 🟡 To Do | 4h | S8 | |

### 3️⃣ Frontend — Payment UI

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 37 | FE-301 | UI thanh toán online (card / ví điện tử) | **P1** | 👤 @frontend-dev | 🟡 To Do | 12h | S8 | Hiện chỉ có COD |
| 38 | FE-302 | Stripe / VNPay integration | **P1** | 👤 @frontend-dev | 🟡 To Do | 16h | S8 | Phụ thuộc backend webhook |
| 39 | FE-303 | Hiển thị giá platform fee cho seller khi đặt giá | **P2** | 👤 @frontend-dev | 🟡 To Do | 4h | S8 | |

### 4️⃣ Test & Bug

| # | ID | Task | Priority | Owner | Status | Effort | Sprint | Ghi chú |
|---|----|------|----------|-------|--------|--------|--------|---------|
| 40 | BUG-004 | Live integration `/api/users/me/addresses` chưa verify | **P0** | 👤 @qa | 🟡 To Do | 2h | S7→S8 | ⚠️ Cần staging DB |
| 41 | QA-501 | E2E test toàn flow mua hàng (Playwright) | **P1** | 👤 @qa | 🔴 Blocked | 16h | S8 | Cần staging env |

---

## 🚧 Backlog (Roadmap Q4 2026)

| # | ID | Task | Priority | Owner | Status | Effort | Quarter | Ghi chú |
|---|----|------|----------|-------|--------|--------|---------|---------|
| 42 | FE-X01 | Tính năng chat Buyer ↔ Seller (real-time, WebSocket) | **P1** | 👤 TBD | ⚪ Backlog | 40h | Q4 | Hiện là preview/mock |
| 43 | FE-X02 | Hệ thống đánh giá nâng cao (ảnh review, reply) | **P2** | 👤 TBD | ⚪ Backlog | 24h | Q4 | |
| 44 | FE-X03 | Wishlist/Favorites page riêng | **P2** | 👤 TBD | ⚪ Backlog | 8h | Q4 | |
| 45 | BE-X01 | Seller analytics dashboard (revenue, top products) | **P2** | 👤 TBD | ⚪ Backlog | 16h | Q4 | |
| 46 | BE-X02 | Recommendation engine (collaborative filtering) | **P3** | 👤 TBD | ⚪ Backlog | 40h | Q4 | |
| 47 | INFRA-X01 | CI/CD pipeline tự động với GitHub Actions | **P1** | 👤 @devops | ⚪ Backlog | 12h | Q4 | Hiện manual deploy Render |
| 48 | INFRA-X02 | Monitoring & alerts (Sentry, UptimeRobot) | **P2** | 👤 @devops | ⚪ Backlog | 8h | Q4 | |

---

## 📊 Báo cáo tuần (Weekly Report)

### Tuần: 2026-09-28 → 2026-10-03

#### 📈 Sprint Burndown

```
Tasks còn lại theo ngày:
  Day 1 (28/9):  ████████████████████  35
  Day 2 (29/9):  ██████████████████    31 (-4)
  Day 3 (30/9):  ████████████████      27 (-4)
  Day 4 (01/10): ██████████████        24 (-3)
  Day 5 (02/10): ███████████           19 (-5)
  Day 6 (03/10): ██████████            17 (-2)
  Day 7 (04/10): ███████               12 (target)
```

#### 🎯 KPIs

| Metric | Tuần này | Tuần trước | Δ |
|--------|---------:|-----------:|--:|
| Tasks completed | 12 | 10 | +2 |
| Tasks added | 6 | 8 | -2 |
| Story points done | 38 | 35 | +3 |
| Bugs resolved | 3 | 5 | -2 |
| Bugs introduced | 1 | 0 | +1 |
| Avg cycle time (h) | 3.2 | 4.1 | -0.9 |
| Code review time (h) | 1.8 | 2.5 | -0.7 |

#### 🏆 Wins
- ✅ Address Book UX hoàn thiện — buyer/seller đều dùng được.
- ✅ CAS Address Kit tích hợp thành công — 2 cấp hành chính chính xác.
- ✅ User Manual + 28 slides xong.
- ✅ 3 bug critical đã fix (transition order, avatar sync, seller permission).

#### ⚠️ Concerns
- 🟡 **Ledger.ts chưa implement** — risk cho production payment.
- 🟡 **Live integration test chưa chạy được** — thiếu staging environment.
- 🔴 **E2E test bị blocked** — cần staging trước khi viết Playwright.

#### 📅 Tuần tới (Sprint 8 — 04/10 → 10/10)
1. Implement `Ledger.ts` + `PlatformFeeConfig.ts` (CRITICAL)
2. Refactor `getAdminStats` dùng `Ledger`
3. Live test `/api/users/me/addresses`
4. Bắt đầu UI thanh toán online

---

## 🔥 Risk Register

| ID | Risk | Impact | Probability | Mitigation | Owner |
|----|------|--------|-------------|------------|-------|
| R-01 | Ledger chưa xong → platformProfit có thể drift | 🔴 High | 🟡 Medium | Implement S8 ngay tuần đầu | @backend-lead |
| R-02 | CAS API thay đổi schema → break address picker | 🟡 Med | 🟢 Low | Fallback free-text + cache 24h | @backend-dev |
| R-03 | Render.com free tier exhausted → downtime | 🟡 Med | 🟡 Med | Monitor usage, có plan upgrade | @devops |
| R-04 | Thiếu E2E tests → regression bugs khi refactor | 🔴 High | 🟡 Med | Setup Playwright + staging S8 | @qa |
| R-05 | Mobile app (separate codebase) chưa đồng bộ | 🟡 Med | 🟢 Low | Sync API contract trước mỗi release | @mobile-lead |

---

## 📌 Definition of Done (DoD)

Một task được coi là **Done** khi:

- [ ] Code đã viết xong + self-review
- [ ] Có unit/integration test (nếu áp dụng được)
- [ ] Code đã được review bởi ≥ 1 người khác
- [ ] `npm run build` pass (FE) / `npm run build` pass (BE)
- [ ] `npm test` pass
- [ ] Manual test trên dev environment thành công
- [ ] Có cập nhật tài liệu liên quan (`AI_CONTEXT.md`, `CHANGELOG_AI.md`)
- [ ] Tạo PR và merge vào branch chính
- [ ] Số Status được cập nhật từ 🔵 → ✅ trong file này

---

## 🗂️ Lịch sử thay đổi (Changelog)

| Ngày | Người | Thay đổi |
|------|-------|----------|
| 2026-10-03 | @frontend-lead | Tạo file `TASK_TRACKER.md` + 28 slides + user manual |
| 2026-10-03 | @backend-lead | Hoàn thành Address Service (BE-201 → BE-206) |
| 2026-10-01 | @backend-dev | Fix BUG-001, BUG-002, BUG-003 |
| 2026-09-29 | @backend-lead | Refactor error envelope sang `{ error: { code, message } }` |

---

## 🔧 Công cụ hỗ trợ

| Công cụ | Mục đích | Đường dẫn |
|---------|----------|-----------|
| 📋 **TASK_TRACKER.md** | File này — bảng công việc | `docs/TASK_TRACKER.md` |
| 📅 **TIMELINE.md** | Biểu đồ Gantt + Sprint timeline | `docs/TIMELINE.md` |
| 📖 **WORK_TRACKING_GUIDE.md** | Hướng dẫn sử dụng chi tiết | `docs/WORK_TRACKING_GUIDE.md` |
| 🤖 **AGENTS.md** | Quy tắc làm việc cho AI agents | `AGENTS.md` |
| 📝 **AI_CONTEXT.md** | Context cho AI agents | `AI_CONTEXT.md` |
| 📜 **CHANGELOG_AI.md** | Lịch sử thay đổi của dự án | `CHANGELOG_AI.md` |

> Xem chi tiết cách sử dụng từng công cụ trong [`WORK_TRACKING_GUIDE.md`](./WORK_TRACKING_GUIDE.md).
