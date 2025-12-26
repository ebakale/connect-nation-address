# AWS Hosting Blueprint for Biakam National Address System

## Executive Summary

This blueprint outlines the architecture, services, and migration strategy for hosting the Biakam National Address System on Amazon Web Services (AWS). The system comprises **72+ database tables**, **52+ Edge Functions**, **24+ user roles**, **243+ RLS policies**, and supports **11 i18n namespaces** with offline-first mobile capabilities.

### Target Audience
- Government IT departments
- Enterprise deployments requiring AWS compliance certifications
- Organizations seeking vendor independence from Supabase

### Key Benefits
- Full infrastructure control and customization
- AWS compliance certifications (SOC 2, ISO 27001, FedRAMP, etc.)
- Multi-region deployment for disaster recovery
- Advanced auto-scaling and performance optimization

---

## Current System Overview

### Database Statistics
| Category | Count |
|----------|-------|
| Total Tables | 72+ |
| Edge Functions | 52+ |
| User Roles | 24+ |
| RLS Policies | 243+ |
| Database Functions | 89+ |
| Security-Invoker Views | 4 |
| i18n Namespaces | 11 |

### Feature Modules

#### 1. National Address Registry (NAR) Module
- **Tables**: addresses, address_requests, address_audit_log, address_search_audit, coverage_analytics, uac_sequence_counters
- **Functions**: generate_uac, generate_unified_uac_unique, approve_address_request, check_address_duplicates
- **Edge Functions**: verify-address, import-google-maps-addresses, export-nar-data, bulk-geocode

#### 2. Citizen Address Registry (CAR) Module
- **Tables**: citizen_address, citizen_address_event, person, car_permissions, car_quality_metrics
- **Functions**: add_secondary_address, close_current_primary, auto_approve_verified_citizen_addresses
- **Edge Functions**: verify-residency, link-citizen-address, citizen-address-history

#### 3. Government Postal Delivery Module
- **Tables**: delivery_orders, delivery_assignments, delivery_status_logs, delivery_proof, delivery_preferences, postal_agents, pickup_requests, return_orders, postal_labels, bulk_import_jobs, bulk_import_orders, cod_transactions, postal_notifications
- **Functions**: generate_delivery_order_number, log_delivery_status_change, generate_pickup_request_number, generate_return_order_number
- **Edge Functions**: track-delivery, postal-notifications, generate-label, assign-delivery, update-delivery-status, process-bulk-import, calculate-cod

#### 4. Emergency Management Module
- **Tables**: emergency_incidents, emergency_units, emergency_unit_members, emergency_notifications, emergency_operator_sessions, emergency_incident_logs, backup_acknowledgments
- **Functions**: generate_incident_number, generate_incident_uac, auto_update_incident_status, get_available_officers
- **Edge Functions**: create-incident, dispatch-units, incident-notifications, officer-location-update, backup-request

#### 5. Verification & Compliance Module
- **Tables**: residency_ownership_verifications, authorized_verifiers, document_verification_audit
- **Functions**: record_privacy_consent, get_pending_verifications_count, notify_verifiers_on_verification_update
- **Edge Functions**: verify-document, submit-verification, process-verification-queue

#### 6. Household Management Module
- **Tables**: household_groups, household_members, household_dependents, household_activity_audit, dependent_authorization_audit
- **Functions**: get_user_household_group_ids, is_household_member
- **Edge Functions**: manage-household, add-dependent, household-verification

#### 7. Organization & Business Module
- **Tables**: organization_addresses, organization_contacts
- **Functions**: approve_business_address_request, delete_business_record
- **Edge Functions**: register-business, update-business, business-verification

#### 8. Data Retention & Archival Module
- **Tables**: rejected_requests_archive, rejected_citizen_addresses_archive, rejected_verifications_archive, cleanup_audit_log, backup_metadata
- **Functions**: archive_old_rejected_requests, archive_old_rejected_citizen_addresses, archive_old_rejected_verifications, anonymize_archived_records

