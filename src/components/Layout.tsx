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
  User
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
    { name: 'Map View', id: 'map', icon: MapPin },
    { name: 'Analytics', id: 'analytics', icon: BarChart3 },
    { name: 'Settings', id: 'settings', icon: Settings },
  ];

  const handleNavigation = (pageId: string) => {
    onNavigate?.(pageId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary to-primary-light rounded-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">NDAS</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">National Digital Address System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-success text-success hidden sm:flex">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-muted-foreground">Equatorial Guinea Gov</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "bg-white shadow-sm border-r w-64 min-h-[calc(100vh-4rem)] fixed lg:static z-30 transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  currentPage === item.id && "bg-primary text-primary-foreground shadow-md"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Footer info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium">System Version</p>
              <p className="text-xs text-muted-foreground">NDAS v2.1.0</p>
              <p className="text-xs text-muted-foreground mt-1">Last updated: Today</p>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;