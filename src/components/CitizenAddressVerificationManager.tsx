import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Plus, CheckCircle, Edit, Clock, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCitizenAddresses } from '@/hooks/useCAR';
import { useResidencyVerification } from '@/hooks/useResidencyVerification';
import { ResidencyVerificationForm } from './ResidencyVerificationForm';
import { SetPrimaryAddressForm } from './SetPrimaryAddressForm';
import { AddSecondaryAddressForm } from './AddSecondaryAddressForm';
import { useTranslation } from 'react-i18next';

interface CitizenAddressVerificationManagerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CitizenAddressVerificationManager = ({ 
  onSuccess, 
  onCancel 
}: CitizenAddressVerificationManagerProps) => {
  const { t } = useTranslation('address');
  const { addresses, loading: addressesLoading } = useCitizenAddresses();
  const { verifications, loading: verificationsLoading } = useResidencyVerification();
  
  const [step, setStep] = useState<'select_address' | 'add_address' | 'verify_address'>('select_address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingAddressType, setAddingAddressType] = useState<'primary' | 'secondary' | null>(null);
  const [editingVerification, setEditingVerification] = useState<any>(null);

  if (addressesLoading || verificationsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentAddresses = addresses.filter(addr => !addr.effective_to);
  
  const getVerificationForAddress = (addressId: string) => 
    verifications.find(v => v.citizen_address_id === addressId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      case 'document_review':
      case 'field_verification':
      case 'legal_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'requires_additional_documents':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'document_review':
      case 'field_verification':
      case 'legal_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'requires_additional_documents':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const canEdit = (verification: any) => {
    return ['pending', 'requires_additional_documents', 'rejected'].includes(verification.status);
  };

  const handleAddressAdded = () => {
    setAddingAddressType(null);
    setStep('select_address');
  };

  const handleVerificationSuccess = () => {
    setSelectedAddressId(null);
    setStep('select_address');
    onSuccess?.();
  };

  if (step === 'add_address' && addingAddressType === 'primary') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Set Primary Address
          </CardTitle>
          <CardDescription>
            Set your primary address in the Citizen Address Repository before requesting verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPrimaryAddressForm onSuccess={handleAddressAdded} />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep('select_address')}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'add_address' && addingAddressType === 'secondary') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Secondary Address
          </CardTitle>
          <CardDescription>
            Add a secondary address in the Citizen Address Repository before requesting verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddSecondaryAddressForm onSuccess={handleAddressAdded} />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep('select_address')}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify_address' && selectedAddressId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verify Address Ownership/Residency
          </CardTitle>
          <CardDescription>
            Submit legal documents to verify your ownership or residency for this address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResidencyVerificationForm
            citizenAddressId={selectedAddressId}
            onSuccess={handleVerificationSuccess}
            onCancel={() => setStep('select_address')}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Address Verification
        </CardTitle>
        <CardDescription>
          First set your address in the Citizen Address Repository, then request verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAddresses.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to set at least one address in the Citizen Address Repository before requesting verification.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium">Your Current Addresses</h4>
            {currentAddresses.map((address) => {
              const verification = getVerificationForAddress(address.id);
              
              return (
                <Card key={address.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge variant={address.address_kind === 'PRIMARY' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">
                            {address.address_kind}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {address.scope}
                          </Badge>
                          <Badge variant={address.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">
                            {address.status}
                          </Badge>
                          {verification && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-0.5 ${getStatusColor(verification.status)}`}
                            >
                              {getStatusIcon(verification.status)}
                              <span className="ml-1">{formatStatus(verification.status)}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-mono">
                            UAC: {address.uac}
                            {address.unit_uac && ` | Unit: ${address.unit_uac}`}
                          </p>
                          {address.street && (
                            <p className="text-sm leading-tight">
                              {address.street}, {address.city}, {address.region}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center shrink-0">
                        {verification ? (
                          canEdit(verification) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => setEditingVerification(verification)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Verification Request</DialogTitle>
                                </DialogHeader>
                                <ResidencyVerificationForm
                                  citizenAddressId={address.id}
                                  editingVerification={verification}
                                  onSuccess={() => {
                                    setEditingVerification(null);
                                    // Refresh data by calling the parent's success handler
                                    onSuccess?.();
                                  }}
                                  onCancel={() => setEditingVerification(null)}
                                />
                              </DialogContent>
                            </Dialog>
                          )
                        ) : (
                          <Button 
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setSelectedAddressId(address.id);
                              setStep('verify_address');
                            }}
                          >
                            Request Verification
                          </Button>
                        )}
                      </div>
                    </div>

                    {verification && verification.verification_notes && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p className="text-xs font-medium mb-1">Reviewer Notes:</p>
                        <p className="text-xs leading-relaxed">{verification.verification_notes}</p>
                      </div>
                    )}

                    {verification && verification.status === 'requires_additional_documents' && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm font-medium text-orange-800 mb-1">Action Required:</p>
                        <p className="text-sm text-orange-700">
                          Please review the notes above and update your verification request with the requested changes.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-4 border-t">
          <h4 className="font-medium">Add New Address</h4>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setAddingAddressType('primary');
                setStep('add_address');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Set Primary Address
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setAddingAddressType('secondary');
                setStep('add_address');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Secondary Address
            </Button>
          </div>
        </div>

        {onCancel && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};