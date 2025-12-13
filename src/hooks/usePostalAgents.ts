import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PostalAgent {
  id: string;
  full_name: string;
  phone?: string;
  activeAssignments: number;
}

export const usePostalAgents = () => {
  const [agents, setAgents] = useState<PostalAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      // Get users with postal_agent role
      const { data: agentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'postal_agent');

      if (rolesError) throw rolesError;

      if (!agentRoles || agentRoles.length === 0) {
        setAgents([]);
        return;
      }

      const agentIds = agentRoles.map(r => r.user_id);

      // Get profiles for these agents
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', agentIds);

      if (profilesError) throw profilesError;

      // Get active assignments count for each agent
      const { data: assignments, error: assignmentsError } = await supabase
        .from('delivery_assignments')
        .select('agent_id, order_id')
        .in('agent_id', agentIds);

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
  }, []);

  return { agents, loading, refetch: fetchAgents };
};
