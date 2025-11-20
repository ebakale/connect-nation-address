import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Search, Home, Building, ArrowLeft, ArrowRight } from 'lucide-react';
import { AddressLookupStep } from './AddressLookupStep';
import { AddressRequestForm } from './AddressRequestForm';
import { CARDeclarationForm } from './CARDeclarationForm';
import { BusinessDeclarationForm } from './BusinessDeclarationForm';
import { useToast } from '@/hooks/use-toast';

type FlowState = 
  | 'lookup' 
  | 'nar-request' 
  | 'awaiting-approval' 
  | 'car-declaration' 
  | 'business-declaration' 
  | 'complete';

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

  // Calculate progress percentage
  const progressSteps: Record<FlowState, number> = {
    'lookup': 20,
    'nar-request': 40,
    'awaiting-approval': 60,
    'car-declaration': 80,
    'business-declaration': 80,
    'complete': 100
  };

  const currentProgress = progressSteps[currentState];

  // Step titles
  const getStepTitle = () => {
    switch (currentState) {
      case 'lookup':
        return t('address:unifiedFlow.step1');
      case 'nar-request':
        return t('address:unifiedFlow.createAddress');
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
      case 'nar-request':
        return t('address:unifiedFlow.createAddressDescription');
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

  // Handle "address not found" - create new
  const handleCreateNewAddress = () => {
    setCurrentState('nar-request');
  };

  // Handle NAR request submission success
  const handleNARSuccess = (requestId: string, uac?: string) => {
    setCreatedAddressId(requestId);
    if (uac) {
      setSelectedUAC(uac);
      // Auto-advance to declaration after approval
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
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentState === 'lookup' && <Search className="h-6 w-6 text-primary" />}
                {currentState === 'nar-request' && <Home className="h-6 w-6 text-primary" />}
                {(currentState === 'car-declaration' || currentState === 'business-declaration') && 
                  <Building className="h-6 w-6 text-primary" />}
                {currentState === 'complete' && <CheckCircle className="h-6 w-6 text-success" />}
                <div>
                  <CardTitle>{t('address:unifiedFlow.title')}</CardTitle>
                  <CardDescription>{getStepDescription()}</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {Math.round(currentProgress)}%
              </Badge>
            </div>
            <Progress value={currentProgress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{getStepTitle()}</span>
              <span>
                {currentState === 'complete' ? (
                  <Badge variant="default" className="bg-success">
                    {t('common:completed')}
                  </Badge>
                ) : (
                  t('address:unifiedFlow.inProgress')
                )}
              </span>
            </div>
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

        {currentState === 'nar-request' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('address:unifiedFlow.createAddress')}</CardTitle>
              <CardDescription>
                {t('address:unifiedFlow.createAddressHelp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressRequestForm
                mode="embedded"
                onSuccess={(requestId, uac) => handleNARSuccess(requestId, uac)}
                onCancel={() => setCurrentState('lookup')}
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
                  {t('common:startOver')}
                </Button>
                <Button onClick={onCancel} className="flex-1">
                  {t('common:backToDashboard')}
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
