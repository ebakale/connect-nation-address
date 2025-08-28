import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressRequestApproval } from "./AddressRequestApproval";
import { AutoVerificationTools } from "./AutoVerificationTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Zap } from "lucide-react";
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
}

export function AddressRequestApprovalPanel() {
  const { t } = useTranslation('addresses');
  const [addressRequests, setAddressRequests] = useState<AddressRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddressRequests = async () => {
    try {
      const { data, error } = await supabase.rpc('get_review_queue');
      if (error) throw error;
      setAddressRequests(data || []);
    } catch (error) {
      console.error('Error fetching address requests:', error);
      toast.error("Failed to load address requests");
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
    return <div>Loading address requests...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('addressRequestApproval')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests" className="relative">
                <CheckSquare className="h-4 w-4 mr-2" />
                Pending Requests
                {addressRequests.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {addressRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="auto-verify">
                <Zap className="h-4 w-4 mr-2" />
                Auto-Verification
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="requests" className="mt-6">
              <AddressRequestApproval 
                requests={addressRequests} 
                onUpdate={fetchAddressRequests} 
              />
            </TabsContent>
            
            <TabsContent value="auto-verify" className="mt-6">
              <AutoVerificationTools onUpdate={fetchData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}