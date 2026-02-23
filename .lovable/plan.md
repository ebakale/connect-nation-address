

# Comprehensive UX Improvements Plan

This plan organizes all identified improvements into three priority tiers, implemented in sequence. Each improvement is scoped to be a manageable unit of work.

---

## Phase 1: High Priority (Greatest User Impact)

### 1.1 Onboarding Walkthrough for New Users
**Goal:** Guide first-time users through key features based on their role.

- Create a new `src/components/OnboardingWalkthrough.tsx` component
- Uses a multi-step modal/dialog that highlights key UI areas with descriptions
- Role-aware: Citizens see "Register Address > Search > My Addresses > Emergency"; Field Agents see "Capture > Drafts > Map"; Admins see "Admin Panel > Analytics > Verification"
- Stores completion state in `localStorage` (e.g., `onboarding_completed_<userId>`)
- Triggered on first login (check if user profile was just created or localStorage flag missing)
- Add a "Show Tour Again" button in the Profile/Settings section
- Steps rendered as a stepper dialog with "Next", "Back", "Skip" controls

### 1.2 Simplified Role-Based Navigation
**Goal:** Reduce sidebar clutter by grouping and collapsing less-used items.

- Update `DashboardSidebar.tsx` to use collapsible `SidebarGroup` components with `defaultOpen` based on most-used items
- Citizens: Show "Quick Actions" group expanded (Register, Search, My Addresses), collapse "Deliveries" and "Settings" groups by default
- Field Agents: Show "Field Work" expanded, collapse others
- Admins: Show "Administration" expanded
- Add visual separators and smaller group labels for clarity
- Add a "Favorites" section at the top where users can pin frequently used items (stored in localStorage)

### 1.3 Unified Notification Center
**Goal:** Consolidate all notifications (address request status changes, verification updates, delivery updates, emergency alerts) into one place.

- Create `src/components/NotificationCenter.tsx` - a popover/dropdown in the dashboard header
- Bell icon with unread badge count
- Uses existing Supabase real-time subscriptions (already present in `ReporterNotifications.tsx`) as a pattern
- Query from `emergency_notifications` table and address request status changes
- Group notifications by type: "Address Updates", "Verification", "Deliveries", "Emergency"
- Mark as read/unread functionality
- Link each notification to its relevant dashboard view

### 1.4 Enhanced Empty States with Clear CTAs
**Goal:** Replace blank screens with helpful guidance when users have no data.

- Leverage existing `src/components/ui/empty-state.tsx` component (already built but barely used - only 2 files reference it)
- Add empty states to:
  - **My Address Requests** (no requests yet) - CTA: "Register Your First Address"
  - **My Deliveries** (no deliveries) - CTA: "Request a Pickup"
  - **Saved Addresses** (none saved) - CTA: "Search and Save Addresses"
  - **Verification Queue** (nothing pending) - positive message: "All caught up!"
  - **Field Drafts** (no drafts) - CTA: "Capture Your First Address"
  - **My Businesses** (no businesses) - CTA: "Register a Business"
- Each empty state includes an icon, descriptive text, and an action button

---

## Phase 2: Medium Priority (Quality of Life)

### 2.1 Enhanced Search UX
**Goal:** Make address search faster and more intuitive.

- Update `AddressSearch.tsx`:
  - Add a QR scan button that opens `QRCodeScanner` to scan UAC codes directly (component already exists)
  - Add search history dropdown showing recent searches (integrate with `RecentSearchesManager`)
  - Add placeholder text examples: "Try: UAC-CM-CE-YDE-001 or 'Rue de la Joie, Yaoundé'"
  - Show search result count and loading skeleton during search

### 2.2 Progress Indicators for Multi-Step Forms
**Goal:** Show users where they are in long workflows.

- Create a reusable `src/components/ui/step-indicator.tsx` component
- Visual stepper bar with numbered steps, current step highlighted, completed steps checked
- Integrate into:
  - `UnifiedAddressRequestFlow.tsx` (already multi-step)
  - `BusinessAddressRegistrationForm.tsx`
  - `ResidencyVerificationForm.tsx`
