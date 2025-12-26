# Biakam National Address System - Self-Hosting Blueprint

## Executive Summary

This blueprint provides a comprehensive guide for self-hosting the Biakam National Address System using open-source technologies. The system comprises **72+ database tables**, **52+ Edge Functions**, **24+ user roles**, **243+ RLS policies**, and supports **11 i18n namespaces** with offline-first mobile capabilities.

### Target Audience
- Government data centers requiring full data sovereignty
- Air-gapped or restricted network environments
- Organizations requiring complete infrastructure control
- Regions with limited cloud service availability

### Key Benefits
- Complete data sovereignty and control
- No external service dependencies
- Full customization capabilities
- Reduced long-term operational costs
- Compliance with strict data residency requirements

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
- **Services**: Address verification API, geocoding service, bulk import processor

#### 2. Citizen Address Registry (CAR) Module
- **Tables**: citizen_address, citizen_address_event, person, car_permissions, car_quality_metrics
- **Functions**: add_secondary_address, close_current_primary, auto_approve_verified_citizen_addresses
- **Services**: Residency verification API, citizen address history service

#### 3. Government Postal Delivery Module
- **Tables**: delivery_orders, delivery_assignments, delivery_status_logs, delivery_proof, delivery_preferences, postal_agents, pickup_requests, return_orders, postal_labels, bulk_import_jobs, bulk_import_orders, cod_transactions, postal_notifications
- **Functions**: generate_delivery_order_number, log_delivery_status_change, generate_pickup_request_number, generate_return_order_number
- **Services**: Delivery tracking API, label generation service, route optimization, COD processing

#### 4. Emergency Management Module
- **Tables**: emergency_incidents, emergency_units, emergency_unit_members, emergency_notifications, emergency_operator_sessions, emergency_incident_logs, backup_acknowledgments
- **Functions**: generate_incident_number, generate_incident_uac, auto_update_incident_status, get_available_officers
- **Services**: Incident management API, unit dispatch service, real-time location tracking

#### 5. Verification & Compliance Module
- **Tables**: residency_ownership_verifications, authorized_verifiers, document_verification_audit
- **Functions**: record_privacy_consent, get_pending_verifications_count, notify_verifiers_on_verification_update
- **Services**: Document verification API, verification queue processor

#### 6. Household Management Module
- **Tables**: household_groups, household_members, household_dependents, household_activity_audit, dependent_authorization_audit
- **Functions**: get_user_household_group_ids, is_household_member
- **Services**: Household management API, dependent registration service

#### 7. Organization & Business Module
- **Tables**: organization_addresses, organization_contacts
- **Functions**: approve_business_address_request, delete_business_record
- **Services**: Business registration API, organization search service

#### 8. Data Retention & Archival Module
- **Tables**: rejected_requests_archive, rejected_citizen_addresses_archive, rejected_verifications_archive, cleanup_audit_log, backup_metadata
- **Functions**: archive_old_rejected_requests, archive_old_rejected_citizen_addresses, archive_old_rejected_verifications, anonymize_archived_records
- **Services**: Archival processor, cleanup scheduler

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

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Internet / Internal Network                      │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│                    Load Balancer (HAProxy/Nginx)                        │
│                    - SSL Termination                                    │
│                    - Health Checks                                      │
│                    - Rate Limiting                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Web Frontend   │       │   Mobile Apps   │       │   API Clients   │
│  (React/Vite)   │       │  (Capacitor)    │       │   (External)    │
│  Static Hosting │       │  Offline-First  │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│                        Application Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  API Gateway │  │    Auth      │  │    File      │  │   Queue    │ │
│  │ (Kong/       │  │   Service    │  │   Storage    │  │  Service   │ │
│  │  Traefik)    │  │  (Keycloak)  │  │   (MinIO)    │  │  (Redis)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│                         Service Layer (52+ APIs)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Address    │  │    Postal    │  │  Emergency   │  │ Household  │ │
│  │   Service    │  │   Service    │  │   Service    │  │  Service   │ │
│  │   (8 APIs)   │  │  (12 APIs)   │  │  (10 APIs)   │  │  (5 APIs)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Verification │  │   Business   │  │  Analytics   │  │   Notify   │ │
│  │   Service    │  │   Service    │  │   Service    │  │  Service   │ │
│  │   (6 APIs)   │  │   (4 APIs)   │  │   (4 APIs)   │  │  (3 APIs)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│                            Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ PostgreSQL   │  │    Redis     │  │   Vector DB  │  │  TimeSeries│ │
│  │  Cluster     │  │    Cache     │  │   (Qdrant)   │  │  (Optional)│ │
│  │ (72+ Tables) │  │              │  │              │  │            │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│                       Observability Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Prometheus  │  │   Grafana    │  │    Loki      │  │   Jaeger   │ │
│  │   Metrics    │  │  Dashboards  │  │   Logging    │  │   Tracing  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Bill of Materials (BOM)

### Hardware Requirements

#### Production Environment (High Availability)

##### Load Balancer Nodes (2x)
| Component | Specification |
|-----------|---------------|
| CPU | 8 cores @ 2.4GHz |
| RAM | 16GB DDR4 ECC |
| Storage | 200GB NVMe SSD |
| Network | 2x 10Gbps NICs (bonded) |
| OS | Ubuntu 22.04 LTS / Rocky Linux 9 |

##### Application Servers (4x)
| Component | Specification |
|-----------|---------------|
| CPU | 16 cores @ 3.0GHz |
| RAM | 64GB DDR4 ECC |
| Storage | 1TB NVMe SSD |
| Network | 2x 10Gbps NICs |
| OS | Ubuntu 22.04 LTS |

##### Database Servers (3x - Patroni Cluster)
| Component | Specification |
|-----------|---------------|
| CPU | 32 cores @ 3.2GHz |
| RAM | 128GB DDR4 ECC |
| Storage Primary | 2TB NVMe SSD (RAID 10) |
| Storage Backup | 8TB SAS SSD |
| Network | 2x 25Gbps NICs |
| OS | Ubuntu 22.04 LTS |

##### Cache/Queue Servers (3x)
| Component | Specification |
|-----------|---------------|
| CPU | 16 cores @ 2.8GHz |
| RAM | 64GB DDR4 ECC |
| Storage | 1TB NVMe SSD |
| Network | 2x 10Gbps NICs |
| OS | Ubuntu 22.04 LTS |

##### Storage Servers (3x - MinIO Cluster)
| Component | Specification |
|-----------|---------------|
| CPU | 8 cores @ 2.4GHz |
| RAM | 32GB DDR4 ECC |
| Storage | 20TB SAS SSD (RAID 6) + 500GB NVMe (Cache) |
| Network | 2x 10Gbps NICs |
| OS | Ubuntu 22.04 LTS |

##### Monitoring/Observability Server (2x)
| Component | Specification |
|-----------|---------------|
| CPU | 16 cores @ 2.8GHz |
| RAM | 64GB DDR4 ECC |
| Storage | 4TB NVMe SSD |
| Network | 2x 10Gbps NICs |
| OS | Ubuntu 22.04 LTS |

#### Development/Staging Environment

##### All-in-One Server (2x for HA)
| Component | Specification |
|-----------|---------------|
| CPU | 32 cores @ 3.0GHz |
| RAM | 128GB DDR4 |
| Storage | 4TB NVMe SSD |
| Network | 2x 10Gbps NICs |
| OS | Ubuntu 22.04 LTS |

### Network Infrastructure

#### Network Specifications
| Component | Specification |
|-----------|---------------|
| Internet Bandwidth | 1Gbps symmetric (minimum), 10Gbps recommended |
| Internal Network | 25Gbps backbone with 10Gbps access |
| Redundancy | Dual ISP connections with BGP |
| Firewall | Enterprise-grade next-gen firewall |
| Load Balancer | Hardware LB or HAProxy cluster |

