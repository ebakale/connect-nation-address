import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { RoleManager } from './RoleManager';
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
import { Shield, Hash } from 'lucide-react';
import { NARAuthorityManager } from './NARAuthorityManager';

const AdminPanel: React.FC = () => {
  const { t } = useTranslation(['admin']);
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
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 grid-rows-2 gap-1">
          <TabsTrigger value="roles" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:roleManagement')}</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:permissions')}</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:workflows')}</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:userManagement')}</TabsTrigger>
          <TabsTrigger value="nar-authorities" className="text-xs sm:text-sm px-2 sm:px-3">NAR Authorities</TabsTrigger>
          <TabsTrigger value="uac" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:uacSystem')}</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs sm:text-sm px-2 sm:px-3">Quality</TabsTrigger>
          <TabsTrigger value="system-tools" className="text-xs sm:text-sm px-2 sm:px-3">System Tools</TabsTrigger>
          <TabsTrigger value="documentation" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:documentation')}</TabsTrigger>
          {hasNDAAAccess && (
            <TabsTrigger value="api-webhooks" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:apiWebhooks')}</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="roles">
          <RoleManager />
        </TabsContent>
        
        <TabsContent value="permissions">
          <PermissionMatrix />
        </TabsContent>
        
        <TabsContent value="workflows">
          <WorkflowManager />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManager />
        </TabsContent>
        
        <TabsContent value="nar-authorities">
          <NARAuthorityManager />
        </TabsContent>
        
        <TabsContent value="uac">
          <UACManager />
        </TabsContent>
        
        
        <TabsContent value="system-tools">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">System Tools</h2>
                <p className="text-muted-foreground">Import addresses and test system integration</p>
              </div>
            </div>
            {hasSystemAdminAccess && <GoogleMapsImporter />}
            <NARCARTestPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="quality">
          <QualityDashboard />
        </TabsContent>
        
        <TabsContent value="documentation">
          <div className="space-y-6">
            {/* Document Generators - Top section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Document Generators</h2>
                  <p className="text-sm text-muted-foreground">Generate system documentation and reports</p>
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
                    <h3 className="font-semibold text-sm">Strategic Overview</h3>
                    <p className="text-xs text-muted-foreground">
                      Strategic analysis and national benefits documentation
                    </p>
                    <StrategicOverviewPDF />
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Additional documentation features */}
            <div className="border-t pt-6">
              <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">Additional documentation features can be added here</p>
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