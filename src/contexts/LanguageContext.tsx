import React, { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English-only translations
const translations: Record<string, string> = {
  // Emergency Management System
  emergencyManagement: 'Emergency Management',
  policeEmergencyServices: 'Police and Emergency Services',
  integratedEmergencyResponse: 'Integrated emergency response platform connecting police, emergency services, and citizens for rapid incident management.',
  realtimeIncidentReporting: 'Real-time incident reporting',
  gpsBasedUnitDispatch: 'GPS-based unit dispatch',
  multiChannelCommunications: 'Multi-channel communications',
  analyticsResponseTracking: 'Analytics and response tracking',

  // ConnectEG Branding
  accessPlatform: 'Access Platform',
  learnMore: 'Learn More',
  emergency: 'Emergency',
  digitalPlatform: 'Digital Platform',
  connectEGPlatform: 'ConnectEG Platform',
  connectEG: 'ConnectEG',
  connectEGDescription: 'Unified platform for digital addressing and emergency management in Equatorial Guinea.',
  connectingCitizensServices: 'Connecting citizens, addresses, and emergency services',
  innovativeTechnology: 'through innovative technology and seamless integration.',
  
  // Core Modules
  dualCorePlatform: 'Dual Core Platform',
  coreFunctionalities: 'Core Functionalities',
  twoIntegratedSystems: 'Two integrated systems working together to modernize Equatorial Guinea\'s digital infrastructure and emergency response capabilities.',
  
  // Address Registry System
  addressRegistrySystem: 'Address Registry System',
  digitalAddressingInfrastructure: 'Digital Addressing Infrastructure',
  comprehensiveDigitalAddressing: 'Comprehensive digital addressing system for registering, verifying, and managing addresses across Equatorial Guinea.',
  gpsBasedRegistration: 'GPS-based registration',
  multiLevelVerification: 'Multi-level verification workflow',
  smartSearchDiscovery: 'Smart search and discovery',
  digitalDocumentationQR: 'Digital documentation and QR codes',
  
  // Navigation and Main Page
  overview: 'Overview',
  about: 'About',
  help: 'Help',
  manual: 'Manual',
  login: 'Login',
  helpAndSupport: 'Help and Support',
  platformUserManual: 'Platform User Manual',
  loginRequired: 'Login Required',
  goToDashboard: 'Go to Dashboard',
  goToLoginPage: 'Go to Login Page',
  dashboard: 'Dashboard',
  enterSystem: 'Enter System',
  copyrightBiakam: '© 2025 BIAKAM - ConnectEG Platform for the Republic of Equatorial Guinea',
  footerDescription: 'Unified Digital Addressing and Emergency Management • Connecting Citizens, Services, and Safety',
  
  // About section
  ourMission: 'Our Mission',
  ourVision: 'Our Vision',
  keyPartners: 'Key Partners',
  ministryOfInterior: 'Ministry of Interior',
  governmentOversightPolicy: 'Government oversight and policy',
  localGovernments: 'Local Governments',
  provincialImplementation: 'Provincial implementation',
  technologyPartners: 'Technology Partners',
  platformDevelopmentMaintenance: 'Platform development and maintenance',
  missionDescription: 'To create a comprehensive, accurate, and accessible national address system that serves as the foundation for improving public services, economic development, and quality of life for all citizens of Equatorial Guinea.',
  visionDescription: 'To be the leading digital address infrastructure in Central Africa, enabling efficient service delivery, supporting business growth, and connecting every location in Equatorial Guinea to the digital economy.',
  
  // Help section
  findAnswersQuestions: 'Find answers to common questions and get help using the platform.',
  frequentlyAskedQuestions: 'Frequently Asked Questions',
  howRegisterNewAddress: 'How do I register a new address?',
  howRegisterAnswer: 'Log into your account, navigate to "Add Address", complete the required information including coordinates, and submit for verification.',
  howLongVerification: 'How long does verification take?',
  verificationTimeAnswer: 'Address verification typically takes 3-5 business days, depending on location and submission complexity.',
  canUpdateExistingAddress: 'Can I update an existing address?',
  updateAddressAnswer: 'Yes, you can request updates to existing addresses. Changes must be verified by authorized personnel before approval.',
  contactSupport: 'Contact Support',
  emailSupport: 'Email Support',
  phoneSupport: 'Phone Support',
  officeHours: 'Office Hours',
  mondayFridayHours: 'Monday - Friday: 8:00 AM - 5:00 PM',
  saturdayHours: 'Saturday: 9:00 AM - 1:00 PM',
  
  // Manual section
  comprehensiveGuideUsing: 'Comprehensive guide to using the Address Registry and Emergency Management systems.',
  gettingStarted: 'Getting Started',
  accountRegistration: '1. Account Registration',
  createAccountEmailPassword: 'Create an account using your email address and a secure password. Verify your email to activate your account.',
  profileSetup: '2. Profile Setup',
  completeProfilePersonalInfo: 'Complete your profile with accurate personal information. This helps us verify your identity for address submissions.',
  addressRegistrationProcess: 'Address Registration Process',
  stepLocationInformation: 'Step 1: Location Information',
  selectCorrectProvinceCity: 'Select the correct province and city, then provide street and building details.',
  stepCoordinates: 'Step 2: Coordinates',
  useCurrentLocationButton: 'Use the "Get Current Location" button or manually enter GPS coordinates. Precise coordinates are essential for verification.',
  stepDocumentation: 'Step 3: Documentation',
  uploadClearPhoto: 'Upload a clear photo of the location and provide any additional description that helps identify the address.',
  stepVerification: 'Step 4: Verification',
  submitRequestReview: 'Submit your request for review. Field agents will verify the location and registrars will approve the final address code.',
  addressRegistryUserRoles: 'Address Registry User Roles',
  citizens: 'Citizens',
  citizensDescription: 'Can search addresses, submit new address requests, and view their submissions.',
  fieldAgents: 'Field Agents',
  fieldAgentsDescription: 'Verify address locations on-site and approve or reject submissions based on field visits.',
  verifiers: 'Verifiers',
  verifiersDescription: 'Review field agent reports and perform additional verification if needed.',
  registrars: 'Registrars',
  registrarsDescription: 'Generate official UAC codes and publish verified addresses to the national registry.',
  
  // Additional Features
  roleBasedAccess: 'Role-Based Access',
  advancedRoleManagement: 'Advanced role management with granular permissions for different user types and departments.',
  digitalDocumentationFeature: 'Digital Documentation',
  automatedDocumentGeneration: 'Automated document generation, QR code integration, and digital certificate management.',
  realtimeAnalyticsFeature: 'Real-time Analytics',
  comprehensiveReporting: 'Comprehensive reporting and analytics for addressing operations and emergency response.',
  multiLanguageFeature: 'Multi-language',
  fullPlatformLocalization: 'Full platform localization supporting Spanish, French, and Portuguese for national accessibility.',
  
  // Platform Objectives
  strategicGoals: 'Strategic Goals',
  platformObjectives: 'Platform Objectives',
  transformingEquatorialGuinea: 'Transforming Equatorial Guinea through integrated digital addressing and emergency management systems that enhance citizen services and public safety.',
  
  // Digital Infrastructure
  digitalInfrastructure: 'Digital Infrastructure',
  establishComprehensiveAddressing: 'Establish comprehensive digital addressing infrastructure to improve service delivery, logistics, and economic development across all regions.',
  
  // Public Safety Enhancement  
  publicSafetyEnhancement: 'Public Safety Enhancement',
  modernizeEmergencyResponse: 'Modernize emergency response capabilities with real-time incident management, GPS-based dispatch, and integrated communication systems.',
  
  // Citizen Empowerment
  citizenEmpowerment: 'Citizen Empowerment',
  provideDirectAccess: 'Provide citizens with direct access to government services, emergency assistance, and digital documentation through unified platform access.',
  
  aboutConnectEG: 'The ConnectEG Platform is a BIAKAM initiative to modernize Equatorial Guinea\'s address infrastructure and emergency management systems, enhancing nationwide service delivery.',
  
  // Navigation
  platformCapabilities: 'PLATFORM CAPABILITIES',
  advancedFeatures: 'Advanced Features',
  featuresSubtitle: 'Cutting-edge technology meets practical solutions for comprehensive address management across the nation',
  
  // Feature Cards
  smartSearch: 'Smart Search',
  smartSearchDesc: 'AI-powered address lookup with real-time filtering and geolocation capabilities for lightning-fast address discovery.',
  realTimeFiltering: 'real-time filtering',
  
  quickRegistration: 'Quick Registration',
  quickRegistrationDesc: 'with GPS coordinates, photo documentation, and automatic address standardization.',
  oneClickRegistration: 'One-click registration',
  
  secureVerification: 'Secure Verification',
  secureVerificationDesc: 'ensuring 100% accuracy and compliance with national standards.',
  multiLayerVerification: 'Multi-layer verification',
  
  advancedRoleSystem: 'Advanced Role System',
  roleSystemDesc: 'with role-based access control for administrators, registrars, and field agents.',
  granularPermissions: 'Granular permissions',
  
  digitalDocumentation: 'Digital Documentation',
  digitalDocDesc: 'and reports with digital signatures and QR verification codes.',
  officialCertificates: 'official certificates',
  
  realtimeAnalytics: 'Real-time Analytics',
  analyticsDesc: 'and comprehensive reporting for tracking system performance metrics.',
  liveDashboards: 'Live dashboards',
  
  // Objectives
  nationalImpact: 'NATIONAL IMPACT',
  systemObjectives: 'System Objectives',
  objectivesSubtitle: 'Driving transformation across Equatorial Guinea through innovative address infrastructure',
  
  enhancedServiceDelivery: 'Enhanced Service Delivery',
  serviceDeliveryDesc: 'Revolutionize public services through precise addressing for postal delivery, emergency response, utilities, and government services nationwide.',
  preciseAddressing: 'precise addressing',
  
  economicAcceleration: 'Economic Acceleration',
  economicDesc: 'and e-commerce expansion with reliable delivery systems and location-based services.',
  businessGrowth: 'business growth',
  
  // Smart Urban Planning
  smartUrbanPlanning: 'Smart Urban Planning',
  smartUrbanPlanningDesc: 'Leverage precise address data for urban development, infrastructure planning, and city management with data-driven insights.',
  
  // Data Excellence
  dataExcellence: 'Data Excellence',
  dataExcellenceDesc: 'Maintain the highest standards of data quality, security, and integrity across all address registry operations.',
  
  loading: 'Loading...',
  
  // Authentication
  nationalAddressRegistry: 'Unified Address System and Emergency Management',
  secureAccess: 'Secure Access',
  accessNationalSystem: 'Access ConnectEG',
  signIn: 'Sign In',
  signUp: 'Sign Up',
  emailAddress: 'Email Address',
  password: 'Password',
  fullName: 'Full Name',
  confirmPassword: 'Confirm Password',
  enterEmail: 'Enter your email',
  enterPassword: 'Enter your password',
  enterFullName: 'Enter your full name',
  createPassword: 'Create a password',
  confirmYourPassword: 'Confirm your password',
  signingIn: 'Signing In...',
  creatingAccount: 'Creating Account...',
  createAccount: 'Create Account',
  governmentEG: 'Biakam',
  secureReliableNationwide: 'Secure • Reliable • Nationwide',
  
  // 404 Page
  pageNotFound: 'Page not found',
  oopsPageNotFound: 'Oops! Page not found',
  returnToHome: 'Return to Home',
  
  // Citizen Dashboard
  citizenPortal: 'Citizen Portal',
  searchVerifiedAddresses: 'Search verified addresses and submit requests',
  searchAddresses: 'Search Addresses',
  findVerifiedAddresses: 'Find verified addresses in the national database',
  searchDatabase: 'Search Database',
  submitRequest: 'Submit Request',
  submitNewRequest: 'Submit a new address registration request',
  newRequest: 'New Request',
  addressStatus: 'Address Status',
  trackRequestStatus: 'Track the status of your submitted requests',
  checkStatus: 'Check Status',
  importantInformation: 'Important Information',
  allSearchesVerified: '• All address searches show only verified addresses',
  personalInfoProtected: '• Personal information is protected and redacted',
  coordinatesApproximate: '• Coordinates are approximate for privacy',
  submitRequestsNew: '• Submit requests for new address verification',
  submitAddressRequest: 'Submit Address Request',
  addressRequestStatus: 'Address Request Status',
  contactEmergencyServices: 'Get immediate help when you need it most',
  
  // Emergency contacts
  emergencyContacts: 'Emergency Contacts',
  police: 'Police',
  policeDescription: 'Emergency police assistance',
  emergencyServices: 'Emergency Services',
  emergencyServicesDescription: 'Fire, medical, and other emergencies',
  call: 'Call',
  sendLocationAlert: 'Send Location Alert',
  emergencyAlert: 'Emergency Alert',
  sendLocationToServices: 'Send your location to {service}',
  automaticallyGettingLocation: 'Automatically getting your location...',
  locationNeededForAlert: 'Location is needed to send an alert',
  locationDetected: 'Location detected',
  emergencyMessage: 'Emergency Message',
  describeEmergency: 'Describe the emergency situation...',
  gettingLocation: 'Getting location...',
  retryLocation: 'Retry location',
  sending: 'Sending...',
  sent: 'Sent!',
  sendAlert: 'Send Alert',
  emergencyAlertSent: 'Emergency alert sent successfully',
  emergencyAlertFailed: 'Failed to send emergency alert',
  locationRequired: 'Location is required to send alert',
  
  // Police system translations
  policeCommandCenter: 'Police Command Center',
  emergencyIncidents: 'Emergency Incidents',
  dispatchCenter: 'Dispatch Center',
  
  // Police Dashboard - Additional translations
  unitLead: 'Unit Lead',
  myFieldOperations: 'My Field Operations',
  fieldOperations: 'Field Operations',
  manageAssignments: 'Manage assignments, unit status, and field communications',
  manageUnitAssignments: 'Manage unit assignments and field activities',
  returnToFieldOperations: 'Return to Field Operations',
  active: 'Active',
  units: 'Units',
  response: 'Response',
  liveIncidentMap: 'Live Incident Map',
  myUnit: 'My Unit',
  unitManagement: 'Unit Management',
  communications: 'Communications',
  backup: 'Backup',
  backupRequests: 'Backup Requests',
  backupNotifications: 'Backup Notifications',
  coordinationCenter: 'Coordination Center',
  availableUnits: 'Available Units',
  avgResponseTime: 'Avg Response Time',
  coordinationActions: 'Coordination Actions',
  supervisorCoordinationTools: 'Supervisor coordination tools',
  manageMyUnits: 'Manage My Units',
  requestRegionalBackup: 'Request Regional Backup',
  systemHealth: 'System Health',
  viewSystemHealthStats: 'View system health and stats',
  responseTimeAnalytics: 'Response Time Analytics',
  admin: 'Admin',
  
  myArea: 'My Area',
  unitsOverview: 'Units Overview',
  activeIncidents: 'Active Incidents',
  allStatus: 'All Status',
  reported: 'Reported',
  dispatched: 'Dispatched',
  responding: 'Responding',
  onScene: 'On Scene',
  resolved: 'Resolved',
  allPriority: 'All Priority',
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  priority: 'Priority',
  status: 'Status',
  assignUnit: 'Assign Unit',
  updateStatus: 'Update Status',
  viewDetails: 'View Details',
  description: 'Description',
  location: 'Location',
  assignedUnits: 'Assigned Units',
  
  // Status translations
  available: 'Available',
  busy: 'Busy',
  onBreak: 'On Break',
  offline: 'Offline',
  
  // Admin panel translations  
  rolePermissionManagement: 'Role & Permission Management',
  pleaseLogInToAccess: 'Please log in to access role management features',
  loadingRoleInformation: 'Loading role information...',
  manageUserRoles: 'Manage user roles and permissions for the National Digital Address System',
  roleManagement: 'Role Management',
  permissions: 'Permissions',
  workflows: 'Workflows',
  userManagement: 'User Management',
  uacSystem: 'UAC System',
  apiWebhooks: 'API & Webhooks',
  
  // Analytics translations
  reportsAnalytics: 'Reports & Analytics',
  addressRegistrationInsights: 'Address registration and verification insights',
  periodUpdated: 'Period Updated',
  analyticsUpdatedFor: 'Analytics updated for',
  lastSevenDays: 'last 7 days',
  lastThirtyDays: 'last 30 days',
  lastNinetyDays: 'last 90 days',
  lastYear: 'last year',
  selectPeriod: 'Select period',
  exportCSV: 'Export CSV',
  totalAddresses: 'Total Addresses',
  verified: 'Verified',
  pending: 'Pending',
  publicAddresses: 'Public',
  verificationRate: 'verification rate',
  awaitingVerification: 'Awaiting verification',
  publiclyAccessible: 'Publicly accessible',
  restrictedAccess: 'Restricted access',
  regionalAnalysis: 'Regional Analysis',
  addressTypes: 'Address Types',
  trends: 'Trends',
  addressesByRegion: 'Addresses by Region',
  totalAndVerifiedPerRegion: 'Total and verified addresses per region',
  regionalSummary: 'Regional Summary',
  keyStatisticsByRegion: 'Key statistics by region',
  totalAddressesCount: 'total addresses',
  addressTypeDistribution: 'Address Type Distribution',
  totalByType: 'Total by type',
  registrationTrends: 'Registration Trends',
  addressRegistrationOverTime: 'Address registration over time',
  newAddresses: 'New Addresses',
  verifiedAddresses: 'Verified Addresses',
  unitStatusUpdated: 'Unit Status Updated',
  dispatch: 'Dispatch',
  field: 'Field',
  supervisor: 'Supervisor',
  emergencyResponse: 'Emergency Response',
  accessDenied: 'Access Denied',
  private: 'Private',
  
  // Dashboard sections
  adminDashboard: 'Admin Dashboard',
  manageUsersRoles: 'Manage users, roles, and system configurations',
  totalUsers: 'Total Users',
  fromLastMonth: '+12% from last month',
  activeRoles: 'Active Roles',
  pendingApprovals: 'Pending Approvals',
  systemHealthStats: 'System Health',
  uptime: 'Uptime',
  systemDocumentation: 'System Documentation',
  generateDocumentation: 'Generate comprehensive documentation for system roles and permissions',
  documentationDescription: 'This document provides detailed explanations of all user roles in the National Digital Address Authority system.',
  
  // Field Agent Dashboard
  fieldAgentDashboard: 'Field Agent Dashboard',
  captureAndDraftAddresses: 'Capture and draft address data in the field',
  todaysCaptures: 'Today\'s Captures',
  fromYesterday: '+3 from yesterday',
  pendingDrafts: 'Pending Drafts',
  awaitingSubmission: 'Awaiting submission',
  submitted: 'Submitted',
  thisMonth: 'This month',
  accuracyRate: 'Accuracy Rate',
  captureNewAddress: 'Capture New Address',
  createNewDraft: 'Create a new address draft with photo evidence',
  startCapture: 'Start Capture',
  myDrafts: 'My Drafts',
  reviewPendingDrafts: 'Review and submit pending address drafts',
  viewDrafts: 'View Drafts',
  
  // Registrar Dashboard
  registrarDashboard: 'Registrar Dashboard',
  publishVerifiedAddresses: 'Publish verified addresses and manage provincial operations',
  readyToPublish: 'Ready to Publish',
  publishedToday: 'Published Today',
  madePublic: 'Made public',
  totalPublished: 'Total Published',
  inProvince: 'In province',
  coverage: 'Coverage',
  provincialCoverage: 'Provincial coverage',
  publishingQueue: 'Publishing Queue',
  reviewAndPublish: 'Review and publish verified addresses',
  publishAddresses: 'Publish Addresses',
  
  // Verifier Dashboard  
  verifierDashboard: 'Verifier Dashboard',
  reviewVerifySubmissions: 'Review and verify address submissions',
  pendingReview: 'Pending Review',
  requiresVerification: 'Requires verification',
  verifiedToday: 'Verified Today',
  approvedAddresses: 'Approved addresses',
  totalVerified: 'Total Verified',
  qualityScore: 'Quality Score',
  accuracyRatePercent: 'Accuracy rate',
  reviewQueue: 'Review Queue',
  processPendingSubmissions: 'Process pending address submissions',
  startReview: 'Start Review',
  
  // Dashboard translations
  nationalDigitalAddressSystem: 'National Digital Address System',
  comprehensiveAddressManagement: 'Comprehensive address management and mapping platform',
  systemOperational: 'System Operational',
  registeredLocations: 'Registered locations',
  qualityAssuredLocations: 'Quality assured locations',
  awaitingValidation: 'Awaiting validation',
  nationalCoverage: 'National coverage',
  findAndVerifyExisting: 'Find and verify existing addresses',
  registerNewLocation: 'Register a new location',
  interactiveAddressMapping: 'Interactive address mapping',
  coverageAndUsageStatistics: 'Coverage and usage statistics',
  apiServices: 'API Services',
  databaseSync: 'Database Sync',
  mappingServices: 'Mapping Services',
  governmentAgenciesAndAuthorized: 'Government agencies and authorized personnel',
  
  // Profile Editor translations
  profileInformation: 'Profile Information',
  updatePersonalInformation: 'Update your personal information and contact details',
  enterPhoneNumber: 'Enter your phone number',
  updateProfile: 'Update Profile',
  updateAccountPassword: 'Update your account password for security',
  enterNewPassword: 'Enter new password',
  confirmNewPasswordPlaceholder: 'Confirm new password',
  pleaseLogInToEditProfile: 'Please log in to edit your profile.',
  
  // Officer Profile translations
  officerProfilesAndPerformance: 'Officer Profiles and Performance',
  viewOfficerProfiles: 'View officer profiles, assignments, and performance metrics',
  totalOfficers: 'Total Officers',
  currentAssignment: 'Current Assignment:',
  avgResponse: 'Avg Response',
  needsImprovement: 'Needs Improvement',
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const t = (key: string): string => {
    return translations[key] || key;
  };

  const value: LanguageContextType = {
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};