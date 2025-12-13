import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronRight, 
  ChevronDown,
  User,
  Users,
  Building2,
  AlertTriangle,
  Radio,
  MapPin,
  BarChart3,
  CheckCircle2,
  Clock,
  Target,
  Lightbulb,
  Monitor,
  Home,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

interface DemoStep {
  step: number;
  action: string;
  screen: string;
  notes: string;
}

interface DemoScenario {
  id: string;
  title: string;
  icon: React.ElementType;
  context: string;
  objective: string;
  actors: { role: string; name: string; type: 'primary' | 'secondary' }[];
  modules: string[];
  steps: DemoStep[];
  outcome: string[];
  presenterNotes: string;
}

const scenarios: DemoScenario[] = [
  {
    id: 'citizen-registration',
    title: 'Citizen Registers a New Digital Address',
    icon: User,
    context: 'A citizen named María González has recently moved to a newly developed neighborhood in Malabo. She needs to register her new residence to obtain an official digital address for banking, utility services, and legal documentation.',
    objective: 'Submit a new residential address request through the unified workflow',
    actors: [
      { role: 'Citizen', name: 'María González', type: 'primary' },
      { role: 'NAR Verifier', name: 'System Queue', type: 'secondary' }
    ],
    modules: ['Public Portal', 'Citizen Dashboard', 'Unified Address Request Flow'],
    steps: [
      { step: 1, action: 'María accesses the system at the home page', screen: 'Index page with hero section and "Iniciar Sesión" button', notes: 'Point out the clean, professional government design. Mention multi-language support (EN/ES/FR).' },
      { step: 2, action: 'She clicks "Iniciar Sesión" and logs in with her credentials', screen: 'UnifiedAuth page with email/password form', notes: 'Highlight secure authentication. Mention first-time users can register here.' },
      { step: 3, action: 'After login, system detects her "citizen" role and displays her dashboard', screen: 'UnifiedDashboard with citizen-specific navigation', notes: 'Point out role-based navigation - citizens see only relevant options.' },
      { step: 4, action: 'María clicks "Registrar Dirección" (Register Address) in the sidebar', screen: 'UnifiedAddressRequestFlow wizard opens at Step 1', notes: 'Explain the unified flow handles residential AND business registrations.' },
      { step: 5, action: 'She searches for her address by entering street name "Avenida de la Libertad 45"', screen: 'AddressLookupStep with search input and results', notes: 'Show how the system searches existing NAR addresses first.' },
      { step: 6, action: 'No existing address is found. María clicks "Create New Address"', screen: 'Flow transitions to address-type-selection step', notes: 'Point out the system guides users - it won\'t create duplicates.' },
      { step: 7, action: 'She selects "Residential Address" option', screen: 'AddressRequestForm opens with location picker', notes: 'Highlight the clear distinction between residential and business.' },
      { step: 8, action: 'María uses the interactive map to pinpoint her exact location', screen: 'UniversalLocationPicker with map', notes: 'Demonstrate clicking on map to set GPS coordinates. Mention offline fallback.' },
      { step: 9, action: 'She fills in: Street, City, Region, Building number, Photo of property', screen: 'Form fields populate, camera capture opens', notes: 'Show the camera permission request. Emphasize geotagged photos.' },
      { step: 10, action: 'María adds justification and submits', screen: 'Confirmation dialog appears', notes: 'Note that citizens provide justification for audit trail.' },
      { step: 11, action: 'System confirms: "Request submitted successfully"', screen: 'Success screen with request ID', notes: 'Show the instant confirmation. Explain request goes to verification queue.' },
      { step: 12, action: 'María navigates to "Request Status" to track her submission', screen: 'AddressRequestStatus panel showing "Pending"', notes: 'Demonstrate transparency - citizens can always check status.' }
    ],
    outcome: [
      'María has submitted her address request in under 5 minutes',
      'She has a reference number for tracking',
      'The request enters the NAR verification queue',
      'Upon approval, she\'ll receive a unique UAC (Unified Address Code)'
    ],
    presenterNotes: 'The unified flow eliminates confusion - citizens don\'t need to understand NAR vs CAR vs Business. The system guides them through the appropriate process based on their selection.'
  },
  {
    id: 'municipality-validation',
    title: 'Municipality Validates and Manages an Address',
    icon: Building2,
    context: 'Carlos Mendez, a NAR Verifier assigned to Bioko Norte region, reviews María\'s address request and validates it for inclusion in the National Address Registry.',
    objective: 'Review and approve a pending address request with proper verification',
    actors: [
      { role: 'NAR Verifier', name: 'Carlos Mendez', type: 'primary' },
      { role: 'Citizen', name: 'María González', type: 'secondary' }
    ],
    modules: ['UnifiedDashboard', 'Verification Tools', 'Address Approval Panel'],
    steps: [
      { step: 1, action: 'Carlos logs in with his verifier credentials', screen: 'UnifiedAuth → automatic redirect to UnifiedDashboard', notes: 'Explain role-based redirects.' },
      { step: 2, action: 'His dashboard shows role badge "Verificador" with scope "Bioko Norte"', screen: 'Dashboard header with role badges and geographic scope indicator', notes: 'Highlight geographic scope filtering - he only sees requests for his region.' },
      { step: 3, action: 'Stats cards show: 3 NAR Addresses, 5 Pending Verifications', screen: 'Overview stats cards with real-time counts', notes: 'Point out pending count is filtered by his assigned region.' },
      { step: 4, action: 'Carlos clicks "Verification Tools" in sidebar', screen: 'VerificationTools component with tabs', notes: 'Show the verification workstation interface.' },
      { step: 5, action: 'He sees María\'s request at the top of the pending list', screen: 'AddressRequestApproval panel with request cards', notes: 'Note requests are ordered by submission date.' },
      { step: 6, action: 'Carlos clicks "View Details" on María\'s request', screen: 'Request detail card expands', notes: 'Point out comprehensive data available for verification.' },
      { step: 7, action: 'He clicks "View on Map" to verify coordinates', screen: 'AddressMapDialog opens showing location on interactive map', notes: 'Demonstrate satellite view toggle for visual verification.' },
      { step: 8, action: 'Carlos uses the "Auto-Verification Analysis" button', screen: 'System runs coordinate validation, shows recommendations', notes: 'Explain ML-assisted verification (optional enhancement).' },
      { step: 9, action: 'He reviews the geotagged photo showing the property facade', screen: 'Photo viewer with metadata (timestamp, GPS coordinates)', notes: 'Highlight photo evidence chain for legal compliance.' },
      { step: 10, action: 'Carlos clicks "Approve" button', screen: 'Confirmation dialog with checkbox for verification notes', notes: 'Show the approval confirmation step.' },
      { step: 11, action: 'He adds note and confirms approval', screen: 'System processes approval', notes: 'Explain audit trail of who approved and when.' },
      { step: 12, action: 'System displays generated UAC: GQ-BN-MLO-AVLB-0045', screen: 'Success message with generated UAC', notes: 'Point out the unique address code format.' },
      { step: 13, action: 'For residential addresses, the address is set to private by default', screen: 'Status updates to "Verified, Private"', notes: 'Explain auto-publishing policy: Commercial = public, Residential = private.' }
    ],
    outcome: [
      'María\'s address is now officially in the National Registry',
      'She receives a UAC code: GQ-BN-MLO-AVLB-0045',
      'Audit trail shows Carlos verified it with timestamp',
      'Address is searchable by authorized systems'
    ],
    presenterNotes: 'The verification workflow ensures data quality. Geographic scope filtering means each verifier manages only their territory. The auto-publishing policy eliminates manual steps for commercial addresses while protecting residential privacy.'
  },
  {
    id: 'business-verification',
    title: 'Business Validates an Address for Service Delivery',
    icon: Building2,
    context: 'BANKIA Financial Services needs to verify a customer\'s address before opening a bank account. The compliance officer searches the public address registry to confirm the address exists.',
    objective: 'Verify an address through the public portal without authentication',
    actors: [
      { role: 'Bank Compliance Officer', name: 'Ana Torres', type: 'primary' }
    ],
    modules: ['Public Portal', 'Address Search', 'Business Directory'],
    steps: [
      { step: 1, action: 'Ana accesses the public portal without logging in', screen: 'PublicPortalWithAnalytics showing public search interface', notes: 'Emphasize: No login required for public searches.' },
      { step: 2, action: 'She sees two tabs: "Address Search" and "Business Directory"', screen: 'Tabs component at top of portal', notes: 'Explain public vs authenticated access.' },
      { step: 3, action: 'Ana enters the UAC code: "GQ-BN-MLO-AVLB-0045"', screen: 'PublicAccessPortal search input', notes: 'Show how UAC provides instant precise lookup.' },
      { step: 4, action: 'She clicks "Search" button', screen: 'Search executes, loading indicator shows', notes: 'Note the fast search response.' },
      { step: 5, action: 'Result appears with verified badge', screen: 'Search result card with verified badge, completeness score', notes: 'Point out the "Verified" badge indicating official status.' },
      { step: 6, action: 'Ana clicks "View Details" on the result', screen: 'Expanded card showing full address details', notes: 'Note: Coordinates are approximate for privacy (residential).' },
      { step: 7, action: 'The card shows verification status: ✓ Verified, Score: 95%', screen: 'Status indicators with completeness percentage', notes: 'Explain completeness score = data quality indicator.' },
      { step: 8, action: 'Ana clicks "Generate QR Code" for documentation', screen: 'QRCodeGenerator dialog opens with QR preview', notes: 'Show QR contains the UAC for easy mobile scanning.' },
      { step: 9, action: 'She downloads the QR code as proof of verification', screen: 'Download button saves PNG file', notes: 'Explain this creates auditable proof of verification.' },
      { step: 10, action: 'For business addresses, Ana checks the "Business Directory" tab', screen: 'BusinessDirectory component with searchable list', notes: 'Show integrated business directory with commercial addresses.' },
      { step: 11, action: 'She searches for "BANKIA" to find bank branch locations', screen: 'Search results showing bank branch addresses with details', notes: 'Demonstrate business metadata (hours, services, contact).' }
    ],
    outcome: [
      'Ana verified the customer\'s address in under 2 minutes',
      'She has QR-coded proof of verification for compliance records',
      'The bank can proceed with account opening',
      'No manual verification or phone calls required'
    ],
    presenterNotes: 'The public portal enables instant address verification for businesses, reducing onboarding time from days to minutes. The QR code provides portable, scannable proof of address verification.'
  },
  {
    id: 'car-registration-household',
    title: 'CAR Registration, Household Management & Address Verification',
    icon: Home,
    context: 'Pedro Martínez has his NAR address approved and now needs to declare it as his official residence (CAR). He also wants to register his household members including his spouse and two children, and request residency verification for legal purposes.',
    objective: 'Declare a CAR address, create a household group with members and dependents, and request residency verification',
    actors: [
      { role: 'Citizen/Head of Household', name: 'Pedro Martínez', type: 'primary' },
      { role: 'Spouse', name: 'Carmen Martínez', type: 'secondary' },
      { role: 'CAR Verifier', name: 'System Queue', type: 'secondary' }
    ],
    modules: ['Citizen Dashboard', 'My CAR Addresses', 'Household Management', 'Verification Requests'],
    steps: [
      { step: 1, action: 'Pedro logs into his citizen dashboard', screen: 'UnifiedDashboard with citizen navigation showing My CAR Addresses, Household, Verification Requests', notes: 'Point out the CAR-specific menu items available to citizens.' },
      { step: 2, action: 'He clicks "My CAR Addresses" in the sidebar', screen: 'CitizenAddressManager showing current addresses (if any) and "Add Address" button', notes: 'Explain CAR = Citizen Address Registry - links citizens to their official residence.' },
      { step: 3, action: 'Pedro clicks "Add Address" and enters his approved UAC: GQ-BN-MLO-AVLB-0045', screen: 'Address lookup by UAC with verified address result', notes: 'Show that CAR declaration uses existing NAR addresses - no duplicates created.' },
      { step: 4, action: 'He selects address scope: "Primary Residence"', screen: 'Scope selector with Primary/Secondary options', notes: 'Explain: Citizens can have one primary and multiple secondary addresses.' },
      { step: 5, action: 'Pedro sets privacy level: "Private - Authorized Services Only"', screen: 'Privacy level dropdown with options', notes: 'Highlight citizen control over who can see their address.' },
      { step: 6, action: 'He confirms the declaration and address is added', screen: 'Success message, address appears in "My Addresses" list with "Self-Declared" status', notes: 'Note: Self-declared status means awaiting verification.' },
      { step: 7, action: 'Pedro navigates to "Household Management"', screen: 'HouseholdManagement component with "Create Household" option', notes: 'Explain households group family members at same address.' },
      { step: 8, action: 'He clicks "Create Household Group"', screen: 'CreateHouseholdDialog with household name, primary UAC fields', notes: 'Show the household creation form.' },
      { step: 9, action: 'Pedro enters: Household Name: "Familia Martínez", Primary Address: his CAR address', screen: 'Form fields populated, Create button enabled', notes: 'Point out automatic linking to CAR address.' },
      { step: 10, action: 'Household created. Pedro is automatically set as "Household Head"', screen: 'Household card with Pedro as head, "Add Member" and "Add Dependent" buttons', notes: 'Explain the household head role and permissions.' },
      { step: 11, action: 'He clicks "Add Member" to add his spouse Carmen', screen: 'AddMemberDialog with person search or email invite', notes: 'Members must have their own accounts to be added.' },
      { step: 12, action: 'Pedro enters Carmen\'s email for invitation', screen: 'Email invitation form with relationship selector: Spouse', notes: 'Show relationship types: Spouse, Parent, Sibling, etc.' },
      { step: 13, action: 'Invitation sent. He now clicks "Add Dependent" for children', screen: 'AddDependentDialog with dependent information form', notes: 'Dependents are minors or adults without their own accounts.' },
      { step: 14, action: 'Pedro adds first child: Name, DOB, Relationship: Son', screen: 'Dependent form with full_name, date_of_birth, relationship_to_guardian', notes: 'Explain dependent types: Minor, Adult Dependent, Elderly Dependent.' },
      { step: 15, action: 'He adds dependent type: "Minor" and saves', screen: 'Success message, dependent appears in household member list', notes: 'Point out guardian relationship is recorded.' },
      { step: 16, action: 'Pedro repeats for second child (Daughter)', screen: 'Household now shows 2 dependents, 1 pending member (Carmen)', notes: 'Show the complete household structure.' },
      { step: 17, action: 'He navigates to "Verification Requests" to request residency verification', screen: 'UserVerificationRequests component with "Request Verification" button', notes: 'Explain residency verification = official proof of residence.' },
      { step: 18, action: 'Pedro clicks "Request Verification" for his primary address', screen: 'Verification request form with address selector, purpose field', notes: 'Show verification request options.' },
      { step: 19, action: 'He selects purpose: "Legal Documentation" and submits', screen: 'Request confirmation with reference number', notes: 'Explain the request goes to CAR verification queue.' },
      { step: 20, action: 'Request status shows: "Pending Verification"', screen: 'Request card with status badge, timeline', notes: 'Demonstrate tracking capability for verification requests.' }
    ],
    outcome: [
      'Pedro has declared his official residence (CAR) linked to verified NAR address',
      'Household "Familia Martínez" created with 4 members: Pedro (head), Carmen (pending), 2 children (dependents)',
      'Carmen will receive invitation to join household when she logs in',
      'Residency verification request submitted for legal purposes',
      'All family members can be located via household address for government services'
    ],
    presenterNotes: 'CAR registration connects citizens to their addresses for government services. Household management enables family grouping with proper roles (head, member, dependent). The verification request system provides official proof of residence for legal, banking, and administrative purposes. Note how privacy controls give citizens power over their data visibility.'
  },
  {
    id: 'passport-delivery-car',
    title: 'Delivery of Government Passport to Citizen Residence',
    icon: Truck,
    context: 'The Immigration Office needs to deliver a newly issued passport to citizen Elena Nguema at her registered CAR address. The delivery agent uses the system to verify the address, navigate to the location, and confirm delivery.',
    objective: 'Use CAR address data to deliver official government documents to citizen residence',
    actors: [
      { role: 'Delivery Agent', name: 'Roberto Obiang', type: 'primary' },
      { role: 'Citizen/Recipient', name: 'Elena Nguema', type: 'secondary' },
      { role: 'Immigration Office', name: 'System', type: 'secondary' }
    ],
    modules: ['Government Services Portal', 'Address Verification', 'Delivery Tracking', 'Proof of Delivery'],
    steps: [
      { step: 1, action: 'Immigration Office creates delivery order with Elena\'s UAC: GQ-BN-MLO-ELEN-0089', screen: 'Delivery order creation interface with UAC field', notes: 'Show how government agencies use UAC for citizen identification.' },
      { step: 2, action: 'System automatically retrieves CAR address details for the UAC', screen: 'Address details populated: Street, City, Region, GPS coordinates', notes: 'Explain automatic address lookup from CAR registry.' },
      { step: 3, action: 'Delivery agent Roberto logs in with his government credentials', screen: 'Authentication page, redirect to delivery dashboard', notes: 'Point out role-based access for delivery personnel.' },
      { step: 4, action: 'Roberto sees today\'s delivery assignments in his queue', screen: 'Delivery queue with pending items, Elena\'s passport at top', notes: 'Show delivery prioritization and scheduling.' },
      { step: 5, action: 'He clicks on Elena\'s delivery to view full details', screen: 'Delivery detail card: recipient name, UAC, full address, special instructions', notes: 'Demonstrate comprehensive delivery information.' },
      { step: 6, action: 'Roberto clicks "View Address on Map"', screen: 'Interactive map showing exact location with satellite imagery', notes: 'Show GPS precision for accurate delivery.' },
      { step: 7, action: 'He clicks "Navigate" to get directions', screen: 'Navigation integration opens (Apple Maps/Google Maps)', notes: 'Demonstrate cross-platform navigation support.' },
      { step: 8, action: 'Roberto drives to the location following GPS directions', screen: 'Mobile view with ETA countdown', notes: 'Note: Real-time tracking available for supervisors.' },
      { step: 9, action: 'Upon arrival, he clicks "Arrived at Location"', screen: 'Status update with GPS confirmation', notes: 'System verifies agent is within proximity of address.' },
      { step: 10, action: 'Roberto verifies the address matches physical location', screen: 'Address confirmation screen with UAC and street details', notes: 'Show visual confirmation step for delivery accuracy.' },
      { step: 11, action: 'He rings doorbell and Elena answers', screen: 'Recipient verification screen appears', notes: 'Explain identity verification before handover.' },
      { step: 12, action: 'Roberto asks Elena to verify her identity (National ID shown)', screen: 'ID verification checkbox: "Recipient identity confirmed"', notes: 'Point out security measures for sensitive documents.' },
      { step: 13, action: 'Elena confirms receipt by signing on the device screen', screen: 'Signature capture pad with "Sign here" prompt', notes: 'Show digital signature capture for proof of delivery.' },
      { step: 14, action: 'Roberto takes a photo of the delivery (optional)', screen: 'Camera capture with geolocation overlay', notes: 'Explain photo evidence for delivery confirmation.' },
      { step: 15, action: 'He clicks "Confirm Delivery" to complete', screen: 'Delivery confirmation dialog with summary', notes: 'Show final confirmation step.' },
      { step: 16, action: 'System records: delivery time, location, recipient signature', screen: 'Success screen: "Delivery completed successfully"', notes: 'Demonstrate complete audit trail.' },
      { step: 17, action: 'Elena receives SMS/email notification: "Your passport has been delivered"', screen: 'Notification preview showing delivery confirmation', notes: 'Point out automatic citizen notification.' },
      { step: 18, action: 'Immigration Office sees updated status: "Delivered"', screen: 'Back-office view with delivery status updated, timestamp, signature', notes: 'Show end-to-end tracking visibility for government.' }
    ],
    outcome: [
      'Passport delivered accurately to Elena\'s CAR-registered address',
      'Complete audit trail: who delivered, when, where, with proof',
      'Citizen received notification of successful delivery',
      'Immigration Office has digital proof of delivery with signature',
      'No failed deliveries due to incorrect address information'
    ],
    presenterNotes: 'This scenario demonstrates the real-world value of CAR addresses for government service delivery. The UAC provides a universal identifier that ensures documents reach the correct person at the correct location. Digital signatures and GPS verification create an audit trail that protects both the citizen and the government agency. This workflow eliminates failed deliveries and reduces administrative overhead.'
  },
  {
    id: 'emergency-call',
    title: 'Emergency Call Linked to a Digital Address',
    icon: AlertTriangle,
    context: 'Juan Pérez witnesses a traffic accident near Avenida de la Independencia in Malabo. He uses the emergency alert feature to report the incident with his precise location.',
    objective: 'Report an emergency with GPS coordinates linked to the address system',
    actors: [
      { role: 'Citizen/Reporter', name: 'Juan Pérez', type: 'primary' },
      { role: 'Emergency Dispatcher', name: 'System', type: 'secondary' }
    ],
    modules: ['Citizen Dashboard', 'Emergency Contacts', 'Emergency Alert System'],
    steps: [
      { step: 1, action: 'Juan opens the app (already logged in as citizen)', screen: 'UnifiedDashboard with citizen view', notes: 'Explain quick access for emergencies.' },
      { step: 2, action: 'He clicks "Emergency Contacts" in the navigation', screen: 'EmergencyContacts component with Police and Emergency cards', notes: 'Show the prominent emergency buttons.' },
      { step: 3, action: 'Two options display: "Police" and "Emergency Services"', screen: 'Emergency cards with phone call and location alert buttons', notes: 'Note both direct call AND digital alert options.' },
      { step: 4, action: 'Juan clicks "Send Location Alert" on Police card', screen: 'Dialog opens with geolocation request', notes: 'Explain this triggers GPS location capture.' },
      { step: 5, action: 'System requests location permission and captures coordinates', screen: 'Loading indicator with "Obtaining location..." message', notes: 'Show accuracy indicator (GPS precision).' },
      { step: 6, action: 'Location captured: Lat 3.7523, Lng 8.7741 (± 5m accuracy)', screen: 'Location confirmation with map preview', notes: 'Point out the high accuracy for emergency response.' },
      { step: 7, action: 'Juan types message: "Traffic accident, two vehicles, possible injuries"', screen: 'Textarea for emergency description', notes: 'Explain free-text for situation description.' },
      { step: 8, action: 'He clicks "Send Alert" button', screen: 'Confirmation dialog with warning about emergency use', notes: 'Show the confirmation step to prevent accidental alerts.' },
      { step: 9, action: 'Alert sends successfully', screen: 'Success screen with reference number', notes: 'Note: Juan receives reference number for tracking.' },
      { step: 10, action: 'System automatically looks up nearest NAR address', screen: 'Background process - links to UAC if nearby', notes: 'Explain automatic address association.' },
      { step: 11, action: 'Juan sees notifications panel with status updates', screen: 'ReporterNotifications component showing alert status', notes: 'Demonstrate real-time status tracking for reporters.' }
    ],
    outcome: [
      'Emergency alert created with precise GPS coordinates',
      'Incident auto-assigned to available dispatcher in Malabo',
      'Reporter has reference number and can track response',
      'System linked alert to nearest verified address (UAC)'
    ],
    presenterNotes: 'The emergency alert system captures precise GPS coordinates and automatically routes to the appropriate dispatcher based on location. Citizens receive real-time updates on response progress.'
  },
  {
    id: 'dispatcher-assignment',
    title: 'Dispatcher Assigns Emergency Units',
    icon: Radio,
    context: 'Dispatcher Elena García receives Juan\'s emergency alert at the police command center. She must assign responding units and coordinate the response.',
    objective: 'Assign and coordinate field units to respond to an emergency incident',
    actors: [
      { role: 'Police Dispatcher', name: 'Elena García', type: 'primary' },
      { role: 'Field Unit', name: 'Patrol Unit Alpha-7', type: 'secondary' }
    ],
    modules: ['PoliceDashboard', 'IncidentList', 'DispatcherCommunications', 'Unit Assignment'],
    steps: [
      { step: 1, action: 'Elena is logged in at police command center', screen: 'PoliceDashboard with "Command Center" tab active', notes: 'Show the dispatcher-specific interface.' },
      { step: 2, action: 'Sound notification plays (priority-based alert tone)', screen: 'Toast notification appears with incident summary', notes: 'Demonstrate audio alerts - different tones for priority levels.' },
      { step: 3, action: 'New incident appears in incident list with "PENDING" status', screen: 'IncidentList with new card highlighted in amber', notes: 'Point out the priority badge (Critical/High/Standard).' },
      { step: 4, action: 'Incident shows: Traffic Accident, Priority 2 (High)', screen: 'Incident card with type, priority, location summary', notes: 'Explain auto-classification based on emergency type.' },
      { step: 5, action: 'Elena clicks the incident to view full details', screen: 'IncidentDetailDialog opens with tabs', notes: 'Show comprehensive incident information.' },
      { step: 6, action: 'She reviews the Map tab showing exact incident location', screen: 'IncidentMap with incident marker and nearby units', notes: 'Point out unit positions on map for proximity assignment.' },
      { step: 7, action: 'Elena sees nearby units: Alpha-7 (Available, 0.8km)', screen: 'Unit overlay on map with status badges', notes: 'Explain real-time unit status from GPS tracking.' },
      { step: 8, action: 'She clicks "Assign Units" button', screen: 'Assignment dialog with available units checkbox list', notes: 'Show unit selection interface.' },
      { step: 9, action: 'Elena selects "Alpha-7" and adds dispatch note', screen: 'Assignment form with notes textarea', notes: 'Note dispatcher can add context for field units.' },
      { step: 10, action: 'She clicks "Dispatch"', screen: 'System sends assignment, updates incident status', notes: 'Show status change to "DISPATCHED".' },
      { step: 11, action: 'Elena opens "Communications" tab (Inbox/Sent/History)', screen: 'DispatcherCommunications with threaded messages', notes: 'Demonstrate the three-tab communication structure.' },
      { step: 12, action: 'She sends quick message using radio code "10-23 En Route"', screen: 'Quick radio code buttons below compose area', notes: 'Show how radio codes speed up communication.' },
      { step: 13, action: 'Message appears in Sent tab with timestamp', screen: 'Sent messages list with delivery confirmation', notes: 'Point out the message threading by unit.' }
    ],
    outcome: [
      'Incident assigned within 45 seconds of alert receipt',
      'Field unit Alpha-7 receives notification with location details',
      'Dispatcher can track unit progress on map',
      'All communications logged for audit trail'
    ],
    presenterNotes: 'The threaded communications system with sound notifications ensures dispatchers never miss critical alerts. Radio code quick buttons speed up standard communications. The three-tab structure (Inbox/Sent/History) keeps communications organized.'
  },
  {
    id: 'field-responder',
    title: 'Field Responders Use Address Data on the Ground',
    icon: MapPin,
    context: 'Officer Miguel Rodríguez of Unit Alpha-7 receives the dispatch assignment on his mobile device. He navigates to the scene, manages the incident, and captures evidence.',
    objective: 'Navigate to incident, manage response, and capture evidence with GPS data',
    actors: [
      { role: 'Police Operator', name: 'Officer Miguel Rodríguez', type: 'primary' },
      { role: 'Dispatcher', name: 'Elena García', type: 'secondary' }
    ],
    modules: ['PoliceDashboard (Field tab)', 'UnitFieldDashboard', 'Evidence Capture', 'Navigation'],
    steps: [
      { step: 1, action: 'Miguel opens the app on his mobile device', screen: 'PoliceDashboard auto-redirects to Field tab', notes: 'Explain role-based tab selection.' },
      { step: 2, action: 'His UnitFieldDashboard shows current assignment notification', screen: 'Assignment card with incident details, Accept button', notes: 'Point out mobile-optimized interface.' },
      { step: 3, action: 'He clicks "Accept Assignment" button', screen: 'Status updates to "Dispatched", timer starts', notes: 'Show the status workflow: Accept → En Route → On Scene.' },
      { step: 4, action: 'Miguel clicks "Navigate" button to get directions', screen: 'Navigation integration opens native maps', notes: 'Demonstrate cross-platform navigation.' },
      { step: 5, action: 'System shows: "Distance: 0.8km, ETA: 3 minutes"', screen: 'Distance estimate from current GPS to incident', notes: 'Note real-time distance calculation.' },
      { step: 6, action: 'Native maps app opens with route to incident coordinates', screen: 'External map app (iOS/Android)', notes: 'Show seamless handoff to navigation.' },
      { step: 7, action: 'While en route, Miguel updates status: clicks "En Route"', screen: 'Status button changes incident to "Responding"', notes: 'Explain automatic GPS timestamp logging.' },
      { step: 8, action: 'Arrival: Miguel clicks "On Scene" button', screen: 'Status changes to "On Scene"', notes: 'Point out response time tracking starts now.' },
      { step: 9, action: 'He uses "Capture Evidence" button to photograph the scene', screen: 'Camera interface opens with GPS overlay', notes: 'Show geotagged photo capture.' },
      { step: 10, action: 'Miguel takes photos of: accident scene, vehicle damage', screen: 'Photo capture with description field', notes: 'Explain evidence categorization.' },
      { step: 11, action: 'Photos upload to secure storage with GPS coordinates', screen: 'Upload progress indicator, success confirmation', notes: 'Note: Evidence stored in Supabase storage bucket.' },
      { step: 12, action: 'Miguel needs additional resources, clicks "Request Resources"', screen: 'RequestResourcesDialog opens with comprehensive form', notes: 'Show the detailed resource request options.' },
      { step: 13, action: 'He selects: Type: Medical, Urgency: High, Quantity: 1 ambulance', screen: 'Form fields for resource type, urgency, quantity', notes: 'Demonstrate the detailed request workflow.' },
      { step: 14, action: 'Resource request sent, visible to dispatchers', screen: 'Confirmation message', notes: 'Explain resource coordination workflow.' },
      { step: 15, action: 'Critical situation: Miguel presses "OFFICER DOWN" button', screen: 'EmergencyBackupButton triggers immediate broadcast', notes: 'CRITICAL: Explain this broadcasts to ALL police staff immediately.' },
      { step: 16, action: 'Incident resolved: Miguel clicks "Mark Complete"', screen: 'Resolution dialog with notes field', notes: 'Show incident closure workflow.' }
    ],
    outcome: [
      'Officer navigated directly to scene using digital address coordinates',
      'Evidence captured with GPS metadata for legal chain of custody',
      'Response time automatically tracked: Dispatch → Arrival = 3 minutes',
      'All actions logged for supervisor review and audit'
    ],
    presenterNotes: 'Field officers have everything they need on mobile: navigation to exact coordinates, evidence capture with geolocation, status updates, and emergency backup requests. The "Officer Down" button provides critical safety functionality with immediate system-wide broadcast.'
  },
  {
    id: 'supervisor-monitoring',
    title: 'Supervisor Monitors and Reports',
    icon: BarChart3,
    context: 'Captain Isabel Ruiz, Police Supervisor, reviews the day\'s operations including the traffic accident response. She monitors unit performance and generates reports for command staff.',
    objective: 'Monitor operations, approve backup requests, and generate performance reports',
    actors: [
      { role: 'Police Supervisor', name: 'Captain Isabel Ruiz', type: 'primary' }
    ],
    modules: ['PoliceDashboard', 'UnitLeadershipDashboard', 'PoliceAnalytics', 'Audit Logs'],
    steps: [
      { step: 1, action: 'Captain Ruiz logs in and sees supervisor dashboard', screen: 'PoliceDashboard with Coordination tab available', notes: 'Show supervisor-specific navigation.' },
      { step: 2, action: 'Overview shows: 12 Active Incidents, 8 Available Units, Avg Response: 4.2 min', screen: 'Stats cards with real-time operational metrics', notes: 'Point out real-time data from database.' },
      { step: 3, action: 'She clicks "Units Overview" to see all unit status', screen: 'UnitsOverview component with unit cards and status', notes: 'Show unit distribution across statuses.' },
      { step: 4, action: 'Captain reviews "Backup Notifications" panel', screen: 'BackupNotificationsPanel showing pending/approved requests', notes: 'Demonstrate backup approval authority.' },
      { step: 5, action: 'She sees a pending backup request from Unit Bravo-3', screen: 'Request card with Approve/Deny/Escalate buttons', notes: 'Point out tiered approval: Supervisors approve, Dispatchers coordinate.' },
      { step: 6, action: 'Captain approves the backup request with note', screen: 'Approval dialog with notes field', notes: 'Show approval workflow and notification to requesting unit.' },
      { step: 7, action: 'She opens "Performance Analytics" tab', screen: 'UnitPerformanceAnalytics with date range selector', notes: 'Demonstrate customizable date ranges.' },
      { step: 8, action: 'She selects date range: "Last 7 Days" using calendar picker', screen: 'Date picker component, analytics refresh', notes: 'Show dynamic data loading.' },
      { step: 9, action: 'Charts show: Response times, Incidents by type, Unit utilization', screen: 'Recharts visualizations with bar/line graphs', notes: 'Point out the visual analytics dashboard.' },
      { step: 10, action: 'Captain drills into the traffic accident incident', screen: 'IncidentDetailDialog with full timeline', notes: 'Show complete incident history.' },
      { step: 11, action: 'She reviews the Evidence tab showing captured photos', screen: 'Evidence gallery with photos, timestamps, locations', notes: 'Demonstrate evidence review for supervisors.' },
      { step: 12, action: 'Captain clicks "Audit Logs" tab', screen: 'AuditLogViewer with filterable log entries', notes: 'Show transparency and accountability.' },
      { step: 13, action: 'Logs show all actions: dispatch, status updates, evidence uploads', screen: 'Log entries with actor, action, timestamp', notes: 'Point out complete audit trail.' },
      { step: 14, action: 'She exports the day\'s report using "Export CSV" button', screen: 'CSV download containing incident data', notes: 'Show reporting capability for command staff.' }
    ],
    outcome: [
      'Supervisor has real-time visibility into all operations',
      'Backup requests handled with proper authority hierarchy',
      'Performance metrics available for resource planning',
      'Complete audit trail ensures accountability',
      'Exportable reports for command briefings'
    ],
    presenterNotes: 'Supervisors have full oversight with approval authority for backup requests. Real-time analytics enable data-driven decisions. The audit log ensures complete transparency - every action is tracked with who, what, and when.'
  }
];

