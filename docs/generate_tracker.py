#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_tracker.py
====================
Tool tự động generate Excel dashboard + HTML interactive board cho dự án thrift it!

Outputs:
  - tracker.xlsx  (5 sheets: Dashboard, All Tasks, Gantt, Risks, Team Workload)
  - tracker.html  (Interactive Kanban board với filter)

Usage:
  pip install openpyxl
  python generate_tracker.py

Author: @frontend-lead
Last updated: 2026-10-03
"""

import sys
from datetime import datetime, timedelta

try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, NamedStyle
    from openpyxl.chart import PieChart, BarChart, Reference, LineChart
    from openpyxl.utils import get_column_letter
    from openpyxl.formatting.rule import ColorScaleRule
except ImportError:
    print("[ERROR] Missing dependency: openpyxl")
    print("Run: pip install openpyxl")
    sys.exit(1)


# ============================================================================
# CONFIG
# ============================================================================

PROJECT_NAME = "thrift it!"
SUBTITLE = "Vintage Clothing Marketplace — Task & Timeline Tracker"
OUTPUT_XLSX = "tracker.xlsx"
OUTPUT_HTML = "tracker.html"
LAST_UPDATED = "2026-10-03"

# Colors (hex without #)
COLORS = {
    "espresso": "3A2312",
    "coffee": "6F4E37",
    "linen": "FAF0E6",
    "terracotta": "D27D2D",
    "muted": "E8D5BC",
    "soft": "F7ECE0",
    "green": "27AE60",
    "red": "E74C3C",
    "blue": "2980B9",
    "gray": "95A5A6",
    "white": "FFFFFF",
    "dark_gray": "2C3E50",
}


# ============================================================================
# TASK DATABASE
# ============================================================================

TASKS = [
    # Sprint 7 — DONE
    {"id": "FE-101", "title": "AddressBook component + useAddressCatalog hook",
     "module": "FE", "priority": "P0", "owner": "@frontend-lead",
     "status": "Done", "effort": 8, "sprint": "S7",
     "start": "2026-09-26", "end": "2026-09-27", "notes": "docs/USER_MANUAL.md §3.9"},
    {"id": "FE-102", "title": "CAS API — 2-tier administrative hierarchy",
     "module": "FE", "priority": "P0", "owner": "@frontend-dev",
     "status": "Done", "effort": 6, "sprint": "S7",
     "start": "2026-09-27", "end": "2026-09-28", "notes": "Bỏ Quận/Huyện"},
    {"id": "FE-103", "title": "PaymentScreen auto-fill từ AddressBook",
     "module": "FE", "priority": "P0", "owner": "@frontend-dev",
     "status": "Done", "effort": 4, "sprint": "S7",
     "start": "2026-09-28", "end": "2026-09-28", "notes": "AddressPickerModal"},
    {"id": "FE-104", "title": "AddressBookTab (Buyer) — CRUD đầy đủ",
     "module": "FE", "priority": "P0", "owner": "@frontend-dev",
     "status": "Done", "effort": 5, "sprint": "S7",
     "start": "2026-09-28", "end": "2026-09-29", "notes": ""},
    {"id": "FE-105", "title": "WarehouseTab (Seller) — pickup address",
     "module": "FE", "priority": "P0", "owner": "@frontend-dev",
     "status": "Done", "effort": 5, "sprint": "S7",
     "start": "2026-09-29", "end": "2026-09-30", "notes": ""},
    {"id": "FE-106", "title": "LetterAvatar + PlaceholderImage thay Unsplash",
     "module": "FE", "priority": "P1", "owner": "@frontend-dev",
     "status": "Done", "effort": 3, "sprint": "S7",
     "start": "2026-09-30", "end": "2026-09-30", "notes": ""},
    {"id": "FE-107", "title": "Auto-fill pickup từ warehouse trong shipment dialog",
     "module": "FE", "priority": "P1", "owner": "@frontend-dev",
     "status": "Done", "effort": 2, "sprint": "S7",
     "start": "2026-10-01", "end": "2026-10-01", "notes": ""},
    {"id": "FE-108", "title": "Xóa legacy placeholder Quận/Huyện",
     "module": "FE", "priority": "P2", "owner": "@frontend-dev",
     "status": "Done", "effort": 1, "sprint": "S7",
     "start": "2026-10-02", "end": "2026-10-02", "notes": ""},
    {"id": "FE-109", "title": "Loading & error states cho AddressBook",
     "module": "FE", "priority": "P1", "owner": "@frontend-dev",
     "status": "Done", "effort": 2, "sprint": "S7",
     "start": "2026-10-01", "end": "2026-10-01", "notes": "Catalog fail → free-text fallback"},

    {"id": "BE-201", "title": "addressService.ts — proxy CAS Address Kit",
     "module": "BE", "priority": "P0", "owner": "@backend-lead",
     "status": "Done", "effort": 6, "sprint": "S7",
     "start": "2026-09-26", "end": "2026-09-27", "notes": "24h in-memory cache"},
    {"id": "BE-202", "title": "addressController + routes",
     "module": "BE", "priority": "P0", "owner": "@backend-dev",
     "status": "Done", "effort": 3, "sprint": "S7",
     "start": "2026-09-27", "end": "2026-09-27", "notes": "3 endpoints: provinces, communes"},
    {"id": "BE-203", "title": "Snapshot địa chỉ vào Order",
     "module": "BE", "priority": "P0", "owner": "@backend-dev",
     "status": "Done", "effort": 4, "sprint": "S7",
     "start": "2026-09-28", "end": "2026-09-29", "notes": "shippingProvinceId, ward"},
    {"id": "BE-204", "title": "test:address (16/16 PASS)",
     "module": "BE", "priority": "P1", "owner": "@backend-dev",
     "status": "Done", "effort": 3, "sprint": "S7",
     "start": "2026-10-01", "end": "2026-10-01", "notes": ""},
    {"id": "BE-205", "title": "5s timeout cho CAS requests (AbortController)",
     "module": "BE", "priority": "P1", "owner": "@backend-dev",
     "status": "Done", "effort": 1, "sprint": "S7",
     "start": "2026-09-30", "end": "2026-09-30", "notes": ""},
    {"id": "BE-206", "title": "Validate effectiveDate (latest|YYYY-MM-DD)",
     "module": "BE", "priority": "P2", "owner": "@backend-dev",
     "status": "Done", "effort": 1, "sprint": "S7",
     "start": "2026-10-02", "end": "2026-10-02", "notes": ""},

    {"id": "DB-301", "title": "Migration: address snapshot fields vào Order",
     "module": "DB", "priority": "P0", "owner": "@backend-lead",
     "status": "Done", "effort": 3, "sprint": "S7",
     "start": "2026-09-28", "end": "2026-09-28", "notes": ""},
    {"id": "DB-302", "title": "Update mapOrder adapter",
     "module": "DB", "priority": "P0", "owner": "@backend-dev",
     "status": "Done", "effort": 2, "sprint": "S7",
     "start": "2026-09-29", "end": "2026-09-29", "notes": ""},
    {"id": "DB-303", "title": "Backfill address snapshots cho orders cũ",
     "module": "DB", "priority": "P3", "owner": "@backend-dev",
     "status": "Backlog", "effort": 4, "sprint": "S8",
     "start": "2026-10-06", "end": "2026-10-07", "notes": "Cần script riêng"},

    {"id": "QA-401", "title": "Backend build pass (npm run build)",
     "module": "QA", "priority": "P0", "owner": "@qa",
     "status": "Done", "effort": 0.5, "sprint": "S7",
     "start": "2026-10-03", "end": "2026-10-03", "notes": "Exit 0"},
    {"id": "QA-402", "title": "Backend tests pass (errorContract)",
     "module": "QA", "priority": "P0", "owner": "@qa",
     "status": "Done", "effort": 0.5, "sprint": "S7",
     "start": "2026-10-03", "end": "2026-10-03", "notes": "38/38 PASS"},
    {"id": "QA-403", "title": "Frontend build pass (vite)",
     "module": "QA", "priority": "P0", "owner": "@qa",
     "status": "Done", "effort": 0.5, "sprint": "S7",
     "start": "2026-10-03", "end": "2026-10-03", "notes": "Bundle 448 KB JS / 122 KB CSS"},
    {"id": "QA-404", "title": "Live test /api/users/me/addresses",
     "module": "QA", "priority": "P0", "owner": "@qa",
     "status": "To Do", "effort": 2, "sprint": "S7",
     "start": "2026-10-03", "end": "2026-10-04", "notes": "Cần MongoDB live connection"},

    {"id": "DOC-501", "title": "Update AI_CONTEXT.md",
     "module": "DOC", "priority": "P0", "owner": "@frontend-lead",
     "status": "Done", "effort": 1, "sprint": "S7",
     "start": "2026-10-03", "end": "2026-10-03", "notes": "Updated 2026-10-03"},
    {"id": "DOC-502", "title": "USER_MANUAL.md (1083 dòng)",
     "module": "DOC", "priority": "P1", "owner": "@doc-team",
     "status": "Done", "effort": 3, "sprint": "S7",
     "start": "2026-10-02", "end": "2026-10-02", "notes": ""},
    {"id": "DOC-503", "title": "Slides .pptx (28 slides)",
     "module": "DOC", "priority": "P2", "owner": "@doc-team",
     "status": "Done", "effort": 2, "sprint": "S7",
     "start": "2026-10-03", "end": "2026-10-03", "notes": "16:9 widescreen"},

    {"id": "BUG-001", "title": "ORDER_BUYER_NOT_PARTICIPANT — buyer không transition DELIVERED",
     "module": "BUG", "priority": "P0", "owner": "@backend-lead",
     "status": "Done", "effort": 1, "sprint": "S6",
     "start": "2026-10-01", "end": "2026-10-01", "notes": "Fix 2026-10-01"},
    {"id": "BUG-002", "title": "Avatar chỉ update seller, không sync User",
     "module": "BUG", "priority": "P0", "owner": "@backend-dev",
     "status": "Done", "effort": 1, "sprint": "S6",
     "start": "2026-10-01", "end": "2026-10-01", "notes": "Fix 2026-10-01"},
    {"id": "BUG-003", "title": "Seller không set DELIVERING/DELIVERED trực tiếp",
     "module": "BUG", "priority": "P1", "owner": "@backend-dev",
     "status": "Done", "effort": 0.5, "sprint": "S6",
     "start": "2026-10-01", "end": "2026-10-01", "notes": "Fix 2026-10-01"},

    # Sprint 8 — IN PROGRESS / TO DO
    {"id": "BE-301", "title": "Ledger.ts — double-entry accounting model",
     "module": "BE", "priority": "P0", "owner": "@backend-lead",
     "status": "In Progress", "effort": 12, "sprint": "S8",
     "start": "2026-10-04", "end": "2026-10-06", "notes": "4 accounts, idempotency"},
    {"id": "BE-302", "title": "PlatformFeeConfig.ts — flexible commission rates",
     "module": "BE", "priority": "P0", "owner": "@backend-lead",
     "status": "To Do", "effort": 8, "sprint": "S8",
     "start": "2026-10-06", "end": "2026-10-07", "notes": "Theo thời điểm đặt hàng"},
    {"id": "BE-303", "title": "Refactor getAdminStats dùng Ledger",
     "module": "BE", "priority": "P0", "owner": "@backend-dev",
     "status": "To Do", "effort": 6, "sprint": "S8",
     "start": "2026-10-08", "end": "2026-10-08", "notes": "Chống drift"},
    {"id": "BE-304", "title": "Migration: backfill Ledger cho orders COMPLETED",
     "module": "BE", "priority": "P0", "owner": "@backend-dev",
     "status": "To Do", "effort": 6, "sprint": "S8",
     "start": "2026-10-09", "end": "2026-10-09", "notes": "Reconcile với Order.platformFee"},
    {"id": "BE-305", "title": "Admin endpoint cập nhật rate (audit trail)",
     "module": "BE", "priority": "P1", "owner": "@backend-dev",
     "status": "To Do", "effort": 4, "sprint": "S8",
     "start": "2026-10-09", "end": "2026-10-09", "notes": ""},

    {"id": "CLEAN-401", "title": "Xóa /api/auth/cart/merge (deprecated)",
     "module": "CLEAN", "priority": "P2", "owner": "@backend-dev",
     "status": "To Do", "effort": 1, "sprint": "S8",
     "start": "2026-10-08", "end": "2026-10-08", "notes": ""},
    {"id": "CLEAN-402", "title": "Xóa legacy /api/admin/users/:id/{approve,reject}-seller",
     "module": "CLEAN", "priority": "P2", "owner": "@backend-dev",
     "status": "To Do", "effort": 1, "sprint": "S8",
     "start": "2026-10-08", "end": "2026-10-08", "notes": ""},
    {"id": "CLEAN-403", "title": "Cleanup Unsplash fallbacks toàn bộ FE",
     "module": "CLEAN", "priority": "P3", "owner": "@frontend-dev",
     "status": "To Do", "effort": 4, "sprint": "S8",
     "start": "2026-10-09", "end": "2026-10-09", "notes": ""},

    {"id": "FE-301", "title": "UI thanh toán online (card / ví điện tử)",
     "module": "FE", "priority": "P1", "owner": "@frontend-dev",
     "status": "To Do", "effort": 12, "sprint": "S8",
     "start": "2026-10-07", "end": "2026-10-08", "notes": "Hiện chỉ có COD"},
    {"id": "FE-302", "title": "Stripe / VNPay integration",
     "module": "FE", "priority": "P1", "owner": "@frontend-dev",
     "status": "To Do", "effort": 16, "sprint": "S8",
     "start": "2026-10-09", "end": "2026-10-10", "notes": "Phụ thuộc backend webhook"},
    {"id": "FE-303", "title": "Hiển thị platform fee cho seller khi đặt giá",
     "module": "FE", "priority": "P2", "owner": "@frontend-dev",
     "status": "To Do", "effort": 4, "sprint": "S8",
     "start": "2026-10-10", "end": "2026-10-10", "notes": ""},

    {"id": "QA-501", "title": "E2E test toàn flow mua hàng (Playwright)",
     "module": "QA", "priority": "P1", "owner": "@qa",
     "status": "Blocked", "effort": 16, "sprint": "S8",
     "start": "2026-10-08", "end": "2026-10-10", "notes": "Cần staging env"},

    # Backlog / Roadmap Q4
    {"id": "FE-X01", "title": "Chat Buyer ↔ Seller real-time (WebSocket)",
     "module": "FE", "priority": "P1", "owner": "TBD",
     "status": "Backlog", "effort": 40, "sprint": "Q4",
     "start": "2026-11-01", "end": "2026-11-15", "notes": "Hiện là preview/mock"},
    {"id": "FE-X02", "title": "Đánh giá nâng cao (ảnh review, reply)",
     "module": "FE", "priority": "P2", "owner": "TBD",
     "status": "Backlog", "effort": 24, "sprint": "Q4",
     "start": "2026-11-15", "end": "2026-11-30", "notes": ""},
    {"id": "FE-X03", "title": "Wishlist / Favorites page riêng",
     "module": "FE", "priority": "P2", "owner": "TBD",
     "status": "Backlog", "effort": 8, "sprint": "Q4",
     "start": "2026-10-15", "end": "2026-10-17", "notes": ""},
    {"id": "BE-X01", "title": "Seller analytics dashboard",
     "module": "BE", "priority": "P2", "owner": "TBD",
     "status": "Backlog", "effort": 16, "sprint": "Q4",
     "start": "2026-11-01", "end": "2026-11-05", "notes": ""},
    {"id": "BE-X02", "title": "Recommendation engine (collaborative filtering)",
     "module": "BE", "priority": "P3", "owner": "TBD",
     "status": "Backlog", "effort": 40, "sprint": "Q4",
     "start": "2026-11-15", "end": "2026-12-05", "notes": ""},
    {"id": "INFRA-X01", "title": "CI/CD pipeline (GitHub Actions)",
     "module": "INFRA", "priority": "P1", "owner": "@devops",
     "status": "Backlog", "effort": 12, "sprint": "Q4",
     "start": "2026-11-01", "end": "2026-11-03", "notes": "Hiện manual deploy Render"},
    {"id": "INFRA-X02", "title": "Monitoring & alerts (Sentry, UptimeRobot)",
     "module": "INFRA", "priority": "P2", "owner": "@devops",
     "status": "Backlog", "effort": 8, "sprint": "Q4",
     "start": "2026-11-05", "end": "2026-11-07", "notes": ""},
]

RISKS = [
    {"id": "R-01", "risk": "Ledger chưa xong → platformProfit có thể drift",
     "impact": "High", "probability": "Medium",
     "mitigation": "Implement S8 ngay tuần đầu", "owner": "@backend-lead"},
    {"id": "R-02", "risk": "CAS API thay đổi schema → break address picker",
     "impact": "Medium", "probability": "Low",
     "mitigation": "Fallback free-text + cache 24h", "owner": "@backend-dev"},
    {"id": "R-03", "risk": "Render.com free tier exhausted → downtime",
     "impact": "Medium", "probability": "Medium",
     "mitigation": "Monitor usage, có plan upgrade", "owner": "@devops"},
    {"id": "R-04", "risk": "Thiếu E2E tests → regression bugs khi refactor",
     "impact": "High", "probability": "Medium",
     "mitigation": "Setup Playwright + staging S8", "owner": "@qa"},
    {"id": "R-05", "risk": "Mobile app chưa đồng bộ với backend",
     "impact": "Medium", "probability": "Low",
     "mitigation": "Sync API contract trước mỗi release", "owner": "@mobile-lead"},
]

MILESTONES = [
    {"date": "2026-07-15", "name": "MVP — Auth & Product CRUD", "status": "Done", "owner": "@backend-lead"},
    {"date": "2026-08-01", "name": "Seller Application Flow", "status": "Done", "owner": "@backend-dev"},
    {"date": "2026-08-15", "name": "Cart + Checkout (COD)", "status": "Done", "owner": "@fullstack"},
    {"date": "2026-09-01", "name": "Shipment GHTK Integration", "status": "Done", "owner": "@backend-dev"},
    {"date": "2026-09-15", "name": "Reviews + Admin Panel", "status": "Done", "owner": "@fullstack"},
    {"date": "2026-10-03", "name": "Address Book + CAS", "status": "Done", "owner": "@frontend-lead"},
    {"date": "2026-10-10", "name": "Ledger + Payment", "status": "In Progress", "owner": "@backend-lead"},
    {"date": "2026-10-24", "name": "Online Payment MVP", "status": "Planned", "owner": "@fullstack"},
    {"date": "2026-11-15", "name": "Beta Launch (200 users)", "status": "Planned", "owner": "@pm"},
    {"date": "2026-12-01", "name": "Public Launch", "status": "Planned", "owner": "@all"},
]


# ============================================================================
# HELPERS
# ============================================================================

def status_color(status: str) -> str:
    """Return hex color for status."""
    mapping = {
        "Done": COLORS["green"],
        "In Progress": COLORS["blue"],
        "To Do": COLORS["terracotta"],
        "Blocked": COLORS["red"],
        "Backlog": COLORS["gray"],
        "Cancelled": "000000",
    }
    return mapping.get(status, COLORS["gray"])


def priority_color(priority: str) -> str:
    """Return hex color for priority."""
    mapping = {
        "P0": COLORS["red"],
        "P1": COLORS["terracotta"],
        "P2": COLORS["blue"],
        "P3": COLORS["gray"],
    }
    return mapping.get(priority, COLORS["gray"])


def safe_col(s, col_idx, width=20):
    """Set column width safely."""
    col_letter = get_column_letter(col_idx)
    s.column_dimensions[col_letter].width = width


def header_row(ws, row, headers, fill_color=None):
    """Write a styled header row."""
    if fill_color is None:
        fill_color = COLORS["espresso"]
    fill = PatternFill("solid", fgColor=fill_color)
    font = Font(bold=True, color=COLORS["white"], size=11)
    align = Alignment(horizontal="center", vertical="center")
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=row, column=col_idx, value=header)
        cell.fill = fill
        cell.font = font
        cell.alignment = align
        cell.border = Border(
            left=Side(style="thin"), right=Side(style="thin"),
            top=Side(style="thin"), bottom=Side(style="thin")
        )


def fill_status(cell, status):
    """Apply background fill + text color based on status."""
    bg = status_color(status)
    cell.fill = PatternFill("solid", fgColor=bg)
    cell.font = Font(color=COLORS["white"], bold=True)
    cell.alignment = Alignment(horizontal="center")


def fill_priority(cell, priority):
    """Apply background fill based on priority."""
    bg = priority_color(priority)
    cell.fill = PatternFill("solid", fgColor=bg)
    cell.font = Font(color=COLORS["white"], bold=True)
    cell.alignment = Alignment(horizontal="center")


def parse_date(s: str):
    """Parse YYYY-MM-DD."""
    try:
        return datetime.strptime(s, "%Y-%m-%d")
    except Exception:
        return None


# ============================================================================
# EXCEL GENERATION
# ============================================================================

def build_excel():
    wb = Workbook()
    wb.remove(wb.active)

    # ----------------- Sheet 1: Dashboard -----------------
    ws = wb.create_sheet("Dashboard")

    # Title
    ws.merge_cells("A1:H1")
    ws["A1"] = f"{PROJECT_NAME} — {SUBTITLE}"
    ws["A1"].font = Font(size=20, bold=True, color=COLORS["espresso"])
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 30

    ws.merge_cells("A2:H2")
    ws["A2"] = f"Last updated: {LAST_UPDATED}"
    ws["A2"].font = Font(size=10, italic=True, color=COLORS["gray"])
    ws["A2"].alignment = Alignment(horizontal="center")

    # KPIs
    n_done = sum(1 for t in TASKS if t["status"] == "Done")
    n_inprog = sum(1 for t in TASKS if t["status"] == "In Progress")
    n_todo = sum(1 for t in TASKS if t["status"] == "To Do")
    n_blocked = sum(1 for t in TASKS if t["status"] == "Blocked")
    n_backlog = sum(1 for t in TASKS if t["status"] == "Backlog")
    n_total = len(TASKS)
    pct = (n_done / n_total) * 100 if n_total else 0
    total_effort = sum(t["effort"] for t in TASKS if t["status"] in ("Done", "In Progress"))
    completed_effort = sum(t["effort"] for t in TASKS if t["status"] == "Done")

    ws["A4"] = "📊 KPI Summary"
    ws["A4"].font = Font(size=14, bold=True, color=COLORS["coffee"])
    ws.merge_cells("A4:H4")

    kpis = [
        ("Total Tasks", n_total, COLORS["dark_gray"]),
        ("Done", n_done, COLORS["green"]),
        ("In Progress", n_inprog, COLORS["blue"]),
        ("To Do", n_todo, COLORS["terracotta"]),
        ("Blocked", n_blocked, COLORS["red"]),
        ("Backlog", n_backlog, COLORS["gray"]),
        ("% Complete", f"{pct:.1f}%", COLORS["espresso"]),
        ("Active Effort (h)", total_effort, COLORS["coffee"]),
    ]
    for i, (label, value, color) in enumerate(kpis):
        row = 6 + (i // 4) * 4
        col = 1 + (i % 4) * 2
        lcell = ws.cell(row=row, column=col, value=label)
        lcell.font = Font(size=10, color=COLORS["gray"])
        lcell.alignment = Alignment(horizontal="center")
        vcell = ws.cell(row=row + 1, column=col, value=value)
        vcell.font = Font(size=24, bold=True, color=color)
        vcell.alignment = Alignment(horizontal="center")
        ws.merge_cells(start_row=row, start_column=col, end_row=row, end_column=col + 1)
        ws.merge_cells(start_row=row + 1, start_column=col, end_row=row + 1, end_column=col + 1)

    # Status distribution table
    ws["A14"] = "Status Distribution"
    ws["A14"].font = Font(size=14, bold=True, color=COLORS["coffee"])
    ws.merge_cells("A14:H14")

    header_row(ws, 16, ["Status", "Count", "%", "Effort (h)", "Module"])

    status_data = {}
    for t in TASKS:
        s = t["status"]
        if s not in status_data:
            status_data[s] = {"count": 0, "effort": 0, "modules": set()}
        status_data[s]["count"] += 1
        status_data[s]["effort"] += t["effort"]
        status_data[s]["modules"].add(t["module"])

    row = 17
    for status in ["Done", "In Progress", "To Do", "Blocked", "Backlog"]:
        if status in status_data:
            d = status_data[status]
            ws.cell(row=row, column=1, value=status)
            fill_status(ws.cell(row=row, column=1), status)
            ws.cell(row=row, column=2, value=d["count"])
            ws.cell(row=row, column=3, value=f"{(d['count'] / n_total * 100):.1f}%")
            ws.cell(row=row, column=4, value=d["effort"])
            ws.cell(row=row, column=5, value=", ".join(sorted(d["modules"])))
            row += 1

    # Module workload
    ws["A25"] = "Effort per Module"
    ws["A25"].font = Font(size=14, bold=True, color=COLORS["coffee"])
    ws.merge_cells("A25:H25")

    header_row(ws, 27, ["Module", "Tasks", "Total Effort (h)", "Done Effort (h)", "% Complete"])

    module_stats = {}
    for t in TASKS:
        m = t["module"]
        if m not in module_stats:
            module_stats[m] = {"total": 0, "done": 0, "count": 0}
        module_stats[m]["total"] += t["effort"]
        module_stats[m]["count"] += 1
        if t["status"] == "Done":
            module_stats[m]["done"] += t["effort"]

    row = 28
    for module, stats in sorted(module_stats.items()):
        ws.cell(row=row, column=1, value=module)
        ws.cell(row=row, column=2, value=stats["count"])
        ws.cell(row=row, column=3, value=stats["total"])
        ws.cell(row=row, column=4, value=stats["done"])
        pct_m = (stats["done"] / stats["total"] * 100) if stats["total"] else 0
        ws.cell(row=row, column=5, value=f"{pct_m:.1f}%")
        row += 1

    # Adjust column widths
    for c in range(1, 9):
        safe_col(ws, c, width=18)

    # ----------------- Sheet 2: All Tasks -----------------
    ws2 = wb.create_sheet("All Tasks")
    headers = ["ID", "Title", "Module", "Priority", "Owner", "Status",
               "Effort (h)", "Sprint", "Start", "End", "Notes"]
    header_row(ws2, 1, headers, fill_color=COLORS["coffee"])

    row = 2
    for t in TASKS:
        ws2.cell(row=row, column=1, value=t["id"])
        ws2.cell(row=row, column=2, value=t["title"])
        ws2.cell(row=row, column=3, value=t["module"])
        fill_priority(ws2.cell(row=row, column=4), t["priority"])
        ws2.cell(row=row, column=4, value=t["priority"])
        ws2.cell(row=row, column=5, value=t["owner"])
        fill_status(ws2.cell(row=row, column=6), t["status"])
        ws2.cell(row=row, column=6, value=t["status"])
        ws2.cell(row=row, column=7, value=t["effort"])
        ws2.cell(row=row, column=8, value=t["sprint"])
        ws2.cell(row=row, column=9, value=t["start"])
        ws2.cell(row=row, column=10, value=t["end"])
        ws2.cell(row=row, column=11, value=t["notes"])

        # Alternating row colors
        if row % 2 == 0:
            for c in range(1, 12):
                cell = ws2.cell(row=row, column=c)
                if cell.fill.fgColor.rgb is None or cell.fill.fgColor.rgb == "00000000":
                    cell.fill = PatternFill("solid", fgColor=COLORS["linen"])
        row += 1

    # Column widths
    widths = [10, 50, 10, 10, 18, 12, 10, 8, 12, 12, 40]
    for i, w in enumerate(widths, 1):
        safe_col(ws2, i, width=w)

    # Freeze top row
    ws2.freeze_panes = "A2"

    # ----------------- Sheet 3: Gantt Chart -----------------
    ws3 = wb.create_sheet("Gantt")

    # Compute date range
    all_dates = []
    for t in TASKS:
        s = parse_date(t["start"])
        e = parse_date(t["end"])
        if s and e:
            all_dates.extend([s, e])
    if not all_dates:
        all_dates = [datetime(2026, 10, 1)]
    min_date = min(all_dates)
    max_date = max(all_dates)
    n_days = (max_date - min_date).days + 1

    # Header: Task ID | Title | Start | End | [Day 1, Day 2, ...]
    headers = ["ID", "Title", "Start", "End", "Days"]
    for d_offset in range(n_days):
        d = min_date + timedelta(days=d_offset)
        headers.append(d.strftime("%m-%d"))
    header_row(ws3, 1, headers, fill_color=COLORS["terracotta"])

    row = 2
    for t in TASKS:
        s = parse_date(t["start"])
        e = parse_date(t["end"])
        ws3.cell(row=row, column=1, value=t["id"])
        ws3.cell(row=row, column=2, value=t["title"])
        ws3.cell(row=row, column=3, value=t["start"])
        ws3.cell(row=row, column=4, value=t["end"])
        days = (e - s).days + 1 if s and e else 0
        ws3.cell(row=row, column=5, value=days)

        # Gantt bars
        if s and e:
            bg = status_color(t["status"])
            for d_offset in range(n_days):
                d = min_date + timedelta(days=d_offset)
                cell = ws3.cell(row=row, column=6 + d_offset)
                if s <= d <= e:
                    cell.fill = PatternFill("solid", fgColor=bg)
                    cell.alignment = Alignment(horizontal="center")
                # Weekend highlight
                elif d.weekday() >= 5:
                    cell.fill = PatternFill("solid", fgColor="F0F0F0")
        row += 1

    # Column widths
    safe_col(ws3, 1, 10)
    safe_col(ws3, 2, 50)
    safe_col(ws3, 3, 12)
    safe_col(ws3, 4, 12)
    safe_col(ws3, 5, 8)
    for c in range(6, 6 + n_days):
        safe_col(ws3, c, 6)

    ws3.freeze_panes = "F2"

    # ----------------- Sheet 4: Risks -----------------
    ws4 = wb.create_sheet("Risks")
    headers = ["ID", "Risk", "Impact", "Probability", "Mitigation", "Owner"]
    header_row(ws4, 1, headers, fill_color=COLORS["red"])

    row = 2
    for r in RISKS:
        ws4.cell(row=row, column=1, value=r["id"])
        ws4.cell(row=row, column=2, value=r["risk"])
        ic = ws4.cell(row=row, column=3, value=r["impact"])
        if r["impact"] == "High":
            fill_status(ic, "Blocked")  # red
        elif r["impact"] == "Medium":
            fill_status(ic, "To Do")  # terracotta
        else:
            fill_status(ic, "Backlog")  # gray
        pc = ws4.cell(row=row, column=4, value=r["probability"])
        if r["probability"] == "High":
            fill_status(pc, "Blocked")
        elif r["probability"] == "Medium":
            fill_status(pc, "To Do")
        else:
            fill_status(pc, "Backlog")
        ws4.cell(row=row, column=5, value=r["mitigation"])
        ws4.cell(row=row, column=6, value=r["owner"])
        row += 1

    widths = [8, 50, 12, 12, 40, 16]
    for i, w in enumerate(widths, 1):
        safe_col(ws4, i, width=w)

    # ----------------- Sheet 5: Team Workload -----------------
    ws5 = wb.create_sheet("Team Workload")
    headers = ["Owner", "Active Tasks", "Total Effort (h)", "Done Effort (h)",
               "In Progress Effort (h)", "To Do Effort (h)"]
    header_row(ws5, 1, headers, fill_color=COLORS["blue"])

    team_stats = {}
    for t in TASKS:
        o = t["owner"]
        if o == "TBD":
            continue
        if o not in team_stats:
            team_stats[o] = {"active": 0, "total": 0, "done": 0, "inprog": 0, "todo": 0}
        if t["status"] not in ("Backlog", "Cancelled"):
            team_stats[o]["active"] += 1
        team_stats[o]["total"] += t["effort"]
        if t["status"] == "Done":
            team_stats[o]["done"] += t["effort"]
        elif t["status"] == "In Progress":
            team_stats[o]["inprog"] += t["effort"]
        elif t["status"] == "To Do":
            team_stats[o]["todo"] += t["effort"]

    row = 2
    for owner, stats in sorted(team_stats.items()):
        ws5.cell(row=row, column=1, value=owner)
        ws5.cell(row=row, column=2, value=stats["active"])
        ws5.cell(row=row, column=3, value=stats["total"])
        ws5.cell(row=row, column=4, value=stats["done"])
        ws5.cell(row=row, column=5, value=stats["inprog"])
        ws5.cell(row=row, column=6, value=stats["todo"])
        row += 1

    widths = [22, 14, 16, 16, 20, 16]
    for i, w in enumerate(widths, 1):
        safe_col(ws5, i, width=w)

    # ----------------- Sheet 6: Milestones -----------------
    ws6 = wb.create_sheet("Milestones")
    headers = ["Date", "Milestone", "Status", "Owner"]
    header_row(ws6, 1, headers, fill_color=COLORS["coffee"])

    row = 2
    for m in MILESTONES:
        ws6.cell(row=row, column=1, value=m["date"])
        ws6.cell(row=row, column=2, value=m["name"])
        sc = ws6.cell(row=row, column=3, value=m["status"])
        if m["status"] == "Done":
            fill_status(sc, "Done")
        elif m["status"] == "In Progress":
            fill_status(sc, "In Progress")
        else:
            fill_status(sc, "Backlog")
        ws6.cell(row=row, column=4, value=m["owner"])
        row += 1

    widths = [12, 50, 14, 16]
    for i, w in enumerate(widths, 1):
        safe_col(ws6, i, width=w)

    wb.save(OUTPUT_XLSX)
    print(f"[OK] Generated {OUTPUT_XLSX}")


# ============================================================================
# HTML GENERATION
# ============================================================================

def build_html():
    """Build an interactive Kanban board HTML."""

    n_done = sum(1 for t in TASKS if t["status"] == "Done")
    n_total = len(TASKS)
    pct = (n_done / n_total) * 100 if n_total else 0

    # Group by status
    by_status = {"Done": [], "In Progress": [], "To Do": [], "Blocked": [], "Backlog": []}
    for t in TASKS:
        if t["status"] in by_status:
            by_status[t["status"]].append(t)

    css_colors = {
        "Done": COLORS["green"],
        "In Progress": COLORS["blue"],
        "To Do": COLORS["terracotta"],
        "Blocked": COLORS["red"],
        "Backlog": COLORS["gray"],
    }

    def render_card(t):
        pid_color = priority_color(t["priority"])
        return f"""
        <div class="card" data-id="{t['id']}" data-priority="{t['priority']}" data-owner="{t['owner']}" data-module="{t['module']}">
          <div class="card-header">
            <span class="card-id">{t['id']}</span>
            <span class="priority-badge" style="background: #{pid_color}">{t['priority']}</span>
          </div>
          <div class="card-title">{t['title']}</div>
          <div class="card-meta">
            <span class="module-tag">{t['module']}</span>
            <span class="owner">{t['owner']}</span>
          </div>
          <div class="card-footer">
            <span class="sprint">{t['sprint']}</span>
            <span class="effort">{t['effort']}h</span>
          </div>
        </div>
        """

    columns_html = ""
    for status, tasks in by_status.items():
        color = css_colors[status]
        cards = "\n".join(render_card(t) for t in tasks)
        columns_html += f"""
        <div class="column" data-status="{status}">
          <div class="column-header" style="background: #{color}">
            <h2>{status}</h2>
            <span class="count">{len(tasks)}</span>
          </div>
          <div class="column-body">
            {cards}
          </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{PROJECT_NAME} — Task Tracker</title>
