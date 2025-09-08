import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Plus, 
  BarChart3, 
  Shield, 
  Globe,
  Users,
  CheckCircle,
  AlertCircle,
  Building,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/useUserRole';
import DashboardLocationMap from './DashboardLocationMap';
import AddressSearch from './AddressSearch';

interface SearchResult {
  uac: string;
  readable: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  verified: boolean;
}

interface DashboardStats {
  totalAddresses: number;
  verifiedAddresses: number;
  pendingVerification: number;
  coveragePercentage: number;
  activeUsers: number;
  recentActivity: number;
}

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const { t } = useTranslation(['common', 'dashboard']);
  const { hasSystemAdminAccess, hasNDAAAccess } = useUserRole();
  const [stats, setStats] = useState<DashboardStats>({
    totalAddresses: 0,
    verifiedAddresses: 0,
    pendingVerification: 0,
    coveragePercentage: 0,
    activeUsers: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch address statistics
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('verified, public, created_at');

      if (addressError) throw addressError;

      // Fetch user statistics (profiles count as active users)
      // Filter users based on access level
      let usersQuery = supabase.from('profiles').select('user_id', { count: 'exact', head: true });
      
      if (hasNDAAAccess && !hasSystemAdminAccess) {
        // NDAA admins only see addressing system users
        const addressingRoles = ['admin', 'verifier', 'registrar', 'citizen', 'field_agent'] as const;
        const { data: addressingUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', addressingRoles);
        
        if (addressingUsers?.length) {
          const userIds = addressingUsers.map(ur => ur.user_id);
          usersQuery = usersQuery.in('user_id', userIds);
        }
      }
      
      const { count: usersCount, error: usersError } = await usersQuery;

      if (usersError) throw usersError;

      // Fetch recent activity (addresses created in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentCount, error: recentError } = await supabase
        .from('addresses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Calculate stats from real data
      const totalAddresses = addressData?.length || 0;
      const verifiedAddresses = addressData?.filter(addr => addr.verified).length || 0;
      const pendingVerification = totalAddresses - verifiedAddresses;
      const publicAddresses = addressData?.filter(addr => addr.public).length || 0;
      
      // Simple coverage calculation (verified addresses / total addresses * 100)
      const coveragePercentage = totalAddresses > 0 ? (verifiedAddresses / totalAddresses) * 100 : 0;

      setStats({
        totalAddresses,
        verifiedAddresses,
        pendingVerification,
        coveragePercentage: Math.round(coveragePercentage * 10) / 10, // Round to 1 decimal
        activeUsers: usersCount || 0,
        recentActivity: recentCount || 0
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Keep default values if error occurs
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('searchAddresses'),
      description: t('findAndVerifyExisting'),
      icon: Search,
      action: () => onNavigate?.('search'),
      variant: "default" as const
    },
    {
      title: t('addNewAddress'),
      description: t('registerNewLocation'),
      icon: Plus,
      action: () => onNavigate?.('add'),
      variant: "hero" as const
    },
    {
      title: t('viewMap'),
      description: t('interactiveAddressMapping'),
      icon: MapPin,
      action: () => onNavigate?.('map'),
      variant: "default" as const
    },
    {
      title: t('analytics'),
      description: t('coverageAndUsageStatistics'),
      icon: BarChart3,
      action: () => onNavigate?.('analytics'),
      variant: "default" as const
    }
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    trend?: string;
    variant?: 'default' | 'success' | 'warning';
  }> = ({ title, value, description, icon: Icon, trend, variant = 'default' }) => (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
            {trend && (
              <Badge 
                variant="outline" 
                className={`mt-2 text-xs ${variant === 'success' ? 'border-success text-success' : variant === 'warning' ? 'border-warning text-warning' : ''}`}
              >
                {trend}
              </Badge>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
            variant === 'success' ? 'bg-success/10' : 
            variant === 'warning' ? 'bg-warning/10' : 
            'bg-primary/10'
          }`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${
              variant === 'success' ? 'text-success' : 
              variant === 'warning' ? 'text-warning' : 
              'text-primary'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('nationalDigitalAddressSystem')}</h1>
          <p className="text-muted-foreground">
            {t('comprehensiveAddressManagement')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-success text-success">
            <Shield className="h-3 w-3 mr-1" />
            {t('systemOperational')}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title={t('totalAddresses')}
          value={stats.totalAddresses}
          description={t('registeredLocations')}
          icon={MapPin}
          trend="+12% this month"
          variant="success"
        />
        <StatCard
          title={t('verifiedAddresses')}
          value={stats.verifiedAddresses}
          description={t('qualityAssuredLocations')}
          icon={CheckCircle}
          trend={`${((stats.verifiedAddresses / stats.totalAddresses) * 100).toFixed(1)}% verified`}
          variant="success"
        />
        <StatCard
          title={t('pendingVerification')}
          value={stats.pendingVerification}
          description={t('awaitingValidation')}
          icon={AlertCircle}
          trend="Review required"
          variant="warning"
        />
        <StatCard
          title={t('coverage')}
          value={`${stats.coveragePercentage}%`}
          description={t('nationalCoverage')}
          icon={Globe}
          trend="Target: 95% by 2025"
        />
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('quickActions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-3 sm:p-4 flex flex-col items-start gap-2 text-left"
                onClick={action.action}
              >
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <div className="text-left w-full">
                  <p className="font-semibold text-sm sm:text-base truncate">{action.title}</p>
                  <p className="text-xs opacity-90 line-clamp-2">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Address Search */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Addresses
              </CardTitle>
              <CardDescription>
                Find verified addresses and view them on the map below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressSearch 
                onSelectAddress={setSelectedAddress}
              />
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Location & Nearby Points of Interest
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DashboardLocationMap 
                searchedAddress={selectedAddress}
                onAddressSearched={setSelectedAddress}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-full">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">156 addresses verified today</p>
                    <p className="text-xs text-muted-foreground">Malabo district processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">42 new addresses registered</p>
                    <p className="text-xs text-muted-foreground">Bata expansion project</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-full">
                    <Building className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Commercial zone mapping</p>
                    <p className="text-xs text-muted-foreground">85% complete</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('systemStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('apiServices')}</span>
                  <Badge variant="outline" className="border-success text-success">{t('online')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('databaseSync')}</span>
                  <Badge variant="outline" className="border-success text-success">{t('active')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('mappingServices')}</span>
                  <Badge variant="outline" className="border-success text-success">{t('operational')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('verificationQueue')}</span>
                  <Badge variant="outline" className="border-warning text-warning">{t('processing')}</Badge>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">{t('activeUsers')}: {stats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t('governmentAgenciesAndAuthorized')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;