# Biakam National Address System - Comprehensive Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Module Architecture](#module-architecture)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Core Workflows](#core-workflows)
5. [Feature Descriptions](#feature-descriptions)
6. [Administrator Guide](#administrator-guide)
7. [User Guides by Role](#user-guides-by-role)
8. [Technical Documentation](#technical-documentation)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

The Biakam National Address System is a comprehensive digital platform designed to modernize address management and emergency response in Equatorial Guinea. This unified system consists of three tightly integrated modules that work synergistically to provide enhanced public services, emergency response coordination, and data-driven urban planning capabilities.

### Platform Name
**Biakam** - Derived from the indigenous name for Malabo, symbolizing the connection between traditional location references and modern digital addressing.

### Core Mission
- **Standardized Addressing**: Create a universal, structured address system for Equatorial Guinea
- **Emergency Response**: Enable rapid, accurate emergency service dispatch
- **Economic Development**: Facilitate e-commerce, deliveries, and location-based services
- **Urban Planning**: Provide data foundation for infrastructure development
- **Digital Government**: Support smart city initiatives and IoT integration

---

## Module Architecture

### 1. NAR (National Address Registry) Module
The official government-maintained registry of all verified addresses in Equatorial Guinea.

**Purpose**: Authoritative source of truth for national addresses
**Managed By**: Field Agents, Verifiers, Registrars
**Access Level**: Government officials and authorized personnel

**Core Features**:
- Multi-stage address verification workflow
- GPS-based location capture with coordinate validation
- Unified Address Code (UAC) generation
- Photo evidence and documentation management
- Duplicate detection and quality assurance
- Geographic scope-based access control
- Public API for partner integration

**Address Creation Pathways**:

**Pathway 1: Field Agent Workflow**
1. **Draft Creation** - Field agents capture new addresses with GPS and photos
2. **Verification** - Verifiers validate quality and accuracy
3. **Approval** - Registrars review and approve
4. **Publication** - Addresses become publicly searchable

**Pathway 2: Citizen Request Workflow**
1. **Citizen Request** - Citizens submit address creation requests
2. **Auto-Verification** - System performs automated quality checks
3. **Manual Review** - Verifiers review flagged or complex requests
4. **Approval** - Registrars approve and publish to NAR
5. **Publication** - Addresses become publicly searchable

### 2. CAR (Citizen Address Repository) Module
Citizen-managed address declarations where residents can register their home and work addresses.

**Purpose**: Personal address management and residency verification
**Managed By**: Citizens with government verification
**Access Level**: Public (with authentication)

**Core Features**:
- Self-declaration of residence addresses
- Link to verified NAR addresses via UAC
- Multi-address support (primary, secondary)
- Verification request workflow
- Privacy-protected personal information
- Address book management
- QR code generation for address sharing

**Verification Statuses**:
- `SELF_DECLARED` - Initial citizen declaration
- `PENDING_VERIFICATION` - Under government review
- `CONFIRMED` - Verified by authorities
- `REJECTED` - Verification denied
- `ARCHIVED` - Historical record

### 3. Emergency Management Module
Real-time incident management and dispatch coordination for police and emergency services.

**Purpose**: Rapid emergency response with precise location coordination
**Managed By**: Police Dispatchers, Supervisors, and Field Operators
**Access Level**: Law enforcement and emergency services

**Core Features**:
- Real-time incident reporting and tracking
- Intelligent unit dispatch and assignment
- GPS-based location verification
- Encrypted sensitive incident data
- Backup request and coordination
- Response time tracking and analytics
- Multi-unit communication hub
- Performance metrics and SLA monitoring

**Incident Workflow**:
1. **Report** - Citizen reports emergency
2. **Classify** - System categorizes and prioritizes
3. **Locate** - Nearest UAC identified
4. **Dispatch** - Units assigned and notified
5. **Track** - Real-time response monitoring
6. **Resolve** - Incident closure and documentation

---

## User Roles and Permissions

### NAR (National Address Registry) Roles

#### 1. Field Agent
**Purpose**: Capture new addresses in the field with evidence

**Permissions**:
- ✅ Create draft addresses with GPS coordinates
- ✅ Upload photos and supporting documents
- ✅ View own submissions
- ✅ Access offline capture tools
- ❌ Cannot verify or publish addresses

**Geographic Scope**: District-level assignment
**Primary Dashboard**: Field Agent Dashboard (`/field-agent`)

#### 2. Verifier
**Purpose**: Quality assurance and address validation

**Permissions**:
- ✅ Review and verify draft addresses
- ✅ Approve or flag for corrections
- ✅ Detect and merge duplicates
- ✅ Access photo evidence
- ✅ Create quality reports
- ❌ Cannot publish to public registry

**Geographic Scope**: Province-level access
**Primary Dashboard**: Verifier Dashboard (`/verifier`)

#### 3. Registrar
**Purpose**: Final approval and publication authority

**Permissions**:
- ✅ Publish verified addresses to NAR
- ✅ Unpublish addresses when needed
- ✅ All Verifier permissions
- ✅ Manage provincial address hierarchy
- ✅ Override verification decisions
- ✅ Generate official reports

**Geographic Scope**: Province-level authority
**Primary Dashboard**: Registrar Dashboard (`/registrar`)

#### 4. NAR Admin
**Purpose**: System administration and national oversight

**Permissions**:
- ✅ All system permissions
- ✅ Manage API integrations
- ✅ Configure system settings
- ✅ Access all audit logs
- ✅ User management
- ✅ Bulk operations

**Geographic Scope**: National-level access
**Primary Dashboard**: Unified Dashboard (`/unified`)

### CAR (Citizen Address Repository) Roles

#### 5. Citizen
**Purpose**: Personal address management

**Permissions**:
- ✅ Declare residence addresses
- ✅ Request address verification
- ✅ Manage address book (primary/secondary)
- ✅ Search verified NAR addresses
- ✅ Generate QR codes for addresses
- ✅ View verification status
- ❌ Cannot access other citizens' data

**Geographic Scope**: Own addresses only
**Primary Portal**: Citizen Portal (`/citizen-portal`)

### Emergency Management Roles

#### 6. Police Dispatcher
**Purpose**: Emergency call handling and unit dispatch

**Permissions**:
- ✅ Receive and process emergency calls
- ✅ Create and categorize incidents
- ✅ Dispatch units to incidents
- ✅ Monitor real-time unit status
- ✅ Coordinate multi-unit response
- ✅ Access verified address data
- ✅ Send broadcast alerts
- ✅ Track response times

**Geographic Scope**: Dispatch center jurisdiction
**Primary Dashboard**: Police Dashboard (`/police`)

#### 7. Police Operator
**Purpose**: Field response and incident handling

**Permissions**:
- ✅ View assigned incidents
- ✅ Update incident status
- ✅ Request backup support
- ✅ Submit field reports
- ✅ Access incident navigation
- ✅ View unit assignments
- ❌ Cannot dispatch or assign incidents

**Geographic Scope**: Assigned patrol area
**Primary Dashboard**: Police Dashboard (`/police`)

#### 8. Police Supervisor
**Purpose**: Tactical oversight and unit management

**Permissions**:
- ✅ Monitor all incidents in jurisdiction
- ✅ Approve backup requests
- ✅ Review unit performance
- ✅ Generate operational reports
- ✅ Reassign units as needed
- ✅ Access analytics dashboard
- ✅ Manage unit structures

**Geographic Scope**: Regional or departmental
**Primary Dashboard**: Police Dashboard (`/police`)

#### 9. Police Admin
**Purpose**: System administration for police operations

**Permissions**:
- ✅ All police module permissions
- ✅ Manage police users and roles
- ✅ Configure operational settings
- ✅ Access all incident data
- ✅ System integration management
- ✅ Full audit access

**Geographic Scope**: National police operations
**Primary Dashboard**: Police Admin Dashboard

---

## Core Workflows

### NAR Address Creation Workflow

#### Pathway 1: Field Agent Address Registration
```
1. FIELD CAPTURE (Field Agent)
   ↓
   - Visit physical location
   - Capture GPS coordinates (latitude, longitude)
   - Take multiple photos (building, street, landmarks)
   - Record address details (street, building, landmarks)
   - Create draft address record
   - Submit for verification

2. VERIFICATION (Verifier)
   ↓
   - Review photo quality and evidence
   - Validate GPS accuracy
   - Check for duplicates
   - Verify address completeness
   - Approve or flag for corrections
   - Forward to registrar

3. APPROVAL (Registrar)
   ↓
   - Final quality review
   - Approve for publication
   - Generate Unified Address Code (UAC)
   - Publish to national registry
   - Make publicly searchable

4. PUBLICATION
   ↓
   - Address visible in public search
   - Available via API
   - QR code generation enabled
   - Integration with CAR and Emergency modules
```

**SLA**: 48 hours from capture to publication

#### Pathway 2: Citizen Address Request
```
1. CITIZEN REQUEST SUBMISSION
   ↓
   - Citizen logs into system
   - Fills address creation form
   - Provides GPS coordinates or address details
   - Uploads optional documentation
   - Submits request
   - Status: PENDING

2. AUTO-VERIFICATION (System)
   ↓
   - Validate GPS coordinates
   - Check for duplicate addresses
   - Analyze completeness
   - Calculate auto-verification score
   - Flag for manual review if needed
   - Status: AUTO_VERIFIED or FLAGGED

3. MANUAL REVIEW (Verifier - if flagged)
   ↓
   - Review flagged requests
   - Validate accuracy and quality
   - Approve, reject, or request corrections
   - Add reviewer notes
   - Forward approved requests to registrar

4. APPROVAL (Registrar)
   ↓
   - Final quality review
   - Approve for NAR publication
   - Generate Unified Address Code (UAC)
   - Publish to national registry
   - Status: APPROVED

5. PUBLICATION
   ↓
   - Address visible in public NAR search
   - Available via API
   - QR code generation enabled
   - Citizen notified of approval
```

**SLA**: 5 business days for citizen requests

### CAR Address Declaration Workflow

#### Citizen Residency Registration
```
1. SELF-DECLARATION (Citizen)
   ↓
   - Login to citizen portal
   - Search for NAR verified address
   - Declare as primary or secondary residence
   - Provide supporting information
   - Submit verification request
   - Status: SELF_DECLARED

2. VERIFICATION REQUEST
   ↓
   - System flags address for verification
   - Authorities receive notification
   - Field verification scheduled (optional)
   - Status: PENDING_VERIFICATION

3. GOVERNMENT VERIFICATION
   ↓
   - Verifier reviews declaration
   - Cross-reference with NAR data
   - Validate residency claim
   - Approve or reject with reason
   - Status: CONFIRMED or REJECTED

4. CONFIRMED ADDRESS
   ↓
   - Citizen receives confirmation
   - Address added to citizen profile
   - Can be used for official purposes
   - QR code generated for sharing
```

**SLA**: 5 business days for verification

### Emergency Response Workflow

#### Critical Incident Management
```
1. INCIDENT REPORT
   ↓
   - Emergency call received
   - System captures: type, location, priority
   - Location verified using NAR address
   - Reporter information encrypted
   - Incident created with unique ID

2. CLASSIFICATION (Dispatcher)
   ↓
   - Categorize incident type
   - Assign priority level (CRITICAL, HIGH, MEDIUM, LOW)
   - Identify required resources
   - Locate nearest UAC address
   - Calculate proximity to available units

3. DISPATCH (Dispatcher)
   ↓
   - Select optimal unit(s)
   - Assign incident to unit
   - Provide incident briefing
   - Share location and navigation
   - Notify unit via system

4. FIELD RESPONSE (Police Operator)
   ↓
   - Accept assignment
   - Navigate to location using UAC
   - Update status: EN_ROUTE → ARRIVED → IN_PROGRESS
   - Request backup if needed
   - Submit field updates

5. RESOLUTION
   ↓
   - Mark incident RESOLVED
   - Submit final report
   - Record outcome and actions taken
   - Calculate response time metrics
   - Archive incident data
```

**SLA**: 
- Critical incidents: 3 minutes response
- High priority: 8 minutes response  
- Standard: 15 minutes response

---

## Feature Descriptions

### Unified Address Code (UAC) System

**Format**: `GQ-[PROVINCE]-[DISTRICT]-[SEQUENTIAL]`
- Example: `GQ-BN-MAL-001234`
- Province codes: BN (Bioko Norte), etc.
- District codes: MAL (Malabo), etc.
- Sequential: Unique 6-digit number

**Generation**: Automatic upon address publication
**Uniqueness**: Guaranteed at national level
**Persistence**: Never reused, archived on deletion

### Multi-Language Support
- **Spanish** (es) - Primary language
- **French** (fr) - Secondary language  
- **English** (en) - International support
- **Auto-detection**: Browser language preference
- **User override**: Manual language selection

### Offline Capabilities
- Offline address capture (Field Agents)
- Offline incident reporting (Police Operators)
- Offline map viewing (cached tiles)
- Automatic synchronization when online
- Conflict resolution on sync

### QR Code Integration
- Generate QR codes for any verified address
- Scan QR codes to view address details
- Share addresses via QR code
- Print QR codes for physical display
- Emergency access via QR scan

### Map Integration
- **Primary**: Mapbox for interactive maps
- **Secondary**: Google Maps integration
- Real-time location tracking
- Turn-by-turn navigation
- Offline map caching
- Custom map layers for incidents/addresses

### Photo Evidence Management
- Secure cloud storage (Supabase Storage)
- Photo quality analysis
- Automatic compression and optimization
- Multiple photos per address
- Photo viewer with zoom and gallery
- Privacy protection for sensitive images

### Analytics and Reporting
- Address registration statistics
- Verification queue metrics
- Emergency response times
- Unit performance analytics
- Geographic coverage maps
- Export to PDF/CSV

---

## Administrator Guide

### System Configuration

#### User Management
**Location**: Unified Dashboard → User Manager

**Tasks**:
- Create new users
- Assign roles and permissions
- Set geographic scope
- Manage user status (active/inactive)
- Reset passwords
- View user activity logs

#### Role Assignment
```
1. Navigate to User Manager
2. Select user or create new
3. Assign appropriate role(s):
   - NAR roles: field_agent, verifier, registrar, nar_admin
   - CAR roles: citizen (auto-assigned)
   - Police roles: police_dispatcher, police_operator, 
                   police_supervisor, police_admin
4. Set geographic scope (province/district)
5. Save and notify user
```

#### System Settings
- Emergency alert thresholds
- Verification SLA targets
- Auto-verification rules
- API rate limits
- Backup schedules
- Notification preferences

### Monitoring and Maintenance

#### Daily Tasks
- Review pending verification queue
- Monitor emergency response metrics
- Check system health dashboard
- Review audit logs for anomalies
- Validate backup completion

#### Weekly Tasks
- Address quality review
- User activity analysis
- Performance metric reports
- Database optimization
- Security review

#### Monthly Tasks
- Comprehensive system audit
- User role review
- Geographic coverage analysis
- Partner API usage review
- Disaster recovery testing

---

## User Guides by Role

### Field Agent Guide

#### Capturing New Addresses
1. **Prepare for field work**
   - Ensure mobile device charged
   - Enable GPS/location services
   - Download offline maps (if needed)
   - Check camera functionality

2. **At the location**
   - Open Field Agent Dashboard
   - Click "Capture New Address"
   - Wait for GPS lock (accuracy < 10m)
   - Take 3-5 photos (building, street, landmarks)
   - Fill in address details:
     - Street name/description
     - Building number/name
     - Landmarks and references
     - Access notes
   - Review and submit

3. **Photo guidelines**
   - Front of building
   - Street view showing location
   - Nearest intersection or landmark
   - Any identifying features
   - Clear, well-lit images

4. **Quality standards**
   - GPS accuracy < 10 meters
   - Minimum 3 photos
   - Complete address description
   - Clear access instructions
   - No duplicate submissions

### Verifier Guide

#### Address Verification Process
1. **Access verification queue**
   - Login to Verifier Dashboard
   - View pending addresses
   - Filter by priority/date/district

2. **Review address details**
   - Examine GPS coordinates
   - Review photos for quality
   - Check address completeness
   - Verify no duplicates nearby
   - Validate field agent notes

3. **Make decision**
   - **Approve**: If all quality criteria met
   - **Flag for correction**: If issues found
     - Specify correction needed
     - Add reviewer notes
     - Send back to field agent
   - **Reject**: If fundamental issues
     - Provide detailed reason
     - Document decision

4. **Quality criteria**
   - GPS accuracy verified
   - Photos clear and relevant
   - No duplicate addresses within 20m
   - Address description complete
   - Meets naming standards

### Citizen Guide

#### Declaring Your Address
1. **Access citizen portal**
   - Navigate to `/citizen-portal`
   - Login or create account
   - Verify email address

2. **Search for your address**
   - Use address search
   - Browse map to find location
   - Enter UAC if known
   - Select verified NAR address

3. **Declare residence**
   - Click "Declare This Address"
   - Choose type: Primary or Secondary
   - Add personal notes (optional)
   - Submit verification request

4. **Track verification**
   - View status in dashboard
   - Receive email notifications
   - Check verification timeline
   - Respond to verification requests

### Police Dispatcher Guide

#### Handling Emergency Calls
1. **Receive incident report**
   - Emergency call or system alert
   - Capture caller information
   - Record incident details
   - Verify location (UAC or description)

2. **Create incident**
   - Classify incident type
   - Assign priority level
   - Link to verified address
   - Add incident notes

3. **Dispatch units**
   - View available units
   - Select optimal unit(s)
   - Assign incident
   - Provide briefing
   - Monitor response

4. **Coordinate response**
   - Track unit status
   - Facilitate communication
   - Approve backup requests
   - Update incident progress
   - Close incident when resolved

---

## Technical Documentation

### Technology Stack

#### Frontend
- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Maps**: Mapbox GL JS, Google Maps API
- **i18n**: i18next, react-i18next

#### Backend
- **Platform**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth (JWT-based)
- **Database**: PostgreSQL with PostGIS extension
- **Storage**: Supabase Storage (S3-compatible)
- **Edge Functions**: Deno runtime
- **Real-time**: WebSocket subscriptions

#### Mobile
- **Framework**: Capacitor 7
- **Platforms**: iOS, Android
- **Native Features**: Camera, Geolocation, QR Scanner

### Database Schema

#### Core Tables
```sql
-- User management
profiles (id, user_id, full_name, email, phone, created_at)
user_roles (id, user_id, role, created_at)
user_role_metadata (id, user_id, scope_type, scope_value)

-- NAR module
addresses (id, uac, coordinates, address_text, status, verified_at)
address_requests (id, user_id, address_id, status, submitted_at)
address_photos (id, address_id, photo_url, uploaded_at)

-- CAR module  
citizen_addresses (id, user_id, address_id, verification_status, type)
residency_verifications (id, citizen_address_id, verified_by, status)

-- Emergency module
emergency_incidents (id, type, priority, status, location, created_at)
emergency_units (id, name, type, status, current_location)
emergency_unit_members (id, unit_id, user_id, role)
backup_requests (id, incident_id, requesting_unit, status)
```

#### Security Functions
```sql
-- Role checking
has_role(user_id UUID, role_name TEXT) → BOOLEAN
get_user_role(user_id UUID) → app_role
has_role_with_scope(user_id UUID, role TEXT, scope_type TEXT, scope_value TEXT) → BOOLEAN

-- UAC generation
generate_unified_uac_unique() → TEXT

-- Address search
search_addresses_safely(query TEXT) → TABLE
```

### API Endpoints

#### Edge Functions
```
/address-search-api - Public address search
/address-validation-api - Coordinate validation  
/auto-verify-address - Automatic verification
/analyze-coordinates - GPS accuracy check
/analyze-photo-quality - Image quality analysis
/generate-missing-uacs - Batch UAC generation
/process-emergency-alert - Emergency processing
/notify-emergency-operators - Alert dispatchers
/decrypt-incident-data - Secure incident access
/unit-communications - Unit messaging
```

### Environment Configuration

#### Required Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]

# Maps
VITE_MAPBOX_TOKEN=[mapbox-token]
VITE_GOOGLE_MAPS_API_KEY=[google-key]

# Features
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_QR_CODES=true
```

---

## Troubleshooting

### Common Issues

#### Address Not Appearing After Submission
**Symptoms**: Address captured but not visible in verification queue
**Causes**: 
- GPS accuracy insufficient
- Missing required fields
- Photo upload failed

**Solutions**:
1. Check GPS accuracy (should be < 10m)
2. Verify all required fields completed
3. Ensure minimum 3 photos uploaded
4. Check network connectivity
5. Review field agent dashboard for error messages

#### Verification Queue Empty
**Symptoms**: Verifier sees no pending addresses
**Causes**:
- All addresses verified
- Geographic scope restriction
- Filter settings too restrictive

**Solutions**:
1. Check filter settings
2. Verify geographic scope assignment
3. Confirm addresses exist in system
4. Check role permissions

#### Emergency Dispatch Not Receiving Incidents
**Symptoms**: Incidents created but dispatcher not notified
**Causes**:
- Notification system disabled
- Dispatcher offline
- Role assignment issue

**Solutions**:
1. Verify dispatcher online status
2. Check notification settings
3. Confirm dispatcher role assigned correctly
4. Review incident priority settings

#### Offline Sync Failing
**Symptoms**: Data not synchronizing when online
**Causes**:
- Network connectivity issues
- Conflicting changes
- Storage quota exceeded

**Solutions**:
1. Check internet connection
2. Clear offline cache
3. Manually trigger sync
4. Resolve data conflicts
5. Check storage quota

### Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| AUTH_001 | Invalid credentials | Re-login |
| AUTH_002 | Session expired | Refresh session |
| ADDR_001 | Duplicate address | Review nearby addresses |
| ADDR_002 | Invalid GPS | Recapture coordinates |
| PHOTO_001 | Upload failed | Retry upload |
| EMERG_001 | Unit unavailable | Select different unit |
| SYNC_001 | Conflict detected | Review and resolve |

### Support Contacts

**Technical Support**: tech-support@biakam.gq
**Emergency Issues**: emergency-support@biakam.gq  
**System Administrator**: admin@biakam.gq

---

*Last Updated: January 2025*
*System Version: 2.0*
*Document Version: 2.0*