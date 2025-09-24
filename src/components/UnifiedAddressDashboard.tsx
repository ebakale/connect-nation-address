import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, Home, Shield, Users, BarChart3, Settings, 
  Building2, FileText, Clock, CheckCircle, AlertCircle,
  Database, Network, Search, UserCheck, Workflow
} from "lucide-react";

// Import existing components
import { useUserRole } from "@/hooks/useUserRole";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";

// Import NAR components
import { VerificationTools } from './VerificationTools';
import { AddressVerificationQueue } from './AddressVerificationQueue';
import { AddressPublishingQueue } from './AddressPublishingQueue';
import { AddressUnpublishingQueue } from './AddressUnpublishingQueue';
import { NARAuthorityManager } from './NARAuthorityManager';

// Import CAR components  
import { CitizenAddressPortal } from './CitizenAddressPortal';
import { CitizenAddressVerificationManager } from './CitizenAddressVerificationManager';
import { ResidencyVerificationManager } from './ResidencyVerificationManager';
import { UserVerificationRequests } from './UserVerificationRequests';
import { CARAdministrativeOverview } from './CARAdministrativeOverview';

// Import shared components
import AddressSearch from './AddressSearch';
import { AddressRequestForm } from './AddressRequestForm';
import { AddressRequestStatus } from './AddressRequestStatus';
import { NARCARTestPanel } from './NARCARTestPanel';
import AdminPanel from './AdminPanel';

interface UnifiedAddressDashboardProps {
  onClose?: () => void;
}

