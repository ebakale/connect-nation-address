import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { usePostalRole } from '@/hooks/usePostalRole';
import { PostalDashboard } from '@/components/postal';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import Footer from '@/components/Footer';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const PostalPage = () => {
  const { t } = useTranslation('postal');
  const { hasPostalAccess, loading } = usePostalRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t('common:loading')}</p>
      </div>
    );
  }

  if (!hasPostalAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar onNavigationClick={() => {}} />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <PostalDashboard />
          </main>
          <Footer />
        </div>
      </div>
      <OfflineIndicator />
    </SidebarProvider>
  );
};

export default PostalPage;
