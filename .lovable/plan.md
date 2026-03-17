

## Internationalize Google Maps Directions View

### Problem
Two issues cause the directions view to always appear in English:

1. **Google Maps SDK** is loaded without a `language` parameter, so it defaults to English for all map labels, route instructions, distance/duration text, and turn-by-turn steps.
2. **`GoogleMapsDirectionsView.tsx`** has ~15 hardcoded English strings (e.g., "Directions", "Drive", "Walk", "Transit", "Getting your location...", "Calculating route...", "Hide steps", "Show steps", "Arrive at destination", "Open in Maps", "Loading Google Maps...", error messages, etc.).

### Fix

#### 1. Pass language to Google Maps Loader (`src/services/googleMapsService.ts`)
- Import `i18n` from `@/i18n/config`
- Add `language: i18n.language.split('-')[0]` to the `Loader` constructor options
- This makes the Google Maps SDK render all its native content (map labels, street names, directions instructions, distance/duration text) in the user's selected language
- Since the loader is a singleton created once, if the language changes mid-session and maps haven't loaded yet, it picks up the current language; if already loaded, Google Maps caches it (acceptable trade-off)

#### 2. Replace hardcoded strings in `GoogleMapsDirectionsView.tsx`
The component already imports `useTranslation` but doesn't use `t()` for its UI strings. Replace all ~15 hardcoded English strings with `t()` calls using new keys under the `common` namespace (e.g., `directions.title`, `directions.drive`, `directions.walk`, `directions.transit`, `directions.gettingLocation`, `directions.calculatingRoute`, `directions.hideSteps`, `directions.showSteps`, `directions.arriveAtDestination`, `directions.openInMaps`, `directions.loadingMaps`, `directions.unableToLoadMaps`, `directions.geolocationNotSupported`, `directions.locationAccessDenied`, and error messages).

#### 3. Add translation keys to locale files
Add a `directions` section to `src/locales/{en,es,fr}/common.json` with all the new keys and their translations.

### Hardcoded strings to replace (line references in GoogleMapsDirectionsView.tsx)
- L99: `'Geolocation is not supported'`
- L113: `'Could not get your location...'`
- L139: `'Route calculation timed out...'`
- L169-183: Error messages (zero results, not found, denied, etc.)
- L358: `'Loading Google Maps...'`
- L370: `'Unable to Load Maps'`
- L372: `'Google Maps could not be loaded...'`
- L374: `'Close'`
- L388: `'Directions'`
- L397: `'Open in Maps'`
- L414: `'Drive'`
- L423: `'Walk'`
- L432: `'Transit'`
- L462: `'Getting your location...'` / `'Calculating route...'`
- L503: `'Hide steps'`
- L507: `'Show steps'`
- L542: `'Arrive at destination'`

### Files Modified
- `src/services/googleMapsService.ts` — add `language` param to Loader
- `src/components/GoogleMapsDirectionsView.tsx` — replace all hardcoded strings with `t()` calls
- `src/locales/en/common.json` — add `directions` section
- `src/locales/es/common.json` — add `directions` section (Spanish)
- `src/locales/fr/common.json` — add `directions` section (French)

