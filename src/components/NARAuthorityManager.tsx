import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, X, Search } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface NARAuthority {
  id: string;
  user_id: string;
  authority_level: string;
  jurisdiction_region?: string;
  jurisdiction_city?: string;
  can_create_addresses: boolean;
  can_verify_addresses: boolean;
  can_update_addresses: boolean;
  is_active: boolean;
  created_at: string;
  // Profile data from join
  full_name?: string;
  email?: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
}

// Equatorial Guinea provinces and cities data
const EQUATORIAL_GUINEA_DATA = {
  'Annobón': ['San Antonio de Palé'],
  'Bioko Norte': ['Malabo', 'Rebola', 'Baney'],
  'Bioko Sur': ['Luba', 'Riaba', 'Moca'],
  'Centro Sur': ['Evinayong', 'Acurenam'],
  'Djibloho': ['Ciudad de la Paz'],
  'Kié-Ntem': ['Ebebiyín', 'Mikomeseng', 'Ncue', 'Nsork Nsomo'],
  'Litoral': ['Bata', 'Mbini', 'Kogo', 'Acalayong'],
  'Wele-Nzas': ['Mongomo', 'Añisoc', 'Aconibe', 'Nsok']
};

const PROVINCES = Object.keys(EQUATORIAL_GUINEA_DATA);

