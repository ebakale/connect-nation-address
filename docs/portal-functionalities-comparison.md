# Portal Functionalities Comparison

This document provides a comprehensive comparison between the Public Portal (no authentication required) and the Citizen Portal (authentication required) in the ConEG National Address Registry system.

---

## Public Portal (No Authentication Required)

The Public Portal is accessible to anyone without requiring user authentication. It provides basic address lookup and information sharing capabilities.

### Available Features

#### 1. Address Search
- **Search Capabilities**:
  - Search verified addresses by UAC (Unified Address Code)
  - Search by city, street, or region
  - Search analytics tracking for system improvement
  - GPS-based distance calculation from user's current location
  
- **QR Code Integration**:
  - Scan QR codes for quick address lookup
  - Instant address retrieval via QR scanning
  
- **Search Results**:
  - View completeness scores for each address
  - See distance from current location
  - Filter verified addresses only

#### 2. Address Information Viewing
- **Accessible Information**:
  - Verified and public addresses only
  - Complete address details (street, building, city, region, country)
  - Geographic coordinates (latitude/longitude)
  - Address completeness scores
  - Verification status badges
  
- **Limitations**:
  - Cannot view private/unverified addresses
  - Cannot view draft or pending addresses
  - Read-only access

#### 3. Address Sharing
- **QR Code Generation**:
  - Generate scannable QR codes for any public address
  - Download QR codes for offline sharing
  
- **Digital Sharing Options**:
  - Share via WhatsApp with pre-formatted message
  - Share via Email with address details
  - Copy full address to clipboard
  - Copy coordinates to clipboard for navigation apps

#### 4. Navigation & Mapping
- **Navigation Features**:
  - Get directions to any public address
  - View addresses on interactive map
  - Calculate distances from current location
  - Export coordinates for external GPS applications

#### 5. Emergency Services
- **Emergency Access**:
  - View emergency contacts (read-only)
  - Report issues or emergencies at specific addresses
  - Quick access to emergency reporting from address details
  
- **Limitations**:
  - Cannot track emergency reports
  - Cannot receive emergency notifications

---

## Citizen Portal (Authentication Required)

The Citizen Portal requires user authentication and provides comprehensive address management capabilities in addition to all Public Portal features.

### All Public Portal Features

✅ The Citizen Portal includes **ALL** features available in the Public Portal, plus the additional features listed below.

### Personal Address Management (CAR - Citizen Address Repository)

#### 1. Primary Address Management
- **Set Primary Residence**:
  - Declare primary residence address
  - Link to verified NAR (National Address Registry) addresses
  - Update primary address when moving
  
- **Address Status Tracking**:
  - `SELF_DECLARED`: User-submitted, awaiting verification
  - `CONFIRMED`: Verified by authorities
  - `REJECTED`: Not verified, needs correction
  
- **Detailed Information**:
  - NAR verification status
  - Effective dates (from/to)
  - Occupant type classification
  - Source of address registration
  - Address description and notes

#### 2. Secondary Addresses
- **Multiple Address Support**:
  - Add unlimited secondary addresses
  - Classify as work, temporary, vacation, etc.
  - Manage different address scopes:
    - `BUILDING`: Entire building address
    - `UNIT`: Specific unit within building
  
- **Address Lifecycle**:
  - Set effective dates for each address
  - Retire addresses when no longer applicable
  - Track full address history
  - View past addresses and their effective periods

#### 3. Saved Locations
- **Location Management**:
  - Save frequently accessed addresses
  - Add custom names/labels to saved locations
  - Quick access from dashboard
  - Organize locations by category
  
- **Features**:
  - One-click navigation to saved locations
  - Share saved locations with others
  - Export saved locations list

### Address Request System

**⚠️ IMPORTANT**: Address request submission is **ONLY** available in the Citizen Portal. Authentication is required to submit address requests. The Public Portal provides read-only access to verified addresses only.

#### 1. Submit New Address Requests
- **Request Creation** (Authenticated Citizen Portal Only):
  - Request addition of new addresses to national database
  - Provide detailed address information
  - Upload supporting documents/photos
  - Capture GPS coordinates automatically
  - Write justification for request
  
- **Request Types**:
  - New address creation
  - Address correction
  - Address update
  - Building/unit addition

