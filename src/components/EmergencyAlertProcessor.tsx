import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const EmergencyAlertProcessor = () => {
  const { user } = useAuth();

  const processEmergencyAlert = async (alertData: {
    message: string;
    latitude: number;
    longitude: number;
    emergencyType?: string;
    contactInfo?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-emergency-alert', {
        body: {
          ...alertData,
          reporterId: user?.id,
          language: 'en'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing emergency alert:', error);
      throw error;
    }
  };

  return { processEmergencyAlert };
};

export default EmergencyAlertProcessor;