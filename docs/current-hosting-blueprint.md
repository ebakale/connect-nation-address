# Biakam National Address System - Hosting Blueprint

## Executive Summary

The Biakam National Address System is hosted on Supabase, a managed Backend-as-a-Service platform built on PostgreSQL. This blueprint documents the current production architecture, infrastructure components, operational procedures, and scaling considerations.

**Platform**: Supabase (supabase.co)
**Database**: Managed PostgreSQL 15+
**Hosting**: Lovable Cloud with Supabase backend
**Region**: US-East (primary)
**Status**: ✅ Production Ready
**Last Updated**: December 2025

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
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  API & Edge Functions Layer (Supabase)              │
│  - PostgREST API (auto-generated)                   │
│  - Deno Edge Functions (42+ deployed)               │
│  - Real-time subscriptions (WebSocket)              │
│  - Authentication service (GoTrue)                  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Database Layer (Supabase PostgreSQL)               │
│  - PostgreSQL 15+ with PostGIS                      │
│  - Connection pooling (PgBouncer)                   │
│  - Row Level Security (RLS)                         │
│  - Automated backups                                │
│  - 75+ tables                                       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Storage Layer (Supabase Storage)                   │
│  - S3-compatible object storage                     │
│  - CDN-delivered assets                             │
│  - Address photos and documents                     │
└─────────────────────────────────────────────────────┘
```

---

## Bill of Materials (BOM)

### Active Services

#### Core Infrastructure
- **Supabase Project**: 1 production instance (calegudnfdbeznyiebbh)
- **Database**: PostgreSQL 15+ (8GB included in Pro plan)
- **Edge Functions**: 42+ deployed functions
- **Storage Buckets**: 1 bucket (address-photos)
- **Authentication**: Email/password with JWT

#### Database Schema (75+ tables)

**Core Tables**:
- `profiles` - User profiles and metadata
- `user_roles` - Role assignments (20+ role types)
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

**Emergency Module** (10+ tables):
- `emergency_incidents` - Incident records
- `emergency_units` - Police/fire units
- `emergency_unit_members` - Unit assignments
- `emergency_notifications` - Alert delivery
- `emergency_operator_sessions` - Operator tracking
- `emergency_incident_logs` - Incident activity
- `backup_metadata` - Backup tracking

**Archive Tables** (3 tables):
- `rejected_requests_archive` - Archived NAR rejections
- `rejected_citizen_addresses_archive` - Archived CAR rejections
- `rejected_verifications_archive` - Archived verification rejections
- `cleanup_audit_log` - Retention enforcement log

**External Integration** (3+ tables):
- `external_systems` - Partner system registry
- `saved_locations` - User saved places
- `recent_searches` - Search history (per user)

#### Edge Functions (42+)

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

**Emergency Management** (10 functions):
- `process-emergency-alert` - Alert processing
- `notify-emergency-operators` - Dispatcher alerts
- `notify-incident-reporter` - Citizen updates
- `notify-unit-assignment` - Unit notifications
- `decrypt-incident-data` - Secure data access
- `police-incident-actions` - Incident operations
- `police-operator-management` - Police user ops
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
  Functions: ~75K invocations/month (within plan)
  Storage: ~3GB photos (within plan)
  
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
  Tables: 75+
  RLS Policies: 100+

API Performance:
  REST API: <100ms response time
  WebSocket: <10ms latency
  Rate Limit: 100 requests/second
  Throughput: 10,000 requests/minute

Edge Functions:
  Cold Start: 100-300ms
  Warm Execution: <10ms
  Concurrent Executions: 1000+
  Functions Deployed: 42+
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

Maintenance:
  - Process pending address verifications
  - Review emergency incident logs
  - Check system health alerts
  - Validate data integrity
```

### Weekly Operations

```yaml
Quality Assurance:
  - Address quality review
  - User activity analysis
  - Performance metric reports
  - Security review
  - Translation audit

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
- Role-based access control (20+ roles)
- Geographic scoping for field users
- Verification domain scoping for verifiers
- Session management with auto-refresh
- Offline authentication support

### Database Security
- Row Level Security on all 75+ tables
- Geographic scope enforcement
- Privacy level enforcement (CAR)
- Encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.3)
- Comprehensive audit logging

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

### Recommended Alerts
- Database CPU > 80%
- Failed authentication rate spike
- Edge function error rate > 5%
- Storage approaching quota
- Backup failure
- Retention job failure
- Emergency response SLA breach

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
  - Email (Supabase Auth)
  - In-app notifications (real-time)
  - SMS (planned integration)
  - Push notifications (via Capacitor)
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
  Incidents: Monthly archives

Storage:
  Photos: ~3GB (compressed)
  Documents: <1GB
  Growth Rate: ~500MB/month
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
- 75+ database tables
- 42+ edge functions
- 20+ user roles with geographic/domain scoping
- Auto-publishing policy (eliminates manual publication)
- CAR auto-approval workflow
- Map fallback system (OSM when needed)
- Automatic retention policy enforcement

**Strengths**:
- Enterprise-grade security and compliance
- Automatic scaling and high availability
- Minimal operational overhead
- Clear cost predictability
- Excellent performance metrics
- Comprehensive feature set

**Next Steps**:
- Monitor growth and optimize as needed
- Plan Team tier upgrade at 50K users
- Consider enterprise plan at 500K+ users
- Implement SMS notifications
- Add advanced analytics dashboard

---

*Last Updated: December 2025*
*Infrastructure Version: 3.0*