### User Roles (24+)
```typescript
type AppRole = 
  | 'admin'
  | 'registrar'
  | 'verifier'
  | 'citizen'
  | 'business_owner'
  | 'government_official'
  | 'postal_admin'
  | 'postal_agent'
  | 'postal_supervisor'
  | 'police_operator'
  | 'police_dispatcher'
  | 'police_supervisor'
  | 'emergency_responder'
  | 'nar_authority'
  | 'car_officer'
  | 'household_head'
  | 'dependent_guardian'
  | 'authorized_verifier'
  | 'data_analyst'
  | 'system_auditor'
  | 'api_consumer'
  | 'mobile_user'
  | 'kiosk_operator'
  | 'support_agent';
```

### Offline-First Capabilities
- Local IndexedDB storage for addresses and pending operations
- Background sync for delivery updates
- Offline map tile caching
- Queue-based operation processing
- Conflict resolution strategies

### Internationalization (i18n)
Supported namespaces: `common`, `auth`, `addresses`, `postal`, `emergency`, `verification`, `household`, `business`, `analytics`, `admin`, `errors`

Supported languages: Spanish (es), French (fr), English (en), Portuguese (pt)

---

## Architecture Overview

### High-Level AWS Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Internet Gateway                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼──────────────────────────────────┐
│                    Amazon CloudFront (CDN)                           │
│                    - Static assets caching                           │
│                    - SSL termination                                 │
│                    - Edge locations (Africa, Europe)                 │
└───────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼──────────────────────────────────┐
│                       AWS WAF & Shield                               │
│                    - DDoS protection                                 │
│                    - SQL injection prevention                        │
│                    - Rate limiting                                   │
└───────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼──────────────────────────────────┐
│              Application Load Balancer (ALB)                         │
│              - Multi-AZ deployment                                   │
│              - Health checks                                         │
│              - Path-based routing                                    │
└───────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ECS Fargate    │     │  AWS Lambda     │     │  API Gateway    │
│  (Frontend +    │     │  (52+ Edge      │     │  (REST/WebSocket│
│   Backend)      │     │   Functions)    │     │   APIs)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Amazon RDS     │     │  Amazon         │     │  Amazon S3      │
│  PostgreSQL     │     │  ElastiCache    │     │  (File Storage) │
│  (72+ Tables)   │     │  (Redis)        │     │                 │
│  + PostGIS      │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Amazon Cognito │     │  AWS Secrets    │     │  Amazon SQS     │
│  (Auth - 24+    │     │  Manager        │     │  (Message Queue)│
│   User Roles)   │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## AWS Services Mapping

### Core Infrastructure
| Current (Supabase) | AWS Equivalent | Purpose |
|--------------------|----------------|---------|
| Supabase Hosting | ECS Fargate + ALB | Container orchestration |
| Edge Functions (52+) | AWS Lambda (Node.js 18+) | Serverless functions |
| PostgreSQL | Amazon RDS PostgreSQL 15+ | Primary database |
| PostGIS Extension | RDS PostgreSQL + PostGIS | Geospatial queries |
| Real-time Subscriptions | AWS AppSync / API Gateway WebSocket | Real-time updates |
| Storage Buckets | Amazon S3 + CloudFront | File storage |
| Authentication | Amazon Cognito | User auth (24+ roles) |

### Database & Storage
| Component | AWS Service | Configuration |
|-----------|-------------|---------------|
| Primary Database | RDS PostgreSQL | Multi-AZ, db.r6g.xlarge |
| Read Replicas | RDS Read Replica | 2 replicas for read-heavy |
| Connection Pooling | RDS Proxy | Connection management |
| Cache Layer | ElastiCache Redis | cache.r6g.large cluster |
| File Storage | S3 Standard | 11 buckets |
| CDN | CloudFront | Global edge locations |
| Backup | AWS Backup | Automated daily |

