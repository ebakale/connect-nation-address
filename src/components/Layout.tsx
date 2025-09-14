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
  Globe,
  Menu,
  X,
  LogOut,
  User,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { OfflineIndicator } from '@/components/OfflineIndicator';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: 'Search Addresses', id: 'search', icon: Search },
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
    <div className="mobile-viewport-stable bg-background flex flex-col mobile-container">
      {/* Mobile-optimized Header with proper safe areas */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 mobile-spacing">
        <div className="flex justify-between items-center h-12 touch-target">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden touch-target p-2 shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-white rounded-lg shrink-0">
                <img src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" alt="BIAKAM Logo" className="h-5 w-auto" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-foreground truncate">ConEG</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Digital Address System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <OfflineIndicator />
            <Badge variant="outline" className="border-success text-success hidden md:flex text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
            <div className="text-right hidden sm:block min-w-0">
              <p className="text-sm font-medium truncate max-w-[120px]">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-muted-foreground">EG Gov</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground touch-target p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile-optimized Sidebar with better touch handling */}
        <aside className={cn(
          "bg-white shadow-lg border-r w-72 min-h-full fixed lg:static z-30 transition-transform duration-300 ease-in-out mobile-scroll",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="mobile-spacing space-y-2 overflow-y-auto h-full pb-20">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start mobile-text-responsive touch-target",
                  currentPage === item.id && "bg-primary text-primary-foreground shadow-md"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <item.icon className="mr-3 h-5 w-5 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Button>
            ))}
          </nav>

          {/* System info footer - positioned better for mobile */}
          <div className="absolute bottom-4 left-4 right-4 hidden sm:block">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium">System Version</p>
              <p className="text-xs text-muted-foreground">ConEG v2.1.0</p>
              <p className="text-xs text-muted-foreground mt-1">Updated today</p>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay with proper touch handling */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden touch-target"
            onClick={() => setSidebarOpen(false)}
            onTouchEnd={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile-optimized Main content with overflow protection */}
        <main className="flex-1 flex flex-col min-w-0 mobile-container mobile-scroll">
          <div className="flex-1 mobile-spacing overflow-x-hidden">
            <div className="max-w-full mx-auto mobile-container">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;