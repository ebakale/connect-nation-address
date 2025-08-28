import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { UnitManagementDashboard } from '@/components/UnitManagementDashboard';
import { OfficerProfileDashboard } from '@/components/OfficerProfileDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Footer from '@/components/Footer';

export const UnitsAndProfilesPage: React.FC = () => {
  const { role, loading } = useUserRole();
  const navigate = useNavigate();
  const { t } = useTranslation('police');
  const [activeTab, setActiveTab] = useState('units');

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
            <h2 className="text-2xl font-bold mb-4">{t('accessDenied')}</h2>
            <p className="text-muted-foreground">
              You need supervisor or admin privileges to access unit management and officer profiles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/police')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Supervisor Management</h1>
          <p className="text-muted-foreground">Manage emergency units and officer profiles</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Unit Management
          </TabsTrigger>
          <TabsTrigger value="officers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Officer Profiles & Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="mt-6">
          <UnitManagementDashboard onClose={() => navigate('/police')} />
        </TabsContent>

        <TabsContent value="officers" className="mt-6">
          <OfficerProfileDashboard onClose={() => navigate('/police')} />
        </TabsContent>
      </Tabs>
      <Footer />
    </div>
  );
};