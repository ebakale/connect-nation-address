import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, Settings, Eye, Trash2 } from 'lucide-react';

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
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function NARAuthorityManager() {
  const { t } = useTranslation(['common', 'admin']);
  const { toast } = useToast();
  const [authorities, setAuthorities] = useState<NARAuthority[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAuthority, setNewAuthority] = useState({
    user_id: '',
    authority_level: '',
    jurisdiction_region: '',
    jurisdiction_city: '',
    can_create_addresses: true,
    can_verify_addresses: true,
    can_update_addresses: false
  });

  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      const { data: authorities, error } = await supabase
        .from('nar_authorities')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Get user profiles separately
      if (authorities && authorities.length > 0) {
        const userIds = authorities.map(auth => auth.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const authoritiesWithProfiles = authorities.map(auth => {
          const profile = profiles?.find(p => p.user_id === auth.user_id);
          return {
            ...auth,
            profiles: {
              full_name: profile?.full_name || 'Unknown User',
              email: profile?.email || 'Unknown Email'
            }
          };
        });

        setAuthorities(authoritiesWithProfiles);
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
      if (!newAuthority.user_id || !newAuthority.authority_level) {
        toast({
          title: t('common:error'),
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('nar_authorities')
        .insert([{
          user_id: newAuthority.user_id,
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

      setShowCreateDialog(false);
      setNewAuthority({
        user_id: '',
        authority_level: '',
        jurisdiction_region: '',
        jurisdiction_city: '',
        can_create_addresses: true,
        can_verify_addresses: true,
        can_update_addresses: false
      });
      fetchAuthorities();
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

      fetchAuthorities();
    } catch (error) {
      console.error('Error deactivating NAR authority:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to deactivate NAR authority',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const getAuthorityLevelColor = (level: string) => {
    switch (level) {
      case 'national': return 'bg-red-500 text-white';
      case 'regional': return 'bg-blue-500 text-white';
      case 'municipal': return 'bg-green-500 text-white';
      case 'local': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
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
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Authority
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New NAR Authority</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    value={newAuthority.user_id}
                    onChange={(e) => setNewAuthority({ ...newAuthority, user_id: e.target.value })}
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <Label htmlFor="authority_level">Authority Level</Label>
                  <Select
                    value={newAuthority.authority_level}
                    onValueChange={(value) => setNewAuthority({ ...newAuthority, authority_level: value })}
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
                  <Label htmlFor="jurisdiction_region">Jurisdiction Region</Label>
                  <Input
                    id="jurisdiction_region"
                    value={newAuthority.jurisdiction_region}
                    onChange={(e) => setNewAuthority({ ...newAuthority, jurisdiction_region: e.target.value })}
                    placeholder="Optional: specific region"
                  />
                </div>
                <div>
                  <Label htmlFor="jurisdiction_city">Jurisdiction City</Label>
                  <Input
                    id="jurisdiction_city"
                    value={newAuthority.jurisdiction_city}
                    onChange={(e) => setNewAuthority({ ...newAuthority, jurisdiction_city: e.target.value })}
                    placeholder="Optional: specific city"
                  />
                </div>
                <Button onClick={createAuthority} className="w-full">
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
                      <span className="font-medium">
                        {authority.profiles?.full_name || authority.profiles?.email}
                      </span>
                      <Badge className={getAuthorityLevelColor(authority.authority_level)}>
                        {authority.authority_level}
                      </Badge>
                      <Badge variant={authority.is_active ? "default" : "secondary"}>
                        {authority.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    {(authority.jurisdiction_region || authority.jurisdiction_city) && (
                      <div className="text-sm text-muted-foreground">
                        Jurisdiction: {[authority.jurisdiction_region, authority.jurisdiction_city]
                          .filter(Boolean).join(', ')}
                      </div>
                    )}
                    
                    <div className="flex gap-2 text-sm">
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
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deactivateAuthority(authority.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}