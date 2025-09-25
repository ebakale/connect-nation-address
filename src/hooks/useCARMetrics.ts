import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CARMetrics {
  totalCitizenAddresses: number;
  pendingVerificationAddresses: number;
  confirmedAddresses: number;
  rejectedAddresses: number;
  duplicatePersonRecords: number;
  averageVerificationTimeHours: number;
  totalPersonRecords: number;
  addressesRequiringReview: number;
}

export function useCARMetrics(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<CARMetrics>({
    totalCitizenAddresses: 0,
    pendingVerificationAddresses: 0,
    confirmedAddresses: 0,
    rejectedAddresses: 0,
    duplicatePersonRecords: 0,
    averageVerificationTimeHours: 0,
    totalPersonRecords: 0,
    addressesRequiringReview: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      await supabase.rpc('update_car_quality_metrics');

      const [{ data: carData }, { count: personCount }, { count: reviewCount }] = await Promise.all([
        supabase
          .from('car_quality_metrics')
          .select('*')
          .order('date_measured', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('person').select('*', { count: 'exact', head: true }),
        supabase.from('citizen_address_manual_review_queue').select('*', { count: 'exact', head: true }),
      ]);

      setMetrics({
        totalCitizenAddresses: carData?.total_citizen_addresses || 0,
        pendingVerificationAddresses: carData?.pending_verification_addresses || 0,
        confirmedAddresses: carData?.confirmed_addresses || 0,
        rejectedAddresses: carData?.rejected_addresses || 0,
        duplicatePersonRecords: carData?.duplicate_person_records || 0,
        averageVerificationTimeHours: carData?.average_verification_time_hours || 0,
        totalPersonRecords: personCount || 0,
        addressesRequiringReview: reviewCount || 0,
      });
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { metrics, loading, refresh };
}
