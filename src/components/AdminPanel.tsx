import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { RoleManager } from './RoleManager';
import { PermissionMatrix } from './PermissionMatrix';
import { WorkflowManager } from './WorkflowManager';
import UserManager from './UserManager';
import { UACManager } from './UACManager';
import ApiWebhookManager from './ApiWebhookManager';
import NotificationTester from './NotificationTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { loading } = useUserRole();
  const { t } = useTranslation('dashboard');

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('rolePermissionManagement')}
          </CardTitle>
          <CardDescription>
            {t('pleaseLogInToAccess')}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('rolePermissionManagement')}
          </CardTitle>
          <CardDescription>
            {t('manageUserRoles')}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1">
          <TabsTrigger value="roles" className="text-xs sm:text-sm px-2 sm:px-3">{t('roleManagement')}</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs sm:text-sm px-2 sm:px-3">{t('permissions')}</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs sm:text-sm px-2 sm:px-3">{t('workflows')}</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-3">{t('userManagement')}</TabsTrigger>
          <TabsTrigger value="uac" className="text-xs sm:text-sm px-2 sm:px-3">{t('uacSystem')}</TabsTrigger>
          <TabsTrigger value="api-webhooks" className="text-xs sm:text-sm px-2 sm:px-3">{t('apiWebhooks')}</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-3">Notifications</TabsTrigger>
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
        
        <TabsContent value="api-webhooks">
          <ApiWebhookManager />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;