import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Home, MapPin, Calendar, User, Trash2, Plus } from 'lucide-react';
import { format } from "date-fns";
import { es, enUS, fr } from 'date-fns/locale';
import { useCitizenAddresses } from '@/hooks/useCAR';
import type { CitizenAddress } from '@/types/car';
import { useTranslation } from 'react-i18next';

interface CurrentAddressesPanelProps {
  primaryAddress?: CitizenAddress;
  secondaryAddresses: CitizenAddress[];
  onAddSecondary: () => void;
  onSetPrimary: () => void;
}

export function CurrentAddressesPanel({ 
  primaryAddress, 
  secondaryAddresses, 
  onAddSecondary, 
  onSetPrimary 
}: CurrentAddressesPanelProps) {
  const { t, i18n } = useTranslation('address');
  const { retireAddress } = useCitizenAddresses();

  // Get the appropriate locale for date formatting
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'es': return es;
      case 'fr': return fr;
      default: return enUS;
    }
  };

  const handleRetireAddress = async (addressId: string) => {
    try {
      await retireAddress(addressId, t('userRequestedRemoval'));
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusKey = (status: string | null | undefined) => {
    if (!status) return 'unknown';
    const normalized = status.toLowerCase();
    const lastSegment = normalized.split('.').pop() || normalized;
    return lastSegment;
  };

  const getStatusColor = (status: string) => {
    const key = getStatusKey(status);
    switch (key) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'self_declared':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOccupantIcon = (occupant: string) => {
    switch (occupant) {
      case 'OWNER':
        return t('occupantIcon.owner');
      case 'TENANT':
        return t('occupantIcon.tenant');
      case 'FAMILY':
        return t('occupantIcon.family');
      default:
        return t('occupantIcon.other');
    }
  };

  const getLocalizedLocation = (location: string) => {
    const key = `locations.${location.toLowerCase().replace(/\s+/g, '_')}`;
    const translated = t(key);
    // If translation key doesn't exist, return original
    return translated === key ? location : translated;
  };

  const renderAddressCard = (address: CitizenAddress, isPrimary: boolean = false) => (
    <Card className={isPrimary ? "border-primary/20 bg-primary/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-mono text-primary mb-1">{address.uac}</CardTitle>
            {address.street && (
              <p className="text-sm font-medium text-foreground">
                {address.building && `${address.building}, `}
                {address.street}
              </p>
            )}
            {(address.city || address.region) && (
              <p className="text-sm text-muted-foreground">
                {[
                  address.city && getLocalizedLocation(address.city),
                  address.region && getLocalizedLocation(address.region), 
                  address.country && getLocalizedLocation(address.country)
                ].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={getStatusColor(address.status)}>
              {t(`status.${getStatusKey(address.status)}`)}
            </Badge>
            <Badge variant="outline">
              {getOccupantIcon(address.occupant)} {t(`occupant.${address.occupant.toLowerCase()}`)}
            </Badge>
            {address.nar_verified && (
              <Badge variant="secondary" className="text-xs">
                ✓ {t('narVerified')}
              </Badge>
            )}
          </div>
        </div>
        {address.unit_uac && (
          <CardDescription className="font-mono text-sm mt-2">
            {t('unit')}: {address.unit_uac}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Additional address details */}
          {address.address_type && (
            <div className="text-sm">
              <span className="text-muted-foreground">{t('type')}: </span>
              <span>{t(`addressType.${address.address_type.toLowerCase()}`)}</span>
            </div>
          )}
          
          {address.address_description && (
            <div className="text-sm">
              <span className="text-muted-foreground">{t('description')}: </span>
              <span>{address.address_description}</span>
            </div>
          )}


          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {isPrimary ? `${t('effectiveFrom')} ${format(new Date(address.effective_from), 'MMM d, yyyy', { locale: getDateLocale() })}` : `${t('added')} ${format(new Date(address.created_at), 'MMM d, yyyy', { locale: getDateLocale() })}`}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {t(`scopeType.${address.scope.toLowerCase()}`)}
              </div>
            </div>
            <div className="flex gap-2">
              {isPrimary && (
                <Button onClick={onSetPrimary} variant="outline" size="sm">
                  {t('updatePrimary')}
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    {isPrimary ? '' : ` ${t('remove')}`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isPrimary ? t('retirePrimaryQuestion') : t('removeSecondaryQuestion')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isPrimary 
                        ? t('retirePrimaryDescription')
                        : t('removeSecondaryDescription')
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRetireAddress(address.id)}>
                      {isPrimary ? t('retireAddress') : t('removeAddress')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Primary Address Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            {t('primaryAddress')}
          </h2>
          {!primaryAddress && (
            <Button onClick={onSetPrimary} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('setPrimary')}
            </Button>
          )}
        </div>

        {primaryAddress ? (
          renderAddressCard(primaryAddress, true)
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                {t('noPrimaryAddressMessage')}
              </p>
              <Button onClick={onSetPrimary}>
                <Plus className="h-4 w-4 mr-2" />
                {t('setPrimaryAddress')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Addresses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {t('secondaryAddresses')} ({secondaryAddresses.length})
          </h2>
          <Button onClick={onAddSecondary} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('addSecondary')}
          </Button>
        </div>

        {secondaryAddresses.length > 0 ? (
          <div className="grid gap-4">
            {secondaryAddresses.map((address) => (
              <div key={address.id}>
                {renderAddressCard(address, false)}
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                {t('noSecondaryAddressesMessage')}
              </p>
              <Button onClick={onAddSecondary} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t('addSecondaryAddress')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}