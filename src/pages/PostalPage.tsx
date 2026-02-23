import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePostalRole } from '@/hooks/usePostalRole';
import { useAuth } from '@/hooks/useAuth';
import { PostalDashboard } from '@/components/postal';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { LogOut, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardBreadcrumb } from '@/components/DashboardBreadcrumb';

const PostalPage = () => {
  const { t } = useTranslation('postal');
  const { hasPostalAccess, loading, isPostalClerk, isPostalAgent, isPostalDispatcher, isPostalSupervisor } = usePostalRole();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<{ full_name: string | null } | null>(null);

  // Fetch user profile for full name
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setUserProfile(data);
      }
    };
    
    fetchProfile();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
  };

  // Get role badge
  const getRoleBadge = () => {
    if (isPostalSupervisor) return { label: t('roles.postal_supervisor'), variant: 'default' as const };
    if (isPostalDispatcher) return { label: t('roles.postal_dispatcher'), variant: 'secondary' as const };
    if (isPostalAgent) return { label: t('roles.postal_agent'), variant: 'outline' as const };
    if (isPostalClerk) return { label: t('roles.postal_clerk'), variant: 'outline' as const };
    return null;
  };

  const roleBadge = getRoleBadge();

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
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        <DashboardSidebar onNavigationClick={() => {}} />
        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
          {/* Header - consistent with other dashboards */}
          <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md shadow-sm transition-all duration-300">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <SidebarTrigger className="-ml-1 shrink-0" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
                        {t('title')}
                      </h1>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {t('module')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Role Badge */}
                  {roleBadge && (
                    <div className="hidden md:flex">
                      <Badge variant={roleBadge.variant} className="text-xs font-medium">
                        {roleBadge.label}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <OfflineIndicator />
                  
                  {/* User info - hidden on small screens */}
                  {user && (
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-medium whitespace-nowrap truncate max-w-[200px]">
                        {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut} 
                    className="flex items-center gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-sm">{t('common:navigation.logout')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            <PostalDashboard />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PostalPage;
