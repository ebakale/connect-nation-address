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

  const fetchRequests = useCallback(async (statusFilter?: PickupStatus | PickupStatus[]) => {
    if (!user) return;
    setLoading(true);

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

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  return {
    requests,
    loading,
    fetchRequests,
    createRequest,
    assignRequest,
    updateStatus,
  };
};
