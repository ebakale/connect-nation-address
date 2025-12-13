import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Webhook, Eye, EyeOff, Plus, Trash2, Edit, Loader2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  service: string;
  status: string;
  last_used_at?: string;
  key_prefix: string;
  created_at: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  last_triggered_at?: string;
}

const ApiWebhookManager: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState({ name: '', service: '', key: '' });
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableEvents = [
    'address.created',
    'address.verified',
    'address.rejected',
    'address.flagged',
    'user.created',
    'user.role_changed',
    'system.backup_completed'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysResponse, webhooksResponse] = await Promise.all([
        supabase.from('api_keys').select('*').order('created_at', { ascending: false }),
        supabase.from('webhook_configs').select('*').order('created_at', { ascending: false })
      ]);

      if (keysResponse.error) throw keysResponse.error;
      if (webhooksResponse.error) throw webhooksResponse.error;

      setApiKeys(keysResponse.data || []);
      setWebhooks(webhooksResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('common:error'),
        description: t('dashboard:fetchError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const hashKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAddApiKey = async () => {
    if (!newApiKey.name || !newApiKey.service || !newApiKey.key) {
      toast({
        title: t('common:error'),
        description: t('dashboard:fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const keyHash = await hashKey(newApiKey.key);
      const keyPrefix = newApiKey.key.substring(0, 8) + '***';

      const { error } = await supabase.from('api_keys').insert({
        name: newApiKey.name,
        service: newApiKey.service,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        status: 'active',
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      setNewApiKey({ name: '', service: '', key: '' });
      await fetchData();
      
      toast({
        title: t('common:success'),
        description: t('dashboard:apiKeyAddedSuccess'),
      });
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: t('common:error'),
        description: t('dashboard:apiKeyAddError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: t('common:error'),
        description: t('dashboard:webhookFieldsRequired'),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('webhook_configs').insert({
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        status: 'active',
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      setNewWebhook({ name: '', url: '', events: [] });
      await fetchData();
      
      toast({
        title: t('common:success'),
        description: t('dashboard:webhookAddedSuccess'),
      });
    } catch (error) {
      console.error('Error adding webhook:', error);
      toast({
        title: t('common:error'),
        description: t('dashboard:webhookAddError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', keyId);
      if (error) throw error;

      await fetchData();
      toast({
        title: t('common:success'),
        description: t('dashboard:apiKeyDeletedSuccess'),
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: t('common:error'),
        description: t('dashboard:apiKeyDeleteError'),
        variant: 'destructive',
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase.from('webhook_configs').delete().eq('id', webhookId);
      if (error) throw error;

      await fetchData();
      toast({
        title: t('common:success'),
        description: t('dashboard:webhookDeletedSuccess'),
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: t('common:error'),
        description: t('dashboard:webhookDeleteError'),
        variant: 'destructive',
      });
    }
  };

  const toggleWebhookStatus = async (webhookId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('webhook_configs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', webhookId);

      if (error) throw error;

      await fetchData();
    } catch (error) {
      console.error('Error toggling webhook status:', error);
    }
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'Test webhook from Connect Nation Address System' }
        }),
      });

      if (response.ok) {
        // Update last triggered
        await supabase
          .from('webhook_configs')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', webhook.id);

        toast({
          title: t('common:success'),
          description: t('dashboard:webhookTestSuccess'),
        });
      } else {
        throw new Error('Webhook test failed');
      }
    } catch (error) {
      // Update failure count
      await supabase
        .from('webhook_configs')
        .update({ failure_count: (webhook as any).failure_count + 1 || 1 })
        .eq('id', webhook.id);

      toast({
        title: t('common:error'),
        description: t('dashboard:webhookTestFailed'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('dashboard:apiKeysWebhooksManagement')}
          </CardTitle>
          <CardDescription>
            {t('dashboard:manageApiKeysWebhooks')}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api-keys">{t('dashboard:apiKeys')}</TabsTrigger>
          <TabsTrigger value="webhooks">{t('dashboard:webhooks')}</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard:activeApiKeys')}</CardTitle>
              <CardDescription>{t('dashboard:manageApiKeysForServices')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t('dashboard:noApiKeys')}</p>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{key.name}</h4>
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{key.service}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showApiKey[key.id] ? key.key_prefix : key.key_prefix.replace(/./g, '*')}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => toggleApiKeyVisibility(key.id)}>
                          {showApiKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {key.last_used_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('dashboard:lastUsed')}: {new Date(key.last_used_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('dashboard:deleteApiKey')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('dashboard:deleteApiKeyConfirm')}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteApiKey(key.id)}>
                              {t('common:buttons.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('dashboard:addNewApiKey')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="api-name">{t('dashboard:name')}</Label>
                      <Input
                        id="api-name"
                        placeholder={t('dashboard:apiKeyNamePlaceholder')}
                        value={newApiKey.name}
                        onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="api-service">{t('dashboard:service')}</Label>
                      <Input
                        id="api-service"
                        placeholder={t('dashboard:servicePlaceholder')}
                        value={newApiKey.service}
                        onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="api-key">{t('dashboard:apiKey')}</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder={t('dashboard:enterApiKey')}
                      value={newApiKey.key}
                      onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddApiKey} className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {t('dashboard:addApiKey')}
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard:webhookConfigurations')}</CardTitle>
              <CardDescription>{t('dashboard:configureWebhooksDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhooks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t('dashboard:noWebhooks')}</p>
              ) : (
                webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{webhook.name}</h4>
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{webhook.url}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                        ))}
                      </div>
                      {webhook.last_triggered_at && (
                        <p className="text-xs text-muted-foreground">
                          {t('dashboard:lastTriggered')}: {new Date(webhook.last_triggered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => testWebhook(webhook)}>
                        {t('dashboard:test')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleWebhookStatus(webhook.id, webhook.status)}
                      >
                        {webhook.status === 'active' ? t('common:buttons.disable') : t('common:buttons.enable')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('dashboard:deleteWebhook')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('dashboard:deleteWebhookConfirm')}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteWebhook(webhook.id)}>
                              {t('common:buttons.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('dashboard:addNewWebhook')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="webhook-name">{t('dashboard:name')}</Label>
                      <Input
                        id="webhook-name"
                        placeholder={t('dashboard:webhookNamePlaceholder')}
                        value={newWebhook.name}
                        onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-url">{t('dashboard:webhookUrl')}</Label>
                      <Input
                        id="webhook-url"
                        placeholder={t('dashboard:webhookUrlPlaceholder')}
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t('dashboard:eventsToSubscribe')}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableEvents.map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                              } else {
                                setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(ev => ev !== event) });
                              }
                            }}
                          />
                          <span className="text-sm">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddWebhook} className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Webhook className="h-4 w-4 mr-2" />}
                    {t('dashboard:addWebhook')}
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiWebhookManager;