#### 2. Track Request Status
- **Comprehensive Tracking**:
  - View all submitted requests in one place
  - Real-time status updates:
    - `PENDING`: Awaiting review
    - `APPROVED`: Request accepted, address created
    - `REJECTED`: Request denied with feedback
    - `FLAGGED`: Requires additional review
  
- **Detailed Feedback**:
  - See reviewer notes and comments
  - View rejection reasons
  - Receive recommendations for improvement
  - Access verification analysis

#### 3. Resubmission Capability
- **Correction & Resubmission**:
  - Resubmit rejected requests with corrections
  - Address reviewer feedback
  - Track resubmission count and history
  - Learn from previous submission errors

### Verification Services

#### 1. Residency Verification Requests
- **Verification Submission**:
  - Submit requests to verify residency at an address
  - Request ownership verification
  - Provide supporting documentation
  - Track verification progress
  
- **Verification Status**:
  - `PENDING`: Under review
  - `APPROVED`: Residency/ownership verified
  - `REJECTED`: Verification failed
  - `REQUIRES_ADDITIONAL_DOCUMENTS`: More proof needed

#### 2. Document Management
- **Document Upload**:
  - Upload proof of residency documents
  - Upload ownership documents (deeds, contracts)
  - Upload utility bills, tax records
  - Manage document versions
  
- **Document Security**:
  - Encrypted document storage
  - Access audit trail
  - Automatic expiration handling
  - Privacy consent management

### Notifications & Alerts

#### 1. Emergency Notifications
- **Real-time Alerts**:
  - Receive emergency notifications instantly
  - Location-based alert filtering
  - Priority-based notification system (1-5)
  
- **Notification Management**:
  - Mark notifications as read/unread
  - View notification history
  - Filter by type and priority
  - Archive old notifications

#### 2. System Notifications
- **Status Updates**:
  - Address request approvals/rejections
  - Verification status changes
  - Document processing updates
  - System maintenance announcements
  
- **Customization**:
  - Set notification preferences
  - Choose notification channels
  - Enable/disable specific notification types

### User Profile & Settings

#### 1. Profile Management
- **Personal Information**:
  - View and update profile details
  - Manage contact information
  - Set preferred language
  - Update notification preferences
  
- **Account Security**:
  - Change password
  - View login history
  - Manage sessions
  - Enable two-factor authentication (if available)

#### 2. Role & Permissions
- **Access Control**:
  - View assigned role(s)
  - See permission scope
  - Understand access limitations
  - Request role changes

---

## Feature Comparison Table

| Feature Category | Feature | Public Portal | Citizen Portal |
|-----------------|---------|---------------|----------------|
| **Search & Discovery** | Search verified addresses | ✅ | ✅ |
| | QR code scanning | ✅ | ✅ |
| | GPS-based distance | ✅ | ✅ |
| | Search analytics | ✅ | ✅ |
| **Address Viewing** | View public addresses | ✅ | ✅ |
| | View private addresses | ❌ | ✅ (own addresses) |
| | Address completeness scores | ✅ | ✅ |
| | Full address details | ✅ (limited) | ✅ (complete) |
| **Sharing** | Generate QR codes | ✅ | ✅ |
| | Share via WhatsApp | ✅ | ✅ |
| | Share via Email | ✅ | ✅ |
| | Copy to clipboard | ✅ | ✅ |
| **Navigation** | Get directions | ✅ | ✅ |
| | View on map | ✅ | ✅ |
| **Personal Management** | Set primary address | ❌ | ✅ |
| | Manage secondary addresses | ❌ | ✅ |
| | Save favorite locations | ❌ | ✅ |
| | Address history tracking | ❌ | ✅ |
| **Requests** | Submit address requests | ❌ (Authentication required) | ✅ |
| | Track request status | ❌ (Authentication required) | ✅ |
| | Resubmit rejected requests | ❌ (Authentication required) | ✅ |
| **Verification** | Request residency verification | ❌ | ✅ |
| | Upload documents | ❌ | ✅ |
| | Track verification status | ❌ | ✅ |
| **Notifications** | Receive emergency alerts | ❌ | ✅ |
| | Request status updates | ❌ | ✅ |
| | System announcements | ❌ | ✅ |
| **Emergency** | View emergency contacts | ✅ | ✅ |
| | Report emergencies | ✅ (basic) | ✅ (with tracking) |
| | Emergency notification history | ❌ | ✅ |

