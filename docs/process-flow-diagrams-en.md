# Process Flow Diagrams - ConEG National Digital Services Platform

## 1. Unified Address Request Workflow

### Multi-Purpose Address Request Flow

```
Start
  ↓
User logs into Citizen Portal
  ↓
User accesses Unified Address Request
  ↓
Select request type:
  ├── "Declare Existing Address" (CAR)
  ├── "Register Business" 
  └── "Request New Address" (NAR)
  ↓
┌─────────────────────────────────────────┐
│ STEP 1: ADDRESS LOOKUP                  │
├─────────────────────────────────────────┤
│ Search options:                         │
│   ├── Search by UAC code                │
│   ├── Search by location/map            │
│   └── Browse verified addresses         │
│                                         │
│ Result:                                 │
│   ├── Address found → Continue          │
│   └── Not found → Create new request    │
└─────────────────────────────────────────┘
  ↓
Address found?
  ├── YES → Proceed to Step 2
  └── NO → NAR Request workflow (see Section 2)
  ↓
┌─────────────────────────────────────────┐
│ STEP 2: DECLARATION/REGISTRATION        │
├─────────────────────────────────────────┤
│ For CAR Declaration:                    │
│   ├── Select: Primary or Secondary      │
│   ├── Choose scope: BUILDING or UNIT    │
│   ├── Enter unit_uac (if UNIT scope)    │
│   ├── Set privacy level                 │
│   └── Submit declaration                │
│                                         │
│ For Business Registration:              │
│   ├── Enter organization name           │
│   ├── Select business category          │
│   ├── Add contact information           │
│   ├── Specify operating hours           │
│   └── Submit for approval               │
└─────────────────────────────────────────┘
  ↓
System processes request
  ↓
Request type?
  ├── CAR Declaration → Auto-approval check
  └── Business → Manual review required
  ↓
For CAR: trigger_auto_approve_citizen_address()
  ├── UAC in verified NAR?
  │   ├── YES → Status: CONFIRMED (instant)
  │   │          log_auto_approval_event() records event
  │   └── NO → Status: SELF_DECLARED (manual review)
  ↓
User receives notification
  ↓
End
```

## 2. NAR Process (National Address Registry)

### Address Creation Workflow

```
Start
  ↓
Request Source:
  ├── Field Agent → Submits via AddressCaptureForm
  └── Citizen → Submits via Unified Address Request
  ↓
All submissions go to address_requests table
  ├── Status: 'pending'
  ├── GPS coordinates captured
  ├── Photos uploaded
  └── Address details recorded
  ↓
System performs auto-verification checks
  ├── Coordinate validation (within country bounds)
  ├── Photo quality analysis (via analyze-photo-quality)
  ├── Duplicate detection (via check_address_duplicates())
  └── Completeness score calculation
  ↓
Auto-verification result?
  ├── PASS (score ≥ 70) → Standard review queue
  └── FAIL (score < 70) → Flagged for manual review
  ↓
Verifier reviews request in Review Queue
  ├── Views only requests within geographic scope
  ├── Reviews address details and photos
  ├── Checks verification analysis results
  └── Makes approval decision
  ↓
Approval decision?
  ├── APPROVE → approve_address_request() called
  ├── REJECT → reject_address_request_with_feedback()
  └── FLAG → flag_address_for_review() for corrections
  ↓
On APPROVE:
  ├── Address inserted into addresses table
  ├── verified = true
  ├── UAC generated via generate_unified_uac_unique()
  └── Auto-publishing based on address_type:
      ├── Non-residential (business, government, landmark) → public = true
      └── Residential → public = false
  ↓
Address becomes available in system
  ├── Public addresses visible in search
  ├── Available for emergency services
  ├── Available for CAR linking
  └── Accessible via API (if public)
  ↓
Requester receives notification
  ↓
End
```

