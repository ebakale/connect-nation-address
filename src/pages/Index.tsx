import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Users, Search, FileText, HelpCircle, Book, LogIn, CheckCircle, Globe, BarChart3, Package, Truck, Target, Eye, Building, QrCode, Ambulance, Mail, LayoutDashboard, Clock, ArrowRight, Fingerprint, AlertTriangle, Info, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ValuePropositionPDF } from '@/components/ValuePropositionPDF';
import StoryboardsPDF from '@/components/StoryboardsPDF';
import BusinessModelCanvasPDF from '@/components/BusinessModelCanvasPDF';
import BusinessModelCanvasPDFEnglish from '@/components/BusinessModelCanvasPDFEnglish';
import FinancialAnalysisPDF from '@/components/FinancialAnalysisPDF';
import FinancialAnalysisPDFEnglish from '@/components/FinancialAnalysisPDFEnglish';
import ProcessFlowDiagramPDF from '@/components/ProcessFlowDiagramPDF';
import ProcessFlowDiagramPDFEnglish from '@/components/ProcessFlowDiagramPDFEnglish';
import FunctionalitiesObjectivesPDF from '@/components/FunctionalitiesObjectivesPDF';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/useUserRole';
import Footer from '@/components/Footer';

// Import professional images
import heroImage from '@/assets/hero-address-system.jpg';
import featureSearch from '@/assets/feature-address-search.jpg';
import featureRegistration from '@/assets/feature-address-registration.jpg';
import featureEmergencyManagement from '@/assets/feature-emergency-management.jpg';
import EmergencyAlertProcessor from '@/components/EmergencyAlertProcessor';
import { PublicAccessPortal } from '@/components/PublicAccessPortal';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { SectionTransition } from '@/components/SectionTransition';

