

## Add City/Street Search to Address Lookup

### Current Behavior
The `AddressLookupStep` only allows searching by exact UAC code via `lookupAddressByUAC`, which queries `addresses` table with `.eq('uac', uac)`.

### Existing Infrastructure
The database already has `search_addresses_safely` RPC that searches by UAC (exact match), street, city, and building (ILIKE). The `useAddresses` hook already wraps it as `searchAddresses`. So we just need to wire it into the UI.

### Changes

#### 1. Update `src/components/AddressLookupStep.tsx`
- Add a **search mode toggle** (tabs or radio): "Search by UAC" vs "Search by City/Street"
- In UAC mode: keep current exact-match behavior (`lookupAddressByUAC`)
- In text search mode:
  - Single input field for free-text query (city, street, building)
  - Call `search_addresses_safely` RPC via supabase client
  - Display a **list of matching results** (not just one) with street, city, region, UAC, verified badge
  - User clicks a result to select it → triggers `onAddressFound(uac, details)`
- Keep the "Create New Address" fallback when no results found in either mode

#### 2. Update `src/hooks/useCAR.tsx`
- Add a `searchAddresses(query: string)` method that calls `supabase.rpc('search_addresses_safely', { search_query: query })` and returns the results array
- Export it alongside `lookupAddressByUAC`

#### 3. Add translation keys (en/es/fr `address.json`)
- `unifiedFlow.searchByUAC` — "Search by UAC"
- `unifiedFlow.searchByLocation` — "Search by City or Street"
- `unifiedFlow.locationSearchPlaceholder` — "Enter city, street, or building name..."
- `unifiedFlow.selectAddress` — "Select"
- `unifiedFlow.multipleResultsFound` — "{{count}} addresses found"
- `unifiedFlow.noResultsFound` — "No addresses found matching your search"

### UI Layout (text search mode)
```text
┌──────────────────────────────────────────┐
│ [Search by UAC] [Search by City/Street]  │  ← Tabs
├──────────────────────────────────────────┤
│ [Enter city, street...________] [Search] │
├──────────────────────────────────────────┤
│ ▸ Calle Principal - Malabo, BN   GQ-...  │  ← clickable results
│ ▸ Calle 30 de Junio - Bata, LI   GQ-... │
│ ▸ ...                                     │
└──────────────────────────────────────────┘
```

### Files Modified
- `src/components/AddressLookupStep.tsx` — add tab toggle, text search mode with results list
- `src/hooks/useCAR.tsx` — add `searchAddresses` method
- `src/locales/en/address.json`, `src/locales/es/address.json`, `src/locales/fr/address.json` — new keys

