import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const SeedCitizenDeliveries = () => {
  const { t } = useTranslation('postal');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState<{ ordersCreated: number; citizenAddressesCreated: number } | null>(null);

  const seedDeliveries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-citizen-deliveries');

      if (error) {
        console.error('Error seeding citizen deliveries:', error);
        toast.error(t('seedCitizenDeliveries.error', 'Failed to seed citizen deliveries'));
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setStats({
        ordersCreated: data.data.ordersCreated,
        citizenAddressesCreated: data.data.citizenAddressesCreated
      });
      setCompleted(true);
      toast.success(t('seedCitizenDeliveries.success', 'Citizen deliveries seeded successfully'));
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(t('seedCitizenDeliveries.error', 'Failed to seed citizen deliveries'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('seedCitizenDeliveries.title', 'Seed Citizen Deliveries')}
        </CardTitle>
        <CardDescription>
          {t('seedCitizenDeliveries.description', 'Create test delivery orders for Josefina Nguema to test the My Deliveries feature')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>{t('seedCitizenDeliveries.willCreate', 'This will create:')}</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>{t('seedCitizenDeliveries.personRecord', 'Person record for Josefina Nguema')}</li>
            <li>{t('seedCitizenDeliveries.citizenAddresses', 'Citizen address entries linked to verified UACs')}</li>
            <li>{t('seedCitizenDeliveries.deliveryOrders', '4 delivery orders with different statuses')}</li>
            <li>{t('seedCitizenDeliveries.statusLogs', 'Status logs showing delivery timeline')}</li>
          </ul>
        </div>

        {stats && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p><strong>{t('seedCitizenDeliveries.ordersCreated', 'Orders created')}:</strong> {stats.ordersCreated}</p>
            <p><strong>{t('seedCitizenDeliveries.addressesCreated', 'Addresses linked')}:</strong> {stats.citizenAddressesCreated}</p>
          </div>
        )}

        <Button
          onClick={seedDeliveries}
          disabled={loading || completed}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('seedCitizenDeliveries.seeding', 'Seeding...')}
            </>
          ) : completed ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('seedCitizenDeliveries.completed', 'Completed')}
            </>
          ) : (
            t('seedCitizenDeliveries.button', 'Seed Citizen Deliveries')
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
