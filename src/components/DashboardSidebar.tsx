import React from 'react';
import { useTranslation } from 'react-i18next';
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
  Phone,
  FileDown,
  FileCheck,
  Crown,
  UserCheck,
  Star,
  Globe
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
  const { t } = useTranslation('dashboard');
  const { state, setOpen, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const { 
    isCitizen, 
    isFieldAgent, 
    isPropertyClaimant,
    isVerifier, 
    isRegistrar,
    isCarAdmin,
    isResidencyVerifier,
    hasAdminAccess,
    hasCarAccess,
    isAdmin,
    hasNDAAAccess,
    canCreateDraftAddress,
    canVerifyAddresses,
    canPublishAddresses,
    isNARAuthority,
    narAuthorityData
  } = useUserRole();

  const handleItemClick = (id: string) => {
    onNavigationClick(id);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Admin-only navigation items (pure administrative functions)
  const adminNavigationItems: NavigationItem[] = [
    {
      id: 'overview',
      title: t('dashboardOverview'),
      icon: Home,
      onClick: () => handleItemClick('overview'),
      visible: true
    },
    {
      id: 'admin-panel',
      title: t('admin'),
      icon: Settings,
      onClick: () => handleItemClick('admin-panel'),
      visible: true
    },
    {
      id: 'profile',
      title: t('profileSettings'),
      icon: User,
      onClick: () => handleItemClick('profile'),
      visible: true
    }
  ];

  // CAR Verifier navigation items
  const carNavigationItems: NavigationItem[] = [
    {
      id: 'overview',
      title: t('dashboardOverview'),
      icon: Home,
      onClick: () => handleItemClick('overview'),
      visible: true
    },
    {
      id: 'residency-verification',
      title: t('residencyVerification'),
      icon: Shield,
      onClick: () => handleItemClick('residency-verification'),
      visible: isCarAdmin
    },
    {
      id: 'car-admin',
      title: t('carAdministration'),
      icon: Settings,
      onClick: () => handleItemClick('car-admin'),
      visible: isCarAdmin
    },
  ];

  // NAR Authority navigation items
  const narNavigationItems: NavigationItem[] = [
    {
      id: 'nar-authority-dashboard',
      title: t('narAuthorityDashboard'),
      icon: Shield,
      onClick: () => handleItemClick('nar-authority-dashboard'),
      visible: true
    },
    {
      id: 'verification-queue',
      title: t('verificationQueue'),
      icon: CheckCircle,
      onClick: () => handleItemClick('verification-queue'),
      visible: narAuthorityData?.can_verify_addresses || false,
      badge: pendingCount
    },
    {
      id: 'verification-tools',
      title: t('verificationTools'),
      icon: FileCheck,
      onClick: () => handleItemClick('verification-tools'),
      visible: narAuthorityData?.can_verify_addresses || false
    },
    {
      id: 'address-search',
      title: t('addressSearch'),
      icon: Search,
      onClick: () => handleItemClick('address-search'),
      visible: true
    },
    {
      id: 'saved-addresses',
      title: t('savedAddresses'),
      icon: Star,
      onClick: () => handleItemClick('saved-addresses'),
      visible: true
    },
    {
      id: 'profile',
      title: t('profileSettings'),
      icon: User,
      onClick: () => handleItemClick('profile'),
      visible: true
    },
  ];

  const standardNavigationItems: NavigationItem[] = [
    {
      id: 'overview',
      title: t('dashboardOverview'),
      icon: Home,
      onClick: () => handleItemClick('overview'),
      visible: true
    },
    {
      id: 'unified-address-dashboard',
      title: t('addressManagement'),
      icon: MapPin,
      onClick: () => handleItemClick('unified-address-dashboard'),
      visible: hasAdminAccess // Only show to admins
    },
    {
      id: 'submit-request',
      title: t('submitRequest'),
      icon: FileText,
      onClick: () => handleItemClick('submit-request'),
      visible: isCitizen || isFieldAgent || isPropertyClaimant
    },
    {
      id: 'capture-address',
      title: t('captureAddress'),
      icon: Camera,
      onClick: () => handleItemClick('capture-address'),
      visible: isFieldAgent || canCreateDraftAddress
    },
    {
      id: 'field-drafts',
      title: t('myDrafts'),
      icon: Clock,
      onClick: () => handleItemClick('field-drafts'),
      visible: isFieldAgent // Only field agents need drafts
    },
    {
      id: 'field-map',
      title: t('fieldMap.fieldMap'),
      icon: MapPin,
      onClick: () => handleItemClick('field-map'),
      visible: isFieldAgent
    },
     // Registrar items
    {
      id: 'registrar-dashboard',
      title: t('registrarDashboard'),
      icon: Settings,
      onClick: () => handleItemClick('registrar-dashboard'),
      visible: isRegistrar || hasAdminAccess
    },
     // Admin and management items
    {
      id: 'admin-panel',
      title: t('admin'),
      icon: Settings,
      onClick: () => handleItemClick('admin-panel'),
      visible: hasAdminAccess
    },
    {
      id: 'analytics',
      title: t('analytics'),
      icon: BarChart3,
      onClick: () => handleItemClick('analytics'),
      visible: hasAdminAccess
    },
    {
      id: 'saved-addresses',
      title: t('savedAddresses'),
      icon: Star,
      onClick: () => handleItemClick('saved-addresses'),
      visible: true
    },
    {
      id: 'profile',
      title: t('profileSettings'),
      icon: User,
      onClick: () => handleItemClick('profile'),
      visible: true
    },
    {
      id: 'emergency-contacts',
      title: t('emergencyContacts'),
      icon: Phone,
      onClick: () => handleItemClick('emergency-contacts'),
      visible: true
    },
    // Verification management (verifier-specific, not for pure admins)
    {
      id: 'verification-queue',
      title: t('verificationQueue'),
      icon: CheckCircle,
      onClick: () => handleItemClick('verification-queue'),
      visible: (canVerifyAddresses && !isResidencyVerifier && !isAdmin && !hasNDAAAccess)
    },
    {
      id: 'verification-tools',
      title: t('verificationTools'),
      icon: AlertCircle,
      onClick: () => handleItemClick('verification-tools'),
      visible: (canVerifyAddresses && !isResidencyVerifier && !isAdmin && !hasNDAAAccess)
    },
    {
      id: 'residency-verification-manager',
      title: t('residencyVerificationManager'),
      icon: UserCheck,
      onClick: () => handleItemClick('residency-verification-manager'),
      visible: (isResidencyVerifier || isRegistrar) && !isAdmin && !hasNDAAAccess
    },
    // Admin-only management (operational admins, not pure system admins)
    {
      id: 'address-data',
      title: t('addressData'),
      icon: FileCheck,
      onClick: () => handleItemClick('address-data'),
      visible: hasAdminAccess && !isAdmin && !hasNDAAAccess
    },
    {
      id: 'province-management',
      title: t('provinceManagement'),
      icon: MapPin,
      onClick: () => handleItemClick('province-management'),
      visible: hasAdminAccess && !isAdmin && !hasNDAAAccess
    },
    // Citizen-specific items
    {
      id: 'residency-verification-dashboard',
      title: t('myVerificationRequests'),
      icon: FileDown,
      onClick: () => handleItemClick('residency-verification-dashboard'),
      visible: isCitizen && !isAdmin && !hasNDAAAccess
    },
    {
      id: 'citizen-address-portal',
      title: t('myAddressesCar'),
      icon: User,
      onClick: () => handleItemClick('citizen-address-portal'),
      visible: isCitizen && !isAdmin && !hasNDAAAccess
    }
  ];

  // Use appropriate navigation based on user role
  const navigationItems = 
    (isAdmin || hasNDAAAccess) ? adminNavigationItems : 
    isNARAuthority ? narNavigationItems :
    isCarAdmin ? carNavigationItems : 
    standardNavigationItems;

  const visibleItems = navigationItems.filter(item => item.visible);

  // NAR Authority specific rendering
  if (isNARAuthority) {
    const narMainItems = visibleItems.filter(item => 
      ['nar-authority-dashboard'].includes(item.id)
    );
    
    const narVerificationItems = visibleItems.filter(item => 
      ['verification-queue', 'verification-tools'].includes(item.id)
    );
    
    const narToolsItems = visibleItems.filter(item => 
      ['address-search'].includes(item.id)
    );
    
    const narSettingsItems = visibleItems.filter(item => 
      ['saved-addresses', 'profile'].includes(item.id)
    );

    const renderNARMenuGroup = (items: NavigationItem[], label: string) => {
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
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">{t('narAuthority')}</h2>
                  <p className="text-xs text-muted-foreground">
                    {narAuthorityData?.authority_level === 'national' ? t('nationalLevel') :
                     narAuthorityData?.authority_level === 'regional' ? t('regionalLevel') :
                     narAuthorityData?.authority_level === 'municipal' ? t('municipalLevel') :
                     t('localLevel')}
                  </p>
                </div>
              </div>
              {/* Jurisdiction info */}
              {!collapsed && (
                <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('jurisdiction')}</p>
                  <p className="text-xs flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {t('nationalWide')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* NAR Navigation Groups */}
          {renderNARMenuGroup(narMainItems, t('main'))}
          {renderNARMenuGroup(narVerificationItems, t('verification'))}
          {renderNARMenuGroup(narToolsItems, t('tools'))}
          {renderNARMenuGroup(narSettingsItems, t('settings'))}
        </SidebarContent>
      </Sidebar>
    );
  }

  // Group items by category for CAR users
  if (isCarAdmin) {
    const carMainItems = visibleItems.filter(item => 
      ['overview'].includes(item.id)
    );
    
    const carVerificationItems = visibleItems.filter(item => 
      ['car-verification', 'residency-verification', 'car-addresses'].includes(item.id)
    );
    
    const carAdminItems = visibleItems.filter(item => 
      ['car-admin', 'car-analytics'].includes(item.id)
    );

    const renderCARMenuGroup = (items: NavigationItem[], label: string) => {
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
                    alt={t('biakamLogoAlt')} 
                    className="h-6 w-auto" 
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">{t('carDashboard')}</h2>
                  <p className="text-xs text-muted-foreground">{isCarAdmin ? t('carAdmin') : t('carVerifier')}</p>
                </div>
              </div>
            </div>
          )}

          {/* CAR Navigation Groups */}
          {renderCARMenuGroup(carMainItems, t('main'))}
          {renderCARMenuGroup(carVerificationItems, t('verification'))}
          {renderCARMenuGroup(carAdminItems, t('administration'))}
        </SidebarContent>
      </Sidebar>
    );
  }

  // Standard groups for other users
  const mainItems = visibleItems.filter(item => 
    ['overview', 'unified-address-dashboard', 'registrar-dashboard'].includes(item.id)
  );

  const fieldItems = visibleItems.filter(item => 
    ['submit-request', 'capture-address', 'field-drafts', 'field-map'].includes(item.id)
  );
  
  const adminItems = visibleItems.filter(item => 
    ['analytics', 'admin-panel'].includes(item.id)
  );
  
  const verificationItems = visibleItems.filter(item => 
    ['verification-queue', 'verification-tools', 'residency-verification-manager'].includes(item.id)
  );
  
  const managementItems = visibleItems.filter(item => 
    ['address-data', 'province-management'].includes(item.id)
  );
  
  const settingsItems = visibleItems.filter(item => 
    ['saved-addresses', 'profile', 'residency-verification-dashboard', 'citizen-address-portal', 'emergency-contacts'].includes(item.id)
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
                  alt={t('biakamLogoAlt')} 
                  className="h-6 w-auto" 
                />
              </div>
              <div>
                <h2 className="font-semibold text-sm">{t('coneg')}</h2>
                <p className="text-xs text-muted-foreground">{t('addressSystem')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        {renderMenuGroup(mainItems, t('main'))}
        {renderMenuGroup(fieldItems, t('fieldWork'))}
        {renderMenuGroup(verificationItems, t('verification'))}
        {renderMenuGroup(adminItems, t('administration'))}
        {renderMenuGroup(managementItems, t('management'))}
        {renderMenuGroup(settingsItems, t('settings'))}
      </SidebarContent>
    </Sidebar>
  );
}