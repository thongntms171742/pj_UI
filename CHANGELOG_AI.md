# Changelog AI

## 2026-10-01: Mobile Standalone Android APK (ThriftIt Mobile)
### Added
- Created `mobile/.env` containing `EXPO_PUBLIC_API_URL=https://thriftit-backend.onrender.com`.
- Generated native Android project at `mobile/android/` via `npx expo prebuild --platform android --clean`.
- Added `mobile/android/local.properties` pointing to the local Android SDK (`C:\\Users\\HP\\AppData\\Local\\Android\\sdk`).

### Changed
- `mobile/.gitignore`: explicitly ignore `.env` so production API URL is not committed.
- `mobile/android/app/build.gradle`: set `react { debuggableVariants = [] }` so the debug variant also bundles `index.android.bundle` and produces a standalone APK (default skips bundling for `debug`).

### Built
- `mobile/android/app/build/outputs/apk/debug/app-debug.apk` (~160 MB, 4 architectures).
- Verified the APK contains `assets/index.android.bundle` (~2.99 MB) and `assets/app.config` — APK runs standalone without Metro bundler.

### Notes
- User-level `GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx4096m -Xms512m"` initially triggered `Initial heap size set to a larger value than the maximum heap size` during JVM init. Build commands must override it with `Remove-Item env:GRADLE_OPTS; $env:GRADLE_OPTS="-Xmx2048m -Xms256m"` before invoking `gradlew assembleDebug --no-daemon`.

## 2026-09-30: UI/UX Audit P1 (Form Validation, Timelines, Empty States)
### Changed
- **AccountScreen**: Improved the visual design and UX of empty states for Orders ("Chưa có đơn hàng nào") and Addresses ("Chưa có địa chỉ") with intuitive icons and actionable buttons.
- **AccountScreen**: Added mandatory form validation to the Add/Edit Address dialog (checks for empty fields and valid Vietnam phone number formats).
- **AccountScreen**: Fixed the "Seller uy tín" badge logic in the Seller Stats summary to mirror the strict `rating >= 4.0` AND `transactions >= 20` conditions.
- **CartScreen**: Activated the "Tiếp tục mua sắm" button in the empty cart state to navigate back to the product catalog.
- **SellerApplyScreen**: Strengthened shop name validation (minimum 3 characters) to prevent blank or overly short names.
- **App (Routing)**: Fixed a major security/UX bug by wrapping all protected routes (`/checkout`, `/account`, `/messages`, `/admin`, etc.) with a `<ProtectedRoute>` component to auto-redirect anonymous users to `/login`.

## 2026-09-30: UI/UX Data Integrity Audit (P0)
### Changed
- **AdminScreen**: Commission rate is now dynamically fetched via `GET /admin/stats` (`platformFeeRate`), removing the misleading client-side slider.
- **ProductDetailScreen**: Replaced fake hardcoded "4.9 (128 đánh giá) · 234 lượt thích" with real average rating and count calculated from API reviews.
- **ProductDetailScreen**: Removed fake "original price" (price * 1.4) and strikethrough.
- **ProductDetailScreen**: Refined condition labels (Như mới, Rất tốt, Tốt, Khá, Đã qua sử dụng).
- **ProductDetailScreen**: Added live stock status ("Còn X sản phẩm" / "Hết hàng") and disabled actions on 0 stock.
- **SellerScreen**: Restricted "Shop uy tín ✓" badge to only display if `rating >= 4.0` AND `transactions >= 20`.
- **SellerScreen & ProductDetailScreen**: Fixed star rating icons to correctly render partially filled stars according to the true float rating.
- **PostScreen**: Improved validation (minimum 5 characters for name, max 2000 description length, char counters, inline errors) and added a pre-submit confirmation dialog.
- **ChatScreen**: Updated title and placeholder to explicitly mark feature as PREVIEW/in-development.
- **Footer**: Updated copyright year to 2026.

## 2026-09-30: Backend Integration & OpenAPI Compliance
### Added
- Configured `.env`, `.env.example`, and `.env.production` in `frontend` with `VITE_API_URL=https://thriftit-backend.onrender.com`.
- Added product reviews section in `ProductDetailScreen` fetching from `/api/products/{id}/reviews`.
- Added product archive functionality in `AccountScreen` calling `/api/products/{id}/archive`.
- Added AI smart natural language search in `SearchScreen` calling `POST /api/ai/search`.
- Added AI listing analysis assistant in `PostScreen` calling `POST /api/ai/analyze-listing` for price, category, and tag suggestions.
- Added `put` method and robust URL path concatenation in `api.ts`.
### Added
- Standardized browser URL routing using React Router (`BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useLocation`, `useParams`).
- Configured dedicated URLs: `/`, `/login`, `/register`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/account`, `/account/orders`, `/account/selling`, `/messages`, `/notifications`, `/sellers/:handle`, `/seller`, `/seller/apply`, `/sell`, `/admin`.
- Implemented `ProductDetailRouteWrapper` and `SellerRouteWrapper` to dynamically load items directly from API upon browser refresh or direct URL access.
- Added aliases and redirects (`/search` -> `/products`, `/payment` -> `/checkout`, `/chat` -> `/messages`, `/post` -> `/sell`, `/notification` -> `/notifications`).

- Updated `vite.config.ts` default proxy fallback to `https://thriftit-backend.onrender.com`.
- Updated admin pending listings retrieval to use OpenAPI standard `/api/products?status=pending` with fallback.
- Updated admin listing rejection to support fallback to `/api/products/{id}/archive`.
- Fixed JSX closing parenthesis in `AccountScreen` for `addressesLoading`.
- Tested and verified live backend connection at `https://thriftit-backend.onrender.com/api/health` and `/api/products`.
- Ran `npm run build` with zero errors.

## 2026-10-01: OpenAPI Endpoint Alignment Pass
### Changed
- **`App.tsx`**: Fixed wrong endpoint `POST /auth/cart/merge` → `POST /cart/merge` in the login flow (OpenAPI only exposes `/cart/merge`).
- **`App.tsx`**: Removed the silent offline/demo login fallback in `handleLogin`. Empty-password attempts now show a toast asking the user to enter a password, in line with `UI_UX_RULES.md §13/§24` (no fake functionality).
- **`App.tsx`**: Updated products-loader comment from "backend down → keep mock fallback" to reflect the no-fake policy.
- **`AccountScreen.tsx`**: Removed `/addresses` CRUD (not in OpenAPI). Deleted state `addresses`, `addressesLoading`, `loadAddresses`, `handleSaveAddress`, `handleDeleteAddress`, the address dialog, and the entire "Địa chỉ" tab. Seller pickup address is now entered directly in the shipment dialog. Bumped the badge in the profile header to no longer reference `sellerStats.soldProducts` indirectly via removed addresses code.
- **`PaymentScreen.tsx`**: Removed the `useEffect` that fetched `/addresses` to pre-fill the shipping form. The manual form remains and matches `CreateOrderRequest.shippingName/Phone/Address` in the spec.
- **`SellerScreen.tsx`**: Fixed reviews endpoint from `/sellers/${seller.id}/reviews` to `/sellers/${seller.handle}/reviews` per OpenAPI `/sellers/{idOrHandle}/reviews`.

### Removed
- `frontend/src/pages/seller/ApplySellerScreen.tsx` — duplicate of `SellerApplyScreen.tsx`, not imported anywhere.

### Verification
- `curl https://thriftit-backend.onrender.com/api/health` → `HTTP 200`
- `cd frontend && npm run build` → exit 0 (`✓ built in 15.44s`, 1633 modules, 385 KB JS)

### Known Limitations
- No persistent buyer address book; each checkout requires re-typing the shipping form.
- Seller warehouse address management is now per-shipment in the shipment creation modal.

