import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DeliveryOrder, DeliveryStatus } from '@/types/postal';

export interface AgentDelivery {
  assignment_id: string;
  order: DeliveryOrder;
  assigned_at: string;
  acknowledged_at: string | null;
  started_at: string | null;
  route_sequence: number | null;
  notes: string | null;
}

export interface AgentStats {
  active: number;
  completedToday: number;
  total: number;
}

export const useAgentDeliveries = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<AgentDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AgentStats>({ active: 0, completedToday: 0, total: 0 });

  const fetchDeliveries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select(`
          id,
          assigned_at,
          acknowledged_at,
          started_at,
          route_sequence,
          notes,
          order:delivery_orders(*)
        `)
        .eq('agent_id', user.id)
        .order('route_sequence', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const mapped: AgentDelivery[] = (data || []).map((item: any) => ({
        assignment_id: item.id,
        order: item.order as DeliveryOrder,
        assigned_at: item.assigned_at,
        acknowledged_at: item.acknowledged_at,
        started_at: item.started_at,
        route_sequence: item.route_sequence,
        notes: item.notes
      }));

      setDeliveries(mapped);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const activeStatuses: DeliveryStatus[] = ['assigned', 'out_for_delivery'];
      const completedStatuses: DeliveryStatus[] = ['delivered', 'failed_delivery', 'returned_to_sender'];

      const active = mapped.filter(d => activeStatuses.includes(d.order.status)).length;
      const completedToday = mapped.filter(d => 
        completedStatuses.includes(d.order.status) && 
        d.order.completed_at?.startsWith(today)
      ).length;

      setStats({ active, completedToday, total: mapped.length });
    } catch (error) {
      console.error('Error fetching agent deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string, 
    newStatus: DeliveryStatus, 
    reason?: string,
    notes?: string
  ) => {
    if (!user) return { success: false };

    try {
      // Get current order status
      const order = deliveries.find(d => d.order.id === orderId)?.order;
      if (!order) throw new Error('Order not found');

      // Update order status
      const updateData: any = { 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      };
      
      if (['delivered', 'failed_delivery', 'returned_to_sender'].includes(newStatus)) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
      }

      const { error: updateError } = await supabase
        .from('delivery_orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log status change
      await supabase.from('delivery_status_logs').insert({
        order_id: orderId,
        previous_status: order.status,
        new_status: newStatus,
        changed_by: user.id,
        reason,
        notes
      });

      // Update assignment started_at if starting delivery
      if (newStatus === 'out_for_delivery') {
        const assignment = deliveries.find(d => d.order.id === orderId);
        if (assignment) {
          await supabase
            .from('delivery_assignments')
            .update({ started_at: new Date().toISOString() })
            .eq('id', assignment.assignment_id);
        }
      }

      await fetchDeliveries();
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error };
    }
  };

  const captureProof = async (
    orderId: string,
    proofType: string,
    data: {
      photo_url?: string;
      signature_data?: string;
      received_by_name?: string;
      relationship_to_recipient?: string;
      notes?: string;
      latitude?: number;
      longitude?: number;
    }
  ) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase.from('delivery_proof').insert({
        order_id: orderId,
        captured_by: user.id,
        proof_type: proofType,
        ...data
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error capturing proof:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('agent-deliveries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_orders'
        },
        () => fetchDeliveries()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `agent_id=eq.${user.id}`
        },
        () => fetchDeliveries()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    deliveries,
    loading,
    stats,
    refetch: fetchDeliveries,
    updateOrderStatus,
    captureProof
  };
};