### Application Services
| Function Category | Lambda Functions | Memory/Timeout |
|-------------------|------------------|----------------|
| Address Management | 8 functions | 512MB / 30s |
| Postal Delivery | 12 functions | 1024MB / 60s |
| Emergency Management | 10 functions | 1024MB / 30s |
| Verification | 6 functions | 512MB / 30s |
| Household Management | 5 functions | 256MB / 15s |
| Business Registration | 4 functions | 512MB / 30s |
| Analytics & Reporting | 4 functions | 2048MB / 300s |
| Notifications | 3 functions | 256MB / 15s |

### Security & Compliance
| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| WAF | AWS WAF | SQL injection, XSS protection |
| DDoS Protection | AWS Shield | DDoS mitigation |
| Secrets | AWS Secrets Manager | API keys, credentials |
| Encryption | AWS KMS | Data encryption keys |
| Identity | AWS IAM | Access management |
| Audit | AWS CloudTrail | API logging |
| Compliance | AWS Config | Configuration compliance |

### Monitoring & Operations
| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Metrics | CloudWatch Metrics | Performance monitoring |
| Logs | CloudWatch Logs | Centralized logging |
| Tracing | AWS X-Ray | Distributed tracing |
| Dashboards | CloudWatch Dashboards | Visualization |
| Alerts | CloudWatch Alarms + SNS | Alerting |

---

## Detailed Architecture

### Network Architecture
```
VPC (10.0.0.0/16) - Primary Region (eu-west-1)
├── Availability Zone A (10.0.0.0/18)
│   ├── Public Subnet (10.0.1.0/24)
│   │   ├── NAT Gateway
│   │   ├── ALB Node
│   │   └── Bastion Host (optional)
│   └── Private Subnet (10.0.10.0/24)
│       ├── ECS Tasks
│       ├── Lambda Functions (VPC)
│       └── RDS Primary
│
├── Availability Zone B (10.0.64.0/18)
│   ├── Public Subnet (10.0.65.0/24)
│   │   ├── NAT Gateway
│   │   └── ALB Node
│   └── Private Subnet (10.0.74.0/24)
│       ├── ECS Tasks
│       ├── Lambda Functions (VPC)
│       └── RDS Standby
│
└── Availability Zone C (10.0.128.0/18)
    ├── Public Subnet (10.0.129.0/24)
    │   └── NAT Gateway
    └── Private Subnet (10.0.138.0/24)
        ├── ElastiCache
        └── RDS Read Replica
```

### Database Configuration

#### Primary Database: Amazon RDS PostgreSQL
```yaml
Engine: PostgreSQL 15.4
Instance Class: db.r6g.xlarge (production)
vCPU: 4
Memory: 32 GB
Storage: 500GB gp3 SSD, auto-scaling to 2TB
IOPS: 12,000 provisioned
Multi-AZ: Yes
Encryption: AES-256 (KMS)
Backup Retention: 35 days
Performance Insights: Enabled
Enhanced Monitoring: 15-second intervals

Extensions Required:
  - postgis (3.4+)
  - pg_trgm
  - uuid-ossp
  - pgcrypto
  - pg_stat_statements
```

#### Read Replicas Configuration
```yaml
Replica Count: 2
Instance Class: db.r6g.large
Cross-AZ: Yes
Replication Lag Threshold: 30 seconds
Auto-failover: Enabled via RDS Proxy
```

#### Cache: Amazon ElastiCache for Redis
```yaml
Engine: Redis 7.0
Node Type: cache.r6g.large
Cluster Mode: Enabled
Shards: 3
Replicas per Shard: 2
Encryption: In-transit and at-rest
Backup: Daily automatic snapshots
Eviction Policy: volatile-lru
```

---

## Lambda Functions Migration (52+ Functions)

### Function Groupings

