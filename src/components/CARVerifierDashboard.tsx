import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, UserCheck, Database, BarChart3, Clock,
  CheckCircle, AlertCircle, Search, Filter
} from "lucide-react";
import { useTranslation } from 'react-i18next';

// Import CAR-specific components
import { CitizenAddressVerificationManager } from './CitizenAddressVerificationManager';
import { CARAdministrativeOverview } from './CARAdministrativeOverview';

interface CARVerifierDashboardProps {
  onClose?: () => void;
}

export function CARVerifierDashboard({ onClose }: CARVerifierDashboardProps) {
  const { t } = useTranslation(['dashboard', 'address']);
  const [activeTab, setActiveTab] = useState('verification-queue');

  // CAR Verifier tabs - focused on citizen_address table verification only
  // Note: Residency verification (residency_ownership_verifications) requires separate authorization
  const verifierTabs = [
    { 
      id: 'verification-queue', 
      label: t('dashboard:verificationQueue'), 
      icon: UserCheck,
      description: t('dashboard:reviewPendingVerifications')
    },
    { 
      id: 'address-overview', 
      label: t('dashboard:addressOverview'), 
      icon: Database,
      description: t('dashboard:viewCarAddressData')
    },
    { 
      id: 'analytics', 
      label: t('dashboard:analytics'), 
      icon: BarChart3,
      description: t('dashboard:viewVerificationMetrics')
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'verification-queue':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:verificationQueue')}</h2>
                <p className="text-muted-foreground">{t('dashboard:reviewPendingVerifications')}</p>
              </div>
              <Badge variant="outline" className="bg-primary/10">
                <UserCheck className="h-3 w-3 mr-1" />
                {t('dashboard:carVerifier')}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('dashboard:pendingVerifications')}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard:awaitingReview')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('dashboard:verifiedToday')}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard:addressesProcessed')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('dashboard:flaggedItems')}
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard:requiresAttention')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('dashboard:averageProcessingTime')}
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4h</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard:perVerification')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <CitizenAddressVerificationManager />
          </div>
        );


      case 'address-overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:addressOverview')}</h2>
                <p className="text-muted-foreground">{t('dashboard:viewCarAddressData')}</p>
              </div>
              <Badge variant="outline" className="bg-database/10">
                <Database className="h-3 w-3 mr-1" />
                {t('dashboard:carData')}
              </Badge>
            </div>
            <CARAdministrativeOverview />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:verificationAnalytics')}</h2>
                <p className="text-muted-foreground">{t('dashboard:trackVerificationMetrics')}</p>
              </div>
              <Badge variant="outline" className="bg-chart/10">
                <BarChart3 className="h-3 w-3 mr-1" />
                {t('dashboard:metrics')}
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:weeklyVerificationTrend')}</CardTitle>
                  <CardDescription>
                    {t('dashboard:verificationVolumeOverTime')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {t('dashboard:chartPlaceholder')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:verificationAccuracyRate')}</CardTitle>
                  <CardDescription>
                    {t('dashboard:accuracyMetrics')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">94.2%</div>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard:accuracyThisMonth')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:regionDistribution')}</CardTitle>
                  <CardDescription>
                    {t('dashboard:verificationsByRegion')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Bioko Norte</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Litoral</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Centro Sur</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Others</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:recentActivity')}</CardTitle>
                  <CardDescription>
                    {t('dashboard:latestVerificationActions')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('dashboard:addressVerified')}</span>
                      <span className="text-xs text-muted-foreground">2m ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{t('dashboard:documentFlagged')}</span>
                      <span className="text-xs text-muted-foreground">5m ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('dashboard:residencyConfirmed')}</span>
                      <span className="text-xs text-muted-foreground">8m ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>{t('dashboard:selectTabViewContent')}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard:carVerifierDashboard')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard:carVerifierDescription')}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            {t('dashboard:close')}
          </Button>
        )}
      </div>

      {/* Welcome Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          {t('dashboard:carVerifierWelcomeMessage')}
        </AlertDescription>
      </Alert>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {verifierTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </Tabs>
    </div>
  );
}

export default CARVerifierDashboard;