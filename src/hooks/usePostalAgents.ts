import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export interface PostalAgent {
  id: string;
  full_name: string;
  phone?: string;
  activeAssignments: number;
}

export const usePostalAgents = () => {
  const [agents, setAgents] = useState<PostalAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const { roleMetadata, isAdmin } = useUserRole();

  // Get geographic scope for filtering agents
  const getGeographicFilter = useCallback(() => {
    if (isAdmin) return null;
    
    const geoScope = roleMetadata.find(m => 
      m.scope_type === 'region' || m.scope_type === 'city' || m.scope_type === 'province'
    );
    
    return geoScope || null;
  }, [roleMetadata, isAdmin]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const geoFilter = getGeographicFilter();
      
      // Get users with postal_agent role and their metadata
      let agentRolesQuery = supabase
        .from('user_roles')
        .select(`
          user_id,
          user_role_metadata!fk_user_role_metadata_user_role (
            scope_type,
            scope_value
          )
        `)
        .eq('role', 'postal_agent');

      const { data: agentRoles, error: rolesError } = await agentRolesQuery;

      if (rolesError) throw rolesError;

      if (!agentRoles || agentRoles.length === 0) {
        setAgents([]);
        return;
      }

      // Filter agents by geographic scope if dispatcher/supervisor has scope
      let filteredAgentIds: string[];
      
      if (geoFilter) {
        filteredAgentIds = agentRoles
          .filter(r => {
            const agentMeta = r.user_role_metadata || [];
            // Include agent if they have matching scope or no scope (available anywhere)
            if (agentMeta.length === 0) return true;
            return agentMeta.some((m: any) => 
              (m.scope_type === geoFilter.scope_type || 
               m.scope_type === 'region' || 
               m.scope_type === 'city' || 
               m.scope_type === 'province') &&
              m.scope_value?.toLowerCase() === geoFilter.scope_value?.toLowerCase()
            );
          })
          .map(r => r.user_id);
      } else {
        filteredAgentIds = agentRoles.map(r => r.user_id);
      }

      if (filteredAgentIds.length === 0) {
        setAgents([]);
        return;
      }

      // Get profiles for these agents
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', filteredAgentIds);

      if (profilesError) throw profilesError;

      // Get active assignments count for each agent
      const { data: assignments, error: assignmentsError } = await supabase
        .from('delivery_assignments')
        .select('agent_id, order_id')
        .in('agent_id', filteredAgentIds);

      if (assignmentsError) throw assignmentsError;

      // Get orders that are not yet delivered to filter active assignments
      const orderIds = assignments?.map(a => a.order_id) || [];
      const { data: activeOrders, error: ordersError } = await supabase
        .from('delivery_orders')
        .select('id')
        .in('id', orderIds.length > 0 ? orderIds : ['00000000-0000-0000-0000-000000000000'])
        .in('status', ['assigned', 'out_for_delivery']);

      if (ordersError) throw ordersError;

      const activeOrderIds = new Set(activeOrders?.map(o => o.id) || []);

      // Count active assignments per agent
      const assignmentCounts: Record<string, number> = {};
      assignments?.forEach(a => {
        if (activeOrderIds.has(a.order_id)) {
          assignmentCounts[a.agent_id] = (assignmentCounts[a.agent_id] || 0) + 1;
        }
      });

      // Build agent list
      const agentList: PostalAgent[] = (profiles || []).map(p => ({
        id: p.user_id,
        full_name: p.full_name || 'Unknown Agent',
        phone: p.phone,
        activeAssignments: assignmentCounts[p.user_id] || 0
      }));

      // Sort by workload (least busy first)
      agentList.sort((a, b) => a.activeAssignments - b.activeAssignments);

      setAgents(agentList);
    } catch (error) {
      console.error('Error fetching postal agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [getGeographicFilter]);

  return { agents, loading, refetch: fetchAgents };
};
