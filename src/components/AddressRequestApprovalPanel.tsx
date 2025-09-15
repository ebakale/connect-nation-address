import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressRequestApproval } from "./AddressRequestApproval";
import { AutoVerificationTools } from "./AutoVerificationTools";
import { RejectedAddressesPanel } from "./RejectedAddressesPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Zap, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface AddressRequest {
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
  flag_reason?: string;
  flagged_by?: string;
  flagged_at?: string;
  requires_manual_review?: boolean;
  verification_analysis?: any;
  verification_recommendations?: string[];
}

export function AddressRequestApprovalPanel() {
  const { t } = useTranslation('address');
  const [addressRequests, setAddressRequests] = useState<AddressRequest[]>([]);
  const [manualReviewRequests, setManualReviewRequests] = useState<AddressRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddressRequests = async () => {
    try {
      const { data, error } = await supabase.rpc('get_review_queue');
      if (error) throw error;
      
      // Filter requests for different tabs
      const allRequests = data || [];
      const filteredRequests = allRequests.filter((request: any) => 
        !request.flagged && !request.requires_manual_review
      );
      const manualReviewData = allRequests.filter((request: any) => 
        request.flagged || request.requires_manual_review
      );
      
      setAddressRequests(filteredRequests);
      setManualReviewRequests(manualReviewData);
    } catch (error) {
      console.error('Error fetching address requests:', error);
      toast.error(t('failedToLoadRequests'));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await fetchAddressRequests();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>{t('loadingAddressRequests')}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('addressRequestApprovalPanel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="requests" className="relative">
                <CheckSquare className="h-4 w-4 mr-2" />
                {t('pendingRequests')}
                {addressRequests.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {addressRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="manual-review" className="relative">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t('manualReview')}
                {manualReviewRequests.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {manualReviewRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="auto-verify">
                <Zap className="h-4 w-4 mr-2" />
                {t('autoVerification')}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="requests" className="mt-6">
              <AddressRequestApproval 
                requests={addressRequests} 
                onUpdate={fetchAddressRequests} 
              />
            </TabsContent>
            
            <TabsContent value="manual-review" className="mt-6">
              <AddressRequestApproval 
                requests={manualReviewRequests} 
                onUpdate={fetchAddressRequests} 
              />
            </TabsContent>
            
            <TabsContent value="auto-verify" className="mt-6">
              <AutoVerificationTools onUpdate={fetchData} />
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              <RejectedAddressesPanel onUpdate={fetchData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}