#### Network Topology
```
                         Internet
                             │
              ┌──────────────┴──────────────┐
              │                             │
         ┌────▼────┐                   ┌────▼────┐
         │  ISP 1  │                   │  ISP 2  │
         └────┬────┘                   └────┬────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │    Firewall     │
                    │  (pfSense/      │
                    │   OPNsense)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
         │   DMZ   │    │   App   │    │  Data   │
         │  Zone   │    │  Zone   │    │  Zone   │
         │         │    │         │    │         │
         │ - LB    │    │ - API   │    │ - DB    │
         │ - WAF   │    │ - Auth  │    │ - Cache │
         │ - CDN   │    │ - Apps  │    │ - Store │
         └─────────┘    └─────────┘    └─────────┘
```

---

## Software Stack

### Container Orchestration

#### Option 1: Kubernetes (K3s - Recommended)
```yaml
Distribution: K3s (lightweight Kubernetes)
Version: 1.28+
Nodes: 4+ worker nodes
Container Runtime: containerd
Network Plugin: Calico (for network policies)
Storage: Longhorn (distributed storage)
Ingress: Traefik (included) or Nginx
```

#### Option 2: Docker Swarm
```yaml
Version: 24.0+
Nodes: 4+ worker nodes
Overlay Network: Encrypted
Service Mesh: Traefik
Storage: GlusterFS or NFS
```

### Core Services Mapping

| Supabase Component | Self-Hosted Equivalent | Version |
|--------------------|------------------------|---------|
| PostgreSQL | PostgreSQL + Patroni | 15.4+ |
| PostGIS Extension | PostGIS | 3.4+ |
| Edge Functions (52) | Node.js API Services | 20 LTS |
| Authentication | Keycloak | 22.0+ |
| Storage Buckets | MinIO | RELEASE.2024+ |
| Real-time | Socket.io / Centrifugo | Latest |
| API Gateway | Kong / Traefik | 3.0+ |
| Caching | Redis Cluster | 7.2+ |
| Search | Meilisearch / OpenSearch | Latest |

---

## Database Layer

### PostgreSQL Cluster Configuration

#### Patroni High Availability Setup
```yaml
Cluster:
  Name: biakam-postgres
  Nodes: 3 (1 primary, 2 replicas)
  Synchronous Standby: 1
  
PostgreSQL:
  Version: 15.4
  Extensions:
    - postgis (3.4)
    - pg_trgm
    - uuid-ossp
    - pgcrypto
    - pg_stat_statements
    - pg_cron
    
Connection Pooling:
  Tool: PgBouncer
  Pool Mode: transaction
  Max Connections: 1000
  
Backup:
  Tool: pgBackRest
  Full Backup: Daily
  Incremental: Hourly
  Retention: 30 days
  Offsite Copy: Yes
```

#### PostgreSQL Configuration (postgresql.conf)
```ini
# Memory Configuration
shared_buffers = 32GB                    # 25% of RAM
effective_cache_size = 96GB              # 75% of RAM
work_mem = 256MB
maintenance_work_mem = 4GB
huge_pages = try

# WAL Configuration
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
wal_keep_size = 5GB

# Query Planning
random_page_cost = 1.1                   # SSD optimized
effective_io_concurrency = 200
default_statistics_target = 100

# Checkpoints
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min
max_wal_size = 4GB

# Connections
max_connections = 200                    # PgBouncer handles pooling
```

### Schema Migration from Supabase

#### Tables by Module (72+)

**Core Tables (6)**
- profiles
- user_roles
- user_role_metadata
- api_keys
- system_config
- saved_locations

**NAR Module (8)**
- addresses
- address_requests
- address_audit_log
- address_search_audit
- coverage_analytics
- uac_sequence_counters
- cities
- provinces