### Address States in Current System
- **Pending**: Submitted and awaiting verification
- **Flagged**: Requires manual review due to validation issues
- **Approved**: Verified and UAC generated
- **Rejected**: Returned with rejection reason
- **Published**: public=true (searchable by all)
- **Private**: public=false (searchable by authorized users only)

### Auto-Publishing Policy

```
Address Approved
  ↓
Check address_type
  ↓
Is non-residential?
  ├── business → public = true
  ├── commercial → public = true
  ├── government → public = true
  ├── landmark → public = true
  ├── institutional → public = true
  ├── industrial → public = true
  ├── public → public = true
  └── residential/other → public = false
  ↓
Address saved with appropriate visibility
```

## 3. Business Address Registration Workflow

### Complete Business Registration Flow

```
Start
  ↓
User initiates business registration
  ├── Via Unified Address Request → "Register Business"
  └── Via My Businesses → "Add New Business"
  ↓
Step 1: Address Selection
  ├── Search existing NAR addresses
  ├── Enter UAC directly
  └── Or request new address (goes to NAR workflow)
  ↓
Address found/selected?
  ├── YES → Proceed to business details
  └── NO → Submit NAR request first
  ↓
Step 2: Business Information
  ├── Organization name (required)
  ├── Business category (required)
  │   └── retail, restaurant, healthcare, education,
  │       government, financial, hospitality, professional,
  │       industrial, religious, entertainment, transportation,
  │       utilities, nonprofit, other
  ├── Business address type
  │   └── COMMERCIAL, HEADQUARTERS, BRANCH, WAREHOUSE,
  │       INDUSTRIAL, GOVERNMENT
  ├── Registration numbers (optional)
  │   ├── Business registration number
  │   └── Tax identification number
  └── Continue
  ↓
Step 3: Contact Information
  ├── Primary contact name
  ├── Primary contact phone
  ├── Primary contact email
  ├── Secondary contact phone (optional)
  └── Website URL (optional)
  ↓
Step 4: Business Details
  ├── Employee count
  ├── Customer capacity
  ├── Parking available?
  │   └── If yes: parking capacity
  ├── Wheelchair accessible?
  ├── Public service?
  ├── Appointment required?
  └── Services offered (multi-select)
  ↓
Step 5: Operating Hours
  ├── Day-by-day schedule
  │   └── For each day: open time, close time, or closed
  └── Languages spoken (multi-select)
  ↓
Step 6: Visibility Settings
  ├── Publicly visible in directory?
  ├── Show on maps?
  └── Show contact info?
  ↓
Submit business registration
  ↓
System creates address_request with:
  ├── address_type = 'business'
  ├── verification_analysis.organization = business details
  └── status = 'pending'
  ↓
Verifier reviews business request
  ├── Validates business information completeness
  ├── Checks required fields (organization_name, business_category)
  └── Makes approval decision
  ↓
On APPROVE: approve_business_address_request()
  ├── Creates address record (if new)
  ├── Creates organization_addresses record
  ├── Sets public = true (businesses always public)
  └── Business appears in Business Directory
  ↓
Business owner receives notification
  ↓
End
```

## 4. CAR Process (Citizen Address Repository)

### Citizen Address Declaration/Verification Workflow

