# 📖 Hướng dẫn sử dụng Bộ công cụ Quản lý Công việc

> **Dành cho:** Toàn bộ team **thrift it!**
> **Bộ công cụ bao gồm:**
> 1. [`TASK_TRACKER.md`](./TASK_TRACKER.md) — Bảng công việc
> 2. [`TIMELINE.md`](./TIMELINE.md) — Biểu đồ Gantt + Timeline
> 3. `generate_tracker.py` — Script Python tự động generate Excel dashboard
> 4. **`tracker.html`** — Bảng tương tác trên web (auto-generated)
> 5. `tracker.xlsx` — Bảng tính Excel với Gantt chart (auto-generated)
>
> **Mục tiêu:** 100% task được track, 0% task bị "rơi" ngoài scope.

---

## 🚀 Bắt đầu nhanh (5 phút)

### Bước 1: Cài đặt (chỉ làm 1 lần)
```powershell
cd f:\FPTU\FALL 2026\EXE201\pj_UI\docs
pip install openpyxl
```

### Bước 2: Generate dashboard
```powershell
python generate_tracker.py
```

### Bước 3: Mở kết quả
Sau khi chạy, mở 1 trong 3 file:
- 📊 **`tracker.xlsx`** — Excel (dùng cho management, in ấn)
- 🌐 **`tracker.html`** — Bảng tương tác trên trình duyệt
- 📋 **`TASK_TRACKER.md`** — Markdown (dùng cho Git, code review)

---

## 📚 Hướng dẫn chi tiết

### 1️⃣ Cấu trúc Task ID

Mỗi task có ID theo format: `<MODULE>-<NUMBER>`

| Module | Tiền tố | Mô tả |
|--------|---------|-------|
| Frontend | `FE-` | React, TypeScript, UI/UX |
| Backend | `BE-` | Express, API, services |
| Database | `DB-` | MongoDB, schema, migration |
| Infrastructure | `INFRA-` | CI/CD, deploy, monitoring |
| Documentation | `DOC-` | Tài liệu |
| QA / Test | `QA-` | Testing, verification |
| Bug | `BUG-` | Sửa lỗi |
| Cleanup | `CLEAN-` | Refactor, xóa legacy code |
| Cross-module | `X-` (e.g., `FE-X01`) | Backlog / exploration |

**Ví dụ:** `FE-301` = Frontend task số 301.

### 2️⃣ Đánh dấu trạng thái

| Ký hiệu | Status | Khi nào dùng |
|---------|--------|--------------|
| ✅ | Done | Đã merge PR, pass tests, verified |
| 🔵 | In Progress | Đang code, đang review |
| 🟡 | To Do | Sẵn sàng làm, chưa bắt đầu |
| 🔴 | Blocked | Bị chặn bởi task khác hoặc external issue |
| ⚪ | Backlog | Chưa ưu tiên, có thể làm sprint sau |
| ❌ | Cancelled | Hủy bỏ (lý do phải document) |

### 3️⃣ Đánh dấu Priority

| Ký hiệu | Mức | Ý nghĩa | SLA |
|---------|-----|----------|-----|
| **P0** | Critical | Phải xong trong tuần này, blocker cho người khác | 1-3 ngày |
| **P1** | High | Trong sprint hiện tại | 1-2 tuần |
| **P2** | Medium | Sprint sau (ưu tiên) | 2-4 tuần |
| **P3** | Low / Backlog | Khi rảnh | > 1 tháng |

### 4️⃣ Cập nhật TASK_TRACKER.md

#### Khi bắt đầu task mới
1. Thêm row mới vào sprint hiện tại
2. Đặt Status = 🔵 In Progress
3. Thêm Owner (assignee)
4. Liên kết PR/issue (nếu có)

```markdown
| 42 | FE-301 | UI thanh toán online (card / ví điện tử) | **P1** | 👤 @frontend-dev | 🔵 In Progress | 12h | S8 | PR #123 |
```

#### Khi task xong
1. Đổi `🔵 In Progress` → `✅ Done`
2. Thêm link PR vào cột "Ghi chú"
3. Cập nhật Burndown chart
4. Commit lên Git

#### Khi bị blocked
1. Đổi Status → `🔴 Blocked`
2. Thêm **lý do** vào cột "Ghi chú"
3. Mention người có thể unblock trong Daily Standup
4. Nếu chờ > 2 ngày → escalate lên PM

### 5️⃣ Daily Standup Workflow (15 phút)

**Mỗi sáng 9:30 AM:**

Mỗi thành viên trả lời 3 câu hỏi:
1. **Hôm qua làm gì?** (Done / In Progress)
2. **Hôm nay làm gì?** (Current)
3. **Có blocker gì không?**

PM ghi vào Sprint board + cập nhật `TASK_TRACKER.md` cuối ngày.

### 6️⃣ Sprint Review Workflow (cuối sprint, 1 giờ)

1. PM review tất cả task trong sprint
2. Move task chưa xong → Sprint kế tiếp
3. Update Velocity & KPIs
4. Demo sản phẩm cho stakeholders
5. Cập nhật file `TIMELINE.md`

### 7️⃣ Generate Excel Dashboard (cho management)

```powershell
cd docs
python generate_tracker.py
```

Output:
- **`tracker.xlsx`** — 5 sheets:
  1. **📊 Dashboard** — KPIs, status overview, charts
  2. **📋 All Tasks** — Toàn bộ task (filter được)
  3. **📅 Gantt Chart** — Biểu đồ Gantt (dùng Conditional Formatting)
  4. **🔥 Risks** — Risk register
  5. **👥 Team Workload** — Effort per assignee

### 8️⃣ Generate HTML Interactive Board (cho team)

Mở `tracker.html` trong browser:
- ✅ Click để tick "Done"
- 🔄 Filter theo Status, Owner, Priority
- 📊 Progress bar tự động update
- 💾 Lưu localStorage (không cần server)

> File này **tự động regenerate** khi chạy script. Tuy nhiên, mọi thay đổi manual trong file Markdown sẽ bị **ghi đè**.

---

## 🛠️ Công cụ: `generate_tracker.py`

### Cài đặt
```powershell
pip install openpyxl
```

### Sử dụng cơ bản
```powershell
cd docs
python generate_tracker.py
```

### Tùy chọn
```powershell
# Chỉ generate Excel (skip HTML)
python generate_tracker.py --format xlsx

# Chỉ generate HTML (skip Excel)
python generate_tracker.py --format html

# Custom output
python generate_tracker.py --output my_tracker.xlsx
```

### Output

| File | Mô tả | Dùng cho |
|------|-------|----------|
| `tracker.xlsx` | Excel dashboard (5 sheets, charts) | Management, in ấn |
| `tracker.html` | Interactive web board | Team daily use |
| `console_output.txt` | Summary in terminal | CI/CD logs |

### Customization

Mở file `generate_tracker.py`, tìm phần `TASKS = [...]` ở đầu file. Đây là danh sách Python chứa toàn bộ task. Bạn có thể:
- Thêm task mới
- Sửa status
- Đổi owner
- Cập nhật priority

Sau đó chạy lại script để regenerate.

**Ví dụ thêm task:**
```python
TASKS = [
    {
        "id": "FE-999",
        "title": "Thêm dark mode",
        "module": "FE",
        "priority": "P2",
        "owner": "@frontend-dev",
        "status": "🟡 To Do",
        "effort_h": 8,
        "sprint": "S9",
        "notes": "Beta feedback yêu cầu"
    },
    # ... các task khác
]
```

---

## 📊 Ví dụ Output Excel

### Sheet 1: Dashboard
- **Cell B2:** Tổng task (e.g., 64)
- **Cell B3:** Done (32)
- **Cell B4:** In Progress (8)
- **Cell B5:** % Completion (50%)
- **Pie chart:** Phân bố status
- **Bar chart:** Effort per module

### Sheet 2: All Tasks
| ID | Title | Module | Priority | Owner | Status | Effort (h) | Sprint | Notes |
|----|-------|--------|----------|-------|--------|-----------:|--------|-------|
| FE-101 | AddressBook component | FE | P0 | @frontend-lead | ✅ Done | 8 | S7 | ... |
| BE-301 | Ledger.ts | BE | P0 | @backend-lead | 🔵 In Progress | 12 | S8 | ... |

### Sheet 3: Gantt Chart
Mỗi task là 1 row, mỗi ngày là 1 column. Cell được tô màu xanh = ngày làm việc. Tự động tính:
- Start date
- End date
- Duration
- % Complete

### Sheet 4: Risks
| ID | Risk | Impact | Probability | Mitigation | Owner |
|----|------|--------|-------------|------------|-------|
| R-01 | Ledger chưa xong | 🔴 High | 🟡 Medium | Sprint 8 priority | @backend-lead |

### Sheet 5: Team Workload
```
  @frontend-lead  ████████████████  40h
  @frontend-dev   ██████████████    36h
  @backend-lead   ████████████████  44h
  @backend-dev    ████████████      28h
  @qa             ██████            16h
  @doc-team       ████              10h
  ──────────────────────────────────
  Total:                              174h / week
```

---

## 🔄 Quy trình chuẩn (Standard Workflow)