#### Address Management Functions (8)
| Supabase Function | Lambda Name | Runtime | Memory |
|-------------------|-------------|---------|--------|
| verify-address | address-verify | Node.js 18 | 512MB |
| import-google-maps-addresses | address-import-gmaps | Node.js 18 | 1024MB |
| export-nar-data | address-export-nar | Node.js 18 | 2048MB |
| bulk-geocode | address-bulk-geocode | Node.js 18 | 1024MB |
| validate-uac | address-validate-uac | Node.js 18 | 256MB |
| search-addresses | address-search | Node.js 18 | 512MB |
| flag-address | address-flag | Node.js 18 | 256MB |
| duplicate-check | address-duplicate-check | Node.js 18 | 512MB |

#### Postal Delivery Functions (12)
| Supabase Function | Lambda Name | Runtime | Memory |
|-------------------|-------------|---------|--------|
| track-delivery | postal-track | Node.js 18 | 512MB |
| postal-notifications | postal-notify | Node.js 18 | 256MB |
| generate-label | postal-generate-label | Node.js 18 | 1024MB |
| assign-delivery | postal-assign | Node.js 18 | 512MB |
| update-delivery-status | postal-status-update | Node.js 18 | 256MB |
| process-bulk-import | postal-bulk-import | Node.js 18 | 2048MB |
| calculate-cod | postal-cod-calc | Node.js 18 | 256MB |
| route-optimization | postal-route-optimize | Node.js 18 | 1024MB |
| pickup-request | postal-pickup | Node.js 18 | 512MB |
| return-order | postal-return | Node.js 18 | 512MB |
| agent-assignment | postal-agent-assign | Node.js 18 | 512MB |
| delivery-analytics | postal-analytics | Node.js 18 | 1024MB |

#### Emergency Management Functions (10)
| Supabase Function | Lambda Name | Runtime | Memory |
|-------------------|-------------|---------|--------|
| create-incident | emergency-create | Node.js 18 | 512MB |
| dispatch-units | emergency-dispatch | Node.js 18 | 512MB |
| incident-notifications | emergency-notify | Node.js 18 | 256MB |
| officer-location-update | emergency-location | Node.js 18 | 256MB |
| backup-request | emergency-backup | Node.js 18 | 512MB |
| incident-status | emergency-status | Node.js 18 | 256MB |
| unit-availability | emergency-unit-avail | Node.js 18 | 256MB |
| incident-analytics | emergency-analytics | Node.js 18 | 1024MB |
| operator-session | emergency-session | Node.js 18 | 256MB |
| incident-export | emergency-export | Node.js 18 | 1024MB |

#### Verification Functions (6)
| Supabase Function | Lambda Name | Runtime | Memory |
|-------------------|-------------|---------|--------|
| verify-document | verify-document | Node.js 18 | 1024MB |
| submit-verification | verify-submit | Node.js 18 | 512MB |
| process-verification-queue | verify-process | Node.js 18 | 512MB |
| verify-residency | verify-residency | Node.js 18 | 512MB |
| verification-status | verify-status | Node.js 18 | 256MB |
| verifier-notifications | verify-notify | Node.js 18 | 256MB |

#### Household & Business Functions (9)
| Supabase Function | Lambda Name | Runtime | Memory |
|-------------------|-------------|---------|--------|
| manage-household | household-manage | Node.js 18 | 512MB |
| add-dependent | household-add-dependent | Node.js 18 | 256MB |
| household-verification | household-verify | Node.js 18 | 512MB |
| register-business | business-register | Node.js 18 | 512MB |
| update-business | business-update | Node.js 18 | 256MB |
| business-verification | business-verify | Node.js 18 | 512MB |
| organization-search | business-search | Node.js 18 | 512MB |
| business-analytics | business-analytics | Node.js 18 | 1024MB |
| household-analytics | household-analytics | Node.js 18 | 1024MB |

#### Analytics & Reporting Functions (4)
| Supabase Function | Lambda Name | Runtime | Memory |
|-------------------|-------------|---------|--------|
| coverage-analytics | analytics-coverage | Node.js 18 | 2048MB |
| quality-metrics | analytics-quality | Node.js 18 | 1024MB |
| export-reports | analytics-export | Node.js 18 | 2048MB |
| dashboard-data | analytics-dashboard | Node.js 18 | 1024MB |

