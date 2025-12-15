import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { CODTransaction, CODStatus, CODCollectionInput } from '@/types/postalEnhanced';

export const useCODTransactions = () => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CODTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingAmount: 0,
    collectedAmount: 0,
    remittedAmount: 0,
    pendingCount: 0,
    collectedCount: 0,
  });

  const fetchTransactions = useCallback(async (statusFilter?: CODStatus | CODStatus[]) => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('cod_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        if (Array.isArray(statusFilter)) {
          query = query.in('collection_status', statusFilter);
        } else {
          query = query.eq('collection_status', statusFilter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        collection_status: item.collection_status as CODStatus
      }));
      
      setTransactions(typedData);

      // Calculate stats
      const pending = typedData.filter(t => t.collection_status === 'pending');
      const collected = typedData.filter(t => t.collection_status === 'collected');
      const remitted = typedData.filter(t => t.collection_status === 'remitted');

      setStats({
        pendingAmount: pending.reduce((sum, t) => sum + Number(t.amount), 0),
        collectedAmount: collected.reduce((sum, t) => sum + Number(t.amount), 0),
        remittedAmount: remitted.reduce((sum, t) => sum + Number(t.amount), 0),
        pendingCount: pending.length,
        collectedCount: collected.length,
      });
    } catch (error) {
      console.error('Error fetching COD transactions:', error);
      toast.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  const collectPayment = async (input: CODCollectionInput): Promise<boolean> => {
    if (!user) return false;

    try {
      // Generate receipt number
      const receiptNumber = `COD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { error } = await supabase
        .from('cod_transactions')
        .update({
          collection_status: 'collected' as CODStatus,
          payment_method: input.payment_method,
          collected_by: user.id,
          collected_at: new Date().toISOString(),
          receipt_number: receiptNumber,
          notes: input.notes || null,
        })
        .eq('order_id', input.order_id);

      if (error) throw error;

      toast.success(t('cod.paymentCollected'));
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error collecting payment:', error);
      toast.error(t('cod.collectionError'));
      return false;
    }
  };

  const remitFunds = async (
    transactionIds: string[],
    remittanceReference: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cod_transactions')
        .update({
          collection_status: 'remitted' as CODStatus,
          remitted_to: user.id,
          remittance_date: new Date().toISOString().split('T')[0],
          remittance_reference: remittanceReference,
        })
        .in('id', transactionIds);

      if (error) throw error;

      toast.success(t('cod.fundsRemitted'));
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error remitting funds:', error);
      toast.error(t('cod.remittanceError'));
      return false;
    }
  };

  const getTransactionByOrderId = async (orderId: string): Promise<CODTransaction | null> => {
    try {
      const { data, error } = await supabase
        .from('cod_transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows
        throw error;
      }
      
      return {
        ...data,
        collection_status: data.collection_status as CODStatus
      };
    } catch (error) {
      console.error('Error fetching COD transaction:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  return {
    transactions,
    loading,
    stats,
    fetchTransactions,
    collectPayment,
    remitFunds,
    getTransactionByOrderId,
  };
};
