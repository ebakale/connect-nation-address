

## Fix: Public Address Search Failing Due to Authentication Requirement

### Root Cause
The `address-search-api` edge function **requires a valid JWT token** (lines 54-78). When an unauthenticated user searches from the Public Access Portal on the index page, the function returns a 401 "Authentication required" error, which surfaces as "Error de Búsqueda."

The auth logs confirm: the user logged out, then tried to search, triggering `bad_jwt` / `missing sub claim` errors.

### Solution
The Public Access Portal is meant to be publicly accessible. The edge function should allow **unauthenticated** requests but scope them to only return public addresses. When a valid JWT is present, it can optionally use it for RLS-scoped queries.

### Changes

#### 1. Update `supabase/functions/address-search-api/index.ts`
- Make authentication **optional** instead of required
- If no JWT or invalid JWT: use the service role or anon key client, force `includePrivate = false`, and only query public/verified addresses
- If valid JWT: keep current behavior (RLS-scoped, can include private if requested)
- This preserves security: unauthenticated users only see public addresses

Key logic change:
```
// Instead of returning 401 when no auth header:
// - Create anon client (no user context)
// - Force includePrivate = false
// - Only query verified + public addresses
```

#### 2. No frontend changes needed
`PublicAccessPortal.tsx` already calls `supabase.functions.invoke('address-search-api')` correctly. The Supabase client will send whatever auth token is available (or none if logged out).

### Files Modified
- `supabase/functions/address-search-api/index.ts` — make auth optional, allow public-only searches for unauthenticated users

