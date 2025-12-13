import { useUserRole } from './useUserRole';

export type PostalRole = 'postal_clerk' | 'postal_agent' | 'postal_dispatcher' | 'postal_supervisor' | null;

export const usePostalRole = () => {
  const { role, loading, roleMetadata } = useUserRole();
  
  // Check if user has any postal role
  const isPostalClerk = role === 'postal_clerk';
  const isPostalAgent = role === 'postal_agent';
  const isPostalDispatcher = role === 'postal_dispatcher';
  const isPostalSupervisor = role === 'postal_supervisor';
  const isAdmin = role === 'admin';
  
  const hasPostalAccess = isPostalClerk || isPostalAgent || isPostalDispatcher || isPostalSupervisor || isAdmin;
  
  // Permission checks
  const canCreateOrders = isPostalClerk || isPostalDispatcher || isPostalSupervisor || isAdmin;
  const canViewOrders = hasPostalAccess;
  const canAssignOrders = isPostalDispatcher || isPostalSupervisor || isAdmin;
  const canUpdateOrderStatus = hasPostalAccess;
  const canViewReports = isPostalDispatcher || isPostalSupervisor || isAdmin;
  const canManageAgents = isPostalDispatcher || isPostalSupervisor || isAdmin;
  const canCaptureProof = isPostalAgent || isPostalDispatcher || isPostalSupervisor || isAdmin;
  
  // Get postal role for display
  const getPostalRole = (): PostalRole => {
    if (isPostalSupervisor) return 'postal_supervisor';
    if (isPostalDispatcher) return 'postal_dispatcher';
    if (isPostalAgent) return 'postal_agent';
    if (isPostalClerk) return 'postal_clerk';
    return null;
  };
  
  return {
    role,
    postalRole: getPostalRole(),
    loading,
    roleMetadata,
    
    // Role checks
    isPostalClerk,
    isPostalAgent,
    isPostalDispatcher,
    isPostalSupervisor,
    isAdmin,
    hasPostalAccess,
    
    // Permission checks
    canCreateOrders,
    canViewOrders,
    canAssignOrders,
    canUpdateOrderStatus,
    canViewReports,
    canManageAgents,
    canCaptureProof,
  };
};