<style>
  :root {{
    --espresso: #{COLORS["espresso"]};
    --coffee: #{COLORS["coffee"]};
    --linen: #{COLORS["linen"]};
    --terracotta: #{COLORS["terracotta"]};
    --muted: #{COLORS["muted"]};
    --soft: #{COLORS["soft"]};
    --green: #{COLORS["green"]};
    --red: #{COLORS["red"]};
    --blue: #{COLORS["blue"]};
    --gray: #{COLORS["gray"]};
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--linen);
    color: var(--espresso);
    padding: 20px;
  }}
  .header {{
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }}
  .header h1 {{
    color: var(--espresso);
    font-size: 28px;
    margin-bottom: 8px;
  }}
  .header .subtitle {{ color: var(--gray); font-size: 14px; margin-bottom: 16px; }}
  .progress {{
    background: var(--muted);
    border-radius: 8px;
    height: 24px;
    overflow: hidden;
    position: relative;
  }}
  .progress-bar {{
    background: linear-gradient(90deg, var(--green), var(--terracotta));
    height: 100%;
    transition: width 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
  }}
  .filters {{
    background: white;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }}
  .filters label {{ font-weight: 600; color: var(--coffee); margin-right: 6px; }}
  .filters select, .filters input {{
    padding: 6px 12px;
    border: 1px solid var(--muted);
    border-radius: 6px;
    background: var(--soft);
    font-size: 14px;
  }}
  .board {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }}
  .column {{
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    min-height: 400px;
  }}
  .column-header {{
    color: white;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
  .column-header h2 {{ font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }}
  .column-header .count {{
    background: rgba(255,255,255,0.3);
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
  }}
  .column-body {{
    padding: 12px;
    max-height: calc(100vh - 280px);
    overflow-y: auto;
  }}
  .card {{
    background: var(--soft);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    border-left: 4px solid var(--terracotta);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }}
  .card:hover {{ transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
  .card-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }}
  .card-id {{ font-family: monospace; font-weight: bold; color: var(--coffee); font-size: 12px; }}
  .priority-badge {{
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
  }}
  .card-title {{ font-weight: 600; margin-bottom: 8px; font-size: 14px; line-height: 1.3; }}
  .card-meta {{
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--gray);
    margin-bottom: 6px;
  }}
  .module-tag {{
    background: var(--muted);
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
  }}
  .card-footer {{
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--gray);
    border-top: 1px solid var(--muted);
    padding-top: 6px;
  }}
  .card-footer .sprint {{
    background: var(--coffee);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
  }}
  @media (max-width: 1200px) {{
    .board {{ grid-template-columns: repeat(3, 1fr); }}
  }}
  @media (max-width: 768px) {{
    .board {{ grid-template-columns: 1fr; }}
  }}
