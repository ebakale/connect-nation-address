import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StepIndicator } from '@/components/ui/step-indicator';
import { CheckCircle, Search, Home, Building, ArrowLeft, ArrowRight } from 'lucide-react';
import { AddressLookupStep } from './AddressLookupStep';
import { AddressRequestForm } from './AddressRequestForm';
import { CARDeclarationForm } from './CARDeclarationForm';
import { BusinessDeclarationForm } from './BusinessDeclarationForm';
import { BusinessAddressCreationForm } from './BusinessAddressCreationForm';
import { useToast } from '@/hooks/use-toast';

type FlowState = 
  | 'lookup' 
  | 'address-type-selection'
  | 'nar-request' 
  | 'business-nar-creation'
  | 'awaiting-approval' 
  | 'car-declaration' 
  | 'business-declaration' 
  | 'complete';

type AddressCreationType = 'residential' | 'business' | null;

interface UnifiedAddressRequestFlowProps {
  initialMode?: 'citizen' | 'business';
  onComplete?: () => void;
  onCancel?: () => void;
}

export function UnifiedAddressRequestFlow({ 
  initialMode = 'citizen',
  onComplete,
  onCancel 
}: UnifiedAddressRequestFlowProps) {
  const { t } = useTranslation(['address', 'business', 'common']);
  const { toast } = useToast();
  const [currentState, setCurrentState] = useState<FlowState>('lookup');
  const [selectedUAC, setSelectedUAC] = useState<string>('');
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [createdAddressId, setCreatedAddressId] = useState<string | null>(null);
  const [declarationMode, setDeclarationMode] = useState<'citizen' | 'business'>(initialMode);
  const [addressCreationType, setAddressCreationType] = useState<AddressCreationType>(null);

  // Calculate progress percentage
  const progressSteps: Record<FlowState, number> = {
    'lookup': 15,
    'address-type-selection': 25,
    'nar-request': 45,
    'business-nar-creation': 45,
    'awaiting-approval': 65,
    'car-declaration': 85,
    'business-declaration': 85,
    'complete': 100
  };

  const currentProgress = progressSteps[currentState];

  // Step titles
  const getStepTitle = () => {
    switch (currentState) {
      case 'lookup':
        return t('address:unifiedFlow.step1');
      case 'address-type-selection':
        return t('address:unifiedFlow.selectAddressType');
      case 'nar-request':
        return t('address:unifiedFlow.createResidentialAddress');
      case 'business-nar-creation':
        return t('address:unifiedFlow.createBusinessAddress');
      case 'awaiting-approval':
        return t('address:unifiedFlow.awaitingApproval');
      case 'car-declaration':
        return t('address:unifiedFlow.declareAsCAR');
      case 'business-declaration':
        return t('address:unifiedFlow.declareAsBusiness');
      case 'complete':
        return t('common:complete');
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentState) {
      case 'lookup':
        return t('address:unifiedFlow.lookupDescription');
      case 'address-type-selection':
        return t('address:unifiedFlow.selectAddressTypeDescription');
      case 'nar-request':
        return t('address:unifiedFlow.createResidentialDescription');
      case 'business-nar-creation':
        return t('address:unifiedFlow.createBusinessDescription');
      case 'awaiting-approval':
        return t('address:unifiedFlow.awaitingApprovalDescription');
      case 'car-declaration':
        return t('address:unifiedFlow.carDeclarationDescription');
      case 'business-declaration':
        return t('address:unifiedFlow.businessDeclarationDescription');
      case 'complete':
        return t('address:unifiedFlow.completeDescription');
      default:
        return '';
    }
  };

  // Handle address lookup result
  const handleAddressFound = (uac: string, details: any) => {
    setSelectedUAC(uac);
    setAddressDetails(details);
    // Move to declaration step based on mode
    if (declarationMode === 'citizen') {
      setCurrentState('car-declaration');
    } else {
      setCurrentState('business-declaration');
    }
  };

  // Handle "address not found" - prompt for address type
  const handleCreateNewAddress = () => {
    setCurrentState('address-type-selection');
  };

  // Handle address type selection
  const handleAddressTypeSelected = (type: 'residential' | 'business') => {
    setAddressCreationType(type);
    if (type === 'residential') {
      setCurrentState('nar-request');
    } else {
      setCurrentState('business-nar-creation');
    }
  };

  // Handle residential NAR request submission success
  const handleNARSuccess = (requestId: string, uac?: string) => {
    setCreatedAddressId(requestId);
    if (uac) {
      setSelectedUAC(uac);
      toast({
        title: t('address:unifiedFlow.addressCreated'),
        description: t('address:unifiedFlow.readyToDeclare')
      });
      if (declarationMode === 'citizen') {
        setCurrentState('car-declaration');
      } else {
        setCurrentState('business-declaration');
      }
    } else {
      setCurrentState('awaiting-approval');
    }
  };

  // Handle business NAR creation success (with full metadata)
  const handleBusinessNARSuccess = (requestId: string) => {
    setCreatedAddressId(requestId);
    // Business address with full metadata goes straight to completion
    setCurrentState('complete');
    toast({
      title: t('common:success'),
      description: t('business:registration.successMessage')
    });
  };

  // Handle CAR declaration success
  const handleCARSuccess = () => {
    setCurrentState('complete');
    toast({
      title: t('common:success'),
      description: t('address:unifiedFlow.carDeclaredSuccess')
    });
  };

  // Handle Business declaration success
  const handleBusinessSuccess = () => {
    setCurrentState('complete');
    toast({
      title: t('common:success'),
      description: t('business:registration.successMessage')
    });
  };

  // Handle complete
  const handleComplete = () => {
    onComplete?.();
  };

  // Reset flow
  const handleReset = () => {
    setCurrentState('lookup');
    setSelectedUAC('');
    setAddressDetails(null);
    setCreatedAddressId(null);
    setAddressCreationType(null);
  };

  // Map flow states to step indices for the indicator
  const flowStepMapping: Record<FlowState, number> = {
    'lookup': 0,
    'address-type-selection': 1,
    'nar-request': 2,
    'business-nar-creation': 2,
    'awaiting-approval': 2,
    'car-declaration': 3,
    'business-declaration': 3,
    'complete': 4,
  };

  const stepDefinitions = [
    { label: t('address:unifiedFlow.step1'), icon: Search },
    { label: t('address:unifiedFlow.selectAddressType'), icon: Building },
    { label: declarationMode === 'business' ? t('address:unifiedFlow.createBusinessAddress') : t('address:unifiedFlow.createResidentialAddress'), icon: Home },
    { label: declarationMode === 'business' ? t('address:unifiedFlow.declareAsBusiness') : t('address:unifiedFlow.declareAsCAR'), icon: Building },
    { label: t('common:complete'), icon: CheckCircle },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Step Indicator Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('address:unifiedFlow.title')}</CardTitle>
                <CardDescription>{getStepDescription()}</CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {Math.round(currentProgress)}%
              </Badge>
            </div>
            <StepIndicator 
              steps={stepDefinitions} 
              currentStep={flowStepMapping[currentState]} 
            />
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <div className="space-y-4">
        {currentState === 'lookup' && (
          <AddressLookupStep
            onAddressFound={handleAddressFound}
            onCreateNew={handleCreateNewAddress}
            onModeChange={setDeclarationMode}
            initialMode={declarationMode}
          />
        )}

        {currentState === 'address-type-selection' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('address:unifiedFlow.selectAddressType')}</CardTitle>
              <CardDescription>
                {t('address:unifiedFlow.selectAddressTypeHelp')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-3 p-6 min-h-[140px] w-full"
                  onClick={() => handleAddressTypeSelected('residential')}
                >
                  <Home className="h-8 w-8 flex-shrink-0" />
                  <div className="text-center w-full">
                    <div className="font-semibold break-words">{t('address:unifiedFlow.residentialAddress')}</div>
                    <div className="text-xs text-muted-foreground mt-1 break-words">
                      {t('address:unifiedFlow.residentialDescription')}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-3 p-6 min-h-[140px] w-full"
                  onClick={() => handleAddressTypeSelected('business')}
                >
                  <Building className="h-8 w-8 flex-shrink-0" />
                  <div className="text-center w-full">
                    <div className="font-semibold break-words">{t('address:unifiedFlow.businessAddress')}</div>
                    <div className="text-xs text-muted-foreground mt-1 break-words">
                      {t('address:unifiedFlow.businessDescription')}
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentState === 'nar-request' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('address:unifiedFlow.createResidentialAddress')}</CardTitle>
              <CardDescription>
                {t('address:unifiedFlow.createResidentialHelp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressRequestForm
                mode="embedded"
                onSuccess={(requestId, uac) => handleNARSuccess(requestId, uac)}
                onCancel={() => setCurrentState('address-type-selection')}
              />
            </CardContent>
          </Card>
        )}

        {currentState === 'business-nar-creation' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('address:unifiedFlow.createBusinessAddress')}</CardTitle>
              <CardDescription>
                {t('address:unifiedFlow.createBusinessHelp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessAddressCreationForm
                onSuccess={handleBusinessNARSuccess}
                onCancel={() => setCurrentState('address-type-selection')}
              />
            </CardContent>
          </Card>
        )}

        {currentState === 'awaiting-approval' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('address:unifiedFlow.awaitingApproval')}</CardTitle>
              <CardDescription>
                {t('address:unifiedFlow.awaitingApprovalInfo')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t('address:unifiedFlow.approvalInstructions')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('common:buttons.startOver')}
                </Button>
                <Button onClick={onCancel} className="flex-1">
                  {t('common:buttons.backToDashboard')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentState === 'car-declaration' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('address:unifiedFlow.declareAsCAR')}</CardTitle>
              <CardDescription>
                {t('address:unifiedFlow.carDeclarationHelp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CARDeclarationForm
                prefilledUAC={selectedUAC}
                onSuccess={handleCARSuccess}
                onCancel={() => setCurrentState('lookup')}
              />
            </CardContent>
          </Card>
        )}

        {currentState === 'business-declaration' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('address:unifiedFlow.declareAsBusiness')}</CardTitle>
              <CardDescription>
                {t('address:unifiedFlow.businessDeclarationHelp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessDeclarationForm
                prefilledUAC={selectedUAC}
                onSuccess={handleBusinessSuccess}
                onCancel={() => setCurrentState('lookup')}
              />
            </CardContent>
          </Card>
        )}

        {currentState === 'complete' && (
          <Card className="border-success">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-full">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div>
                  <CardTitle className="text-success">{t('common:success')}</CardTitle>
                  <CardDescription>
                    {declarationMode === 'citizen' 
                      ? t('address:unifiedFlow.carCompleteMessage')
                      : t('address:unifiedFlow.businessCompleteMessage')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-success/5 border border-success/20 rounded-lg space-y-2">
                <p className="font-medium text-success">{t('address:unifiedFlow.nextSteps')}</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>{t('address:unifiedFlow.nextStep1')}</li>
                  <li>{t('address:unifiedFlow.nextStep2')}</li>
                  <li>{t('address:unifiedFlow.nextStep3')}</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  {t('address:unifiedFlow.registerAnother')}
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  {t('common:backToDashboard')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Back button for most steps */}
      {currentState !== 'complete' && currentState !== 'lookup' && (
        <Button 
          onClick={() => setCurrentState('lookup')} 
          variant="ghost"
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common:back')}
        </Button>
      )}
    </div>
  );
}
