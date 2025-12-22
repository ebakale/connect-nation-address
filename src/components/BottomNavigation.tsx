import React from 'react';
import { Home, Search, Plus, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, onNavigate }) => {
  const { t } = useTranslation(['common']);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'add', icon: Plus, label: 'Add', highlight: true },
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'settings', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] touch-manipulation transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                item.highlight && !isActive && "relative"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.highlight && !isActive ? (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md -mt-4">
                  <Icon className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <Icon 
                    className={cn(
                      "h-5 w-5 mb-1 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                  <span 
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
              
              {/* Active indicator */}
              {isActive && !item.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