```
Start
  ↓
Citizen accesses Citizen Portal
  ↓
System checks for existing person record
  ├── Person record exists?
  │   ├── NO → Creates new person record (ensure_person_exists trigger)
  │   └── YES → Loads existing addresses
  ↓
Citizen views current addresses
  ├── Primary address displayed
  ├── Secondary addresses listed
  └── Address history shown
  ↓
Citizen selects action
  ├── Set Primary Address → Opens SetPrimaryAddressForm
  ├── Add Secondary Address → Opens AddSecondaryAddressForm
  └── Request Residency Verification → Opens ResidencyVerificationForm
  ↓
Address Form Completion
  ├── Primary Address: 
  │   ├── UAC input (search or enter)
  │   ├── Scope selection (BUILDING or UNIT)
  │   ├── Unit UAC (if UNIT scope)
  │   ├── Privacy level (PRIVATE, REGION_ONLY, PUBLIC)
  │   └── Effective date
  ├── Secondary Address:
  │   ├── UAC input
  │   ├── Scope selection
  │   └── Unit UAC (if applicable)
  └── Residency Verification:
      ├── Verification type
      ├── Documents upload
      └── Verification notes
  ↓
System processes request via RPC functions
  ├── set_primary_address() → Updates/creates citizen_address
  ├── add_secondary_address() → Creates new citizen_address
  └── Residency verification → Creates residency_ownership_verifications
  ↓
Auto-Approval Check (for address declarations)
  ├── trigger_auto_approve_citizen_address() fires
  ├── Does UAC reference a verified NAR address?
  │   ├── YES → Status set to CONFIRMED
  │   │         log_auto_approval_event() records AUTO_VERIFY event
  │   │         Citizen notified immediately
  │   └── NO → Status remains SELF_DECLARED
  │            Requires manual verification
  ↓
Manual Review Queue (for non-auto-approved)
  ├── CAR verifiers (verification_domain: 'car' or 'both') review
  ├── Check documentation and proofs provided
  └── Update status via set_citizen_address_status()
  ↓
Status Update
  ├── CONFIRMED → Address becomes active
  ├── REJECTED → Returns to citizen with reason
  └── REQUIRES_DOCUMENTS → Citizen must provide additional proof
  ↓
Address becomes active in citizen's profile
  ├── Primary address used for official correspondence
  ├── Privacy settings applied
  └── Historical addresses preserved with effective dates
  ↓
Citizen receives notification of status change
  ↓
End
```

### CAR Address Types
- **Primary Address (PRIMARY)**: Main residential address (one active per person)
- **Secondary Address (SECONDARY)**: Additional addresses (work, vacation, etc.)
- **Historical Addresses**: Previous addresses with effective_to dates
- **Address Scopes**: 
  - `BUILDING` - Entire property/building
  - `UNIT` - Specific unit within building (requires unit_uac)

### Privacy Levels
- **PRIVATE**: Only visible to owner and authorized officials
- **REGION_ONLY**: Visible to officials within same region
- **PUBLIC**: Visible in public searches (if searchable_by_public=true)

## 5. Emergency Management Process

### Emergency Incident Reporting and Response Workflow

