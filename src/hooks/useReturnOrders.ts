import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { ReturnOrder, ReturnStatus, ReturnReason, CreateReturnOrderInput } from '@/types/postalEnhanced';

export const useReturnOrders = () => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = useCallback(async (statusFilter?: ReturnStatus | ReturnStatus[]) => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('return_orders')
        .select(`
          *,
          original_order:delivery_orders(order_number, recipient_name, recipient_address_uac)
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
      
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as ReturnStatus,
        return_reason: item.return_reason as ReturnReason,
        original_order: item.original_order as ReturnOrder['original_order']
      }));
      
      setReturns(typedData);
    } catch (error) {
      console.error('Error fetching return orders:', error);
      toast.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  const createReturn = async (input: CreateReturnOrderInput): Promise<ReturnOrder | null> => {
    if (!user) return null;

    try {
      const insertData = {
        original_order_id: input.original_order_id,
        return_reason: input.return_reason,
        return_reason_details: input.return_reason_details || null,
        pickup_requested: input.pickup_requested || false,
        notes: input.notes || null,
        initiated_by: user.id,
      };

      const { data, error } = await supabase
        .from('return_orders')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      toast.success(t('returns.returnCreated'));
      await fetchReturns();
      
      return {
        ...data,
        status: data.status as ReturnStatus,
        return_reason: data.return_reason as ReturnReason
      };
    } catch (error) {
      console.error('Error creating return order:', error);
      toast.error(t('returns.returnError'));
      return null;
    }
  };

  const updateStatus = async (
    returnId: string, 
    newStatus: ReturnStatus,
    additionalData?: { processed_by?: string; received_at?: string }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'processed') {
        updateData.processed_by = user.id;
        updateData.processed_at = new Date().toISOString();
      }
      
      if (newStatus === 'received') {
        updateData.received_at = new Date().toISOString();
      }

      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      const { error } = await supabase
        .from('return_orders')
        .update(updateData)
        .eq('id', returnId);

      if (error) throw error;

      toast.success(t('status.statusUpdated'));
      await fetchReturns();
      return true;
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error(t('messages.errorUpdatingStatus'));
      return false;
    }
  };

  const generateReturnLabel = async (returnId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Generate S10 tracking number via RPC
      const { data: trackingNumber, error: rpcError } = await supabase
        .rpc('generate_s10_tracking_number');

      if (rpcError) throw rpcError;

      // Update return order with tracking number
      const { error: updateError } = await supabase
        .from('return_orders')
        .update({
          return_tracking_number: trackingNumber,
          status: 'label_generated' as ReturnStatus,
        })
        .eq('id', returnId);

      if (updateError) throw updateError;

      toast.success(t('returns.labelGenerated'));
      await fetchReturns();
      return trackingNumber;
    } catch (error) {
      console.error('Error generating return label:', error);
      toast.error(t('returns.labelError'));
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchReturns();
    }
  }, [user, fetchReturns]);

  return {
    returns,
    loading,
    fetchReturns,
    createReturn,
    updateStatus,
    generateReturnLabel,
  };
};
