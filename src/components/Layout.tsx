import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Plus, 
  BarChart3, 
  Settings,
  Home,
  Shield,
  Menu,
  X,
  LogOut,
  List,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useTranslation(['common']);

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

  const handleNavigation = (pageId: string) => {
    onNavigate?.(pageId);
    setSidebarOpen(false);
  };

  return (
    <div className="mobile-viewport-stable bg-muted/30 flex flex-col">
      {/* Government-style Header */}
      <header className="gov-header-light sticky top-0 z-40 safe-area-inset-top">
        <div className="flex justify-between items-center h-14 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <img 
                  src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                  alt="BIAKAM Logo" 
                  className="h-6 w-auto" 
                />
              </div>
              <div className="min-w-0 hidden sm:block">
                <h1 className="text-base font-semibold text-foreground">ConEG</h1>
                <p className="text-xs text-muted-foreground">Digital Address System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <OfflineIndicator />
            <Badge variant="success" className="hidden md:flex">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
            <div className="text-right hidden sm:block min-w-0">
              <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">EG Government</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "bg-card border-r border-border w-64 min-h-full fixed lg:static z-30 transition-transform duration-300 ease-in-out shadow-elevated lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-3.5rem)] pb-20">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Navigation
              </p>
            </div>
            
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 text-sm",
                  currentPage === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-accent"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <item.icon className="mr-3 h-4 w-4 shrink-0" />
                <span className="truncate flex-1 text-left">{item.name}</span>
                {currentPage === item.id && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Button>
            ))}
          </nav>

          {/* System Info Footer */}
          <div className="absolute bottom-4 left-3 right-3 hidden lg:block">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-medium text-foreground">System Version</p>
              <p className="text-xs text-muted-foreground">ConEG v2.1.0</p>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
