import React from 'react';
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
import ApiWebhookManager from './ApiWebhookManager';
import NotificationTester from './NotificationTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Hash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminPanel: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { loading, hasAdminAccess, hasNDAAAccess, hasSystemAdminAccess } = useUserRole();
  const { t } = useLanguage();

  if (!user || !hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('rolePermissionManagement')}
          </CardTitle>
          <CardDescription>
            {!user ? t('pleaseLogInToAccess') : 'Administrator access required'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{t('loadingRoleInformation')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1">
          <TabsTrigger value="roles" className="text-xs sm:text-sm px-2 sm:px-3">{t('roleManagement')}</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs sm:text-sm px-2 sm:px-3">{t('permissions')}</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs sm:text-sm px-2 sm:px-3">{t('workflows')}</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-3">{t('userManagement')}</TabsTrigger>
          <TabsTrigger value="uac" className="text-xs sm:text-sm px-2 sm:px-3">{t('uacSystem')}</TabsTrigger>
          <TabsTrigger value="documentation" className="text-xs sm:text-sm px-2 sm:px-3">Documentation</TabsTrigger>
          {hasNDAAAccess && (
            <TabsTrigger value="api-webhooks" className="text-xs sm:text-sm px-2 sm:px-3">{t('apiWebhooks')}</TabsTrigger>
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
        
        <TabsContent value="documentation">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">System Roles Documentation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate comprehensive documentation for all user roles, permissions, and system workflows.
                  </p>
                  <RolesDocumentGenerator />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">User Manual</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate user manual with step-by-step guides and platform instructions.
                  </p>
                  <SystemManualPDF />
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