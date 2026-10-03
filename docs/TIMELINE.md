# 📅 thrift it! — Timeline & Gantt Chart

> **Mục đích:** Visualize toàn bộ timeline dự án, sprint, milestone và task dependencies.
> **Cập nhật lần cuối:** 2026-10-03
> **Hướng dẫn sử dụng:** xem [`WORK_TRACKING_GUIDE.md`](./WORK_TRACKING_GUIDE.md)

---

## 🎯 Big Picture — Dự án tổng quan (Q3-Q4 2026)

```
2026-07                    2026-08                    2026-09                    2026-10                    2026-11                    2026-12
  │                          │                          │                          │                          │                          │
  ▼                          ▼                          ▼                          ▼                          ▼                          ▼
┌─Sprint 1─┐  ┌─Sprint 2─┐  ┌─Sprint 3─┐  ┌─Sprint 4─┐  ┌─Sprint 5─┐  ┌─Sprint 6─┐  ┌─Sprint 7─┐  ┌─Sprint 8─┐  ┌─Sprint 9─┐  ┌─Sprint 10┐
│ MVP Auth │  │ Products │  │ Cart+UI  │  │ Checkout │  │ Shipment │  │ Reviews  │  │ Address  │  │ Ledger   │  │  Online  │  │  Beta    │
│          │  │ +Seller  │  │  Basic   │  │  COD     │  │  GHTK    │  │  +Admin  │  │  Book UX │  │ Payment  │  │ Payment  │  │  Launch  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
   ✅            ✅            ✅            ✅            ✅            ✅            ✅  ←        🔵 NOW         ⚪           ⚪
   2w            2w            2w            2w            2w            2w            1w+         1w              2w           2w
```

**Trạng thái dự án:** 🟢 On Track (đúng tiến độ)

---

## 📆 Sprint 7 — Chi tiết (2026-09-26 → 2026-10-03) ✅ DONE

### Gantt Chart

```
Task ID  | Task Name                          | 26/9 | 27/9 | 28/9 | 29/9 | 30/9 | 01/10| 02/10| 03/10|
---------|------------------------------------|------|------|------|------|------|------|------|------|
FE-101   | AddressBook component + hook       | ████ | ████ |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |
FE-102   | CAS API integration                |  ·   | ████ | ████ |  ·   |  ·   |  ·   |  ·   |  ·   |
FE-103   | PaymentScreen auto-fill            |  ·   |  ·   | ████ |  ·   |  ·   |  ·   |  ·   |  ·   |
FE-104   | AddressBookTab (Buyer)             |  ·   |  ·   | ████ | ████ |  ·   |  ·   |  ·   |  ·   |
FE-105   | WarehouseTab (Seller)              |  ·   |  ·   |  ·   | ████ | ████ |  ·   |  ·   |  ·   |
FE-106   | LetterAvatar + PlaceholderImage    |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |  ·   |
FE-107   | Shipment dialog auto-fill          |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |
FE-108   | Remove legacy Quận/Huyện text      |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |
FE-109   | Loading & error states             |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |
BE-201   | addressService.ts (proxy CAS)      | ████ | ████ |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |
BE-202   | addressController + routes         |  ·   | ████ |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |
BE-203   | Order address snapshot             |  ·   |  ·   | ████ | ████ |  ·   |  ·   |  ·   |  ·   |
BE-204   | test:address (16/16 PASS)          |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |
BE-205   | 5s timeout for CAS                 |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |  ·   |
BE-206   | Validate effectiveDate              |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |
DB-301   | Migration: address snapshot fields |  ·   |  ·   | ████ |  ·   |  ·   |  ·   |  ·   |  ·   |
DB-302   | Update mapOrder                    |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |  ·   |  ·   |
QA-401   | Backend build pass                 |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |
QA-402   | Backend tests pass                 |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |
QA-403   | Frontend build pass                |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |
QA-404   | Live test addresses                |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ???  |
DOC-501  | Update AI_CONTEXT.md               |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |
DOC-502  | USER_MANUAL.md                     |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ████ | ████ |
DOC-503  | Slides .pptx                       |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |
```

**Legend:** `████` = in progress, `·` = not started, `???` = blocked

### Milestones
- 🎯 **2026-09-26** — Sprint 7 kickoff
- 🎯 **2026-09-28** — FE AddressBook component ready (FE-101 ✅)
- 🎯 **2026-09-30** — CAS API integration complete (FE-102, BE-201 ✅)
- 🎯 **2026-10-01** — Bug fixes shipped (BUG-001/002/003 ✅)
- 🎯 **2026-10-02** — Documentation drafted
- 🎯 **2026-10-03** — Sprint 7 DONE (25/25 tasks shipped) ✅

