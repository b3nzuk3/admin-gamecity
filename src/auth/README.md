# Authentication boundary

Phase 2 uses a dedicated admin bearer boundary without introducing a second token scheme:

- Login: `POST /api/admin/auth/login`
- Bootstrap: `GET /api/admin/auth/me`
- Token storage: `src/auth/tokenStorage.ts` owns the `gamecity_token` browser key.
- `src/services/api/client.ts` is the only place that attaches the bearer header.
- A 401 clears the token, clears the TanStack Query cache, and redirects to `/login`.
- A 403 remains a forbidden response; it is not treated as an expired session.
- Logout clears the browser token and protected query cache, then navigates to `/login`.

The current backend does not expose server-side JWT revocation. Logout therefore removes the browser's bearer token but does not revoke an already-issued JWT on the server. A future HttpOnly session migration can replace `tokenStorage` without changing page-level API calls.

The admin login uses the existing User model and `isAdmin` field. Non-admin accounts are rejected by the dedicated admin endpoint and cannot reach the protected shell. The storefront `/api/auth/*` and legacy `/admin` route remain available for compatibility.