#### Notification Functions (3)
| Supabase Function | Lambda Name | Runtime | Memory |
|-------------------|-------------|---------|--------|
| send-email | notify-email | Node.js 18 | 256MB |
| send-sms | notify-sms | Node.js 18 | 256MB |
| push-notification | notify-push | Node.js 18 | 256MB |

---

## IAM Role Mapping (24+ User Roles)

### Cognito User Pool Groups → IAM Policies
```yaml
Admin:
  - CognitoGroup: admin
  - IAMPolicy: BiakamAdminFullAccess
  - Permissions: Full system access

Registrar:
  - CognitoGroup: registrar
  - IAMPolicy: BiakamRegistrarAccess
  - Permissions: Address creation, verification, user management

Verifier:
  - CognitoGroup: verifier
  - IAMPolicy: BiakamVerifierAccess
  - Permissions: Address verification, document review

Citizen:
  - CognitoGroup: citizen
  - IAMPolicy: BiakamCitizenAccess
  - Permissions: Own address management, delivery tracking

PostalAdmin:
  - CognitoGroup: postal_admin
  - IAMPolicy: BiakamPostalAdminAccess
  - Permissions: Full postal operations

PostalAgent:
  - CognitoGroup: postal_agent
  - IAMPolicy: BiakamPostalAgentAccess
  - Permissions: Delivery operations, status updates

PostalSupervisor:
  - CognitoGroup: postal_supervisor
  - IAMPolicy: BiakamPostalSupervisorAccess
  - Permissions: Agent management, route optimization

PoliceOperator:
  - CognitoGroup: police_operator
  - IAMPolicy: BiakamPoliceOperatorAccess
  - Permissions: Incident management, unit operations

PoliceDispatcher:
  - CognitoGroup: police_dispatcher
  - IAMPolicy: BiakamPoliceDispatcherAccess
  - Permissions: Unit dispatch, incident coordination

PoliceSupervisor:
  - CognitoGroup: police_supervisor
  - IAMPolicy: BiakamPoliceSupervisorAccess
  - Permissions: Full emergency operations

EmergencyResponder:
  - CognitoGroup: emergency_responder
  - IAMPolicy: BiakamEmergencyResponderAccess
  - Permissions: Incident response, location updates

NARAuthority:
  - CognitoGroup: nar_authority
  - IAMPolicy: BiakamNARAuthorityAccess
  - Permissions: NAR address management

CAROffcer:
  - CognitoGroup: car_officer
  - IAMPolicy: BiakamCAROfficeAccess
  - Permissions: Citizen address verification

HouseholdHead:
  - CognitoGroup: household_head
  - IAMPolicy: BiakamHouseholdHeadAccess
  - Permissions: Household management, dependent management

BusinessOwner:
  - CognitoGroup: business_owner
  - IAMPolicy: BiakamBusinessOwnerAccess
  - Permissions: Business address management

DataAnalyst:
  - CognitoGroup: data_analyst
  - IAMPolicy: BiakamDataAnalystAccess
  - Permissions: Analytics, reporting, read-only data access

SystemAuditor:
  - CognitoGroup: system_auditor
  - IAMPolicy: BiakamSystemAuditorAccess
  - Permissions: Audit logs, compliance reports

APIConsumer:
  - CognitoGroup: api_consumer
  - IAMPolicy: BiakamAPIConsumerAccess
  - Permissions: API access with rate limits

MobileUser:
  - CognitoGroup: mobile_user
  - IAMPolicy: BiakamMobileUserAccess
  - Permissions: Mobile app features, offline sync

KioskOperator:
  - CognitoGroup: kiosk_operator
  - IAMPolicy: BiakamKioskOperatorAccess
  - Permissions: Public kiosk operations

SupportAgent:
  - CognitoGroup: support_agent
  - IAMPolicy: BiakamSupportAgentAccess
  - Permissions: User support, issue resolution
```

---

## Bill of Materials (BOM)

