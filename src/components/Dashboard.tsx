import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Plus, 
  BarChart3, 
  Shield, 
  Globe,
  Users,
  CheckCircle,
  AlertCircle,
  Building,
  Home
} from 'lucide-react';

interface DashboardStats {
  totalAddresses: number;
  verifiedAddresses: number;
  pendingVerification: number;
  coveragePercentage: number;
  activeUsers: number;
  recentActivity: number;
}

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats] = useState<DashboardStats>({
    totalAddresses: 45678,
    verifiedAddresses: 42341,
    pendingVerification: 3337,
    coveragePercentage: 78.5,
    activeUsers: 2143,
    recentActivity: 156
  });

  const quickActions = [
    {
      title: "Search Addresses",
      description: "Find and verify existing addresses",
      icon: Search,
      action: () => onNavigate?.('search'),
      variant: "default" as const
    },
    {
      title: "Add New Address",
      description: "Register a new location",
      icon: Plus,
      action: () => onNavigate?.('add'),
      variant: "hero" as const
    },
    {
      title: "View Map",
      description: "Interactive address mapping",
      icon: MapPin,
      action: () => onNavigate?.('map'),
      variant: "default" as const
    },
    {
      title: "Analytics",
      description: "Coverage and usage statistics",
      icon: BarChart3,
      action: () => onNavigate?.('analytics'),
      variant: "default" as const
    }
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    trend?: string;
    variant?: 'default' | 'success' | 'warning';
  }> = ({ title, value, description, icon: Icon, trend, variant = 'default' }) => (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            {trend && (
              <Badge 
                variant="outline" 
                className={`mt-2 ${variant === 'success' ? 'border-success text-success' : variant === 'warning' ? 'border-warning text-warning' : ''}`}
              >
                {trend}
              </Badge>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            variant === 'success' ? 'bg-success/10' : 
            variant === 'warning' ? 'bg-warning/10' : 
            'bg-primary/10'
          }`}>
            <Icon className={`h-6 w-6 ${
              variant === 'success' ? 'text-success' : 
              variant === 'warning' ? 'text-warning' : 
              'text-primary'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">National Digital Address System</h1>
          <p className="text-muted-foreground">
            Comprehensive address management and mapping platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-success text-success">
            <Shield className="h-3 w-3 mr-1" />
            System Operational
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Addresses"
          value={stats.totalAddresses}
          description="Registered locations"
          icon={MapPin}
          trend="+12% this month"
          variant="success"
        />
        <StatCard
          title="Verified Addresses"
          value={stats.verifiedAddresses}
          description="Quality assured locations"
          icon={CheckCircle}
          trend={`${((stats.verifiedAddresses / stats.totalAddresses) * 100).toFixed(1)}% verified`}
          variant="success"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingVerification}
          description="Awaiting validation"
          icon={AlertCircle}
          trend="Review required"
          variant="warning"
        />
        <StatCard
          title="Coverage"
          value={`${stats.coveragePercentage}%`}
          description="National coverage"
          icon={Globe}
          trend="Target: 95% by 2025"
        />
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={action.action}
              >
                <action.icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-full">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">156 addresses verified today</p>
                  <p className="text-xs text-muted-foreground">Malabo district processing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">42 new addresses registered</p>
                  <p className="text-xs text-muted-foreground">Bata expansion project</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-full">
                  <Building className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">Commercial zone mapping</p>
                  <p className="text-xs text-muted-foreground">85% complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <Badge variant="outline" className="border-success text-success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Sync</span>
                <Badge variant="outline" className="border-success text-success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mapping Services</span>
                <Badge variant="outline" className="border-success text-success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Verification Queue</span>
                <Badge variant="outline" className="border-warning text-warning">Processing</Badge>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Active Users: {stats.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Government agencies and authorized personnel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;