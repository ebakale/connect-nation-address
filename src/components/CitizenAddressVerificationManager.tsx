import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Plus, CheckCircle } from 'lucide-react';
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
  const hasVerification = (addressId: string) => 
    verifications.some(v => v.citizen_address_id === addressId);

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
          <SetPrimaryAddressForm 
            onSuccess={handleAddressAdded}
          />
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
          <AddSecondaryAddressForm 
            onSuccess={handleAddressAdded}
          />
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
            {currentAddresses.map((address) => (
              <Card key={address.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={address.address_kind === 'PRIMARY' ? 'default' : 'secondary'}>
                          {address.address_kind}
                        </Badge>
                        <Badge variant="outline">
                          {address.scope}
                        </Badge>
                        <Badge variant={address.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                          {address.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        UAC: {address.uac}
                        {address.unit_uac && ` | Unit: ${address.unit_uac}`}
                      </p>
                      {address.street && (
                        <p className="text-sm">
                          {address.street}, {address.city}, {address.region}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasVerification(address.id) ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verification Submitted
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
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
                </CardContent>
              </Card>
            ))}
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