### Production Environment

#### Compute Resources
| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| ALB | 1 Application Load Balancer | $22 |
| ECS Fargate | 6 tasks (2 vCPU, 4GB each) | $280 |
| Lambda Functions | 52 functions, various configs | $150 |
| API Gateway | REST + WebSocket APIs | $50 |

#### Database & Storage
| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| RDS PostgreSQL Primary | db.r6g.xlarge Multi-AZ | $580 |
| RDS Read Replicas | 2x db.r6g.large | $460 |
| RDS Proxy | Connection pooling | $40 |
| ElastiCache Redis | 3-shard cluster | $420 |
| S3 Storage | 1TB with Intelligent Tiering | $25 |
| CloudFront | Global CDN | $50 |

#### Networking
| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| VPC | 1 VPC, 6 subnets | $0 |
| NAT Gateways | 3 (one per AZ) | $135 |
| Route 53 | Hosted zone + health checks | $5 |
| Data Transfer | 500GB/month estimated | $75 |

#### Security & Management
| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| Cognito | 50,000 MAU | $275 |
| Secrets Manager | 20 secrets | $8 |
| KMS | 5 CMKs | $5 |
| WAF | Standard rules | $25 |
| CloudWatch | Logs + Metrics | $80 |
| X-Ray | Tracing | $25 |
| AWS Backup | Database backups | $50 |

#### Total Production: ~$2,760/month

### Development/Staging Environment
| Category | Monthly Cost |
|----------|--------------|
| Compute (reduced) | $80 |
| Database (single-AZ) | $180 |
| Cache (single node) | $50 |
| Storage | $15 |
| Networking | $50 |
| **Total Dev/Staging** | **~$375/month** |

### Scaling Cost Projections

| Scale | Users | Data Volume | Monthly Cost |
|-------|-------|-------------|--------------|
| Small | 10,000 | 50GB | $2,760 |
| Medium | 100,000 | 500GB | $4,500 |
| Large | 500,000 | 2TB | $8,200 |
| Enterprise | 2,000,000+ | 10TB+ | $18,000+ |

---

## Migration Strategy

### Phase 1: Infrastructure Setup (Weeks 1-3)

#### Week 1: Foundation
1. **VPC and Networking**
   - Create VPC with 6 subnets across 3 AZs
   - Configure NAT Gateways and Internet Gateway
   - Set up security groups for each service tier
   - Configure VPC Flow Logs

2. **IAM Foundation**
   - Create service roles for ECS, Lambda, RDS
   - Set up Cognito user pool and identity pool
   - Configure 24 user group policies

#### Week 2: Database Setup
1. **RDS PostgreSQL**
   - Create Multi-AZ RDS instance
   - Install PostGIS extension
   - Configure parameter groups
   - Set up RDS Proxy

2. **Schema Migration**
   - Export Supabase schema (72+ tables)
   - Convert RLS policies to PostgreSQL functions
   - Migrate 89+ database functions
   - Create indexes and optimize

#### Week 3: Storage & Cache
1. **S3 Configuration**
   - Create 11 storage buckets
   - Configure CORS and lifecycle policies
   - Set up CloudFront distributions

2. **ElastiCache Setup**
   - Deploy Redis cluster
   - Configure session store
   - Set up cache invalidation

### Phase 2: Application Migration (Weeks 4-6)

#### Week 4: Lambda Functions
1. **Convert Edge Functions**
   - Migrate 52+ Deno functions to Node.js
   - Configure API Gateway endpoints
   - Set up Lambda layers for shared code

2. **Testing**
   - Unit tests for each function
   - Integration tests with RDS

#### Week 5: Container Deployment
1. **ECS Configuration**
   - Create ECR repositories
   - Build and push container images
   - Configure ECS task definitions
   - Set up auto-scaling policies

2. **Frontend Deployment**
   - Build React/Vite application
   - Deploy to S3 + CloudFront
   - Configure i18n (11 namespaces)

