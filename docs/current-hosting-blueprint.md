# Biakam National Address System - Hosting Blueprint

## Executive Summary

The Biakam National Address System is hosted on Supabase, a managed Backend-as-a-Service platform built on PostgreSQL. This blueprint documents the current production architecture, infrastructure components, operational procedures, and scaling considerations.

**Platform**: Supabase (supabase.co)
**Database**: Managed PostgreSQL 15+
**Hosting**: Lovable Cloud with Supabase backend
**Region**: US-East (primary)
**Status**: ✅ Production Ready
**Last Updated**: March 2026
**Infrastructure Version**: 4.1

---

## Current Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│  Frontend Layer (Lovable Cloud)                     │
│  - React 18.3 + TypeScript                          │
│  - Vite build system                                │
│  - Global CDN delivery                              │
│  - Static asset hosting                             │
│  - PWA capabilities                                 │
│  - Responsive mobile-first UI                       │
│  - Offline-first architecture                       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  API & Edge Functions Layer (Supabase)              │
│  - PostgREST API (auto-generated)                   │
│  - Deno Edge Functions (52+ deployed)               │
│  - Real-time subscriptions (WebSocket)              │
│  - Authentication service (GoTrue)                  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Database Layer (Supabase PostgreSQL)               │
│  - PostgreSQL 15+ with PostGIS                      │
│  - Connection pooling (PgBouncer)                   │
│  - Row Level Security (243+ policies)               │
│  - Automated backups                                │
│  - 72+ tables                                       │
│  - 4 Security Invoker Views                         │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Storage Layer (Supabase Storage)                   │
│  - S3-compatible object storage                     │
│  - CDN-delivered assets                             │
│  - Address photos and documents                     │
│  - Delivery proof photos                            │
└─────────────────────────────────────────────────────┘
```

---

## Bill of Materials (BOM)

### Active Services

#### Core Infrastructure
- **Supabase Project**: 1 production instance (calegudnfdbeznyiebbh)
- **Database**: PostgreSQL 15+ (8GB included in Pro plan)
- **Edge Functions**: 52+ deployed functions
- **Storage Buckets**: 2 buckets (address-photos, delivery-proof)
- **Authentication**: Email/password with JWT + offline fallback

#### Database Schema (72+ tables)

**Core Tables**:
- `profiles` - User profiles and metadata
- `user_roles` - Role assignments (24+ role types)
- `user_role_metadata` - Geographic and domain scoping
- `person` - Person records for CAR module
- `provinces` - Geographic hierarchy (provinces)
- `cities` - Geographic hierarchy (cities)

**NAR Module** (15+ tables):
- `addresses` - Main address registry
- `address_requests` - Approval workflow
- `address_audit_log` - Change tracking
- `address_search_audit` - Search tracking
- `organization_addresses` - Business directory
- `authorized_verifiers` - Verifier credentials
- `uac_sequence_counters` - UAC generation
- `coverage_analytics` - Geographic coverage metrics

**CAR Module** (12+ tables):
- `citizen_address` - Citizen address declarations
- `citizen_address_event` - Address event log
- `household_groups` - Household management
- `household_members` - Household membership
- `household_dependents` - Dependent management
- `household_activity_audit` - Household changes
- `dependent_authorization_audit` - Dependent actions
- `residency_ownership_verifications` - Verification requests
- `document_verification_audit` - Document verification
- `privacy_consent_log` - GDPR consent tracking
- `car_permissions` - CAR-specific permissions
- `car_quality_metrics` - CAR analytics

**Postal Delivery Module** (12+ tables):
- `delivery_orders` - Package/letter delivery tracking
- `delivery_assignments` - Agent route assignments
- `delivery_status_logs` - Status change history
- `delivery_proof` - Signature/photo proof of delivery
- `delivery_preferences` - Recipient preferences
- `postal_labels` - S10 international tracking labels
- `postal_notifications` - Delivery notifications
- `pickup_requests` - Citizen pickup scheduling
- `return_orders` - Return processing
- `cod_transactions` - Cash on delivery management
- `bulk_import_jobs` - Bulk import tracking
- `bulk_import_orders` - Imported order records

**Emergency Module** (10+ tables):
- `emergency_incidents` - Incident records
- `emergency_units` - Police/fire units
- `emergency_unit_members` - Unit assignments
- `emergency_notifications` - Alert delivery
- `emergency_operator_sessions` - Operator tracking
- `emergency_incident_logs` - Incident activity
- `backup_metadata` - Backup tracking
- `backup_acknowledgments` - Unit acknowledgments

**Archive Tables** (4 tables):
- `rejected_requests_archive` - Archived NAR rejections
- `rejected_citizen_addresses_archive` - Archived CAR rejections
- `rejected_verifications_archive` - Archived verification rejections
- `cleanup_audit_log` - Retention enforcement log

**External Integration** (4+ tables):
- `external_systems` - Partner system registry
- `saved_locations` - User saved places
- `recent_searches` - Search history (per user)
- `api_keys` - API key management

**Database Views** (4 security-invoker views):
- `citizen_address_with_details` - CAR address details (security_invoker=true)
- `my_person` - Current user's person record (security_invoker=true)
- `current_citizen_addresses` - Active citizen addresses (security_invoker=true)
- `citizen_address_manual_review_queue` - Manual review queue (security_invoker=true)

#### Edge Functions (52+)

**Address Management** (12 functions):
- `address-search-api` - Public search endpoint
- `address-validation-api` - Coordinate validation
- `address-webhook-triggers` - Partner notifications
- `auto-verify-address` - Automated verification
- `analyze-coordinates` - GPS accuracy check
- `analyze-photo-quality` - Image quality analysis
- `backfill-dependent-addresses` - Data migration
- `generate-missing-uacs` - Batch UAC generation
- `import-google-maps-addresses` - Import from Google
- `register-business-address` - Business registration
- `search-citizen-addresses` - CAR search endpoint
- `ml-address-validation` - ML-based validation

**Postal Delivery Module** (9 functions):
- `postal-analytics-api` - Delivery statistics and metrics
- `postal-notifications` - Delivery notification dispatch
- `track-delivery` - Public tracking endpoint
- `bulk-import-orders` - Excel/CSV import processing
- `seed-postal-users` - Demo postal user seeding
- `seed-postal-orders` - Demo order seeding
- `seed-citizen-deliveries` - Citizen delivery seeding
- `fix-missing-nar-address` - Data repair utility
- `system-config-api` - System configuration management

**Emergency Management** (11 functions):
- `process-emergency-alert` - Alert processing
- `notify-emergency-operators` - Dispatcher alerts
- `notify-incident-reporter` - Citizen updates
- `notify-unit-assignment` - Unit notifications
- `decrypt-incident-data` - Secure data access
- `police-incident-actions` - Incident operations
- `police-operator-management` - Police user ops
- `police-analytics-api` - Police analytics
- `process-backup-request` - Backup coordination
- `unit-communications` - Inter-unit messaging
- `sms-fallback-service` - SMS notifications

**Analytics & Reporting** (6 functions):
- `unified-address-analytics` - System analytics
- `unified-address-statistics` - Statistical reports
- `coverage-analytics-api` - Coverage metrics
- `track-search-analytics` - Search tracking
- `advanced-analytics-api` - Advanced reporting
- `government-integration-api` - Government data

**Administration** (8 functions):
- `admin-user-operations` - User management
- `admin-address-requests` - Request handling
- `seed-police-users` - Initial data seeding
- `cleanup-rejected-items` - Retention enforcement
- `backup-system-api` - Backup operations
- `external-api` - External partner API
- `webhook-delivery-processor` - Webhook delivery
- `webhook-events` - Webhook event handling

**Utilities** (6 functions):
- `get-google-maps-token` - Maps authentication
- `get-mapbox-token` - Mapbox authentication
- `get-distance-estimates` - Distance calculations
- `save-translation-fix` - Translation management
- `suggest-translation` - AI translation suggestions
- `generate-platform-images` - Image generation

---

## Feature Modules

### Postal Delivery Module (NEW)

The Government Postal Delivery Module enables integration with national postal services for package and letter delivery using UAC-based addressing.

**Key Features**:
- **Order Management**: Create, track, and manage delivery orders
- **S10 International Tracking**: UPU-compliant S10 barcode standard
- **Agent Assignment**: Route optimization and agent workload balancing
- **Proof of Delivery**: Signature capture, photo proof, ID verification
- **COD (Cash on Delivery)**: XAF/EUR/USD currency support
- **Bulk Import**: Excel/CSV import for batch order creation
- **Returns Processing**: Return order workflow with pickup scheduling
- **Pickup Requests**: Citizen-initiated pickup scheduling
- **Real-time Notifications**: SMS/Email/Push delivery updates

**User Roles**:
- `postal_clerk` - Order intake and processing
- `postal_dispatcher` - Route planning and assignment
- `postal_supervisor` - Management and reporting
- `postal_agent` - Delivery execution

### Offline Capabilities (NEW)

The system supports offline-first functionality for field operations:

**Unified Authentication**:
- Seamless online/offline mode switching
- Local authentication with IndexedDB storage
- Credential caching for offline access
- Background sync when connectivity restored

**Offline Data Storage**:
- IndexedDB for local data persistence
- Sync queue for pending operations
- Conflict resolution on reconnect
- Network status monitoring

**Components**:
- `useUnifiedAuth` - Unified auth provider (online/offline)
- `useLocalAuth` - Local authentication hook
- `useOffline` - Network status and sync management

### Responsive Mobile-First UI (NEW)

The frontend implements responsive design patterns:

**ResponsiveTabsList Component**:
- Desktop: Traditional horizontal tabs
- Mobile: Dropdown selector (no horizontal scrolling)
- Automatic breakpoint detection

**Mobile Optimizations**:
- Touch-friendly target sizes
- Swipe gestures for navigation
- Bottom sheet dialogs
- Collapsible sidebars

### Internationalization (i18n)

**Translation System**:
- 11 translation namespaces: common, auth, dashboard, address, emergency, admin, countries, car, business, postal, demo
- 3 supported languages: English (en), Spanish (es), French (fr)
- Dynamic translation fixes loaded from `translation_fixes` table
- AI-powered translation suggestions

---

## Cost Analysis

### Current Pricing (Supabase Pro Plan)

```yaml
Base Cost: $25/month
Includes:
  - 8GB database storage
  - 100GB bandwidth
  - 500K edge function invocations
  - Unlimited API requests
  - 7-day point-in-time recovery
  - Daily backups
  - Email support

