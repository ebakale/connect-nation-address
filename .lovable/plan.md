

## Fix: Google Maps Not Displaying on Dashboard

### Root Cause

Two independent Google Maps loading systems exist and conflict:

1. **`googleMapsService.ts`** — creates a `Loader` with `libraries: ['places', 'routes']`
2. **`mapConfig.ts`** — creates a separate `Loader` with `libraries: ['places']`

The `@googlemaps/js-api-loader` throws when multiple `Loader` instances have different configs. The `UniversalDashboardLocationMap` calls `useMapProvider()` (which uses system #1), then `DashboardLocationMap` tries system #2, causing a conflict. The error is caught silently and the OSM fallback activates.

### Fix

**Consolidate onto a single loading system** — make `mapConfig.ts` use `googleMapsService.ts` instead of creating its own `Loader`.

#### 1. Update `src/lib/mapConfig.ts`
- Remove the `createMapLoader` function (fetches API key independently)
- Remove the `initializeGoogleMaps` function (creates a conflicting `Loader`)
- Replace both with thin wrappers around `googleMapsService.ts`:
  - `createMapLoader()` → calls `fetchApiKey()` from `googleMapsService`
  - `initializeGoogleMaps()` → calls `loadGoogleMaps()` from `googleMapsService`
- Remove the direct `Loader` import from `mapConfig.ts`

#### 2. Update `src/services/googleMapsService.ts`
- Ensure the `libraries` array includes all needed libraries: `['places', 'routes']` (already does — no change needed)

#### 3. Update `src/components/DashboardLocationMap.tsx`
- In the `useEffect` that fetches the API key (lines 106-121): replace `createMapLoader()` with `fetchApiKey()` from `googleMapsService`
- In the map initialization: replace `initializeGoogleMaps(apiKey)` with `loadGoogleMaps()` from `googleMapsService`, which handles both key fetching and SDK loading as a singleton

This ensures only one `Loader` instance ever exists, eliminating the conflict. The OSM fallback remains functional for cases where Google Maps is genuinely unavailable.

### Files Modified
- `src/lib/mapConfig.ts` — remove duplicate loader, delegate to `googleMapsService`
- `src/components/DashboardLocationMap.tsx` — use consolidated loading path