#### Week 6: Authentication Migration
1. **Cognito Setup**
   - Configure user pool
   - Set up 24 user groups
   - Migrate user accounts
   - Configure MFA options

### Phase 3: Data Migration (Weeks 7-8)

#### Week 7: Data Export
1. **Supabase Export**
   ```bash
   # Export all tables
   pg_dump --host=db.xxx.supabase.co \
           --port=5432 \
           --username=postgres \
           --dbname=postgres \
           --format=custom \
           --file=biakam_export.dump
   
   # Export storage files
   supabase storage download -r -o ./storage_backup
   ```

2. **Data Transformation**
   - Convert RLS policies
   - Update foreign key references
   - Validate data integrity

#### Week 8: Data Import
1. **RDS Import**
   ```bash
   # Import to RDS
   pg_restore --host=biakam.xxx.rds.amazonaws.com \
              --port=5432 \
              --username=admin \
              --dbname=biakam \
              --no-owner \
              biakam_export.dump
   ```

2. **Storage Migration**
   ```bash
   # Sync to S3
   aws s3 sync ./storage_backup s3://biakam-storage/ --recursive
   ```

### Phase 4: Testing & Cutover (Weeks 9-10)

#### Week 9: Comprehensive Testing
1. **Functional Testing**
   - All 8 feature modules
   - 52+ Lambda functions
   - 24 user role permissions

2. **Performance Testing**
   - Load testing with realistic traffic
   - Database query optimization
   - Cache hit ratio validation

3. **Security Testing**
   - Penetration testing
   - WAF rule validation
   - IAM policy verification

#### Week 10: Go-Live
1. **DNS Cutover**
   - Update Route 53 records
   - Configure health checks
   - Enable CloudFront

2. **Monitoring**
   - Verify CloudWatch dashboards
   - Test alerting
   - Enable X-Ray tracing

---

## Security Configuration

### WAF Rules
```yaml
WAFRules:
  - Name: SQLInjectionProtection
    Priority: 1
    Action: Block
    
  - Name: XSSProtection
    Priority: 2
    Action: Block
    
  - Name: RateLimiting
    Priority: 3
    Limit: 2000 requests/5 minutes
    Action: Block
    
  - Name: GeoRestriction
    Priority: 4
    AllowedCountries: [GQ, ES, FR, US, GB, CM, GA]
    Action: Block
    
  - Name: BadBotProtection
    Priority: 5
    Action: Block
```

### Encryption Strategy
```yaml
DataAtRest:
  - RDS: AES-256 (KMS CMK)
  - S3: SSE-KMS
  - ElastiCache: AES-256
  - EBS: AES-256

DataInTransit:
  - ALB: TLS 1.2+ (ACM Certificate)
  - RDS: SSL Required
  - ElastiCache: TLS Enabled
  - S3: HTTPS Only

Secrets:
  - AWS Secrets Manager
  - Automatic rotation (30 days)
  - Cross-region replication
```

---

## Backup and Disaster Recovery

### Backup Strategy
```yaml
RDSBackups:
  AutomatedBackups: true
  RetentionPeriod: 35 days
  BackupWindow: "02:00-03:00 UTC"
  CrossRegionCopy: eu-central-1
  SnapshotSchedule: Daily

S3Backups:
  Versioning: Enabled
  CrossRegionReplication: eu-central-1
  LifecyclePolicy:
    - Transition to IA: 90 days
    - Transition to Glacier: 365 days
    - Expiration: 7 years

LambdaBackups:
  - Version control in CodeCommit
  - Infrastructure as Code (CDK)
```

### Disaster Recovery
| Metric | Target | Strategy |
|--------|--------|----------|
| RTO | 2 hours | Multi-AZ + Cross-region backup |
| RPO | 15 minutes | Continuous WAL archiving |
| DR Region | eu-central-1 | Warm standby |
| Testing | Quarterly | Full DR drill |

---

## Monitoring and Alerting

### CloudWatch Dashboards

