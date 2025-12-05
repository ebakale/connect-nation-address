import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Home, CheckCircle, Clock, AlertTriangle, 
  RefreshCw, UserCheck, Users2, Baby, Shield, Eye, Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface CARStats {
  totalCitizenAddresses: number;
  selfDeclared: number;
  confirmed: number;
  rejected: number;
  primaryAddresses: number;
  secondaryAddresses: number;
  privacyPrivate: number;
  privacyHousehold: number;
  privacyPublic: number;
}

interface HouseholdStats {
  totalHouseholds: number;
  activeHouseholds: number;
  verifiedHouseholds: number;
  totalMembers: number;
  totalDependents: number;
  activeDependents: number;
  membersByRelationship: Record<string, number>;
  dependentsByType: Record<string, number>;
}

interface AdoptionStats {
  totalUsers: number;
  usersWithCAR: number;
  adoptionRate: number;
  verificationRate: number;
}

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  confirmed: '#22c55e',
  pending: '#eab308',
  rejected: '#ef4444',
  private: '#6366f1',
  household: '#8b5cf6',
  public: '#a855f7',
};

export function CARCoverageAnalytics() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation('admin');
  
  const [carStats, setCarStats] = useState<CARStats | null>(null);
  const [householdStats, setHouseholdStats] = useState<HouseholdStats | null>(null);
  const [adoptionStats, setAdoptionStats] = useState<AdoptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCARStats(),
        fetchHouseholdStats(),
        fetchAdoptionStats()
      ]);
    } catch (error) {
      console.error('Error fetching CAR insights:', error);
      toast({
        title: t('quality.errorTitle'),
        description: t('carInsights.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCARStats = async () => {
    const { data: addresses, error } = await supabase
      .from('citizen_address')
      .select('status, address_kind, scope, privacy_level');

    if (error) throw error;

    const stats: CARStats = {
      totalCitizenAddresses: addresses?.length || 0,
      selfDeclared: addresses?.filter(a => a.status === 'SELF_DECLARED').length || 0,
      confirmed: addresses?.filter(a => a.status === 'CONFIRMED').length || 0,
      rejected: addresses?.filter(a => a.status === 'REJECTED').length || 0,
      primaryAddresses: addresses?.filter(a => a.address_kind === 'PRIMARY').length || 0,
      secondaryAddresses: addresses?.filter(a => a.address_kind === 'SECONDARY').length || 0,
      privacyPrivate: addresses?.filter(a => a.privacy_level === 'PRIVATE').length || 0,
      privacyHousehold: addresses?.filter(a => a.privacy_level === 'REGION_ONLY').length || 0,
      privacyPublic: addresses?.filter(a => a.privacy_level === 'PUBLIC').length || 0,
    };

    setCarStats(stats);
  };

  const fetchHouseholdStats = async () => {
    // Fetch households
    const { data: households, error: householdsError } = await supabase
      .from('household_groups')
      .select('is_active, verified_by_car');

    if (householdsError) throw householdsError;

    // Fetch members
    const { data: members, error: membersError } = await supabase
      .from('household_members')
      .select('relationship_to_head, membership_status');

    if (membersError) throw membersError;

    // Fetch dependents
    const { data: dependents, error: dependentsError } = await supabase
      .from('household_dependents')
      .select('dependent_type, is_active');

    if (dependentsError) throw dependentsError;

    // Calculate member relationship distribution
    const membersByRelationship: Record<string, number> = {};
    members?.forEach(m => {
      const rel = m.relationship_to_head || 'OTHER';
      membersByRelationship[rel] = (membersByRelationship[rel] || 0) + 1;
    });

    // Calculate dependent type distribution
    const dependentsByType: Record<string, number> = {};
    dependents?.forEach(d => {
      const type = d.dependent_type || 'OTHER';
      dependentsByType[type] = (dependentsByType[type] || 0) + 1;
    });

    const stats: HouseholdStats = {
      totalHouseholds: households?.length || 0,
      activeHouseholds: households?.filter(h => h.is_active).length || 0,
      verifiedHouseholds: households?.filter(h => h.verified_by_car).length || 0,
      totalMembers: members?.length || 0,
      totalDependents: dependents?.length || 0,
      activeDependents: dependents?.filter(d => d.is_active).length || 0,
      membersByRelationship,
      dependentsByType,
    };

    setHouseholdStats(stats);
  };

  const fetchAdoptionStats = async () => {
    // Get total user count from profiles
    const { count: totalUsers, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profilesError) throw profilesError;

    // Get unique users with CAR addresses
    const { data: carUsers, error: carError } = await supabase
      .from('citizen_address')
      .select('person_id');

    if (carError) throw carError;

    const uniqueCarUsers = new Set(carUsers?.map(c => c.person_id)).size;
    
    // Get confirmed addresses count
    const { data: confirmedData, error: confirmedError } = await supabase
      .from('citizen_address')
      .select('status')
      .eq('status', 'CONFIRMED');

    if (confirmedError) throw confirmedError;

    const totalCAR = carUsers?.length || 0;
    const confirmedCount = confirmedData?.length || 0;

    setAdoptionStats({
      totalUsers: totalUsers || 0,
      usersWithCAR: uniqueCarUsers,
      adoptionRate: totalUsers ? Math.round((uniqueCarUsers / totalUsers) * 100) : 0,
      verificationRate: totalCAR ? Math.round((confirmedCount / totalCAR) * 100) : 0,
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllStats();
    setRefreshing(false);
    toast({
      title: t('quality.metricsUpdated'),
    });
  };

  const avgHouseholdSize = householdStats && householdStats.activeHouseholds > 0
    ? ((householdStats.totalMembers + householdStats.totalDependents) / householdStats.activeHouseholds).toFixed(1)
    : '0';

  // Chart data
  const statusChartData = carStats ? [
    { name: t('carInsights.selfDeclared'), value: carStats.selfDeclared, color: CHART_COLORS.pending },
    { name: t('carInsights.confirmed'), value: carStats.confirmed, color: CHART_COLORS.confirmed },
    { name: t('carInsights.rejected'), value: carStats.rejected, color: CHART_COLORS.rejected },
  ] : [];

  const privacyChartData = carStats ? [
    { name: t('carInsights.private'), value: carStats.privacyPrivate, color: CHART_COLORS.private },
    { name: t('carInsights.regionOnly'), value: carStats.privacyHousehold, color: CHART_COLORS.household },
    { name: t('carInsights.public'), value: carStats.privacyPublic, color: CHART_COLORS.public },
  ] : [];

  const addressKindData = carStats ? [
    { name: t('carInsights.primaryAddresses'), value: carStats.primaryAddresses },
    { name: t('carInsights.secondaryAddresses'), value: carStats.secondaryAddresses },
  ] : [];

  const memberRelationshipData = householdStats 
    ? Object.entries(householdStats.membersByRelationship).map(([key, value]) => ({
        name: t(`carInsights.relationships.${key.toLowerCase()}`, { defaultValue: key }),
        value
      }))
    : [];

  const dependentTypeData = householdStats
    ? Object.entries(householdStats.dependentsByType).map(([key, value]) => ({
        name: t(`carInsights.dependentTypes.${key.toLowerCase()}`, { defaultValue: key }),
        value
      }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6" key={i18n.resolvedLanguage}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('carInsights.title')}</h3>
          <Badge variant="outline">{t('common:loading', { defaultValue: 'Loading...' })}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  if (!carStats || !householdStats || !adoptionStats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{t('carInsights.noData')}</span>
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('quality.refreshData')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" key={i18n.resolvedLanguage}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{t('carInsights.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('carInsights.description')}</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('quality.refreshData')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('carInsights.citizenAdoption')}</CardTitle>
            <UserCheck className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">{adoptionStats.adoptionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {adoptionStats.usersWithCAR} / {adoptionStats.totalUsers} {t('carInsights.usersWithAddresses')}
            </p>
            <Progress value={adoptionStats.adoptionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('carInsights.carVerificationRate')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adoptionStats.verificationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {carStats.confirmed} {t('carInsights.confirmedAddresses')}
            </p>
            <Progress value={adoptionStats.verificationRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('carInsights.householdFormation')}</CardTitle>
            <Home className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{householdStats.activeHouseholds}</div>
            <p className="text-xs text-muted-foreground">
              {householdStats.verifiedHouseholds} {t('carInsights.verifiedHouseholds')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('carInsights.averageHouseholdSize')}</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{avgHouseholdSize}</div>
            <p className="text-xs text-muted-foreground">
              {householdStats.totalMembers + householdStats.totalDependents} {t('carInsights.membersAndDependents')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="status">{t('carInsights.addressStatus')}</TabsTrigger>
          <TabsTrigger value="households">{t('carInsights.householdAnalytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('carInsights.statusDistribution')}
                </CardTitle>
                <CardDescription>{t('carInsights.statusDistributionDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.pending }}></div>
                    <span className="text-sm">{t('carInsights.selfDeclared')}: {carStats.selfDeclared}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.confirmed }}></div>
                    <span className="text-sm">{t('carInsights.confirmed')}: {carStats.confirmed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.rejected }}></div>
                    <span className="text-sm">{t('carInsights.rejected')}: {carStats.rejected}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t('carInsights.privacyDistribution')}
                </CardTitle>
                <CardDescription>{t('carInsights.privacyDistributionDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={privacyChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {privacyChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-indigo-500" />
                    <span className="text-sm">{t('carInsights.private')}: {carStats.privacyPrivate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3 text-violet-500" />
                    <span className="text-sm">{t('carInsights.regionOnly')}: {carStats.privacyHousehold}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-purple-500" />
                    <span className="text-sm">{t('carInsights.public')}: {carStats.privacyPublic}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Kind Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('carInsights.addressKindDistribution')}</CardTitle>
                <CardDescription>{t('carInsights.addressKindDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={addressKindData} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="households" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Household Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  {t('carInsights.householdSummary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.totalHouseholds')}</p>
                    <p className="text-2xl font-bold">{householdStats.totalHouseholds}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.activeHouseholds')}</p>
                    <p className="text-2xl font-bold text-green-600">{householdStats.activeHouseholds}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.verifiedHouseholds')}</p>
                    <p className="text-2xl font-bold text-blue-600">{householdStats.verifiedHouseholds}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.verificationRate')}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {householdStats.totalHouseholds > 0 
                        ? Math.round((householdStats.verifiedHouseholds / householdStats.totalHouseholds) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members & Dependents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="h-4 w-4" />
                  {t('carInsights.membersAndDependentsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.totalMembers')}</p>
                    <p className="text-2xl font-bold">{householdStats.totalMembers}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.totalDependents')}</p>
                    <p className="text-2xl font-bold">{householdStats.totalDependents}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.activeDependents')}</p>
                    <p className="text-2xl font-bold text-green-600">{householdStats.activeDependents}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('carInsights.avgPerHousehold')}</p>
                    <p className="text-2xl font-bold text-indigo-600">{avgHouseholdSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members by Relationship */}
            {memberRelationshipData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('carInsights.membersByRelationship')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={memberRelationshipData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dependents by Type */}
            {dependentTypeData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    {t('carInsights.dependentsByType')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dependentTypeData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
