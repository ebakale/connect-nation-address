import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export function NARCARTestPanel() {
  const { user } = useAuth();
  const { hasAdminAccess } = useUserRole();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    if (!user || !hasAdminAccess) return;
    
    setLoading(true);
    const results = [];

    try {
      // Test 1: Check NAR Authorities table
      const { data: narAuthorities, error: narError } = await supabase
        .from('nar_authorities')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'NAR Authorities Table',
        status: narError ? 'error' : 'success',
        message: narError ? narError.message : `Found ${narAuthorities?.length || 0} NAR authorities`,
        data: narAuthorities
      });

      // Test 2: Check Citizen Address (CAR) table
      const { data: citizenAddresses, error: carError } = await supabase
        .from('citizen_address')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Citizen Address (CAR) Table',
        status: carError ? 'error' : 'success',
        message: carError ? carError.message : `Found ${citizenAddresses?.length || 0} citizen addresses`,
        data: citizenAddresses
      });

      // Test 3: Check Address Requests table
      const { data: addressRequests, error: requestsError } = await supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'pending')
        .limit(5);
      
      results.push({
        test: 'Address Requests (Pending)',
        status: requestsError ? 'error' : 'success',
        message: requestsError ? requestsError.message : `Found ${addressRequests?.length || 0} pending requests`,
        data: addressRequests
      });

      // Test 4: Check Addresses (NAR) table
      const { data: addresses, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('verified', true)
        .limit(5);
      
      results.push({
        test: 'NAR Addresses (Verified)',
        status: addressesError ? 'error' : 'success',
        message: addressesError ? addressesError.message : `Found ${addresses?.length || 0} verified addresses in NAR`,
        data: addresses
      });

      // Test 5: Check RLS Policies
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      results.push({
        test: 'User Roles & RLS',
        status: rolesError ? 'error' : 'success',
        message: rolesError ? rolesError.message : `User has ${userRoles?.length || 0} roles`,
        data: userRoles
      });

    } catch (error) {
      results.push({
        test: 'General Test Error',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!hasAdminAccess) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Admin access required to run NAR/CAR tests.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NAR/CAR System Test Panel</CardTitle>
        <CardDescription>
          Test the separation and integration between National Address Registry (NAR) and Citizen Address Repository (CAR)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run System Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">View Data</summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>System Architecture:</strong>
            <br />• NAR (National Address Registry): Authoritative addresses created by authorities
            <br />• CAR (Citizen Address Repository): Personal address associations for citizens  
            <br />• Address Requests: Citizen requests for new address verification
            <br />• NAR Authorities: Users with permission to create official addresses
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}