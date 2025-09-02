import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Users, Search, FileText, HelpCircle, Book, LogIn, CheckCircle, Globe, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';
import Footer from '@/components/Footer';

// Import professional images
import heroImage from '@/assets/hero-address-system.jpg';
import featureSearch from '@/assets/feature-address-search.jpg';
import featureRegistration from '@/assets/feature-address-registration.jpg';
import featureEmergencyManagement from '@/assets/feature-emergency-management.jpg';
import EmergencyAlertProcessor from '@/components/EmergencyAlertProcessor';

const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isPoliceRole } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Main page is always accessible regardless of authentication status

const navigationItems = [
    { id: 'overview', label: t('overview'), icon: MapPin },
    { id: 'about', label: t('about'), icon: Users },
    { id: 'emergency', label: t('emergency'), icon: Shield },
    { id: 'help', label: t('help'), icon: HelpCircle },
  ];

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
                    <span className="text-sm sm:text-base font-semibold">{t('connectEGPlatform')}</span>
                  </div>
                  
                  {/* Main Heading */}
                  <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent leading-tight mobile-container">
                       <span className="block">{t('connectEG')}</span>
                        <span className="block text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground/90 mt-1">
                          {t('digitalPlatform')}
                        </span>
                    </h1>
                  </div>
                  
                  {/* Subtitle */}
                   <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/70 max-w-4xl mx-auto leading-relaxed font-light mobile-text-responsive mobile-container">
                     {t('connectEGDescription')}
                     <span className="text-primary font-medium"> {t('connectingCitizensServices')} </span>
                     {t('innovativeTechnology')}
                   </p>
                  
                   {/* CTA Buttons */}
                   <div className="flex flex-col gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 mobile-container">
                       <Button 
                         onClick={() => navigate('/auth')} 
                         className="touch-target px-6 py-3 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-blue transition-all duration-200"
                         size="lg"
                       >
                        <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        {t('accessPlatform')}
                      </Button>
                     <Button 
                       onClick={() => setActiveSection('about')}
                       variant="outline" 
                       className="touch-target px-6 py-3 text-sm sm:text-base font-semibold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white shadow-green transition-all duration-200"
                       size="lg"
                     >
                       <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                       {t('learnMore')}
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
                    <span className="text-sm font-medium text-primary">{t('dualCorePlatform')}</span>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                  {t('coreFunctionalities')}
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('twoIntegratedSystems')}
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
                          <h3 className="text-3xl font-bold text-white">{t('addressRegistrySystem')}</h3>
                          <p className="text-blue-100 text-lg">{t('digitalAddressingInfrastructure')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {t('comprehensiveDigitalAddressing')}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('gpsBasedRegistration')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('multiLevelVerification')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('smartSearchDiscovery')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{t('digitalDocumentationQR')}</span>
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
                          <h3 className="text-3xl font-bold text-white">{t('emergencyManagement')}</h3>
                          <p className="text-red-100 text-lg">{t('policeEmergencyServices')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                       <p className="text-muted-foreground leading-relaxed text-lg">
                         {t('integratedEmergencyResponse')}
                       </p>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3">
                           <CheckCircle className="h-5 w-5 text-destructive" />
                           <span className="text-sm">{t('realtimeIncidentReporting')}</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <CheckCircle className="h-5 w-5 text-destructive" />
                           <span className="text-sm">{t('gpsBasedUnitDispatch')}</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <CheckCircle className="h-5 w-5 text-destructive" />
                           <span className="text-sm">{t('multiChannelCommunications')}</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <CheckCircle className="h-5 w-5 text-destructive" />
                           <span className="text-sm">{t('analyticsResponseTracking')}</span>
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
                      <CardTitle className="text-lg font-bold">{t('roleBasedAccess')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground leading-relaxed text-sm">
                       {t('advancedRoleManagement')}
                     </p>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-white to-primary/5 border-2 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('digitalDocumentationFeature')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground leading-relaxed text-sm">
                       {t('automatedDocumentGeneration')}
                     </p>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('realtimeAnalyticsFeature')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground leading-relaxed text-sm">
                       {t('comprehensiveReporting')}
                     </p>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-white to-accent/5 border-2 border-accent/10 hover:border-accent/30 shadow-lg hover:shadow-yellow transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-2xl">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('multiLanguageFeature')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground leading-relaxed text-sm">
                       {t('fullPlatformLocalization')}
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
                      <span className="text-sm font-medium text-primary">{t('strategicGoals')}</span>
                    </div>
                  </div>
                   <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                     {t('platformObjectives')}
                   </h2>
                   <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                     {t('transformingEquatorialGuinea')}
                   </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="group p-8 bg-gradient-to-br from-white to-primary/5 rounded-2xl border-2 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('digitalInfrastructure')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                     <p className="text-muted-foreground leading-relaxed">
                       {t('establishComprehensiveAddressing')}
                     </p>
                  </div>
                  
                  <div className="group p-8 bg-gradient-to-br from-white to-destructive/5 rounded-2xl border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('publicSafetyEnhancement')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-destructive to-destructive/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                     <p className="text-muted-foreground leading-relaxed">
                       {t('modernizeEmergencyResponse')}
                     </p>
                  </div>

                  <div className="group p-8 bg-gradient-to-br from-white to-secondary/5 rounded-2xl border-2 border-secondary/10 hover:border-secondary/30 shadow-lg hover:shadow-green transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('citizenEmpowerment')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-secondary to-secondary/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                     <p className="text-muted-foreground leading-relaxed">
                       {t('provideDirectAccess')}
                     </p>
                  </div>
                  
                  <div className="group p-8 bg-gradient-to-br from-white to-destructive/5 rounded-2xl border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl shadow-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('smartUrbanPlanning')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-destructive to-destructive/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('smartUrbanPlanningDesc')}
                    </p>
                  </div>
                  
                  <div className="group p-8 bg-gradient-to-br from-white to-primary/5 rounded-2xl border-2 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t('dataExcellence')}</h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/60 rounded-full mb-3"></div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('dataExcellenceDesc')}
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
               <h2 className="text-3xl font-bold">{t('about')}</h2>
               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                 {t('aboutConnectEG')}
               </p>
             </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('ourMission')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('missionDescription')}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('ourVision')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('visionDescription')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{t('keyPartners')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">{t('ministryOfInterior')}</h3>
                    <p className="text-sm text-muted-foreground">{t('governmentOversightPolicy')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">{t('localGovernments')}</h3>
                    <p className="text-sm text-muted-foreground">{t('provincialImplementation')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">{t('technologyPartners')}</h3>
                    <p className="text-sm text-muted-foreground">{t('platformDevelopmentMaintenance')}</p>
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
              <h2 className="text-3xl font-bold">{t('helpAndSupport')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('findAnswersQuestions')}
              </p>
            </div>

            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('frequentlyAskedQuestions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">How long does address verification take?</h4>
                      <p className="text-sm text-muted-foreground">
                        Address verification typically takes 3-5 business days. Field agents need to visit the location 
                        for verification before registrars can approve the address.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Can I track my address submission?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, you can track the status of your submission in your dashboard. 
                        You'll receive notifications for status updates.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">What if my address is rejected?</h4>
                      <p className="text-sm text-muted-foreground">
                        If your address is rejected, you'll receive feedback explaining the reason. 
                        You can resubmit with corrected information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Email Support</h4>
                      <p className="text-sm text-muted-foreground">support@connecteg.gov.gq</p>
                      <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">+240 XXX XXX XXX</p>
                      <p className="text-xs text-muted-foreground">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Office Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 8:00 AM - 5:00 PM<br />
                      Saturday: 9:00 AM - 1:00 PM
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Platform User Manual Section */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('platformUserManual')}</CardTitle>
                  <p className="text-muted-foreground">
                    Comprehensive guide for using both Address Registry and Emergency Management systems.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">1. Account Registration</h4>
                        <p className="text-sm text-muted-foreground">
                          Create an account using your email address and a secure password. 
                          Verify your email to activate your account.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">2. Profile Setup</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete your profile with accurate personal information. 
                          This helps us verify your identity for address submissions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">Address Registration Process</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Step 1: Location Information</h4>
                        <p className="text-sm text-muted-foreground">
                          Select the correct province and city, then provide street and building details.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Step 2: Coordinates</h4>
                        <p className="text-sm text-muted-foreground">
                          Use the "Get Current Location" button or manually enter GPS coordinates. 
                          Accurate coordinates are essential for verification.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Step 3: Documentation</h4>
                        <p className="text-sm text-muted-foreground">
                          Upload a clear photo of the location and provide any additional description 
                          that helps identify the address.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Step 4: Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          Submit your request for review. Field agents will verify the location 
                          and registrars will approve the final address code.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">Address Registry User Roles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Citizens</h4>
                          <p className="text-sm text-muted-foreground">
                            Can search for addresses, submit new address requests, and view their submissions.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Field Agents</h4>
                          <p className="text-sm text-muted-foreground">
                            Verify address locations on-site and approve or reject submissions based on field visits.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Verifiers</h4>
                          <p className="text-sm text-muted-foreground">
                            Review field agent reports and conduct additional verification if needed.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Registrars</h4>
                          <p className="text-sm text-muted-foreground">
                            Generate official UAC codes and publish verified addresses to the national registry.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">Emergency Management System</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Emergency Alert System</h4>
                        <p className="text-sm text-muted-foreground">
                          Citizens can send emergency alerts directly to police and emergency services. The system includes GPS location sharing and real-time communication.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Incident Management</h4>
                        <p className="text-sm text-muted-foreground">
                          Police and emergency operators manage incidents through real-time dashboards, unit dispatch, and status tracking.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Unit Coordination</h4>
                        <p className="text-sm text-muted-foreground">
                          Emergency units can communicate, request backup, and coordinate response efforts through integrated communication tools.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">Emergency System User Roles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Emergency Operators</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive and process emergency alerts, dispatch units, and monitor incident status.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Dispatchers</h4>
                          <p className="text-sm text-muted-foreground">
                            Coordinate unit assignments and manage real-time communication between operators and field units.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Supervisors</h4>
                          <p className="text-sm text-muted-foreground">
                            Oversee operations, assign operators to incidents, and ensure proper response protocols.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Field Units</h4>
                          <p className="text-sm text-muted-foreground">
                            Respond to incidents, update status in real-time, and communicate with dispatch for coordination.
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

      case 'emergency':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-red-600">Emergency Alert System</h2>
              <p className="text-lg text-muted-foreground">
                Send emergency alerts directly to police and emergency services
              </p>
            </div>
            <EmergencyAlertProcessor />
          </div>
        );
        
      case 'login':
        return (
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Access Your Account</h2>
              <p className="text-muted-foreground">
                Sign in to submit address requests, track your submissions, and access the registry.
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
                <CardTitle className="text-center">New User?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-4">
                  Don't have an account yet? The registration process is quick and secure.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Free account registration</li>
                  <li>• Secure email verification</li>
                  <li>• Immediate access to search features</li>
                  <li>• Submit address registration requests</li>
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
              <span className="text-xl sm:text-2xl font-bold text-gradient text-center">{t('connectEGPlatform')}</span>
            </div>
            <div className="flex items-center gap-3 absolute right-0">
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
                    setActiveSection(item.id);
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {renderContent()}
      </main>

      <Footer />
    </div>
  );
};

export default Index;