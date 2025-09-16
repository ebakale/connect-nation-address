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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Hash } from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-1">
          <TabsTrigger value="roles" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:roleManagement')}</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:permissions')}</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:workflows')}</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:userManagement')}</TabsTrigger>
          <TabsTrigger value="uac" className="text-xs sm:text-sm px-2 sm:px-3">{t('admin:uacSystem')}</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs sm:text-sm px-2 sm:px-3">Quality</TabsTrigger>
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
        
        <TabsContent value="uac">
          <UACManager />
        </TabsContent>
        
        <TabsContent value="quality">
          <QualityDashboard />
        </TabsContent>
        
        <TabsContent value="documentation">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold mb-2">{t('admin:systemRolesDocumentation')}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {t('admin:generateComprehensiveDocumentation')}
                  </p>
                  <div className="mt-auto">
                    <RolesDocumentGenerator />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold mb-2">{t('admin:userManual')}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {t('admin:generateUserManualDescription')}
                  </p>
                  <div className="mt-auto">
                    <SystemManualPDF />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold mb-2">Strategic Overview</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    Strategic analysis and national benefits documentation for Equatorial Guinea
                  </p>
                  <div className="mt-auto">
                    <StrategicOverviewPDF />
                  </div>
                </div>
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