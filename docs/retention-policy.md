# Biakam National Address System - Data Retention Policy

## Overview

This document outlines the data retention policy for the Biakam National Address System, including retention periods, archiving procedures, anonymization rules, and manual deletion options.

---

## Retention Periods

### Active Data

| Data Type | Retention Period | Location |
|-----------|------------------|----------|
| User Profiles | While account active | `profiles` table |
| User Roles | While role active | `user_roles` table |
| Verified Addresses (NAR) | Indefinite | `addresses` table |
| Pending Address Requests | Until resolved | `address_requests` table |
| Citizen Addresses (CAR) | Indefinite (with history) | `citizen_address` table |
| Business Listings | Indefinite | `organization_addresses` table |
| Emergency Incidents | 30 days active, then limited access | `emergency_incidents` table |
| Audit Logs | 1-7 years depending on type | Various audit tables |

### Rejected Data Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REJECTED ITEMS LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  0 - 6 MONTHS: ACTIVE                                                   │
│  ├── Full records in main tables                                        │
│  ├── Complete PII retained                                              │
│  ├── User can view, resubmit, or delete                                │
│  └── Tables: address_requests, citizen_address,                         │
│              residency_ownership_verifications                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  6 - 24 MONTHS: ARCHIVED                                                │
│  ├── Moved to archive tables                                            │
│  ├── PII preserved for appeals/audits                                   │
│  ├── Limited access (admins, auditors)                                  │
│  └── Tables: rejected_requests_archive,                                 │
│              rejected_citizen_addresses_archive,                        │
│              rejected_verifications_archive                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  24+ MONTHS: ANONYMIZED                                                 │
│  ├── PII removed (requester_id, person_id = NULL)                      │
│  ├── Statistical data preserved                                         │
│  ├── Retained for compliance/analytics                                  │
│  └── anonymized_at timestamp set                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Archive Tables

### rejected_requests_archive

Stores archived NAR address request rejections.

```sql
CREATE TABLE rejected_requests_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,              -- Original request ID
  requester_id UUID,                      -- NULL after anonymization
  request_type TEXT,
  address_type TEXT,
  street TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  building TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  rejection_reason TEXT,
  rejection_notes TEXT,
  rejected_by UUID,                       -- NULL after anonymization
  rejected_at TIMESTAMPTZ,
  original_created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  anonymized_at TIMESTAMPTZ,
  retention_metadata JSONB
);
```

### rejected_citizen_addresses_archive

Stores archived CAR address rejections.

```sql
CREATE TABLE rejected_citizen_addresses_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,
  person_id UUID,                         -- NULL after anonymization
  uac TEXT,
  unit_uac TEXT,
  address_kind TEXT,
  scope TEXT,
  notes TEXT,
  original_created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  anonymized_at TIMESTAMPTZ,
  retention_metadata JSONB
);
```

### rejected_verifications_archive

Stores archived residency verification rejections.

```sql
CREATE TABLE rejected_verifications_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,
  user_id UUID,                           -- NULL after anonymization
  verification_type TEXT,
  uac TEXT,
  verification_notes TEXT,
  verifier_notes TEXT,
  rejected_at TIMESTAMPTZ,
  original_created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  anonymized_at TIMESTAMPTZ,
  retention_metadata JSONB
);
```

---

## Automatic Retention Enforcement

### Monthly Cleanup Job

A scheduled job runs on the 1st of each month at 3:00 AM to enforce retention policy.

#### Phase 1: Archive (6+ months)

```sql
-- Archive rejected NAR requests
SELECT archive_old_rejected_requests();
-- Returns: { "archived": N, "deleted": N, "cutoff_date": "..." }

-- Archive rejected CAR addresses
SELECT archive_old_rejected_citizen_addresses();
-- Returns: { "archived": N, "deleted": N, "cutoff_date": "..." }

-- Archive rejected verifications
SELECT archive_old_rejected_verifications();
-- Returns: { "archived": N, "deleted": N, "cutoff_date": "..." }
```

#### Phase 2: Anonymize (24+ months)

```sql
-- Anonymize old archived records
SELECT anonymize_archived_records();
-- Returns: {
--   "requests_anonymized": N,
--   "addresses_anonymized": N,
--   "verifications_anonymized": N,
--   "cutoff_date": "..."
-- }
```

### Audit Logging

All retention operations are logged to `cleanup_audit_log`:

```sql
CREATE TABLE cleanup_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleanup_type TEXT NOT NULL,             -- 'archive', 'anonymize', 'manual_delete'
  records_archived INTEGER,
  records_deleted INTEGER,
  records_anonymized INTEGER,
  details JSONB,
  executed_by UUID,                       -- NULL for automated jobs
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Manual Deletion

### User-Initiated Deletion

Citizens can delete their own rejected requests at any time:

```typescript
// Delete a rejected address request
const { data, error } = await supabase.rpc('delete_rejected_request', {
  p_request_id: requestId
});

