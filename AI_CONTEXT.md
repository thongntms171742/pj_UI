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
7. **Admin**:
   - `GET /api/admin/pending-sellers`
   - `PATCH /api/admin/sellers/{id}/approve`
   - `PATCH /api/admin/sellers/{id}/reject`
   - `PATCH /api/admin/listings/{id}/approve`
   - `GET /api/admin/stats`

## Verification
- `curl https://thriftit-backend.onrender.com/api/health` -> OK
- `curl https://thriftit-backend.onrender.com/api/products` -> OK
- `npm run build` in `frontend` -> Successful production build
