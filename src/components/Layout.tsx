import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Search, Plus, BarChart3, Settings,
  Home, Shield, LogOut, List, ChevronRight, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null } | null>(null);
  const { user, signOut } = useAuth();
  const { t } = useTranslation(['common']);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setUserProfile(data);
    };
    fetchProfile();
  }, [user?.id]);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: t('common:platform.searchAddresses'), id: 'search', icon: Search },
    { name: 'Add Address', id: 'add', icon: Plus },
    { name: 'Manage Addresses', id: 'manage', icon: List },
    { name: 'Map View', id: 'map', icon: MapPin },
    { name: 'Analytics', id: 'analytics', icon: BarChart3 },
    { name: 'Admin Panel', id: 'admin', icon: Shield },
    { name: 'Settings', id: 'settings', icon: Settings },
  ];

  // Bottom nav: show 5 most important items on mobile
  const bottomNavItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'add', icon: Plus, label: 'Add' },
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'settings', icon: Settings, label: 'More' },
  ];

  const handleNavigation = (pageId: string) => {
    onNavigate?.(pageId);
    setSidebarOpen(false);
  };

  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="mobile-viewport-stable bg-muted/30 flex flex-col overflow-x-hidden">
      {/* Compact Header */}
      <header className="gov-header-light sticky top-safe z-40">
        <div className="flex justify-between items-center h-12 px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2 min-w-0">
            {/* Sidebar toggle - desktop only */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 bg-primary/10 rounded-lg shrink-0">
                <img 
                  src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                  alt="BIAKAM Logo" 
                  className="h-5 w-auto" 
                />
              </div>
              <div className="min-w-0 hidden sm:block">
                <h1 className="text-sm font-semibold text-foreground leading-tight">ConEG</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Digital Address System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <OfflineIndicator />
            <Badge variant="success" className="hidden md:flex text-[10px] px-1.5 py-0.5">
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              Secure
            </Badge>
            <span className="text-xs font-medium text-foreground truncate max-w-[100px] hidden sm:inline">
              {displayName}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar - Desktop only */}
        <aside className={cn(
          "bg-card border-r border-border w-56 min-h-full fixed lg:static z-30 transition-transform duration-300 ease-in-out shadow-elevated lg:shadow-none",
          "hidden lg:block",
          sidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:hidden"
        )}>
          <nav className="p-2 space-y-0.5 overflow-y-auto h-[calc(100vh-3rem)]">
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Navigation</p>
            </div>
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-9 text-xs",
                  currentPage === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-accent"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <item.icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1 text-left">{item.name}</span>
                {currentPage === item.id && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden pb-16 lg:pb-0">
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {onNavigate && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_8px_-2px_hsl(var(--foreground)/0.06)]">
          <div className="flex items-center justify-around h-14 px-1">
            {bottomNavItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] touch-manipulation transition-colors duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
                  <span className={cn("text-[10px] mt-0.5 font-medium", isActive && "font-semibold")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