export function UnifiedAddressDashboard({ onClose }: UnifiedAddressDashboardProps) {
  const { t } = useTranslation(['dashboard', 'address', 'admin']);
  const { user } = useUnifiedAuth();
  const { 
    isCitizen, 
    isVerifier, 
    isRegistrar, 
    hasAdminAccess, 
    hasNDAAAccess,
    hasSystemAdminAccess,
    isPoliceRole 
  } = useUserRole();

  const [activeTab, setActiveTab] = useState(isCitizen ? 'search' : 'overview');
  const [stats, setStats] = useState({
    totalNARAddresses: 0,
    totalCARAddresses: 0,
    pendingVerifications: 0,
    publishedAddresses: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Fetch unified statistics
    fetchUnifiedStats();
  }, []);

  const fetchUnifiedStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('unified-address-statistics')
      
      if (error) {
        console.error('Error fetching statistics:', error)
        return
      }
      
      setStats({
        totalNARAddresses: data.totalNARAddresses || 0,
        totalCARAddresses: data.totalCARAddresses || 0,
        pendingVerifications: data.pendingVerifications || 0,
        publishedAddresses: data.publishedAddresses || 0,
        activeUsers: data.activeUsers || 0
      })
    } catch (error) {
      console.error('Failed to fetch unified statistics:', error)
    }
  };

  // Define tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'overview', label: t('dashboard:overview'), icon: Home }
    ];

    if (isCitizen) {
      return [
        { id: 'search', label: t('address:searchAddresses'), icon: Search },
        { id: 'my-addresses', label: t('dashboard:myAddressesCAR'), icon: Home },
        { id: 'requests', label: t('dashboard:addressRequests'), icon: FileText },
        { id: 'verification-requests', label: t('dashboard:myVerifications'), icon: UserCheck }
      ];
    }

    if (isVerifier || isRegistrar) {
      return [
        ...baseTabs,
        { id: 'search', label: t('address:searchAddresses'), icon: Search },
        { id: 'verification', label: t('dashboard:addressVerification'), icon: CheckCircle },
        { id: 'car-verification', label: t('dashboard:citizenVerification'), icon: UserCheck },
        { id: 'queue-management', label: t('dashboard:queueManagement'), icon: Clock }
      ];
    }

    if (hasAdminAccess) {
      return [
        ...baseTabs,
        { id: 'address-management', label: t('dashboard:addressManagement'), icon: Search },
        { id: 'nar-admin', label: t('dashboard:narAdministration'), icon: Database },
        { id: 'car-admin', label: t('dashboard:carAdministration'), icon: Users },
        { id: 'integration', label: t('dashboard:narCarIntegration'), icon: Network }
      ];
    }

    return baseTabs;
  };

  const availableTabs = getAvailableTabs();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* System Overview - Only for Admins/Verifiers */}
            {(hasAdminAccess || isVerifier || isRegistrar) && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:narAddresses')}</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalNARAddresses}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard:nationalRegistry')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:carAddresses')}</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCARAddresses}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard:citizenAddresses')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:pendingVerifications')}</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard:requiresReview')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:integrationStatus')}</CardTitle>
                      <Network className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{t('dashboard:active')}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard:narCarSync')}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Status Alert */}
                <Alert>
                  <Network className="h-4 w-4" />
                  <AlertDescription>
                    {t('dashboard:integrationDescription')}
                  </AlertDescription>
                </Alert>
              </>
            )}


            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setActiveTab('address-management')}
              >
                <Search className="h-6 w-6" />
                <span>{t('dashboard:addressManagement')}</span>
                <span className="text-xs text-muted-foreground">{t('dashboard:searchManageAddresses')}</span>
              </Button>


              {(isVerifier || isRegistrar) && (
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab('verification')}
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>{t('dashboard:verification')}</span>
                  <span className="text-xs text-muted-foreground">{t('dashboard:reviewQueue')}</span>
                </Button>
              )}
            </div>
          </div>
        );

      case 'address-management':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:addressManagement')}</h2>
                <p className="text-muted-foreground">{t('dashboard:searchAddressesManageRequests')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:addressManagement')}</Badge>
            </div>
            <Tabs defaultValue="search" className="space-y-4">
              <TabsList>
                <TabsTrigger value="search">{t('address:searchAddresses')}</TabsTrigger>
                <TabsTrigger value="requests">{t('dashboard:reviewRequests')}</TabsTrigger>
              </TabsList>
              <TabsContent value="search">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{t('dashboard:addressSearch')}</h3>
                      <p className="text-sm text-muted-foreground">{t('dashboard:searchNationalRegistry')}</p>
                    </div>
                    <Badge variant="outline">{t('dashboard:narPublicAccess')}</Badge>
                  </div>
                  <AddressSearch />
                </div>
              </TabsContent>
              <TabsContent value="requests">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{t('dashboard:addressRequestsReview')}</h3>
                      <p className="text-sm text-muted-foreground">{t('dashboard:reviewManageCitizenRequests')}</p>
                    </div>
                    <Badge variant="outline">{t('dashboard:adminReview')}</Badge>
                  </div>
                  <AddressRequestStatus />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'my-addresses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:myAddressesCAR')}</h2>
                <p className="text-muted-foreground">{t('dashboard:manageYourCitizenAddresses')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:citizenAddresses')}</Badge>
            </div>
            <CitizenAddressPortal />
          </div>
        );

      case 'verification-requests':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:myVerifications')}</h2>
                <p className="text-muted-foreground">{t('dashboard:viewManageYourVerifications')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:carVerification')}</Badge>
            </div>
            <UserVerificationRequests />
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:addressSearch')}</h2>
                <p className="text-muted-foreground">{t('dashboard:searchNationalRegistry')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:narPublicAccess')}</Badge>
            </div>
            <AddressSearch />
          </div>
         );

      case 'requests':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:addressRequests')}</h2>
                <p className="text-muted-foreground">{t('dashboard:viewStatusYourAddressRequests')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:narRequests')}</Badge>
            </div>
            <AddressRequestStatus />
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:addressVerification')}</h2>
                <p className="text-muted-foreground">{t('dashboard:reviewVerifyNARSubmissions')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:narVerification')}</Badge>
            </div>
            <VerificationTools />
          </div>
        );

      case 'car-verification':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:citizenVerification')}</h2>
                <p className="text-muted-foreground">{t('dashboard:reviewCitizenResidencyRequests')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:carVerification')}</Badge>
            </div>
            <ResidencyVerificationManager />
          </div>
        );

      case 'queue-management':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:queueManagement')}</h2>
                <p className="text-muted-foreground">{t('dashboard:manageVerificationPublishingQueues')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:narQueues')}</Badge>
            </div>
            <Tabs defaultValue="verification" className="space-y-4">
              <TabsList>
                <TabsTrigger value="verification">{t('dashboard:verificationQueue')}</TabsTrigger>
                <TabsTrigger value="publishing">{t('dashboard:publishingQueue')}</TabsTrigger>
                <TabsTrigger value="unpublishing">{t('dashboard:unpublishingQueue')}</TabsTrigger>
              </TabsList>
              <TabsContent value="verification">
                <AddressVerificationQueue />
              </TabsContent>
              <TabsContent value="publishing">
                <AddressPublishingQueue />
              </TabsContent>
              <TabsContent value="unpublishing">
                <AddressUnpublishingQueue />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'nar-admin':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:narAdministration')}</h2>
                <p className="text-muted-foreground">{t('dashboard:manageNationalAddressRegistry')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:narAdmin')}</Badge>
            </div>
            <Tabs defaultValue="authorities" className="space-y-4">
              <TabsList>
                <TabsTrigger value="authorities">{t('dashboard:narAuthorities')}</TabsTrigger>
                <TabsTrigger value="verification">{t('dashboard:verificationTools')}</TabsTrigger>
                <TabsTrigger value="queues">{t('dashboard:queueManagement')}</TabsTrigger>
              </TabsList>
              <TabsContent value="authorities">
                <NARAuthorityManager />
              </TabsContent>
              <TabsContent value="verification">
                <VerificationTools />
              </TabsContent>
              <TabsContent value="queues">
                <div className="grid grid-cols-1 gap-6">
                  <AddressVerificationQueue />
                  <AddressPublishingQueue />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'car-admin':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:carAdministration')}</h2>
                <p className="text-muted-foreground">{t('dashboard:manageCitizenAddressRepository')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:carAdmin')}</Badge>
            </div>
            <Tabs defaultValue="verification" className="space-y-4">
              <TabsList>
                <TabsTrigger value="verification">{t('dashboard:residencyVerification')}</TabsTrigger>
                <TabsTrigger value="addresses">{t('dashboard:administrativeOverview')}</TabsTrigger>
              </TabsList>
              <TabsContent value="verification">
                <ResidencyVerificationManager />
              </TabsContent>
              <TabsContent value="addresses">
                <CARAdministrativeOverview />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'integration':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:narCarIntegration')}</h2>
                <p className="text-muted-foreground">{t('dashboard:monitorManageSystemIntegration')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:systemIntegration')}</Badge>
            </div>
            <NARCARTestPanel />
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
          <h1 className="text-3xl font-bold text-foreground">{t('dashboard:unifiedAddressDashboard')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard:integratedNARCARDescription')}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            {t('dashboard:close')}
          </Button>
        )}
      </div>

      {/* Citizen Welcome Message */}
      {isCitizen && !hasAdminAccess && !isVerifier && !isRegistrar && (
        <Alert>
          <Home className="h-4 w-4" />
          <AlertDescription>
            {t('dashboard:citizenWelcomeMessage')}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {availableTabs.map((tab) => (
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

export default UnifiedAddressDashboard;