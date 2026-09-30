# Changelog AI

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
