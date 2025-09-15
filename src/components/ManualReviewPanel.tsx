import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressRequestApproval } from "./AddressRequestApproval";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface ManualReviewRequest {
  id: string;
  user_id: string;
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
  justification: string;
  created_at: string;
  flagged?: boolean;
  requires_manual_review?: boolean;
}

export function ManualReviewPanel() {
  const { t } = useTranslation('address');
  const [manualReviewRequests, setManualReviewRequests] = useState<ManualReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchManualReviewRequests = async () => {
    try {
      const { data, error } = await supabase.rpc('get_review_queue');
      if (error) throw error;
      
      console.log('All review queue data:', data);
      
      // Filter to show only flagged requests and those requiring manual review
      const filteredRequests = (data || []).filter((request: any) => {
        const shouldInclude = request.flagged || request.requires_manual_review;
        console.log(`Request ${request.id}: flagged=${request.flagged}, requires_manual_review=${request.requires_manual_review}, included=${shouldInclude}`);
        return shouldInclude;
      });
      
      console.log('Filtered manual review requests:', filteredRequests);
      setManualReviewRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching manual review requests:', error);
      toast.error(t('failedToLoadRequests'));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await fetchManualReviewRequests();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>{t('loadingAddressRequests')}</div>;
  }

  if (manualReviewRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('manualReviewQueue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('noItemsRequireManualReview')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('manualReviewQueue')}
          <Badge variant="secondary" className="ml-2">
            {manualReviewRequests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AddressRequestApproval 
          requests={manualReviewRequests} 
          onUpdate={fetchManualReviewRequests} 
        />
      </CardContent>
    </Card>
  );
}