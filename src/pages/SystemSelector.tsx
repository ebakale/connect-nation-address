import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Shield, ArrowRight, Users, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const SystemSelector = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('equatorialGuinea')}</h1>
              <p className="text-sm text-muted-foreground">{t('digitalSystems')}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent">
              {t('selectYourSystem')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('chooseSystemDescription')}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Address Registry System */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-primary/5 border-2 border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-blue transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <CardHeader className="relative text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary to-primary/80 rounded-3xl w-fit">
                <MapPin className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {t('addressRegistrySystem')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('addressSystemDescription')}
              </p>
            </CardHeader>

            <CardContent className="relative space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>{t('addressRegistration')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>{t('addressVerification')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>{t('addressSearch')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>{t('citizenServices')}</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/address-registry')}
                className="w-full group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                size="lg"
              >
                {t('accessAddressSystem')}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Police Emergency System */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-destructive/5 border-2 border-destructive/20 hover:border-destructive/40 shadow-lg hover:shadow-red transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <CardHeader className="relative text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-destructive to-destructive/80 rounded-3xl w-fit">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {t('policeEmergencySystem')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('emergencySystemDescription')}
              </p>
            </CardHeader>

            <CardContent className="relative space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-destructive rounded-full"></div>
                  <span>{t('emergencyDispatch')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-destructive rounded-full"></div>
                  <span>{t('unitManagement')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-destructive rounded-full"></div>
                  <span>{t('incidentTracking')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-destructive rounded-full"></div>
                  <span>{t('realTimeOperations')}</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/police-emergency')}
                className="w-full group bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive"
                size="lg"
              >
                {t('accessEmergencySystem')}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{t('secureAuthenticatedAccess')}</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            {t('systemSelectorFooter')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSelector;