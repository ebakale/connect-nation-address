import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import AdminPanel from "@/components/AdminPanel";
import { Shield, Users, Settings, BarChart3, LogOut, FileText } from "lucide-react";
import { RolesDocumentGenerator } from "@/components/RolesDocumentGenerator";
import { useLanguage } from '@/contexts/LanguageContext';


const AdminDashboard = () => {
  const { role, loading } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5 flex items-center justify-center">
        <div className="text-lg animate-fade-in">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('adminDashboard')}</h1>
              <p className="text-muted-foreground">{t('manageUsersRoles')}</p>
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
          <Dialog>
            <DialogTrigger asChild>
              <Card className="min-w-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium truncate">{t('totalUsers')}</CardTitle>
                  <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-lg font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground truncate">{t('clickToManage')}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('userManagement')}</DialogTitle>
              </DialogHeader>
              <AdminPanel />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="min-w-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium truncate">{t('activeRoles')}</CardTitle>
                  <Shield className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-lg font-bold">13</div>
                  <p className="text-xs text-muted-foreground truncate">{t('clickToManage')}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('roleManagement')}</DialogTitle>
              </DialogHeader>
              <AdminPanel />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="min-w-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium truncate">{t('pendingApprovals')}</CardTitle>
                  <Settings className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-lg font-bold">8</div>
                  <p className="text-xs text-muted-foreground truncate">{t('clickToReview')}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('pendingApprovals')}</DialogTitle>
              </DialogHeader>
              <AdminPanel />
            </DialogContent>
          </Dialog>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium truncate">{t('systemHealth')}</CardTitle>
              <BarChart3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground truncate">{t('uptime')}</p>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default AdminDashboard;