**CAR Module (7)**
- citizen_address
- citizen_address_event
- person
- car_permissions
- car_quality_metrics
- rejected_citizen_addresses_archive
- citizen_address views (4 security-invoker views)

**Postal Module (13)**
- delivery_orders
- delivery_assignments
- delivery_status_logs
- delivery_proof
- delivery_preferences
- postal_agents
- pickup_requests
- return_orders
- postal_labels
- bulk_import_jobs
- bulk_import_orders
- cod_transactions
- postal_notifications

**Emergency Module (7)**
- emergency_incidents
- emergency_units
- emergency_unit_members
- emergency_notifications
- emergency_operator_sessions
- emergency_incident_logs
- backup_acknowledgments

**Verification Module (4)**
- residency_ownership_verifications
- authorized_verifiers
- document_verification_audit
- rejected_verifications_archive

**Household Module (5)**
- household_groups
- household_members
- household_dependents
- household_activity_audit
- dependent_authorization_audit

**Organization Module (3)**
- organization_addresses
- organization_contacts
- external_systems

**Archival Module (4)**
- rejected_requests_archive
- cleanup_audit_log
- backup_metadata
- privacy_consent_records

**Geography Module (3)**
- provinces
- cities
- regions

---

## Application Services Layer

### API Services Architecture (Converting 52+ Edge Functions)

#### Service Microservices Structure
```
services/
├── address-service/          # 8 endpoints
│   ├── src/
│   │   ├── routes/
│   │   │   ├── verify.ts
│   │   │   ├── import.ts
│   │   │   ├── export.ts
│   │   │   ├── geocode.ts
│   │   │   ├── validate.ts
│   │   │   ├── search.ts
│   │   │   ├── flag.ts
│   │   │   └── duplicate.ts
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
│
├── postal-service/           # 12 endpoints
│   ├── src/
│   │   ├── routes/
│   │   │   ├── track.ts
│   │   │   ├── notify.ts
│   │   │   ├── label.ts
│   │   │   ├── assign.ts
│   │   │   ├── status.ts
│   │   │   ├── bulk-import.ts
│   │   │   ├── cod.ts
│   │   │   ├── route.ts
│   │   │   ├── pickup.ts
│   │   │   ├── return.ts
│   │   │   ├── agent.ts
│   │   │   └── analytics.ts
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
│
├── emergency-service/        # 10 endpoints
│   ├── src/
│   │   ├── routes/
│   │   │   ├── create.ts
│   │   │   ├── dispatch.ts
│   │   │   ├── notify.ts
│   │   │   ├── location.ts
│   │   │   ├── backup.ts
│   │   │   ├── status.ts
│   │   │   ├── availability.ts
│   │   │   ├── analytics.ts
│   │   │   ├── session.ts
│   │   │   └── export.ts
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
│
├── verification-service/     # 6 endpoints
├── household-service/        # 5 endpoints
├── business-service/         # 4 endpoints
├── analytics-service/        # 4 endpoints
└── notification-service/     # 3 endpoints
```

#### Service Configuration Example
```typescript
// postal-service/src/index.ts
import express from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';

const app = express();
const port = process.env.PORT || 3001;

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
});

// Redis cache
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Routes
app.use('/track', trackRouter);
app.use('/notify', notifyRouter);
app.use('/label', labelRouter);
// ... other routes

app.listen(port, () => {
  console.log(`Postal service running on port ${port}`);
});
```

---

## Authentication Layer

### Keycloak Configuration

#### Realm Setup
```yaml
Realm: biakam-production
Clients:
  - biakam-web (public)
  - biakam-mobile (public)
  - biakam-api (confidential)
  - biakam-admin (confidential)

Identity Providers:
  - Username/Password (local)
  - Phone/OTP (SMS)
  - LDAP/AD (optional)
  - Google OAuth (optional)

MFA:
  - TOTP (Google Authenticator)
  - SMS OTP
  - Email OTP
```

