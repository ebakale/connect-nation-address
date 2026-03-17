

## Improve the "Report Emergency" Page on the Landing Page

### Current State

The emergency section (lines 775-796 in Index.tsx) is minimal:
- A red heading and subtitle
- An optional prefilled-address info box
- The `EmergencyAlertProcessor` form component (a single card with type selector, description, contact, location, and submit)

Both the Index wrapper and the form component lack the visual polish and informational richness applied to the About and Search sections.

### Proposed Improvements

#### 1. Styled Header with Badge and Icon (Index.tsx)
Replace the plain red heading with a structured header matching other sections:
- A "Critical Service" or "Emergency Services" badge in destructive red
- A large `AlertTriangle` icon in a red circle
- A more descriptive subtitle explaining the service

#### 2. Important Info / Safety Tips Bar (Index.tsx)
Add a highlighted alert box below the header with key safety information:
- "Call 114 for immediate life-threatening emergencies"
- "This form notifies local police dispatch automatically"
- "Your GPS location is shared with responders"

This sets expectations and provides critical context before the user fills the form.

#### 3. Quick Emergency Type Buttons (EmergencyAlertProcessor.tsx)
Above the existing form, add a row of large, tappable icon buttons for common emergency types (Fire, Medical, Police, Accident) so users can select with a single tap instead of opening a dropdown. Tapping one pre-selects the dropdown value. The dropdown remains as a fallback for less common types.

#### 4. Enhanced Location Section (EmergencyAlertProcessor.tsx)
- Show GPS status with a colored indicator dot (green = active, yellow = loading, red = unavailable)
- Display a mini context card with coordinates and accuracy when location is available
- Add a "Refresh Location" button alongside the existing "Get Current Location"

#### 5. Visual Step Indicators (EmergencyAlertProcessor.tsx)
Add subtle numbered step labels above each form section:
- Step 1: Select Emergency Type
- Step 2: Describe the Situation
- Step 3: Your Location
- Step 4: Send Alert

This guides users through the form under stress.

#### 6. Enhanced Submit Area (EmergencyAlertProcessor.tsx)
- Add a small disclaimer text above the submit button: "By submitting, you confirm this is a genuine emergency"
- Make the submit button larger and more prominent with a pulsing border effect
- Show estimated response context after submission (e.g., "Alert sent - dispatchers notified")

#### 7. Emergency Contacts Footer (Index.tsx)
Below the form, add a compact footer card with:
- Emergency phone numbers (Police: 114, Fire: 115, Medical: 116)
- A note about when to call vs. when to use the form

#### 8. Prefilled Address Enhancement (Index.tsx)
When a prefilled address is present, show it more prominently with a map-pin icon, structured layout, and a small "Change" link that navigates back to search.

### Technical Details

**Files modified:**
1. `src/pages/Index.tsx` -- the `case 'emergency':` block (lines 775-796): add header badge, safety tips alert, emergency contacts footer, and enhanced prefilled address display
2. `src/components/EmergencyAlertProcessor.tsx` -- enhance the form UI with quick-select type buttons, step indicators, GPS status display, and improved submit area

All changes are purely visual/layout:
- Use existing UI components (`Card`, `Badge`, `Button`, `Alert`, `Separator`)
- Use existing `lucide-react` icons (`Flame`, `Heart`, `Shield`, `Car`, `Phone`, `Info`, `Navigation`)
- Use `t()` translation calls with `defaultValue` fallbacks for new strings
- No new dependencies, APIs, database changes, or business logic modifications
- Preserve all existing functionality: form submission, GPS detection, prefilled address flow, edge function invocation
- Maintain responsive design with existing patterns