Current Usage Estimates:
  Database: ~6GB (within plan)
  Bandwidth: ~60GB/month (within plan)
  Functions: ~100K invocations/month (within plan)
  Storage: ~4GB photos (within plan)
  
Estimated Monthly Cost: $25-40/month
```

### Scaling Cost Projections

```yaml
Small Scale (5K users, 50K addresses):
  Plan: Pro ($25/mo)
  Overages: Minimal
  Total: ~$30/month

Medium Scale (50K users, 500K addresses):
  Plan: Pro ($25/mo)
  Database: +8GB = $1.26/mo
  Bandwidth: +150GB = $13.50/mo
  Functions: +750K = $1.50/mo
  Total: ~$45-55/month

Large Scale (500K users, 5M addresses):
  Plan: Team ($599/mo) or Enterprise
  Includes: 100GB DB, 500GB bandwidth, 10M functions
  Total: ~$600-900/month

Enterprise Scale (5M+ users):
  Plan: Enterprise (custom pricing)
  Dedicated resources
  Custom SLA
  Estimated: $2,000-5,000/month
```

---

## Performance & Scaling

### Current Performance Metrics

```yaml
Database:
  Query Response: <50ms average
  Connection Pool: 60 connections (Pro)
  Concurrent Users: 500+ simultaneous
  Read/Write IOPS: Provisioned based on size
  Tables: 72+
  RLS Policies: 243+
  Database Functions: 89+

