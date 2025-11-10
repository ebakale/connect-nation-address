import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MapPin, Building2, Phone, Mail, Users, Clock, Accessibility, Eye, Edit, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { DuplicateAddressDialog } from "./DuplicateAddressDialog";
import { AddressMapDialog } from "./AddressMapDialog";

interface BusinessAddressRequest {
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
  verification_analysis?: any;
}

interface BusinessAddressRequestCardProps {
  request: BusinessAddressRequest;
  onUpdate: () => void;
}

export function BusinessAddressRequestCard({ request, onUpdate }: BusinessAddressRequestCardProps) {
  const { t } = useTranslation(['address', 'business']);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<any>(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  const orgData = request.verification_analysis?.organization || {};
  
  // Check if business metadata is complete
  const hasCompleteMetadata = 
    orgData && 
    orgData.organization_name && 
    orgData.organization_name.trim() !== '' &&
    orgData.business_category &&
    orgData.business_category.trim() !== '';

  const handleApprove = async (ignoreDuplicates = false) => {
    // Validate metadata before attempting approval
    if (!hasCompleteMetadata) {
      toast.error(t('business:incompleteBusinessMetadata'));
      return;
    }
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('approve_business_address_request', {
        p_request_id: request.id,
        p_ignore_duplicates: ignoreDuplicates
      });

      if (error) throw error;

      const result = data as { 
        success: boolean; 
        error?: string; 
        address_id?: string;
        requires_review?: boolean;
        duplicate_analysis?: any;
      };
      
      if (result?.requires_review && result?.duplicate_analysis) {
        setDuplicateAnalysis(result.duplicate_analysis);
        setShowDuplicateDialog(true);
        setIsProcessing(false);
        return;
      }

      if (result?.success) {
        toast.success(t('business:approvalSuccess'));
        onUpdate();
      } else {
        toast.error(result?.error || t('address:approvalFailed'));
      }
    } catch (error) {
      console.error('Error approving business address:', error);
      toast.error(t('address:approvalError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedWithDuplicates = () => {
    setShowDuplicateDialog(false);
    handleApprove(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error(t('pleaseProvideReason'));
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('reject_address_request_with_feedback', {
        p_request_id: request.id,
        p_rejection_reason: rejectionReason
      });

      if (error) throw error;

      toast.success(t('requestRejected'));
      setShowRejectDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(t('rejectionError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoVerify = async () => {
    setIsAutoVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-verify-address', {
        body: { requestId: request.id, mode: 'single' }
      });

      if (error) throw error;

      toast.success(t('address:autoVerificationComplete'));
      onUpdate(); // Refresh to show updated analysis
    } catch (error) {
      console.error('Error auto-verifying:', error);
      toast.error(t('address:autoVerificationError'));
    } finally {
      setIsAutoVerifying(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg break-words">
                  {orgData.organization_name || t('unknownBusiness')}
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {t('business')}
                </Badge>
                {orgData.business_category && (
                  <Badge variant="outline">{orgData.business_category}</Badge>
                )}
                {orgData.is_public_service && (
                  <Badge variant="default">{t('publicService')}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm break-words">
                  {request.street}, {request.city}, {request.region}
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Business Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {orgData.primary_contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{orgData.primary_contact_phone}</span>
              </div>
            )}
            {orgData.primary_contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{orgData.primary_contact_email}</span>
              </div>
            )}
            {orgData.employee_count && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{orgData.employee_count} {t('employees')}</span>
              </div>
            )}
            {orgData.customer_capacity && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{t('capacity')}: {orgData.customer_capacity}</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {orgData.parking_available && (
              <Badge variant="outline" className="text-xs">
                🅿️ {t('parking')} {orgData.parking_capacity && `(${orgData.parking_capacity})`}
              </Badge>
            )}
            {orgData.wheelchair_accessible && (
              <Badge variant="outline" className="text-xs">
                <Accessibility className="h-3 w-3 mr-1" />
                {t('accessible')}
              </Badge>
            )}
            {orgData.appointment_required && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {t('appointmentRequired')}
              </Badge>
            )}
          </div>

          {/* Services */}
          {orgData.services_offered && orgData.services_offered.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('servicesOffered')}:</p>
              <div className="flex flex-wrap gap-1">
                {orgData.services_offered.map((service: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Justification */}
          {request.justification && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">{t('justification')}:</p>
              <p className="text-sm text-muted-foreground break-words">{request.justification}</p>
            </div>
          )}

          {/* Verification Analysis */}
          {request.verification_analysis && Object.keys(request.verification_analysis).length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
                {t('address:verificationAnalysis')}
              </p>
              
              {/* Overall Score */}
              {request.verification_analysis.overallScore !== undefined && (
                <div className="mb-2">
                  <Badge 
                    variant={
                      request.verification_analysis.overallScore >= 80 ? 'default' :
                      request.verification_analysis.overallScore >= 50 ? 'secondary' : 'destructive'
                    }
                  >
                    {t('address:score')}: {request.verification_analysis.overallScore.toFixed(0)}%
                  </Badge>
                </div>
              )}

              {/* Quality Metrics */}
              {(request.verification_analysis.coordinateValidity !== undefined || 
                request.verification_analysis.addressConsistency !== undefined ||
                request.verification_analysis.completeness !== undefined) && (
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 mb-2">
                  {request.verification_analysis.coordinateValidity !== undefined && (
                    <p>{t('address:coordinateValidity')}: {request.verification_analysis.coordinateValidity}%</p>
                  )}
                  {request.verification_analysis.addressConsistency !== undefined && (
                    <p>{t('address:addressConsistency')}: {request.verification_analysis.addressConsistency}%</p>
                  )}
                  {request.verification_analysis.completeness !== undefined && (
                    <p>{t('address:completeness')}: {request.verification_analysis.completeness}%</p>
                  )}
                  {request.verification_analysis.fraudRisk !== undefined && (
                    <p>{t('address:fraudRisk')}: {request.verification_analysis.fraudRisk}%</p>
                  )}
                </div>
              )}

              {/* Duplicate Check */}
              {request.verification_analysis.duplicateCheck?.has_duplicates && (
                <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1 mb-2">
                  <p className="font-medium">{t('address:duplicateCheck')}:</p>
                  {request.verification_analysis.duplicateCheck.coordinate_duplicates?.count > 0 && (
                    <p>• {request.verification_analysis.duplicateCheck.coordinate_duplicates.count} {t('address:coordinateDuplicates')}</p>
                  )}
                  {request.verification_analysis.duplicateCheck.address_duplicates?.count > 0 && (
                    <p>• {request.verification_analysis.duplicateCheck.address_duplicates.count} {t('address:addressDuplicates')}</p>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {request.verification_analysis.recommendations && request.verification_analysis.recommendations.length > 0 && (
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p className="font-medium">{t('address:recommendations')}:</p>
                  {request.verification_analysis.recommendations.map((rec: string, idx: number) => (
                    <p key={idx}>• {rec}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {/* Warning if metadata is incomplete */}
          {!hasCompleteMetadata && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                ⚠️ {t('business:incompleteMetadataWarning')}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t('business:incompleteMetadataMessage')}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleApprove(false)}
                disabled={isProcessing || !hasCompleteMetadata}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                title={!hasCompleteMetadata ? t('business:cannotApproveIncomplete') : ''}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('business:approveBusiness')}
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('address:reject')}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleAutoVerify}
                disabled={isProcessing || isAutoVerifying}
                variant="outline"
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isAutoVerifying ? t('address:autoVerifying') : t('address:autoVerify')}
              </Button>
              <Button
                onClick={() => setShowMapDialog(true)}
                variant="outline"
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {t('address:viewOnMap')}
              </Button>
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('business:viewDetails')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Dialog */}
      {duplicateAnalysis && (
        <DuplicateAddressDialog
          isOpen={showDuplicateDialog}
          onClose={() => setShowDuplicateDialog(false)}
          duplicateAnalysis={duplicateAnalysis}
          onProceedAnyway={handleProceedWithDuplicates}
          actionLabel={t('address:proceedAnyway')}
        />
      )}

      {/* Map Dialog */}
      <AddressMapDialog
        isOpen={showMapDialog}
        onClose={() => setShowMapDialog(false)}
        address={{
          id: request.id,
          latitude: request.latitude,
          longitude: request.longitude,
          street: request.street,
          city: request.city,
          region: request.region,
          country: request.country,
          building: request.building
        }}
      />

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('business:rejectBusinessRequest')}</DialogTitle>
            <DialogDescription>{t('address:provideReasonForRejection')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('address:enterRejectionReason')}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setShowRejectDialog(false)} variant="outline">
                {t('address:cancel')}
              </Button>
              <Button onClick={handleReject} disabled={isProcessing} variant="destructive">
                {t('address:confirmReject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('business:businessDetails')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t('business:organizationInfo')}</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">{t('business:name')}:</dt>
                <dd>{orgData.organization_name}</dd>
                <dt className="text-muted-foreground">{t('business:category')}:</dt>
                <dd>{orgData.business_category}</dd>
                {orgData.business_registration_number && (
                  <>
                    <dt className="text-muted-foreground">{t('business:registrationNumber')}:</dt>
                    <dd>{orgData.business_registration_number}</dd>
                  </>
                )}
                {orgData.tax_identification_number && (
                  <>
                    <dt className="text-muted-foreground">{t('business:taxId')}:</dt>
                    <dd>{orgData.tax_identification_number}</dd>
                  </>
                )}
              </dl>
            </div>
            
            {request.photo_url && (
              <div>
                <h4 className="font-semibold mb-2">{t('address:photo')}</h4>
                <img src={request.photo_url} alt="Business" className="w-full rounded-md" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
