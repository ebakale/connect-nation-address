import React from 'react';
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

  const getPermissionText = (permission: boolean | string) => {
    if (permission === true) return 'Full Access';
    if (permission === false) return 'No Access';
    return permission;
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
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Complete permission mapping for all roles and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Operation</th>
                  {roleKeys.map(roleKey => (
                    <th key={roleKey} className="text-center p-3 font-medium min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{roleKey.replace('_', ' ')}</span>
                        {role === roleKey && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MATRIX.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-sm">{row.operation}</td>
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
                  <h4 className="font-medium text-sm break-words">{row.operation}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roleKeys.map(roleKey => {
                      const permission = row[roleKey as keyof typeof row];
                      return (
                        <div key={roleKey} className="flex items-center justify-between p-2 border rounded text-xs">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <span className="font-medium truncate">{roleKey.replace('_', ' ')}</span>
                            {role === roleKey && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">You</Badge>
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
          <CardTitle>Your Current Permissions</CardTitle>
          <CardDescription>
            Permissions available to your current role: {role || 'Not assigned'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role ? (
            <div className="grid gap-3">
              {PERMISSION_MATRIX.map((row, index) => {
                const permission = row[role as keyof typeof row];
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{row.operation}</span>
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
            <p className="text-center text-muted-foreground">No role assigned</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};