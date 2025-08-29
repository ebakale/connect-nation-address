import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { 
  MapPin, 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Bell,
  Activity,
  Search,
  FileText,
  AlertTriangle,
  Navigation,
  LogOut,
  Home,
  Database
} from 'lucide-react';
import Footer from '@/components/Footer';

interface SystemMetrics {
  totalAddresses: number;
  activeIncidents: number;
  onlineUnits: number;
  systemHealth: 'good' | 'warning' | 'critical';
  recentActivities: Array<{
    id: string;
    type: 'address' | 'incident' | 'system';
    message: string;
    timestamp: string;
  }>;
}

const Portal = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { loading, isPoliceRole, isAdmin, isNDAAAdmin, roleMetadata, getGeographicScope } = useUserRole();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalAddresses: 0,
    activeIncidents: 0,
    onlineUnits: 0,
    systemHealth: 'good',
    recentActivities: []
  });

  useEffect(() => {
    // Load system metrics
    const loadMetrics = async () => {
      setMetrics({
        totalAddresses: 12847,
        activeIncidents: 3,
        onlineUnits: 24,
        systemHealth: 'good',
        recentActivities: [
          {
            id: '1',
            type: 'incident',
            message: 'New emergency incident reported in Malabo',
            timestamp: '2 minutes ago'
          },
          {
            id: '2',
            type: 'address',
            message: '5 new addresses verified in Bata',
            timestamp: '15 minutes ago'
          },
          {
            id: '3',
            type: 'system',
            message: 'System backup completed successfully',
            timestamp: '1 hour ago'
          }
        ]
      });
    };

    if (!loading) {
      loadMetrics();
    }
  }, [loading]);

  const handleModuleNavigation = (module: 'address' | 'emergency') => {
    if (module === 'address') {
      navigate('/dashboard');
    } else if (module === 'emergency') {
      if (isPoliceRole) {
        navigate('/police');
      } else {
        navigate('/dashboard'); // Citizens can report from main dashboard
      }
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ConnectNation Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Home className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">ConnectNation</h1>
                  <p className="text-sm text-muted-foreground">Digital Platform</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getHealthColor(metrics.systemHealth)}`}></div>
                <span className="text-sm font-medium">System {metrics.systemHealth}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>
              
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {isAdmin && (
              <Badge variant="secondary">
                ADMIN
              </Badge>
            )}
            {isNDAAAdmin && (
              <Badge variant="secondary">
                NDAA ADMIN
              </Badge>
            )}
            {isPoliceRole && (
              <Badge variant="secondary">
                POLICE
              </Badge>
            )}
            {getGeographicScope().map((scope) => (
              <Badge key={scope} variant="outline">
                {scope}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalAddresses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.activeIncidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Units</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.onlineUnits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getHealthColor(metrics.systemHealth)}`}></div>
                <span className="font-medium capitalize">{metrics.systemHealth}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Navigation */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">System Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      <div>
                        <CardTitle>Address Registry</CardTitle>
                        <CardDescription>
                          Manage digital addresses, UACs, and location data
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleModuleNavigation('address')}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Enter Address Module
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Search, submit, verify, and manage digital addresses
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      <div>
                        <CardTitle>Emergency Management</CardTitle>
                        <CardDescription>
                          Report incidents, dispatch units, and emergency response
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleModuleNavigation('emergency')}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Enter Emergency Module
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Report emergencies, coordinate response, manage incidents
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* System Administration */}
            <div>
              <h3 className="text-xl font-semibold mb-4">System Administration</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Users</p>
                  </div>
                </Card>

                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Analytics</p>
                  </div>
                </Card>

                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="text-center">
                    <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Settings</p>
                  </div>
                </Card>

                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="text-center">
                    <HelpCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Help</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'incident' ? 'bg-red-500' :
                      activity.type === 'address' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Search Address
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Emergency
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Portal;