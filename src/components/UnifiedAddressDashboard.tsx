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
import { AnalyticsReports } from './AnalyticsReports';
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
    // Implementation to fetch combined NAR/CAR statistics
    // This would be a new edge function that aggregates data from both systems
  };

  // Define tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'overview', label: t('dashboard:overview'), icon: Home }
    ];

    if (isCitizen) {
      return [
        { id: 'search', label: t('address:searchAddresses'), icon: Search },
        { id: 'my-addresses', label: 'My Addresses (CAR)', icon: Home },
        { id: 'requests', label: 'Address Requests', icon: FileText },
        { id: 'verification-requests', label: 'My Verifications', icon: UserCheck }
      ];
    }

    if (isVerifier || isRegistrar) {
      return [
        ...baseTabs,
        { id: 'search', label: t('address:searchAddresses'), icon: Search },
        { id: 'verification', label: 'Address Verification', icon: CheckCircle },
        { id: 'car-verification', label: 'Citizen Verification', icon: UserCheck },
        { id: 'queue-management', label: 'Queue Management', icon: Clock },
        { id: 'analytics', label: t('dashboard:analytics'), icon: BarChart3 }
      ];
    }

    if (hasAdminAccess) {
      return [
        ...baseTabs,
        { id: 'address-management', label: 'Address Management', icon: Search },
        { id: 'nar-admin', label: 'NAR Administration', icon: Database },
        { id: 'car-admin', label: 'CAR Administration', icon: Users },
        { id: 'integration', label: 'NAR-CAR Integration', icon: Network },
        
        { id: 'analytics', label: t('dashboard:analytics'), icon: BarChart3 }
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
                      <CardTitle className="text-sm font-medium">NAR Addresses</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalNARAddresses}</div>
                      <p className="text-xs text-muted-foreground">National registry</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">CAR Addresses</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCARAddresses}</div>
                      <p className="text-xs text-muted-foreground">Citizen addresses</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                      <p className="text-xs text-muted-foreground">Requires review</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Integration Status</CardTitle>
                      <Network className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">Active</div>
                      <p className="text-xs text-muted-foreground">NAR-CAR sync</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Status Alert */}
                <Alert>
                  <Network className="h-4 w-4" />
                  <AlertDescription>
                    NAR and CAR systems are fully integrated. Citizens can register addresses that link to the National Address Registry for verification.
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
                <span>Address Management</span>
                <span className="text-xs text-muted-foreground">Search & manage addresses</span>
              </Button>


              {(isVerifier || isRegistrar) && (
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab('verification')}
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>Verification</span>
                  <span className="text-xs text-muted-foreground">Review queue</span>
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
                <h2 className="text-2xl font-bold">Address Management</h2>
                <p className="text-muted-foreground">Search addresses and manage requests</p>
              </div>
              <Badge variant="outline">Address Management</Badge>
            </div>
            <Tabs defaultValue="search" className="space-y-4">
              <TabsList>
                <TabsTrigger value="search">Search Addresses</TabsTrigger>
                <TabsTrigger value="requests">Review Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="search">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Address Search</h3>
                      <p className="text-sm text-muted-foreground">Search the National Address Registry</p>
                    </div>
                    <Badge variant="outline">NAR Public Access</Badge>
                  </div>
                  <AddressSearch />
                </div>
              </TabsContent>
              <TabsContent value="requests">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Address Requests Review</h3>
                      <p className="text-sm text-muted-foreground">Review and manage citizen address requests</p>
                    </div>
                    <Badge variant="outline">Admin Review</Badge>
                  </div>
                  <AddressRequestStatus />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Address Search</h2>
                <p className="text-muted-foreground">Search the National Address Registry</p>
              </div>
              <Badge variant="outline">NAR Public Access</Badge>
            </div>
            <AddressSearch />
          </div>
        );


      case 'verification':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Address Verification</h2>
                <p className="text-muted-foreground">Review and verify NAR address submissions</p>
              </div>
              <Badge variant="outline">NAR Verification</Badge>
            </div>
            <VerificationTools />
          </div>
        );

      case 'car-verification':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Citizen Verification</h2>
                <p className="text-muted-foreground">Review citizen residency verification requests</p>
              </div>
              <Badge variant="outline">CAR Verification</Badge>
            </div>
            <ResidencyVerificationManager />
          </div>
        );

      case 'queue-management':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Queue Management</h2>
                <p className="text-muted-foreground">Manage verification and publishing queues</p>
              </div>
              <Badge variant="outline">NAR Queues</Badge>
            </div>
            <Tabs defaultValue="verification" className="space-y-4">
              <TabsList>
                <TabsTrigger value="verification">Verification Queue</TabsTrigger>
                <TabsTrigger value="publishing">Publishing Queue</TabsTrigger>
                <TabsTrigger value="unpublishing">Unpublishing Queue</TabsTrigger>
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
                <h2 className="text-2xl font-bold">NAR Administration</h2>
                <p className="text-muted-foreground">Manage National Address Registry</p>
              </div>
              <Badge variant="outline">NAR Admin</Badge>
            </div>
            <Tabs defaultValue="authorities" className="space-y-4">
              <TabsList>
                <TabsTrigger value="authorities">NAR Authorities</TabsTrigger>
                <TabsTrigger value="verification">Verification Tools</TabsTrigger>
                <TabsTrigger value="queues">Queue Management</TabsTrigger>
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
                <h2 className="text-2xl font-bold">CAR Administration</h2>
                <p className="text-muted-foreground">Manage Citizen Address Repository</p>
              </div>
              <Badge variant="outline">CAR Admin</Badge>
            </div>
            <Tabs defaultValue="verification" className="space-y-4">
              <TabsList>
                <TabsTrigger value="verification">Residency Verification</TabsTrigger>
                <TabsTrigger value="addresses">Administrative Overview</TabsTrigger>
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
                <h2 className="text-2xl font-bold">NAR-CAR Integration</h2>
                <p className="text-muted-foreground">Monitor and manage system integration</p>
              </div>
              <Badge variant="outline">System Integration</Badge>
            </div>
            <NARCARTestPanel />
          </div>
        );


      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Unified Analytics</h2>
                <p className="text-muted-foreground">Combined NAR and CAR analytics and reporting</p>
              </div>
              <Badge variant="outline">Analytics</Badge>
            </div>
            <AnalyticsReports />
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Unified Address Dashboard</h1>
          <p className="text-muted-foreground">
            Integrated National Address Registry (NAR) and Citizen Address Repository (CAR)
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Citizen Welcome Message */}
      {isCitizen && !hasAdminAccess && !isVerifier && !isRegistrar && (
        <Alert>
          <Home className="h-4 w-4" />
          <AlertDescription>
            Welcome to the unified address system! You can search for addresses in the National Address Registry and manage your personal addresses in the Citizen Address Repository.
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