import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Users, UserCog, Search, Shield, Home, Clock, FileEdit, Merge, Eye } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface CARPermission {
  id: string;
  user_id: string;
  can_review_citizen_addresses: boolean;
  can_verify_residency: boolean;
  can_manage_person_records: boolean;
  can_access_address_history: boolean;
  can_update_address_status: boolean;
  can_merge_duplicate_persons: boolean;
  jurisdiction_scope?: string;
  geographic_scope?: string[];
  created_at: string;
  updated_at: string;
  // Profile data
  full_name?: string;
  email?: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
}

export function CARPermissionsManager() {
  const { t } = useTranslation(['common', 'admin']);
  const { toast } = useToast();
  const { hasCARManagementAccess } = useUserRole();
  
  const [permissions, setPermissions] = useState<CARPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // User search state
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  
  const [newPermission, setNewPermission] = useState({
    can_review_citizen_addresses: false,
    can_verify_residency: false,
    can_manage_person_records: false,
    can_access_address_history: false,
    can_update_address_status: false,
    can_merge_duplicate_persons: false,
    jurisdiction_scope: 'municipal',
    geographic_scope: [] as string[]
  });

  // Equatorial Guinea provinces for geographic scope
  const provinces = [
    'Annobón', 'Bioko Norte', 'Bioko Sur', 'Centro Sur', 
    'Djibloho', 'Kié-Ntem', 'Litoral', 'Wele-Nzas'
  ];

  useEffect(() => {
    if (hasCARManagementAccess) {
      fetchPermissions();
    }
  }, [hasCARManagementAccess]);

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('car_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (permissionsError) throw permissionsError;

      if (permissionsData && permissionsData.length > 0) {
        const userIds = permissionsData.map(perm => perm.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const formattedData = permissionsData.map(permission => {
          const profile = profilesData?.find(p => p.user_id === permission.user_id);
          return {
            ...permission,
            full_name: profile?.full_name,
            email: profile?.email
          };
        });
        
        setPermissions(formattedData);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching CAR permissions:', error);
      toast({
        title: t('common:error'),
        description: t('admin:carPermissionsManager.toastMessages.fetchPermissionsFailed'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async () => {
    try {
      if (!selectedUser) {
        toast({
          title: t('common:error'),
          description: t('admin:carPermissionsManager.toastMessages.pleaseSelectUser'),
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('car_permissions')
        .upsert([{
          user_id: selectedUser.user_id,
          ...newPermission,
          geographic_scope: newPermission.geographic_scope.length > 0 ? newPermission.geographic_scope : null
        }]);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: t('admin:carPermissionsManager.toastMessages.permissionsUpdatedSuccess')
      });

      await fetchPermissions();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating CAR permission:', error);
      toast({
        title: t('common:error'),
        description: t('admin:carPermissionsManager.toastMessages.permissionsUpdateFailed'),
        variant: 'destructive'
      });
    }
  };

  const removePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('car_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: t('admin:carPermissionsManager.toastMessages.permissionsRemovedSuccess')
      });

      await fetchPermissions();
    } catch (error) {
      console.error('Error removing CAR permission:', error);
      toast({
        title: t('common:error'),
        description: t('admin:carPermissionsManager.toastMessages.permissionsRemoveFailed'),
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setNewPermission({
      can_review_citizen_addresses: false,
      can_verify_residency: false,
      can_manage_person_records: false,
      can_access_address_history: false,
      can_update_address_status: false,
      can_merge_duplicate_persons: false,
      jurisdiction_scope: 'municipal',
      geographic_scope: []
    });
    setUserSearch('');
    setSearchResults([]);
    setSelectedUser(null);
  };

  const getPermissionCount = (permission: CARPermission) => {
    return [
      permission.can_review_citizen_addresses,
      permission.can_verify_residency,
      permission.can_manage_person_records,
      permission.can_access_address_history,
      permission.can_update_address_status,
      permission.can_merge_duplicate_persons
    ].filter(Boolean).length;
  };

  if (!hasCARManagementAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('admin:carPermissionsManager.title')}
          </CardTitle>
          <CardDescription>
            {t('admin:carPermissionsManager.accessDenied')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('admin:carPermissionsManager.title')}
            </CardTitle>
            <CardDescription>
              {t('admin:carPermissionsManager.description')}
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserCog className="h-4 w-4 mr-2" />
                {t('admin:carPermissionsManager.managePermissions')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" aria-describedby="car-permissions-desc">
              <DialogHeader>
                <DialogTitle>{t('admin:carPermissionsManager.dialogTitle')}</DialogTitle>
                <DialogDescription id="car-permissions-desc">
                  {t('admin:carPermissionsManager.dialogDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* User Search */}
                <div>
                  <Label htmlFor="user_search">{t('admin:carPermissionsManager.searchUser')}</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="user_search"
                        className="pl-10"
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        placeholder={t('admin:carPermissionsManager.searchPlaceholder')}
                      />
                    </div>
                    
                    {selectedUser && (
                      <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">{selectedUser.full_name}</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(null)}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                    
                    {userSearch && !selectedUser && searchResults.length > 0 && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {searchResults.map((user) => (
                          <div
                            key={user.user_id}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserSearch('');
                              setSearchResults([]);
                            }}
                          >
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">{t('admin:carPermissionsManager.corePermissions')}</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <Label>{t('admin:carPermissionsManager.permissionLabels.reviewCitizenAddresses')}</Label>
                      </div>
                      <Switch
                        checked={newPermission.can_review_citizen_addresses}
                        onCheckedChange={(checked) => 
                          setNewPermission({...newPermission, can_review_citizen_addresses: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <Label>{t('admin:carPermissionsManager.permissionLabels.verifyResidency')}</Label>
                      </div>
                      <Switch
                        checked={newPermission.can_verify_residency}
                        onCheckedChange={(checked) => 
                          setNewPermission({...newPermission, can_verify_residency: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <Label>{t('admin:carPermissionsManager.permissionLabels.managePersonRecords')}</Label>
                      </div>
                      <Switch
                        checked={newPermission.can_manage_person_records}
                        onCheckedChange={(checked) => 
                          setNewPermission({...newPermission, can_manage_person_records: checked})
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">{t('admin:carPermissionsManager.advancedPermissions')}</h4>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <Label>{t('admin:carPermissionsManager.permissionLabels.accessAddressHistory')}</Label>
                      </div>
                      <Switch
                        checked={newPermission.can_access_address_history}
                        onCheckedChange={(checked) => 
                          setNewPermission({...newPermission, can_access_address_history: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileEdit className="h-4 w-4" />
                        <Label>{t('admin:carPermissionsManager.permissionLabels.updateAddressStatus')}</Label>
                      </div>
                      <Switch
                        checked={newPermission.can_update_address_status}
                        onCheckedChange={(checked) => 
                          setNewPermission({...newPermission, can_update_address_status: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Merge className="h-4 w-4" />
                        <Label>{t('admin:carPermissionsManager.permissionLabels.mergeDuplicatePersons')}</Label>
                      </div>
                      <Switch
                        checked={newPermission.can_merge_duplicate_persons}
                        onCheckedChange={(checked) => 
                          setNewPermission({...newPermission, can_merge_duplicate_persons: checked})
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Jurisdiction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin:carPermissionsManager.jurisdictionScope')}</Label>
                    <Select 
                      value={newPermission.jurisdiction_scope} 
                      onValueChange={(value) => setNewPermission({...newPermission, jurisdiction_scope: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">{t('admin:carPermissionsManager.jurisdictionOptions.national')}</SelectItem>
                        <SelectItem value="regional">{t('admin:carPermissionsManager.jurisdictionOptions.regional')}</SelectItem>
                        <SelectItem value="municipal">{t('admin:carPermissionsManager.jurisdictionOptions.municipal')}</SelectItem>
                        <SelectItem value="local">{t('admin:carPermissionsManager.jurisdictionOptions.local')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('admin:carPermissionsManager.geographicScope')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin:carPermissionsManager.selectProvinces')} />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={createPermission} 
                  className="w-full"
                  disabled={!selectedUser}
                >
                  {t('admin:carPermissionsManager.savePermissions')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : permissions?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('admin:carPermissionsManager.noPermissionsConfigured')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {permissions?.map((permission) => (
              <div key={permission.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">{permission.full_name || t('admin:carPermissionsManager.unknownUser')}</span>
                      <Badge variant="outline">
                        {getPermissionCount(permission)} {t('admin:carPermissionsManager.permissions')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{permission.email}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {permission.can_review_citizen_addresses && (
                        <Badge variant="secondary">{t('admin:carPermissionsManager.permissionBadges.reviewAddresses')}</Badge>
                      )}
                      {permission.can_verify_residency && (
                        <Badge variant="secondary">{t('admin:carPermissionsManager.permissionBadges.verifyResidency')}</Badge>
                      )}
                      {permission.can_manage_person_records && (
                        <Badge variant="secondary">{t('admin:carPermissionsManager.permissionBadges.managePersons')}</Badge>
                      )}
                      {permission.can_access_address_history && (
                        <Badge variant="secondary">{t('admin:carPermissionsManager.permissionBadges.accessHistory')}</Badge>
                      )}
                      {permission.can_update_address_status && (
                        <Badge variant="secondary">{t('admin:carPermissionsManager.permissionBadges.updateStatus')}</Badge>
                      )}
                      {permission.can_merge_duplicate_persons && (
                        <Badge variant="secondary">{t('admin:carPermissionsManager.permissionBadges.mergeDuplicates')}</Badge>
                      )}
                    </div>
                    {permission.jurisdiction_scope && (
                      <p className="text-xs text-muted-foreground">
                        {t('admin:carPermissionsManager.scope')}: {permission.jurisdiction_scope}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePermission(permission.id)}
                  >
                    {t('admin:carPermissionsManager.remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}