```
Start - Emergency Reported
  ↓
Report Reception via EmergencyDispatchDialog
  ├── Emergency type selection
  │   └── medical, fire, robbery, assault, accident, etc.
  ├── Priority level (low=1, medium=2, high=3, critical=4)
  ├── Location input
  │   ├── UAC code (if known)
  │   ├── Address search
  │   └── GPS coordinates
  ├── Incident description
  └── Reporter contact information
  ↓
System creates emergency_incident record
  ├── Generates incident_number (INC-YYYY-XXXXXX)
  ├── Generates incident_uac via generate_incident_uac()
  ├── Encrypts sensitive information
  ├── Sets status = "reported"
  └── Stores reporter details (encrypted)
  ↓
notify-emergency-operators edge function triggered
  ├── Creates emergency_notifications for dispatchers
  ├── Sends priority and emergency type info
  └── Includes incident number for tracking
  ↓
Police Dispatcher receives alert
  ├── Views incident in IncidentList dashboard
  ├── Sees decrypted location and description
  └── Reviews priority level
  ↓
Dispatcher assigns incident to available unit
  ├── Views available units via UnitManagement
  ├── Selects optimal unit(s) based on:
  │   ├── Proximity to incident
  │   ├── Unit availability status
  │   └── Unit capabilities
  ├── Updates assigned_units array
  └── auto_update_incident_status() trigger fires automatically
  ↓
Status automatically updated to "dispatched"
  ├── dispatched_at timestamp recorded
  ├── Status changed from "reported" to "dispatched"
  └── notify-unit-assignment sends notification to unit
  ↓
Unit en route to location
  ├── Unit lead accepts assignment
  ├── Real-time status updates via UnitStatusManager
  ├── GPS tracking of unit location
  └── Navigation to incident using UAC
  ↓
Unit arrives at scene
  ├── Status updated to "on_scene"
  ├── responded_at timestamp recorded
  └── Officer begins incident handling
  ↓
Backup request process (if needed)
  ├── Unit lead opens RequestBackupDialog
  ├── Specifies backup requirements and urgency level
  ├── process-backup-request edge function triggered
  ├── Emergency notifications sent to dispatchers/supervisors
  ├── Status updated to "backup_requested"
  └── Tiered Approval Workflow:
      │
      ├── DISPATCHER (Coordinator Actions):
      │   ├── Acknowledge receipt of request
      │   ├── Mark backup unit as en route
      │   ├── Mark backup unit on scene
      │   └── Escalate to supervisor (if needed)
      │
      └── SUPERVISOR/ADMIN (Approval Authority):
          ├── Approve backup request
          ├── Deny backup request (with reason)
          └── Modify priority level
  ↓
Incident resolution
  ├── Officer completes incident handling
  ├── Status updated to "resolved"
  ├── resolved_at timestamp recorded
  ├── Field notes submitted
  └── Incident documentation finalized
  ↓
Incident closure and reporting
  ├── Status updated to "closed"
  ├── closed_at timestamp recorded
  ├── Final incident report generated
  ├── Analytics data updated
  └── notify-incident-reporter notifies citizen (if applicable)
  ↓
End
```

### Incident States
- **reported**: Newly received by system
- **dispatched**: Unit assigned (auto-set by trigger when assigned_units populated)
- **responding**: Unit en route to location
- **on_scene**: Officer present at location
- **backup_requested**: Additional units requested
- **resolved**: Situation handled successfully
- **closed**: All documentation completed

### Response Time SLAs
- **Critical (priority=4)**: 3 minutes
- **High (priority=3)**: 8 minutes
- **Medium (priority=2)**: 15 minutes
- **Low (priority=1)**: 30 minutes

## 6. System Integration

### Emergency Address Verification Workflow

```
Emergency Report Received
  ↓
System verifies provided address/UAC
  ├── UAC provided?
  │   ├── YES → Lookup in NAR addresses table
  │   └── NO → Attempt address search
  ↓
Valid UAC found in NAR?
  ├── YES → Obtains precise coordinates
  │         └── incident_uac set to verified UAC
  └── NO → Quick verification process
      ├── Searches similar addresses
      ├── Uses provided GPS coordinates
      └── Flags for address improvement
  ↓
Coordinates confirmed
  ↓
Continue with emergency dispatch
  ↓
Post-Incident: Address quality feedback
  ├── If location issues encountered
  │   └── Generate NAR improvement report
  └── Update address metadata if needed
```

### Shared Intelligence Workflow

```
Police Incident Completed
  ↓
Involves address issues?
  ├── YES → Generates report for NAR
  │   ├── Location difficulties encountered
  │   ├── Duplicate addresses found
  │   ├── Incorrect or missing UACs
  │   └── Access/navigation issues
  └── NO → Only archives in police system
  ↓
NAR team reviews feedback
  ├── Prioritizes based on incident frequency
  ├── Schedules field verification if needed
  └── Updates address records
  ↓
Data quality improvement
```

## 7. Postal Delivery Module Workflow

### Complete Delivery Order Flow

