import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { PickupRequest, PickupStatus, CreatePickupRequestInput, TimeWindow } from '@/types/postalEnhanced';

export const usePickupRequests = () => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchParams, setLastFetchParams] = useState<{
    statusFilter?: PickupStatus | PickupStatus[];
    agentId?: string;
  }>({});

  const fetchRequests = useCallback(async (
    statusFilter?: PickupStatus | PickupStatus[],
    agentId?: string
  ) => {
    if (!user) return;
    setLoading(true);
    setLastFetchParams({ statusFilter, agentId });

    try {
      let query = supabase
        .from('pickup_requests')
        .select('*')
        .order('preferred_date', { ascending: true });

      // Apply status filter
      if (statusFilter) {
        if (Array.isArray(statusFilter)) {
          query = query.in('status', statusFilter);
        } else {
          query = query.eq('status', statusFilter);
        }
      }

      // Filter by assigned agent
      if (agentId) {
        query = query.eq('assigned_agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Cast the data properly
      const typedData = (data || []).map(item => ({
        ...item,
        preferred_time_window: item.preferred_time_window as TimeWindow,
        status: item.status as PickupStatus
      }));
      
      setRequests(typedData);
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
      toast.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  const fetchAgentPickups = useCallback(async (statusFilter?: PickupStatus | PickupStatus[]) => {
    if (!user) return;
    await fetchRequests(statusFilter, user.id);
  }, [user, fetchRequests]);

  // Real-time subscription for pickup request updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('pickup-requests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickup_requests'
        },
        (payload) => {
          console.log('Pickup request change detected:', payload.eventType);
          // Re-fetch with the last used parameters
          fetchRequests(lastFetchParams.statusFilter, lastFetchParams.agentId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchRequests, lastFetchParams]);

  const createRequest = async (input: CreatePickupRequestInput): Promise<PickupRequest | null> => {
    if (!user) return null;

    try {
      const insertData = {
        requester_id: user.id,
        pickup_address_uac: input.pickup_address_uac,
        contact_name: input.contact_name,
        contact_phone: input.contact_phone || null,
        contact_email: input.contact_email || null,
        package_description: input.package_description || null,
        package_count: input.package_count || 1,
        estimated_weight_grams: input.estimated_weight_grams || null,
        preferred_date: input.preferred_date,
        preferred_time_window: input.preferred_time_window || 'any',
        pickup_notes: input.pickup_notes || null,
      };

      const { data, error } = await supabase
        .from('pickup_requests')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      toast.success(t('pickup.requestCreated'));
      fetchRequests(); // Don't await - let dialog close immediately
      
      return {
        ...data,
        preferred_time_window: data.preferred_time_window as TimeWindow,
        status: data.status as PickupStatus
      };
    } catch (error) {
      console.error('Error creating pickup request:', error);
      toast.error(t('pickup.requestError'));
      return null;
    }
  };

  const assignRequest = async (requestId: string, agentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('pickup_requests')
        .update({
          assigned_agent_id: agentId,
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
          status: 'assigned' as PickupStatus,
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(t('pickup.assignmentSuccess'));
      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error assigning pickup request:', error);
      toast.error(t('messages.errorAssigning'));
      return false;
    }
  };

  const updateStatus = async (
    requestId: string, 
    newStatus: PickupStatus, 
    proofPhotoUrl?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        if (proofPhotoUrl) {
          updateData.proof_photo_url = proofPhotoUrl;
        }
      }

      const { error } = await supabase
        .from('pickup_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast.success(t('status.statusUpdated'));
      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error updating pickup status:', error);
      toast.error(t('messages.errorUpdatingStatus'));
      return false;
    }
  };

  // Statuses that allow editing (full or restricted)
  const EDITABLE_STATUSES: PickupStatus[] = ['pending', 'scheduled', 'assigned'];
  // Statuses that allow cancellation
  const CANCELLABLE_STATUSES: PickupStatus[] = ['pending', 'scheduled', 'assigned', 'en_route'];

  const updateRequest = async (
    requestId: string,
    updates: Partial<CreatePickupRequestInput>,
    currentStatus?: PickupStatus
  ): Promise<boolean> => {
    if (!user) return false;

    // Validate status allows editing
    if (currentStatus && !EDITABLE_STATUSES.includes(currentStatus)) {
      toast.error(t('pickup.cannotEditCompleted'));
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .update(updates)
        .eq('id', requestId)
        .eq('requester_id', user.id)
        .in('status', EDITABLE_STATUSES)
        .select();

      if (error) throw error;

      // Check if any rows were actually updated (RLS may have blocked the update)
      if (!data || data.length === 0) {
        toast.error(t('pickup.updateFailed'));
        return false;
      }

      toast.success(t('pickup.requestUpdated'));
      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error updating pickup request:', error);
      toast.error(t('pickup.updateError'));
      return false;
    }
  };

  const cancelRequest = async (
    requestId: string,
    currentStatus?: PickupStatus
  ): Promise<boolean> => {
    if (!user) return false;

    // Validate status allows cancellation
    if (currentStatus && !CANCELLABLE_STATUSES.includes(currentStatus)) {
      toast.error(t('pickup.cannotCancelCompleted'));
      return false;
    }

    try {
      let query = supabase
        .from('pickup_requests')
        .update({ status: 'cancelled' as PickupStatus })
        .eq('id', requestId)
        .eq('requester_id', user.id);

      // Allow cancel for cancellable statuses
      query = query.in('status', CANCELLABLE_STATUSES);

      const { error } = await query;

      if (error) throw error;

      toast.success(t('pickup.requestCancelled'));
      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error cancelling pickup request:', error);
      toast.error(t('pickup.cancelError'));
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  return {
    requests,
    loading,
    fetchRequests,
    fetchAgentPickups,
    createRequest,
    assignRequest,
    updateStatus,
    updateRequest,
    cancelRequest,
  };
};
