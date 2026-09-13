# GameCity Admin

Standalone Vite + React + TypeScript operations console for GameCity Electronics.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

`VITE_API_BASE_URL` should point to the existing backend API, including its `/api` path. The standalone admin now uses the Phase 2 admin boundary for authentication and bootstrap:

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`

## Phase 2 boundaries

- Authentication uses the existing bearer-token model through a centralized token abstraction.
- The admin route is protected by an explicit auth/admin guard; unauthenticated deep links redirect to `/login`.
- Logout clears the browser token and protected TanStack Query cache. The current backend has no server-side JWT revocation endpoint.
- API 401 responses clear the session and redirect to `/login`; 403 responses remain forbidden and are not treated as expiry.
- User responses use an explicit safe projection and never return password hashes, reset tokens, verification tokens, or security fields.
- Product read contracts exist as `ProductSummary`, `ProductDetail`, and `ProductListResponse`; product CRUD remains deferred.
- Upload and upload-delete routes require bearer authentication plus admin authorization. Delete keys must belong to the owned `greenbits-store/` media prefix and use an approved image extension.
- Backend CORS explicitly includes the future admin origin and existing storefront/local origins; wildcard access is not used.
- Production backend startup fails when `JWT_SECRET` is missing or shorter than 32 characters.
- The existing storefront, backend public contracts, `/admin` route, catalogue URLs, and deployment remain in place.
- Product, order, customer mutation, inventory mutation, category, homepage, media-library, settings persistence, DNS, and legacy `/admin` decommissioning remain out of scope.
- The admin origin remains non-indexable through HTML metadata, `robots.txt`, and deployment headers.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=moderate
```

The backend Phase 2 security suite runs from `gameCity-backend/` with:

```bash
npm test
```

The existing storefront `/admin` route remains operational until a later phase is fully implemented, deployed, and verified.
