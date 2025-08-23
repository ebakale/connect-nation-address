import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 
  | 'admin' | 'moderator' | 'user' 
  | 'citizen' | 'property_claimant' | 'field_agent' 
  | 'verifier' | 'registrar' | 'ndaa_admin' 
  | 'partner' | 'auditor' | 'data_steward' | 'support'
  | 'police_operator' | 'police_supervisor' | 'police_dispatcher'
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
      if (!user?.id) {
        // Only reset role if we don't have one cached
        if (!role) {
          setRole('citizen');
          setRoleMetadata([]);
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch user roles and metadata (user can have multiple roles)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            role,
            user_role_metadata (
              scope_type,
              scope_value
            )
          `)
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          // Don't reset role if we already have one cached
          if (!role) {
            setRole('citizen');
            setRoleMetadata([]);
          }
          return;
        }

        // Only update if we actually got data back
        if (roleData && roleData.length > 0) {
          // Get the highest priority role (admin > ndaa_admin > registrar > etc.)
          const roles = roleData.map(r => r.role);
          const priorityOrder: UserRole[] = ['admin', 'ndaa_admin', 'registrar', 'verifier', 'field_agent', 'property_claimant', 'citizen', 'partner', 'auditor', 'data_steward', 'support', 'moderator', 'user'];
          const highestRole = priorityOrder.find(role => roles.includes(role)) || 'citizen';
          
          setRole(highestRole as UserRole);
          
          // Collect all metadata from all roles
          const allMetadata = roleData.flatMap(r => r.user_role_metadata || []);
          setRoleMetadata(allMetadata as RoleMetadata[]);
        } else {
          // Only set to citizen if we don't have a cached role
          if (!role) {
            setRole('citizen');
            setRoleMetadata([]);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Don't reset role if we already have one cached
        if (!role) {
          setRole('citizen');
          setRoleMetadata([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

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
  
  // Operational Permissions based on the permission map
  const canSearchVerifiedAddresses = true; // All roles can search verified addresses
  
  const canCreateDraftAddress = 
    role === 'field_agent' || 
    hasVerifierAccess || // Verifiers can create for corrections
    role === 'data_steward'; // Data stewards can create test sandboxes
  
  const canUploadEvidence = 
    role === 'property_claimant' || 
    role === 'field_agent' || 
    hasVerifierAccess;
  
  // Evidence viewing permissions
  const getEvidenceViewLevel = () => {
    if (hasRegistrarAccess) return 'full'; // Full access
    if (role === 'verifier') return 'full';
    if (role === 'field_agent') return 'own'; // Own submissions only
    if (role === 'property_claimant') return 'own'; // Own only
    if (role === 'auditor') return 'redacted'; // Redacted view
    if (role === 'data_steward') return 'redacted'; // Redacted QA view
    if (role === 'citizen') return 'redacted'; // View redacted
    if (role === 'partner') return 'none'; // No evidence access
    return 'none';
  };
  
  // Verification and publishing permissions
  const canVerifyAddresses = role === 'verifier' || hasRegistrarAccess;
  const canPublishAddresses = hasRegistrarAccess;
  const canRetireAddresses = hasRegistrarAccess;
  const canOverrideDecisions = role === 'ndaa_admin';
  
  // Record management permissions
  const canMergeRecords = role === 'verifier' || hasRegistrarAccess;
  const canSplitRecords = role === 'verifier' || hasRegistrarAccess;
  
  // Hierarchy and boundary management
  const canEditHierarchy = () => {
    if (role === 'ndaa_admin') return 'national';
    if (role === 'registrar') return 'province';
    if (role === 'verifier') return 'district';
    if (role === 'data_steward') return 'suggest'; // Can only suggest changes
    return 'none';
  };
  
  // API and webhook management
  const canManageAPIKeys = role === 'ndaa_admin';
  const canRequestAPIAccess = role === 'partner';
  
  // Audit log access levels
  const getAuditLogAccess = () => {
    if (role === 'ndaa_admin') return 'nation';
    if (role === 'registrar') return 'province';
    if (role === 'verifier') return 'district';
    if (role === 'auditor') return 'read_only';
    if (role === 'data_steward') return 'qa_only';
    if (role === 'partner') return 'delivery_logs';
    if (role === 'field_agent' || role === 'property_claimant') return 'own';
    if (role === 'citizen') return 'status_only';
    return 'none';
  };

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

  // ABAC (Attribute-Based Access Control) for geographic scoping
  const canAccessLocation = (locationDistrict?: string, locationProvince?: string) => {
    const geographicScopes = getGeographicScope();
    
    if (role === 'ndaa_admin') return true; // National access
    if (role === 'registrar') {
      // Province level access
      return !locationProvince || geographicScopes.includes(locationProvince);
    }
    if (role === 'verifier') {
      // District level access
      return !locationDistrict || geographicScopes.includes(locationDistrict);
    }
    
    return true; // Other roles have general access
  };

  // Workflow helper functions
  const getWorkflowStage = () => {
    if (role === 'citizen') return 'submit_request';
    if (role === 'field_agent') return 'capture_draft';
    if (role === 'verifier') return 'verify';
    if (role === 'registrar') return 'publish';
    return 'view_only';
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
    // Operational permissions
    canSearchVerifiedAddresses,
    canCreateDraftAddress,
    canUploadEvidence,
    getEvidenceViewLevel,
    canVerifyAddresses,
    canPublishAddresses,
    canRetireAddresses,
    canOverrideDecisions,
    canMergeRecords,
    canSplitRecords,
    canEditHierarchy,
    canManageAPIKeys,
    canRequestAPIAccess,
    getAuditLogAccess,
    // ABAC and workflow
    canAccessLocation,
    getWorkflowStage,
    // Scope functions
    getGeographicScope,
    getOrganizationScope,
    hasScope
  };
};