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
  const { t } = useTranslation('addresses');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const publishedAddresses = addresses.filter(addr => addr.verified && addr.public);

  const handleUnpublish = async (addressId: string) => {
    await updateAddressStatus(addressId, { public: false });
    toast({
      title: t('common:success'),
      description: t('publishing.successRemoved')
    });
  };

  const handleUnpublishAll = async () => {
    try {
      const unpublishPromises = publishedAddresses.map(address => 
        updateAddressStatus(address.id, { public: false })
      );
      
      await Promise.all(unpublishPromises);
      
      toast({
        title: t('common:success'),
        description: `${publishedAddresses.length} ${t('publishing.addressesRemoved')}`
      });
    } catch (error) {
      toast({
        title: t('common:error'),
        description: t('publishing.failedRemove'),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4">{t('publishing.loadingPublished')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('publishing.publishedAddresses')} ({publishedAddresses.length})</h3>
          <p className="text-sm text-muted-foreground">{t('manageAddressesRegistry')}</p>
        </div>
        <div className="flex gap-2">
          {publishedAddresses.length > 0 && (
            <Button 
              onClick={handleUnpublishAll} 
              variant="outline"
              className="flex items-center gap-1"
            >
              <EyeOff className="h-4 w-4" />
              {t('publishing.removeAllPublic')} ({publishedAddresses.length})
            </Button>
          )}
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              {t('common:close')}
            </Button>
          )}
        </div>
      </div>
      
      {publishedAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{t('noPublishedAddresses')}</p>
          </CardContent>
        </Card>
      ) : (
        publishedAddresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{address.uac}</CardTitle>
                  <CardDescription>
                    {address.building && `${address.building}, `}
                    {address.street}, {address.city}, {address.region}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">{t('display.verified')}</Badge>
                  <Badge variant="default">
                    <Globe className="h-3 w-3 mr-1" />
                    {t('display.public')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">{t('type')}:</span> {address.address_type}
                </div>
                <div>
                  <span className="font-medium">{t('created')}:</span> {new Date(address.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnpublish(address.id)}
                  className="flex items-center gap-1"
                >
                  <EyeOff className="h-4 w-4" />
                  {t('publishing.removeFromRegistry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};