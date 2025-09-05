import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home,
  Search, 
  FileText, 
  Clock,
  Camera,
  CheckCircle,
  MapPin,
  BarChart3,
  Settings,
  Shield,
  Users,
  AlertCircle,
  User,
  Phone
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  visible: boolean;
  badge?: number;
}

interface DashboardSidebarProps {
  onNavigationClick: (id: string) => void;
  pendingCount?: number;
}

export function DashboardSidebar({ onNavigationClick, pendingCount = 0 }: DashboardSidebarProps) {
  const { state, setOpen, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const { 
    isCitizen, 
    isFieldAgent, 
    isVerifier, 
    isRegistrar,
    hasAdminAccess,
    canCreateDraftAddress,
    canVerifyAddresses,
    canPublishAddresses
  } = useUserRole();

  const handleItemClick = (id: string) => {
    onNavigationClick(id);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      title: 'Dashboard Overview',
      icon: Home,
      onClick: () => handleItemClick('overview'),
      visible: true
    },
    {
      id: 'search',
      title: 'Search Addresses',
      icon: Search,
      onClick: () => handleItemClick('search'),
      visible: true
    },
    {
      id: 'submit-request',
      title: 'Submit Request',
      icon: FileText,
      onClick: () => handleItemClick('submit-request'),
      visible: isCitizen || isFieldAgent
    },
    {
      id: 'request-status',
      title: 'Request Status',
      icon: Clock,
      onClick: () => handleItemClick('request-status'),
      visible: isCitizen || isFieldAgent
    },
    {
      id: 'capture-address',
      title: 'Capture Address',
      icon: Camera,
      onClick: () => handleItemClick('capture-address'),
      visible: canCreateDraftAddress
    },
    {
      id: 'verification-queue',
      title: 'Verification Queue',
      icon: CheckCircle,
      onClick: () => handleItemClick('verification-queue'),
      visible: canVerifyAddresses
    },
    {
      id: 'publishing-queue',
      title: 'Publishing Queue',
      icon: MapPin,
      onClick: () => handleItemClick('publishing-queue'),
      visible: canPublishAddresses
    },
    {
      id: 'unpublishing-queue',
      title: 'Unpublishing Queue',
      icon: AlertCircle,
      onClick: () => handleItemClick('unpublishing-queue'),
      visible: canPublishAddresses
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      onClick: () => handleItemClick('analytics'),
      visible: hasAdminAccess
    },
    {
      id: 'province-management',
      title: 'Province Management',
      icon: Settings,
      onClick: () => handleItemClick('province-management'),
      visible: hasAdminAccess
    },
    {
      id: 'verification-tools',
      title: 'Verification Tools',
      icon: Shield,
      onClick: () => handleItemClick('verification-tools'),
      visible: isVerifier || hasAdminAccess
    },
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      onClick: () => handleItemClick('profile'),
      visible: true
    },
    {
      id: 'emergency-contacts',
      title: 'Emergency Contacts',
      icon: Phone,
      onClick: () => handleItemClick('emergency-contacts'),
      visible: true
    }
  ];

  const visibleItems = navigationItems.filter(item => item.visible);

  // Group items by category
  const mainItems = visibleItems.filter(item => 
    ['overview', 'search', 'submit-request', 'request-status'].includes(item.id)
  );
  
  const workflowItems = visibleItems.filter(item => 
    ['capture-address', 'verification-queue', 'publishing-queue', 'unpublishing-queue'].includes(item.id)
  );
  
  const managementItems = visibleItems.filter(item => 
    ['analytics', 'province-management', 'verification-tools'].includes(item.id)
  );
  
  const settingsItems = visibleItems.filter(item => 
    ['profile', 'emergency-contacts'].includes(item.id)
  );

  const renderMenuGroup = (items: NavigationItem[], label: string) => {
    if (items.length === 0) return null;
    
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{!collapsed && label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={item.onClick}
                  className={cn(
                    "w-full justify-start transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    collapsed ? "px-2" : "px-3"
                  )}
                >
                  <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4 mr-2")} />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.title}</span>
                  )}
                  {!collapsed && item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className={cn("border-r bg-background", collapsed ? "w-16" : "w-60")}>
      <SidebarContent className="gap-0">
        {/* Header */}
        {!collapsed && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <img 
                  src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                  alt="BIAKAM Logo" 
                  className="h-6 w-auto" 
                />
              </div>
              <div>
                <h2 className="font-semibold text-sm">ConnectEG</h2>
                <p className="text-xs text-muted-foreground">Address System</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        {renderMenuGroup(mainItems, "Main")}
        {renderMenuGroup(workflowItems, "Workflow")}
        {renderMenuGroup(managementItems, "Management")}
        {renderMenuGroup(settingsItems, "Settings")}
      </SidebarContent>
    </Sidebar>
  );
}