API Performance:
  REST API: <100ms response time
  WebSocket: <10ms latency
  Rate Limit: 100 requests/second
  Throughput: 10,000 requests/minute

Edge Functions:
  Cold Start: 100-300ms
  Warm Execution: <10ms
  Concurrent Executions: 1000+
  Functions Deployed: 52+
  Global Latency: <100ms (15+ edge locations)

Storage:
  Upload Speed: 10MB/s
  Download Speed: 100MB/s via CDN
  CDN Hit Rate: ~95%
  Global Distribution: Automatic
```

### Auto-Scaling Configuration

```yaml
Database Scaling:
  - Automatic connection pooling
  - Manual storage upgrades (if needed)
  - Compute tied to plan tier

Edge Functions:
  - Automatic horizontal scaling
  - Per-function resource limits (512MB, 60s timeout)
  - Global deployment across 15+ regions

Storage:
  - Unlimited capacity
  - Automatic CDN scaling
  - Bandwidth scales with plan
```

---

## Operational Procedures

### Daily Operations

```yaml
Monitoring:
  - Review Supabase dashboard metrics
  - Check edge function error rates (<5% threshold)
  - Validate backup completion
  - Monitor active user count
  - Review incident response times
  - Check retention job status
  - Monitor postal delivery SLAs

