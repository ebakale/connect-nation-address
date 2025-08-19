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
    // Navigation
    overview: 'Resumen',
    about: 'Acerca de',
    help: 'Ayuda',
    manual: 'Manual',
    login: 'Iniciar Sesión',
    
    // Hero Section
    nationalAddressRegistry: 'Sistema Nacional de Registro de Direcciones',
    equatorialGuinea: 'Guinea Ecuatorial',
    addressRegistration: 'Registro de Direcciones',
    heroSubtitle: 'Transformando la gestión de direcciones con tecnología de vanguardia.',
    heroDescription: 'Seguro, preciso y accesible',
    heroDescriptionExtended: 'para cada ciudadano y empresa en todas las provincias.',
    accessSystemNow: 'Acceder al Sistema',
    discoverMore: 'Descubrir Más',
    
    // Features
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
    logout: 'Cerrar Sesión',
    
    // Admin Dashboard
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
    documentationDescription: 'Este documento proporciona explicaciones detalladas de todos los roles de usuario en el sistema de la Autoridad Nacional de Direccionamiento Digital, incluyendo sus permisos, alcance geográfico, etapas de flujo de trabajo y responsabilidades específicas.'
  },
  en: {
    // Navigation
    overview: 'Overview',
    about: 'About Us',
    help: 'Help',
    manual: 'Manual',
    login: 'Login',
    
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
    allSearchesVerified: '• All address searches show verified addresses only',
    personalInfoProtected: '• Personal information is protected and redacted',
    coordinatesApproximate: '• Coordinates are approximated for privacy',
    submitRequestsNew: '• Submit requests for new address verification',
    submitAddressRequest: 'Submit Address Request',
    addressRequestStatus: 'Address Request Status',
    logout: 'Logout',
    
    // Admin Dashboard
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
    documentationDescription: 'This document provides detailed explanations of all user roles in the National Digital Addressing Authority system, including their permissions, geographic scope, workflow stages, and specific responsibilities.'
  },
  fr: {
    // Navigation
    overview: 'Aperçu',
    about: 'À Propos',
    help: 'Aide',
    manual: 'Manuel',
    login: 'Connexion',
    
    // Hero Section
    nationalAddressRegistry: 'Système National de Registre des Adresses',
    equatorialGuinea: 'Guinée Équatoriale',
    addressRegistration: 'Enregistrement d\'Adresses',
    heroSubtitle: 'Transformer la gestion des adresses avec une technologie de pointe.',
    heroDescription: 'Sécurisé, précis et accessible',
    heroDescriptionExtended: 'pour chaque citoyen et entreprise dans toutes les provinces.',
    accessSystemNow: 'Accéder au Système',
    discoverMore: 'Découvrir Plus',
    
    // Features
    platformCapabilities: 'CAPACITÉS DE LA PLATEFORME',
    advancedFeatures: 'Fonctionnalités Avancées',
    featuresSubtitle: 'La technologie de pointe rencontre des solutions pratiques pour une gestion complète des adresses à travers le pays',
    
    // Feature Cards
    smartSearch: 'Recherche Intelligente',
    smartSearchDesc: 'Recherche d\'adresses alimentée par l\'IA avec filtrage en temps réel et capacités de géolocalisation pour une découverte d\'adresses ultra-rapide.',
    realTimeFiltering: 'filtrage en temps réel',
    
    quickRegistration: 'Enregistrement Rapide',
    quickRegistrationDesc: 'avec coordonnées GPS, documentation photo et standardisation automatique des adresses.',
    oneClickRegistration: 'Enregistrement en un clic',
    
    secureVerification: 'Vérification Sécurisée',
    secureVerificationDesc: 'assurant 100% de précision et conformité avec les normes nationales.',
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
    objectivesSubtitle: 'Conduire la transformation en Guinée Équatoriale grâce à une infrastructure d\'adresses innovante',
    
    enhancedServiceDelivery: 'Prestation de Services Améliorée',
    serviceDeliveryDesc: 'Révolutionner les services publics grâce à un adressage précis pour la livraison postale, les réponses d\'urgence, les services publics et gouvernementaux à l\'échelle nationale.',
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
    accessNationalSystem: 'Accédez au système national d\'adressage',
    signIn: 'Se Connecter',
    signUp: 'S\'inscrire',
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
    pageNotFound: 'Page non trouvée',
    oopsPageNotFound: 'Oups ! Page non trouvée',
    returnToHome: 'Retourner à l\'Accueil',
    
    // Citizen Dashboard
    citizenPortal: 'Portail Citoyen',
    searchVerifiedAddresses: 'Rechercher des adresses vérifiées et soumettre des demandes',
    searchAddresses: 'Rechercher Adresses',
    findVerifiedAddresses: 'Trouvez des adresses vérifiées dans la base de données nationale',
    searchDatabase: 'Rechercher Base de Données',
    submitRequest: 'Soumettre Demande',
    submitNewRequest: 'Soumettre une nouvelle demande d\'enregistrement d\'adresse',
    newRequest: 'Nouvelle Demande',
    addressStatus: 'Statut d\'Adresse',
    trackRequestStatus: 'Suivez le statut de vos demandes soumises',
    checkStatus: 'Vérifier Statut',
    importantInformation: 'Informations Importantes',
    allSearchesVerified: '• Toutes les recherches d\'adresses ne montrent que des adresses vérifiées',
    personalInfoProtected: '• Les informations personnelles sont protégées et rédigées',
    coordinatesApproximate: '• Les coordonnées sont approximatives pour la confidentialité',
    submitRequestsNew: '• Soumettez des demandes pour la vérification de nouvelles adresses',
    submitAddressRequest: 'Soumettre Demande d\'Adresse',
    addressRequestStatus: 'Statut de Demande d\'Adresse',
    logout: 'Déconnexion',
    
    // Admin Dashboard
    adminDashboard: 'Tableau de Bord Admin',
    manageUsersRoles: 'Gérer les utilisateurs, rôles et paramètres système',
    totalUsers: 'Total Utilisateurs',
    fromLastMonth: '+12% depuis le mois dernier',
    activeRoles: 'Rôles Actifs',
    allSystemRoles: 'Tous les rôles système',
    pendingApprovals: 'Approbations en Attente',
    requiresAttention: 'Nécessite attention',
    systemHealth: 'Santé du Système',
    uptime: 'Temps de fonctionnement',
    systemDocumentation: 'Documentation Système',
    generateDocumentation: 'Générer une documentation complète pour les rôles et permissions du système',
    documentationDescription: 'Ce document fournit des explications détaillées de tous les rôles d\'utilisateur dans le système de l\'Autorité Nationale d\'Adressage Numérique, y compris leurs permissions, portée géographique, étapes de flux de travail et responsabilités spécifiques.'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('es'); // Default to Spanish

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    if (savedLanguage && ['es', 'en', 'fr'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof typeof translations[typeof currentLanguage]] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};