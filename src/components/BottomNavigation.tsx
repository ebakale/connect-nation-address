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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border safe-area-inset-bottom shadow-[0_-2px_10px_-3px_hsl(var(--foreground)/0.08)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive && "scale-105"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.highlight && !isActive ? (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg -mt-4 transition-transform duration-200 hover:scale-110 active:scale-95">
                  <Icon className="h-6 w-6" />
                </div>
              ) : (
                <>
                  {/* Active pill background */}
                  {isActive && (
                    <div className="absolute inset-x-2 top-1.5 bottom-1.5 bg-primary/10 rounded-xl animate-scale-in" />
                  )}
                  <Icon 
                    className={cn(
                      "relative h-5 w-5 mb-0.5 transition-all duration-200",
                      isActive ? "text-primary scale-110" : "text-muted-foreground"
                    )} 
                  />
                  <span 
                    className={cn(
                      "relative text-[10px] font-medium transition-all duration-200",
                      isActive ? "text-primary font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
              
              {/* Active dot indicator */}
              {isActive && !item.highlight && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
