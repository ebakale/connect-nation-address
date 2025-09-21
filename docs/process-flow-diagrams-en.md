# Process Flow Diagrams - ConnectNation Address System

## 1. NAR Process (National Address Registry)

### Address Creation Workflow

```
Start
  ↓
Citizen submits address request via Public Portal
  ├── Fills address request form with location details
  ├── Provides justification for address creation
  ├── Uploads property photos and ownership documents
  └── Submits coordinates (GPS or manual input)
  ↓
System performs auto-verification checks
  ├── Coordinate validation (within country bounds)
  ├── Photo quality analysis
  ├── Duplicate address detection
  └── Address information consistency check
  ↓
Auto-verification result?
  ├── PASS → Address flagged for standard review
  └── FAIL → Address flagged for manual review
  ↓
Verifier reviews request in Review Queue
  ├── Views address details and photos
  ├── Checks verification analysis results
  ├── Reviews recommendations from auto-verification
  └── Makes approval decision
  ↓
Approval decision?
  ├── APPROVE → Address moves to publication queue
  ├── REJECT → Returns to citizen with rejection reason
  └── EDIT → Verifier modifies details before approval
  ↓
Registrar publishes approved address
  ├── Generates UAC (Universal Address Code)
  ├── Sets address as active in system
  └── Makes address searchable
  ↓
Address becomes available in system
  ├── Visible in public address search
  ├── Available for emergency services
  └── Accessible via mobile applications
  ↓
Citizen receives notification of approval
  ↓
End
```

### Address States in Current System
- **Draft**: Saved locally but not submitted (offline mode)
- **Pending**: Submitted and awaiting verification
- **Flagged**: Requires manual review due to validation issues
- **Verified**: Approved by verifier, awaiting publication
- **Published**: Active in system with UAC generated
- **Rejected**: Returned to citizen with required corrections

## 2. CAR Process (Citizen Address Repository)

### Citizen Address Declaration/Verification Workflow

```
Start
  ↓
Citizen accesses Citizen Address Verification Manager
  ↓
System checks for existing person record
  ├── Person record exists?
  │   ├── NO → Creates new person record linked to auth user
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
  ├── Primary Address: UAC input, scope selection, effective date
  ├── Secondary Address: UAC input, scope selection
  └── Residency Verification: Documents upload, residency proof
  ↓
System processes request via RPC functions
  ├── set_primary_address() → Updates citizen_address table
  ├── add_secondary_address() → Creates new citizen_address record
  └── Residency verification → Creates residency_verification record
  ↓
Address Review Queue (for verifiers/registrars)
  ├── Verifiers review pending citizen addresses
  ├── Check documentation and proofs provided
  └── Update address status via set_citizen_address_status()
  ↓
Status Update
  ├── APPROVED → Address becomes active
  ├── REJECTED → Returns to citizen with reason
  └── REQUIRES_DOCUMENTS → Citizen must provide additional proof
  ↓
Address becomes active in citizen's profile
  ├── Primary address used for official correspondence
  ├── Secondary addresses linked to person record
  └── Historical addresses preserved with effective dates
  ↓
Citizen receives notification of status change
  ↓
End
```

### CAR Address Types in Current System
- **Primary Address**: Main residential address (one per person)
- **Secondary Address**: Additional addresses (work, vacation, etc.)
- **Historical Addresses**: Previous addresses with retirement dates
- **Address Scopes**: DWELLING (entire property) or UNIT (specific unit)

## 3. Emergency Management Process

### Emergency Incident Reporting and Response Workflow