export function NARAuthorityManager() {
  const { t } = useTranslation(['common', 'admin']);
  const { toast } = useToast();
  const [authorities, setAuthorities] = useState<NARAuthority[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // User search state
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  
  const [newAuthority, setNewAuthority] = useState({
    authority_level: '',
    jurisdiction_region: '',
    jurisdiction_city: '',
    can_create_addresses: true,
    can_verify_addresses: true,
    can_update_addresses: false
  });

  // Get cities for selected province
  const getCitiesForProvince = (province: string) => {
    return EQUATORIAL_GUINEA_DATA[province as keyof typeof EQUATORIAL_GUINEA_DATA] || [];
  };

  // Search for users by email or name
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

  // Reset form when dialog closes
  const resetForm = () => {
    setNewAuthority({
      authority_level: '',
      jurisdiction_region: '',
      jurisdiction_city: '',
      can_create_addresses: true,
      can_verify_addresses: true,
      can_update_addresses: false
    });
    setUserSearch('');
    setSearchResults([]);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    try {
      // First get the authorities
      const { data: authoritiesData, error: authoritiesError } = await supabase
        .from('nar_authorities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (authoritiesError) throw authoritiesError;

      if (authoritiesData && authoritiesData.length > 0) {
        // Get user IDs
        const userIds = authoritiesData.map(auth => auth.user_id);
        
        // Get profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const formattedData = authoritiesData.map(authority => {
          const profile = profilesData?.find(p => p.user_id === authority.user_id);
          return {
            ...authority,
            full_name: profile?.full_name,
            email: profile?.email
          };
        });
        
        setAuthorities(formattedData);
      } else {
        setAuthorities([]);
      }
    } catch (error) {
      console.error('Error fetching NAR authorities:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to fetch NAR authorities',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createAuthority = async () => {
    try {
      if (!selectedUser || !newAuthority.authority_level) {
        toast({
          title: t('common:error'),
          description: 'Please select a user and authority level',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('nar_authorities')
        .insert([{
          user_id: selectedUser.user_id, // Use the selected user's UUID
          authority_level: newAuthority.authority_level,
          jurisdiction_region: newAuthority.jurisdiction_region || null,
          jurisdiction_city: newAuthority.jurisdiction_city || null,
          can_create_addresses: newAuthority.can_create_addresses,
          can_verify_addresses: newAuthority.can_verify_addresses,
          can_update_addresses: newAuthority.can_update_addresses
        }]);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: 'NAR authority created successfully'
      });

      await fetchAuthorities();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating NAR authority:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to create NAR authority',
        variant: 'destructive'
      });
    }
  };

  const deactivateAuthority = async (authorityId: string) => {
    try {
      const { error } = await supabase
        .from('nar_authorities')
        .update({ is_active: false })
        .eq('id', authorityId);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: 'NAR authority deactivated successfully'
      });

      await fetchAuthorities();
    } catch (error) {
      console.error('Error deactivating NAR authority:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to deactivate NAR authority',
        variant: 'destructive'
      });
    }
  };

  const getAuthorityLevelColor = (level: string) => {
    switch (level) {
      case 'national': return 'bg-red-100 text-red-800';
      case 'regional': return 'bg-orange-100 text-orange-800';
      case 'municipal': return 'bg-blue-100 text-blue-800';
      case 'local': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthorityIcon = (level: string) => {
    return <Shield className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              NAR Authority Management
            </CardTitle>
            <CardDescription>
              Manage National Address Registry authorities and their permissions
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Authority
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="nar-authority-desc">
              <DialogHeader>
                <DialogTitle>Create New NAR Authority</DialogTitle>
                <DialogDescription id="nar-authority-desc">
                  Assign NAR authority permissions to a user to allow them to create and verify official addresses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_search">Search User</Label>
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
                        placeholder="Search by email or name..."
                      />
                    </div>
                    
                    {/* Selected User Display */}
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
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Search Results */}
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
                    
                    {userSearch && !selectedUser && searchResults.length === 0 && !searching && (
                      <p className="text-sm text-muted-foreground">No users found</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="authority_level">Authority Level</Label>
                  <Select
                    value={newAuthority.authority_level}
                    onValueChange={(value) => setNewAuthority({ 
                      ...newAuthority, 
                      authority_level: value,
                      // Clear jurisdiction fields when selecting national or regional
                      jurisdiction_region: (value === 'national') ? '' : newAuthority.jurisdiction_region,
                      jurisdiction_city: (value === 'national' || value === 'regional') ? '' : newAuthority.jurisdiction_city
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select authority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jurisdiction_region">Jurisdiction (Province)</Label>
                  <Select
                    value={newAuthority.jurisdiction_region}
                    onValueChange={(value) => setNewAuthority({ 
                      ...newAuthority, 
                      jurisdiction_region: value,
                      jurisdiction_city: '' // Reset city when province changes
                    })}
                    disabled={newAuthority.authority_level === 'national'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        newAuthority.authority_level === 'national' 
                          ? "National authority - covers all provinces" 
                          : newAuthority.authority_level === 'regional'
                          ? "Select province (required for regional authority)"
                          : "Select province (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jurisdiction_city">Jurisdiction City</Label>
                  <Select
                    value={newAuthority.jurisdiction_city}
                    onValueChange={(value) => setNewAuthority({ ...newAuthority, jurisdiction_city: value })}
                    disabled={
                      newAuthority.authority_level === 'national' || 
                      newAuthority.authority_level === 'regional' ||
                      !newAuthority.jurisdiction_region
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        newAuthority.authority_level === 'national'
                          ? "National authority - covers all cities"
                          : newAuthority.authority_level === 'regional'
                          ? "Regional authority - covers all cities in province"
                          : !newAuthority.jurisdiction_region 
                            ? "Select province first"
                            : "Select city (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {newAuthority.jurisdiction_region && getCitiesForProvince(newAuthority.jurisdiction_region).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={createAuthority} 
                  className="w-full"
                  disabled={!selectedUser || !newAuthority.authority_level}
                >
                  Create Authority
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
        ) : authorities?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No NAR authorities configured</p>
          </div>
        ) : (
          <div className="space-y-4">
            {authorities?.map((authority) => (
              <div key={authority.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getAuthorityIcon(authority.authority_level)}
                      <span className="font-medium">{authority.full_name || 'Unknown User'}</span>
                      <Badge className={getAuthorityLevelColor(authority.authority_level)}>
                        {authority.authority_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{authority.email}</p>
                    {authority.jurisdiction_region && (
                      <p className="text-xs text-muted-foreground">
                        Region: {authority.jurisdiction_region}
                      </p>
                    )}
                    {authority.jurisdiction_city && (
                      <p className="text-xs text-muted-foreground">
                        City: {authority.jurisdiction_city}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {authority.can_create_addresses && (
                        <Badge variant="outline">Can Create</Badge>
                      )}
                      {authority.can_verify_addresses && (
                        <Badge variant="outline">Can Verify</Badge>
                      )}
                      {authority.can_update_addresses && (
                        <Badge variant="outline">Can Update</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deactivateAuthority(authority.id)}
                  >
                    Deactivate
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