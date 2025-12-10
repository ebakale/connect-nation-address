import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Home,
  Search, 
  Clock,
  Camera,
  CheckCircle,
  MapPin,
  BarChart3,
  Settings,
  Shield,
  User,
  Phone,
  FileDown,
  FileCheck,
  Crown,
  Star,
  Globe,
  Building,
  AlertCircle
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
import { Badge } from '@/components/ui/badge';

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
  const { t } = useTranslation('dashboard');
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const { 
    isCitizen, 
    isFieldAgent, 
    isRegistrar,
    isCarAdmin,
    canVerifyNAR,
    canVerifyCAR,
    hasAdminAccess,
    isAdmin,
    hasNDAAAccess,
    canVerifyAddresses,
    isNARAuthority,
    narAuthorityData
  } = useUserRole();

  const handleItemClick = (id: string) => {
    onNavigationClick(id);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Consolidated single navigation structure with role-based visibility
  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      title: t('dashboardOverview'),
      icon: Home,
      onClick: () => handleItemClick('overview'),
      visible: true
    },
    {
      id: 'nar-authority-dashboard',
      title: t('narAuthorityDashboard'),
      icon: Shield,
      onClick: () => handleItemClick('nar-authority-dashboard'),
      visible: isNARAuthority
    },
    {
      id: 'verification-queue',
      title: t('verificationQueue'),
      icon: CheckCircle,
      onClick: () => handleItemClick('verification-queue'),
      visible: (isNARAuthority && narAuthorityData?.can_verify_addresses) || (canVerifyNAR && !isRegistrar && !isAdmin && !hasNDAAAccess),
      badge: pendingCount
    },
    {
      id: 'verification-tools',
      title: t('verificationTools'),
      icon: isNARAuthority ? FileCheck : AlertCircle,
      onClick: () => handleItemClick('verification-tools'),
      visible: (isNARAuthority && narAuthorityData?.can_verify_addresses) || (canVerifyNAR && !isAdmin && !hasNDAAAccess)
    },
    {
      id: 'registrar-dashboard',
      title: t('registrarDashboard'),
      icon: Crown,
      onClick: () => handleItemClick('registrar-dashboard'),
      visible: isRegistrar
    },
    {
      id: 'car-admin',
      title: t('carAdministration'),
      icon: Settings,
      onClick: () => handleItemClick('car-admin'),
      visible: isCarAdmin
    },
    {
      id: 'residency-verification',
      title: t('residencyVerification'),
      icon: Shield,
      onClick: () => handleItemClick('residency-verification'),
      visible: isCarAdmin || canVerifyCAR || isRegistrar
    },
    {
      id: 'capture-address',
      title: t('captureAddress'),
      icon: Camera,
      onClick: () => handleItemClick('capture-address'),
      visible: isFieldAgent
    },
    {
      id: 'field-drafts',
      title: t('myDrafts'),
      icon: Clock,
      onClick: () => handleItemClick('field-drafts'),
      visible: isFieldAgent
    },
    {
      id: 'field-map',
      title: t('fieldMap.fieldMap'),
      icon: MapPin,
      onClick: () => handleItemClick('field-map'),
      visible: isFieldAgent
    },
    {
      id: 'unified-address-request',
      title: t('registerAddress'),
      icon: Home,
      onClick: () => handleItemClick('unified-address-request'),
      visible: isCitizen || isNARAuthority
    },
    {
      id: 'address-search',
      title: t('addressSearch'),
      icon: Search,
      onClick: () => handleItemClick('address-search'),
      visible: isCitizen || isNARAuthority
    },
    {
      id: 'citizen-address-portal',
      title: t('myAddressesCar'),
      icon: User,
      onClick: () => handleItemClick('citizen-address-portal'),
      visible: isCitizen
    },
    {
      id: 'residency-verification-dashboard',
      title: t('myVerificationRequests'),
      icon: FileDown,
      onClick: () => handleItemClick('residency-verification-dashboard'),
      visible: isCitizen
    },
    {
      id: 'my-businesses',
      title: t('myBusinesses'),
      icon: Building,
      onClick: () => navigate('/my-businesses'),
      visible: isCitizen
    },
    {
      id: 'admin-panel',
      title: t('admin'),
      icon: Settings,
      onClick: () => handleItemClick('admin-panel'),
      visible: isAdmin || hasNDAAAccess
    },
    {
      id: 'analytics',
      title: t('analytics'),
      icon: BarChart3,
      onClick: () => handleItemClick('analytics'),
      visible: hasAdminAccess
    },
    {
      id: 'province-management',
      title: t('provinceManagement'),
      icon: Globe,
      onClick: () => handleItemClick('province-management'),
      visible: hasAdminAccess && !isAdmin && !hasNDAAAccess
    },
    {
      id: 'saved-addresses',
      title: t('savedAddresses'),
      icon: Star,
      onClick: () => handleItemClick('saved-addresses'),
      visible: true
    },
    {
      id: 'emergency-contacts',
      title: t('emergencyContacts'),
      icon: Phone,
      onClick: () => handleItemClick('emergency-contacts'),
      visible: isCitizen
    },
    {
      id: 'profile',
      title: t('profileSettings'),
      icon: User,
      onClick: () => handleItemClick('profile'),
      visible: true
    }
  ];

  const visibleItems = navigationItems.filter(item => item.visible);

  // Group items by category
  const mainItems = visibleItems.filter(item => 
    ['overview', 'nar-authority-dashboard', 'registrar-dashboard'].includes(item.id)
  );
  
  const verificationItems = visibleItems.filter(item => 
    ['verification-queue', 'verification-tools', 'residency-verification'].includes(item.id)
  );
  
  const carItems = visibleItems.filter(item => 
    ['car-admin', 'citizen-address-portal', 'residency-verification-dashboard'].includes(item.id)
  );
  
  const fieldItems = visibleItems.filter(item => 
    ['capture-address', 'field-drafts', 'field-map'].includes(item.id)
  );
  
  const adminItems = visibleItems.filter(item => 
    ['admin-panel', 'analytics', 'province-management'].includes(item.id)
  );
  
  const toolsItems = visibleItems.filter(item => 
    ['unified-address-request', 'address-search', 'saved-addresses', 'my-businesses'].includes(item.id)
  );
  
  const settingsItems = visibleItems.filter(item => 
    ['emergency-contacts', 'profile'].includes(item.id)
  );

  const renderMenuGroup = (items: NavigationItem[], label: string) => {
    if (items.length === 0) return null;
    
    return (
      <SidebarGroup>
        {!collapsed && (
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
            {label}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={item.onClick}
                  className={cn(
                    "w-full justify-start h-10 rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "text-foreground",
                    collapsed ? "px-2 justify-center" : "px-3"
                  )}
                >
                  <item.icon className={cn(
                    "shrink-0 text-muted-foreground", 
                    collapsed ? "h-5 w-5" : "h-4 w-4 mr-3"
                  )} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm">{item.title}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="pending" className="ml-2 h-5 min-w-[20px] justify-center">
                          {item.badge}
                        </Badge>
                      )}
                    </>
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
    <Sidebar className={cn(
      "border-r border-border bg-card",
      collapsed ? "w-16" : "w-64"
    )}>
      <SidebarContent className="gap-0 py-2">
        {/* Header */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-border mb-2">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                {isNARAuthority ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <img 
                    src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                    alt={t('biakamLogoAlt')} 
                    className="h-5 w-auto" 
                  />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm text-foreground truncate">
                  {isNARAuthority ? t('narAuthority') : 'ConEG'}
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {isNARAuthority 
                    ? (narAuthorityData?.authority_level === 'national' ? t('nationalLevel') :
                       narAuthorityData?.authority_level === 'regional' ? t('regionalLevel') :
                       narAuthorityData?.authority_level === 'municipal' ? t('municipalLevel') :
                       t('localLevel'))
                    : t('addressSystem')
                  }
                </p>
              </div>
            </div>
            
            {/* Jurisdiction Badge for NAR Authority */}
            {isNARAuthority && (
              <div className="mt-3 p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">{t('jurisdiction')}</p>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">{t('nationalWide')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2">
          {renderMenuGroup(mainItems, t('main'))}
          {renderMenuGroup(verificationItems, t('verification'))}
          {renderMenuGroup(carItems, t('citizenAddressRegistry'))}
          {renderMenuGroup(fieldItems, t('fieldWork'))}
          {renderMenuGroup(adminItems, t('administration'))}
          {renderMenuGroup(toolsItems, t('tools'))}
          {renderMenuGroup(settingsItems, t('settings'))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
