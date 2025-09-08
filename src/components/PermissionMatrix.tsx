import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    operation: 'Verify / publish',
    citizen: false,
    property_claimant: false,
    field_agent: false,
    verifier: 'verify',
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
  const { role } = useUserRole();

  const getPermissionIcon = (permission: boolean | string) => {
    if (permission === true) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (permission === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
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
      'Verify / publish': 'verifyPublish',
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
    if (permission === false) return 'text-red-700 bg-red-50';
    if (typeof permission === 'string') {
      if (permission.includes('redacted') || permission.includes('own')) {
        return 'text-yellow-700 bg-yellow-50';
      }
      return 'text-blue-700 bg-blue-50';
    }
    return 'text-gray-700 bg-gray-50';
  };
  const roleKeys = [
    'citizen', 'property_claimant', 'field_agent', 'verifier', 
    'registrar', 'ndaa_admin', 'partner', 'auditor', 'data_steward'
  ];

  return (
    <div className="space-y-6">
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
                  <tr key={index} className="border-b hover:bg-gray-50">
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