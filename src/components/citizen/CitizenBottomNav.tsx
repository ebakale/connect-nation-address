import React from 'react';
import { Home, Search, Briefcase, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type CitizenSection = 'home' | 'search' | 'services' | 'alerts' | 'profile';

interface CitizenBottomNavProps {
  activeSection: CitizenSection;
  onNavigate: (section: CitizenSection) => void;
  isAuthenticated: boolean;
  notificationCount?: number;
}

const CitizenBottomNav: React.FC<CitizenBottomNavProps> = ({
  activeSection,
  onNavigate,
  isAuthenticated,
  notificationCount = 0,
}) => {
  const { t } = useTranslation(['common']);

  const navItems: { id: CitizenSection; icon: typeof Home; label: string; authRequired?: boolean }[] = [
    { id: 'home', icon: Home, label: t('common:navigation.home', 'Home') },
    { id: 'search', icon: Search, label: t('common:navigation.search', 'Search') },
    { id: 'services', icon: Briefcase, label: t('common:navigation.services', 'Services') },
    { id: 'alerts', icon: Bell, label: t('common:navigation.alerts', 'Alerts') },
    { id: 'profile', icon: User, label: t('common:navigation.profile', 'Profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_8px_-2px_hsl(var(--foreground)/0.06)]">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] touch-manipulation transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform duration-150", isActive && "scale-110")} />
                {/* Notification badge */}
                {item.id === 'alerts' && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 leading-tight font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CitizenBottomNav;
