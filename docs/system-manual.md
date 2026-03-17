# ConEG National Digital Services Platform - Comprehensive Manual

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

The ConEG National Digital Services Platform is a comprehensive digital platform designed to modernize address management, emergency response, and postal delivery services in Equatorial Guinea. This unified system consists of four tightly integrated modules that work synergistically to provide enhanced public services, emergency response coordination, postal delivery management, and data-driven urban planning capabilities.

### Platform Name
**ConEG** - Connect Equatorial Guinea, symbolizing the connection between citizens, government services, and modern digital infrastructure.

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
**Managed By**: Field Agents, Verifiers, Registrars, NAR Admins
**Access Level**: Government officials and authorized personnel

**Core Features**:
- Multi-stage address verification workflow
- GPS-based location capture with coordinate validation
- Unified Address Code (UAC) generation
- Photo evidence and documentation management
- Duplicate detection and quality assurance
- Geographic scope-based access control
- Auto-publishing based on address type
- Public API for partner integration
- Business address registration and directory

**Address Creation Pathways**:

**Pathway 1: Field Agent Workflow**
1. **Draft Creation** - Field agents capture new addresses with GPS and photos
2. **Verification** - Verifiers validate quality and accuracy
3. **Approval** - Registrars review and approve
4. **Auto-Publication** - Non-residential addresses auto-published; residential addresses remain private

**Pathway 2: Citizen Request Workflow (Authenticated Only)**
1. **Citizen Request** - Citizens submit address creation requests via authenticated Citizen Portal
2. **Auto-Verification** - System performs automated quality checks
3. **Manual Review** - Verifiers review flagged or complex requests
4. **Approval** - Registrars approve and auto-publish based on address type
5. **Notification** - Citizens receive approval notification
   
**⚠️ Important**: Address request submission requires authentication and is only available in the Citizen Portal, not the Public Portal.

#### Business Address Subsystem
The NAR module includes comprehensive business address management:

**Business Categories**:
- `retail` - Retail shops and stores
- `restaurant` - Restaurants and food service
- `healthcare` - Medical facilities and pharmacies
- `education` - Schools and training centers
- `government` - Government offices and services
- `financial` - Banks and financial institutions
- `hospitality` - Hotels and accommodation
- `professional` - Professional services (legal, accounting)
- `industrial` - Manufacturing and warehouses
- `religious` - Churches and religious centers
- `entertainment` - Entertainment venues
- `transportation` - Transport services
- `utilities` - Utility providers
- `nonprofit` - NGOs and charitable organizations
- `other` - Other business types

**Business Address Types**:
- `COMMERCIAL` - Commercial/retail establishments
- `HEADQUARTERS` - Company headquarters
- `BRANCH` - Branch offices
- `WAREHOUSE` - Storage and distribution
- `INDUSTRIAL` - Industrial facilities
- `GOVERNMENT` - Government buildings

### 2. CAR (Citizen Address Repository) Module
Citizen-managed address declarations where residents can register their home and work addresses.

**Purpose**: Personal address management and residency verification
**Managed By**: Citizens with government verification
**Access Level**: Public (with authentication)

**Core Features**:
- Self-declaration of residence addresses
- Link to verified NAR addresses via UAC
- Multi-address support (primary, secondary)
- Household management (dependents, members)
- Auto-approval for verified NAR addresses
- Verification request workflow
- Privacy-protected personal information (PRIVATE, REGION_ONLY, PUBLIC)
- Address book management
- QR code generation for address sharing

**Verification Statuses**:
- `SELF_DECLARED` - Initial citizen declaration
- `CONFIRMED` - Verified by authorities or auto-approved via NAR link
- `REJECTED` - Verification denied
- Note: System automatically approves declarations linked to verified NAR addresses via `trigger_auto_approve_citizen_address()`

**Household Management**:
- Household groups with head-of-household
- Dependent management (minors, elderly, disabled)
- Member relationships tracking
- Custody arrangements support
- Household succession handling

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
4. **Dispatch** - Units assigned (status auto-updates to 'dispatched')
5. **Track** - Real-time response monitoring
6. **Resolve** - Incident closure and documentation

---

## User Roles and Permissions

The system implements 20+ distinct roles organized by module with verification domain scoping for flexible permission management.

### NAR (National Address Registry) Roles

#### 1. Field Agent
**Purpose**: Capture new addresses in the field with evidence

**Permissions**:
- ✅ Submit addresses via address_requests table (pending status)
- ✅ Upload photos and supporting documents
- ✅ View own submissions
- ✅ Access offline capture tools
- ✅ View addresses within geographic scope
- ❌ Cannot directly create verified addresses
- ❌ Cannot verify or publish addresses

**Geographic Scope**: District-level assignment
**Primary Dashboard**: Unified Dashboard → Field Agent view

#### 2. Verifier (Unified)
**Purpose**: Quality assurance and address/residency validation

The verifier role uses **verification domain scope** to determine capabilities:
- `verification_domain: 'nar'` - NAR address verification only
- `verification_domain: 'car'` - CAR/residency verification only
- `verification_domain: 'both'` - Both NAR and CAR verification

**Permissions (NAR Domain)**:
- ✅ Review and verify draft addresses
- ✅ Set verified=true via approve_address_request()
- ✅ Detect and merge duplicates
- ✅ Access photo evidence
- ✅ Flag addresses for review
- ✅ Create quality reports
- ❌ Cannot set public=true (auto-handled by system)

**Permissions (CAR Domain)**:
- ✅ Review citizen address declarations
- ✅ Verify residency claims
- ✅ Update citizen_address status via set_citizen_address_status()
- ✅ Access residency verification requests
- ✅ Review supporting documentation

**Geographic Scope**: Province-level access
**Primary Dashboard**: Unified Dashboard → Verifier view

#### 3. Registrar
**Purpose**: Final approval and publication authority

**Permissions**:
- ✅ All Verifier permissions (both NAR and CAR)
- ✅ Override auto-publishing decisions
- ✅ Unpublish addresses when needed (set public=false)
- ✅ Manage provincial address hierarchy
- ✅ Override verification decisions
- ✅ Generate official reports
- ✅ Approve address requests (includes verification + auto-publication)

**Geographic Scope**: Province-level authority
**Primary Dashboard**: Unified Dashboard → Registrar view

#### 4. NAR Admin (NDAA Admin)
**Purpose**: System administration and national oversight

**Permissions**:
- ✅ All system permissions for NAR module
- ✅ Manage API integrations
- ✅ Configure system settings
- ✅ Access all audit logs
- ✅ User management
- ✅ Bulk operations
- ✅ Quality dashboard access

**Geographic Scope**: National-level access
**Primary Dashboard**: Unified Dashboard → Admin view

### CAR (Citizen Address Repository) Roles

#### 5. Citizen
**Purpose**: Personal address management and address request submission

**Permissions**:
- ✅ **Submit address creation requests** (via authenticated Citizen Portal only)
- ✅ Declare residence addresses (CAR)
- ✅ Request address verification
- ✅ Manage address book (primary/secondary)
- ✅ Manage household members and dependents
- ✅ Search verified NAR addresses (via Public or Citizen Portal)
- ✅ Generate QR codes for addresses
- ✅ View verification status
- ✅ Set privacy preferences (PRIVATE, REGION_ONLY, PUBLIC)
- ❌ Cannot access other citizens' data
- ❌ Cannot submit address requests via Public Portal

**Geographic Scope**: Own addresses only
**Primary Portal**: Citizen Portal (`/citizen-portal`)

#### 6. CAR Admin
**Purpose**: CAR module administration

**Permissions**:
- ✅ Full CAR module access
- ✅ Manage person records
- ✅ Merge duplicate persons
- ✅ Access address history
- ✅ Review all citizen addresses
- ✅ Update address status
- ✅ Verify residency claims
- ✅ Access CAR analytics

**Geographic Scope**: National or regional
**Primary Dashboard**: Unified Dashboard → CAR Admin view

### Emergency Management Roles

#### 7. Police Dispatcher
**Purpose**: Emergency call handling, unit dispatch, and backup request coordination

**Permissions**:
- ✅ Receive and process emergency calls
- ✅ Create and categorize incidents
- ✅ Dispatch units to incidents
- ✅ Monitor real-time unit status
- ✅ Coordinate multi-unit response
- ✅ Access verified address data
- ✅ Send broadcast alerts
- ✅ Track response times
- ✅ **Backup Requests - Coordinator Actions**:
  - Acknowledge receipt of backup requests
  - Mark backup units as en route
  - Mark backup units as on scene
  - Escalate requests to supervisors
