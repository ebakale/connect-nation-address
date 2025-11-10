import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressRequestApproval } from "./AddressRequestApproval";
import { AutoVerificationTools } from "./AutoVerificationTools";
import { RejectedAddressesPanel } from "./RejectedAddressesPanel";
import { BusinessAddressRequestCard } from "./BusinessAddressRequestCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Zap, XCircle, AlertTriangle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface AddressRequest {
  id: string;
  requester_id?: string;
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
  const { roleMetadata, loading: roleLoading } = useUserRole();
  const [addressRequests, setAddressRequests] = useState<AddressRequest[]>([]);
  const [manualReviewRequests, setManualReviewRequests] = useState<AddressRequest[]>([]);
  const [businessRequests, setBusinessRequests] = useState<AddressRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Get geographical scope from role metadata
  const geographicScope = roleMetadata.find(m => 
    m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'city' || m.scope_type === 'geographic'
  );

  // Check if user has no geographical restriction (admin or national scope)
  const hasNationalScope = roleMetadata.length === 0 || !geographicScope;

  const fetchAddressRequests = async () => {
    try {
      // Build query with geographical scope filter
      let query = supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'pending');

      // Apply geographical scope filter for non-national scope users
      if (!hasNationalScope && geographicScope) {
        if (geographicScope.scope_type === 'city') {
          query = query.ilike('city', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          query = query.ilike('region', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'geographic') {
          // Apply scope to either city or region depending on how it's stored
          query = query.or(`city.ilike.${geographicScope.scope_value},region.ilike.${geographicScope.scope_value}`);
        }
      } else if (!hasNationalScope && !geographicScope) {
        // No scope defined for non-national user - return empty to be safe
        console.error('No geographical scope defined for registrar');
        setAddressRequests([]);
        setManualReviewRequests([]);
        return;
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      // Filter requests for different tabs
      const allRequests = (data || []) as AddressRequest[];
      
      // Separate business requests (including commercial and institutional)
      const businessData = allRequests.filter((request) => 
        request.address_type === 'business' || 
        request.address_type === 'commercial' || 
        request.address_type === 'institutional'
      );
      
      // Regular address requests (non-business, not flagged)
      const filteredRequests = allRequests.filter((request) => 
        request.address_type !== 'business' &&
        request.address_type !== 'commercial' &&
        request.address_type !== 'institutional' &&
        !request.flagged
      );
      
      // Manual review requests (non-business, flagged only)
      const manualReviewData = allRequests.filter((request) => 
        request.address_type !== 'business' &&
        request.address_type !== 'commercial' &&
        request.address_type !== 'institutional' &&
        request.flagged
      );
      
      setAddressRequests(filteredRequests);
      setManualReviewRequests(manualReviewData);
      setBusinessRequests(businessData);
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
    if (!roleLoading) {
      fetchData();
    }
  }, [roleLoading, geographicScope?.scope_type, geographicScope?.scope_value]);

  if (loading) {
    return <div>{t('loadingAddressRequests')}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('addressRequestApprovalPanel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
              <TabsTrigger value="requests" className="relative flex-col sm:flex-row text-xs sm:text-sm">
                <CheckSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('pendingRequests')}</span>
                <span className="sm:hidden">{t('pendingShort')}</span>
                {addressRequests.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-0 sm:ml-2 mt-1 sm:mt-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs"
                  >
                    {addressRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="manual-review" className="relative flex-col sm:flex-row text-xs sm:text-sm">
                <AlertTriangle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('manualReview')}</span>
                <span className="sm:hidden">{t('reviewShort')}</span>
                {manualReviewRequests.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-0 sm:ml-2 mt-1 sm:mt-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs"
                  >
                    {manualReviewRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="auto-verify" className="flex-col sm:flex-row text-xs sm:text-sm">
                <Zap className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('autoVerification')}</span>
                <span className="sm:hidden">{t('autoShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="relative flex-col sm:flex-row text-xs sm:text-sm">
                <Building2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('businessRequests')}</span>
                <span className="sm:hidden">{t('business')}</span>
                {businessRequests.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-0 sm:ml-2 mt-1 sm:mt-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs bg-purple-100 text-purple-800"
                  >
                    {businessRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex-col sm:flex-row text-xs sm:text-sm">
                <XCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('rejected')}</span>
                <span className="sm:hidden">{t('rejectedShort')}</span>
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
            
            <TabsContent value="business" className="mt-6">
              {businessRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('noBusinessRequests')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {businessRequests.map((request) => (
                    <BusinessAddressRequestCard
                      key={request.id}
                      request={request}
                      onUpdate={fetchAddressRequests}
                    />
                  ))}
                </div>
              )}
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