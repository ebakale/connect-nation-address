import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressRequestApproval } from "./AddressRequestApproval";
import { FlaggedAddressManager } from "./FlaggedAddressManager";
import { AutoVerificationTools } from "./AutoVerificationTools";
import { toast } from "sonner";

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

interface FlaggedAddress {
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
  flag_reason?: string;
  flagged_at?: string;
  status: string;
  justification?: string;
}

export function AddressVerificationQueue() {
  const [addressRequests, setAddressRequests] = useState<AddressRequest[]>([]);
  const [flaggedAddresses, setFlaggedAddresses] = useState<FlaggedAddress[]>([]);
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
      toast.error("Failed to load flagged addresses");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAddressRequests(), fetchFlaggedAddresses()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading verification queues...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verification Queues</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auto-verify" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auto-verify">
                Auto-Verify Tools
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Address Requests
                {addressRequests.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {addressRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="flagged" className="relative">
                Flagged Addresses
                {flaggedAddresses.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {flaggedAddresses.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto-verify" className="mt-6">
              <AutoVerificationTools onUpdate={fetchData} />
            </TabsContent>
            
            <TabsContent value="requests" className="mt-6">
              <AddressRequestApproval 
                requests={addressRequests} 
                onUpdate={fetchAddressRequests} 
              />
            </TabsContent>
            
            <TabsContent value="flagged" className="mt-6">
              <FlaggedAddressManager 
                addresses={flaggedAddresses} 
                onUpdate={fetchFlaggedAddresses} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}