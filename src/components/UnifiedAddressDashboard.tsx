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
  // Unified dashboard for NAR and CAR systems
  const { t } = useTranslation(['dashboard', 'address', 'admin']);
  const { user } = useUnifiedAuth();
  const { 
    isCitizen,
    isFieldAgent,
    isVerifier, 
    isRegistrar, 
    hasAdminAccess, 
    hasNDAAAccess,
    hasSystemAdminAccess,
    isPoliceRole 
  } = useUserRole();

  const [activeTab, setActiveTab] = useState(isCitizen ? 'search' : 'search');


  // Define tabs based on user role
  const getAvailableTabs = () => {

    if (isCitizen) {
      return [
        { id: 'search', label: t('address:searchAddresses'), icon: Search },
        { id: 'my-addresses', label: t('dashboard:myAddressesCAR'), icon: Home },
        { id: 'requests', label: t('dashboard:addressRequests'), icon: FileText },
        { id: 'verification-requests', label: t('dashboard:myVerifications'), icon: UserCheck }
      ];
    }

    return [
      { id: 'search', label: t('address:searchAddresses'), icon: Search }
    ];
  };

  const availableTabs = getAvailableTabs();

  const renderTabContent = () => {
    switch (activeTab) {

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

      case 'address-management':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:addressManagement')}</h2>
                <p className="text-muted-foreground">{t('dashboard:searchNationalRegistry')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:narPublicAccess')}</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t('dashboard:addressSearch')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard:searchNationalRegistry')}</p>
                </div>
              </div>
              <AddressSearch />
            </div>
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
            
            <Tabs defaultValue="view-requests" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view-requests">{t('dashboard:viewRequests')}</TabsTrigger>
                <TabsTrigger value="new-request">{t('dashboard:newRequest')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="view-requests" className="space-y-4">
                <AddressRequestStatus />
              </TabsContent>
              
              <TabsContent value="new-request" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{t('dashboard:requestNewAddress')}</h3>
                    <p className="text-sm text-muted-foreground">{t('dashboard:requestNewAddressDescription')}</p>
                  </div>
                  <AddressRequestForm 
                    onSuccess={() => {
                      // Refresh the page or show success message
                      window.location.reload();
                    }}
                  />
                </div>
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