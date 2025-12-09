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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import NAR components
import { VerificationTools } from './VerificationTools';
import { AddressVerificationQueue } from './AddressVerificationQueue';
import { AddressPublishingQueue } from './AddressPublishingQueue';
import { AddressUnpublishingQueue } from './AddressUnpublishingQueue';
import { NARAuthorityManager } from './NARAuthorityManager';

// Import CAR components  
import { CitizenAddressPortal } from './CitizenAddressPortal';
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
    role,
    isCitizen,
    isFieldAgent,
    isVerifier, 
    isRegistrar,
    isCarAdmin,
    canVerifyCAR,
    hasAdminAccess, 
    hasNDAAAccess,
    hasSystemAdminAccess,
    hasCarAccess,
    isPoliceRole 
  } = useUserRole();

  // Debug logging
  console.log('UnifiedAddressDashboard - Role info:', {
    role,
    isCitizen,
    isCarAdmin,
    hasCarAccess
  });

  // Multi-role support
  const [activeRole, setActiveRole] = useState<string | null>(role);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // Fetch all user roles when component mounts
  useEffect(() => {
    const fetchAllUserRoles = async () => {
      if (!user?.id) return;

      try {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (!error && roleData) {
          const roles = roleData.map(r => r.role);
          setAvailableRoles(roles);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };

    fetchAllUserRoles();
  }, [user?.id]);

  // Update active role when role changes
  useEffect(() => {
    if (role && activeRole !== role) {
      setActiveRole(role);
    }
  }, [role]);

  // Set default tab based on active role
  const getDefaultTab = () => {
    const currentRole = activeRole || role;
    if (currentRole === 'car_admin' || isCarAdmin) return 'car-admin';
    if (canVerifyCAR && !isCarAdmin) return 'residency-verification';
    return 'search';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Update active tab when active role changes
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [activeRole, role]);

  // Define tabs based on active role
  const getAvailableTabs = () => {
    const tabs = [];
    const currentRole = activeRole || role;

    console.log('Current role for tabs:', currentRole);

    // ADMIN ROLE - Pure administrative functions only
    if (currentRole === 'admin' || currentRole === 'ndaa_admin') {
      tabs.push(
        { id: 'admin-panel', label: t('dashboard:adminPanel'), icon: Settings },
        { id: 'integration', label: t('dashboard:systemIntegration'), icon: Network }
      );
      return tabs;
    }

    // Citizens get a simplified interface
    if (currentRole === 'citizen') {
      tabs.push({ 
        id: 'search', 
        label: t('address:searchAddresses'), 
        icon: Search 
      });
      tabs.push(
        { id: 'my-addresses', label: t('dashboard:myAddressesCAR'), icon: Home },
        { id: 'requests', label: t('dashboard:addressRequests'), icon: FileText },
        { id: 'verification-requests', label: t('dashboard:myVerifications'), icon: UserCheck }
      );
      return tabs;
    }

    // All operational users get address search
    tabs.push({ id: 'search', label: t('address:searchAddresses'), icon: Search });

    // CAR Admin specific tabs
    if (currentRole === 'car_admin' || isCarAdmin) {
      tabs.push(
        { id: 'car-admin', label: t('dashboard:carAdministration'), icon: Settings },
        { id: 'car-analytics', label: t('dashboard:carAnalytics'), icon: BarChart3 },
        { id: 'residency-verification', label: t('dashboard:residencyVerification'), icon: Shield }
      );
      return tabs;
    }

    // Verifier with CAR scope specific tabs (ONLY residency verification, no NAR tools)
    if (canVerifyCAR && !isCarAdmin && !isRegistrar) {
      tabs.push(
        { id: 'residency-verification', label: t('dashboard:residencyVerification'), icon: Shield }
      );
      // CAR verifiers only see their dedicated tab, return early
      return tabs;
    }

    // NAR Admin tabs for registrars (includes both NAR and CAR management)
    if (currentRole === 'registrar') {
      tabs.push(
        { id: 'nar-admin', label: t('dashboard:narAdministration'), icon: Building2 },
        { id: 'car-analytics', label: t('dashboard:carAnalytics'), icon: BarChart3 },
        { id: 'residency-verification', label: t('dashboard:residencyVerification'), icon: Shield }
      );
    }

    // Default citizen interface if no other role matches
    if (tabs.length === 1) { // Only has search tab
      tabs.push(
        { id: 'my-addresses', label: t('dashboard:myAddressesCAR'), icon: Home },
        { id: 'requests', label: t('dashboard:addressRequests'), icon: FileText },
        { id: 'verification-requests', label: t('dashboard:myVerifications'), icon: UserCheck }
      );
    }

    return tabs;
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


      case 'residency-verification':
        // This is accessible to users with verifier role and CAR verification_domain scope
        // or users in the authorized_verifiers table with proper verification_scope
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:residencyVerification')}</h2>
                <p className="text-muted-foreground">{t('dashboard:manageResidencyVerifications')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:residencyVerifier')}</Badge>
            </div>
            <ResidencyVerificationManager />
          </div>
        );


      case 'car-analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:carAnalytics')}</h2>
                <p className="text-muted-foreground">{t('dashboard:carAnalyticsDescription')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:carAdmin')}</Badge>
            </div>
            <Tabs defaultValue="metrics" className="space-y-4">
              <TabsList>
                <TabsTrigger value="metrics">{t('dashboard:qualityMetrics')}</TabsTrigger>
                <TabsTrigger value="overview">{t('dashboard:overview')}</TabsTrigger>
              </TabsList>
              <TabsContent value="metrics">
                <div className="grid gap-6">
                  {/* Quality metrics would go here */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('dashboard:carQualityMetrics')}</CardTitle>
                      <CardDescription>{t('dashboard:trackCarSystemQuality')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{t('dashboard:qualityMetricsPlaceholder')}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="overview">
                <CARAdministrativeOverview />
              </TabsContent>
            </Tabs>
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
                <h2 className="text-2xl font-bold">{t('dashboard:systemIntegration')}</h2>
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
        <div className="flex items-center gap-4">
          {availableRoles.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Switch Role:</span>
              <Select value={activeRole || role || 'citizen'} onValueChange={setActiveRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {t(`dashboard:roles.${roleOption}`, roleOption.replace('_', ' '))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              {t('dashboard:close')}
            </Button>
          )}
        </div>
      </div>

      {/* Welcome Messages based on active role */}
      {(activeRole === 'citizen' || (!activeRole && isCitizen)) && !hasCarAccess && (
        <Alert>
          <Home className="h-4 w-4" />
          <AlertDescription>
            {t('dashboard:citizenWelcomeMessage')}
          </AlertDescription>
        </Alert>
      )}

      {(activeRole === 'car_admin' || isCarAdmin) && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            {t('dashboard:carAdminWelcomeMessage')}
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