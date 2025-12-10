import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Shield, MapPin, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VerifierAssignment {
  user_id: string;
  email: string;
  full_name: string;
  verification_domain: string | null;
  geographic_scope: { type: string; value: string } | null;
}

const PERMISSION_MATRIX = [
  {
    operation: 'Search verified addresses',
    citizen: true,
    property_claimant: true,
    field_agent: true,
    verifier: true,
    registrar: true,
    ndaa_admin: true,
    partner: 'API',
    auditor: true,
    data_steward: true
  },
  {
    operation: 'Create draft address',
    citizen: false,
    property_claimant: false,
    field_agent: true,
    verifier: 'corrections',
    registrar: true,
    ndaa_admin: true,
    partner: false,
    auditor: false,
    data_steward: 'test sandboxes'
  },
  {
    operation: 'Upload/view evidence',
    citizen: 'view redacted',
    property_claimant: 'own only',
    field_agent: 'own',
    verifier: true,
    registrar: true,
    ndaa_admin: true,
    partner: false,
    auditor: 'redacted',
    data_steward: 'redacted'
  },
  {
    operation: 'Verify NAR addresses',
    citizen: false,
    property_claimant: false,
    field_agent: false,
    verifier: 'NAR scope',
    registrar: true,
    ndaa_admin: 'override',
    partner: false,
    auditor: false,
    data_steward: false
  },
  {
    operation: 'Verify CAR residency',
    citizen: false,
    property_claimant: false,
    field_agent: false,
    verifier: 'CAR scope',
    registrar: true,
    ndaa_admin: true,
    partner: false,
    auditor: false,
    data_steward: false
  },
  {
    operation: 'Publish addresses',
    citizen: false,
    property_claimant: false,
    field_agent: false,
    verifier: false,
    registrar: 'publish/retire',
    ndaa_admin: 'override',
    partner: false,
    auditor: false,
    data_steward: false
  },
  {
    operation: 'Merge / split records',
    citizen: false,
    property_claimant: false,
    field_agent: false,
    verifier: true,
    registrar: true,
    ndaa_admin: true,
    partner: false,
    auditor: false,
    data_steward: false
  },
  {
    operation: 'Edit hierarchy/boundaries',
    citizen: false,
    property_claimant: false,
    field_agent: false,
    verifier: 'district metadata',
    registrar: 'province',
    ndaa_admin: 'national',
    partner: false,
    auditor: false,
    data_steward: 'suggest'
  },
  {
    operation: 'Manage API keys/webhooks',
    citizen: false,
    property_claimant: false,
    field_agent: false,
    verifier: false,
    registrar: false,
    ndaa_admin: true,
    partner: 'request',
    auditor: false,
    data_steward: false
  },
  {
    operation: 'Access audit logs',
    citizen: 'status only',
    property_claimant: 'own',
    field_agent: 'own',
    verifier: 'district',
    registrar: 'province',
    ndaa_admin: 'nation',
    partner: 'delivery logs only',
    auditor: 'read-only',
    data_steward: 'read QA only'
  }
];