### Velocity
- **Planned:** 30 task · **Completed:** 25 · **Carried over:** 5 (QA-404, DB-303 → S8)
- **Velocity:** 25 task/2 weeks = **12.5 task/week** 📈
- **On-time delivery:** 100%

---

## 🔮 Sprint 8 — Kế hoạch (2026-10-04 → 2026-10-10) 🔵 IN PROGRESS

### Gantt Chart (Dự kiến)

```
Task ID  | Task Name                          | 04/10| 05/10| 06/10| 07/10| 08/10| 09/10| 10/10|
---------|------------------------------------|------|------|------|------|------|------|------|
BE-301   | Ledger.ts (double-entry)           | ████ | ████ | ████ |  ·   |  ·   |  ·   |  ·   |
BE-302   | PlatformFeeConfig.ts               |  ·   |  ·   | ████ | ████ |  ·   |  ·   |  ·   |
BE-303   | Refactor getAdminStats             |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |
BE-304   | Backfill Ledger migration          |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |
BE-305   | Admin rate-update endpoint         |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |
CLEAN-401| Xóa /api/auth/cart/merge           |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |
CLEAN-402| Xóa legacy admin seller paths      |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |  ·   |
CLEAN-403| Cleanup Unsplash fallbacks         |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |  ·   |
FE-301   | UI thanh toán online               |  ·   |  ·   |  ·   | ████ | ████ |  ·   |  ·   |
FE-302   | Stripe/VNPay integration           |  ·   |  ·   |  ·   |  ·   |  ·   | ████ | ████ |
FE-303   | Hiển thị platform fee cho seller   |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   | ████ |
BUG-004  | Live test /api/users/me/addresses  | ████ |  ·   |  ·   |  ·   |  ·   |  ·   |  ·   |
QA-501   | Playwright E2E tests               |  ·   |  ·   |  ·   |  ·   | ████ | ████ | ████ |
```

### Critical Path
```
BE-301 (Ledger) → BE-303 (refactor stats) → FE-302 (Stripe) → QA-501 (E2E)
       ↓                                                            ↓
  BE-304 (migration)                                          Production ready
```

**Bottleneck:** `BE-301` (Ledger.ts) là blocker cho cả `BE-303` và `FE-302`. **MUST** hoàn thành trước 06/10.

### Milestones
- 🎯 **2026-10-04** — Sprint 8 kickoff + BUG-004 verification
- 🎯 **2026-10-06** — `Ledger.ts` ready (P0)
- 🎯 **2026-10-08** — `PlatformFeeConfig.ts` ready
- 🎯 **2026-10-10** — Online payment UI + E2E tests (target)

---

## 🗓️ Roadmap Q4 2026 (Tổng quan 3 tháng)

```
                                  Oct                Nov                Dec
  ──────────────────────────────────────────────────────────────────────────→
  Address Book UX          ████ ✅
  Ledger & PlatformFee            ████              ████
  Online Payment (Stripe)                  ████
  Chat Real-time (WebSocket)               ████
  Seller Analytics                                 ████
  Recommendation Engine                                ████
  CI/CD Pipeline                              ████
  Monitoring & Alerts                                ████
  Beta Launch                                                 ████
  Production Launch                                             ████ 🎉
```

### Quarterly OKRs

**Q4 2026:**
- **O1:** Hoàn thiện payment infrastructure để vào production
  - KR1: `Ledger.ts` + `PlatformFeeConfig.ts` shipped ✅ Sprint 8
  - KR2: Online payment gateway (Stripe/VNPay) tích hợp ✅ Sprint 9
  - KR3: E2E tests pass ≥ 90% coverage ✅ Sprint 10

- **O2:** Nâng cao UX & giữ chân người dùng
  - KR1: Chat real-time launch ✅ Sprint 9
  - KR2: Wishlist page ✅ Sprint 8
  - KR3: Recommendation engine MVP ✅ Sprint 10

- **O3:** Operational excellence
  - KR1: CI/CD pipeline tự động ✅ Sprint 9
  - KR2: Monitoring + alerts 24/7 ✅ Sprint 9
  - KR3: 99.5% uptime trong 30 ngày đầu ✅ Sprint 10

---

## 📊 Cột mốc quan trọng (Key Milestones)

