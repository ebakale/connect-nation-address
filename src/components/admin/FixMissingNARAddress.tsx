import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, Database } from 'lucide-react';

export const FixMissingNARAddress: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixAddress = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-missing-nar-address');

      if (error) {
        throw new Error(error.message);
      }

      setResult(data);
      
      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        setCompleted(true);
      } else {
        toast({
          title: 'Info',
          description: data.message,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error fixing NAR address:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fix address',
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
          <Database className="h-5 w-5" />
          Fix Missing NAR Address
        </CardTitle>
        <CardDescription>
          Create the missing NAR address entry for UAC GQ-LI-BAT-FC3778-BH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>UAC:</strong> GQ-LI-BAT-FC3778-BH</p>
            <p><strong>Address:</strong> Carretera Bome, Bata, Litoral</p>
            <p><strong>Issue:</strong> Address approved but missing from NAR table</p>
          </div>

          {result && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium text-foreground">Result:</p>
              <pre className="mt-1 text-xs text-muted-foreground overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <Button 
            onClick={fixAddress} 
            disabled={loading || completed}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Address...
              </>
            ) : completed ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Address Created
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Create Missing NAR Address
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
