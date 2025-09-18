import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaggedAddressManager } from "./FlaggedAddressManager";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface FlaggedAddress {
  id: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  address_type: string;
  description?: string;
  photo_url?: string;
  flag_reason?: string;
  flagged_at?: string;
  status: string;
  justification?: string;
  verification_analysis?: any;
  verification_recommendations?: string[];
  auto_verification_analysis?: any;
  reviewer_notes?: string;
  rejection_reason?: string;
  rejection_notes?: string;
  created_by_authority?: string;
  authority_type?: string;
  creation_source?: string;
}

export function ReviewQueuePanel() {
  const { t } = useTranslation('address');
  const [flaggedAddresses, setFlaggedAddresses] = useState<FlaggedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlaggedAddresses = async () => {
    try {
      // Get flagged requests with all verification data
      const { data, error } = await supabase
        .from('address_requests')
        .select(`
          *,
          verification_analysis,
          verification_recommendations,
          auto_verification_analysis,
          reviewer_notes,
          rejection_reason,
          rejection_notes
        `)
        .eq('flagged', true)
        .order('flagged_at', { ascending: false });
      
      if (error) throw error;
      setFlaggedAddresses(data || []);
    } catch (error) {
      console.error('Error fetching flagged addresses:', error);
      toast.error(t('failedToLoadFlagged'));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchFlaggedAddresses();
      setLoading(false);
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div>{t('loadingReviewQueue')}</div>;
  }

  return (
    <div className="space-y-6 max-w-full">
      <Card className="max-w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <Flag className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="break-words">{t('reviewQueueFlagged')}</span>
            {flaggedAddresses.length > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 flex-shrink-0"
              >
                {flaggedAddresses.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-w-full overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <FlaggedAddressManager 
              addresses={flaggedAddresses} 
              onUpdate={fetchFlaggedAddresses} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}