import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, TrendingUp, TrendingDown, Activity, Database, 
  CheckCircle, AlertTriangle, Globe, RefreshCw, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { useUserRole } from "@/hooks/useUserRole";

interface CoverageData {
  id: string;
  region: string;
  city: string;
  addresses_registered: number;
  addresses_verified: number;
  addresses_published: number;
  verification_rate: number;
  publication_rate: number;
  coverage_percentage: number;
  last_updated: string;
}

interface RegionalSummary {
  region: string;
  total_addresses: number;
  verified_addresses: number;
  published_addresses: number;
  cities_count: number;
  avg_verification_rate: number;
  avg_publication_rate: number;
}

export function CARCoverageAnalytics() {
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'dashboard', 'common']);
  const { roleMetadata, role } = useUserRole();
  
  const [coverageData, setCoverageData] = useState<CoverageData[]>([]);
  const [regionalSummary, setRegionalSummary] = useState<RegionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nationalStats, setNationalStats] = useState({
    totalAddresses: 0,
    totalVerified: 0,
    totalPublished: 0,
    totalRegions: 0,
    totalCities: 0,
    avgVerificationRate: 0,
    avgPublicationRate: 0
  });

  // Determine geographic scope from role metadata
  const geographicMetadata = roleMetadata.find(m => 
    m.scope_type === 'city' || m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'geographic'
  );
  
  const scopeType = geographicMetadata?.scope_type || 'national';
  const scopeValue = geographicMetadata?.scope_value || null;

  useEffect(() => {
    fetchCoverageData();
  }, []);

  const fetchCoverageData = async () => {
    try {
      setLoading(true);

      // Fetch coverage analytics data with geographic scoping
      let query = supabase
        .from('coverage_analytics')
        .select('*');

      // Apply geographic scoping based on user role
      if (scopeType === 'city' && scopeValue) {
        query = query.ilike('city', scopeValue);
      } else if ((scopeType === 'region' || scopeType === 'province') && scopeValue) {
        query = query.ilike('region', scopeValue);
      }
      // If national or no scope, no filter is applied

      const { data: coverage, error: coverageError } = await query
        .order('region', { ascending: true })
        .order('city', { ascending: true });

      if (coverageError) throw coverageError;

      setCoverageData(coverage || []);

      // Calculate regional summaries
      if (coverage && coverage.length > 0) {
        const regionalMap = new Map<string, RegionalSummary>();

        coverage.forEach((item: CoverageData) => {
          if (!regionalMap.has(item.region)) {
            regionalMap.set(item.region, {
              region: item.region,
              total_addresses: 0,
              verified_addresses: 0,
              published_addresses: 0,
              cities_count: 0,
              avg_verification_rate: 0,
              avg_publication_rate: 0
            });
          }

          const summary = regionalMap.get(item.region)!;
          summary.total_addresses += item.addresses_registered;
          summary.verified_addresses += item.addresses_verified;
          summary.published_addresses += item.addresses_published;
          summary.cities_count += 1;
        });

        // Calculate averages
        const summaries = Array.from(regionalMap.values()).map(summary => ({
          ...summary,
          avg_verification_rate: summary.total_addresses > 0 
            ? Math.round((summary.verified_addresses / summary.total_addresses) * 100) 
            : 0,
          avg_publication_rate: summary.total_addresses > 0 
            ? Math.round((summary.published_addresses / summary.total_addresses) * 100) 
            : 0
        }));

        setRegionalSummary(summaries);

        // Calculate national stats
        const totalAddresses = coverage.reduce((sum, item) => sum + item.addresses_registered, 0);
        const totalVerified = coverage.reduce((sum, item) => sum + item.addresses_verified, 0);
        const totalPublished = coverage.reduce((sum, item) => sum + item.addresses_published, 0);
        const uniqueRegions = new Set(coverage.map(item => item.region)).size;
        const uniqueCities = coverage.length;

        setNationalStats({
          totalAddresses,
          totalVerified,
          totalPublished,
          totalRegions: uniqueRegions,
          totalCities: uniqueCities,
          avgVerificationRate: totalAddresses > 0 ? Math.round((totalVerified / totalAddresses) * 100) : 0,
          avgPublicationRate: totalAddresses > 0 ? Math.round((totalPublished / totalAddresses) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error fetching coverage data:', error);
      toast({
        title: t('admin:carAdministrativeOverview.errorTitle'),
        description: t('admin:coverage.failedToLoadCoverage'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshCoverage = async () => {
    try {
      setRefreshing(true);
      
      // Call the function to recalculate coverage analytics
      const { error } = await supabase.rpc('calculate_coverage_analytics');
      
      if (error) throw error;
      
      // Refresh the display
      await fetchCoverageData();
      
      toast({
        title: t('common:status.success'),
        description: t('admin:coverage.coverageUpdated')
      });
    } catch (error) {
      console.error('Error refreshing coverage:', error);
      toast({
        title: t('admin:carAdministrativeOverview.errorTitle'),
        description: t('admin:coverage.failedToRefreshCoverage'),
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCoverageLabel = (percentage: number) => {
    if (percentage >= 80) return t('admin:quality.excellent');
    if (percentage >= 50) return t('admin:quality.good');
    return t('admin:quality.needsAttention');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('admin:coverage.coverageAnalytics')}</h3>
          <Badge variant="outline">{t('common:loading')}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (coverageData.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{t('admin:coverage.noCoverageData')}</span>
          <Button 
            onClick={refreshCoverage} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('dashboard:refreshData')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{t('admin:coverage.carCoverageAnalytics')}</h3>
            {scopeType !== 'national' && scopeValue && (
              <Badge variant="outline">
                {scopeType === 'city' ? t('admin:coverage.city') : t('admin:coverage.regional')}: {scopeValue}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('admin:quality.lastUpdated')}: {coverageData[0]?.last_updated 
              ? new Date(coverageData[0].last_updated).toLocaleDateString() 
              : t('admin:coverage.never')}
            {scopeType !== 'national' && scopeValue && ` • ${t('admin:coverage.viewingDataOnly', { scope: scopeValue })}`}
          </p>
        </div>
        <Button 
          onClick={refreshCoverage} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('dashboard:refreshData')}
        </Button>
      </div>

      {/* National Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:coverage.totalCoverage')}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalStats.totalAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin:coverage.acrossRegionsCities', { regions: nationalStats.totalRegions, cities: nationalStats.totalCities })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:coverage.verificationCoverage')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {nationalStats.avgVerificationRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {nationalStats.totalVerified.toLocaleString()} {t('admin:quality.verified')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:coverage.publicationRate')}</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {nationalStats.avgPublicationRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {nationalStats.totalPublished.toLocaleString()} {t('admin:quality.published')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:coverage.geographicReach')}</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {nationalStats.totalCities}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin:coverage.citiesWithCoverage')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regional">{t('admin:coverage.regionalSummary')}</TabsTrigger>
          <TabsTrigger value="city">{t('admin:coverage.cityDetails')}</TabsTrigger>
        </TabsList>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin:coverage.regionalCoverageOverview')}</CardTitle>
              <CardDescription>{t('admin:coverage.addressCoverageAggregated')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalSummary.map((region) => (
                  <div key={region.region} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{region.region}</h4>
                          <Badge variant="outline">{region.cities_count} {t('admin:coverage.cities')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {region.total_addresses.toLocaleString()} {t('admin:coverage.totalAddresses')}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-medium text-green-600">{region.avg_verification_rate}%</div>
                          <div className="text-muted-foreground">{t('admin:quality.verified')}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-blue-600">{region.avg_publication_rate}%</div>
                          <div className="text-muted-foreground">{t('admin:quality.published')}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{t('admin:coverage.verification')}</span>
                          <span>{region.verified_addresses.toLocaleString()}</span>
                        </div>
                        <Progress value={region.avg_verification_rate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{t('admin:coverage.publication')}</span>
                          <span>{region.published_addresses.toLocaleString()}</span>
                        </div>
                        <Progress value={region.avg_publication_rate} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="city" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin:coverage.cityLevelCoverage')}</CardTitle>
              <CardDescription>{t('admin:coverage.detailedCoverageMetrics')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coverageData.map((city) => (
                  <div key={city.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{city.city}</h4>
                        <p className="text-sm text-muted-foreground">{city.region}</p>
                      </div>
                      <Badge variant="outline">
                        {city.addresses_registered.toLocaleString()} {t('dashboard:addresses')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-sm font-medium mb-1">{t('admin:coverage.verification')}</div>
                        <div className="flex items-center gap-2">
                          <Progress value={city.verification_rate} className="flex-1 h-2" />
                          <span className="text-sm font-semibold text-green-600">
                            {Math.round(city.verification_rate)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {city.addresses_verified.toLocaleString()} {t('admin:quality.verified')}
                        </p>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">{t('admin:coverage.publication')}</div>
                        <div className="flex items-center gap-2">
                          <Progress value={city.publication_rate} className="flex-1 h-2" />
                          <span className="text-sm font-semibold text-blue-600">
                            {Math.round(city.publication_rate)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {city.addresses_published.toLocaleString()} {t('admin:quality.published')}
                        </p>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">{t('dashboard:coverage')}</div>
                        <div className="flex items-center gap-2">
                          <Progress value={city.coverage_percentage} className="flex-1 h-2" />
                          <span className={`text-sm font-semibold ${getCoverageColor(city.coverage_percentage)}`}>
                            {Math.round(city.coverage_percentage)}%
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${getCoverageColor(city.coverage_percentage)}`}>
                          {getCoverageLabel(city.coverage_percentage)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}