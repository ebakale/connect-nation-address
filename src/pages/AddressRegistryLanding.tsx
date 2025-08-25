import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Users, FileText, HelpCircle, Book, LogIn, CheckCircle, Globe, BarChart3, ArrowLeft, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Import professional images
import heroImage from '@/assets/hero-address-system.jpg';
import featureSearch from '@/assets/feature-address-search.jpg';
import featureRegistration from '@/assets/feature-address-registration.jpg';
import featureVerification from '@/assets/feature-address-verification.jpg';

const AddressRegistryLanding = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationItems = [
    { id: 'overview', label: t('overview'), icon: MapPin },
    { id: 'about', label: t('about'), icon: Users },
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
            <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20"></div>
              </div>
              
              <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
                <div className="space-y-8 animate-fade-in">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg backdrop-blur-sm border border-white/20">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{t('nationalAddressRegistry')}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent leading-tight">
                      <span className="block">{t('equatorialGuinea')}</span>
                      <span className="block text-5xl font-bold text-foreground/90 mt-2">
                        {t('addressRegistration')}
                      </span>
                    </h1>
                  </div>
                  
                  <p className="text-xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
                    {t('heroSubtitle')} 
                    <span className="text-primary font-medium"> {t('heroDescription')} </span>
                    {t('heroDescriptionExtended')}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button 
                      onClick={() => navigate('/auth')} 
                      className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-blue transition-all duration-200"
                      size="lg"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      {t('accessSystemNow')}
                    </Button>
                    <Button 
                      onClick={() => setActiveSection('about')}
                      variant="outline" 
                      className="px-8 py-4 text-lg font-semibold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white shadow-green transition-all duration-200"
                      size="lg"
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      {t('discoverMore')}
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
                <h2 className="text-5xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                  {t('advancedFeatures')}
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('featuresSubtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature Cards */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-primary/5 border-2 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300">
                  <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: `url(${featureSearch})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Search className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{t('smartSearch')}</h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {t('smartSearchDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/10 hover:border-secondary/30 shadow-lg hover:shadow-green transform hover:scale-105 transition-all duration-300">
                  <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: `url(${featureRegistration})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{t('quickRegistration')}</h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {t('quickRegistrationDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/10 hover:border-destructive/30 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300">
                  <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: `url(${featureVerification})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-destructive/80 via-destructive/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{t('secureVerification')}</h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {t('secureVerificationDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                {t('aboutSystem')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                {t('aboutDescription')}
              </p>
            </div>
            {/* Add more about content */}
          </div>
        );

      case 'help':
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                {t('helpSupport')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                {t('helpDescription')}
              </p>
            </div>
            {/* Add help content */}
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
                {t('systemManual')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                {t('manualDescription')}
              </p>
            </div>
            {/* Add manual content */}
          </div>
        );

      case 'login':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{t('accessSystem')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-primary to-primary/90"
                  size="lg"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  {t('login')}
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
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
              <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{t('addressRegistrySystem')}</h1>
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
                      ? 'bg-primary text-primary-foreground shadow-lg'
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

export default AddressRegistryLanding;