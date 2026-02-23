import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Search, Clock, Camera, CheckCircle, MapPin, BarChart3, Settings,
  Shield, User, Phone, FileDown, FileCheck, FileText, Crown, Star, Globe,
  Building, AlertCircle, Package, ChevronDown, Pin, PinOff
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  visible: boolean;
  badge?: number;
}

interface NavigationGroup {
  key: string;
  label: string;
  items: NavigationItem[];
  defaultOpen: boolean;
}

interface DashboardSidebarProps {
  onNavigationClick: (id: string) => void;
  pendingCount?: number;
  activeItemId?: string;
}

// Favorites persistence
const FAVORITES_KEY = 'sidebar_favorites';

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch { return []; }
}

function setFavorites(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function DashboardSidebar({ onNavigationClick, pendingCount = 0, activeItemId = 'overview' }: DashboardSidebarProps) {
  const { t } = useTranslation('dashboard');
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { 
    isCitizen, isFieldAgent, isRegistrar, isCarAdmin,
    canVerifyNAR, canVerifyCAR, hasAdminAccess, isAdmin,
    hasNDAAAccess, canVerifyAddresses, isNARAuthority, narAuthorityData
  } = useUserRole();

  const [favorites, setFavoritesState] = useState<string[]>(getFavorites);

  const handleItemClick = useCallback((id: string) => {
    // If we're not on the dashboard page, navigate there with the section
    if (location.pathname !== '/dashboard') {
      navigate(`/dashboard`, { state: { section: id } });
      return;
    }
    onNavigationClick(id);
    if (isMobile) setOpenMobile(false);
  }, [onNavigationClick, isMobile, setOpenMobile, location.pathname, navigate]);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritesState(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      setFavorites(next);
      return next;
    });
  }, []);

  // All navigation items
  const navigationItems: NavigationItem[] = [
    { id: 'overview', title: t('dashboardOverview'), icon: Home, onClick: () => handleItemClick('overview'), visible: true },
    { id: 'nar-authority-dashboard', title: t('narAuthorityDashboard'), icon: Shield, onClick: () => handleItemClick('nar-authority-dashboard'), visible: isNARAuthority },
    { id: 'verification-queue', title: t('verificationQueue'), icon: CheckCircle, onClick: () => handleItemClick('verification-queue'), visible: (isNARAuthority && narAuthorityData?.can_verify_addresses) || (canVerifyNAR && !isRegistrar && !isAdmin && !hasNDAAAccess), badge: pendingCount },
    { id: 'verification-tools', title: t('verificationTools'), icon: isNARAuthority ? FileCheck : AlertCircle, onClick: () => handleItemClick('verification-tools'), visible: (isNARAuthority && narAuthorityData?.can_verify_addresses) || (canVerifyNAR && !isAdmin && !hasNDAAAccess) },
    { id: 'registrar-dashboard', title: t('registrarDashboard'), icon: Crown, onClick: () => handleItemClick('registrar-dashboard'), visible: isRegistrar },
    { id: 'car-admin', title: t('carAdministration'), icon: Settings, onClick: () => handleItemClick('car-admin'), visible: isCarAdmin },
    { id: 'residency-verification', title: t('residencyVerification'), icon: Shield, onClick: () => handleItemClick('residency-verification'), visible: isCarAdmin || canVerifyCAR || isRegistrar },
    { id: 'capture-address', title: t('captureAddress'), icon: Camera, onClick: () => handleItemClick('capture-address'), visible: isFieldAgent },
    { id: 'field-drafts', title: t('myDrafts'), icon: Clock, onClick: () => handleItemClick('field-drafts'), visible: isFieldAgent },
    { id: 'field-map', title: t('fieldMap.fieldMap'), icon: MapPin, onClick: () => handleItemClick('field-map'), visible: isFieldAgent },
    { id: 'unified-address-request', title: t('registerAddress'), icon: Home, onClick: () => handleItemClick('unified-address-request'), visible: isCitizen || isNARAuthority },
    { id: 'my-address-requests', title: t('myAddressRequests'), icon: FileText, onClick: () => handleItemClick('my-address-requests'), visible: isCitizen },
    { id: 'address-search', title: t('addressSearch'), icon: Search, onClick: () => handleItemClick('address-search'), visible: isCitizen || isNARAuthority },
    { id: 'citizen-address-portal', title: t('myAddressesCar'), icon: User, onClick: () => handleItemClick('citizen-address-portal'), visible: isCitizen },
    { id: 'residency-verification-dashboard', title: t('myVerificationRequests'), icon: FileDown, onClick: () => handleItemClick('residency-verification-dashboard'), visible: isCitizen },
    { id: 'my-businesses', title: t('myBusinesses'), icon: Building, onClick: () => navigate('/my-businesses'), visible: isCitizen },
    { id: 'my-deliveries', title: t('myDeliveries'), icon: Package, onClick: () => handleItemClick('my-deliveries'), visible: isCitizen },
    { id: 'request-pickup', title: t('requestPickup'), icon: Package, onClick: () => handleItemClick('request-pickup'), visible: isCitizen },
    { id: 'delivery-preferences', title: t('deliveryPreferences'), icon: Settings, onClick: () => handleItemClick('delivery-preferences'), visible: isCitizen },
    { id: 'admin-panel', title: t('admin'), icon: Settings, onClick: () => handleItemClick('admin-panel'), visible: isAdmin || hasNDAAAccess },
    { id: 'analytics', title: t('analytics'), icon: BarChart3, onClick: () => handleItemClick('analytics'), visible: hasAdminAccess },
    { id: 'province-management', title: t('provinceManagement'), icon: Globe, onClick: () => handleItemClick('province-management'), visible: hasAdminAccess && !isAdmin && !hasNDAAAccess },
    { id: 'saved-addresses', title: t('savedAddresses'), icon: Star, onClick: () => handleItemClick('saved-addresses'), visible: true },
    { id: 'emergency-contacts', title: t('emergencyContacts'), icon: Phone, onClick: () => handleItemClick('emergency-contacts'), visible: isCitizen },
    { id: 'profile', title: t('profileSettings'), icon: User, onClick: () => handleItemClick('profile'), visible: true },
  ];

  const visibleItems = navigationItems.filter(item => item.visible);
  const itemMap = new Map(visibleItems.map(i => [i.id, i]));

  // Group definitions with role-based default open
  const groupDefs: { key: string; label: string; ids: string[]; defaultOpen: boolean }[] = [
    { key: 'main', label: t('main'), ids: ['overview', 'nar-authority-dashboard', 'registrar-dashboard'], defaultOpen: true },
    { key: 'quickActions', label: t('quickActions', 'Quick Actions'), ids: ['unified-address-request', 'my-address-requests', 'address-search'], defaultOpen: isCitizen || isNARAuthority },
    { key: 'verification', label: t('verification'), ids: ['verification-queue', 'verification-tools', 'residency-verification'], defaultOpen: canVerifyNAR || isNARAuthority || isCarAdmin },
    { key: 'car', label: t('citizenAddressRegistry'), ids: ['car-admin', 'citizen-address-portal', 'residency-verification-dashboard'], defaultOpen: isCarAdmin },
    { key: 'fieldWork', label: t('fieldWork'), ids: ['capture-address', 'field-drafts', 'field-map'], defaultOpen: isFieldAgent },
    { key: 'deliveries', label: t('deliveries', 'Deliveries'), ids: ['my-deliveries', 'request-pickup', 'delivery-preferences'], defaultOpen: false },
    { key: 'admin', label: t('administration'), ids: ['admin-panel', 'analytics', 'province-management'], defaultOpen: isAdmin || hasNDAAAccess },
    { key: 'other', label: t('other', 'Other'), ids: ['saved-addresses', 'my-businesses'], defaultOpen: false },
    { key: 'settings', label: t('settings'), ids: ['emergency-contacts', 'profile'], defaultOpen: false },
  ];

  // Build groups with only visible items
  const groups: NavigationGroup[] = groupDefs
    .map(g => ({
      key: g.key,
      label: g.label,
      items: g.ids.map(id => itemMap.get(id)).filter(Boolean) as NavigationItem[],
      defaultOpen: g.defaultOpen,
    }))
    .filter(g => g.items.length > 0);

  // Favorites group
  const favoriteItems = favorites.map(id => itemMap.get(id)).filter(Boolean) as NavigationItem[];

  const renderMenuItem = (item: NavigationItem, showFavToggle = false) => {
    const isActive = activeItemId === item.id;
    return (
      <SidebarMenuItem key={item.id} className="group/item">
        <SidebarMenuButton
          onClick={item.onClick}
          className={cn(
            "w-full justify-start h-10 rounded-md transition-all duration-200",
            collapsed ? "px-2 justify-center" : "px-3",
            isActive
              ? "bg-primary/10 text-primary font-medium border-l-3 border-primary rounded-l-none"
              : "hover:bg-accent hover:text-accent-foreground text-foreground hover:translate-x-0.5"
          )}
        >
          <item.icon className={cn(
            "shrink-0 transition-colors duration-200",
            collapsed ? "h-5 w-5" : "h-4 w-4 mr-3",
            isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
          )} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm truncate">{item.title}</span>
              {item.badge && item.badge > 0 && (
                <Badge variant="pending" className="ml-2 h-5 min-w-[20px] justify-center animate-scale-in">{item.badge}</Badge>
              )}
              {showFavToggle && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="ml-1 p-1 rounded hover:bg-muted opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      {favorites.includes(item.id) ? (
                        <PinOff className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Pin className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {favorites.includes(item.id) ? t('removeFavorite', 'Unpin') : t('addFavorite', 'Pin to top')}
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className={cn(
      "border-r border-border bg-card shrink-0",
      collapsed ? "w-16 max-w-16" : "w-64 max-w-64"
    )}>
      <SidebarContent className="gap-0 py-2 overflow-x-hidden">
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
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {/* Favorites Section */}
          {favoriteItems.length > 0 && (
            <SidebarGroup>
              {!collapsed && (
                <SidebarGroupLabel className="text-xs font-medium text-primary uppercase tracking-wider px-3 py-2 flex items-center gap-1">
                  <Pin className="h-3 w-3" />
                  {t('favorites', 'Pinned')}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {favoriteItems.map(item => renderMenuItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Collapsible Groups */}
          {groups.map(group => (
            <CollapsibleNavGroup
              key={group.key}
              label={group.label}
              items={group.items}
              defaultOpen={group.defaultOpen}
              collapsed={collapsed}
              renderMenuItem={(item) => renderMenuItem(item, true)}
            />
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

// Collapsible navigation group sub-component
function CollapsibleNavGroup({
  label, items, defaultOpen, collapsed, renderMenuItem
}: {
  label: string;
  items: NavigationItem[];
  defaultOpen: boolean;
  collapsed: boolean;
  renderMenuItem: (item: NavigationItem) => React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (collapsed) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup className="border-b border-border/40 pb-2 last:border-b-0">
        <CollapsibleTrigger className="w-full">
          <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-2.5 flex items-center justify-between cursor-pointer hover:text-foreground transition-colors duration-200 group/label">
            <span>{label}</span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 transition-transform duration-300 text-muted-foreground/60 group-hover/label:text-muted-foreground",
              open && "rotate-180"
            )} />
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {items.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
