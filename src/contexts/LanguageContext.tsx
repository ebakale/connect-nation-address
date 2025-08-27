import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'es' | 'en' | 'fr';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // ConnectEG Branding
    accessPlatform: 'Acceder a la Plataforma',
    learnMore: 'Aprende Más',
    emergency: 'Emergencia',
    digitalPlatform: 'Plataforma Digital',
    connectEGPlatform: 'Plataforma ConnectEG',
    connectEG: 'ConnectEG',
    connectEGDescription: 'Plataforma unificada para direccionamiento digital y gestión de emergencias en Guinea Ecuatorial.',
    connectingCitizensServices: 'Conectando ciudadanos, direcciones y servicios de emergencia',
    innovativeTechnology: 'a través de tecnología innovadora e integración perfecta.',
    
    // Core Modules
    dualCorePlatform: 'Plataforma de Núcleo Dual',
    coreFunctionalities: 'Funcionalidades Principales',
    twoIntegratedSystems: 'Dos sistemas integrados trabajando juntos para modernizar la infraestructura digital y capacidades de respuesta a emergencias de Guinea Ecuatorial.',
    
    // Address Registry System
    addressRegistrySystem: 'Sistema de Registro de Direcciones',
    digitalAddressingInfrastructure: 'Infraestructura de Direccionamiento Digital',
    comprehensiveDigitalAddressing: 'Sistema integral de direccionamiento digital para registrar, verificar y gestionar direcciones en toda Guinea Ecuatorial.',
    gpsBasedRegistration: 'Registro basado en GPS',
    multiLevelVerification: 'Flujo de verificación multinivel',
    smartSearchDiscovery: 'Búsqueda inteligente y descubrimiento',
    digitalDocumentationQR: 'Documentación digital y códigos QR',
    
    // Emergency Management System
    emergencyManagement: 'Gestión de Emergencias',
    policeEmergencyServices: 'Policía y Servicios de Emergencia',
    integratedEmergencyResponse: 'Plataforma integrada de respuesta a emergencias que conecta policía, servicios de emergencia y ciudadanos para la gestión rápida de incidentes.',
    realtimeIncidentReporting: 'Reportes de incidentes en tiempo real',
    gpsBasedUnitDispatch: 'Despacho de unidades basado en GPS',
    multiChannelCommunications: 'Comunicaciones multicanal',
    analyticsResponseTracking: 'Análisis y seguimiento de respuesta',
    
    // Additional Features
    roleBasedAccess: 'Acceso Basado en Roles',
    advancedRoleManagement: 'Gestión avanzada de roles con permisos granulares para diferentes tipos de usuarios y departamentos.',
    digitalDocumentationFeature: 'Documentación Digital',
    automatedDocumentGeneration: 'Generación automática de documentos, integración de códigos QR y gestión de certificados digitales.',
    realtimeAnalyticsFeature: 'Análisis en Tiempo Real',
    comprehensiveReporting: 'Reportes comprehensivos y análisis para operaciones de direccionamiento y respuesta a emergencias.',
    multiLanguageFeature: 'Multi-idioma',
    fullPlatformLocalization: 'Localización completa de la plataforma soportando español, francés y portugués para accesibilidad nacional.',
    
    // Platform Objectives
    strategicGoals: 'Objetivos Estratégicos',
    platformObjectives: 'Objetivos de la Plataforma',
    transformingEquatorialGuinea: 'Transformando Guinea Ecuatorial a través de sistemas integrados de direccionamiento digital y gestión de emergencias que mejoran los servicios ciudadanos y la seguridad pública.',
    
    // Digital Infrastructure
    digitalInfrastructure: 'Infraestructura Digital',
    establishComprehensiveAddressing: 'Establecer infraestructura integral de direccionamiento digital para mejorar la entrega de servicios, logística y desarrollo económico en todas las regiones.',
    
    // Public Safety Enhancement  
    publicSafetyEnhancement: 'Mejora de la Seguridad Pública',
    modernizeEmergencyResponse: 'Modernizar las capacidades de respuesta a emergencias con gestión de incidentes en tiempo real, despacho basado en GPS y sistemas de comunicación integrados.',
    
    // Citizen Empowerment
    citizenEmpowerment: 'Empoderamiento Ciudadano',
    provideDirectAccess: 'Proporcionar a los ciudadanos acceso directo a servicios gubernamentales, asistencia de emergencia y documentación digital a través del acceso unificado a la plataforma.',
    
    aboutConnectEG: 'La Plataforma ConnectEG es una iniciativa de BIAKAM para modernizar la infraestructura de direcciones y sistemas de gestión de emergencias de Guinea Ecuatorial, mejorando la entrega de servicios a nivel nacional.',
    
    // Navigation
    platformCapabilities: 'CAPACIDADES DE LA PLATAFORMA',
    advancedFeatures: 'Características Avanzadas',
    featuresSubtitle: 'Tecnología de vanguardia se encuentra con soluciones prácticas para la gestión integral de direcciones en todo el país',
    
    // Feature Cards
    smartSearch: 'Búsqueda Inteligente',
    smartSearchDesc: 'Búsqueda de direcciones con IA con filtrado en tiempo real y capacidades de geolocalización para un descubrimiento de direcciones ultrarrápido.',
    realTimeFiltering: 'filtrado en tiempo real',
    
    quickRegistration: 'Registro Rápido',
    quickRegistrationDesc: 'con coordenadas GPS, documentación fotográfica y estandarización automática de direcciones.',
    oneClickRegistration: 'Registro de un clic',
    
    secureVerification: 'Verificación Segura',
    secureVerificationDesc: 'asegurando 100% de precisión y cumplimiento con los estándares nacionales.',
    multiLayerVerification: 'Verificación multicapa',
    
    advancedRoleSystem: 'Sistema de Roles Avanzado',
    roleSystemDesc: 'con control de acceso basado en roles para administradores, registradores y agentes de campo.',
    granularPermissions: 'Permisos granulares',
    
    digitalDocumentation: 'Documentación Digital',
    digitalDocDesc: 'e informes con firmas digitales y códigos de verificación QR.',
    officialCertificates: 'certificados oficiales',
    
    realtimeAnalytics: 'Análisis en Tiempo Real',
    analyticsDesc: 'y reportes completos para el seguimiento de métricas de rendimiento del sistema.',
    liveDashboards: 'Dashboards en vivo',
    
    // Objectives
    nationalImpact: 'IMPACTO NACIONAL',
    systemObjectives: 'Objetivos del Sistema',
    objectivesSubtitle: 'Impulsando la transformación en Guinea Ecuatorial a través de infraestructura de direcciones innovadora',
    
    enhancedServiceDelivery: 'Entrega de Servicios Mejorada',
    serviceDeliveryDesc: 'Revolucionar los servicios públicos a través de direccionamiento preciso para entrega postal, respuesta de emergencia, servicios públicos y servicios gubernamentales a nivel nacional.',
    preciseAddressing: 'direccionamiento preciso',
    
    economicAcceleration: 'Aceleración Económica',
    economicDesc: 'y expansión del comercio electrónico con sistemas de entrega confiables y servicios basados en ubicación.',
    businessGrowth: 'crecimiento empresarial',
    
    loading: 'Cargando...',
    
    // Language names
    spanish: 'Español',
    english: 'English',
    french: 'Français',
    
    // Authentication
    secureAccess: 'Acceso Seguro',
    accessNationalSystem: 'Acceder al sistema nacional de direccionamiento',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    emailAddress: 'Dirección de Correo',
    password: 'Contraseña',
    fullName: 'Nombre Completo',
    confirmPassword: 'Confirmar Contraseña',
    enterEmail: 'Ingrese su correo',
    enterPassword: 'Ingrese su contraseña',
    enterFullName: 'Ingrese su nombre completo',
    createPassword: 'Cree una contraseña',
    confirmYourPassword: 'Confirme su contraseña',
    signingIn: 'Iniciando Sesión...',
    creatingAccount: 'Creando Cuenta...',
    createAccount: 'Crear Cuenta',
    governmentEG: 'Gobierno de Guinea Ecuatorial',
    secureReliableNationwide: 'Seguro • Confiable • Nacional',
    
    // 404 Page
    pageNotFound: 'Página no encontrada',
    oopsPageNotFound: '¡Ups! Página no encontrada',
    returnToHome: 'Regresar al Inicio',
    
    // Citizen Dashboard
    citizenPortal: 'Portal Ciudadano',
    searchVerifiedAddresses: 'Buscar direcciones verificadas y enviar solicitudes',
    searchAddresses: 'Buscar Direcciones',
    findVerifiedAddresses: 'Encuentre direcciones verificadas en la base de datos nacional',
    searchDatabase: 'Buscar Base de Datos',
    submitRequest: 'Enviar Solicitud',
    submitNewRequest: 'Enviar una nueva solicitud de registro de dirección',
    newRequest: 'Nueva Solicitud',
    addressStatus: 'Estado de Dirección',
    trackRequestStatus: 'Seguir el estado de sus solicitudes enviadas',
    checkStatus: 'Verificar Estado',
    importantInformation: 'Información Importante',
    allSearchesVerified: '• Todas las búsquedas de direcciones muestran solo direcciones verificadas',
    personalInfoProtected: '• La información personal está protegida y redactada',
    coordinatesApproximate: '• Las coordenadas son aproximadas por privacidad',
    submitRequestsNew: '• Envíe solicitudes para verificación de nuevas direcciones',
    submitAddressRequest: 'Enviar Solicitud de Dirección',
    addressRequestStatus: 'Estado de Solicitud de Dirección',
    contactEmergencyServices: 'Obtén ayuda inmediata cuando más la necesites',
    
    // Emergency contacts
    emergencyContacts: 'Contactos de Emergencia',
    police: 'Policía',
    policeDescription: 'Asistencia policial de emergencia',
    emergencyServices: 'Servicios de Emergencia',
    emergencyServicesDescription: 'Bomberos, médicos y otras emergencias',
    call: 'Llamar',
    sendLocationAlert: 'Enviar Alerta de Ubicación',
    emergencyAlert: 'Alerta de Emergencia',
    sendLocationToServices: 'Enviar tu ubicación a {service}',
    automaticallyGettingLocation: 'Obteniendo tu ubicación automáticamente...',
    locationNeededForAlert: 'Se necesita ubicación para enviar una alerta',
    locationDetected: 'Ubicación detectada',
    emergencyMessage: 'Mensaje de Emergencia',
    describeEmergency: 'Describe la situación de emergencia...',
    gettingLocation: 'Obteniendo ubicación...',
    retryLocation: 'Reintentar ubicación',
    sending: 'Enviando...',
    sent: '¡Enviado!',
    sendAlert: 'Enviar Alerta',
    emergencyAlertSent: 'Alerta de emergencia enviada con éxito',
    emergencyAlertFailed: 'Error al enviar alerta de emergencia',
    locationRequired: 'Se requiere ubicación para enviar alerta',
    
    // Police system translations
    policeCommandCenter: 'Centro de Comando Policial',
    emergencyIncidents: 'Incidentes de Emergencia',
    dispatchCenter: 'Centro de Despacho',
    unitOperations: 'Operaciones de Unidad',
    coordinationCenter: 'Centro de Coordinación',
    fieldOperations: 'Operaciones de Campo',
    myAssignments: 'Mis Asignaciones',
    myUnit: 'Mi Unidad',
    myArea: 'Mi Área',
    unitsOverview: 'Vista General de Unidades',
    activeIncidents: 'Incidentes Activos',
    allStatus: 'Todos los Estados',
    reported: 'Reportado',
    dispatched: 'Despachado',
    responding: 'Respondiendo',
    onScene: 'En Escena',
    resolved: 'Resuelto',
    allPriority: 'Todas las Prioridades',
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
    priority: 'Prioridad',
    status: 'Estado',
    assignUnit: 'Asignar Unidad',
    updateStatus: 'Actualizar Estado',
    viewDetails: 'Ver Detalles',
    description: 'Descripción',
    location: 'Ubicación',
    assignedUnits: 'Unidades Asignadas',
    
    // Status translations
    available: 'Disponible',
    busy: 'Ocupado',
    onBreak: 'En Descanso',
    offline: 'Fuera de Línea',
    
    // Admin panel translations  
    rolePermissionManagement: 'Gestión de Roles y Permisos',
    pleaseLogInToAccess: 'Por favor inicia sesión para acceder a las funciones de gestión de roles',
    loadingRoleInformation: 'Cargando información de roles...',
    manageUserRoles: 'Gestionar roles de usuario y permisos para el Sistema Nacional de Direcciones Digitales',
    roleManagement: 'Gestión de Roles',
    permissions: 'Permisos',
    workflows: 'Flujos de Trabajo',
    userManagement: 'Gestión de Usuarios',
    uacSystem: 'Sistema UAC',
    apiWebhooks: 'API y Webhooks',
    
    // Analytics translations
    reportsAnalytics: 'Informes y Análisis',
    addressRegistrationInsights: 'Información sobre registro y verificación de direcciones',
    periodUpdated: 'Período Actualizado',
    analyticsUpdatedFor: 'Análisis actualizado para',
    lastSevenDays: 'últimos 7 días',
    lastThirtyDays: 'últimos 30 días',
    lastNinetyDays: 'últimos 90 días',
    lastYear: 'último año',
    selectPeriod: 'Seleccionar período',
    exportCSV: 'Exportar CSV',
    totalAddresses: 'Total de Direcciones',
    verified: 'Verificado',
    pending: 'Pendiente',
    publicAddresses: 'Público',
    verificationRate: 'tasa de verificación',
    awaitingVerification: 'Esperando verificación',
    publiclyAccessible: 'Accesible públicamente',
    restrictedAccess: 'Acceso restringido',
    regionalAnalysis: 'Análisis Regional',
    addressTypes: 'Tipos de Direcciones',
    trends: 'Tendencias',
    addressesByRegion: 'Direcciones por Región',
    totalAndVerifiedPerRegion: 'Total y direcciones verificadas por región',
    regionalSummary: 'Resumen Regional',
    keyStatisticsByRegion: 'Estadísticas clave por región',
    totalAddressesCount: 'direcciones totales',
    addressTypeDistribution: 'Distribución de Tipos de Direcciones',
    totalByType: 'Total por tipo',
    registrationTrends: 'Tendencias de Registro',
    addressRegistrationOverTime: 'Registro de direcciones a lo largo del tiempo',
    newAddresses: 'Nuevas Direcciones',
    verifiedAddresses: 'Direcciones Verificadas',
    unitStatusUpdated: 'Estado de Unidad Actualizado',
    dispatch: 'Despacho',
    field: 'Campo',
    supervisor: 'Supervisor',
    emergencyResponse: 'Respuesta de Emergencia',
    accessDenied: 'Acceso Denegado',
    private: 'Privado',
    
    // Dashboard sections
    adminDashboard: 'Panel de Administrador',
    manageUsersRoles: 'Gestionar usuarios, roles y configuraciones del sistema',
    totalUsers: 'Total de Usuarios',
    fromLastMonth: '+12% desde el mes pasado',
    activeRoles: 'Roles Activos',
    allSystemRoles: 'Todos los roles del sistema',
    pendingApprovals: 'Aprobaciones Pendientes',
    requiresAttention: 'Requiere atención',
    systemHealth: 'Salud del Sistema',
    uptime: 'Tiempo activo',
    systemDocumentation: 'Documentación del Sistema',
    generateDocumentation: 'Generar documentación integral para roles y permisos del sistema',
    documentationDescription: 'Este documento proporciona explicaciones detalladas de todos los roles de usuario en el sistema de la Autoridad Nacional de Direccionamiento Digital.',
    
    // Field Agent Dashboard
    fieldAgentDashboard: 'Panel de Agente de Campo',
    captureAndDraftAddresses: 'Capturar y redactar datos de direcciones en el campo',
    todaysCaptures: 'Capturas de Hoy',
    fromYesterday: '+3 desde ayer',
    pendingDrafts: 'Borradores Pendientes',
    awaitingSubmission: 'Esperando envío',
    submitted: 'Enviado',
    thisMonth: 'Este mes',
    accuracyRate: 'Tasa de Precisión',
    captureNewAddress: 'Capturar Nueva Dirección',
    createNewDraft: 'Crear un nuevo borrador de dirección con evidencia fotográfica',
    startCapture: 'Iniciar Captura',
    myDrafts: 'Mis Borradores',
    reviewPendingDrafts: 'Revisar y enviar borradores de direcciones pendientes',
    viewDrafts: 'Ver Borradores',
    
    // Registrar Dashboard
    registrarDashboard: 'Panel de Registrador',
    publishVerifiedAddresses: 'Publicar direcciones verificadas y gestionar operaciones provinciales',
    readyToPublish: 'Listo para Publicar',
    publishedToday: 'Publicado Hoy',
    madePublic: 'Hecho público',
    totalPublished: 'Total Publicado',
    inProvince: 'En provincia',
    coverage: 'Cobertura',
    provincialCoverage: 'Cobertura provincial',
    publishingQueue: 'Cola de Publicación',
    reviewAndPublish: 'Revisar y publicar direcciones verificadas',
    publishAddresses: 'Publicar Direcciones',
    
    // Verifier Dashboard  
    verifierDashboard: 'Panel de Verificador',
    reviewVerifySubmissions: 'Revisar y verificar envíos de direcciones',
    pendingReview: 'Revisión Pendiente',
    requiresVerification: 'Requiere verificación',
    verifiedToday: 'Verificado Hoy',
    approvedAddresses: 'Direcciones aprobadas',
    totalVerified: 'Total Verificado',
    qualityScore: 'Puntuación de Calidad',
    accuracyRatePercent: 'Tasa de precisión',
    reviewQueue: 'Cola de Revisión',
    processPendingSubmissions: 'Procesar envíos de direcciones pendientes',
    startReview: 'Iniciar Revisión',
    
    // Dashboard translations
    nationalDigitalAddressSystem: 'Sistema Nacional de Direcciones Digitales',
    comprehensiveAddressManagement: 'Plataforma integral de gestión y mapeo de direcciones',
    systemOperational: 'Sistema Operativo',
    registeredLocations: 'Ubicaciones registradas',
    qualityAssuredLocations: 'Ubicaciones con garantía de calidad',
    awaitingValidation: 'En espera de validación',
    nationalCoverage: 'Cobertura nacional',
    findAndVerifyExisting: 'Encontrar y verificar direcciones existentes',
    registerNewLocation: 'Registrar una nueva ubicación',
    interactiveAddressMapping: 'Mapeo interactivo de direcciones',
    coverageAndUsageStatistics: 'Estadísticas de cobertura y uso',
    apiServices: 'Servicios API',
    databaseSync: 'Sincronización BD',
    mappingServices: 'Servicios de Mapeo',
    governmentAgenciesAndAuthorized: 'Agencias gubernamentales y personal autorizado',
    
    // Profile Editor translations
    profileInformation: 'Información del Perfil',
    updatePersonalInformation: 'Actualiza tu información personal y datos de contacto',
    enterPhoneNumber: 'Ingresa tu número de teléfono',
    updateProfile: 'Actualizar Perfil',
    updateAccountPassword: 'Actualiza la contraseña de tu cuenta para mayor seguridad',
    enterNewPassword: 'Ingresa nueva contraseña',
    confirmNewPasswordPlaceholder: 'Confirma nueva contraseña',
    pleaseLogInToEditProfile: 'Por favor inicia sesión para editar tu perfil.',
    
    // Officer Profile translations
    officerProfilesAndPerformance: 'Perfiles y Rendimiento de Oficiales',
    viewOfficerProfiles: 'Ver perfiles de oficiales, asignaciones y métricas de rendimiento',
    totalOfficers: 'Total de Oficiales',
    currentAssignment: 'Asignación Actual:',
    avgResponse: 'Respuesta Promedio',
    needsImprovement: 'Necesita Mejora',
  },
  en: {
    // Navigation
    overview: 'Overview',
    about: 'About Us',
    help: 'Help',
    manual: 'Manual',
    login: 'Login',
    logout: 'Logout',
    
    // Hero Section
    nationalAddressRegistry: 'National Address Registry System',
    equatorialGuinea: 'Equatorial Guinea',
    addressRegistration: 'Address Registration',
    heroSubtitle: 'Transforming address management with cutting-edge technology.',
    heroDescription: 'Secure, accurate, and accessible',
    heroDescriptionExtended: 'for every citizen and business across all provinces.',
    accessSystemNow: 'Access System Now',
    discoverMore: 'Discover More',
    
    // Features
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
    
    loading: 'Loading...',
    
    // Language names
    spanish: 'Español',
    english: 'English',
    french: 'Français',
    
    // Authentication
    secureAccess: 'Secure Access',
    accessNationalSystem: 'Access the national addressing system',
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
    governmentEG: 'Government of Equatorial Guinea',
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
    unitOperations: 'Unit Operations',
    coordinationCenter: 'Coordination Center',
    fieldOperations: 'Field Operations',
    myAssignments: 'My Assignments',
    myUnit: 'My Unit',
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
    manageUsersRoles: 'Manage users, roles, and system settings',
    totalUsers: 'Total Users',
    fromLastMonth: '+12% from last month',
    activeRoles: 'Active Roles',
    allSystemRoles: 'All system roles',
    pendingApprovals: 'Pending Approvals',
    requiresAttention: 'Requires attention',
    systemHealth: 'System Health',
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
    updateAccountPassword: 'Update your account password for better security',
    enterNewPassword: 'Enter new password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    pleaseLogInToEditProfile: 'Please log in to edit your profile.',
    
    // Officer Profile translations
    officerProfilesAndPerformance: 'Officer Profiles & Performance',
    viewOfficerProfiles: 'View officer profiles, assignments, and performance metrics',
    totalOfficers: 'Total Officers',
    currentAssignment: 'Current Assignment:',
    avgResponse: 'Avg Response',
    needsImprovement: 'Needs Improvement',
  },
  fr: {
    // Navigation
    overview: 'Aperçu',
    about: 'À Propos',
    help: 'Aide',
    manual: 'Manuel',
    login: 'Connexion',
    logout: 'Déconnexion',
    
    // Hero Section
    nationalAddressRegistry: 'Système National de Registre d\'Adresses',
    equatorialGuinea: 'Guinée Équatoriale',
    addressRegistration: 'Enregistrement d\'Adresses',
    heroSubtitle: 'Transformant la gestion des adresses avec une technologie de pointe.',
    heroDescription: 'Sécurisé, précis et accessible',
    heroDescriptionExtended: 'pour chaque citoyen et entreprise dans toutes les provinces.',
    accessSystemNow: 'Accéder au Système',
    discoverMore: 'Découvrir Plus',
    
    // Features
    platformCapabilities: 'CAPACITÉS DE LA PLATEFORME',
    advancedFeatures: 'Fonctionnalités Avancées',
    featuresSubtitle: 'Une technologie de pointe rencontre des solutions pratiques pour une gestion complète des adresses à travers la nation',
    
    // Feature Cards
    smartSearch: 'Recherche Intelligente',
    smartSearchDesc: 'Recherche d\'adresses alimentée par IA avec filtrage en temps réel et capacités de géolocalisation pour une découverte d\'adresses ultra-rapide.',
    realTimeFiltering: 'filtrage en temps réel',
    
    quickRegistration: 'Enregistrement Rapide',
    quickRegistrationDesc: 'avec coordonnées GPS, documentation photo et standardisation automatique des adresses.',
    oneClickRegistration: 'Enregistrement en un clic',
    
    secureVerification: 'Vérification Sécurisée',
    secureVerificationDesc: 'assurant 100% de précision et conformité aux normes nationales.',
    multiLayerVerification: 'Vérification multicouche',
    
    advancedRoleSystem: 'Système de Rôles Avancé',
    roleSystemDesc: 'avec contrôle d\'accès basé sur les rôles pour les administrateurs, registraires et agents de terrain.',
    granularPermissions: 'Permissions granulaires',
    
    digitalDocumentation: 'Documentation Numérique',
    digitalDocDesc: 'et rapports avec signatures numériques et codes de vérification QR.',
    officialCertificates: 'certificats officiels',
    
    realtimeAnalytics: 'Analyses en Temps Réel',
    analyticsDesc: 'et rapports complets pour le suivi des métriques de performance du système.',
    liveDashboards: 'Tableaux de bord en direct',
    
    // Objectives
    nationalImpact: 'IMPACT NATIONAL',
    systemObjectives: 'Objectifs du Système',
    objectivesSubtitle: 'Conduire la transformation à travers la Guinée Équatoriale grâce à une infrastructure d\'adresses innovante',
    
    enhancedServiceDelivery: 'Prestation de Services Améliorée',
    serviceDeliveryDesc: 'Révolutionner les services publics grâce à un adressage précis pour la livraison postale, la réponse d\'urgence, les services publics et gouvernementaux à l\'échelle nationale.',
    preciseAddressing: 'adressage précis',
    
    economicAcceleration: 'Accélération Économique',
    economicDesc: 'et expansion du commerce électronique avec des systèmes de livraison fiables et des services basés sur la localisation.',
    businessGrowth: 'croissance des entreprises',
    
    loading: 'Chargement...',
    
    // Language names
    spanish: 'Español',
    english: 'English',
    french: 'Français',
    
    // Authentication
    secureAccess: 'Accès Sécurisé',
    accessNationalSystem: 'Accéder au système national d\'adressage',
    signIn: 'Se Connecter',
    signUp: 'S\'Inscrire',
    emailAddress: 'Adresse Email',
    password: 'Mot de Passe',
    fullName: 'Nom Complet',
    confirmPassword: 'Confirmer le Mot de Passe',
    enterEmail: 'Entrez votre email',
    enterPassword: 'Entrez votre mot de passe',
    enterFullName: 'Entrez votre nom complet',
    createPassword: 'Créez un mot de passe',
    confirmYourPassword: 'Confirmez votre mot de passe',
    signingIn: 'Connexion...',
    creatingAccount: 'Création du Compte...',
    createAccount: 'Créer un Compte',
    governmentEG: 'Gouvernement de Guinée Équatoriale',
    secureReliableNationwide: 'Sécurisé • Fiable • National',
    
    // 404 Page
    pageNotFound: 'Page introuvable',
    oopsPageNotFound: 'Oups! Page introuvable',
    returnToHome: 'Retour à l\'Accueil',
    
    // Citizen Dashboard
    citizenPortal: 'Portail Citoyen',
    searchVerifiedAddresses: 'Rechercher des adresses vérifiées et soumettre des demandes',
    searchAddresses: 'Rechercher des Adresses',
    findVerifiedAddresses: 'Trouvez des adresses vérifiées dans la base de données nationale',
    searchDatabase: 'Rechercher dans la Base de Données',
    submitRequest: 'Soumettre une Demande',
    submitNewRequest: 'Soumettre une nouvelle demande d\'enregistrement d\'adresse',
    newRequest: 'Nouvelle Demande',
    addressStatus: 'Statut de l\'Adresse',
    trackRequestStatus: 'Suivre le statut de vos demandes soumises',
    checkStatus: 'Vérifier le Statut',
    importantInformation: 'Information Importante',
    allSearchesVerified: '• Toutes les recherches d\'adresses ne montrent que des adresses vérifiées',
    personalInfoProtected: '• Les informations personnelles sont protégées et caviardées',
    coordinatesApproximate: '• Les coordonnées sont approximatives pour la confidentialité',
    submitRequestsNew: '• Soumettez des demandes pour la vérification de nouvelles adresses',
    submitAddressRequest: 'Soumettre une Demande d\'Adresse',
    addressRequestStatus: 'Statut de la Demande d\'Adresse',
    contactEmergencyServices: 'Obtenez une aide immédiate quand vous en avez le plus besoin',
    
    // Emergency contacts
    emergencyContacts: 'Contacts d\'Urgence',
    police: 'Police',
    policeDescription: 'Assistance policière d\'urgence',
    emergencyServices: 'Services d\'Urgence',
    emergencyServicesDescription: 'Pompiers, médical et autres urgences',
    call: 'Appeler',
    sendLocationAlert: 'Envoyer Alerte de Localisation',
    emergencyAlert: 'Alerte d\'Urgence',
    sendLocationToServices: 'Envoyer votre localisation à {service}',
    automaticallyGettingLocation: 'Obtention automatique de votre localisation...',
    locationNeededForAlert: 'La localisation est nécessaire pour envoyer une alerte',
    locationDetected: 'Localisation détectée',
    emergencyMessage: 'Message d\'Urgence',
    describeEmergency: 'Décrivez la situation d\'urgence...',
    gettingLocation: 'Obtention de la localisation...',
    retryLocation: 'Réessayer la localisation',
    sending: 'Envoi...',
    sent: 'Envoyé!',
    sendAlert: 'Envoyer Alerte',
    emergencyAlertSent: 'Alerte d\'urgence envoyée avec succès',
    emergencyAlertFailed: 'Échec de l\'envoi de l\'alerte d\'urgence',
    locationRequired: 'La localisation est requise pour envoyer l\'alerte',
    
    // Police system translations
    policeCommandCenter: 'Centre de Commandement de Police',
    emergencyIncidents: 'Incidents d\'Urgence',
    dispatchCenter: 'Centre de Répartition',
    unitOperations: 'Opérations d\'Unité',
    coordinationCenter: 'Centre de Coordination',
    fieldOperations: 'Opérations de Terrain',
    myAssignments: 'Mes Affectations',
    myUnit: 'Mon Unité',
    myArea: 'Ma Zone',
    unitsOverview: 'Aperçu des Unités',
    activeIncidents: 'Incidents Actifs',
    allStatus: 'Tous les États',
    reported: 'Signalé',
    dispatched: 'Dépêché',
    responding: 'En Réponse',
    onScene: 'Sur Scene',
    resolved: 'Résolu',
    allPriority: 'Toutes les Priorités',
    critical: 'Critique',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
    priority: 'Priorité',
    status: 'État',
    assignUnit: 'Assigner Unité',
    updateStatus: 'Mettre à Jour État',
    viewDetails: 'Voir Détails',
    description: 'Description',
    location: 'Localisation',
    assignedUnits: 'Unités Assignées',
    
    // Status translations
    available: 'Disponible',
    busy: 'Occupé',
    onBreak: 'En Pause',
    offline: 'Hors Ligne',
    
    // Admin panel translations  
    rolePermissionManagement: 'Gestion des Rôles et Permissions',
    pleaseLogInToAccess: 'Veuillez vous connecter pour accéder aux fonctions de gestion des rôles',
    loadingRoleInformation: 'Chargement des informations de rôle...',
    manageUserRoles: 'Gérer les rôles utilisateur et les permissions pour le Système National d\'Adresses Numériques',
    roleManagement: 'Gestion des Rôles',
    permissions: 'Permissions',
    workflows: 'Flux de Travail',
    userManagement: 'Gestion des Utilisateurs',
    uacSystem: 'Système UAC',
    apiWebhooks: 'API et Webhooks',
    
    // Analytics translations
    reportsAnalytics: 'Rapports et Analyses',
    addressRegistrationInsights: 'Aperçus d\'enregistrement et de vérification d\'adresses',
    periodUpdated: 'Période Mise à Jour',
    analyticsUpdatedFor: 'Analyses mises à jour pour',
    lastSevenDays: 'les 7 derniers jours',
    lastThirtyDays: 'les 30 derniers jours',
    lastNinetyDays: 'les 90 derniers jours',
    lastYear: 'l\'année dernière',
    selectPeriod: 'Sélectionner la période',
    exportCSV: 'Exporter CSV',
    totalAddresses: 'Total des Adresses',
    verified: 'Vérifié',
    pending: 'En Attente',
    publicAddresses: 'Public',
    verificationRate: 'taux de vérification',
    awaitingVerification: 'En attente de vérification',
    publiclyAccessible: 'Accessible publiquement',
    restrictedAccess: 'Accès restreint',
    regionalAnalysis: 'Analyse Régionale',
    addressTypes: 'Types d\'Adresses',
    trends: 'Tendances',
    addressesByRegion: 'Adresses par Région',
    totalAndVerifiedPerRegion: 'Total et adresses vérifiées par région',
    regionalSummary: 'Résumé Régional',
    keyStatisticsByRegion: 'Statistiques clés par région',
    totalAddressesCount: 'adresses totales',
    addressTypeDistribution: 'Distribution des Types d\'Adresses',
    totalByType: 'Total par type',
    registrationTrends: 'Tendances d\'Enregistrement',
    addressRegistrationOverTime: 'Enregistrement d\'adresses au fil du temps',
    newAddresses: 'Nouvelles Adresses',
    verifiedAddresses: 'Adresses Vérifiées',
    unitStatusUpdated: 'État de l\'Unité Mis à Jour',
    dispatch: 'Répartition',
    field: 'Terrain',
    supervisor: 'Superviseur',
    emergencyResponse: 'Réponse d\'Urgence',
    accessDenied: 'Accès Refusé',
    private: 'Privé',
    
    // Dashboard sections
    adminDashboard: 'Tableau de Bord Admin',
    manageUsersRoles: 'Gérer les utilisateurs, rôles et paramètres système',
    totalUsers: 'Total des Utilisateurs',
    fromLastMonth: '+12% du mois dernier',
    activeRoles: 'Rôles Actifs',
    allSystemRoles: 'Tous les rôles système',
    pendingApprovals: 'Approbations en Attente',
    requiresAttention: 'Nécessite attention',
    systemHealth: 'Santé du Système',
    uptime: 'Temps de fonctionnement',
    systemDocumentation: 'Documentation du Système',
    generateDocumentation: 'Générer une documentation complète pour les rôles et permissions du système',
    documentationDescription: 'Ce document fournit des explications détaillées de tous les rôles utilisateur dans le système de l\'Autorité Nationale d\'Adresses Numériques.',
    
    // Field Agent Dashboard
    fieldAgentDashboard: 'Tableau de Bord Agent de Terrain',
    captureAndDraftAddresses: 'Capturer et rédiger des données d\'adresses sur le terrain',
    todaysCaptures: 'Captures d\'Aujourd\'hui',
    fromYesterday: '+3 d\'hier',
    pendingDrafts: 'Brouillons en Attente',
    awaitingSubmission: 'En attente de soumission',
    submitted: 'Soumis',
    thisMonth: 'Ce mois',
    accuracyRate: 'Taux de Précision',
    captureNewAddress: 'Capturer Nouvelle Adresse',
    createNewDraft: 'Créer un nouveau brouillon d\'adresse avec preuve photo',
    startCapture: 'Commencer la Capture',
    myDrafts: 'Mes Brouillons',
    reviewPendingDrafts: 'Réviser et soumettre les brouillons d\'adresses en attente',
    viewDrafts: 'Voir les Brouillons',
    
    // Registrar Dashboard
    registrarDashboard: 'Tableau de Bord Registraire',
    publishVerifiedAddresses: 'Publier des adresses vérifiées et gérer les opérations provinciales',
    readyToPublish: 'Prêt à Publier',
    publishedToday: 'Publié Aujourd\'hui',
    madePublic: 'Rendu public',
    totalPublished: 'Total Publié',
    inProvince: 'En province',
    coverage: 'Couverture',
    provincialCoverage: 'Couverture provinciale',
    publishingQueue: 'File de Publication',
    reviewAndPublish: 'Réviser et publier les adresses vérifiées',
    publishAddresses: 'Publier les Adresses',
    
    // Verifier Dashboard  
    verifierDashboard: 'Tableau de Bord Vérificateur',
    reviewVerifySubmissions: 'Réviser et vérifier les soumissions d\'adresses',
    pendingReview: 'Révision en Attente',
    requiresVerification: 'Nécessite vérification',
    verifiedToday: 'Vérifié Aujourd\'hui',
    approvedAddresses: 'Adresses approuvées',
    totalVerified: 'Total Vérifié',
    qualityScore: 'Score de Qualité',
    accuracyRatePercent: 'Taux de précision',
    reviewQueue: 'File de Révision',
    processPendingSubmissions: 'Traiter les soumissions d\'adresses en attente',
    startReview: 'Commencer la Révision',
    
    // Dashboard translations
    nationalDigitalAddressSystem: 'Système National d\'Adresses Numériques',
    comprehensiveAddressManagement: 'Plateforme complète de gestion et cartographie d\'adresses',
    systemOperational: 'Système Opérationnel',
    registeredLocations: 'Emplacements enregistrés',
    qualityAssuredLocations: 'Emplacements à qualité assurée',
    awaitingValidation: 'En attente de validation',
    nationalCoverage: 'Couverture nationale',
    findAndVerifyExisting: 'Trouver et vérifier les adresses existantes',
    registerNewLocation: 'Enregistrer un nouvel emplacement',
    interactiveAddressMapping: 'Cartographie interactive des adresses',
    coverageAndUsageStatistics: 'Statistiques de couverture et d\'utilisation',
    apiServices: 'Services API',
    databaseSync: 'Sync Base de Données',
    mappingServices: 'Services de Cartographie',
    governmentAgenciesAndAuthorized: 'Agences gouvernementales et personnel autorisé',
    
    // Profile Editor translations
    profileInformation: 'Informations du Profil',
    updatePersonalInformation: 'Mettez à jour vos informations personnelles et coordonnées',
    enterPhoneNumber: 'Entrez votre numéro de téléphone',
    updateProfile: 'Mettre à jour le Profil',
    updateAccountPassword: 'Mettez à jour le mot de passe de votre compte pour une meilleure sécurité',
    enterNewPassword: 'Entrez le nouveau mot de passe',
    confirmNewPasswordPlaceholder: 'Confirmez le nouveau mot de passe',
    pleaseLogInToEditProfile: 'Veuillez vous connecter pour modifier votre profil.',
    
    // Officer Profile translations
    officerProfilesAndPerformance: 'Profils et Performance des Officiers',
    viewOfficerProfiles: 'Voir les profils des officiers, affectations et métriques de performance',
    totalOfficers: 'Total des Officiers',
    currentAssignment: 'Affectation Actuelle:',
    avgResponse: 'Réponse Moyenne',
    needsImprovement: 'Nécessite Amélioration',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['es', 'en', 'fr'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key] || key;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
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