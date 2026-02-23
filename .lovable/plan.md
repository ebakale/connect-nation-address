

## Remove the Unnecessary Sidebar from the Police Dashboard

### Problem

The Police Dashboard currently includes the `DashboardSidebar` component, which belongs to the **address/citizen system** (showing items like "My Address Book", "Register Address", "Profile Settings"). This sidebar:

- Has **nothing to do with police operations**
- Causes **layout problems** (single-column rendering, overlap issues)
- Confuses users by mixing unrelated navigation into the police command center
- The police module already has its own **tab-based navigation** (Dispatch, Field, Coordination, Admin, etc.) which is the correct pattern

### Solution

Remove the `SidebarProvider`, `DashboardSidebar`, and `SidebarTrigger` from `PoliceDashboard.tsx` and restore a clean, standalone layout.

### Changes

**File: `src/pages/PoliceDashboard.tsx`**

1. Remove imports: `SidebarProvider`, `SidebarTrigger`, `DashboardSidebar`, `DashboardBreadcrumb`
2. Remove the `<SidebarProvider>` wrapper and `<DashboardSidebar>` component
3. Remove the `<SidebarTrigger>` from the header
4. Simplify the layout back to a straightforward `min-h-screen` container without the sidebar flex structure
5. Keep the existing tab-based navigation (`Tabs`/`TabsList`/`TabsTrigger`) which already handles all police-specific navigation

This restores the police dashboard to a clean, self-contained module with its own header and tab navigation, matching the pattern described in the unified module navigation architecture.

