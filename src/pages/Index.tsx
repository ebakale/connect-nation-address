import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Users, Search, FileText, HelpCircle, Book, LogIn, CheckCircle, Globe, BarChart3 } from 'lucide-react';
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
  const { t } = useTranslation(['common','address','emergency']);
  const navigate = useNavigate();
  const { isPoliceRole } = useUserRole();

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

const navigationItems = [
    { id: 'overview', label: t('common:navigation.home'), icon: MapPin },
    { id: 'about', label: t('common:navigation.about'), icon: Users },
    { id: 'public', label: t('common:platform.searchAddresses'), icon: Search },
    { id: 'emergency', label: t('emergency:title'), icon: Shield },
    { id: 'help', label: t('common:navigation.help'), icon: HelpCircle },
  ];

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
          label: currentSection.label,
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
          <div className="space-y-16">
            {/* Mobile-optimized Hero Section */}
            <div className="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5 mobile-container">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--system-blue)/0.1),transparent_50%),radial-gradient(circle_at_70%_60%,hsl(var(--system-green)/0.1),transparent_50%),radial-gradient(circle_at_40%_80%,hsl(var(--system-red)/0.05),transparent_50%)]"></div>
              
              {/* Hero Image with overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20"></div>
              </div>
              
              <div className="relative z-10 text-center mobile-spacing max-w-6xl mobile-container">
                <div className="space-y-6 sm:space-y-8 animate-fade-in">
                  {/* Badge */}
                  <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg backdrop-blur-sm border border-white/20">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base font-semibold">{t('common:platform.connectEGPlatform')}</span>
                  </div>
                  
                  {/* Main Heading */}
                  <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent leading-tight mobile-container">
                       <span className="block">{t('common:platform.connectEG')}</span>
                        <span className="block text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground/90 mt-1">
                          {t('common:platform.digitalPlatform')}
                        </span>
                    </h1>
                  </div>
                  
                  {/* Subtitle */}
                   <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/70 max-w-4xl mx-auto leading-relaxed font-light mobile-text-responsive mobile-container">
                     {t('common:platform.connectEGDescription')}
                     <span className="text-primary font-medium"> {t('common:platform.connectingCitizensServices')} </span>
                     {t('common:platform.innovativeTechnology')}
                   </p>
                   
                   {/* CTA Buttons */}
                   <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 mobile-container">
                        <Button 
                          onClick={() => navigate('/auth')} 
                          className="touch-target px-8 py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-blue transition-all duration-200"
                          size="lg"
                        >
                         <Shield className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                         <div className="flex flex-col items-start">
                           <span>{t('common:platform.accessPlatform')}</span>
                           <span className="text-xs text-white/80 font-normal">{t('common:platform.accessSubtitle')}</span>
                         </div>
                       </Button>
                       <Button 
                         onClick={() => setActiveSection('about')}
                         variant="outline" 
                         className="touch-target px-6 py-4 text-base sm:text-lg font-semibold border-2 border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                         size="lg"
                       >
                         <Globe className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                         {t('common:platform.learnMore')}
                       </Button>
                     </div>

                </div>
              </div>
            </div>

            {/* Core Modules Section */}
            <div className="space-y-16">
              <div className="text-center space-y-6">
                <div className="inline-block p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-primary">{t('common:platform.dualCorePlatform')}</span>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                  {t('common:platform.coreFunctionalities')}
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('common:platform.twoIntegratedSystems')}
                </p>
              </div>

              {/* Main Module Cards */}
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                {/* Address Registry Module */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-primary/5 border-2 border-primary/10 hover:border-primary/30 shadow-xl hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${featureSearch})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-white">{t('address:addressRegistrySystem')}</h3>
                          <p className="text-blue-100 text-lg">{t('address:digitalAddressingInfrastructure')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {t('address:comprehensiveDigitalAddressing')}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('address:gpsBasedRegistration')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('address:multiLevelVerification')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('address:smartSearchDiscovery')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('address:digitalDocumentationQR')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Management Module */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-xl hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${featureEmergencyManagement})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-destructive/90 via-destructive/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-white">{t('emergency:management')}</h3>
                          <p className="text-red-100 text-lg">{t('emergency:policeEmergencyServices')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="relative p-8">
                     <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {t('emergency:integratedEmergencyResponse')}
                        </p>
                       <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm">{t('emergency:realtimeIncidentReporting')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm">{t('emergency:gpsBasedUnitDispatch')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm">{t('emergency:multiChannelCommunications')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm">{t('emergency:analyticsResponseTracking')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm">{t('common:platform.integratedAddressVerification')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm">{t('common:platform.crossModuleDataIntelligence')}</span>
                          </div>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/10 hover:border-secondary/30 shadow-lg hover:shadow-green transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('common:platform.roleBasedAccess')}</CardTitle>
                    </div>
                  </CardHeader>
                   <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {t('common:platform.advancedRoleManagement')}
                      </p>
                   </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-white to-primary/5 border-2 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('common:platform.digitalDocumentationFeature')}</CardTitle>
                    </div>
                  </CardHeader>
                   <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {t('common:platform.digitalDocumentationDescription')}
                      </p>
                   </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('common:platform.realtimeAnalyticsFeature')}</CardTitle>
                    </div>
                  </CardHeader>
                   <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {t('common:platform.realtimeAnalyticsDescription')}
                      </p>
                   </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-white to-accent/5 border-2 border-accent/10 hover:border-accent/30 shadow-lg hover:shadow-yellow transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-2xl">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('common:platform.multiLanguageFeature')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground leading-relaxed text-sm">
                       {t('common:platform.fullPlatformLocalization')}
                     </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Objectives Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-primary/5 to-secondary/5 border border-primary/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--system-blue)/0.1),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--system-green)/0.1),transparent_40%)]"></div>
              
              <div className="relative p-8 md:p-12">
                <div className="text-center space-y-6 mb-12">
                  <div className="inline-block p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{t('common:platform.strategicGoals')}</span>
                    </div>
                   </div>
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                      {t('common:platform.platformObjectives')}
                    </h2>
                   <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                     {t('common:platform.transformingEquatorialGuinea')}
                   </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="group p-8 bg-gradient-to-br from-white to-primary/5 rounded-2xl border-2 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('common:platform.digitalInfrastructure')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                     <p className="text-muted-foreground leading-relaxed">
                       {t('common:platform.establishComprehensiveAddressing')}
                     </p>
                  </div>
                  
                  <div className="group p-8 bg-gradient-to-br from-white to-destructive/5 rounded-2xl border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('common:platform.publicSafetyEnhancement')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-destructive to-destructive/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                     <p className="text-muted-foreground leading-relaxed">
                       {t('common:platform.modernizeEmergencyResponse')}
                     </p>
                  </div>

                  <div className="group p-8 bg-gradient-to-br from-white to-secondary/5 rounded-2xl border-2 border-secondary/10 hover:border-secondary/30 shadow-lg hover:shadow-green transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('common:platform.citizenEmpowerment')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-secondary to-secondary/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                     <p className="text-muted-foreground leading-relaxed">
                       {t('common:platform.provideDirectAccess')}
                     </p>
                  </div>
                  
                  <div className="group p-8 bg-gradient-to-br from-white to-destructive/5 rounded-2xl border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl shadow-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('common:platform.smartUrbanPlanning')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-destructive to-destructive/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('common:platform.smartUrbanPlanningDesc')}
                    </p>
                  </div>
                  
                  <div className="group p-8 bg-gradient-to-br from-white to-primary/5 rounded-2xl border-2 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('common:platform.dataExcellence')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('common:platform.dataExcellenceDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                    variant="hero"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('goToDashboard')}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="w-full"
                    variant="hero"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('goToLoginPage')}
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
    <div className="min-h-screen bg-gradient-hero relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/20 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-cyan/20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 rounded-full bg-success/20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 rounded-full bg-warning/20 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-primary/20 sticky top-0 glass backdrop-blur-xl z-50 shadow-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-xl bg-white shadow-lg flex items-center justify-center">
                <img src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" alt="BIAKAM Logo" className="h-8 object-contain" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gradient text-center">{t('common:platform.conEGPlatform')}</span>
            </div>
            <div className="flex items-center gap-3 absolute right-0">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-primary/20 glass relative z-50">
        <div className="container mx-auto px-4">
          <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-4 overflow-x-hidden">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleSectionChange(item.id);
                  }}
                  className={`flex items-center gap-1 sm:gap-2 py-3 px-2 sm:px-3 border-b-2 text-xs sm:text-sm transition-all duration-300 animate-fade-in cursor-pointer hover:bg-primary/5 ${
                    activeSection === item.id
                      ? 'border-primary text-primary shadow-glow text-neon'
                      : 'border-transparent text-muted-foreground hover:text-cyan hover:border-cyan/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${activeSection === item.id ? 'glow-pulse' : ''}`} />
                  <span className="text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      {activeSection !== 'overview' && (
        <div className="container mx-auto px-4 py-2 border-b border-muted">
          <BreadcrumbNavigation items={getBreadcrumbItems()} />
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <SectionTransition sectionKey={activeSection}>
          {renderContent()}
        </SectionTransition>
      </main>

      <Footer />
    </div>
  );
};

export default Index;