// Response: { success: true, message: "Request deleted successfully" }
// Or: { success: false, error: "Only rejected requests can be deleted" }
```

#### Deletion Rules

1. **Ownership**: Users can only delete their own requests
2. **Status**: Only rejected items can be deleted
3. **No Archive**: Manually deleted items are permanently removed (not archived)
4. **Audit**: Deletion is logged with user ID

### Admin Deletion

Admins can delete any rejected item:

```sql
-- Admin delete function respects role check
SELECT delete_rejected_request(request_id);
-- Admin role bypasses ownership check
```

---

## GDPR Compliance

### Right to Erasure (Article 17)

Users can request complete deletion of their personal data:

1. **Profile Deletion**: Removes user account and profile
2. **Address Anonymization**: PII removed from historical records
3. **Audit Trail**: Deletion request logged for compliance

```typescript
// Request account deletion
async function requestAccountDeletion(userId: string) {
  // Verify user identity
  if (auth.uid() !== userId) throw new Error('Unauthorized');
  
  // Schedule deletion (90-day cooling off period)
  await supabase.rpc('schedule_account_deletion', {
    p_user_id: userId,
    p_deletion_date: addDays(new Date(), 90)
  });
  
  // Send confirmation email
  await sendDeletionConfirmationEmail(userId);
}
```

### Right to Access (Article 15)

Users can export all their personal data:

```typescript
// Export user data
async function exportUserData(userId: string) {
  return {
    profile: await getUserProfile(userId),
    addresses: await getUserCAR(userId),
    businesses: await getUserBusinesses(userId),
    requests: await getUserRequests(userId),
    verifications: await getUserVerifications(userId)
  };
}
```

### Data Portability (Article 20)

Exported data is provided in JSON format for portability.

---

## Retention by Data Category

### Personal Identifiable Information (PII)

| Field | Retention | Anonymization |
|-------|-----------|---------------|
| Full Name | Until account deletion | Replaced with hash |
| Email | Until account deletion | Removed |
| Phone | Until account deletion | Removed |
| National ID | Until account deletion | Removed |
| Address Details | Based on record type | Street/building retained |

### Non-PII Data

| Field | Retention | Purpose |
|-------|-----------|---------|
| Region/City | Indefinite | Geographic analytics |
| Address Type | Indefinite | System statistics |
| Rejection Reason | Indefinite | Quality improvement |
| Timestamps | Indefinite | Audit trail |
| UAC Codes | Indefinite | System integrity |

### Emergency Data

| Field | Retention | Access |
|-------|-----------|--------|
| Incident Details | 7 years | Police admin only |
| Reporter Info | 30 days active | Encrypted |
| Location Data | 7 years | Anonymized after 1 year |
| Response Metrics | Indefinite | Aggregated only |

---

## Implementation Guide

### Enabling Retention Policy

1. **Create Archive Tables** (one-time):
```sql
-- Tables created via migration
-- rejected_requests_archive
-- rejected_citizen_addresses_archive
-- rejected_verifications_archive
-- cleanup_audit_log
```

2. **Create Retention Functions** (one-time):
```sql
-- Functions created via migration
-- archive_old_rejected_requests()
-- archive_old_rejected_citizen_addresses()
-- archive_old_rejected_verifications()
-- anonymize_archived_records()
-- delete_rejected_request()
```

3. **Schedule Monthly Job** (via edge function or cron):
```typescript
// Monthly cleanup edge function
// Runs on 1st of month at 3 AM
export async function runRetentionCleanup() {
  const results = {
    requests: await supabase.rpc('archive_old_rejected_requests'),
    carAddresses: await supabase.rpc('archive_old_rejected_citizen_addresses'),
    verifications: await supabase.rpc('archive_old_rejected_verifications'),
    anonymized: await supabase.rpc('anonymize_archived_records')
  };
  
  // Log results
  console.log('Retention cleanup completed:', results);
  
  return results;
}
```

### Monitoring Retention

```sql
-- Check archive status
SELECT 
  'requests' as type,
  COUNT(*) as archived,
  COUNT(*) FILTER (WHERE anonymized_at IS NOT NULL) as anonymized
FROM rejected_requests_archive
UNION ALL
SELECT 
  'car_addresses',
  COUNT(*),
  COUNT(*) FILTER (WHERE anonymized_at IS NOT NULL)
FROM rejected_citizen_addresses_archive
UNION ALL
SELECT 
  'verifications',
  COUNT(*),
  COUNT(*) FILTER (WHERE anonymized_at IS NOT NULL)
FROM rejected_verifications_archive;

-- Check recent cleanup operations
SELECT * FROM cleanup_audit_log
ORDER BY executed_at DESC
LIMIT 10;
```

---

## Exceptions

### Legal Holds

Data subject to legal proceedings is exempt from automatic deletion:

```sql
-- Add legal hold to retention_metadata
UPDATE rejected_requests_archive
SET retention_metadata = retention_metadata || '{"legal_hold": true, "hold_reason": "...", "hold_until": "..."}'
WHERE original_id = 'specific-request-id';
```

### Audit Requirements

Certain records may need extended retention for compliance:

- Financial transactions: 7 years
- Security incidents: 7 years
- Government audits: As required

---

## Contact

For questions about data retention:
- **Data Protection Officer**: dpo@biakam.gq
- **Technical Support**: tech-support@biakam.gq
- **Privacy Requests**: privacy@biakam.gq

---

*Last Updated: December 2025*
*Version: 1.0*