#### User Roles Mapping (24+)
```yaml
Roles:
  # Administrative
  - admin
  - registrar
  - verifier
  - system_auditor
  - support_agent
  
  # Citizen
  - citizen
  - mobile_user
  - household_head
  - dependent_guardian
  
  # Business
  - business_owner
  - government_official
  - api_consumer
  
  # Postal
  - postal_admin
  - postal_agent
  - postal_supervisor
  
  # Emergency
  - police_operator
  - police_dispatcher
  - police_supervisor
  - emergency_responder
  
  # Registry
  - nar_authority
  - car_officer
  - authorized_verifier
  - data_analyst
  - kiosk_operator

Role Hierarchies:
  admin:
    - includes: [registrar, verifier, postal_admin, police_supervisor, data_analyst]
  
  postal_supervisor:
    - includes: [postal_agent]
  
  police_supervisor:
    - includes: [police_dispatcher, police_operator]
```

---

## File Storage Layer

### MinIO Configuration

#### Cluster Setup
```yaml
Cluster:
  Nodes: 4
  Drives per Node: 4
  Erasure Coding: EC:4 (50% overhead)
  
Buckets:
  - address-photos
  - delivery-proof
  - postal-labels
  - document-uploads
  - verification-documents
  - profile-avatars
  - incident-attachments
  - business-documents
  - backup-archives
  - temp-uploads
  - public-assets

Access Policies:
  - Public read for public-assets
  - Authenticated access for user content
  - Service account access for internal operations

Lifecycle:
  - temp-uploads: Delete after 24 hours
  - backup-archives: Transition to cold storage after 90 days
```

---

## Monitoring & Observability

### Prometheus + Grafana Stack

#### Metrics Collection
```yaml
Prometheus:
  Scrape Interval: 15s
  Retention: 30 days
  Storage: 500GB
  
Exporters:
  - node_exporter (system metrics)
  - postgres_exporter (database metrics)
  - redis_exporter (cache metrics)
  - nginx_exporter (web server metrics)
  - blackbox_exporter (endpoint monitoring)
  - minio_exporter (storage metrics)
  - keycloak_exporter (auth metrics)
```

#### Grafana Dashboards
```yaml
Dashboards:
  - System Overview
  - PostgreSQL Performance (72+ tables)
  - Redis Cache Statistics
  - API Gateway Metrics
  - Service Health (52+ endpoints)
  - Authentication Metrics (24+ roles)
  - Postal Operations Dashboard
  - Emergency Response Dashboard
  - Address Verification Queue
  - Storage Utilization
  - Network Traffic
```

### Logging with Loki
```yaml
Loki:
  Retention: 30 days
  Storage: S3-compatible (MinIO)
  
Log Sources:
  - Application logs (all services)
  - Nginx access/error logs
  - PostgreSQL logs
  - Keycloak audit logs
  - System logs
  
Labels:
  - service
  - environment
  - severity
  - module
```

### Distributed Tracing with Jaeger
```yaml
Jaeger:
  Storage: Elasticsearch or Cassandra
  Retention: 7 days
  Sampling Rate: 1%
  
Instrumentation:
  - All API services
  - Database queries
  - Redis operations
  - External API calls
```

---

## Security Infrastructure

### Network Security

#### Firewall Configuration (pfSense/OPNsense)
```yaml
Zones:
  DMZ:
    - Allow: HTTP/HTTPS from Internet
    - Allow: DNS from Internal
    
  Application:
    - Allow: From DMZ via Load Balancer
    - Allow: To Data Zone (specific ports)
    
  Data:
    - Allow: From Application Zone only
    - Allow: Replication between nodes
    - Deny: All Internet access

IDS/IPS:
  Tool: Suricata
  Rules: ET Open + Custom
  Blocking: Enabled for critical
```

#### Web Application Firewall
```yaml
WAF: ModSecurity 3.0
Rules:
  - OWASP Core Rule Set (CRS)
  - Custom SQL injection patterns
  - Rate limiting (100 req/min per IP)
  - Geo-blocking (optional)
  - Bot protection
```

