import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, FileText, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { AddressResubmissionDialog } from "./AddressResubmissionDialog";

interface RejectedAddress {
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
  justification: string;
  rejection_reason: string;
  rejection_notes?: string;
  rejected_by: string;
  rejected_at: string;
  created_at: string;
}

interface RejectedAddressesPanelProps {
  onUpdate?: () => void;
  citizenView?: boolean;
}

// Helper function to translate AI analysis comments
const translateAIComment = (comment: string, t: any): string => {
  // Define mapping patterns for common AI analysis comments
  const patterns = [
    { 
      pattern: /Basic rule-based analysis \(AI analysis unavailable\)/i, 
      key: 'aiAnalysisComments.basicRuleAnalysisUnavailable' 
    },
    { 
      pattern: /Coordinate validity check completed/i, 
      key: 'aiAnalysisComments.coordinateValidityCheck' 
    },
    { 
      pattern: /Address consistency analysis performed/i, 
      key: 'aiAnalysisComments.addressConsistencyAnalysis' 
    },
    { 
      pattern: /Completeness assessment finished/i, 
      key: 'aiAnalysisComments.completenessAssessment' 
    },
    { 
      pattern: /Fraud risk evaluation conducted/i, 
      key: 'aiAnalysisComments.fraudRiskEvaluation' 
    },
    { 
      pattern: /Low quality data detected/i, 
      key: 'aiAnalysisComments.lowQualityData' 
    },
    { 
      pattern: /High confidence rating assigned/i, 
      key: 'aiAnalysisComments.highConfidenceRating' 
    },
    { 
      pattern: /Moderate confidence rating assigned/i, 
      key: 'aiAnalysisComments.moderateConfidenceRating' 
    },
    { 
      pattern: /Low confidence rating assigned/i, 
      key: 'aiAnalysisComments.lowConfidenceRating' 
    }
  ];

  // Try to match and translate known patterns
  for (const { pattern, key } of patterns) {
    if (pattern.test(comment)) {
      return t(key);
    }
  }

  // Return original comment if no pattern matches
  return comment;
};

export function RejectedAddressesPanel({ onUpdate, citizenView = false }: RejectedAddressesPanelProps) {
  const { t } = useTranslation('address');
  const { roleMetadata, loading: roleLoading } = useUserRole();
  const [rejectedAddresses, setRejectedAddresses] = useState<RejectedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [resubmissionDialog, setResubmissionDialog] = useState<{
    open: boolean;
    address: RejectedAddress | null;
  }>({ open: false, address: null });

  // Get geographical scope from role metadata
  const geographicScope = roleMetadata.find(m => 
    m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'city' || m.scope_type === 'geographic'
  );

  const fetchRejectedAddresses = async () => {
    try {
      // Build query with geographical scope filter
      let query = supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'rejected');

      // For citizen view, filter by current user
      if (citizenView) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('requester_id', user.id);
        }
      } else {
        // Apply geographical scope filter for admin view
        if (geographicScope) {
          if (geographicScope.scope_type === 'city') {
            query = query.ilike('city', geographicScope.scope_value);
          } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
            query = query.ilike('region', geographicScope.scope_value);
          } else if (geographicScope.scope_type === 'geographic') {
            query = query.or(`city.ilike.${geographicScope.scope_value},region.ilike.${geographicScope.scope_value}`);
          }
        }
      }

      const { data, error } = await query.order('rejected_at', { ascending: false });
      if (error) throw error;
      setRejectedAddresses((data || []) as RejectedAddress[]);
    } catch (error) {
      console.error('Error fetching rejected addresses:', error);
      toast.error(t('failedToLoadRejectedAddresses'));
    }
  };

  const handleResubmit = (address: RejectedAddress) => {
    setResubmissionDialog({
      open: true,
      address: address
    });
  };

  const handleResubmissionSuccess = async () => {
    await fetchRejectedAddresses();
    onUpdate?.();
    toast.success(t('resubmissionSuccessful'));
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
    if (!roleLoading) {
      fetchData();
    }
  }, [roleLoading, geographicScope?.scope_type, geographicScope?.scope_value]);

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
        <h3 className="text-base font-medium">{t('rejectedAddressesCount', { count: rejectedAddresses.length })}</h3>
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
                  <Badge variant="destructive" className="w-fit text-xs">{t('rejectedLabel')}</Badge>
                  
                  <CardTitle className="text-sm flex items-center gap-2">
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
                  
                  {/* Compact view when collapsed */}
                  {!isExpanded && (
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         {t('rejectedOn', { date: new Date(address.rejected_at).toLocaleDateString() })}
                       </span>
                    </div>
                  )}
                  
                  {/* Full date info when expanded */}
                  {isExpanded && (
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                     <strong className="text-xs">{t('descriptionLabel')}:</strong>
                     <p className="text-xs text-muted-foreground mt-1">{address.description}</p>
                   </div>
                 )}

                 <div>
                   <strong className="text-xs">{t('originalJustification')}:</strong>
                   <p className="text-xs text-muted-foreground mt-1">{translateAIComment(address.justification, t)}</p>
                 </div>

                <div className="bg-destructive/10 p-3 rounded-lg">
                   <div className="flex items-center gap-2 mb-2">
                     <AlertTriangle className="h-4 w-4 text-destructive" />
                     <strong className="text-xs text-destructive">{t('rejectionReason')}</strong>
                   </div>
                   <p className="text-xs text-destructive">{translateAIComment(address.rejection_reason, t)}</p>
                   {address.rejection_notes && (
                     <div className="mt-2">
                       <strong className="text-xs text-destructive">{t('additionalNotes')}:</strong>
                       <p className="text-xs text-destructive/80 mt-1">{translateAIComment(address.rejection_notes, t)}</p>
                     </div>
                   )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                     onClick={(e) => {
                       e.stopPropagation();
                       handleResubmit(address);
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

      <AddressResubmissionDialog
        open={resubmissionDialog.open}
        onOpenChange={(open) => setResubmissionDialog({ open, address: null })}
        rejectedAddress={resubmissionDialog.address}
        onSuccess={handleResubmissionSuccess}
      />
    </div>
  );
}