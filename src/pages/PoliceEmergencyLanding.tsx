import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Radio, Users, HelpCircle, Book, LogIn, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import EmergencyAlertProcessor from '@/components/EmergencyAlertProcessor';

const PoliceEmergencyLanding = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationItems = [
    { id: 'overview', label: t('overview'), icon: Shield },
    { id: 'emergency', label: t('emergencyAlerts'), icon: AlertTriangle },
    { id: 'help', label: t('help'), icon: HelpCircle },
    { id: 'manual', label: t('manual'), icon: Book },
    { id: 'login', label: t('login'), icon: LogIn },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-destructive/10 via-destructive/5 to-background">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--destructive)/0.15),transparent_50%),radial-gradient(circle_at_70%_60%,hsl(var(--destructive)/0.1),transparent_50%)]"></div>
              
              <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
                <div className="space-y-8 animate-fade-in">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-destructive to-destructive/90 text-white shadow-lg backdrop-blur-sm border border-white/20">
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{t('policeEmergencySystem')}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent leading-tight">
                      <span className="block">{t('emergencyResponse')}</span>
                      <span className="block text-5xl font-bold text-foreground/90 mt-2">
                        {t('commandCenter')}
                      </span>
                    </h1>
                  </div>
                  
                  <p className="text-xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
                    {t('emergencySystemDescription')}
                    <span className="text-destructive font-medium"> {t('realTimeOperations')} </span>
                    {t('criticalResponseCapabilities')}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button 
                      onClick={() => navigate('/auth')} 
                      className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive shadow-red transition-all duration-200"
                      size="lg"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      {t('accessEmergencySystem')}
                    </Button>
                    <Button 
                      onClick={() => setActiveSection('emergency')}
                      variant="outline" 
                      className="px-8 py-4 text-lg font-semibold border-2 border-destructive text-destructive hover:bg-destructive hover:text-white shadow-red transition-all duration-200"
                      size="lg"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {t('reportEmergency')}
                    </Button>
                  </div>

                  <div className="pt-4">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-16">
              <div className="text-center space-y-6">
                <h2 className="text-5xl font-black bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent">
                  {t('emergencyCapabilities')}
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('emergencyFeaturesSubtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Emergency Dispatch */}
                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{t('emergencyDispatch')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('emergencyDispatchDesc')}
                    </p>
                  </CardContent>
                </Card>

                {/* Unit Management */}
                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{t('unitManagement')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('unitManagementDesc')}
                    </p>
                  </CardContent>
                </Card>

                {/* Real-time Communication */}
                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <Radio className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{t('realTimeCommunication')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('communicationDesc')}
                    </p>
                  </CardContent>
                </Card>

                {/* Incident Tracking */}
                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{t('incidentTracking')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('incidentTrackingDesc')}
                    </p>
                  </CardContent>
                </Card>

                {/* Response Time Analytics */}
                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{t('responseAnalytics')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('responseAnalyticsDesc')}
                    </p>
                  </CardContent>
                </Card>

                {/* Emergency Coordination */}
                <Card className="group bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{t('emergencyCoordination')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('coordinationDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-black bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent">
                {t('emergencyAlertSystem')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                {t('emergencyAlertDescription')}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <EmergencyAlertProcessor />
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-black bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent">
                {t('emergencyHelp')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                {t('emergencyHelpDescription')}
              </p>
            </div>
            {/* Add emergency help content */}
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-black bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent">
                {t('emergencyManual')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                {t('emergencyManualDescription')}
              </p>
            </div>
            {/* Add emergency manual content */}
          </div>
        );

      case 'login':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md border-destructive/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-destructive">{t('accessEmergencySystem')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-destructive to-destructive/90"
                  size="lg"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  {t('emergencyLogin')}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-destructive/5 to-destructive/10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToSelector')}
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-destructive to-destructive/80 rounded-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{t('policeEmergencySystem')}</h1>
              </div>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 py-4 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-destructive text-destructive-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default PoliceEmergencyLanding;