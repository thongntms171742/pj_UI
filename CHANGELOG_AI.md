# Changelog AI

## 2026-09-30: Backend Integration & OpenAPI Compliance
### Added
- Configured `.env`, `.env.example`, and `.env.production` in `frontend` with `VITE_API_URL=https://thriftit-backend.onrender.com`.
- Added product reviews section in `ProductDetailScreen` fetching from `/api/products/{id}/reviews`.
- Added product archive functionality in `AccountScreen` calling `/api/products/{id}/archive`.
- Added `put` method and robust URL path concatenation in `api.ts`.

### Changed
- Updated `vite.config.ts` default proxy fallback to `https://thriftit-backend.onrender.com`.
- Updated admin pending listings retrieval to use OpenAPI standard `/api/products?status=pending` with fallback.
- Updated admin listing rejection to support fallback to `/api/products/{id}/archive`.
- Fixed JSX closing parenthesis in `AccountScreen` for `addressesLoading`.
- Tested and verified live backend connection at `https://thriftit-backend.onrender.com/api/health` and `/api/products`.
- Ran `npm run build` with zero errors.