---

## Key Differences Summary

### Public Portal Focus
- **Purpose**: Provide public access to verified address information
- **User Type**: Anonymous/unauthenticated users
- **Access Level**: Read-only, public data only
- **Primary Use Cases**:
  - Finding verified addresses
  - Sharing address information
  - Getting directions
  - Emergency contact lookup

### Citizen Portal Focus
- **Purpose**: Comprehensive personal address management and civic participation
- **User Type**: Authenticated citizens with verified accounts
- **Access Level**: Full read-write access to personal data, read access to public data
- **Primary Use Cases**:
  - Managing personal addresses (primary, secondary)
  - Participating in national address registry
  - Requesting new addresses
  - Verifying residency/ownership
  - Receiving emergency alerts
  - Tracking address-related requests

---

## When to Use Each Portal

### Use Public Portal When:
- You need to look up a public address quickly (read-only)
- You want to share an address with someone
- You need directions to a verified location
- You're a visitor or temporary user
- You don't need to manage personal addresses or submit requests
- You want to access emergency contacts
- **Note**: Cannot submit address requests or manage personal data

### Use Citizen Portal When:
- You need to manage your residential addresses
- **You want to submit a new address request** (REQUIRED - not available in Public Portal)
- **You want to register a new address** (REQUIRED - authentication mandatory)
- You need to verify your residency
- You want to track your address requests
- You need to receive emergency notifications
- You want to save frequently used locations
- You need full address management capabilities

---

## Security & Privacy Considerations

### Public Portal
- No personal data stored
- No authentication required
- Access to public, verified addresses only
- Search queries may be logged for analytics
- IP-based rate limiting applied

### Citizen Portal
- Personal data encrypted at rest and in transit
- Authentication required (email/password)
- Role-based access control (RBAC)
- Row-level security (RLS) policies enforced
- Audit logging for all modifications
- Document upload with virus scanning
- Privacy consent management
- GDPR/data protection compliance
- Session management and timeout
- Two-factor authentication support (if enabled)

---

## Technical Implementation

### Public Portal
- **Route**: `/public` (also accessible from index page `/`)
- **Component**: `PublicAccessPortal.tsx` (wrapped in `PublicPortalWithAnalytics`)
- **Authentication**: None required
- **Database Access**: Read-only via RLS policies
- **API Access**: Public endpoints only (`address-search-api` with optional auth)
- **Internationalization**: Fully internationalized (EN/ES/FR) - all UI labels, search stats, pagination, and status indicators use i18n translation keys

### Citizen Portal
- **Route**: `/citizen`
- **Component**: `CitizenPortalUnified.tsx`
- **Authentication**: Required (Supabase Auth)
- **Database Access**: Full CRUD via RLS policies
- **API Access**: Authenticated endpoints
- **Additional Hooks**:
  - `useUnifiedAuth()`: Authentication management
  - `usePerson()`: Personal data management
  - `useCitizenAddresses()`: Address management
  - `useCAR()`: Citizen Address Repository integration

---

## Recent Updates (March 2026)

### Public Portal Improvements
- ✅ **Full Internationalization**: All UI text now uses i18n keys (EN/ES/FR), including search statistics, pagination, status labels, and business-related fields
- ✅ **Unauthenticated Address Search**: `address-search-api` now supports optional authentication - unauthenticated users can search public/verified addresses; authenticated users get access to private address filtering
- ✅ **Public Portal Analytics**: Wrapped in `PublicPortalWithAnalytics` component for usage tracking

## Future Enhancements

### Planned Features for Public Portal
- Advanced search filters (by address type, verification date)
- Multi-language support expansion (Portuguese planned)
- Offline address caching
- Public statistics dashboard
- Community-reported address issues

### Planned Features for Citizen Portal
- Address validation automation
- AI-assisted address correction
- Bulk address import/export
- Family/household address linking
- Address transfer on relocation
- Integration with utility services
- Property tax integration
- Real-time address status tracking
- Mobile app with offline support

---

## Support & Documentation

For additional help:
- **User Guide**: See `/docs/system-manual.md`
- **API Documentation**: Contact system administrator
- **Emergency Support**: See emergency contacts in either portal
- **Technical Support**: support@coneg.gov.gq

---

**Document Version**: 1.1  
**Last Updated**: 2026-03-17  
**Maintained By**: ConEG Development Team
