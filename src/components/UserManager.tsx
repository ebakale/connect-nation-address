import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Users, Search, UserCog, MapPin, Edit, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { BulkUserImport } from './BulkUserImport';

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
  const { t } = useTranslation(['emergency']);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedGeographicScope, setSelectedGeographicScope] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
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
    role: 'citizen'
  });
  const { hasPoliceAdminAccess, hasAdminAccess, hasNDAAAccess, hasSystemAdminAccess, isNDAAAdmin } = useUserRole();
  const { toast } = useToast();

  // Define role sets based on user access
  const policeRoles = [
    'police_operator', 'police_supervisor', 'police_dispatcher', 'police_admin'
  ] as const;
  
  const addressingRoles = hasNDAAAccess 
    ? ['admin', 'ndaa_admin', 'registrar', 'verifier', 'field_agent', 'citizen', 
       'property_claimant', 'partner', 'auditor', 'data_steward', 'support', 'moderator', 'user',
       'car_admin'] as const
    : ['admin', 'registrar', 'verifier', 'field_agent', 'citizen', 
       'property_claimant', 'partner', 'auditor', 'data_steward', 'support', 'moderator', 'user',
       'car_admin'] as const; // System admin cannot assign NDAA role

  // Region to cities mapping for Equatorial Guinea
  const regionCities: Record<string, string[]> = {
    'Bioko Norte': ['Malabo', 'Baney', 'Rebola'],
    'Bioko Sur': ['Luba', 'Riaba'],
    'Litoral': ['Bata', 'Mbini', 'Kogo'],
    'Centro Sur': ['Evinayong', 'Acurenam', 'Niefang'],
    'Kié-Ntem': ['Ebebiyín', 'Mikomeseng', 'Nsonk Nsomo'],
    'Wele-Nzas': ['Mongomo', 'Añisoc', 'Aconibe', 'Nsork'],
    'Annobón': ['San Antonio de Palé'],
    'Djibloho': ['Ciudad de la Paz']
  };

  const geographicScopes = Object.keys(regionCities);

  useEffect(() => {
    if (hasPoliceAdminAccess || hasAdminAccess) {
      fetchUsers();
    }
  }, [hasPoliceAdminAccess, hasAdminAccess]);

  // Add a manual refresh function
  const refreshUsers = () => {
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch user roles based on user's access level
      let rolesToShow;
      if (hasSystemAdminAccess) {
        // System admins (admin role) can see all users
        rolesToShow = [...policeRoles, ...addressingRoles];
      } else if (hasNDAAAccess) {
        // NDAA admins only see addressing system users
        rolesToShow = addressingRoles;
      } else if (hasPoliceAdminAccess) {
        // Police admins only see police users
        rolesToShow = policeRoles;
      } else {
        // Other roles only see addressing system users
        rolesToShow = addressingRoles;
      }

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
        .in('role', rolesToShow);

      if (rolesError) throw rolesError;

      // Transform the data to group roles by user
      const usersMap = new Map<string, UserProfile>();
      
      // Determine if we should include all profiles (system admins should see everyone)
      const includeAllProfiles = hasSystemAdminAccess;
      
      // Create user entries from profiles
      const relevantUserIds = new Set(userRoles?.map((ur: any) => ur.user_id) || []);
      
      profiles?.forEach((profile: any) => {
        if (includeAllProfiles || relevantUserIds.has(profile.user_id)) {
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
        title: t('userManagement.error'),
        description: t('userManagement.failedToFetchUsers'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: string) => {
    // Check if role requires geographic scope
    if (role === 'police_dispatcher' || role === 'police_supervisor' || 
        role === 'registrar' || role === 'verifier' || role === 'field_agent') {
      setPendingAssignment({ userId, role });
      setShowScopeDialog(true);
      return;
    }
    
    await assignRoleWithScope(userId, role, null);
  };

  const assignRoleWithScope = async (userId: string, role: string, scope: string | null, scopeType: 'city' | 'region' | null = null) => {
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

      // If scope is provided, add metadata
      if (scope && scopeType && userRoleData) {
        const { error: metadataError } = await supabase
          .from('user_role_metadata')
          .insert({
            user_role_id: userRoleData.id,
            scope_type: scopeType,
            scope_value: scope
          });

        if (metadataError) throw metadataError;
      }

      toast({
        title: t('userManagement.success'),
        description: t('userManagement.roleAssignedSuccessfully') + (scope ? ` with ${scopeType} scope: ${scope}` : '')
      });

      await fetchUsers();
      setShowScopeDialog(false);
      setPendingAssignment(null);
      setSelectedGeographicScope('');
      setSelectedCity('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: t('userManagement.error'),
        description: t('userManagement.failedToAssignRole'),
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
        title: t('userManagement.success'),
        description: t('userManagement.roleRemovedSuccessfully')
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: t('userManagement.error'),
        description: t('userManagement.failedToRemoveRole'),
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
        title: t('userManagement.success'),
        description: t('userManagement.userInformationUpdatedSuccessfully')
      });

      await fetchUsers();
      setShowEditDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: t('userManagement.error'),
        description: error instanceof Error ? error.message : t('userManagement.failedToUpdateUser'),
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
        title: t('userManagement.success'),
        description: t('userManagement.userDeletedSuccessfully')
      });

      await fetchUsers();
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: t('userManagement.error'),
        description: error instanceof Error ? error.message : t('userManagement.failedToDeleteUser'),
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
        title: t('userManagement.success'),
        description: t('userManagement.userCreatedSuccessfully')
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
        title: t('userManagement.error'),
        description: error instanceof Error ? error.message : t('userManagement.failedToCreateUser'),
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

  if (!hasPoliceAdminAccess && !hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {hasPoliceAdminAccess ? t('userManagement.policeUserManagement') : t('userManagement.userManagement')}
          </CardTitle>
          <CardDescription>
            {t('userManagement.accessDenied')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('userManagement.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 flex-1 sm:flex-none">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('userManagement.createUser')}</span>
                    <span className="sm:hidden">{t('userManagement.createUser')}</span>
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <BulkUserImport />
              <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2 flex-1 sm:flex-none">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">{t('userManagement.refresh')}</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('userManagement.loadingUsers')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('userManagement.user')}</TableHead>
                      <TableHead>{t('userManagement.organization')}</TableHead>
                      <TableHead>{t('userManagement.contact')}</TableHead>
                      <TableHead>{t('userManagement.roles')}</TableHead>
                      <TableHead>{t('userManagement.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name || t('userManagement.noName')}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{user.organization || t('userManagement.notSpecified')}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{user.phone || t('userManagement.notProvided')}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((roleData, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => removeRole(user.user_id, roleData.role)}
                                title={t('userManagement.tapToRemoveRole')}
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
                              <span className="text-sm text-muted-foreground">{t('userManagement.noRolesAssigned')}</span>
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
                                <SelectValue placeholder={t('userManagement.assignRole')} />
                              </SelectTrigger>
                              <SelectContent>
                                 {(hasPoliceAdminAccess ? policeRoles : addressingRoles).filter(role => 
                                  !user.roles.some(userRole => userRole.role === role)
                                ).map((role) => (
                                   <SelectItem key={role} value={role}>
                                    {role.replace('_', ' ')}
                                     {(role === 'police_dispatcher' || role === 'police_supervisor' || 
                                       role === 'registrar' || role === 'verifier' || role === 'field_agent') && (
                                       <span className="text-xs text-muted-foreground ml-1">({t('userManagement.requiresGeographicScope')})</span>
                                     )}
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedUsers.map((user) => (
                  <Card key={user.user_id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{user.full_name || t('userManagement.noName')}</p>
                          <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="font-medium">{t('userManagement.organization')}:</span>
                          <span className="ml-2">{user.organization || t('userManagement.notSpecified')}</span>
                        </div>
                        <div>
                          <span className="font-medium">{t('userManagement.phone')}:</span>
                          <span className="ml-2">{user.phone || t('userManagement.notProvided')}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-sm">{t('userManagement.roles')}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.roles.map((roleData, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="cursor-pointer text-xs"
                              onClick={() => removeRole(user.user_id, roleData.role)}
                              title={t('userManagement.tapToRemoveRole')}
                            >
                              {roleData.role}
                              {roleData.metadata.length > 0 && (
                                <span className="ml-1">
                                  ({roleData.metadata.map(m => `${m.scope_type}:${m.scope_value}`).join(', ')})
                                </span>
                              )}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <span className="text-sm text-muted-foreground">{t('userManagement.noRolesAssigned')}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <Select
                          value={selectedRole}
                          onValueChange={(role) => {
                            assignRole(user.user_id, role);
                            setSelectedRole('');
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('userManagement.assignRole')} />
                          </SelectTrigger>
                          <SelectContent>
                            {(hasPoliceAdminAccess ? policeRoles : addressingRoles).filter(role => 
                              !user.roles.some(userRole => userRole.role === role)
                            ).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.replace('_', ' ')}
                                 {(role === 'police_dispatcher' || role === 'police_supervisor' || 
                                   role === 'registrar' || role === 'verifier' || role === 'field_agent') && (
                                   <span className="text-xs text-muted-foreground ml-1">({t('userManagement.requiresGeographicScope')})</span>
                                 )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="flex-1 flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            {t('userManagement.edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="flex-1 flex items-center gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('userManagement.delete')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
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
                    {t('userManagement.previous')}
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
                    {t('userManagement.next')}
                  </Button>
                </div>
              )}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserCog className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">{hasPoliceAdminAccess ? t('userManagement.noPoliceUsersFound') : t('userManagement.noAddressingUsersFound')}</p>
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
              {(pendingAssignment?.role === 'registrar' || pendingAssignment?.role === 'verifier' || pendingAssignment?.role === 'field_agent')
                ? t('userManagement.assignGeographicScope') 
                : t('userManagement.assignCityScope')}
            </DialogTitle>
            <DialogDescription>
              {(pendingAssignment?.role === 'registrar' || pendingAssignment?.role === 'verifier' || pendingAssignment?.role === 'field_agent')
                ? t('userManagement.assignRegistrarScopeDescription')
                : t('userManagement.assignCityScopeDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region-scope">{t('userManagement.selectRegion')}</Label>
              <Select
                value={selectedGeographicScope}
                onValueChange={(value) => {
                  setSelectedGeographicScope(value);
                  setSelectedCity(''); // Reset city when region changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('userManagement.chooseRegion')} />
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
            
            {/* For registrars, verifiers, and field agents, they can choose region-only or city-specific scope */}
            {(pendingAssignment?.role === 'registrar' || pendingAssignment?.role === 'verifier' || pendingAssignment?.role === 'field_agent') && selectedGeographicScope && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('userManagement.registrarScopeOptions')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={selectedCity === '' && selectedGeographicScope ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCity('')}
                  >
                    {t('userManagement.regionWide')} ({selectedGeographicScope})
                  </Button>
                  <Button
                    variant={selectedCity !== '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      // Don't auto-select city, let user choose below
                      if (selectedCity === '') {
                        setSelectedCity('select');
                      }
                    }}
                  >
                    {t('userManagement.citySpecific')}
                  </Button>
                </div>
              </div>
            )}
            
            {/* City selection - shown for police roles always, or for addressing roles if city-specific chosen */}
            {((pendingAssignment?.role !== 'registrar' && pendingAssignment?.role !== 'verifier' && pendingAssignment?.role !== 'field_agent') || selectedCity !== '') && (
              <div className="space-y-2">
                <Label htmlFor="city-scope">{t('userManagement.selectCity')}</Label>
                <Select
                  value={selectedCity === 'select' ? '' : selectedCity}
                  onValueChange={setSelectedCity}
                  disabled={!selectedGeographicScope}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedGeographicScope ? t('userManagement.chooseCity') : t('userManagement.selectRegionFirst')} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedGeographicScope && regionCities[selectedGeographicScope]?.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowScopeDialog(false);
                  setPendingAssignment(null);
                  setSelectedGeographicScope('');
                  setSelectedCity('');
                }}
              >
                {t('userManagement.cancel')}
              </Button>
              <Button
                onClick={() => {
                  if (pendingAssignment) {
                    // For addressing roles (registrar, verifier, field_agent), allow region-only or city-specific
                    if ((pendingAssignment.role === 'registrar' || pendingAssignment.role === 'verifier' || pendingAssignment.role === 'field_agent') && selectedGeographicScope) {
                      const scope = selectedCity && selectedCity !== 'select' ? selectedCity : selectedGeographicScope;
                      const scopeType = selectedCity && selectedCity !== 'select' ? 'city' : 'region';
                      assignRoleWithScope(
                        pendingAssignment.userId,
                        pendingAssignment.role,
                        scope,
                        scopeType
                      );
                    } else if (selectedCity && selectedCity !== 'select') {
                      // For police roles, require city
                      assignRoleWithScope(
                        pendingAssignment.userId,
                        pendingAssignment.role,
                        selectedCity,
                        'city'
                      );
                    }
                  }
                }}
                disabled={
                  !selectedGeographicScope || 
                  ((pendingAssignment?.role !== 'registrar' && pendingAssignment?.role !== 'verifier' && pendingAssignment?.role !== 'field_agent') && (!selectedCity || selectedCity === 'select'))
                }
              >
                {t('userManagement.assignRole')}
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
              {t('userManagement.editUserInformation')}
            </DialogTitle>
            <DialogDescription>
              {t('userManagement.updateUserProfile')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-full-name">{t('userManagement.fullName')}</Label>
              <Input
                id="edit-full-name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder={t('userManagement.enterFullName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('userManagement.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder={t('userManagement.enterEmail')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organization">{t('userManagement.organization')}</Label>
              <Input
                id="edit-organization"
                value={editForm.organization}
                onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                placeholder={t('userManagement.enterOrganization')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">{t('userManagement.phone')}</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder={t('userManagement.enterPhone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">{t('userManagement.newPassword')}</Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder={t('userManagement.leaveEmptyPassword')}
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
                {t('userManagement.cancel')}
              </Button>
              <Button onClick={updateUserProfile}>
                {t('userManagement.updateUser')}
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
              {hasPoliceAdminAccess ? t('userManagement.createNewPoliceUser') : t('userManagement.createNewUser')}
            </DialogTitle>
            <DialogDescription>
              {hasPoliceAdminAccess ? t('userManagement.createPoliceUserDescription') : t('userManagement.createUserDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-full-name">{t('userManagement.fullName')}</Label>
              <Input
                id="create-full-name"
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                placeholder={t('userManagement.enterFullName')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">{t('userManagement.email')}</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder={t('userManagement.enterEmail')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-organization">{t('userManagement.organization')}</Label>
              <Input
                id="create-organization"
                value={createForm.organization}
                onChange={(e) => setCreateForm({ ...createForm, organization: e.target.value })}
                placeholder={t('userManagement.enterOrganization')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">{t('userManagement.phone')}</Label>
              <Input
                id="create-phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder={t('userManagement.enterPhone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">{t('userManagement.password')}</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder={t('userManagement.enterPassword')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">{t('userManagement.selectRole')}</Label>
              <Select
                value={createForm.role}
                onValueChange={(role) => setCreateForm({ ...createForm, role })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('userManagement.chooseRole')} />
                </SelectTrigger>
                <SelectContent>
                  {(hasPoliceAdminAccess ? policeRoles : addressingRoles).map((role) => (
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
                    role: 'citizen'
                  });
                }}
              >
                {t('userManagement.cancel')}
              </Button>
              <Button 
                onClick={createUser}
                disabled={!createForm.full_name || !createForm.email || !createForm.password}
              >
                {t('userManagement.createUser')}
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
              {t('userManagement.deleteUserConfirmation')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('userManagement.deleteUserWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              {t('userManagement.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('userManagement.delete')} {t('userManagement.user')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManager;