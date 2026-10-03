# -*- coding: utf-8 -*-
"""
Generate thrift it! User Manual slides (.pptx) from USER_MANUAL.md.

Design language matches the frontend theme:
- ESPRESSO  #3A2312  (deep brown — dark backgrounds, primary text)
- COFFEE    #6F4E37  (medium brown — accents)
- LINEN     #FAF0E6  (cream — light backgrounds)
- T (Terracotta/Amber) #D27D2D  (primary CTA color)
- MUTED     #E8D5BC  (soft tan — borders, secondary)
- SOFT      #F7ECE0  (warm light beige)
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

# ── Theme colors ────────────────────────────────────────────────────────────────
ESPRESSO = RGBColor(0x3A, 0x23, 0x12)
COFFEE    = RGBColor(0x6F, 0x4E, 0x37)
LINEN     = RGBColor(0xFA, 0xF0, 0xE6)
TERRACOTTA = RGBColor(0xD2, 0x7D, 0x2D)
AMBER_HI  = RGBColor(0xF5, 0xCB, 0x5C)
MUTED     = RGBColor(0xE8, 0xD5, 0xBC)
SOFT      = RGBColor(0xF7, 0xEC, 0xE0)
GREEN     = RGBColor(0x27, 0xAE, 0x60)
RED       = RGBColor(0xE7, 0x4C, 0x3C)
BLUE      = RGBColor(0x29, 0x80, 0xB9)
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
DARK_GRAY = RGBColor(0x2B, 0x18, 0x10)

# ── Setup presentation ──────────────────────────────────────────────────────────
prs = Presentation()
prs.slide_width  = Inches(13.333)   # 16:9 widescreen
prs.slide_height = Inches(7.5)

BLANK_LAYOUT = prs.slide_layouts[6]  # Blank


# ── Helpers ─────────────────────────────────────────────────────────────────────
def add_rect(slide, x, y, w, h, fill, line_color=None, line_w=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line_color is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line_color
        if line_w is not None:
            shape.line.width = line_w
    shape.shadow.inherit = False
    return shape


def add_text(slide, x, y, w, h, text, *, size=18, bold=False, color=ESPRESSO,
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font="Calibri"):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.05)
    tf.margin_right = Inches(0.05)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    tf.vertical_anchor = anchor

    lines = text.split("\n") if isinstance(text, str) else text
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        run = p.add_run()
        run.text = line
        run.font.name = font
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = color
    return tb


def add_bullets(slide, x, y, w, h, items, *, size=16, color=ESPRESSO,
                bullet_color=None, font="Calibri", line_spacing=1.25):
    """items: list of (text, level) tuples OR plain strings (level=0)."""
    if bullet_color is None:
        bullet_color = TERRACOTTA
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.05)
    tf.margin_right = Inches(0.05)
    tf.margin_top = Inches(0.05)
    tf.margin_bottom = Inches(0.05)

    first = True
    for item in items:
        if isinstance(item, tuple):
            text, level = item
        else:
            text, level = item, 0
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT
        p.level = level
        p.line_spacing = line_spacing
        p.space_after = Pt(4)

        # bullet
        bullet = "●  " if level == 0 else "—  "
        r1 = p.add_run()
        r1.text = bullet
        r1.font.name = font
        r1.font.size = Pt(size)
        r1.font.bold = True
        r1.font.color.rgb = bullet_color

        r2 = p.add_run()
        r2.text = text
        r2.font.name = font
        r2.font.size = Pt(size - level * 2)
        r2.font.color.rgb = color
    return tb


def add_slide_header(slide, title, subtitle=None, page_num=None, total=None):
    """Add a standard top header bar."""
    # Header background
    add_rect(slide, 0, 0, prs.slide_width, Inches(1.0), ESPRESSO)
    # Accent bar
    add_rect(slide, 0, Inches(1.0), prs.slide_width, Inches(0.08), TERRACOTTA)

    # Title
    add_text(slide, Inches(0.5), Inches(0.15), Inches(10), Inches(0.55),
             title, size=28, color=WHITE, bold=True,
             anchor=MSO_ANCHOR.MIDDLE, font="Calibri")

    if subtitle:
        add_text(slide, Inches(0.5), Inches(0.6), Inches(10), Inches(0.35),
                 subtitle, size=14, color=AMBER_HI, anchor=MSO_ANCHOR.MIDDLE)

    # Page indicator
    if page_num is not None and total is not None:
        add_text(slide, Inches(11.5), Inches(0.15), Inches(1.6), Inches(0.55),
                 f"{page_num} / {total}", size=14, color=AMBER_HI,
                 align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE, bold=True)


def add_footer(slide, text="thrift it! — User Manual · 2026"):
    add_rect(slide, 0, Inches(7.2), prs.slide_width, Inches(0.3), MUTED)
    add_text(slide, Inches(0.3), Inches(7.22), Inches(13), Inches(0.26),
             text, size=10, color=COFFEE, anchor=MSO_ANCHOR.MIDDLE)


def new_slide(*, light=True):
    s = prs.slides.add_slide(BLANK_LAYOUT)
    bg = LINEN if light else ESPRESSO
    # Background fill
    bg_shape = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0,
                                  prs.slide_width, prs.slide_height)
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = bg
    bg_shape.line.fill.background()
    bg_shape.shadow.inherit = False
    return s


def add_stat_card(slide, x, y, w, h, big_text, small_text, color=TERRACOTTA,
                  bg=WHITE, border=MUTED):
    """A KPI/stat card."""
    add_rect(slide, x, y, w, h, bg, line_color=border, line_w=Pt(0.75))
    add_text(slide, x, y + Inches(0.15), w, Inches(0.55),
             big_text, size=32, bold=True, color=color,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_text(slide, x, y + Inches(0.75), w, Inches(0.4),
             small_text, size=12, color=COFFEE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def add_arrow_step(slide, x, y, w, h, title, body, fill=TERRACOTTA, txt=WHITE):
    add_rect(slide, x, y, w, h, fill)
    add_text(slide, x, y, w, Inches(0.45), title, size=15, bold=True,
             color=txt, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_text(slide, x, y + Inches(0.42), w, h - Inches(0.45), body,
             size=10, color=txt, align=PP_ALIGN.CENTER,
             anchor=MSO_ANCHOR.MIDDLE)


def add_arrow_between(slide, x, y):
    arrow = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,
                                   x, y, Inches(0.35), Inches(0.5))
    arrow.fill.solid()
    arrow.fill.fore_color.rgb = TERRACOTTA
    arrow.line.fill.background()
    arrow.shadow.inherit = False


# ── Counters ────────────────────────────────────────────────────────────────────
TOTAL_SLIDES = 28   # Will be set later as a global; we compute it after building.
slides_built = []


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — Cover
# ════════════════════════════════════════════════════════════════════════════════
def slide_01_cover(n, t):
    s = new_slide(light=False)
    # Decorative left bar
    add_rect(s, 0, 0, Inches(0.5), prs.slide_height, TERRACOTTA)
    # Decorative diagonal accent
    add_rect(s, Inches(0.5), 0, Inches(0.15), prs.slide_height, AMBER_HI)

    # Logo mark (simple circle + initials)
    logo = s.shapes.add_shape(MSO_SHAPE.OVAL,
                              Inches(0.9), Inches(0.9),
                              Inches(1.0), Inches(1.0))
    logo.fill.solid()
    logo.fill.fore_color.rgb = TERRACOTTA
    logo.line.color.rgb = AMBER_HI
    logo.line.width = Pt(3)
    logo.shadow.inherit = False
    add_text(s, Inches(0.9), Inches(0.9), Inches(1.0), Inches(1.0),
             "T", size=48, bold=True, color=LINEN,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    add_text(s, Inches(2.1), Inches(0.85), Inches(8), Inches(0.5),
             "thrift it!", size=22, color=AMBER_HI, bold=True)
    add_text(s, Inches(2.1), Inches(1.3), Inches(8), Inches(0.4),
             "Vintage Clothing Marketplace", size=14, color=MUTED)

    # Title
    add_text(s, Inches(0.9), Inches(2.8), Inches(12), Inches(1.2),
             "USER MANUAL", size=64, bold=True, color=LINEN,
             align=PP_ALIGN.LEFT)
    add_text(s, Inches(0.9), Inches(4.1), Inches(12), Inches(0.6),
             "Hướng dẫn sử dụng đầy đủ cho mọi đối tượng",
             size=24, color=AMBER_HI, align=PP_ALIGN.LEFT)
    add_text(s, Inches(0.9), Inches(4.7), Inches(12), Inches(0.5),
             "Giới thiệu web · Hướng dẫn người mua · Hướng dẫn người bán",
             size=16, color=MUTED, align=PP_ALIGN.LEFT)

    # Slogan
    add_rect(s, Inches(0.9), Inches(5.6), Inches(0.15), Inches(1.0), TERRACOTTA)
    add_text(s, Inches(1.2), Inches(5.6), Inches(11), Inches(0.5),
             "🌿  Mặc vintage, sống có tâm",
             size=22, color=AMBER_HI, bold=True)
    add_text(s, Inches(1.2), Inches(6.05), Inches(11), Inches(0.5),
             "Mua và bán đồ cũ — góp phần giảm thiểu rác thải thời trang",
             size=13, color=MUTED)

    # Bottom right meta
    add_text(s, Inches(8), Inches(6.9), Inches(5), Inches(0.4),
             "Phiên bản 1.0  ·  03/10/2026",
             size=11, color=MUTED, align=PP_ALIGN.RIGHT)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — Table of contents
# ════════════════════════════════════════════════════════════════════════════════
def slide_02_toc(n, t):
    s = new_slide()
    add_slide_header(s, "Mục lục", "Tài liệu hướng dẫn sử dụng thrift it!", n, t)

    items = [
        ("1", "Giới thiệu về thrift it!"),
        ("2", "Bắt đầu nhanh"),
        ("3", "Hướng dẫn cho Người mua (Buyer)"),
        ("4", "Hướng dẫn cho Người bán (Seller)"),
        ("5", "Hướng dẫn cho Quản trị viên (Admin)"),
        ("6", "Câu hỏi thường gặp (FAQ)"),
        ("7", "Liên hệ & Hỗ trợ"),
    ]
    y = Inches(1.55)
    for num, label in items:
        # Number badge
        badge = s.shapes.add_shape(MSO_SHAPE.OVAL,
                                   Inches(1.0), y,
                                   Inches(0.7), Inches(0.7))
        badge.fill.solid()
        badge.fill.fore_color.rgb = TERRACOTTA
        badge.line.fill.background()
        badge.shadow.inherit = False
        add_text(s, Inches(1.0), y, Inches(0.7), Inches(0.7),
                 num, size=22, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        # Label
        add_text(s, Inches(1.95), y, Inches(10), Inches(0.7),
                 label, size=22, color=ESPRESSO, bold=True,
                 anchor=MSO_ANCHOR.MIDDLE)
        y += Inches(0.78)

    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — Section divider: 1. Giới thiệu
# ════════════════════════════════════════════════════════════════════════════════
def slide_03_section_intro(n, t):
    s = new_slide(light=False)
    add_text(s, Inches(0.5), Inches(2.5), Inches(12), Inches(0.5),
             "PHẦN 1", size=18, color=AMBER_HI, bold=True)
    add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(1.5),
             "Giới thiệu về thrift it!", size=54, color=LINEN, bold=True)
    add_text(s, Inches(0.5), Inches(4.7), Inches(12), Inches(0.6),
             "Sàn thương mại điện tử C2C thời trang cũ hàng đầu Việt Nam",
             size=20, color=AMBER_HI)
    add_rect(s, Inches(0.5), Inches(5.5), Inches(2.0), Inches(0.05), TERRACOTTA)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — thrift it! là gì?
# ════════════════════════════════════════════════════════════════════════════════
def slide_04_what_is(n, t):
    s = new_slide()
    add_slide_header(s, "thrift it! là gì?", "Sàn C2C kết nối người mua & người bán đồ vintage", n, t)

    # Left — text
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.5), Inches(0.4),
             "Định nghĩa", size=16, bold=True, color=TERRACOTTA)
    add_text(s, Inches(0.5), Inches(1.85), Inches(6.5), Inches(2.6),
             "Sàn thương mại điện tử C2C (Consumer-to-Consumer) "
             "chuyên về thời trang cũ / vintage tại Việt Nam.\n\n"
             "Kết nối trực tiếp giữa:\n"
             "• Người mua — tìm đồ vintage phong cách riêng, giá hợp lý\n"
             "• Người bán — cá nhân hoặc shop thanh lý / ký gửi quần áo cũ",
             size=14, color=ESPRESSO)

    # Sứ mệnh box
    add_rect(s, Inches(0.5), Inches(5.0), Inches(6.5), Inches(1.6),
             SOFT, line_color=TERRACOTTA, line_w=Pt(1.5))
    add_text(s, Inches(0.7), Inches(5.1), Inches(6.1), Inches(0.4),
             "🌿  Sứ mệnh", size=14, bold=True, color=TERRACOTTA)
    add_text(s, Inches(0.7), Inches(5.5), Inches(6.1), Inches(1.0),
             "“Mặc vintage, sống có tâm — Mua và bán đồ cũ, góp phần "
             "giảm thiểu rác thải thời trang.”",
             size=13, color=ESPRESSO)

    # Right — Stats cards
    add_stat_card(s, Inches(7.5), Inches(1.4), Inches(2.5), Inches(1.4),
                  "12.000+", "Sản phẩm", color=TERRACOTTA)
    add_stat_card(s, Inches(10.3), Inches(1.4), Inches(2.5), Inches(1.4),
                  "4.800+", "Người bán", color=COFFEE)
    add_stat_card(s, Inches(7.5), Inches(2.95), Inches(2.5), Inches(1.4),
                  "98%", "Khách hàng hài lòng", color=GREEN)
    add_stat_card(s, Inches(10.3), Inches(2.95), Inches(2.5), Inches(1.4),
                  "5%", "Phí nền tảng", color=BLUE)

    # Bullet features
    add_text(s, Inches(7.5), Inches(4.6), Inches(5.4), Inches(0.4),
             "Tính năng nổi bật", size=14, bold=True, color=TERRACOTTA)
    add_bullets(s, Inches(7.5), Inches(5.0), Inches(5.4), Inches(2.0),
                ["AI Smart Search — tìm kiếm ngữ nghĩa",
                 "Sổ địa chỉ CAS — 2 cấp hành chính",
                 "Thanh toán COD — không cần cổng phức tạp",
                 "Theo dõi vận đơn GHTK realtime"],
                size=12, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — Tech & security
# ════════════════════════════════════════════════════════════════════════════════
def slide_05_tech(n, t):
    s = new_slide()
    add_slide_header(s, "Công nghệ & Bảo mật", "Stack hiện đại, bảo mật chuẩn ngân hàng", n, t)

    # Three columns: FE / BE / Tích hợp
    col_w = Inches(4.0)
    col_y = Inches(1.55)
    col_h = Inches(5.3)

    cols = [
        ("Frontend", TERRACOTTA, [
            "React + TypeScript (Vite)",
            "Tailwind CSS + theme vintage",
            "React Router v6",
            "HTTP client với JWT interceptor",
            "State: React hooks + localStorage",
        ]),
        ("Backend", COFFEE, [
            "Express + TypeScript",
            "MongoDB Atlas (Mongoose ODM)",
            "JWT (HS256) + bcrypt",
            "Order State Machine 11 bước",
            "Audit trail toàn bộ lịch sử",
        ]),
        ("Tích hợp bên thứ 3", AMBER_HI if False else GREEN, [
            "CAS Address Kit (Tỉnh/Phường/Xã)",
            "GHTK — Vận chuyển Giao Hàng Tiết Kiệm",
            "AI Search — semantic search",
            "AI Analyze Listing — gợi ý giá",
            "Ledger — kế toán double-entry",
        ]),
    ]
    for i, (title, color, items) in enumerate(cols):
        x = Inches(0.5) + (col_w + Inches(0.25)) * i
        add_rect(s, x, col_y, col_w, col_h, WHITE,
                 line_color=MUTED, line_w=Pt(1))
        add_rect(s, x, col_y, col_w, Inches(0.6), color)
        add_text(s, x, col_y, col_w, Inches(0.6),
                 title, size=18, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_bullets(s, x + Inches(0.1), col_y + Inches(0.75),
                    col_w - Inches(0.2), col_h - Inches(0.9),
                    items, size=12, color=ESPRESSO, bullet_color=color)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — Section divider: Bắt đầu nhanh
# ════════════════════════════════════════════════════════════════════════════════
def slide_06_section_getting_started(n, t):
    s = new_slide(light=False)
    add_text(s, Inches(0.5), Inches(2.5), Inches(12), Inches(0.5),
             "PHẦN 2", size=18, color=AMBER_HI, bold=True)
    add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(1.5),
             "Bắt đầu nhanh", size=54, color=LINEN, bold=True)
    add_text(s, Inches(0.5), Inches(4.7), Inches(12), Inches(0.6),
             "Đăng ký, đăng nhập, tài khoản demo", size=20, color=AMBER_HI)
    add_rect(s, Inches(0.5), Inches(5.5), Inches(2.0), Inches(0.05), TERRACOTTA)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — Đăng ký / Đăng nhập
# ════════════════════════════════════════════════════════════════════════════════
def slide_07_register(n, t):
    s = new_slide()
    add_slide_header(s, "Đăng ký tài khoản", "Bắt đầu hành trình mua sắm vintage", n, t)

    # Left: Steps
    add_text(s, Inches(0.5), Inches(1.4), Inches(7), Inches(0.4),
             "Các bước đăng ký", size=16, bold=True, color=TERRACOTTA)
    steps = [
        "Truy cập trang chủ → nhấn “Đăng ký tài khoản mới” (góc phải trên)",
        "Điền: Họ tên, Email, Số điện thoại (10 số), Mật khẩu (≥ 6 ký tự), Xác nhận mật khẩu",
        "Nhấn “Đăng Ký”",
        "Hệ thống tự động đăng nhập & chuyển về Trang chủ",
    ]
    y = Inches(1.9)
    for i, st in enumerate(steps):
        badge = s.shapes.add_shape(MSO_SHAPE.OVAL,
                                   Inches(0.6), y, Inches(0.5), Inches(0.5))
        badge.fill.solid()
        badge.fill.fore_color.rgb = TERRACOTTA
        badge.line.fill.background()
        badge.shadow.inherit = False
        add_text(s, Inches(0.6), y, Inches(0.5), Inches(0.5),
                 str(i + 1), size=18, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, Inches(1.25), y, Inches(6.5), Inches(0.7),
                 st, size=13, color=ESPRESSO, anchor=MSO_ANCHOR.MIDDLE)
        y += Inches(0.8)

    # Right: Login info
    add_rect(s, Inches(8.2), Inches(1.4), Inches(4.7), Inches(5.5),
             SOFT, line_color=MUTED, line_w=Pt(1))
    add_rect(s, Inches(8.2), Inches(1.4), Inches(4.7), Inches(0.55), COFFEE)
    add_text(s, Inches(8.2), Inches(1.4), Inches(4.7), Inches(0.55),
             "Đăng nhập", size=16, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    add_text(s, Inches(8.4), Inches(2.1), Inches(4.4), Inches(0.4),
             "Nhập Email + Mật khẩu → Enter hoặc bấm nút",
             size=12, color=ESPRESSO)
    add_text(s, Inches(8.4), Inches(2.6), Inches(4.4), Inches(0.4),
             "Hệ thống tự động:", size=12, bold=True, color=TERRACOTTA)
    add_bullets(s, Inches(8.4), Inches(3.0), Inches(4.4), Inches(2.5),
                ["Lưu JWT token vào localStorage",
                 "Gộp giỏ hàng tạm vào tài khoản",
                 "Admin → chuyển Bảng quản trị",
                 "Buyer/Seller → về Trang chủ"],
                size=12, color=ESPRESSO, bullet_color=TERRACOTTA)
    add_text(s, Inches(8.4), Inches(6.4), Inches(4.4), Inches(0.4),
             "Đăng xuất: Tài khoản → Đăng xuất (nút đỏ)",
             size=11, color=COFFEE, bold=True)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 8 — Demo accounts table
# ════════════════════════════════════════════════════════════════════════════════
def slide_08_demo_accounts(n, t):
    s = new_slide()
    add_slide_header(s, "Tài khoản Demo", "Dành cho môi trường dev / test", n, t)

    add_text(s, Inches(0.5), Inches(1.4), Inches(12), Inches(0.4),
             "Các tài khoản có sẵn trong seed data", size=14, bold=True, color=TERRACOTTA)

    # Table
    headers = ["Vai trò", "Email", "Mật khẩu"]
    rows = [
        ("🛒  Buyer",   "linh.nguyen@gmail.com",     "123456"),
        ("🏪  Seller",  "shop.minhtu@thriftit.vn",   "shop123"),
        ("🎯  Demo",    "demo@thriftit.vn",          "demo123"),
        ("🛡️  Admin",   "admin@thriftit.vn",         "admin"),
    ]
    table_y = Inches(2.0)
    table_x = Inches(0.5)
    table_w = Inches(12.3)
    row_h = Inches(0.7)

    # Header row
    add_rect(s, table_x, table_y, table_w, row_h, COFFEE)
    col_widths = [Inches(3.0), Inches(5.8), Inches(3.5)]
    col_x = table_x
    for i, h in enumerate(headers):
        add_text(s, col_x + Inches(0.2), table_y, col_widths[i], row_h,
                 h, size=15, bold=True, color=WHITE,
                 anchor=MSO_ANCHOR.MIDDLE)
        col_x += col_widths[i]

    # Data rows
    y = table_y + row_h
    for ri, row in enumerate(rows):
        bg = LINEN if ri % 2 == 0 else WHITE
        add_rect(s, table_x, y, table_w, row_h, bg,
                 line_color=MUTED, line_w=Pt(0.5))
        col_x = table_x
        for ci, val in enumerate(row):
            color = ESPRESSO
            bold = (ci == 0)
            size = 14
            if ci == 2:  # password column -> monospace feel
                color = TERRACOTTA
                bold = True
            add_text(s, col_x + Inches(0.2), y, col_widths[ci], row_h,
                     val, size=size, bold=bold, color=color,
                     anchor=MSO_ANCHOR.MIDDLE, font="Consolas" if ci == 2 else "Calibri")
            col_x += col_widths[ci]
        y += row_h

    # Warning box
    warn_y = y + Inches(0.3)
    add_rect(s, Inches(0.5), warn_y, Inches(12.3), Inches(0.9),
             RGBColor(0xFD, 0xED, 0xEC), line_color=RED, line_w=Pt(1.5))
    add_text(s, Inches(0.7), warn_y + Inches(0.05), Inches(12), Inches(0.4),
             "⚠️  Lưu ý bảo mật", size=13, bold=True, color=RED)
    add_text(s, Inches(0.7), warn_y + Inches(0.4), Inches(12), Inches(0.4),
             "KHÔNG sử dụng các tài khoản demo này cho mục đích thật. "
             "Chỉ dùng để trải nghiệm / test trên môi trường dev.",
             size=12, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 9 — Section divider: Buyer
# ════════════════════════════════════════════════════════════════════════════════
def slide_09_section_buyer(n, t):
    s = new_slide(light=False)
    add_text(s, Inches(0.5), Inches(2.5), Inches(12), Inches(0.5),
             "PHẦN 3", size=18, color=AMBER_HI, bold=True)
    add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(1.5),
             "Hướng dẫn cho Người mua", size=54, color=LINEN, bold=True)
    add_text(s, Inches(0.5), Inches(4.7), Inches(12), Inches(0.6),
             "Khám phá sản phẩm · Đặt hàng · Theo dõi vận đơn · Đánh giá",
             size=20, color=AMBER_HI)
    add_rect(s, Inches(0.5), Inches(5.5), Inches(2.0), Inches(0.05), TERRACOTTA)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 10 — Buyer overview: các trang
# ════════════════════════════════════════════════════════════════════════════════
def slide_10_buyer_pages(n, t):
    s = new_slide()
    add_slide_header(s, "Các trang người mua hay dùng", "Tổng quan 8 trang chính", n, t)

    pages = [
        ("/", "Trang chủ", "Khám phá sản phẩm, danh mục, shop nổi bật"),
        ("/products", "Tìm kiếm", "Tìm & lọc theo danh mục, size, giá…"),
        ("/products/:id", "Chi tiết SP", "Ảnh, mô tả, shop bán, đánh giá"),
        ("/sellers/:handle", "Trang Shop", "Toàn bộ SP + đánh giá của 1 shop"),
        ("/cart", "Giỏ hàng", "Quản lý SP đã chọn, áp mã giảm giá"),
        ("/checkout", "Thanh toán", "Nhập địa chỉ, đặt hàng COD"),
        ("/account", "Tài khoản", "Đơn mua, sổ địa chỉ, tin nhắn"),
        ("/notifications", "Thông báo", "Trạng thái đơn, tin từ shop"),
    ]
    # 4x2 grid
    cols = 4
    cw = Inches(3.0)
    ch = Inches(2.6)
    gx = Inches(0.45)
    gy = Inches(1.45)
    gap_x = Inches(0.15)
    gap_y = Inches(0.2)

    for i, (path, name, desc) in enumerate(pages):
        r = i // cols
        c = i % cols
        x = gx + (cw + gap_x) * c
        y = gy + (ch + gap_y) * r

        add_rect(s, x, y, cw, ch, WHITE, line_color=MUTED, line_w=Pt(1))
        add_rect(s, x, y, cw, Inches(0.45), TERRACOTTA)
        add_text(s, x, y, cw, Inches(0.45), name,
                 size=14, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x + Inches(0.1), y + Inches(0.5), cw - Inches(0.2),
                 Inches(0.35), path, size=11, color=COFFEE, bold=True,
                 font="Consolas")
        add_text(s, x + Inches(0.1), y + Inches(0.95), cw - Inches(0.2),
                 ch - Inches(1.1), desc, size=12, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 11 — Trang chủ
# ════════════════════════════════════════════════════════════════════════════════
def slide_11_home(n, t):
    s = new_slide()
    add_slide_header(s, "Trang chủ — Khám phá", "URL: /", n, t)

    # Top: hero
    add_rect(s, Inches(0.5), Inches(1.4), Inches(12.3), Inches(1.6),
             ESPRESSO)
    add_text(s, Inches(0.7), Inches(1.5), Inches(11), Inches(0.7),
             "Mặc vintage, sống có tâm 🌿",
             size=24, bold=True, color=LINEN, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(0.7), Inches(2.15), Inches(11), Inches(0.4),
             "Mua và bán đồ cũ — góp phần giảm thiểu rác thải thời trang",
             size=14, color=AMBER_HI)
    # CTA buttons
    add_rect(s, Inches(0.7), Inches(2.55), Inches(1.8), Inches(0.35),
             TERRACOTTA)
    add_text(s, Inches(0.7), Inches(2.55), Inches(1.8), Inches(0.35),
             "Khám phá ngay", size=11, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    # Categories row
    add_text(s, Inches(0.5), Inches(3.2), Inches(6), Inches(0.4),
             "Danh mục nổi bật (6 ô)", size=14, bold=True, color=TERRACOTTA)
    cats = ["✨ Tất cả", "👕 Áo", "👖 Quần", "👗 Váy", "🧥 Áo khoác", "🧣 Phụ kiện"]
    cw = Inches(2.0)
    for i, c in enumerate(cats):
        x = Inches(0.5) + (cw + Inches(0.07)) * i
        add_rect(s, x, Inches(3.65), cw, Inches(1.1),
                 WHITE, line_color=MUTED, line_w=Pt(1))
        add_text(s, x, Inches(3.7), cw, Inches(0.5),
                 c.split(" ")[0], size=22, align=PP_ALIGN.CENTER,
                 anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x, Inches(4.25), cw, Inches(0.4),
                 " ".join(c.split(" ")[1:]), size=11, color=ESPRESSO,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    # Sections
    add_text(s, Inches(0.5), Inches(5.1), Inches(6), Inches(0.4),
             "Sản phẩm mới", size=14, bold=True, color=TERRACOTTA)
    add_text(s, Inches(0.5), Inches(5.55), Inches(12), Inches(0.4),
             "Grid responsive 2 → 6 cột, hiển thị tất cả sản phẩm đang active.",
             size=12, color=ESPRESSO)

    add_text(s, Inches(0.5), Inches(6.1), Inches(6), Inches(0.4),
             "Gợi ý Shop", size=14, bold=True, color=TERRACOTTA)
    add_text(s, Inches(0.5), Inches(6.55), Inches(12), Inches(0.4),
             "Các shop được đánh giá cao trong cộng đồng.",
             size=12, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 12 — Tìm kiếm + Bộ lọc
# ════════════════════════════════════════════════════════════════════════════════
def slide_12_search_filter(n, t):
    s = new_slide()
    add_slide_header(s, "Tìm kiếm & Bộ lọc", "URL: /products  ·  3 chế độ: Text, AI, Lọc", n, t)

    # 3 search modes
    modes = [
        ("🔍  Tìm bằng từ khóa",
         TERRACOTTA,
         ["Ô search trên Header (luôn hiển thị)",
          "Tìm theo tên / danh mục / tên shop",
          "Nhấn Enter để submit"]),
        ("🤖  AI Smart Search",
         COFFEE,
         ["Bật toggle 'AI' trong Filter Sidebar",
          "Gõ câu mô tả tự nhiên",
          "VD: 'áo dạ retro cho mùa thu'",
          "AI phân tích ngữ nghĩa — ~600 ms"]),
        ("⚙️  Bộ lọc nâng cao",
         GREEN,
         ["Danh mục: Áo / Quần / Váy / Áo khoác / Phụ kiện",
          "Size: XS, S, M, L, XL, XXL",
          "Khoảng giá: Từ ₫ → Đến ₫",
          "Độ mới: 30% – 100% (slider)",
          "Đánh giá shop: ⭐ 4+ / 4.5+ trở lên"]),
    ]
    cw = Inches(4.0)
    cy = Inches(1.55)
    ch = Inches(5.0)
    for i, (title, color, items) in enumerate(modes):
        x = Inches(0.5) + (cw + Inches(0.15)) * i
        add_rect(s, x, cy, cw, ch, WHITE, line_color=MUTED, line_w=Pt(1))
        add_rect(s, x, cy, cw, Inches(0.55), color)
        add_text(s, x, cy, cw, Inches(0.55), title,
                 size=15, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_bullets(s, x + Inches(0.15), cy + Inches(0.7),
                    cw - Inches(0.3), ch - Inches(0.85),
                    items, size=12, color=ESPRESSO, bullet_color=color)

    # Sort row
    add_text(s, Inches(0.5), Inches(6.7), Inches(12), Inches(0.3),
             "Sắp xếp:", size=12, bold=True, color=TERRACOTTA)
    add_text(s, Inches(1.5), Inches(6.7), Inches(11.5), Inches(0.3),
             "Mới nhất (mặc định)  ·  Giá tăng/giảm  ·  Độ mới cao nhất  ·  Nổi bật nhất",
             size=12, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 13 — Chi tiết sản phẩm
# ════════════════════════════════════════════════════════════════════════════════
def slide_13_product_detail(n, t):
    s = new_slide()
    add_slide_header(s, "Chi tiết sản phẩm", "URL: /products/:id", n, t)

    # Left — gallery mock
    add_rect(s, Inches(0.5), Inches(1.4), Inches(5.0), Inches(5.5),
             WHITE, line_color=MUTED, line_w=Pt(1))
    add_rect(s, Inches(0.5), Inches(1.4), Inches(5.0), Inches(3.5), SOFT)
    add_text(s, Inches(0.5), Inches(1.4), Inches(5.0), Inches(3.5),
             "[ Gallery ảnh sản phẩm ]", size=14, color=COFFEE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    # Thumbs
    for i in range(4):
        x = Inches(0.7) + Inches(1.15) * i
        add_rect(s, x, Inches(5.05), Inches(1.0), Inches(1.0),
                 MUTED, line_color=COFFEE, line_w=Pt(0.5))
    add_text(s, Inches(0.5), Inches(6.15), Inches(5.0), Inches(0.4),
             "Mũi tên ← → để chuyển ảnh",
             size=11, color=COFFEE, align=PP_ALIGN.CENTER, bold=True)

    # Right — info mock
    add_rect(s, Inches(5.8), Inches(1.4), Inches(7.0), Inches(5.5),
             WHITE, line_color=MUTED, line_w=Pt(1))
    add_text(s, Inches(6.0), Inches(1.5), Inches(6.5), Inches(0.4),
             "Tên sản phẩm", size=20, bold=True, color=ESPRESSO)
    # Price box
    add_rect(s, Inches(6.0), Inches(2.0), Inches(6.5), Inches(0.9),
             RGBColor(0xFF, 0xF9, 0xF4), line_color=TERRACOTTA, line_w=Pt(1))
    add_text(s, Inches(6.2), Inches(2.05), Inches(6.0), Inches(0.45),
             "₫ 1.500.000", size=26, bold=True, color=TERRACOTTA)
    add_text(s, Inches(6.2), Inches(2.5), Inches(6.0), Inches(0.35),
             "🚚 Giao hàng toàn quốc    🛡️ Bảo vệ 100%",
             size=11, color=ESPRESSO)

    # Attributes grid
    attrs = [("Danh mục", "Áo"), ("Size", "M"), ("Tình trạng", "85% — Rất tốt"), ("Kho", "3 sản phẩm")]
    cw = Inches(3.1)
    for i, (k, v) in enumerate(attrs):
        r = i // 2
        c = i % 2
        x = Inches(6.0) + (cw + Inches(0.1)) * c
        y = Inches(3.05) + Inches(0.85) * r
        add_rect(s, x, y, cw, Inches(0.75), SOFT,
                 line_color=MUTED, line_w=Pt(0.5))
        add_text(s, x + Inches(0.1), y + Inches(0.05), cw, Inches(0.3),
                 k, size=10, color=COFFEE)
        add_text(s, x + Inches(0.1), y + Inches(0.32), cw, Inches(0.4),
                 v, size=13, bold=True, color=ESPRESSO)

    # CTA buttons
    add_rect(s, Inches(6.0), Inches(4.95), Inches(2.0), Inches(0.55),
             RGBColor(0xFF, 0xF4, 0xEB), line_color=TERRACOTTA, line_w=Pt(1.5))
    add_text(s, Inches(6.0), Inches(4.95), Inches(2.0), Inches(0.55),
             "🛒 Thêm vào giỏ", size=12, bold=True, color=TERRACOTTA,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_rect(s, Inches(8.1), Inches(4.95), Inches(2.0), Inches(0.55),
             TERRACOTTA)
    add_text(s, Inches(8.1), Inches(4.95), Inches(2.0), Inches(0.55),
             "Mua ngay", size=12, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_rect(s, Inches(10.2), Inches(4.95), Inches(1.5), Inches(0.55),
             WHITE, line_color=MUTED, line_w=Pt(1))
    add_text(s, Inches(10.2), Inches(4.95), Inches(1.5), Inches(0.55),
             "❤️ Thích", size=12, bold=True, color=ESPRESSO,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    # Trust badges
    add_text(s, Inches(6.0), Inches(5.7), Inches(6.5), Inches(0.3),
             "3 huy hiệu bảo vệ", size=11, bold=True, color=TERRACOTTA)
    add_text(s, Inches(6.0), Inches(6.0), Inches(6.5), Inches(0.4),
             "🛡️ Bảo vệ người mua   ·   🔄 Đổi trả 7 ngày   ·   📦 Đồng kiểm khi nhận",
             size=11, color=ESPRESSO)
    add_text(s, Inches(6.0), Inches(6.45), Inches(6.5), Inches(0.4),
             "+ Card Shop: avatar · rating · số giao dịch · nút Xem Shop + Chat",
             size=11, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 14 — Giỏ hàng
# ════════════════════════════════════════════════════════════════════════════════
def slide_14_cart(n, t):
    s = new_slide()
    add_slide_header(s, "Quản lý Giỏ hàng", "URL: /cart  ·  Lưu trên server, multi-shop", n, t)

    # Left — features
    add_text(s, Inches(0.5), Inches(1.4), Inches(6), Inches(0.4),
             "Cấu trúc giỏ hàng", size=15, bold=True, color=TERRACOTTA)
    add_bullets(s, Inches(0.5), Inches(1.85), Inches(6.0), Inches(2.0),
                ["Chia theo Shop (nhóm @handle)",
                 "Mỗi shop có checkbox riêng",
                 "Có thể mua từ nhiều shop trong 1 lần"],
                size=12, color=ESPRESSO)

    add_text(s, Inches(0.5), Inches(3.6), Inches(6), Inches(0.4),
             "Hành động trên sản phẩm", size=15, bold=True, color=TERRACOTTA)
    add_bullets(s, Inches(0.5), Inches(4.05), Inches(6.0), Inches(2.5),
                ["✅ Chọn mua — tick vào ô vuông",
                 "➕ / ➖ Tăng giảm số lượng — sync lên server",
                 "🗑️ Xóa từng SP hoặc xóa theo nhóm",
                 "🗑️ Xóa SP hết hàng / Xóa đã chọn — nhanh",
                 "⚠️ SP hết hàng hiển thị overlay, không thể chọn"],
                size=12, color=ESPRESSO)

    # Right — Summary box
    add_rect(s, Inches(7.0), Inches(1.4), Inches(5.8), Inches(5.6),
             WHITE, line_color=TERRACOTTA, line_w=Pt(1.5))
    add_rect(s, Inches(7.0), Inches(1.4), Inches(5.8), Inches(0.5), TERRACOTTA)
    add_text(s, Inches(7.0), Inches(1.4), Inches(5.8), Inches(0.5),
             "Tóm tắt đơn hàng", size=14, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    # Promo code
    add_text(s, Inches(7.2), Inches(2.05), Inches(5.4), Inches(0.4),
             "🏷️  Mã giảm giá", size=13, bold=True, color=COFFEE)
    add_text(s, Inches(7.2), Inches(2.45), Inches(5.4), Inches(0.4),
             "THRIFT10  ·  VINTAGE  →  giảm 10% tạm tính",
             size=12, color=ESPRESSO)
    add_text(s, Inches(7.2), Inches(2.8), Inches(5.4), Inches(0.4),
             "FREESHIP — đang phát triển",
             size=12, color=COFFEE)

    # Totals
    add_rect(s, Inches(7.2), Inches(3.4), Inches(5.4), Inches(0.02), MUTED)
    rows = [
        ("Tạm tính (3 SP)",          "₫ 1.500.000"),
        ("Phí vận chuyển (× 2 shop)", "₫ 60.000"),
        ("Giảm giá (10%)",            "−₫ 150.000",  GREEN),
        ("TỔNG THANH TOÁN",           "₫ 1.410.000", TERRACOTTA),
    ]
    y = Inches(3.6)
    for label, val, *rest in rows:
        color = rest[0] if rest else ESPRESSO
        bold = (label.startswith("TỔNG"))
        size_v = 20 if bold else 12
        add_text(s, Inches(7.2), y, Inches(3.5), Inches(0.4),
                 label, size=12, bold=bold, color=ESPRESSO)
        add_text(s, Inches(10.7), y, Inches(2.1), Inches(0.5),
                 val, size=size_v, bold=True, color=color,
                 align=PP_ALIGN.RIGHT)
        y += Inches(0.55)

    # CTA button
    add_rect(s, Inches(7.2), Inches(6.2), Inches(5.4), Inches(0.6),
             TERRACOTTA)
    add_text(s, Inches(7.2), Inches(6.2), Inches(5.4), Inches(0.6),
             "Mua Hàng (3 món)", size=14, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 15 — Thanh toán 3 bước
# ════════════════════════════════════════════════════════════════════════════════
def slide_15_checkout(n, t):
    s = new_slide()
    add_slide_header(s, "Thanh toán (Checkout)", "URL: /checkout  ·  Yêu cầu đăng nhập · 3 bước", n, t)

    # 3 step boxes
    sx_step = Inches(0.5)
    sy = Inches(1.7)
    sw = Inches(4.0)
    sh = Inches(4.5)

    steps = [
        ("Bước 1", "📍  Địa chỉ", TERRACOTTA, [
            "Sổ địa chỉ thông minh (CAS)",
            "Tự động điền nếu đã có",
            "Modal: chọn hoặc thêm mới",
            "Tỉnh → Phường/Xã (2 cấp)",
            "Validation: Tên + SĐT 10-11 số",
            "Địa chỉ chi tiết ≥ 10 ký tự",
        ]),
        ("Bước 2", "📋  Xác nhận đơn", COFFEE, [
            "Danh sách sản phẩm đã chọn",
            "Ảnh + Size × qty + thành tiền",
            "Phương thức: COD",
            "Tổng tiền cuối cùng",
        ]),
        ("Bước 3", "✅  Hoàn tất", GREEN, [
            "Mã đơn: ORD-123456",
            "Thông tin người nhận",
            "Tổng tiền đã thanh toán",
            "2 nút: Xem đơn / Mua tiếp",
        ]),
    ]
    for i, (step, title, color, items) in enumerate(steps):
        x = sx_step + (sw + Inches(0.15)) * i
        add_rect(s, x, sy, sw, sh, WHITE, line_color=color, line_w=Pt(1.5))
        add_rect(s, x, sy, sw, Inches(0.7), color)
        add_text(s, x, sy, sw, Inches(0.7),
                 f"{step}  ·  {title}", size=14, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_bullets(s, x + Inches(0.15), sy + Inches(0.85),
                    sw - Inches(0.3), sh - Inches(1.0),
                    items, size=11, color=ESPRESSO, bullet_color=color)

        if i < 2:
            arr = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,
                                     x + sw + Inches(-0.05), sy + Inches(2.0),
                                     Inches(0.25), Inches(0.4))
            arr.fill.solid()
            arr.fill.fore_color.rgb = TERRACOTTA
            arr.line.fill.background()
            arr.shadow.inherit = False

    # Backend callout
    add_rect(s, Inches(0.5), Inches(6.4), Inches(12.3), Inches(0.65),
             SOFT, line_color=TERRACOTTA, line_w=Pt(1))
    add_text(s, Inches(0.7), Inches(6.45), Inches(12), Inches(0.55),
             "🔧  Backend flow:  POST /api/orders  →  POST /api/payments/checkout  "
             "→  Auto COD → status = CONFIRMED  →  Giỏ hàng tự làm mới",
             size=12, color=ESPRESSO, bold=True,
             anchor=MSO_ANCHOR.MIDDLE)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 16 — Đơn mua (Buyer Dashboard)
# ════════════════════════════════════════════════════════════════════════════════
def slide_16_orders(n, t):
    s = new_slide()
    add_slide_header(s, "Quản lý Đơn mua", "URL: /account  ·  Tab “Đơn mua”", n, t)

    # 5 status tabs as a row
    statuses = [
        ("⏰ Chờ thanh toán", "PENDING_PAYMENT", COFFEE),
        ("📦 Chờ lấy hàng",   "CONFIRMED, PACKING", AMBER_HI if False else TERRACOTTA),
        ("🚚 Đang giao",       "SHIPPING, DELIVERING, DELIVERED", BLUE),
        ("⭐ Đánh giá",        "COMPLETED", GREEN),
        ("❌ Đã hủy",          "CANCEL_REQUESTED, CANCELLED, DISPUTED, REFUNDED", RED),
    ]
    cw = Inches(2.4)
    cy = Inches(1.55)
    for i, (label, sts, color) in enumerate(statuses):
        x = Inches(0.5) + (cw + Inches(0.05)) * i
        add_rect(s, x, cy, cw, Inches(2.3), WHITE,
                 line_color=color, line_w=Pt(2))
        add_rect(s, x, cy, cw, Inches(0.6), color)
        add_text(s, x, cy, cw, Inches(0.6), label,
                 size=12, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x + Inches(0.1), cy + Inches(0.75),
                 cw - Inches(0.2), Inches(1.5),
                 sts, size=10, color=COFFEE,
                 anchor=MSO_ANCHOR.TOP, font="Consolas")

    # Hành động theo trạng thái
    add_text(s, Inches(0.5), Inches(4.1), Inches(12), Inches(0.4),
             "Hành động theo trạng thái", size=14, bold=True, color=TERRACOTTA)
    actions = [
        ("Chờ thanh toán:", "“Tiếp tục thanh toán” — thử lại qua cổng"),
        ("Chờ lấy hàng:", "Xem thông tin vận đơn (mã GHTK, trạng thái, dự kiến giao) + nút Yêu cầu hủy"),
        ("Đang giao:", "“Xác nhận đã nhận” → chuyển COMPLETED (qua DELIVERED)"),
        ("Đánh giá:", "Modal 1–5 sao + nhận xét ≤ 500 ký tự"),
        ("Đã hủy:", "Hiển thị trạng thái cuối — không thể khôi phục"),
    ]
    y = Inches(4.55)
    for label, body in actions:
        add_text(s, Inches(0.5), y, Inches(2.4), Inches(0.4),
                 label, size=12, bold=True, color=TERRACOTTA)
        add_text(s, Inches(3.0), y, Inches(9.8), Inches(0.4),
                 body, size=12, color=ESPRESSO)
        y += Inches(0.45)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 17 — Sổ địa chỉ + Đánh giá
# ════════════════════════════════════════════════════════════════════════════════
def slide_17_address_review(n, t):
    s = new_slide()
    add_slide_header(s, "Sổ địa chỉ & Đánh giá", "Quản lý địa chỉ giao hàng + đánh giá sản phẩm", n, t)

    # Left — Address book
    add_rect(s, Inches(0.5), Inches(1.4), Inches(6.0), Inches(5.6),
             WHITE, line_color=MUTED, line_w=Pt(1))
    add_rect(s, Inches(0.5), Inches(1.4), Inches(6.0), Inches(0.5), TERRACOTTA)
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.0), Inches(0.5),
             "📍  Sổ địa chỉ nhận hàng", size=14, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    addr_features = [
        "Thêm/Sửa/Xóa địa chỉ đầy đủ",
        "Đặt địa chỉ mặc định",
        "CAS Address Kit — 2 cấp hành chính: Tỉnh → Phường/Xã",
        "Sau sáp nhập: KHÔNG còn Quận/Huyện",
        "Đồng bộ với form Thanh toán & Kho hàng của Seller",
    ]
    add_bullets(s, Inches(0.7), Inches(2.05), Inches(5.6), Inches(4.5),
                addr_features, size=12, color=ESPRESSO)

    # Right — Review
    add_rect(s, Inches(6.8), Inches(1.4), Inches(6.0), Inches(5.6),
             WHITE, line_color=MUTED, line_w=Pt(1))
    add_rect(s, Inches(6.8), Inches(1.4), Inches(6.0), Inches(0.5), GREEN)
    add_text(s, Inches(6.8), Inches(1.4), Inches(6.0), Inches(0.5),
             "⭐  Đánh giá sản phẩm", size=14, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    add_text(s, Inches(7.0), Inches(2.05), Inches(5.6), Inches(0.4),
             "Mở từ tab Đánh giá khi đơn ở trạng thái COMPLETED.",
             size=12, color=ESPRESSO)
    rating_labels = [
        "⭐ 1 — Không hài lòng",
        "⭐⭐ 2 — Chưa hài lòng",
        "⭐⭐⭐ 3 — Bình thường",
        "⭐⭐⭐⭐ 4 — Hài lòng",
        "⭐⭐⭐⭐⭐ 5 — Rất hài lòng",
    ]
    add_bullets(s, Inches(7.0), Inches(2.5), Inches(5.6), Inches(2.0),
                rating_labels, size=12, color=ESPRESSO, bullet_color=GREEN)
    add_text(s, Inches(7.0), Inches(4.7), Inches(5.6), Inches(0.4),
             "Nhận xét ≤ 500 ký tự",
             size=12, color=COFFEE)
    add_rect(s, Inches(7.0), Inches(5.2), Inches(5.6), Inches(1.5),
             RGBColor(0xFD, 0xED, 0xEC), line_color=RED, line_w=Pt(1))
    add_text(s, Inches(7.1), Inches(5.3), Inches(5.4), Inches(0.4),
             "⚠️  Mỗi đơn chỉ đánh giá 1 lần",
             size=12, bold=True, color=RED)
    add_text(s, Inches(7.1), Inches(5.7), Inches(5.4), Inches(0.9),
             "Không thể sửa sau khi gửi. Hệ thống chống trùng lặp review.",
             size=11, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 18 — Section divider: Seller
# ════════════════════════════════════════════════════════════════════════════════
def slide_18_section_seller(n, t):
    s = new_slide(light=False)
    add_text(s, Inches(0.5), Inches(2.5), Inches(12), Inches(0.5),
             "PHẦN 4", size=18, color=AMBER_HI, bold=True)
    add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(1.5),
             "Hướng dẫn cho Người bán", size=54, color=LINEN, bold=True)
    add_text(s, Inches(0.5), Inches(4.7), Inches(12), Inches(0.6),
             "Đăng ký Shop · Đăng bán · Quản lý đơn · Tạo vận đơn",
             size=20, color=AMBER_HI)
    add_rect(s, Inches(0.5), Inches(5.5), Inches(2.0), Inches(0.05), TERRACOTTA)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 19 — Đăng ký Shop + 4 trạng thái
# ════════════════════════════════════════════════════════════════════════════════
def slide_19_register_shop(n, t):
    s = new_slide()
    add_slide_header(s, "Đăng ký Shop & Trạng thái", "URL: /seller/apply", n, t)

    # Left — form fields
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.5), Inches(0.4),
             "Form đăng ký Shop", size=15, bold=True, color=TERRACOTTA)
    add_bullets(s, Inches(0.5), Inches(1.85), Inches(6.5), Inches(3.0),
                ["Tên Shop  *  (≥ 3 ký tự, ≤ 100)",
                 "Tên định danh @handle  *  (3-30 ký tự: a-z, 0-9, ., _)",
                 "Giới thiệu Shop  (tùy chọn)",
                 "Gửi đơn → chờ Admin duyệt"],
                size=12, color=ESPRESSO)

    add_text(s, Inches(0.5), Inches(5.0), Inches(6.5), Inches(0.4),
             "Quy tắc handle", size=14, bold=True, color=TERRACOTTA)
    add_text(s, Inches(0.5), Inches(5.4), Inches(6.5), Inches(1.6),
             "• Chữ thường không dấu (a-z)\n"
             "• Số (0-9)\n"
             "• Dấu chấm (.) và gạch dưới (_)\n"
             "• Hệ thống tự gợi ý từ tên Shop (có thể sửa)",
             size=11, color=ESPRESSO, font="Consolas")

    # Right — 4 status cards
    statuses = [
        ("NONE", "Mặc định", "Mới đăng ký tk", COFFEE),
        ("PENDING", "Chờ duyệt", "Đã nộp hồ sơ", TERRACOTTA),
        ("APPROVED", "Đã duyệt ✅", "Có thể đăng bán", GREEN),
        ("REJECTED", "Bị từ chối", "Có thể nộp lại", RED),
    ]
    cw = Inches(2.9)
    cy = Inches(1.55)
    for i, (code, label, desc, color) in enumerate(statuses):
        r = i // 2
        c = i % 2
        x = Inches(7.4) + (cw + Inches(0.15)) * c
        y = cy + Inches(2.4) * r
        add_rect(s, x, y, cw, Inches(2.2), WHITE, line_color=color, line_w=Pt(1.5))
        add_rect(s, x, y, cw, Inches(0.5), color)
        add_text(s, x, y, cw, Inches(0.5),
                 code, size=12, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font="Consolas")
        add_text(s, x + Inches(0.1), y + Inches(0.6), cw - Inches(0.2),
                 Inches(0.5), label, size=15, bold=True, color=ESPRESSO)
        add_text(s, x + Inches(0.1), y + Inches(1.05), cw - Inches(0.2),
                 Inches(1.0), desc, size=11, color=COFFEE)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 20 — Đăng bán sản phẩm
# ════════════════════════════════════════════════════════════════════════════════
def slide_20_post_product(n, t):
    s = new_slide()
    add_slide_header(s, "Đăng bán sản phẩm", "URL: /sell  ·  Yêu cầu APPROVED", n, t)

    # Left — process steps
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.5), Inches(0.4),
             "Quy trình đăng bán", size=15, bold=True, color=TERRACOTTA)
    steps = [
        "Upload ảnh (tối đa 6, ảnh đầu = ảnh bìa, auto nén 800×800)",
        "Điền: Tên (5–100), Danh mục, Mô tả (≤ 2000), Giá (> 0), Số lượng (≥ 1)",
        "Chọn Size (XS-XXL) & Độ mới (30–100%)",
        "(Tùy chọn) Bấm “AI gợi ý giá & loại” — AI phân tích tên + ảnh",
        "Modal “Kiểm tra sản phẩm” → nhấn “Gửi duyệt 🌿”",
        "Sản phẩm ở trạng thái pending — chờ Admin duyệt",
    ]
    y = Inches(1.85)
    for i, st in enumerate(steps):
        badge = s.shapes.add_shape(MSO_SHAPE.OVAL,
                                   Inches(0.5), y, Inches(0.4), Inches(0.4))
        badge.fill.solid()
        badge.fill.fore_color.rgb = TERRACOTTA
        badge.line.fill.background()
        badge.shadow.inherit = False
        add_text(s, Inches(0.5), y, Inches(0.4), Inches(0.4),
                 str(i + 1), size=14, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, Inches(1.05), y - Inches(0.05), Inches(5.8), Inches(0.6),
                 st, size=11, color=ESPRESSO, anchor=MSO_ANCHOR.MIDDLE)
        y += Inches(0.7)

    # Right — Tips & fees
    add_rect(s, Inches(7.4), Inches(1.4), Inches(5.4), Inches(2.4),
             RGBColor(0xFF, 0xF9, 0xF0), line_color=TERRACOTTA, line_w=Pt(1))
    add_text(s, Inches(7.6), Inches(1.5), Inches(5.0), Inches(0.4),
             "💡  Mẹo chụp ảnh bán nhanh", size=13, bold=True, color=TERRACOTTA)
    add_bullets(s, Inches(7.6), Inches(1.95), Inches(5.0), Inches(1.7),
                ["Ánh sáng tự nhiên — màu thật",
                 "Nhiều góc: trước, sau, cổ, tay, chi tiết",
                 "Đặt phẳng hoặc trên mannequin",
                 "Ảnh rõ nét bán nhanh gấp 3 lần"],
                size=11, color=ESPRESSO, bullet_color=TERRACOTTA)

    # Fees box
    add_rect(s, Inches(7.4), Inches(4.0), Inches(5.4), Inches(2.6),
             SOFT, line_color=COFFEE, line_w=Pt(1))
    add_text(s, Inches(7.6), Inches(4.1), Inches(5.0), Inches(0.4),
             "💰  Phí nền tảng", size=13, bold=True, color=COFFEE)
    add_text(s, Inches(7.6), Inches(4.55), Inches(5.0), Inches(0.5),
             "5% trên giá bán", size=22, bold=True, color=TERRACOTTA)
    add_text(s, Inches(7.6), Inches(5.1), Inches(5.0), Inches(0.4),
             "VD: Nhập giá 200.000₫ → Thực nhận 190.000₫",
             size=11, color=ESPRESSO)
    add_text(s, Inches(7.6), Inches(5.55), Inches(5.0), Inches(0.4),
             "Chỉ tính khi đơn COMPLETED thành công.",
             size=11, color=ESPRESSO)
    add_text(s, Inches(7.6), Inches(6.0), Inches(5.0), Inches(0.4),
             "🤖  AI: gợi ý giá, danh mục, tags tự động",
             size=11, bold=True, color=TERRACOTTA)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 21 — Quản lý Shop + 5 tab
# ════════════════════════════════════════════════════════════════════════════════
def slide_21_shop_management(n, t):
    s = new_slide()
    add_slide_header(s, "Quản lý Shop", "URL: /account  ·  Tab \"Kinh doanh\"", n, t)

    # 5 tabs
    tabs = [
        ("🏪 Tất cả", "Mọi trạng thái", TERRACOTTA),
        ("🟢 Đang bán", "active", GREEN),
        ("🟡 Chờ duyệt", "pending", AMBER_HI if False else COFFEE),
        ("🔵 Đã bán", "sold", BLUE),
        ("⭐ Đánh giá", "Tổng hợp rating", TERRACOTTA),
    ]
    cw = Inches(2.4)
    cy = Inches(1.55)
    for i, (label, sts, color) in enumerate(tabs):
        x = Inches(0.5) + (cw + Inches(0.05)) * i
        add_rect(s, x, cy, cw, Inches(1.5), WHITE, line_color=color, line_w=Pt(1.5))
        add_rect(s, x, cy, cw, Inches(0.45), color)
        add_text(s, x, cy, cw, Inches(0.45), label,
                 size=12, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x, cy + Inches(0.55), cw, Inches(0.9),
                 sts, size=11, color=COFFEE, align=PP_ALIGN.CENTER,
                 anchor=MSO_ANCHOR.MIDDLE)

    # KPI cards
    add_text(s, Inches(0.5), Inches(3.4), Inches(12), Inches(0.4),
             "Thống kê tổng quan (KPI)", size=15, bold=True, color=TERRACOTTA)
    kpis = [
        ("📦 Tổng SP", "—"),
        ("🟢 Đang bán", "—"),
        ("🟡 Chờ duyệt", "—"),
        ("🔵 Đã bán", "—"),
        ("👁️ Tổng view", "—"),
        ("❤️ Tổng like", "—"),
        ("💰 Doanh thu", "—"),
    ]
    cw2 = Inches(1.7)
    cy2 = Inches(3.85)
    for i, (lbl, val) in enumerate(kpis):
        x = Inches(0.5) + (cw2 + Inches(0.05)) * i
        add_rect(s, x, cy2, cw2, Inches(1.4), WHITE,
                 line_color=MUTED, line_w=Pt(0.75))
        add_text(s, x, cy2 + Inches(0.1), cw2, Inches(0.6),
                 lbl.split(" ")[0], size=20, align=PP_ALIGN.CENTER,
                 anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x, cy2 + Inches(0.65), cw2, Inches(0.3),
                 " ".join(lbl.split(" ")[1:]), size=10, color=COFFEE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x, cy2 + Inches(0.95), cw2, Inches(0.4),
                 "Số liệu", size=14, bold=True, color=TERRACOTTA,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    # Action
    add_rect(s, Inches(0.5), Inches(5.5), Inches(12.3), Inches(1.5),
             SOFT, line_color=COFFEE, line_w=Pt(1))
    add_text(s, Inches(0.7), Inches(5.6), Inches(12), Inches(0.4),
             "Hành động trên sản phẩm", size=13, bold=True, color=COFFEE)
    add_text(s, Inches(0.7), Inches(6.0), Inches(12), Inches(0.4),
             "✏️  Sửa thông tin  ·  🗃️  Lưu trữ (archive, giữ lịch sử)  "
             "·  📊  Xem chi tiết (view, like, đánh giá)",
             size=12, color=ESPRESSO)
    add_text(s, Inches(0.7), Inches(6.45), Inches(12), Inches(0.4),
             "⚠️  Nguyên tắc: KHÔNG xóa sản phẩm có đơn phụ thuộc — dùng archive.",
             size=11, color=RED, bold=True)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 22 — Vận đơn & Kho hàng
# ════════════════════════════════════════════════════════════════════════════════
def slide_22_shipment(n, t):
    s = new_slide()
    add_slide_header(s, "Tạo vận đơn & Kho hàng", "URL: /account · Bước quan trọng trong xử lý đơn", n, t)

    # Left — Shipment flow
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.2), Inches(0.4),
             "🚚  Tạo vận đơn (Shipment)", size=15, bold=True, color=TERRACOTTA)
    flow = [
        "Khi đơn CONFIRMED / PACKING → nhấn Tạo vận đơn",
        "Dialog hiện ra với fields: Tên shop, SĐT, địa chỉ lấy hàng, Phường/Xã, Tỉnh/Thành",
        "Tự động điền từ Kho hàng (nếu đã thiết lập)",
        "Bấm “Tạo vận đơn” → tạo mã GHTK + tracking URL + timeline",
        "Đơn chuyển SHIPPING",
    ]
    add_bullets(s, Inches(0.5), Inches(1.85), Inches(6.2), Inches(3.5),
                flow, size=11, color=ESPRESSO)

    # Shipment statuses
    add_text(s, Inches(0.5), Inches(5.5), Inches(6.2), Inches(0.4),
             "Trạng thái vận đơn", size=13, bold=True, color=TERRACOTTA)
    add_text(s, Inches(0.5), Inches(5.9), Inches(6.2), Inches(1.2),
             "PENDING → CREATED → PICKED_UP → IN_TRANSIT → DELIVERING → DELIVERED\n"
             "RETURNED · CANCELLED · FAILED",
             size=11, color=ESPRESSO, font="Consolas")

    # Right — Kho hàng
    add_rect(s, Inches(7.0), Inches(1.4), Inches(5.8), Inches(5.6),
             WHITE, line_color=GREEN, line_w=Pt(1.5))
    add_rect(s, Inches(7.0), Inches(1.4), Inches(5.8), Inches(0.5), GREEN)
    add_text(s, Inches(7.0), Inches(1.4), Inches(5.8), Inches(0.5),
             "📦  Kho hàng (Pickup Address)", size=14, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    add_text(s, Inches(7.2), Inches(2.05), Inches(5.4), Inches(0.4),
             "Tại sao cần thiết lập?", size=13, bold=True, color=GREEN)
    add_bullets(s, Inches(7.2), Inches(2.45), Inches(5.4), Inches(2.0),
                ["Đơn vị vận chuyển cần địa chỉ cố định",
                 "Đã có kho → tự động điền vào dialog",
                 "Chưa có kho → phải nhập tay mỗi đơn"],
                size=11, color=ESPRESSO)

    add_text(s, Inches(7.2), Inches(4.55), Inches(5.4), Inches(0.4),
             "Thiết lập lần đầu", size=13, bold=True, color=GREEN)
    add_bullets(s, Inches(7.2), Inches(4.95), Inches(5.4), Inches(2.0),
                ["Tên kho / người bàn giao",
                 "SĐT (10–11 chữ số)",
                 "Tỉnh/Thành → Phường/Xã (CAS)",
                 "Số nhà, tên đường",
                 "Lưu với type = warehouse"],
                size=11, color=ESPRESSO)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 23 — Section divider: Admin
# ════════════════════════════════════════════════════════════════════════════════
def slide_23_section_admin(n, t):
    s = new_slide(light=False)
    add_text(s, Inches(0.5), Inches(2.5), Inches(12), Inches(0.5),
             "PHẦN 5", size=18, color=AMBER_HI, bold=True)
    add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(1.5),
             "Hướng dẫn cho Quản trị viên", size=54, color=LINEN, bold=True)
    add_text(s, Inches(0.5), Inches(4.7), Inches(12), Inches(0.6),
             "Bảng quản trị · Duyệt bài · Duyệt Shop · Quản lý user",
             size=20, color=AMBER_HI)
    add_rect(s, Inches(0.5), Inches(5.5), Inches(2.0), Inches(0.05), TERRACOTTA)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 24 — Admin đăng nhập + 4 tab
# ════════════════════════════════════════════════════════════════════════════════
def slide_24_admin_login(n, t):
    s = new_slide()
    add_slide_header(s, "Admin đăng nhập & 4 Tab", "URL: /admin  ·  Sau đăng nhập auto-redirect", n, t)

    # Left — login
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.0), Inches(0.4),
             "Đăng nhập Admin", size=15, bold=True, color=TERRACOTTA)
    add_rect(s, Inches(0.5), Inches(1.9), Inches(6.0), Inches(2.5),
             ESPRESSO)
    add_text(s, Inches(0.7), Inches(2.05), Inches(5.6), Inches(0.4),
             "🛡️  System Administrator", size=14, bold=True, color=AMBER_HI)
    add_text(s, Inches(0.7), Inches(2.5), Inches(5.6), Inches(0.4),
             "Email: admin@thriftit.vn", size=13, color=LINEN,
             font="Consolas")
    add_text(s, Inches(0.7), Inches(2.9), Inches(5.6), Inches(0.4),
             "Mật khẩu: admin", size=13, color=LINEN,
             font="Consolas")
    add_text(s, Inches(0.7), Inches(3.4), Inches(5.6), Inches(0.4),
             "→ Hệ thống tự chuyển đến /admin",
             size=12, color=AMBER_HI, bold=True)
    add_text(s, Inches(0.7), Inches(3.85), Inches(5.6), Inches(0.4),
             "→ Cũng có thể vào qua nút “Admin Panel” trên Header",
             size=11, color=MUTED)

    # Right — 4 tabs
    tabs = [
        ("📈", "Tổng quan thống kê",
         "Phí hoa hồng · Tin chờ duyệt · Doanh số · Tỷ lệ Platform", TERRACOTTA),
        ("📦", "Duyệt bài đăng C2C",
         "Quan trọng nhất — duyệt mọi tin trước khi public", GREEN),
        ("🏪", "Duyệt Shop",
         "Duyệt hồ sơ đăng ký Seller", COFFEE),
        ("👥", "Danh sách tài khoản",
         "Lọc Buyer/Seller · Khóa / Mở khóa · Lý do", BLUE),
    ]
    cw = Inches(3.0)
    cy = Inches(1.4)
    for i, (icon, label, body, color) in enumerate(tabs):
        r = i // 2
        c = i % 2
        x = Inches(6.8) + (cw + Inches(0.15)) * c
        y = cy + Inches(2.8) * r
        add_rect(s, x, y, cw, Inches(2.6), WHITE, line_color=color, line_w=Pt(1.5))
        add_rect(s, x, y, cw, Inches(0.6), color)
        add_text(s, x, y, cw, Inches(0.6),
                 f"{icon}  {label}", size=14, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x + Inches(0.2), y + Inches(0.8),
                 cw - Inches(0.4), Inches(1.7),
                 body, size=12, color=ESPRESSO,
                 anchor=MSO_ANCHOR.TOP)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 25 — Tiêu chí duyệt bài
# ════════════════════════════════════════════════════════════════════════════════
def slide_25_approval_rules(n, t):
    s = new_slide()
    add_slide_header(s, "Tiêu chí duyệt bài đăng", "Quyết định giữ chất lượng cộng đồng", n, t)

    # Left — Approve
    add_rect(s, Inches(0.5), Inches(1.4), Inches(6.0), Inches(5.6),
             RGBColor(0xE9, 0xF7, 0xEF), line_color=GREEN, line_w=Pt(2))
    add_rect(s, Inches(0.5), Inches(1.4), Inches(6.0), Inches(0.6), GREEN)
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.0), Inches(0.6),
             "✓  NÊN DUYỆT", size=16, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    approve = [
        "Ảnh rõ ràng, đúng sản phẩm",
        "Mô tả trung thực (chất liệu, size, tình trạng)",
        "Giá hợp lý so với thị trường",
        "Danh mục chính xác",
    ]
    add_bullets(s, Inches(0.7), Inches(2.15), Inches(5.6), Inches(4.5),
                approve, size=14, color=ESPRESSO, bullet_color=GREEN)

    # Right — Reject
    add_rect(s, Inches(6.8), Inches(1.4), Inches(6.0), Inches(5.6),
             RGBColor(0xFD, 0xED, 0xEC), line_color=RED, line_w=Pt(2))
    add_rect(s, Inches(6.8), Inches(1.4), Inches(6.0), Inches(0.6), RED)
    add_text(s, Inches(6.8), Inches(1.4), Inches(6.0), Inches(0.6),
             "✗  NÊN TỪ CHỐI", size=16, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    reject = [
        "Ảnh mờ, ảnh mạng, không phải SP thật",
        "Mô tả sai lệch hoặc không có",
        "Giá bất hợp lý (quá cao/thấp)",
        "SP bị cấm (đồ nhái, hàng cấm)",
        "Spam / đăng trùng lặp",
    ]
    add_bullets(s, Inches(7.0), Inches(2.15), Inches(5.6), Inches(4.5),
                reject, size=14, color=ESPRESSO, bullet_color=RED)

    # Footer warning
    add_text(s, Inches(0.5), Inches(7.0), Inches(12.3), Inches(0.3),
             "⚠️  Duyệt / từ chối KHÔNG thể hoàn tác qua UI — cần can thiệp backend.",
             size=11, color=RED, bold=True, align=PP_ALIGN.CENTER)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 26 — Scripts & nguyên tắc Admin
# ════════════════════════════════════════════════════════════════════════════════
def slide_26_admin_scripts(n, t):
    s = new_slide()
    add_slide_header(s, "Scripts & Nguyên tắc Admin", "Công cụ backend · Nguyên tắc quản trị", n, t)

    # Left — Scripts
    add_text(s, Inches(0.5), Inches(1.4), Inches(6.2), Inches(0.4),
             "🛠️  Scripts quản trị Backend", size=15, bold=True, color=TERRACOTTA)
    scripts = [
        ("npm run db:backup",
         "Tạo snapshot JSON của database"),
        ("npm run db:reset -- --execute --confirm-reset",
         "Xóa carts/notifications, archive SP active (giữ lịch sử)"),
        ("npm run db:seed -- --execute --confirm-seed",
         "Tạo 25 SP demo phân bố cho các seller hiện có"),
    ]
    y = Inches(1.85)
    for cmd, desc in scripts:
        add_rect(s, Inches(0.5), y, Inches(6.2), Inches(1.4),
                 ESPRESSO)
        add_text(s, Inches(0.7), y + Inches(0.1), Inches(5.8), Inches(0.4),
                 "📦  " + cmd, size=11, bold=True, color=AMBER_HI,
                 font="Consolas")
        add_text(s, Inches(0.7), y + Inches(0.55), Inches(5.8), Inches(0.7),
                 desc, size=11, color=LINEN)
        y += Inches(1.5)

    # Right — Nguyên tắc
    add_text(s, Inches(7.0), Inches(1.4), Inches(5.8), Inches(0.4),
             "📋  Nguyên tắc quản trị quan trọng", size=15, bold=True, color=TERRACOTTA)
    rules = [
        ("KHÔNG xóa", "SP có đơn phụ thuộc — dùng archive thay delete", RED),
        ("KHÔNG truncate", "ledgers, platformfeeconfigs, orders — KHÔNG BAO GIỜ", RED),
        ("Backup trước", "Khi thay đổi lớn: npm run db:backup trước", COFFEE),
        ("Không fallback", "Tuyệt đối KHÔNG dùng production URI làm fallback test", RED),
    ]
    y = Inches(1.85)
    for title, body, color in rules:
        add_rect(s, Inches(7.0), y, Inches(5.8), Inches(1.05),
                 WHITE, line_color=color, line_w=Pt(1.2))
        add_text(s, Inches(7.2), y + Inches(0.05), Inches(5.4), Inches(0.4),
                 title, size=13, bold=True, color=color)
        add_text(s, Inches(7.2), y + Inches(0.45), Inches(5.4), Inches(0.6),
                 body, size=11, color=ESPRESSO)
        y += Inches(1.15)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 27 — FAQ nổi bật
# ════════════════════════════════════════════════════════════════════════════════
def slide_27_faq(n, t):
    s = new_slide()
    add_slide_header(s, "Câu hỏi thường gặp (FAQ)", "Top 6 câu hỏi nhiều người dùng nhất", n, t)

    faqs = [
        ("🛒", "Tôi có thể mua hàng không cần đăng ký không?",
         "CÓ — duyệt SP và thêm vào giỏ tạm. Nhưng THANH TOÁN phải đăng nhập.",
         TERRACOTTA),
        ("🛒", "Phí vận chuyển tính thế nào?",
         "30.000₫ × số shop khác nhau trong giỏ. Mỗi shop tính riêng.",
         COFFEE),
        ("🛒", "Phương thức thanh toán nào hỗ trợ?",
         "Hiện tại chỉ COD. Thẻ / ví điện tử sẽ bổ sung trong phiên bản tới.",
         GREEN),
        ("🏪", "Ai có thể trở thành Seller?",
         "Bất kỳ user đã đăng ký — nộp hồ sơ Shop, chờ Admin duyệt (24–48h).",
         BLUE),
        ("🏪", "Phí nền tảng bao nhiêu?",
         "5% trên giá bán. Chỉ tính khi đơn COMPLETED.",
         AMBER_HI if False else TERRACOTTA),
        ("🛡️", "Khi nào dùng script db:reset?",
         "CHỈ trên dev/test. TUYỆT ĐỐI KHÔNG chạy trên production.",
         RED),
    ]
    cw = Inches(6.0)
    cy = Inches(1.5)
    for i, (icon, q, a, color) in enumerate(faqs):
        r = i // 2
        c = i % 2
        x = Inches(0.5) + (cw + Inches(0.2)) * c
        y = cy + Inches(2.6) * r
        add_rect(s, x, y, cw, Inches(2.4), WHITE, line_color=color, line_w=Pt(1.2))
        add_rect(s, x, y, Inches(0.15), Inches(2.4), color)
        add_text(s, x + Inches(0.3), y + Inches(0.15), Inches(0.5), Inches(0.5),
                 icon, size=22, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x + Inches(0.85), y + Inches(0.1), cw - Inches(1.0),
                 Inches(0.7), q, size=13, bold=True, color=ESPRESSO)
        add_text(s, x + Inches(0.3), y + Inches(0.95), cw - Inches(0.5),
                 Inches(1.35), a, size=12, color=COFFEE)
    add_footer(s)


# ════════════════════════════════════════════════════════════════════════════════
# SLIDE 28 — Closing
# ════════════════════════════════════════════════════════════════════════════════
def slide_28_closing(n, t):
    s = new_slide(light=False)
    add_rect(s, 0, 0, Inches(0.5), prs.slide_height, TERRACOTTA)
    add_text(s, Inches(1.0), Inches(2.5), Inches(11), Inches(0.5),
             "Cảm ơn bạn đã đọc!", size=18, color=AMBER_HI, bold=True)
    add_text(s, Inches(1.0), Inches(3.0), Inches(11), Inches(1.5),
             "Chúc bạn có trải nghiệm tuyệt vời trên thrift it! 🌿",
             size=42, color=LINEN, bold=True)
    add_rect(s, Inches(1.0), Inches(4.7), Inches(2.0), Inches(0.05), TERRACOTTA)

    # Resources
    add_text(s, Inches(1.0), Inches(5.0), Inches(11), Inches(0.4),
             "📚 Tài liệu tham khảo:", size=14, bold=True, color=AMBER_HI)
    add_text(s, Inches(1.0), Inches(5.45), Inches(11), Inches(0.4),
             "docs/API_CONTRACT.md  ·  docs/ENUMS.md  ·  docs/ERROR_CODES.md  ·  docs/openapi.yaml  ·  AI_CONTEXT.md",
             size=12, color=MUTED)
    add_text(s, Inches(1.0), Inches(5.85), Inches(11), Inches(0.4),
             "💬 Hỗ trợ: support@thriftit.vn  ·  /messages  ·  /notifications",
             size=12, color=MUTED)

    add_text(s, Inches(1.0), Inches(6.8), Inches(11), Inches(0.4),
             "Phiên bản 1.0  ·  03/10/2026  ·  © 2026 thrift it! Vietnam",
             size=11, color=MUTED)


# ════════════════════════════════════════════════════════════════════════════════
# Build all slides
# ════════════════════════════════════════════════════════════════════════════════
builders = [
    slide_01_cover, slide_02_toc,
    slide_03_section_intro, slide_04_what_is, slide_05_tech,
    slide_06_section_getting_started, slide_07_register, slide_08_demo_accounts,
    slide_09_section_buyer,
    slide_10_buyer_pages, slide_11_home, slide_12_search_filter,
    slide_13_product_detail, slide_14_cart, slide_15_checkout,
    slide_16_orders, slide_17_address_review,
    slide_18_section_seller,
    slide_19_register_shop, slide_20_post_product, slide_21_shop_management,
    slide_22_shipment,
    slide_23_section_admin,
    slide_24_admin_login, slide_25_approval_rules, slide_26_admin_scripts,
    slide_27_faq,
    slide_28_closing,
]
total = len(builders)
for i, fn in enumerate(builders, start=1):
    fn(i, total)

# Save
output = "F:/FPTU/FALL 2026/EXE201/pj_UI/docs/thriftit_user_manual_slides.pptx"
prs.save(output)
print(f"Saved {total} slides -> {output}")