### Secrets Management

#### HashiCorp Vault
```yaml
Vault:
  HA Mode: Yes (3 nodes)
  Storage: Integrated Raft
  Auto-unseal: Yes (HSM or cloud KMS)
  
Secrets Engines:
  - KV v2 (API keys, passwords)
  - Database (dynamic credentials)
  - PKI (certificates)
  
Policies:
  - admin-policy
  - service-policy
  - readonly-policy
  
Auth Methods:
  - AppRole (services)
  - OIDC (Keycloak integration)
  - Token (emergency access)
```

### SSL/TLS Configuration
```yaml
Certificates:
  Provider: Let's Encrypt (automated)
  Fallback: Internal CA
  
TLS Config:
  Minimum Version: TLS 1.2
  Preferred Version: TLS 1.3
  Cipher Suites:
    - TLS_AES_256_GCM_SHA384
    - TLS_CHACHA20_POLY1305_SHA256
    - TLS_AES_128_GCM_SHA256
    
Certificate Renewal:
  Tool: Certbot
  Schedule: 30 days before expiry
```

---

## External Service Replacements

### Maps & Geocoding

#### OpenStreetMap Stack
```yaml
Tile Server:
  Tool: TileServer GL
  Style: OpenMapTiles
  Cache: Redis + Disk
  
Geocoding:
  Tool: Nominatim
  Data: OpenStreetMap (Equatorial Guinea focus)
  Updates: Weekly
  
Routing:
  Tool: OSRM or GraphHopper
  Profiles: car, foot
  Updates: Weekly
  
Search:
  Tool: Photon (Nominatim frontend)
  Autocomplete: Yes
```

### SMS Gateway
```yaml
Primary:
  Tool: Gammu SMSD
  Hardware: 4x USB GSM modems
  Capacity: 1000 SMS/hour
  
Backup:
  Provider: Local telco API
  Failover: Automatic
  
Queue:
  Tool: Redis
  Retry: 3 attempts
```

### Email Service
```yaml
MTA:
  Tool: Postfix
  DKIM: Yes
  SPF: Yes
  DMARC: Yes
  
Outbound:
  Rate Limit: 100/min
  Queue: Redis-backed
  Templates: Handlebars
  
Inbound:
  Tool: Dovecot (optional)
```

### AI/ML Services
```yaml
LLM:
  Tool: Ollama
  Model: Llama 3 8B
  Hardware: GPU (RTX 4080 or better)
  
Use Cases:
  - Address verification assistance
  - Document OCR
  - Translation support
  
Fallback:
  - Pattern matching algorithms
  - Rule-based verification
```

---

## Cost Estimation

### Hardware Costs (Initial Investment)

| Category | Quantity | Unit Cost | Total |
|----------|----------|-----------|-------|
| Load Balancer Nodes | 2 | $8,000 | $16,000 |
| Application Servers | 4 | $15,000 | $60,000 |
| Database Servers | 3 | $35,000 | $105,000 |
| Cache/Queue Servers | 3 | $12,000 | $36,000 |
| Storage Servers | 3 | $25,000 | $75,000 |
| Monitoring Servers | 2 | $15,000 | $30,000 |
| Network Equipment | 1 set | $30,000 | $30,000 |
| UPS/Power | 1 set | $20,000 | $20,000 |
| Rack/Cabling | 1 set | $15,000 | $15,000 |
| **Production Total** | | | **$387,000** |

| Development Environment | 2 | $20,000 | $40,000 |
| **Grand Total Hardware** | | | **$427,000** |

### Software Costs (Annual)