const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [emergencyPrefilledData, setEmergencyPrefilledData] = useState<any>(null);
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation(['common','address','emergency']);
  const navigate = useNavigate();
  const { isPoliceRole } = useUserRole();

  // All hooks must be called before any conditional returns
  const translateKey = (key: string, fallback?: string) => {
    const translated = t(key);
    const withoutNs = key.includes(':') ? key.split(':')[1] : key;
    return translated === key || translated === withoutNs
      ? (fallback ?? withoutNs.replace(/\./g, ' '))
      : translated;
  };

  const navFallbacks: Record<string, string> = {
    overview: 'Home',
    about: 'About',
    public: 'Search Addresses',
    emergency: 'Report Emergency',
    documentation: 'Documentation',
    help: 'Help',
  };

  const navFallbacksEs: Record<string, string> = {
    overview: 'Inicio',
    about: 'Acerca de',
    public: 'Buscar Direcciones',
    emergency: 'Reportar Emergencia',
    documentation: 'Documentación',
    help: 'Ayuda',
  };

  const navFallbacksFr: Record<string, string> = {
    overview: 'Accueil',
    about: 'À propos',
    public: 'Rechercher des adresses',
    emergency: 'Signaler une urgence',
    documentation: 'Documentation',
    help: 'Aide',
  };

  const getFallbackLabel = (id: string) => {
    const lang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    if (lang === 'es') return navFallbacksEs[id] ?? navFallbacks[id];
    if (lang === 'fr') return navFallbacksFr[id] ?? navFallbacks[id];
    return navFallbacks[id];
  };

  const navigationItems = useMemo(() => [
    { id: 'overview', labelKey: 'common:navigation.home', icon: MapPin },
    { id: 'about', labelKey: 'common:navigation.about', icon: Users },
    { id: 'public', labelKey: 'common:platform.searchAddresses', icon: Search },
    { id: 'emergency', labelKey: 'emergency:title', icon: Shield },
    { id: 'track', labelKey: 'postal:tracking.title', icon: Package, route: '/track' },
    { id: 'documentation', labelKey: 'common:navigation.documentation', icon: Book, route: '/documentation' },
    { id: 'help', labelKey: 'common:navigation.help', icon: HelpCircle },
  ], []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common:buttons.loading')}</p>
        </div>
      </div>
    );
  }

  // Main page is always accessible regardless of authentication status

  const handleNavigateToEmergency = (addressData?: any) => {
    console.log('Navigating to emergency with address data:', addressData);
    setEmergencyPrefilledData(addressData);
    setActiveSection('emergency');
  };

  const handleSectionChange = (newSection: string) => {
    // Clear all state when navigating to a new section
    if (newSection !== activeSection) {
      console.log(`Navigating from ${activeSection} to ${newSection} - clearing state`);
      
      // Clear emergency prefilled data when leaving emergency section
      if (activeSection === 'emergency' && newSection !== 'emergency') {
        setEmergencyPrefilledData(null);
      }
      
      // If going to emergency without prefilled data, clear any existing data
      if (newSection === 'emergency' && activeSection !== 'public') {
        setEmergencyPrefilledData(null);
      }
      
      setActiveSection(newSection);
    }
  };

  const getBreadcrumbItems = () => {
    const items = [
      {
        label: t('common:navigation.home'),
        onClick: () => handleSectionChange('overview'),
        isActive: activeSection === 'overview'
      }
    ];

    if (activeSection !== 'overview') {
      const currentSection = navigationItems.find(item => item.id === activeSection);
      if (currentSection) {
        items.push({
          label: translateKey(currentSection.labelKey, getFallbackLabel(currentSection.id)),
          onClick: () => handleSectionChange(activeSection),
          isActive: true
        });
      }
    }

    return items;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-12 sm:space-y-16">
            {/* Hero Section - Clean & Professional */}
            <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden rounded-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40"></div>
              </div>
              
              <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto py-12">
                <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/30 text-primary bg-primary/5">
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  {t('common:platform.nationalDigitalServicesPlatform')}
                </Badge>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
                  {t('common:platform.connectEG')}
                </h1>
                
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                  {t('common:platform.conEGDescription')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => navigate('/auth')} 
                    size="lg"
                    className="px-8 text-base font-semibold"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    {t('common:platform.accessPlatform')}
                  </Button>
                  <Button 
                    onClick={() => setActiveSection('about')}
                    variant="outline" 
                    size="lg"
                    className="px-8 text-base font-semibold"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    {t('common:platform.learnMore')}
                  </Button>
                </div>
              </div>
            </section>

            {/* Core Modules */}
            <section className="space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {t('common:platform.coreFunctionalities')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('common:platform.threeIntegratedSystems')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Address Registry */}
                <Card className="overflow-hidden border hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${featureSearch})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/30"></div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2.5">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{t('address:addressRegistrySystem')}</h3>
                        <p className="text-white/80 text-xs">{t('address:digitalAddressingInfrastructure')}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('address:comprehensiveDigitalAddressing')}
                    </p>
                    <ul className="space-y-1.5">
                      {[t('address:gpsBasedRegistrationPrecise'), t('address:multiLevelVerificationNAR'), t('address:uniqueUACCodesQR')].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Emergency Management */}
                <Card className="overflow-hidden border hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${featureEmergencyManagement})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-destructive/90 to-destructive/30"></div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2.5">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{t('emergency:management')}</h3>
                        <p className="text-white/80 text-xs">{t('emergency:policeEmergencyServices')}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('emergency:integratedEmergencyResponse')}
                    </p>
                    <ul className="space-y-1.5">
                      {[t('emergency:realtimeEmergencyAlerts'), t('emergency:automatedPoliceDispatch'), t('emergency:responseTimeTracking')].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Postal Delivery */}
                <Card className="overflow-hidden border hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${featureRegistration})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-secondary/30"></div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2.5">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{t('common:platform.postalDeliverySystem')}</h3>
                        <p className="text-white/80 text-xs">{t('common:platform.governmentPostalServices')}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('common:platform.postalDeliveryDescription')}
                    </p>
                    <ul className="space-y-1.5">
                      {[t('common:platform.uacAddressIntegration'), t('common:platform.realTimeTracking'), t('common:platform.proofOfDelivery')].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Platform Capabilities */}
            <section className="space-y-10">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { icon: Users, title: t('common:platform.multiLevelRoleSystem'), desc: t('common:platform.citizensFieldAgentsVerifiersRegistrarsOperators') },
                  { icon: FileText, title: t('common:platform.advancedDigitalDocumentation'), desc: t('common:platform.uniqueUACCodesQRAutomatedPDFs') },
                  { icon: BarChart3, title: t('common:platform.analyticsAndDashboards'), desc: t('common:platform.realtimeMetricsCoverageReportsPerformanceAnalysis') },
                  { icon: Globe, title: t('common:platform.multiLanguagePlatform'), desc: t('common:platform.completeLocalizationSpanishFrenchEnglish') },
                  { icon: Shield, title: t('common:platform.emergencyIntegration'), desc: t('common:platform.unifiedSystemAddressesEmergencyResponse') },
                  { icon: MapPin, title: t('common:platform.offlineCapabilities'), desc: t('common:platform.fullFunctionalityWithoutConnectionRemoteAreas') },
                ].map((feature, i) => (
                  <Card key={i} className="border hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-5 flex gap-4 items-start">
                      <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Objectives */}
            <section className="rounded-2xl border bg-muted/30 p-6 sm:p-10 space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {t('common:platform.platformObjectives')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('common:platform.transformingEquatorialGuineaExpanded')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { icon: MapPin, title: t('common:platform.digitalInfrastructure'), desc: t('common:platform.establishComprehensiveAddressing'), color: 'text-primary' },
                  { icon: Shield, title: t('common:platform.publicSafetyEnhancement'), desc: t('common:platform.modernizeEmergencyResponse'), color: 'text-destructive' },
                  { icon: Users, title: t('common:platform.citizenEmpowerment'), desc: t('common:platform.provideDirectAccessExpanded'), color: 'text-secondary' },
                  { icon: Package, title: t('common:platform.serviceIntegration'), desc: t('common:platform.serviceIntegrationDesc'), color: 'text-accent-foreground' },
                  { icon: BarChart3, title: t('common:platform.smartUrbanPlanning'), desc: t('common:platform.smartUrbanPlanningDesc'), color: 'text-primary' },
                  { icon: Shield, title: t('common:platform.dataExcellenceQuality'), desc: t('common:platform.ensureDataIntegrityAccuracySystemReliability'), color: 'text-secondary' },
                  { icon: BarChart3, title: t('common:platform.territorialCoverage'), desc: t('common:platform.achieveComprehensiveNationalCoverageRemoteAreas'), color: 'text-primary' },
                ].map((obj, i) => (
                  <Card key={i} className="border bg-background hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <obj.icon className={`h-5 w-5 ${obj.color}`} />
                        </div>
                        <h3 className="font-semibold text-sm leading-snug">{obj.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{obj.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-10">
            {/* Header with badge and icon */}
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                <Shield className="h-3 w-3 mr-1" />
                {translateKey('common:platform.governmentInitiative', 'Government Initiative')}
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">{t('common:navigation.about')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('common:platform.aboutConnectEG')}
              </p>
            </div>

            {/* Platform at a Glance - Statistics Row */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                {translateKey('common:platform.platformAtAGlance', 'Platform at a Glance')}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: MapPin, value: '8', label: translateKey('common:platform.provincesCovered', 'Provinces Covered') },
                  { icon: Fingerprint, value: '50,000+', label: translateKey('common:platform.registeredAddresses', 'Registered Addresses') },
                  { icon: Clock, value: '<3 min', label: translateKey('common:platform.emergencyResponseTime', 'Avg. Response Time') },
                  { icon: Users, value: '10,000+', label: translateKey('common:platform.activeUsers', 'Active Users') },
                ].map((stat, i) => (
                  <Card key={i} className="text-center">
                    <CardContent className="pt-5 pb-4 px-3">
                      <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Mission & Vision - Enhanced */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Target className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle>{t('common:platform.ourMission')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('common:platform.missionDescription')}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card border-l-4 border-l-secondary">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Eye className="h-5 w-5 text-secondary-foreground flex-shrink-0" />
                  <CardTitle>{t('common:platform.ourVision')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('common:platform.visionDescription')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                {translateKey('common:platform.howItWorks', 'How It Works')}
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: 1, icon: MapPin, title: translateKey('common:platform.registerAddress', 'Register Your Address'), desc: translateKey('common:platform.registerAddressDesc', 'Submit your location with GPS coordinates for precise identification.') },
                  { step: 2, icon: QrCode, title: translateKey('common:platform.receiveUAC', 'Receive Your UAC & QR'), desc: translateKey('common:platform.receiveUACDesc', 'Get a unique address code and scannable QR for instant verification.') },
                  { step: 3, icon: CheckCircle, title: translateKey('common:platform.accessServices', 'Access Services'), desc: translateKey('common:platform.accessServicesDesc', 'Use your digital address for deliveries, emergencies, and government services.') },
                ].map((item) => (
                  <Card key={item.step} className="relative overflow-hidden">
                    <div className="absolute top-3 right-3 text-4xl font-black text-muted/30 select-none">{item.step}</div>
                    <CardContent className="pt-6 pb-5 space-y-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Key Partners - Enhanced */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{t('common:platform.keyPartners')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { icon: Building, title: t('common:platform.ministryOfInterior'), desc: t('common:platform.governmentOversightPolicy') },
                    { icon: MapPin, title: t('common:platform.localGovernments'), desc: t('common:platform.provincialImplementation') },
                    { icon: Globe, title: t('common:platform.technologyPartners'), desc: t('common:platform.platformDevelopmentMaintenance') },
                  ].map((partner, i) => (
                    <div key={i} className="text-center p-5 border rounded-lg bg-muted/30">
                      <partner.icon className="h-6 w-6 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold text-foreground">{partner.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{partner.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Why ConEG? */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                {translateKey('common:platform.whyConEG', 'Why ConEG?')}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Fingerprint, title: translateKey('common:platform.digitalIdentity', 'Digital Identity'), desc: translateKey('common:platform.digitalIdentityDesc', 'A unique, verifiable code for every address in the country.') },
                  { icon: Ambulance, title: translateKey('common:platform.fasterEmergency', 'Faster Emergency Response'), desc: translateKey('common:platform.fasterEmergencyDesc', 'Precise location data enables rapid dispatch and saves lives.') },
                  { icon: Mail, title: translateKey('common:platform.reliableDelivery', 'Reliable Postal Delivery'), desc: translateKey('common:platform.reliableDeliveryDesc', 'Standardized addresses ensure packages reach the right destination.') },
                  { icon: LayoutDashboard, title: translateKey('common:platform.urbanPlanning', 'Data-Driven Planning'), desc: translateKey('common:platform.urbanPlanningDesc', 'Rich geographic data supports infrastructure and urban development.') },
                ].map((benefit, i) => (
                  <Card key={i}>
                    <CardContent className="pt-5 pb-4 space-y-2">
                      <benefit.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-sm text-foreground">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Call to Action */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-8 text-center space-y-4">
                <h3 className="text-xl font-bold text-foreground">
                  {translateKey('common:platform.readyToStart', 'Ready to Get Started?')}
                </h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {translateKey('common:platform.readyToStartDesc', 'Join thousands of citizens and institutions using ConEG for a connected, addressable nation.')}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => navigate('/auth')}>
                    <LogIn className="h-4 w-4 mr-1" />
                    {translateKey('common:platform.accessPlatform', 'Access Platform')}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSection('search')}>
                    <Search className="h-4 w-4 mr-1" />
                    {translateKey('common:platform.searchAddresses', 'Search Addresses')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">{t('common:platform.helpAndSupport')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('common:platform.findAnswersQuestions')}
              </p>
            </div>

            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('common:platform.frequentlyAskedQuestions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">{t('common:help.verificationTimeQuestion')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('common:help.verificationTimeAnswer')}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('common:help.trackSubmissionQuestion')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('common:help.trackSubmissionAnswer')}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('common:help.rejectedAddressQuestion')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('common:help.rejectedAddressAnswer')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('common:help.contactSupport')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">{t('common:help.emailSupport')}</h4>
                      <p className="text-sm text-muted-foreground">support@coneg.gov.gq</p>
                      <p className="text-xs text-muted-foreground">{t('common:help.responseTime')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('common:help.phoneSupport')}</h4>
                      <p className="text-sm text-muted-foreground">+240 XXX XXX XXX</p>
                      <p className="text-xs text-muted-foreground">{t('common:help.weekdayHours')}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{t('common:help.officeHours')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('common:help.officeSchedule')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Platform User Manual Section */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('common:platform.platformUserManual')}</CardTitle>
                  <p className="text-muted-foreground">
                    {t('common:help.userManualDescription')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">{t('common:help.gettingStarted')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:help.accountRegistration')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:help.accountRegistrationDescription')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:help.profileSetup')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:help.profileSetupDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">{t('common:help.addressRegistrationProcess')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:help.step1LocationInfo')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:help.step1Description')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:help.step2Coordinates')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:help.step2Description')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:help.step3Documentation')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:help.step3Description')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:help.step4Verification')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:help.step4Description')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">{t('common:help.addressRegistryUserRoles')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">{t('common:help.citizens')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:help.citizensDescription')}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">{t('common:help.fieldAgents')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:help.fieldAgentsDescription')}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">{t('common:help.verifiers')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:help.verifiersDescription')}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">{t('common:help.registrars')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:help.registrarsDescription')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">{t('common:platform.emergencyManagementSystem')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:platform.emergencyAlertSystem')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:platform.emergencyAlertDescription')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:platform.incidentManagement')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:platform.incidentManagementDescription')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{t('common:platform.unitCoordination')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('common:platform.unitCoordinationDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">{t('common:platform.emergencySystemUserRoles')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">{t('common:platform.emergencyOperators')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:platform.emergencyOperatorsDescription')}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">{t('common:platform.dispatchers')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:platform.dispatchersDescription')}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">{t('common:platform.supervisors')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:platform.supervisorsDescription')}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">{t('common:platform.fieldUnits')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('common:platform.fieldUnitsDescription')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
              
              {/* Value Proposition PDF Section */}
              <div className="mt-16 space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">Business Value Proposition</h2>
                  <p className="text-lg text-muted-foreground">
                    Download our comprehensive value proposition document with detailed analysis and infographics
                  </p>
                </div>
              <ValuePropositionPDF />
              <StoryboardsPDF />
            <BusinessModelCanvasPDF />
                  <BusinessModelCanvasPDFEnglish />
                  <FinancialAnalysisPDF />
                  <FinancialAnalysisPDFEnglish />
                  <ProcessFlowDiagramPDF />
                  <ProcessFlowDiagramPDFEnglish />
                  <FunctionalitiesObjectivesPDF />
              </div>
            </div>
          </div>
        );

      case 'public':
        return <PublicAccessPortal onNavigateToEmergency={handleNavigateToEmergency} />;

      case 'emergency':
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Enhanced Header */}
            <div className="text-center space-y-4">
              <Badge variant="destructive" className="text-xs tracking-wider uppercase">
                {t('common:platform.criticalService', { defaultValue: 'Critical Service' })}
              </Badge>
              <div className="flex justify-center">
                <div className="p-4 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-destructive">{t('common:platform.emergencyAlertSystem')}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('common:platform.emergencyAlertDescription')}
              </p>
            </div>

            {/* Safety Tips Alert */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                <Info className="h-4 w-4" />
                {t('common:platform.importantInfo', { defaultValue: 'Important Information' })}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 ml-6 list-disc">
                <li>{t('common:platform.safetyTip1', { defaultValue: 'Call 114 for immediate life-threatening emergencies' })}</li>
                <li>{t('common:platform.safetyTip2', { defaultValue: 'This form notifies local police dispatch automatically' })}</li>
                <li>{t('common:platform.safetyTip3', { defaultValue: 'Your GPS location is shared with responders' })}</li>
              </ul>
            </div>

            {/* Prefilled Address Enhancement */}
            {emergencyPrefilledData && (
              <Card className="border-info/30 bg-info/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-info/10 rounded-full shrink-0">
                      <MapPin className="h-5 w-5 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {t('common:platform.addressPrefilled', { defaultValue: 'Address Prefilled from Search' })}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{emergencyPrefilledData.street}, {emergencyPrefilledData.city}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">UAC: {emergencyPrefilledData.uac}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => setActiveSection('public')}>
                      {t('common:actions.change', { defaultValue: 'Change' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Form */}
            <EmergencyAlertProcessor 
              onSuccess={() => setActiveSection('overview')}
              prefilledAddress={emergencyPrefilledData}
            />

            {/* Emergency Contacts Footer */}
            <Separator />
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                  <Phone className="h-4 w-4" />
                  {t('common:platform.emergencyContacts', { defaultValue: 'Emergency Phone Numbers' })}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-destructive">114</div>
                    <div className="text-xs text-muted-foreground">{t('common:platform.police', { defaultValue: 'Police' })}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-destructive">115</div>
                    <div className="text-xs text-muted-foreground">{t('common:platform.fire', { defaultValue: 'Fire' })}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-destructive">116</div>
                    <div className="text-xs text-muted-foreground">{t('common:platform.medical', { defaultValue: 'Medical' })}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {t('common:platform.callVsForm', { defaultValue: 'For immediate danger, always call directly. Use this form for non-critical reports.' })}
                </p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'login':
        return (
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">{t('common:auth.accessYourAccount')}</h2>
              <p className="text-muted-foreground">
                {t('common:auth.signInDescription')}
              </p>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-center">{t('loginRequired')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <Button 
                    onClick={() => navigate(isPoliceRole ? '/police' : '/portal')} 
                    className="w-full"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('common:goToDashboard')}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="w-full"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('common:goToLoginPage')}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-center">{t('common:auth.newUser')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground mb-4">
                    {t('common:auth.registrationIntro')}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('common:auth.bulletFreeRegistration')}</li>
                    <li>• {t('common:auth.bulletSecureVerification')}</li>
                    <li>• {t('common:auth.bulletImmediateSearch')}</li>
                    <li>• {t('common:auth.bulletSubmitRequests')}</li>
                  </ul>
                </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-white shadow-sm border flex items-center justify-center">
                <img src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" alt="BIAKAM Logo" className="h-7 object-contain" />
              </div>
              <span className="text-lg font-bold text-foreground hidden sm:block">{t('common:platform.conEGPlatform')}</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.route ? navigate(item.route) : handleSectionChange(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{translateKey(item.labelKey, getFallbackLabel(item.id))}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {user ? (
                <Button size="sm" onClick={() => navigate('/dashboard')}>
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">{t('common:goToDashboard')}</span>
                </Button>
              ) : (
                <Button size="sm" onClick={() => navigate('/auth')}>
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">{t('common:auth.signIn')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="xl:hidden border-b bg-card/95 backdrop-blur-md sticky top-[53px] z-40 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 px-4 py-1.5 min-w-max">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => item.route ? navigate(item.route) : handleSectionChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {translateKey(item.labelKey, getFallbackLabel(item.id))}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Breadcrumb */}
      {activeSection !== 'overview' && (
        <div className="container mx-auto px-4 py-2 border-b">
          <BreadcrumbNavigation items={getBreadcrumbItems()} />
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12 overflow-hidden">
        <SectionTransition sectionKey={activeSection}>
          {renderContent()}
        </SectionTransition>
      </main>

      <Footer />
    </div>
  );
};

export default Index;