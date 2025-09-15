import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddresses } from "@/hooks/useAddresses";
import { EyeOff, Globe, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface AddressUnpublishingQueueProps {
  onClose?: () => void;
}

export const AddressUnpublishingQueue = ({ onClose }: AddressUnpublishingQueueProps) => {
  const { addresses, loading, updateAddressStatus, fetchAddresses } = useAddresses();
  const { toast } = useToast();
  const { t } = useTranslation('address');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const publishedAddresses = addresses.filter(addr => addr.verified && addr.public);

  const handleUnpublish = async (addressId: string) => {
    await updateAddressStatus(addressId, { public: false });
    toast({
      title: t('success'),
      description: t('addressRemovedFromRegistry')
    });
  };

  const handleUnpublishAll = async () => {
    try {
      const unpublishPromises = publishedAddresses.map(address => 
        updateAddressStatus(address.id, { public: false })
      );
      
      await Promise.all(unpublishPromises);
      
      toast({
        title: t('success'),
        description: t('addressesRemovedFromRegistryCount', { count: publishedAddresses.length })
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToRemoveSomeAddresses'),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4">{t('loadingPublishedAddresses')}</div>;
  }

  return (
    <div className="space-y-4 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold break-words">{t('publishedAddressesCount', { count: publishedAddresses.length })}</h3>
          <p className="text-sm text-muted-foreground break-words">{t('manageAddressesInRegistry')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {publishedAddresses.length > 0 && (
            <Button 
              onClick={handleUnpublishAll} 
              variant="outline"
              className="flex items-center justify-center gap-1 text-xs sm:text-sm"
            >
              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">{t('removeAllFromPublicRegistryCount', { count: publishedAddresses.length })}</span>
              <span className="lg:hidden">{t('removeAll')}</span>
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
      
      {publishedAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{t('noPublishedAddressesFound')}</p>
          </CardContent>
        </Card>
      ) : (
        publishedAddresses.map((address) => (
          <Card key={address.id} className="max-w-full overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base break-words">{address.uac}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm break-words">
                    {address.building && `${address.building}, `}
                    {address.street}, {address.city}, {address.region}
                  </CardDescription>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="default" className="text-xs px-2 py-0.5">{t('verified')}</Badge>
                  <Badge variant="default" className="text-xs px-2 py-0.5">
                    <Globe className="h-3 w-3 mr-1" />
                    {t('published')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
                <div className="break-words">
                  <span className="font-medium">{t('typeLabel')}:</span>{' '}
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
                  variant="outline"
                  onClick={() => handleUnpublish(address.id)}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('removeFromPublicRegistry')}</span>
                  <span className="sm:hidden">{t('remove')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};