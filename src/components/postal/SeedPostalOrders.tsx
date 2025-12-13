import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Loader2, CheckCircle } from 'lucide-react';

export const SeedPostalOrders: React.FC = () => {
  const { t } = useTranslation(['postal']);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState<{ orders: number; assignments: number; logs: number } | null>(null);

  const seedOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-postal-orders');

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: t('actions.success'),
        description: data.message,
      });

      setStats({
        orders: data.orders,
        assignments: data.assignments,
        logs: data.logs,
      });
      setCompleted(true);
    } catch (error) {
      console.error('Error seeding postal orders:', error);
      toast({
        title: t('actions.error'),
        description: error instanceof Error ? error.message : 'Failed to create delivery orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('actions.createTestOrders')}
        </CardTitle>
        <CardDescription>
          {t('messages.seedOrdersDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>19 delivery orders</strong> with various statuses:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>3 Pending Intake (new orders)</li>
              <li>2 Ready for Assignment</li>
              <li>3 Assigned to agents</li>
              <li>3 Out for Delivery</li>
              <li>4 Delivered (completed)</li>
              <li>2 Failed Delivery</li>
              <li>1 Address Not Found</li>
              <li>1 Returned to Sender</li>
            </ul>
          </div>

          {stats && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium text-foreground">Created:</p>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                <li>• {stats.orders} delivery orders</li>
                <li>• {stats.assignments} assignments</li>
                <li>• {stats.logs} status logs</li>
              </ul>
            </div>
          )}

          <Button 
            onClick={seedOrders} 
            disabled={loading || completed}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('actions.creating')}
              </>
            ) : completed ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('actions.ordersCreated')}
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                {t('actions.createTestOrders')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