Maintenance:
  - Process pending address verifications
  - Review emergency incident logs
  - Check system health alerts
  - Validate data integrity
  - Review postal agent assignments
```

### Weekly Operations

```yaml
Quality Assurance:
  - Address quality review
  - User activity analysis
  - Performance metric reports
  - Security review
  - Translation audit
  - Postal delivery metrics review

Database:
  - Review slow query logs
  - Check index performance
  - Validate RLS policy effectiveness
  - Review geographic scope coverage
```

### Monthly Operations

```yaml
System Audit:
  - Comprehensive system audit
  - User role review
  - Geographic coverage analysis
  - Partner API usage review
  - Disaster recovery testing
  - COD reconciliation audit

Retention Enforcement:
  - archive_old_rejected_requests() execution
  - archive_old_rejected_citizen_addresses() execution
  - archive_old_rejected_verifications() execution
  - anonymize_archived_records() execution
  - Review cleanup_audit_log results
```

### Backup & Recovery

```yaml
Automated Backups:
  - Continuous WAL archiving
  - Daily full database snapshots
  - 7-day retention (Pro plan)
  - Point-in-time recovery available
  
Recovery Procedures:
  RTO: 2 hours
  RPO: 5 minutes
  
  Steps:
    1. Identify backup point
    2. Initiate restore via Supabase dashboard
    3. Validate data integrity
    4. Verify application functionality
    5. Resume normal operations
```

### Deployment Process

```yaml
Frontend Deployment:
  1. Code changes merged to main branch
  2. Automatic build via Lovable
  3. Preview deployment created
  4. Manual promotion to production
  5. CDN cache invalidation

Edge Function Deployment:
  1. Function code updated in supabase/functions/
  2. Automatic deployment on code push
  3. Verify deployment in Supabase dashboard
  4. Test production endpoint
  5. Monitor function logs

Database Migrations:
  1. Create migration file via Lovable migration tool
  2. User approves migration
  3. Migration executed automatically
  4. Types regenerated
  5. Verify migration success
```

---

## Security Implementation

### Authentication & Authorization
- JWT-based authentication (RS256)
- Role-based access control (24+ roles)
- Geographic scoping for field users
- Verification domain scoping for verifiers
- Session management with auto-refresh
- Offline authentication support with IndexedDB
- Unified auth provider (online/offline seamless)

### Database Security
- Row Level Security on all 72+ tables (243+ policies)
- Geographic scope enforcement
- Privacy level enforcement (CAR)
- Encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.3)
- Comprehensive audit logging
- Security Invoker Views (4 views with security_invoker=true)

### Application Security
- Input validation (Zod schemas)
- XSS prevention (React auto-escape + DOMPurify)
- CSRF protection
- Security headers configured
- Rate limiting enabled
- Map provider fallback (OSM when Google unavailable)

---

## Monitoring & Alerting

### Supabase Built-in Monitoring
- Database performance metrics
- API request rates and errors
- Edge function execution logs
- Authentication success/failure rates
- Storage usage and bandwidth

### Custom Monitoring
- Application error boundaries
- User activity tracking
- Performance metrics (Web Vitals)
- Business metrics:
  - Addresses created/verified/published
  - CAR declarations (auto-approved vs manual)
  - Incidents resolved
  - Response times
  - Business registrations
  - Postal deliveries (on-time vs delayed)
  - COD collection rates

### Recommended Alerts
- Database CPU > 80%
- Failed authentication rate spike
- Edge function error rate > 5%
- Storage approaching quota
- Backup failure
- Retention job failure
- Emergency response SLA breach
- Postal delivery SLA breach

---

## Disaster Recovery Plan

### Recovery Scenarios

**Scenario 1: Database Corruption**
```yaml
1. Detect issue via monitoring
2. Stop application writes
3. Assess corruption extent
4. Restore from point-in-time backup
5. Validate data integrity
6. Resume operations
Recovery Time: 1-2 hours
```

**Scenario 2: Complete System Failure**
```yaml
1. Activate incident response team
2. Deploy to backup Supabase project (if available)
3. Restore database from latest backup
4. Redeploy edge functions
5. Update DNS/routing
6. Validate all functionality
Recovery Time: 2-4 hours
```

**Scenario 3: Data Breach**
```yaml
1. Isolate affected systems
2. Revoke compromised credentials
3. Audit access logs
4. Notify affected users
5. Restore from pre-breach backup if needed
6. Implement additional security measures
Response Time: Immediate containment within 1 hour
```

---

## Integration Architecture

### External Services

```yaml
Maps & Geolocation:
  Primary:
    - Google Maps API (geocoding, places)
    - Mapbox API (interactive maps)
  Fallback:
    - OpenStreetMap (via Leaflet)
    - Automatic fallback when primary unavailable
  Mobile:
    - Capacitor Geolocation (GPS)

