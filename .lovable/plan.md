

## Improve the "About" Section on the Landing Page

### Current State

The About section currently has only three elements:
1. A heading with a brief description
2. Two side-by-side cards for "Our Mission" and "Our Vision"
3. A "Key Partners" card with three items in a grid

It feels sparse and lacks visual engagement compared to the polished hero and overview sections.

### Proposed Improvements

#### 1. Add a visual header with an icon and styled badge
Replace the plain text heading with a layout matching the overview section's style — include a badge (e.g., "Government Initiative"), an icon, and a more descriptive subtitle.

#### 2. Add a "Platform at a Glance" statistics row
Insert a row of 4 key statistics cards between the header and Mission/Vision, showing numbers like:
- Total Provinces Covered
- Registered Addresses
- Emergency Response Time
- Active Users

These will use placeholder/illustrative numbers with icons, giving the page a sense of scale and authority.

#### 3. Enhance Mission and Vision cards
- Add relevant icons (e.g., a target icon for Mission, a telescope/eye icon for Vision)
- Add a subtle colored left border to each card for visual distinction

#### 4. Add a "How It Works" section
A 3-step visual flow showing:
1. Register your address with GPS coordinates
2. Receive your unique UAC code and QR
3. Access government services, deliveries, and emergency response

Each step in a numbered card with icon and brief description.

#### 5. Improve the Key Partners section
- Add icons to each partner card (Building for Ministry, MapPin for Local Governments, Globe for Technology Partners)
- Add a subtle background color to each card for visual grouping

#### 6. Add a "Why ConEG?" section
A new section with 4 benefit cards highlighting:
- Digital Identity for every address
- Faster emergency response
- Reliable postal delivery
- Data-driven urban planning

#### 7. Add a Call-to-Action at the bottom
A banner encouraging users to sign up or explore the platform, with "Access Platform" and "Search Addresses" buttons.

### Technical Details

**File modified:** `src/pages/Index.tsx`

Changes are confined to the `case 'about':` block (lines 369-424). All new content will:
- Use existing UI components (`Card`, `CardHeader`, `CardContent`, `Badge`, `Button`)
- Use existing icons from `lucide-react`
- Use existing translation keys where available, with new `t()` keys falling back gracefully via the `translateKey` helper
- Follow the same clean, professional design patterns used in the overview section
- Remain fully responsive with the existing grid system (`grid md:grid-cols-2 lg:grid-cols-3`)

No new dependencies or files are needed.

