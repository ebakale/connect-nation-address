# ConEG Postal Delivery Module - Complete Guide

## Table of Contents
1. [Module Overview](#module-overview)
2. [User Roles](#user-roles)
3. [Core Workflows](#core-workflows)
4. [Features by Role](#features-by-role)
5. [Integration with Address System](#integration-with-address-system)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)

---

## Module Overview

The ConEG Postal Delivery Module is a comprehensive government postal services management system integrated with the National Digital Address System. It enables efficient delivery operations by leveraging UAC (Unified Address Code) verified addresses.

### Key Capabilities
- **Order Management**: Create, track, and manage delivery orders
- **UAC Integration**: Automatic address validation using verified NAR/CAR addresses
- **Agent Assignment**: Intelligent workload distribution across delivery agents
- **GPS Navigation**: Turn-by-turn navigation to verified address coordinates
- **Proof of Delivery**: Digital signature and photo capture with GPS verification
- **Real-time Tracking**: Live delivery status updates for all stakeholders
- **Analytics & Reporting**: Performance metrics and delivery statistics

---

## User Roles

### Postal Clerk (`postal_clerk`)
**Purpose**: Order intake and creation

**Permissions**:
- ✅ Create new delivery orders
- ✅ Search and validate recipient addresses by UAC
- ✅ Enter package details and sender information
- ✅ View own created orders
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
- ❌ Cannot complete deliveries
- ❌ Cannot approve orders

**Primary View**: Dispatcher Panel, Assign Orders tab

### Postal Agent (`postal_agent`)
**Purpose**: Field delivery execution

**Permissions**:
- ✅ View assigned deliveries
- ✅ Navigate to delivery addresses
- ✅ Update delivery status (out for delivery, delivered, failed)
- ✅ Capture proof of delivery (signature, photo)
- ✅ Mark deliveries as complete or failed
- ✅ Record delivery attempt notes
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
Search recipient address by UAC
  ├── System validates UAC
  ├── Auto-populates address from NAR/CAR
  └── Displays verified address details
  ↓
Enter package details
  ├── Package type (letter, parcel, registered, fragile, hazmat)
  ├── Weight and dimensions
  ├── Declared value
  └── Special handling requirements
  ↓
Set delivery parameters
  ├── Priority level (1-5)
  ├── Scheduled delivery date
  ├── Requires signature?
  └── Requires ID verification?
  ↓
Submit order
  ├── System generates order number (DEL-YYYY-XXXXXX)
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
  └── Order appears in agent's queue
```

### Delivery Execution Flow

```
Agent receives assignment notification
  ↓
View delivery details
  ├── Recipient name and address
  ├── UAC code for navigation
  ├── Package details
  └── Special instructions
  ↓
Click "Start Delivery" / Update status to "Out for Delivery"
  ↓
Navigate to address
  ├── GPS navigation using UAC coordinates
  ├── Real-time ETA tracking
  └── Status updates visible to dispatcher
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
  │   └── ID verification (if required)
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

## Features by Role

### Postal Clerk Features

| Feature | Description |
|---------|-------------|
| Create Order | Multi-step wizard for order creation |
| UAC Lookup | Search verified addresses by UAC code |
| Package Types | Letter, Parcel, Registered, Fragile, Hazmat |
| Priority Settings | 5 priority levels with SLA implications |
| Order History | View own created orders and status |

### Postal Dispatcher Features

| Feature | Description |
|---------|-------------|
| Order Queue | View pending/ready orders by status |
| Agent Workload | See active delivery counts per agent |
| Bulk Assignment | Assign multiple orders at once |
| Route Planning | Organize deliveries by geographic area |
| Real-time Tracking | Monitor active deliveries on map |

### Postal Agent Features

| Feature | Description |
|---------|-------------|
| My Deliveries | Personal delivery queue for the day |
| GPS Navigation | Turn-by-turn to UAC coordinates |
| Status Updates | Mark out for delivery, arrived, completed |
| Signature Capture | Digital signature pad integration |
| Photo Evidence | Camera capture with GPS overlay |
| Failure Reporting | Document delivery attempt failures |

### Postal Supervisor Features

| Feature | Description |
|---------|-------------|
| Dashboard | Overview stats and KPIs |
| Agent Performance | Metrics by agent (completion rate, time) |
| Proof Review | View signatures and photos for verification |
| Analytics | Charts: deliveries by status, time trends |
| Exports | CSV/PDF reports for management |
| Audit Logs | Complete activity trail |

---

## Integration with Address System

### UAC Address Validation

The Postal Module integrates with the National Address Registry (NAR) and Citizen Address Repository (CAR) for address validation:

```
Order Creation
  ↓
Clerk enters UAC code
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

### Benefits of UAC Integration
- **Accuracy**: Verified coordinates eliminate wrong-address deliveries
- **Navigation**: GPS directions to exact location
- **Audit Trail**: Delivery linked to official address record
- **Proof**: GPS verification confirms delivery to correct location

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
| scheduled_date | DATE | Target delivery date |
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
- Double-check recipient phone for delivery contact
- Set appropriate priority based on package urgency
- Include special instructions for complex deliveries

### For Postal Dispatchers
- Balance workload across available agents
- Consider geographic clustering for route efficiency
- Monitor pending orders to prevent backlog
- Communicate with agents about priority changes

### For Postal Agents
- Verify GPS is enabled before starting deliveries
- Take clear photos of delivered packages
- Record accurate failure reasons for non-deliveries
- Update status promptly for real-time tracking

### For Postal Supervisors
- Review proof of delivery for high-value items
- Monitor performance metrics daily
- Address delivery failures promptly
- Export weekly reports for management

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Maintained By**: ConEG Development Team