AI & Analysis:
  - OpenAI API (address validation suggestions)
  - Custom ML models (photo quality analysis)
  - Translation suggestions

Mobile:
  - Capacitor 7 (iOS/Android)
  - Camera plugin (photo capture)
  - Geolocation plugin (GPS)
  - QR Scanner plugin

Notifications:
  - Email (Resend API via postal-notifications)
  - In-app notifications (real-time)
  - SMS (planned integration)
  - Push notifications (via Capacitor)

Postal Integration:
  - S10 International Tracking (UPU standard)
  - COD payment processing
  - Bulk import (Excel/CSV)
```

---

## Capacity Planning

### Current Capacity

```yaml
Users:
  Registered: Growing
  Concurrent: 500+ supported
  Peak: 200+ simultaneous

Data:
  Addresses: Growing (NAR registry)
  CAR Declarations: Growing
  Business Listings: Growing
  Delivery Orders: Growing
  Incidents: Monthly archives

Storage:
  Photos: ~4GB (compressed)
  Documents: <1GB
  Delivery Proof: ~500MB
  Growth Rate: ~750MB/month
```

### Scaling Triggers

```yaml
Upgrade to Team Plan when:
  - Database > 15GB
  - Bandwidth > 400GB/month
  - Functions > 4M invocations/month
  - Need advanced features (PITR > 7 days)

Upgrade to Enterprise when:
  - Users > 500K
  - Need custom SLA
  - Require dedicated resources
  - Need compliance certifications
```

---

## Conclusion

The Biakam National Address System is production-ready on a robust, scalable Supabase infrastructure. Current costs are minimal (~$25-40/month) with clear scaling paths to enterprise levels.

**Current State (December 2025)**:
- 72+ database tables
- 52+ edge functions
- 24+ user roles with geographic/domain scoping
- 243+ RLS policies
- 4 security-invoker views
- Auto-publishing policy (eliminates manual publication)
- CAR auto-approval workflow
- **Postal Delivery Module with COD, returns, and bulk import**
- **Offline-first capabilities with unified auth**
- **Responsive mobile-first UI**
- **S10 international tracking standard**
- Map fallback system (OSM when needed)
- Automatic retention policy enforcement
- 11 i18n namespaces (3 languages)

**Strengths**:
- Enterprise-grade security and compliance
- Automatic scaling and high availability
- Minimal operational overhead
- Clear cost predictability
- Excellent performance metrics
- Comprehensive feature set
- Offline-first architecture
- Mobile-optimized responsive UI

**Next Steps**:
- Monitor growth and optimize as needed
- Plan Team tier upgrade at 50K users
- Consider enterprise plan at 500K+ users
- Implement SMS notifications expansion
- Add real-time delivery tracking maps
- Implement mobile push notifications

---

*Last Updated: December 2025*
*Infrastructure Version: 4.0*