</style>
</head>
<body>
  <div class="header">
    <h1>📋 {PROJECT_NAME} — Task Tracker</h1>
    <div class="subtitle">{SUBTITLE} • Last updated: {LAST_UPDATED}</div>
    <div class="progress">
      <div class="progress-bar" style="width: {pct:.1f}%">{pct:.1f}% Complete ({n_done}/{n_total})</div>
    </div>
  </div>

  <div class="filters">
    <div><label>Priority:</label><select id="filter-priority">
      <option value="">All</option>
      <option value="P0">P0</option>
      <option value="P1">P1</option>
      <option value="P2">P2</option>
      <option value="P3">P3</option>
    </select></div>
    <div><label>Owner:</label><select id="filter-owner">
      <option value="">All</option>
      <option value="@frontend-lead">@frontend-lead</option>
      <option value="@frontend-dev">@frontend-dev</option>
      <option value="@backend-lead">@backend-lead</option>
      <option value="@backend-dev">@backend-dev</option>
      <option value="@qa">@qa</option>
      <option value="@doc-team">@doc-team</option>
    </select></div>
    <div><label>Module:</label><select id="filter-module">
      <option value="">All</option>
      <option value="FE">FE</option>
      <option value="BE">BE</option>
      <option value="DB">DB</option>
      <option value="QA">QA</option>
      <option value="DOC">DOC</option>
      <option value="BUG">BUG</option>
      <option value="CLEAN">CLEAN</option>
    </select></div>
    <div><label>Search:</label><input type="text" id="filter-search" placeholder="ID or title..."></div>
  </div>

  <div class="board">
    {columns_html}
  </div>

  <script>
    const filters = {{
      priority: document.getElementById('filter-priority'),
      owner: document.getElementById('filter-owner'),
      module: document.getElementById('filter-module'),
      search: document.getElementById('filter-search'),
    }};

    function applyFilters() {{
      const p = filters.priority.value;
      const o = filters.owner.value;
      const m = filters.module.value;
      const s = filters.search.value.toLowerCase();
      document.querySelectorAll('.card').forEach(card => {{
        let show = true;
        if (p && card.dataset.priority !== p) show = false;
        if (o && card.dataset.owner !== o) show = false;
        if (m && card.dataset.module !== m) show = false;
        if (s && !card.dataset.id.toLowerCase().includes(s)
              && !card.querySelector('.card-title').textContent.toLowerCase().includes(s)) show = false;
        card.style.display = show ? 'block' : 'none';
      }});
    }}

    Object.values(filters).forEach(el => el.addEventListener('input', applyFilters));
  </script>
</body>
</html>
"""

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[OK] Generated {OUTPUT_HTML}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    print("=" * 70)
    print(f"  {PROJECT_NAME} — Project Tracker Generator")
    print("=" * 70)
    print(f"  Total tasks: {len(TASKS)}")
    print(f"  Total risks: {len(RISKS)}")
    print(f"  Total milestones: {len(MILESTONES)}")
    print("-" * 70)

    # Parse CLI args
    args = sys.argv[1:]
    fmt_xlsx = True
    fmt_html = True
    if "--format" in args:
        idx = args.index("--format")
        f = args[idx + 1] if idx + 1 < len(args) else "all"
        if f == "xlsx":
            fmt_html = False
        elif f == "html":
            fmt_xlsx = False

    if fmt_xlsx:
        build_excel()
    if fmt_html:
        build_html()

    print("-" * 70)
    print(f"  Done! Open:")
    if fmt_xlsx:
        print(f"    - {OUTPUT_XLSX}  (Excel dashboard)")
    if fmt_html:
        print(f"    - {OUTPUT_HTML}  (Web board)")
    print("=" * 70)


if __name__ == "__main__":
    main()