import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lock, Eye, EyeOff, Globe, MapPin, BarChart3, Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { useUserRole } from "@/hooks/useUserRole";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PrivacyStats {
  totalAddresses: number;
  privateCount: number;
  regionOnlyCount: number;
  publicCount: number;
  searchableCount: number;
  nonSearchableCount: number;
  privacyByRegion: { region: string; private: number; regionOnly: number; public: number }[];
  privacyByAddressKind: { kind: string; private: number; regionOnly: number; public: number }[];
}

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))'];

export function CARPrivacyAnalytics() {
  const { toast } = useToast();
  const { t } = useTranslation('admin');
  const { roleMetadata } = useUserRole();
  
  const [stats, setStats] = useState<PrivacyStats>({
    totalAddresses: 0,
    privateCount: 0,
    regionOnlyCount: 0,
    publicCount: 0,
    searchableCount: 0,
    nonSearchableCount: 0,
    privacyByRegion: [],
    privacyByAddressKind: []
  });
  const [loading, setLoading] = useState(true);
  
  const geographicScope = roleMetadata?.find(m => m.scope_type === 'region' || m.scope_type === 'city' || m.scope_type === 'province');

  useEffect(() => {
    fetchPrivacyStats();
  }, []);

  const fetchPrivacyStats = async () => {
    setLoading(true);
    try {
      // Get all citizen addresses with privacy info
      const { data: addressData, error } = await supabase
        .from('citizen_address')
        .select('privacy_level, searchable_by_public, address_kind');

      if (error) throw error;

      // Calculate privacy level distribution
      const privateCount = addressData?.filter(a => a.privacy_level === 'PRIVATE').length || 0;
      const regionOnlyCount = addressData?.filter(a => a.privacy_level === 'REGION_ONLY').length || 0;
      const publicCount = addressData?.filter(a => a.privacy_level === 'PUBLIC').length || 0;

      // Calculate searchability
      const searchableCount = addressData?.filter(a => a.searchable_by_public).length || 0;
      const nonSearchableCount = (addressData?.length || 0) - searchableCount;

      // Get addresses with region info - join citizen_address with details
      const { data: addressWithRegion, error: regionError } = await supabase
        .from('citizen_address')
        .select('id, privacy_level, searchable_by_public, address_kind, uac');
      
      if (regionError) throw regionError;

      // Get region info from addresses table using UAC
      const uacs = addressWithRegion?.map(a => a.uac) || [];
      const { data: narAddresses } = await supabase
        .from('addresses')
        .select('uac, region')
        .in('uac', uacs);

      const uacRegionMap = new Map((narAddresses || []).map(a => [a.uac, a.region]));

      // Regional breakdown
      const regionMap = new Map<string, { private: number; regionOnly: number; public: number }>();
      addressWithRegion?.forEach(addr => {
        const region = uacRegionMap.get(addr.uac) || 'Unknown';
        if (!regionMap.has(region)) {
          regionMap.set(region, { private: 0, regionOnly: 0, public: 0 });
        }
        const current = regionMap.get(region)!;
        if (addr.privacy_level === 'PRIVATE') current.private++;
        else if (addr.privacy_level === 'REGION_ONLY') current.regionOnly++;
        else if (addr.privacy_level === 'PUBLIC') current.public++;
      });

      const privacyByRegion = Array.from(regionMap.entries()).map(([region, counts]) => ({
        region,
        ...counts
      })).slice(0, 5);

      // Address kind breakdown
      const kindMap = new Map<string, { private: number; regionOnly: number; public: number }>();
      addressData?.forEach(addr => {
        const kind = addr.address_kind || 'OTHER';
        if (!kindMap.has(kind)) {
          kindMap.set(kind, { private: 0, regionOnly: 0, public: 0 });
        }
        const current = kindMap.get(kind)!;
        if (addr.privacy_level === 'PRIVATE') current.private++;
        else if (addr.privacy_level === 'REGION_ONLY') current.regionOnly++;
        else if (addr.privacy_level === 'PUBLIC') current.public++;
      });

      const privacyByAddressKind = Array.from(kindMap.entries()).map(([kind, counts]) => ({
        kind,
        ...counts
      }));

      setStats({
        totalAddresses: addressData?.length || 0,
        privateCount,
        regionOnlyCount,
        publicCount,
        searchableCount,
        nonSearchableCount,
        privacyByRegion,
        privacyByAddressKind
      });
    } catch (error) {
      console.error('Error fetching privacy stats:', error);
      toast({
        title: t('privacyAnalytics.errorTitle'),
        description: t('privacyAnalytics.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: t('privacyAnalytics.privacyLevels.private'), value: stats.privateCount },
    { name: t('privacyAnalytics.privacyLevels.regionOnly'), value: stats.regionOnlyCount },
    { name: t('privacyAnalytics.privacyLevels.public'), value: stats.publicCount }
  ].filter(d => d.value > 0);

  const searchabilityData = [
    { name: t('privacyAnalytics.searchable'), value: stats.searchableCount },
    { name: t('privacyAnalytics.nonSearchable'), value: stats.nonSearchableCount }
  ].filter(d => d.value > 0);

  const privatePercentage = stats.totalAddresses > 0 
    ? Math.round((stats.privateCount / stats.totalAddresses) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center gap-2">
          {t('privacyAnalytics.description')}
          <Badge variant="secondary">{t('privacyAnalytics.readOnlyBadge')}</Badge>
        </AlertDescription>
      </Alert>

      {geographicScope && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            {t('privacyAnalytics.scopeRestriction')}: <Badge variant="outline">{geographicScope.scope_value}</Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('privacyAnalytics.totalAddresses')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAddresses}</div>
            <p className="text-xs text-muted-foreground">{t('privacyAnalytics.citizenAddresses')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('privacyAnalytics.privateAddresses')}</CardTitle>
            <Lock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.privateCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('privacyAnalytics.insights.privatePercentage', { percent: privatePercentage })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('privacyAnalytics.searchableAddresses')}</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.searchableCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('privacyAnalytics.insights.publicSearchable', { count: stats.searchableCount })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('privacyAnalytics.regionOnlyAddresses')}</CardTitle>
            <Globe className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regionOnlyCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('privacyAnalytics.insights.regionOnly', { count: stats.regionOnlyCount })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('privacyAnalytics.distribution')}</CardTitle>
            <CardDescription>{t('privacyAnalytics.distributionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('privacyAnalytics.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('privacyAnalytics.searchability')}</CardTitle>
            <CardDescription>{t('privacyAnalytics.searchabilityDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t('privacyAnalytics.searchable')}</span>
                </div>
                <Badge variant="outline">{stats.searchableCount}</Badge>
              </div>
              <Progress 
                value={stats.totalAddresses > 0 ? (stats.searchableCount / stats.totalAddresses) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('privacyAnalytics.nonSearchable')}</span>
                </div>
                <Badge variant="outline">{stats.nonSearchableCount}</Badge>
              </div>
              <Progress 
                value={stats.totalAddresses > 0 ? (stats.nonSearchableCount / stats.totalAddresses) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('privacyAnalytics.regionalPreferences')}</CardTitle>
          <CardDescription>{t('privacyAnalytics.regionalPreferencesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.privacyByRegion.length > 0 ? (
            <div className="space-y-4">
              {stats.privacyByRegion.map((region) => {
                const total = region.private + region.regionOnly + region.public;
                return (
                  <div key={region.region} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{region.region}</span>
                      <Badge variant="secondary">{total}</Badge>
                    </div>
                    <div className="flex gap-1 h-2">
                      {region.private > 0 && (
                        <div 
                          className="bg-destructive rounded-l"
                          style={{ width: `${(region.private / total) * 100}%` }}
                          title={`${t('privacyAnalytics.privacyLevels.private')}: ${region.private}`}
                        />
                      )}
                      {region.regionOnly > 0 && (
                        <div 
                          className="bg-warning"
                          style={{ width: `${(region.regionOnly / total) * 100}%` }}
                          title={`${t('privacyAnalytics.privacyLevels.regionOnly')}: ${region.regionOnly}`}
                        />
                      )}
                      {region.public > 0 && (
                        <div 
                          className="bg-primary rounded-r"
                          style={{ width: `${(region.public / total) * 100}%` }}
                          title={`${t('privacyAnalytics.privacyLevels.public')}: ${region.public}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-destructive rounded" />
                  {t('privacyAnalytics.privacyLevels.private')}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-warning rounded" />
                  {t('privacyAnalytics.privacyLevels.regionOnly')}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded" />
                  {t('privacyAnalytics.privacyLevels.public')}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('privacyAnalytics.noData')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Kind Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('privacyAnalytics.privacyByAddressKind')}</CardTitle>
          <CardDescription>{t('privacyAnalytics.privacyByAddressKindDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.privacyByAddressKind.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.privacyByAddressKind.map((item) => {
                const total = item.private + item.regionOnly + item.public;
                return (
                  <Card key={item.kind} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{t(`address:kind.${item.kind.toLowerCase()}`)}</Badge>
                        <span className="text-sm text-muted-foreground">{total} {t('privacyAnalytics.addresses')}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3 text-destructive" />
                            {t('privacyAnalytics.privacyLevels.private')}
                          </span>
                          <span>{item.private}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-warning" />
                            {t('privacyAnalytics.privacyLevels.regionOnly')}
                          </span>
                          <span>{item.regionOnly}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-primary" />
                            {t('privacyAnalytics.privacyLevels.public')}
                          </span>
                          <span>{item.public}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('privacyAnalytics.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
