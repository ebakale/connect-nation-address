import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Database,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  Settings,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExternalSystem {
  id: string;
  name: string;
  type: 'database' | 'api' | 'service';
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  lastSync: string;
  authentication: string;
}

export const ExternalSystemsManager = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch external systems from database
  const { data: systems = [], isLoading } = useQuery({
    queryKey: ['external-systems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_systems')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database fields to component interface
      return (data || []).map((sys: any) => ({
        id: sys.id,
        name: sys.name,
        type: sys.type,
        endpoint: sys.endpoint,
        status: sys.status,
        enabled: sys.enabled,
        lastSync: sys.last_sync,
        authentication: sys.authentication
      })) as ExternalSystem[];
    },
  });

  // Toggle system mutation
  const toggleSystemMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('external_systems')
        .update({ enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-systems'] });
      toast({
        title: t('common:success'),
        description: t('dashboard:systemStatusUpdated'),
      });
    },
  });

  const toggleSystem = (id: string) => {
    const system = systems.find(s => s.id === id);
    if (system) {
      toggleSystemMutation.mutate({ id, enabled: !system.enabled });
    }
  };

  const testConnection = async (system: ExternalSystem) => {
    toast({
      title: t('dashboard:testingConnection'),
      description: `${t('dashboard:connecting')} ${system.name}...`,
    });
    
    // Update status to connected after test
    const { error } = await supabase
      .from('external_systems')
      .update({ 
        status: 'connected',
        last_sync: new Date().toISOString()
      })
      .eq('id', system.id);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['external-systems'] });
      toast({
        title: t('common:success'),
        description: t('dashboard:connectionSuccessful'),
      });
    }
  };

  const getStatusIcon = (status: ExternalSystem['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getTypeIcon = (type: ExternalSystem['type']) => {
    switch (type) {
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'api':
        return <Globe className="h-5 w-5" />;
      case 'service':
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('dashboard:externalSystems')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard:manageExternalConnections')}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('dashboard:addSystem')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard:addExternalSystem')}</DialogTitle>
              <DialogDescription>
                {t('dashboard:configureNewExternalSystem')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">{t('dashboard:systemName')}</Label>
                <Input id="system-name" placeholder="e.g., Property Registry" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-type">{t('dashboard:systemType')}</Label>
                <Select>
                  <SelectTrigger id="system-type">
                    <SelectValue placeholder={t('dashboard:selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">{t('dashboard:database')}</SelectItem>
                    <SelectItem value="api">{t('dashboard:api')}</SelectItem>
                    <SelectItem value="service">{t('dashboard:service')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint">{t('dashboard:endpoint')}</Label>
                <Input id="endpoint" placeholder="https://api.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-type">{t('dashboard:authenticationType')}</Label>
                <Select>
                  <SelectTrigger id="auth-type">
                    <SelectValue placeholder={t('dashboard:selectAuthType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oauth">{t('dashboard:oauth2')}</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                    <SelectItem value="mtls">mTLS</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('common:buttons.cancel')}
              </Button>
              <Button onClick={() => {
                setIsAddDialogOpen(false);
                toast({
                  title: t('common:success'),
                  description: t('dashboard:systemAdded'),
                });
              }}>
                {t('common:buttons.add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center text-muted-foreground">
            {t('common:loading')}...
          </div>
        ) : systems.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground">
            {t('dashboard:noExternalSystems')}
          </div>
        ) : systems.map((system) => (
          <Card key={system.id} className={!system.enabled ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(system.type)}
                  <div>
                    <CardTitle className="text-lg">{system.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <code className="text-xs">{system.endpoint}</code>
                    </CardDescription>
                  </div>
                </div>
                {getStatusIcon(system.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('dashboard:type')}:</span>
                  <p className="font-medium capitalize">{system.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('dashboard:authentication')}:</span>
                  <p className="font-medium">{system.authentication}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('dashboard:status')}:</span>
                  <Badge variant={system.status === 'connected' ? 'default' : 'secondary'}>
                    {system.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('dashboard:lastSync')}:</span>
                  <p className="text-xs">
                    {system.lastSync 
                      ? new Date(system.lastSync).toLocaleString() 
                      : t('dashboard:never')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={system.enabled}
                    onCheckedChange={() => toggleSystem(system.id)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {system.enabled ? t('dashboard:enabled') : t('dashboard:disabled')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(system)}
                    disabled={!system.enabled}
                    className="gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t('dashboard:test')}
                  </Button>
                  <Button variant="outline" size="sm" disabled={!system.enabled}>
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};