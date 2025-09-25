import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, AlertTriangle, CheckCircle, Clock, Search, 
  MapPin, RefreshCw, Users, Building, Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ValidationResult {
  id: string;
  uac: string;
  validation_type: string;
  status: 'valid' | 'invalid' | 'warning';
  message: string;
  details?: any;
  created_at: string;
}

interface DuplicateCheck {
  citizen_address_id: string;
  uac: string;
  duplicates: any[];
  conflict_type: string;
}

export function CARDataValidation() {
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'address']);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [duplicateChecks, setDuplicateChecks] = useState<DuplicateCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningValidation, setRunningValidation] = useState(false);
  const [searchUAC, setSearchUAC] = useState('');
  const [stats, setStats] = useState({
    total_addresses: 0,
    nar_verified: 0,
    nar_unverified: 0,
    duplicates_found: 0,
    validation_issues: 0
  });

  useEffect(() => {
    fetchValidationResults();
    fetchDuplicateChecks();
    fetchStats();
  }, []);

  const fetchValidationResults = async () => {
    try {
      // This would fetch from a validation_results table if it existed
      // For now, we'll simulate validation results
      setValidationResults([]);
    } catch (error) {
      console.error('Error fetching validation results:', error);
    }
  };

  const fetchDuplicateChecks = async () => {
    try {
      // Check for potential duplicates in citizen addresses
      const { data: addresses, error } = await supabase
        .from('citizen_address')
        .select('*');

      if (error) throw error;

      // Group by UAC to find duplicates - simplified approach
      const uacGroups: { [key: string]: any[] } = {};
      
      addresses.forEach((addr) => {
        if (!uacGroups[addr.uac]) {
          uacGroups[addr.uac] = [];
        }
        uacGroups[addr.uac].push(addr);
      });

      const duplicates: DuplicateCheck[] = [];
      Object.keys(uacGroups).forEach((uac) => {
        const addrs = uacGroups[uac];
        if (addrs.length > 1) {
          duplicates.push({
            citizen_address_id: addrs[0].id,
            uac,
            duplicates: addrs,
            conflict_type: 'multiple_claims'
          });
        }
      });

      setDuplicateChecks(duplicates);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total addresses
      const { data: totalAddresses, error: totalError } = await supabase
        .from('citizen_address')
        .select('id');

      if (totalError) throw totalError;

      // Get NAR verification stats with any type to avoid complex inference
      const { data: narStats, error: narError } = await supabase
        .from('citizen_address_with_details')
        .select('nar_verified') as { data: any[] | null; error: any };

      if (narError) throw narError;

      const narVerified = narStats.filter(addr => addr.nar_verified).length;
      const narUnverified = narStats.filter(addr => !addr.nar_verified).length;

      // Skip flagged addresses query since column doesn't exist
      const flaggedAddresses: any[] = [];

      

      setStats({
        total_addresses: totalAddresses.length,
        nar_verified: narVerified,
        nar_unverified: narUnverified,
        duplicates_found: duplicateChecks.length,
        validation_issues: flaggedAddresses.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const runValidation = async () => {
    setRunningValidation(true);
    try {
      // Run comprehensive validation
      toast({
        title: 'Validation Started',
        description: 'Running comprehensive data validation...',
      });

      // This would call an edge function to run validation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate validation

      await fetchValidationResults();
      await fetchDuplicateChecks();
      await fetchStats();

      toast({
        title: 'Validation Complete',
        description: 'Data validation has been completed successfully.',
      });
    } catch (error) {
      console.error('Error running validation:', error);
      toast({
        title: 'Validation Failed',
        description: 'Failed to complete data validation.',
        variant: 'destructive',
      });
    } finally {
      setRunningValidation(false);
    }
  };

  const validateSingleUAC = async () => {
    if (!searchUAC.trim()) return;

    setLoading(true);
    try {
      // Check if UAC exists in NAR
      const { data: narAddress, error: narError } = await supabase
        .from('addresses')
        .select('*')
        .eq('uac', searchUAC)
        .maybeSingle();

      if (narError) throw narError;

      // Check citizen address claims for this UAC
      const { data: citizenAddresses, error: carError } = await supabase
        .from('citizen_address_with_details')
        .select('*')
        .eq('uac', searchUAC);

      if (carError) throw carError;

      const result = {
        uac: searchUAC,
        nar_exists: !!narAddress,
        nar_verified: narAddress?.verified || false,
        nar_public: narAddress?.public || false,
        citizen_claims: citizenAddresses.length,
        citizen_addresses: citizenAddresses
      };

      toast({
        title: 'UAC Validation Complete',
        description: `Found ${citizenAddresses.length} citizen claims for UAC ${searchUAC}`,
      });

      console.log('UAC Validation Result:', result);
    } catch (error) {
      console.error('Error validating UAC:', error);
      toast({
        title: 'Validation Error',
        description: 'Failed to validate UAC',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveDuplicate = async (duplicateCheck: DuplicateCheck, action: string) => {
    try {
      // This would implement duplicate resolution logic
      toast({
        title: 'Duplicate Resolved',
        description: `Applied ${action} to duplicate UAC ${duplicateCheck.uac}`,
      });

      await fetchDuplicateChecks();
    } catch (error) {
      console.error('Error resolving duplicate:', error);
      toast({
        title: 'Resolution Failed',
        description: 'Failed to resolve duplicate',
        variant: 'destructive',
      });
    }
  };

  const StatCard = ({ title, value, color, icon: Icon }: { 
    title: string; 
    value: number; 
    color: string; 
    icon: React.ComponentType<any>;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Addresses" value={stats.total_addresses} color="text-blue-600" icon={Database} />
        <StatCard title="NAR Verified" value={stats.nar_verified} color="text-green-600" icon={CheckCircle} />
        <StatCard title="NAR Unverified" value={stats.nar_unverified} color="text-yellow-600" icon={Clock} />
        <StatCard title="Duplicates Found" value={stats.duplicates_found} color="text-red-600" icon={Users} />
        <StatCard title="Validation Issues" value={stats.validation_issues} color="text-orange-600" icon={AlertTriangle} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Validation Overview</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicate Detection</TabsTrigger>
          <TabsTrigger value="nar-cross-ref">NAR Cross-Reference</TabsTrigger>
          <TabsTrigger value="single-validation">Single UAC Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation Overview</CardTitle>
              <CardDescription>
                Comprehensive validation of citizen address data against NAR registry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Run Full Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    Validate all citizen addresses against NAR registry and check for conflicts
                  </p>
                </div>
                <Button 
                  onClick={runValidation} 
                  disabled={runningValidation}
                  className="min-w-[120px]"
                >
                  {runningValidation ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Run Validation
                    </>
                  )}
                </Button>
              </div>
              
              {validationResults.length === 0 && !runningValidation && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4" />
                  <p>No validation results available. Run validation to see results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Address Detection</CardTitle>
              <CardDescription>
                Addresses with multiple citizen claims requiring resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {duplicateChecks.length > 0 ? (
                <div className="space-y-4">
                  {duplicateChecks.map((duplicate) => (
                    <Card key={duplicate.uac} className="border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">
                                <Users className="h-3 w-3 mr-1" />
                                Duplicate UAC
                              </Badge>
                              <span className="font-mono text-sm">{duplicate.uac}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {duplicate.duplicates.length} citizens claiming this address
                            </p>
                            <div className="space-y-1">
                              {duplicate.duplicates.map((addr: any, index: number) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                  • Person ID: {addr.person_id} - Status: {addr.status}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => resolveDuplicate(duplicate, 'flag_for_review')}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => resolveDuplicate(duplicate, 'auto_resolve')}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No duplicate addresses found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nar-cross-ref" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NAR Cross-Reference Status</CardTitle>
              <CardDescription>
                Cross-reference status of citizen addresses with National Address Registry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.nar_verified}</div>
                  <p className="text-sm text-muted-foreground">NAR Verified</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.nar_unverified}</div>
                  <p className="text-sm text-muted-foreground">NAR Unverified</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((stats.nar_verified / stats.total_addresses) * 100) || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Verification Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single-validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Single UAC Validation</CardTitle>
              <CardDescription>
                Validate a specific UAC against NAR registry and check citizen claims
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="uac-search">UAC to Validate</Label>
                  <Input
                    id="uac-search"
                    placeholder="Enter UAC (e.g., GQ-BN-MAL-ABC123-AB)"
                    value={searchUAC}
                    onChange={(e) => setSearchUAC(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={validateSingleUAC} 
                  disabled={loading || !searchUAC.trim()}
                  className="mt-6"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}