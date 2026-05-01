
# Mobile-First UX Improvements — Phase 2

The previous round already delivered the biggest win: replacing the sidebar with a bottom tab bar and compact header for the citizen portal. This phase addresses the remaining issues from the assessment.

## What's already done (no changes needed)
- Bottom tab bar navigation for citizen portal (5 sections)
- Compact 48px header with `MobileHeader` component
- Admin/operator layouts kept desktop-oriented (correct — those are tablet/desktop tools)
- Section-based grouping instead of 12 horizontal tabs

## What this plan addresses

### 1. Full-screen dialogs on mobile

Currently, complex flows (address registration, request submission, verification) open inside centered `Dialog` modals with `max-w-4xl max-h-[85vh] overflow-y-auto`. On a 375px screen this creates a scrollable box inside a scrollable page — confusing and cramped.

**Fix**: Update the `DialogContent` component to go full-screen on mobile (`sm:` breakpoint and below). On desktop it stays a centered modal. This is a single change in `src/components/ui/dialog.tsx` that fixes all 5 dialogs at once.

Mobile behavior: `fixed inset-0 w-full h-full rounded-none`
Desktop behavior: unchanged (centered, max-width, rounded)

### 2. Better bottom nav labels

The current labels (Home / Search / Services / Alerts / Profile) are generic. The assessment suggests labels that match what citizens actually do:

**Change to**: Home / Search / Deliveries / Household / More

- **Home** — Primary/secondary addresses (the core)
- **Search** — Public address lookup
- **Deliveries** — Incoming packages, pickups, preferences (high-frequency for postal users)
- **Household** — Household members management
- **More** — Requests, Verification, Businesses, Privacy, Emergency, Sign Out (overflow menu)

This surfaces the two most-used authenticated features (deliveries, household) as top-level tabs instead of burying them under "Services" and "Home > pill".

### 3. Touch target audit

Ensure all interactive elements in the citizen portal meet the 44x44px minimum:
- Bottom nav buttons: already 44px min (good)
- Service grid buttons: add `min-h-[48px]`
- Sub-nav pill buttons: increase from 36px to 44px height
- Card action buttons: ensure `size="default"` not `size="sm"` for primary actions

### 4. Keyboard-aware form behavior

Add a CSS utility for forms to handle the virtual keyboard pushing content up. Use `dvh` (dynamic viewport height) units where available, and ensure the bottom nav hides when an input is focused on mobile.

## Technical Changes

| File | Change |
|------|--------|
| `src/components/ui/dialog.tsx` | Make DialogContent full-screen below `sm:` breakpoint |
| `src/components/citizen/CitizenBottomNav.tsx` | Change sections to home/search/deliveries/household/more |
| `src/pages/CitizenPortalUnified.tsx` | Restructure sections to match new nav; add "More" overflow section |
| `src/index.css` | Add `.keyboard-aware` utility class for form views |

## What this does NOT change
- Admin/operator layouts (sidebar, dense tables, analytics) — these are desktop/tablet tools
- Business logic or database schema
- Existing component APIs (AddressRequestForm, etc.)