```
Start - Order Creation
  ↓
Postal Clerk logs into Postal Portal
  ↓
Clerk creates new delivery order
  ├── Enter sender information
  │   ├── Sender name
  │   ├── Sender branch
  │   └── Sender phone
  ├── Search recipient address by UAC
  │   ├── System validates UAC exists
  │   ├── Auto-populates from NAR/CAR
  │   └── Displays verified address
  ├── Enter package details
  │   ├── Package type (letter, parcel, registered)
  │   ├── Weight and dimensions
  │   ├── Declared value
  │   └── Special handling (fragile, hazmat)
  └── Set delivery parameters
      ├── Priority level (1-5)
      ├── Scheduled date
      ├── Requires signature?
      └── Requires ID verification?
  ↓
Order submitted
  ├── Order number generated (DEL-YYYY-XXXXXX)
  ├── Status: pending_intake
  └── Appears in dispatcher queue
  ↓
Dispatcher Assignment
  ↓
Dispatcher views pending orders
  ├── Reviews recipient UAC and location
  ├── Checks package requirements
  └── Notes priority level
  ↓
Views available agents
  ├── Agent workload counts
  ├── Agent coverage areas
  └── Availability status
  ↓
Assigns order to agent
  ├── Adds dispatch notes
  ├── Sets estimated delivery time
  └── Confirms assignment
  ↓
System updates order
  ├── Status: assigned
  ├── Agent notified
  └── Appears in agent queue
  ↓
Delivery Execution
  ↓
Agent receives notification
  ↓
Views delivery details
  ├── Recipient name and UAC
  ├── Full address from registry
  ├── Package details
  └── Special instructions
  ↓
Starts delivery (status: out_for_delivery)
  ↓
Navigates using UAC GPS coordinates
  ├── Turn-by-turn directions
  ├── Real-time ETA
  └── Status visible to dispatcher
  ↓
Arrives at location
  ├── System verifies GPS proximity
  ├── Agent marks "Arrived"
  └── Location logged
  ↓
Delivery attempt
  ├── SUCCESS path:
  │   ├── Verify recipient identity
  │   ├── Capture signature on device
  │   ├── Take photo of delivered package
  │   ├── Record recipient name
  │   └── Complete ID verification if required
  │
  └── FAILED path:
      ├── Select failure reason
      │   ├── Address not found
      │   ├── Recipient not available
      │   ├── Refused delivery
      │   └── Access issues
      └── Record notes for reattempt
  ↓
Complete delivery
  ├── Status: delivered / failed_delivery / returned_to_sender
  ├── Proof uploaded (signature + photo)
  ├── GPS and timestamp recorded
  └── Notifications sent
  ↓
Supervisor monitoring
  ├── Real-time dashboard visibility
  ├── Performance metrics updated
  └── Proof available for review
  ↓
End
```

### Delivery Status States
- **pending_intake**: Order created, awaiting review
- **ready_for_assignment**: Approved, ready for dispatch
- **assigned**: Assigned to delivery agent
- **out_for_delivery**: Agent en route
- **delivered**: Successfully delivered with proof
- **failed_delivery**: Delivery attempt unsuccessful
- **address_not_found**: Could not locate address
- **returned_to_sender**: Returned to origin

### UAC Address Integration

```
Order Creation
  ↓
Clerk enters recipient UAC
  ↓
System queries addresses table
  ├── Checks verified = true
  ├── Retrieves coordinates
  └── Gets full address details
  ↓
UAC validated?
  ├── YES → Populate recipient fields
  │         └── Enable order submission
  └── NO → Show error message
          └── Require valid UAC
```

## 8. Rejected Items Retention Workflow

### Automatic Retention Policy Enforcement

