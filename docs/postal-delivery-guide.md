# ConEG Postal Delivery Module - Complete Guide

## Table of Contents
1. [Module Overview](#module-overview)
2. [User Roles](#user-roles)
3. [Core Workflows](#core-workflows)
4. [Enhanced Features](#enhanced-features)
5. [Features by Role](#features-by-role)
6. [Integration with Address System](#integration-with-address-system)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)

---

## Module Overview

The ConEG Postal Delivery Module is a comprehensive government postal services management system integrated with the National Digital Address System. It enables efficient delivery operations by leveraging UAC (Unified Address Code) verified addresses.

### Key Capabilities
- **Order Management**: Create, track, and manage delivery orders
- **UAC Integration**: Automatic address validation using verified NAR/CAR addresses
- **Recipient Search by Name**: Search for recipients by name, including household dependents
- **Agent Assignment**: Intelligent workload distribution across delivery agents
- **In-App Routing**: Embedded turn-by-turn navigation with Leaflet/OSRM
- **GPS Navigation**: External maps integration for field navigation
- **Proof of Delivery**: Digital signature and photo capture with GPS verification
- **Real-time Tracking**: Live delivery status updates for all stakeholders
- **Pickup Requests**: Citizen-initiated package collection service
- **Returns & Reverse Logistics**: Handle undeliverable and return packages
- **Cash on Delivery (COD)**: Payment collection at delivery
- **Bulk Import**: CSV batch order processing
- **Customer Notifications**: Automated SMS/email alerts
- **Delivery Preferences**: Recipient scheduling and safe drop options
- **Barcode/QR Labels**: UPU S10-compliant tracking with printable labels
- **Analytics & Reporting**: Performance metrics and delivery statistics

---

## User Roles

### Postal Clerk (`postal_clerk`)
**Purpose**: Order intake and creation

**Permissions**:
- ✅ Create new delivery orders
- ✅ Search recipients by UAC or name (including household dependents)
- ✅ Enter package details and sender information
- ✅ View own created orders
- ✅ Import bulk orders via CSV
- ✅ Create COD orders
- ❌ Cannot assign orders to agents
- ❌ Cannot modify assigned orders

**Primary View**: Create Order tab

### Postal Dispatcher (`postal_dispatcher`)
**Purpose**: Order assignment and agent coordination

**Permissions**:
- ✅ View all pending orders
- ✅ View available agents and workloads
- ✅ Assign orders to delivery agents
- ✅ Mark orders as ready for delivery
- ✅ Monitor delivery progress
- ✅ Manage pickup requests (schedule, assign)
- ✅ Review return orders
- ✅ Monitor bulk import jobs
- ❌ Cannot complete deliveries
- ❌ Cannot approve orders

**Primary View**: Dispatcher Panel, Assign Orders tab

### Postal Agent (`postal_agent`)
**Purpose**: Field delivery execution

**Permissions**:
- ✅ View assigned deliveries
- ✅ Navigate using in-app routing or external maps
- ✅ Update delivery status (out for delivery, delivered, failed)
- ✅ Capture proof of delivery (signature, photo)
- ✅ Mark deliveries as complete or failed
- ✅ Record delivery attempt notes
- ✅ Collect COD payments
- ✅ Execute pickup assignments
- ❌ Cannot assign orders
- ❌ Cannot view other agents' deliveries

**Primary View**: My Deliveries tab (mobile-optimized)

### Postal Supervisor (`postal_supervisor`)
**Purpose**: Operations oversight and reporting

**Permissions**:
- ✅ View all orders and deliveries
- ✅ Monitor agent performance
- ✅ Access delivery analytics
- ✅ Review proof of delivery
- ✅ Export reports (CSV, PDF)
- ✅ Approve/reject orders
- ✅ View audit logs
- ✅ Manage COD reconciliation
- ✅ Oversee returns and pickups
- ✅ Monitor bulk import status

**Primary View**: Supervisor Dashboard, Analytics tab

---

## Core Workflows

### Order Creation Flow

```
Postal Clerk creates order
  ↓
Enter sender information
  ├── Sender name
  ├── Sender branch
  └── Sender phone
  ↓
Search recipient (two methods)
  ├── BY UAC: Enter UAC code directly
  │   ├── System validates UAC
  │   ├── Auto-populates address from NAR/CAR
  │   └── Displays verified address details
  │
  └── BY NAME: Search recipient by name
      ├── System searches citizen_address and household_dependents
      ├── Returns matching profiles and dependents
      ├── Shows "Care of: [Guardian]" for dependents
      └── Select address from results
  ↓
Enter package details
  ├── Package type (letter, parcel, registered, fragile, hazmat)
  ├── Weight and dimensions
  ├── Declared value
  ├── COD amount (if cash on delivery)
  └── Special handling requirements
  ↓
Set delivery parameters
  ├── Priority level (1-5)
  ├── Scheduled delivery date
  ├── Preferred time window (from recipient preferences)
  ├── Requires signature?
  └── Requires ID verification?
  ↓
Submit order
  ├── System generates order number (DEL-YYYY-XXXXXX)
  ├── Generates S10 tracking number for label
  ├── Status: pending_intake
  └── Order appears in dispatcher queue
```

### Dispatch Assignment Flow

```
Dispatcher views pending orders
  ↓
Select order for assignment
  ├── Review recipient address and location
  ├── Check package requirements
  ├── View recipient delivery preferences
  └── Note priority level
  ↓
View available agents
  ├── Agent list with current workload
  ├── Agent location/coverage area
  └── Agent availability status
  ↓
Assign order to agent
  ├── Add dispatch notes (optional)
  ├── Set estimated delivery time
  └── Confirm assignment
  ↓
System updates order
  ├── Status: assigned
  ├── Agent receives notification
  └── Order appears in agent queue
```

### Delivery Execution Flow

```
Agent receives assignment notification
  ↓
View delivery details
  ├── Recipient name and address
  ├── UAC code for navigation
  ├── Package details
  ├── COD amount (if applicable)
  └── Special instructions
  ↓
Click "Start Delivery" / Update status to "Out for Delivery"
  ↓
Navigate to address (two options)
  ├── IN-APP ROUTING: Click "Show Route"
  │   ├── RouteMapView displays embedded map
  │   ├── Visual route polyline from current location
  │   ├── Distance and estimated travel time
  │   ├── Turn-by-turn directions panel
  │   └── Auto-fit map to show full route
  │
  └── EXTERNAL MAPS: Click "Navigate"
      ├── Opens Apple Maps (iOS)
      ├── Opens Google Maps (Android)
      └── Web fallback available
  ↓
Arrive at location
  ├── System verifies GPS proximity
  ├── Agent marks "Arrived"
  └── Location logged for audit
  ↓
Attempt delivery
  ├── SUCCESS: Capture proof of delivery
  │   ├── Recipient signature on device
  │   ├── Photo of delivered package
  │   ├── Recipient name confirmation
  │   ├── ID verification (if required)
  │   └── COD collection (if applicable)
  │       ├── Confirm amount received
  │       ├── Select payment method
  │       └── Record receipt number
  │
  └── FAILED: Record failure reason
      ├── Address not found
      ├── Recipient not available
      ├── Refused delivery
      └── Access issues
  ↓
Complete delivery
  ├── Status: delivered / failed_delivery / returned_to_sender
  ├── Proof uploaded to secure storage
  ├── Timestamp and GPS recorded
  └── Notifications sent to relevant parties
```

---

## Enhanced Features

### Recipient Search by Name

Postal clerks can search for recipients using their name instead of UAC:

```
Clerk initiates name search
  ↓
System searches across:
  ├── citizen_address linked to person records
  ├── household_dependents (minors, adults without accounts)
  └── Applies privacy filters for postal context
  ↓
Results display
  ├── Profile matches with addresses
  ├── Dependent matches with guardian addresses
  │   └── Shows "Care of: [Guardian Name]"
  └── Dependent type badge (Minor, Adult Dependent)
  ↓
Clerk selects appropriate address
  ↓
System populates recipient fields
```

### In-App Routing

Agents can view embedded route maps without leaving the app:

```
Agent clicks "Show Route" on delivery
  ↓
RouteMapView component opens
  ├── Displays Leaflet map with OSRM routing
  ├── Blue marker: Agent current location
  ├── Red marker: Delivery destination
  ├── Purple route line showing path
  └── Route panel with:
      ├── Total distance
      ├── Estimated travel time
      └── Turn-by-turn directions
  ↓
Agent follows directions
  ├── Can scroll/zoom map
  ├── Directions scrollable in side panel
  └── "Close" button returns to delivery list
  ↓
Fallback: "Open in Maps" button for external navigation
```

### Pickup Request Service

Citizens can request package collection:

```
Citizen submits pickup request
  ├── Select address (from CAR addresses)
  ├── Specify number of packages
  ├── Estimate total weight
  ├── Select preferred date/time
  └── Add contact information
  ↓
Request status: pending
  ↓
Dispatcher reviews requests
  ├── Views pending pickups in Pickups tab
  ├── Schedules pickup date/time
  └── Assigns to postal agent
  ↓
Request status: scheduled → assigned
  ↓
Agent executes pickup
  ├── Views pickup in assignments
  ├── Navigates to address
  ├── Collects packages
  ├── Captures photo proof
  └── Marks completed
  ↓
Request status: completed
```

### Returns & Reverse Logistics

Handle undeliverable packages and customer returns:

```
Return initiated
  ├── By recipient (customer return)
  ├── By sender (recall)
  └── By system (failed delivery after max attempts)
  ↓
Select return reason
  ├── Wrong item
  ├── Damaged
  ├── Refused
  ├── Undeliverable
  └── Customer return
  ↓
Return label generated
  ├── S10 tracking number assigned
  ├── QR code for tracking
  └── Printable label created
  ↓
Return collection
  ├── Agent pickup from address
  └── OR citizen drop-off at post office
  ↓
Return processing
  ├── Received at origin post office
  ├── Inspected and documented
  └── Status: completed
```

### Cash on Delivery (COD)

Payment collection at delivery:

```
Order created with COD
  ├── COD amount specified
  ├── Currency recorded
  └── Collection status: pending
  ↓
Agent delivers package
  ↓
Before handover, collect payment
  ├── Show COD amount to recipient
  ├── Collect cash/payment
  ├── Record payment method
  └── Issue receipt number
  ↓
Mark COD collected
  ├── Collection status: collected
  ├── Timestamp recorded
  └── Agent ID logged
  ↓
Daily remittance
  ├── Agent returns to office
  ├── Submits collected COD
  └── Supervisor reconciles
  ↓
COD remitted
  ├── Collection status: remitted
  ├── Remittance reference recorded
  └── Audit trail complete
```

### Bulk Order Import

Import multiple orders via CSV:

```
Clerk accesses Bulk Import
  ↓
Download CSV template
  ├── Required columns: sender_name, recipient_name, recipient_uac, etc.
  └── Optional columns: cod_amount, special_instructions, etc.
  ↓
Prepare CSV file
  ├── One row per order
  └── Follow template format
  ↓
Upload CSV file
  ├── System parses file
  ├── Validates all rows
  └── Shows preview with errors highlighted
  ↓
Review validation results
  ├── Valid rows: green checkmarks
  └── Invalid rows: error messages
  ↓
Confirm import
  ├── Creates import job
  ├── Processes rows in batch
  └── Generates job report
  ↓
View import results
  ├── Success count
  ├── Error count with details
  └── Link to created orders
```

### Delivery Preferences

Recipients can set delivery preferences:

```
Recipient accesses Delivery Preferences
  ↓
Configure preferences for address
  ├── Preferred time window
  │   ├── Morning (8:00-12:00)
  │   ├── Afternoon (12:00-17:00)
  │   ├── Evening (17:00-20:00)
  │   └── Any time
  ├── Safe drop authorization
  │   ├── Enable/disable
  │   └── Specify location
  ├── Alternate recipient
  │   ├── Name
  │   └── Phone number
  ├── Notification preferences
  │   ├── Email notifications
  │   ├── SMS notifications
  │   └── Push notifications
  └── Special instructions
  ↓
Preferences saved
  ↓
When orders are created for this address
  ├── Preferences auto-loaded
  ├── Time window shown to dispatcher
  └── Agent sees special instructions
```

### Barcode/QR Labels

Generate compliant shipping labels:

```
Order created
  ↓
System generates label data
  ├── S10 tracking number (UPU standard)
  │   └── Format: AA123456789GQ
  ├── Barcode for scanning
  └── QR code linking to tracking page
  ↓
Clerk accesses label
  ├── Click "Print Label" on order
  └── LabelPreview component opens
  ↓
Label displays
  ├── From: Sender address
  ├── To: Recipient address with UAC
  ├── Tracking number (text + barcode)
  ├── QR code (links to /track?order=...)
  ├── Package type icon
  ├── Priority indicator
  └── Special handling badges
  ↓
Print or download PDF
```

### Customer Notifications

Automated delivery status notifications:

```
Status change occurs
  ↓
System checks notification settings
  ├── Recipient preferences
  └── Order notification flags
  ↓
Send notifications via configured channels
  ├── EMAIL: Via Resend API
  ├── SMS: Via Twilio (with fallback queue)
  └── PUSH: Via web push notifications
  ↓
Notification types
  ├── Order created
  ├── Out for delivery
  ├── Delivery attempted
  ├── Delivered successfully
  ├── Failed delivery
  ├── Pickup reminder
  └── Return initiated
  ↓
Notification logged
  ├── Stored in postal_notifications table
  └── Available for audit
```

---

## Features by Role

### Postal Clerk Features

| Feature | Description |
|---------|-------------|
| Create Order | Multi-step wizard for order creation |
| UAC Lookup | Search verified addresses by UAC code |
| Name Search | Search recipients by name (includes dependents) |
| Package Types | Letter, Parcel, Registered, Fragile, Hazmat |
| COD Orders | Create orders requiring payment on delivery |
| Bulk Import | Upload CSV for batch order creation |
| Priority Settings | 5 priority levels with SLA implications |
| Label Generation | Print S10-compliant shipping labels |
| Order History | View own created orders and status |

### Postal Dispatcher Features

| Feature | Description |
|---------|-------------|
| Order Queue | View pending/ready orders by status |
| Agent Workload | See active delivery counts per agent |
| Bulk Assignment | Assign multiple orders at once |
| Route Planning | Organize deliveries by geographic area |
| Real-time Tracking | Monitor active deliveries on map |
| Pickup Management | Schedule and assign pickup requests |
| Returns Oversight | Track return orders and status |
| Import Monitoring | Review bulk import job results |

### Postal Agent Features

| Feature | Description |
|---------|-------------|
| My Deliveries | Personal delivery queue for the day |
| In-App Routing | Embedded Leaflet/OSRM route map |
| GPS Navigation | External maps (Apple Maps/Google Maps) |
| Status Updates | Mark out for delivery, arrived, completed |
| Signature Capture | Digital signature pad integration |
| Photo Evidence | Camera capture with GPS overlay |
| COD Collection | Collect and record cash payments |
| Pickup Execution | Handle assigned pickup requests |
| Failure Reporting | Document delivery attempt failures |

### Postal Supervisor Features

| Feature | Description |
|---------|-------------|
| Dashboard | Overview stats and KPIs |
| Agent Performance | Metrics by agent (completion rate, time) |
| Proof Review | View signatures and photos for verification |
| Analytics | Charts: deliveries by status, time trends |
| COD Management | Reconcile agent COD collections |
| Returns Tracking | Monitor return order lifecycle |
| Pickup Oversight | Review pickup request status |
| Bulk Import Status | Track batch import jobs |
| Exports | CSV/PDF reports for management |
| Audit Logs | Complete activity trail |

---

## Integration with Address System

### UAC Address Validation

The Postal Module integrates with the National Address Registry (NAR) and Citizen Address Repository (CAR) for address validation:

```
Order Creation
  ↓
Clerk enters UAC code OR searches by name
  ↓
System queries addresses table
  ├── Checks verified = true
  ├── Retrieves coordinates (latitude, longitude)
  └── Gets full address details
  ↓
Address validated?
  ├── YES: Populate recipient fields, enable submission
  └── NO: Show error, require valid UAC
```

### Recipient Name Search

For postal delivery context, staff can search recipients by name:

```
Clerk enters recipient name
  ↓
search-citizen-addresses edge function
  ├── purpose = 'DELIVERY'
  ├── Searches person table by full_name
  ├── Searches household_dependents by full_name
  └── Applies postal staff authorization
  ↓
Returns results with privacy-appropriate data
  ├── Profile matches with citizen_address
  └── Dependent matches with guardian address
      └── Shows dependent type and guardian relationship
```

### Benefits of UAC Integration
- **Accuracy**: Verified coordinates eliminate wrong-address deliveries
- **Navigation**: GPS directions to exact location (in-app or external)
- **Audit Trail**: Delivery linked to official address record
- **Proof**: GPS verification confirms delivery to correct location
- **Household Coverage**: Can deliver to dependents via guardian address

---

## Database Schema

### delivery_orders
Primary table for delivery order records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_number | TEXT | Unique order reference (DEL-YYYY-XXXXXX) |
| status | delivery_status | Current order status |
| sender_name | TEXT | Sender identification |
| sender_branch | TEXT | Sending office/branch |
| recipient_name | TEXT | Recipient name |
| recipient_address_uac | TEXT | UAC of delivery address |
| package_type | package_type | Type of package |
| priority_level | INTEGER | Priority 1-5 |
| requires_signature | BOOLEAN | Signature required |
| requires_id_verification | BOOLEAN | ID check required |
| cod_required | BOOLEAN | Cash on delivery flag |
| cod_amount | NUMERIC | COD amount if required |
| scheduled_date | DATE | Target delivery date |
| preferred_time_window | time_window | Recipient preferred time |
| created_by | UUID | Clerk who created order |
| created_at | TIMESTAMP | Creation timestamp |

### delivery_assignments
Tracks agent assignments for orders.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to delivery_orders |
| agent_id | UUID | Assigned agent user_id |
| assigned_by | UUID | Dispatcher who assigned |
| assigned_at | TIMESTAMP | Assignment timestamp |
| route_sequence | INTEGER | Delivery route order |
| acknowledged_at | TIMESTAMP | Agent acknowledgment |
| started_at | TIMESTAMP | When agent began delivery |

### delivery_status_logs
Audit trail of all status changes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to delivery_orders |
| previous_status | delivery_status | Status before change |
| new_status | delivery_status | Status after change |
| changed_by | UUID | User who made change |
| changed_at | TIMESTAMP | Change timestamp |
| latitude | NUMERIC | GPS latitude at change |
| longitude | NUMERIC | GPS longitude at change |
| notes | TEXT | Optional status notes |
| reason | TEXT | Reason for status change |

### delivery_proof
Evidence captured at delivery completion.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to delivery_orders |
| proof_type | TEXT | signature, photo, both |
| signature_data | TEXT | Base64 signature image |
| photo_url | TEXT | Storage URL for photo |
| received_by_name | TEXT | Name of recipient |
| recipient_id_type | TEXT | ID type if verified |
| recipient_id_last_digits | TEXT | Last 4 digits of ID |
| relationship_to_recipient | TEXT | Self, family, colleague |
| captured_by | UUID | Agent who captured |
| captured_at | TIMESTAMP | Capture timestamp |
| latitude | NUMERIC | GPS latitude |
| longitude | NUMERIC | GPS longitude |

### pickup_requests
Citizen package collection requests.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| request_number | TEXT | Unique reference |
| user_id | UUID | Requesting citizen |
| address_uac | TEXT | Pickup address UAC |
| package_count | INTEGER | Number of packages |
| estimated_weight | INTEGER | Total weight estimate |
| preferred_date | DATE | Requested date |
| preferred_time_window | time_window | Preferred time |
| status | pickup_status | Request status |
| assigned_agent_id | UUID | Assigned agent |
| scheduled_date | DATE | Confirmed date |
| completed_at | TIMESTAMP | Completion time |

### return_orders
Return and reverse logistics tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| return_number | TEXT | Unique reference |
| original_order_id | UUID | Original delivery order |
| return_reason | TEXT | Reason for return |
| initiated_by | UUID | Who initiated return |
| status | return_status | Return status |
| label_generated | BOOLEAN | Return label created |
| tracking_number | TEXT | S10 return tracking |

### cod_transactions
Cash on delivery payment tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to delivery_orders |
| amount | NUMERIC | COD amount |
| currency | TEXT | Currency code |
| collection_status | cod_status | pending/collected/remitted |
| collected_by | UUID | Agent who collected |
| collected_at | TIMESTAMP | Collection time |
| payment_method | TEXT | Cash, card, etc. |
| receipt_number | TEXT | Receipt reference |
| remittance_date | DATE | Date remitted to office |
| remitted_to | UUID | Supervisor who received |

### Delivery Status Enum

```sql
CREATE TYPE delivery_status AS ENUM (
  'pending_intake',       -- Order created, awaiting review
  'ready_for_assignment', -- Approved, ready for dispatch
  'assigned',             -- Assigned to agent
  'out_for_delivery',     -- Agent en route
  'delivered',            -- Successfully delivered
  'failed_delivery',      -- Delivery attempt failed
  'address_not_found',    -- Could not locate address
  'returned_to_sender'    -- Returned to origin
);
```

---

## API Reference

### Edge Functions

#### `track-delivery`
Public endpoint for recipient delivery tracking.

**Method**: GET
**Auth**: None (public)
**Parameters**:
- `orderNumber` (required): Order reference number
- `recipientPhone` (optional): Phone for verification

**Response**:
```json
{
  "success": true,
  "order": {
    "order_number": "DEL-2025-001234",
    "status": "out_for_delivery",
    "recipient_name": "Elena Nguema",
    "scheduled_date": "2025-01-15",
    "status_history": [...],
    "proof": null
  }
}
```

#### `search-citizen-addresses`
Search for citizen addresses by name (postal staff authorized).

**Method**: POST
**Auth**: Required (postal roles)
**Parameters**:
- `query` (required): Search text (name or UAC)
- `purpose`: 'DELIVERY' for postal access

**Response**:
```json
{
  "success": true,
  "results": [...],
  "total_count": 5
}
```

#### `postal-notifications`
Send delivery status notifications.

**Method**: POST
**Auth**: Internal
**Parameters**:
- `order_id`: Order to notify about
- `notification_type`: Type of notification

### RPC Functions

#### `get_agent_deliveries(agent_id UUID)`
Returns all deliveries assigned to a specific agent.

#### `update_delivery_status(order_id UUID, new_status delivery_status, notes TEXT)`
Updates order status with audit logging.

#### `capture_delivery_proof(order_id UUID, proof_data JSONB)`
Records proof of delivery with signature/photo.

---

## Best Practices

### For Postal Clerks
- Always verify UAC before submitting orders
- Use name search for recipients without known UAC
- Double-check recipient phone for delivery contact
- Set appropriate priority based on package urgency
- Include special instructions for complex deliveries
- Use bulk import for high-volume order days
- Verify COD amounts before submission

### For Postal Dispatchers
- Balance workload across available agents
- Consider geographic clustering for route efficiency
- Monitor pending orders to prevent backlog
- Communicate with agents about priority changes
- Review recipient preferences before assignment
- Process pickup requests promptly
- Monitor bulk import results for errors

### For Postal Agents
- Use in-app routing to stay within the app
- Verify GPS is enabled before starting deliveries
- Take clear photos of delivered packages
- Record accurate failure reasons for non-deliveries
- Update status promptly for real-time tracking
- Collect exact COD amount and issue receipts
- Execute pickup assignments same day when possible

### For Postal Supervisors
- Review proof of delivery for high-value items
- Monitor performance metrics daily
- Address delivery failures promptly
- Export weekly reports for management
- Reconcile COD collections daily
- Monitor return order pipeline
- Review bulk import error reports

---

**Document Version**: 2.0  
**Last Updated**: December 2025  
**Maintained By**: ConEG Development Team
