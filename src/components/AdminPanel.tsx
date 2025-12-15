import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { PermissionMatrix } from './PermissionMatrix';
import { WorkflowManager } from './WorkflowManager';
import UserManager from './UserManager';
import { UACManager } from './UACManager';
import { RolesDocumentGenerator } from './RolesDocumentGenerator';
import { SystemManualPDF } from './SystemManualPDF';
import { StrategicOverviewPDF } from './StrategicOverviewPDF';
import { QualityDashboard } from './QualityDashboard';
import ApiWebhookManager from './ApiWebhookManager';
import NotificationTester from './NotificationTester';
import { GoogleMapsImporter } from './GoogleMapsImporter';
import { NARCARTestPanel } from './NARCARTestPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Hash } from 'lucide-react';
import { NARAuthorityManager } from './NARAuthorityManager';
import { CARPermissionsManager } from './CARPermissionsManager';
import { TranslationAuditTool } from './TranslationAuditTool';

const AdminPanel: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const { user } = useUnifiedAuth();
  const { loading, hasAdminAccess, hasNDAAAccess, hasSystemAdminAccess } = useUserRole();

  if (!user || !hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('admin:rolePermissionManagement')}
          </CardTitle>
          <CardDescription>
            {!user ? t('admin:pleaseLogInToAccess') : t('admin:adminAccessRequired')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{t('admin:loadingRoleInformation')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      <Tabs defaultValue="users" className="space-y-6">
        <div className="border-b overflow-x-auto">
          <TabsList className="h-auto p-1 bg-muted/50 flex flex-wrap gap-1 rounded-lg min-w-max sm:min-w-0">
            <TabsTrigger value="users" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('userManagement')}
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('permissions')}
            </TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('workflows')}
            </TabsTrigger>
            <TabsTrigger value="nar-authorities" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('narAuthorities')}
            </TabsTrigger>
            <TabsTrigger value="uac" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('uacSystem')}
            </TabsTrigger>
            <TabsTrigger value="quality" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('qualityTab')}
            </TabsTrigger>
            <TabsTrigger value="system-tools" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('systemTools')}
            </TabsTrigger>
            <TabsTrigger value="translations" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('admin:translations')}
            </TabsTrigger>
            <TabsTrigger value="documentation" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('admin:documentation')}
            </TabsTrigger>
            {hasNDAAAccess && (
              <TabsTrigger value="api-webhooks" className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                {t('admin:apiWebhooks')}
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <TabsContent value="users">
          <UserManager />
        </TabsContent>
        
        <TabsContent value="permissions">
          <PermissionMatrix />
        </TabsContent>
        
        <TabsContent value="workflows">
          <WorkflowManager />
        </TabsContent>
        
        <TabsContent value="nar-authorities">
          <div className="space-y-6">
            <Alert>
              <Hash className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> CAR-specific permissions are now managed in the dedicated CAR Admin interface. 
                Access via the CAR Administration dashboard for comprehensive management.
              </AlertDescription>
            </Alert>
            <NARAuthorityManager />
          </div>
        </TabsContent>
        
        <TabsContent value="uac">
          <UACManager />
        </TabsContent>
        
        
        <TabsContent value="system-tools">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('admin:systemTools')}</h2>
                <p className="text-muted-foreground">{t('admin:systemToolsDescription')}</p>
              </div>
            </div>
            {hasSystemAdminAccess && <GoogleMapsImporter />}
            <NARCARTestPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="quality" key={i18n.resolvedLanguage || i18n.language}>
          <QualityDashboard />
        </TabsContent>
        
        <TabsContent value="translations">
          <TranslationAuditTool />
        </TabsContent>
        
        <TabsContent value="documentation">
          <div className="space-y-6">
            {/* Document Generators - Top section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{t('admin:documentGenerators')}</h2>
                  <p className="text-sm text-muted-foreground">{t('admin:documentGeneratorsDescription')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">{t('admin:systemRolesDocumentation')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('admin:generateComprehensiveDocumentation')}
                    </p>
                    <RolesDocumentGenerator />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">{t('admin:userManual')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('admin:generateUserManualDescription')}
                    </p>
                    <SystemManualPDF />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">{t('strategicOverview.title')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('admin:strategicOverviewDescription')}
                    </p>
                    <StrategicOverviewPDF />
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Additional documentation features */}
            <div className="border-t pt-6">
              <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">{t('admin:additionalDocumentationFeatures')}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {hasNDAAAccess && (
          <TabsContent value="api-webhooks">
            <ApiWebhookManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminPanel;