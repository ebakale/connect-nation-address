import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Activity, Database, 
  CheckCircle, AlertTriangle, Clock, BarChart3,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface QualityMetrics {
  totalCitizenAddresses: number;
  pendingVerificationAddresses: number;
  confirmedAddresses: number;
  rejectedAddresses: number;
  duplicatePersonRecords: number;
  addressCoverageByRegion: Record<string, number>;
  averageVerificationTimeHours: number;
  qualityScoreDistribution: Record<string, number>;
  dateMeasured: string;
}

export function CARQualityMetrics() {
  const { toast } = useToast();
  const { t } = useTranslation(['admin']);
  
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQualityMetrics();
  }, []);

  const fetchQualityMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('car_quality_metrics')
        .select('*')
        .order('date_measured', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMetrics({
          totalCitizenAddresses: data.total_citizen_addresses || 0,
          pendingVerificationAddresses: data.pending_verification_addresses || 0,
          confirmedAddresses: data.confirmed_addresses || 0,
          rejectedAddresses: data.rejected_addresses || 0,
          duplicatePersonRecords: data.duplicate_person_records || 0,
          addressCoverageByRegion: (data.address_coverage_by_region as Record<string, number>) || {},
          averageVerificationTimeHours: data.average_verification_time_hours || 0,
          qualityScoreDistribution: (data.quality_score_distribution as Record<string, number>) || {},
          dateMeasured: data.date_measured
        });
      }
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load quality metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    try {
      setRefreshing(true);
      
      // Call the function to update metrics
      const { error } = await supabase.rpc('update_car_quality_metrics');
      
      if (error) throw error;
      
      // Refresh the display
      await fetchQualityMetrics();
      
      toast({
        title: "Success",
        description: "Quality metrics updated successfully"
      });
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: "Error",
        description: "Failed to refresh quality metrics",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const calculateVerificationRate = () => {
    if (!metrics || metrics.totalCitizenAddresses === 0) return 0;
    return Math.round((metrics.confirmedAddresses / metrics.totalCitizenAddresses) * 100);
  };

  const calculateRejectionRate = () => {
    if (!metrics || metrics.totalCitizenAddresses === 0) return 0;
    return Math.round((metrics.rejectedAddresses / metrics.totalCitizenAddresses) * 100);
  };

  const getQualityScore = () => {
    const verificationRate = calculateVerificationRate();
    const rejectionRate = calculateRejectionRate();
    const duplicateScore = metrics ? Math.max(0, 100 - (metrics.duplicatePersonRecords * 5)) : 0;
    
    return Math.round((verificationRate * 0.4) + ((100 - rejectionRate) * 0.3) + (duplicateScore * 0.3));
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Attention";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quality Metrics</h3>
          <Badge variant="outline">Loading...</Badge>
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

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No quality metrics available. Click refresh to generate initial metrics.
        </AlertDescription>
      </Alert>
    );
  }

  const qualityScore = getQualityScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">CAR Quality Metrics</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(metrics.dateMeasured).toLocaleDateString()}
          </p>
        </div>
        <Button 
          onClick={refreshMetrics} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Quality Score */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall System Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${getQualityColor(qualityScore)}`}>
                {qualityScore}%
              </div>
              <p className={`text-sm font-medium ${getQualityColor(qualityScore)}`}>
                {getQualityLabel(qualityScore)}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Based on verification rates,</div>
              <div>rejection rates, and data integrity</div>
            </div>
          </div>
          <Progress value={qualityScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCitizenAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Citizen address records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {calculateVerificationRate()}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.confirmedAddresses} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.pendingVerificationAddresses}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {calculateRejectionRate()}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.rejectedAddresses} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(metrics.averageVerificationTimeHours)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average verification time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicate Records</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.duplicatePersonRecords}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Regional Coverage */}
      {Object.keys(metrics.addressCoverageByRegion).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Address Distribution</CardTitle>
            <CardDescription>Address coverage by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.addressCoverageByRegion)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([region, count]) => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{region}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <Progress 
                          value={(count / Math.max(...Object.values(metrics.addressCoverageByRegion))) * 100} 
                          className="h-2" 
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}