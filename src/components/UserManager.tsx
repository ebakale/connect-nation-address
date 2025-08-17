import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Users, Search, UserCog } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  organization: string;
  phone: string;
  created_at: string;
  roles: Array<{
    role: string;
    metadata: Array<{
      scope_type: string;
      scope_value: string;
    }>;
  }>;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { hasAdminAccess } = useUserRole();
  const { toast } = useToast();

  const roles = [
    'citizen', 'property_claimant', 'field_agent', 'verifier', 
    'registrar', 'ndaa_admin', 'partner', 'auditor', 'data_steward'
  ] as const;

  useEffect(() => {
    if (hasAdminAccess) {
      fetchUsers();
    }
  }, [hasAdminAccess]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Then fetch all user roles with metadata
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          user_role_metadata(
            scope_type,
            scope_value
          )
        `);

      if (rolesError) throw rolesError;

      // Transform the data to group roles by user
      const usersMap = new Map<string, UserProfile>();
      
      // First, create user entries from profiles
      profiles?.forEach((profile: any) => {
        usersMap.set(profile.user_id, {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          organization: profile.organization || '',
          phone: profile.phone || '',
          created_at: profile.created_at,
          roles: []
        });
      });

      // Then, add roles to the corresponding users
      userRoles?.forEach((userRole: any) => {
        const user = usersMap.get(userRole.user_id);
        if (user) {
          user.roles.push({
            role: userRole.role,
            metadata: userRole.user_role_metadata || []
          });
        }
      });

      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role assigned successfully"
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully"
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Access denied. Admin privileges required.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage users and their role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchUsers} variant="outline">
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.organization || 'Not specified'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.phone || 'Not provided'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((roleData, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeRole(user.user_id, roleData.role)}
                              title="Click to remove role"
                            >
                              {roleData.role}
                              {roleData.metadata.length > 0 && (
                                <span className="ml-1 text-xs">
                                  ({roleData.metadata.map(m => `${m.scope_type}:${m.scope_value}`).join(', ')})
                                </span>
                              )}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <span className="text-sm text-muted-foreground">No roles assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedRole}
                            onValueChange={(role) => {
                              assignRole(user.user_id, role);
                              setSelectedRole('');
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.filter(role => 
                                !user.roles.some(userRole => userRole.role === role)
                              ).map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8">
              <UserCog className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManager;