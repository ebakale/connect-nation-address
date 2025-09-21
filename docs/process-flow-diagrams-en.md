# Process Flow Diagrams - Digital Address System

## 1. NAR Process (National Address Registry)

### Address Creation Workflow

```
Start
  ↓
Field Agent arrives at location
  ↓
Verifies GPS coordinates
  ↓
Takes photographs of building/structure
  ↓
Completes address capture form
  ├── Basic information (name, type)
  ├── Geographic coordinates
  ├── Photographs
  └── Owner/occupant data
  ↓
Generates UAC (Universal Address Code)
  ↓
Submits request for review
  ↓
Verifier reviews information
  ├── Is information complete and accurate?
  │   ├── YES → Approves address
  │   └── NO → Rejects with comments
  ↓
Registrar publishes the address
  ↓
Address active in system
  ↓
Notification sent to citizen
  ↓
End
```

### Address States
- **Draft**: Captured but not submitted
- **Pending**: Awaiting verification
- **Verified**: Approved by verifier
- **Published**: Active in system
- **Rejected**: Requires corrections

## 2. CAR Process (Citizen Address Registry)

### Citizen Declaration/Verification Workflow

```
Start
  ↓
Citizen accesses Public Portal
  ↓
Searches for existing address
  ├── Address found?
  │   ├── YES → Requests residency verification
  │   └── NO → Requests new address
  ↓
Completes application form
  ├── Personal information
  ├── Identification documents
  ├── Proof of residence
  └── Additional photographs
  ↓
Submits application
  ↓
System validates documentation
  ├── Valid documents?
  │   ├── YES → Continues process
  │   └── NO → Requests corrections
  ↓
Verifier reviews application
  ├── Requires field visit?
  │   ├── YES → Assigns to field agent
  │   └── NO → Approves directly
  ↓
Field agent verifies (if applicable)
  ↓
Address update
  ↓
Citizen notification
  ↓
End
```

### CAR Application Types
- **Residency Verification**: Confirm current occupancy
- **Owner Change**: Property transfer
- **Data Correction**: Update incorrect information
- **Secondary Address**: Register additional address

## 3. Emergency Management Process

### Emergency Reporting and Response Workflow

```
Start - Emergency Reported
  ↓
Report Reception
  ├── Web Portal
  ├── Mobile Application
  ├── Phone Call
  └── Automatic System
  ↓
Police Operator receives alert
  ↓
Classifies Incident
  ├── Priority (High/Medium/Low)
  ├── Type (Security/Medical/Fire/Other)
  └── Location (UAC or coordinates)
  ↓
Valid UAC address?
  ├── YES → Continues with dispatch
  └── NO → Quick address verification
  ↓
Dispatcher assigns available unit
  ├── Checks unit availability
  ├── Calculates response time
  └── Assigns closest unit
  ↓
Unit receives notification
  ↓
Officer confirms receipt
  ↓
Status: "Responding"
  ↓
Officer arrives at location
  ↓
Status: "On Scene"
  ↓
Requires backup?
  ├── YES → Requests additional units
  └── NO → Continues with intervention
  ↓
Officer handles situation
  ↓
Completes incident report
  ↓
Status: "Resolved"
  ↓
Incident closure
  ↓
End
```

### Incident States
- **Reported**: Newly received by system
- **Assigned**: Unit assigned for response
- **Responding**: Unit en route to location
- **On Scene**: Officer present at location
- **Requires Backup**: Request for additional units
- **Resolved**: Situation handled successfully
- **Closed**: Documentation completed

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