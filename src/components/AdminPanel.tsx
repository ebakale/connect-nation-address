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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Hash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { loading } = useUserRole();
  const { t } = useLanguage();

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="roles">{t('roleManagement')}</TabsTrigger>
          <TabsTrigger value="permissions">{t('permissions')}</TabsTrigger>
          <TabsTrigger value="workflows">{t('workflows')}</TabsTrigger>
          <TabsTrigger value="users">{t('userManagement')}</TabsTrigger>
          <TabsTrigger value="uac">{t('uacSystem')}</TabsTrigger>
          <TabsTrigger value="api-webhooks">{t('apiWebhooks')}</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default AdminPanel;