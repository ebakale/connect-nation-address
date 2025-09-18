import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export const NARAuthorityManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authorities, isLoading } = useQuery({
    queryKey: ['narAuthorities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nar_authorities')
        .select(`
          *,
          profiles!nar_authorities_user_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: currentUserAuthority } = useQuery({
    queryKey: ['currentUserAuthority'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('nar_authorities')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const toggleAuthorityStatus = async (authorityId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('nar_authorities')
        .update({ is_active: !isActive })
        .eq('id', authorityId);

      if (error) throw error;

      toast({
        title: "Authority status updated",
        description: `Authority has been ${!isActive ? 'activated' : 'deactivated'}`,
      });

      queryClient.invalidateQueries({ queryKey: ['narAuthorities'] });
    } catch (error) {
      console.error('Error updating authority:', error);
      toast({
        title: "Update failed",
        description: "Failed to update authority status",
        variant: "destructive",
      });
    }
  };

  const getAuthorityLevelColor = (level: string) => {
    switch (level) {
      case 'national': return 'bg-red-100 text-red-800';
      case 'regional': return 'bg-yellow-100 text-yellow-800';
      case 'municipal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthorityIcon = (level: string) => {
    switch (level) {
      case 'national': return <Shield className="h-4 w-4" />;
      case 'regional': return <Building className="h-4 w-4" />;
      case 'municipal': return <Building className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            NAR Authority Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage National Address Registry creation authorities
          </p>
        </CardHeader>
        <CardContent>
          {currentUserAuthority && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Your Authority Status</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Level:</span>{' '}
                  <Badge className={getAuthorityLevelColor(currentUserAuthority.authority_level)}>
                    {currentUserAuthority.authority_level}
                  </Badge>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Can Create:</span>{' '}
                  {currentUserAuthority.can_create_addresses ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Can Update:</span>{' '}
                  {currentUserAuthority.can_update_addresses ? 'Yes' : 'No'}
                </div>
                {currentUserAuthority.jurisdiction_region && (
                  <div>
                    <span className="text-blue-700 font-medium">Region:</span>{' '}
                    {currentUserAuthority.jurisdiction_region}
                  </div>
                )}
                {currentUserAuthority.jurisdiction_city && (
                  <div>
                    <span className="text-blue-700 font-medium">City:</span>{' '}
                    {currentUserAuthority.jurisdiction_city}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        {authority.jurisdiction_region && (
                          <div>Region: {authority.jurisdiction_region}</div>
                        )}
                        {authority.jurisdiction_city && (
                          <div>City: {authority.jurisdiction_city}</div>
                        )}
                        <div>
                          Can Create: {authority.can_create_addresses ? 'Yes' : 'No'}
                        </div>
                        <div>
                          Can Update: {authority.can_update_addresses ? 'Yes' : 'No'}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Authorized: {new Date(authority.authorized_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button
                      variant={authority.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleAuthorityStatus(authority.id, authority.is_active)}
                    >
                      {authority.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};