### Fixed (in-session hotfix)
- **`AccountScreen.tsx` ("Xác nhận đã nhận" button, `delivering` tab)**: was calling `PATCH /orders/:code/status` with `status: "DELIVERED"`, which the backend rejected with `ORDER_BUYER_NOT_PARTICIPANT` (buyer can only set `CANCELLED` or `COMPLETED`). Now the button tries `COMPLETED` first; on reject, it walks the state machine `DELIVERED → COMPLETED`. Both attempts surface the backend's exact error message if they fail.
  - Build: `cd frontend && npm run build` → exit 0 (`✓ built in 3.06s`).

## 2026-10-01: BE Address Book integration + buyer state-machine fix
BE delivered 4 new endpoints for a persistent address book (`GET/POST/PATCH/DELETE /api/users/me/addresses`) and relaxed buyer order-status permissions. The frontend + mobile clients are updated to consume them. (BE lives in a separate repo and does not share this one.)

### Added
- **`frontend/src/lib/api.ts`** — typed wrapper `addressApi` (`list/create/update/remove`) and types `ApiAddress` / `ApiAddressInput` matching the documented payload (`name`, `phone`, `address`, `ward`, `district`, `province`, `label`, `isDefault`).
- **`mobile/src/api/endpoints.ts`** — mirror of `addressApi` so the React Native app can call the same 4 endpoints.
- **`frontend/src/pages/account/AccountScreen.tsx`** — restored the "Sổ địa chỉ" tab (removed in the OpenAPI alignment pass). Includes:
  - List view with edit/delete / default-toggle actions and "Thêm địa chỉ mới" CTA.
  - Empty state with MapPin icon and call-to-action.
  - Add/Edit dialog with phone (`/^(0|\+84)[3|5|7|8|9][0-9]{8}$/`) and address-length (≥ 10 chars) validation, mirroring the P1 form-validation rules.
  - First address automatically set as default; existing addresses get a "Đặt làm mặc định" inline action.
- **`frontend/src/pages/payment/PaymentScreen.tsx`** — `useEffect` that pre-fills `fullName` / `phone` / `address` from the user's default address (or first address) on mount. Soft-fails silently; manual entry remains the source of truth.

### Changed
- **`AccountScreen.tsx` ("Xác nhận đã nhận" button, `delivering` tab)**: removed the `COMPLETED → DELIVERED → COMPLETED` state-machine workaround now that BE permits buyers to set `DELIVERED` directly. Single API call: `PATCH /orders/:code/status { status: "DELIVERED" }`. BE confirmed this fix on 2026-10-01.
- **`AccountScreen.tsx` main tab list**: added "Sổ địa chỉ" (MapPin icon) for both buyer and seller views so users can manage pickup/shipping addresses from one place.

### Mobile parity
- `mobile/src/hooks/queries.ts` already accepts `{ status?, category? }` from the previous session — the pre-existing "useProducts hook doesn't accept category yet" TS error no longer reproduces (`npx tsc --noEmit` → exit 0). No code change needed; documented for completeness.
- Added `addressApi` typed wrapper so a future mobile AddressBook screen can be dropped in without further plumbing.

### Verification
- `cd frontend && npm run build` → exit 0 (`✓ built in 6.26s`, 1633 modules, 398.22 KB JS).
- `cd mobile && npx tsc --noEmit` → exit 0 (no errors).

### Known
- Address book payload contract is inferred from the BE note + the documented fields on `docs/API_CONTRACT.md §13 Users` (not yet updated in this repo since the BE lives in a separate repo). If BE's actual response shape differs (e.g. camelCase keys, or `userId` required in POST body), minor adapter tweaks may be needed once a contract is published here.

## 2026-10-01: Mobile Buyer Flow Audit + Logo Hardening
Scope: static audit of mobile buyer flow (no browser run). Logo + `thrift it!` italic text pattern is **preserved** — only sizing is tightened on small viewports. Asset URL `https://i.postimg.cc/44tgtTTG/thrift-logo.png` is unchanged.