```
   ┌─────────────────────────────────────┐
   │ 1. Sprint Planning (đầu sprint)     │
   │    - PM tạo task mới trong          │
   │      TASK_TRACKER.md                │
   │    - Team estimate effort           │
   │    - Gán owner                      │
   └────────────┬────────────────────────┘
                ▼
   ┌─────────────────────────────────────┐
   │ 2. Daily Standup (mỗi sáng)         │
   │    - Cập nhật Status                │
   │    - Note blockers                  │
   │    - PM update file cuối ngày       │
   └────────────┬────────────────────────┘
                ▼
   ┌─────────────────────────────────────┐
   │ 3. Code & Test                      │
   │    - Developer tạo PR               │
   │    - QA review                      │
   │    - Merge                          │
   │    - Update Status → ✅ Done        │
   └────────────┬────────────────────────┘
                ▼
   ┌─────────────────────────────────────┐
   │ 4. Sprint Review (cuối sprint)      │
   │    - Demo cho stakeholders          │
   │    - Update Velocity & KPIs         │
   │    - Carry over task chưa xong      │
   └────────────┬────────────────────────┘
                ▼
   ┌─────────────────────────────────────┐
   │ 5. Retrospective                    │
   │    - Cải tiến quy trình             │
   │    - Ghi nhận lesson learned        │
   └─────────────────────────────────────┘
```

---

## ✅ Checklist hàng tuần (Weekly Checklist)

PM chạy mỗi T6 chiều:

- [ ] Tất cả task trong sprint đã có Status chính xác
- [ ] Task Done có link PR
- [ ] Task Blocked có lý do rõ ràng + người unblock
- [ ] Burndown chart đã cập nhật
- [ ] Velocity được ghi nhận
- [ ] Risks mới được add vào Risk Register
- [ ] Sprint kế tiếp đã có draft task list
- [ ] `python generate_tracker.py` đã chạy (Excel up-to-date)
- [ ] Email summary gửi stakeholders

---

## ❓ FAQ

### Q1: Tôi nên dùng Markdown hay Excel?

**A:** Dùng **cả hai**:
- **Markdown** (`TASK_TRACKER.md`) cho Git, code review, AI agents đọc.
- **Excel** (`tracker.xlsx`) cho management, in ấn, presentation.
- **HTML** (`tracker.html`) cho team daily use.

Script `generate_tracker.py` tự động sync từ Markdown → Excel/HTML.

### Q2: Làm sao track bug?

**A:** Dùng prefix `BUG-` (e.g., `BUG-001`). Bug là task P0/P1, có:
- Mô tả lỗi
- Repro steps
- Owner fix
- PR link
- Ngày verify fix

### Q3: Task bị carry over qua sprint sau?

**A:** OK, nhưng PHẢI:
- Đánh dấu "carried over" trong cột Notes
- Cập nhật Sprint field
- Note lý do (over-estimate, blocker, etc.)
- Tính vào velocity thực tế (không phải velocity nominal)

### Q4: Ai có quyền edit file?

**A:** Mọi thành viên edit `TASK_TRACKER.md` (qua PR). PM approve trước khi merge. Excel/HTML tự động regenerate.

### Q5: Làm sao đo năng suất (productivity)?

**A:** Xem các metric trong Sprint Report:
- **Velocity:** Story points done per sprint
- **Cycle time:** Thời gian trung bình 1 task
- **Bug ratio:** Bugs / total tasks
- **Carry-over rate:** % task chưa xong cuối sprint

### Q6: Task estimate effort sai thì sao?

**A:**
- Nếu > 50% underestimate: cập nhật effort, note lý do
- Dùng cho retrospective để cải thiện estimation
- Không blame cá nhân

### Q7: Có cần commit `tracker.xlsx` lên Git không?

**A:** **KHÔNG**. Add vào `.gitignore`:
```gitignore
# Generated tracking files
docs/tracker.xlsx
docs/tracker.html
```
Chỉ commit file Markdown (source of truth).

### Q8: Làm sao share cho giảng viên/instructor?

**A:**
1. Mở `tracker.xlsx`
2. Sheet "Dashboard" → Print → Save as PDF
3. Hoặc: Mở `tracker.html` → Print to PDF
4. Hoặc: Tạo slide deck (xem `generate_slides.py`)

---

## 🔗 Liên kết nhanh

- 📋 **Bảng công việc:** [`TASK_TRACKER.md`](./TASK_TRACKER.md)
- 📅 **Timeline:** [`TIMELINE.md`](./TIMELINE.md)
- 🤖 **AI Rules:** [`AGENTS.md`](../AGENTS.md)
- 📝 **AI Context:** [`AI_CONTEXT.md`](../AI_CONTEXT.md)
- 📜 **Changelog:** [`CHANGELOG_AI.md`](../CHANGELOG_AI.md)
- 📖 **User Manual:** [`USER_MANUAL.md`](./USER_MANUAL.md)
- 🎯 **Slides:** `thriftit_user_manual_slides.pptx`

---

## 📞 Liên hệ & Support

- **PM:** @frontend-lead
- **Tech lead:** @backend-lead
- **Repo:** `f:\FPTU\FALL 2026\EXE201\pj_UI\`

> **Tip cuối cùng:** Cập nhật tracker **HÀNG NGÀY**, đừng để tích lũy. Task nhỏ update thường xuyên dễ hơn task lớn update 1 lần.
