import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import AdminPanel from "@/components/AdminPanel";
import { FileText } from "lucide-react";
import { RolesDocumentGenerator } from "@/components/RolesDocumentGenerator";
import { AddressDataManager } from "@/components/AddressDataManager";
import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";

const AdminDashboard = () => {
  const { loading, hasNDAAAccess, hasSystemAdminAccess } = useUserRole();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("address-data");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5 flex items-center justify-center">
        <div className="text-lg animate-fade-in">{t('common:buttons.loading')}</div>
      </div>
    );
  }

  const getDashboardTitle = () => {
    if (hasNDAAAccess) return t('admin:ndaaAdministration');
    if (hasSystemAdminAccess) return t('admin:systemAdministration');
    return t('admin:title');
  };

  const getDashboardDescription = () => {
    if (hasNDAAAccess) return t('admin:ndaaDescription');
    if (hasSystemAdminAccess) return t('admin:systemDescription');
    return t('admin:manageUsersRoles');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "address-data":
        return <AddressDataManager />;
      case "users":
      case "roles":
      case "permissions":
      case "workflows":
      case "uac":
      case "analytics":
        return <AdminPanel />;
      default:
        return <AddressDataManager />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="h-16 flex items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4 px-6">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold text-foreground">{getDashboardTitle()}</h1>
                <p className="text-sm text-muted-foreground">{getDashboardDescription()}</p>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>

          {/* Footer */}
          <footer className="border-t bg-background/50 py-4 px-6 mt-auto">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <img 
                    src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                    alt="BIAKAM Logo" 
                    className="h-6 w-auto" 
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">
                {t('common:footer.copyright')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('common:footer.description')}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;