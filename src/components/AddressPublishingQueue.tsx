import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddresses } from "@/hooks/useAddresses";
import { Globe, Eye, EyeOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface AddressPublishingQueueProps {
  onClose?: () => void;
}

export const AddressPublishingQueue = ({ onClose }: AddressPublishingQueueProps) => {
  const { addresses, loading, updateAddressStatus, fetchAddresses } = useAddresses();
  const { toast } = useToast();
  const { t } = useTranslation('address');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const unpublishedAddresses = addresses.filter(addr => addr.verified && !addr.public);

  const handlePublish = async (addressId: string, isPublic: boolean) => {
    await updateAddressStatus(addressId, { public: isPublic });
    toast({
      title: t('success'),
      description: t(isPublic ? 'addressPublishedSuccessfully' : 'addressUnpublishedSuccessfully')
    });
  };

  const handlePublishAll = async () => {
    try {
      const publishPromises = unpublishedAddresses.map(address => 
        updateAddressStatus(address.id, { public: true })
      );
      
      await Promise.all(publishPromises);
      
      toast({
        title: t('success'),
        description: t('addressesPublishedSuccessfully', { count: unpublishedAddresses.length })
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToPublishAddresses'),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4">{t('loadingPublishingQueue')}</div>;
  }

  return (
    <div className="space-y-4 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold break-words">{t('publishingQueueCount', { count: unpublishedAddresses.length })}</h3>
          <p className="text-sm text-muted-foreground break-words">{t('publishVerifiedAddresses')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {unpublishedAddresses.length > 0 && (
            <Button onClick={handlePublishAll} className="flex items-center justify-center gap-1 text-xs sm:text-sm">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('publishAllCount', { count: unpublishedAddresses.length })}</span>
              <span className="sm:hidden">{t('publishAll')}</span>
            </Button>
          )}
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs sm:text-sm">
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {t('close')}
            </Button>
          )}
        </div>
      </div>
      
      {unpublishedAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{t('noAddressesPendingPublication')}</p>
          </CardContent>
        </Card>
      ) : (
        unpublishedAddresses.map((address) => (
          <Card key={address.id} className="max-w-full overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg break-words">{address.uac}</CardTitle>
                  <CardDescription className="break-words">
                    {address.building && `${address.building}, `}
                    {address.street}, {address.city}, {address.region}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="default" className="text-xs">{t('verified')}</Badge>
                  <Badge variant="outline" className="text-xs">{t('private')}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm mb-4">
                <div className="break-words">
                  <span className="font-medium">{t('type')}:</span>{' '}
                  {(() => {
                    const raw = address.address_type as string | undefined;
                    const cleaned = raw ? raw.replace(/[{}]/g, '').trim() : '';
                    const key = cleaned && cleaned !== 'type' ? cleaned : 'unknown';
                    return t(key);
                  })()}
                </div>
                <div className="break-words">
                  <span className="font-medium">{t('created')}:</span> {new Date(address.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePublish(address.id, true)}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('publishToNationalRegistry')}</span>
                  <span className="sm:hidden">{t('publish')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};