### Changed
- **`frontend/src/components/layout/Logo.tsx`**: added optional `className` prop. When provided, the inline `width/height` style is dropped so Tailwind responsive classes win (used by `Header.tsx` for `w-7 h-7 md:w-8 md:h-8`).
- **`frontend/src/components/layout/Header.tsx`**: logo group uses `flex-shrink min-w-0`, gap reduced `gap-2 md:gap-3`, brand text `text-base md:text-xl truncate`, logo sized via `w-7 h-7 md:w-8 md:h-8`. Prevents header overflow at 360-393px.
- **`frontend/src/pages/product-detail/ProductDetailScreen.tsx`**: breadcrumb wrapper `px-8` → `px-4 md:px-8`; product-name span gets `truncate` to handle long names without horizontal overflow.
- **`frontend/src/components/product/ProductCard.tsx`**: condition % and seller text bumped from `text-[10px]` to `text-[11px]` (still `md:text-xs`). Aligns with `[UI_UX_RULES.md §19]` minimum text size.
- **`frontend/src/pages/cart/CartScreen.tsx`**: qty selector buttons `34x34` → `40x40`, input `38` → `44`. Meets 44px iOS HIG / 48dp Material touch-target minimum.
- **`frontend/src/pages/search/SearchScreen.tsx`**:
  - Hide `<FilterSidebar>` on mobile (`hidden lg:block`), add a sticky "Bộ lọc nâng cao" toggle button only visible on mobile with active-filter badge count.
  - Added a slide-in drawer containing the same `FilterSidebar` + an "Áp dụng" CTA showing the live result count.
- **`frontend/src/pages/home/HomeScreen.tsx`**: hero `<h2>` gets `max-w-[280px] md:max-w-none` to guarantee a 2-line wrap on small viewports without overflowing.

### Not changed
- No API or business-logic touch-ups.
- Logo asset URL, alt text, italic font treatment unchanged everywhere it's used.

### Verification
- `cd frontend && npm run build` → exit 0 (`✓ built in 6.34s`, 1633 modules, 387 KB JS).

### 2026-10-01 (later) — Mobile (React Native) parity fix
Scope: mirror the same logo + mobile-buyer fixes into `mobile/` (Expo / RN). The earlier session only edited `frontend/`; this entry covers `mobile/`.

### Changed
- **`mobile/src/components/ThriftLogo.tsx`**: was a stylised wordmark built from `<View>` shapes (circle + dot) — a placeholder. Now uses `<Image source={{ uri: 'https://i.postimg.cc/44tgtTTG/thrift-logo.png' }}>` so the **brand asset is identical** between web and mobile. Italic `thrift it!` wordmark (via `withText` prop) and accessibility label "thrift it! Logo" preserved.
- **`mobile/src/components/ProductCard.tsx`**: `meta` and `seller` text bumped from `fontSize: 10` → `11` to align with minimum text-size rule.
- **`mobile/src/components/QuantityStepper.tsx`**: default `dim` 36 → 44 (md), 28 → 36 (sm); minWidth of the value cell +4 → +8. Meets iOS HIG 44px touch-target minimum.

### Not changed
- `mobile/src/screens/home/HomeScreen.tsx` — hero is already 22px with explicit `\n`, no wrap fix needed.
- `mobile/src/screens/product/ProductDetailScreen.tsx` — uses native-stack `topTitle`, no horizontal breadcrumb, web breadcrumb fix doesn't apply.
- `mobile/src/screens/search/SearchScreen.tsx` — chips are already `horizontal` `ScrollView`, filter panel toggles inline. No drawer fix needed.

### Verification
- `cd mobile && npx tsc --noEmit` → **only pre-existing** unrelated error in `SearchScreen.tsx` (`useProducts` hook doesn't accept `category` yet). The 3 files I touched (ThriftLogo, ProductCard, QuantityStepper) have **no new TS errors**.

### Known
- Mobile `SearchScreen` TS error is pre-existing and out of scope; leave for a follow-up.
