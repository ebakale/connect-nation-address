import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryOrder, DeliveryStatus, CreateDeliveryOrderInput, DeliveryStats } from '@/types/postal';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from './useUserRole';

export const useDeliveryOrders = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const { user } = useAuth();
  const { roleMetadata, isPostalSupervisor, isPostalDispatcher, isAdmin } = useUserRole();

  // Get geographic scope for postal dispatchers/supervisors
  const getGeographicFilter = useCallback(() => {
    // Admins see all
    if (isAdmin) return null;
    
    // Find geographic scope from metadata
    const geoScope = roleMetadata.find(m => 
      m.scope_type === 'region' || m.scope_type === 'city' || m.scope_type === 'province'
    );
    
    return geoScope || null;
  }, [roleMetadata, isAdmin]);

  const fetchOrders = useCallback(async (statusFilter?: DeliveryStatus | DeliveryStatus[]) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('delivery_orders')
        .select(`
          *,
          delivery_assignments (
            id,
            agent_id,
            assigned_at,
            acknowledged_at,
            started_at,
            estimated_delivery_time,
            route_sequence,
            notes,
            assigned_by
          )
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter) {
        if (Array.isArray(statusFilter)) {
          query = query.in('status', statusFilter);
        } else {
          query = query.eq('status', statusFilter);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let filteredData = data || [];
      const geoFilter = getGeographicFilter();
      
      // Apply geographic filtering for dispatchers/supervisors
      if (geoFilter && (isPostalDispatcher || isPostalSupervisor)) {
        // Get UACs from orders
        const uacs = filteredData.map(o => o.recipient_address_uac).filter(Boolean);
        
        if (uacs.length > 0) {
          // Look up addresses by UAC to get their region/city
          const { data: addresses } = await supabase
            .from('addresses')
            .select('uac, city, region')
            .in('uac', uacs);
          
          // Build a map of UAC to location
          const uacLocationMap = new Map<string, { city?: string; region?: string }>();
          addresses?.forEach(addr => {
            uacLocationMap.set(addr.uac, { city: addr.city, region: addr.region });
          });
          
          // Filter orders by geographic scope
          filteredData = filteredData.filter(order => {
            const location = uacLocationMap.get(order.recipient_address_uac);
            if (!location) return true; // Include if no address data found
            
            if (geoFilter.scope_type === 'city') {
              return location.city?.toLowerCase() === geoFilter.scope_value.toLowerCase();
            } else if (geoFilter.scope_type === 'region' || geoFilter.scope_type === 'province') {
              return location.region?.toLowerCase() === geoFilter.scope_value.toLowerCase();
            }
            return true;
          });
        }
      }
      
      setOrders(filteredData as DeliveryOrder[]);
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load delivery orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, getGeographicFilter, isPostalDispatcher, isPostalSupervisor]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('delivery_orders')
        .select('status, scheduled_date, completed_at');
      
      if (error) throw error;
      
      const orders = data || [];
      const todayOrders = orders.filter(o => 
        o.scheduled_date === today || 
        (o.completed_at && o.completed_at.startsWith(today))
      );
      
      const stats: DeliveryStats = {
        total_orders: orders.length,
        pending_intake: orders.filter(o => o.status === 'pending_intake').length,
        ready_for_assignment: orders.filter(o => o.status === 'ready_for_assignment').length,
        assigned: orders.filter(o => o.status === 'assigned').length,
        out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        failed: orders.filter(o => o.status === 'failed_delivery' || o.status === 'address_not_found').length,
        returned: orders.filter(o => o.status === 'returned_to_sender').length,
        today_deliveries: todayOrders.length,
        today_completed: todayOrders.filter(o => o.status === 'delivered').length,
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  const createOrder = async (input: CreateDeliveryOrderInput): Promise<DeliveryOrder | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('delivery_orders')
        .insert({
          ...input,
          created_by: user.id,
          order_number: '', // Will be auto-generated by trigger
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Delivery order created successfully',
      });
      
      await fetchOrders();
      await fetchStats();
      
      return data as DeliveryOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create delivery order',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: DeliveryStatus,
    reason?: string,
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      // Set completion info if delivered or final status
      if (['delivered', 'failed_delivery', 'address_not_found', 'returned_to_sender', 'cancelled'].includes(newStatus)) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
      }
      
      const { error } = await supabase
        .from('delivery_orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Log the status change with reason/notes
      if (reason || notes) {
        await supabase
          .from('delivery_status_logs')
          .insert({
            order_id: orderId,
            new_status: newStatus,
            changed_by: user.id,
            reason,
            notes,
          });
      }
      
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      
      await fetchOrders();
      await fetchStats();
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAsReadyForAssignment = async (orderId: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'ready_for_assignment');
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchStats();
    }
  }, [user, fetchOrders, fetchStats]);

  return {
    orders,
    loading,
    stats,
    fetchOrders,
    fetchStats,
    createOrder,
    updateOrderStatus,
    markAsReadyForAssignment,
  };
};
