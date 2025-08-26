import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Users, Search, UserCog, MapPin, Edit, Trash2, UserPlus } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedGeographicScope, setSelectedGeographicScope] = useState<string>('');
  const [showScopeDialog, setShowScopeDialog] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<{userId: string, role: string} | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    organization: '',
    phone: '',
    password: ''
  });
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    organization: '',
    phone: '',
    password: '',
    role: 'police_operator'
  });
  const { hasPoliceAdminAccess } = useUserRole();
  const { toast } = useToast();

  // Only police-related roles for police system (excluding general admin)
  const policeRoles = [
    'police_operator', 'police_supervisor', 'police_dispatcher', 'police_admin'
  ] as const;

  const geographicScopes = [
    'Annobón', 'Bioko Norte', 'Bioko Sur', 'Centro Sur', 'Djibloho',
    'Kié-Ntem', 'Litoral', 'Wele-Nzas'
  ] as const;

  useEffect(() => {
    if (hasPoliceAdminAccess) {
      fetchUsers();
    }
  }, [hasPoliceAdminAccess]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Then fetch all user roles with metadata - only police-related roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          user_role_metadata!fk_user_role_metadata_user_role(
            scope_type,
            scope_value
          )
        `)
        .in('role', ['police_operator', 'police_supervisor', 'police_dispatcher', 'police_admin']);

      if (rolesError) throw rolesError;

      // Transform the data to group roles by user - only users with police roles
      const usersMap = new Map<string, UserProfile>();
      
      // Create user entries from profiles, but only for users with police roles
      const policeUserIds = new Set(userRoles?.map((ur: any) => ur.user_id) || []);
      
      profiles?.forEach((profile: any) => {
        if (policeUserIds.has(profile.user_id)) {
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
        }
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
    await assignRoleWithScope(userId, role, null);
  };

  const assignRoleWithScope = async (userId: string, role: string, geographicScope: string | null) => {
    try {
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // If geographic scope is provided, add metadata
      if (geographicScope && userRoleData) {
        const { error: metadataError } = await supabase
          .from('user_role_metadata')
          .insert({
            user_role_id: userRoleData.id,
            scope_type: 'geographic',
            scope_value: geographicScope
          });

        if (metadataError) throw metadataError;
      }

      toast({
        title: "Success",
        description: `Role assigned successfully${geographicScope ? ' with geographic scope' : ''}`
      });

      await fetchUsers();
      setShowScopeDialog(false);
      setPendingAssignment(null);
      setSelectedGeographicScope('');
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

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      organization: user.organization || '',
      phone: user.phone || '',
      password: ''
    });
    setShowEditDialog(true);
  };

  const updateUserProfile = async () => {
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-user-operations', {
        body: {
          operation: 'updateUser',
          userId: selectedUser.user_id,
          data: {
            full_name: editForm.full_name,
            email: editForm.email,
            organization: editForm.organization,
            phone: editForm.phone,
            password: editForm.password || undefined
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to update user');
      }

      toast({
        title: "Success",
        description: "User information updated successfully"
      });

      await fetchUsers();
      setShowEditDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user information",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-user-operations', {
        body: {
          operation: 'deleteUser',
          userId: selectedUser.user_id
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete user');
      }

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      await fetchUsers();
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const createUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-operations', {
        body: {
          operation: 'createUser',
          data: {
            full_name: createForm.full_name,
            email: createForm.email,
            organization: createForm.organization,
            phone: createForm.phone,
            password: createForm.password,
            role: createForm.role
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "User created successfully"
      });

      await fetchUsers();
      setShowCreateDialog(false);
      setCreateForm({
        full_name: '',
        email: '',
        organization: '',
        phone: '',
        password: '',
        role: 'police_operator'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (!hasPoliceAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Police User Management
          </CardTitle>
          <CardDescription>
            Access denied. Police admin privileges required.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button onClick={fetchUsers} variant="outline">
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div>
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
                  {paginatedUsers.map((user) => (
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
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Assign role" />
                            </SelectTrigger>
                            <SelectContent>
                              {policeRoles.filter(role => 
                                !user.roles.some(userRole => userRole.role === role)
                              ).map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="p-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <UserCog className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No police users found</p>
              </div>
            )}
            </div>
          )}

      {/* Geographic Scope Assignment Dialog */}
      <Dialog open={showScopeDialog} onOpenChange={setShowScopeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Assign Geographic Scope
            </DialogTitle>
            <DialogDescription>
              Field agents must be assigned to a specific geographic region in Equatorial Guinea.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="geographic-scope">Select Region</Label>
              <Select
                value={selectedGeographicScope}
                onValueChange={setSelectedGeographicScope}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a region..." />
                </SelectTrigger>
                <SelectContent>
                  {geographicScopes.map((scope) => (
                    <SelectItem key={scope} value={scope}>
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowScopeDialog(false);
                  setPendingAssignment(null);
                  setSelectedGeographicScope('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (pendingAssignment && selectedGeographicScope) {
                    assignRoleWithScope(
                      pendingAssignment.userId,
                      pendingAssignment.role,
                      selectedGeographicScope
                    );
                  }
                }}
                disabled={!selectedGeographicScope}
              >
                Assign Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User Information
            </DialogTitle>
            <DialogDescription>
              Update user profile information and password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-full-name">Full Name</Label>
              <Input
                id="edit-full-name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organization">Organization</Label>
              <Input
                id="edit-organization"
                value={editForm.organization}
                onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                placeholder="Enter organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Leave empty to keep current password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={updateUserProfile}>
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Police User
            </DialogTitle>
            <DialogDescription>
              Create a new user account for the police system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-full-name">Full Name</Label>
              <Input
                id="create-full-name"
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-organization">Organization</Label>
              <Input
                id="create-organization"
                value={createForm.organization}
                onChange={(e) => setCreateForm({ ...createForm, organization: e.target.value })}
                placeholder="Enter organization (e.g., Guardia Civil)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">Phone</Label>
              <Input
                id="create-phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Enter initial password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Initial Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(role) => setCreateForm({ ...createForm, role })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {policeRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setCreateForm({
                    full_name: '',
                    email: '',
                    organization: '',
                    phone: '',
                    password: '',
                    role: 'police_operator'
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={createUser}
                disabled={!createForm.full_name || !createForm.email || !createForm.password}
              >
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.full_name || selectedUser?.email}</strong>? 
              This action cannot be undone and will permanently remove the user and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManager;