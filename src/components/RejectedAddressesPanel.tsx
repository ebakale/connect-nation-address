import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, FileText, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface RejectedAddress {
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
  justification: string;
  rejection_reason: string;
  rejection_notes?: string;
  rejected_by: string;
  rejected_at: string;
  created_at: string;
}

interface RejectedAddressesPanelProps {
  onUpdate?: () => void;
}

export function RejectedAddressesPanel({ onUpdate }: RejectedAddressesPanelProps) {
  const { t } = useTranslation('address');
  const [rejectedAddresses, setRejectedAddresses] = useState<RejectedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const fetchRejectedAddresses = async () => {
    try {
      const { data, error } = await supabase.rpc('get_rejected_addresses_queue');
      if (error) throw error;
      setRejectedAddresses(data || []);
    } catch (error) {
      console.error('Error fetching rejected addresses:', error);
      toast.error(t('failedToLoadRejectedAddresses'));
    }
  };

  const handleResubmit = async (originalRequestId: string) => {
    try {
      // For now, just show a message - this would need to be implemented
      toast.info(t('resubmissionComingSoon'));
    } catch (error) {
      console.error('Error resubmitting address:', error);
      toast.error(t('failedToResubmitAddress'));
    }
  };

  const toggleCardExpansion = (addressId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(addressId)) {
        newSet.delete(addressId);
      } else {
        newSet.add(addressId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchRejectedAddresses();
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">{t('loadingRejectedAddresses')}</div>;
  }

  if (rejectedAddresses.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">{t('noRejectedAddresses')}</h3>
        <p>{t('allRequestsApprovedOrPending')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('rejectedAddressesCount', { count: rejectedAddresses.length })}</h3>
        <Button onClick={fetchRejectedAddresses} variant="outline" size="sm">
          {t('refresh')}
        </Button>
      </div>

      {rejectedAddresses.map((address) => {
        const isExpanded = expandedCards.has(address.id);
        return (
          <Card key={address.id} className="border-l-4 border-l-destructive transition-all duration-200 hover:shadow-md">
            <CardHeader 
              className="pb-3 cursor-pointer transition-colors duration-200 hover:bg-muted/50"
              onClick={() => toggleCardExpansion(address.id)}
            >
              <div>
                <div className="space-y-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {address.street}, {address.city}
                    <div className="transition-transform duration-200 ml-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardTitle>
                  
                  <Badge variant="destructive" className="w-fit">{t('rejectedLabel')}</Badge>
                  
                  {/* Compact view when collapsed */}
                  {!isExpanded && (
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         {t('rejectedOn', { date: new Date(address.rejected_at).toLocaleDateString() })}
                       </span>
                    </div>
                  )}
                  
                  {/* Full date info when expanded */}
                  {isExpanded && (
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         {t('rejectedOn', { date: new Date(address.rejected_at).toLocaleDateString() })}
                       </span>
                       <span className="flex items-center gap-1">
                         <User className="h-3 w-3" />
                         {t('originalOn', { date: new Date(address.created_at).toLocaleDateString() })}
                       </span>
                     </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="space-y-4 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <strong>{t('addressTypeLabel')}:</strong> {address.address_type}
                   </div>
                   <div>
                     <strong>{t('buildingLabel')}:</strong> {address.building || t('notApplicable')}
                   </div>
                   <div>
                     <strong>{t('coordinatesLabel')}:</strong> {address.latitude}, {address.longitude}
                   </div>
                   <div>
                     <strong>{t('regionLabel')}:</strong> {address.region}, {address.country}
                   </div>
                 </div>

                 {address.description && (
                   <div>
                     <strong className="text-sm">{t('descriptionLabel')}:</strong>
                     <p className="text-sm text-muted-foreground mt-1">{address.description}</p>
                   </div>
                 )}

                 <div>
                   <strong className="text-sm">{t('originalJustification')}:</strong>
                   <p className="text-sm text-muted-foreground mt-1">{address.justification}</p>
                 </div>

                <div className="bg-destructive/10 p-3 rounded-lg">
                   <div className="flex items-center gap-2 mb-2">
                     <AlertTriangle className="h-4 w-4 text-destructive" />
                     <strong className="text-sm text-destructive">{t('rejectionReason')}</strong>
                   </div>
                   <p className="text-sm text-destructive">{address.rejection_reason}</p>
                   {address.rejection_notes && (
                     <div className="mt-2">
                       <strong className="text-sm text-destructive">{t('additionalNotes')}:</strong>
                       <p className="text-sm text-destructive/80 mt-1">{address.rejection_notes}</p>
                     </div>
                   )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResubmit(address.id);
                    }}
                    className="text-xs"
                  >
                     <FileText className="h-3 w-3 mr-1" />
                     {t('guideResubmission')}
                   </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}