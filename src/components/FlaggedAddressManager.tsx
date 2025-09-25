import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Building, Calendar, Flag, CheckCircle, AlertTriangle, BarChart3, FileText, Eye, Edit, ChevronDown, ChevronUp } from "lucide-react";
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
  const { t, i18n } = useTranslation('address');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<FlaggedAddress | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedMapAddress, setSelectedMapAddress] = useState<FlaggedAddress | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<EditableFlaggedAddress | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const addressesPerPage = 5;

  const getStatusLabel = (status?: string) => {
    if (!status) return '';
    const keyDirect = status;
    const keyVs = `verificationStatus.${status}`;
    const keySt = `status.${status}`;
    if (i18n.exists(`address:${keyDirect}`)) return t(keyDirect as any);
    if (i18n.exists(`address:${keyVs}`)) return t(keyVs as any);
    if (i18n.exists(`address:${keySt}`)) return t(keySt as any);
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const tMaybe = (text?: string) => {
    if (!text) return '';
    const candidates = [
      text,
      text.toLowerCase(),
      text.replace(/\s+/g, '_'),
      text.replace(/\s+/g, ''),
      text.toLowerCase().replace(/\s+/g, '_'),
    ];
    for (const c of candidates) {
      if (i18n.exists(`address:${c}`)) return t(c as any);
    }
    return text;
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

  // Calculate pagination
  const totalPages = Math.ceil(addresses.length / addressesPerPage);
  const startIndex = (currentPage - 1) * addressesPerPage;
  const paginatedAddresses = addresses.slice(startIndex, startIndex + addressesPerPage);

  const handleApprove = async (requestId: string, updatedData?: Partial<FlaggedAddress>) => {
    setProcessing(requestId);
    try {
      if (updatedData) {
        const { error: updateError } = await supabase.rpc('approve_address_request_with_duplicate_check', {
          p_request_id: requestId,
          p_approved_by: undefined,
          p_ignore_duplicates: true,
        });
        if (updateError) throw updateError;
      } else {
        const { error } = await supabase.rpc('approve_address_request', {
          p_request_id: requestId,
        });
        if (error) throw error;
      }
      
      toast.success(t('flaggedRequestApproved'));
      onUpdate();
    } catch (error) {
      console.error('Error approving flagged request:', error);
      toast.error(t('failedToApprove'));
    } finally {
      setProcessing(null);
    }
  };

  const handleViewOnMap = (address: FlaggedAddress) => {
    setSelectedMapAddress(address);
    setMapDialogOpen(true);
  };

  const handleEdit = (address: FlaggedAddress) => {
    setEditingAddress(address);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedAddress: EditableFlaggedAddress) => {
    setEditDialogOpen(false);
    handleApprove(updatedAddress.id, updatedAddress);
  };

  const handleReject = (address: FlaggedAddress) => {
    setSelectedAddress(address);
    setSelectedAddressId(address.id);
    setRejectionDialogOpen(true);
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">{t('noFlaggedRequests')}</h3>
        <p className="text-muted-foreground">{t('allRequestsClear')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">
          {t('showingFlaggedAddresses', { start: startIndex + 1, end: Math.min(startIndex + addressesPerPage, addresses.length), total: addresses.length })}
        </h3>
        {totalPages > 1 && (
          <span className="text-sm text-muted-foreground">
            {t('pageInfo', { current: currentPage, total: totalPages })}
          </span>
        )}
      </div>

      {/* Flagged Address Cards */}
      <div className="space-y-4 max-w-full">
        {paginatedAddresses.map((address) => {
          const isExpanded = expandedCards.has(address.id);
          return (
            <Card key={address.id} className="border-l-4 border-l-red-500 max-w-full overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader 
                className="pb-3 cursor-pointer transition-colors duration-200 hover:bg-muted/50"
                onClick={() => toggleCardExpansion(address.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    {address.street}, {address.city}
                    <div className="transition-transform duration-200 ml-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      <Flag className="h-3 w-3 mr-1" />
                      {t('flagged')}
                    </Badge>
                    <Badge variant="outline">{getStatusLabel(address.status)}</Badge>
                  </div>
                </div>

                {/* Compact view when collapsed */}
                {!isExpanded && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t('flaggedOn', { date: address.flagged_at ? new Date(address.flagged_at).toLocaleDateString() : t('unknown') })}
                    </span>
                    {address.flag_reason && (
                      <span className="text-red-600 truncate max-w-[200px]">
                        {address.flag_reason}
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-6 animate-fade-in">
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
                      <p className="text-sm pl-6 capitalize">{address.address_type || 'unknown'}</p>
                    </div>
                  </div>

                  {/* Flag Information */}
                  {address.flag_reason && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">{t('flagReason')}</span>
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{address.flag_reason}</p>
                    </div>
                  )}

                  {/* Justification */}
                  {address.justification && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">{t('justification')}</span>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{tMaybe(address.justification)}</p>
                    </div>
                  )}

                  {/* Description */}
                  {address.description && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">{t('description')}</span>
                      <p className="text-sm text-muted-foreground">{address.description}</p>
                    </div>
                  )}

                  {/* Photo */}
                  {address.photo_url && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">{t('photo')}</span>
                      <img 
                        src={address.photo_url} 
                        alt={t('addressVerificationPhoto')}
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 text-xs">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(address.id);
                      }}
                      disabled={processing === address.id}
                      className="flex items-center justify-center w-full text-xs whitespace-nowrap min-w-fit"
                    >
                      {processing === address.id ? t('approving') : t('approve')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(address);
                      }}
                      disabled={processing === address.id}
                      className="flex items-center justify-center gap-1 w-full text-xs whitespace-nowrap min-w-fit"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline text-xs">{t('editAndApprove')}</span>
                      <span className="sm:hidden text-xs">{t('edit')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(address);
                      }}
                      disabled={processing === address.id}
                      className="flex items-center justify-center w-full text-xs whitespace-nowrap min-w-fit"
                    >
                      {t('reject')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOnMap(address);
                      }}
                      className="flex items-center justify-center gap-1 w-full text-xs whitespace-nowrap min-w-fit"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline text-xs">{t('viewOnMap')}</span>
                      <span className="sm:hidden text-xs">{t('map')}</span>
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
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

      {/* Dialogs */}
      <AddressRejectionDialog
        isOpen={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        itemType="flagged_address"
        item={selectedAddress}
        onReject={(reason: string, notes: string) => {
          // Handle rejection logic here if needed
          onUpdate();
          setRejectionDialogOpen(false);
        }}
      />

      <AddressMapDialog
        isOpen={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        address={selectedMapAddress}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('editFlaggedAddressRequest')}</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <EditFlaggedAddressForm
              address={editingAddress}
              onSave={handleSaveEdit}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="street">{t('street')}</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="city">{t('city')}</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="region">{t('region')}</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="country">{t('country')}</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="building">{t('building')}</Label>
          <Input
            id="building"
            value={formData.building || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="address_type">{t('addressType')}</Label>
          <Select
            value={formData.address_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, address_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="residential">{t('addressType.residential')}</SelectItem>
              <SelectItem value="commercial">{t('addressType.commercial')}</SelectItem>
              <SelectItem value="industrial">{t('addressType.industrial')}</SelectItem>
              <SelectItem value="mixed">{t('addressType.mixed')}</SelectItem>
              <SelectItem value="institutional">{t('addressType.institutional')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit">
          {t('saveAndApprove')}
        </Button>
      </div>
    </form>
  );
}