- ❌ Cannot approve or deny backup requests (supervisor only)
- ❌ Cannot modify backup request priority (supervisor only)

**Geographic Scope**: Dispatch center jurisdiction
**Primary Dashboard**: Police Dashboard (`/police`)

#### 8. Police Operator
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

#### 9. Police Supervisor
**Purpose**: Tactical oversight, unit management, and backup request approval authority

**Permissions**:
- ✅ Monitor all incidents in jurisdiction
- ✅ Review unit performance
- ✅ Generate operational reports
- ✅ Reassign units as needed
- ✅ Access analytics dashboard
- ✅ Manage unit structures
- ✅ **Backup Requests - Full Authority**:
  - All coordinator actions (acknowledge, en route, on scene)
  - Approve backup requests
  - Deny backup requests (with reason)
  - Modify backup request priority
  - Handle escalated requests from dispatchers

**Geographic Scope**: Regional or departmental
**Primary Dashboard**: Police Dashboard (`/police`)

#### 10. Police Admin
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

### Administrative Roles

#### 11. Admin (System Admin)
**Purpose**: Full system administration

**Permissions**:
- ✅ All system permissions across all modules
- ✅ User and role management
- ✅ System configuration
- ✅ Integration management
- ✅ Security settings
- ✅ Backup and recovery operations

**Geographic Scope**: National
**Primary Dashboard**: Unified Dashboard → Admin view

#### 12. Data Steward
**Purpose**: Data quality and governance

**Permissions**:
- ✅ Data quality monitoring
- ✅ Duplicate detection and merging
- ✅ Data cleanup operations
- ✅ Quality metrics reporting
- ❌ Cannot modify system configuration

**Geographic Scope**: National
**Primary Dashboard**: Unified Dashboard → Quality view

#### 13. Support
**Purpose**: User support and issue resolution

**Permissions**:
- ✅ View user profiles (limited)
- ✅ View address data (read-only)
- ✅ Access support tickets
- ❌ Cannot modify data

**Geographic Scope**: As assigned
**Primary Dashboard**: Support Dashboard

#### 14. Auditor
**Purpose**: System audit and compliance

**Permissions**:
- ✅ Read-only access to all data
- ✅ Access audit logs
- ✅ Generate compliance reports
- ❌ Cannot modify any data

**Geographic Scope**: National
**Primary Dashboard**: Audit Dashboard

#### 15. Partner
**Purpose**: External partner API access

**Permissions**:
- ✅ API access (verified addresses only)
- ✅ Public address search
- ❌ No dashboard access
- ❌ Cannot modify data

**Geographic Scope**: API only
**Primary Dashboard**: None (API access)

### Role Metadata and Scoping

Roles support additional metadata for fine-grained access control:

**Geographic Scope Types**:
- `national` - Full country access
- `province` - Province-level restriction
- `city` - City-level restriction
- `district` - District-level restriction

**Verification Domain Scope** (for verifiers):
- `nar` - NAR address verification
- `car` - CAR/residency verification
- `both` - Both domains

**Unit Scope** (for police roles):
- Assigned emergency unit ID
- Unit role (lead, member)

---

## Core Workflows

### Unified Address Request Workflow

The system provides a unified flow for all address-related requests:

```
1. USER INITIATES REQUEST
   ↓
   - User accesses Unified Address Request
   - Chooses request type:
     a) Declare existing address (CAR)
     b) Register business at existing address
     c) Request new address creation (NAR)
   
2. ADDRESS LOOKUP (Step 1)
   ↓
   - Search by UAC code
   - Search by location/map
   - Browse verified addresses
   - If found → proceed to declaration
   - If not found → create new address request

3. DECLARATION/REGISTRATION (Step 2)
   ↓
   For CAR Declaration:
     - Select primary or secondary
     - Choose scope (BUILDING or UNIT)
     - Provide unit UAC if applicable
     - Submit declaration
   
   For Business Registration:
     - Provide business details
     - Select business category
     - Add contact information
     - Specify operating hours
     - Submit for approval

4. AUTO-APPROVAL CHECK
   ↓
   - CAR: If UAC exists in verified NAR → auto-approve to CONFIRMED
   - Business: Requires manual review
   - NAR request: Standard verification workflow

5. COMPLETION
   ↓
   - User notified of status
   - Address linked to profile
   - Available for official use
```