- Show estimated time remaining for each step

### 2.3 Role-Specific Dashboard Personalization
**Goal:** Tailor the overview dashboard to show the most relevant info per role.

- Citizens: Show "My Activity Summary" card (pending requests count, active addresses, recent deliveries)
- Field Agents: Show "Today's Tasks" card (addresses to capture, area assignments)
- Verifiers: Show "Queue Summary" (pending count, avg processing time, today's completions)
- Reduce information overload by hiding stats cards irrelevant to the user's role (already partially done, needs refinement)

### 2.4 Offline Form Queue with Sync Indicator
**Goal:** Give users confidence their offline submissions will be processed.

- Create `src/components/OfflineSyncQueue.tsx`
- Visual queue showing pending offline submissions with status (queued, syncing, synced, failed)
- Integrate with existing `OfflineIndicator.tsx` and `EnhancedSyncStatus.tsx`
- Show count badge on the offline indicator when items are queued
- Auto-retry failed submissions when back online

---

## Phase 3: Nice-to-Have (Polish)

### 3.1 Dark Mode Toggle
**Goal:** Make the theme toggle easily accessible.

- `next-themes` is already installed but no toggle UI exists
- Create `src/components/ThemeToggle.tsx` using a Sun/Moon icon button
- Add to dashboard header (in `Layout.tsx` and `UnifiedDashboard.tsx` header area)
- Ensure all custom CSS classes support dark mode (audit `index.css` gov-header styles)

### 3.2 Enhanced Language Switcher Visibility
**Goal:** Make language switching more prominent for multilingual users.

- `LanguageSwitcher.tsx` already exists but is only shown in specific locations
- Add it to the dashboard header next to the theme toggle
- On mobile, show just the flag icon; on desktop, show flag + language name (already implemented)
- Ensure it appears on the login page and public portal

### 3.3 Keyboard Shortcuts for Power Users
**Goal:** Speed up workflows for frequent users (especially verifiers and admins).

- Create `src/hooks/useKeyboardShortcuts.ts`
- Shortcuts:
  - `Ctrl/Cmd + K` - Open global search
  - `Ctrl/Cmd + N` - New address request
  - `Ctrl/Cmd + /` - Show shortcuts help dialog
  - `1-9` number keys - Quick-navigate sidebar items (when not in an input)
- Create `src/components/KeyboardShortcutsDialog.tsx` showing all available shortcuts
- Only active on desktop (skip on mobile)

### 3.4 Contextual Help Tooltips
**Goal:** Provide inline guidance without leaving the current screen.

- Add help icon buttons (circle-? icon) next to complex form fields and dashboard sections
- On hover/click, show a tooltip or popover with explanation
- Key locations:
  - UAC format explanation next to search input
  - Address type differences (NAR vs CAR) in the registration flow
  - Verification status meanings in request status views
  - Role permission descriptions in admin panel

---

## Implementation Order

Each improvement is designed to be implemented as a standalone task:

1. **1.4** Empty States with CTAs (quick win, high visibility)
2. **1.2** Simplified Role-Based Navigation (sidebar improvements)
3. **1.3** Notification Center (new component)
4. **1.1** Onboarding Walkthrough (new component, depends on navigation being clean)
5. **2.2** Step Indicators for Forms
6. **2.1** Enhanced Search UX
7. **2.3** Dashboard Personalization
8. **2.4** Offline Sync Queue
9. **3.1** Dark Mode Toggle
10. **3.2** Language Switcher Visibility
11. **3.3** Keyboard Shortcuts
12. **3.4** Contextual Help Tooltips

## Technical Notes

- All new components follow existing patterns: TypeScript, Tailwind CSS, shadcn/ui, react-i18next for translations
- No changes to business logic, database schema, permissions, or API behavior (per existing project constraints)
- All components must be mobile-first with 44px minimum touch targets
- New translation keys will be added to existing i18n namespace files
- localStorage used for user preferences (onboarding state, favorites, theme) to avoid database changes

