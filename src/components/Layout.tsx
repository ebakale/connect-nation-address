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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile-optimized Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 safe-area-inset-top">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-foreground">NDAS</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">National Digital Address System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="border-success text-success hidden md:flex text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium truncate max-w-[120px]">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-muted-foreground">EG Gov</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-foreground p-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile-optimized Sidebar */}
        <aside className={cn(
          "bg-white shadow-lg border-r w-72 sm:w-80 min-h-full fixed lg:static z-30 transition-transform duration-300 ease-in-out safe-area-inset-left",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto h-full">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-sm sm:text-base py-3 px-3 sm:px-4",
                  currentPage === item.id && "bg-primary text-primary-foreground shadow-md"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <item.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Button>
            ))}
          </nav>

          {/* Footer info - hidden on mobile to save space */}
          <div className="absolute bottom-4 left-4 right-4 hidden sm:block">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium">System Version</p>
              <p className="text-xs text-muted-foreground">NDAS v2.1.0</p>
              <p className="text-xs text-muted-foreground mt-1">Updated today</p>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile-optimized Main content */}
        <main className="flex-1 flex flex-col min-w-0 safe-area-inset-right safe-area-inset-bottom">
          <div className="flex-1 px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
            <div className="max-w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;