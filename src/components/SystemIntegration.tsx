import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Network,
  Webhook,
  Key,
  Database,
  Activity,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Link,
  Shield,
  Zap
} from 'lucide-react';
import ApiWebhookManager from './ApiWebhookManager';
import { IntegrationAPIManager } from './IntegrationAPIManager';
import { IntegrationHealthMonitor } from './IntegrationHealthMonitor';
import { ExternalSystemsManager } from './ExternalSystemsManager';

export const SystemIntegration = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" />
          {t('dashboard:systemIntegration')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard:systemIntegrationDesc')}
        </p>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:activeIntegrations')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">{t('dashboard:workingProperly')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:apiEndpoints')}</CardTitle>
            <Link className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">{t('dashboard:availableEndpoints')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:webhooks')}</CardTitle>
            <Webhook className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">{t('dashboard:activeWebhooks')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:systemHealth')}</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{t('dashboard:healthy')}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard:allSystemsOperational')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Network className="h-4 w-4" />
            {t('dashboard:overview')}
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            {t('dashboard:apiManagement')}
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            {t('dashboard:webhooks')}
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-2">
            <Database className="h-4 w-4" />
            {t('dashboard:externalSystems')}
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Activity className="h-4 w-4" />
            {t('dashboard:monitoring')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {t('dashboard:integrationSecurityNote')}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NAR-CAR Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {t('dashboard:narCarIntegration')}
                </CardTitle>
                <CardDescription>{t('dashboard:narCarIntegrationDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:status')}</span>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t('dashboard:active')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:lastSync')}</span>
                  <span className="text-sm text-muted-foreground">2 {t('dashboard:minutesAgo')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:syncMode')}</span>
                  <Badge variant="outline">{t('dashboard:realTime')}</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t('common:buttons.refresh')}
                </Button>
              </CardContent>
            </Card>

            {/* Government Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  {t('dashboard:governmentIntegration')}
                </CardTitle>
                <CardDescription>{t('dashboard:governmentIntegrationDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:status')}</span>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t('dashboard:active')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:endpoint')}</span>
                  <Badge variant="outline">/api/government</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:authentication')}</span>
                  <Badge variant="outline">{t('dashboard:oauth2')}</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Settings className="h-4 w-4" />
                  {t('common:buttons.configure')}
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Services Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  {t('dashboard:emergencyServicesIntegration')}
                </CardTitle>
                <CardDescription>{t('dashboard:emergencyServicesIntegrationDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:status')}</span>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t('dashboard:active')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:responseTime')}</span>
                  <span className="text-sm text-muted-foreground">120ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard:priority')}</span>
                  <Badge variant="destructive">{t('dashboard:critical')}</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Activity className="h-4 w-4" />
                  {t('dashboard:viewLogs')}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:quickActions')}</CardTitle>
                <CardDescription>{t('dashboard:commonIntegrationTasks')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Key className="h-4 w-4" />
                  {t('dashboard:generateApiKey')}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Webhook className="h-4 w-4" />
                  {t('dashboard:createWebhook')}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Database className="h-4 w-4" />
                  {t('dashboard:testConnection')}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Activity className="h-4 w-4" />
                  {t('dashboard:viewSystemLogs')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Management Tab */}
        <TabsContent value="api" className="space-y-6">
          <IntegrationAPIManager />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <ApiWebhookManager />
        </TabsContent>

        {/* External Systems Tab */}
        <TabsContent value="external" className="space-y-6">
          <ExternalSystemsManager />
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <IntegrationHealthMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};