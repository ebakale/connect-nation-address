import { useState } from 'react';
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
import { Key, Copy, Eye, EyeOff, Trash2, Plus, Info, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIKey {
  id: string;
  name: string;
  key: string;
  scope: string[];
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive' | 'expired';
}

export const IntegrationAPIManager = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { toast } = useToast();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Government Integration API',
      key: 'bk_live_a1b2c3d4e5f6g7h8i9j0',
      scope: ['address:read', 'address:write', 'verification:read'],
      created: '2025-01-10',
      lastUsed: '2025-01-15 14:23',
      status: 'active'
    },
    {
      id: '2',
      name: 'Emergency Services API',
      key: 'bk_live_k1l2m3n4o5p6q7r8s9t0',
      scope: ['incident:read', 'incident:write', 'location:read'],
      created: '2025-01-05',
      lastUsed: '2025-01-15 15:45',
      status: 'active'
    },
    {
      id: '3',
      name: 'Mobile App API (Old)',
      key: 'bk_live_u1v2w3x4y5z6a7b8c9d0',
      scope: ['address:read'],
      created: '2024-12-01',
      lastUsed: '2024-12-15 10:00',
      status: 'inactive'
    }
  ]);

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
              <code className="text-sm bg-muted p-2 rounded block">
                https://calegudnfdbeznyiebbh.supabase.co/functions/v1
              </code>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('dashboard:authentication')}</h4>
              <p className="text-sm text-muted-foreground">
                Bearer Token in Authorization header
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('dashboard:rateLimit')}</h4>
              <p className="text-sm text-muted-foreground">
                1000 requests/hour per key
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
                    <Input id="key-name" placeholder="e.g., Production API Key" />
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
                        {showKey === key.id ? key.key : '••••••••••••••••'}
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
                        onClick={() => copyToClipboard(key.key, t('dashboard:apiKey'))}
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