### NAR Address Creation Workflow

#### Pathway 1: Field Agent Address Submission
```
1. FIELD CAPTURE (Field Agent)
   ↓
   - Visit physical location
   - Capture GPS coordinates (latitude, longitude)
   - Take multiple photos (building, street, landmarks)
   - Record address details (street, building, landmarks)
   - Submit to address_requests table (status: pending)

2. VERIFICATION (Verifier)
   ↓
   - Review photo quality and evidence
   - Validate GPS accuracy
   - Check for duplicates via check_address_duplicates()
   - Verify address completeness
   - Approve via approve_address_request() → sets verified=true
   - Or flag for corrections

3. AUTO-PUBLICATION (System)
   ↓
   - Address type checked:
     - Non-residential (business, government, landmark) → public=true
     - Residential → public=false
   - UAC generated via generate_unified_uac_unique()
   - Address visible based on public status

4. AVAILABILITY
   ↓
   - Public addresses visible in search
   - Available via API
   - QR code generation enabled
   - Integration with CAR and Emergency modules
```

**SLA**: 48 hours from capture to publication

#### Pathway 2: Citizen Address Request
```
1. CITIZEN REQUEST SUBMISSION (Authenticated Citizen Portal Only)
   ↓
   - Citizen logs into Citizen Portal (authentication required)
   - Accesses address request form
   - Provides GPS coordinates or address details
   - Uploads optional documentation
   - Submits request (status: pending)

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

4. APPROVAL & AUTO-PUBLICATION
   ↓
   - Registrar final review (optional)
   - approve_address_request() called
   - Auto-publishing based on address type:
     - Non-residential → public=true
     - Residential → public=false
   - UAC generated
   - Citizen notified

5. AVAILABILITY
   ↓
   - Address in registry
   - Citizen can link to CAR
   - Available for official purposes
```

**SLA**: 5 business days for citizen requests

### Business Address Registration Workflow

```
1. BUSINESS REQUEST INITIATION
   ↓
   - User selects "Register Business Address"
   - Chooses existing address or requests new
   - Provides business information:
     - Organization name
     - Business category
     - Business address type
     - Registration/tax numbers
     - Contact details
     - Operating hours
     - Services offered

2. ADDRESS SELECTION/CREATION
   ↓
   - If existing address:
     - Link business to existing UAC
     - Create organization_addresses record
   - If new address:
     - Submit NAR address request
     - Include business metadata in verification_analysis

3. VERIFICATION
   ↓
   - Verifier reviews business request
   - Validates business information completeness
   - Checks organization_name and business_category required
   - approve_business_address_request() function handles both:
     - Address approval
     - Organization record creation

4. AUTO-PUBLICATION
   ↓
   - Business addresses always set public=true
   - Available in Business Directory
   - Searchable by public

5. DIRECTORY LISTING
   ↓
   - Business appears in public directory
   - Filterable by category, location
   - Contact info displayed (if show_contact_info=true)
   - Operating hours shown
```

### CAR Address Declaration Workflow

#### Citizen Residency Registration
```
1. SELF-DECLARATION (Citizen)
   ↓
   - Login to citizen portal
   - Search for NAR verified address
   - Declare as primary or secondary residence
   - Provide supporting information (unit_uac for apartments)
   - Select privacy level (PRIVATE, REGION_ONLY, PUBLIC)
   - Submit declaration
   - Status: SELF_DECLARED

2. AUTO-APPROVAL CHECK (System)
   ↓
   - Trigger: trigger_auto_approve_citizen_address()
   - Checks if UAC exists in verified NAR addresses
   - If verified NAR match found → Auto-approve to CONFIRMED
   - If no match → Status remains SELF_DECLARED
   - Event logged via log_auto_approval_event()

3. MANUAL VERIFICATION (If not auto-approved)
   ↓
   - CAR verifier reviews declaration
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
   - Privacy settings applied
```

**SLA**: Instant for auto-approved, 5 business days for manual verification

### Emergency Response Workflow

