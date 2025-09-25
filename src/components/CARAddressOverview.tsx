import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Database, MapPin, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Activity, BarChart3, Shield, Building2, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface CARStats {
  totalAddresses: number;
  confirmedAddresses: number;
  pendingAddresses: number;
  rejectedAddresses: number;
  totalPersons: number;
  primaryAddresses: number;
  secondaryAddresses: number;
  recentActivity: number;
}

interface RegionStats {
  region: string;
  count: number;
  confirmed: number;
  pending: number;
}

export function CARAddressOverview() {
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'admin']);
  const [stats, setStats] = useState<CARStats>({
    totalAddresses: 0,
    confirmedAddresses: 0,
    pendingAddresses: 0,
    rejectedAddresses: 0,
    totalPersons: 0,
    primaryAddresses: 0,
    secondaryAddresses: 0,
    recentActivity: 0,
  });
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCARStats();
  }, []);

  const fetchCARStats = async () => {
    try {
      setLoading(true);

      // Fetch overall stats
      const [
        { count: totalAddresses },
        { count: confirmedAddresses },
        { count: pendingAddresses },
        { count: rejectedAddresses },
        { count: totalPersons },
        { count: primaryAddresses },
        { count: secondaryAddresses },
        { count: recentActivity }
      ] = await Promise.all([
        supabase.from('citizen_address').select('*', { count: 'exact', head: true }),
        supabase.from('citizen_address').select('*', { count: 'exact', head: true }).eq('status', 'CONFIRMED'),
        supabase.from('citizen_address').select('*', { count: 'exact', head: true }).in('status', ['SELF_DECLARED']),
        supabase.from('citizen_address').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
        supabase.from('person').select('*', { count: 'exact', head: true }),
        supabase.from('citizen_address').select('*', { count: 'exact', head: true }).eq('address_kind', 'PRIMARY'),
        supabase.from('citizen_address').select('*', { count: 'exact', head: true }).eq('address_kind', 'SECONDARY'),
        supabase.from('citizen_address_event').select('*', { count: 'exact', head: true }).gte('at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      setStats({
        totalAddresses: totalAddresses || 0,
        confirmedAddresses: confirmedAddresses || 0,
        pendingAddresses: pendingAddresses || 0,
        rejectedAddresses: rejectedAddresses || 0,
        totalPersons: totalPersons || 0,
        primaryAddresses: primaryAddresses || 0,
        secondaryAddresses: secondaryAddresses || 0,
        recentActivity: recentActivity || 0,
      });

      // Fetch region stats
      const { data: regionData, error: regionError } = await supabase
        .from('citizen_address_with_details')
        .select('region, status')
        .not('region', 'is', null);

      if (!regionError && regionData) {
        const regionCounts = regionData.reduce((acc: any, curr) => {
          const region = curr.region || 'Unknown';
          if (!acc[region]) {
            acc[region] = { count: 0, confirmed: 0, pending: 0 };
          }
          acc[region].count++;
          if (curr.status === 'CONFIRMED') {
            acc[region].confirmed++;
          } else if (curr.status === 'SELF_DECLARED') {
            acc[region].pending++;
          }
          return acc;
        }, {});

        const regionStatsArray = Object.entries(regionCounts).map(([region, stats]: [string, any]) => ({
          region,
          count: stats.count,
          confirmed: stats.confirmed,
          pending: stats.pending,
        }));

        setRegionStats(regionStatsArray.sort((a, b) => b.count - a.count));
      }

    } catch (error) {
      console.error('Error fetching CAR stats:', error);
      toast({
        title: t('dashboard:error'),
        description: t('dashboard:failedToLoadStats'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmationRate = stats.totalAddresses > 0 
    ? Math.round((stats.confirmedAddresses / stats.totalAddresses) * 100) 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:totalAddresses')}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAddresses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.primaryAddresses} {t('dashboard:primary')}, {stats.secondaryAddresses} {t('dashboard:secondary')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:confirmedAddresses')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedAddresses}</div>
            <Progress value={confirmationRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {confirmationRate}% {t('dashboard:confirmationRate')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:pendingAddresses')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAddresses}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard:requiresVerification')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:totalPersons')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPersons}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard:registeredIndividuals')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regional">{t('dashboard:regionalBreakdown')}</TabsTrigger>
          <TabsTrigger value="activity">{t('dashboard:recentActivity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard:addressesByRegion')}</CardTitle>
              <CardDescription>
                {t('dashboard:geographicDistribution')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionStats.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-muted-foreground">
                          {region.confirmed} {t('dashboard:confirmed')}, {region.pending} {t('dashboard:pending')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{region.count}</Badge>
                  </div>
                ))}

                {regionStats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('dashboard:noRegionalDataAvailable')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard:recentActivity')}</CardTitle>
              <CardDescription>
                {t('dashboard:last7Days')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-6 bg-muted rounded-lg">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.recentActivity}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('dashboard:addressEventsThisWeek')}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-green-600">{stats.confirmedAddresses}</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard:totalConfirmed')}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-yellow-600">{stats.pendingAddresses}</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard:awaitingReview')}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-red-600">{stats.rejectedAddresses}</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard:totalRejected')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CARAddressOverview;