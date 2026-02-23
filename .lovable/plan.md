

## Remove the Unnecessary Sidebar from the Postal Dashboard

### Problem

The Postal Dashboard has the exact same issue we just fixed in the Police Dashboard: it includes the `DashboardSidebar` component showing address-system items ("My Address Book", "Register Address", etc.) that are completely unrelated to postal operations. The sidebar's `onNavigationClick` is even wired to an empty function `() => {}`, so clicking any item does nothing.

The postal module already has its own comprehensive tab-based navigation (Orders, My Deliveries, Assignments, Pickups, Returns, COD, Reports, Admin) — the sidebar just adds clutter and potential layout issues.

### Solution

Apply the same fix as the Police Dashboard: remove the sidebar and restore a clean standalone layout.

### Changes

**File: `src/pages/PostalPage.tsx`**

1. Remove imports: `SidebarProvider`, `SidebarTrigger`, `DashboardSidebar`, `DashboardBreadcrumb`
2. Remove the `<SidebarProvider>` wrapper and `<DashboardSidebar>` component
3. Remove the `<SidebarTrigger>` from the header
4. Remove the `<DashboardBreadcrumb>` (not needed since postal has its own navigation context)
5. Simplify the layout to a straightforward `min-h-screen flex flex-col` container
6. Keep the existing header, `PostalDashboard` with its tab navigation, and footer

This mirrors the Police Dashboard cleanup and ensures both specialized modules follow the same clean, self-contained pattern.

