import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Key, Webhook, Eye, EyeOff, Plus, Trash2, Edit, ExternalLink } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  service: string;
  status: 'active' | 'inactive';
  lastUsed?: string;
  masked: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
}

const ApiWebhookManager: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState({ name: '', service: '', key: '' });
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });

  // Mock data - in real implementation, this would come from Supabase
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Mapbox Token',
      service: 'Mapbox',
      status: 'active',
      lastUsed: '2 hours ago',
      masked: 'pk.eyJ1Ijoi****************************'
    },
    {
      id: '2',
      name: 'OpenAI API Key',
      service: 'OpenAI',
      status: 'active',
      lastUsed: '1 day ago',
      masked: 'sk-****************************'
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Address Verification Webhook',
      url: 'https://api.external-service.com/webhook',
      events: ['address.verified', 'address.rejected'],
      status: 'active',
      lastTriggered: '3 hours ago'
    },
    {
      id: '2',
      name: 'User Registration Webhook',
      url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef',
      events: ['user.created', 'user.role_changed'],
      status: 'inactive'
    }
  ]);

  const availableEvents = [
    'address.created',
    'address.verified',
    'address.rejected',
    'address.flagged',
    'user.created',
    'user.role_changed',
    'system.backup_completed'
  ];

  const handleAddApiKey = () => {
    if (!newApiKey.name || !newApiKey.service || !newApiKey.key) {
      toast({
        title: t('common:error'),
        description: t('dashboard:fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      service: newApiKey.service,
      status: 'active',
      masked: newApiKey.key.substring(0, 8) + '*'.repeat(20)
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKey({ name: '', service: '', key: '' });
    
    toast({
      title: t('common:success'),
      description: t('dashboard:apiKeyAddedSuccess'),
    });
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: t('common:error'),
        description: t('dashboard:webhookFieldsRequired'),
        variant: "destructive",
      });
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'active'
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    
    toast({
      title: t('common:success'),
      description: t('dashboard:webhookAddedSuccess'),
    });
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const deleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast({
      title: t('common:success'),
      description: t('dashboard:apiKeyDeletedSuccess'),
    });
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== webhookId));
    toast({
      title: t('common:success'),
      description: t('dashboard:webhookDeletedSuccess'),
    });
  };

  const toggleWebhookStatus = (webhookId: string) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
        : webhook
    ));
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'Test webhook from Connect Nation Address System' }
        }),
      });

      if (response.ok) {
        toast({
          title: t('common:success'),
          description: t('dashboard:webhookTestSuccess'),
        });
      } else {
        throw new Error('Webhook test failed');
      }
    } catch (error) {
      toast({
        title: t('common:error'),
        description: t('dashboard:webhookTestFailed'),
        variant: "destructive",
      });
    }
  };

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
              <CardDescription>
                {t('dashboard:manageApiKeysForServices')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((key) => (
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
                        {showApiKey[key.id] ? 'pk.eyJ1Ijoi...[HIDDEN_FOR_SECURITY]' : key.masked}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiKeyVisibility(key.id)}
                      >
                        {showApiKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                     {key.lastUsed && (
                       <p className="text-xs text-muted-foreground mt-1">{t('dashboard:lastUsed')}: {key.lastUsed}</p>
                     )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                       <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('dashboard:deleteApiKey')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('dashboard:deleteApiKeyConfirm')}
                          </AlertDialogDescription>
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
              ))}

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
                  <Button onClick={handleAddApiKey} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
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
              <CardDescription>
                {t('dashboard:configureWebhooksDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhooks.map((webhook) => (
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
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    {webhook.lastTriggered && (
                      <p className="text-xs text-muted-foreground">{t('dashboard:lastTriggered')}: {webhook.lastTriggered}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testWebhook(webhook)}
                    >
                      {t('dashboard:test')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleWebhookStatus(webhook.id)}
                    >
                      {webhook.status === 'active' ? t('common:buttons.disable') : t('common:buttons.enable')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('dashboard:deleteWebhook')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('dashboard:deleteWebhookConfirm')}
                          </AlertDialogDescription>
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
              ))}

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
                                setNewWebhook({ 
                                  ...newWebhook, 
                                  events: [...newWebhook.events, event] 
                                });
                              } else {
                                setNewWebhook({ 
                                  ...newWebhook, 
                                  events: newWebhook.events.filter(e => e !== event) 
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddWebhook} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard:addWebhook')}
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard:externalManagement')}</CardTitle>
          <CardDescription>
            {t('dashboard:advancedConfigurationDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a 
              href="https://supabase.com/dashboard/project/calegudnfdbeznyiebbh/settings/functions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {t('dashboard:openSupabaseDashboard')}
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiWebhookManager;