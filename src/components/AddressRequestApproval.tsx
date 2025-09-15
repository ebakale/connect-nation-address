import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Building, Calendar, CheckCircle, X, Zap, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressRejectionDialog } from "./AddressRejectionDialog";
import { AddressMapDialog } from "./AddressMapDialog";
import { DuplicateAddressDialog } from "./DuplicateAddressDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface EditableRequest extends AddressRequest {}

interface AddressRequestApprovalProps {
  requests: AddressRequest[];
  onUpdate: () => void;
}

export function AddressRequestApproval({ requests, onUpdate }: AddressRequestApprovalProps) {
  const { t } = useTranslation('address');
  const [processing, setProcessing] = useState<string | null>(null);
  const [autoVerifying, setAutoVerifying] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AddressRequest | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedMapAddress, setSelectedMapAddress] = useState<AddressRequest | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<EditableRequest | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<any>(null);
  const [pendingApproval, setPendingApproval] = useState<{requestId: string, updatedData?: Partial<AddressRequest>} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const paginatedRequests = requests.slice(startIndex, startIndex + requestsPerPage);

  const handleApprove = async (requestId: string, updatedData?: Partial<AddressRequest>, ignoreDuplicates = false) => {
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

      const { data, error } = await supabase.rpc('approve_address_request_with_duplicate_check', {
        p_request_id: requestId,
        p_ignore_duplicates: ignoreDuplicates
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast.success(t('approvedSuccessfully'));
        onUpdate();
      } else if (result?.requires_review) {
        // Show duplicate analysis dialog
        setDuplicateAnalysis(result.duplicate_analysis);
        setPendingApproval({ requestId, updatedData });
        setDuplicateDialogOpen(true);
      } else {
        throw new Error(result?.error || 'Approval failed');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(t('failedToApprove'));
    } finally {
      setProcessing(null);
    }
  };

  const handleProceedWithDuplicates = async () => {
    if (!pendingApproval) return;
    
    setDuplicateDialogOpen(false);
    setDuplicateAnalysis(null);
    
    // Retry with ignore duplicates flag
    await handleApprove(pendingApproval.requestId, pendingApproval.updatedData, true);
    setPendingApproval(null);
  };

  const handleCancelDuplicateApproval = () => {
    setDuplicateDialogOpen(false);
    setDuplicateAnalysis(null);
    setPendingApproval(null);
  };

  const handleViewOnMap = (request: AddressRequest) => {
    setSelectedMapAddress(request);
    setMapDialogOpen(true);
  };

  const handleEdit = (request: AddressRequest) => {
    setEditingRequest({ ...request });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedRequest: EditableRequest) => {
    setEditDialogOpen(false);
    // Approve with the updated data
    handleApprove(updatedRequest.id, updatedRequest);
  };

  const handleReject = (request: AddressRequest) => {
    setSelectedRequestId(request.id);
    setSelectedRequest(request);
    setRejectionDialogOpen(true);
  };

  const handleRejectWithFeedback = async (reason: string, notes?: string) => {
    if (!selectedRequestId) return;

    try {
      const { error } = await supabase.rpc('reject_address_request_with_feedback', {
        p_request_id: selectedRequestId,
        p_rejection_reason: reason,
        p_rejection_notes: notes
      });

      if (error) throw error;

      toast.success(t('rejectedWithFeedback'));
      onUpdate();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(t('failedToReject'));
    } finally {
      setRejectionDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleAutoVerify = async (requestId: string) => {
    setAutoVerifying(requestId);
    try {
      const { data, error } = await supabase.functions.invoke('auto-verify-address', {
        body: { requestId, mode: 'single' }
      });

      if (error) throw error;

      toast.success(t('autoVerificationResult', { action: data.decision.action, score: data.analysis.overallScore }));
      onUpdate();
    } catch (error) {
      console.error('Auto-verification failed:', error);
      toast.error(t('autoVerificationFailed'));
    } finally {
      setAutoVerifying(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{t('noPendingRequests')}</h3>
        <p className="text-muted-foreground">{t('allRequestsProcessed')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Results count and pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>
          {t('showingResults', { start: startIndex + 1, end: Math.min(startIndex + requestsPerPage, requests.length), total: requests.length })}
        </span>
        {totalPages > 1 && (
          <span>
            {t('pageInfo', { current: currentPage, total: totalPages })}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {paginatedRequests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t('addressRequest')}</CardTitle>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {t('pendingApproval')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('location')}</span>
                  </div>
                  <p className="text-sm pl-6">
                    {request.building && `${request.building}, `}
                    {request.street}, {request.city}, {request.region}, {request.country}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    {request.latitude}, {request.longitude}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('typeLabel')}</span>
                  </div>
                  <p className="text-sm pl-6 capitalize">{(() => {
                    const v = request.address_type as string | undefined;
                    const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                    const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                    const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                    return safe;
                  })()}</p>
                </div>
              </div>

              {request.description && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('description')}</span>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-sm font-medium">{t('justification')}</span>
                <p className="text-sm text-muted-foreground">{request.justification}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{t('submittedOn', { date: new Date(request.created_at).toLocaleDateString() })}</span>
                <User className="h-3 w-3 ml-4" />
                <span>{t('userId', { id: request.user_id.slice(0, 8) })}</span>
              </div>

              {request.photo_url && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('photo')}</span>
                  <img 
                    src={request.photo_url} 
                    alt={t('addressVerificationPhoto')}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-4">
                <Button
                  onClick={() => handleApprove(request.id)}
                  disabled={processing === request.id || autoVerifying === request.id}
                  className="w-full"
                >
                  {processing === request.id ? t('approving') : t('approve')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEdit(request)}
                  disabled={processing === request.id || autoVerifying === request.id}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('editAndApprove')}</span>
                  <span className="sm:hidden">{t('edit')}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(request)}
                  disabled={processing === request.id || autoVerifying === request.id}
                  className="w-full"
                >
                  {t('reject')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewOnMap(request)}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('viewOnMap')}</span>
                  <span className="sm:hidden">{t('map')}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAutoVerify(request.id)}
                  disabled={processing === request.id || autoVerifying === request.id}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  {autoVerifying === request.id ? (
                    <>
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
                      <span className="hidden sm:inline">{t('autoVerifying')}</span>
                      <span className="sm:hidden">{t('verifying')}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('autoVerify')}</span>
                      <span className="sm:hidden">{t('verifying')}</span>
                    </>
                  )}
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
        itemType="request"
        item={selectedRequest}
      />

      {selectedMapAddress && (
        <AddressMapDialog
          isOpen={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          address={selectedMapAddress}
        />
      )}

      {editingRequest && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('editAddressRequest')}</DialogTitle>
            </DialogHeader>
            <EditRequestForm
              request={editingRequest}
              onSave={handleSaveEdit}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {duplicateAnalysis && (
        <DuplicateAddressDialog
          isOpen={duplicateDialogOpen}
          onClose={handleCancelDuplicateApproval}
          duplicateAnalysis={duplicateAnalysis}
          onProceedAnyway={handleProceedWithDuplicates}
          actionLabel="Approve Anyway"
        />
      )}
    </>
  );
}

interface EditRequestFormProps {
  request: EditableRequest;
  onSave: (request: EditableRequest) => void;
  onCancel: () => void;
}

function EditRequestForm({ request, onSave, onCancel }: EditRequestFormProps) {
  const { t } = useTranslation('address');
  const [formData, setFormData] = useState<EditableRequest>(request);

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
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="landmark">Landmark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          Save & Approve
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}