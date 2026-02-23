import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Users, Search, FileText, HelpCircle, Book, LogIn, CheckCircle, Globe, BarChart3, Package, Truck } from 'lucide-react';
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
          <div className="space-y-8">
             <div className="text-center space-y-4">
               <h2 className="text-3xl font-bold">{t('common:navigation.about')}</h2>
               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                 {t('common:platform.aboutConnectEG')}
               </p>
             </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('common:platform.ourMission')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('common:platform.missionDescription')}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('common:platform.ourVision')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('common:platform.visionDescription')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{t('common:platform.keyPartners')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">{t('common:platform.ministryOfInterior')}</h3>
                    <p className="text-sm text-muted-foreground">{t('common:platform.governmentOversightPolicy')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">{t('common:platform.localGovernments')}</h3>
                    <p className="text-sm text-muted-foreground">{t('common:platform.provincialImplementation')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">{t('common:platform.technologyPartners')}</h3>
                    <p className="text-sm text-muted-foreground">{t('common:platform.platformDevelopmentMaintenance')}</p>
                  </div>
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
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-red-600">{t('common:platform.emergencyAlertSystem')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('common:platform.emergencyAlertDescription')}
              </p>
              {emergencyPrefilledData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800 font-medium">{t('common:platform.addressPrefilled')}:</p>
                  <p className="text-sm text-blue-600">{emergencyPrefilledData.street}, {emergencyPrefilledData.city}</p>
                  <p className="text-xs text-blue-500">UAC: {emergencyPrefilledData.uac}</p>
                </div>
              )}
            </div>
            <EmergencyAlertProcessor 
              onSuccess={() => setActiveSection('overview')}
              prefilledAddress={emergencyPrefilledData}
            />
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
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 gap-2">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
              <img src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" alt="BIAKAM Logo" className="h-5 w-auto" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate leading-tight">
                {t('common:platform.conEGPlatform')}
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block leading-tight">
                {t('common:platform.nationalDigitalServicesPlatform')}
              </p>
            </div>
          </div>
          
          {/* Center: Desktop Navigation */}
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

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            {user ? (
              <Button size="sm" onClick={() => navigate('/dashboard')} className="h-8 text-xs">
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">{t('common:goToDashboard')}</span>
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')} className="h-8 text-xs">
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">{t('common:auth.signIn')}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="xl:hidden border-b bg-card/95 backdrop-blur-md sticky top-[49px] z-40 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 px-3 py-1.5 min-w-max">
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