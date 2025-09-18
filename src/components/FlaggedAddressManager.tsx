import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Building, Calendar, Flag, CheckCircle, AlertTriangle, BarChart3, FileText, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressRejectionDialog } from "./AddressRejectionDialog";
import { AddressMapDialog } from "./AddressMapDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

interface EditableFlaggedAddress extends FlaggedAddress {}

interface FlaggedAddressManagerProps {
  addresses: FlaggedAddress[];
  onUpdate: () => void;
}

export function FlaggedAddressManager({ addresses, onUpdate }: FlaggedAddressManagerProps) {
  const { t } = useTranslation('address');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<FlaggedAddress | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedMapAddress, setSelectedMapAddress] = useState<FlaggedAddress | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<EditableFlaggedAddress | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const addressesPerPage = 5;

  // Reset pagination when addresses change
  useState(() => {
    setCurrentPage(1);
  });

  // Calculate pagination
  const totalPages = Math.ceil(addresses.length / addressesPerPage);
  const startIndex = (currentPage - 1) * addressesPerPage;
  const paginatedAddresses = addresses.slice(startIndex, startIndex + addressesPerPage);

  const handleApprove = async (requestId: string, updatedData?: Partial<FlaggedAddress>) => {
    setProcessing(requestId);
    try {
      // If there are updates, apply them first
      if (updatedData) {
        const { error: updateError } = await supabase
          .from('address_requests')
          .update({
            street: updatedData.street,
            city: updatedData.city,
            region: updatedData.region,
            country: updatedData.country,
            building: updatedData.building,
            address_type: updatedData.address_type,
            description: updatedData.description,
            latitude: updatedData.latitude,
            longitude: updatedData.longitude,
          })
          .eq('id', requestId);

        if (updateError) throw updateError;
      }

      const { error } = await supabase.rpc('approve_address_request', {
        p_request_id: requestId
      });

      if (error) throw error;

      toast.success(t('flaggedRequestApproved'));
      onUpdate();
    } catch (error) {
      console.error('Error approving flagged request:', error);
      toast.error(t('failedToApproveFlagged'));
    } finally {
      setProcessing(null);
    }
  };

  const handleViewOnMap = (address: FlaggedAddress) => {
    setSelectedMapAddress(address);
    setMapDialogOpen(true);
  };

  const handleEdit = (address: FlaggedAddress) => {
    setEditingAddress({ ...address });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedAddress: EditableFlaggedAddress) => {
    setEditDialogOpen(false);
    // Approve with the updated data
    handleApprove(updatedAddress.id, updatedAddress);
  };

  const handleReject = (address: FlaggedAddress) => {
    setSelectedAddressId(address.id);
    setSelectedAddress(address);
    setRejectionDialogOpen(true);
  };

  const handleRejectWithFeedback = async (reason: string, notes?: string) => {
    if (!selectedAddressId) return;

    try {
      const { error } = await supabase.rpc('reject_address_request_with_feedback', {
        p_request_id: selectedAddressId,
        p_rejection_reason: reason,
        p_rejection_notes: notes
      });

      if (error) throw error;

      toast.success(t('flaggedRequestRejected'));
      onUpdate();
    } catch (error) {
      console.error('Error rejecting flagged request:', error);
      toast.error(t('failedToRejectFlagged'));
    } finally {
      setRejectionDialogOpen(false);
      setSelectedAddressId(null);
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{t('noFlaggedRequests')}</h3>
        <p className="text-muted-foreground">{t('allRequestsClear')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Results count and pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>
          {t('showingFlaggedAddresses', { start: startIndex + 1, end: Math.min(startIndex + addressesPerPage, addresses.length), total: addresses.length })}
        </span>
        {totalPages > 1 && (
          <span>
            {t('pageInfo', { current: currentPage, total: totalPages })}
          </span>
        )}
      </div>

      <div className="space-y-4 max-w-full">
        {paginatedAddresses.map((address) => (
          <Card key={address.id} className="border-l-4 border-l-red-500 max-w-full overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t('flaggedAddressRequest')}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <Flag className="h-3 w-3 mr-1" />
                    {t('flagged')}
                  </Badge>
                  <Badge variant="outline">{address.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('location')}</span>
                  </div>
                  <p className="text-sm pl-6">
                    {address.building && `${address.building}, `}
                    {address.street}, {address.city}, {address.region}, {address.country}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    {t('coordinates')}: {address.latitude}, {address.longitude}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    {t('requestId')}: {address.id.slice(0, 8)}...
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('typeLabel')}</span>
                  </div>
                  <p className="text-sm pl-6 capitalize">{(() => {
                    const v = address.address_type as string | undefined;
                    const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                    const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                    const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                    return safe;
                  })()}</p>
                </div>
              </div>

              {/* Justification and Description */}
              {address.justification && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('justification')}</span>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{address.justification}</p>
                </div>
              )}

              {address.description && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('description')}</span>
                  <p className="text-sm text-muted-foreground">{address.description}</p>
                </div>
              )}

              {/* Flag Information */}
              {address.flag_reason && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('flagReason')}</span>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{address.flag_reason}</p>
                </div>
              )}

              {/* Manual Verification Analysis */}
              {address.verification_analysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{t('manualVerificationAnalysis')}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-3">
                    {address.verification_analysis.overallScore && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{t('overallScore')}</span>
                          <span className="text-sm font-bold text-blue-700">
                            {address.verification_analysis.overallScore}%
                          </span>
                        </div>
                        <Progress value={address.verification_analysis.overallScore} className="h-2" />
                      </div>
                    )}
                    
                    {address.verification_analysis.accuracy && (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                           <span className="font-medium">{t('accuracy')}:</span>
                           <p>{address.verification_analysis.accuracy.precision}</p>
                           <p>{t('score')}: {address.verification_analysis.accuracy.score}%</p>
                        </div>
                        {address.verification_analysis.consistency && (
                          <div>
                             <span className="font-medium">{t('consistency')}:</span>
                             <p>{t('score')}: {address.verification_analysis.consistency.score}%</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {address.verification_analysis.reasoning && (
                      <p className="text-xs text-blue-800">{address.verification_analysis.reasoning}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-Verification Analysis */}
              {address.auto_verification_analysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">{t('autoVerificationAnalysis')}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-4 space-y-3">
                    {address.auto_verification_analysis.overallScore && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{t('overallScore')}</span>
                          <span className="text-sm font-bold text-purple-700">
                            {address.auto_verification_analysis.overallScore}%
                          </span>
                        </div>
                        <Progress value={address.auto_verification_analysis.overallScore} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {address.auto_verification_analysis.coordinateValidity && (
                        <div>
                          <span className="font-medium">{t('coordinateValidity')}:</span>
                          <p>{address.auto_verification_analysis.coordinateValidity}%</p>
                        </div>
                      )}
                      {address.auto_verification_analysis.addressConsistency && (
                        <div>
                           <span className="font-medium">{t('addressConsistency')}:</span>
                           <p>{address.auto_verification_analysis.addressConsistency}%</p>
                         </div>
                       )}
                       {address.auto_verification_analysis.completeness && (
                         <div>
                           <span className="font-medium">{t('completeness')}:</span>
                           <p>{address.auto_verification_analysis.completeness}%</p>
                         </div>
                       )}
                       {address.auto_verification_analysis.fraudRisk && (
                         <div>
                           <span className="font-medium">{t('fraudRisk')}:</span>
                           <p className="text-red-600">{address.auto_verification_analysis.fraudRisk}%</p>
                         </div>
                      )}
                    </div>
                    
                    {address.auto_verification_analysis.reasoning && (
                      <p className="text-xs text-purple-800">{address.auto_verification_analysis.reasoning}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Recommendations */}
              {address.verification_recommendations && address.verification_recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">{t('verificationRecommendations')}</span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <ul className="text-sm space-y-1">
                      {address.verification_recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span className="text-yellow-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Auto-Verification Recommendations */}
              {address.auto_verification_analysis?.recommendations && address.auto_verification_analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('autoVerificationRecommendations')}</span>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <ul className="text-sm space-y-1">
                      {address.auto_verification_analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-600 mt-1">•</span>
                          <span className="text-gray-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Reviewer Notes */}
              {address.reviewer_notes && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('reviewerNotes')}</span>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded border">{address.reviewer_notes}</p>
                </div>
              )}

              {/* Previous Rejection Information */}
              {address.rejection_reason && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('previousRejection')}</span>
                  <div className="bg-red-50 border border-red-200 rounded p-3 space-y-2">
                    <p className="text-sm text-red-700"><strong>{t('reason')}:</strong> {address.rejection_reason}</p>
                    {address.rejection_notes && (
                      <p className="text-sm text-red-600"><strong>{t('notes')}:</strong> {address.rejection_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Photo */}
              {address.photo_url && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('verificationPhoto')}</span>
                  <img 
                    src={address.photo_url} 
                    alt={t('addressVerificationPhoto')}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Metadata */}
              <Separator />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{t('flaggedOn', { date: address.flagged_at ? new Date(address.flagged_at).toLocaleDateString() : t('unknown') })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span>{address.building || t('noBuilding')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-4">
                <Button
                  onClick={() => handleApprove(address.id)}
                  disabled={processing === address.id}
                  className="w-full"
                >
                  {processing === address.id ? t('approving') : t('approve')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEdit(address)}
                  disabled={processing === address.id}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('editAndApprove')}</span>
                  <span className="sm:hidden">{t('edit')}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(address)}
                  disabled={processing === address.id}
                  className="w-full"
                >
                  {t('reject')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewOnMap(address)}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('viewOnMap')}</span>
                  <span className="sm:hidden">{t('map')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {t('previous')}
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[36px]"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            {t('next')}
          </Button>
        </div>
      )}

      <AddressRejectionDialog
        isOpen={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onReject={handleRejectWithFeedback}
        itemType="flagged_request"
        item={selectedAddress}
      />

      {selectedMapAddress && (
        <AddressMapDialog
          isOpen={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          address={selectedMapAddress}
        />
      )}

      {editingAddress && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('editFlaggedAddressRequest')}</DialogTitle>
            </DialogHeader>
            <EditFlaggedAddressForm
              address={editingAddress}
              onSave={handleSaveEdit}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface EditFlaggedAddressFormProps {
  address: EditableFlaggedAddress;
  onSave: (address: EditableFlaggedAddress) => void;
  onCancel: () => void;
}

function EditFlaggedAddressForm({ address, onSave, onCancel }: EditFlaggedAddressFormProps) {
  const { t } = useTranslation('address');
  const [formData, setFormData] = useState<EditableFlaggedAddress>(address);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">{t('country')}</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="region">{t('region')}</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="city">{t('city')}</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="street">{t('street')}</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="building">{t('buildingHouseNumber')}</Label>
          <Input
            id="building"
            value={formData.building || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="address_type">{t('addressType')}</Label>
          <Select value={formData.address_type} onValueChange={(value) => setFormData(prev => ({ ...prev, address_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">{t('residential')}</SelectItem>
              <SelectItem value="commercial">{t('commercial')}</SelectItem>
              <SelectItem value="government">{t('government')}</SelectItem>
              <SelectItem value="landmark">{t('landmark')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="latitude">{t('latitude')}</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="longitude">{t('longitude')}</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          {t('saveAndApprove')}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
}