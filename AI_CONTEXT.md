# AI Context: Thrift It! Frontend & Backend Integration

## Overview
Thrift It! is a C2C second-hand marketplace with Buyer, Seller, and Admin roles.
The backend has been deployed on Render at:
`https://thriftit-backend.onrender.com`

The OpenAPI specification (`docs/openapi.yaml`) defines all 20+ REST API endpoints.

## Configuration
- `.env`, `.env.example`, `.env.production`:
  `VITE_API_URL=https://thriftit-backend.onrender.com`
- `vite.config.ts`:
  Proxy fallback target points to `process.env.VITE_API_URL || 'https://thriftit-backend.onrender.com'`.
- `api.ts`:
  `resolveBaseUrl()` ensures `https://thriftit-backend.onrender.com/api` is used for all requests with CORS enabled.

## OpenAPI 3.0.3 Alignment
1. **Health**:
   - `GET /api/health` -> Verified live (`status: ok`).
2. **Auth**:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/auth/seller/apply`
3. **Products**:
   - `GET /api/products` (supports `?category=`, `?seller=`, `?sellerId=`, `?status=`)
   - `POST /api/products`
   - `GET /api/products/{id}`
   - `GET /api/products/mine`
   - `GET /api/products/seller`
   - `PATCH /api/products/{id}/archive` (implemented archive in seller account screen)
4. **Orders & Shipment**:
   - `POST /api/orders`
   - `GET /api/orders/seller`
   - `GET /api/orders/{code}`
   - `PATCH /api/orders/{code}/status`
   - `GET /api/orders/{code}/shipment`
   - `POST /api/orders/{code}/shipment`
5. **Payments**:
   - `POST /api/payments/checkout`
   - `POST /api/payments/{code}/cod-collect`
6. **Reviews**:
   - `GET /api/products/{productId}/reviews` (integrated in `ProductDetailScreen`)
   - `POST /api/products/{productId}/reviews` (integrated in `AccountScreen` upon order completion)
7. **AI (Artificial Intelligence)**:
   - `POST /api/ai/search` (integrated in `SearchScreen` with live debounce and client-side fallback)
   - `POST /api/ai/analyze-listing` (integrated in `PostScreen` for suggested price, category, and tags)
   - `POST /api/ai/recommendations` (defined in OpenAPI specification)
8. **Admin**:
   - `GET /api/admin/pending-sellers`
   - `PATCH /api/admin/sellers/{id}/approve`
   - `PATCH /api/admin/sellers/{id}/reject`
   - `PATCH /api/admin/listings/{id}/approve`
   - `PATCH /api/admin/listings/{id}/reject`
   - `GET /api/admin/stats`
9. **Users (Address Book — BE 2026-10-01)**:
   - `GET /api/users/me/addresses`
   - `POST /api/users/me/addresses`
   - `PATCH /api/users/me/addresses/{id}`
   - `DELETE /api/users/me/addresses/{id}`
   - Integrated in `AccountScreen` (Sổ địa chỉ tab) and used as pre-fill source in `PaymentScreen`. Mobile mirror at `mobile/src/api/endpoints.ts` (`addressApi`).

## Frontend Routing Architecture (React Router)
The application has transitioned from in-memory screen switching to standard browser URL routing with React Router (`BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useLocation`, `useParams`).

| Route URL | Screen / Component | Description |
| --- | --- | --- |
| `/` | `HomeScreen` | Trang chủ marketplace, sản phẩm nổi bật, banner |
| `/login` | `LoginScreen` | Màn hình đăng nhập |
| `/register` | `RegisterScreen` | Màn hình đăng ký tài khoản |
| `/products` | `SearchScreen` | Danh mục & tìm kiếm sản phẩm (alias: `/search` -> `/products`) |
| `/products/:id` | `ProductDetailRouteWrapper` | Chi tiết sản phẩm, nạp theo ID trực tiếp từ backend khi reload |
| `/cart` | `CartScreen` | Giỏ hàng người dùng |
| `/checkout` | `PaymentScreen` | Trang thanh toán (alias: `/payment` -> `/checkout`) |
| `/account` | `AccountScreen` | Trang cá nhân tài khoản |
| `/account/orders` | `AccountScreen (purchases)` | Quản lý đơn hàng mua của buyer |
| `/account/selling` | `AccountScreen (selling)` | Kênh quản lý bán hàng của seller |
| `/messages` | `ChatScreen` | Tin nhắn trao đổi (alias: `/chat` -> `/messages`) |
| `/notifications` | `NotificationScreen` | Trung tâm thông báo (alias: `/notification` -> `/notifications`) |
| `/sellers/:handle` | `SellerRouteWrapper` | Hồ sơ shop người bán, nạp theo `:handle` |
| `/seller` | Redirect | Điều hướng đến shop cá nhân hoặc đơn vị đăng ký |
| `/seller/apply` | `SellerApplyScreen` | Form đăng ký trở thành người bán |
| `/sell` | `PostScreen` | Đăng bán sản phẩm (alias: `/post` -> `/sell`) |
| `/admin` | `AdminScreen` | Bảng điều hành quản trị viên |
| `*` | `<Navigate to="/" replace />` | Fallback về trang chủ |

## Verification
- `curl https://thriftit-backend.onrender.com/api/health` -> OK
- `curl https://thriftit-backend.onrender.com/api/products` -> OK
- `npm run build` in `frontend` -> Successful production build (Exit 0)
- Verified direct URL navigation (`/cart`, `/account/orders`, `/products`, etc.) with HTTP 200 responses.

## UI/UX Audit P0 Fixes (2026-09-30)
Data integrity and UI truthfulness fixes applied across the frontend:

1. **Commission Rate**: `AdminScreen.tsx` — Removed hardcoded `commissionRate=10` and interactive slider. Now reads `platformFeeRate` from `GET /api/admin/stats`. Default fallback is 5% (matching backend).
2. **Fake Social Proof Removed**: `ProductDetailScreen.tsx` — Removed hardcoded `4.9 (128 đánh giá) · 234 lượt thích`. Now shows real average rating computed from API reviews, or "☆ Chưa có đánh giá" if none.
3. **Seller Trust Badge**: `SellerScreen.tsx` — "Shop uy tín ✓" only appears when `rating >= 4.0 AND transactions >= 20`. Otherwise shows "Shop mới".
4. **Star Ratings**: `ProductDetailScreen.tsx` & `SellerScreen.tsx` — Stars now fill based on actual `seller.rating` value instead of always 5 filled.
5. **Breadcrumb**: `ProductDetailScreen.tsx` — Falls back to "Sản phẩm" when `product.category` is empty.
6. **Footer Year**: `Footer.tsx` — Changed `2024` → `2026`.
7. **Fake Original Price**: `ProductDetailScreen.tsx` — Removed fabricated `price × 1.4` strikethrough.
8. **Condition Display**: Shows `{condition}/100 — {condLabel}` with extended labels (Như mới/Rất tốt/Tốt/Khá/Đã qua sử dụng).
9. **Stock Visibility**: Shows "Còn X sản phẩm" / "Hết hàng". Qty selector hidden when out of stock.
10. **PostScreen Validation**: Name min 5 chars, desc char counter (max 2000), inline error messages, confirmation dialog before submit.
11. **ChatScreen**: Title changed to "Tin nhắn [PREVIEW]", demo wording updated for future-feature.

### Design Rule: No Fake Data
> **"If the database doesn't have the data, don't show the component or show an empty state — never fake it."**

## UI/UX Audit P1 Fixes (2026-09-30)
1. **Empty States Actionability**: Improved empty state messaging and graphics across `CartScreen` and `AccountScreen`. Empty states now feature clear Call-to-Actions (e.g., "Tiếp tục mua sắm", "Thêm địa chỉ mới") that properly navigate to the correct routes.
2. **Form Validation**: 
   - `AccountScreen`: Added strict client-side validation to the address addition/edit form to ensure required fields are not blank and phone numbers match standard Vietnam formats (`/^(0|\+84)[3|5|7|8|9][0-9]{8}$/`).
   - `SellerApplyScreen`: Added minimum character length (3 chars) requirement for the Shop Name.