```
Monthly Cleanup Process (1st of month, 3 AM)
  ↓
Phase 1: Archive (6+ months old)
  ↓
archive_old_rejected_requests()
  ├── Select rejected address_requests > 6 months
  ├── Insert into rejected_requests_archive
  │   └── Preserves: original_id, requester_id, all data
  └── Delete from address_requests
  ↓
archive_old_rejected_citizen_addresses()
  ├── Select REJECTED citizen_address > 6 months
  ├── Insert into rejected_citizen_addresses_archive
  └── Delete from citizen_address
  ↓
archive_old_rejected_verifications()
  ├── Select rejected residency_ownership_verifications > 6 months
  ├── Insert into rejected_verifications_archive
  └── Delete from main table
  ↓
Phase 2: Anonymize (24+ months old)
  ↓
anonymize_archived_records()
  ├── Update archived records > 24 months
  ├── Set requester_id/person_id/user_id = NULL
  ├── Set anonymized_at timestamp
  └── Preserve non-PII data for statistics
  ↓
Log cleanup results
  ├── Records archived count
  ├── Records anonymized count
  └── Insert into cleanup_audit_log
  ↓
End
```

### Manual Deletion (User-Initiated)

```
Citizen views rejected request
  ↓
Clicks "Delete" on rejected item
  ↓
delete_rejected_request(request_id) called
  ├── Verifies user owns request
  ├── Verifies status = 'rejected'
  └── Deletes from address_requests
  ↓
Confirmation shown to user
```

## 9. Quality and Maintenance Processes

### Automated Quality Audit

```
Daily Automatic Process
  ↓
Scans new/modified addresses
  ↓
Applies validation rules
  ├── Coordinates within geographic limits
  ├── Unique and valid UACs
  ├── Acceptable quality photographs
  ├── Complete and consistent information
  └── Completeness score calculation
  ↓
Problems detected?
  ├── YES → flag_address_for_review()
  │   ├── Sets flagged = true
  │   ├── Records flag_reason
  │   └── Adds to manual review queue
  └── NO → Confirms quality
  ↓
Generates daily quality report
  ↓
Notifies supervisors about issues
```

### CAR Auto-Approval Audit

```
Triggered on citizen_address INSERT/UPDATE
  ↓
trigger_auto_approve_citizen_address() executes
  ↓
Check conditions:
  ├── Status = SELF_DECLARED?
  ├── UAC provided?
  └── UAC exists in verified NAR?
  ↓
All conditions met?
  ├── YES → Update status to CONFIRMED
  │         └── Fire log_auto_approval_event()
  └── NO → No action (remains SELF_DECLARED)
  ↓
Event recorded in citizen_address_event
  ├── event_type = 'AUTO_VERIFY'
  ├── actor_id = NULL (system)
  └── payload = verification details
```

### Preventive Maintenance

```
Weekly Process
  ↓
Analyze usage patterns
  ├── High-activity addresses
  ├── Emergency incident frequency
  └── Search analytics
  ↓
Identify addresses needing re-verification
  ├── Old verification dates
  ├── User-reported issues
  └── Photo quality degradation
  ↓
Schedule field verifications
  ↓
Assign to field agents (within geographic scope)
  ↓
Update information based on findings
```

## Conclusion

These flow diagrams document the interconnected processes of the ConEG National Digital Services Platform as of December 2025. The platform now includes four integrated modules:

- **NAR (National Address Registry)**: Official government-maintained address registry
- **CAR (Citizen Address Repository)**: Citizen-managed address declarations
- **Emergency Management**: Real-time incident reporting and response coordination
- **Postal Delivery**: Government postal services with UAC address integration

Key improvements include:

- **Unified Address Request** workflow consolidating NAR, CAR, and Business flows
- **Auto-publishing** based on address type (eliminating manual publication)
- **Auto-approval** for CAR declarations linked to verified NAR addresses
- **Postal Delivery Module** with UAC-verified addresses for accurate deliveries
- **Verification domain scoping** for flexible verifier permissions
- **Geographic scoping** ensuring users see only relevant data
- **Retention policy** with automatic archiving and anonymization
- **Map fallback** to OpenStreetMap when Google Maps unavailable

The system maintains data integrity and security while providing efficient workflows for all stakeholders.

---

*Last Updated: December 2025*
*Version: 4.0*
