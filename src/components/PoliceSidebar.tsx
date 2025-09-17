import { 
  Radio, MapPin, Activity, Award, Users, Shield, Settings, LogOut, 
  AlertTriangle, MessageSquare, TrendingUp, Bell, Clock
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
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
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { EnhancedSyncStatus } from './EnhancedSyncStatus';

interface NavigationItem {
  id: string;
  title: string;
  icon: any;
  onClick: () => void;
  visible: boolean;
}

interface PoliceSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PoliceSidebar({ activeTab, onTabChange }: PoliceSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { 
    isPoliceOperator, 
    isPoliceDispatcher, 
    isPoliceSupervisor, 
    isPoliceAdmin, 
    isAdmin, 
    hasPoliceAdminAccess,
    isUnitLead 
  } = useUserRole();
  const { t } = useTranslation(['emergency', 'common']);

  const handleItemClick = (id: string) => {
    onTabChange(id);
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'field',
      title: t('emergency:field'),
      icon: Radio,
      onClick: () => handleItemClick('field'),
      visible: (isPoliceOperator || isPoliceSupervisor) && !isAdmin && !isPoliceAdmin
    },
    {
      id: 'dispatch',
      title: t('emergency:dispatch'),
      icon: MapPin,
      onClick: () => handleItemClick('dispatch'),
      visible: (isPoliceDispatcher) && !isAdmin && !isPoliceAdmin
    },
    {
      id: 'coordination',
      title: t('emergency:coordination'),
      icon: Activity,
      onClick: () => handleItemClick('coordination'),
      visible: isPoliceSupervisor
    },
    {
      id: 'leadership',
      title: t('emergency:leadership'),
      icon: Award,
      onClick: () => handleItemClick('leadership'),
      visible: isPoliceSupervisor || isAdmin || isUnitLead
    },
    {
      id: 'management',
      title: t('emergency:management'),
      icon: Users,
      onClick: () => handleItemClick('management'),
      visible: isPoliceSupervisor || isAdmin
    },
    {
      id: 'units-profiles',
      title: 'Units & Profiles',
      icon: Shield,
      onClick: () => handleItemClick('units-profiles'),
      visible: isPoliceSupervisor || isAdmin
    },
    {
      id: 'admin-users',
      title: t('emergency:policeAdminDashboard.userManagement'),
      icon: Users,
      onClick: () => handleItemClick('admin-users'),
      visible: hasPoliceAdminAccess || isAdmin
    },
    {
      id: 'admin-units',
      title: t('emergency:policeAdminDashboard.unitManagement'),
      icon: Shield,
      onClick: () => handleItemClick('admin-units'),
      visible: hasPoliceAdminAccess || isAdmin
    },
    {
      id: 'admin-system',
      title: t('emergency:policeAdminDashboard.systemConfig'),
      icon: Settings,
      onClick: () => handleItemClick('admin-system'),
      visible: hasPoliceAdminAccess || isAdmin
    },
    {
      id: 'admin-analytics',
      title: t('emergency:policeAdminDashboard.analytics'),
      icon: TrendingUp,
      onClick: () => handleItemClick('admin-analytics'),
      visible: hasPoliceAdminAccess || isAdmin
    }
  ];

  const visibleItems = navigationItems.filter(item => item.visible);

  // Group items by category
  const mainItems = visibleItems.filter(item => 
    ['field', 'dispatch'].includes(item.id)
  );
  
  const operationsItems = visibleItems.filter(item => 
    ['coordination', 'leadership'].includes(item.id)
  );
  
  const managementItems = visibleItems.filter(item => 
    ['management', 'units-profiles'].includes(item.id)
  );

  const adminItems = visibleItems.filter(item => 
    ['admin', 'admin-users', 'admin-units', 'admin-system', 'admin-analytics'].includes(item.id)
  );

  const renderMenuGroup = (items: NavigationItem[], label: string) => {
    if (items.length === 0) return null;
    
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{state !== 'collapsed' && label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={item.onClick}
                  className={activeTab === item.id ? "bg-primary text-primary-foreground" : ""}
                >
                  <item.icon className="h-4 w-4" />
                  {state !== 'collapsed' && <span>{item.title}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="font-semibold text-sm">
                {t('emergency:policeOperationsCenter')}
              </h2>
              <p className="text-xs text-muted-foreground">Emergency Services</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderMenuGroup(mainItems, t('emergency:operations'))}
        {renderMenuGroup(operationsItems, t('emergency:coordination'))}
        {renderMenuGroup(managementItems, t('emergency:management'))}
        {renderMenuGroup(adminItems, t('emergency:administration'))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-2">
          {/* Sync Status Component */}
          <div className="mb-4">
            <EnhancedSyncStatus />
          </div>
          
          {state !== "collapsed" && (
            <div className="text-xs text-muted-foreground">
              <p>Emergency Services v2.1.0</p>
              <p>© 2025 BIAKAM</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {state !== "collapsed" && <span className="ml-2">{t('common:logout')}</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}