import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface DashboardBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ items, className }) => {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm text-muted-foreground animate-fade-in", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index === 0 && <Home className="h-3.5 w-3.5 shrink-0" />}
            {index > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[200px]">{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="hover:text-foreground transition-colors truncate max-w-[150px] hover:underline underline-offset-2"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
