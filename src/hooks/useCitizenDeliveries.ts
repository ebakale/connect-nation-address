import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export interface CitizenDelivery {
  id: string;
  order_number: string;
  status: string;
  package_type: string;
  recipient_name: string;
  recipient_address_uac: string;
  sender_name: string;
  sender_address_uac: string | null;
  created_at: string;
  scheduled_date: string | null;
  completed_at: string | null;
  // Package details
  weight_grams: number | null;
  dimensions_cm: string | null;
  declared_value: number | null;
  priority_level: number;
  // Delivery requirements
  requires_signature: boolean;
  requires_id_verification: boolean;
  preferred_time_window: string | null;
  special_instructions: string | null;
  // COD info
  cod_required: boolean;
  cod_amount: number | null;
  status_logs: Array<{
    status: string;
    changed_at: string;
  }>;
  proof?: {
    proof_type: string;
    photo_url: string | null;
    received_by_name: string | null;
    captured_at: string;
  };
}

type StatusFilter = 'all' | 'active' | 'completed';

export const useCitizenDeliveries = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [deliveries, setDeliveries] = useState<CitizenDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const TERMINAL_STATUSES = ['delivered', 'failed_delivery', 'address_not_found', 'returned_to_sender', 'cancelled'] as const;

  const fetchDeliveries = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setDeliveries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch delivery orders (RLS will filter to user's UACs)
      let query = supabase
        .from('delivery_orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filter
      if (filter === 'active') {
        query = query.not('status', 'in', `(${TERMINAL_STATUSES.join(',')})`);
      } else if (filter === 'completed') {
        query = query.in('status', TERMINAL_STATUSES);
      }

      const { data: orders, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setDeliveries([]);
        setLoading(false);
        return;
      }

      // Fetch status logs for all orders
      const orderIds = orders.map(o => o.id);
      const { data: statusLogs, error: logsError } = await supabase
        .from('delivery_status_logs')
        .select('order_id, new_status, changed_at')
        .in('order_id', orderIds)
        .order('changed_at', { ascending: true });

      if (logsError) throw logsError;

      // Fetch proof for delivered orders
      const deliveredIds = orders.filter(o => o.status === 'delivered').map(o => o.id);
      let proofMap: Record<string, any> = {};
      
      if (deliveredIds.length > 0) {
        const { data: proofs, error: proofError } = await supabase
          .from('delivery_proof')
          .select('order_id, proof_type, photo_url, received_by_name, captured_at')
          .in('order_id', deliveredIds);

        if (!proofError && proofs) {
          proofMap = proofs.reduce((acc, p) => {
            acc[p.order_id] = p;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Combine data
      const combinedDeliveries: CitizenDelivery[] = orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        package_type: order.package_type,
        recipient_name: order.recipient_name,
        recipient_address_uac: order.recipient_address_uac,
        sender_name: order.sender_name,
        sender_address_uac: order.sender_address_uac,
        created_at: order.created_at,
        scheduled_date: order.scheduled_date,
        completed_at: order.completed_at,
        // Package details
        weight_grams: order.weight_grams,
        dimensions_cm: order.dimensions_cm,
        declared_value: order.declared_value,
        priority_level: order.priority_level,
        // Delivery requirements
        requires_signature: order.requires_signature ?? false,
        requires_id_verification: order.requires_id_verification ?? false,
        preferred_time_window: order.preferred_time_window,
        special_instructions: order.special_instructions,
        // COD info
        cod_required: order.cod_required ?? false,
        cod_amount: order.cod_amount,
        status_logs: (statusLogs || [])
          .filter(log => log.order_id === order.id)
          .map(log => ({
            status: log.new_status,
            changed_at: log.changed_at,
          })),
        proof: proofMap[order.id] || undefined,
      }));

      setDeliveries(combinedDeliveries);
    } catch (err: any) {
      console.error('Error fetching citizen deliveries:', err);
      setError(err.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, filter]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return {
    deliveries,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchDeliveries,
  };
};
