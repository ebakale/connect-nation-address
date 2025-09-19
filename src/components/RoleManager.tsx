import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, UserRole, RoleMetadata } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const ROLE_DESCRIPTIONS: Record<string, string> = {
  // Address Registry Module Roles
  'admin': 'System Administrator - Technical system management and cross-module oversight',
  'citizen': 'General Public User - Search verified addresses and view redacted evidence',
  'property_claimant': 'Property Owner - Submit proof of ownership for address registration',
  'field_agent': 'Field Data Collector - Capture address information in the field (geographic scope restricted)',
  'verifier': 'Quality Assurance Specialist - Verify address accuracy and resolve duplicates (district-level access)',
  'registrar': 'Provincial Administrator - Publish verified addresses to official registry (province-level access)',
  'ndaa_admin': 'National Digital Address Authority - Full system oversight and policy management',
  'partner': 'External Organization - API access for specific integration use cases',
  'auditor': 'Independent Reviewer - Read-only access for compliance and quality assurance',
  'data_steward': 'Quality Assurance Specialist - Bulk operations and testing support',
  'support': 'Customer Service - User assistance and technical support',
  
  // CAR (Citizen Address Repository) Module Roles
  'car_admin': 'CAR Administrator - Full oversight of citizen address management and person records',
  'car_verifier': 'CAR Verifier - Review and verify citizen address claims and residency status',
  'residency_verifier': 'Residency Verifier - Specialized role for verifying residency documentation and claims',
  
  // Police Operations Module Roles
  'police_admin': 'Police System Administrator - Full oversight of police operations and system configuration',
  'police_operator': 'Field Officer - Emergency response, incident management, and field operations',
  'police_supervisor': 'Senior Officer - Operational oversight, unit management, and performance monitoring',
  'police_dispatcher': 'Emergency Coordinator - Incident dispatch, unit coordination, and emergency communications'
};

const AVAILABLE_ROLES: UserRole[] = [
  // Address Registry Module Roles
  'citizen', 'property_claimant', 'field_agent', 'verifier', 
  'registrar', 'ndaa_admin', 'partner', 'auditor', 'data_steward', 'support',
  // CAR (Citizen Address Repository) Module Roles
  'car_admin', 'car_verifier', 'residency_verifier',
  // Police Operations Module Roles
  'police_admin', 'police_operator', 'police_supervisor', 'police_dispatcher'
];

export const RoleManager: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user } = useAuth();
  const { role, roleMetadata, hasAdminAccess, loading } = useUserRole();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [scopeType, setScopeType] = useState<'geographic' | 'organization' | 'partner_type'>('geographic');
  const [scopeValue, setScopeValue] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{t('pleaseLoginToManageRoles')}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{t('loadingRoleInformation')}</p>
        </CardContent>
      </Card>
    );
  }

  const assignRole = async () => {
    if (!selectedRole) return;

    setUpdating(true);
    try {
      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', selectedRole)
        .single();

      if (existingRole) {
        toast({
          title: t('roleAlreadyAssigned'),
          description: t('userAlreadyHasRole', { role: selectedRole }),
          variant: "destructive"
        });
        return;
      }

      // Assign new role
      const { data: newRole, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: selectedRole
        })
        .select('id')
        .single();

      if (error) throw error;

      // Add scope if provided
      if (newRole && scopeValue.trim()) {
        const { error: scopeError } = await supabase
          .from('user_role_metadata')
          .insert({
            user_role_id: newRole.id,
            scope_type: scopeType,
            scope_value: scopeValue.trim()
          });

        if (scopeError) throw scopeError;
      }

      toast({
        title: t('success'),
        description: t('successfullyAssignedRole', { role: selectedRole })
      });

      // Refresh the page to update role display
      window.location.reload();

    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: t('error'),
        description: error.message || t('failedToAssignRole'),
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('currentRolePermissions')}</CardTitle>
          <CardDescription>
            {t('currentRoleDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">{t('currentRole')}</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="text-sm">
                {role ? formatRoleName(role) : t('noRoleAssigned')}
              </Badge>
            </div>
            {role && (
              <p className="text-sm text-muted-foreground mt-2">
                {t(`roleDescriptions.${role}`, { defaultValue: ROLE_DESCRIPTIONS[role] || t('noDescriptionAvailable') })}
              </p>
            )}
          </div>

          {roleMetadata.length > 0 && (
            <div>
              <Label className="text-sm font-medium">{t('scopesPermissions')}</Label>
              <div className="mt-2 space-y-2">
                {roleMetadata.map((metadata, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {metadata.scope_type}
                    </Badge>
                    <span className="text-sm">{metadata.scope_value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {hasAdminAccess && (
        <Card>
          <CardHeader>
            <CardTitle>{t('roleAssignmentAdmin')}</CardTitle>
            <CardDescription>
              {t('roleAssignmentDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-select">{t('role')}</Label>
                <Select value={selectedRole || ''} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map((roleOption) => (
                      <SelectItem key={roleOption} value={roleOption}>
                        {formatRoleName(roleOption)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scope-type">{t('scopeTypeOptional')}</Label>
                <Select value={scopeType} onValueChange={(value) => setScopeType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geographic">{t('geographic')}</SelectItem>
                    <SelectItem value="organization">{t('organization')}</SelectItem>
                    <SelectItem value="partner_type">{t('partnerType')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="scope-value">{t('scopeValueOptional')}</Label>
              <Input
                id="scope-value"
                placeholder={t('scopeValuePlaceholder')}
                value={scopeValue}
                onChange={(e) => setScopeValue(e.target.value)}
              />
            </div>

            <Button 
              onClick={assignRole}
              disabled={!selectedRole || updating}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {updating ? t('assigning') : t('assignRole')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('roleCatalog')}</CardTitle>
          <CardDescription>
            {t('roleCatalogDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(ROLE_DESCRIPTIONS).map(([roleKey, description]) => (
              <div key={roleKey} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={role === roleKey ? "default" : "outline"}>
                    {formatRoleName(roleKey)}
                  </Badge>
                  {role === roleKey && (
                    <Badge variant="secondary" className="text-xs">
                      {t('current')}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(`roleDescriptions.${roleKey}`, { defaultValue: description })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};