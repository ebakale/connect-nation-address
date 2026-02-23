import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePostalRole } from '@/hooks/usePostalRole';
import { useAuth } from '@/hooks/useAuth';
import { PostalDashboard } from '@/components/postal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { NotificationCenter } from '@/components/NotificationCenter';
import { OfflineSyncQueue } from '@/components/OfflineSyncQueue';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { LogOut, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PostalPage = () => {
  const { t } = useTranslation('postal');
  const { hasPostalAccess, loading, isPostalClerk, isPostalAgent, isPostalDispatcher, isPostalSupervisor } = usePostalRole();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<{ full_name: string | null } | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: '/', ctrl: true, handler: () => setShortcutsOpen(true), description: 'Show shortcuts', category: 'General' },
  ]);

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 gap-2">
          {/* Left: Title + Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate leading-tight">
                {t('title')}
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block leading-tight">
                {t('module')}
              </p>
            </div>
            {roleBadge && (
              <Badge variant={roleBadge.variant} className="text-[10px] font-medium hidden md:inline-flex shrink-0">
                {roleBadge.label}
              </Badge>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationCenter />
            <OfflineSyncQueue />
            <ThemeToggle />
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <OfflineIndicator />
            {user && (
              <p className="text-xs font-medium whitespace-nowrap truncate max-w-[120px] hidden lg:block ml-1">
                {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut} 
              className="h-8 w-8 shrink-0"
              aria-label={t('common:navigation.logout')}
              title={t('common:navigation.logout')}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden animate-fade-in">
        <PostalDashboard />
      </main>
      <Footer />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
};

export default PostalPage;
