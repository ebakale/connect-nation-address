import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 
  | 'admin' | 'moderator' | 'user' 
  | 'citizen' | 'property_claimant' | 'field_agent' 
  | 'verifier' | 'registrar' | 'ndaa_admin' 
  | 'partner' | 'auditor' | 'data_steward' | 'support' 
  | null;

export interface RoleMetadata {
  scope_type: 'geographic' | 'organization' | 'partner_type';
  scope_value: string;
}

export interface UserRoleWithMetadata {
  role: UserRole;
  metadata: RoleMetadata[];
}

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [roleMetadata, setRoleMetadata] = useState<RoleMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch user role and metadata
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            role,
            user_role_metadata (
              scope_type,
              scope_value
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          setRole('citizen'); // Default to 'citizen' if no role found
          setRoleMetadata([]);
        } else {
          setRole(roleData.role as UserRole);
          setRoleMetadata((roleData.user_role_metadata || []) as RoleMetadata[]);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('citizen');
        setRoleMetadata([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // Role hierarchy checks
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const isNDAAAdmin = role === 'ndaa_admin';
  const isRegistrar = role === 'registrar';
  const isVerifier = role === 'verifier';
  const isFieldAgent = role === 'field_agent';
  const isPropertyClaimant = role === 'property_claimant';
  const isCitizen = role === 'citizen';
  const isPartner = role === 'partner';
  const isAuditor = role === 'auditor';
  const isDataSteward = role === 'data_steward';
  const isSupport = role === 'support';

  // Access level checks
  const hasAdminAccess = role === 'admin' || role === 'ndaa_admin';
  const hasRegistrarAccess = hasAdminAccess || role === 'registrar';
  const hasVerifierAccess = hasRegistrarAccess || role === 'verifier';
  const hasFieldAccess = hasVerifierAccess || role === 'field_agent';
  const canViewPublicData = true; // All roles can view public data
  const canCreateAddresses = hasFieldAccess || role === 'property_claimant';
  const canVerifyAddresses = hasVerifierAccess;
  const canPublishAddresses = hasRegistrarAccess;

  // Get geographic scope
  const getGeographicScope = () => {
    return roleMetadata
      .filter(m => m.scope_type === 'geographic')
      .map(m => m.scope_value);
  };

  // Get organization scope
  const getOrganizationScope = () => {
    return roleMetadata
      .filter(m => m.scope_type === 'organization')
      .map(m => m.scope_value);
  };

  // Check if user has specific scope
  const hasScope = (scopeType: string, scopeValue: string) => {
    return roleMetadata.some(m => 
      m.scope_type === scopeType && m.scope_value === scopeValue
    );
  };

  return {
    role,
    roleMetadata,
    loading,
    // Role checks
    isAdmin,
    isModerator,
    isNDAAAdmin,
    isRegistrar,
    isVerifier,
    isFieldAgent,
    isPropertyClaimant,
    isCitizen,
    isPartner,
    isAuditor,
    isDataSteward,
    isSupport,
    // Access checks
    hasAdminAccess,
    hasRegistrarAccess,
    hasVerifierAccess,
    hasFieldAccess,
    canViewPublicData,
    canCreateAddresses,
    canVerifyAddresses,
    canPublishAddresses,
    // Scope functions
    getGeographicScope,
    getOrganizationScope,
    hasScope
  };
};