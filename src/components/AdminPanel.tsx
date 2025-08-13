import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Crown } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const { user } = useAuth();
  const { role, isAdmin } = useUserRole();
  const { toast } = useToast();

  const makeCurrentUserAdmin = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You are now an admin! Please refresh the page.",
      });
    } catch (error: any) {
      console.error('Error making user admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign admin role",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Please log in to access admin features
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Manage user roles and system administration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Your current role:</span>
            <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
              {role || 'user'}
            </Badge>
          </div>

          {!isAdmin && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4" />
                Become Admin (Testing)
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                For testing purposes, you can make yourself an admin to manage all addresses.
              </p>
              <Button onClick={makeCurrentUserAdmin} variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Make Me Admin
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Admin Access Enabled
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                You now have admin access and can manage all addresses in the system.
                Go to the Manage Addresses page to see all addresses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;