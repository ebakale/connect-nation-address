import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AssignOrdersInput {
  orderIds: string[];
  agentId: string;
  notes?: string;
  estimatedDeliveryTime?: string;
}

export const useAssignOrders = () => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const [assigning, setAssigning] = useState(false);

  const assignOrders = async ({ orderIds, agentId, notes, estimatedDeliveryTime }: AssignOrdersInput) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setAssigning(true);
    try {
      // Create assignments for each order
      const assignments = orderIds.map((orderId, index) => ({
        order_id: orderId,
        agent_id: agentId,
        assigned_by: user.id,
        notes: notes || null,
        estimated_delivery_time: estimatedDeliveryTime || null,
        route_sequence: index + 1
      }));

      const { error: assignError } = await supabase
        .from('delivery_assignments')
        .insert(assignments);

      if (assignError) throw assignError;

      // Update order statuses to 'assigned'
      const { error: updateError } = await supabase
        .from('delivery_orders')
        .update({ status: 'assigned', updated_at: new Date().toISOString() })
        .in('id', orderIds);

      if (updateError) throw updateError;

      // Log status changes
      const statusLogs = orderIds.map(orderId => ({
        order_id: orderId,
        previous_status: 'ready_for_assignment' as const,
        new_status: 'assigned' as const,
        changed_by: user.id,
        notes: notes || null
      }));

      await supabase.from('delivery_status_logs').insert(statusLogs);

      toast.success(t('messages.assignmentSuccess'));
      return { success: true };
    } catch (error) {
      console.error('Error assigning orders:', error);
      toast.error(t('messages.errorAssigning'));
      return { success: false, error };
    } finally {
      setAssigning(false);
    }
  };

  return { assignOrders, assigning };
};
