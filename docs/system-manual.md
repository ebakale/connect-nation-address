# Connect Nation Unified Platform - Comprehensive Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Module Overview](#module-overview)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Core Workflows](#core-workflows)
5. [Feature Descriptions](#feature-descriptions)
6. [Administrator Guide](#administrator-guide)
7. [User Guides by Role](#user-guides-by-role)
8. [Technical Documentation](#technical-documentation)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

The Connect Nation Unified Platform is a comprehensive digital ecosystem for managing both address registration and police operations in Equatorial Guinea. The platform consists of two integrated modules that work together to provide enhanced public services, emergency response, and urban planning capabilities.

## Module Overview

### Address Registry Module
The address registry system manages the complete lifecycle of address registration, verification, and distribution. It enables efficient location management through a role-based workflow that ensures data quality and security.

**Key Features:**
- Address registration and verification workflow
- Geographic information system (GIS) integration
- Unified Address Code (UAC) generation
- Evidence management and photo capture
- Multi-role approval process

### Police Operations Module
The police operations system provides comprehensive incident management, emergency response coordination, and law enforcement support capabilities.

**Key Features:**
- Real-time incident reporting and tracking
- Emergency dispatch and unit coordination
- Officer dashboard and performance monitoring
- Communication systems for field operations
- Analytics and reporting tools

### Unified Platform Benefits
- **Enhanced Service Delivery**: Improve emergency response, postal delivery, and public services through accurate addressing
- **Economic Acceleration**: Enable e-commerce, delivery services, and location-based business growth
- **Smart Urban Planning**: Support infrastructure development and city planning with precise location data
- **Digital Infrastructure**: Create a foundation for IoT, smart city initiatives, and digital governance
- **Integrated Emergency Response**: Seamless coordination between address verification and police operations
- **Data-Driven Policing**: Evidence-based decision making through comprehensive analytics

### System Architecture
- **Frontend**: React-based web application with responsive design
- **Backend**: Supabase with PostgreSQL database
- **Authentication**: Secure role-based access control with module-specific permissions
- **Storage**: Cloud-based file storage for evidence and documentation
- **Real-time Communication**: WebSocket support for live updates and dispatch
- **APIs**: RESTful APIs for integration with external systems
- **Security**: End-to-end encryption for sensitive police data

---

## User Roles and Permissions

The unified platform supports two distinct role hierarchies - one for the Address Registry Module and one for the Police Operations Module. Users can have roles in one or both modules based on their responsibilities.

### Address Registry Module Roles

#### 1. **Citizen** (Default Role)
**Purpose**: General public users who can search for verified addresses
**Permissions**:
- ✅ Search verified addresses
- ✅ View redacted evidence/documents
- ✅ Access status information for their own submissions
- ❌ Cannot create draft addresses
- ❌ Cannot upload evidence
- ❌ Cannot verify or publish addresses

**Workflow Stage**: Submit Request

#### 2. **Property Claimant**
**Purpose**: Property owners who can submit proof of ownership for address registration
**Permissions**:
- ✅ Search verified addresses
- ✅ Upload evidence (own submissions only)
- ✅ View own evidence and submissions
- ✅ Access audit logs for own records
- ❌ Cannot create draft addresses
- ❌ Cannot verify addresses

**Workflow Stage**: Submit Request with Evidence

#### 3. **Field Agent**
**Purpose**: Data collection specialists who capture address information in the field
**Permissions**:
- ✅ Create draft addresses
- ✅ Upload evidence and photos
- ✅ View own submissions and evidence
- ✅ Access audit logs for own work
- ✅ Geographic scope restrictions apply
- ❌ Cannot verify or publish addresses

**Workflow Stage**: Capture Draft
**Geographic Scope**: Limited to assigned districts/areas

#### 4. **Verifier**
**Purpose**: Quality assurance specialists who verify address accuracy and resolve duplicates
**Permissions**:
- ✅ Verify addresses
- ✅ Create corrective draft addresses
- ✅ Merge and split records
- ✅ Access full evidence
- ✅ Flag addresses for review
- ✅ Edit district-level metadata
- ✅ Access district-level audit logs
- ❌ Cannot publish to public registry

**Workflow Stage**: Verify
**Geographic Scope**: District-level access

#### 5. **Registrar**
**Purpose**: Provincial administrators who publish verified addresses to the official registry
**Permissions**:
- ✅ Publish addresses to public registry
- ✅ Retire/unpublish addresses
- ✅ All Verifier permissions
- ✅ Merge and split records
- ✅ Edit province-level metadata
- ✅ Access province-level audit logs
- ❌ Cannot override system decisions

**Workflow Stage**: Publish
**Geographic Scope**: Province-level access

#### 6. **NDAA Admin** (National Digital Address Authority)
**Purpose**: National-level administrators with full system oversight
**Permissions**:
- ✅ Override system decisions
- ✅ Manage API keys and webhooks
- ✅ Edit national-level hierarchy
- ✅ Access all audit logs
- ✅ All lower-level permissions
- ✅ System configuration management

**Workflow Stage**: Override/Supervise
**Geographic Scope**: National access

#### 7. **Partner**
**Purpose**: External organizations with API access for specific use cases
**Permissions**:
- ✅ Search verified addresses via API
- ✅ Request API access
- ✅ Access delivery logs only
- ❌ No evidence access
- ❌ Cannot create or modify addresses

**Access Type**: API-based integration

#### 8. **Auditor**
**Purpose**: Independent reviewers for compliance and quality assurance
**Permissions**:
- ✅ Read-only access to audit logs
- ✅ View redacted evidence
- ✅ Search verified addresses
- ❌ Cannot modify any data
- ❌ Cannot approve or reject addresses

**Access Type**: Read-only auditing

#### 9. **Data Steward**
**Purpose**: Quality assurance specialists for bulk operations and testing
**Permissions**:
- ✅ Create test sandbox addresses
- ✅ Suggest hierarchy changes
- ✅ Access QA-specific audit logs
- ✅ View redacted evidence
- ❌ Cannot publish live addresses

**Focus**: Quality assurance and testing

#### 10. **Support**
**Purpose**: Customer service and technical support staff
**Permissions**:
- ✅ View user issues and tickets
- ✅ Access basic system information
- ✅ Help users with navigation
- ❌ Cannot access sensitive data
- ❌ Cannot modify addresses or evidence

**Focus**: User assistance and support

### Police Operations Module Roles

#### 1. **Police Admin**
**Purpose**: System administrators for police operations with full oversight
**Permissions**:
- ✅ Manage all police system users and roles
- ✅ Configure system settings and parameters
- ✅ Access all incident data and analytics
- ✅ Manage unit structures and assignments
- ✅ Override operational decisions
- ✅ Full audit trail access

**Scope**: System-wide police operations

#### 2. **Police Supervisor**
**Purpose**: Senior officers responsible for operational oversight and unit management
**Permissions**:
- ✅ Monitor all incidents within jurisdiction
- ✅ Assign and reassign units to incidents
- ✅ Access real-time unit status and locations
- ✅ Review officer performance metrics
- ✅ Approve backup requests and resource allocation
- ✅ Generate operational reports

**Scope**: Regional or departmental oversight

#### 3. **Police Dispatcher**
**Purpose**: Emergency response coordinators managing incident dispatch
**Permissions**:
- ✅ Receive and process emergency calls
- ✅ Create and update incident records
- ✅ Dispatch units to incidents
- ✅ Monitor unit status and availability
- ✅ Coordinate emergency response
- ✅ Communication with field units

**Scope**: Dispatch center operations

#### 4. **Police Operator**
**Purpose**: Field officers and operational personnel
**Permissions**:
- ✅ View assigned incidents and details
- ✅ Update incident status and progress
- ✅ Request backup and resources
- ✅ Submit field reports and evidence
- ✅ Access incident history for patrols
- ✅ Communicate with dispatch and units

**Scope**: Field operations and assigned incidents

### Cross-Module Integration
Users with roles in both modules benefit from enhanced capabilities:
- **Emergency Response**: Police can access verified addresses for faster response
- **Incident Location**: Address verification can be fast-tracked for emergency locations
- **Data Sharing**: Seamless integration of location and incident data
- **Unified Analytics**: Cross-module reporting and analysis

---

## Core Workflows

### Address Registry Module Workflows

#### 1. Standard Address Creation Workflow
**Participants**: Citizen → Field Agent → Verifier → Registrar

1. **Submit Request** (Citizen)
   - Submit new address request through web interface
   - Provide basic location and justification information
   - Upload optional supporting documentation

2. **Capture Draft** (Field Agent)
   - Visit location and capture precise coordinates
   - Take photographs of the location
   - Create detailed address draft with evidence
   - Verify physical existence and accessibility

3. **Verify** (Verifier)
   - Review draft for accuracy and completeness
   - Check for duplicates and conflicts
   - Resolve data quality issues
   - Approve or request corrections

4. **Publish** (Registrar)
   - Final review of verified addresses
   - Publish to provincial registry
   - Generate Unified Address Code (UAC)
   - Make address publicly searchable

### 2. Partner Bulk Update Workflow
**Participants**: Partner → Data Steward → Verifier → Registrar

1. **Bulk Upload** (Partner/Utility)
   - Upload customer references with coordinates
   - Provide hashed personal data for privacy
   - Submit batch requests via API

2. **QA Review** (Data Steward)
   - Run automated quality assurance checks
   - Validate data format and completeness
   - Flag suspicious or duplicate entries

3. **Batch Verify** (Verifier)
   - Review QA results
   - Approve subset of clean data
   - Flag problematic entries for manual review

4. **Bulk Publish** (Registrar)
   - Publish approved address batches
   - Generate UACs for all new addresses
   - Send confirmation webhooks to partners

### 3. Emergency Fast-Track Workflow
**Participants**: Partner (EMS) → Verifier → Registrar

1. **Emergency Flag** (Partner - Emergency Services)
   - Flag critical location for immediate processing
   - Provide emergency justification
   - Request priority handling

2. **Priority Verify** (Verifier)
   - Process within emergency SLA (typically 2-4 hours)
   - Fast-track verification procedures
   - Escalate if needed

3. **Fast Publish** (Registrar)
   - Immediate publication to registry
   - Generate temporary UAC if needed
   - Send priority webhook confirmation

### Police Operations Module Workflows

#### 1. Emergency Incident Response Workflow
**Participants**: Citizen → Police Dispatcher → Police Operator → Police Supervisor

1. **Incident Report** (Citizen/System)
   - Emergency call received through dispatch
   - Incident details captured and categorized
   - Location verified using address registry
   - Initial assessment and priority assignment

2. **Dispatch Coordination** (Police Dispatcher)
   - Available units identified and assessed
   - Optimal unit selected based on proximity and capability
   - Incident assignment and initial briefing
   - Real-time communication established

3. **Field Response** (Police Operator)
   - Unit dispatched to incident location
   - Status updates provided during transit
   - On-scene assessment and response
   - Evidence collection and documentation

4. **Supervision and Follow-up** (Police Supervisor)
   - Monitor response progress and effectiveness
   - Coordinate additional resources if needed
   - Review incident resolution and outcomes
   - Performance evaluation and reporting

#### 2. Backup Request and Resource Allocation Workflow
**Participants**: Police Operator → Police Dispatcher → Police Supervisor

1. **Backup Request** (Police Operator)
   - Assess situation requiring additional support
   - Submit backup request with justification
   - Provide incident details and requirements
   - Maintain situation awareness

2. **Resource Coordination** (Police Dispatcher)
   - Evaluate backup request urgency
   - Identify available units and resources
   - Coordinate deployment and timing
   - Facilitate communication between units

3. **Approval and Deployment** (Police Supervisor)
   - Review and approve resource allocation
   - Monitor multi-unit coordination
   - Ensure effective resource utilization
   - Document decision rationale

### Cross-Module Integration Workflows

#### 1. Emergency Address Verification Workflow
**Participants**: Police Dispatcher → Address Verifier → Address Registrar

1. **Emergency Location Issue** (Police Dispatcher)
   - Incident reported at unverified location
   - Request urgent address verification
   - Provide incident context and urgency

2. **Priority Verification** (Address Verifier)
   - Fast-track address verification process
   - Coordinate with field agents if needed
   - Expedite quality assurance checks

3. **Emergency Publication** (Address Registrar)
   - Immediate address registry update
   - Generate emergency UAC
   - Notify police dispatch of completion

---

## Feature Descriptions

### Address Registry Module Features

#### Address Search
- **Smart Search**: Natural language and coordinate-based search
- **Filter Options**: By verification status, date, location type
- **Map Integration**: Visual search with interactive maps
- **Export Functions**: Data export in multiple formats

### Address Registration
- **Multi-Step Form**: Guided registration process
- **Photo Upload**: Evidence capture with automatic compression
- **GPS Integration**: Automatic coordinate capture
- **Duplicate Detection**: Real-time duplicate checking

### Verification Tools
- **Bulk Verification**: Process multiple addresses simultaneously
- **Quality Scoring**: Automated quality assessment
- **Conflict Resolution**: Tools for resolving address conflicts
- **Evidence Review**: Secure evidence viewing and annotation

### Administrative Tools
- **Role Management**: Assign and modify user roles
- **Permission Matrix**: Visual permission management
- **Workflow Monitoring**: Track progress through stages
- **Analytics Dashboard**: System usage and performance metrics

#### UAC Generation
- **Unified Address Codes**: Standardized address identifiers
- **Hierarchical Structure**: Country-Region-City-Unique format
- **Check Digits**: Built-in validation for accuracy
- **Batch Generation**: Efficient bulk UAC creation

### Police Operations Module Features

#### Incident Management
- **Real-time Incident Tracking**: Live updates on incident status and progress
- **Priority Classification**: Automatic categorization based on severity and type
- **Location Integration**: Seamless integration with address registry for accurate positioning
- **Evidence Management**: Secure storage and tracking of incident-related evidence

#### Dispatch Operations
- **Unit Tracking**: Real-time location and status monitoring of police units
- **Optimal Assignment**: Intelligent unit selection based on proximity and availability
- **Communication Hub**: Centralized communication between dispatch and field units
- **Emergency Protocols**: Specialized workflows for high-priority incidents

#### Performance Analytics
- **Response Time Tracking**: Detailed metrics on incident response efficiency
- **Officer Performance**: Individual and unit performance monitoring
- **Crime Pattern Analysis**: Data-driven insights into crime trends and hotspots
- **Resource Utilization**: Analysis of unit deployment and effectiveness

#### Unit Management
- **Team Organization**: Hierarchical unit structure management
- **Shift Scheduling**: Automated scheduling and duty assignment
- **Backup Coordination**: Streamlined process for requesting and deploying backup
- **Status Monitoring**: Real-time visibility into unit availability and activities

#### Communications
- **Secure Messaging**: Encrypted communication channels for sensitive operations
- **Broadcast Alerts**: System-wide notifications for critical situations
- **Field Reporting**: Mobile-friendly tools for field report submission
- **Emergency Notifications**: Automated alerts for priority incidents

---

## Administrator Guide

### Initial System Setup

#### 1. User Management
```
1. Access Admin Panel → User Manager
2. View all registered users
3. Assign appropriate roles based on responsibilities
4. Set geographic scopes for Field Agents and Verifiers
5. Configure organization scopes for Partners
```

#### 2. Role Assignment Process
```
- Admin users can assign any role
- Geographic scopes limit access to specific regions
- Organization scopes define partner access levels
- Multiple roles can be assigned to single users
```

#### 3. System Configuration
```
1. Configure province and district boundaries
2. Set up API keys for external integrations
3. Configure webhook endpoints for partners
4. Set system-wide parameters and limits
```

### Daily Operations

#### 1. Monitor Verification Queue
- Review pending address requests
- Check auto-verification results
- Manage flagged addresses
- Monitor processing times

#### 2. User Support
- Assist users with role-related issues
- Resolve access permission problems
- Handle escalated verification disputes
- Manage system-wide announcements

#### 3. Data Quality Management
- Review audit logs for anomalies
- Monitor system performance metrics
- Identify and resolve data inconsistencies
- Coordinate with technical support

### Security Management

#### 1. Access Control
- Regular review of user permissions
- Audit trail monitoring
- Failed login attempt tracking
- Suspicious activity investigation

#### 2. Data Protection
- Evidence access logging
- Geographic scope enforcement
- API usage monitoring
- Data export controls

---

## User Guides by Role

### For Citizens

#### Getting Started
1. **Registration**: Create account through authentication page
2. **Search Addresses**: Use the search function to find verified addresses
3. **View Results**: Access public address information and UACs
4. **Request New Address**: Submit requests for missing addresses

#### Common Tasks
- **Search by UAC**: Enter UAC directly for specific address
- **Search by Location**: Use natural language search
- **View on Map**: Visual location verification
- **Check Status**: Track submitted requests

### For Field Agents

#### Daily Workflow
1. **Review Assignments**: Check assigned geographic areas
2. **Capture Addresses**: Visit locations and create drafts
3. **Photo Documentation**: Take required evidence photos
4. **GPS Coordinates**: Capture precise location data
5. **Submit for Verification**: Complete drafts for review

#### Best Practices
- Verify physical accessibility
- Take photos from multiple angles
- Include landmarks and house numbers
- Double-check coordinate accuracy
- Add descriptive notes for context

### For Verifiers

#### Verification Process
1. **Review Queue**: Process pending address requests
2. **Quality Check**: Verify accuracy and completeness
3. **Duplicate Detection**: Identify and resolve conflicts
4. **Evidence Review**: Examine photos and documentation
5. **Decision Making**: Approve, reject, or request corrections

#### Quality Standards
- Coordinate accuracy within 10 meters
- Clear photographic evidence
- Consistent naming conventions
- Proper address hierarchy
- Complete required fields

### For Registrars

#### Publication Workflow
1. **Review Verified Addresses**: Final quality check
2. **Batch Processing**: Efficiently handle multiple addresses
3. **UAC Generation**: Create unique address codes
4. **Registry Update**: Publish to official database
5. **Status Communication**: Notify relevant parties

#### Management Duties
- Monitor provincial address quality
- Coordinate with verifiers
- Handle public inquiries
- Manage provincial statistics
- Ensure compliance with standards

---

## Technical Documentation

### Database Schema

#### Core Tables
- **addresses**: Main address registry
- **address_requests**: Pending address submissions
- **user_roles**: Role assignments
- **user_role_metadata**: Geographic and organizational scopes
- **profiles**: User profile information
- **provinces**: Administrative boundaries

#### Key Relationships
- Users have multiple roles through user_roles table
- Roles have metadata for scoping
- Addresses link to original requests
- Evidence files stored in Supabase storage

### API Endpoints

#### Authentication
```
POST /auth/signin - User login
POST /auth/signup - User registration  
POST /auth/signout - User logout
```

#### Address Management
```
GET /addresses/search - Search verified addresses
POST /addresses/request - Submit new address request
PUT /addresses/{id}/verify - Verify address
PUT /addresses/{id}/publish - Publish address
```

#### Administrative
```
GET /admin/users - List all users
POST /admin/roles/assign - Assign user role
GET /admin/analytics - System analytics
```

### Security Features

#### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only access data within their scope
- Geographic restrictions enforced at database level
- Audit trail for all data access

#### Data Encryption
- All sensitive data encrypted at rest
- API communications over HTTPS
- File uploads encrypted in storage
- Database connections secured with SSL

---

## Troubleshooting

### Common Issues

#### Login Problems
**Issue**: Users cannot access the system
**Solutions**:
1. Verify email and password
2. Check if account needs activation
3. Confirm role assignment
4. Clear browser cache and cookies

#### Permission Errors
**Issue**: "Access denied" messages
**Solutions**:
1. Verify user role assignment
2. Check geographic scope settings
3. Confirm feature permissions
4. Contact administrator for role update

#### Upload Failures
**Issue**: Cannot upload photos or documents
**Solutions**:
1. Check file size (max 10MB)
2. Verify file format (JPG, PNG, PDF)
3. Test internet connection
4. Try different browser

#### Search Issues
**Issue**: Cannot find addresses
**Solutions**:
1. Verify address is verified/published
2. Check search terms and filters
3. Try coordinate-based search
4. Contact support for data verification

### Performance Issues

#### Slow Loading
**Causes**: Large datasets, network issues, browser problems
**Solutions**:
1. Use filters to limit results
2. Check internet connection
3. Clear browser cache
4. Try different device/browser

#### System Downtime
**Response**: 
1. Check system status page
2. Wait for automatic recovery
3. Contact technical support
4. Use mobile backup access

### Data Quality Issues

#### Duplicate Addresses
**Detection**: Automated during verification
**Resolution**: 
1. Verifiers merge duplicates
2. Choose most accurate version
3. Preserve audit trail
4. Update cross-references

#### Incorrect Coordinates
**Identification**: GPS accuracy checks
**Correction**:
1. Field agent re-survey
2. Verifier coordinate adjustment
3. Evidence documentation
4. Re-publication if needed

### Support Contacts

#### Technical Support
- **Email**: tech-support@address-system.gq
- **Phone**: +240-XXX-XXXX
- **Hours**: Monday-Friday, 8:00-17:00

#### Administrative Support  
- **Email**: admin-support@address-system.gq
- **Phone**: +240-XXX-XXXX
- **Hours**: Monday-Friday, 8:00-17:00

#### Emergency Support
- **24/7 Hotline**: +240-XXX-XXXX
- **Emergency Email**: emergency@address-system.gq
- **Response Time**: Within 2 hours

---

## Appendices

### A. UAC Format Specification
```
Format: CC-RR-CCC-XXXXXX-XX
CC = Country Code (GQ for Equatorial Guinea)
RR = Region Code (standardized 2-letter codes)
CCC = City Code (standardized 3-letter codes)  
XXXXXX = Unique identifier (6 characters)
XX = Check digits (2 characters)

Example: GQ-LT-BAT-A1B2C3-MN
```

### B. Photo Requirements
- **Format**: JPG or PNG
- **Size**: Maximum 10MB per file
- **Resolution**: Minimum 1024x768 pixels
- **Content**: Clear view of address location
- **Angle**: Multiple perspectives recommended
- **Lighting**: Adequate lighting for visibility

### C. Geographic Scope Codes

#### Regions
- **LT**: Litoral
- **CS**: Centro Sur
- **KN**: Kié-Ntem
- **WN**: Wele-Nzas
- **BN**: Bioko Norte
- **BS**: Bioko Sur
- **DJ**: Djibloho
- **AN**: Annobón

#### Major Cities
- **MAL**: Malabo
- **BAT**: Bata
- **EVI**: Evinayong
- **EBE**: Ebebiyín
- **MON**: Mongomo
- **LUB**: Luba
- **CDP**: Ciudad de la Paz
- **SAP**: San Antonio de Palé

### D. System Limits
- **Maximum file size**: 10MB
- **Maximum batch size**: 100 addresses
- **Search results limit**: 50 addresses
- **Concurrent users**: 1000
- **API rate limit**: 100 requests/minute
- **Storage per user**: 100MB

---

*This manual is regularly updated. For the latest version, visit the system documentation portal or contact your administrator.*

**Version**: 1.0
**Last Updated**: December 2024
**Next Review**: March 2025