3. **Badge Logic Synchronization**: Updated the seller statistics profile badge in `AccountScreen` to strictly enforce the `rating >= 4.0` AND `transactions >= 20` rule, ensuring absolute consistency with the badge displayed publicly on the `SellerScreen`.

## OpenAPI Alignment Pass (2026-10-01)
End-to-end audit of every frontend `api.*` call vs `docs/openapi.yaml`. Strict scope: align endpoints, remove fake data; no refactor, no UX overhaul.

1. **Wrong endpoint fixed**: `POST /auth/cart/merge` → `POST /cart/merge` in `App.tsx` login flow. OpenAPI only exposes `/cart/merge`.
2. **Removed `/addresses` CRUD** (not in OpenAPI):
   - `AccountScreen.tsx`: deleted state `addresses`, `loadAddresses`, `handleSaveAddress`, `handleDeleteAddress`, address dialog, and the entire "Địa chỉ" tab (delivery + warehouse address books). Seller pickup addresses in the shipment dialog now start empty and require manual entry.
   - `PaymentScreen.tsx`: removed the `useEffect` that fetched `/addresses` to pre-fill the shipping form. Form already supports manual entry, which matches the `CreateOrderRequest.shippingName/Phone/Address` fields in the spec.
3. **Wrong path fixed**: `SellerScreen.tsx` was calling `/sellers/${seller.id}/reviews`. OpenAPI path is `/sellers/{idOrHandle}/reviews`; switched to `seller.handle` (matches the route `/sellers/:handle`).
4. **Dead code removed**: `frontend/src/pages/seller/ApplySellerScreen.tsx` — duplicate of `SellerApplyScreen.tsx`, not imported anywhere.
5. **Removed fake login fallback** in `App.tsx handleLogin`: the `if (password)` branch used to silently log the user in without backend verification. Now an empty password is rejected with a toast, in line with `UI_UX_RULES.md §13/§24` (no fake functionality).

### Assumptions
- For seller pickup addresses, the OpenAPI `CreateShipmentRequest.pickup` block already accepts `address/ward/district/province` directly, so seller-side addresses live entirely inside the shipment dialog — no separate storage is needed.
- The Address Book payload contract is inferred from the BE note ("name/phone/address + flag isDefault" + optional ward/district/province). If the actual BE response uses different keys, only `ApiAddress` in `frontend/src/lib/api.ts` and `mobile/src/api/endpoints.ts` needs adjusting.

### Known Limitations
- Seller "Kho lấy hàng" UX is now modal-driven per shipment; no separate warehouse address management.

### Verification
- `curl https://thriftit-backend.onrender.com/api/health` → `HTTP 200`
- `cd frontend && npm run build` → exit 0 (`✓ built in 15.44s`, 1633 modules, 385 KB JS)

### Mobile Standalone APK (ThriftIt Mobile)
- Native Android project generated via `npx expo prebuild --platform android --clean` (Expo managed → bare workflow).
- `mobile/.env` holds `EXPO_PUBLIC_API_URL=https://thriftit-backend.onrender.com`. `.env` added to `.gitignore` so secrets are not pushed.
- `mobile/android/local.properties` points to `C:\\Users\\HP\\AppData\\Local\\Android\\sdk`.
- Debug APK is built standalone by setting `react { debuggableVariants = [] }` in `mobile/android/app/build.gradle` so that even the debug variant embeds `index.android.bundle` (default behavior is to skip bundling for `debug` and rely on Metro).
- Build command:
  ```
  cd mobile/android
  $env:GRADLE_OPTS="-Xmx2048m -Xms256m"   # override the user-level GRADLE_OPTS that conflicts with JVM heap init
  .\gradlew assembleDebug --no-daemon
  ```
- Output: `mobile/android/app/build/outputs/apk/debug/app-debug.apk` (~160 MB, includes 4 architectures: `armeabi-v7a, arm64-v8a, x86, x86_64`).
- Verified APK contains `assets/index.android.bundle` (≈2.99 MB) and `assets/app.config`, confirming the JS bundle is embedded — APK runs standalone without Metro bundler.
- Files changed: `mobile/.env` (new), `mobile/.gitignore` (added `.env`), `mobile/android/**` (generated by prebuild + 2 hand edits: `local.properties` and `build.gradle` `debuggableVariants`).
