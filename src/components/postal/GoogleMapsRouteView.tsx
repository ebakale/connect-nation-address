import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GoogleMapsDirectionsView from '@/components/GoogleMapsDirectionsView';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapsRouteViewProps {
  deliveryUAC: string;
  recipientName: string;
  recipientAddress: string;
  onClose: () => void;
}

interface SearchResult {
  uac: string;
  readable: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  verified: boolean;
}

export const GoogleMapsRouteView: React.FC<GoogleMapsRouteViewProps> = ({
  deliveryUAC,
  recipientName,
  recipientAddress,
  onClose,
}) => {
  const { t } = useTranslation('postal');
  const [destination, setDestination] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddressCoordinates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: address, error: fetchError } = await supabase
          .from('addresses')
          .select('latitude, longitude, street, city, region, verified')
          .eq('uac', deliveryUAC)
          .single();

        if (fetchError || !address) {
          setError(t('agent.addressNotFound'));
          setIsLoading(false);
          return;
        }

        if (!address.latitude || !address.longitude) {
          setError(t('routing.destinationError'));
          setIsLoading(false);
          return;
        }

        const searchResult: SearchResult = {
          uac: deliveryUAC,
          readable: `${address.street}, ${address.city}, ${address.region}`,
          coordinates: {
            lat: Number(address.latitude),
            lng: Number(address.longitude),
          },
          type: 'delivery',
          verified: address.verified || false,
        };

        setDestination(searchResult);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching address coordinates:', err);
        setError(t('agent.addressNotFound'));
        setIsLoading(false);
      }
    };

    fetchAddressCoordinates();
  }, [deliveryUAC, t]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('routing.calculating')}</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-lg font-semibold">{t('routing.destinationError')}</h2>
            <p className="text-muted-foreground">{error || t('agent.addressNotFound')}</p>
            <Button onClick={onClose}>{t('routing.close')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <GoogleMapsDirectionsView
      destination={destination}
      onClose={onClose}
    />
  );
};
