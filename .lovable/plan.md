

## Improve the "Search Addresses" Page

### Current State

The Search Addresses page (`PublicAccessPortal`) has a functional layout with:
- A header with title and subtitle
- A tabbed interface (Addresses / Businesses)
- A search card with text input, QR scanner, and example badges
- Accordion-based results with detailed address info and actions
- Pagination and a footer

While functional, it feels utilitarian and lacks the visual polish applied to the Hero and About sections.

### Proposed Improvements

#### 1. Enhanced Header with Icon and Badge
Replace the plain text header with a styled layout matching the About section -- add a badge (e.g., "Public Service"), a prominent icon, and location status indicator showing whether GPS is active.

#### 2. Quick Stats Bar
Add a horizontal row below the header showing live context:
- Current GPS status (active/inactive with colored dot)
- Search radius indicator
- Total public addresses available (placeholder number)

This gives users immediate confidence that the system is working.

#### 3. Improved Search Card
- Add a search icon inside the input field (left-aligned icon prefix) for a more modern look
- Group the QR Scanner and Search button on the same row with equal sizing
- Add a subtle "Tip" text below the input explaining UAC format

#### 4. Better Search Example Chips
- Add icons to each example badge (QrCode for UAC, Building for city, MapPin for street)
- Use a slightly more prominent styling with hover effects

#### 5. Empty State Illustration
When no search has been performed yet, show an inviting empty state below the search card with:
- A large MapPin icon
- "Start searching" prompt text
- Brief description of what users can find

#### 6. Enhanced Results Cards
- Replace the plain Accordion with cards that have a subtle left border color-coded by address type (residential = blue, commercial = green, government = amber)
- Add a small map preview link icon next to coordinates
- Show the distance badge more prominently when available (with a colored background)

#### 7. Improved Actions Section
- Group actions into "Navigate", "Share", and "Report" categories with subtle section labels
- Use icon-only buttons in a compact grid on mobile instead of full-width stacked buttons

#### 8. Footer Enhancement
- Add a subtle separator before the footer
- Include a "Need help?" link and the emergency number

### Technical Details

**File modified:** `src/components/PublicAccessPortal.tsx`

All changes are purely visual/layout improvements within the existing component:
- Use existing UI components (`Card`, `Badge`, `Button`, `Separator`, `Alert`)
- Use existing `lucide-react` icons (add `Compass`, `Radio`, `Layers` to imports)
- Use existing translation keys with `defaultValue` fallbacks for any new strings
- No new dependencies, files, APIs, or business logic changes
- Preserve all existing functionality: search, QR scan, pagination, sharing, emergency navigation
- Maintain responsive design with existing breakpoint patterns (`sm:`, `lg:`)