export const PermissionMatrix: React.FC = () => {
  const { t } = useTranslation('admin');
  const { role, isAdmin } = useUserRole();
  const [verifierAssignments, setVerifierAssignments] = useState<VerifierAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadVerifierAssignments();
    }
  }, [isAdmin]);

  const loadVerifierAssignments = async () => {
    setLoading(true);
    try {
      // Get all users with verifier role
      const { data: verifierRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role
        `)
        .eq('role', 'verifier');

      if (rolesError) throw rolesError;

      if (!verifierRoles || verifierRoles.length === 0) {
        setVerifierAssignments([]);
        return;
      }

      // Get metadata for all verifier roles
      const roleIds = verifierRoles.map(r => r.id);
      const { data: metadata, error: metaError } = await supabase
        .from('user_role_metadata')
        .select('*')
        .in('user_role_id', roleIds);

      if (metaError) throw metaError;

      // Get profiles for all verifier users
      const userIds = verifierRoles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Build assignment objects
      const assignments: VerifierAssignment[] = verifierRoles.map(vr => {
        const profile = profiles?.find(p => p.user_id === vr.user_id);
        const verificationDomainMeta = metadata?.find(
          m => m.user_role_id === vr.id && m.scope_type === 'verification_domain'
        );
        const geoMeta = metadata?.find(
          m => m.user_role_id === vr.id && ['region', 'province', 'city', 'national'].includes(m.scope_type || '')
        );

        return {
          user_id: vr.user_id,
          email: profile?.email || 'Unknown',
          full_name: profile?.full_name || 'Unknown',
          verification_domain: verificationDomainMeta?.scope_value || null,
          geographic_scope: geoMeta ? { type: geoMeta.scope_type!, value: geoMeta.scope_value! } : null
        };
      });

      setVerifierAssignments(assignments);
    } catch (error) {
      console.error('Error loading verifier assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionIcon = (permission: boolean | string) => {
    if (permission === true) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (permission === false) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (typeof permission === 'string') {
      if (permission.includes('redacted') || permission.includes('own')) {
        return <EyeOff className="h-4 w-4 text-yellow-600" />;
      }
      return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
    return null;
  };

  const translatePermissionString = (text: string) => {
    const map: Record<string, string> = {
      'API': 'api',
      'corrections': 'corrections',
      'test sandboxes': 'testSandboxes',
      'view redacted': 'viewRedacted',
      'own only': 'ownOnly',
      'own': 'own',
      'verify': 'verify',
      'NAR scope': 'narScope',
      'CAR scope': 'carScope',
      'publish/retire': 'publishRetire',
      'override': 'override',
      'district metadata': 'districtMetadata',
      'province': 'province',
      'national': 'national',
      'request': 'request',
      'delivery logs only': 'deliveryLogsOnly',
      'read-only': 'readOnly',
      'read QA only': 'readQaOnly',
      'status only': 'statusOnly'
    };
    const key = map[text];
    return key ? t(`permissionStrings.${key}`) : text;
  };

  const translateOperation = (op: string) => {
    const map: Record<string, string> = {
      'Search verified addresses': 'searchVerifiedAddresses',
      'Create draft address': 'createDraftAddress',
      'Upload/view evidence': 'uploadViewEvidence',
      'Verify NAR addresses': 'verifyNarAddresses',
      'Verify CAR residency': 'verifyCarResidency',
      'Publish addresses': 'publishAddresses',
      'Merge / split records': 'mergeSplitRecords',
      'Edit hierarchy/boundaries': 'editHierarchyBoundaries',
      'Manage API keys/webhooks': 'manageApiKeysWebhooks',
      'Access audit logs': 'accessAuditLogs'
    };
    const key = map[op];
    return key ? t(`permissionOperations.${key}`) : op;
  };

  const getRoleLabel = (roleKey: string) => t(`roleLabels.${roleKey}`, { defaultValue: roleKey.replace('_', ' ') });

  const getPermissionText = (permission: boolean | string) => {
    if (permission === true) return t('fullAccess');
    if (permission === false) return t('noAccess');
    return translatePermissionString(permission);
  };

  const getPermissionColor = (permission: boolean | string) => {
    if (permission === true) return 'text-green-700 bg-green-50';
    if (permission === false) return 'text-destructive bg-destructive/10';
    if (typeof permission === 'string') {
      if (permission.includes('redacted') || permission.includes('own')) {
        return 'text-yellow-700 bg-yellow-50';
      }
      return 'text-blue-700 bg-blue-50';
    }
    return 'text-muted-foreground bg-muted';
  };

  const getDomainBadge = (domain: string | null) => {
    if (!domain) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t('noDomainAssigned', { defaultValue: 'No Domain' })}
        </Badge>
      );
    }
    
    const domainColors: Record<string, string> = {
      'nar': 'bg-blue-100 text-blue-800 border-blue-200',
      'car': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'both': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    const domainLabels: Record<string, string> = {
      'nar': t('verificationDomain.nar', { defaultValue: 'NAR (Address)' }),
      'car': t('verificationDomain.car', { defaultValue: 'CAR (Residency)' }),
      'both': t('verificationDomain.both', { defaultValue: 'Both NAR & CAR' })
    };
    
    return (
      <Badge variant="outline" className={domainColors[domain] || 'bg-muted'}>
        <Shield className="h-3 w-3 mr-1" />
        {domainLabels[domain] || domain}
      </Badge>
    );
  };

  const roleKeys = [
    'citizen', 'property_claimant', 'field_agent', 'verifier', 
    'registrar', 'ndaa_admin', 'partner', 'auditor', 'data_steward'
  ];

  const verifiersWithoutDomain = verifierAssignments.filter(v => !v.verification_domain);

  return (
    <div className="space-y-6">
      {/* Verifier Domain Assignments Section - Admins Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('verifierDomainAssignments', { defaultValue: 'Verifier Domain Assignments' })}
            </CardTitle>
            <CardDescription>
              {t('verifierDomainAssignmentsDesc', { 
                defaultValue: 'Verifiers must have a verification_domain assigned (nar, car, or both) to access their respective verification queues.' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verifiersWithoutDomain.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('verifiersWithoutDomainWarning', { 
                    count: verifiersWithoutDomain.length,
                    defaultValue: `${verifiersWithoutDomain.length} verifier(s) have no verification domain assigned and cannot access verification queues.`
                  })}
                </AlertDescription>
              </Alert>
            )}
            
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">{t('common:loading')}</div>
            ) : verifierAssignments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {t('noVerifiersFound', { defaultValue: 'No verifiers found in the system.' })}
              </div>
            ) : (
              <div className="space-y-3">
                {verifierAssignments.map((verifier) => (
                  <div 
                    key={verifier.user_id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2 ${
                      !verifier.verification_domain ? 'border-destructive bg-destructive/5' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{verifier.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{verifier.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getDomainBadge(verifier.verification_domain)}
                      {verifier.geographic_scope && (
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {verifier.geographic_scope.type}: {verifier.geographic_scope.value}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{t('howToAssignDomain', { defaultValue: 'To assign a verification domain:' })}</strong>
                {' '}{t('howToAssignDomainDesc', { 
                  defaultValue: 'Add a metadata entry with scope_type="verification_domain" and scope_value="nar", "car", or "both" to the user\'s verifier role in user_role_metadata table.'
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('permissionMatrix')}</CardTitle>
          <CardDescription>
            {t('permissionMatrixDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">{t('operation')}</th>
                  {roleKeys.map(roleKey => (
                    <th key={roleKey} className="text-center p-3 font-medium min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{getRoleLabel(roleKey)}</span>
                        {role === roleKey && (
                          <Badge variant="secondary" className="text-xs">{t('you')}</Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MATRIX.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium text-sm">{translateOperation(row.operation as string)}</td>
                    {roleKeys.map(roleKey => {
                      const permission = row[roleKey as keyof typeof row];
                      return (
                        <td key={roleKey} className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getPermissionIcon(permission)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getPermissionColor(permission)}`}>
                              {getPermissionText(permission)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="xl:hidden space-y-4">
            {PERMISSION_MATRIX.map((row, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm break-words">{translateOperation(row.operation as string)}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roleKeys.map(roleKey => {
                      const permission = row[roleKey as keyof typeof row];
                      return (
                        <div key={roleKey} className="flex items-center justify-between p-2 border rounded text-xs">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <span className="font-medium truncate">{getRoleLabel(roleKey)}</span>
                            {role === roleKey && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">{t('you')}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {getPermissionIcon(permission)}
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getPermissionColor(permission)}`}>
                              {getPermissionText(permission)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('yourCurrentPermissions')}</CardTitle>
          <CardDescription>
            {t('permissionsAvailableDescription', { role: role || t('notAssigned') })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role ? (
            <div className="grid gap-3">
              {PERMISSION_MATRIX.map((row, index) => {
                const permission = row[role as keyof typeof row];
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{translateOperation(row.operation as string)}</span>
                    <div className="flex items-center gap-2">
                      {getPermissionIcon(permission)}
                      <span className={`text-sm px-3 py-1 rounded-full ${getPermissionColor(permission)}`}>
                        {getPermissionText(permission)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{t('noRoleAssigned')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