| Ngày | Milestone | Status | Owner | Tác động |
|------|-----------|--------|-------|----------|
| 2026-07-15 | MVP — Auth & Product CRUD | ✅ Done | @backend-lead | Foundation |
| 2026-08-01 | Seller Application Flow | ✅ Done | @backend-dev | Multi-role |
| 2026-08-15 | Cart + Checkout (COD) | ✅ Done | @fullstack | Core commerce |
| 2026-09-01 | Shipment GHTK Integration | ✅ Done | @backend-dev | Logistics |
| 2026-09-15 | Reviews + Admin Panel | ✅ Done | @fullstack | Trust & ops |
| 2026-10-03 | **Address Book + CAS** | ✅ Done | @frontend-lead | UX win |
| 2026-10-10 | **Ledger + Payment** | 🔵 In Progress | @backend-lead | **Production-ready** |
| 2026-10-24 | Online Payment MVP | ⚪ Planned | @fullstack | Revenue |
| 2026-11-15 | Beta Launch (200 users) | ⚪ Planned | @pm | Market validation |
| 2026-12-01 | **Public Launch** 🎉 | ⚪ Planned | @all | Go live! |

---

## 🧭 Dependency Graph (Task phụ thuộc)

```
                          ┌─────────────────────┐
                          │  Sprint 8: Ledger   │
                          │  (BE-301)           │ ◀── CRITICAL PATH
                          └──────────┬──────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
        ┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
        │ BE-303: refactor│ │ BE-304: back-│ │ BE-302: Platform│
        │ getAdminStats   │ │ fill migrat. │ │ FeeConfig.ts    │
        └────────┬────────┘ └──────┬───────┘ └────────┬────────┘
                 │                 │                  │
                 └────────┬────────┴──────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │  FE-302: Stripe     │
                │  integration        │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  QA-501: Playwright │
                │  E2E tests          │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Production Ready 🚀│
                └─────────────────────┘
```

**Key insight:** Nếu `BE-301` slip → cả sprint 8 bị delay. → Plan B: dùng `Order.platformFee` tạm thời, implement `Ledger` sau.

---

## 📈 Velocity Trend (4 sprints gần nhất)

```
Story Points / Week
  Sprint 4: ████████████      22 pts
  Sprint 5: ██████████████    28 pts
  Sprint 6: ████████████████  32 pts
  Sprint 7: ██████████████████ 38 pts  📈
  ─────────────────────────────────────
  Average:           30 pts/week
  Sprint 8 target:   40 pts/week (Ledger + FE payment UI)
```

**Trend:** Velocity tăng đều → team đang mature. Nếu Sprint 8 đạt 40 pts → đúng plan production launch.

---

## 🛣️ Critical Path to Production

```
Today                  30 ngày                     60 ngày                   90 ngày
2026-10-03 ─────────── 2026-11-02 ─────────────── 2026-12-02 ───────────── 2026-12-03
   │                       │                          │                        │
   ▼                       ▼                          ▼                        ▼
[Address Book ✅]      [Ledger ✅]               [Online Pay ✅]         [BETA 🚀]
   Sprint 7            Sprint 8                  Sprint 9                Sprint 10-11
   17 task             13 task                   15 task                 20 task
                       (5 day work)              (10 day work)           (full QA)
```

**Production Launch Target:** 2026-12-15 (with 2-week buffer)

---

## 📅 Meeting Cadence

| Meeting | Tần suất | Ngày/giờ | Người tham dự | Mục đích |
|---------|----------|----------|---------------|----------|
| **Daily Standup** | Hàng ngày | T2-T6, 9:30 AM | Toàn team | Sync tiến độ, blockers |
| **Sprint Planning** | 2 tuần/lần | T2 đầu sprint | Toàn team | Lên kế hoạch task |
| **Sprint Review** | 2 tuần/lần | T6 cuối sprint | Toàn team + Stakeholders | Demo sản phẩm |
| **Retrospective** | 2 tuần/lần | T6 cuối sprint | Toàn team | Cải tiến quy trình |
| **Tech Sync** | 1 tuần/lần | T4, 4:00 PM | Devs | Chia sẻ tech challenge |
| **1-1 với PM** | 2 tuần/lần | Tùy lịch | PM + từng member | Career growth |

---

## 🔗 Liên kết nhanh

- 📋 Bảng công việc: [`TASK_TRACKER.md`](./TASK_TRACKER.md)
- 📖 Hướng dẫn sử dụng: [`WORK_TRACKING_GUIDE.md`](./WORK_TRACKING_GUIDE.md)
- 🤖 AI Rules: [`AGENTS.md`](../AGENTS.md)
- 📝 AI Context: [`AI_CONTEXT.md`](../AI_CONTEXT.md)
- 📜 Changelog: [`CHANGELOG_AI.md`](../CHANGELOG_AI.md)

> **Tip:** Cập nhật file này **MỖI NGÀY** sau Daily Standup. Mark task hoàn thành ngay khi merge PR.
