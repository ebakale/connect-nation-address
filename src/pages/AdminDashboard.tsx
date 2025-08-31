import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import AdminPanel from "@/components/AdminPanel";
import { Shield, Users, Settings, BarChart3, LogOut, FileText } from "lucide-react";
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

  const getQuickActions = () => {
    if (hasNDAAAccess) {
      return [
        { title: 'National Policy', count: '5 Active', description: 'Manage national address policies', color: 'text-blue-600 bg-blue-50' },
        { title: 'API Management', count: '23 Keys', description: 'Oversee API access and webhooks', color: 'text-purple-600 bg-purple-50' },
        { title: 'Strategic Oversight', count: '12 Regions', description: 'Monitor national implementation', color: 'text-green-600 bg-green-50' },
        { title: 'Security Audit', count: '99.9%', description: 'National security compliance', color: 'text-red-600 bg-red-50' }
      ];
    } else if (hasSystemAdminAccess) {
      return [
        { title: 'System Health', count: '99.9%', description: 'Monitor system performance', color: 'text-green-600 bg-green-50' },
        { title: 'Regional Operations', count: '8 Regions', description: 'Manage regional systems', color: 'text-blue-600 bg-blue-50' },
        { title: 'Technical Support', count: '23 Issues', description: 'Handle technical escalations', color: 'text-orange-600 bg-orange-50' },
        { title: 'User Management', count: '1,234', description: 'Manage system users', color: 'text-purple-600 bg-purple-50' }
      ];
    }
    return [
      { title: t('totalUsers'), count: '1,234', description: t('clickToManage'), color: 'text-blue-600 bg-blue-50' },
      { title: t('activeRoles'), count: '13', description: t('clickToManage'), color: 'text-purple-600 bg-purple-50' },
      { title: t('pendingApprovals'), count: '8', description: t('clickToReview'), color: 'text-orange-600 bg-orange-50' },
      { title: t('systemHealth'), count: '99.9%', description: t('uptime'), color: 'text-green-600 bg-green-50' }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5">
      <div className="container mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {getQuickActions().map((action, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card className="min-w-0 cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium truncate">{action.title}</CardTitle>
                    <div className={`h-3 w-3 rounded-full ${action.color}`} />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-lg font-bold">{action.count}</div>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{action.title}</DialogTitle>
                </DialogHeader>
                <AdminPanel />
              </DialogContent>
            </Dialog>
          ))}
        </div>

        <div className="mb-8">
          <Card className="max-w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="break-words">{t('systemDocumentation')}</span>
              </CardTitle>
              <CardDescription className="break-words">
                {t('generateDocumentation')}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-full overflow-hidden">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground break-words">
                  {t('documentationDescription')}
                </p>
                <div className="max-w-full">
                  <RolesDocumentGenerator />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-full overflow-hidden">
          <AdminPanel />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;