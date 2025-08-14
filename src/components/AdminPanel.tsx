import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { RoleManager } from './RoleManager';
import { Shield } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { loading } = useUserRole();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role & Permission Management
          </CardTitle>
          <CardDescription>
            Please log in to access role management features
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading role information...</p>
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
            Role & Permission Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions for the National Digital Address System
          </CardDescription>
        </CardHeader>
      </Card>
      
      <RoleManager />
    </div>
  );
};

export default AdminPanel;