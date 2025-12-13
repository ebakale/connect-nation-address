import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Key, Copy, Eye, EyeOff, Trash2, Plus, Info, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scope: string[];
  created: string;
  lastUsed: string | null;
  status: 'active' | 'inactive' | 'expired';
}

export const IntegrationAPIManager = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { toast } = useToast();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedKeys: APIKey[] = (data || []).map(key => ({
        id: key.id,
        name: key.name,
        key_prefix: key.key_prefix,
        scope: key.service ? [key.service] : [],
        created: new Date(key.created_at).toLocaleDateString(),
        lastUsed: key.last_used_at ? new Date(key.last_used_at).toLocaleString() : null,
        status: key.status as 'active' | 'inactive' | 'expired'
      }));

      setApiKeys(formattedKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      const keyPrefix = `bk_live_${crypto.randomUUID().slice(0, 20)}`;
      const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(keyPrefix));
      const hashArray = Array.from(new Uint8Array(keyHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyName,
          key_prefix: keyPrefix,
          key_hash: hashHex,
          service: 'general',
          status: 'active'
        });

      if (error) throw error;

      await fetchApiKeys();
      setIsCreateDialogOpen(false);
      setNewKeyName('');
      
      toast({
        title: t('common:success'),
        description: t('dashboard:apiKeyCreated'),
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchApiKeys();
      toast({
        title: t('common:success'),
        description: 'API key deleted',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common:copied'),
      description: `${label} ${t('common:copiedToClipboard')}`,
    });
  };

  const getStatusBadge = (status: APIKey['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">{t('dashboard:active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('dashboard:inactive')}</Badge>;
      case 'expired':
        return <Badge variant="destructive">{t('dashboard:expired')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          {t('dashboard:apiKeySecurityWarning')}
        </AlertDescription>
      </Alert>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('dashboard:apiDocumentation')}
          </CardTitle>
          <CardDescription>{t('dashboard:apiDocumentationDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('dashboard:baseUrl')}</h4>
              <code className="text-sm bg-muted p-2 rounded block break-all overflow-x-auto">
                https://calegudnfdbeznyiebbh.supabase.co/functions/v1
              </code>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('dashboard:authentication')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('dashboard:bearerTokenAuth')}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('dashboard:rateLimit')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('dashboard:rateLimitPerKey')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">{t('dashboard:availableEndpoints')}</h4>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
              <div>GET /address-search-api - {t('dashboard:searchAddresses')}</div>
              <div>POST /address-validation-api - {t('dashboard:validateAddress')}</div>
              <div>GET /government-integration-api - {t('dashboard:governmentData')}</div>
              <div>POST /webhook-events - {t('dashboard:webhookEvents')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('dashboard:apiKeys')}
              </CardTitle>
              <CardDescription>{t('dashboard:manageApiKeys')}</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('dashboard:createApiKey')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dashboard:createNewApiKey')}</DialogTitle>
                  <DialogDescription>
                    {t('dashboard:createNewApiKeyDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">{t('dashboard:keyName')}</Label>
                    <Input id="key-name" placeholder={t('dashboard:apiKeyPlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('dashboard:permissions')}</Label>
                    <div className="space-y-2">
                      {/* Add permission checkboxes here */}
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard:selectPermissions')}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('common:buttons.cancel')}
                  </Button>
                  <Button onClick={() => {
                    setIsCreateDialogOpen(false);
                    toast({
                      title: t('common:success'),
                      description: t('dashboard:apiKeyCreated'),
                    });
                  }}>
                    {t('common:buttons.create')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard:name')}</TableHead>
                <TableHead>{t('dashboard:apiKey')}</TableHead>
                <TableHead>{t('dashboard:scope')}</TableHead>
                <TableHead>{t('dashboard:lastUsed')}</TableHead>
                <TableHead>{t('dashboard:status')}</TableHead>
                <TableHead className="text-right">{t('common:actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">
                        {showKey === key.id ? key.key_prefix : '••••••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      >
                        {showKey === key.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key.key_prefix, t('dashboard:apiKey'))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.scope.slice(0, 2).map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {key.scope.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{key.scope.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.lastUsed}
                  </TableCell>
                  <TableCell>{getStatusBadge(key.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};