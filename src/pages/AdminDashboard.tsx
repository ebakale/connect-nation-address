import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import AdminPanel from "@/components/AdminPanel";
import { LogOut, FileText } from "lucide-react";
import { RolesDocumentGenerator } from "@/components/RolesDocumentGenerator";
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/Footer';

const AdminDashboard = () => {
  const { role, loading, hasNDAAAccess, hasSystemAdminAccess } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5 flex items-center justify-center">
        <div className="text-lg animate-fade-in">{t('loading')}</div>
      </div>
    );
  }

  const getDashboardTitle = () => {
    if (hasNDAAAccess) return 'NDAA Administration';
    if (hasSystemAdminAccess) return 'System Administration';
    return t('adminDashboard');
  };

  const getDashboardDescription = () => {
    if (hasNDAAAccess) return 'National Digital Address Authority - Policy and Strategic Management';
    if (hasSystemAdminAccess) return 'System Administration - Technical Operations and Regional Management';
    return t('manageUsersRoles');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{getDashboardTitle()}</h1>
              <p className="text-muted-foreground">{getDashboardDescription()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        {/* System Documentation */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Documentation
              </CardTitle>
              <CardDescription>
                Generate comprehensive documentation for system roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This document provides detailed explanations of all user roles in the National Digital Addressing Authority system, 
                  including their permissions, geographic scope, workflow stages, and specific responsibilities.
                </p>
                <RolesDocumentGenerator />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel */}
        <AdminPanel />
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;