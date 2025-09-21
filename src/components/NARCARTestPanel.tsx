import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useTranslation } from 'react-i18next';

export function NARCARTestPanel() {
  const { user } = useAuth();
  const { hasAdminAccess } = useUserRole();
  const { t } = useTranslation(['admin']);
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
        test: t('admin:narCarIntegration.testNames.narAuthoritiesTable'),
        status: narError ? 'error' : 'success',
        message: narError ? narError.message : t('admin:narCarIntegration.testMessages.foundNarAuthorities', { count: narAuthorities?.length || 0 }),
        data: narAuthorities
      });

      // Test 2: Check Citizen Address (CAR) table
      const { data: citizenAddresses, error: carError } = await supabase
        .from('citizen_address')
        .select('*')
        .limit(5);
      
      results.push({
        test: t('admin:narCarIntegration.testNames.citizenAddressCar'),
        status: carError ? 'error' : 'success',
        message: carError ? carError.message : t('admin:narCarIntegration.testMessages.foundCitizenAddresses', { count: citizenAddresses?.length || 0 }),
        data: citizenAddresses
      });

      // Test 3: Check Address Requests table
      const { data: addressRequests, error: requestsError } = await supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'pending')
        .limit(5);
      
      results.push({
        test: t('admin:narCarIntegration.testNames.addressRequestsPending'),
        status: requestsError ? 'error' : 'success',
        message: requestsError ? requestsError.message : t('admin:narCarIntegration.testMessages.foundPendingRequests', { count: addressRequests?.length || 0 }),
        data: addressRequests
      });

      // Test 4: Check Addresses (NAR) table
      const { data: addresses, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('verified', true)
        .limit(5);
      
      results.push({
        test: t('admin:narCarIntegration.testNames.narAddressesVerified'),
        status: addressesError ? 'error' : 'success',
        message: addressesError ? addressesError.message : t('admin:narCarIntegration.testMessages.foundVerifiedAddresses', { count: addresses?.length || 0 }),
        data: addresses
      });

      // Test 5: Check RLS Policies
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      results.push({
        test: t('admin:narCarIntegration.testNames.userRolesRls'),
        status: rolesError ? 'error' : 'success',
        message: rolesError ? rolesError.message : t('admin:narCarIntegration.testMessages.userHasRoles', { count: userRoles?.length || 0 }),
        data: userRoles
      });

    } catch (error) {
      results.push({
        test: t('admin:narCarIntegration.testNames.generalTestError'),
        status: 'error',
        message: error instanceof Error ? error.message : t('admin:narCarIntegration.testMessages.unknownError'),
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
          {t('admin:narCarIntegration.adminAccessRequired')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin:narCarIntegration.systemTestPanel')}</CardTitle>
        <CardDescription>
          {t('admin:narCarIntegration.testPanelDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? t('admin:narCarIntegration.runningTests') : t('admin:narCarIntegration.runSystemTests')}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t('admin:narCarIntegration.testResults')}</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {t(`admin:narCarIntegration.statusLabels.${result.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">{t('admin:narCarIntegration.viewData')}</summary>
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
            <strong>{t('admin:narCarIntegration.systemArchitecture')}</strong>
            <br />• {t('admin:narCarIntegration.narDescription')}
            <br />• {t('admin:narCarIntegration.carDescription')}
            <br />• {t('admin:narCarIntegration.addressRequestsDescription')}
            <br />• {t('admin:narCarIntegration.narAuthoritiesDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}