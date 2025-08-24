import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { UnitFieldDashboard } from '@/components/UnitFieldDashboard';
import { Card, CardContent } from '@/components/ui/card';

export const UnitDashboardPage: React.FC = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has police field access
  const hasFieldAccess = ['police_operator', 'police_dispatcher', 'police_supervisor', 'admin'].includes(role || '');

  if (!hasFieldAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              You need police personnel privileges to access the unit field dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <UnitFieldDashboard />;
};