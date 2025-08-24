import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { UnitManagementDashboard } from '@/components/UnitManagementDashboard';
import { OfficerProfileDashboard } from '@/components/OfficerProfileDashboard';
import { Card, CardContent } from '@/components/ui/card';

export const UnitsAndProfilesPage: React.FC = () => {
  const { role, loading } = useUserRole();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has supervisor or admin access
  const hasManagementAccess = ['admin', 'police_supervisor'].includes(role || '');

  if (!hasManagementAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              You need supervisor or admin privileges to access unit management and officer profiles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Unit Management Section */}
      <section>
        <UnitManagementDashboard onClose={() => navigate('/police')} />
      </section>
      
      {/* Officer Profiles Section */}
      <section>
        <OfficerProfileDashboard />
      </section>
    </div>
  );
};