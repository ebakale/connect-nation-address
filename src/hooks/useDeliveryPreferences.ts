import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { DeliveryPreferences, UpdateDeliveryPreferencesInput, TimeWindow } from '@/types/postalEnhanced';

export const useDeliveryPreferences = () => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<DeliveryPreferences[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('delivery_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        preferred_time_window: item.preferred_time_window as TimeWindow
      }));
      
      setPreferences(typedData);
    } catch (error) {
      console.error('Error fetching delivery preferences:', error);
      toast.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  const getPreferencesByUAC = async (addressUac: string): Promise<DeliveryPreferences | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('delivery_preferences')
        .select('*')
        .eq('address_uac', addressUac)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        ...data,
        preferred_time_window: data.preferred_time_window as TimeWindow
      };
    } catch (error) {
      console.error('Error fetching preferences by UAC:', error);
      return null;
    }
  };

  const savePreferences = async (input: UpdateDeliveryPreferencesInput): Promise<DeliveryPreferences | null> => {
    if (!user) return null;

    try {
      // Check if preferences exist for this address
      const existing = await getPreferencesByUAC(input.address_uac);

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('delivery_preferences')
          .update({
            preferred_time_window: input.preferred_time_window || 'any',
            safe_drop_location: input.safe_drop_location || null,
            safe_drop_authorized: input.safe_drop_authorized || false,
            alternate_recipient_name: input.alternate_recipient_name || null,
            alternate_recipient_phone: input.alternate_recipient_phone || null,
            alternate_recipient_authorized: input.alternate_recipient_authorized || false,
            hold_at_post_office: input.hold_at_post_office || false,
            allow_neighbor_delivery: input.allow_neighbor_delivery || false,
            notification_email: input.notification_email !== false,
            notification_sms: input.notification_sms !== false,
            notification_push: input.notification_push || false,
            special_instructions: input.special_instructions || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        toast.success(t('preferences.saved'));
        await fetchPreferences();
        
        return {
          ...data,
          preferred_time_window: data.preferred_time_window as TimeWindow
        };
      } else {
        // Create new
        const { data, error } = await supabase
          .from('delivery_preferences')
          .insert({
            user_id: user.id,
            address_uac: input.address_uac,
            preferred_time_window: input.preferred_time_window || 'any',
            safe_drop_location: input.safe_drop_location || null,
            safe_drop_authorized: input.safe_drop_authorized || false,
            alternate_recipient_name: input.alternate_recipient_name || null,
            alternate_recipient_phone: input.alternate_recipient_phone || null,
            alternate_recipient_authorized: input.alternate_recipient_authorized || false,
            hold_at_post_office: input.hold_at_post_office || false,
            allow_neighbor_delivery: input.allow_neighbor_delivery || false,
            notification_email: input.notification_email !== false,
            notification_sms: input.notification_sms !== false,
            notification_push: input.notification_push || false,
            special_instructions: input.special_instructions || null,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success(t('preferences.saved'));
        await fetchPreferences();
        
        return {
          ...data,
          preferred_time_window: data.preferred_time_window as TimeWindow
        };
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(t('preferences.saveError'));
      return null;
    }
  };

  const deletePreferences = async (preferencesId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('delivery_preferences')
        .delete()
        .eq('id', preferencesId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(t('preferences.deleted'));
      await fetchPreferences();
      return true;
    } catch (error) {
      console.error('Error deleting preferences:', error);
      toast.error(t('preferences.deleteError'));
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user, fetchPreferences]);

  return {
    preferences,
    loading,
    fetchPreferences,
    getPreferencesByUAC,
    savePreferences,
    deletePreferences,
  };
};