export function DemoScriptDocument() {
  const { t } = useTranslation('common');
  const [activeScenario, setActiveScenario] = useState<string>(scenarios[0].id);
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  const currentScenario = scenarios.find(s => s.id === activeScenario) || scenarios[0];

  const toggleNote = (stepNumber: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedNotes(newExpanded);
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, contentWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 2;
    };

    const addNewPage = () => {
      pdf.addPage();
      yPosition = margin;
    };

    // Title Page
    pdf.setFillColor(25, 55, 95);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ConnectNation Address System', margin, 30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Complete Demo Script Document', margin, 42);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 52);
    
    yPosition = 75;
    pdf.setTextColor(0, 0, 0);

    // Table of Contents
    addText('Table of Contents', 16, true);
    yPosition += 5;
    scenarios.forEach((scenario, index) => {
      addText(`${index + 1}. ${scenario.title}`, 11, false, [50, 50, 150]);
    });

    // Each Scenario
    scenarios.forEach((scenario, scenarioIndex) => {
      addNewPage();
      
      // Scenario Header
      pdf.setFillColor(240, 245, 250);
      pdf.rect(margin - 5, yPosition - 5, contentWidth + 10, 25, 'F');
      addText(`Scenario ${scenarioIndex + 1}: ${scenario.title}`, 14, true, [25, 55, 95]);
      yPosition += 5;

      // Context & Objective
      addText('Context:', 11, true);
      addText(scenario.context, 10);
      yPosition += 3;
      addText('Objective:', 11, true);
      addText(scenario.objective, 10);
      yPosition += 5;

      // Actors
      addText('Actors:', 11, true);
      scenario.actors.forEach(actor => {
        addText(`• ${actor.name} (${actor.role}) - ${actor.type === 'primary' ? 'Primary' : 'Secondary'}`, 10);
      });
      yPosition += 3;

      // Modules
      addText('Modules Used:', 11, true);
      addText(scenario.modules.join(' → '), 10, false, [70, 70, 70]);
      yPosition += 5;

      // Steps
      addText('Step-by-Step Flow:', 12, true);
      yPosition += 3;
      
      scenario.steps.forEach(step => {
        if (yPosition > pageHeight - 40) {
          addNewPage();
        }
        
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin - 2, yPosition - 3, contentWidth + 4, 6, 'F');
        addText(`Step ${step.step}: ${step.action}`, 10, true);
        addText(`Screen: ${step.screen}`, 9, false, [80, 80, 80]);
        addText(`Presenter Note: ${step.notes}`, 9, false, [100, 100, 100]);
        yPosition += 2;
      });

      yPosition += 5;

      // Outcomes
      addText('Outcomes:', 11, true);
      scenario.outcome.forEach(item => {
        addText(`✓ ${item}`, 10, false, [34, 139, 34]);
      });
      yPosition += 3;

      // Presenter Notes
      pdf.setFillColor(255, 248, 220);
      pdf.rect(margin - 2, yPosition - 2, contentWidth + 4, 20, 'F');
      addText('Key Presenter Message:', 11, true, [139, 69, 19]);
      addText(`"${scenario.presenterNotes}"`, 10, false, [100, 80, 60]);
    });

    // Footer on last page
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('ConnectNation Digital Address System - Demo Script Document', margin, pageHeight - 10);
    pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - 25, pageHeight - 10);

    pdf.save('ConnectNation_Demo_Script.pdf');
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header - Hidden in print */}
      <header className="sticky top-0 z-50 bg-gov-header text-white p-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold">Demo Script Document</h1>
              <p className="text-sm text-white/70">ConnectNation Address System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-white border-white/30 hover:bg-white/10">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="secondary" size="sm" onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 print:p-0">
        <div className="flex flex-col lg:flex-row gap-6 print:block">
          {/* Sidebar Navigation - Hidden in print */}
          <aside className="lg:w-72 shrink-0 print:hidden">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <nav className="space-y-1 p-2">
                    {scenarios.map((scenario, index) => {
                      const Icon = scenario.icon;
                      return (
                        <button
                          key={scenario.id}
                          onClick={() => {
                            setActiveScenario(scenario.id);
                            setHighlightedStep(null);
                          }}
                          className={cn(
                            "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                            activeScenario === scenario.id
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-muted"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-md shrink-0",
                            activeScenario === scenario.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">Scenario {index + 1}</p>
                            <p className="text-sm font-medium leading-tight">{scenario.title}</p>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main ref={contentRef} className="flex-1 min-w-0 space-y-6 print:space-y-4">
            {/* Print Header */}
            <div className="hidden print:block mb-8">
              <h1 className="text-2xl font-bold text-center">ConnectNation Address System</h1>
              <p className="text-center text-gray-600">Complete Demo Script Document</p>
              <p className="text-center text-sm text-gray-400 mt-2">Generated: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Scenario Header */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader className="bg-gradient-to-r from-gov-header/5 to-transparent print:bg-gray-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gov-header text-white print:bg-gray-800">
                    <currentScenario.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      Scenario {scenarios.findIndex(s => s.id === activeScenario) + 1} of {scenarios.length}
                    </Badge>
                    <CardTitle className="text-xl lg:text-2xl">{currentScenario.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Context & Objective */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Target className="h-4 w-4" />
                      Context
                    </div>
                    <p className="text-sm leading-relaxed">{currentScenario.context}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      Objective
                    </div>
                    <p className="text-sm leading-relaxed">{currentScenario.objective}</p>
                  </div>
                </div>

                <Separator />

                {/* Actors & Modules */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      Actors
                    </div>
                    <div className="space-y-2">
                      {currentScenario.actors.map((actor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant={actor.type === 'primary' ? 'default' : 'secondary'} className="text-xs">
                            {actor.type === 'primary' ? 'Primary' : 'Secondary'}
                          </Badge>
                          <span className="text-sm font-medium">{actor.name}</span>
                          <span className="text-sm text-muted-foreground">({actor.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Monitor className="h-4 w-4" />
                      Modules Used
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentScenario.modules.map((module, index) => (
                        <React.Fragment key={index}>
                          <Badge variant="outline" className="text-xs">{module}</Badge>
                          {index < currentScenario.modules.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Step-by-Step Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentScenario.steps.map((step) => (
                  <Collapsible key={step.step} open={expandedNotes.has(step.step)}>
                    <div
                      className={cn(
                        "rounded-lg border transition-all cursor-pointer",
                        highlightedStep === step.step
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      )}
                      onClick={() => setHighlightedStep(step.step === highlightedStep ? null : step.step)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                            highlightedStep === step.step
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {step.step}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="font-medium">{step.action}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Monitor className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{step.screen}</span>
                            </div>
                          </div>
                          <CollapsibleTrigger asChild onClick={(e) => { e.stopPropagation(); toggleNote(step.step); }}>
                            <Button variant="ghost" size="sm" className="shrink-0">
                              <Lightbulb className="h-4 w-4 mr-1" />
                              Notes
                              {expandedNotes.has(step.step) ? (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 ml-1" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-0">
                          <div className="ml-12 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              <span className="font-medium">Presenter Note: </span>
                              {step.notes}
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Outcomes */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Outcomes & Value Delivered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentScenario.outcome.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Presenter Key Message */}
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 print:bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Lightbulb className="h-5 w-5" />
                  Key Presenter Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-sm italic text-amber-900 dark:text-amber-100 border-l-4 border-amber-400 pl-4">
                  "{currentScenario.presenterNotes}"
                </blockquote>
              </CardContent>
            </Card>

            {/* Navigation Buttons - Hidden in print */}
            <div className="flex justify-between pt-4 print:hidden">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = scenarios.findIndex(s => s.id === activeScenario);
                  if (currentIndex > 0) {
                    setActiveScenario(scenarios[currentIndex - 1].id);
                    setHighlightedStep(null);
                  }
                }}
                disabled={scenarios.findIndex(s => s.id === activeScenario) === 0}
              >
                ← Previous Scenario
              </Button>
              <Button
                onClick={() => {
                  const currentIndex = scenarios.findIndex(s => s.id === activeScenario);
                  if (currentIndex < scenarios.length - 1) {
                    setActiveScenario(scenarios[currentIndex + 1].id);
                    setHighlightedStep(null);
                  }
                }}
                disabled={scenarios.findIndex(s => s.id === activeScenario) === scenarios.length - 1}
              >
                Next Scenario →
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
