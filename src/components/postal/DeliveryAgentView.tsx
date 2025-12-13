import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export const DeliveryAgentView = () => {
  const { t } = useTranslation('postal');

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">{t('delivery.myDeliveries')}</h3>
        <p className="text-muted-foreground">{t('messages.noOrdersFound')}</p>
      </CardContent>
    </Card>
  );
};