#### Critical Incident Management
```
1. INCIDENT REPORT
   ↓
   - Emergency call received
   - System captures: type, location, priority
   - Location verified using NAR address
   - Reporter information encrypted
   - Incident created with unique ID (INC-YYYY-XXXXXX)
   - incident_uac generated

2. CLASSIFICATION (Dispatcher)
   ↓
   - Categorize incident type
   - Assign priority level (CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1)
   - Identify required resources
   - Locate nearest UAC address
   - Calculate proximity to available units

3. DISPATCH (Dispatcher)
   ↓
   - Select optimal unit(s)
   - Assign incident to unit (updates assigned_units array)
   - auto_update_incident_status() trigger fires
   - Status automatically changes to 'dispatched'
   - dispatched_at timestamp set
   - Unit notified via notify-unit-assignment

4. FIELD RESPONSE (Police Operator)
   ↓
   - Accept assignment
   - Navigate to location using UAC
   - Update status: responding → on_scene
   - Request backup if needed via RequestBackupDialog
   - Submit field updates

5. RESOLUTION
   ↓
   - Mark incident RESOLVED
   - Submit final report
   - Record outcome and actions taken
   - resolved_at timestamp set
   - Calculate response time metrics
   - Notify reporter (if applicable)
   - Archive incident data
```

**SLA**: 
- Critical incidents: 3 minutes response
- High priority: 8 minutes response  
- Standard: 15 minutes response

---

## Feature Descriptions

### Unified Address Code (UAC) System

**Format**: `[COUNTRY]-[REGION]-[CITY]-[SEQUENCE][CHECK]`
- Example: `GQ-BN-MAL-001A00-XY`
- Country codes: GQ (Equatorial Guinea), AO (Angola), CM (Cameroon), etc.
- Region codes: BN (Bioko Norte), BS (Bioko Sur), LI (Litoral), etc.
- City codes: MAL (Malabo), BAT (Bata), EBE (Ebebiyín), etc.
- Sequential: Unique 6-character alphanumeric
- Check digits: 2-character validation

**Generation**: Automatic upon address approval via `generate_unified_uac_unique()`
**Uniqueness**: Guaranteed at national level via `uac_sequence_counters` table
**Persistence**: Never reused, archived on deletion

### Auto-Publishing Policy

Upon address approval, the system automatically sets publication status:

**Public (public=true)**:
- Business addresses
- Commercial addresses
- Government addresses
- Landmark addresses
- Institutional addresses
- Industrial addresses
- Public service addresses

**Private (public=false)**:
- Residential addresses
- All other address types

This eliminates manual publishing steps while respecting residential privacy.

### Multi-Language Support
- **Spanish** (es) - Primary language
- **French** (fr) - Secondary language  
- **English** (en) - International support
- **Auto-detection**: Browser language preference
- **User override**: Manual language selection
- **Translation Management**: Runtime fixes via translation_fixes table

### Map Integration with Fallback

**Primary**: Google Maps / Mapbox
- Full-featured interactive maps
- Turn-by-turn navigation
- Street view integration

**Fallback**: OpenStreetMap / Leaflet
- Automatic activation when Google Maps billing not enabled
- Transparent failover to users
- Warning banner displayed
- All features work with OSM tiles

**Universal Map Components**:
- `UniversalFieldMap` - Field capture with fallback
- `UniversalLocationMap` - Location display with fallback
- `UniversalLocationPicker` - Location selection with fallback

### Offline Capabilities
- Offline address capture (Field Agents)
- Offline incident reporting (Police Operators)
- Offline map viewing (cached tiles)
- Automatic synchronization when online
- Conflict resolution on sync
- Local authentication (encrypted IndexedDB)

### QR Code Integration
- Generate QR codes for any verified address
- Scan QR codes to view address details
- Share addresses via QR code
- Print QR codes for physical display
- Emergency access via QR scan

### Photo Evidence Management
- Secure cloud storage (Supabase Storage)
- Photo quality analysis via edge function
- Automatic compression and optimization
- Multiple photos per address (min 3)
- Photo viewer with zoom and gallery
- Privacy protection for sensitive images

### Business Directory
- Public searchable business listings
- Filter by category, location, services
- Operating hours display
- Contact information (configurable visibility)
- Map integration
- Expandable card detail view

### Household Management
- Create household groups
- Designate head of household
- Add members with relationships
- Manage dependents (minors, elderly, disabled)
- Custody arrangements for shared dependents
- Household address synchronization
- Succession planning

### Rejected Items Retention Policy

**Active Period (0-6 months)**:
- Full records in main tables
- Complete PII retained
- Users can resubmit or delete