```
Start - Emergency Reported
  ↓
Report Reception via EmergencyDispatchDialog
  ├── Emergency type selection (medical, fire, robbery, assault, etc.)
  ├── Priority level (low=1, medium=2, high=3, critical=4)
  ├── Location input (address or coordinates)
  ├── Incident description
  └── Reporter contact information
  ↓
System creates emergency_incident record
  ├── Generates unique incident_number (INC-timestamp)
  ├── Encrypts sensitive information using edge function
  ├── Sets initial status as "reported"
  └── Stores reporter contact details
  ↓
notify-emergency-operators edge function triggered
  ├── Notifies available police operators
  ├── Sends priority and emergency type information
  └── Includes incident number for tracking
  ↓
Police Operator receives alert via IncidentList
  ├── Views incident details in dashboard
  ├── Sees decrypted location and description
  └── Reviews priority level and emergency type
  ↓
Dispatcher assigns incident to available unit
  ├── Updates assigned_units field in database
  ├── Sets dispatched_at timestamp
  └── Changes status to "assigned"
  ↓
Unit receives notification via notify-unit-assignment
  ├── Unit members see incident on their dashboard
  ├── Unit lead can accept or request backup
  └── Incident status updates to "responding"
  ↓
Unit en route to location
  ├── Real-time status updates via UnitStatusManager
  ├── GPS tracking of unit location
  └── Estimated arrival time calculations
  ↓
Unit arrives at scene
  ├── Status updated to "on_scene"
  ├── responded_at timestamp recorded
  └── Officer begins incident handling
  ↓
Backup request process (if needed)
  ├── RequestBackupDialog opened by unit lead
  ├── Backup request sent via process-backup-request
  ├── Emergency notifications created for other units
  └── BackupNotificationManager handles backup coordination
  ↓
Incident resolution
  ├── Officer completes incident report
  ├── Status updated to "resolved"
  ├── resolved_at timestamp recorded
  └── Incident documentation finalized
  ↓
Incident closure and reporting
  ├── Final incident report generated
  ├── Analytics data updated for performance tracking
  └── Reporter notified of resolution (if applicable)
  ↓
End
```

### Incident States in Current System
- **reported**: Newly received by system
- **assigned**: Unit assigned for response
- **responding**: Unit en route to location
- **on_scene**: Officer present at location
- **backup_requested**: Additional units requested
- **resolved**: Situation handled successfully
- **closed**: All documentation completed

### Emergency System Components
- **EmergencyDispatchDialog**: Initial report submission interface
- **IncidentList**: Dashboard for viewing and managing incidents
- **UnitManagement**: Unit assignment and status tracking
- **BackupNotificationManager**: Inter-unit communication for backup requests
- **Emergency Edge Functions**: Secure processing and notifications

## 4. System Integration

### Emergency Address Verification Workflow

```
Emergency Report
  ↓
System verifies provided UAC
  ├── Valid UAC in NAR?
  │   ├── YES → Obtains precise coordinates
  │   └── NO → Activates quick verification process
  ↓
Quick Verification Process
  ├── Searches similar addresses
  ├── Verifies with recent CAR reports
  └── Contacts reporter for clarification
  ↓
Coordinates confirmed
  ↓
Continues with emergency dispatch
```

### Shared Intelligence Workflow

```
Police Incident Completed
  ↓
Involves address issues?
  ├── YES → Generates report for NAR
  └── NO → Only archives in police system
  ↓
NAR Report includes:
  ├── Location difficulties
  ├── Duplicate addresses found
  ├── Incorrect or missing UACs
  └── Improvement recommendations
  ↓
NAR reviews and implements improvements
  ↓
Data quality update
```

## 5. Quality and Maintenance Processes

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
  └── Complete and consistent information
  ↓
Problems detected?
  ├── YES → Marks for manual review
  └── NO → Confirms quality
  ↓
Generates daily quality report
  ↓
Notifies supervisors about issues
```

### Preventive Maintenance

```
Weekly Process
  ↓
Analyzes usage patterns
  ↓
Identifies high-activity addresses
  ↓
Schedules field verifications
  ↓
Assigns agents for re-verification
  ↓
Updates information based on findings
```

## Conclusion

These flow diagrams show the interconnected processes of the digital address system, from initial address creation to their use in emergency situations, ensuring the integrity and utility of the system for all stakeholders.