#### Application Health Dashboard
- Lambda invocations and errors (52 functions)
- API Gateway latency and 4xx/5xx rates
- ECS task health and CPU/memory
- Database connections and query performance

#### Module-Specific Dashboards
- **Postal Operations**: Deliveries/hour, success rates, COD collections
- **Emergency Response**: Incidents/hour, response times, unit availability
- **Address Verification**: Pending queue, approval rates, processing time

### Critical Alerts
```yaml
CriticalAlerts:
  - Name: HighErrorRate
    Metric: Lambda Errors > 5%
    Action: PagerDuty + SNS
    
  - Name: DatabaseDown
    Metric: RDS Connection Failures
    Action: PagerDuty + SNS
    
  - Name: HighLatency
    Metric: API Gateway P99 > 2000ms
    Action: SNS + Slack
    
  - Name: SecurityIncident
    Metric: WAF Blocked > 1000/hour
    Action: PagerDuty + SecurityHub
```

---

## Compliance and Governance

### Data Protection
- **GDPR Compliance**: Data encryption, right to deletion
- **Data Residency**: eu-west-1 (Ireland) primary
- **Audit Logging**: CloudTrail for all API calls
- **Access Logging**: VPC Flow Logs, ALB access logs

### Cost Management
```yaml
CostOptimization:
  - Reserved Instances: RDS (3-year), ElastiCache (1-year)
  - Savings Plans: Compute (1-year)
  - Spot Instances: Batch processing Lambdas
  - S3 Intelligent Tiering: Automatic cost optimization
  - Right-sizing: Monthly review
  
Budgets:
  - Monthly Alert: $3,000 threshold
  - Forecast Alert: 110% of budget
  - Cost Allocation Tags: Module, Environment, Owner
```

---

## DevOps and CI/CD

### Pipeline Architecture
```yaml
Source: GitHub / GitLab
Build: AWS CodeBuild
Deploy: AWS CodeDeploy / CDK Deploy
Pipeline: AWS CodePipeline

Environments:
  Development:
    - Auto-deploy on merge to develop
    - Ephemeral environments for PRs
    
  Staging:
    - Auto-deploy on merge to main
    - Full integration testing
    
  Production:
    - Manual approval required
    - Blue-green deployment
    - Automatic rollback on failure
```

### Infrastructure as Code
```typescript
// AWS CDK Structure
lib/
├── vpc-stack.ts           // VPC, subnets, NAT
├── database-stack.ts      // RDS, ElastiCache
├── compute-stack.ts       // ECS, Lambda
├── storage-stack.ts       // S3, CloudFront
├── auth-stack.ts          // Cognito (24 roles)
├── api-stack.ts           // API Gateway
├── monitoring-stack.ts    // CloudWatch, X-Ray
└── security-stack.ts      // WAF, KMS, Secrets
```

---

## Key Recommendations

1. **Start with ECS Fargate**: Simpler than EKS, automatic scaling
2. **Use Multi-AZ RDS**: Critical for 72+ tables availability
3. **Implement RDS Proxy**: Essential for Lambda connection management
4. **Enable X-Ray Tracing**: Debug 52+ Lambda functions effectively
5. **Use Cognito Groups**: Map 24 user roles cleanly
6. **Leverage CDK**: Infrastructure as Code for consistency
7. **Plan for Multi-Region**: DR readiness from day one
8. **Optimize Lambda Cold Starts**: Use provisioned concurrency for critical paths

---

## Next Steps

1. **Assessment**: Review current Supabase usage metrics
2. **Proof of Concept**: Deploy minimal version on AWS (1 week)
3. **Team Training**: AWS services and CDK (2 weeks)
4. **Migration Planning**: Detailed 10-week migration timeline
5. **Go-Live Preparation**: DR testing, security audit

---

*This blueprint provides a comprehensive foundation for migrating the Biakam National Address System to AWS while maintaining all 72+ tables, 52+ edge functions, 24+ user roles, and full feature parity including the Postal Module, offline capabilities, and internationalization support.*