**Archive Period (6-24 months)**:
- Moved to archive tables:
  - `rejected_requests_archive`
  - `rejected_citizen_addresses_archive`
  - `rejected_verifications_archive`
- PII preserved for appeals

**Anonymization (24+ months)**:
- PII removed from archives
- Statistical data retained
- Monthly cleanup via `anonymize_archived_records()`

### Analytics and Reporting
- Address registration statistics
- Verification queue metrics
- Emergency response times
- Unit performance analytics
- Geographic coverage maps
- CAR adoption metrics
- Household analytics
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
- Set verification domain (for verifiers)
- Manage user status (active/inactive)
- Reset passwords
- View user activity logs

#### Role Assignment
```
1. Navigate to User Manager
2. Select user or create new
3. Assign appropriate role(s):
   - NAR roles: field_agent, verifier, registrar, ndaa_admin
   - CAR roles: citizen (auto-assigned), car_admin
   - Police roles: police_dispatcher, police_operator, 
                   police_supervisor, police_admin
   - Admin roles: admin, data_steward, support, auditor
4. Set geographic scope (national/province/city/district)
5. Set verification domain if verifier (nar/car/both)
6. Save and notify user
```

#### System Settings
- Emergency alert thresholds
- Verification SLA targets
- Auto-verification rules
- Auto-publishing rules
- API rate limits
- Backup schedules
- Notification preferences
- Map provider configuration
- Retention policy settings

### Monitoring and Maintenance

#### Daily Tasks
- Review pending verification queue
- Monitor emergency response metrics
- Check system health dashboard
- Review audit logs for anomalies
- Validate backup completion
- Check edge function error rates

#### Weekly Tasks
- Address quality review
- User activity analysis
- Performance metric reports
- Database optimization
- Security review
- Translation audit

#### Monthly Tasks
- Comprehensive system audit
- User role review
- Geographic coverage analysis
- Partner API usage review
- Disaster recovery testing
- Retention policy execution review
- Archive cleanup verification

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
   - Open Dashboard → Capture Address
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

**Note**: Field agents submit to address_requests table. Submissions require verification before becoming official NAR addresses.

### Verifier Guide

#### Address Verification Process
1. **Access verification queue**
   - Login to Dashboard
   - Navigate to Verification Queue
   - Filter by priority/date/district
   - Note: Only addresses within your geographic scope appear

2. **Review address details**
   - Examine GPS coordinates
   - Review photos for quality
   - Check address completeness
   - Verify no duplicates nearby (system checks automatically)
   - Validate field agent notes

3. **Make decision**
   - **Approve**: If all quality criteria met
     - Calls approve_address_request()
     - Sets verified=true
     - Auto-publishes based on address type
     - Generates UAC automatically
   - **Flag for correction**: If issues found
     - Specify correction needed
     - Add reviewer notes
     - Send back to submitter
   - **Reject**: If fundamental issues
     - Provide detailed reason
     - Document decision
     - Submitter can resubmit after corrections

4. **Quality criteria**
   - GPS accuracy verified
   - Photos clear and relevant
   - No duplicate addresses within 20m
   - Address description complete
   - Meets naming standards

#### CAR Verification (if verification_domain includes 'car')
1. Access Residency Verification queue
2. Review citizen declarations
3. Check supporting documentation
4. Verify against NAR records
5. Approve or reject with reason

### Citizen Guide

#### Declaring Your Address
1. **Access citizen portal**
   - Navigate to Citizen Portal
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
   - Select scope: BUILDING or UNIT
   - Enter unit UAC if applicable
   - Set privacy level
   - Add personal notes (optional)
   - Submit declaration

4. **Track verification**
   - If UAC verified in NAR → auto-approved instantly
   - Otherwise, view status in dashboard
   - Receive email notifications
   - Respond to verification requests

#### Registering a Business
1. Access Unified Address Request
2. Select "Register Business"
3. Search for or create address
4. Fill business details:
   - Organization name
   - Category
   - Contact information
   - Operating hours
5. Submit for approval
6. Track status in My Businesses

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
   - Assign incident (status auto-updates to 'dispatched')
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
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Maps**: Google Maps, Mapbox, OpenStreetMap/Leaflet (fallback)
- **i18n**: i18next, react-i18next
- **Forms**: React Hook Form + Zod validation

