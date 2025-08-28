import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
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
  const { t } = useTranslation('addresses');
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
        title: "Error",
        description: "Please fill in all required fields",
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
      title: "Success",
      description: "API key added successfully",
    });
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one event",
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
      title: "Success",
      description: "Webhook added successfully",
    });
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const deleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast({
      title: "Success",
      description: "API key deleted successfully",
    });
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== webhookId));
    toast({
      title: "Success",
      description: "Webhook deleted successfully",
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
          title: "Success",
          description: "Webhook test successful",
        });
      } else {
        throw new Error('Webhook test failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Webhook test failed. Please check the URL and try again.",
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
            API Keys & Webhooks Management
          </CardTitle>
          <CardDescription>
            Manage API keys for external services and configure webhooks for system events
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active API Keys</CardTitle>
              <CardDescription>
                Manage API keys for external services like Mapbox, OpenAI, etc.
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
                      <p className="text-xs text-muted-foreground mt-1">Last used: {key.lastUsed}</p>
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
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this API key? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteApiKey(key.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New API Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="api-name">Name</Label>
                      <Input
                        id="api-name"
                        placeholder="e.g., Mapbox Token"
                        value={newApiKey.name}
                        onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="api-service">Service</Label>
                      <Input
                        id="api-service"
                        placeholder="e.g., Mapbox"
                        value={newApiKey.service}
                        onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API key"
                      value={newApiKey.key}
                      onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddApiKey} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add API Key
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Webhook Configurations</CardTitle>
              <CardDescription>
                Configure webhooks to receive notifications about system events
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
                      <p className="text-xs text-muted-foreground">Last triggered: {webhook.lastTriggered}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testWebhook(webhook)}
                    >
                      Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleWebhookStatus(webhook.id)}
                    >
                      {webhook.status === 'active' ? 'Disable' : 'Enable'}
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
                          <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this webhook? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteWebhook(webhook.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Webhook</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="webhook-name">Name</Label>
                      <Input
                        id="webhook-name"
                        placeholder="e.g., Address Notifications"
                        value={newWebhook.name}
                        onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://your-service.com/webhook"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Events to Subscribe To</Label>
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
                    Add Webhook
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">External Management</CardTitle>
          <CardDescription>
            For advanced configuration, access the Supabase dashboard
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
              Open Supabase Secrets Dashboard
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiWebhookManager;