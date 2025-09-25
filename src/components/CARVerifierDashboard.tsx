import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Shield, FileText, BarChart3, Settings, 
  Clock, CheckCircle, AlertTriangle, Database,
  UserCheck, MapPin, TrendingUp, Activity
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from '@/hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import { CARVerificationWorkflow } from './CARVerificationWorkflow';
import { CitizenAddressVerificationManager } from './CitizenAddressVerificationManager';
import { QualityDashboard } from './QualityDashboard';
import { ResidencyVerificationManager } from './ResidencyVerificationManager';

interface CARMetrics {
  totalCitizenAddresses: number;
  pendingVerificationAddresses: number;
  confirmedAddresses: number;
  rejectedAddresses: number;
  duplicatePersonRecords: number;
  averageVerificationTimeHours: number;
  totalPersonRecords: number;
  addressesRequiringReview: number;
}

interface CARVerifierDashboardProps {
  onRegisterNavigate?: (navigateTo: (pageId: string) => void) => void;
}

export function CARVerifierDashboard({ onRegisterNavigate }: CARVerifierDashboardProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { toast } = useToast();
  const { hasCARAccess, hasCARVerificationAccess, hasCARManagementAccess, isResidencyVerifier } = useUserRole();
  
  const [metrics, setMetrics] = useState<CARMetrics>({
    totalCitizenAddresses: 0,
    pendingVerificationAddresses: 0,
    confirmedAddresses: 0,
    rejectedAddresses: 0,
    duplicatePersonRecords: 0,
    averageVerificationTimeHours: 0,
    totalPersonRecords: 0,
    addressesRequiringReview: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Expose navigation mapping to parent layout sidebar
  useEffect(() => {
    if (!onRegisterNavigate) return;
    const navigateTo = (pageId: string) => {
      switch (pageId) {
        case 'dashboard':
          setActiveTab('overview');
          break;
        case 'analytics':
          setActiveTab('quality');
          break;
        case 'admin':
        case 'search':
          setActiveTab('verification');
          break;
        case 'manage':
          setActiveTab('management');
          break;
        case 'add':
          setActiveTab('residency');
          break;
        default:
          setActiveTab('overview');
      }
    };
    onRegisterNavigate(navigateTo);
  }, [onRegisterNavigate]);

  const fetchMetrics = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Update CAR quality metrics
      await supabase.rpc('update_car_quality_metrics');
      
      // Fetch latest CAR metrics
      const { data: carData, error: carError } = await supabase
        .from('car_quality_metrics')
        .select('*')
        .order('date_measured', { ascending: false })
        .limit(1)
        .single();

      if (carError && carError.code !== 'PGRST116') throw carError;

      // Fetch person records count
      const { count: personCount, error: personError } = await supabase
        .from('person')
        .select('*', { count: 'exact', head: true });

      if (personError) throw personError;

      // Fetch addresses requiring manual review
      const { count: reviewCount, error: reviewError } = await supabase
        .from('citizen_address_manual_review_queue')
        .select('*', { count: 'exact', head: true });

      if (reviewError) throw reviewError;

      setMetrics({
        totalCitizenAddresses: carData?.total_citizen_addresses || 0,
        pendingVerificationAddresses: carData?.pending_verification_addresses || 0,
        confirmedAddresses: carData?.confirmed_addresses || 0,
        rejectedAddresses: carData?.rejected_addresses || 0,
        duplicatePersonRecords: carData?.duplicate_person_records || 0,
        averageVerificationTimeHours: carData?.average_verification_time_hours || 0,
        totalPersonRecords: personCount || 0,
        addressesRequiringReview: reviewCount || 0
      });

    } catch (error) {
      console.error('Error fetching CAR metrics:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to fetch CAR metrics',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    if (hasCARAccess) {
      fetchMetrics();
    }
  }, [hasCARAccess, fetchMetrics]);


  if (!hasCARAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            CAR Verifier Dashboard
          </CardTitle>
          <CardDescription>
            Access denied. You need CAR verifier permissions to access this dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const verificationRate = metrics.totalCitizenAddresses > 0 
    ? Math.round((metrics.confirmedAddresses / metrics.totalCitizenAddresses) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CAR Verifier Dashboard</h1>
          <p className="text-muted-foreground">
            Citizen Address Repository verification and management tools
          </p>
        </div>
        <Button onClick={fetchMetrics} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Address Declarations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCitizenAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {metrics.totalPersonRecords} person records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingVerificationAddresses}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.addressesRequiringReview} require manual review
            </p>
            {metrics.pendingVerificationAddresses > 50 && (
              <Badge variant="destructive" className="mt-2">High backlog</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationRate}%</div>
            <Progress value={verificationRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.confirmedAddresses} confirmed, {metrics.rejectedAddresses} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageVerificationTimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Average verification time</p>
            {metrics.duplicatePersonRecords > 0 && (
              <Badge variant="destructive" className="mt-2">
                {metrics.duplicatePersonRecords} duplicate persons
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Address Review</TabsTrigger>
          <TabsTrigger value="residency">Residency Verification</TabsTrigger>
          <TabsTrigger value="quality">Quality Dashboard</TabsTrigger>
          <TabsTrigger value="management">Address Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab('verification')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Review Address Declarations ({metrics.addressesRequiringReview})
                </Button>
                
                {isResidencyVerifier && (
                  <Button 
                    onClick={() => setActiveTab('residency')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Process Residency Verifications
                  </Button>
                )}
                
                <Button 
                  onClick={() => setActiveTab('quality')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Quality Dashboard
                </Button>
                
                {hasCARManagementAccess && (
                  <Button 
                    onClick={() => setActiveTab('management')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Addresses
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-Verification</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Quality</span>
                  <Badge variant="outline" className={verificationRate > 80 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
                    {verificationRate > 80 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing Queue</span>
                  <Badge variant="outline" className={metrics.pendingVerificationAddresses < 20 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                    {metrics.pendingVerificationAddresses < 20 ? "Normal" : "High Volume"}
                  </Badge>
                </div>

                {metrics.duplicatePersonRecords > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Duplicate Records</span>
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {metrics.duplicatePersonRecords} found
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <CARVerificationWorkflow onUpdate={fetchMetrics} />
        </TabsContent>

        <TabsContent value="residency" className="space-y-4">
          {isResidencyVerifier ? (
            <ResidencyVerificationManager />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  You don't have permission to verify residency requests.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <QualityDashboard />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          {hasCARManagementAccess ? (
            <CitizenAddressVerificationManager onSuccess={fetchMetrics} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  You don't have permission to manage person records.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}