#### Backend
- **Platform**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth (JWT-based)
- **Database**: PostgreSQL with PostGIS extension
- **Storage**: Supabase Storage (S3-compatible)
- **Edge Functions**: Deno runtime (52+ functions)
- **Real-time**: WebSocket subscriptions

#### Mobile
- **Framework**: Capacitor 7
- **Platforms**: iOS, Android
- **Native Features**: Camera, Geolocation, QR Scanner

### Database Schema

#### Core Tables
```sql
-- User management
profiles (id, user_id, full_name, email, phone, national_id, created_at)
user_roles (id, user_id, role, created_at)
user_role_metadata (id, user_role_id, scope_type, scope_value)
person (id, auth_user_id, national_id, created_at)

-- NAR module
addresses (id, uac, latitude, longitude, street, city, region, country, 
           verified, public, address_type, business_address_type, photo_url,
           completeness_score, iso_compliance_score, created_at)
address_requests (id, requester_id, latitude, longitude, status, 
                  auto_verification_score, verification_analysis, 
                  reviewed_by, rejected_by, created_at)
organization_addresses (id, address_id, organization_name, business_category,
                        business_address_type, primary_contact_name,
                        operating_hours, created_by)

-- CAR module  
citizen_address (id, person_id, uac, unit_uac, address_kind, scope, status,
                 privacy_level, searchable_by_public, effective_from, 
                 effective_to, household_group_id)
citizen_address_event (id, person_id, citizen_address_id, event_type, 
                       actor_id, payload, at)
household_groups (id, household_name, household_head_person_id, primary_uac,
                  household_status, verified_by_car)
household_members (id, household_group_id, person_id, relationship_to_head,
                   household_role, membership_status)
household_dependents (id, guardian_person_id, full_name, date_of_birth,
                      dependent_type, relationship_to_guardian)
residency_ownership_verifications (id, user_id, uac, verification_type,
                                   status, verifier_notes)

-- Emergency module
emergency_incidents (id, incident_number, incident_uac, emergency_type, 
                     status, priority_level, assigned_units[], 
                     encrypted_message, dispatched_at, resolved_at)
emergency_units (id, unit_name, unit_code, unit_type, status,
                 location_latitude, location_longitude, coverage_region)
emergency_unit_members (id, unit_id, officer_id, role, is_lead)
emergency_notifications (id, user_id, incident_id, title, message, 
                         priority_level, read)

-- Archive tables
rejected_requests_archive (id, original_id, requester_id, archived_at,
                           anonymized_at, retention_metadata)
rejected_citizen_addresses_archive (id, original_id, person_id, archived_at,
                                    anonymized_at, retention_metadata)
rejected_verifications_archive (id, original_id, user_id, archived_at,
                                anonymized_at, retention_metadata)
```

#### Security Functions
```sql
-- Role checking
has_role(_user_id UUID, _role app_role) → BOOLEAN
get_user_role(_user_id UUID) → app_role
has_role_with_scope(_user_id UUID, _role app_role, _scope_type TEXT, 
                    _scope_value TEXT) → BOOLEAN

-- Address operations
generate_unified_uac_unique(country, region, city, address_id) → TEXT
approve_address_request(request_id, approved_by) → UUID
approve_business_address_request(request_id, approved_by) → JSONB
check_address_duplicates(lat, lng, street, city, region, country) → JSONB
flag_address_for_review(address_id, reason, analysis, recommendations) → BOOLEAN

-- CAR operations
add_secondary_address(person_id, scope, uac, unit_uac, source) → UUID
set_primary_address(person_id, scope, uac, unit_uac, effective_date) → UUID
set_citizen_address_status(address_id, status, actor_id) → VOID
trigger_auto_approve_citizen_address() → TRIGGER
log_auto_approval_event() → TRIGGER

-- Retention operations
archive_old_rejected_requests() → JSONB
archive_old_rejected_citizen_addresses() → JSONB
archive_old_rejected_verifications() → JSONB
anonymize_archived_records() → JSONB

-- Emergency operations
generate_incident_number() → TEXT
generate_incident_uac(country, region, city, incident_id) → TEXT
auto_update_incident_status() → TRIGGER
```

### Edge Functions (42+)