| Category | Cost |
|----------|------|
| Open Source Software | $0 |
| Enterprise Support (optional) | $30,000 - $80,000 |
| SSL Certificates | $0 (Let's Encrypt) |
| Vulnerability Scanning | $5,000 |
| **Total Software** | **$5,000 - $85,000** |

### Operational Costs (Annual)

| Category | Cost |
|----------|------|
| Power & Cooling | $15,000 - $25,000 |
| Internet Connectivity | $12,000 - $24,000 |
| Data Center Space (if colocation) | $24,000 - $60,000 |
| DevOps Staff (2 FTE) | $120,000 - $200,000 |
| Security Staff (1 FTE) | $80,000 - $120,000 |
| On-call Support | $20,000 - $40,000 |
| **Total Operations** | **$271,000 - $469,000** |

### 3-Year Total Cost of Ownership

| Scenario | Year 1 | Year 2 | Year 3 | Total |
|----------|--------|--------|--------|-------|
| Minimum | $703,000 | $276,000 | $276,000 | $1,255,000 |
| Maximum | $981,000 | $554,000 | $554,000 | $2,089,000 |

*Comparison: Supabase Pro at scale would cost approximately $500-800/month = $18,000-28,800/year*

---

## Migration Strategy

### Phase 1: Infrastructure Setup (Weeks 1-4)

#### Week 1-2: Hardware & Network
1. Hardware procurement and rack installation
2. Network topology configuration
3. Base OS installation (Ubuntu 22.04 LTS)
4. Security hardening (CIS benchmarks)
5. Firewall and VPN setup

#### Week 3-4: Container Platform
1. K3s cluster deployment
2. Storage provisioning (Longhorn)
3. Ingress controller setup (Traefik)
4. Certificate management (cert-manager)
5. Basic monitoring deployment

### Phase 2: Core Services (Weeks 5-8)

#### Week 5-6: Database
1. PostgreSQL cluster deployment (Patroni)
2. PgBouncer configuration
3. Extension installation (PostGIS, pg_trgm)
4. Backup configuration (pgBackRest)
5. Monitoring setup (pg_exporter)

#### Week 6-7: Authentication & Storage
1. Keycloak deployment
2. Realm and client configuration
3. 24 user roles setup
4. MinIO cluster deployment
5. Bucket configuration (11 buckets)

#### Week 8: Supporting Services
1. Redis cluster deployment
2. Queue service setup
3. Monitoring stack completion
4. Logging infrastructure (Loki)

### Phase 3: Application Deployment (Weeks 9-12)

#### Week 9-10: Core APIs
1. Deploy address-service (8 endpoints)
2. Deploy verification-service (6 endpoints)
3. Deploy household-service (5 endpoints)
4. Deploy business-service (4 endpoints)
5. Integration testing

#### Week 11-12: Module APIs
1. Deploy postal-service (12 endpoints)
2. Deploy emergency-service (10 endpoints)
3. Deploy analytics-service (4 endpoints)
4. Deploy notification-service (3 endpoints)
5. End-to-end testing

### Phase 4: Data Migration (Weeks 13-14)

#### Week 13: Schema Migration
1. Export Supabase schema
2. Convert RLS policies to PostgreSQL functions
3. Migrate 89+ database functions
4. Create indexes and constraints
5. Validate schema

#### Week 14: Data Transfer
1. Export data from Supabase
2. Transform data format
3. Import to PostgreSQL
4. Migrate files to MinIO
5. User account migration (Keycloak import)

### Phase 5: Frontend & Testing (Weeks 15-16)

#### Week 15: Frontend Deployment
1. Build React/Vite application
2. Configure i18n (11 namespaces)
3. Deploy to static hosting
4. Mobile app configuration
5. Offline sync testing

#### Week 16: Go-Live
1. Final security audit
2. Performance testing
3. DR testing
4. DNS cutover
5. User training

---

## Backup & Disaster Recovery

### Backup Strategy

```yaml
Database:
  Full Backup: Daily at 02:00 UTC
  Incremental: Every 4 hours
  WAL Archiving: Continuous
  Retention: 
    - Local: 7 days
    - Offsite: 30 days
    - Archive: 1 year
  Tool: pgBackRest
  
Files:
  Sync: Every 6 hours
  Retention: 30 days
  Offsite: Yes
  Tool: rclone to secondary site
  
Configuration:
  Version Control: Git
  Secrets: Vault backup
  Tool: Velero (Kubernetes)
  
Testing:
  Restore Test: Weekly
  Full DR Drill: Quarterly
```

### Disaster Recovery

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | 4 hours |
| RPO (Recovery Point Objective) | 1 hour |
| DR Site Location | Secondary data center (100km+) |
| Replication Mode | Asynchronous |
| Failover | Manual (documented procedure) |

---

## Operational Procedures

### Daily Operations
- [ ] Check monitoring dashboards
- [ ] Review error logs
- [ ] Verify backup completion
- [ ] Check security alerts
- [ ] Monitor disk usage
- [ ] Review queue depths

### Weekly Operations
- [ ] Security patch review
- [ ] Performance analysis
- [ ] Capacity planning review
- [ ] Backup restore test
- [ ] Certificate expiry check
- [ ] Log rotation verification

### Monthly Operations
- [ ] Security audit
- [ ] Performance tuning
- [ ] Capacity planning update
- [ ] DR documentation review
- [ ] Access review
- [ ] Vendor update review

### Quarterly Operations
- [ ] Full DR drill
- [ ] Penetration testing
- [ ] Architecture review
- [ ] Cost optimization
- [ ] Team training
- [ ] Documentation update

---

## Kubernetes Deployment Manifests

### Namespace Structure
```yaml
Namespaces:
  - biakam-system        # Core infrastructure
  - biakam-database      # PostgreSQL, Redis
  - biakam-storage       # MinIO
  - biakam-auth          # Keycloak
  - biakam-services      # Application services
  - biakam-monitoring    # Prometheus, Grafana, Loki
  - biakam-ingress       # Traefik/Nginx
```

### Example Service Deployment
```yaml
# services/postal-service/k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postal-service
  namespace: biakam-services
spec:
  replicas: 3
  selector:
    matchLabels:
      app: postal-service
  template:
    metadata:
      labels:
        app: postal-service
    spec:
      containers:
        - name: postal-service
          image: biakam/postal-service:1.0.0
          ports:
            - containerPort: 3001
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          env:
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: host
            - name: REDIS_HOST
              value: "redis-cluster.biakam-database.svc.cluster.local"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: postal-service
  namespace: biakam-services
spec:
  selector:
    app: postal-service
  ports:
    - port: 80
      targetPort: 3001
```

---

## Compliance & Governance

### Data Protection
- **GDPR Compliance**: Data encryption, right to deletion, consent management
- **Data Residency**: All data stored on-premise within jurisdiction
- **Audit Logging**: Complete audit trail for all operations
- **Access Control**: Role-based access with 24+ defined roles

### Security Certifications
- ISO 27001 (if required)
- SOC 2 Type II (if required)
- Local government security standards

### Documentation Requirements
- Architecture documentation
- API documentation (OpenAPI 3.0)
- Database schema documentation
- Runbooks and playbooks
- Incident response procedures
- Business continuity plan

---

## Recommendations

### Immediate Priorities
1. Start with development environment for POC
2. Establish core database and API layer first
3. Implement comprehensive monitoring early
4. Document everything as you build
5. Train team on Kubernetes operations

### Scaling Considerations
1. Design for horizontal scaling from day one
2. Use microservices architecture (as outlined)
3. Implement event-driven patterns where appropriate
4. Plan for multi-region deployment

### Future Enhancements
1. Machine learning pipelines for verification
2. Real-time analytics with streaming
3. Mobile-first optimizations
4. IoT integration for smart addresses
5. Blockchain for address verification records

---

*This blueprint provides a comprehensive foundation for self-hosting the Biakam National Address System while maintaining all 72+ tables, 52+ edge functions (as API services), 24+ user roles, and full feature parity including the Postal Module, offline capabilities, and internationalization support.*
