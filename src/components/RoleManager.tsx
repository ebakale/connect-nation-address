import React, { useState } from 'react';
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
  'admin': 'System Administrator - Technical system management and regional oversight',
  'citizen': 'Public User - Search, discover, and share official addresses',
  'property_claimant': 'Property Owner/Manager - Manage metadata for owned places',
  'field_agent': 'Field Enumerator - Capture new addresses and ground truth',
  'verifier': 'District/Municipal Verifier - Validate submissions and resolve duplicates',
  'registrar': 'Provincial Registrar - Final authority for publication',
  'ndaa_admin': 'NDAA Administrator - Highest authority for national policy, security, API management, and system configuration',
  'partner': 'API Partner - Machine-to-machine access for services',
  'auditor': 'Auditor - Compliance and forensics access',
  'data_steward': 'Data Steward - Data quality and analytics',
  'support': 'Support/Helpdesk - User support and account provisioning',
  'police_operator': 'Police Operator - Emergency response and incident management',
  'police_supervisor': 'Police Supervisor - Oversight of emergency operations',
  'police_dispatcher': 'Police Dispatcher - Emergency call routing and coordination'
};

const AVAILABLE_ROLES: UserRole[] = [
  'citizen', 'property_claimant', 'field_agent', 'verifier', 
  'registrar', 'ndaa_admin', 'partner', 'auditor', 'data_steward', 'support',
  'police_operator', 'police_supervisor', 'police_dispatcher'
];

export const RoleManager: React.FC = () => {
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
          <p className="text-center text-muted-foreground">Please log in to manage roles.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading role information...</p>
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
          title: "Role Already Assigned",
          description: `User already has the ${selectedRole} role.`,
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
        title: "Success",
        description: `Successfully assigned ${selectedRole} role.`
      });

      // Refresh the page to update role display
      window.location.reload();

    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role.",
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
          <CardTitle>Current Role & Permissions</CardTitle>
          <CardDescription>
            Your current role determines what actions you can perform in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Current Role</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="text-sm">
                {role ? formatRoleName(role) : 'No Role Assigned'}
              </Badge>
            </div>
            {role && (
              <p className="text-sm text-muted-foreground mt-2">
                {ROLE_DESCRIPTIONS[role] || 'No description available'}
              </p>
            )}
          </div>

          {roleMetadata.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Scopes & Permissions</Label>
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
            <CardTitle>Role Assignment (Admin)</CardTitle>
            <CardDescription>
              Assign roles and scopes to users. Use this for testing different permission levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-select">Role</Label>
                <Select value={selectedRole || ''} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
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
                <Label htmlFor="scope-type">Scope Type (Optional)</Label>
                <Select value={scopeType} onValueChange={(value) => setScopeType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geographic">Geographic</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="partner_type">Partner Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="scope-value">Scope Value (Optional)</Label>
              <Input
                id="scope-value"
                placeholder="e.g., Malabo, Emergency Services, etc."
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
              {updating ? 'Assigning...' : 'Assign Role'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Role Catalog</CardTitle>
          <CardDescription>
            Overview of all available roles and their capabilities.
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
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};