**Address Management**:
- `address-search-api` - Public search endpoint
- `address-validation-api` - Coordinate validation
- `auto-verify-address` - Automated verification
- `analyze-coordinates` - GPS accuracy check
- `analyze-photo-quality` - Image quality analysis
- `generate-missing-uacs` - Batch UAC generation
- `address-webhook-triggers` - Partner notifications
- `register-business-address` - Business registration
- `search-citizen-addresses` - CAR search

**Emergency Management**:
- `process-emergency-alert` - Alert processing
- `notify-emergency-operators` - Dispatcher alerts
- `notify-incident-reporter` - Citizen updates
- `notify-unit-assignment` - Unit notifications
- `decrypt-incident-data` - Secure data access
- `police-incident-actions` - Incident operations
- `process-backup-request` - Backup coordination
- `unit-communications` - Inter-unit messaging

**Analytics & Reporting**:
- `unified-address-analytics` - System analytics
- `unified-address-statistics` - Statistical reports
- `coverage-analytics-api` - Coverage metrics
- `track-search-analytics` - Search tracking
- `advanced-analytics-api` - Advanced reporting

**Administration**:
- `admin-user-operations` - User management
- `admin-address-requests` - Request handling
- `police-operator-management` - Police user ops
- `cleanup-rejected-items` - Retention enforcement
- `save-translation-fix` - Translation management
- `suggest-translation` - AI translation suggestions

---

## Troubleshooting

### Common Issues

#### Address Not Appearing After Submission
**Symptoms**: Address captured but not visible in verification queue
**Causes**: 
- GPS accuracy insufficient
- Missing required fields
- Photo upload failed
- Geographic scope mismatch

**Solutions**:
1. Check GPS accuracy (should be < 10m)
2. Verify all required fields completed
3. Ensure minimum 3 photos uploaded
4. Check network connectivity
5. Verify submitter's geographic scope matches address location

#### Verification Queue Empty
**Symptoms**: Verifier sees no pending addresses
**Causes**:
- All addresses verified
- Geographic scope restriction
- Filter settings too restrictive

**Solutions**:
1. Check filter settings
2. Verify geographic scope assignment matches regions with pending requests
3. Confirm addresses exist in system
4. Check role permissions and verification domain

#### CAR Declaration Not Auto-Approving
**Symptoms**: Citizen address stays in SELF_DECLARED status
**Causes**:
- UAC not in verified NAR addresses
- NAR address not verified
- Trigger function not firing

**Solutions**:
1. Verify UAC exists in addresses table with verified=true
2. Check trigger_auto_approve_citizen_address() is enabled
3. Review citizen_address_event for AUTO_VERIFY events

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
4. Review edge function logs for notify-emergency-operators

#### Map Not Loading (Fallback Active)
**Symptoms**: OpenStreetMap shown instead of Google Maps
**Causes**:
- Google Maps billing not enabled
- API key invalid or missing
- Quota exceeded

**Solutions**:
1. System automatically falls back to OSM - no action needed
2. To restore Google Maps: verify billing and API keys
3. Check edge function logs for get-google-maps-token errors

#### Translation Keys Displayed
**Symptoms**: Users see "common.button.save" instead of translated text
**Causes**:
- Missing translation key in locale files
- Wrong namespace used
- Translation not loaded

**Solutions**:
1. Check translation files for missing keys
2. Use Translation Audit Tool to identify gaps
3. Add fixes via save-translation-fix edge function
4. Verify useTranslation hook has correct namespace

### Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| AUTH_001 | Invalid credentials | Re-login |
| AUTH_002 | Session expired | Refresh session |
| ADDR_001 | Duplicate address | Review nearby addresses |
| ADDR_002 | Invalid GPS | Recapture coordinates |
| ADDR_003 | Incomplete business data | Provide organization_name and business_category |
| PHOTO_001 | Upload failed | Retry upload |
| CAR_001 | UAC not found | Verify UAC in NAR first |
| CAR_002 | Auto-approval failed | Submit for manual review |
| EMERG_001 | Unit unavailable | Select different unit |
| SYNC_001 | Conflict detected | Review and resolve |
| SCOPE_001 | Geographic access denied | Contact admin for scope update |

### Support Contacts

**Technical Support**: tech-support@biakam.gq
**Emergency Issues**: emergency-support@biakam.gq  
**System Administrator**: admin@biakam.gq

---

*Last Updated: March 2026*
*System Version: 4.1*
*Document Version: 4.0*
