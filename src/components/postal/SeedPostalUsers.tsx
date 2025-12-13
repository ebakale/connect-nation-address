import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Loader2, CheckCircle } from 'lucide-react';

export const SeedPostalUsers: React.FC = () => {
  const { t } = useTranslation(['postal']);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const seedUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-postal-users');

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: t('actions.success'),
        description: `${data.message}`,
      });

      setCompleted(true);
    } catch (error) {
      console.error('Error seeding postal users:', error);
      toast({
        title: t('actions.error'),
        description: error instanceof Error ? error.message : 'Failed to create postal users',
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
          <Users className="h-5 w-5" />
          {t('actions.createTestUsers')}
        </CardTitle>
        <CardDescription>
          {t('messages.seedDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>postal.supervisor@gov.gq</strong> - Postal Supervisor (María García)</p>
            <p><strong>postal.dispatcher@gov.gq</strong> - Postal Dispatcher (Carlos Mendez)</p>
            <p><strong>postal.clerk@gov.gq</strong> - Postal Clerk (Ana López)</p>
            <p><strong>postal.agent1@gov.gq</strong> - Delivery Agent (Pedro Santos)</p>
            <p><strong>postal.agent2@gov.gq</strong> - Delivery Agent (Luis Obiang)</p>
          </div>

          <Button 
            onClick={seedUsers} 
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
                {t('actions.usersCreated')}
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                {t('actions.createTestUsers')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
